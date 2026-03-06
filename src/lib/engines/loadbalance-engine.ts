/**
 * Load & Balance Engine
 * 
 * This engine handles all weight and balance calculations for flight operations.
 * It computes takeoff weight, zero fuel weight, landing weight, center of gravity,
 * trim settings, and generates load sheets for flight dispatch.
 * 
 * @module LoadBalanceEngine
 */

import { db } from '@/lib/db';

// ============================================
// Type Definitions
// ============================================

/**
 * Weight distribution by station
 */
export interface WeightDistribution {
  station: string;
  weight: number; // kg
  moment: number; // kg-inch or kg-cm
  arm: number; // distance from datum
}

/**
 * Fuel configuration
 */
export interface FuelConfiguration {
  taxiFuel: number; // kg
  tripFuel: number; // kg
  reserveFuel: number; // kg
  alternateFuel: number; // kg
  contingencyFuel: number; // kg
  totalFuel: number; // kg
}

/**
 * Passenger load by cabin
 */
export interface PassengerLoad {
  cabin: 'first' | 'business' | 'economy';
  passengerCount: number;
  totalWeight: number; // kg
  averageWeight: number; // kg
  distribution: WeightDistribution[];
}

/**
 * Cargo and baggage configuration
 */
export interface CargoLoad {
  forwardCargo: number; // kg
  aftCargo: number; // kg;
  bulkCargo: number; // kg
  totalCargo: number; // kg
  distribution: WeightDistribution[];
}

/**
 * Center of Gravity position
 */
export interface CGPosition {
  macPercentage: number; // % MAC (Mean Aerodynamic Chord)
  mac: number; // inches or cm
  cgArm: number; // distance from datum
  forwardLimit: number; // % MAC
  aftLimit: number; // % MAC
  withinEnvelope: boolean;
}

/**
 * CG envelope limits
 */
export interface CGEnvelope {
  macStart: number; // % MAC at ZFW
  macEnd: number; // % MAC at TOW
  forwardLimitZFW: number;
  aftLimitZFW: number;
  forwardLimitTOW: number;
  aftLimitTOW: number;
  isValid: boolean;
  warnings: string[];
}

/**
 * Aircraft weight limits
 */
export interface AircraftWeightLimits {
  maxTakeoffWeight: number; // kg (MTOW)
  maxLandingWeight: number; // kg (MLW)
  maxZeroFuelWeight: number; // kg (MZFW)
  operatingEmptyWeight: number; // kg (OEW)
  basicEmptyWeight: number; // kg (BEW)
}

/**
 * Calculated weights
 */
export interface CalculatedWeights {
  operatingEmptyWeight: number; // OEW
  dryOperatingWeight: number; // DOW = OEW + crew + catering
  zeroFuelWeight: number; // ZFW = DOW + payload
  takeoffWeight: number; // TOW = ZFW + fuel
  landingWeight: number; // LAW = TOW - trip fuel
}

/**
 * Load sheet data
 */
export interface LoadSheetData {
  flightNumber: string;
  date: string;
  aircraftRegistration: string;
  aircraftType: string;
  crewWeight: number;
  passengerLoad: PassengerLoad[];
  cargoLoad: CargoLoad;
  fuelConfig: FuelConfiguration;
  weights: CalculatedWeights;
  cgPosition: CGPosition;
  cgEnvelope: CGEnvelope;
  trimSetting: number;
  distribution: WeightDistribution[];
  generatedBy: string;
  generatedAt: Date;
}

/**
 * Trim sheet configuration
 */
export interface TrimSheet {
  flightId: string;
  aircraftType: string;
  weights: CalculatedWeights;
  cgPosition: CGPosition;
  trimSetting: number;
  mac: number;
  stabTrim: number;
  isWithinLimits: boolean;
  warnings: string[];
}

/**
 * Load optimization result
 */
export interface LoadOptimization {
  optimizedDistribution: WeightDistribution[];
  originalCG: CGPosition;
  optimizedCG: CGPosition;
  recommendedMoves: Array<{
    from: string;
    to: string;
    weight: number;
    reason: string;
  }>;
  improvementScore: number;
}

// ============================================
// Constants
// ============================================

/**
 * Standard passenger weights (IATA recommended)
 */
const PASSENGER_WEIGHTS = {
  adultMale: 88, // kg
  adultFemale: 70, // kg
  child: 35, // kg
  infant: 10, // kg
  average: 77 // kg (standard)
};

/**
 * Standard crew weights
 */
const CREW_WEIGHTS = {
  flightCrew: 90, // kg per person (including uniform)
  cabinCrew: 75, // kg per person (including uniform)
  catering: 5, // kg per passenger
};

/**
 * Aircraft weight limits by type (example values)
 */
