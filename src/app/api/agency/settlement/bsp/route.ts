/**
 * GET /api/agency/settlement/bsp
 * Generate BSP settlement report
 */

import { NextRequest, NextResponse } from 'next/server';
import { SettlementEngine } from '@/lib/engines/settlement-engine';

const settlementEngine = new SettlementEngine();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const period = searchParams.get('period');
    const bspCode = searchParams.get('bspCode') || 'BSP';

    // Validate required field
    if (!period) {
      return NextResponse.json(
        { error: 'Missing required query parameter: period' },
        { status: 400 }
      );
    }

    // Parse period
    let startDate: Date;
    let endDate: Date;

    if (period.includes('-')) {
      // Format: YYYY-MM or YYYY-Q1
      if (period.includes('Q')) {
        // Quarterly: YYYY-Q1
        const [year, quarter] = period.split('-');
        const quarterNum = parseInt(quarter.replace('Q', ''), 10);
        
        if (!year || !quarterNum || quarterNum < 1 || quarterNum > 4) {
          return NextResponse.json(
            { error: 'Invalid quarterly period format. Use YYYY-Q1, YYYY-Q2, YYYY-Q3, or YYYY-Q4' },
            { status: 400 }
          );
        }

        const yearNum = parseInt(year, 10);
        const startMonth = (quarterNum - 1) * 3;
        startDate = new Date(yearNum, startMonth, 1);
        endDate = new Date(yearNum, startMonth + 3, 0);
      } else {
        // Monthly: YYYY-MM
        const [year, month] = period.split('-');
        const monthNum = parseInt(month, 10);
        
        if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
          return NextResponse.json(
            { error: 'Invalid monthly period format. Use YYYY-MM (e.g., 2024-01)' },
            { status: 400 }
          );
        }

        const yearNum = parseInt(year, 10);
        startDate = new Date(yearNum, monthNum - 1, 1);
        endDate = new Date(yearNum, monthNum, 0);
      }
    } else {
      // Annual: YYYY
      const year = parseInt(period, 10);
      if (isNaN(year) || year < 2000 || year > 2100) {
        return NextResponse.json(
          { error: 'Invalid annual period. Use YYYY (e.g., 2024)' },
          { status: 400 }
        );
      }
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid period format' },
        { status: 400 }
      );
    }

    // Generate BSP report
    const result = await settlementEngine.generateBSPReport(startDate, endDate, bspCode);

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
    console.error('Error generating BSP report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate BSP report',
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
