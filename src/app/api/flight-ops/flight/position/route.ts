import { NextRequest, NextResponse } from 'next/server';
import { FlightOpsEngine } from '@/lib/engines/flight-ops-engine';

/**
 * GET /api/flight-ops/flight/position
 * Get current flight position
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flightId = searchParams.get('flightId');

    // Validate required parameters
    if (!flightId) {
      return NextResponse.json(
        { error: 'Missing required parameter: flightId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = FlightOpsEngine.getInstance();

    // Get flight position
    const result = await engine.getFlightPosition(flightId);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error getting flight position:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Flight not found')) {
        return NextResponse.json(
          { error: 'Flight not found', details: error.message },
          { status: 404, headers: getCorsHeaders() }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to get flight position', details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders() });
}

/**
 * Get CORS headers
 */
function getCorsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
