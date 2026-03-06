/**
 * POST /api/agency/settlement/partner
 * Calculate settlement with a partner for a period
 */

import { NextRequest, NextResponse } from 'next/server';
import { SettlementEngine } from '@/lib/engines/settlement-engine';

const settlementEngine = new SettlementEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.partnerId || !body.period) {
      return NextResponse.json(
        { error: 'Missing required fields: partnerId, period' },
        { status: 400 }
      );
    }

    // Validate partner ID
    if (typeof body.partnerId !== 'string' || body.partnerId.length < 1) {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    // Parse period
    let startDate: Date;
    let endDate: Date;

    if (typeof body.period === 'string') {
      // Parse period string like "2024-01", "2024-Q1", or "2024"
      const yearRegex = /^(\d{4})(?:-(Q[1-4]|\d{2}))?$/;
      const match = body.period.match(yearRegex);

      if (!match) {
        return NextResponse.json(
          { error: 'Invalid period format. Use YYYY, YYYY-Q1, or YYYY-MM' },
          { status: 400 }
        );
      }

      const year = parseInt(match[1], 10);
      const quarterOrMonth = match[2];

      if (quarterOrMonth?.startsWith('Q')) {
        // Quarterly period
        const quarter = parseInt(quarterOrMonth[1], 10);
        const startMonth = (quarter - 1) * 3;
        startDate = new Date(year, startMonth, 1);
        endDate = new Date(year, startMonth + 3, 0);
      } else if (quarterOrMonth) {
        // Monthly period
        const month = parseInt(quarterOrMonth, 10) - 1;
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
      } else {
        // Annual period
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
      }
    } else if (body.period.startDate && body.period.endDate) {
      // Use provided date range
      startDate = new Date(body.period.startDate);
      endDate = new Date(body.period.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format in period object' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Period must be a string (YYYY, YYYY-Q1, YYYY-MM) or object with startDate and endDate' },
        { status: 400 }
      );
    }

    // Validate date range
    if (startDate > endDate) {
      return NextResponse.json(
        { error: 'Start date must be before or equal to end date' },
        { status: 400 }
      );
    }

    // Calculate settlement with partner
    const result = await settlementEngine.settleWithPartner(
      body.partnerId,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: result,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error calculating partner settlement:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate partner settlement',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
