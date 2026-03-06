import { NextRequest, NextResponse } from 'next/server';
import { PNREngine } from '@/lib/engines/pnr-engine';

/**
 * POST /api/pss/pnr/waitlist/process
 * Process waitlist for a flight and promote eligible passengers
 *
 * Request Body:
 * {
 *   flightNumber: string,
 *   date: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     promotedPnrs: string[],
 *     remainingWaitlisted: string[],
 *     promotionDetails: Array<{
 *       pnrNumber: string,
 *       promotedTo: string,
 *       flightNumber: string,
 *       date: string
 *     }>
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { flightNumber, date } = body;

    // Validate required fields
    if (!flightNumber || typeof flightNumber !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Flight number is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Date is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date must be in YYYY-MM-DD format',
        },
        { status: 400 }
      );
    }

    // Get PNR engine instance
    const pnrEngine = PNREngine.getInstance();

    // Process waitlist
    const result = await pnrEngine.processWaitlist(flightNumber, date);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Waitlist processed successfully. ${result.promotedPnrs.length} PNR(s) promoted.`,
        data: {
          promotedPnrs: result.promotedPnrs,
          remainingWaitlisted: result.remainingWaitlisted,
          promotionDetails: result.promotionDetails,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error processing waitlist:', error);

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing waitlist',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
