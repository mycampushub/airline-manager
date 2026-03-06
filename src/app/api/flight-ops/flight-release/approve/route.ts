import { NextRequest, NextResponse } from 'next/server';
import { FlightOpsEngine } from '@/lib/engines/flight-ops-engine';

/**
 * POST /api/flight-ops/flight-release/approve
 * Approve a flight release
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { releaseId, approvedBy, signature } = body;

    // Validate required parameters
    if (!releaseId) {
      return NextResponse.json(
        { error: 'Missing required field: releaseId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!approvedBy) {
      return NextResponse.json(
        { error: 'Missing required field: approvedBy' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing required field: signature' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = FlightOpsEngine.getInstance();

    // Approve flight release
    const result = await engine.approveFlightRelease(
      releaseId,
      approvedBy,
      signature
    );

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error approving flight release:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Flight release not found')) {
        return NextResponse.json(
          { error: 'Flight release not found', details: error.message },
          { status: 404, headers: getCorsHeaders() }
        );
      }

      if (error.message.includes('Cannot approve release')) {
        return NextResponse.json(
          { error: 'Cannot approve release in current status', details: error.message },
          { status: 400, headers: getCorsHeaders() }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to approve flight release', details: error instanceof Error ? error.message : String(error) },
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
