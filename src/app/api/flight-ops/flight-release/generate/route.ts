import { NextRequest, NextResponse } from 'next/server';
import { FlightOpsEngine } from '@/lib/engines/flight-ops-engine';

/**
 * POST /api/flight-ops/flight-release/generate
 * Generate flight release for a flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, weatherData, notams } = body;

    // Validate required parameters
    if (!flightId) {
      return NextResponse.json(
        { error: 'Missing required field: flightId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = FlightOpsEngine.getInstance();

    // Generate flight release
    const result = await engine.generateFlightRelease(
      flightId,
      weatherData || {},
      notams || []
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 201, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error generating flight release:', error);

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
      { error: 'Failed to generate flight release', details: error instanceof Error ? error.message : String(error) },
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
