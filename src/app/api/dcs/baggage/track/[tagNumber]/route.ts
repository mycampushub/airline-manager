import { NextRequest, NextResponse } from 'next/server';
import { baggageEngine } from '@/lib/engines/baggage-engine';

/**
 * GET /api/dcs/baggage/track/[tagNumber]
 * Tracks baggage throughout its journey
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tagNumber: string } }
) {
  try {
    const { tagNumber } = params;

    // Validate parameter
    if (!tagNumber || typeof tagNumber !== 'string') {
      return NextResponse.json(
        { error: 'Invalid tagNumber' },
        { status: 400 }
      );
    }

    // Track baggage
    const tracking = await baggageEngine.trackBaggage(tagNumber);

    return NextResponse.json({
      success: true,
      data: tracking
    }, { status: 200 });

  } catch (error) {
    console.error('Error tracking baggage:', error);

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
