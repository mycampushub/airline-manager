/**
 * PNR (Passenger Name Record) Engine
 * Core business logic for PNR operations in the Airline Manager System
 *
 * This engine handles all PNR-related operations including:
 * - PNR Split and Merge
 * - Fare Re-quote calculations
 * - Time limit management and auto-cancel
 * - Queue management
 * - Waitlist processing
 * - Married segment logic
 * - Multi-city / open-jaw booking support
 */

import { db } from '@/lib/db';
import type { PNR, Passenger, FlightSegment } from '@prisma/client';

// ============================================
// Type Definitions
// ============================================

/**
 * Result of a PNR split operation
 */
export interface SplitPNRResult {
  success: boolean;
  message: string;
  originalPnr: PNR;
  newPnrs: PNR[];
  splitPassengers: Record<string, string[]>; // PNR number -> passenger IDs
}

/**
 * Result of a PNR merge operation
 */
export interface MergePNRsResult {
  success: boolean;
  message: string;
  mergedPnr: PNR;
  originalPnrs: PNR[];
  mergedPassengers: Passenger[];
  mergedSegments: FlightSegment[];
}

/**
 * Fare calculation result
 */
export interface FareCalculation {
  baseFare: number;
  taxes: number;
  fees: number;
  totalFare: number;
  currency: string;
  fareBreakdown: FareBreakdownItem[];
}

/**
 * Individual fare breakdown item
 */
export interface FareBreakdownItem {
  segmentId: string;
  flightNumber: string;
  route: string;
  fareClass: string;
  fareBasis: string;
  baseFare: number;
  taxes: number;
  fees: number;
  subtotal: number;
}

/**
 * Changes to be applied to a PNR for re-quote
 */
export interface PNRChanges {
  modifiedSegments?: {
    segmentId: string;
    newFlightNumber?: string;
    newDate?: string;
    newClass?: string;
  }[];
  removedSegments?: string[];
  addedSegments?: {
    flightNumber: string;
    airlineCode: string;
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    aircraftType: string;
    fareClass: string;
    fareBasis: string;
    cabinClass: string;
    segmentSequence: number;
  }[];
}

/**
 * Queue position assignment result
 */
export interface QueuePositionResult {
  success: boolean;
  queuePosition?: number;
  queuePriority?: number;
  message: string;
}

/**
 * Waitlist promotion result
 */
export interface WaitlistPromotionResult {
  promotedPnrs: string[];
  remainingWaitlisted: string[];
  promotionDetails: {
    pnrNumber: string;
    promotedTo: string;
    flightNumber: string;
    date: string;
  }[];
}

/**
 * Married segment validation result
 */
export interface MarriedSegmentValidation {
  isValid: boolean;
  marriedSegmentKey?: string;
  segments: FlightSegment[];
  errors?: string[];
  warnings?: string[];
}

/**
 * PNR status transition
 */
export type PNRStatus = 'confirmed' | 'waitlist' | 'cancelled' | 'ticketed' | 'void';

// ============================================
// PNR Engine Class
// ============================================

export class PNREngine {
  private static instance: PNREngine;

  private constructor() {}

  /**
   * Get singleton instance of PNREngine
   */
  public static getInstance(): PNREngine {
    if (!PNREngine.instance) {
      PNREngine.instance = new PNREngine();
    }
    return PNREngine.instance;
  }

  // ============================================
  // PNR SPLIT
  // ============================================

