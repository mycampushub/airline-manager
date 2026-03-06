/**
 * POST /api/revenue/tax/calculate
 * Calculate tax breakdown for a booking
 */

import { NextRequest, NextResponse } from 'next/server';
import { TaxEngine, TaxRouteInfo, PassengerInfo } from '@/lib/engines/tax-engine';

const taxEngine = new TaxEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.fare || !body.route) {
      return NextResponse.json(
        { error: 'Missing required fields: fare, route' },
        { status: 400 }
      );
    }

    // Validate fare
    if (typeof body.fare !== 'number' || body.fare < 0) {
      return NextResponse.json(
        { error: 'Fare must be a positive number' },
        { status: 400 }
      );
    }

    // Parse route
    const [origin, destination] = body.route.split('-');
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Invalid route format. Use: ORIGIN-DESTINATION (e.g., JFK-LAX)' },
        { status: 400 }
      );
    }

    // Get passengers count
    const passengers = body.passengers || 1;
    if (typeof passengers !== 'number' || passengers < 1 || passengers > 999) {
      return NextResponse.json(
        { error: 'Passengers must be a number between 1 and 999' },
        { status: 400 }
      );
    }

    const cabin = body.cabin || 'economy';
    const currency = body.currency || 'USD';

    // Create passenger info
    const passengerInfo: PassengerInfo[] = [
      {
        type: 'adult',
        count: passengers,
        hasTaxExemption: false,
      },
    ];

    // Create route info
    const routeInfo: TaxRouteInfo = {
      origin,
      destination,
      originCountry: body.originCountry || 'US',
      destinationCountry: body.destinationCountry || (origin === destination ? 'US' : 'US'),
      isInternational: origin !== destination,
      isDomestic: origin === destination,
      isOneWay: body.tripType === 'one_way',
      isRoundTrip: body.tripType === 'round_trip',
    };

    // Calculate tax breakdown
    const result = await taxEngine.calculateTaxBreakdown(
      body.fare,
      routeInfo,
      cabin,
      passengerInfo,
      currency
    );

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error calculating taxes:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate taxes',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
