import { NextRequest, NextResponse } from 'next/server';
import { boardingEngine } from '@/lib/engines/boarding-engine';

/**
 * POST /api/dcs/boarding/standby/process
 * Processes the standby list for a flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightNumber, date } = body;

    // Validate required fields
    if (!flightNumber || typeof flightNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing flightNumber' },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing date' },
        { status: 400 }
      );
    }

    // Process standby list
    const boardedStandby = await boardingEngine.processStandbyList(
      flightNumber,
      date
    );

    return NextResponse.json({
      success: true,
      data: {
        boardedPassengers: boardedStandby,
        totalBoarded: boardedStandby.length
      },
      message: `Processed ${boardedStandby.length} standby passengers`
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing standby list:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('not found')) {
      statusCode = 404;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}
