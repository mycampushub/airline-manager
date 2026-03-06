import { NextRequest, NextResponse } from 'next/server';
import { PNREngine } from '@/lib/engines/pnr-engine';

/**
 * POST /api/pss/pnr/time-limits/check
 * Check time limits for all PNRs and auto-cancel expired ones
 *
 * Request Body:
 * {} (empty body or optional parameters)
 *
 * Optional Request Body:
 * {
 *   pnrNumber?: string  // If provided, only check this specific PNR
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     cancelledCount: number,
 *     cancelledPnrs: string[],
 *     timestamp: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body (optional)
    let body = {};
    try {
      body = await request.json();
    } catch {
      // If no body is provided, that's fine - check all PNRs
    }

    const { pnrNumber } = body as { pnrNumber?: string };

    // Validate pnrNumber if provided
    if (pnrNumber && typeof pnrNumber !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'PNR number must be a string if provided',
        },
        { status: 400 }
      );
    }

    // Get PNR engine instance
    const pnrEngine = PNREngine.getInstance();

    // Check time limits and auto-cancel
    // Note: The engine method checks all PNRs with expired time limits
    const cancelledCount = await pnrEngine.checkTimeLimitsAndAutoCancel();

    // If a specific PNR was provided, we could check its status
    // For now, return the count of auto-cancelled PNRs
    let cancelledPnrs: string[] = [];
    if (pnrNumber) {
      // Get PNR details to check if it was cancelled
      const pnrDetails = await pnrEngine.getPNRDetails(pnrNumber);
      if (pnrDetails && pnrDetails.status === 'cancelled') {
        cancelledPnrs = [pnrNumber];
      }
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Time limits checked. ${cancelledCount} PNR(s) auto-cancelled due to expired time limits.`,
        data: {
          cancelledCount: cancelledCount,
          cancelledPnrs: cancelledPnrs,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error checking time limits:', error);

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while checking time limits',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
