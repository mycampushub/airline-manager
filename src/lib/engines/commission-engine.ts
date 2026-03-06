/**
 * Agency Commission Rules Engine for Airline Manager System
 * 
 * This engine provides comprehensive commission calculation including:
 * - Multi-tier override system
 * - Route-based commission calculation
 * - Cabin-based commission
 * - Seasonal incentives
 * - Corporate vs retail rules
 * - Payment method-based commission
 * - Volume bonus calculation
 * - Commission override application
 * - Commission tracking per agent
 */

import { db } from '@/lib/db';

// ============================================
// Type Definitions
// ============================================

/**
 * Commission calculation result
 */
export interface CommissionResult {
  baseRate: number;
  effectiveRate: number;
  commissionAmount: number;
  appliedOverrides: CommissionOverride[];
  appliedIncentives: string[];
  breakdown: {
    baseCommission: number;
    routeOverride: number;
    cabinOverride: number;
    seasonalIncentive: number;
    corporateAdjustment: number;
    volumeBonus: number;
    total: number;
  };
}

/**
 * Commission override information
 */
export interface CommissionOverride {
  type: 'route' | 'cabin' | 'seasonal' | 'corporate' | 'payment_method';
  rate: number;
  amount: number;
  reason: string;
  priority: number;
}

/**
 * Agency information for commission calculation
 */
export interface AgencyInfo {
  id: string;
  code: string;
  tier: string;
  type: string;
  baseCommissionRate: number;
}

/**
 * Booking information for commission calculation
 */
export interface BookingInfo {
  id: string;
  route: string;
  origin: string;
  destination: string;
  cabin: string;
  fareClass: string;
  baseFare: number;
  totalAmount: number;
  date: string;
  isCorporate: boolean;
  corporateAccount?: string;
  paymentMethod: string;
  currency: string;
}

/**
 * Volume bonus information
 */
export interface VolumeBonus {
  agencyId: string;
  period: 'monthly' | 'quarterly' | 'annual';
  currentRevenue: number;
  currentBookings: number;
  nextTier: string;
  nextTierRevenue: number;
  nextTierBonus: number;
  currentBonus: number;
  projectedBonus: number;
}

/**
 * Commission tracking per agent
 */
export interface AgentCommission {
  agentId: string;
  agentName: string;
  agencyId: string;
  agencyCode: string;
  period: string;
  totalCommission: number;
  bookings: number;
  passengers: number;
  averageCommission: number;
  topRoutes: Array<{
    route: string;
    commission: number;
    bookings: number;
  }>;
}

/**
 * Commission configuration
 */
export interface CommissionConfig {
  defaultRates: {
    economy: number;
    business: number;
    first: number;
  };
  tierMultipliers: {
    platinum: number;
    gold: number;
    silver: number;
    bronze: number;
    standard: number;
  };
  typeMultipliers: {
    iata: number;
    non_iata: number;
    corporate: number;
    ota: number;
    tmc: number;
  };
  paymentMethodAdjustments: {
    credit_card: number;
    debit_card: number;
    cash: number;
    bank_transfer: number;
    virtual_account: number;
  };
}

// ============================================
// Commission Engine Class
// ============================================

/**
 * Main commission engine class that handles all commission calculations
 */
export class CommissionEngine {
  private config: CommissionConfig;
  private cache: Map<string, { data: any; expiry: number }>;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  constructor(config?: Partial<CommissionConfig>) {
    this.config = {
      defaultRates: {
        economy: 0.05, // 5%
        business: 0.07, // 7%
        first: 0.10, // 10%
      },
      tierMultipliers: {
        platinum: 1.25,
        gold: 1.15,
        silver: 1.10,
        bronze: 1.05,
        standard: 1.0,
      },
      typeMultipliers: {
        iata: 1.2,
        non_iata: 1.0,
        corporate: 1.15,
        ota: 0.9,
        tmc: 1.1,
      },
      paymentMethodAdjustments: {
        credit_card: -0.005, // -0.5% due to processing fees
        debit_card: 0,
        cash: 0.002, // +0.2% incentive
        bank_transfer: 0.001, // +0.1% incentive
        virtual_account: 0,
      },
      ...config,
    };
    this.cache = new Map();
  }

