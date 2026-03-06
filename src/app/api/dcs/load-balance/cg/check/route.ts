import { NextRequest, NextResponse } from 'next/server';
import { loadBalanceEngine } from '@/lib/engines/loadbalance-engine';

/**
 * POST /api/dcs/load-balance/cg/check
 * Checks if CG is within safe envelope
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cgPosition, weightType, aircraftType } = body;

    // Validate required fields
    if (!cgPosition || typeof cgPosition !== 'object') {
      return NextResponse.json(
        { error: 'Invalid or missing cgPosition' },
        { status: 400 }
      );
    }

    if (!cgPosition.macPercentage || typeof cgPosition.macPercentage !== 'number') {
      return NextResponse.json(
        { error: 'cgPosition must include macPercentage' },
        { status: 400 }
      );
    }

    if (!weightType || !['ZFW', 'TOW'].includes(weightType)) {
      return NextResponse.json(
        { error: 'Invalid weightType. Must be "ZFW" or "TOW"' },
        { status: 400 }
      );
    }

    if (!aircraftType || typeof aircraftType !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing aircraftType' },
        { status: 400 }
      );
    }

    // Check CG envelope
    const cgEnvelope = loadBalanceEngine.checkCGEnvelope(
      cgPosition,
      weightType,
      aircraftType
    );

    return NextResponse.json({
      success: true,
      data: cgEnvelope
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking CG envelope:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}
