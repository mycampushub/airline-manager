import { NextRequest, NextResponse } from 'next/server';
import { loadBalanceEngine } from '@/lib/engines/loadbalance-engine';

/**
 * GET /api/dcs/load-balance/zfw?flightId={flightId}
 * Calculates Zero Fuel Weight (ZFW) for a flight
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flightId = searchParams.get('flightId');

    // Validate required parameters
    if (!flightId || typeof flightId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing flightId parameter' },
        { status: 400 }
      );
    }

    // Calculate ZFW
    const zfw = await loadBalanceEngine.calculateZeroFuelWeight(flightId);

    return NextResponse.json({
      success: true,
      data: {
        flightId,
        zeroFuelWeight: zfw,
        unit: 'kg'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error calculating ZFW:', error);

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
