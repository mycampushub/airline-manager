import { NextRequest, NextResponse } from 'next/server';
import { FlightOpsEngine, NotificationMethod } from '@/lib/engines/flight-ops-engine';

/**
 * POST /api/flight-ops/disruption/notify
 * Notify affected passengers about a disruption
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { disruptionId, method, message } = body;

    // Validate required parameters
    if (!disruptionId) {
      return NextResponse.json(
        { error: 'Missing required field: disruptionId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!method) {
      return NextResponse.json(
        { error: 'Missing required field: method' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Missing required field: message' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate notification method
    const validMethods = Object.values(NotificationMethod);
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: `Invalid notification method: ${method}. Valid values: ${validMethods.join(', ')}` },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = FlightOpsEngine.getInstance();

    // Notify passengers
    const result = await engine.notifyPassengers(
      disruptionId,
      method,
      message
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error notifying passengers:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Disruption not found')) {
        return NextResponse.json(
          { error: 'Disruption not found', details: error.message },
          { status: 404, headers: getCorsHeaders() }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to notify passengers', details: error instanceof Error ? error.message : String(error) },
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
