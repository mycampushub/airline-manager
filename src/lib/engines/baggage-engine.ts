/**
 * Baggage Engine
 * 
 * Comprehensive baggage reconciliation system for the Airline Manager.
 * Handles baggage tracking, reconciliation, fee calculation, special baggage,
 * dangerous goods validation, and mishandled baggage workflows.
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// ============================================
// Type Definitions
// ============================================

/**
 * Baggage information for tag generation
 */
export interface BaggageInfo {
  pnrNumber: string;
  ticketNumber: string;
  passengerId: string;
  passengerName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  weight: number;
  pieces: number;
  interline?: boolean;
  routing?: string[];
  specialHandling?: string[];
}

/**
 * Route information for baggage fee calculation
 */
export interface RouteInfo {
  origin: string;
  destination: string;
  distance: number;
  isInternational: boolean;
  isTransatlantic: boolean;
  isTranspacific: boolean;
}

/**
 * Baggage fee calculation result
 */
export interface BaggageFeeResult {
  baseFee: number;
  excessWeightFee: number;
  excessPieceFee: number;
  specialBaggageFee: number;
  overweightCharge: number;
  oversizeCharge: number;
  totalFee: number;
  currency: string;
  breakdown: FeeBreakdownItem[];
}

/**
 * Individual fee breakdown item
 */
export interface FeeBreakdownItem {
  type: string;
  description: string;
  amount: number;
  currency: string;
}

/**
 * Baggage reconciliation result
 */
export interface ReconciliationResult {
  flightId: string;
  totalBags: number;
  reconciledBags: number;
  unreconciledBags: number;
  interlineBags: number;
  priorityBags: number;
  mismatchedBags: BaggageMismatch[];
  timestamp: Date;
}

/**
 * Baggage mismatch information
 */
export interface BaggageMismatch {
  tagNumber: string;
  expectedDestination: string;
  actualDestination: string;
  passengerName: string;
  issue: string;
  action: string;
}

/**
 * Baggage tracking information
 */
export interface BaggageTracking {
  tagNumber: string;
  status: string;
  currentLocation: string;
  routing: BaggageTrackingPoint[];
  lastUpdated: Date;
  estimatedDelivery?: Date;
}

/**
 * Baggage tracking point in the journey
 */
export interface BaggageTrackingPoint {
  location: string;
  status: string;
  timestamp: Date;
  flightNumber?: string;
  carousel?: string;
}

/**
 * Special baggage details
 */
export interface SpecialBaggageDetails {
  type: 'sports_equipment' | 'musical_instrument' | 'pet' | 'fragile' | 'medical' | 'wheelchair' | 'stroller';
  description: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  requiresApproval?: boolean;
  healthCertificate?: string;
  vaccinationRecord?: string;
  cageSize?: string;
  specialInstructions?: string;
}

/**
 * Dangerous goods information
 */
export interface DangerousGoodsInfo {
  dgClass: string;
  unNumber: string;
  properShippingName: string;
  quantity: number;
  unit: string;
  packingGroup: string;
  isPermitted: boolean;
  requiresDeclaration: boolean;
  specialHandling?: string[];
}

/**
 * Mishandled baggage report
 */
export interface MishandledBaggageReport {
  baggageRecordId: string;
  type: 'lost' | 'delayed' | 'damaged' | 'pilfered';
  location: string;
  description: string;
  reportedBy: string;
  passengerContactInfo: string;
  contentsDescription?: string;
  estimatedValue?: number;
}

/**
 * Lost baggage claim
 */
export interface LostBaggageClaim {
  baggageId: string;
  passengerId: string;
  claimNumber: string;
  status: string;
  reportedAt: Date;
  description: string;
  contents: string;
  estimatedValue: number;
  compensation?: number;
  resolvedAt?: Date;
}

/**
 * Baggage carousel assignment
 */
export interface CarouselAssignment {
  flightNumber: string;
  carousel: string;
  assignedAt: Date;
  expectedBags: number;
  deliveredBags: number;
  status: string;
}

// ============================================
// Baggage Allowance Rules
// ============================================

/**
 * Baggage allowance by cabin class
 */
const BAGGAGE_ALLOWANCE: Record<string, { pieces: number; weight: number; weightUnit: string }> = {
  first: { pieces: 3, weight: 32, weightUnit: 'kg' },
  business: { pieces: 2, weight: 32, weightUnit: 'kg' },
  economy: { pieces: 1, weight: 23, weightUnit: 'kg' },
  premium_economy: { pieces: 2, weight: 23, weightUnit: 'kg' },
};

/**
 * Excess baggage fees per route type
 */
const EXCESS_BAGGAGE_FEES: Record<string, { perPiece: number; perKg: number; currency: string }> = {
  domestic: { perPiece: 25, perKg: 10, currency: 'USD' },
  international: { perPiece: 60, perKg: 20, currency: 'USD' },
  transatlantic: { perPiece: 100, perKg: 30, currency: 'USD' },
  transpacific: { perPiece: 120, perKg: 35, currency: 'USD' },
};

