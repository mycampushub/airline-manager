import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityEngine } from '@/lib/engines/availability-engine';

/**
 * POST /api/pss/availability/od
 * Calculate Origin-Destination availability including connecting flights
 *
 * Request Body:
 * {
 *   origin: string,
 *   destination: string,
 *   date: string,
 *   passengers?: number  // default: 1
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     origin: string,
 *     destination: string,
 *     date: string,
 *     available: boolean,
 *     routes: RouteOption[],
 *     bestPrice?: number,
 *     currency?: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { origin, destination, date, passengers } = body;

    // Validate required fields
    if (!origin || typeof origin !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Origin is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!destination || typeof destination !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Destination is required and must be a string',
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

    // Validate airport codes (3-character IATA codes)
    const airportCodeRegex = /^[A-Z]{3}$/;
    if (!airportCodeRegex.test(origin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Origin must be a valid 3-character IATA airport code (e.g., JFK, LAX)',
        },
        { status: 400 }
      );
    }

    if (!airportCodeRegex.test(destination)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Destination must be a valid 3-character IATA airport code (e.g., JFK, LAX)',
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

    // Validate passengers if provided
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

    // Calculate O&D availability
    const odAvailability = await availabilityEngine.calculateODAvailability(
      origin,
      destination,
      date,
      2 // maxStops - allowing up to 2 stops for connecting flights
    );

    // Check if any routes are available
    if (!odAvailability.available || odAvailability.routes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No available routes found for the requested origin-destination and date',
          data: odAvailability,
        },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: `Found ${odAvailability.routes.length} available route(s) from ${origin} to ${destination}`,
        data: odAvailability,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error calculating O&D availability:', error);

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while calculating O&D availability',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Configure CORS headers
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
