import { NextRequest, NextResponse } from 'next/server';
import { loadBalanceEngine } from '@/lib/engines/loadbalance-engine';

/**
 * POST /api/dcs/load-balance/approve
 * Approves a load sheet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loadSheetId, approvedBy } = body;

    // Validate required fields
    if (!loadSheetId || typeof loadSheetId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing loadSheetId' },
        { status: 400 }
      );
    }

    if (!approvedBy || typeof approvedBy !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing approvedBy' },
        { status: 400 }
      );
    }

    // Approve load sheet
    const approvedSheet = await loadBalanceEngine.approveLoadSheet(
      loadSheetId,
      approvedBy
    );

    return NextResponse.json({
      success: true,
      data: approvedSheet,
      message: `Load sheet ${loadSheetId} approved successfully`
    }, { status: 200 });

  } catch (error) {
    console.error('Error approving load sheet:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('not found')) {
      statusCode = 404;
    } else if (errorMessage.includes('already been approved') || errorMessage.includes('Cannot approve')) {
      statusCode = 400;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}
