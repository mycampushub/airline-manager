import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityEngine } from '@/lib/engines/availability-engine';

/**
 * PUT /api/pss/availability/inventory/update
 * Update fare class inventory for a route
 *
 * Request Body:
 * {
 *   route: string,
 *   date: string,
 *   fareClass: string,
 *   delta: number  // positive for sales, negative for cancellations
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     route: string,
 *     date: string,
 *     fareClass: string,
 *     updatedSoldCount: number,
 *     previousSoldCount: number,
 *     remainingSeats: number,
 *     timestamp: string
 *   }
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { route, date, fareClass, delta } = body;

    // Validate required fields
    if (!route || typeof route !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Route is required and must be a string',
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

    if (!fareClass || typeof fareClass !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Fare class is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (delta === undefined || typeof delta !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Delta is required and must be a number',
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

    // Get availability engine instance
    const availabilityEngine = AvailabilityEngine.getInstance();

    // Update fare class inventory
    const updateResult = await availabilityEngine.updateFareClassInventory(
      route,
      date,
      fareClass,
      delta
    );

    // Check if update was successful
    if (!updateResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: updateResult.error || 'Failed to update inventory',
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Inventory updated successfully for ${route} on ${date}`,
        data: {
          route: updateResult.route,
          date: updateResult.date,
          fareClass: updateResult.fareClass,
          updatedSoldCount: updateResult.updatedSoldCount,
          previousSoldCount: updateResult.previousSoldCount,
          remainingSeats: updateResult.remainingSeats,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating inventory:', error);

    // Handle specific error types
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Route or fare class not found',
        },
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while updating inventory',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
