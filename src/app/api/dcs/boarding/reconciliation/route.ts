import { NextRequest, NextResponse } from 'next/server';
import { boardingEngine } from '@/lib/engines/boarding-engine';

/**
 * GET /api/dcs/boarding/reconciliation?flightNumber={flightNumber}&date={date}
 * Performs boarding reconciliation check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flightNumber = searchParams.get('flightNumber');
    const date = searchParams.get('date');

    // Validate required parameters
    if (!flightNumber || typeof flightNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing flightNumber parameter' },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing date parameter' },
        { status: 400 }
      );
    }

    // Check boarding reconciliation
    const reconciliation = await boardingEngine.checkBoardingReconciliation(
      flightNumber,
      date
    );

    return NextResponse.json({
      success: true,
      data: reconciliation
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking boarding reconciliation:', error);

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
