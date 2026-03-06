/**
 * POST /api/agency/commission/agent/track
 * Track commission on a per-agent basis
 */

import { NextRequest, NextResponse } from 'next/server';
import { CommissionEngine, BookingInfo, AgencyInfo } from '@/lib/engines/commission-engine';
import { db } from '@/lib/db';

const commissionEngine = new CommissionEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.agentId || !body.booking) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, booking' },
        { status: 400 }
      );
    }

    const booking = body.booking;

    // Validate booking object
    if (!booking.route || !booking.baseFare) {
      return NextResponse.json(
        { error: 'Booking object must contain route and baseFare' },
        { status: 400 }
      );
    }

    // Parse route
    const [origin, destination] = booking.route.split('-');
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Invalid route format. Use: ORIGIN-DESTINATION (e.g., JFK-LAX)' },
        { status: 400 }
      );
    }

    // Get agent information
    const agent = await db.securityUser.findUnique({
      where: { id: body.agentId },
    });

    if (!agent) {
      return NextResponse.json(
        { error: `Agent ${body.agentId} not found` },
        { status: 404 }
      );
    }

    // Get agency from booking or agent
    let agencyId = booking.agencyId || agent.agencyId;
    if (!agencyId) {
      return NextResponse.json(
        { error: 'Could not determine agency for this booking' },
        { status: 400 }
      );
    }

    // Get agency information
    const agency = await db.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      return NextResponse.json(
        { error: `Agency ${agencyId} not found` },
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
      id: booking.id || 'TRACK-' + Date.now(),
      route: booking.route,
      origin,
      destination,
      cabin: booking.cabin || 'economy',
      fareClass: booking.fareClass || 'Y',
      baseFare: booking.baseFare,
      totalAmount: booking.totalAmount || booking.baseFare,
      date: booking.date || new Date().toISOString().split('T')[0],
      isCorporate: booking.isCorporate || false,
      corporateAccount: booking.corporateAccount,
      paymentMethod: booking.paymentMethod || 'credit_card',
      currency: booking.currency || 'USD',
    };

    // Track commission per agent
    const result = await commissionEngine.trackCommissionPerAgent(
      body.agentId,
      bookingInfo,
      agencyInfo
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
    console.error('Error tracking agent commission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track agent commission',
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
