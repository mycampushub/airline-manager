/**
 * GET /api/revenue/pricing/demand-forecast
 * Forecast demand for a route on a specific date
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
    const daysOutParam = searchParams.get('daysOut');

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

    // Calculate or validate daysOut
    const departureDate = new Date(date);
    const now = new Date();
    const diffTime = departureDate.getTime() - now.getTime();
    let daysOut = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    if (daysOutParam !== null) {
      const parsedDaysOut = parseInt(daysOutParam, 10);
      if (!isNaN(parsedDaysOut) && parsedDaysOut >= 0) {
        daysOut = parsedDaysOut;
      }
    }

    const routeInfo: RouteInfo = {
      origin,
      destination,
      route,
    };

    // Forecast demand
    const result = await pricingEngine.forecastDemand(routeInfo, date, daysOut);

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
    console.error('Error forecasting demand:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to forecast demand',
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
