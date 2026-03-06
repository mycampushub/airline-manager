import { NextRequest, NextResponse } from 'next/server';
import { loadBalanceEngine } from '@/lib/engines/loadbalance-engine';

/**
 * POST /api/dcs/load-balance/sheet/generate
 * Generates complete load sheet for a flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightNumber, date, userId } = body;

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

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing userId' },
        { status: 400 }
      );
    }

    // Generate load sheet
    const loadSheet = await loadBalanceEngine.generateLoadSheet(
      flightNumber,
      date,
      userId
    );

    return NextResponse.json({
      success: true,
      data: loadSheet,
      message: `Load sheet generated for flight ${flightNumber}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating load sheet:', error);

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
