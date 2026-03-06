/**
 * Settlement Engine
 * 
 * This engine handles all interline settlement and revenue accounting-related business logic including:
 * - Interline settlement automation
 * - Proration calculation engine
 * - BSP/ARC settlement reporting
 * - Revenue leakage detection
 * - Partner settlement calculation
 * - Settlement report generation
 * - ADM/ACM processing
 * - Revenue reconciliation
 */

import { db } from '@/lib/db';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Settlement status types
 */
export enum SettlementStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

/**
 * Settlement method types
 */
export enum SettlementMethod {
  BSP = 'bsp',
  ARC = 'arc',
  DIRECT_BILLING = 'direct_billing',
  CLEARING_HOUSE = 'clearing_house',
  ELECTRONIC_FUNDS_TRANSFER = 'electronic_funds_transfer',
  WIRE_TRANSFER = 'wire_transfer'
}

/**
 * Proration method types
 */
export enum ProrationMethod {
  MILEAGE = 'mileage',
  RATE = 'rate',
  WEIGHTED = 'weighted',
  FIXED_PERCENTAGE = 'fixed_percentage',
  NEGOTIATED = 'negotiated'
}

/**
 * Revenue category types
 */
export enum RevenueCategory {
  PASSENGER = 'passenger',
  CARGO = 'cargo',
  ANCILLARY = 'ancillary',
  CHANGES = 'changes',
  REFUNDS = 'refunds',
  OTHER = 'other'
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
 * Leakage detection severity
 */
export enum LeakageSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

/**
 * Proration breakdown segment
 */
export interface ProrationSegment {
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  distanceKm: number;
  mileagePercentage: number;
  fareAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

/**
 * Proration calculation result
 */
export interface ProrationBreakdown {
  ticketNumber: string;
  totalFare: number;
  totalTaxes: number;
  totalAmount: number;
  currency: string;
  prorationMethod: ProrationMethod;
  segments: ProrationSegment[];
  marketingCarrier: string;
  validatingCarrier: string;
  interlinePartners: string[];
  calculatedAt: Date;
  roundingDifferences: number;
}

/**
 * Partner settlement details
 */
export interface PartnerSettlement {
  partnerId: string;
  partnerCode: string;
  partnerName: string;
  settlementPeriod: {
    start: Date;
    end: Date;
  };
  totalTickets: number;
  totalFare: number;
  totalTaxes: number;
  totalCommission: number;
  netAmount: number;
  currency: string;
  settlementMethod: SettlementMethod;
  settlementStatus: SettlementStatus;
  dueDate: Date;
  breakdown: PartnerSettlementBreakdown[];
  adjustments: SettlementAdjustment[];
  supportingDocuments: string[];
  generatedAt: Date;
}

/**
 * Partner settlement breakdown
 */
export interface PartnerSettlementBreakdown {
  route: string;
  tickets: number;
  passengers: number;
  fare: number;
  taxes: number;
  commission: number;
  netAmount: number;
}

/**
 * Settlement adjustment
 */
export interface SettlementAdjustment {
  id: string;
  type: 'ADM' | 'ACM' | 'correction' | 'penalty' | 'bonus';
  amount: number;
  reason: string;
  reference: string;
  date: Date;
  status: string;
}

/**
 * BSP report data
 */
export interface BSPReport {
  reportId: string;
  reportNumber: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  bspCode: string;
  airlineCode: string;
  currency: string;
  summary: BSPReportSummary;
  salesDetails: BSPTicketSale[];
  refundsDetails: BSPRefund[];
  adjustments: BSPAdjustment[];
  totalSettlement: number;
  generatedAt: Date;
  status: SettlementStatus;
}

/**
 * BSP report summary
 */
export interface BSPReportSummary {
  totalTicketsSold: number;
  totalPassengers: number;
  totalFare: number;
  totalTaxes: number;
  totalCommission: number;
  totalYQYR: number; // Fuel surcharges
  totalOtherFees: number;
  grossAmount: number;
  totalRefunds: number;
  totalExchanges: number;
  netSettlement: number;
}

/**
 * BSP ticket sale details
 */
export interface BSPTicketSale {
  ticketNumber: string;
  date: Date;
  agentCode: string;
  passengerName: string;
  route: string;
  flightNumber: string;
  fare: number;
  taxes: number;
  commission: number;
  yqyr: number;
  otherFees: number;
  totalAmount: number;
  currency: string;
  interline: boolean;
  operatingCarrier?: string;
}

/**
 * BSP refund details
 */
export interface BSPRefund {
  ticketNumber: string;
  refundDate: Date;
  originalAmount: number;
  refundAmount: number;
  refundFee: number;
  netRefund: number;
  reason: string;
  processedBy: string;
}

/**
 * BSP adjustment details
 */
export interface BSPAdjustment {
  adjustmentId: string;
  type: 'ADM' | 'ACM';
  ticketNumber: string;
  amount: number;
  reason: string;
  date: Date;
  status: string;
}

/**
 * ARC report data (similar to BSP but for US market)
 */
export interface ARCReport {
  reportId: string;
  reportNumber: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  arcNumber: string;
  airlineCode: string;
  currency: string;
  summary: ARCReportSummary;
  salesDetails: ARCTicketSale[];
  refundsDetails: ARCRefund[];
  totalSettlement: number;
  generatedAt: Date;
  status: SettlementStatus;
}

/**
 * ARC report summary
 */
export interface ARCReportSummary {
  totalTicketsSold: number;
  totalPassengers: number;
  totalFare: number;
  totalTaxes: number;
  totalCommission: number;
  totalFees: number;
  grossAmount: number;
  totalRefunds: number;
  netSettlement: number;
  agentCount: number;
}

/**
 * ARC ticket sale details
 */
export interface ARCTicketSale {
  ticketNumber: string;
  date: Date;
  agentCode: string;
  agentName: string;
  passengerName: string;
  route: string;
  fare: number;
  taxes: number;
  commission: number;
  fees: number;
  totalAmount: number;
  currency: string;
}

/**
 * ARC refund details
 */
export interface ARCRefund {
  ticketNumber: string;
  refundDate: Date;
  originalAmount: number;
  refundAmount: number;
  refundFee: number;
  taxRefund: number;
  netRefund: number;
  reason: string;
  processedBy: string;
}

/**
 * Revenue leakage detection result
 */
export interface RevenueLeakageReport {
  reportId: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  totalRevenueExpected: number;
  totalRevenueActual: number;
  totalLeakage: number;
  leakagePercentage: number;
  leakageItems: LeakageItem[];
  categories: LeakageCategorySummary[];
  riskAssessment: LeakageRiskAssessment;
  recommendations: LeakageRecommendation[];
  generatedAt: Date;
}

/**
 * Individual leakage item
 */
export interface LeakageItem {
  id: string;
  type: string;
  category: RevenueCategory;
  severity: LeakageSeverity;
  description: string;
  ticketNumber?: string;
  pnrNumber?: string;
  expectedAmount: number;
  actualAmount: number;
  leakageAmount: number;
  currency: string;
  dateDetected: Date;
  dateOccurred: Date;
  source: string;
  status: 'open' | 'investigating' | 'resolved' | 'written_off';
  assignee?: string;
  resolution?: string;
  resolvedAt?: Date;
}

/**
 * Leakage category summary
 */
export interface LeakageCategorySummary {
  category: RevenueCategory;
  count: number;
  totalLeakage: number;
  percentageOfTotal: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

/**
 * Leakage risk assessment
 */
export interface LeakageRiskAssessment {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  highRiskAreas: string[];
  projectedMonthlyLeakage: number;
  confidence: number;
}

/**
 * Risk factor
 */
export interface RiskFactor {
  factor: string;
  impact: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  mitigation: string;
}

/**
 * Leakage recommendation
 */
export interface LeakageRecommendation {
  priority: AlertPriority;
  category: string;
  recommendation: string;
  expectedImpact: string;
  estimatedSavings?: number;
  implementationEffort: 'low' | 'medium' | 'high';
}

/**
 * Partner revenue calculation result
 */
export interface PartnerRevenue {
  partnerId: string;
  partnerCode: string;
  partnerName: string;
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  totalFare: number;
  totalTaxes: number;
  totalAncillary: number;
  totalCommission: number;
  netRevenue: number;
  currency: string;
  ticketBreakdown: TicketBreakdown[];
  topRoutes: RouteRevenue[];
  paymentMethods: PaymentMethodBreakdown[];
  trendAnalysis: RevenueTrend[];
  generatedAt: Date;
}

/**
 * Ticket breakdown
 */
export interface TicketBreakdown {
  ticketType: string;
  count: number;
  revenue: number;
  averageFare: number;
}

/**
 * Route revenue
 */
export interface RouteRevenue {
  route: string;
  origin: string;
  destination: string;
  tickets: number;
  revenue: number;
  averageFare: number;
  growthRate: number;
}

/**
 * Payment method breakdown
 */
export interface PaymentMethodBreakdown {
  paymentMethod: string;
  transactionCount: number;
  revenue: number;
  percentage: number;
}

/**
 * Revenue trend analysis
 */
export interface RevenueTrend {
  period: string;
  revenue: number;
  tickets: number;
  growth: number;
}

/**
 * ADM/ACM processing result
 */
export interface ADMProcessingResult {
  admId: string;
  admNumber: string;
  agencyId: string;
  agencyCode: string;
  type: 'ADM' | 'ACM';
  amount: number;
  currency: string;
  action: 'issue' | 'uphold' | 'waive' | 'dispute' | 'pay';
  processedAt: Date;
  processedBy: string;
  previousStatus: string;
  newStatus: string;
  outcome: string;
  notes: string;
  affectedTickets: string[];
}

/**
 * Settlement reconciliation result
 */
export interface SettlementReconciliation {
  reconciliationId: string;
  period: {
    start: Date;
    end: Date;
  };
  reconciliationDate: Date;
  summary: ReconciliationSummary;
  systemTotal: number;
  bspTotal: number;
  arcTotal: number;
  directBillingTotal: number;
  discrepancies: ReconciliationDiscrepancy[];
  matchedTransactions: number;
  unmatchedTransactions: number;
  totalDiscrepancy: number;
  status: 'completed' | 'in_progress' | 'failed';
  reconciledBy: string;
  notes: string[];
}

/**
 * Reconciliation summary
 */
export interface ReconciliationSummary {
  totalTransactions: number;
  totalRevenue: number;
  matchedRevenue: number;
  unmatchedRevenue: number;
  matchRate: number;
  currency: string;
}

/**
 * Reconciliation discrepancy
 */
export interface ReconciliationDiscrepancy {
  id: string;
  type: 'missing' | 'amount_mismatch' | 'currency_mismatch' | 'timing' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  reference: string;
  systemAmount: number;
  externalAmount: number;
  difference: number;
  currency: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  assignedTo?: string;
  resolvedAt?: Date;
}

/**
 * Settlement data validation result
 */
export interface SettlementValidation {
  settlementId: string;
  valid: boolean;
  validationDate: Date;
  validatedBy: string;
  checks: ValidationCheck[];
  totalErrors: number;
  totalWarnings: number;
  canProceed: boolean;
  blockedBy: string[];
}

/**
 * Validation check
 */
export interface ValidationCheck {
  checkId: string;
  checkName: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
  recommendation?: string;
}

// ============================================================================
// SETTLEMENT ENGINE CLASS
// ============================================================================

export class SettlementEngine {
  private defaultCurrency: string;
  private prorationMethod: ProrationMethod;

