/**
 * POST /api/revenue/pricing/optimal
 * Calculate optimal price for a route based on demand, competition, and seasonality
 */

import { NextRequest, NextResponse } from 'next/server';
import { PricingEngine, RouteInfo, CompetitorPrice } from '@/lib/engines/pricing-engine';

const pricingEngine = new PricingEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.route || !body.date || !body.passengers) {
      return NextResponse.json(
        { error: 'Missing required fields: route, date, passengers' },
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

    // Validate date
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate passengers
    if (typeof body.passengers !== 'number' || body.passengers < 1 || body.passengers > 999) {
      return NextResponse.json(
        { error: 'Passengers must be a number between 1 and 999' },
        { status: 400 }
      );
    }

    const routeInfo: RouteInfo = {
      origin,
      destination,
      route: body.route,
    };

    const cabin = body.cabin || 'economy';
    const demand = body.demand || 0.5;

    // Get competitor prices (can be provided or fetched)
    let competition: CompetitorPrice[] = [];
    if (body.competition && Array.isArray(body.competition)) {
      competition = body.competition;
    } else {
      competition = await pricingEngine.monitorCompetitorPrices(routeInfo);
    }

    // Calculate optimal price
    const result = await pricingEngine.calculateOptimalPrice(
      routeInfo,
      body.date,
      demand,
      competition,
      cabin
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
    console.error('Error calculating optimal price:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate optimal price',
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
