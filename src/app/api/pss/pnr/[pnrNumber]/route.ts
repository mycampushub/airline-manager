import { NextRequest, NextResponse } from 'next/server';
import { PNREngine } from '@/lib/engines/pnr-engine';

/**
 * GET /api/pss/pnr/[pnrNumber]
 * Get complete PNR details including passengers and segments
 *
 * Route Parameter:
 * pnrNumber - The PNR number to retrieve
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     pnr: PNR,
 *     passengers: Passenger[],
 *     segments: FlightSegment[]
 *   }
 * }
 */
export async function GET(
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

    // Get PNR engine instance
    const pnrEngine = PNREngine.getInstance();

    // Get PNR details
    const pnrDetails = await pnrEngine.getPNRDetails(pnrNumber);

    // Check if PNR exists
    if (!pnrDetails) {
      return NextResponse.json(
        {
          success: false,
          error: 'PNR not found',
        },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'PNR details retrieved successfully',
        data: {
          pnr: {
            pnrNumber: pnrDetails.pnrNumber,
            status: pnrDetails.status,
            createdAt: pnrDetails.createdAt,
            updatedAt: pnrDetails.updatedAt,
            timeLimit: pnrDetails.timeLimit,
            contactInfo: pnrDetails.contactInfo,
            remarks: pnrDetails.remarks,
          },
          passengers: pnrDetails.passengers,
          segments: pnrDetails.segments,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error retrieving PNR details:', error);

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while retrieving PNR details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
