import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityEngine } from '@/lib/engines/availability-engine';

/**
 * POST /api/pss/availability/check
 * Check real-time availability for a specific route
 *
 * Request Body:
 * {
 *   route: string,
 *   date: string,
 *   cabin?: string,
 *   fareClass?: string,
 *   passengers?: number  // default: 1
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     available: boolean,
 *     availableSeats: number,
 *     waitlistedSeats: number,
 *     blockedSeats: number,
 *     totalCapacity: number,
 *     fareClasses: FareClassAvailability[],
 *     currency: string,
 *     message?: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { route, date, cabin, fareClass, passengers } = body;

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

    // Validate optional fields
    if (cabin && typeof cabin !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cabin must be a string if provided',
        },
        { status: 400 }
      );
    }

    if (fareClass && typeof fareClass !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Fare class must be a string if provided',
        },
        { status: 400 }
      );
    }

    if (passengers !== undefined) {
      if (typeof passengers !== 'number' || passengers < 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Passengers must be a positive number if provided',
          },
          { status: 400 }
        );
      }
    }

    // Get availability engine instance
    const availabilityEngine = AvailabilityEngine.getInstance();

    // Check real-time availability
    const availability = await availabilityEngine.checkRealTimeAvailability(
      route,
      date,
      fareClass,
      passengers || 1
    );

    // Filter fare classes by cabin if specified
    let filteredFareClasses = availability.fareClasses;
    if (cabin) {
      filteredFareClasses = availability.fareClasses.filter(fc => fc.cabin === cabin);
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: availability.available
          ? 'Availability checked successfully'
          : 'No availability found for the requested criteria',
        data: {
          available: availability.available,
          availableSeats: availability.availableSeats,
          waitlistedSeats: availability.waitlistedSeats,
          blockedSeats: availability.blockedSeats,
          totalCapacity: availability.totalCapacity,
          fareClasses: filteredFareClasses,
          currency: availability.currency,
          message: availability.message,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error checking availability:', error);

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while checking availability',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
