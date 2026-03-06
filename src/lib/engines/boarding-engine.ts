/**
 * Boarding Control Engine
 * 
 * This engine handles all boarding-related operations for the DCS (Departure Control System).
 * It manages the boarding process from initiation to completion, including passenger boarding,
 * priority handling, standby processing, and gate change notifications.
 * 
 * @module BoardingEngine
 */

import { db } from '@/lib/db';

// ============================================
// Type Definitions
// ============================================

/**
 * Priority levels for boarding
 */
export type BoardingPriority = 'preboard' | 'first_class' | 'business' | 'elite_plus' | 'elite' | 'priority' | 'general' | 'standby';

/**
 * Boarding status states
 */
export type BoardingStatus = 'scheduled' | 'boarding' | 'completed' | 'delayed' | 'cancelled';

/**
 * Boarding group configuration
 */
export interface BoardingGroup {
  name: string;
  priority: BoardingPriority;
  startSequence: number;
  endSequence: number;
  description: string;
}

/**
 * Passenger boarding data
 */
export interface PassengerBoardingData {
  ticketNumber: string;
  passengerName: string;
  seatNumber: string;
  priority: BoardingPriority;
  isStandby: boolean;
  checkInTime: Date;
  documentsVerified: boolean;
  bagsChecked: number;
}

/**
 * Boarding statistics
 */
export interface BoardingStatistics {
  totalPassengers: number;
  boardedPassengers: number;
  checkedInPassengers: number;
  noShowPassengers: number;
  offloadedPassengers: number;
  standbyBoarded: number;
  completionPercentage: number;
  estimatedCompletionTime?: Date;
}

/**
 * Gate change notification data
 */
export interface GateChangeNotification {
  oldGate: string;
  newGate: string;
  timestamp: Date;
  notifiedPassengers: number;
  notificationMethod: 'display' | 'announcement' | 'sms' | 'email' | 'app';
}

/**
 * Boarding reconciliation result
 */
export interface BoardingReconciliation {
  checkedInCount: number;
  boardedCount: number;
  noShowCount: number;
  discrepancies: {
    ticketNumber: string;
    passengerName: string;
    issue: 'boarded_not_checked_in' | 'checked_in_not_boarded' | 'standby_boarded_without_seat';
  }[];
  status: 'reconciled' | 'discrepancies_found' | 'critical_issue';
}

/**
 * Boarding lane configuration
 */
export interface BoardingLane {
  laneId: string;
  laneNumber: number;
  type: 'general' | 'priority' | 'special_assistance';
  currentGroup?: BoardingGroup;
  active: boolean;
  passengersProcessed: number;
}

// ============================================
// Constants
// ============================================

/**
 * Standard boarding weight per passenger (kg)
 */
const STANDARD_PASSENGER_WEIGHT = 77; // ICAO standard

/**
 * Standard boarding groups configuration
 */
const STANDARD_BOARDING_GROUPS: BoardingGroup[] = [
  {
    name: 'Pre-Board',
    priority: 'preboard',
    startSequence: 1,
    endSequence: 10,
    description: 'Passengers needing assistance, unaccompanied minors, active military'
  },
  {
    name: 'Group 1 - First Class',
    priority: 'first_class',
    startSequence: 11,
    endSequence: 30,
    description: 'First Class passengers'
  },
  {
    name: 'Group 2 - Business Class',
    priority: 'business',
    startSequence: 31,
    endSequence: 60,
    description: 'Business Class passengers'
  },
  {
    name: 'Group 3 - Elite Plus',
    priority: 'elite_plus',
    startSequence: 61,
    endSequence: 90,
    description: 'Top tier frequent flyers'
  },
  {
    name: 'Group 4 - Elite',
    priority: 'elite',
    startSequence: 91,
    endSequence: 120,
    description: 'Elite frequent flyers'
  },
  {
    name: 'Group 5 - Priority',
    priority: 'priority',
    startSequence: 121,
    endSequence: 150,
    description: 'Credit card holders and premium economy'
  },
  {
    name: 'Group 6 - General',
    priority: 'general',
    startSequence: 151,
    endSequence: 200,
    description: 'General boarding by seat number (rear to front)'
  }
];

