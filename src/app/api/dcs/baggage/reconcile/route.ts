import { NextRequest, NextResponse } from 'next/server';
import { baggageEngine } from '@/lib/engines/baggage-engine';

/**
 * POST /api/dcs/baggage/reconcile
 * Reconciles baggage for a specific flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId } = body;

    // Validate required fields
    if (!flightId || typeof flightId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing flightId' },
        { status: 400 }
      );
    }

    // Reconcile baggage
    const result = await baggageEngine.reconcileBaggage(flightId);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Baggage reconciled for flight ${flightId}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error reconciling baggage:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