  /**
   * Split a PNR into multiple PNRs based on passenger IDs
   *
   * @param pnrNumber - The original PNR number to split
   * @param passengerGroups - Array of passenger ID arrays to split into separate PNRs
   * @returns SplitPNRResult with details of the split operation
   *
   * @example
   * ```typescript
   * const result = await pnrEngine.splitPNR('ABC123', [
   *   ['passenger1-id', 'passenger2-id'],
   *   ['passenger3-id']
   * ]);
   * ```
   */
  async splitPNR(
    pnrNumber: string,
    passengerGroups: string[][]
  ): Promise<SplitPNRResult> {
    try {
      // Validate input
      if (!pnrNumber || passengerGroups.length === 0) {
        return {
          success: false,
          message: 'Invalid input: PNR number and at least one passenger group required',
          originalPnr: null as any,
          newPnrs: [],
          splitPassengers: {}
        };
      }

      // Fetch the original PNR with all related data
      const originalPnr = await db.pNR.findUnique({
        where: { pnrNumber },
        include: {
          passengers: true,
          segments: true,
          tickets: true,
          emds: true,
          remarks: true,
          ssrs: true
        }
      });

      if (!originalPnr) {
        return {
          success: false,
          message: `PNR ${pnrNumber} not found`,
          originalPnr: null as any,
          newPnrs: [],
          splitPassengers: {}
        };
      }

      // Check if PNR can be split (not ticketed, not cancelled, etc.)
      if (originalPnr.status === 'cancelled') {
        return {
          success: false,
          message: 'Cannot split a cancelled PNR',
          originalPnr,
          newPnrs: [],
          splitPassengers: {}
        };
      }

      if (originalPnr.status === 'ticketed') {
        return {
          success: false,
          message: 'Cannot split a ticketed PNR. Tickets must be voided first.',
          originalPnr,
          newPnrs: [],
          splitPassengers: {}
        };
      }

      // Validate all passenger IDs belong to the PNR
      const allPassengerIds = new Set(originalPnr.passengers.map(p => p.id));
      const invalidIds: string[] = [];

      for (const group of passengerGroups) {
        for (const id of group) {
          if (!allPassengerIds.has(id)) {
            invalidIds.push(id);
          }
        }
      }

      if (invalidIds.length > 0) {
        return {
          success: false,
          message: `Invalid passenger IDs: ${invalidIds.join(', ')}`,
          originalPnr,
          newPnrs: [],
          splitPassengers: {}
        };
      }

      // Generate married segment key for original PNR
      const marriedSegmentKey = this.generateMarriedSegmentKey(originalPnr.segments);

      const newPnrs: PNR[] = [];
      const splitPassengers: Record<string, string[]> = {};

      // Create new PNRs for each passenger group
      for (let i = 0; i < passengerGroups.length; i++) {
        const passengerIds = passengerGroups[i];

        // Generate new PNR number
        const newPnrNumber = await this.generatePNRNumber();

        // Calculate new amount based on passenger count
        const passengerCount = passengerIds.length;
        const newAmount = (originalPnr.amount / originalPnr.passengers.length) * passengerCount;

        // Create new PNR
        const newPnr = await db.pNR.create({
          data: {
            pnrNumber: newPnrNumber,
            createdBy: originalPnr.createdBy,
            status: originalPnr.status,
            contactEmail: originalPnr.contactEmail,
            contactPhone: originalPnr.contactPhone,
            contactAddress: originalPnr.contactAddress,
            paymentMethod: originalPnr.paymentMethod,
            cardLastFour: originalPnr.cardLastFour,
            amount: newAmount,
            currency: originalPnr.currency,
            bookingClass: originalPnr.bookingClass,
            agentId: originalPnr.agentId,
            agencyCode: originalPnr.agencyCode,
            corporateAccount: originalPnr.corporateAccount,
            timeLimit: originalPnr.timeLimit,
            isGroup: passengerCount > 1,
            groupSize: passengerCount,
            source: originalPnr.source,
            parentPnrId: originalPnr.id,
            linkedPnrs: JSON.stringify([pnrNumber]),
            marriedSegmentKey: marriedSegmentKey,
            passengers: {
              createMany: {
                data: originalPnr.passengers
                  .filter(p => passengerIds.includes(p.id))
                  .map(p => ({
                    title: p.title,
                    firstName: p.firstName,
                    lastName: p.lastName,
                    dateOfBirth: p.dateOfBirth,
                    passportNumber: p.passportNumber,
                    passportExpiry: p.passportExpiry,
                    nationality: p.nationality,
                    frequentFlyerNumber: p.frequentFlyerNumber,
                    frequentFlyerProgram: p.frequentFlyerProgram,
                    seatPreferences: p.seatPreferences,
                    mealPreference: p.mealPreference,
                    customerId: p.customerId
                  }))
              }
            },
            segments: {
              createMany: {
                data: originalPnr.segments.map(s => ({
                  flightNumber: s.flightNumber,
                  airlineCode: s.airlineCode,
                  origin: s.origin,
                  destination: s.destination,
                  departureDate: s.departureDate,
                  departureTime: s.departureTime,
                  arrivalDate: s.arrivalDate,
                  arrivalTime: s.arrivalTime,
                  aircraftType: s.aircraftType,
                  fareClass: s.fareClass,
                  fareBasis: s.fareBasis,
                  status: s.status,
                  boardingClass: s.boardingClass,
                  cabinClass: s.cabinClass,
                  segmentSequence: s.segmentSequence
                }))
              }
            },
            remarks: {
              createMany: {
                data: originalPnr.remarks.map(r => ({
                  remark: `Split from PNR ${pnrNumber}: ${r.remark}`,
                  category: r.category,
                  createdBy: r.createdBy
                }))
              }
            }
          },
          include: {
            passengers: true,
            segments: true
          }
        });

        newPnrs.push(newPnr);
        splitPassengers[newPnrNumber] = passengerIds;
      }

      // Update original PNR to mark it as split
      await db.pNR.update({
        where: { id: originalPnr.id },
        data: {
          status: 'cancelled',
          linkedPnrs: JSON.stringify(newPnrs.map(p => p.pnrNumber))
        }
      });

      // Copy SSRs to appropriate new PNRs
      for (const ssr of originalPnr.ssrs) {
        const passengerInPnr = newPnrs.find(pnr =>
          pnr.passengers.some(p => p.id === ssr.passengerId)
        );

        if (passengerInPnr) {
          await db.sSR.create({
            data: {
              pnrId: passengerInPnr.id,
              passengerId: ssr.passengerId,
              ssrCode: ssr.ssrCode,
              ssrType: ssr.ssrType,
              status: ssr.status,
              confirmedAt: ssr.confirmedAt
            }
          });
        }
      }

      return {
        success: true,
        message: `Successfully split PNR ${pnrNumber} into ${newPnrs.length} new PNRs`,
        originalPnr,
        newPnrs,
        splitPassengers
      };

    } catch (error) {
      console.error('Error splitting PNR:', error);
      return {
        success: false,
        message: `Error splitting PNR: ${error instanceof Error ? error.message : 'Unknown error'}`,
        originalPnr: null as any,
        newPnrs: [],
        splitPassengers: {}
      };
    }
  }