  /**
   * Calculate commission for a booking
   * @param booking - Booking information
   * @param agency - Agency information
   * @returns Commission calculation result
   */
  async calculateCommission(booking: BookingInfo, agency: AgencyInfo): Promise<CommissionResult> {
    try {
      // Get base commission rate for the cabin
      const baseRate = this.config.defaultRates[booking.cabin as keyof typeof this.config.defaultRates] || this.config.defaultRates.economy;

      // Apply tier multiplier
      const tierMultiplier = this.config.tierMultipliers[agency.tier as keyof typeof this.config.tierMultipliers] || 1.0;
      const tieredRate = baseRate * tierMultiplier;

      // Apply agency type multiplier
      const typeMultiplier = this.config.typeMultipliers[agency.type as keyof typeof this.config.typeMultipliers] || 1.0;
      const effectiveBaseRate = tieredRate * typeMultiplier;

      // Calculate base commission
      const baseCommission = booking.baseFare * effectiveBaseRate;

      // Initialize breakdown
      const breakdown = {
        baseCommission,
        routeOverride: 0,
        cabinOverride: 0,
        seasonalIncentive: 0,
        corporateAdjustment: 0,
        volumeBonus: 0,
        total: baseCommission,
      };

      // Track applied overrides and incentives
      const appliedOverrides: CommissionOverride[] = [];
      const appliedIncentives: string[] = [];

      // Apply route-based override
      const routeResult = await this.applyRouteOverride(
        { rate: effectiveBaseRate, amount: baseCommission, type: 'route', reason: '', priority: 0 },
        booking.route,
        booking.origin,
        booking.destination,
        agency.id
      );

      if (routeResult.rate !== effectiveBaseRate) {
        appliedOverrides.push(routeResult);
        breakdown.routeOverride = routeResult.amount - baseCommission;
      }

      // Apply cabin-based override
      const cabinResult = await this.applyCabinOverride(
        { rate: routeResult.rate, amount: booking.baseFare * routeResult.rate, type: 'cabin', reason: '', priority: 0 },
        booking.cabin,
        agency.id
      );

      if (cabinResult.rate !== routeResult.rate) {
        appliedOverrides.push(cabinResult);
        breakdown.cabinOverride = cabinResult.amount - (booking.baseFare * routeResult.rate);
      }

      // Apply seasonal incentive
      const season = this.getSeason(booking.date);
      const seasonalResult = await this.applySeasonalIncentive(
        { rate: cabinResult.rate, amount: booking.baseFare * cabinResult.rate, type: 'seasonal', reason: '', priority: 0 },
        season
      );

      if (seasonalResult.rate !== cabinResult.rate) {
        appliedOverrides.push(seasonalResult);
        breakdown.seasonalIncentive = seasonalResult.amount - (booking.baseFare * cabinResult.rate);
        appliedIncentives.push(`${season} season incentive`);
      }

      // Apply corporate rules if applicable
      let currentRate = seasonalResult.rate;
      let currentAmount = seasonalResult.amount;

      if (booking.isCorporate) {
        const corporateResult = await this.applyCorporateRules(
          { rate: currentRate, amount: currentAmount, type: 'corporate', reason: '', priority: 0 },
          booking.isCorporate
        );

        if (corporateResult.rate !== currentRate) {
          appliedOverrides.push(corporateResult);
          breakdown.corporateAdjustment = corporateResult.amount - currentAmount;
          appliedIncentives.push('Corporate booking bonus');
        }

        currentRate = corporateResult.rate;
        currentAmount = corporateResult.amount;
      }

      // Apply payment method adjustment
      const paymentResult = this.applyPaymentMethodCommission(
        { rate: currentRate, amount: currentAmount, type: 'payment_method', reason: '', priority: 0 },
        booking.paymentMethod
      );

      if (paymentResult.rate !== currentRate) {
        appliedOverrides.push(paymentResult);
        currentRate = paymentResult.rate;
        currentAmount = paymentResult.amount;
      }

      // Calculate total commission
      breakdown.total = currentAmount;

      // Sort overrides by priority
      appliedOverrides.sort((a, b) => b.priority - a.priority);

      const result: CommissionResult = {
        baseRate: effectiveBaseRate,
        effectiveRate: currentRate,
        commissionAmount: Math.round(currentAmount * 100) / 100,
        appliedOverrides,
        appliedIncentives,
        breakdown: {
          baseCommission: Math.round(breakdown.baseCommission * 100) / 100,
          routeOverride: Math.round(breakdown.routeOverride * 100) / 100,
          cabinOverride: Math.round(breakdown.cabinOverride * 100) / 100,
          seasonalIncentive: Math.round(breakdown.seasonalIncentive * 100) / 100,
          corporateAdjustment: Math.round(breakdown.corporateAdjustment * 100) / 100,
          volumeBonus: Math.round(breakdown.volumeBonus * 100) / 100,
          total: Math.round(breakdown.total * 100) / 100,
        },
      };

      return result;
    } catch (error) {
      console.error('Error calculating commission:', error);
      throw new Error(`Failed to calculate commission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply route-based commission override
   * @param commission - Current commission state
   * @param route - Route code
   * @param origin - Origin airport
   * @param destination - Destination airport
   * @param agencyId - Agency ID
   * @returns Updated commission with route override
   */
  async applyRouteOverride(
    commission: CommissionOverride,
    route: string,
    origin: string,
    destination: string,
    agencyId: string
  ): Promise<CommissionOverride> {
    try {
      // Check for specific route override in database
      const override = await db.commissionOverride.findFirst({
        where: {
          agencyId,
          OR: [
            { route },
            { origin, destination },
          ],
          effectiveFrom: {
            lte: new Date(),
          },
          OR: [
            { effectiveUntil: null },
            { effectiveUntil: { gte: new Date() } },
          ],
        },
        orderBy: {
          rate: 'desc',
        },
      });

      if (override) {
        return {
          ...commission,
          rate: override.rate,
          amount: commission.amount * (override.rate / commission.rate),
          reason: `Route override for ${route}: ${override.rate * 100}%`,
          priority: 3,
        };
      }

      return commission;
    } catch (error) {
      console.error('Error applying route override:', error);
      return commission;
    }
  }

  /**
   * Apply cabin-based commission override
   * @param commission - Current commission state
   * @param cabin - Cabin class
   * @param agencyId - Agency ID
   * @returns Updated commission with cabin override
   */
  async applyCabinOverride(
    commission: CommissionOverride,
    cabin: string,
    agencyId: string
  ): Promise<CommissionOverride> {
    try {
      // Check for cabin-specific override
      const override = await db.commissionOverride.findFirst({
        where: {
          agencyId,
          cabin,
          effectiveFrom: {
            lte: new Date(),
          },
          OR: [
            { effectiveUntil: null },
            { effectiveUntil: { gte: new Date() } },
          ],
        },
      });

      if (override) {
        return {
          ...commission,
          rate: override.rate,
          amount: commission.amount * (override.rate / commission.rate),
          reason: `Cabin override for ${cabin}: ${override.rate * 100}%`,
          priority: 2,
        };
      }

      // Apply default cabin adjustments
      const cabinAdjustments: Record<string, number> = {
        economy: 1.0,
        business: 1.2,
        first: 1.4,
      };

      const adjustment = cabinAdjustments[cabin] || 1.0;
      if (adjustment !== 1.0) {
        return {
          ...commission,
          rate: commission.rate * adjustment,
          amount: commission.amount * adjustment,
          reason: `Default cabin adjustment for ${cabin}: +${((adjustment - 1) * 100).toFixed(0)}%`,
          priority: 1,
        };
      }

      return commission;
    } catch (error) {
      console.error('Error applying cabin override:', error);
      return commission;
    }
  }

  /**
   * Apply seasonal incentive
   * @param commission - Current commission state
   * @param season - Season type
   * @returns Updated commission with seasonal incentive
   */
  async applySeasonalIncentive(
    commission: CommissionOverride,
    season: 'low' | 'shoulder' | 'peak'
  ): Promise<CommissionOverride> {
    try {
      // Seasonal incentives
      const seasonalIncentives: Record<string, number> = {
        low: 0.02, // 2% bonus in low season
        shoulder: 0.01, // 1% bonus in shoulder season
        peak: 0, // No bonus in peak season
      };

      const incentive = seasonalIncentives[season] || 0;

      if (incentive > 0) {
        return {
          ...commission,
          rate: commission.rate + incentive,
          amount: commission.amount * (1 + incentive / commission.rate),
          reason: `${season} season incentive: +${(incentive * 100).toFixed(1)}%`,
          priority: 2,
        };
      }

      return commission;
    } catch (error) {
      console.error('Error applying seasonal incentive:', error);
      return commission;
    }
  }

  /**
   * Apply corporate booking rules
   * @param commission - Current commission state
   * @param isCorporate - Whether this is a corporate booking
   * @returns Updated commission with corporate adjustment
   */
  async applyCorporateRules(
    commission: CommissionOverride,
    isCorporate: boolean
  ): Promise<CommissionOverride> {
    try {
      if (!isCorporate) {
        return commission;
      }

      // Corporate bookings typically have lower base commission but volume bonuses
      const corporateAdjustment = -0.01; // -1% base adjustment

      return {
        ...commission,
        rate: Math.max(0, commission.rate + corporateAdjustment),
        amount: commission.amount * (1 + corporateAdjustment / commission.rate),
        reason: 'Corporate booking rate adjustment',
        priority: 2,
      };
    } catch (error) {
      console.error('Error applying corporate rules:', error);
      return commission;
    }
  }

  /**
   * Apply payment method-based commission adjustment
   * @param commission - Current commission state
   * @param method - Payment method
   * @returns Updated commission with payment method adjustment
   */
  applyPaymentMethodCommission(
    commission: CommissionOverride,
    method: string
  ): CommissionOverride {
    try {
      // Normalize payment method
      const normalizedMethod = method.toLowerCase().replace(/[^a-z_]/g, '_');
      const adjustment = this.config.paymentMethodAdjustments[normalizedMethod as keyof typeof this.config.paymentMethodAdjustments] || 0;

      if (adjustment !== 0) {
        const newRate = Math.max(0, commission.rate + adjustment);
        return {
          ...commission,
          rate: newRate,
          amount: commission.amount * (newRate / commission.rate),
          reason: `Payment method adjustment for ${method}: ${(adjustment * 100).toFixed(2)}%`,
          priority: 1,
        };
      }

      return commission;
    } catch (error) {
      console.error('Error applying payment method commission:', error);
      return commission;
    }
  }

  /**
   * Calculate volume bonus for an agency
   * @param agency - Agency information
   * @param period - Period type
   * @returns Volume bonus information
   */
  async calculateVolumeBonus(agency: AgencyInfo, period: 'monthly' | 'quarterly' | 'annual'): Promise<VolumeBonus> {
    try {
      const cacheKey = `volume_bonus:${agency.id}:${period}`;
      const cached = this.getCache<VolumeBonus>(cacheKey);
      if (cached) return cached;

      // Get current period start and end dates
      const { startDate, endDate } = this.getPeriodDates(period);

      // Get agency's current performance
      const performance = await this.getAgencyPerformance(agency.id, startDate, endDate);

      // Get volume bonus tiers
      const bonusTiers = await this.getVolumeBonusTiers(agency.id, period);

      // Calculate current tier and bonus
      let currentBonus = 0;
      let nextTier = agency.tier;
      let nextTierRevenue = performance.totalRevenue;
      let nextTierBonus = 0;

      for (const tier of bonusTiers) {
        if (performance.totalRevenue >= tier.minRevenue) {
          currentBonus = performance.totalRevenue * tier.bonusRate;
          nextTier = this.getNextTier(agency.tier);
          nextTierRevenue = tier.minRevenue;
          nextTierBonus = performance.totalRevenue * tier.bonusRate;
        }
      }

      // Project bonus based on current trajectory
      const daysInPeriod = this.getDaysInPeriod(period);
      const daysElapsed = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const projectionFactor = daysInPeriod / daysElapsed;
      const projectedRevenue = performance.totalRevenue * projectionFactor;

      let projectedBonus = 0;
      for (const tier of bonusTiers) {
        if (projectedRevenue >= tier.minRevenue) {
          projectedBonus = projectedRevenue * tier.bonusRate;
        }
      }

      const volumeBonus: VolumeBonus = {
        agencyId: agency.id,
        period,
        currentRevenue: Math.round(performance.totalRevenue * 100) / 100,
        currentBookings: performance.totalBookings,
        nextTier,
        nextTierRevenue: Math.round(nextTierRevenue * 100) / 100,
        nextTierBonus: Math.round(nextTierBonus * 100) / 100,
        currentBonus: Math.round(currentBonus * 100) / 100,
        projectedBonus: Math.round(projectedBonus * 100) / 100,
      };

      this.setCache(cacheKey, volumeBonus);
      return volumeBonus;
    } catch (error) {
      console.error('Error calculating volume bonus:', error);
      return {
        agencyId: agency.id,
        period,
        currentRevenue: 0,
        currentBookings: 0,
        nextTier: agency.tier,
        nextTierRevenue: 0,
        nextTierBonus: 0,
        currentBonus: 0,
        projectedBonus: 0,
      };
    }
  }

  /**
   * Get effective commission rate considering all factors
   * @param agency - Agency information
   * @param route - Route code
   * @param cabin - Cabin class
   * @param date - Booking date
   * @returns Effective commission rate
   */
  async getEffectiveCommissionRate(
    agency: AgencyInfo,
    route: string,
    cabin: string,
    date: string
  ): Promise<number> {
    try {
      // Create a sample booking for rate calculation
      const sampleBooking: BookingInfo = {
        id: 'sample',
        route,
        origin: route.split('-')[0] || 'XXX',
        destination: route.split('-')[1] || 'YYY',
        cabin,
        fareClass: 'Y',
        baseFare: 100, // Use $100 for rate calculation
        totalAmount: 100,
        date,
        isCorporate: false,
        paymentMethod: 'credit_card',
        currency: 'USD',
      };

      const commission = await this.calculateCommission(sampleBooking, agency);
      return commission.effectiveRate;
    } catch (error) {
      console.error('Error getting effective commission rate:', error);
      return this.config.defaultRates.economy;
    }
  }

  /**
   * Track commission per agent
   * @param agentId - Agent ID
   * @param booking - Booking information
   * @param agency - Agency information
   * @returns Agent commission tracking information
   */
  async trackCommissionPerAgent(
    agentId: string,
    booking: BookingInfo,
    agency: AgencyInfo
  ): Promise<AgentCommission> {
    try {
      const period = this.getCurrentPeriod('monthly');
      const cacheKey = `agent_commission:${agentId}:${period}`;
      
      // Calculate commission for this booking
      const commission = await this.calculateCommission(booking, agency);

      // Get or create agent commission record
      let agentCommission = this.getCache<AgentCommission>(cacheKey);
      
      if (!agentCommission) {
        // Initialize new tracking record
        const agentMetrics = await this.getAgentMetrics(agentId, period);
        agentCommission = {
          agentId,
          agentName: agentMetrics.agentName || `Agent ${agentId}`,
          agencyId: agency.id,
          agencyCode: agency.code,
          period,
          totalCommission: commission.commissionAmount,
          bookings: 1,
          passengers: 1, // Assuming 1 passenger per booking for simplicity
          averageCommission: commission.commissionAmount,
          topRoutes: [
            {
              route: booking.route,
              commission: commission.commissionAmount,
              bookings: 1,
            },
          ],
        };
      } else {
        // Update existing tracking record
        agentCommission.totalCommission += commission.commissionAmount;
        agentCommission.bookings += 1;
        agentCommission.passengers += 1;
        agentCommission.averageCommission = agentCommission.totalCommission / agentCommission.bookings;

        // Update top routes
        const existingRoute = agentCommission.topRoutes.find(r => r.route === booking.route);
        if (existingRoute) {
          existingRoute.commission += commission.commissionAmount;
          existingRoute.bookings += 1;
        } else {
          agentCommission.topRoutes.push({
            route: booking.route,
            commission: commission.commissionAmount,
            bookings: 1,
          });
        }

        // Keep only top 5 routes
        agentCommission.topRoutes.sort((a, b) => b.commission - a.commission);
        agentCommission.topRoutes = agentCommission.topRoutes.slice(0, 5);
      }

      // Round all values
      agentCommission.totalCommission = Math.round(agentCommission.totalCommission * 100) / 100;
      agentCommission.averageCommission = Math.round(agentCommission.averageCommission * 100) / 100;
      agentCommission.topRoutes.forEach(route => {
        route.commission = Math.round(route.commission * 100) / 100;
      });

      this.setCache(cacheKey, agentCommission);
      return agentCommission;
    } catch (error) {
      console.error('Error tracking commission per agent:', error);
      throw new Error(`Failed to track commission per agent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private getSeason(date: string): 'low' | 'shoulder' | 'peak' {
    const month = new Date(date).getMonth();
    
    // Peak seasons
    if ((month >= 5 && month <= 7) || (month === 11 || month === 0)) {
      return 'peak';
    }
    
    // Shoulder seasons
    if ((month >= 3 && month <= 4) || (month >= 8 && month <= 10)) {
      return 'shoulder';
    }
    
    return 'low';
  }

  private getPeriodDates(period: 'monthly' | 'quarterly' | 'annual'): {
    startDate: Date;
    endDate: Date;
  } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case 'annual':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
    }

    return { startDate, endDate };
  }

  private getDaysInPeriod(period: 'monthly' | 'quarterly' | 'annual'): number {
    switch (period) {
      case 'monthly':
        return 30;
      case 'quarterly':
        return 90;
      case 'annual':
        return 365;
    }
  }

  private getCurrentPeriod(period: 'monthly' | 'quarterly' | 'annual'): string {
    const now = new Date();
    switch (period) {
      case 'monthly':
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      case 'quarterly':
        return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
      case 'annual':
        return `${now.getFullYear()}`;
    }
  }

  private async getAgencyPerformance(agencyId: string, startDate: Date, endDate: Date): Promise<{
    totalRevenue: number;
    totalBookings: number;
  }> {
    try {
      // Get tickets for the agency in the period
      const tickets = await db.ticket.findMany({
        where: {
          paidTo: agencyId,
          issuedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.totalFare, 0);
      const totalBookings = tickets.length;

      return { totalRevenue, totalBookings };
    } catch (error) {
      console.error('Error getting agency performance:', error);
      return { totalRevenue: 0, totalBookings: 0 };
    }
  }

  private async getVolumeBonusTiers(agencyId: string, period: 'monthly' | 'quarterly' | 'annual'): Promise<Array<{
    minRevenue: number;
    bonusRate: number;
  }>> {
    try {
      // Get volume bonus configuration from database
      const bonusTiers = await db.volumeBonus.findMany({
        where: {
          agencyId,
          period,
        },
        orderBy: {
          minRevenue: 'asc',
        },
      });

      if (bonusTiers.length > 0) {
        return bonusTiers.map(tier => ({
          minRevenue: tier.minRevenue,
          bonusRate: tier.bonusRate,
        }));
      }

      // Default bonus tiers
      const defaultTiers = [
        { minRevenue: 0, bonusRate: 0 },
        { minRevenue: 10000, bonusRate: 0.01 }, // 1% bonus at $10,000
        { minRevenue: 50000, bonusRate: 0.02 }, // 2% bonus at $50,000
        { minRevenue: 100000, bonusRate: 0.03 }, // 3% bonus at $100,000
        { minRevenue: 250000, bonusRate: 0.04 }, // 4% bonus at $250,000
        { minRevenue: 500000, bonusRate: 0.05 }, // 5% bonus at $500,000
      ];

      // Adjust for period
      const periodMultiplier = period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 12;
      return defaultTiers.map(tier => ({
        minRevenue: tier.minRevenue * periodMultiplier,
        bonusRate: tier.bonusRate,
      }));
    } catch (error) {
      console.error('Error getting volume bonus tiers:', error);
      return [];
    }
  }

  private getNextTier(currentTier: string): string {
    const tiers = ['standard', 'bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    if (currentIndex < tiers.length - 1) {
      return tiers[currentIndex + 1];
    }
    return currentTier;
  }

  private async getAgentMetrics(agentId: string, period: string): Promise<{
    agentName: string;
  }> {
    try {
      // Get agent information from database
      const agent = await db.securityUser.findUnique({
        where: { id: agentId },
        select: { firstName: true, lastName: true },
      });

      if (agent) {
        return {
          agentName: `${agent.firstName} ${agent.lastName}`,
        };
      }

      return { agentName: '' };
    } catch (error) {
      console.error('Error getting agent metrics:', error);
      return { agentName: '' };
    }
  }

  // Cache methods
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL,
    });
  }

  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update commission configuration
   * @param config - New configuration values
   */
  updateConfig(config: Partial<CommissionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get commission summary for an agency
   * @param agencyId - Agency ID
   * @param period - Period type
   * @returns Commission summary
   */
  async getAgencyCommissionSummary(
    agencyId: string,
    period: 'monthly' | 'quarterly' | 'annual'
  ): Promise<{
    totalCommission: number;
    totalBookings: number;
    averageCommission: number;
    topPerformingRoutes: Array<{
      route: string;
      commission: number;
      bookings: number;
    }>;
    volumeBonus: number;
  }> {
    try {
      const { startDate, endDate } = this.getPeriodDates(period);

      // Get all tickets for the agency
      const tickets = await db.ticket.findMany({
        where: {
          paidTo: agencyId,
          issuedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalCommission = tickets.reduce((sum, ticket) => sum + ticket.commissionAmount, 0);
      const totalBookings = tickets.length;
      const averageCommission = totalBookings > 0 ? totalCommission / totalBookings : 0;

      // Group by route
      const routeMap = new Map<string, { commission: number; bookings: number }>();
      
      for (const ticket of tickets) {
        // Try to get route from PNR
        const pnr = await db.pNR.findUnique({
          where: { id: ticket.pnrId },
          include: { segments: true },
        });

        if (pnr && pnr.segments.length > 0) {
          const route = `${pnr.segments[0].origin}-${pnr.segments[0].destination}`;
          const existing = routeMap.get(route) || { commission: 0, bookings: 0 };
          routeMap.set(route, {
            commission: existing.commission + ticket.commissionAmount,
            bookings: existing.bookings + 1,
          });
        }
      }

      // Get top performing routes
      const topPerformingRoutes = Array.from(routeMap.entries())
        .map(([route, data]) => ({ route, ...data }))
        .sort((a, b) => b.commission - a.commission)
        .slice(0, 5)
        .map(route => ({
          ...route,
          commission: Math.round(route.commission * 100) / 100,
        }));

      // Get volume bonus
      const agency = await db.agency.findUnique({
        where: { id: agencyId },
      });

      let volumeBonus = 0;
      if (agency) {
        const volumeBonusInfo = await this.calculateVolumeBonus(
          {
            id: agency.id,
            code: agency.code,
            tier: agency.tier,
            type: agency.type,
            baseCommissionRate: 0.05,
          },
          period
        );
        volumeBonus = volumeBonusInfo.currentBonus;
      }

      return {
        totalCommission: Math.round(totalCommission * 100) / 100,
        totalBookings,
        averageCommission: Math.round(averageCommission * 100) / 100,
        topPerformingRoutes,
        volumeBonus: Math.round(volumeBonus * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting agency commission summary:', error);
      return {
        totalCommission: 0,
        totalBookings: 0,
        averageCommission: 0,
        topPerformingRoutes: [],
        volumeBonus: 0,
      };
    }
  }
}

// ============================================
// Export singleton instance
// ============================================

export const commissionEngine = new CommissionEngine();
