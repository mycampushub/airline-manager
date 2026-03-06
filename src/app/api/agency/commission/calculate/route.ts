/**
 * POST /api/agency/commission/calculate
 * Calculate commission for a booking with all applicable overrides
 */

import { NextRequest, NextResponse } from 'next/server';
import { CommissionEngine, BookingInfo, AgencyInfo } from '@/lib/engines/commission-engine';
import { db } from '@/lib/db';

const commissionEngine = new CommissionEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.bookingId || !body.agencyId || !body.route || !body.amount) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, agencyId, route, amount' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Parse route
    const [origin, destination] = body.route.split('-');
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Invalid route format. Use: ORIGIN-DESTINATION (e.g., JFK-LAX)' },
        { status: 400 }
      );
    }

    // Get agency information
    const agency = await db.agency.findUnique({
      where: { id: body.agencyId },
    });

    if (!agency) {
      return NextResponse.json(
        { error: `Agency ${body.agencyId} not found` },
        { status: 404 }
      );
    }

    // Create agency info
    const agencyInfo: AgencyInfo = {
      id: agency.id,
      code: agency.code,
      tier: agency.tier,
      type: agency.type,
      baseCommissionRate: agency.commissionRate || 0.05,
    };

    // Create booking info
    const bookingInfo: BookingInfo = {
      id: body.bookingId,
      route: body.route,
      origin,
      destination,
      cabin: body.cabin || 'economy',
      fareClass: body.fareClass || 'Y',
      baseFare: body.amount,
      totalAmount: body.totalAmount || body.amount,
      date: body.date || new Date().toISOString().split('T')[0],
      isCorporate: body.isCorporate || false,
      corporateAccount: body.corporateAccount,
      paymentMethod: body.paymentMethod || 'credit_card',
      currency: body.currency || 'USD',
    };

    // Calculate commission
    const result = await commissionEngine.calculateCommission(bookingInfo, agencyInfo);

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
    console.error('Error calculating commission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate commission',
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
