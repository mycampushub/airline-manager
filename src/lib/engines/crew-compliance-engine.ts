/**
 * Crew Compliance Engine
 * 
 * This engine handles all crew compliance-related business logic including:
 * - Duty time compliance monitoring (ICAO/EASA/FAA)
 * - Rest tracking and alerts
 * - Qualification tracking system
 * - License expiry alert system
 * - Fatigue risk monitoring
 * - Legal rest requirement enforcement
 * - Duty time calculation
 * - Flight time tracking
 * - Minimum rest between duties
 * - Maximum duty period limits
 * - Flight time limits (monthly, yearly)
 * - Crew pairing compliance checking
 */

import { db } from '@/lib/db';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Regulatory framework constants
 */
export enum RegulatoryFramework {
  ICAO = 'ICAO',
  EASA = 'EASA',
  FAA = 'FAA',
  CUSTOM = 'CUSTOM'
}

/**
 * Crew position types
 */
export enum CrewPosition {
  CAPTAIN = 'captain',
  FIRST_OFFICER = 'first_officer',
  PURSER = 'purser',
  FLIGHT_ATTENDANT = 'flight_attendant',
  FLIGHT_ENGINEER = 'flight_engineer'
}

/**
 * Time period types for flight time tracking
 */
export enum TimePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ROLLING_7_DAYS = 'rolling_7_days',
  ROLLING_28_DAYS = 'rolling_28_days',
  ROLLING_30_DAYS = 'rolling_30_days',
  ROLLING_12_MONTHS = 'rolling_12_months',
  CALENDAR_YEAR = 'calendar_year'
}

/**
 * Fatigue risk levels
 */
export enum FatigueRiskLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Compliance status
 */
export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  WARNING = 'warning',
  EXEMPT = 'exempt'
}

/**
 * Alert priority levels
 */
export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Regulatory limits for different frameworks
 */
interface RegulatoryLimits {
  framework: RegulatoryFramework;
  maxDutyPeriod: number; // Maximum duty period in hours
  minRestPeriod: number; // Minimum rest period in hours
  maxFlightTimeDaily: number; // Maximum flight time per day
  maxFlightTimeMonthly: number; // Maximum flight time per month
  maxFlightTimeYearly: number; // Maximum flight time per year
  maxFlightTimeRolling7Days: number; // Rolling 7-day limit
  maxFlightTimeRolling28Days: number; // Rolling 28-day limit
  maxFlightTimeRolling30Days: number; // Rolling 30-day limit
  maxFlightTimeRolling12Months: number; // Rolling 12-month limit
  augmentedCrewLimits: {
    twoPilots: number;
    threePilots: number;
    fourPilots: number;
  };
  nightDutyReduction: number; // Percentage reduction for night duties
  restAtBase: number; // Minimum rest at home base
  restAwayFromBase: number; // Minimum rest away from home base
}

/**
 * Duty time compliance result
 */
export interface DutyTimeComplianceResult {
  compliant: boolean;
  status: ComplianceStatus;
  framework: RegulatoryFramework;
  dutyTimeHours: number;
  maxDutyPeriod: number;
  flightTimeHours: number;
  maxFlightTime: number;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  recommendations: string[];
}

/**
 * Compliance violation details
 */
export interface ComplianceViolation {
  type: string;
  severity: string;
  description: string;
  regulatoryReference: string;
  actualValue: number;
  limitValue: number;
  exceedanceAmount: number;
  affectedCrew: string[];
  mitigationRequired: boolean;
}

/**
 * Compliance warning details
 */
export interface ComplianceWarning {
  type: string;
  description: string;
  thresholdPercentage: number;
  currentValue: number;
  limitValue: number;
  recommendations: string[];
}

/**
 * Rest status details
 */
export interface RestStatus {
  crewId: string;
  crewName: string;
  lastDutyEnd: Date;
  nextDutyStart: Date;
  restHours: number;
  minimumRestRequired: number;
  restSufficient: boolean;
  restType: 'at_base' | 'away_from_base' | 'split_duty';
  location: string;
  restQualityScore: number;
  fatigueRisk: FatigueRiskLevel;
  alerts: RestAlert[];
}

/**
 * Rest alert details
 */
