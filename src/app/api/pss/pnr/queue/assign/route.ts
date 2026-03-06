import { NextRequest, NextResponse } from 'next/server';
import { PNREngine } from '@/lib/engines/pnr-engine';

/**
 * POST /api/pss/pnr/queue/assign
 * Assign a queue position to a PNR with priority level
 *
 * Request Body:
 * {
 *   pnrNumber: string,
 *   priority?: number  // 1-10, where 1 is highest priority, default is 5
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     queuePosition: number,
 *     queuePriority: number,
 *     pnrNumber: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { pnrNumber, priority } = body;

    // Validate required fields
    if (!pnrNumber || typeof pnrNumber !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'PNR number is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (priority !== undefined) {
      if (typeof priority !== 'number') {
        return NextResponse.json(
          {
            success: false,
            error: 'Priority must be a number',
          },
          { status: 400 }
        );
      }

      if (priority < 1 || priority > 10) {
        return NextResponse.json(
          {
            success: false,
            error: 'Priority must be between 1 and 10 (1 is highest, 10 is lowest)',
          },
          { status: 400 }
        );
      }
    }

    // Get PNR engine instance
    const pnrEngine = PNREngine.getInstance();

    // Assign queue position
    const result = await pnrEngine.assignQueuePosition(pnrNumber, priority || 5);

    // Check if assignment was successful
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: {
          queuePosition: result.queuePosition,
          queuePriority: result.queuePriority,
          pnrNumber: pnrNumber,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error assigning queue position:', error);

    // Handle specific error types
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'PNR not found',
        },
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while assigning queue position',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
