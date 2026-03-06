import { NextRequest, NextResponse } from 'next/server';
import { PNREngine, type PNRChanges } from '@/lib/engines/pnr-engine';

/**
 * POST /api/pss/pnr/requote
 * Re-quote fare for a PNR with potential changes
 *
 * Request Body:
 * {
 *   pnrNumber: string,
 *   segmentChanges?: {
 *     modifiedSegments?: Array<{
 *       segmentId: string,
 *       newFlightNumber?: string,
 *       newDate?: string,
 *       newClass?: string
 *     }>,
 *     removedSegments?: string[],
 *     addedSegments?: Array<{
 *       flightNumber: string,
 *       airlineCode: string,
 *       origin: string,
 *       destination: string,
 *       departureDate: string,
 *       departureTime: string,
 *       arrivalDate: string,
 *       arrivalTime: string,
 *       aircraftType: string,
 *       fareClass: string,
 *       fareBasis: string,
 *       cabinClass: string,
 *       segmentSequence: number
 *     }>
 *   }
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     baseFare: number,
 *     taxes: number,
 *     fees: number,
 *     totalFare: number,
 *     currency: string,
 *     fareBreakdown: FareBreakdownItem[]
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { pnrNumber, segmentChanges } = body;

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

    // Validate segment changes structure if provided
    if (segmentChanges) {
      if (typeof segmentChanges !== 'object' || segmentChanges === null) {
        return NextResponse.json(
          {
            success: false,
            error: 'Segment changes must be an object',
          },
          { status: 400 }
        );
      }

      // Validate modified segments
      if (segmentChanges.modifiedSegments) {
        if (!Array.isArray(segmentChanges.modifiedSegments)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Modified segments must be an array',
            },
            { status: 400 }
          );
        }
      }

      // Validate removed segments
      if (segmentChanges.removedSegments) {
        if (!Array.isArray(segmentChanges.removedSegments)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Removed segments must be an array',
            },
            { status: 400 }
          );
        }
      }

      // Validate added segments
      if (segmentChanges.addedSegments) {
        if (!Array.isArray(segmentChanges.addedSegments)) {
          return NextResponse.json(
            {
              success: false,
              error: 'Added segments must be an array',
            },
            { status: 400 }
          );
        }

        // Validate each added segment has required fields
        const requiredFields = [
          'flightNumber',
          'airlineCode',
          'origin',
          'destination',
          'departureDate',
          'departureTime',
          'arrivalDate',
          'arrivalTime',
          'aircraftType',
          'fareClass',
          'fareBasis',
          'cabinClass',
          'segmentSequence',
        ];

        for (let i = 0; i < segmentChanges.addedSegments.length; i++) {
          const segment = segmentChanges.addedSegments[i];
          for (const field of requiredFields) {
            if (!(field in segment)) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Added segment at index ${i} is missing required field: ${field}`,
                },
                { status: 400 }
              );
            }
          }
        }
      }
    }

    // Prepare PNR changes object
    const pnrChanges: PNRChanges = {
      modifiedSegments: segmentChanges?.modifiedSegments,
      removedSegments: segmentChanges?.removedSegments,
      addedSegments: segmentChanges?.addedSegments,
    };

    // Get PNR engine instance
    const pnrEngine = PNREngine.getInstance();

    // Perform fare re-quote
    const fareCalculation = await pnrEngine.requoteFare(pnrNumber, pnrChanges);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Fare re-quote calculated successfully',
        data: fareCalculation,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error re-quoting fare:', error);

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
        error: 'An error occurred while re-quoting the fare',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
