import { NextRequest, NextResponse } from 'next/server';
import { boardingEngine } from '@/lib/engines/boarding-engine';

/**
 * POST /api/dcs/boarding/gate-change
 * Handles gate change notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flightNumber, oldGate, newGate, reason, notificationMethod } = body;

    // Validate required fields
    if (!flightNumber || typeof flightNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing flightNumber' },
        { status: 400 }
      );
    }

    if (!oldGate || typeof oldGate !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing oldGate' },
        { status: 400 }
      );
    }

    if (!newGate || typeof newGate !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing newGate' },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing reason' },
        { status: 400 }
      );
    }

    if (oldGate === newGate) {
      return NextResponse.json(
        { error: 'Old gate and new gate cannot be the same' },
        { status: 400 }
      );
    }

    // Validate notification method if provided
    const validMethods = ['display', 'announcement', 'sms', 'email', 'app'];
    if (notificationMethod && !validMethods.includes(notificationMethod)) {
      return NextResponse.json(
        { error: `Invalid notificationMethod. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // Notify gate change
    const notification = await boardingEngine.notifyGateChange(
      flightNumber,
      oldGate,
      newGate,
      notificationMethod || 'display'
    );

    return NextResponse.json({
      success: true,
      data: {
        ...notification,
        reason
      },
      message: `Gate change notified for flight ${flightNumber}: ${oldGate} → ${newGate}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error handling gate change:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Determine appropriate status code
    let statusCode = 500;
    if (errorMessage.includes('not found')) {
      statusCode = 404;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}
