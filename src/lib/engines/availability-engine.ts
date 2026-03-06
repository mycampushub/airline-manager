/**
 * Availability Engine
 * Core business logic for real-time availability management in the Airline Manager System
 *
 * This engine handles all availability-related operations including:
 * - Real-time availability checking for routes
 * - O&D (Origin-Destination) availability calculation
 * - Married segment availability
 * - Fare class availability management
 * - Dynamic capacity adjustment
 * - Agent blocked inventory support
 */

import { db } from '@/lib/db';
import type { RouteInventory, FareClass } from '@prisma/client';

// ============================================
// Type Definitions
// ============================================

/**
 * Result of a real-time availability check
 */
export interface AvailabilityResult {
  available: boolean;
  availableSeats: number;
  waitlistedSeats: number;
  blockedSeats: number;
  totalCapacity: number;
  fareClasses: FareClassAvailability[];
  currency: string;
  message?: string;
}

/**
 * Availability information for a specific fare class
 */
export interface FareClassAvailability {
  code: string;
  name: string;
  availableSeats: number;
  baseFare: number;
  cabin: string;
  bookingClass: string;
}

/**
 * Result of O&D (Origin-Destination) availability calculation
 */
export interface ODAvailabilityResult {
  origin: string;
  destination: string;
  date: string;
  available: boolean;
  routes: RouteOption[];
  bestPrice?: number;
  currency?: string;
}

/**
 * Available route option for O&D
 */
export interface RouteOption {
  route: string;
  flightNumber: string;
  airlineCode: string;
  departureTime: string;
  arrivalTime: string;
  stops: number;
  duration: number; // minutes
  availableSeats: number;
  fareClasses: FareClassAvailability[];
  isMarriedSegment: boolean;
  marriedSegmentKey?: string;
}

/**
 * Result of married segment availability check
 */
export interface MarriedSegmentAvailabilityResult {
  available: boolean;
  segments: SegmentAvailability[];
  totalSeats: number;
  marriedSegmentKey: string;
  fareClass: string;
  restrictions?: string[];
}

/**
 * Availability for a single segment
 */
export interface SegmentAvailability {
  flightNumber: string;
  origin: string;
  destination: string;
  date: string;
  availableSeats: number;
  waitlistedSeats: number;
  blockedSeats: number;
  fareClass: string;
}

/**
 * Result of updating fare class inventory
 */
export interface InventoryUpdateResult {
  success: boolean;
  previousSold: number;
  newSold: number;
  capacity: number;
  remaining: number;
  message: string;
}

/**
 * Result of blocking inventory for an agent
 */
export interface AgentBlockResult {
  success: boolean;
  blockId: string;
  seatsBlocked: number;
  expiresAt: Date;
  message: string;
}

/**
 * Dynamic capacity adjustment result
 */
export interface CapacityAdjustmentResult {
  success: boolean;
  previousCapacity: Record<string, number>;
  newCapacity: Record<string, number>;
  adjustmentReason: string;
  message: string;
}

/**
 * Agent blocked inventory record
 */
export interface AgentBlockedInventory {
  id: string;
  agentId: string;
  flightNumber: string;
  date: string;
  route: string;
  seatsBlocked: number;
  fareClass: string;
  blockedAt: Date;
  expiresAt: Date;
}

// ============================================
// Availability Engine Class
// ============================================

export class AvailabilityEngine {
  private static instance: AvailabilityEngine;
  private blockedInventoryCache: Map<string, AgentBlockedInventory[]> = new Map();

  private constructor() {}

  /**
   * Get singleton instance of AvailabilityEngine
   */
  public static getInstance(): AvailabilityEngine {
    if (!AvailabilityEngine.instance) {
      AvailabilityEngine.instance = new AvailabilityEngine();
    }
    return AvailabilityEngine.instance;
  }

  // ============================================
  // REAL-TIME AVAILABILITY CHECKING
  // ============================================

