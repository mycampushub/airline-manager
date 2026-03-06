import { NextRequest, NextResponse } from 'next/server';
import { FlightOpsEngine, DisruptionType } from '@/lib/engines/flight-ops-engine';

/**
 * POST /api/flight-ops/disruption/create
 * Create a disruption event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightId, type, reason, code, impact } = body;

    // Validate required parameters
    if (!flightId) {
      return NextResponse.json(
        { error: 'Missing required field: flightId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Missing required field: type' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Missing required field: reason' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Missing required field: code' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate disruption type
    const validTypes = Object.values(DisruptionType);
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid disruption type: ${type}. Valid values: ${validTypes.join(', ')}` },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = FlightOpsEngine.getInstance();

    // Create disruption
    const result = await engine.createDisruption(
      flightId,
      type,
      reason,
      code,
      impact || {}
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 201, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error creating disruption:', error);

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
      { error: 'Failed to create disruption', details: error instanceof Error ? error.message : String(error) },
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