const AIRCRAFT_WEIGHT_LIMITS: Record<string, AircraftWeightLimits> = {
  'B737-800': {
    maxTakeoffWeight: 79015,
    maxLandingWeight: 66360,
    maxZeroFuelWeight: 61688,
    operatingEmptyWeight: 41413,
    basicEmptyWeight: 41200
  },
  'A320-200': {
    maxTakeoffWeight: 77000,
    maxLandingWeight: 64500,
    maxZeroFuelWeight: 60500,
    operatingEmptyWeight: 42200,
    basicEmptyWeight: 41900
  },
  'B777-300ER': {
    maxTakeoffWeight: 351534,
    maxLandingWeight: 251290,
    maxZeroFuelWeight: 237680,
    operatingEmptyWeight: 167830,
    basicEmptyWeight: 166000
  },
  'A350-900': {
    maxTakeoffWeight: 283000,
    maxLandingWeight: 206000,
    maxZeroFuelWeight: 195700,
    operatingEmptyWeight: 142400,
    basicEmptyWeight: 140000
  }
};

/**
 * CG envelope limits by aircraft type (% MAC)
 */
const CG_ENVELOPE_LIMITS: Record<string, { zfw: { forward: number; aft: number }; tow: { forward: number; aft: number } }> = {
  'B737-800': {
    zfw: { forward: 13, aft: 35 },
    tow: { forward: 10, aft: 35 }
  },
  'A320-200': {
    zfw: { forward: 15, aft: 35 },
    tow: { forward: 12, aft: 35 }
  },
  'B777-300ER': {
    zfw: { forward: 16, aft: 33 },
    tow: { forward: 13, aft: 33 }
  },
  'A350-900': {
    zfw: { forward: 17, aft: 34 },
    tow: { forward: 14, aft: 34 }
  }
};

/**
 * Standard fuel density (kg/liter)
 */
const FUEL_DENSITY = 0.8;

/**
 * Gravity constant for weight calculations
 */
const GRAVITY = 9.81; // m/s²

// ============================================
// Load & Balance Engine Class
// ============================================

/**
 * Main Load & Balance Engine class that handles all weight and balance operations
 */