/**
 * Last call threshold (minutes before departure)
 */
const LAST_CALL_THRESHOLD_MINUTES = 15;

/**
 * Boarding time per passenger estimate (seconds)
 */
const BOARDING_TIME_PER_PASSENGER = 8;

// ============================================
// Boarding Engine Class
// ============================================

/**
 * Main Boarding Engine class that handles all boarding operations
 */
export class BoardingEngine {
  /**
   * Start the boarding process for a flight
   * 
   * @param flightNumber - The flight number (e.g., 'AA123')
   * @param date - The flight date in 'YYYY-MM-DD' format
   * @param gate - The gate number for boarding
   * @param scheduledDeparture - Scheduled departure time
   * @param userId - ID of the user initiating boarding
   * @returns The created boarding record
   * @throws Error if flight doesn't exist, boarding already started, or validation fails
   */
  async startBoarding(
    flightNumber: string,
    date: string,
    gate: string,
    scheduledDeparture: Date,
    userId: string
  ) {
    try {
      // Validate flight exists
      const flight = await db.flightInstance.findUnique({
        where: { flightNumber_date: { flightNumber, date } }
      });

      if (!flight) {
        throw new Error(`Flight ${flightNumber} on ${date} not found`);
      }

      // Check if boarding already exists
      const existingBoarding = await db.boardingRecord.findUnique({
        where: { flightNumber_date: { flightNumber, date } }
      });

      if (existingBoarding) {
        throw new Error(`Boarding for flight ${flightNumber} on ${date} has already been initialized`);
      }

      // Get checked-in passengers
      const checkedInPassengers = await db.checkInRecord.findMany({
        where: {
          flightNumber,
          date,
          status: 'checked-in'
        },
        include: {
          // Ticket info would be included here
        }
      });

      // Generate boarding sequence
      const boardingSequence = this.generateBoardingSequenceInternal(checkedInPassengers);

      // Create boarding record
      const boardingRecord = await db.boardingRecord.create({
        data: {
          flightNumber,
          date,
          gate,
          scheduledDeparture,
          totalPassengers: checkedInPassengers.length,
          boardedPassengers: 0,
          boardingStarted: new Date(),
          status: 'boarding',
          priorityBoarding: JSON.stringify(this.identifyPriorityPassengers(checkedInPassengers)),
          standbyList: JSON.stringify(this.identifyStandbyPassengers(checkedInPassengers)),
          boardingSequence: JSON.stringify(boardingSequence),
          passengers: {
            create: boardingSequence.map((bp, index) => ({
              ticketNumber: bp.ticketNumber,
              passengerName: bp.passengerName,
              seatNumber: bp.seatNumber,
              sequence: index + 1,
              status: 'not-boarded',
              boardingGroup: bp.boardingGroup,
              isPriority: bp.isPriority,
              isStandby: bp.isStandby
            }))
          }
        }
      });

      // Update flight instance
      await db.flightInstance.update({
        where: { flightNumber_date: { flightNumber, date } },
        data: { gate }
      });

      return boardingRecord;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to start boarding: ${error.message}`);
      }
      throw new Error('Failed to start boarding: Unknown error');
    }
  }

  /**
   * Board a passenger with sequence tracking
   * 
   * @param ticketNumber - The passenger's ticket number
   * @param seatNumber - The assigned seat number
   * @param sequence - The boarding sequence number
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns The updated boarding passenger record
   * @throws Error if validation fails or passenger not found
   */
  async boardPassenger(
    ticketNumber: string,
    seatNumber: string,
    sequence: number,
    flightNumber: string,
    date: string
  ) {
    try {
      // Get boarding record
      const boardingRecord = await db.boardingRecord.findUnique({
        where: { flightNumber_date: { flightNumber, date } },
        include: { passengers: true }
      });

      if (!boardingRecord) {
        throw new Error(`Boarding record not found for flight ${flightNumber} on ${date}`);
      }

      if (boardingRecord.status !== 'boarding') {
        throw new Error(`Cannot board passenger. Boarding status is: ${boardingRecord.status}`);
      }

      // Find passenger
      const passenger = boardingRecord.passengers.find(
        p => p.ticketNumber === ticketNumber
      );

      if (!passenger) {
        throw new Error(`Passenger with ticket ${ticketNumber} not found in boarding list`);
      }

      if (passenger.status === 'boarded') {
        throw new Error(`Passenger ${ticketNumber} is already boarded`);
      }

      if (passenger.status === 'off-loaded') {
        throw new Error(`Passenger ${ticketNumber} has been off-loaded and cannot board`);
      }

      // Update passenger status
      const updatedPassenger = await db.boardingPassenger.update({
        where: { id: passenger.id },
        data: {
          status: 'boarded',
          boardingTime: new Date(),
          seatNumber
        }
      });

      // Update boarding statistics
      const boardedCount = await db.boardingPassenger.count({
        where: {
          boardingRecordId: boardingRecord.id,
          status: 'boarded'
        }
      });

      await db.boardingRecord.update({
        where: { id: boardingRecord.id },
        data: {
          boardedPassengers: boardedCount
        }
      });

      // Check if boarding is complete
      if (boardedCount >= boardingRecord.totalPassengers) {
        await this.completeBoarding(flightNumber, date);
      }

      // Update check-in record
      await db.checkInRecord.updateMany({
        where: {
          ticketNumber,
          flightNumber,
          date
        },
        data: {
          status: 'boarded'
        }
      });

      return updatedPassenger;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to board passenger: ${error.message}`);
      }
      throw new Error('Failed to board passenger: Unknown error');
    }
  }

  /**
   * Process the standby list for a flight
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns List of successfully boarded standby passengers
   * @throws Error if processing fails
   */
  async processStandbyList(
    flightNumber: string,
    date: string
  ) {
    try {
      const boardingRecord = await db.boardingRecord.findUnique({
        where: { flightNumber_date: { flightNumber, date } },
        include: { passengers: true }
      });

      if (!boardingRecord) {
        throw new Error(`Boarding record not found for flight ${flightNumber} on ${date}`);
      }

      // Get standby passengers
      const standbyPassengers = boardingRecord.passengers.filter(
        p => p.isStandby && p.status === 'not-boarded'
      );

      // Get available seats (from seat map or calculate)
      const availableSeats = await this.getAvailableSeats(flightNumber, date);

      const boardedStandby: typeof standbyPassengers = [];

      // Process standby by priority/timestamp
      for (const passenger of standbyPassengers) {
        if (availableSeats.length === 0) {
          break; // No more seats available
        }

        const seat = availableSeats.shift();
        if (seat) {
          await this.boardPassenger(
            passenger.ticketNumber,
            seat,
            passenger.sequence,
            flightNumber,
            date
          );
          boardedStandby.push(passenger);
        }
      }

      // Update standby list in boarding record
      const remainingStandby = standbyPassengers.filter(
        p => !boardedStandby.includes(p)
      );

      await db.boardingRecord.update({
        where: { id: boardingRecord.id },
        data: {
          standbyList: JSON.stringify(remainingStandby)
        }
      });

      return boardedStandby;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to process standby list: ${error.message}`);
      }
      throw new Error('Failed to process standby list: Unknown error');
    }
  }

  /**
   * Perform boarding reconciliation check
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns Reconciliation results
   */
  async checkBoardingReconciliation(
    flightNumber: string,
    date: string
  ): Promise<BoardingReconciliation> {
    try {
      const checkedInRecords = await db.checkInRecord.findMany({
        where: { flightNumber, date }
      });

      const boardingRecord = await db.boardingRecord.findUnique({
        where: { flightNumber_date: { flightNumber, date } },
        include: { passengers: true }
      });

      if (!boardingRecord) {
        throw new Error(`Boarding record not found`);
      }

      const checkedInCount = checkedInRecords.filter(r => r.status === 'checked-in').length;
      const boardedCount = boardingRecord.passengers.filter(p => p.status === 'boarded').length;
      const noShowCount = checkedInRecords.filter(r => r.status === 'no-show').length;

      const discrepancies: BoardingReconciliation['discrepancies'] = [];

      // Check for boarded but not checked in
      for (const boarded of boardingRecord.passengers.filter(p => p.status === 'boarded')) {
        const checkIn = checkedInRecords.find(r => r.ticketNumber === boarded.ticketNumber);
        if (!checkIn || checkIn.status !== 'checked-in') {
          discrepancies.push({
            ticketNumber: boarded.ticketNumber,
            passengerName: boarded.passengerName,
            issue: 'boarded_not_checked_in'
          });
        }
      }

      // Check for checked in but not boarded (excluding no-shows)
      for (const checkIn of checkedInRecords.filter(r => r.status === 'checked-in')) {
        const boarded = boardingRecord.passengers.find(p => p.ticketNumber === checkIn.ticketNumber);
        if (!boarded || boarded.status !== 'boarded') {
          discrepancies.push({
            ticketNumber: checkIn.ticketNumber,
            passengerName: checkIn.passengerName,
            issue: 'checked_in_not_boarded'
          });
        }
      }

      // Determine overall status
      let status: BoardingReconciliation['status'] = 'reconciled';
      if (discrepancies.some(d => d.issue === 'boarded_not_checked_in')) {
        status = 'critical_issue';
      } else if (discrepancies.length > 0) {
        status = 'discrepancies_found';
      }

      return {
        checkedInCount,
        boardedCount,
        noShowCount,
        discrepancies,
        status
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check boarding reconciliation: ${error.message}`);
      }
      throw new Error('Failed to check boarding reconciliation: Unknown error');
    }
  }

  /**
   * Handle gate change notification
   * 
   * @param flightNumber - The flight number
   * @param oldGate - The old gate number
   * @param newGate - The new gate number
   * @param notificationMethod - Method of notification
   * @returns Gate change notification details
   */
  async notifyGateChange(
    flightNumber: string,
    oldGate: string,
    newGate: string,
    notificationMethod: GateChangeNotification['notificationMethod'] = 'display'
  ): Promise<GateChangeNotification> {
    try {
      const boardingRecord = await db.boardingRecord.findUnique({
        where: { flightNumber_date: { flightNumber, date: new Date().toISOString().split('T')[0] } }
      });

      if (!boardingRecord) {
        throw new Error(`Boarding record not found for flight ${flightNumber}`);
      }

      const gateChange = {
        oldGate,
        newGate,
        timestamp: new Date(),
        notificationMethod
      };

      // Get current gate change log
      const currentLog = JSON.parse(boardingRecord.gateChangeLog || '[]');
      currentLog.push(gateChange);

      // Update boarding record with new gate and log
      await db.boardingRecord.update({
        where: { id: boardingRecord.id },
        data: {
          gate: newGate,
          gateChangeLog: JSON.stringify(currentLog)
        }
      });

      // Update flight instance
      await db.flightInstance.updateMany({
        where: { flightNumber, date: new Date().toISOString().split('T')[0] },
        data: { gate: newGate }
      });

      // Count notified passengers
      const notifiedPassengers = await db.checkInRecord.count({
        where: {
          flightNumber,
          date: new Date().toISOString().split('T')[0],
          status: { in: ['checked-in', 'boarded'] }
        }
      });

      return {
        ...gateChange,
        notifiedPassengers
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to notify gate change: ${error.message}`);
      }
      throw new Error('Failed to notify gate change: Unknown error');
    }
  }

  /**
   * Off-load a passenger from the flight
   * 
   * @param ticketNumber - The passenger's ticket number
   * @param reason - Reason for off-load
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns The updated boarding passenger record
   */
  async offloadPassenger(
    ticketNumber: string,
    reason: string,
    flightNumber: string,
    date: string
  ) {
    try {
      const boardingRecord = await db.boardingRecord.findUnique({
        where: { flightNumber_date: { flightNumber, date } },
        include: { passengers: true }
      });

      if (!boardingRecord) {
        throw new Error(`Boarding record not found`);
      }

      const passenger = boardingRecord.passengers.find(
        p => p.ticketNumber === ticketNumber
      );

      if (!passenger) {
        throw new Error(`Passenger with ticket ${ticketNumber} not found`);
      }

      // Update passenger status
      const updatedPassenger = await db.boardingPassenger.update({
        where: { id: passenger.id },
        data: {
          status: 'off-loaded'
        }
      });

      // Update boarding count
      const boardedCount = await db.boardingPassenger.count({
        where: {
          boardingRecordId: boardingRecord.id,
          status: 'boarded'
        }
      });

      await db.boardingRecord.update({
        where: { id: boardingRecord.id },
        data: { boardedPassengers: boardedCount }
      });

      // Update check-in record
      await db.checkInRecord.updateMany({
        where: { ticketNumber, flightNumber, date },
        data: { status: 'no-show' }
      });

      // Log off-load reason (could use audit log here)
      console.log(`Passenger ${ticketNumber} off-loaded: ${reason}`);

      return updatedPassenger;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to offload passenger: ${error.message}`);
      }
      throw new Error('Failed to offload passenger: Unknown error');
    }
  }

  /**
   * Get current boarding status for a flight
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns Current boarding status with statistics
   */
  async getBoardingStatus(
    flightNumber: string,
    date: string
  ): Promise<{
    status: BoardingStatus;
    statistics: BoardingStatistics;
    currentGroup?: BoardingGroup;
    timeRemaining?: number;
  }> {
    try {
      const boardingRecord = await db.boardingRecord.findUnique({
        where: { flightNumber_date: { flightNumber, date } },
        include: { passengers: true }
      });

      if (!boardingRecord) {
        throw new Error(`Boarding record not found`);
      }

      const boardedCount = boardingRecord.passengers.filter(p => p.status === 'boarded').length;
      const checkedInCount = await db.checkInRecord.count({
        where: { flightNumber, date, status: 'checked-in' }
      });
      const noShowCount = boardingRecord.passengers.filter(p => p.status === 'off-loaded').length;
      const standbyBoarded = boardingRecord.passengers.filter(
        p => p.isStandby && p.status === 'boarded'
      ).length;

      const completionPercentage = boardingRecord.totalPassengers > 0
        ? (boardedCount / boardingRecord.totalPassengers) * 100
        : 0;

      // Calculate estimated completion time
      let estimatedCompletionTime: Date | undefined;
      if (boardingRecord.status === 'boarding' && completionPercentage < 100) {
        const remainingPassengers = boardingRecord.totalPassengers - boardedCount;
        const remainingSeconds = remainingPassengers * BOARDING_TIME_PER_PASSENGER;
        estimatedCompletionTime = new Date(Date.now() + remainingSeconds * 1000);
      }

      // Determine current boarding group
      const currentGroup = this.determineCurrentGroup(boardingRecord);

      // Calculate time remaining until departure
      let timeRemaining: number | undefined;
      if (boardingRecord.status === 'boarding') {
        timeRemaining = Math.floor(
          (boardingRecord.scheduledDeparture.getTime() - Date.now()) / 60000
        );
      }

      return {
        status: boardingRecord.status as BoardingStatus,
        statistics: {
          totalPassengers: boardingRecord.totalPassengers,
          boardedPassengers: boardedCount,
          checkedInPassengers: checkedInCount,
          noShowPassengers: noShowCount,
          offloadedPassengers: noShowCount,
          standbyBoarded,
          completionPercentage,
          estimatedCompletionTime
        },
        currentGroup,
        timeRemaining
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get boarding status: ${error.message}`);
      }
      throw new Error('Failed to get boarding status: Unknown error');
    }
  }

  /**
   * Generate boarding sequence for a flight
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns Generated boarding sequence
   */
  async generateBoardingSequence(
    flightNumber: string,
    date: string
  ): Promise<PassengerBoardingData[]> {
    try {
      const checkedInPassengers = await db.checkInRecord.findMany({
        where: {
          flightNumber,
          date,
          status: 'checked-in'
        }
      });

      return this.generateBoardingSequenceInternal(checkedInPassengers);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate boarding sequence: ${error.message}`);
      }
      throw new Error('Failed to generate boarding sequence: Unknown error');
    }
  }

  /**
   * Complete the boarding process
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   */
  async completeBoarding(flightNumber: string, date: string): Promise<void> {
    try {
      await db.boardingRecord.update({
        where: { flightNumber_date: { flightNumber, date } },
        data: {
          status: 'completed',
          boardingCompleted: new Date()
        }
      });

      // Mark remaining checked-in passengers as no-show
      await db.checkInRecord.updateMany({
        where: {
          flightNumber,
          date,
          status: 'checked-in'
        },
        data: {
          status: 'no-show'
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to complete boarding: ${error.message}`);
      }
      throw new Error('Failed to complete boarding: Unknown error');
    }
  }

  /**
   * Check and trigger last call if needed
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns Whether last call was triggered
   */
  async checkLastCall(flightNumber: string, date: string): Promise<boolean> {
    try {
      const boardingRecord = await db.boardingRecord.findUnique({
        where: { flightNumber_date: { flightNumber, date } },
        include: { passengers: true }
      });

      if (!boardingRecord || boardingRecord.status !== 'boarding') {
        return false;
      }

      const timeToDeparture = boardingRecord.scheduledDeparture.getTime() - Date.now();
      const minutesToDeparture = timeToDeparture / 60000;

      // Trigger last call if within threshold
      if (minutesToDeparture <= LAST_CALL_THRESHOLD_MINUTES) {
        // Could trigger notification here
        console.log(`Last call triggered for flight ${flightNumber}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check last call:', error);
      return false;
    }
  }

  /**
   * Manage boarding lanes
   * 
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns List of active boarding lanes
   */
  async getBoardingLanes(flightNumber: string, date: string): Promise<BoardingLane[]> {
    // This would typically be configured per airport/gate
    // For now, return standard lanes
    return [
      {
        laneId: `${flightNumber}-${date}-lane-1`,
        laneNumber: 1,
        type: 'priority',
        active: true,
        passengersProcessed: 0
      },
      {
        laneId: `${flightNumber}-${date}-lane-2`,
        laneNumber: 2,
        type: 'general',
        active: true,
        passengersProcessed: 0
      },
      {
        laneId: `${flightNumber}-${date}-lane-3`,
        laneNumber: 3,
        type: 'special_assistance',
        active: false,
        passengersProcessed: 0
      }
    ];
  }

  /**
   * Generate and validate boarding pass
   * 
   * @param ticketNumber - The ticket number
   * @param flightNumber - The flight number
   * @param date - The flight date
   * @returns Boarding pass data
   */
  async generateBoardingPass(
    ticketNumber: string,
    flightNumber: string,
    date: string
  ) {
    try {
      const checkInRecord = await db.checkInRecord.findUnique({
        where: {
          ticketNumber_flightNumber: {
            ticketNumber,
            flightNumber
          }
        }
      });

      if (!checkInRecord) {
        throw new Error('Check-in record not found');
      }

      const flight = await db.flightInstance.findUnique({
        where: { flightNumber_date: { flightNumber, date } }
      });

      if (!flight) {
        throw new Error('Flight not found');
      }

      // Generate boarding pass data
      const boardingPassData = {
        ticketNumber,
        passengerName: checkInRecord.passengerName,
        flightNumber,
        date,
        origin: flight.origin,
        destination: flight.destination,
        scheduledDeparture: flight.scheduledDeparture,
        scheduledArrival: flight.scheduledArrival,
        gate: flight.gate,
        seatNumber: checkInRecord.seatNumber,
        boardingGroup: this.determineBoardingGroup(checkInRecord.seatNumber),
        boardingTime: checkInRecord.checkInTime,
        barcode: this.generateBoardingPassBarcode(ticketNumber, flightNumber, date)
      };

      // Update check-in record with boarding pass
      await db.checkInRecord.update({
        where: { id: checkInRecord.id },
        data: {
          boardingPassIssued: true,
          boardingPassData: JSON.stringify(boardingPassData)
        }
      });

      return boardingPassData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate boarding pass: ${error.message}`);
      }
      throw new Error('Failed to generate boarding pass: Unknown error');
    }
  }

  /**
   * Validate boarding pass
   * 
   * @param barcode - The boarding pass barcode
   * @returns Validation result
   */
  async validateBoardingPass(barcode: string): Promise<{
    valid: boolean;
    ticketNumber?: string;
    flightNumber?: string;
    date?: string;
    message?: string;
  }> {
    try {
      // Decode barcode (simplified - in production use proper encryption)
      const decoded = this.decodeBoardingPassBarcode(barcode);
      if (!decoded) {
        return { valid: false, message: 'Invalid barcode format' };
      }

      const { ticketNumber, flightNumber, date } = decoded;

      const checkInRecord = await db.checkInRecord.findUnique({
        where: {
          ticketNumber_flightNumber: {
            ticketNumber,
            flightNumber
          }
        }
      });

      if (!checkInRecord) {
        return { valid: false, message: 'Check-in record not found' };
      }

      if (checkInRecord.status === 'boarded') {
        return {
          valid: false,
          ticketNumber,
          flightNumber,
          date,
          message: 'Passenger already boarded'
        };
      }

      if (checkInRecord.status === 'no-show') {
        return {
          valid: false,
          ticketNumber,
          flightNumber,
          date,
          message: 'Passenger marked as no-show'
        };
      }

      return {
        valid: true,
        ticketNumber,
        flightNumber,
        date
      };
    } catch (error) {
      return { valid: false, message: 'Validation failed' };
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Generate boarding sequence internally
   * @private
   */
  private generateBoardingSequenceInternal(
    passengers: Array<{
      ticketNumber: string;
      passengerName: string;
      seatNumber: string;
      checkInTime: Date;
    }>
  ): PassengerBoardingData[] {
    // Determine priority for each passenger
    const withPriority = passengers.map(p => ({
      ...p,
      priority: this.determinePassengerPriority(p.seatNumber, p.checkInTime),
      isStandby: false, // Would be determined from booking
      documentsVerified: true, // Would come from check-in
      bagsChecked: 0 // Would come from baggage system
    }));

    // Sort by priority, then by check-in time within same priority
    withPriority.sort((a, b) => {
      const priorityOrder: Record<BoardingPriority, number> = {
        preboard: 1,
        first_class: 2,
        business: 3,
        elite_plus: 4,
        elite: 5,
        priority: 6,
        general: 7,
        standby: 8
      };

      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Within same priority, general boarding goes rear to front
      if (a.priority === 'general') {
        const rowA = parseInt(a.seatNumber.replace(/\D/g, '')) || 0;
        const rowB = parseInt(b.seatNumber.replace(/\D/g, '')) || 0;
        return rowB - rowA; // Higher row numbers first
      }

      return a.checkInTime.getTime() - b.checkInTime.getTime();
    });

    return withPriority;
  }

  /**
   * Determine passenger priority based on seat and other factors
   * @private
   */
  private determinePassengerPriority(
    seatNumber: string,
    checkInTime: Date
  ): BoardingPriority {
    const seatPrefix = seatNumber.charAt(0).toUpperCase();
    
    // First class seats (typically A-F in front rows)
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(seatPrefix)) {
      const row = parseInt(seatNumber.replace(/\D/g, '')) || 0;
      if (row <= 5) return 'first_class';
      if (row <= 15) return 'business';
    }

    return 'general';
  }

  /**
   * Identify priority passengers from list
   * @private
   */
  private identifyPriorityPassengers(
    passengers: Array<{ ticketNumber: string; passengerName: string; seatNumber: string }>
  ): PassengerBoardingData[] {
    return passengers
      .filter(p => {
        const priority = this.determinePassengerPriority(p.seatNumber, new Date());
        return priority !== 'general' && priority !== 'standby';
      })
      .map(p => ({
        ticketNumber: p.ticketNumber,
        passengerName: p.passengerName,
        seatNumber: p.seatNumber,
        priority: this.determinePassengerPriority(p.seatNumber, new Date()),
        isStandby: false,
        checkInTime: new Date(),
        documentsVerified: true,
        bagsChecked: 0
      }));
  }

  /**
   * Identify standby passengers
   * @private
   */
  private identifyStandbyPassengers(
    passengers: Array<{ ticketNumber: string; passengerName: string; seatNumber: string }>
  ): PassengerBoardingData[] {
    // In a real system, this would be determined from booking status
    return [];
  }

  /**
   * Get available seats for standby assignment
   * @private
   */
  private async getAvailableSeats(flightNumber: string, date: string): Promise<string[]> {
    // This would query the seat map for available seats
    // For now, return empty array
    return [];
  }

  /**
   * Determine current boarding group
   * @private
   */
  private determineCurrentGroup(boardingRecord: {
    passengers: Array<{ sequence: number; status: string }>;
  }): BoardingGroup | undefined {
    const boardedPassengers = boardingRecord.passengers.filter(p => p.status === 'boarded');
    if (boardedPassengers.length === 0) {
      return STANDARD_BOARDING_GROUPS[0];
    }

    const lastBoardedSequence = Math.max(...boardedPassengers.map(p => p.sequence));

    for (const group of STANDARD_BOARDING_GROUPS) {
      if (lastBoardedSequence >= group.startSequence && lastBoardedSequence <= group.endSequence) {
        return group;
      }
    }

    return undefined;
  }

  /**
   * Determine boarding group from seat number
   * @private
   */
  private determineBoardingGroup(seatNumber: string): string {
    const priority = this.determinePassengerPriority(seatNumber, new Date());
    const group = STANDARD_BOARDING_GROUPS.find(g => g.priority === priority);
    return group?.name || 'General';
  }

  /**
   * Generate boarding pass barcode
   * @private
   */
  private generateBoardingPassBarcode(
    ticketNumber: string,
    flightNumber: string,
    date: string
  ): string {
    // In production, use proper barcode generation
    return Buffer.from(`${ticketNumber}|${flightNumber}|${date}`).toString('base64');
  }

  /**
   * Decode boarding pass barcode
   * @private
   */
  private decodeBoardingPassBarcode(barcode: string): {
    ticketNumber: string;
    flightNumber: string;
    date: string;
  } | null {
    try {
      const decoded = Buffer.from(barcode, 'base64').toString('utf-8');
      const [ticketNumber, flightNumber, date] = decoded.split('|');
      if (!ticketNumber || !flightNumber || !date) {
        return null;
      }
      return { ticketNumber, flightNumber, date };
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const boardingEngine = new BoardingEngine();
