import { NextRequest, NextResponse } from 'next/server';
import { FlightOpsEngine } from '@/lib/engines/flight-ops-engine';

/**
 * POST /api/flight-ops/flight/eta/update
 * Update flight ETA
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, newETA, reason } = body;

    // Validate required parameters
    if (!flightId) {
      return NextResponse.json(
        { error: 'Missing required field: flightId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!newETA) {
      return NextResponse.json(
        { error: 'Missing required field: newETA' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Missing required field: reason' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate newETA is a valid date
    const parsedETA = new Date(newETA);
    if (isNaN(parsedETA.getTime())) {
      return NextResponse.json(
        { error: 'Invalid newETA format. Must be a valid ISO date string' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = FlightOpsEngine.getInstance();

    // Update ETA
    const result = await engine.updateETA(
      flightId,
      parsedETA,
      reason
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error updating ETA:', error);

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
      { error: 'Failed to update ETA', details: error instanceof Error ? error.message : String(error) },
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
