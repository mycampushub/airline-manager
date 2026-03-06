/**
 * POST /api/revenue/tax/refund
 * Process tax refunds for a ticket
 */

import { NextRequest, NextResponse } from 'next/server';
import { TaxEngine } from '@/lib/engines/tax-engine';
import { db } from '@/lib/db';

const taxEngine = new TaxEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.ticketNumber || !body.reason) {
      return NextResponse.json(
        { error: 'Missing required fields: ticketNumber, reason' },
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

    // Validate reason
    const validReasons = ['involuntary', 'voluntary_cancel', 'no_show', 'airline_fault', 'schedule_change'];
    if (!validReasons.includes(body.reason)) {
      return NextResponse.json(
        { error: `Invalid reason. Must be one of: ${validReasons.join(', ')}` },
        { status: 400 }
      );
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

    // Process refund taxes
    const result = await taxEngine.processRefundTaxes(body.ticketNumber, body.reason);

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
    console.error('Error processing tax refund:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process tax refund',
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