  // ============================================
  // PNR MERGE
  // ============================================

  /**
   * Merge multiple PNRs into a single PNR
   *
   * @param pnrNumbers - Array of PNR numbers to merge
   * @returns MergePNRsResult with details of the merge operation
   *
   * @example
   * ```typescript
   * const result = await pnrEngine.mergePNRs(['ABC123', 'DEF456']);
   * ```
   */
  async mergePNRs(pnrNumbers: string[]): Promise<MergePNRsResult> {
    try {
      // Validate input
      if (!pnrNumbers || pnrNumbers.length < 2) {
        return {
          success: false,
          message: 'At least 2 PNRs are required for merge',
          mergedPnr: null as any,
          originalPnrs: [],
          mergedPassengers: [],
          mergedSegments: []
        };
      }

      // Fetch all PNRs
      const pnrs = await db.pNR.findMany({
        where: {
          pnrNumber: { in: pnrNumbers }
        },
        include: {
          passengers: true,
          segments: true,
          tickets: true,
          emds: true,
          remarks: true,
          ssrs: true
        }
      });

      if (pnrs.length !== pnrNumbers.length) {
        return {
          success: false,
          message: 'One or more PNRs not found',
          mergedPnr: null as any,
          originalPnrs: [],
          mergedPassengers: [],
          mergedSegments: []
        };
      }

      // Check if all PNRs can be merged
      const invalidPnrs: string[] = [];
      for (const pnr of pnrs) {
        if (pnr.status === 'cancelled' || pnr.status === 'void') {
          invalidPnrs.push(pnr.pnrNumber);
        }
        if (pnr.status === 'ticketed') {
          invalidPnrs.push(pnr.pnrNumber);
        }
      }

      if (invalidPnrs.length > 0) {
        return {
          success: false,
          message: `Cannot merge the following PNRs: ${invalidPnrs.join(', ')}. PNRs must not be cancelled or ticketed.`,
          mergedPnr: null as any,
          originalPnrs: pnrs,
          mergedPassengers: [],
          mergedSegments: []
        };
      }

      // Validate that all PNRs have compatible segments
      // All PNRs must have the same flights and dates
      const firstPnrSegments = pnrs[0].segments;
      for (let i = 1; i < pnrs.length; i++) {
        if (!this.areSegmentsCompatible(firstPnrSegments, pnrs[i].segments)) {
          return {
            success: false,
            message: `PNR ${pnrs[i].pnrNumber} has incompatible segments with PNR ${pnrs[0].pnrNumber}`,
            mergedPnr: null as any,
            originalPnrs: pnrs,
            mergedPassengers: [],
            mergedSegments: []
          };
        }
      }

      // Generate new PNR number
      const newPnrNumber = await this.generatePNRNumber();

      // Calculate merged amount
      const totalAmount = pnrs.reduce((sum, pnr) => sum + pnr.amount, 0);
      const totalPassengers = pnrs.reduce((sum, pnr) => sum + pnr.passengers.length, 0);

      // Use the first PNR's contact info
      const primaryPnr = pnrs[0];

      // Create merged PNR
      const mergedPnr = await db.pNR.create({
        data: {
          pnrNumber: newPnrNumber,
          createdBy: primaryPnr.createdBy,
          status: primaryPnr.status,
          contactEmail: primaryPnr.contactEmail,
          contactPhone: primaryPnr.contactPhone,
          contactAddress: primaryPnr.contactAddress,
          paymentMethod: primaryPnr.paymentMethod,
          cardLastFour: primaryPnr.cardLastFour,
          amount: totalAmount,
          currency: primaryPnr.currency,
          bookingClass: primaryPnr.bookingClass,
          agentId: primaryPnr.agentId,
          agencyCode: primaryPnr.agencyCode,
          corporateAccount: primaryPnr.corporateAccount,
          timeLimit: this.getEarliestTimeLimit(pnrs),
          isGroup: totalPassengers > 1,
          groupSize: totalPassengers,
          source: primaryPnr.source,
          linkedPnrs: JSON.stringify(pnrNumbers),
          marriedSegmentKey: primaryPnr.marriedSegmentKey,
          passengers: {
            createMany: {
              data: pnrs.flatMap(pnr =>
                pnr.passengers.map(p => ({
                  title: p.title,
                  firstName: p.firstName,
                  lastName: p.lastName,
                  dateOfBirth: p.dateOfBirth,
                  passportNumber: p.passportNumber,
                  passportExpiry: p.passportExpiry,
                  nationality: p.nationality,
                  frequentFlyerNumber: p.frequentFlyerNumber,
                  frequentFlyerProgram: p.frequentFlyerProgram,
                  seatPreferences: p.seatPreferences,
                  mealPreference: p.mealPreference,
                  customerId: p.customerId
                }))
              )
            }
          },
          segments: {
            createMany: {
              data: firstPnrSegments.map(s => ({
                flightNumber: s.flightNumber,
                airlineCode: s.airlineCode,
                origin: s.origin,
                destination: s.destination,
                departureDate: s.departureDate,
                departureTime: s.departureTime,
                arrivalDate: s.arrivalDate,
                arrivalTime: s.arrivalTime,
                aircraftType: s.aircraftType,
                fareClass: s.fareClass,
                fareBasis: s.fareBasis,
                status: s.status,
                boardingClass: s.boardingClass,
                cabinClass: s.cabinClass,
                segmentSequence: s.segmentSequence
              }))
            }
          },
          remarks: {
            createMany: {
              data: pnrs.flatMap(pnr =>
                pnr.remarks.map(r => ({
                  remark: `Merged from PNR ${pnr.pnrNumber}: ${r.remark}`,
                  category: r.category,
                  createdBy: r.createdBy
                }))
              )
            }
          }
        },
        include: {
          passengers: true,
          segments: true
        }
      });

      // Merge SSRs
      for (const pnr of pnrs) {
        const passengerMap = new Map(
          pnr.passengers.map(p => [p.id, p.firstName + ' ' + p.lastName])
        );

        for (const ssr of pnr.ssrs) {
          const passengerName = passengerMap.get(ssr.passengerId);
          const matchingPassenger = mergedPnr.passengers.find(
            p => (p.firstName + ' ' + p.lastName) === passengerName
          );

          if (matchingPassenger) {
            await db.sSR.create({
              data: {
                pnrId: mergedPnr.id,
                passengerId: matchingPassenger.id,
                ssrCode: ssr.ssrCode,
                ssrType: ssr.ssrType,
                status: ssr.status,
                confirmedAt: ssr.confirmedAt
              }
            });
          }
        }
      }

      // Cancel original PNRs
      for (const pnr of pnrs) {
        await db.pNR.update({
          where: { id: pnr.id },
          data: { status: 'cancelled' }
        });
      }

      return {
        success: true,
        message: `Successfully merged ${pnrs.length} PNRs into ${newPnrNumber}`,
        mergedPnr,
        originalPnrs: pnrs,
        mergedPassengers: mergedPnr.passengers,
        mergedSegments: mergedPnr.segments
      };

    } catch (error) {
      console.error('Error merging PNRs:', error);
      return {
        success: false,
        message: `Error merging PNRs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        mergedPnr: null as any,
        originalPnrs: [],
        mergedPassengers: [],
        mergedSegments: []
      };
    }
  }

  // ============================================
  // FARE RE-QUOTE
  // ============================================

  /**
   * Re-calculate fare based on PNR changes
   *
   * @param pnrNumber - The PNR number to re-quote
   * @param changes - Changes to be applied
   * @returns FareCalculation with new fare details
   *
   * @example
   * ```typescript
   * const result = await pnrEngine.requoteFare('ABC123', {
   *   modifiedSegments: [{ segmentId: 'seg-1', newClass: 'business' }]
   * });
   * ```
   */
  async requoteFare(
    pnrNumber: string,
    changes: PNRChanges
  ): Promise<FareCalculation> {
    try {
      // Fetch PNR with segments
      const pnr = await db.pNR.findUnique({
        where: { pnrNumber },
        include: { segments: true }
      });

      if (!pnr) {
        throw new Error(`PNR ${pnrNumber} not found`);
      }

      // Get fare class information
      const fareClasses = await db.fareClass.findMany({
        where: { isActive: true }
      });

      const fareBreakdown: FareBreakdownItem[] = [];
      let totalBaseFare = 0;
      let totalTaxes = 0;
      let totalFees = 0;

      // Process existing segments with modifications
      for (const segment of pnr.segments) {
        let fareClass = segment.fareClass;
        let fareBasis = segment.fareBasis;

        // Check if this segment is being modified
        if (changes.modifiedSegments) {
          const modification = changes.modifiedSegments.find(m => m.segmentId === segment.id);
          if (modification) {
            if (modification.newClass) fareClass = modification.newClass;
          }
        }

        // Get fare class details
        const fareClassInfo = fareClasses.find(fc => fc.code === fareClass);
        const baseFare = fareClassInfo?.baseFare || 100;

        // Calculate taxes (simplified calculation)
        const taxes = baseFare * 0.15; // 15% tax

        // Calculate fees
        const fees = this.calculateChangeFees(pnr, segment, changes);

        totalBaseFare += baseFare;
        totalTaxes += taxes;
        totalFees += fees;

        fareBreakdown.push({
          segmentId: segment.id,
          flightNumber: segment.flightNumber,
          route: `${segment.origin}-${segment.destination}`,
          fareClass: fareClass,
          fareBasis: fareBasis,
          baseFare,
          taxes,
          fees,
          subtotal: baseFare + taxes + fees
        });
      }

      // Process added segments
      if (changes.addedSegments) {
        for (const newSegment of changes.addedSegments) {
          const fareClassInfo = fareClasses.find(fc => fc.code === newSegment.fareClass);
          const baseFare = fareClassInfo?.baseFare || 100;
          const taxes = baseFare * 0.15;
          const fees = 25; // New segment fee

          totalBaseFare += baseFare;
          totalTaxes += taxes;
          totalFees += fees;

          fareBreakdown.push({
            segmentId: 'new-segment-' + Date.now(),
            flightNumber: newSegment.flightNumber,
            route: `${newSegment.origin}-${newSegment.destination}`,
            fareClass: newSegment.fareClass,
            fareBasis: newSegment.fareBasis,
            baseFare,
            taxes,
            fees,
            subtotal: baseFare + taxes + fees
          });
        }
      }

      // Calculate fare difference
      const originalTotal = pnr.amount;
      const newTotal = totalBaseFare + totalTaxes + totalFees;
      const fareDifference = newTotal - originalTotal;

      // Add fare difference to breakdown if applicable
      if (fareDifference !== 0) {
        fareBreakdown.push({
          segmentId: 'fare-difference',
          flightNumber: 'N/A',
          route: 'Fare Adjustment',
          fareClass: 'N/A',
          fareBasis: 'N/A',
          baseFare: fareDifference > 0 ? fareDifference : 0,
          taxes: 0,
          fees: 0,
          subtotal: fareDifference
        });
      }

      return {
        baseFare: totalBaseFare,
        taxes: totalTaxes,
        fees: totalFees,
        totalFare: totalBaseFare + totalTaxes + totalFees,
        currency: pnr.currency,
        fareBreakdown
      };

    } catch (error) {
      console.error('Error re-quoting fare:', error);
      throw new Error(`Fare re-quote failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // TIME LIMIT & AUTO-CANCEL
  // ============================================

  /**
   * Check time limits and auto-cancel expired unpaid PNRs
   * This should be run periodically (e.g., via cron job)
   *
   * @returns Number of PNRs cancelled
   *
   * @example
   * ```typescript
   * const cancelledCount = await pnrEngine.checkTimeLimitsAndAutoCancel();
   * console.log(`Cancelled ${cancelledCount} expired PNRs`);
   * ```
   */
  async checkTimeLimitsAndAutoCancel(): Promise<number> {
    try {
      const now = new Date();

      // Find all PNRs with expired time limits
      const expiredPnrs = await db.pNR.findMany({
        where: {
          status: 'confirmed',
          timeLimit: {
            lte: now
          }
        },
        include: {
          tickets: true
        }
      });

      let cancelledCount = 0;

      for (const pnr of expiredPnrs) {
        // Check if tickets have been issued
        const hasTickets = pnr.tickets.length > 0;

        if (!hasTickets) {
          // Cancel the PNR
          await db.pNR.update({
            where: { id: pnr.id },
            data: {
              status: 'cancelled'
            }
          });

          // Add a remark
          await db.pNRRemark.create({
            data: {
              pnrId: pnr.id,
              remark: `Auto-cancelled: Time limit expired on ${pnr.timeLimit?.toISOString()}`,
              category: 'AUTO_CANCEL',
              createdBy: 'SYSTEM'
            }
          });

          cancelledCount++;
        }
      }

      return cancelledCount;

    } catch (error) {
      console.error('Error checking time limits:', error);
      throw new Error(`Time limit check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // QUEUE MANAGEMENT
  // ============================================

  /**
   * Assign queue position to a PNR based on priority
   *
   * @param pnrNumber - The PNR number
   * @param priority - Queue priority (1 = highest, 10 = lowest)
   * @returns QueuePositionResult with assigned position
   *
   * @example
   * ```typescript
   * const result = await pnrEngine.assignQueuePosition('ABC123', 1);
   * ```
   */
  async assignQueuePosition(
    pnrNumber: string,
    priority: number = 5
  ): Promise<QueuePositionResult> {
    try {
      // Validate priority
      if (priority < 1 || priority > 10) {
        return {
          success: false,
          message: 'Priority must be between 1 (highest) and 10 (lowest)'
        };
      }

      // Fetch PNR
      const pnr = await db.pNR.findUnique({
        where: { pnrNumber }
      });

      if (!pnr) {
        return {
          success: false,
          message: `PNR ${pnrNumber} not found`
        };
      }

      // Get current max queue position for this priority level
      const maxPositionPnr = await db.pNR.findFirst({
        where: {
          queuePriority: priority,
          status: 'waitlist'
        },
        orderBy: {
          queuePosition: 'desc'
        }
      });

      const newPosition = (maxPositionPnr?.queuePosition ?? 0) + 1;

      // Update PNR with queue position
      await db.pNR.update({
        where: { id: pnr.id },
        data: {
          status: 'waitlist',
          queuePosition: newPosition,
          queuePriority: priority
        }
      });

      return {
        success: true,
        queuePosition: newPosition,
        queuePriority: priority,
        message: `PNR ${pnrNumber} assigned to queue position ${newPosition} with priority ${priority}`
      };

    } catch (error) {
      console.error('Error assigning queue position:', error);
      return {
        success: false,
        message: `Queue assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get current queue status for a flight
   *
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns Array of queued PNRs ordered by priority and position
   */
  async getQueueStatus(
    flightNumber: string,
    date: string
  ): Promise<PNR[]> {
    try {
      const queuedPnrs = await db.pNR.findMany({
        where: {
          status: 'waitlist',
          segments: {
            some: {
              flightNumber,
              departureDate: date
            }
          }
        },
        include: {
          passengers: true,
          segments: true
        },
        orderBy: [
          { queuePriority: 'asc' },
          { queuePosition: 'asc' }
        ]
      });

      return queuedPnrs;

    } catch (error) {
      console.error('Error getting queue status:', error);
      throw new Error(`Queue status retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // WAITLIST PROCESSING
  // ============================================

  /**
   * Process waitlist and auto-promote PNRs when space becomes available
   * This should be run when inventory is released
   *
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns WaitlistPromotionResult with promotion details
   *
   * @example
   * ```typescript
   * const result = await pnrEngine.processWaitlist('AA123', '2024-12-10');
   * ```
   */
  async processWaitlist(
    flightNumber: string,
    date: string
  ): Promise<WaitlistPromotionResult> {
    try {
      // Get all waitlisted PNRs for this flight
      const waitlistedPnrs = await this.getQueueStatus(flightNumber, date);

      const promotedPnrs: string[] = [];
      const promotionDetails: WaitlistPromotionResult['promotionDetails'] = [];

      // Process each PNR in queue order
      for (const pnr of waitlistedPnrs) {
        // Check if there's availability for this PNR
        const segments = pnr.segments.filter(
          s => s.flightNumber === flightNumber && s.departureDate === date
        );

        let canPromote = true;

        for (const segment of segments) {
          // Import availability engine dynamically to avoid circular dependency
          const { AvailabilityEngine } = await import('./availability-engine');
          const availabilityEngine = AvailabilityEngine.getInstance();

          const availability = await availabilityEngine.checkRealTimeAvailability(
            `${segment.origin}-${segment.destination}`,
            segment.departureDate,
            segment.fareClass,
            pnr.passengers.length
          );

          if (!availability.available || availability.availableSeats < pnr.passengers.length) {
            canPromote = false;
            break;
          }
        }

        if (canPromote) {
          // Promote the PNR to confirmed
          await db.pNR.update({
            where: { id: pnr.id },
            data: {
              status: 'confirmed',
              queuePosition: null,
              queuePriority: null
            }
          });

          // Update segment statuses
          for (const segment of segments) {
            await db.flightSegment.update({
              where: { id: segment.id },
              data: { status: 'confirmed' }
            });
          }

          // Add remark
          await db.pNRRemark.create({
            data: {
              pnrId: pnr.id,
              remark: `Auto-promoted from waitlist on ${new Date().toISOString()}`,
              category: 'WAITLIST_PROMOTION',
              createdBy: 'SYSTEM'
            }
          });

          promotedPnrs.push(pnr.pnrNumber);
          promotionDetails.push({
            pnrNumber: pnr.pnrNumber,
            promotedTo: 'confirmed',
            flightNumber,
            date
          });
        }
      }

      // Get remaining waitlisted PNRs
      const remainingPnrs = await this.getQueueStatus(flightNumber, date);

      return {
        promotedPnrs,
        remainingWaitlisted: remainingPnrs.map(p => p.pnrNumber),
        promotionDetails
      };

    } catch (error) {
      console.error('Error processing waitlist:', error);
      throw new Error(`Waitlist processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // MARRIED SEGMENT LOGIC
  // ============================================

  /**
   * Validate married segment logic for a set of segments
   * Married segments must be booked together to get the married fare
   *
   * @param segments - Array of flight segments to validate
   * @returns MarriedSegmentValidation with validation result
   *
   * @example
   * ```typescript
   * const result = await pnrEngine.checkMarriedSegments(segments);
   * if (!result.isValid) {
   *   console.error('Married segment validation failed:', result.errors);
   * }
   * ```
   */
  async checkMarriedSegments(
    segments: FlightSegment[]
  ): Promise<MarriedSegmentValidation> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Must have at least 2 segments for married segment logic
      if (segments.length < 2) {
        return {
          isValid: true,
          segments,
          warnings: ['Single segment - married segment logic not applicable']
        };
      }

      // Sort segments by sequence
      const sortedSegments = [...segments].sort((a, b) => a.segmentSequence - b.segmentSequence);

      // Check connectivity: destination of segment N should match origin of segment N+1
      for (let i = 0; i < sortedSegments.length - 1; i++) {
        const current = sortedSegments[i];
        const next = sortedSegments[i + 1];

        if (current.destination !== next.origin) {
          errors.push(
            `Segments are not connected: Segment ${i + 1} ends at ${current.destination} but segment ${i + 2} starts at ${next.origin}`
          );
        }
      }

      // Check same booking class across all segments (required for married segments)
      const uniqueClasses = new Set(sortedSegments.map(s => s.fareClass));
      if (uniqueClasses.size > 1) {
        warnings.push(
          `Multiple booking classes in married segments: ${Array.from(uniqueClasses).join(', ')}`
        );
      }

      // Check same cabin class across all segments
      const uniqueCabins = new Set(sortedSegments.map(s => s.cabinClass));
      if (uniqueCabins.size > 1) {
        errors.push(
          `Multiple cabin classes in married segments: ${Array.from(uniqueCabins).join(', ')}`
        );
      }

      // Check same airline (married segments typically require same carrier)
      const uniqueAirlines = new Set(sortedSegments.map(s => s.airlineCode));
      if (uniqueAirlines.size > 1) {
        warnings.push(
          `Multiple airlines in married segments: ${Array.from(uniqueAirlines).join(', ')}`
        );
      }

      // Check minimum connection time
      for (let i = 0; i < sortedSegments.length - 1; i++) {
        const current = sortedSegments[i];
        const next = sortedSegments[i + 1];

        const arrivalDateTime = new Date(`${current.arrivalDate}T${current.arrivalTime}`);
        const departureDateTime = new Date(`${next.departureDate}T${next.departureTime}`);
        const connectionTime = (departureDateTime.getTime() - arrivalDateTime.getTime()) / (1000 * 60); // minutes

        const minConnectionTime = this.getMinimumConnectionTime(current.airportType, next.airportType);
        if (connectionTime < minConnectionTime) {
          errors.push(
            `Insufficient connection time between segments ${i + 1} and ${i + 2}: ${connectionTime} minutes (minimum: ${minConnectionTime})`
          );
        }
      }

      // Generate married segment key
      const marriedSegmentKey = this.generateMarriedSegmentKey(segments);

      // Check if this married segment combination exists in route inventory
      const firstSegment = sortedSegments[0];
      const lastSegment = sortedSegments[sortedSegments.length - 1];
      const route = `${firstSegment.origin}-${lastSegment.destination}`;

      const routeInventory = await db.routeInventory.findFirst({
        where: {
          route,
          date: firstSegment.departureDate
        }
      });

      if (routeInventory) {
        const marriedSegments = JSON.parse(routeInventory.marriedSegments || '[]');
        const isMarried = marriedSegments.some(
          (ms: any) => ms.key === marriedSegmentKey
        );

        if (!isMarried) {
          warnings.push(`Married segment key ${marriedSegmentKey} not found in inventory configuration`);
        }
      }

      const isValid = errors.length === 0;

      return {
        isValid,
        marriedSegmentKey: isValid ? marriedSegmentKey : undefined,
        segments: sortedSegments,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      console.error('Error checking married segments:', error);
      throw new Error(`Married segment validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate multi-city / open-jaw booking
   *
   * @param segments - Array of flight segments
   * @returns Validation result with success status and messages
   */
  async validateMultiCityBooking(
    segments: FlightSegment[]
  ): Promise<{ isValid: boolean; messages: string[]; bookingType: 'round-trip' | 'one-way' | 'multi-city' | 'open-jaw' }> {
    try {
      const messages: string[] = [];
      const sortedSegments = [...segments].sort((a, b) => a.segmentSequence - b.segmentSequence);

      if (sortedSegments.length < 2) {
        return {
          isValid: true,
          messages: ['Single segment booking'],
          bookingType: 'one-way'
        };
      }

      if (sortedSegments.length === 2) {
        const first = sortedSegments[0];
        const last = sortedSegments[1];

        // Round trip: A->B, B->A
        if (first.origin === last.destination && first.destination === last.origin) {
          return {
            isValid: true,
            messages: ['Valid round-trip booking'],
            bookingType: 'round-trip'
          };
        }

        // Open-jaw: A->B, C->A (different arrival/departure cities)
        if (first.origin === last.destination || first.destination === last.origin) {
          return {
            isValid: true,
            messages: ['Valid open-jaw booking'],
            bookingType: 'open-jaw'
          };
        }

        // Multi-city: A->B, C->D
        return {
          isValid: true,
          messages: ['Valid multi-city booking'],
          bookingType: 'multi-city'
        };
      }

      // More than 2 segments
      const first = sortedSegments[0];
      const last = sortedSegments[sortedSegments.length - 1];

      // Check if it's an open-jaw (different origin and final destination)
      if (first.origin !== last.destination) {
        // Check connectivity for middle segments
        let isContinuous = true;
        for (let i = 0; i < sortedSegments.length - 1; i++) {
          if (sortedSegments[i].destination !== sortedSegments[i + 1].origin) {
            isContinuous = false;
            break;
          }
        }

        if (isContinuous) {
          return {
            isValid: true,
            messages: ['Valid open-jaw multi-city booking'],
            bookingType: 'open-jaw'
          };
        }
      }

      return {
        isValid: true,
        messages: ['Valid multi-city booking'],
        bookingType: 'multi-city'
      };

    } catch (error) {
      console.error('Error validating multi-city booking:', error);
      throw new Error(`Multi-city validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Generate a unique PNR number
   * Format: 6 alphanumeric characters (e.g., ABC123)
   */
  private async generatePNRNumber(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnrNumber: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
      pnrNumber = Array.from({ length: 6 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('');

      const existing = await db.pNR.findUnique({
        where: { pnrNumber: pnrNumber! }
      });

      if (!existing) {
        isUnique = true;
        return pnrNumber!;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique PNR number after maximum attempts');
  }

  /**
   * Generate a married segment key for a set of segments
   */
  private generateMarriedSegmentKey(segments: FlightSegment[]): string {
    const sortedSegments = [...segments].sort((a, b) => a.segmentSequence - b.segmentSequence);
    const segmentKeys = sortedSegments.map(s =>
      `${s.flightNumber}|${s.origin}|${s.destination}|${s.departureDate}`
    );
    return segmentKeys.join('>');
  }

  /**
   * Check if two sets of segments are compatible for merging
   */
  private areSegmentsCompatible(
    segments1: FlightSegment[],
    segments2: FlightSegment[]
  ): boolean {
    if (segments1.length !== segments2.length) {
      return false;
    }

    const sorted1 = [...segments1].sort((a, b) => a.segmentSequence - b.segmentSequence);
    const sorted2 = [...segments2].sort((a, b) => a.segmentSequence - b.segmentSequence);

    for (let i = 0; i < sorted1.length; i++) {
      if (sorted1[i].flightNumber !== sorted2[i].flightNumber ||
          sorted1[i].origin !== sorted2[i].origin ||
          sorted1[i].destination !== sorted2[i].destination ||
          sorted1[i].departureDate !== sorted2[i].departureDate) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get the earliest time limit from an array of PNRs
   */
  private getEarliestTimeLimit(pnrs: PNR[]): Date | null {
    const timeLimits = pnrs
      .map(p => p.timeLimit)
      .filter((t): t is Date => t !== null);

    if (timeLimits.length === 0) {
      return null;
    }

    return new Date(Math.min(...timeLimits.map(t => t.getTime())));
  }

  /**
   * Calculate change fees for a segment
   */
  private calculateChangeFees(
    pnr: PNR,
    segment: FlightSegment,
    changes: PNRChanges
  ): number {
    let fees = 0;

    // Check if segment is being modified
    if (changes.modifiedSegments) {
      const modification = changes.modifiedSegments.find(m => m.segmentId === segment.id);
      if (modification) {
        // Add change fee based on fare rules
        fees += 50; // Base change fee

        // Additional fee for class upgrade
        if (modification.newClass) {
          const classHierarchy: Record<string, number> = {
            'economy': 1,
            'business': 2,
            'first': 3
          };

          const currentLevel = classHierarchy[segment.fareClass.toLowerCase()] || 1;
          const newLevel = classHierarchy[modification.newClass.toLowerCase()] || 1;

          if (newLevel > currentLevel) {
            fees += (newLevel - currentLevel) * 100; // Upgrade fee
          }
        }
      }
    }

    return fees;
  }

  /**
   * Get minimum connection time based on airport types
   */
  private getMinimumConnectionTime(fromAirportType: string, toAirportType: string): number {
    // Simplified - in production, this would query airport data
    const domesticDomestic = 45; // minutes
    const domesticInternational = 90;
    const internationalInternational = 120;

    if (fromAirportType === 'domestic' && toAirportType === 'domestic') {
      return domesticDomestic;
    } else if (fromAirportType === 'international' || toAirportType === 'international') {
      return internationalInternational;
    }
    return domesticInternational;
  }

  /**
   * Get PNR details with all related data
   */
  async getPNRDetails(pnrNumber: string): Promise<PNR & {
    passengers: Passenger[];
    segments: FlightSegment[];
  } | null> {
    try {
      const pnr = await db.pNR.findUnique({
        where: { pnrNumber },
        include: {
          passengers: true,
          segments: {
            orderBy: { segmentSequence: 'asc' }
          },
          tickets: true,
          emds: true,
          remarks: true,
          ssrs: true
        }
      });

      return pnr;

    } catch (error) {
      console.error('Error getting PNR details:', error);
      throw new Error(`Failed to get PNR details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update PNR status
   */
  async updatePNRStatus(
    pnrNumber: string,
    status: PNRStatus,
    remark?: string
  ): Promise<PNR> {
    try {
      const pnr = await db.pNR.findUnique({
        where: { pnrNumber }
      });

      if (!pnr) {
        throw new Error(`PNR ${pnrNumber} not found`);
      }

      const updatedPnr = await db.pNR.update({
        where: { id: pnr.id },
        data: { status }
      });

      if (remark) {
        await db.pNRRemark.create({
          data: {
            pnrId: pnr.id,
            remark,
            category: 'STATUS_CHANGE',
            createdBy: 'SYSTEM'
          }
        });
      }

      return updatedPnr;

    } catch (error) {
      console.error('Error updating PNR status:', error);
      throw new Error(`Failed to update PNR status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add airportType to FlightSegment type temporarily for this class
  private airportType: string = 'domestic';
}

// Extend FlightSegment interface for married segment checking
declare module '@prisma/client' {
  interface FlightSegment {
    airportType?: string;
  }
}

// Export singleton instance
export const pnrEngine = PNREngine.getInstance();
