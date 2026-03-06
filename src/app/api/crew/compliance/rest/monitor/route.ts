import { NextRequest, NextResponse } from 'next/server';
import { CrewComplianceEngine } from '@/lib/engines/crew-compliance-engine';

/**
 * GET /api/crew/compliance/rest/monitor
 * Monitor rest requirements for a crew member
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const crewId = searchParams.get('crewId');

    // Validate required parameters
    if (!crewId) {
      return NextResponse.json(
        { error: 'Missing required parameter: crewId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = new CrewComplianceEngine();

    // Monitor rest requirements
    const result = await engine.monitorRestRequirements(crewId);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error monitoring rest requirements:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Crew member not found')) {
        return NextResponse.json(
          { error: 'Crew member not found', details: error.message },
          { status: 404, headers: getCorsHeaders() }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to monitor rest requirements', details: error instanceof Error ? error.message : String(error) },
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