  /**
   * Check real-time availability for a route on a specific date
   *
   * @param route - The route in format "ORIG-DEST" (e.g., "JFK-LHR")
   * @param date - The departure date in YYYY-MM-DD format
   * @param fareClass - The fare class to check (optional)
   * @param passengers - Number of passengers (default: 1)
   * @returns AvailabilityResult with detailed availability information
   *
   * @example
   * ```typescript
   * const availability = await availabilityEngine.checkRealTimeAvailability(
   *   'JFK-LHR',
   *   '2024-12-10',
   *   'Y',
   *   2
   * );
   * if (availability.available) {
   *   console.log(`${availability.availableSeats} seats available`);
   * }
   * ```
   */
  async checkRealTimeAvailability(
    route: string,
    date: string,
    fareClass?: string,
    passengers: number = 1
  ): Promise<AvailabilityResult> {
    try {
      // Parse route
      const [origin, destination] = route.split('-');
      if (!origin || !destination) {
        throw new Error('Invalid route format. Use "ORIG-DEST" format.');
      }

      // Get route inventory
      const inventory = await db.routeInventory.findFirst({
        where: {
          route,
          date
        }
      });

      if (!inventory) {
        return {
          available: false,
          availableSeats: 0,
          waitlistedSeats: 0,
          blockedSeats: 0,
          totalCapacity: 0,
          fareClasses: [],
          currency: 'USD',
          message: `No inventory found for route ${route} on ${date}`
        };
      }

      // Parse capacity, sold, waitlist, and blocked data
      const capacity = JSON.parse(inventory.capacity || '{}');
      const sold = JSON.parse(inventory.sold || '{}');
      const waitlist = JSON.parse(inventory.waitlist || '{}');
      const blocked = JSON.parse(inventory.blocked || '{}');

      // Get all fare classes
      const fareClasses = await db.fareClass.findMany({
        where: { isActive: true },
        orderBy: [{ baseFare: 'asc' }]
      });

      // Calculate availability for each fare class
      const fareClassAvailability: FareClassAvailability[] = [];
      let totalAvailable = 0;
      let totalWaitlisted = 0;
      let totalBlocked = 0;
      let totalCapacity = 0;

      for (const fc of fareClasses) {
        const classCapacity = capacity[fc.code] || 0;
        const classSold = sold[fc.code] || 0;
        const classWaitlist = waitlist[fc.code] || 0;
        const classBlocked = blocked[fc.code] || 0;

        const available = classCapacity - classSold - classBlocked;
        const availableSeats = Math.max(0, available);

        fareClassAvailability.push({
          code: fc.code,
          name: fc.name,
          availableSeats,
          baseFare: fc.baseFare,
          cabin: fc.cabin,
          bookingClass: fc.bookingClass
        });

        totalAvailable += availableSeats;
        totalWaitlisted += classWaitlist;
        totalBlocked += classBlocked;
        totalCapacity += classCapacity;
      }

      // If specific fare class requested, filter availability
      if (fareClass) {
        const specificClass = fareClassAvailability.find(fc => fc.code === fareClass);
        if (specificClass) {
          const isAvailable = specificClass.availableSeats >= passengers;

          return {
            available: isAvailable,
            availableSeats: specificClass.availableSeats,
            waitlistedSeats: waitlist[fareClass] || 0,
            blockedSeats: blocked[fareClass] || 0,
            totalCapacity: capacity[fareClass] || 0,
            fareClasses: [specificClass],
            currency: 'USD',
            message: isAvailable
              ? `${specificClass.availableSeats} seats available in class ${fareClass}`
              : `Insufficient seats in class ${fareClass}. Available: ${specificClass.availableSeats}, Requested: ${passengers}`
          };
        }

        return {
          available: false,
          availableSeats: 0,
          waitlistedSeats: 0,
          blockedSeats: 0,
          totalCapacity: 0,
          fareClasses: [],
          currency: 'USD',
          message: `Fare class ${fareClass} not found for this route`
        };
      }

      // Check if any class has enough seats
      const hasAvailability = totalAvailable >= passengers;

      return {
        available: hasAvailability,
        availableSeats: totalAvailable,
        waitlistedSeats: totalWaitlisted,
        blockedSeats: totalBlocked,
        totalCapacity,
        fareClasses: fareClassAvailability,
        currency: 'USD',
        message: hasAvailability
          ? `${totalAvailable} seats available across all fare classes`
          : `Insufficient seats. Available: ${totalAvailable}, Requested: ${passengers}`
      };

    } catch (error) {
      console.error('Error checking real-time availability:', error);
      throw new Error(`Availability check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // O&D (ORIGIN-DESTINATION) AVAILABILITY
  // ============================================

  /**
   * Calculate O&D availability including connecting flights
   *
   * @param origin - Origin airport code (e.g., "JFK")
   * @param destination - Destination airport code (e.g., "LHR")
   * @param date - Travel date in YYYY-MM-DD format
   * @param maxStops - Maximum number of stops (default: 2)
   * @returns ODAvailabilityResult with all available route options
   *
   * @example
   * ```typescript
   * const odAvailability = await availabilityEngine.calculateODAvailability(
   *   'JFK',
   *   'LHR',
   *   '2024-12-10'
   * );
   * console.log(`Found ${odAvailability.routes.length} route options`);
   * ```
   */
  async calculateODAvailability(
    origin: string,
    destination: string,
    date: string,
    maxStops: number = 2
  ): Promise<ODAvailabilityResult> {
    try {
      // First, check for direct flights
      const directRoute = `${origin}-${destination}`;
      const directInventory = await db.routeInventory.findFirst({
        where: {
          route: directRoute,
          date
        }
      });

      const routes: RouteOption[] = [];

      // Process direct flights
      if (directInventory) {
        const availability = await this.checkRealTimeAvailability(directRoute, date);
        const fareClasses = availability.fareClasses;

        routes.push({
          route: directRoute,
          flightNumber: directInventory.flightNumber,
          airlineCode: directInventory.flightNumber.substring(0, 2),
          departureTime: 'TBD', // Would come from schedule
          arrivalTime: 'TBD', // Would come from schedule
          stops: 0,
          duration: 0, // Would calculate from schedule
          availableSeats: availability.availableSeats,
          fareClasses,
          isMarriedSegment: false
        });
      }

      // Find connecting flights if allowed
      if (maxStops > 0) {
        const connectingRoutes = await this.findConnectingRoutes(
          origin,
          destination,
          date,
          maxStops
        );

        routes.push(...connectingRoutes);
      }

      // Sort by available seats (descending) then price
      routes.sort((a, b) => {
        if (a.stops !== b.stops) {
          return a.stops - b.stops; // Fewer stops first
        }
        const aMinPrice = Math.min(...a.fareClasses.map(fc => fc.baseFare));
        const bMinPrice = Math.min(...b.fareClasses.map(fc => fc.baseFare));
        return aMinPrice - bMinPrice; // Lower price first
      });

      // Find best price
      let bestPrice: number | undefined;
      if (routes.length > 0) {
        const allFares = routes.flatMap(r => r.fareClasses.map(fc => fc.baseFare));
        bestPrice = Math.min(...allFares);
      }

      return {
        origin,
        destination,
        date,
        available: routes.length > 0,
        routes,
        bestPrice,
        currency: 'USD'
      };

    } catch (error) {
      console.error('Error calculating O&D availability:', error);
      throw new Error(`O&D availability calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find connecting routes between origin and destination
   */
  private async findConnectingRoutes(
    origin: string,
    destination: string,
    date: string,
    maxStops: number
  ): Promise<RouteOption[]> {
    const connectingRoutes: RouteOption[] = [];

    if (maxStops < 1) {
      return connectingRoutes;
    }

    // Find all routes departing from origin
    const departingRoutes = await db.routeInventory.findMany({
      where: {
        origin,
        date
      }
    });

    for (const departing of departingRoutes) {
      // Skip if this is a direct route to destination (already handled)
      if (departing.destination === destination) {
        continue;
      }

      // Find connecting flights from the intermediate city
      const connectingRoutesFromIntermediate = await db.routeInventory.findMany({
        where: {
          origin: departing.destination,
          destination,
          date
        }
      });

      for (const connecting of connectingRoutesFromIntermediate) {
        // Check availability on both segments
        const firstSegmentAvailability = await this.checkRealTimeAvailability(
          departing.route,
          date
        );
        const secondSegmentAvailability = await this.checkRealTimeAvailability(
          connecting.route,
          date
        );

        const minSeats = Math.min(
          firstSegmentAvailability.availableSeats,
          secondSegmentAvailability.availableSeats
        );

        if (minSeats > 0) {
          // Get married segment key
          const marriedSegmentKey = `${departing.flightNumber}>${connecting.flightNumber}`;

          connectingRoutes.push({
            route: `${departing.route}>${connecting.route}`,
            flightNumber: `${departing.flightNumber}/${connecting.flightNumber}`,
            airlineCode: departing.flightNumber.substring(0, 2),
            departureTime: 'TBD',
            arrivalTime: 'TBD',
            stops: 1,
            duration: 0,
            availableSeats: minSeats,
            fareClasses: this.mergeFareClasses(
              firstSegmentAvailability.fareClasses,
              secondSegmentAvailability.fareClasses
            ),
            isMarriedSegment: true,
            marriedSegmentKey
          });
        }

        // Check for two-stop connections if allowed
        if (maxStops > 1) {
          const twoStopRoutes = await this.findTwoStopRoutes(
            departing.destination,
            connecting.destination,
            destination,
            date,
            [departing.flightNumber, connecting.flightNumber]
          );
          connectingRoutes.push(...twoStopRoutes);
        }
      }
    }

    return connectingRoutes;
  }

  /**
   * Find two-stop connecting routes
   */
  private async findTwoStopRoutes(
    firstStop: string,
    secondStop: string,
    finalDestination: string,
    date: string,
    previousFlights: string[]
  ): Promise<RouteOption[]> {
    const routes: RouteOption[] = [];

    // Find routes from second stop to final destination
    const finalRoutes = await db.routeInventory.findMany({
      where: {
        origin: secondStop,
        destination: finalDestination,
        date
      }
    });

    for (const final of finalRoutes) {
      // Check availability on all segments
      const availabilities = await Promise.all([
        this.checkRealTimeAvailability(`${firstStop}-${secondStop}`, date),
        this.checkRealTimeAvailability(final.route, date)
      ]);

      const minSeats = Math.min(...availabilities.map(a => a.availableSeats));

      if (minSeats > 0) {
        const marriedSegmentKey = previousFlights.join('>') + '>' + final.flightNumber;

        routes.push({
          route: `${firstStop}-${secondStop}>${final.route}`,
          flightNumber: previousFlights.join('/') + '/' + final.flightNumber,
          airlineCode: final.flightNumber.substring(0, 2),
          departureTime: 'TBD',
          arrivalTime: 'TBD',
          stops: 2,
          duration: 0,
          availableSeats: minSeats,
          fareClasses: this.mergeFareClasses(
            availabilities[0].fareClasses,
            availabilities[1].fareClasses
          ),
          isMarriedSegment: true,
          marriedSegmentKey
        });
      }
    }

    return routes;
  }

  /**
   * Merge fare classes from multiple segments
   */
  private mergeFareClasses(
    ...fareClassArrays: FareClassAvailability[][]
  ): FareClassAvailability[] {
    const mergedMap = new Map<string, FareClassAvailability>();

    for (const array of fareClassArrays) {
      for (const fc of array) {
        const existing = mergedMap.get(fc.code);
        if (existing) {
          // Use the minimum availability across segments
          existing.availableSeats = Math.min(existing.availableSeats, fc.availableSeats);
          // Sum the base fares for multi-segment pricing
          existing.baseFare += fc.baseFare;
        } else {
          mergedMap.set(fc.code, { ...fc });
        }
      }
    }

    return Array.from(mergedMap.values()).sort((a, b) => a.baseFare - b.baseFare);
  }

  // ============================================
  // MARRIED SEGMENT AVAILABILITY
  // ============================================

  /**
   * Check availability for married segments (segments that must be booked together)
   *
   * @param segments - Array of segment identifiers (flight numbers + dates)
   * @param fareClass - The fare class to check
   * @param passengers - Number of passengers (default: 1)
   * @returns MarriedSegmentAvailabilityResult with availability for all segments
   *
   * @example
   * ```typescript
   * const marriedAvailability = await availabilityEngine.checkMarriedSegmentAvailability(
   *   [
   *     { flightNumber: 'AA123', date: '2024-12-10' },
   *     { flightNumber: 'AA456', date: '2024-12-10' }
   *   ],
   *   'Y',
   *   2
   * );
   * ```
   */
  async checkMarriedSegmentAvailability(
    segments: { flightNumber: string; date: string }[],
    fareClass: string,
    passengers: number = 1
  ): Promise<MarriedSegmentAvailabilityResult> {
    try {
      if (segments.length < 2) {
        throw new Error('At least 2 segments are required for married segment availability');
      }

      const segmentAvailabilities: SegmentAvailability[] = [];
      let totalSeats = Infinity;
      const restrictions: string[] = [];

      // Check availability for each segment
      for (const segment of segments) {
        const inventory = await db.routeInventory.findFirst({
          where: {
            flightNumber: segment.flightNumber,
            date: segment.date
          }
        });

        if (!inventory) {
          throw new Error(`Inventory not found for flight ${segment.flightNumber} on ${segment.date}`);
        }

        const capacity = JSON.parse(inventory.capacity || '{}');
        const sold = JSON.parse(inventory.sold || '{}');
        const waitlist = JSON.parse(inventory.waitlist || '{}');
        const blocked = JSON.parse(inventory.blocked || '{}');

        const classCapacity = capacity[fareClass] || 0;
        const classSold = sold[fareClass] || 0;
        const classWaitlist = waitlist[fareClass] || 0;
        const classBlocked = blocked[fareClass] || 0;

        const available = classCapacity - classSold - classBlocked;
        const availableSeats = Math.max(0, available);

        segmentAvailabilities.push({
          flightNumber: segment.flightNumber,
          origin: inventory.origin,
          destination: inventory.destination,
          date: segment.date,
          availableSeats,
          waitlistedSeats: classWaitlist,
          blockedSeats: classBlocked,
          fareClass
        });

        totalSeats = Math.min(totalSeats, availableSeats);
      }

      // Check for married segment restrictions
      const marriedSegments = JSON.parse(segmentAvailabilities[0]?.marriedSegments || '[]');
      const marriedSegmentKey = segments.map(s => s.flightNumber).join('>');

      const marriedConfig = marriedSegments.find((ms: any) => ms.key === marriedSegmentKey);
      if (marriedConfig) {
        if (marriedConfig.restrictions) {
          restrictions.push(...marriedConfig.restrictions);
        }
      } else {
        restrictions.push('Married segment configuration not found. Segments will be priced separately.');
      }

      const available = totalSeats >= passengers;

      return {
        available,
        segments: segmentAvailabilities,
        totalSeats: available ? totalSeats : 0,
        marriedSegmentKey,
        fareClass,
        restrictions: restrictions.length > 0 ? restrictions : undefined
      };

    } catch (error) {
      console.error('Error checking married segment availability:', error);
      throw new Error(`Married segment availability check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // FARE CLASS INVENTORY MANAGEMENT
  // ============================================

  /**
   * Update fare class inventory (increase or decrease sold count)
   *
   * @param route - The route in "ORIG-DEST" format
   * @param date - The flight date in YYYY-MM-DD format
   * @param fareClass - The fare class to update
   * @param delta - The change in sold seats (positive for sales, negative for cancellations)
   * @returns InventoryUpdateResult with updated inventory information
   *
   * @example
   * ```typescript
   * // Book 2 seats
   * const result = await availabilityEngine.updateFareClassInventory('JFK-LHR', '2024-12-10', 'Y', 2);
   * // Cancel 1 seat
   * const cancelResult = await availabilityEngine.updateFareClassInventory('JFK-LHR', '2024-12-10', 'Y', -1);
   * ```
   */
  async updateFareClassInventory(
    route: string,
    date: string,
    fareClass: string,
    delta: number
  ): Promise<InventoryUpdateResult> {
    try {
      const inventory = await db.routeInventory.findFirst({
        where: {
          route,
          date
        }
      });

      if (!inventory) {
        throw new Error(`Inventory not found for route ${route} on ${date}`);
      }

      const capacity = JSON.parse(inventory.capacity || '{}');
      const sold = JSON.parse(inventory.sold || '{}');

      const classCapacity = capacity[fareClass] || 0;
      const previousSold = sold[fareClass] || 0;
      const newSold = previousSold + delta;

      // Validate new sold count
      if (newSold < 0) {
        return {
          success: false,
          previousSold,
          newSold: previousSold,
          capacity: classCapacity,
          remaining: classCapacity - previousSold,
          message: 'Cannot reduce sold count below 0'
        };
      }

      if (newSold > classCapacity) {
        return {
          success: false,
          previousSold,
          newSold: previousSold,
          capacity: classCapacity,
          remaining: classCapacity - previousSold,
          message: `Insufficient capacity. Requested: ${newSold}, Capacity: ${classCapacity}`
        };
      }

      // Update sold count
      sold[fareClass] = newSold;

      await db.routeInventory.update({
        where: { id: inventory.id },
        data: {
          sold: JSON.stringify(sold)
        }
      });

      return {
        success: true,
        previousSold,
        newSold,
        capacity: classCapacity,
        remaining: classCapacity - newSold,
        message: `Inventory updated successfully. Sold: ${newSold}/${classCapacity}`
      };

    } catch (error) {
      console.error('Error updating fare class inventory:', error);
      throw new Error(`Inventory update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Open or close a fare class bucket
   *
   * @param route - The route in "ORIG-DEST" format
   * @param date - The flight date in YYYY-MM-DD format
   * @param fareClass - The fare class to open/close
   * @param isOpen - True to open, false to close
   * @returns Success status and message
   */
  async setFareClassBucketStatus(
    route: string,
    date: string,
    fareClass: string,
    isOpen: boolean
  ): Promise<{ success: boolean; message: string }> {
    try {
      const inventory = await db.routeInventory.findFirst({
        where: {
          route,
          date
        }
      });

      if (!inventory) {
        throw new Error(`Inventory not found for route ${route} on ${date}`);
      }

      const capacity = JSON.parse(inventory.capacity || '{}');

      if (isOpen) {
        // Open bucket: set capacity to a default value or restore previous capacity
        if (!capacity[fareClass] || capacity[fareClass] === 0) {
          capacity[fareClass] = 100; // Default capacity
        }
      } else {
        // Close bucket: set capacity to 0
        capacity[fareClass] = 0;
      }

      await db.routeInventory.update({
        where: { id: inventory.id },
        data: {
          capacity: JSON.stringify(capacity)
        }
      });

      return {
        success: true,
        message: `Fare class ${fareClass} ${isOpen ? 'opened' : 'closed'} for route ${route} on ${date}`
      };

    } catch (error) {
      console.error('Error setting fare class bucket status:', error);
      throw new Error(`Failed to set bucket status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // AGENT BLOCKED INVENTORY
  // ============================================

  /**
   * Block inventory for a specific agent (temporarily reserve seats)
   *
   * @param agentId - The agent ID
   * @param route - The route in "ORIG-DEST" format
   * @param date - The flight date in YYYY-MM-DD format
   * @param seats - Number of seats to block
   * @param fareClass - The fare class to block (optional)
   * @param durationMinutes - Duration of block in minutes (default: 30)
   * @returns AgentBlockResult with block details
   *
   * @example
   * ```typescript
   * const result = await availabilityEngine.blockInventoryForAgent(
   *   'agent-123',
   *   'JFK-LHR',
   *   '2024-12-10',
   *   5,
   *   'Y',
   *   30
   * );
   * ```
   */
  async blockInventoryForAgent(
    agentId: string,
    route: string,
    date: string,
    seats: number,
    fareClass?: string,
    durationMinutes: number = 30
  ): Promise<AgentBlockResult> {
    try {
      const inventory = await db.routeInventory.findFirst({
        where: {
          route,
          date
        }
      });

      if (!inventory) {
        throw new Error(`Inventory not found for route ${route} on ${date}`);
      }

      const blocked = JSON.parse(inventory.blocked || '{}');

      // Generate unique block ID
      const blockId = `BLK-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

      // Create block record
      const block: AgentBlockedInventory = {
        id: blockId,
        agentId,
        flightNumber: inventory.flightNumber,
        date,
        route,
        seatsBlocked: seats,
        fareClass: fareClass || 'ALL',
        blockedAt: new Date(),
        expiresAt
      };

      // Add to blocked inventory
      if (!blocked[agentId]) {
        blocked[agentId] = [];
      }
      blocked[agentId].push(block);

      // Update inventory
      await db.routeInventory.update({
        where: { id: inventory.id },
        data: {
          blocked: JSON.stringify(blocked)
        }
      });

      // Update cache
      const cacheKey = `${route}-${date}`;
      if (!this.blockedInventoryCache.has(cacheKey)) {
        this.blockedInventoryCache.set(cacheKey, []);
      }
      this.blockedInventoryCache.get(cacheKey)!.push(block);

      return {
        success: true,
        blockId,
        seatsBlocked: seats,
        expiresAt,
        message: `Successfully blocked ${seats} seats for agent ${agentId} until ${expiresAt.toISOString()}`
      };

    } catch (error) {
      console.error('Error blocking inventory for agent:', error);
      throw new Error(`Failed to block inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Release blocked inventory for an agent
   *
   * @param blockId - The block ID to release
   * @returns Success status and message
   */
  async releaseBlockedInventory(blockId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find and remove the block from all inventories
      const inventories = await db.routeInventory.findMany();

      for (const inventory of inventories) {
        const blocked = JSON.parse(inventory.blocked || '{}');

        for (const agentId in blocked) {
          const agentBlocks = blocked[agentId];
          const index = agentBlocks.findIndex((b: any) => b.id === blockId);

          if (index !== -1) {
            agentBlocks.splice(index, 1);

            await db.routeInventory.update({
              where: { id: inventory.id },
              data: {
                blocked: JSON.stringify(blocked)
              }
            });

            // Update cache
            const cacheKey = `${inventory.route}-${inventory.date}`;
            const cachedBlocks = this.blockedInventoryCache.get(cacheKey);
            if (cachedBlocks) {
              const cacheIndex = cachedBlocks.findIndex(b => b.id === blockId);
              if (cacheIndex !== -1) {
                cachedBlocks.splice(cacheIndex, 1);
              }
            }

            return {
              success: true,
              message: `Successfully released blocked inventory ${blockId}`
            };
          }
        }
      }

      return {
        success: false,
        message: `Block ${blockId} not found or already expired`
      };

    } catch (error) {
      console.error('Error releasing blocked inventory:', error);
      throw new Error(`Failed to release blocked inventory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean up expired blocked inventory
   * Should be run periodically
   *
   * @returns Number of expired blocks removed
   */
  async cleanupExpiredBlocks(): Promise<number> {
    try {
      const now = new Date();
      let cleanedCount = 0;

      const inventories = await db.routeInventory.findMany();

      for (const inventory of inventories) {
        const blocked = JSON.parse(inventory.blocked || '{}');
        let hasChanges = false;

        for (const agentId in blocked) {
          const agentBlocks = blocked[agentId];

          for (let i = agentBlocks.length - 1; i >= 0; i--) {
            const block = agentBlocks[i];
            const expiresAt = new Date(block.expiresAt);

            if (expiresAt < now) {
              agentBlocks.splice(i, 1);
              cleanedCount++;
              hasChanges = true;
            }
          }

          // Remove empty agent arrays
          if (agentBlocks.length === 0) {
            delete blocked[agentId];
            hasChanges = true;
          }
        }

        if (hasChanges) {
          await db.routeInventory.update({
            where: { id: inventory.id },
            data: {
              blocked: JSON.stringify(blocked)
            }
          });
        }
      }

      // Clear and rebuild cache
      this.blockedInventoryCache.clear();

      return cleanedCount;

    } catch (error) {
      console.error('Error cleaning up expired blocks:', error);
      throw new Error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // DYNAMIC CAPACITY ADJUSTMENT
  // ============================================

  /**
   * Dynamically adjust capacity based on demand and other factors
   *
   * @param route - The route in "ORIG-DEST" format
   * @param date - The flight date in YYYY-MM-DD format
   * @param adjustmentFactor - Factor to adjust capacity (e.g., 1.1 for 10% increase)
   * @param reason - Reason for the adjustment
   * @returns CapacityAdjustmentResult with adjustment details
   *
   * @example
   * ```typescript
   * const result = await availabilityEngine.adjustDynamicCapacity(
   *   'JFK-LHR',
   *   '2024-12-10',
   *   1.2,
   *   'High demand expected'
   * );
   * ```
   */
  async adjustDynamicCapacity(
    route: string,
    date: string,
    adjustmentFactor: number,
    reason: string
  ): Promise<CapacityAdjustmentResult> {
    try {
      if (adjustmentFactor <= 0) {
        throw new Error('Adjustment factor must be greater than 0');
      }

      const inventory = await db.routeInventory.findFirst({
        where: {
          route,
          date
        }
      });

      if (!inventory) {
        throw new Error(`Inventory not found for route ${route} on ${date}`);
      }

      const capacity = JSON.parse(inventory.capacity || '{}');
      const previousCapacity = { ...capacity };

      // Apply adjustment to each fare class
      for (const fareClass in capacity) {
        const newCapacity = Math.round(capacity[fareClass] * adjustmentFactor);
        capacity[fareClass] = Math.max(0, newCapacity);
      }

      await db.routeInventory.update({
        where: { id: inventory.id },
        data: {
          capacity: JSON.stringify(capacity)
        }
      });

      return {
        success: true,
        previousCapacity,
        newCapacity: capacity,
        adjustmentReason: reason,
        message: `Capacity adjusted by factor ${adjustmentFactor} for route ${route} on ${date}. Reason: ${reason}`
      };

    } catch (error) {
      console.error('Error adjusting dynamic capacity:', error);
      throw new Error(`Capacity adjustment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Auto-adjust capacity based on demand patterns
   * This should be run periodically
   *
   * @returns Number of routes adjusted
   */
  async autoAdjustCapacityByDemand(): Promise<number> {
    try {
      let adjustedCount = 0;

      // Get all inventories for the next 30 days
      const today = new Date();
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

      const inventories = await db.routeInventory.findMany({
        where: {
          date: {
            gte: today.toISOString().split('T')[0],
            lte: thirtyDaysLater.toISOString().split('T')[0]
          }
        }
      });

      for (const inventory of inventories) {
        const capacity = JSON.parse(inventory.capacity || '{}');
        const sold = JSON.parse(inventory.sold || '{}');

        // Calculate load factor for each fare class
        let totalCapacity = 0;
        let totalSold = 0;

        for (const fareClass in capacity) {
          totalCapacity += capacity[fareClass];
          totalSold += sold[fareClass] || 0;
        }

        if (totalCapacity === 0) continue;

        const loadFactor = totalSold / totalCapacity;

        // Adjust capacity based on load factor
        let adjustmentFactor = 1.0;

        if (loadFactor > 0.9) {
          // Very high demand: reduce capacity to drive up prices
          adjustmentFactor = 0.9;
        } else if (loadFactor > 0.8) {
          // High demand: slight reduction
          adjustmentFactor = 0.95;
        } else if (loadFactor < 0.3 && this.isDaysBeforeDeparture(inventory.date, 7)) {
          // Low demand and close to departure: increase capacity
          adjustmentFactor = 1.1;
        } else if (loadFactor < 0.5 && this.isDaysBeforeDeparture(inventory.date, 14)) {
          // Moderate low demand: slight increase
          adjustmentFactor = 1.05;
        }

        if (adjustmentFactor !== 1.0) {
          try {
            await this.adjustDynamicCapacity(
              inventory.route,
              inventory.date,
              adjustmentFactor,
              `Auto-adjustment based on load factor: ${(loadFactor * 100).toFixed(1)}%`
            );
            adjustedCount++;
          } catch (error) {
            console.error(`Failed to adjust capacity for ${inventory.route} on ${inventory.date}:`, error);
          }
        }
      }

      return adjustedCount;

    } catch (error) {
      console.error('Error auto-adjusting capacity:', error);
      throw new Error(`Auto-adjustment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Check if a date is before a certain number of days from departure
   */
  private isDaysBeforeDeparture(departureDate: string, days: number): boolean {
    const departure = new Date(departureDate);
    const today = new Date();
    const diffTime = departure.getTime() - today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  }

  /**
   * Get inventory summary for a route
   */
  async getInventorySummary(
    route: string,
    date: string
  ): Promise<{
    route: string;
    date: string;
    flightNumber: string;
    totalCapacity: number;
    totalSold: number;
    totalAvailable: number;
    totalWaitlisted: number;
    totalBlocked: number;
    loadFactor: number;
    fareClasses: {
      code: string;
      capacity: number;
      sold: number;
      available: number;
      waitlisted: number;
      blocked: number;
      loadFactor: number;
    }[];
  } | null> {
    try {
      const inventory = await db.routeInventory.findFirst({
        where: {
          route,
          date
        }
      });

      if (!inventory) {
        return null;
      }

      const capacity = JSON.parse(inventory.capacity || '{}');
      const sold = JSON.parse(inventory.sold || '{}');
      const waitlist = JSON.parse(inventory.waitlist || '{}');
      const blocked = JSON.parse(inventory.blocked || '{}');

      let totalCapacity = 0;
      let totalSold = 0;
      let totalWaitlisted = 0;
      let totalBlocked = 0;

      const fareClasses: any[] = [];

      for (const code in capacity) {
        const classCapacity = capacity[code];
        const classSold = sold[code] || 0;
        const classWaitlist = waitlist[code] || 0;
        const classBlocked = blocked[code] || 0;
        const classAvailable = classCapacity - classSold - classBlocked;

        totalCapacity += classCapacity;
        totalSold += classSold;
        totalWaitlisted += classWaitlist;
        totalBlocked += classBlocked;

        fareClasses.push({
          code,
          capacity: classCapacity,
          sold: classSold,
          available: Math.max(0, classAvailable),
          waitlisted: classWaitlist,
          blocked: classBlocked,
          loadFactor: classCapacity > 0 ? (classSold / classCapacity) * 100 : 0
        });
      }

      const totalAvailable = totalCapacity - totalSold - totalBlocked;
      const loadFactor = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

      return {
        route: inventory.route,
        date: inventory.date,
        flightNumber: inventory.flightNumber,
        totalCapacity,
        totalSold,
        totalAvailable: Math.max(0, totalAvailable),
        totalWaitlisted,
        totalBlocked,
        loadFactor,
        fareClasses
      };

    } catch (error) {
      console.error('Error getting inventory summary:', error);
      throw new Error(`Failed to get inventory summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Bulk update inventory for multiple routes
   */
  async bulkUpdateInventory(
    updates: Array<{
      route: string;
      date: string;
      fareClass: string;
      delta: number;
    }>
  ): Promise<Array<{ success: boolean; route: string; message: string }>> {
    const results = [];

    for (const update of updates) {
      try {
        await this.updateFareClassInventory(
          update.route,
          update.date,
          update.fareClass,
          update.delta
        );

        results.push({
          success: true,
          route: update.route,
          message: `Inventory updated for ${update.route} on ${update.date}`
        });
      } catch (error) {
        results.push({
          success: false,
          route: update.route,
          message: `Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const availabilityEngine = AvailabilityEngine.getInstance();
