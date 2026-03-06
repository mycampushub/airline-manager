import { NextRequest, NextResponse } from 'next/server';
import { PNREngine, type PNRStatus } from '@/lib/engines/pnr-engine';

/**
 * PUT /api/pss/pnr/[pnrNumber]/status
 * Update PNR status
 *
 * Route Parameter:
 * pnrNumber - The PNR number to update
 *
 * Request Body:
 * {
 *   status: 'confirmed' | 'waitlist' | 'cancelled' | 'ticketed' | 'void',
 *   remarks?: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     pnr: PNR
 *   }
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { pnrNumber: string } }
) {
  try {
    const { pnrNumber } = params;

    // Validate PNR number
    if (!pnrNumber || typeof pnrNumber !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid PNR number',
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, remarks } = body;

    // Validate status
    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Status is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses: PNRStatus[] = ['confirmed', 'waitlist', 'cancelled', 'ticketed', 'void'];
    if (!validStatuses.includes(status as PNRStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Remarks must be a string if provided',
        },
        { status: 400 }
      );
    }

    // Get PNR engine instance
    const pnrEngine = PNREngine.getInstance();

    // Update PNR status
    const updatedPnr = await pnrEngine.updatePNRStatus(pnrNumber, status as PNRStatus, remarks);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'PNR status updated successfully',
        data: {
          pnr: updatedPnr,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating PNR status:', error);

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
        error: 'An error occurred while updating PNR status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