/**
 * Special baggage fees
 */
const SPECIAL_BAGGAGE_FEES: Record<string, { fee: number; currency: string; restrictions: string[] }> = {
  sports_equipment: { fee: 75, currency: 'USD', restrictions: [] },
  golf_clubs: { fee: 75, currency: 'USD', restrictions: ['max_weight_23kg', 'max_length_200cm'] },
  ski_equipment: { fee: 75, currency: 'USD', restrictions: ['max_weight_23kg'] },
  surfboard: { fee: 150, currency: 'USD', restrictions: ['max_length_300cm'] },
  bicycle: { fee: 100, currency: 'USD', restrictions: ['must_be_packed', 'handlebars_removed'] },
  musical_instrument: { fee: 100, currency: 'USD', restrictions: ['max_weight_23kg', 'or_cabin_approval'] },
  pet: { fee: 200, currency: 'USD', restrictions: ['health_certificate', 'vaccination_record', 'advance_notice'] },
  fragile: { fee: 25, currency: 'USD', restrictions: [] },
  medical: { fee: 0, currency: 'USD', restrictions: ['medical_documentation'] },
  wheelchair: { fee: 0, currency: 'USD', restrictions: [] },
  stroller: { fee: 0, currency: 'USD', restrictions: [] },
};

/**
 * Overweight and oversize charges
 */
const SIZE_WEIGHT_CHARGES: Record<string, { threshold: number; charge: number; currency: string }> = {
  overweight_23_32: { threshold: 32, charge: 100, currency: 'USD' },
  overweight_32_45: { threshold: 45, charge: 200, currency: 'USD' },
  oversize_158_203: { threshold: 203, charge: 100, currency: 'USD' },
  oversize_203_292: { threshold: 292, charge: 200, currency: 'USD' },
};

// ============================================
// Dangerous Goods Classes
// ============================================

/**
 * IATA Dangerous Goods Classes
 */
const DANGEROUS_GOODS_CLASSES: Record<string, { name: string; permitted: boolean; restrictions: string[] }> = {
  '1': { name: 'Explosives', permitted: false, restrictions: ['completely_prohibited'] },
  '2.1': { name: 'Flammable gases', permitted: false, restrictions: ['completely_prohibited'] },
  '2.2': { name: 'Non-flammable gases', permitted: true, restrictions: ['limited_quantity', 'approval_required'] },
  '2.3': { name: 'Toxic gases', permitted: false, restrictions: ['completely_prohibited'] },
  '3': { name: 'Flammable liquids', permitted: false, restrictions: ['completely_prohibited'] },
  '4': { name: 'Flammable solids', permitted: false, restrictions: ['completely_prohibited'] },
  '5': { name: 'Oxidizing substances', permitted: false, restrictions: ['completely_prohibited'] },
  '6': { name: 'Toxic substances', permitted: false, restrictions: ['completely_prohibited'] },
  '7': { name: 'Radioactive material', permitted: false, restrictions: ['completely_prohibited'] },
  '8': { name: 'Corrosives', permitted: false, restrictions: ['completely_prohibited'] },
  '9': { name: 'Miscellaneous', permitted: true, restrictions: ['limited_quantity', 'declaration_required'] },
};

/**
 * Common permitted UN numbers for class 9
 */
const PERMITTED_UN_NUMBERS: Set<string> = new Set([
  'UN3090', // Lithium metal batteries
  'UN3091', // Lithium metal batteries packed with equipment
  'UN3480', // Lithium ion batteries
  'UN3481', // Lithium ion batteries packed with equipment
  'UN1845', // Dry ice
  'UN1993', // Aerosols (limited quantity)
  'UN1219', // Alcohol (limited quantity)
]);

// ============================================
// Baggage Engine Class
// ============================================