export class LoadBalanceEngine {
  /**
   * Calculate Takeoff Weight (TOW) for a flight
   * 
   * TOW = ZFW + Total Fuel
   * 
   * @param flightId - The flight instance ID
   * @returns Calculated takeoff weight
   * @throws Error if flight not found or calculation fails
   */
  async calculateTakeoffWeight(flightId: string): Promise<number> {
    try {
      const zfw = await this.calculateZeroFuelWeight(flightId);
      const fuelConfig = await this.calculateFuelRequirements(flightId);

      const tow = zfw + fuelConfig.totalFuel;

      // Validate against MTOW
      const flight = await db.flightInstance.findUnique({
        where: { id: flightId }
      });

      if (!flight) {
        throw new Error('Flight not found');
      }

      const limits = AIRCRAFT_WEIGHT_LIMITS[flight.aircraftType] || AIRCRAFT_WEIGHT_LIMITS['B737-800'];

      if (tow > limits.maxTakeoffWeight) {
        console.warn(`TOW ${tow}kg exceeds MTOW ${limits.maxTakeoffWeight}kg`);
      }

      return tow;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to calculate TOW: ${error.message}`);
      }
      throw new Error('Failed to calculate TOW: Unknown error');
    }
  }

  /**
   * Calculate Zero Fuel Weight (ZFW) for a flight
   * 
   * ZFW = DOW + Payload
   * DOW = OEW + Crew + Catering
   * Payload = Passengers + Cargo + Baggage
   * 
   * @param flightId - The flight instance ID
   * @returns Calculated zero fuel weight
   */
  async calculateZeroFuelWeight(flightId: string): Promise<number> {
    try {
      const flight = await db.flightInstance.findUnique({
        where: { id: flightId }
      });

      if (!flight) {
        throw new Error('Flight not found');
      }

      const limits = AIRCRAFT_WEIGHT_LIMITS[flight.aircraftType] || AIRCRAFT_WEIGHT_LIMITS['B737-800'];
      
      // Calculate DOW (Dry Operating Weight)
      const crewWeight = await this.calculateCrewWeight(flightId);
      const cateringWeight = flight.passengers * CREW_WEIGHTS.catering;
      const dow = limits.operatingEmptyWeight + crewWeight + cateringWeight;

      // Calculate payload
      const passengerWeight = await this.calculatePassengerWeight(flightId);
      const cargoWeight = flight.cargo || 0;
      const baggageWeight = await this.calculateBaggageWeight(flightId);
      
      const payload = passengerWeight + cargoWeight + baggageWeight;
      const zfw = dow + payload;

      // Validate against MZFW
      if (zfw > limits.maxZeroFuelWeight) {
        console.warn(`ZFW ${zfw}kg exceeds MZFW ${limits.maxZeroFuelWeight}kg`);
      }

      return zfw;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to calculate ZFW: ${error.message}`);
      }
      throw new Error('Failed to calculate ZFW: Unknown error');
    }
  }

  /**
   * Calculate Landing Weight (LAW) for a flight
   * 
   * LAW = TOW - Trip Fuel
   * 
   * @param flightId - The flight instance ID
   * @returns Calculated landing weight
   */
  async calculateLandingWeight(flightId: string): Promise<number> {
    try {
      const tow = await this.calculateTakeoffWeight(flightId);
      const fuelConfig = await this.calculateFuelRequirements(flightId);

      const law = tow - fuelConfig.tripFuel;

      // Validate against MLW
      const flight = await db.flightInstance.findUnique({
        where: { id: flightId }
      });

      if (!flight) {
        throw new Error('Flight not found');
      }

      const limits = AIRCRAFT_WEIGHT_LIMITS[flight.aircraftType] || AIRCRAFT_WEIGHT_LIMITS['B737-800'];

      if (law > limits.maxLandingWeight) {
        console.warn(`LAW ${law}kg exceeds MLW ${limits.maxLandingWeight}kg`);
      }

      return law;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to calculate LAW: ${error.message}`);
      }
      throw new Error('Failed to calculate LAW: Unknown error');
    }
  }

  /**
   * Generate trim sheet for the flight
   * 
   * @param loadData - Complete load sheet data
   * @returns Generated trim sheet
   */
  async generateTrimSheet(loadData: LoadSheetData): Promise<TrimSheet> {
    try {
      const cgPosition = loadData.cgPosition;
      const weights = loadData.weights;

      // Calculate trim setting based on CG and weight
      const trimSetting = this.calculateTrimSetting(
        cgPosition.macPercentage,
        weights.takeoffWeight,
        loadData.aircraftType
      );

      // Get aircraft MAC length
      const mac = this.getAircraftMAC(loadData.aircraftType);

      // Calculate stabilizer trim
      const stabTrim = this.calculateStabilizerTrim(cgPosition.macPercentage, weights.takeoffWeight);

      // Check if within limits
      const warnings: string[] = [];
      let isWithinLimits = true;

      if (!cgPosition.withinEnvelope) {
        warnings.push(`CG ${cgPosition.macPercentage.toFixed(1)}% MAC is outside envelope`);
        isWithinLimits = false;
      }

      if (weights.takeoffWeight > AIRCRAFT_WEIGHT_LIMITS[loadData.aircraftType]?.maxTakeoffWeight) {
        warnings.push('Takeoff weight exceeds maximum');
        isWithinLimits = false;
      }

      return {
        flightId: `${loadData.flightNumber}-${loadData.date}`,
        aircraftType: loadData.aircraftType,
        weights,
        cgPosition,
        trimSetting,
        mac,
        stabTrim,
        isWithinLimits,
        warnings
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate trim sheet: ${error.message}`);
      }
      throw new Error('Failed to generate trim sheet: Unknown error');
    }
  }

  /**
   * Calculate Center of Gravity position
   * 
   * @param weightDistribution - Array of weight distribution by station
   * @param macLength - Mean Aerodynamic Chord length
   * @param macLeadingEdge - Distance from datum to MAC leading edge
   * @returns CG position with envelope check
   */
  calculateCGPosition(
    weightDistribution: WeightDistribution[],
    macLength: number,
    macLeadingEdge: number
  ): CGPosition {
    // Calculate total weight and total moment
    let totalWeight = 0;
    let totalMoment = 0;

    for (const station of weightDistribution) {
      totalWeight += station.weight;
      totalMoment += station.moment;
    }

    if (totalWeight === 0) {
      throw new Error('Total weight cannot be zero');
    }

    // Calculate CG arm (distance from datum)
    const cgArm = totalMoment / totalWeight;

    // Calculate CG position as % MAC
    const cgFromMACLeadingEdge = cgArm - macLeadingEdge;
    const macPercentage = (cgFromMACLeadingEdge / macLength) * 100;

    // Determine envelope limits (will be set by caller based on aircraft type)
    const forwardLimit = 15; // Default, should be overridden
    const aftLimit = 35; // Default, should be overridden

    const withinEnvelope = macPercentage >= forwardLimit && macPercentage <= aftLimit;

    return {
      macPercentage,
      mac: macLength,
      cgArm,
      forwardLimit,
      aftLimit,
      withinEnvelope
    };
  }

  /**
   * Check if CG is within safe envelope
   * 
   * @param cgPosition - The CG position to check
   * @param weightType - 'ZFW' or 'TOW'
   * @param aircraftType - The aircraft type
   * @returns CG envelope check result
   */
  checkCGEnvelope(
    cgPosition: CGPosition,
    weightType: 'ZFW' | 'TOW',
    aircraftType: string
  ): CGEnvelope {
    const limits = CG_ENVELOPE_LIMITS[aircraftType] || CG_ENVELOPE_LIMITS['B737-800'];
    const envelopeLimits = weightType === 'ZFW' ? limits.zfw : limits.tow;

    const warnings: string[] = [];
    let isValid = true;

    if (cgPosition.macPercentage < envelopeLimits.forward) {
      warnings.push(`CG ${cgPosition.macPercentage.toFixed(1)}% MAC is aft of forward limit ${envelopeLimits.forward}% MAC`);
      isValid = false;
    }

    if (cgPosition.macPercentage > envelopeLimits.aft) {
      warnings.push(`CG ${cgPosition.macPercentage.toFixed(1)}% MAC is forward of aft limit ${envelopeLimits.aft}% MAC`);
      isValid = false;
    }

    return {
      macStart: cgPosition.macPercentage,
      macEnd: cgPosition.macPercentage, // Static check
      forwardLimitZFW: limits.zfw.forward,
      aftLimitZFW: limits.zfw.aft,
      forwardLimitTOW: limits.tow.forward,
      aftLimitTOW: limits.tow.aft,
      isValid,
      warnings
    };
  }

  /**
   * Optimize load distribution for better CG position
   * 
   * @param pax - Passenger load data
   * @param cargo - Cargo load data
   * @param fuel - Fuel configuration
   * @param currentCG - Current CG position
   * @param aircraftType - Aircraft type
   * @returns Optimization recommendations
   */
  async optimizeLoadDistribution(
    pax: PassengerLoad[],
    cargo: CargoLoad,
    fuel: FuelConfiguration,
    currentCG: CGPosition,
    aircraftType: string
  ): Promise<LoadOptimization> {
    try {
      const limits = CG_ENVELOPE_LIMITS[aircraftType] || CG_ENVELOPE_LIMITS['B737-800'];
      const targetCG = (limits.tow.forward + limits.tow.aft) / 2; // Target center of envelope

      const optimizedDistribution: WeightDistribution[] = [];
      const recommendedMoves: Array<{ from: string; to: string; weight: number; reason: string }> = [];

      // Analyze current CG position
      const cgDeviation = currentCG.macPercentage - targetCG;

      if (Math.abs(cgDeviation) < 1) {
        // Already well-positioned
        return {
          optimizedDistribution: [],
          originalCG: currentCG,
          optimizedCG: currentCG,
          recommendedMoves: [],
          improvementScore: 0
        };
      }

      // Generate recommendations
      if (cgDeviation < 0) {
        // CG too far forward - move weight aft
        if (cargo.forwardCargo > 100) {
          recommendedMoves.push({
            from: 'FWD Cargo',
            to: 'AFT Cargo',
            weight: Math.min(cargo.forwardCargo, 200),
            reason: 'CG too far forward - move cargo aft'
          });
        }

        // Recommend moving economy passengers to rear seats if possible
        const economyPax = pax.find(p => p.cabin === 'economy');
        if (economyPax && economyPax.passengerCount > 20) {
          recommendedMoves.push({
            from: 'Forward Economy',
            to: 'Aft Economy',
            weight: 10 * PASSENGER_WEIGHTS.average,
            reason: 'CG too far forward - relocate passengers aft'
          });
        }
      } else {
        // CG too far aft - move weight forward
        if (cargo.aftCargo > 100) {
          recommendedMoves.push({
            from: 'AFT Cargo',
            to: 'FWD Cargo',
            weight: Math.min(cargo.aftCargo, 200),
            reason: 'CG too far aft - move cargo forward'
          });
        }
      }

      // Calculate improvement score (0-100)
      const improvementScore = Math.min(100, Math.abs(cgDeviation) * 2);

      return {
        optimizedDistribution,
        originalCG: currentCG,
        optimizedCG: {
          ...currentCG,
          macPercentage: currentCG.macPercentage + (cgDeviation * 0.3) // Simulated improvement
        },
        recommendedMoves,
        improvementScore
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to optimize load distribution: ${error.message}`);
      }
      throw new Error('Failed to optimize load distribution: Unknown error');
    }
  }

  /**
   * Calculate fuel requirements for a flight
   * 
   * @param flightId - The flight instance ID
   * @returns Complete fuel configuration
   */
  async calculateFuelRequirements(flightId: string): Promise<FuelConfiguration> {
    try {
      const flight = await db.flightInstance.findUnique({
        where: { id: flightId }
      });

      if (!flight) {
        throw new Error('Flight not found');
      }

      // Calculate trip fuel based on distance and aircraft type
      const tripFuel = this.calculateTripFuel(flight.distance, flight.aircraftType);

      // Calculate reserve fuel (5% of trip fuel or minimum 30 minutes)
      const contingencyFuel = Math.max(tripFuel * 0.05, 1000);

      // Alternate fuel (assuming 30 min to alternate)
      const alternateFuel = this.calculateAlternateFuel(flight.aircraftType);

      // Final reserve fuel (30 minutes holding)
      const reserveFuel = this.calculateReserveFuel(flight.aircraftType);

      // Taxi fuel (estimated based on airport size)
      const taxiFuel = this.calculateTaxiFuel(flight.aircraftType);

      const totalFuel = tripFuel + contingencyFuel + alternateFuel + reserveFuel + taxiFuel;

      return {
        taxiFuel,
        tripFuel,
        reserveFuel,
        alternateFuel,
        contingencyFuel,
        totalFuel
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to calculate fuel requirements: ${error.message}`);
      }
      throw new Error('Failed to calculate fuel requirements: Unknown error');
    }
  }

  /**
   * Approve a load sheet
   * 
   * @param loadSheetId - The load sheet ID
   * @param approverId - The ID of the approving officer
   * @returns Updated load sheet
   */
  async approveLoadSheet(loadSheetId: string, approverId: string) {
    try {
      const loadSheet = await db.loadSheet.findUnique({
        where: { id: loadSheetId }
      });

      if (!loadSheet) {
        throw new Error('Load sheet not found');
      }

      if (loadSheet.approvedBy) {
        throw new Error('Load sheet has already been approved');
      }

      // Validate load sheet before approval
      const validation = await this.validateLoadSheet(loadSheet);
      if (!validation.isValid) {
        throw new Error(`Cannot approve load sheet: ${validation.errors.join(', ')}`);
      }

      const approvedSheet = await db.loadSheet.update({
        where: { id: loadSheetId },
        data: {
          approvedBy: approverId,
          approvedAt: new Date()
        }
      });

      return approvedSheet;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to approve load sheet: ${error.message}`);
      }
      throw new Error('Failed to approve load sheet: Unknown error');
    }
  }

  /**
   * Get load sheet status for a flight
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns Load sheet with status
   */
  async getLoadSheetStatus(flightNumber: string, date: string) {
    try {
      const loadSheet = await db.loadSheet.findUnique({
        where: { flightNumber_date: { flightNumber, date } }
      });

      if (!loadSheet) {
        return {
          exists: false,
          status: 'not_generated',
          message: 'Load sheet has not been generated for this flight'
        };
      }

      return {
        exists: true,
        status: loadSheet.approvedAt ? 'approved' : 'pending_approval',
        loadSheet: {
          id: loadSheet.id,
          flightNumber: loadSheet.flightNumber,
          date: loadSheet.date,
          takeoffWeight: loadSheet.takeoffWeight,
          zeroFuelWeight: loadSheet.zeroFuelWeight,
          landingWeight: loadSheet.landingWeight,
          centerOfGravity: loadSheet.centerOfGravity,
          trimSetting: loadSheet.trimSetting,
          approvedBy: loadSheet.approvedBy,
          approvedAt: loadSheet.approvedAt,
          generatedAt: loadSheet.generatedAt
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get load sheet status: ${error.message}`);
      }
      throw new Error('Failed to get load sheet status: Unknown error');
    }
  }

  /**
   * Generate complete load sheet for a flight
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @param userId - The user generating the load sheet
   * @returns Generated load sheet data
   */
  async generateLoadSheet(
    flightNumber: string,
    date: string,
    userId: string
  ): Promise<LoadSheetData> {
    try {
      const flight = await db.flightInstance.findUnique({
        where: { flightNumber_date: { flightNumber, date } }
      });

      if (!flight) {
        throw new Error('Flight not found');
      }

      // Get passenger load
      const passengerLoad = await this.getPassengerLoadForFlight(flight.id);

      // Get cargo and baggage
      const cargoLoad = await this.getCargoLoadForFlight(flight.id);

      // Calculate fuel requirements
      const fuelConfig = await this.calculateFuelRequirements(flight.id);

      // Calculate crew weight
      const crewWeight = await this.calculateCrewWeight(flight.id);

      // Calculate all weights
      const limits = AIRCRAFT_WEIGHT_LIMITS[flight.aircraftType] || AIRCRAFT_WEIGHT_LIMITS['B737-800'];
      const cateringWeight = flight.passengers * CREW_WEIGHTS.catering;
      const dow = limits.operatingEmptyWeight + crewWeight + cateringWeight;

      const passengerWeight = passengerLoad.reduce((sum, p) => sum + p.totalWeight, 0);
      const payload = passengerWeight + cargoLoad.totalCargo;
      const zfw = dow + payload;
      const tow = zfw + fuelConfig.totalFuel;
      const law = tow - fuelConfig.tripFuel;

      const weights: CalculatedWeights = {
        operatingEmptyWeight: limits.operatingEmptyWeight,
        dryOperatingWeight: dow,
        zeroFuelWeight: zfw,
        takeoffWeight: tow,
        landingWeight: law
      };

      // Calculate weight distribution
      const distribution = await this.calculateWeightDistribution(
        flight.aircraftType,
        passengerLoad,
        cargoLoad,
        fuelConfig,
        crewWeight
      );

      // Calculate CG position
      const macData = this.getAircraftMACData(flight.aircraftType);
      const cgPosition = this.calculateCGPosition(
        distribution,
        macData.length,
        macData.leadingEdge
      );

      // Check CG envelope
      const cgEnvelope = this.checkCGEnvelope(cgPosition, 'TOW', flight.aircraftType);

      // Calculate trim setting
      const trimSetting = this.calculateTrimSetting(
        cgPosition.macPercentage,
        tow,
        flight.aircraftType
      );

      const loadData: LoadSheetData = {
        flightNumber,
        date,
        aircraftRegistration: flight.aircraftRegistration,
        aircraftType: flight.aircraftType,
        crewWeight,
        passengerLoad,
        cargoLoad,
        fuelConfig,
        weights,
        cgPosition,
        cgEnvelope,
        trimSetting,
        distribution,
        generatedBy: userId,
        generatedAt: new Date()
      };

      // Save to database
      await this.saveLoadSheet(loadData);

      return loadData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate load sheet: ${error.message}`);
      }
      throw new Error('Failed to generate load sheet: Unknown error');
    }
  }

  /**
   * Apply manual override to load sheet
   * 
   * @param loadSheetId - The load sheet ID
   * @param overrides - Override parameters
   * @param reason - Reason for override
   * @param userId - User applying override
   * @returns Updated load sheet
   */
  async applyManualOverride(
    loadSheetId: string,
    overrides: {
      trimSetting?: number;
      zeroFuelWeight?: number;
      takeoffWeight?: number;
    },
    reason: string,
    userId: string
  ) {
    try {
      const loadSheet = await db.loadSheet.findUnique({
        where: { id: loadSheetId }
      });

      if (!loadSheet) {
        throw new Error('Load sheet not found');
      }

      // Apply overrides
      const updateData: any = {};
      if (overrides.trimSetting !== undefined) updateData.trimSetting = overrides.trimSetting;
      if (overrides.zeroFuelWeight !== undefined) updateData.zeroFuelWeight = overrides.zeroFuelWeight;
      if (overrides.takeoffWeight !== undefined) updateData.takeoffWeight = overrides.takeoffWeight;

      const updatedSheet = await db.loadSheet.update({
        where: { id: loadSheetId },
        data: updateData
      });

      // Log override (would use audit log in production)
      console.log(`Manual override applied to load sheet ${loadSheetId} by ${userId}: ${reason}`);

      return updatedSheet;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to apply manual override: ${error.message}`);
      }
      throw new Error('Failed to apply manual override: Unknown error');
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Calculate crew weight for a flight
   * @private
   */
  private async calculateCrewWeight(flightId: string): Promise<number> {
    const flight = await db.flightInstance.findUnique({
      where: { id: flightId }
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    // Parse crew information
    const cabinCrew = JSON.parse(flight.cabinCrew || '[]');
    const flightCrewCount = (flight.captain ? 1 : 0) + (flight.firstOfficer ? 1 : 0);
    const cabinCrewCount = cabinCrew.length;

    return (flightCrewCount * CREW_WEIGHTS.flightCrew) + 
           (cabinCrewCount * CREW_WEIGHTS.cabinCrew);
  }

  /**
   * Calculate passenger weight for a flight
   * @private
   */
  private async calculatePassengerWeight(flightId: string): Promise<number> {
    const flight = await db.flightInstance.findUnique({
      where: { id: flightId }
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    return flight.passengers * PASSENGER_WEIGHTS.average;
  }

  /**
   * Calculate baggage weight for a flight
   * @private
   */
  private async calculateBaggageWeight(flightId: string): Promise<number> {
    const flight = await db.flightInstance.findUnique({
      where: { id: flightId }
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    // Get baggage from CheckInRecord
    const baggageRecords = await db.checkInRecord.aggregate({
      where: {
        flightNumber: flight.flightNumber,
        date: flight.date
      },
      _sum: {
        baggageWeight: true,
        bagsChecked: true
      }
    });

    return baggageRecords._sum.baggageWeight || 0;
  }

  /**
   * Calculate trip fuel based on distance
   * @private
   */
  private calculateTripFuel(distance: number, aircraftType: string): number {
    // Fuel burn rates (kg per km) - simplified
    const fuelBurnRates: Record<string, number> = {
      'B737-800': 2.8,
      'A320-200': 2.7,
      'B777-300ER': 9.5,
      'A350-900': 8.2
    };

    const burnRate = fuelBurnRates[aircraftType] || 3.0;
    return distance * burnRate;
  }

  /**
   * Calculate reserve fuel
   * @private
   */
  private calculateReserveFuel(aircraftType: string): number {
    // 30 minutes at cruise consumption
    const reserveFuelBurn: Record<string, number> = {
      'B737-800': 1500,
      'A320-200': 1400,
      'B777-300ER': 4000,
      'A350-900': 3500
    };

    return reserveFuelBurn[aircraftType] || 1500;
  }

  /**
   * Calculate alternate fuel
   * @private
   */
  private calculateAlternateFuel(aircraftType: string): number {
    // 30 minutes to alternate
    const alternateFuelBurn: Record<string, number> = {
      'B737-800': 1200,
      'A320-200': 1100,
      'B777-300ER': 3500,
      'A350-900': 3000
    };

    return alternateFuelBurn[aircraftType] || 1200;
  }

  /**
   * Calculate taxi fuel
   * @private
   */
  private calculateTaxiFuel(aircraftType: string): number {
    const taxiFuelBurn: Record<string, number> = {
      'B737-800': 200,
      'A320-200': 180,
      'B777-300ER': 400,
      'A350-900': 350
    };

    return taxiFuelBurn[aircraftType] || 200;
  }

  /**
   * Calculate trim setting
   * @private
   */
  private calculateTrimSetting(cgPercentage: number, takeoffWeight: number, aircraftType: string): number {
    // Simplified trim calculation - in production use aircraft-specific formulas
    const baseTrim = 4.0; // Units up
    const cgFactor = (cgPercentage - 25) * 0.1;
    const weightFactor = (takeoffWeight - 50000) / 1000000;

    return Math.max(0, Math.min(10, baseTrim + cgFactor - weightFactor));
  }

  /**
   * Calculate stabilizer trim
   * @private
   */
  private calculateStabilizerTrim(cgPercentage: number, takeoffWeight: number): number {
    // Simplified stabilizer trim calculation
    return this.calculateTrimSetting(cgPercentage, takeoffWeight, 'B737-800');
  }

  /**
   * Get aircraft MAC length
   * @private
   */
  private getAircraftMAC(aircraftType: string): number {
    const macLengths: Record<string, number> = {
      'B737-800': 3.96, // meters
      'A320-200': 4.20,
      'B777-300ER': 7.67,
      'A350-900': 7.29
    };

    return macLengths[aircraftType] || 4.0;
  }

  /**
   * Get aircraft MAC data
   * @private
   */
  private getAircraftMACData(aircraftType: string): { length: number; leadingEdge: number } {
    // Simplified - actual values depend on aircraft datum
    return {
      length: this.getAircraftMAC(aircraftType),
      leadingEdge: 15 // meters from datum (example)
    };
  }

  /**
   * Get passenger load for flight
   * @private
   */
  private async getPassengerLoadForFlight(flightId: string): Promise<PassengerLoad[]> {
    const flight = await db.flightInstance.findUnique({
      where: { id: flightId }
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    // Get check-in records by cabin
    const checkInRecords = await db.checkInRecord.findMany({
      where: {
        flightNumber: flight.flightNumber,
        date: flight.date,
        status: { in: ['checked-in', 'boarded'] }
      }
    });

    // Group by cabin (simplified - would use seat map in production)
    const cabinGroups: Record<string, number> = {
      first: 0,
      business: 0,
      economy: 0
    };

    for (const record of checkInRecords) {
      const seatRow = parseInt(record.seatNumber.replace(/\D/g, '')) || 0;
      if (seatRow <= 5) {
        cabinGroups.first++;
      } else if (seatRow <= 15) {
        cabinGroups.business++;
      } else {
        cabinGroups.economy++;
      }
    }

    const passengerLoad: PassengerLoad[] = [];
    for (const [cabin, count] of Object.entries(cabinGroups)) {
      if (count > 0) {
        passengerLoad.push({
          cabin: cabin as 'first' | 'business' | 'economy',
          passengerCount: count,
          totalWeight: count * PASSENGER_WEIGHTS.average,
          averageWeight: PASSENGER_WEIGHTS.average,
          distribution: [] // Would be populated from seat map
        });
      }
    }

    return passengerLoad;
  }

  /**
   * Get cargo load for flight
   * @private
   */
  private async getCargoLoadForFlight(flightId: string): Promise<CargoLoad> {
    const flight = await db.flightInstance.findUnique({
      where: { id: flightId }
    });

    if (!flight) {
      throw new Error('Flight not found');
    }

    // Get cargo bookings for this flight
    const cargoBookings = await db.cargoBooking.findMany({
      where: {
        flightDetails: {
          contains: flight.flightNumber
        },
        status: { in: ['accepted', 'received', 'loaded'] }
      }
    });

    // Sum cargo by position (simplified)
    let totalCargo = flight.cargo || 0;
    
    // Distribute cargo evenly (simplified - would use actual ULD positions)
    const forwardCargo = totalCargo * 0.4;
    const aftCargo = totalCargo * 0.4;
    const bulkCargo = totalCargo * 0.2;

    return {
      forwardCargo,
      aftCargo,
      bulkCargo,
      totalCargo,
      distribution: [
        { station: 'FWD Cargo', weight: forwardCargo, moment: forwardCargo * 500, arm: 500 },
        { station: 'AFT Cargo', weight: aftCargo, moment: aftCargo * 1500, arm: 1500 },
        { station: 'Bulk Cargo', weight: bulkCargo, moment: bulkCargo * 1700, arm: 1700 }
      ]
    };
  }

  /**
   * Calculate complete weight distribution
   * @private
   */
  private async calculateWeightDistribution(
    aircraftType: string,
    passengerLoad: PassengerLoad[],
    cargoLoad: CargoLoad,
    fuelConfig: FuelConfiguration,
    crewWeight: number
  ): Promise<WeightDistribution[]> {
    const limits = AIRCRAFT_WEIGHT_LIMITS[aircraftType] || AIRCRAFT_WEIGHT_LIMITS['B737-800'];

    const distribution: WeightDistribution[] = [];

    // Operating empty weight (assumed CG position)
    distribution.push({
      station: 'OEW',
      weight: limits.operatingEmptyWeight,
      moment: limits.operatingEmptyWeight * 650,
      arm: 650
    });

    // Crew
    distribution.push({
      station: 'Flight Deck',
      weight: crewWeight * 0.4,
      moment: crewWeight * 0.4 * 400,
      arm: 400
    });
    distribution.push({
      station: 'Cabin Crew',
      weight: crewWeight * 0.6,
      moment: crewWeight * 0.6 * 800,
      arm: 800
    });

    // Passengers by cabin
    for (const pax of passengerLoad) {
      const arm = pax.cabin === 'first' ? 500 : pax.cabin === 'business' ? 700 : 1200;
      distribution.push({
        station: `${pax.cabin.charAt(0).toUpperCase() + pax.cabin.slice(1)} Pax`,
        weight: pax.totalWeight,
        moment: pax.totalWeight * arm,
        arm
      });
    }

    // Cargo
    distribution.push(...cargoLoad.distribution);

    // Fuel (distributed across tanks)
    const fuelStations = [
      { name: 'Left Wing Tank', ratio: 0.35, arm: 900 },
      { name: 'Right Wing Tank', ratio: 0.35, arm: 900 },
      { name: 'Center Tank', ratio: 0.30, arm: 650 }
    ];

    for (const station of fuelStations) {
      const fuelWeight = fuelConfig.totalFuel * station.ratio;
      distribution.push({
        station: station.name,
        weight: fuelWeight,
        moment: fuelWeight * station.arm,
        arm: station.arm
      });
    }

    return distribution;
  }

  /**
   * Save load sheet to database
   * @private
   */
  private async saveLoadSheet(loadData: LoadSheetData): Promise<void> {
    await db.loadSheet.create({
      data: {
        flightNumber: loadData.flightNumber,
        date: loadData.date,
        aircraftRegistration: loadData.aircraftRegistration,
        aircraftType: loadData.aircraftType,
        totalWeight: loadData.weights.takeoffWeight,
        passengerWeight: loadData.passengerLoad.reduce((sum, p) => sum + p.totalWeight, 0),
        cargoWeight: loadData.cargoLoad.totalCargo,
        baggageWeight: 0, // Would be calculated
        fuelWeight: loadData.fuelConfig.totalFuel,
        zeroFuelWeight: loadData.weights.zeroFuelWeight,
        takeoffWeight: loadData.weights.takeoffWeight,
        landingWeight: loadData.weights.landingWeight,
        trimSetting: loadData.trimSetting,
        centerOfGravity: `${loadData.cgPosition.macPercentage.toFixed(1)}% MAC`,
        distribution: JSON.stringify(loadData.distribution),
        cgPosition: JSON.stringify(loadData.cgPosition),
        cgEnvelope: JSON.stringify(loadData.cgEnvelope),
        generatedBy: loadData.generatedBy,
        generatedAt: loadData.generatedAt
      }
    });
  }

  /**
   * Validate load sheet
   * @private
   */
  private async validateLoadSheet(loadSheet: any): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check weight limits
    const limits = AIRCRAFT_WEIGHT_LIMITS[loadSheet.aircraftType] || AIRCRAFT_WEIGHT_LIMITS['B737-800'];

    if (loadSheet.takeoffWeight > limits.maxTakeoffWeight) {
      errors.push(`Takeoff weight ${loadSheet.takeoffWeight} exceeds MTOW ${limits.maxTakeoffWeight}`);
    }

    if (loadSheet.landingWeight > limits.maxLandingWeight) {
      errors.push(`Landing weight ${loadSheet.landingWeight} exceeds MLW ${limits.maxLandingWeight}`);
    }

    if (loadSheet.zeroFuelWeight > limits.maxZeroFuelWeight) {
      errors.push(`Zero fuel weight ${loadSheet.zeroFuelWeight} exceeds MZFW ${limits.maxZeroFuelWeight}`);
    }

    // Parse and check CG
    try {
      const cg = JSON.parse(loadSheet.centerOfGravity || '{}');
      const envelope = JSON.parse(loadSheet.cgEnvelope || '{}');
      
      if (envelope.warnings && envelope.warnings.length > 0) {
        errors.push(...envelope.warnings);
      }
    } catch (e) {
      errors.push('Invalid CG data');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const loadBalanceEngine = new LoadBalanceEngine();