export interface RestAlert {
  id: string;
  crewId: string;
  type: string;
  priority: AlertPriority;
  message: string;
  restHours: number;
  requiredRest: number;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

/**
 * Qualification status details
 */
export interface QualificationStatus {
  crewId: string;
  crewName: string;
  position: CrewPosition;
  allQualificationsValid: boolean;
  qualifications: QualificationDetail[];
  expiredQualifications: QualificationDetail[];
  expiringSoonQualifications: QualificationDetail[];
  missingQualifications: QualificationDetail[];
  canPerformAssignedDuties: boolean;
  restrictions: string[];
}

/**
 * Qualification detail
 */
export interface QualificationDetail {
  id: string;
  qualification: string;
  type: string;
  status: string;
  issueDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  issuingAuthority?: string;
  documentNumber?: string;
  validForRoutes?: string[];
  validForAircraft?: string[];
}

/**
 * License expiry alert
 */
export interface LicenseExpiryAlert {
  crewId: string;
  crewName: string;
  licenseNumber: string;
  licenseType: string;
  expiryDate: string;
  daysUntilExpiry: number;
  priority: AlertPriority;
  status: 'valid' | 'expiring_soon' | 'expired';
  actions: string[];
}

/**
 * Fatigue risk assessment result
 */
export interface FatigueRiskAssessment {
  scheduleId: string;
  crewId: string;
  crewName: string;
  overallRiskLevel: FatigueRiskLevel;
  riskScore: number;
  riskFactors: FatigueRiskFactor[];
  mitigationOptions: string[];
  requiresIntervention: boolean;
  recommendedActions: string[];
}

/**
 * Fatigue risk factor
 */
export interface FatigueRiskFactor {
  factor: string;
  weight: number;
  contribution: number;
  description: string;
  value: number;
  threshold: number;
}

/**
 * Duty time calculation result
 */
export interface DutyTimeCalculation {
  scheduleId: string;
  crewId: string;
  reportTime: Date;
  releaseTime: Date;
  totalDutyTimeHours: number;
  flightTimeHours: number;
  groundTimeHours: number;
  holdTimeHours: number;
  extensionUsed: number;
  originalDutyLimit: number;
  extendedDutyLimit: number;
  position: CrewPosition;
  framework: RegulatoryFramework;
}

/**
 * Flight time calculation result
 */
export interface FlightTimeCalculation {
  crewId: string;
  period: TimePeriod;
  periodStart: Date;
  periodEnd: Date;
  totalFlightTimeHours: number;
  flightsCount: number;
  position: CrewPosition;
  limit: number;
  remainingFlightTime: number;
  utilizationPercentage: number;
  projectedEndOfPeriod: number;
  onTrackForCompliance: boolean;
}

/**
 * Rest between duties check result
 */
export interface RestBetweenDutiesResult {
  compliant: boolean;
  previousDutyEnd: Date;
  nextDutyStart: Date;
  actualRestHours: number;
  requiredRestHours: number;
  restDeficit: number;
  restType: 'at_base' | 'away_from_base';
  isSplitDuty: boolean;
  framework: RegulatoryFramework;
  alerts: string[];
  recommendations: string[];
}

/**
 * Maximum duty period validation result
 */
export interface MaximumDutyPeriodValidation {
  valid: boolean;
  dutyHours: number;
  position: CrewPosition;
  framework: RegulatoryFramework;
  maxDutyPeriod: number;
  limit: number;
  extensionAvailable: number;
  extensionUsed: number;
  extensionConditions: string[];
  warnings: string[];
}

/**
 * Flight time limits check result
 */
export interface FlightTimeLimitsResult {
  crewId: string;
  position: CrewPosition;
  period: TimePeriod;
  compliant: boolean;
  flightTimeHours: number;
  limit: number;
  remainingHours: number;
  utilizationPercentage: number;
  violations: string[];
  warnings: string[];
  projections: {
    next7Days: number;
    next30Days: number;
  };
}

/**
 * Pairing compliance check result
 */
export interface PairingComplianceResult {
  pairingId: string;
  pairingNumber: string;
  compliant: boolean;
  complianceScore: number;
  violations: PairingComplianceViolation[];
  warnings: string[];
  totalFlightTime: number;
  totalDutyTime: number;
  restPeriods: RestPeriodDetail[];
  overnightStops: number;
  recommendations: string[];
  canProceed: boolean;
  mitigationRequired: boolean;
}

/**
 * Pairing compliance violation
 */
export interface PairingComplianceViolation {
  type: string;
  severity: string;
  description: string;
  location: string;
  flightNumbers: string[];
  actualValue: number;
  limitValue: number;
  regulatoryReference: string;
}

/**
 * Rest period detail
 */
export interface RestPeriodDetail {
  sequence: number;
  location: string;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  minimumRequired: number;
  sufficient: boolean;
  atHomeBase: boolean;
}

/**
 * Compliance report data
 */
export interface ComplianceReport {
  crewId: string;
  crewName: string;
  employeeNumber: string;
  position: CrewPosition;
  base: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  framework: RegulatoryFramework;
  overallCompliance: ComplianceStatus;
  complianceScore: number;
  flightTimeStats: FlightTimeStats;
  dutyTimeStats: DutyTimeStats;
  restStats: RestStats;
  qualifications: QualificationReportSection;
  violations: ReportViolation[];
  alerts: ReportAlert[];
  recommendations: string[];
  certificationValid: boolean;
  summary: string;
}

/**
 * Flight time statistics
 */
export interface FlightTimeStats {
  totalHours: number;
  dailyAverage: number;
  maxDaily: number;
  flightsCount: number;
  utilizationPercentage: number;
  monthlyBreakdown: MonthlyBreakdown[];
  limits: {
    daily: { actual: number; limit: number; remaining: number };
    monthly: { actual: number; limit: number; remaining: number };
    yearly: { actual: number; limit: number; remaining: number };
    rolling7Days: { actual: number; limit: number; remaining: number };
    rolling28Days: { actual: number; limit: number; remaining: number };
    rolling30Days: { actual: number; limit: number; remaining: number };
    rolling12Months: { actual: number; limit: number; remaining: number };
  };
}

/**
 * Monthly breakdown
 */
export interface MonthlyBreakdown {
  month: string;
  year: number;
  hours: number;
  flights: number;
}

/**
 * Duty time statistics
 */
export interface DutyTimeStats {
  totalDutyHours: number;
  averageDutyPerDay: number;
  maxDutyPeriod: number;
  earlyStarts: number;
  lateEnds: number;
  nightDuties: number;
  extensionsUsed: number;
}

/**
 * Rest statistics
 */
export interface RestStats {
  averageRestHours: number;
  minRestHours: number;
  restAtBasePercentage: number;
  insufficientRestCount: number;
  restQualityScore: number;
}

/**
 * Qualification report section
 */
export interface QualificationReportSection {
  totalQualifications: number;
  validQualifications: number;
  expiredQualifications: number;
  expiringSoon: number;
  allValid: boolean;
  criticalQualifications: QualificationDetail[];
}

/**
 * Report violation
 */
export interface ReportViolation {
  date: Date;
  type: string;
  description: string;
  severity: string;
  resolved: boolean;
  resolutionDate?: Date;
}

/**
 * Report alert
 */
export interface ReportAlert {
  date: Date;
  type: string;
  message: string;
  priority: AlertPriority;
  acknowledged: boolean;
}

// ============================================================================
// REGULATORY LIMITS CONFIGURATION
// ============================================================================

/**
 * Regulatory limits for different frameworks
 * These are based on standard aviation regulations
 */
const REGULATORY_LIMITS: Record<RegulatoryFramework, RegulatoryLimits> = {
  [RegulatoryFramework.ICAO]: {
    framework: RegulatoryFramework.ICAO,
    maxDutyPeriod: 13, // Standard maximum
    minRestPeriod: 10, // Minimum at home base
    maxFlightTimeDaily: 9,
    maxFlightTimeMonthly: 100,
    maxFlightTimeYearly: 1000,
    maxFlightTimeRolling7Days: 35,
    maxFlightTimeRolling28Days: 100,
    maxFlightTimeRolling30Days: 100,
    maxFlightTimeRolling12Months: 1000,
    augmentedCrewLimits: {
      twoPilots: 12,
      threePilots: 14,
      fourPilots: 16
    },
    nightDutyReduction: 15, // 15% reduction for night duties
    restAtBase: 10,
    restAwayFromBase: 11
  },
  [RegulatoryFramework.EASA]: {
    framework: RegulatoryFramework.EASA,
    maxDutyPeriod: 13,
    minRestPeriod: 11, // 12 hours reduced by actual duty time
    maxFlightTimeDaily: 9,
    maxFlightTimeMonthly: 100,
    maxFlightTimeYearly: 1000,
    maxFlightTimeRolling7Days: 35,
    maxFlightTimeRolling28Days: 190, // 190 hours in 28 consecutive days
    maxFlightTimeRolling30Days: 100,
    maxFlightTimeRolling12Months: 1000,
    augmentedCrewLimits: {
      twoPilots: 12,
      threePilots: 13,
      fourPilots: 14
    },
    nightDutyReduction: 20,
    restAtBase: 11,
    restAwayFromBase: 12
  },
  [RegulatoryFramework.FAA]: {
    framework: RegulatoryFramework.FAA,
    maxDutyPeriod: 13,
    minRestPeriod: 10, // 10-hour minimum rest
    maxFlightTimeDaily: 9,
    maxFlightTimeMonthly: 100,
    maxFlightTimeYearly: 1000,
    maxFlightTimeRolling7Days: 30, // 30 hours in 7 consecutive days
    maxFlightTimeRolling28Days: 100,
    maxFlightTimeRolling30Days: 100,
    maxFlightTimeRolling12Months: 1000,
    augmentedCrewLimits: {
      twoPilots: 12,
      threePilots: 13,
      fourPilots: 14
    },
    nightDutyReduction: 10,
    restAtBase: 10,
    restAwayFromBase: 11
  },
  [RegulatoryFramework.CUSTOM]: {
    framework: RegulatoryFramework.CUSTOM,
    maxDutyPeriod: 14,
    minRestPeriod: 10,
    maxFlightTimeDaily: 10,
    maxFlightTimeMonthly: 110,
    maxFlightTimeYearly: 1100,
    maxFlightTimeRolling7Days: 40,
    maxFlightTimeRolling28Days: 110,
    maxFlightTimeRolling30Days: 110,
    maxFlightTimeRolling12Months: 1100,
    augmentedCrewLimits: {
      twoPilots: 13,
      threePilots: 15,
      fourPilots: 17
    },
    nightDutyReduction: 10,
    restAtBase: 10,
    restAwayFromBase: 11
  }
};

/**
 * Default regulatory framework
 */
const DEFAULT_FRAMEWORK = RegulatoryFramework.EASA;

// ============================================================================
// CREW COMPLIANCE ENGINE CLASS
// ============================================================================

export class CrewComplianceEngine {
  private framework: RegulatoryFramework;

  constructor(framework: RegulatoryFramework = DEFAULT_FRAMEWORK) {
    this.framework = framework;
  }

  /**
   * Set the regulatory framework
   */
  public setFramework(framework: RegulatoryFramework): void {
    this.framework = framework;
  }

  /**
   * Get current regulatory framework
   */
  public getFramework(): RegulatoryFramework {
    return this.framework;
  }

  /**
   * Get regulatory limits for current framework
   */
  public getRegulatoryLimits(): RegulatoryLimits {
    return REGULATORY_LIMITS[this.framework];
  }

  // ========================================================================
  // DUTY TIME COMPLIANCE
  // ========================================================================

