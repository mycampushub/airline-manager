/**
 * GET /api/revenue/pricing/bid-price
 * Calculate minimum acceptable price (bid price) for inventory control
 */

import { NextRequest, NextResponse } from 'next/server';
import { PricingEngine, RouteInfo } from '@/lib/engines/pricing-engine';

const pricingEngine = new PricingEngine();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const route = searchParams.get('route');
    const date = searchParams.get('date');
    const cabin = searchParams.get('cabin') || 'economy';

    // Validate required fields
    if (!route || !date) {
      return NextResponse.json(
        { error: 'Missing required query parameters: route, date' },
        { status: 400 }
      );
    }

    // Parse route
    const [origin, destination] = route.split('-');
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Invalid route format. Use: ORIGIN-DESTINATION (e.g., JFK-LAX)' },
        { status: 400 }
      );
    }

    // Validate date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate cabin
    const validCabins = ['economy', 'business', 'first', 'premium_economy'];
    if (!validCabins.includes(cabin)) {
      return NextResponse.json(
        { error: `Invalid cabin. Must be one of: ${validCabins.join(', ')}` },
        { status: 400 }
      );
    }

    const routeInfo: RouteInfo = {
      origin,
      destination,
      route,
    };

    // Calculate bid price
    const result = await pricingEngine.calculateBidPrice(routeInfo, date, cabin);

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error calculating bid price:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate bid price',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
