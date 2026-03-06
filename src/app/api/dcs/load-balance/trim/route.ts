import { NextRequest, NextResponse } from 'next/server';
import { loadBalanceEngine } from '@/lib/engines/loadbalance-engine';

/**
 * POST /api/dcs/load-balance/trim
 * Generates trim sheet for the flight
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loadSheetData } = body;

    // Validate required fields
    if (!loadSheetData || typeof loadSheetData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid or missing loadSheetData' },
        { status: 400 }
      );
    }

    // Validate load sheet data structure
    if (!loadSheetData.weights || !loadSheetData.cgPosition || !loadSheetData.aircraftType) {
      return NextResponse.json(
        { error: 'Invalid loadSheetData structure. Must include weights, cgPosition, and aircraftType' },
        { status: 400 }
      );
    }

    // Generate trim sheet
    const trimSheet = await loadBalanceEngine.generateTrimSheet(loadSheetData);

    return NextResponse.json({
      success: true,
      data: trimSheet,
      message: 'Trim sheet generated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating trim sheet:', error);

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
