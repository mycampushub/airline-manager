import { NextRequest, NextResponse } from 'next/server';
import { CrewComplianceEngine, TimePeriod } from '@/lib/engines/crew-compliance-engine';

/**
 * GET /api/crew/compliance/report/generate
 * Generate comprehensive compliance report for a crew member
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const crewId = searchParams.get('crewId');
    const period = searchParams.get('period') as TimePeriod | null;

    // Validate required parameters
    if (!crewId) {
      return NextResponse.json(
        { error: 'Missing required parameter: crewId' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    if (!period) {
      return NextResponse.json(
        { error: 'Missing required parameter: period' },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Validate period
    const validPeriods = Object.values(TimePeriod);
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period: ${period}. Valid values: ${validPeriods.join(', ')}` },
        { status: 400, headers: getCorsHeaders() }
      );
    }

    // Initialize engine
    const engine = new CrewComplianceEngine();

    // Generate compliance report
    const result = await engine.generateComplianceReport(crewId, period);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: getCorsHeaders() }
    );

  } catch (error) {
    console.error('Error generating compliance report:', error);

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
      { error: 'Failed to generate compliance report', details: error instanceof Error ? error.message : String(error) },
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