export class BaggageEngine {
  /**
   * Reconciles baggage for a specific flight
   * Matches checked baggage to passengers and identifies discrepancies
   * 
   * @param flightId - The flight instance ID
   * @returns Reconciliation result with matched and unmatched baggage
   */
  async reconcileBaggage(flightId: string): Promise<ReconciliationResult> {
    try {
      // Get all baggage records for this flight
      const baggageRecords = await db.baggageRecord.findMany({
        where: { flightNumber: flightId },
        include: {
          mishandledRecords: true,
        },
      });

      // Get boarding records for this flight
      const boardingRecords = await db.checkInRecord.findMany({
        where: { flightNumber: flightId, status: 'checked-in' },
      });

      const totalBags = baggageRecords.length;
      const mismatches: BaggageMismatch[] = [];
      let reconciledCount = 0;
      let interlineCount = 0;
      let priorityCount = 0;

      // Match baggage to passengers
      const passengerBaggageMap = new Map<string, typeof baggageRecords>();
      
      for (const bag of baggageRecords) {
        const passengerBags = passengerBaggageMap.get(bag.passengerId) || [];
        passengerBags.push(bag);
        passengerBaggageMap.set(bag.passengerId, passengerBags);

        // Check for interline baggage
        if (bag.interline) {
          interlineCount++;
        }

        // Check for priority baggage
        const specialHandling = JSON.parse(bag.specialHandling || '[]');
        if (specialHandling.includes('priority')) {
          priorityCount++;
        }

        // Verify destination matches passenger's final destination
        const boardingRecord = boardingRecords.find(r => r.ticketNumber === bag.ticketNumber);
        if (boardingRecord) {
          // Get passenger's flight segments to verify final destination
          const pnr = await db.pNR.findFirst({
            where: { pnrNumber: bag.pnrNumber },
            include: { segments: true },
          });

          if (pnr) {
            const lastSegment = pnr.segments[pnr.segments.length - 1];
            if (lastSegment && lastSegment.destination !== bag.destination) {
              mismatches.push({
                tagNumber: bag.tagNumber,
                expectedDestination: lastSegment.destination,
                actualDestination: bag.destination,
                passengerName: bag.passengerName,
                issue: 'Destination mismatch',
                action: 'Requires transfer handling',
              });
            } else {
              reconciledCount++;
            }
          }
        } else {
          mismatches.push({
            tagNumber: bag.tagNumber,
            expectedDestination: 'Unknown',
            actualDestination: bag.destination,
            passengerName: bag.passengerName,
            issue: 'Passenger not checked in',
            action: 'Verify passenger status',
          });
        }
      }

      const result: ReconciliationResult = {
        flightId,
        totalBags,
        reconciledBags: reconciledCount,
        unreconciledBags: totalBags - reconciledCount,
        interlineBags: interlineCount,
        priorityBags: priorityCount,
        mismatchedBags: mismatches,
        timestamp: new Date(),
      };

      return result;
    } catch (error) {
      throw new Error(`Failed to reconcile baggage for flight ${flightId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Tracks baggage throughout its journey
   * Returns current location and status history
   * 
   * @param tagNumber - The baggage tag number
   * @returns Baggage tracking information
   */
  async trackBaggage(tagNumber: string): Promise<BaggageTracking> {
    try {
      const baggage = await db.baggageRecord.findUnique({
        where: { tagNumber },
      });

      if (!baggage) {
        throw new Error(`Baggage with tag ${tagNumber} not found`);
      }

      const routing = JSON.parse(baggage.routing || '[]') as BaggageTrackingPoint[];
      const specialHandling = JSON.parse(baggage.specialHandling || '[]');

      // Update tracking points based on current status
      const currentLocation = this.determineCurrentLocation(baggage);

      const tracking: BaggageTracking = {
        tagNumber: baggage.tagNumber,
        status: baggage.status,
        currentLocation,
        routing,
        lastUpdated: new Date(),
        estimatedDelivery: specialHandling.includes('priority') ? 
          new Date(Date.now() + 15 * 60 * 1000) : // 15 min for priority
          undefined,
      };

      return tracking;
    } catch (error) {
      throw new Error(`Failed to track baggage ${tagNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determines the current location of baggage based on status
   * 
   * @param baggage - The baggage record
   * @returns Current location description
   */
  private determineCurrentLocation(baggage: any): string {
    switch (baggage.status) {
      case 'checked':
        return `${baggage.origin} - Check-in counter`;
      case 'loaded':
        return `On board flight ${baggage.flightNumber}`;
      case 'transferred':
        return baggage.transferFlight ? `Transferring to ${baggage.transferFlight}` : 'Transfer area';
      case 'delivered':
        return baggage.carousel ? `${baggage.destination} - Carousel ${baggage.carousel}` : `${baggage.destination} - Delivered`;
      case 'mishandled':
        return 'Mishandled baggage office';
      case 'lost':
        return 'Lost baggage - Location unknown';
      default:
        return 'Unknown location';
    }
  }

  /**
   * Handles mishandled baggage (lost, delayed, damaged, or pilfered)
   * Creates mishandled record and initiates workflow
   * 
   * @param baggageId - The baggage record ID
   * @param type - Type of mishandling
   * @param location - Where the issue was discovered
   * @param reportedBy - Person reporting the issue
   * @param description - Description of the incident
   * @returns Created mishandled baggage record
   */
  async handleMishandledBaggage(
    baggageId: string,
    type: 'lost' | 'delayed' | 'damaged' | 'pilfered',
    location: string,
    reportedBy: string,
    description: string
  ): Promise<any> {
    try {
      // Update baggage status
      const baggage = await db.baggageRecord.update({
        where: { id: baggageId },
        data: {
          status: type === 'lost' ? 'lost' : 'mishandled',
          mishandledAt: new Date(),
        },
      });

      // Create mishandled record
      const mishandled = await db.mishandledBaggage.create({
        data: {
          baggageRecordId: baggageId,
          type,
          location,
          description,
          reportedBy,
          status: 'open',
          claimNumber: this.generateClaimNumber(),
        },
      });

      // Log the incident for audit
      await this.logBaggageEvent(baggageId, 'mishandled_reported', {
        type,
        location,
        reportedBy,
        description,
      });

      return mishandled;
    } catch (error) {
      throw new Error(`Failed to handle mishandled baggage ${baggageId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates a unique claim number for mishandled baggage
   * 
   * @returns Generated claim number
   */
  private generateClaimNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BIR${dateStr}${random}`;
  }

  /**
   * Generates a baggage tag with unique number
   * 
   * @param baggageInfo - Baggage information
   * @returns Generated tag number and tag data
   */
  async generateBaggageTag(baggageInfo: BaggageInfo): Promise<{ tagNumber: string; tagData: any }> {
    try {
      // Generate unique tag number: airline code + random digits
      const tagNumber = this.generateTagNumber();

      // Prepare routing JSON
      const routing = baggageInfo.routing || [baggageInfo.origin, baggageInfo.destination];
      
      // Prepare special handling JSON
      const specialHandling = baggageInfo.specialHandling || [];

      // Create baggage record
      const baggageRecord = await db.baggageRecord.create({
        data: {
          tagNumber,
          pnrNumber: baggageInfo.pnrNumber,
          ticketNumber: baggageInfo.ticketNumber,
          passengerId: baggageInfo.passengerId,
          passengerName: baggageInfo.passengerName,
          flightNumber: baggageInfo.flightNumber,
          origin: baggageInfo.origin,
          destination: baggageInfo.destination,
          weight: baggageInfo.weight,
          pieces: baggageInfo.pieces,
          status: 'checked',
          routing: JSON.stringify(routing),
          interline: baggageInfo.interline || false,
          specialHandling: JSON.stringify(specialHandling),
        },
      });

      // Generate printable tag data
      const tagData = {
        tagNumber,
        airlineCode: baggageInfo.flightNumber.substring(0, 2),
        passengerName: baggageInfo.passengerName,
        flightNumber: baggageInfo.flightNumber,
        from: baggageInfo.origin,
        to: baggageInfo.destination,
        date: new Date().toISOString().split('T')[0],
        class: this.determineBaggageClass(baggageInfo),
        priority: specialHandling.includes('priority'),
        specialHandling,
        barcode: this.generateBarcode(tagNumber),
      };

      // Log tag generation
      await this.logBaggageEvent(baggageRecord.id, 'tag_generated', { tagNumber });

      return { tagNumber, tagData };
    } catch (error) {
      throw new Error(`Failed to generate baggage tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates a unique baggage tag number
   * 
   * @returns Unique tag number
   */
  private generateTagNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `AB${timestamp}${random}`.toUpperCase();
  }

  /**
   * Generates barcode data for baggage tag
   * 
   * @param tagNumber - The tag number
   * @returns Barcode data string
   */
  private generateBarcode(tagNumber: string): string {
    // Simple checksum-based barcode
    let sum = 0;
    for (let i = 0; i < tagNumber.length; i++) {
      sum += tagNumber.charCodeAt(i);
    }
    const checksum = (sum % 100).toString().padStart(2, '0');
    return `${tagNumber}${checksum}`;
  }

  /**
   * Determines baggage class based on routing and special handling
   * 
   * @param baggageInfo - Baggage information
   * @returns Baggage class code
   */
  private determineBaggageClass(baggageInfo: BaggageInfo): string {
    if (baggageInfo.interline) {
      return 'I'; // Interline
    }
    if (baggageInfo.specialHandling?.includes('priority')) {
      return 'P'; // Priority
    }
    return 'N'; // Normal
  }

  /**
   * Matches baggage to passengers for a flight
   * Returns mapping of passengers to their checked bags
   * 
   * @param flightId - The flight ID
   * @returns Passenger to baggage mapping
   */
  async matchBaggageToPassenger(flightId: string): Promise<Map<string, any[]>> {
    try {
      const baggageRecords = await db.baggageRecord.findMany({
        where: { flightNumber: flightId },
      });

      const passengerMap = new Map<string, any[]>();

      for (const bag of baggageRecords) {
        const passengerBags = passengerMap.get(bag.passengerId) || [];
        passengerBags.push(bag);
        passengerMap.set(bag.passengerId, passengerBags);
      }

      return passengerMap;
    } catch (error) {
      throw new Error(`Failed to match baggage to passengers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculates baggage fees based on route, cabin class, and baggage details
   * 
   * @param pnrId - The PNR ID
   * @param route - Route information
   * @param cabin - Cabin class
   * @param bags - Number of bags
   * @param weight - Total weight
   * @param specialBaggage - Special baggage types
   * @returns Baggage fee calculation result
   */
  async calculateBaggageFee(
    pnrId: string,
    route: RouteInfo,
    cabin: string,
    bags: number,
    weight: number,
    specialBaggage?: string[]
  ): Promise<BaggageFeeResult> {
    try {
      const breakdown: FeeBreakdownItem[] = [];
      let totalFee = 0;
      const currency = this.getRouteCurrency(route);

      // Get baggage allowance for cabin
      const allowance = BAGGAGE_ALLOWANCE[cabin.toLowerCase()] || BAGGAGE_ALLOWANCE.economy;

      // Calculate excess pieces
      const excessPieces = Math.max(0, bags - allowance.pieces);
      if (excessPieces > 0) {
        const routeType = this.determineRouteType(route);
        const excessFee = EXCESS_BAGGAGE_FEES[routeType];
        const pieceFee = excessPieces * excessFee.perPiece;
        totalFee += pieceFee;
        breakdown.push({
          type: 'excess_piece',
          description: `Excess baggage (${excessPieces} piece(s))`,
          amount: pieceFee,
          currency: excessFee.currency,
        });
      }

      // Calculate excess weight
      const allowedWeight = allowance.pieces * allowance.weight;
      const excessWeight = Math.max(0, weight - allowedWeight);
      if (excessWeight > 0) {
        const routeType = this.determineRouteType(route);
        const excessFee = EXCESS_BAGGAGE_FEES[routeType];
        const weightFee = Math.ceil(excessWeight) * excessFee.perKg;
        totalFee += weightFee;
        breakdown.push({
          type: 'excess_weight',
          description: `Excess weight (${excessWeight.toFixed(1)} kg)`,
          amount: weightFee,
          currency: excessFee.currency,
        });
      }

      // Calculate special baggage fees
      if (specialBaggage && specialBaggage.length > 0) {
        for (const special of specialBaggage) {
          const specialFee = SPECIAL_BAGGAGE_FEES[special];
          if (specialFee) {
            totalFee += specialFee.fee;
            breakdown.push({
              type: 'special_baggage',
              description: `${special.replace(/_/g, ' ').toUpperCase()} fee`,
              amount: specialFee.fee,
              currency: specialFee.currency,
            });
          }
        }
      }

      return {
        baseFee: 0,
        excessWeightFee: breakdown.filter(b => b.type === 'excess_weight').reduce((sum, b) => sum + b.amount, 0),
        excessPieceFee: breakdown.filter(b => b.type === 'excess_piece').reduce((sum, b) => sum + b.amount, 0),
        specialBaggageFee: breakdown.filter(b => b.type === 'special_baggage').reduce((sum, b) => sum + b.amount, 0),
        overweightCharge: 0,
        oversizeCharge: 0,
        totalFee,
        currency,
        breakdown,
      };
    } catch (error) {
      throw new Error(`Failed to calculate baggage fee: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determines route type for fee calculation
   * 
   * @param route - Route information
   * @returns Route type key
   */
  private determineRouteType(route: RouteInfo): string {
    if (route.isTranspacific) return 'transpacific';
    if (route.isTransatlantic) return 'transatlantic';
    if (route.isInternational) return 'international';
    return 'domestic';
  }

  /**
   * Gets the currency for a route
   * 
   * @param route - Route information
   * @returns Currency code
   */
  private getRouteCurrency(route: RouteInfo): string {
    // Simplified logic - in production, would use actual country mapping
    return 'USD';
  }

  /**
   * Validates if baggage exceeds allowances
   * 
   * @param bags - Number of bags
   * @param weight - Total weight
   * @param route - Route information
   * @param cabin - Cabin class
   * @returns Validation result with warnings
   */
  async validateExcessBaggage(
    bags: number,
    weight: number,
    route: RouteInfo,
    cabin: string
  ): Promise<{
    isValid: boolean;
    excessPieces: number;
    excessWeight: number;
    warnings: string[];
    restrictions: string[];
  }> {
    const warnings: string[] = [];
    const restrictions: string[] = [];

    const allowance = BAGGAGE_ALLOWANCE[cabin.toLowerCase()] || BAGGAGE_ALLOWANCE.economy;
    const excessPieces = Math.max(0, bags - allowance.pieces);
    const allowedWeight = allowance.pieces * allowance.weight;
    const excessWeight = Math.max(0, weight - allowedWeight);

    if (excessPieces > 0) {
      warnings.push(`Exceeds free baggage allowance by ${excessPieces} piece(s)`);
    }

    if (excessWeight > 0) {
      warnings.push(`Exceeds weight allowance by ${excessWeight.toFixed(1)} kg`);
    }

    // Check for overweight per piece (simplified - assumes equal distribution)
    const weightPerPiece = weight / bags;
    if (weightPerPiece > 32) {
      warnings.push('One or more bags exceed standard weight limit (32kg)');
      restrictions.push('may require special handling');
    }

    if (weightPerPiece > 45) {
      restrictions.push('bags over 45kg may be refused');
    }

    return {
      isValid: excessPieces === 0 && excessWeight === 0,
      excessPieces,
      excessWeight,
      warnings,
      restrictions,
    };
  }

  /**
   * Handles special baggage with validation and fee calculation
   * 
   * @param type - Special baggage type
   * @param details - Special baggage details
   * @returns Handling result with fees and restrictions
   */
  async handleSpecialBaggage(
    type: string,
    details: SpecialBaggageDetails
  ): Promise<{
    approved: boolean;
    fee: number;
    currency: string;
    restrictions: string[];
    requirements: string[];
    message: string;
  }> {
    const specialFee = SPECIAL_BAGGAGE_FEES[type];

    if (!specialFee) {
      return {
        approved: false,
        fee: 0,
        currency: 'USD',
        restrictions: [],
        requirements: [],
        message: `Unknown special baggage type: ${type}`,
      };
    }

    const requirements: string[] = [];
    const restrictions: string[] = [...specialFee.restrictions];

    // Type-specific validations
    switch (type) {
      case 'pet':
        if (!details.healthCertificate) {
          requirements.push('Health certificate required');
        }
        if (!details.vaccinationRecord) {
          requirements.push('Vaccination record required');
        }
        if (details.weight > 32) {
          restrictions.push('Pets over 32kg may require cargo transport');
        }
        break;

      case 'sports_equipment':
        if (details.dimensions) {
          const totalSize = details.dimensions.length + details.dimensions.width + details.dimensions.height;
          if (totalSize > 292) {
            restrictions.push('Exceeds maximum size limit (292cm)');
          }
        }
        break;

      case 'musical_instrument':
        if (details.weight > 23) {
          restrictions.push('Must be checked as baggage');
          requirements.push('Fragile tag required');
        } else {
          requirements.push('May be carried in cabin with approval');
        }
        break;

      case 'fragile':
        requirements.push('Fragile tag required');
        requirements.push('Proper packaging required');
        break;

      case 'medical':
        requirements.push('Medical documentation required');
        requirements.push('Priority handling included');
        break;

      case 'wheelchair':
      case 'stroller':
        requirements.push('Priority handling included');
        requirements.push('Gate check available');
        break;
    }

    const approved = restrictions.filter(r => r.includes('prohibited') || r.includes('refused')).length === 0;

    return {
      approved,
      fee: specialFee.fee,
      currency: specialFee.currency,
      restrictions,
      requirements,
      message: approved ? 
        `Special baggage approved${specialFee.fee > 0 ? `. Fee: $${specialFee.fee}` : ''}` :
        'Special baggage cannot be accepted due to restrictions',
    };
  }

  /**
   * Validates dangerous goods according to IATA regulations
   * 
   * @param dgClass - Dangerous goods class
   * @param unNumber - UN number
   * @param quantity - Quantity
   * @param unit - Unit of measurement
   * @returns Validation result
   */
  async validateDangerousGoods(
    dgClass: string,
    unNumber: string,
    quantity: number,
    unit: string
  ): Promise<DangerousGoodsInfo> {
    const dgClassInfo = DANGEROUS_GOODS_CLASSES[dgClass];

    if (!dgClassInfo) {
      throw new Error(`Invalid dangerous goods class: ${dgClass}`);
    }

    const isPermitted = dgClassInfo.permitted && PERMITTED_UN_NUMBERS.has(unNumber);
    const requiresDeclaration = isPermitted;

    const result: DangerousGoodsInfo = {
      dgClass,
      unNumber,
      properShippingName: this.getProperShippingName(unNumber),
      quantity,
      unit,
      packingGroup: this.determinePackingGroup(dgClass),
      isPermitted,
      requiresDeclaration,
      specialHandling: isPermitted ? this.getDGSpecialHandling(dgClass) : [],
    };

    if (!isPermitted) {
      result.specialHandling = ['PROHIBITED'];
    }

    return result;
  }

  /**
   * Gets proper shipping name for UN number
   * 
   * @param unNumber - UN number
   * @returns Proper shipping name
   */
  private getProperShippingName(unNumber: string): string {
    const names: Record<string, string> = {
      'UN3090': 'Lithium metal batteries',
      'UN3091': 'Lithium metal batteries packed with equipment',
      'UN3480': 'Lithium ion batteries',
      'UN3481': 'Lithium ion batteries packed with equipment',
      'UN1845': 'Dry ice',
      'UN1993': 'Aerosols, flammable',
      'UN1219': 'Ethanol solution',
    };
    return names[unNumber] || 'Unknown material';
  }

  /**
   * Determines packing group for DG class
   * 
   * @param dgClass - Dangerous goods class
   * @returns Packing group
   */
  private determinePackingGroup(dgClass: string): string {
    // Simplified logic
    if (['1', '2.3', '6', '7', '8'].includes(dgClass)) return 'I';
    if (['2.1', '3', '4', '5'].includes(dgClass)) return 'II';
    return 'III';
  }

  /**
   * Gets special handling requirements for dangerous goods
   * 
   * @param dgClass - Dangerous goods class
   * @returns Array of special handling requirements
   */
  private getDGSpecialHandling(dgClass: string): string[] {
    const handling: Record<string, string[]> = {
      '9': ['Limited quantity only', 'Declaration required', 'Cargo only'],
      '2.2': ['Limited quantity only', 'Approval required', 'Cargo only'],
    };
    return handling[dgClass] || [];
  }

  /**
   * Processes baggage transfer to another flight
   * 
   * @param baggageId - The baggage record ID
   * @param newFlight - New flight number
   * @returns Updated baggage record
   */
  async processBaggageTransfer(baggageId: string, newFlight: string): Promise<any> {
    try {
      const baggage = await db.baggageRecord.update({
        where: { id: baggageId },
        data: {
          transferFlight: newFlight,
          status: 'transferred',
          flightNumber: newFlight,
        },
      });

      // Update routing
      const routing = JSON.parse(baggage.routing || '[]');
      routing.push({ flight: newFlight, transferredAt: new Date().toISOString() });
      await db.baggageRecord.update({
        where: { id: baggageId },
        data: { routing: JSON.stringify(routing) },
      });

      // Log transfer
      await this.logBaggageEvent(baggageId, 'transferred', { toFlight: newFlight });

      return baggage;
    } catch (error) {
      throw new Error(`Failed to transfer baggage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assigns baggage to a specific carousel for delivery
   * 
   * @param flightId - The flight ID
   * @param carousel - Carousel number
   * @returns Assignment result
   */
  async assignBaggageToCarousel(flightId: string, carousel: string): Promise<CarouselAssignment> {
    try {
      // Get all baggage for the flight
      const baggageRecords = await db.baggageRecord.findMany({
        where: { flightNumber: flightId, status: 'loaded' },
      });

      // Update all baggage records with carousel assignment
      for (const bag of baggageRecords) {
        await db.baggageRecord.update({
          where: { id: bag.id },
          data: { carousel, status: 'delivered', deliveredAt: new Date() },
        });
      }

      const assignment: CarouselAssignment = {
        flightNumber: flightId,
        carousel,
        assignedAt: new Date(),
        expectedBags: baggageRecords.length,
        deliveredBags: baggageRecords.length,
        status: 'assigned',
      };

      return assignment;
    } catch (error) {
      throw new Error(`Failed to assign baggage to carousel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a lost baggage claim
   * 
   * @param baggageId - The baggage record ID
   * @param passengerId - The passenger ID
   * @param description - Description of contents
   * @param estimatedValue - Estimated value of contents
   * @returns Created claim record
   */
  async createLostBaggageClaim(
    baggageId: string,
    passengerId: string,
    description: string,
    estimatedValue: number
  ): Promise<LostBaggageClaim> {
    try {
      const baggage = await db.baggageRecord.findUnique({
        where: { id: baggageId },
      });

      if (!baggage) {
        throw new Error(`Baggage ${baggageId} not found`);
      }

      // Create or update mishandled record
      let mishandled = await db.mishandledBaggage.findFirst({
        where: { baggageRecordId: baggageId },
      });

      if (!mishandled) {
        mishandled = await db.mishandledBaggage.create({
          data: {
            baggageRecordId: baggageId,
            type: 'lost',
            location: 'Unknown',
            description,
            reportedBy: 'System',
            status: 'open',
            claimNumber: this.generateClaimNumber(),
          },
        });
      }

      const claim: LostBaggageClaim = {
        baggageId,
        passengerId,
        claimNumber: mishandled.claimNumber!,
        status: mishandled.status,
        reportedAt: mishandled.reportedAt,
        description,
        contents: description,
        estimatedValue,
        resolvedAt: mishandled.resolvedAt || undefined,
      };

      // Log claim creation
      await this.logBaggageEvent(baggageId, 'claim_created', {
        claimNumber: mishandled.claimNumber,
        estimatedValue,
      });

      return claim;
    } catch (error) {
      throw new Error(`Failed to create lost baggage claim: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Confirms baggage delivery to passenger
   * 
   * @param baggageId - The baggage record ID
   * @param deliveryLocation - Where delivery was confirmed
   * @param confirmedBy - Person confirming delivery
   * @returns Updated baggage record
   */
  async confirmBaggageDelivery(
    baggageId: string,
    deliveryLocation?: string,
    confirmedBy?: string
  ): Promise<any> {
    try {
      const baggage = await db.baggageRecord.update({
        where: { id: baggageId },
        data: {
          status: 'delivered',
          deliveredAt: new Date(),
        },
      });

      // Update mishandled record if exists
      const mishandled = await db.mishandledBaggage.findFirst({
        where: { baggageRecordId: baggageId },
      });

      if (mishandled) {
        await db.mishandledBaggage.update({
          where: { id: mishandled.id },
          data: {
            status: 'delivered',
            resolvedAt: new Date(),
            resolution: `Delivered at ${deliveryLocation || 'airport'}`,
          },
        });
      }

      // Log delivery confirmation
      await this.logBaggageEvent(baggageId, 'delivery_confirmed', {
        location: deliveryLocation,
        confirmedBy,
      });

      return baggage;
    } catch (error) {
      throw new Error(`Failed to confirm baggage delivery: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Re-issues a lost or damaged baggage tag
   * 
   * @param baggageId - The baggage record ID
   * @returns New tag information
   */
  async reissueBaggageTag(baggageId: string): Promise<{ oldTagNumber: string; newTagNumber: string; tagData: any }> {
    try {
      const baggage = await db.baggageRecord.findUnique({
        where: { id: baggageId },
      });

      if (!baggage) {
        throw new Error(`Baggage ${baggageId} not found`);
      }

      const oldTagNumber = baggage.tagNumber;
      const newTagNumber = this.generateTagNumber();

      // Update baggage record with new tag
      const updatedBaggage = await db.baggageRecord.update({
        where: { id: baggageId },
        data: { tagNumber: newTagNumber },
      });

      // Generate new tag data
      const tagData = {
        tagNumber: newTagNumber,
        airlineCode: baggage.flightNumber.substring(0, 2),
        passengerName: baggage.passengerName,
        flightNumber: baggage.flightNumber,
        from: baggage.origin,
        to: baggage.destination,
        date: new Date().toISOString().split('T')[0],
        reissued: true,
        originalTag: oldTagNumber,
        barcode: this.generateBarcode(newTagNumber),
      };

      // Log re-issuance
      await this.logBaggageEvent(baggageId, 'tag_reissued', {
        oldTagNumber,
        newTagNumber,
      });

      return { oldTagNumber, newTagNumber, tagData };
    } catch (error) {
      throw new Error(`Failed to reissue baggage tag: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Marks baggage as priority for expedited handling
   * 
   * @param baggageId - The baggage record ID
   * @returns Updated baggage record
   */
  async markPriorityBaggage(baggageId: string): Promise<any> {
    try {
      const baggage = await db.baggageRecord.findUnique({
        where: { id: baggageId },
      });

      if (!baggage) {
        throw new Error(`Baggage ${baggageId} not found`);
      }

      let specialHandling = JSON.parse(baggage.specialHandling || '[]');
      if (!specialHandling.includes('priority')) {
        specialHandling.push('priority');
      }

      const updatedBaggage = await db.baggageRecord.update({
        where: { id: baggageId },
        data: { specialHandling: JSON.stringify(specialHandling) },
      });

      // Log priority marking
      await this.logBaggageEvent(baggageId, 'marked_priority', {});

      return updatedBaggage;
    } catch (error) {
      throw new Error(`Failed to mark baggage as priority: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Logs a baggage-related event for audit purposes
   * 
   * @param baggageId - The baggage record ID
   * @param eventType - Type of event
   * @param eventData - Event data
   */
  private async logBaggageEvent(baggageId: string, eventType: string, eventData: any): Promise<void> {
    // In production, this would write to an audit log table
    // For now, we'll use a console log as placeholder
    console.log(`[Baggage Event] ${eventType} - BaggageID: ${baggageId}`, eventData);
  }

  /**
   * Gets baggage statistics for a flight
   * 
   * @param flightId - The flight ID
   * @returns Baggage statistics
   */
  async getBaggageStatistics(flightId: string): Promise<{
    totalBags: number;
    totalWeight: number;
    averageWeight: number;
    byStatus: Record<string, number>;
    bySpecialHandling: Record<string, number>;
    interlineBags: number;
    priorityBags: number;
  }> {
    try {
      const baggageRecords = await db.baggageRecord.findMany({
        where: { flightNumber: flightId },
      });

      const totalBags = baggageRecords.length;
      const totalWeight = baggageRecords.reduce((sum, bag) => sum + bag.weight, 0);
      const averageWeight = totalBags > 0 ? totalWeight / totalBags : 0;

      const byStatus: Record<string, number> = {};
      const bySpecialHandling: Record<string, number> = {};
      let interlineBags = 0;
      let priorityBags = 0;

      for (const bag of baggageRecords) {
        // Count by status
        byStatus[bag.status] = (byStatus[bag.status] || 0) + 1;

        // Count special handling
        const specialHandling = JSON.parse(bag.specialHandling || '[]');
        for (const sh of specialHandling) {
          bySpecialHandling[sh] = (bySpecialHandling[sh] || 0) + 1;
        }

        // Count interline
        if (bag.interline) {
          interlineBags++;
        }

        // Count priority
        if (specialHandling.includes('priority')) {
          priorityBags++;
        }
      }

      return {
        totalBags,
        totalWeight,
        averageWeight,
        byStatus,
        bySpecialHandling,
        interlineBags,
        priorityBags,
      };
    } catch (error) {
      throw new Error(`Failed to get baggage statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const baggageEngine = new BaggageEngine();
