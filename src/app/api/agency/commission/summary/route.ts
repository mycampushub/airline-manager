/**
 * GET /api/agency/commission/summary
 * Get comprehensive commission summary for an agency
 */

import { NextRequest, NextResponse } from 'next/server';
import { CommissionEngine } from '@/lib/engines/commission-engine';
import { db } from '@/lib/db';

const commissionEngine = new CommissionEngine();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const agencyId = searchParams.get('agencyId');
    const period = searchParams.get('period') || 'monthly';

    // Validate required fields
    if (!agencyId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: agencyId' },
        { status: 400 }
      );
    }

    // Validate period
    const validPeriods = ['monthly', 'quarterly', 'annual'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return NextResponse.json(
        { error: `Agency ${agencyId} not found` },
        { status: 404 }
      );
    }

    // Get commission summary
    const result = await commissionEngine.getAgencyCommissionSummary(
      agencyId,
      period as any
    );

    return NextResponse.json({
      success: true,
      data: {
        agencyId,
        agencyName: agency.name,
        agencyCode: agency.code,
        period,
        ...result,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error getting agency commission summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get agency commission summary',
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
