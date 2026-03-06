import { NextRequest, NextResponse } from 'next/server';
import { PNREngine } from '@/lib/engines/pnr-engine';

/**
 * POST /api/pss/pnr/split
 * Split a PNR into multiple PNRs based on passenger groups
 *
 * Request Body:
 * {
 *   pnrNumber: string,
 *   passengerIds: string[][],
 *   splitRemarks?: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   originalPnr: PNR,
 *   newPnrs: PNR[],
 *   splitPassengers: Record<string, string[]>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { pnrNumber, passengerIds, splitRemarks } = body;

    // Validate required fields
    if (!pnrNumber || typeof pnrNumber !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'PNR number is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!passengerIds || !Array.isArray(passengerIds) || passengerIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Passenger IDs array is required and must contain at least one group',
        },
        { status: 400 }
      );
    }

    // Validate that each group is an array of strings
    for (let i = 0; i < passengerIds.length; i++) {
      const group = passengerIds[i];
      if (!Array.isArray(group) || group.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Passenger group ${i} must be a non-empty array`,
          },
          { status: 400 }
        );
      }
      for (let j = 0; j < group.length; j++) {
        if (typeof group[j] !== 'string') {
          return NextResponse.json(
            {
              success: false,
              error: `Passenger ID at group ${i}, index ${j} must be a string`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Get PNR engine instance
    const pnrEngine = PNREngine.getInstance();

    // Perform PNR split
    const result = await pnrEngine.splitPNR(pnrNumber, passengerIds);

    // Add split remarks if provided
    if (splitRemarks && typeof splitRemarks === 'string' && result.success) {
      // Note: Remarks could be added to the PNR's remarks field if needed
      result.message += ` Remarks: ${splitRemarks}`;
    }

    // Return success response
    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: {
          originalPnr: result.originalPnr,
          newPnrs: result.newPnrs,
          splitPassengers: result.splitPassengers,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error splitting PNR:', error);

    // Handle specific error types
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'PNR not found',
        },
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while splitting the PNR',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
