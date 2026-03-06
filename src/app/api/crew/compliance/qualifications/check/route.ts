import { NextRequest, NextResponse } from 'next/server';
import { CrewComplianceEngine, CrewPosition } from '@/lib/engines/crew-compliance-engine';

/**
 * GET /api/crew/compliance/qualifications/check
 * Check qualifications for a crew member for a specific position
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const crewId = searchParams.get('crewId');
    const position = searchParams.get('position') as CrewPosition | null;

    // Validate required parameters
    if (!crewId) {
      return NextResponse.json(
        { error: 'Missing required parameter: crewId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!position) {
      return NextResponse.json(
        { error: 'Missing required parameter: position' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate position
    const validPositions = Object.values(CrewPosition);
    if (!validPositions.includes(position)) {
      return NextResponse.json(
        { error: `Invalid position: ${position}. Valid values: ${validPositions.join(', ')}` },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = new CrewComplianceEngine();

    // Check qualifications
    const result = await engine.checkQualifications(crewId, position);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error checking qualifications:', error);

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
      { error: 'Failed to check qualifications', details: error instanceof Error ? error.message : String(error) },
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
