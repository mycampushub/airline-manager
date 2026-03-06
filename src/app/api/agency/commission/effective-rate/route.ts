/**
 * GET /api/agency/commission/effective-rate
 * Get effective commission rate considering all factors
 */

import { NextRequest, NextResponse } from 'next/server';
import { CommissionEngine, AgencyInfo } from '@/lib/engines/commission-engine';
import { db } from '@/lib/db';

const commissionEngine = new CommissionEngine();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const agencyId = searchParams.get('agencyId');
    const route = searchParams.get('route');
    const cabin = searchParams.get('cabin') || 'economy';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Validate required fields
    if (!agencyId || !route) {
      return NextResponse.json(
        { error: 'Missing required query parameters: agencyId, route' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get agency information
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return NextResponse.json(
        { error: `Agency ${agencyId} not found` },
        { status: 404 }
      );
    }

    // Create agency info
    const agencyInfo: AgencyInfo = {
      id: agency.id,
      code: agency.code,
      tier: agency.tier,
      type: agency.type,
      baseCommissionRate: agency.commissionRate || 0.05,
    };

    // Get effective commission rate
    const effectiveRate = await commissionEngine.getEffectiveCommissionRate(
      agencyInfo,
      route,
      cabin,
      date
    );

    return NextResponse.json({
      success: true,
      data: {
        agencyId,
        route,
        cabin,
        date,
        effectiveRate,
        effectiveRatePercent: Math.round(effectiveRate * 10000) / 100, // Convert to percentage
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error getting effective commission rate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get effective commission rate',
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