  /**
   * Check duty time compliance for a schedule
   * @param scheduleId - The ID of the crew schedule
   * @param framework - Optional regulatory framework override
   * @returns Compliance check result
   */
  public async checkDutyTimeCompliance(
    scheduleId: string,
    framework?: RegulatoryFramework
  ): Promise<DutyTimeComplianceResult> {
    try {
      const activeFramework = framework || this.framework;
      const limits = REGULATORY_LIMITS[activeFramework];

      // Fetch schedule with crew member details
      const schedule = await db.crewSchedule.findUnique({
        where: { id: scheduleId },
        include: { crewMember: true }
      });

      if (!schedule) {
        throw new Error(`Schedule not found: ${scheduleId}`);
      }

      const crewMember = schedule.crewMember;
      const position = crewMember.position as CrewPosition;

      // Calculate duty time
      const dutyTimeCalc = this.calculateDutyTimeFromSchedule(schedule);
      
      // Get flight time for the period
      const flightTime = dutyTimeCalc.flightTimeHours;

      // Get position-specific limits
      const maxDutyPeriod = this.getPositionSpecificLimit(position, 'maxDutyPeriod', limits);
      const maxFlightTime = this.getPositionSpecificLimit(position, 'maxFlightTimeDaily', limits);

      // Check for violations
      const violations: ComplianceViolation[] = [];
      const warnings: ComplianceWarning[] = [];
      const recommendations: string[] = [];

      // Check duty time limit
      if (dutyTimeCalc.totalDutyTimeHours > maxDutyPeriod) {
        violations.push({
          type: 'DUTY_TIME_EXCEEDED',
          severity: 'critical',
          description: `Duty time exceeds maximum allowable limit for ${position}`,
          regulatoryReference: `${activeFramework} FTL.120`,
          actualValue: dutyTimeCalc.totalDutyTimeHours,
          limitValue: maxDutyPeriod,
          exceedanceAmount: dutyTimeCalc.totalDutyTimeHours - maxDutyPeriod,
          affectedCrew: [crewMember.employeeNumber],
          mitigationRequired: true
        });
      } else if (dutyTimeCalc.totalDutyTimeHours > maxDutyPeriod * 0.9) {
        warnings.push({
          type: 'DUTY_TIME_NEAR_LIMIT',
          description: `Duty time approaching maximum limit (${((dutyTimeCalc.totalDutyTimeHours / maxDutyPeriod) * 100).toFixed(1)}%)`,
          thresholdPercentage: 90,
          currentValue: dutyTimeCalc.totalDutyTimeHours,
          limitValue: maxDutyPeriod,
          recommendations: ['Consider schedule adjustment', 'Monitor crew fatigue closely']
        });
      }

      // Check flight time limit
      if (flightTime > maxFlightTime) {
        violations.push({
          type: 'FLIGHT_TIME_EXCEEDED',
          severity: 'critical',
          description: `Flight time exceeds maximum daily limit for ${position}`,
          regulatoryReference: `${activeFramework} FTL.110`,
          actualValue: flightTime,
          limitValue: maxFlightTime,
          exceedanceAmount: flightTime - maxFlightTime,
          affectedCrew: [crewMember.employeeNumber],
          mitigationRequired: true
        });
      }

      // Check for night duty considerations
      const isNightDuty = this.isNightDuty(schedule);
      if (isNightDuty) {
        const reducedLimit = maxDutyPeriod * (1 - limits.nightDutyReduction / 100);
        if (dutyTimeCalc.totalDutyTimeHours > reducedLimit) {
          violations.push({
            type: 'NIGHT_DUTY_EXCEEDED',
            severity: 'high',
            description: `Night duty exceeds reduced limit`,
            regulatoryReference: `${activeFramework} FTL.130`,
            actualValue: dutyTimeCalc.totalDutyTimeHours,
            limitValue: reducedLimit,
            exceedanceAmount: dutyTimeCalc.totalDutyTimeHours - reducedLimit,
            affectedCrew: [crewMember.employeeNumber],
            mitigationRequired: true
          });
        }
      }

      // Generate recommendations
      if (warnings.length > 0) {
        recommendations.push('Review schedule for optimization opportunities');
        recommendations.push('Consider adding rest periods');
      }

      const compliant = violations.length === 0;
      const status = violations.length > 0 
        ? ComplianceStatus.NON_COMPLIANT 
        : warnings.length > 0 
          ? ComplianceStatus.WARNING 
          : ComplianceStatus.COMPLIANT;

      return {
        compliant,
        status,
        framework: activeFramework,
        dutyTimeHours: dutyTimeCalc.totalDutyTimeHours,
        maxDutyPeriod,
        flightTimeHours: flightTime,
        maxFlightTime,
        violations,
        warnings,
        recommendations
      };

    } catch (error) {
      throw new Error(`Failed to check duty time compliance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // REST REQUIREMENTS MONITORING
  // ========================================================================

  /**
   * Monitor rest requirements for a crew member
   * @param crewId - The ID of the crew member
   * @returns Rest status with alerts
   */
  public async monitorRestRequirements(crewId: string): Promise<RestStatus> {
    try {
      const crewMember = await db.crewMember.findUnique({
        where: { id: crewId }
      });

      if (!crewMember) {
        throw new Error(`Crew member not found: ${crewId}`);
      }

      const limits = REGULATORY_LIMITS[this.framework];

      // Get previous and upcoming schedules
      const previousSchedule = await db.crewSchedule.findFirst({
        where: {
          crewId,
          status: 'completed',
          endDate: { lte: new Date() }
        },
        orderBy: { endDate: 'desc' }
      });

      const nextSchedule = await db.crewSchedule.findFirst({
        where: {
          crewId,
          status: 'scheduled',
          startDate: { gte: new Date() }
        },
        orderBy: { startDate: 'asc' }
      });

      if (!previousSchedule || !nextSchedule) {
        // Return default status if schedules not found
        return {
          crewId,
          crewName: `${crewMember.firstName} ${crewMember.lastName}`,
          lastDutyEnd: new Date(),
          nextDutyStart: new Date(),
          restHours: 0,
          minimumRestRequired: limits.minRestPeriod,
          restSufficient: false,
          restType: 'at_base',
          location: crewMember.base,
          restQualityScore: 0,
          fatigueRisk: FatigueRiskLevel.LOW,
          alerts: []
        };
      }

      // Calculate rest period
      const lastDutyEnd = new Date(`${previousSchedule.endDate}T${previousSchedule.endTime}`);
      const nextDutyStart = new Date(`${nextSchedule.startDate}T${nextSchedule.startTime}`);
      const restHours = (nextDutyStart.getTime() - lastDutyEnd.getTime()) / (1000 * 60 * 60);

      // Determine rest type
      const isAtBase = crewMember.base === (nextSchedule.hotelInfo ? 
        JSON.parse(nextSchedule.hotelInfo).location : crewMember.base);
      const restType = isAtBase ? 'at_base' : 'away_from_base';
      const minRest = isAtBase ? limits.restAtBase : limits.restAwayFromBase;

      // Calculate fatigue risk
      const fatigueRisk = this.assessFatigueRiskFromRest(restHours, minRest, previousSchedule);

      // Generate alerts
      const alerts: RestAlert[] = [];
      if (restHours < minRest) {
        alerts.push({
          id: `rest-insufficient-${Date.now()}`,
          crewId,
          type: 'INSUFFICIENT_REST',
          priority: AlertPriority.CRITICAL,
          message: `Insufficient rest: ${restHours.toFixed(1)}h (required: ${minRest}h)`,
          restHours,
          requiredRest: minRest,
          createdAt: new Date(),
          acknowledged: false
        });
      } else if (restHours < minRest * 1.2) {
        alerts.push({
          id: `rest-minimal-${Date.now()}`,
          crewId,
          type: 'MINIMAL_REST',
          priority: AlertPriority.HIGH,
          message: `Minimal rest: ${restHours.toFixed(1)}h (recommended: ${(minRest * 1.5).toFixed(1)}h)`,
          restHours,
          requiredRest: minRest,
          createdAt: new Date(),
          acknowledged: false
        });
      }

      return {
        crewId,
        crewName: `${crewMember.firstName} ${crewMember.lastName}`,
        lastDutyEnd,
        nextDutyStart,
        restHours,
        minimumRestRequired: minRest,
        restSufficient: restHours >= minRest,
        restType,
        location: isAtBase ? crewMember.base : (nextSchedule.hotelInfo ? 
          JSON.parse(nextSchedule.hotelInfo).location : 'Unknown'),
        restQualityScore: this.calculateRestQualityScore(restHours, minRest),
        fatigueRisk,
        alerts
      };

    } catch (error) {
      throw new Error(`Failed to monitor rest requirements: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // QUALIFICATIONS CHECKING
  // ========================================================================

  /**
   * Check qualifications for a crew member for a specific position
   * @param crewId - The ID of the crew member
   * @param position - The position to check qualifications for
   * @returns Qualification status
   */
  public async checkQualifications(
    crewId: string,
    position: CrewPosition
  ): Promise<QualificationStatus> {
    try {
      const crewMember = await db.crewMember.findUnique({
        where: { id: crewId }
      });

      if (!crewMember) {
        throw new Error(`Crew member not found: ${crewId}`);
      }

      // Get all qualifications for the crew member
      const qualifications = await db.crewQualification.findMany({
        where: { crewId }
      });

      const now = new Date();
      const qualificationDetails: QualificationDetail[] = qualifications.map(q => ({
        id: q.id,
        qualification: q.qualification,
        type: q.type,
        status: q.status,
        issueDate: q.issueDate,
        expiryDate: q.expiryDate,
        daysUntilExpiry: Math.floor((new Date(q.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        issuingAuthority: q.issuingAuthority,
        documentNumber: q.documentNumber
      }));

      // Get required qualifications for the position
      const requiredQualifications = this.getRequiredQualifications(position);

      // Check for expired qualifications
      const expiredQualifications = qualificationDetails.filter(
        q => q.daysUntilExpiry < 0 || q.status === 'expired'
      );

      // Check for qualifications expiring soon (within 30 days)
      const expiringSoon = qualificationDetails.filter(
        q => q.daysUntilExpiry >= 0 && q.daysUntilExpiry <= 30
      );

      // Check for missing qualifications
      const existingQualificationNames = new Set(qualificationDetails.map(q => q.qualification));
      const missingQualifications = requiredQualifications
        .filter(req => !existingQualificationNames.has(req))
        .map(req => ({
          id: `missing-${req}`,
          qualification: req,
          type: 'required',
          status: 'missing',
          issueDate: '',
          expiryDate: '',
          daysUntilExpiry: 0
        } as QualificationDetail));

      const allValid = expiredQualifications.length === 0 && missingQualifications.length === 0;
      const canPerformAssignedDuties = allValid && expiringSoon.length === 0;

      // Generate restrictions
      const restrictions: string[] = [];
      if (expiredQualifications.length > 0) {
        restrictions.push('Cannot perform flight duties until expired qualifications are renewed');
      }
      if (missingQualifications.length > 0) {
        restrictions.push('Cannot perform duties requiring missing qualifications');
      }

      return {
        crewId,
        crewName: `${crewMember.firstName} ${crewMember.lastName}`,
        position,
        allQualificationsValid: allValid,
        qualifications: qualificationDetails,
        expiredQualifications,
        expiringSoonQualifications: expiringSoon,
        missingQualifications,
        canPerformAssignedDuties,
        restrictions
      };

    } catch (error) {
      throw new Error(`Failed to check qualifications: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // LICENSE EXPIRY ALERTS
  // ========================================================================

  /**
   * Alert about license expiry for a crew member
   * @param crewId - The ID of the crew member
   * @returns License expiry alert information
   */
  public async alertLicenseExpiry(crewId: string): Promise<LicenseExpiryAlert> {
    try {
      const crewMember = await db.crewMember.findUnique({
        where: { id: crewId }
      });

      if (!crewMember) {
        throw new Error(`Crew member not found: ${crewId}`);
      }

      const now = new Date();
      const expiryDate = new Date(crewMember.licenseExpiry);
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Determine priority based on days until expiry
      let priority: AlertPriority;
      let status: 'valid' | 'expiring_soon' | 'expired';
      let actions: string[] = [];

      if (daysUntilExpiry < 0) {
        priority = AlertPriority.CRITICAL;
        status = 'expired';
        actions = [
          'Immediately ground crew member',
          'Schedule license renewal',
          'Arrange temporary replacement',
          'Notify operations management'
        ];
      } else if (daysUntilExpiry <= 30) {
        priority = daysUntilExpiry <= 7 ? AlertPriority.CRITICAL : AlertPriority.HIGH;
        status = 'expiring_soon';
        actions = [
          'Schedule license renewal appointment',
          'Ensure all renewal requirements are met',
          'Plan for potential replacement if renewal delayed',
          'Monitor renewal progress'
        ];
      } else if (daysUntilExpiry <= 90) {
        priority = AlertPriority.MEDIUM;
        status = 'expiring_soon';
        actions = [
          'Begin renewal preparation',
          'Check medical certificate validity',
          'Verify training currency'
        ];
      } else {
        priority = AlertPriority.LOW;
        status = 'valid';
        actions = [
          'Continue monitoring',
          'Ensure training currency maintained'
        ];
      }

      return {
        crewId,
        crewName: `${crewMember.firstName} ${crewMember.lastName}`,
        licenseNumber: crewMember.licenseNumber,
        licenseType: crewMember.position,
        expiryDate: crewMember.licenseExpiry,
        daysUntilExpiry,
        priority,
        status,
        actions
      };

    } catch (error) {
      throw new Error(`Failed to alert license expiry: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // FATIGUE RISK MONITORING
  // ========================================================================

  /**
   * Monitor fatigue risk for a schedule
   * @param scheduleId - The ID of the crew schedule
   * @returns Fatigue risk assessment
   */
  public async monitorFatigueRisk(scheduleId: string): Promise<FatigueRiskAssessment> {
    try {
      const schedule = await db.crewSchedule.findUnique({
        where: { id: scheduleId },
        include: { crewMember: true }
      });

      if (!schedule) {
        throw new Error(`Schedule not found: ${scheduleId}`);
      }

      const crewMember = schedule.crewMember;

      // Get recent schedules for fatigue analysis
      const recentSchedules = await db.crewSchedule.findMany({
        where: {
          crewId: schedule.crewId,
          startDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        },
        orderBy: { startDate: 'desc' },
        take: 10
      });

      // Assess fatigue risk factors
      const riskFactors: FatigueRiskFactor[] = [];

      // Factor 1: Previous duty hours
      const previousDutyHours = recentSchedules.reduce((sum, s) => sum + (s.dutyHours || 0), 0);
      riskFactors.push({
        factor: 'Previous 7-day duty hours',
        weight: 0.25,
        contribution: 0,
        description: 'Total duty hours in the past 7 days',
        value: previousDutyHours,
        threshold: 60 // 60 hours in 7 days is high
      });

      // Factor 2: Early morning start
      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const earlyStart = startHour < 6;
      riskFactors.push({
        factor: 'Early morning start',
        weight: 0.15,
        contribution: 0,
        description: 'Duty starting before 6 AM',
        value: earlyStart ? 1 : 0,
        threshold: 1
      });

      // Factor 3: Late night end
      const endHour = parseInt(schedule.endTime.split(':')[0]);
      const lateEnd = endHour >= 22 || endHour < 2;
      riskFactors.push({
        factor: 'Late night end',
        weight: 0.15,
        contribution: 0,
        description: 'Duty ending after 10 PM or before 2 AM',
        value: lateEnd ? 1 : 0,
        threshold: 1
      });

      // Factor 4: Flight time
      const flightTime = schedule.dutyHours * 0.6; // Estimate flight time as 60% of duty
      riskFactors.push({
        factor: 'Flight time',
        weight: 0.2,
        contribution: 0,
        description: 'Estimated flight time for this duty',
        value: flightTime,
        threshold: 8 // 8 hours is high
      });

      // Factor 5: Time zone changes (simplified)
      const timeZoneChanges = 0; // Would need route data
      riskFactors.push({
        factor: 'Time zone changes',
        weight: 0.1,
        contribution: 0,
        description: 'Number of time zones crossed',
        value: timeZoneChanges,
        threshold: 3
      });

      // Factor 6: Rest quality (from previous rest)
      const previousSchedule = recentSchedules[0];
      let restQualityScore = 100;
      if (previousSchedule) {
        const nextSchedule = schedule;
        const prevEnd = new Date(`${previousSchedule.endDate}T${previousSchedule.endTime}`);
        const nextStart = new Date(`${nextSchedule.startDate}T${nextSchedule.startTime}`);
        const restHours = (nextStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60);
        restQualityScore = Math.min(100, (restHours / 11) * 100);
      }
      riskFactors.push({
        factor: 'Rest quality',
        weight: 0.15,
        contribution: 0,
        description: 'Quality of rest before this duty',
        value: 100 - restQualityScore,
        threshold: 30
      });

      // Calculate total risk score
      let totalRisk = 0;
      riskFactors.forEach(factor => {
        const ratio = Math.min(factor.value / factor.threshold, 1.5);
        factor.contribution = ratio * factor.weight * 100;
        totalRisk += factor.contribution;
      });

      // Determine overall risk level
      let riskLevel: FatigueRiskLevel;
      let requiresIntervention = false;
      const recommendedActions: string[] = [];

      if (totalRisk < 30) {
        riskLevel = FatigueRiskLevel.LOW;
      } else if (totalRisk < 50) {
        riskLevel = FatigueRiskLevel.MODERATE;
        recommendedActions.push('Monitor crew member for fatigue signs');
        recommendedActions.push('Ensure adequate rest facilities');
      } else if (totalRisk < 70) {
        riskLevel = FatigueRiskLevel.HIGH;
        requiresIntervention = true;
        recommendedActions.push('Consider schedule adjustment');
        recommendedActions.push('Implement fatigue mitigation measures');
        recommendedActions.push('Increase monitoring frequency');
      } else {
        riskLevel = FatigueRiskLevel.CRITICAL;
        requiresIntervention = true;
        recommendedActions.push('Immediate schedule review required');
        recommendedActions.push('Consider crew replacement');
        recommendedActions.push('Implement maximum fatigue mitigation');
        recommendedActions.push('Alert crew scheduling supervisor');
      }

      return {
        scheduleId,
        crewId: crewMember.id,
        crewName: `${crewMember.firstName} ${crewMember.lastName}`,
        overallRiskLevel: riskLevel,
        riskScore: Math.round(totalRisk),
        riskFactors,
        mitigationOptions: this.getFatigueMitigationOptions(riskLevel),
        requiresIntervention,
        recommendedActions
      };

    } catch (error) {
      throw new Error(`Failed to monitor fatigue risk: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // DUTY TIME CALCULATION
  // ========================================================================

  /**
   * Calculate duty time for a schedule
   * @param scheduleId - The ID of the crew schedule
   * @returns Duty time calculation
   */
  public async calculateDutyTime(scheduleId: string): Promise<DutyTimeCalculation> {
    try {
      const schedule = await db.crewSchedule.findUnique({
        where: { id: scheduleId },
        include: { crewMember: true }
      });

      if (!schedule) {
        throw new Error(`Schedule not found: ${scheduleId}`);
      }

      return this.calculateDutyTimeFromSchedule(schedule);

    } catch (error) {
      throw new Error(`Failed to calculate duty time: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate duty time from schedule object
   * @param schedule - Crew schedule object
   * @returns Duty time calculation
   */
  private calculateDutyTimeFromSchedule(schedule: any): DutyTimeCalculation {
    const reportTime = new Date(`${schedule.startDate}T${schedule.startTime}`);
    const releaseTime = new Date(`${schedule.endDate}T${schedule.endTime}`);
    
    const totalDutyTimeMs = releaseTime.getTime() - reportTime.getTime();
    const totalDutyTimeHours = totalDutyTimeMs / (1000 * 60 * 60);

    // Estimate flight time (typically 60-70% of duty time for flight duties)
    const flightTimeHours = schedule.type === 'flight' ? totalDutyTimeHours * 0.65 : 0;
    const groundTimeHours = totalDutyTimeHours - flightTimeHours;
    const holdTimeHours = 0; // Would need actual flight data

    const position = schedule.crewMember.position as CrewPosition;
    const limits = REGULATORY_LIMITS[this.framework];
    const originalDutyLimit = this.getPositionSpecificLimit(position, 'maxDutyPeriod', limits);

    return {
      scheduleId: schedule.id,
      crewId: schedule.crewId,
      reportTime,
      releaseTime,
      totalDutyTimeHours,
      flightTimeHours,
      groundTimeHours,
      holdTimeHours,
      extensionUsed: 0,
      originalDutyLimit,
      extendedDutyLimit: originalDutyLimit,
      position,
      framework: this.framework
    };
  }

  // ========================================================================
  // FLIGHT TIME CALCULATION
  // ========================================================================

  /**
   * Calculate flight time for a crew member over a period
   * @param crewId - The ID of the crew member
   * @param period - Time period to calculate
   * @returns Flight time calculation
   */
  public async calculateFlightTime(
    crewId: string,
    period: TimePeriod
  ): Promise<FlightTimeCalculation> {
    try {
      const crewMember = await db.crewMember.findUnique({
        where: { id: crewId }
      });

      if (!crewMember) {
        throw new Error(`Crew member not found: ${crewId}`);
      }

      const position = crewMember.position as CrewPosition;
      const { startDate, endDate } = this.getPeriodDates(period);

      // Get schedules for the period
      const schedules = await db.crewSchedule.findMany({
        where: {
          crewId,
          type: 'flight',
          startDate: { gte: startDate.toISOString().split('T')[0] },
          endDate: { lte: endDate.toISOString().split('T')[0] }
        }
      });

      // Calculate total flight time
      let totalFlightTime = 0;
      schedules.forEach(schedule => {
        const dutyTime = schedule.dutyHours || 0;
        totalFlightTime += dutyTime * 0.65; // Estimate flight time as 65% of duty
      });

      // Get appropriate limit
      const limits = REGULATORY_LIMITS[this.framework];
      const limit = this.getFlightTimeLimit(period, position, limits);

      const remainingFlightTime = Math.max(0, limit - totalFlightTime);
      const utilizationPercentage = (totalFlightTime / limit) * 100;
      const projectedEndOfPeriod = totalFlightTime + (schedules.length * 4); // Simple projection

      return {
        crewId,
        period,
        periodStart: startDate,
        periodEnd: endDate,
        totalFlightTimeHours: Math.round(totalFlightTime * 100) / 100,
        flightsCount: schedules.length,
        position,
        limit,
        remainingFlightTime: Math.round(remainingFlightTime * 100) / 100,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        projectedEndOfPeriod: Math.round(projectedEndOfPeriod * 100) / 100,
        onTrackForCompliance: totalFlightTime <= limit
      };

    } catch (error) {
      throw new Error(`Failed to calculate flight time: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // REST BETWEEN DUTIES CHECK
  // ========================================================================

  /**
   * Check rest requirements between duties
   * @param previousDuty - Previous duty end time
   * @param nextDuty - Next duty start time
   * @returns Rest between duties check result
   */
  public checkRestBetweenDuties(
    previousDuty: Date,
    nextDuty: Date
  ): RestBetweenDutiesResult {
    try {
      const limits = REGULATORY_LIMITS[this.framework];
      
      const actualRestHours = (nextDuty.getTime() - previousDuty.getTime()) / (1000 * 60 * 60);
      const requiredRestHours = limits.minRestPeriod;
      const restDeficit = Math.max(0, requiredRestHours - actualRestHours);
      const compliant = actualRestHours >= requiredRestHours;

      const alerts: string[] = [];
      const recommendations: string[] = [];

      if (!compliant) {
        alerts.push(`Insufficient rest: ${actualRestHours.toFixed(1)}h (required: ${requiredRestHours}h)`);
        recommendations.push('Adjust next duty start time');
        recommendations.push('Review schedule compliance');
      } else if (actualRestHours < requiredRestHours * 1.2) {
        alerts.push(`Minimal rest: ${actualRestHours.toFixed(1)}h`);
        recommendations.push('Monitor crew fatigue closely');
      }

      return {
        compliant,
        previousDutyEnd: previousDuty,
        nextDutyStart: nextDuty,
        actualRestHours,
        requiredRestHours,
        restDeficit,
        restType: 'at_base',
        isSplitDuty: false,
        framework: this.framework,
        alerts,
        recommendations
      };

    } catch (error) {
      throw new Error(`Failed to check rest between duties: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // MAXIMUM DUTY PERIOD VALIDATION
  // ========================================================================

  /**
   * Validate maximum duty period
   * @param dutyHours - Duty hours to validate
   * @param position - Crew position
   * @returns Validation result
   */
  public validateMaximumDutyPeriod(
    dutyHours: number,
    position: CrewPosition
  ): MaximumDutyPeriodValidation {
    try {
      const limits = REGULATORY_LIMITS[this.framework];
      const maxDutyPeriod = this.getPositionSpecificLimit(position, 'maxDutyPeriod', limits);

      const valid = dutyHours <= maxDutyPeriod;
      const extensionAvailable = Math.max(0, maxDutyPeriod - dutyHours);

      const warnings: string[] = [];
      if (dutyHours > maxDutyPeriod * 0.9) {
        warnings.push(`Duty time approaching maximum: ${((dutyHours / maxDutyPeriod) * 100).toFixed(1)}%`);
      }

      return {
        valid,
        dutyHours,
        position,
        framework: this.framework,
        maxDutyPeriod,
        limit: maxDutyPeriod,
        extensionAvailable,
        extensionUsed: 0,
        extensionConditions: [
          'Extensions require operational justification',
          'Extensions must be documented',
          'Extensions require crew notification',
          'Maximum extension: 2 hours'
        ],
        warnings
      };

    } catch (error) {
      throw new Error(`Failed to validate maximum duty period: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // FLIGHT TIME LIMITS CHECK
  // ========================================================================

  /**
   * Check flight time limits for a crew member
   * @param crewId - The ID of the crew member
   * @param period - Time period to check
   * @param position - Crew position
   * @returns Flight time limits check result
   */
  public async checkFlightTimeLimits(
    crewId: string,
    period: TimePeriod,
    position?: CrewPosition
  ): Promise<FlightTimeLimitsResult> {
    try {
      const crewMember = await db.crewMember.findUnique({
        where: { id: crewId }
      });

      if (!crewMember) {
        throw new Error(`Crew member not found: ${crewId}`);
      }

      const crewPosition = position || crewMember.position as CrewPosition;
      const limits = REGULATORY_LIMITS[this.framework];
      const limit = this.getFlightTimeLimit(period, crewPosition, limits);

      // Calculate flight time for the period
      const { startDate, endDate } = this.getPeriodDates(period);
      const schedules = await db.crewSchedule.findMany({
        where: {
          crewId,
          type: 'flight',
          startDate: { gte: startDate.toISOString().split('T')[0] },
          endDate: { lte: endDate.toISOString().split('T')[0] }
        }
      });

      let flightTimeHours = 0;
      schedules.forEach(schedule => {
        flightTimeHours += (schedule.dutyHours || 0) * 0.65;
      });

      const remainingHours = Math.max(0, limit - flightTimeHours);
      const utilizationPercentage = (flightTimeHours / limit) * 100;
      const compliant = flightTimeHours <= limit;

      const violations: string[] = [];
      const warnings: string[] = [];

      if (!compliant) {
        violations.push(`Flight time exceeds ${period} limit: ${flightTimeHours.toFixed(1)}h / ${limit}h`);
      } else if (utilizationPercentage > 90) {
        warnings.push(`Flight time approaching ${period} limit: ${utilizationPercentage.toFixed(1)}%`);
      }

      return {
        crewId,
        position: crewPosition,
        period,
        compliant,
        flightTimeHours: Math.round(flightTimeHours * 100) / 100,
        limit,
        remainingHours: Math.round(remainingHours * 100) / 100,
        utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
        violations,
        warnings,
        projections: {
          next7Days: flightTimeHours + 20, // Estimate
          next30Days: flightTimeHours + 80 // Estimate
        }
      };

    } catch (error) {
      throw new Error(`Failed to check flight time limits: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // PAIRING COMPLIANCE CHECKING
  // ========================================================================

  /**
   * Check pairing compliance
   * @param pairingId - The ID of the crew pairing
   * @returns Pairing compliance check result
   */
  public async checkPairingCompliance(pairingId: string): Promise<PairingComplianceResult> {
    try {
      const pairing = await db.crewPairing.findUnique({
        where: { id: pairingId }
      });

      if (!pairing) {
        throw new Error(`Pairing not found: ${pairingId}`);
      }

      const flights = JSON.parse(pairing.flights);
      const restPeriods = JSON.parse(pairing.restPeriods);
      const limits = REGULATORY_LIMITS[this.framework];

      const violations: PairingComplianceViolation[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      // Check total flight time
      const maxFlightTime = limits.maxFlightTimeRolling28Days;
      if (pairing.totalFlightTime > maxFlightTime) {
        violations.push({
          type: 'TOTAL_FLIGHT_TIME_EXCEEDED',
          severity: 'critical',
          description: `Total flight time exceeds 28-day limit`,
          location: 'entire pairing',
          flightNumbers: flights,
          actualValue: pairing.totalFlightTime,
          limitValue: maxFlightTime,
          regulatoryReference: `${this.framework} FTL.220`
        });
      }

      // Check total duty time
      const maxDutyTime = maxFlightTime * 1.5; // Rough estimate
      if (pairing.totalDutyTime > maxDutyTime) {
        violations.push({
          type: 'TOTAL_DUTY_TIME_EXCEEDED',
          severity: 'critical',
          description: `Total duty time exceeds allowable limit`,
          location: 'entire pairing',
          flightNumbers: flights,
          actualValue: pairing.totalDutyTime,
          limitValue: maxDutyTime,
          regulatoryReference: `${this.framework} FTL.230`
        });
      }

      // Check rest periods
      const restPeriodDetails: RestPeriodDetail[] = [];
      let insufficientRestCount = 0;

      restPeriods.forEach((rest: any, index: number) => {
        const startTime = new Date(rest.startTime);
        const endTime = new Date(rest.endTime);
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const minRequired = limits.minRestPeriod;
        const sufficient = duration >= minRequired;

        if (!sufficient) {
          insufficientRestCount++;
          violations.push({
            type: 'INSUFFICIENT_REST',
            severity: 'high',
            description: `Rest period ${index + 1} insufficient`,
            location: rest.location,
            flightNumbers: [rest.precedingFlight],
            actualValue: duration,
            limitValue: minRequired,
            regulatoryReference: `${this.framework} FTL.250`
          });
        }

        restPeriodDetails.push({
          sequence: index + 1,
          location: rest.location,
          startTime,
          endTime,
          durationHours: duration,
          minimumRequired: minRequired,
          sufficient,
          atHomeBase: rest.atHomeBase || false
        });
      });

      // Generate warnings
      if (pairing.overnightStops > 4) {
        warnings.push('High number of overnight stops - consider fatigue impact');
      }

      // Generate recommendations
      if (insufficientRestCount > 0) {
        recommendations.push('Review rest period scheduling');
        recommendations.push('Consider reducing number of flights in pairing');
      }
      if (pairing.overnightStops > 3) {
        recommendations.push('Consider reducing overnight stops to improve rest quality');
      }

      const compliant = violations.length === 0;
      const complianceScore = Math.max(0, 100 - (violations.length * 25) - (insufficientRestCount * 10));

      return {
        pairingId,
        pairingNumber: pairing.pairingNumber,
        compliant,
        complianceScore,
        violations,
        warnings,
        totalFlightTime: pairing.totalFlightTime,
        totalDutyTime: pairing.totalDutyTime,
        restPeriods: restPeriodDetails,
        overnightStops: pairing.overnightStops,
        recommendations,
        canProceed: compliant || violations.every(v => v.severity !== 'critical'),
        mitigationRequired: violations.length > 0
      };

    } catch (error) {
      throw new Error(`Failed to check pairing compliance: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // COMPLIANCE REPORT GENERATION
  // ========================================================================

  /**
   * Generate comprehensive compliance report
   * @param crewId - The ID of the crew member
   * @param period - Time period for the report
   * @returns Compliance report
   */
  public async generateComplianceReport(
    crewId: string,
    period: TimePeriod
  ): Promise<ComplianceReport> {
    try {
      const crewMember = await db.crewMember.findUnique({
        where: { id: crewId }
      });

      if (!crewMember) {
        throw new Error(`Crew member not found: ${crewId}`);
      }

      const { startDate, endDate } = this.getPeriodDates(period);
      const position = crewMember.position as CrewPosition;
      const limits = REGULATORY_LIMITS[this.framework];

      // Get schedules for the period
      const schedules = await db.crewSchedule.findMany({
        where: {
          crewId,
          startDate: { gte: startDate.toISOString().split('T')[0] },
          endDate: { lte: endDate.toISOString().split('T')[0] }
        },
        orderBy: { startDate: 'asc' }
      });

      // Calculate flight time statistics
      const flightTimeStats = await this.calculateFlightTimeStats(crewId, period, schedules, limits);

      // Calculate duty time statistics
      const dutyTimeStats = this.calculateDutyTimeStats(schedules);

      // Calculate rest statistics
      const restStats = await this.calculateRestStats(crewId, schedules, limits);

      // Get qualification information
      const qualificationReport = await this.getQualificationReport(crewId, position);

      // Determine overall compliance
      const hasViolations = flightTimeStats.violations.length > 0;
      const hasWarnings = flightTimeStats.warnings.length > 0;
      
      let overallCompliance: ComplianceStatus;
      let complianceScore: number;

      if (hasViolations) {
        overallCompliance = ComplianceStatus.NON_COMPLIANT;
        complianceScore = Math.max(0, 100 - (flightTimeStats.violations.length * 30));
      } else if (hasWarnings) {
        overallCompliance = ComplianceStatus.WARNING;
        complianceScore = Math.max(70, 100 - (flightTimeStats.warnings.length * 10));
      } else {
        overallCompliance = ComplianceStatus.COMPLIANT;
        complianceScore = 100;
      }

      // Generate summary
      const summary = this.generateReportSummary(
        crewMember,
        period,
        overallCompliance,
        complianceScore,
        flightTimeStats,
        qualificationReport
      );

      return {
        crewId,
        crewName: `${crewMember.firstName} ${crewMember.lastName}`,
        employeeNumber: crewMember.employeeNumber,
        position,
        base: crewMember.base,
        reportPeriod: {
          start: startDate,
          end: endDate
        },
        framework: this.framework,
        overallCompliance,
        complianceScore,
        flightTimeStats,
        dutyTimeStats,
        restStats,
        qualifications: qualificationReport,
        violations: [], // Would need to track actual violations
        alerts: [],
        recommendations: this.generateRecommendations(
          overallCompliance,
          flightTimeStats,
          restStats,
          qualificationReport
        ),
        certificationValid: qualificationReport.allValid,
        summary
      };

    } catch (error) {
      throw new Error(`Failed to generate compliance report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Get position-specific limit
   */
  private getPositionSpecificLimit(
    position: CrewPosition,
    limitType: keyof RegulatoryLimits,
    limits: RegulatoryLimits
  ): number {
    const baseLimit = limits[limitType] as number;
    
    // Adjust limits based on position
    switch (position) {
      case CrewPosition.CAPTAIN:
        return baseLimit;
      case CrewPosition.FIRST_OFFICER:
        return baseLimit;
      case CrewPosition.PURSER:
        return baseLimit * 1.1; // Cabin crew may have slightly different limits
      case CrewPosition.FLIGHT_ATTENDANT:
        return baseLimit * 1.1;
      case CrewPosition.FLIGHT_ENGINEER:
        return baseLimit;
      default:
        return baseLimit;
    }
  }

  /**
   * Get flight time limit for period
   */
  private getFlightTimeLimit(
    period: TimePeriod,
    position: CrewPosition,
    limits: RegulatoryLimits
  ): number {
    switch (period) {
      case TimePeriod.DAILY:
        return limits.maxFlightTimeDaily;
      case TimePeriod.MONTHLY:
      case TimePeriod.ROLLING_30_DAYS:
        return limits.maxFlightTimeMonthly;
      case TimePeriod.YEARLY:
      case TimePeriod.ROLLING_12_MONTHS:
        return limits.maxFlightTimeYearly;
      case TimePeriod.ROLLING_7_DAYS:
        return limits.maxFlightTimeRolling7Days;
      case TimePeriod.ROLLING_28_DAYS:
        return limits.maxFlightTimeRolling28Days;
      case TimePeriod.WEEKLY:
        return limits.maxFlightTimeRolling7Days;
      default:
        return limits.maxFlightTimeMonthly;
    }
  }

  /**
   * Get period start and end dates
   */
  private getPeriodDates(period: TimePeriod): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    
    let startDate = new Date(now);

    switch (period) {
      case TimePeriod.DAILY:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case TimePeriod.WEEKLY:
        startDate.setDate(now.getDate() - 7);
        break;
      case TimePeriod.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case TimePeriod.YEARLY:
      case TimePeriod.CALENDAR_YEAR:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case TimePeriod.ROLLING_7_DAYS:
        startDate.setDate(now.getDate() - 7);
        break;
      case TimePeriod.ROLLING_28_DAYS:
        startDate.setDate(now.getDate() - 28);
        break;
      case TimePeriod.ROLLING_30_DAYS:
        startDate.setDate(now.getDate() - 30);
        break;
      case TimePeriod.ROLLING_12_MONTHS:
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }

  /**
   * Check if duty is night duty
   */
  private isNightDuty(schedule: any): boolean {
    const startHour = parseInt(schedule.startTime.split(':')[0]);
    const endHour = parseInt(schedule.endTime.split(':')[0]);
    
    // Night duty is defined as duty between 22:00 and 06:00
    return startHour >= 22 || startHour < 6 || endHour >= 22 || endHour < 6;
  }

  /**
   * Get required qualifications for position
   */
  private getRequiredQualifications(position: CrewPosition): string[] {
    switch (position) {
      case CrewPosition.CAPTAIN:
        return ['ATPL', 'Type Rating', 'Medical Certificate Class 1', 'Instrument Rating', 'Multi-Engine Rating'];
      case CrewPosition.FIRST_OFFICER:
        return ['CPL/ATPL', 'Type Rating', 'Medical Certificate Class 1', 'Instrument Rating', 'Multi-Engine Rating'];
      case CrewPosition.PURSER:
        return ['Cabin Crew Attestation', 'Safety Training', 'First Aid', 'Security Training'];
      case CrewPosition.FLIGHT_ATTENDANT:
        return ['Cabin Crew Attestation', 'Safety Training', 'First Aid'];
      case CrewPosition.FLIGHT_ENGINEER:
        return ['Flight Engineer License', 'Type Rating', 'Medical Certificate Class 2'];
      default:
        return [];
    }
  }

  /**
   * Assess fatigue risk from rest
   */
  private assessFatigueRiskFromRest(
    restHours: number,
    minRest: number,
    previousSchedule: any
  ): FatigueRiskLevel {
    if (restHours < minRest) {
      return FatigueRiskLevel.CRITICAL;
    } else if (restHours < minRest * 1.2) {
      return FatigueRiskLevel.HIGH;
    } else if (restHours < minRest * 1.5) {
      return FatigueRiskLevel.MODERATE;
    } else {
      return FatigueRiskLevel.LOW;
    }
  }

  /**
   * Calculate rest quality score
   */
  private calculateRestQualityScore(restHours: number, minRest: number): number {
    const idealRest = minRest * 2;
    const score = (restHours / idealRest) * 100;
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get fatigue mitigation options
   */
  private getFatigueMitigationOptions(riskLevel: FatigueRiskLevel): string[] {
    const baseOptions = [
      'Ensure adequate pre-flight rest',
      'Monitor hydration and nutrition',
      'Implement controlled rest on flight deck (if applicable)'
    ];

    switch (riskLevel) {
      case FatigueRiskLevel.LOW:
        return baseOptions;
      case FatigueRiskLevel.MODERATE:
        return [
          ...baseOptions,
          'Consider additional rest breaks',
          'Increase monitoring frequency'
        ];
      case FatigueRiskLevel.HIGH:
        return [
          ...baseOptions,
          'Schedule additional rest breaks',
          'Implement fatigue management protocols',
          'Consider crew augmentation',
          'Increase supervision'
        ];
      case FatigueRiskLevel.CRITICAL:
        return [
          ...baseOptions,
          'Immediate schedule review required',
          'Consider crew replacement',
          'Implement maximum fatigue mitigation measures',
          'Alert management',
          'Document all mitigation actions'
        ];
      default:
        return baseOptions;
    }
  }

  /**
   * Calculate flight time statistics
   */
  private async calculateFlightTimeStats(
    crewId: string,
    period: TimePeriod,
    schedules: any[],
    limits: RegulatoryLimits
  ): Promise<FlightTimeStats> {
    let totalHours = 0;
    let maxDaily = 0;
    
    const dailyHours = new Map<string, number>();

    schedules.forEach(schedule => {
      const flightTime = (schedule.dutyHours || 0) * 0.65;
      totalHours += flightTime;
      
      const date = schedule.startDate;
      dailyHours.set(date, (dailyHours.get(date) || 0) + flightTime);
      maxDaily = Math.max(maxDaily, dailyHours.get(date) || 0);
    });

    const dailyAverage = schedules.length > 0 ? totalHours / Math.max(1, dailyHours.size) : 0;
    const utilizationPercentage = (totalHours / limits.maxFlightTimeMonthly) * 100;

    const violations: string[] = [];
    const warnings: string[] = [];

    if (totalHours > limits.maxFlightTimeMonthly) {
      violations.push('Monthly flight time exceeded');
    }
    if (maxDaily > limits.maxFlightTimeDaily) {
      violations.push('Daily flight time exceeded');
    }
    if (utilizationPercentage > 90) {
      warnings.push('Flight time utilization high');
    }

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      dailyAverage: Math.round(dailyAverage * 100) / 100,
      maxDaily: Math.round(maxDaily * 100) / 100,
      flightsCount: schedules.length,
      utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
      monthlyBreakdown: [], // Would need more detailed data
      limits: {
        daily: {
          actual: maxDaily,
          limit: limits.maxFlightTimeDaily,
          remaining: Math.max(0, limits.maxFlightTimeDaily - maxDaily)
        },
        monthly: {
          actual: totalHours,
          limit: limits.maxFlightTimeMonthly,
          remaining: Math.max(0, limits.maxFlightTimeMonthly - totalHours)
        },
        yearly: {
          actual: totalHours,
          limit: limits.maxFlightTimeYearly,
          remaining: Math.max(0, limits.maxFlightTimeYearly - totalHours)
        },
        rolling7Days: {
          actual: totalHours,
          limit: limits.maxFlightTimeRolling7Days,
          remaining: Math.max(0, limits.maxFlightTimeRolling7Days - totalHours)
        },
        rolling28Days: {
          actual: totalHours,
          limit: limits.maxFlightTimeRolling28Days,
          remaining: Math.max(0, limits.maxFlightTimeRolling28Days - totalHours)
        },
        rolling30Days: {
          actual: totalHours,
          limit: limits.maxFlightTimeRolling30Days,
          remaining: Math.max(0, limits.maxFlightTimeRolling30Days - totalHours)
        },
        rolling12Months: {
          actual: totalHours,
          limit: limits.maxFlightTimeRolling12Months,
          remaining: Math.max(0, limits.maxFlightTimeRolling12Months - totalHours)
        }
      }
    };
  }

  /**
   * Calculate duty time statistics
   */
  private calculateDutyTimeStats(schedules: any[]): DutyTimeStats {
    let totalDutyHours = 0;
    let earlyStarts = 0;
    let lateEnds = 0;
    let nightDuties = 0;

    schedules.forEach(schedule => {
      const dutyHours = schedule.dutyHours || 0;
      totalDutyHours += dutyHours;

      const startHour = parseInt(schedule.startTime.split(':')[0]);
      const endHour = parseInt(schedule.endTime.split(':')[0]);

      if (startHour < 6) earlyStarts++;
      if (endHour >= 22 || endHour < 2) lateEnds++;
      if (startHour >= 22 || startHour < 6 || endHour >= 22 || endHour < 2) nightDuties++;
    });

    const averageDutyPerDay = schedules.length > 0 ? totalDutyHours / schedules.length : 0;
    const maxDutyPeriod = Math.max(...schedules.map(s => s.dutyHours || 0));

    return {
      totalDutyHours: Math.round(totalDutyHours * 100) / 100,
      averageDutyPerDay: Math.round(averageDutyPerDay * 100) / 100,
      maxDutyPeriod: Math.round(maxDutyPeriod * 100) / 100,
      earlyStarts,
      lateEnds,
      nightDuties,
      extensionsUsed: 0
    };
  }

  /**
   * Calculate rest statistics
   */
  private async calculateRestStats(
    crewId: string,
    schedules: any[],
    limits: RegulatoryLimits
  ): Promise<RestStats> {
    const restPeriods: number[] = [];

    for (let i = 0; i < schedules.length - 1; i++) {
      const currentEnd = new Date(`${schedules[i].endDate}T${schedules[i].endTime}`);
      const nextStart = new Date(`${schedules[i + 1].startDate}T${schedules[i + 1].startTime}`);
      const restHours = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60 * 60);
      restPeriods.push(restHours);
    }

    const averageRest = restPeriods.length > 0 
      ? restPeriods.reduce((sum, r) => sum + r, 0) / restPeriods.length 
      : limits.minRestPeriod;
    const minRest = restPeriods.length > 0 ? Math.min(...restPeriods) : limits.minRestPeriod;

    const insufficientRestCount = restPeriods.filter(r => r < limits.minRestPeriod).length;
    const restQualityScore = this.calculateRestQualityScore(averageRest, limits.minRestPeriod);

    // Estimate rest at base percentage
    const restAtBasePercentage = 80; // Simplified estimate

    return {
      averageRestHours: Math.round(averageRest * 100) / 100,
      minRestHours: Math.round(minRest * 100) / 100,
      restAtBasePercentage,
      insufficientRestCount,
      restQualityScore: Math.round(restQualityScore)
    };
  }

  /**
   * Get qualification report
   */
  private async getQualificationReport(
    crewId: string,
    position: CrewPosition
  ): Promise<QualificationReportSection> {
    const qualifications = await db.crewQualification.findMany({
      where: { crewId }
    });

    const now = new Date();
    let valid = 0;
    let expired = 0;
    let expiringSoon = 0;
    const criticalQualifications: QualificationDetail[] = [];

    qualifications.forEach(q => {
      const expiryDate = new Date(q.expiryDate);
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (q.status === 'expired' || daysUntilExpiry < 0) {
        expired++;
      } else if (daysUntilExpiry <= 30) {
        expiringSoon++;
        criticalQualifications.push({
          id: q.id,
          qualification: q.qualification,
          type: q.type,
          status: q.status,
          issueDate: q.issueDate,
          expiryDate: q.expiryDate,
          daysUntilExpiry
        });
      } else {
        valid++;
      }
    });

    return {
      totalQualifications: qualifications.length,
      validQualifications: valid,
      expiredQualifications: expired,
      expiringSoon,
      allValid: expired === 0,
      criticalQualifications
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    overallCompliance: ComplianceStatus,
    flightTimeStats: FlightTimeStats,
    restStats: RestStats,
    qualificationReport: QualificationReportSection
  ): string[] {
    const recommendations: string[] = [];

    if (overallCompliance === ComplianceStatus.NON_COMPLIANT) {
      recommendations.push('Immediate review of schedule required');
      recommendations.push('Adjust flight assignments to restore compliance');
    }

    if (flightTimeStats.utilizationPercentage > 85) {
      recommendations.push('Monitor flight time utilization closely');
      recommendations.push('Consider reducing future flight assignments');
    }

    if (restStats.insufficientRestCount > 0) {
      recommendations.push('Review rest period scheduling');
      recommendations.push('Ensure minimum rest requirements are met');
    }

    if (!qualificationReport.allValid) {
      recommendations.push('Address expired qualifications immediately');
      recommendations.push('Schedule renewal for expiring qualifications');
    }

    if (restStats.restQualityScore < 70) {
      recommendations.push('Improve rest quality for crew members');
      recommendations.push('Review hotel and accommodation standards');
    }

    return recommendations;
  }

  /**
   * Generate report summary
   */
  private generateReportSummary(
    crewMember: any,
    period: TimePeriod,
    overallCompliance: ComplianceStatus,
    complianceScore: number,
    flightTimeStats: FlightTimeStats,
    qualificationReport: QualificationReportSection
  ): string {
    const crewName = `${crewMember.firstName} ${crewMember.lastName}`;
    const position = crewMember.position;

    let statusText = '';
    switch (overallCompliance) {
      case ComplianceStatus.COMPLIANT:
        statusText = 'fully compliant';
        break;
      case ComplianceStatus.WARNING:
        statusText = 'compliant with warnings';
        break;
      case ComplianceStatus.NON_COMPLIANT:
        statusText = 'non-compliant';
        break;
      default:
        statusText = 'under review';
    }

    return `Crew member ${crewName} (${position}) is ${statusText} for the ${period} period with a compliance score of ${complianceScore}%. ` +
      `Total flight time: ${flightTimeStats.totalHours}h (${flightTimeStats.utilizationPercentage.toFixed(1)}% utilization). ` +
      `All qualifications ${qualificationReport.allValid ? 'are valid' : 'require attention'}. ` +
      `${overallCompliance === ComplianceStatus.NON_COMPLIANT ? 'Immediate action required to restore compliance.' : 'No immediate action required.'}`;
  }
}

// ============================================================================
// EXPORT FACTORY FUNCTION
// ============================================================================

/**
 * Create a new Crew Compliance Engine instance
 * @param framework - Regulatory framework to use
 * @returns CrewComplianceEngine instance
 */
export function createCrewComplianceEngine(framework?: RegulatoryFramework): CrewComplianceEngine {
  return new CrewComplianceEngine(framework);
}

// Default export
export default CrewComplianceEngine;
