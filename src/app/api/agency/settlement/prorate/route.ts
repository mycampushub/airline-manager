/**
 * POST /api/agency/settlement/prorate
 * Calculate proration breakdown for a ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { SettlementEngine, ProrationMethod } from '@/lib/engines/settlement-engine';
import { db } from '@/lib/db';

const settlementEngine = new SettlementEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.ticketNumber) {
      return NextResponse.json(
        { error: 'Missing required field: ticketNumber' },
        { status: 400 }
      );
    }

    // Validate ticket number format
    if (typeof body.ticketNumber !== 'string' || body.ticketNumber.length < 3) {
      return NextResponse.json(
        { error: 'Invalid ticket number' },
        { status: 400 }
      );
    }

    // Validate segments if provided
    if (body.segments && !Array.isArray(body.segments)) {
      return NextResponse.json(
        { error: 'Segments must be an array' },
        { status: 400 }
      );
    }

    // Validate proration method if provided
    let prorationMethod: ProrationMethod | undefined;
    if (body.method) {
      const validMethods = ['mileage', 'rate', 'weighted', 'fixed_percentage', 'negotiated'];
      if (!validMethods.includes(body.method)) {
        return NextResponse.json(
          { error: `Invalid method. Must be one of: ${validMethods.join(', ')}` },
          { status: 400 }
        );
      }
      prorationMethod = body.method as ProrationMethod;
    }

    // Check if ticket exists
    const ticket = await db.ticket.findUnique({
      where: { ticketNumber: body.ticketNumber },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: `Ticket ${body.ticketNumber} not found` },
        { status: 404 }
      );
    }

    // Calculate proration
    const result = await settlementEngine.calculateProration(
      body.ticketNumber,
      body.segments,
      prorationMethod
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
    console.error('Error calculating proration:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate proration',
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
