/**
 * GET /api/agency/commission/volume-bonus
 * Calculate volume bonus for an agency
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

    // Calculate volume bonus
    const result = await commissionEngine.calculateVolumeBonus(agencyInfo, period as any);

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error calculating volume bonus:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate volume bonus',
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