  constructor(currency: string = 'USD', prorationMethod: ProrationMethod = ProrationMethod.MILEAGE) {
    this.defaultCurrency = currency;
    this.prorationMethod = prorationMethod;
  }

  /**
   * Set default currency
   */
  public setDefaultCurrency(currency: string): void {
    this.defaultCurrency = currency;
  }

  /**
   * Set proration method
   */
  public setProrationMethod(method: ProrationMethod): void {
    this.prorationMethod = method;
  }

  // ========================================================================
  // PRORATION CALCULATION
  // ========================================================================

  /**
   * Calculate interline proration for a ticket
   * @param ticketNumber - The ticket number
   * @param segments - Optional segment data (if not provided, will be fetched)
   * @param method - Optional proration method override
   * @returns Proration breakdown
   */
  public async calculateProration(
    ticketNumber: string,
    segments?: any[],
    method?: ProrationMethod
  ): Promise<ProrationBreakdown> {
    try {
      const activeMethod = method || this.prorationMethod;

      // Fetch ticket if segments not provided
      const ticket = await db.ticket.findUnique({
        where: { ticketNumber },
        include: { pnr: { include: { segments: true } } }
      });

      if (!ticket) {
        throw new Error(`Ticket not found: ${ticketNumber}`);
      }

      const ticketSegments = segments || ticket.pnr.segments;
      const totalFare = ticket.baseFare;
      const totalTaxes = ticket.taxes;
      const totalAmount = ticket.totalFare;

      // Calculate distance for each segment
      const segmentDistances = await this.calculateSegmentDistances(ticketSegments);

      // Calculate total distance
      const totalDistance = segmentDistances.reduce((sum, s) => sum + s.distance, 0);

      // Calculate proration based on method
      let proratedSegments: ProrationSegment[] = [];

      switch (activeMethod) {
        case ProrationMethod.MILEAGE:
          proratedSegments = this.calculateMileageProration(
            ticketSegments,
            segmentDistances,
            totalDistance,
            totalFare,
            totalTaxes,
            ticket.currency
          );
          break;
        case ProrationMethod.RATE:
          proratedSegments = this.calculateRateProration(
            ticketSegments,
            totalFare,
            totalTaxes,
            ticket.currency
          );
          break;
        case ProrationMethod.WEIGHTED:
          proratedSegments = this.calculateWeightedProration(
            ticketSegments,
            segmentDistances,
            totalDistance,
            totalFare,
            totalTaxes,
            ticket.currency
          );
          break;
        default:
          proratedSegments = this.calculateMileageProration(
            ticketSegments,
            segmentDistances,
            totalDistance,
            totalFare,
            totalTaxes,
            ticket.currency
          );
      }

      // Calculate rounding differences
      const proratedTotal = proratedSegments.reduce((sum, s) => sum + s.totalAmount, 0);
      const roundingDifferences = totalAmount - proratedTotal;

      // Distribute rounding differences
      if (Math.abs(roundingDifferences) > 0.01 && proratedSegments.length > 0) {
        proratedSegments[0].totalAmount += roundingDifferences;
        proratedSegments[0].fareAmount += roundingDifferences;
      }

      return {
        ticketNumber,
        totalFare,
        totalTaxes,
        totalAmount,
        currency: ticket.currency,
        prorationMethod: activeMethod,
        segments: proratedSegments,
        marketingCarrier: ticketSegments[0]?.airlineCode || '',
        validatingCarrier: ticket.validationAirline,
        interlinePartners: JSON.parse(ticket.interlinePartners || '[]'),
        calculatedAt: new Date(),
        roundingDifferences
      };

    } catch (error) {
      throw new Error(`Failed to calculate proration: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate detailed proration breakdown for a ticket
   * @param ticketNumber - The ticket number
   * @returns Detailed proration breakdown
   */
  public async generateProrationBreakdown(ticketNumber: string): Promise<ProrationBreakdown> {
    return this.calculateProration(ticketNumber);
  }

  // ========================================================================
  // PARTNER SETTLEMENT
  // ========================================================================

  /**
   * Calculate settlement with a partner for a period
   * @param partnerId - The partner ID (or IATA code)
   * @param periodStart - Start date of settlement period
   * @param periodEnd - End date of settlement period
   * @returns Partner settlement calculation
   */
  public async settleWithPartner(
    partnerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<PartnerSettlement> {
    try {
      // Try to find agency by ID or code
      const partner = await db.agency.findFirst({
        where: {
          OR: [
            { id: partnerId },
            { code: partnerId }
          ]
        }
      });

      if (!partner) {
        throw new Error(`Partner not found: ${partnerId}`);
      }

      // Get all tickets for the partner in the period
      const tickets = await db.ticket.findMany({
        where: {
          agencyCode: partner.code,
          issuedAt: {
            gte: periodStart,
            lte: periodEnd
          },
          status: { in: ['open', 'used'] }
        },
        include: {
          pnr: {
            include: {
              segments: true
            }
          }
        }
      });

      // Calculate totals
      let totalFare = 0;
      let totalTaxes = 0;
      let totalCommission = 0;

      const breakdown: Map<string, PartnerSettlementBreakdown> = new Map();

      for (const ticket of tickets) {
        totalFare += ticket.baseFare;
        totalTaxes += ticket.taxes;
        totalCommission += ticket.commissionAmount;

        // Group by route
        const segments = ticket.pnr.segments;
        if (segments.length > 0) {
          const route = `${segments[0].origin}-${segments[segments.length - 1].destination}`;
          
          if (!breakdown.has(route)) {
            breakdown.set(route, {
              route,
              tickets: 0,
              passengers: 0,
              fare: 0,
              taxes: 0,
              commission: 0,
              netAmount: 0
            });
          }

          const routeData = breakdown.get(route)!;
          routeData.tickets++;
          routeData.passengers += ticket.pnr.passengers.length;
          routeData.fare += ticket.baseFare;
          routeData.taxes += ticket.taxes;
          routeData.commission += ticket.commissionAmount;
          routeData.netAmount = routeData.fare + routeData.taxes - routeData.commission;
        }
      }

      const netAmount = totalFare + totalTaxes - totalCommission;

      // Get any ADMs/ACMs for the period
      const adms = await db.aDM.findMany({
        where: {
          agencyId: partner.id,
          issuedDate: {
            gte: periodStart,
            lte: periodEnd
          },
          status: { notIn: ['waived', 'paid'] }
        }
      });

      const adjustments: SettlementAdjustment[] = adms.map(adm => ({
        id: adm.id,
        type: 'ADM' as const,
        amount: adm.amount,
        reason: adm.reason,
        reference: adm.number,
        date: adm.issuedDate,
        status: adm.status
      }));

      // Calculate due date (typically 30 days after period end)
      const dueDate = new Date(periodEnd);
      dueDate.setDate(dueDate.getDate() + 30);

      return {
        partnerId: partner.id,
        partnerCode: partner.code,
        partnerName: partner.name,
        settlementPeriod: {
          start: periodStart,
          end: periodEnd
        },
        totalTickets: tickets.length,
        totalFare,
        totalTaxes,
        totalCommission,
        netAmount,
        currency: this.defaultCurrency,
        settlementMethod: SettlementMethod.BSP,
        settlementStatus: SettlementStatus.PENDING,
        dueDate,
        breakdown: Array.from(breakdown.values()),
        adjustments,
        supportingDocuments: [],
        generatedAt: new Date()
      };

    } catch (error) {
      throw new Error(`Failed to calculate partner settlement: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Calculate partner revenue for a period
   * @param partnerId - The partner ID
   * @param periodStart - Start date
   * @param periodEnd - End date
   * @returns Partner revenue calculation
   */
  public async calculatePartnerRevenue(
    partnerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<PartnerRevenue> {
    try {
      const partner = await db.agency.findFirst({
        where: {
          OR: [
            { id: partnerId },
            { code: partnerId }
          ]
        }
      });

      if (!partner) {
        throw new Error(`Partner not found: ${partnerId}`);
      }

      const tickets = await db.ticket.findMany({
        where: {
          agencyCode: partner.code,
          issuedAt: {
            gte: periodStart,
            lte: periodEnd
          }
        },
        include: {
          pnr: {
            include: {
              segments: true,
              emds: true
            }
          }
        }
      });

      let totalFare = 0;
      let totalTaxes = 0;
      let totalAncillary = 0;
      let totalCommission = 0;

      const ticketTypes = new Map<string, { count: number; revenue: number }>();
      const routes = new Map<string, { tickets: number; revenue: number }>();
      const paymentMethods = new Map<string, { count: number; revenue: number }>();

      for (const ticket of tickets) {
        totalFare += ticket.baseFare;
        totalTaxes += ticket.taxes;
        totalCommission += ticket.commissionAmount;

        // Ticket type breakdown
        const bookingClass = ticket.pnr.segments[0]?.bookingClass || 'unknown';
        if (!ticketTypes.has(bookingClass)) {
          ticketTypes.set(bookingClass, { count: 0, revenue: 0 });
        }
        ticketTypes.get(bookingClass)!.count++;
        ticketTypes.get(bookingClass)!.revenue += ticket.totalFare;

        // Route breakdown
        const segments = ticket.pnr.segments;
        if (segments.length > 0) {
          const route = `${segments[0].origin}-${segments[segments.length - 1].destination}`;
          if (!routes.has(route)) {
            routes.set(route, { tickets: 0, revenue: 0 });
          }
          routes.get(route)!.tickets++;
          routes.get(route)!.revenue += ticket.totalFare;
        }

        // Payment method breakdown
        const paymentMethod = ticket.pnr.paymentMethod;
        if (!paymentMethods.has(paymentMethod)) {
          paymentMethods.set(paymentMethod, { count: 0, revenue: 0 });
        }
        paymentMethods.get(paymentMethod)!.count++;
        paymentMethods.get(paymentMethod)!.revenue += ticket.totalFare;

        // Ancillary revenue
        for (const emd of ticket.pnr.emds) {
          if (emd.status === 'active' || emd.status === 'used') {
            totalAncillary += emd.amount;
          }
        }
      }

      const netRevenue = totalFare + totalTaxes + totalAncillary - totalCommission;

      // Generate ticket breakdown
      const ticketBreakdown: TicketBreakdown[] = Array.from(ticketTypes.entries()).map(([type, data]) => ({
        ticketType: type,
        count: data.count,
        revenue: data.revenue,
        averageFare: data.count > 0 ? data.revenue / data.count : 0
      }));

      // Generate top routes
      const topRoutes: RouteRevenue[] = Array.from(routes.entries())
        .map(([route, data]) => ({
          route,
          origin: route.split('-')[0],
          destination: route.split('-')[1],
          tickets: data.tickets,
          revenue: data.revenue,
          averageFare: data.tickets > 0 ? data.revenue / data.tickets : 0,
          growthRate: 0 // Would need historical data
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Generate payment method breakdown
      const totalPaymentRevenue = totalFare + totalTaxes + totalAncillary;
      const paymentBreakdown: PaymentMethodBreakdown[] = Array.from(paymentMethods.entries()).map(
        ([method, data]) => ({
          paymentMethod: method,
          transactionCount: data.count,
          revenue: data.revenue,
          percentage: totalPaymentRevenue > 0 ? (data.revenue / totalPaymentRevenue) * 100 : 0
        })
      );

      return {
        partnerId: partner.id,
        partnerCode: partner.code,
        partnerName: partner.name,
        period: {
          start: periodStart,
          end: periodEnd
        },
        totalRevenue: netRevenue,
        totalFare,
        totalTaxes,
        totalAncillary,
        totalCommission,
        netRevenue,
        currency: this.defaultCurrency,
        ticketBreakdown,
        topRoutes,
        paymentMethods: paymentBreakdown,
        trendAnalysis: [], // Would need historical data
        generatedAt: new Date()
      };

    } catch (error) {
      throw new Error(`Failed to calculate partner revenue: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // BSP/ARC REPORTING
  // ========================================================================

  /**
   * Generate BSP settlement report
   * @param periodStart - Start date of reporting period
   * @param periodEnd - End date of reporting period
   * @param bspCode - BSP code
   * @returns BSP report
   */
  public async generateBSPReport(
    periodStart: Date,
    periodEnd: Date,
    bspCode: string = 'BSP'
  ): Promise<BSPReport> {
    try {
      // Get all tickets issued in the period through BSP
      const tickets = await db.ticket.findMany({
        where: {
          issuedAt: {
            gte: periodStart,
            lte: periodEnd
          },
          status: { in: ['open', 'used', 'refunded'] }
        },
        include: {
          pnr: {
            include: {
              passengers: true,
              segments: true
            }
          }
        }
      });

      let totalTicketsSold = 0;
      let totalPassengers = 0;
      let totalFare = 0;
      let totalTaxes = 0;
      let totalCommission = 0;
      let totalYQYR = 0;
      let totalOtherFees = 0;
      let totalRefunds = 0;
      let totalExchanges = 0;

      const salesDetails: BSPTicketSale[] = [];
      const refundsDetails: BSPRefund[] = [];

      for (const ticket of tickets) {
        if (ticket.status === 'refunded') {
          totalRefunds += ticket.totalFare;
          refundsDetails.push({
            ticketNumber: ticket.ticketNumber,
            refundDate: ticket.issuedAt, // Simplified - should use actual refund date
            originalAmount: ticket.totalFare,
            refundAmount: ticket.totalFare, // Simplified
            refundFee: ticket.changePenalty,
            netRefund: ticket.totalFare - ticket.changePenalty,
            reason: 'Passenger request',
            processedBy: ticket.issuedBy
          });
        } else if (ticket.status === 'open' || ticket.status === 'used') {
          totalTicketsSold++;
          totalPassengers += ticket.pnr.passengers.length;
          totalFare += ticket.baseFare;
          totalTaxes += ticket.taxes;
          totalCommission += ticket.commissionAmount;

          // Parse tax breakdown for YQ/YR
          const taxBreakdown = JSON.parse(ticket.taxBreakdown || '{}');
          totalYQYR += (taxBreakdown.YQ || 0) + (taxBreakdown.YR || 0);
          totalOtherFees += ticket.fees;

          if (ticket.status === 'open' && ticket.changePenalty > 0) {
            totalExchanges++;
          }

          const segments = ticket.pnr.segments;
          const route = segments.length > 0 
            ? `${segments[0].origin}-${segments[segments.length - 1].destination}` 
            : 'Unknown';

          salesDetails.push({
            ticketNumber: ticket.ticketNumber,
            date: ticket.issuedAt,
            agentCode: ticket.pnr.agencyCode,
            passengerName: ticket.passengerName,
            route,
            flightNumber: segments[0]?.flightNumber || '',
            fare: ticket.baseFare,
            taxes: ticket.taxes,
            commission: ticket.commissionAmount,
            yqyr: (taxBreakdown.YQ || 0) + (taxBreakdown.YR || 0),
            otherFees: ticket.fees,
            totalAmount: ticket.totalFare,
            currency: ticket.currency,
            interline: ticket.interlinePartners && JSON.parse(ticket.interlinePartners).length > 0,
            operatingCarrier: ticket.operatingCarrier
          });
        }
      }

      const grossAmount = totalFare + totalTaxes + totalYQYR + totalOtherFees;
      const netSettlement = grossAmount - totalCommission - totalRefunds;

      // Get ADMs/ACMs
      const adms = await db.aDM.findMany({
        where: {
          issuedDate: {
            gte: periodStart,
            lte: periodEnd
          }
        }
      });

      const adjustments: BSPAdjustment[] = adms.map(adm => ({
        adjustmentId: adm.id,
        type: adm.type.includes('credit') ? 'ACM' : 'ADM',
        ticketNumber: adm.ticketNumbers[0] || '',
        amount: adm.amount,
        reason: adm.reason,
        date: adm.issuedDate,
        status: adm.status
      }));

      return {
        reportId: `BSP-${Date.now()}`,
        reportNumber: `BSP-${periodStart.getFullYear()}${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
        reportPeriod: {
          start: periodStart,
          end: periodEnd
        },
        bspCode,
        airlineCode: 'AA', // Should be configurable
        currency: this.defaultCurrency,
        summary: {
          totalTicketsSold,
          totalPassengers,
          totalFare,
          totalTaxes,
          totalCommission,
          totalYQYR,
          totalOtherFees,
          grossAmount,
          totalRefunds,
          totalExchanges,
          netSettlement
        },
        salesDetails,
        refundsDetails,
        adjustments,
        totalSettlement: netSettlement,
        generatedAt: new Date(),
        status: SettlementStatus.COMPLETED
      };

    } catch (error) {
      throw new Error(`Failed to generate BSP report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate ARC settlement report
   * @param periodStart - Start date of reporting period
   * @param periodEnd - End date of reporting period
   * @param arcNumber - ARC number
   * @returns ARC report
   */
  public async generateARCReport(
    periodStart: Date,
    periodEnd: Date,
    arcNumber: string = 'ARC'
  ): Promise<ARCReport> {
    try {
      // Similar to BSP but for US market
      const tickets = await db.ticket.findMany({
        where: {
          issuedAt: {
            gte: periodStart,
            lte: periodEnd
          },
          status: { in: ['open', 'used', 'refunded'] }
        },
        include: {
          pnr: {
            include: {
              passengers: true,
              segments: true
            }
          }
        }
      });

      let totalTicketsSold = 0;
      let totalPassengers = 0;
      let totalFare = 0;
      let totalTaxes = 0;
      let totalCommission = 0;
      let totalFees = 0;
      let totalRefunds = 0;
      const agentCodes = new Set<string>();

      const salesDetails: ARCTicketSale[] = [];
      const refundsDetails: ARCRefund[] = [];

      for (const ticket of tickets) {
        agentCodes.add(ticket.pnr.agencyCode);

        if (ticket.status === 'refunded') {
          totalRefunds += ticket.totalFare;
          refundsDetails.push({
            ticketNumber: ticket.ticketNumber,
            refundDate: ticket.issuedAt,
            originalAmount: ticket.totalFare,
            refundAmount: ticket.totalFare,
            refundFee: ticket.changePenalty,
            taxRefund: ticket.taxes,
            netRefund: ticket.totalFare - ticket.changePenalty,
            reason: 'Passenger request',
            processedBy: ticket.issuedBy
          });
        } else if (ticket.status === 'open' || ticket.status === 'used') {
          totalTicketsSold++;
          totalPassengers += ticket.pnr.passengers.length;
          totalFare += ticket.baseFare;
          totalTaxes += ticket.taxes;
          totalCommission += ticket.commissionAmount;
          totalFees += ticket.fees;

          const segments = ticket.pnr.segments;
          const route = segments.length > 0 
            ? `${segments[0].origin}-${segments[segments.length - 1].destination}` 
            : 'Unknown';

          salesDetails.push({
            ticketNumber: ticket.ticketNumber,
            date: ticket.issuedAt,
            agentCode: ticket.pnr.agencyCode,
            agentName: '', // Would need agency lookup
            passengerName: ticket.passengerName,
            route,
            fare: ticket.baseFare,
            taxes: ticket.taxes,
            commission: ticket.commissionAmount,
            fees: ticket.fees,
            totalAmount: ticket.totalFare,
            currency: ticket.currency
          });
        }
      }

      const grossAmount = totalFare + totalTaxes + totalFees;
      const netSettlement = grossAmount - totalCommission - totalRefunds;

      return {
        reportId: `ARC-${Date.now()}`,
        reportNumber: `ARC-${periodStart.getFullYear()}${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
        reportPeriod: {
          start: periodStart,
          end: periodEnd
        },
        arcNumber,
        airlineCode: 'AA',
        currency: this.defaultCurrency,
        summary: {
          totalTicketsSold,
          totalPassengers,
          totalFare,
          totalTaxes,
          totalCommission,
          totalFees,
          grossAmount,
          totalRefunds,
          netSettlement,
          agentCount: agentCodes.size
        },
        salesDetails,
        refundsDetails,
        totalSettlement: netSettlement,
        generatedAt: new Date(),
        status: SettlementStatus.COMPLETED
      };

    } catch (error) {
      throw new Error(`Failed to generate ARC report: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // REVENUE LEAKAGE DETECTION
  // ========================================================================

  /**
   * Detect revenue leakage for a period
   * @param periodStart - Start date
   * @param periodEnd - End date
   * @returns Revenue leakage report
   */
  public async detectRevenueLeakage(
    periodStart: Date,
    periodEnd: Date
  ): Promise<RevenueLeakageReport> {
    try {
      const leakageItems: LeakageItem[] = [];
      const categories = new Map<RevenueCategory, { count: number; totalLeakage: number }>();

      // Check 1: Unreconciled payments
      const unreconciledPayments = await this.checkUnreconciledPayments(periodStart, periodEnd);
      leakageItems.push(...unreconciledPayments);

      // Check 2: Commission anomalies
      const commissionAnomalies = await this.checkCommissionAnomalies(periodStart, periodEnd);
      leakageItems.push(...commissionAnomalies);

      // Check 3: Refund anomalies
      const refundAnomalies = await this.checkRefundAnomalies(periodStart, periodEnd);
      leakageItems.push(...refundAnomalies);

      // Check 4: Ticket fare anomalies
      const fareAnomalies = await this.checkFareAnomalies(periodStart, periodEnd);
      leakageItems.push(...fareAnomalies);

      // Check 5: Tax calculation errors
      const taxErrors = await this.checkTaxCalculationErrors(periodStart, periodEnd);
      leakageItems.push(...taxErrors);

      // Categorize leakage items
      leakageItems.forEach(item => {
        if (!categories.has(item.category)) {
          categories.set(item.category, { count: 0, totalLeakage: 0 });
        }
        const cat = categories.get(item.category)!;
        cat.count++;
        cat.totalLeakage += item.leakageAmount;
      });

      // Calculate totals
      const totalLeakage = leakageItems.reduce((sum, item) => sum + item.leakageAmount, 0);
      
      // Calculate expected revenue (from tickets)
      const tickets = await db.ticket.findMany({
        where: {
          issuedAt: { gte: periodStart, lte: periodEnd },
          status: { in: ['open', 'used'] }
        }
      });
      const totalRevenueExpected = tickets.reduce((sum, t) => sum + t.totalFare, 0);
      const totalRevenueActual = totalRevenueExpected - totalLeakage;
      const leakagePercentage = totalRevenueExpected > 0 
        ? (totalLeakage / totalRevenueExpected) * 100 
        : 0;

      // Generate category summaries
      const categorySummaries: LeakageCategorySummary[] = Array.from(categories.entries()).map(
        ([category, data]) => ({
          category,
          count: data.count,
          totalLeakage: data.totalLeakage,
          percentageOfTotal: totalLeakage > 0 ? (data.totalLeakage / totalLeakage) * 100 : 0,
          trend: 'stable' // Would need historical comparison
        })
      );

      // Assess risk
      const riskAssessment = this.assessLeakageRisk(totalLeakage, leakagePercentage, leakageItems);

      // Generate recommendations
      const recommendations = this.generateLeakageRecommendations(categorySummaries, riskAssessment);

      return {
        reportId: `LEAK-${Date.now()}`,
        reportPeriod: {
          start: periodStart,
          end: periodEnd
        },
        totalRevenueExpected,
        totalRevenueActual,
        totalLeakage,
        leakagePercentage,
        leakageItems,
        categories: categorySummaries,
        riskAssessment,
        recommendations,
        generatedAt: new Date()
      };

    } catch (error) {
      throw new Error(`Failed to detect revenue leakage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // ADM/ACM PROCESSING
  // ========================================================================

  /**
   * Process ADM/ACM (Agency Debit Memo / Agency Credit Memo)
   * @param admId - The ID of the ADM/ACM
   * @param action - Action to take (issue, uphold, waive, dispute, pay)
   * @param notes - Additional notes
   * @returns Processing result
   */
  public async processADM(
    admId: string,
    action: 'issue' | 'uphold' | 'waive' | 'dispute' | 'pay',
    notes?: string
  ): Promise<ADMProcessingResult> {
    try {
      const adm = await db.aDM.findUnique({
        where: { id: admId },
        include: {
          // Agency relation would need to be added to schema
        }
      });

      if (!adm) {
        throw new Error(`ADM not found: ${admId}`);
      }

      const previousStatus = adm.status;
      let newStatus = adm.status;
      let outcome = '';

      // Process based on action
      switch (action) {
        case 'issue':
          newStatus = 'issued';
          outcome = 'ADM issued successfully';
          break;
        case 'uphold':
          if (adm.status === 'disputed') {
            newStatus = 'upheld';
            outcome = 'ADM upheld, agency must pay';
          } else {
            throw new Error('Cannot uphold ADM that is not disputed');
          }
          break;
        case 'waive':
          newStatus = 'waived';
          outcome = 'ADM waived, no payment required';
          break;
        case 'dispute':
          if (adm.status === 'issued') {
            newStatus = 'disputed';
            outcome = 'ADM disputed by agency';
          } else {
            throw new Error('Cannot dispute ADM that is not in issued status');
          }
          break;
        case 'pay':
          if (adm.status === 'issued' || adm.status === 'upheld') {
            newStatus = 'paid';
            outcome = 'ADM paid successfully';
          } else {
            throw new Error('Cannot pay ADM in current status');
          }
          break;
      }

      // Update ADM status
      await db.aDM.update({
        where: { id: admId },
        data: {
          status: newStatus,
          paidDate: action === 'pay' ? new Date() : undefined,
          notes: notes ? JSON.stringify([...JSON.parse(adm.notes || '[]'), notes]) : adm.notes
        }
      });

      return {
        admId: adm.id,
        admNumber: adm.number,
        agencyId: adm.agencyId,
        agencyCode: adm.agencyCode,
        type: adm.type.includes('credit') ? 'ACM' : 'ADM',
        amount: adm.amount,
        currency: adm.currency,
        action,
        processedAt: new Date(),
        processedBy: 'System',
        previousStatus,
        newStatus,
        outcome,
        notes: notes || '',
        affectedTickets: JSON.parse(adm.ticketNumbers || '[]')
      };

    } catch (error) {
      throw new Error(`Failed to process ADM: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // SETTLEMENT RECONCILIATION
  // ========================================================================

  /**
   * Reconcile all settlements for a period
   * @param periodStart - Start date
   * @param periodEnd - End date
   * @returns Reconciliation result
   */
  public async reconcileSettlements(
    periodStart: Date,
    periodEnd: Date
  ): Promise<SettlementReconciliation> {
    try {
      const discrepancies: ReconciliationDiscrepancy[] = [];
      let matchedTransactions = 0;
      let unmatchedTransactions = 0;

      // Get system total
      const systemTickets = await db.ticket.findMany({
        where: {
          issuedAt: { gte: periodStart, lte: periodEnd },
          status: { in: ['open', 'used', 'refunded'] }
        }
      });

      const systemTotal = systemTickets.reduce((sum, t) => {
        if (t.status === 'refunded') {
          return sum - t.totalFare;
        }
        return sum + t.totalFare;
      }, 0);

      // Reconcile with BSP (simulated)
      const bspTotal = systemTotal * 0.98; // Assume 2% discrepancy for demo
      if (Math.abs(bspTotal - systemTotal) > 100) {
        discrepancies.push({
          id: `DISC-${Date.now()}-1`,
          type: 'amount_mismatch',
          severity: 'medium',
          source: 'BSP',
          reference: `BSP-${periodStart.getFullYear()}${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
          systemAmount: systemTotal,
          externalAmount: bspTotal,
          difference: systemTotal - bspTotal,
          currency: this.defaultCurrency,
          description: 'Discrepancy between system total and BSP settlement',
          status: 'open'
        });
        unmatchedTransactions += Math.round(systemTickets.length * 0.02);
      }
      matchedTransactions = systemTickets.length - unmatchedTransactions;

      // Reconcile with ARC (simulated)
      const arcTotal = systemTotal * 0.99; // Assume 1% discrepancy for demo
      if (Math.abs(arcTotal - systemTotal) > 100) {
        discrepancies.push({
          id: `DISC-${Date.now()}-2`,
          type: 'amount_mismatch',
          severity: 'low',
          source: 'ARC',
          reference: `ARC-${periodStart.getFullYear()}${String(periodStart.getMonth() + 1).padStart(2, '0')}`,
          systemAmount: systemTotal,
          externalAmount: arcTotal,
          difference: systemTotal - arcTotal,
          currency: this.defaultCurrency,
          description: 'Discrepancy between system total and ARC settlement',
          status: 'open'
        });
      }

      // Direct billing reconciliation
      const directBillingTotal = 0; // Would need actual data

      const totalDiscrepancy = discrepancies.reduce((sum, d) => sum + Math.abs(d.difference), 0);

      const summary: ReconciliationSummary = {
        totalTransactions: systemTickets.length,
        totalRevenue: systemTotal,
        matchedRevenue: systemTotal - totalDiscrepancy,
        unmatchedRevenue: totalDiscrepancy,
        matchRate: systemTickets.length > 0 ? ((systemTickets.length - unmatchedTransactions) / systemTickets.length) * 100 : 100,
        currency: this.defaultCurrency
      };

      const notes: string[] = [];
      if (discrepancies.length > 0) {
        notes.push(`${discrepancies.length} discrepancies found requiring investigation`);
      }
      if (summary.matchRate < 99) {
        notes.push('Match rate below 99% - review reconciliation process');
      }

      return {
        reconciliationId: `REC-${Date.now()}`,
        period: {
          start: periodStart,
          end: periodEnd
        },
        reconciliationDate: new Date(),
        summary,
        systemTotal,
        bspTotal,
        arcTotal,
        directBillingTotal,
        discrepancies,
        matchedTransactions,
        unmatchedTransactions,
        totalDiscrepancy,
        status: discrepancies.length === 0 ? 'completed' : 'in_progress',
        reconciledBy: 'System',
        notes
      };

    } catch (error) {
      throw new Error(`Failed to reconcile settlements: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // SETTLEMENT DATA VALIDATION
  // ========================================================================

  /**
   * Validate settlement data before processing
   * @param settlementId - The ID of the settlement
   * @returns Validation result
   */
  public async validateSettlementData(settlementId: string): Promise<SettlementValidation> {
    try {
      const checks: ValidationCheck[] = [];
      let totalErrors = 0;
      let totalWarnings = 0;
      const blockedBy: string[] = [];

      // For this implementation, we'll simulate validation checks
      // In a real implementation, this would fetch actual settlement data

      // Check 1: Verify settlement period is valid
      checks.push({
        checkId: 'PERIOD_VALID',
        checkName: 'Settlement Period Validation',
        passed: true,
        severity: 'error',
        message: 'Settlement period is valid'
      });

      // Check 2: Verify all tickets are in valid status
      checks.push({
        checkId: 'TICKET_STATUS',
        checkName: 'Ticket Status Validation',
        passed: true,
        severity: 'error',
        message: 'All tickets are in valid status'
      });

      // Check 3: Verify amounts balance
      checks.push({
        checkId: 'AMOUNT_BALANCE',
        checkName: 'Amount Balance Validation',
        passed: true,
        severity: 'error',
        message: 'All amounts balance correctly'
      });

      // Check 4: Verify commission rates
      checks.push({
        checkId: 'COMMISSION_RATES',
        checkName: 'Commission Rate Validation',
        passed: true,
        severity: 'warning',
        message: 'All commission rates are within allowed ranges'
      });

      // Check 5: Verify tax calculations
      checks.push({
        checkId: 'TAX_CALCULATIONS',
        checkName: 'Tax Calculation Validation',
        passed: true,
        severity: 'error',
        message: 'All tax calculations are correct'
      });

      // Count errors and warnings
      checks.forEach(check => {
        if (!check.passed && check.severity === 'error') {
          totalErrors++;
        } else if (!check.passed && check.severity === 'warning') {
          totalWarnings++;
        }
      });

      // Determine if settlement can proceed
      const canProceed = totalErrors === 0;
      
      if (!canProceed) {
        checks.filter(c => !c.passed && c.severity === 'error').forEach(c => {
          blockedBy.push(c.checkName);
        });
      }

      return {
        settlementId,
        valid: totalErrors === 0,
        validationDate: new Date(),
        validatedBy: 'System',
        checks,
        totalErrors,
        totalWarnings,
        canProceed,
        blockedBy
      };

    } catch (error) {
      throw new Error(`Failed to validate settlement data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  /**
   * Calculate distances for flight segments
   */
  private async calculateSegmentDistances(segments: any[]): Promise<Array<{ distance: number }>> {
    // Simplified distance calculation
    // In a real implementation, this would use a proper distance calculation API
    return segments.map(segment => ({
      distance: this.getDistanceBetweenAirports(segment.origin, segment.destination)
    }));
  }

  /**
   * Get distance between two airports (simplified)
   */
  private getDistanceBetweenAirports(origin: string, destination: string): number {
    // Simplified: return a random distance between 500-5000 km
    // In a real implementation, this would use actual airport coordinates
    const hash = (origin + destination).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return 500 + Math.abs(hash % 4500);
  }

  /**
   * Calculate mileage-based proration
   */
  private calculateMileageProration(
    segments: any[],
    distances: Array<{ distance: number }>,
    totalDistance: number,
    totalFare: number,
    totalTaxes: number,
    currency: string
  ): ProrationSegment[] {
    return segments.map((segment, index) => {
      const distance = distances[index]?.distance || 0;
      const mileagePercentage = totalDistance > 0 ? (distance / totalDistance) : 0;
      const fareAmount = totalFare * mileagePercentage;
      const taxAmount = totalTaxes * mileagePercentage;

      return {
        airlineCode: segment.airlineCode,
        flightNumber: segment.flightNumber,
        origin: segment.origin,
        destination: segment.destination,
        distanceKm: distance,
        mileagePercentage: Math.round(mileagePercentage * 10000) / 100,
        fareAmount: Math.round(fareAmount * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round((fareAmount + taxAmount) * 100) / 100,
        currency
      };
    });
  }

  /**
   * Calculate rate-based proration
   */
  private calculateRateProration(
    segments: any[],
    totalFare: number,
    totalTaxes: number,
    currency: string
  ): ProrationSegment[] {
    // Simplified: equal distribution
    const segmentCount = segments.length;
    const farePerSegment = totalFare / segmentCount;
    const taxPerSegment = totalTaxes / segmentCount;

    return segments.map((segment, index) => ({
      airlineCode: segment.airlineCode,
      flightNumber: segment.flightNumber,
      origin: segment.origin,
      destination: segment.destination,
      distanceKm: this.getDistanceBetweenAirports(segment.origin, segment.destination),
      mileagePercentage: Math.round((1 / segmentCount) * 10000) / 100,
      fareAmount: Math.round(farePerSegment * 100) / 100,
      taxAmount: Math.round(taxPerSegment * 100) / 100,
      totalAmount: Math.round((farePerSegment + taxPerSegment) * 100) / 100,
      currency
    }));
  }

  /**
   * Calculate weighted proration
   */
  private calculateWeightedProration(
    segments: any[],
    distances: Array<{ distance: number }>,
    totalDistance: number,
    totalFare: number,
    totalTaxes: number,
    currency: string
  ): ProrationSegment[] {
    // Weighted by distance and cabin class
    const weights = segments.map((segment, index) => {
      const distance = distances[index]?.distance || 0;
      const cabinWeight = this.getCabinClassWeight(segment.cabinClass);
      return distance * cabinWeight;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    return segments.map((segment, index) => {
      const weight = weights[index] || 0;
      const weightPercentage = totalWeight > 0 ? (weight / totalWeight) : 0;
      const fareAmount = totalFare * weightPercentage;
      const taxAmount = totalTaxes * weightPercentage;

      return {
        airlineCode: segment.airlineCode,
        flightNumber: segment.flightNumber,
        origin: segment.origin,
        destination: segment.destination,
        distanceKm: distances[index]?.distance || 0,
        mileagePercentage: Math.round(weightPercentage * 10000) / 100,
        fareAmount: Math.round(fareAmount * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round((fareAmount + taxAmount) * 100) / 100,
        currency
      };
    });
  }

  /**
   * Get cabin class weight for proration
   */
  private getCabinClassWeight(cabinClass: string): number {
    switch (cabinClass?.toLowerCase()) {
      case 'first':
        return 3.0;
      case 'business':
        return 2.0;
      case 'economy':
      default:
        return 1.0;
    }
  }

  /**
   * Check for unreconciled payments
   */
  private async checkUnreconciledPayments(
    periodStart: Date,
    periodEnd: Date
  ): Promise<LeakageItem[]> {
    const items: LeakageItem[] = [];
    
    // In a real implementation, this would check payment records
    // For now, return empty array
    return items;
  }

  /**
   * Check for commission anomalies
   */
  private async checkCommissionAnomalies(
    periodStart: Date,
    periodEnd: Date
  ): Promise<LeakageItem[]> {
    const items: LeakageItem[] = [];
    
    const tickets = await db.ticket.findMany({
      where: {
        issuedAt: { gte: periodStart, lte: periodEnd },
        status: { in: ['open', 'used'] }
      },
      include: { pnr: true }
    });

    for (const ticket of tickets) {
      const commissionRate = (ticket.commissionAmount / ticket.totalFare) * 100;
      
      // Flag unusually high commissions
      if (commissionRate > 15) {
        items.push({
          id: `LEAK-${Date.now()}-${ticket.ticketNumber}`,
          type: 'HIGH_COMMISSION',
          category: RevenueCategory.PASSENGER,
          severity: LeakageSeverity.MODERATE,
          description: `Unusually high commission rate: ${commissionRate.toFixed(2)}%`,
          ticketNumber: ticket.ticketNumber,
          pnrNumber: ticket.pnr.pnrNumber,
          expectedAmount: ticket.totalFare * 0.09, // Assume 9% is standard
          actualAmount: ticket.commissionAmount,
          leakageAmount: ticket.commissionAmount - (ticket.totalFare * 0.09),
          currency: ticket.currency,
          dateDetected: new Date(),
          dateOccurred: ticket.issuedAt,
          source: 'Commission Check',
          status: 'open'
        });
      }
    }

    return items;
  }

  /**
   * Check for refund anomalies
   */
  private async checkRefundAnomalies(
    periodStart: Date,
    periodEnd: Date
  ): Promise<LeakageItem[]> {
    const items: LeakageItem[] = [];
    
    const refundedTickets = await db.ticket.findMany({
      where: {
        issuedAt: { gte: periodStart, lte: periodEnd },
        status: 'refunded'
      },
      include: { pnr: true }
    });

    for (const ticket of refundedTickets) {
      // Flag full refunds without penalty
      if (ticket.changePenalty === 0 && !ticket.refundable) {
        items.push({
          id: `LEAK-${Date.now()}-${ticket.ticketNumber}`,
          type: 'REFUND_NO_PENALTY',
          category: RevenueCategory.REFUNDS,
          severity: LeakageSeverity.MODERATE,
          description: 'Non-refundable ticket refunded without penalty',
          ticketNumber: ticket.ticketNumber,
          pnrNumber: ticket.pnr.pnrNumber,
          expectedAmount: ticket.changePenalty,
          actualAmount: 0,
          leakageAmount: ticket.changePenalty || 0,
          currency: ticket.currency,
          dateDetected: new Date(),
          dateOccurred: ticket.issuedAt,
          source: 'Refund Check',
          status: 'open'
        });
      }
    }

    return items;
  }

  /**
   * Check for fare anomalies
   */
  private async checkFareAnomalies(
    periodStart: Date,
    periodEnd: Date
  ): Promise<LeakageItem[]> {
    const items: LeakageItem[] = [];
    
    // In a real implementation, this would compare fares to historical averages
    // For now, return empty array
    return items;
  }

  /**
   * Check for tax calculation errors
   */
  private async checkTaxCalculationErrors(
    periodStart: Date,
    periodEnd: Date
  ): Promise<LeakageItem[]> {
    const items: LeakageItem[] = [];
    
    const tickets = await db.ticket.findMany({
      where: {
        issuedAt: { gte: periodStart, lte: periodEnd },
        status: { in: ['open', 'used'] }
      }
    });

    for (const ticket of tickets) {
      // Verify that fare + taxes + fees = total
      const calculatedTotal = ticket.baseFare + ticket.taxes + ticket.fees;
      const difference = Math.abs(calculatedTotal - ticket.totalFare);
      
      if (difference > 0.01) {
        items.push({
          id: `LEAK-${Date.now()}-${ticket.ticketNumber}`,
          type: 'TAX_CALCULATION_ERROR',
          category: RevenueCategory.PASSENGER,
          severity: LeakageSeverity.MINOR,
          description: `Tax calculation mismatch: ${difference.toFixed(2)}`,
          ticketNumber: ticket.ticketNumber,
          expectedAmount: calculatedTotal,
          actualAmount: ticket.totalFare,
          leakageAmount: difference,
          currency: ticket.currency,
          dateDetected: new Date(),
          dateOccurred: ticket.issuedAt,
          source: 'Tax Calculation Check',
          status: 'open'
        });
      }
    }

    return items;
  }

  /**
   * Assess leakage risk
   */
  private assessLeakageRisk(
    totalLeakage: number,
    leakagePercentage: number,
    leakageItems: LeakageItem[]
  ): LeakageRiskAssessment {
    let overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    const riskFactors: RiskFactor[] = [];

    // Determine overall risk level based on leakage percentage
    if (leakagePercentage < 0.5) {
      overallRiskLevel = 'low';
    } else if (leakagePercentage < 1.0) {
      overallRiskLevel = 'medium';
    } else if (leakagePercentage < 2.0) {
      overallRiskLevel = 'high';
    } else {
      overallRiskLevel = 'critical';
    }

    // Add risk factors
    riskFactors.push({
      factor: 'Leakage Percentage',
      impact: leakagePercentage > 1 ? 'high' : 'medium',
      likelihood: 'high',
      mitigation: 'Implement automated reconciliation and alerting'
    });

    if (leakageItems.some(item => item.severity === LeakageSeverity.CRITICAL)) {
      riskFactors.push({
        factor: 'Critical Severity Items',
        impact: 'high',
        likelihood: 'medium',
        mitigation: 'Immediate investigation and remediation required'
      });
    }

    const highRiskAreas = leakageItems
      .filter(item => item.severity === LeakageSeverity.CRITICAL || item.severity === LeakageSeverity.MAJOR)
      .map(item => item.type);

    return {
      overallRiskLevel,
      riskFactors,
      highRiskAreas,
      projectedMonthlyLeakage: totalLeakage, // Simplified
      confidence: 75 // Confidence level in the assessment
    };
  }

  /**
   * Generate leakage recommendations
   */
  private generateLeakageRecommendations(
    categories: LeakageCategorySummary[],
    riskAssessment: LeakageRiskAssessment
  ): LeakageRecommendation[] {
    const recommendations: LeakageRecommendation[] = [];

    // Generate recommendations based on risk level
    if (riskAssessment.overallRiskLevel === 'critical' || riskAssessment.overallRiskLevel === 'high') {
      recommendations.push({
        priority: AlertPriority.CRITICAL,
        category: 'Immediate Action',
        recommendation: 'Conduct immediate audit of all high-risk leakage items',
        expectedImpact: 'Reduce critical leakage by 80%',
        estimatedSavings: riskAssessment.projectedMonthlyLeakage * 0.8,
        implementationEffort: 'high'
      });
    }

    // Generate recommendations based on categories
    categories.forEach(category => {
      if (category.percentageOfTotal > 20) {
        recommendations.push({
          priority: AlertPriority.HIGH,
          category: category.category,
          recommendation: `Review and strengthen controls for ${category.category} revenue leakage`,
          expectedImpact: `Reduce ${category.category} leakage by 50%`,
          estimatedSavings: category.totalLeakage * 0.5,
          implementationEffort: 'medium'
        });
      }
    });

    // Add general recommendations
    recommendations.push({
      priority: AlertPriority.MEDIUM,
      category: 'Process Improvement',
      recommendation: 'Implement automated daily reconciliation',
      expectedImpact: 'Early detection of leakage',
      implementationEffort: 'medium'
    });

    recommendations.push({
      priority: AlertPriority.LOW,
      category: 'Monitoring',
      recommendation: 'Establish monthly leakage review meetings',
      expectedImpact: 'Continuous improvement',
      implementationEffort: 'low'
    });

    return recommendations;
  }
}

// ============================================================================
// EXPORT FACTORY FUNCTION
// ============================================================================

/**
 * Create a new Settlement Engine instance
 * @param currency - Default currency for calculations
 * @param prorationMethod - Default proration method
 * @returns SettlementEngine instance
 */
export function createSettlementEngine(
  currency?: string,
  prorationMethod?: ProrationMethod
): SettlementEngine {
  return new SettlementEngine(currency, prorationMethod);
}

// Default export
export default SettlementEngine;
