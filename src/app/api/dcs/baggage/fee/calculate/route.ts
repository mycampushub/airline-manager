import { NextRequest, NextResponse } from 'next/server';
import { baggageEngine } from '@/lib/engines/baggage-engine';

/**
 * POST /api/dcs/baggage/fee/calculate
 * Calculates baggage fees based on route, cabin class, and baggage details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pnrId, route, cabin, bags, weight, specialBaggage } = body;

    // Validate required fields
    if (!pnrId || typeof pnrId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing pnrId' },
        { status: 400 }
      );
    }

    if (!route || typeof route !== 'object') {
      return NextResponse.json(
        { error: 'Invalid or missing route' },
        { status: 400 }
      );
    }

    // Validate route structure
    if (!route.origin || !route.destination || !route.isInternational === undefined) {
      return NextResponse.json(
        { error: 'Invalid route structure. Must include origin, destination, and isInternational' },
        { status: 400 }
      );
    }

    if (!cabin || typeof cabin !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing cabin' },
        { status: 400 }
      );
    }

    if (bags === undefined || bags === null || typeof bags !== 'number' || bags < 0) {
      return NextResponse.json(
        { error: 'Invalid or missing bags' },
        { status: 400 }
      );
    }

    if (weight === undefined || weight === null || typeof weight !== 'number' || weight < 0) {
      return NextResponse.json(
        { error: 'Invalid or missing weight' },
        { status: 400 }
      );
    }

    // Calculate baggage fee
    const feeResult = await baggageEngine.calculateBaggageFee(
      pnrId,
      route,
      cabin,
      bags,
      weight,
      specialBaggage
    );

    return NextResponse.json({
      success: true,
      data: feeResult
    }, { status: 200 });

  } catch (error) {
    console.error('Error calculating baggage fee:', error);

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
