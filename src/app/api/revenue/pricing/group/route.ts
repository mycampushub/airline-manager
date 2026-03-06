/**
 * GET /api/revenue/pricing/group
 * Get group pricing with volume discounts
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
    const groupSizeParam = searchParams.get('groupSize');

    // Validate required fields
    if (!route || !date || !groupSizeParam) {
      return NextResponse.json(
        { error: 'Missing required query parameters: route, date, groupSize' },
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

    // Validate and parse group size
    const groupSize = parseInt(groupSizeParam, 10);
    if (isNaN(groupSize) || groupSize < 10) {
      return NextResponse.json(
        { error: 'Group size must be at least 10 passengers' },
        { status: 400 }
      );
    }

    const routeInfo: RouteInfo = {
      origin,
      destination,
      route,
    };

    // Get group pricing
    const result = await pricingEngine.getGroupPricing(groupSize, routeInfo, date);

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
    console.error('Error calculating group pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate group pricing',
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
