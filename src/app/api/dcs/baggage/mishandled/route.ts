import { NextRequest, NextResponse } from 'next/server';
import { baggageEngine } from '@/lib/engines/baggage-engine';

/**
 * POST /api/dcs/baggage/mishandled
 * Handles mishandled baggage (lost, delayed, damaged, or pilfered)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { baggageId, type, location, reportedBy, description } = body;

    // Validate required fields
    if (!baggageId || typeof baggageId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing baggageId' },
        { status: 400 }
      );
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing type' },
        { status: 400 }
      );
    }

    const validTypes = ['lost', 'delayed', 'damaged', 'pilfered'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing location' },
        { status: 400 }
      );
    }

    if (!reportedBy || typeof reportedBy !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing reportedBy' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing description' },
        { status: 400 }
      );
    }

    // Handle mishandled baggage
    const mishandled = await baggageEngine.handleMishandledBaggage(
      baggageId,
      type,
      location,
      reportedBy,
      description
    );

    return NextResponse.json({
      success: true,
      data: mishandled,
      message: `Mishandled baggage report created: ${mishandled.claimNumber}`
    }, { status: 200 });

  } catch (error) {
    console.error('Error handling mishandled baggage:', error);

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
