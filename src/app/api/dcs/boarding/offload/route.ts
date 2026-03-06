import { NextRequest, NextResponse } from 'next/server';
import { boardingEngine } from '@/lib/engines/boarding-engine';

/**
 * POST /api/dcs/boarding/offload
 * Off-loads a passenger from the flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketNumber, reason, flightNumber, date } = body;

    // Validate required fields
    if (!ticketNumber || typeof ticketNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing ticketNumber' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing reason' },
        { status: 400 }
      );
    }

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

    // Offload passenger
    const result = await boardingEngine.offloadPassenger(
      ticketNumber,
      reason,
      flightNumber,
      date
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Passenger ${ticketNumber} off-loaded successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('Error offloading passenger:', error);

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
