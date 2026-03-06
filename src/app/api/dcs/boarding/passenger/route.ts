import { NextRequest, NextResponse } from 'next/server';
import { boardingEngine } from '@/lib/engines/boarding-engine';

/**
 * POST /api/dcs/boarding/passenger
 * Boards a passenger with sequence tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketNumber, seatNumber, sequence, flightNumber, date } = body;

    // Validate required fields
    if (!ticketNumber || typeof ticketNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing ticketNumber' },
        { status: 400 }
      );
    }

    if (!seatNumber || typeof seatNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing seatNumber' },
        { status: 400 }
      );
    }

    if (sequence === undefined || sequence === null || typeof sequence !== 'number') {
      return NextResponse.json(
        { error: 'Invalid or missing sequence' },
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

    // Board passenger
    const result = await boardingEngine.boardPassenger(
      ticketNumber,
      seatNumber,
      sequence,
      flightNumber,
      date
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Passenger ${ticketNumber} boarded successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('Error boarding passenger:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('not found')) {
      statusCode = 404;
    } else if (errorMessage.includes('already boarded') || errorMessage.includes('off-loaded') || errorMessage.includes('boarding status')) {
      statusCode = 400;
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
