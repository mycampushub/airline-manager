import { NextRequest, NextResponse } from 'next/server';
import { PNREngine } from '@/lib/engines/pnr-engine';

/**
 * POST /api/pss/pnr/merge
 * Merge multiple PNRs into a single PNR
 *
 * Request Body:
 * {
 *   pnrNumbers: string[],
 *   mergeRemarks?: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   mergedPnr: PNR,
 *   originalPnrs: PNR[],
 *   mergedPassengers: Passenger[],
 *   mergedSegments: FlightSegment[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { pnrNumbers, mergeRemarks } = body;

    // Validate required fields
    if (!pnrNumbers || !Array.isArray(pnrNumbers) || pnrNumbers.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least two PNR numbers are required for merging',
        },
        { status: 400 }
      );
    }

    // Validate that all PNR numbers are strings
    for (let i = 0; i < pnrNumbers.length; i++) {
      if (typeof pnrNumbers[i] !== 'string') {
        return NextResponse.json(
          {
            success: false,
            error: `PNR number at index ${i} must be a string`,
          },
          { status: 400 }
        );
      }
    }

    // Get PNR engine instance
    const pnrEngine = PNREngine.getInstance();

    // Perform PNR merge
    const result = await pnrEngine.mergePNRs(pnrNumbers);

    // Add merge remarks if provided
    if (mergeRemarks && typeof mergeRemarks === 'string' && result.success) {
      // Note: Remarks could be added to the PNR's remarks field if needed
      result.message += ` Remarks: ${mergeRemarks}`;
    }

    // Return success response
    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: {
          mergedPnr: result.mergedPnr,
          originalPnrs: result.originalPnrs,
          mergedPassengers: result.mergedPassengers,
          mergedSegments: result.mergedSegments,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error merging PNRs:', error);

    // Handle specific error types
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'One or more PNRs not found',
        },
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while merging the PNRs',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
