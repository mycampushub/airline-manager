import { NextRequest, NextResponse } from 'next/server';
import { boardingEngine } from '@/lib/engines/boarding-engine';

/**
 * GET /api/dcs/boarding/status/[flightNumber]/[date]
 * Gets current boarding status for a flight
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { flightNumber: string; date: string } }
) {
  try {
    const { flightNumber, date } = params;

    // Validate parameters
    if (!flightNumber || typeof flightNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invalid flightNumber' },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      );
    }

    // Get boarding status
    const status = await boardingEngine.getBoardingStatus(
      flightNumber,
      date
    );

    return NextResponse.json({
      success: true,
      data: status
    }, { status: 200 });

  } catch (error) {
    console.error('Error getting boarding status:', error);

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
