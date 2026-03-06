import { NextRequest, NextResponse } from 'next/server';
import { boardingEngine } from '@/lib/engines/boarding-engine';

/**
 * POST /api/dcs/boarding/start
 * Starts the boarding process for a flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightNumber, date, gate, scheduledDeparture, userId } = body;

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

    if (!gate || typeof gate !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing gate' },
        { status: 400 }
      );
    }

    if (!scheduledDeparture) {
      return NextResponse.json(
        { error: 'Invalid or missing scheduledDeparture' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing userId' },
        { status: 400 }
      );
    }

    // Parse scheduled departure if it's a string
    const departureTime = typeof scheduledDeparture === 'string'
      ? new Date(scheduledDeparture)
      : scheduledDeparture;

    if (isNaN(departureTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid scheduledDeparture format' },
        { status: 400 }
      );
    }

    // Start boarding process
    const result = await boardingEngine.startBoarding(
      flightNumber,
      date,
      gate,
      departureTime,
      userId
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Boarding started for flight ${flightNumber}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error starting boarding:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('not found')) {
      statusCode = 404;
    } else if (errorMessage.includes('already been initialized')) {
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
