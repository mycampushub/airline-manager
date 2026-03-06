/**
 * GET /api/revenue/pricing/corporate
 * Get corporate fare with special terms
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
    const corporateAccount = searchParams.get('corporateAccount');

    // Validate required fields
    if (!route || !date || !corporateAccount) {
      return NextResponse.json(
        { error: 'Missing required query parameters: route, date, corporateAccount' },
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

    const routeInfo: RouteInfo = {
      origin,
      destination,
      route,
    };

    // Get corporate fare
    const result = await pricingEngine.getCorporateFare(corporateAccount, routeInfo, date);

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
    console.error('Error getting corporate fare:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get corporate fare',
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
