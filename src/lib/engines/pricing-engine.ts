/**
 * Dynamic Pricing Engine for Airline Manager System
 * 
 * This engine provides sophisticated pricing algorithms including:
 * - Demand forecasting integration
 * - Competitor price monitoring
 * - Price recommendation engine
 * - Real-time price adjustment
 * - O&D (Origin-Destination) optimization
 * - Price elasticity modeling
 * - Bid price management
 * - Group pricing rules
 * - Corporate fare structures
 * - Ancillary pricing rules
 * - Dynamic fare family pricing
 * - Seasonal pricing adjustments
 */

import { db } from '@/lib/db';

// ============================================
// Type Definitions
// ============================================

/**
 * Route information for pricing calculations
 */
export interface RouteInfo {
  origin: string;
  destination: string;
  route?: string;
  flightNumber?: string;
  distance?: number;
}

/**
 * Demand forecast result
 */
export interface DemandForecast {
  route: string;
  date: string;
  daysOut: number;
  forecastedDemand: number;
  confidence: number;
  factors: {
    seasonality: number;
    dayOfWeek: number;
    events: string[];
    historicalTrend: number;
  };
}

/**
 * Competitor price information
 */
export interface CompetitorPrice {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  date: string;
  cabin: string;
  price: number;
  currency: string;
  availableSeats: number;
}

/**
 * Price recommendation result
 */
export interface PriceRecommendation {
  route: string;
  date: string;
  cabin: string;
  currentPrice: number;
  recommendedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  confidence: number;
  factors: {
    demand: number;
    competition: number;
    seasonality: number;
    inventory: number;
  };
  reasoning: string[];
}

/**
 * O&D optimization result
 */
export interface ODOptimization {
  route: string;
  segments: string[];
  optimalPrices: Record<string, number>;
  expectedRevenue: number;
  loadFactor: number;
  recommendations: string[];
}

/**
 * Price elasticity model parameters
 */
export interface PriceElasticity {
  route: string;
  cabin: string;
  elasticity: number;
  confidence: number;
  priceSensitivity: 'high' | 'medium' | 'low';
}

/**
 * Bid price calculation result
 */
export interface BidPrice {
  route: string;
  date: string;
  cabin: string;
  bidPrice: number;
  displacementCost: number;
  opportunityCost: number;
  margin: number;
  acceptPrice: boolean;
}

/**
 * Group pricing information
 */
export interface GroupPricing {
  groupSize: number;
  route: string;
  date: string;
  basePrice: number;
  discountPercent: number;
  discountedPrice: number;
  terms: {
    depositPercent: number;
    depositDue: string;
    finalPaymentDue: string;
    cancellationPolicy: string;
    nameChangeAllowed: boolean;
  };
}

/**
 * Corporate fare information
 */
export interface CorporateFare {
  corporateAccount: string;
  route: string;
  date: string;
  baseFare: number;
  discountPercent: number;
  discountedFare: number;
  fareRules: {
    advancePurchase: number;
    minimumStay: string;
    maximumStay: string;
    changeable: boolean;
    refundable: boolean;
  };
}

/**
 * Ancillary price information
 */
export interface AncillaryPrice {
  productCode: string;
  productName: string;
  route: string;
  cabin: string;
  basePrice: number;
  dynamicPrice: number;
  priceAdjustment: number;
  reason: string;
}

/**
 * Seasonal pricing information
 */
export interface SeasonalPricing {
  season: 'low' | 'shoulder' | 'peak';
  multiplier: number;
  startDate: string;
  endDate: string;
  reason: string;
}

/**
 * Pricing configuration
 */
export interface PricingConfig {
  maxPriceIncrease: number;
  maxPriceDecrease: number;
  minMarginPercent: number;
  targetLoadFactor: number;
  competitorWeight: number;
  demandWeight: number;
  seasonalityWeight: number;
}

// ============================================
// Pricing Engine Class
// ============================================

/**
 * Main pricing engine class that handles all dynamic pricing operations
 */
export class PricingEngine {
  private config: PricingConfig;
  private cache: Map<string, { data: any; expiry: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(config?: Partial<PricingConfig>) {
    this.config = {
      maxPriceIncrease: 0.3, // 30% max increase
      maxPriceDecrease: 0.2, // 20% max decrease
      minMarginPercent: 0.05, // 5% minimum margin
      targetLoadFactor: 0.85, // 85% target load factor
      competitorWeight: 0.3,
      demandWeight: 0.4,
      seasonalityWeight: 0.3,
      ...config,
    };
    this.cache = new Map();
  }

  /**
   * Calculate optimal price based on multiple factors
   * @param route - Route information (origin, destination)
   * @param date - Flight date in YYYY-MM-DD format
   * @param demand - Current demand factor (0-1)
   * @param competition - Competitor prices array
   * @param cabin - Cabin class
   * @returns Optimal price recommendation
   */
  async calculateOptimalPrice(
    route: RouteInfo,
    date: string,
    demand: number,
    competition: CompetitorPrice[],
    cabin: string = 'economy'
  ): Promise<PriceRecommendation> {
    try {
      // Get base fare for the route
      const baseFare = await this.getBaseFare(route, cabin);
      if (!baseFare) {
        throw new Error(`Base fare not found for route ${route.origin}-${route.destination} in ${cabin} cabin`);
      }

      // Forecast demand for the specific date
      const demandForecast = await this.forecastDemand(route, date, this.getDaysOut(date));

      // Get seasonal pricing adjustment
      const seasonalPricing = await this.applySeasonalPricing(baseFare, this.getSeason(date), date);

      // Calculate demand-based adjustment
      const demandAdjustedPrice = this.adjustPriceBasedOnDemand(seasonalPricing.price, demandForecast.forecastedDemand / 100);

      // Analyze competitor prices
      const competitorAnalysis = this.analyzeCompetitorPrices(competition, demandAdjustedPrice);

      // Calculate final optimal price
      const factors = {
        demand: this.normalizeFactor(demandForecast.forecastedDemand / 100),
        competition: this.normalizeFactor(competitorAnalysis.competitiveness),
        seasonality: seasonalPricing.multiplier,
        inventory: await this.getInventoryFactor(route, date, cabin),
      };

      const weightedPrice = this.calculateWeightedPrice(demandAdjustedPrice, factors);
      const boundedPrice = this.applyPriceBounds(baseFare, weightedPrice);

      const recommendation: PriceRecommendation = {
        route: route.route || `${route.origin}-${route.destination}`,
        date,
        cabin,
        currentPrice: baseFare,
        recommendedPrice: boundedPrice,
        priceChange: boundedPrice - baseFare,
        priceChangePercent: ((boundedPrice - baseFare) / baseFare) * 100,
        confidence: this.calculateConfidence(factors),
        factors,
        reasoning: this.generateReasoning(baseFare, boundedPrice, factors, demandForecast),
      };

      // Cache the recommendation
      this.setCache(`price:${route.origin}:${route.destination}:${date}:${cabin}`, recommendation);

      return recommendation;
    } catch (error) {
      console.error('Error calculating optimal price:', error);
      throw new Error(`Failed to calculate optimal price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Forecast demand for a specific route and date
   * @param route - Route information
   * @param date - Flight date
   * @param daysOut - Days until departure
   * @returns Demand forecast with confidence level
   */
  async forecastDemand(
    route: RouteInfo,
    date: string,
    daysOut: number
  ): Promise<DemandForecast> {
    try {
      const cacheKey = `forecast:${route.origin}:${route.destination}:${date}`;
      const cached = this.getCache<DemandForecast>(cacheKey);
      if (cached) return cached;

      // Get historical demand data from database
      const historicalData = await this.getHistoricalDemand(route, date);
      
      // Get seasonality factor
      const season = this.getSeason(date);
      const seasonality = this.getSeasonalityFactor(season);

      // Get day of week factor
      const dayOfWeek = new Date(date).getDay();
      const dayFactor = this.getDayOfWeekFactor(dayOfWeek);

      // Check for events affecting demand
      const events = await this.checkForEvents(route, date);

      // Calculate base forecast
      const baseForecast = this.calculateBaseForecast(historicalData, daysOut);

      // Apply factors
      let forecastedDemand = baseForecast;
      forecastedDemand *= seasonality;
      forecastedDemand *= dayFactor;
      
      // Event impact
      if (events.length > 0) {
        forecastedDemand *= this.calculateEventImpact(events);
      }

      // Ensure forecast is within bounds
      forecastedDemand = Math.max(0, Math.min(100, forecastedDemand));

      // Calculate confidence based on data availability
      const confidence = this.calculateForecastConfidence(historicalData, daysOut);

      const forecast: DemandForecast = {
        route: route.route || `${route.origin}-${route.destination}`,
        date,
        daysOut,
        forecastedDemand,
        confidence,
        factors: {
          seasonality,
          dayOfWeek: dayFactor,
          events,
          historicalTrend: this.calculateHistoricalTrend(historicalData),
        },
      };

      this.setCache(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.error('Error forecasting demand:', error);
      throw new Error(`Failed to forecast demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Monitor and analyze competitor prices
   * @param route - Route information
   * @returns Array of competitor prices
   */
  async monitorCompetitorPrices(route: RouteInfo): Promise<CompetitorPrice[]> {
    try {
      const cacheKey = `competitor:${route.origin}:${route.destination}`;
      const cached = this.getCache<CompetitorPrice[]>(cacheKey);
      if (cached) return cached;

      // In a real implementation, this would integrate with external APIs
      // For now, we'll return simulated data based on route characteristics
      const baseFare = await this.getBaseFare(route, 'economy');
      if (!baseFare) {
        return [];
      }

      const competitors: CompetitorPrice[] = [
        {
          airline: 'Competitor A',
          flightNumber: 'CA123',
          origin: route.origin,
          destination: route.destination,
          date: new Date().toISOString().split('T')[0],
          cabin: 'economy',
          price: baseFare * (1 + (Math.random() * 0.2 - 0.1)),
          currency: 'USD',
          availableSeats: Math.floor(Math.random() * 50) + 10,
        },
        {
          airline: 'Competitor B',
          flightNumber: 'CB456',
          origin: route.origin,
          destination: route.destination,
          date: new Date().toISOString().split('T')[0],
          cabin: 'economy',
          price: baseFare * (1 + (Math.random() * 0.3 - 0.15)),
          currency: 'USD',
          availableSeats: Math.floor(Math.random() * 50) + 10,
        },
        {
          airline: 'Competitor C',
          flightNumber: 'CC789',
          origin: route.origin,
          destination: route.destination,
          date: new Date().toISOString().split('T')[0],
          cabin: 'economy',
          price: baseFare * (1 + (Math.random() * 0.25 - 0.125)),
          currency: 'USD',
          availableSeats: Math.floor(Math.random() * 50) + 10,
        },
      ];

      this.setCache(cacheKey, competitors);
      return competitors;
    } catch (error) {
      console.error('Error monitoring competitor prices:', error);
      return [];
    }
  }

  /**
   * Optimize Origin-Destination (O&D) revenue across connecting flights
   * @param routes - Array of route segments
   * @returns O&D optimization recommendations
   */
  async optimizeODRevenue(routes: RouteInfo[]): Promise<ODOptimization> {
    try {
      const mainRoute = routes[0];
      const segmentKeys = routes.map(r => `${r.origin}-${r.destination}`);
      
      // Get current prices for all segments
      const currentPrices: Record<string, number> = {};
      for (const route of routes) {
        const baseFare = await this.getBaseFare(route, 'economy');
        if (baseFare) {
          const key = `${route.origin}-${route.destination}`;
          currentPrices[key] = baseFare;
        }
      }

      // Calculate O&D demand
      const odDemand = await this.calculateODDemand(routes);

      // Calculate optimal prices for each segment
      const optimalPrices: Record<string, number> = {};
      let totalExpectedRevenue = 0;

      for (const route of routes) {
        const key = `${route.origin}-${route.destination}`;
        const segmentDemand = odDemand.segments[key] || odDemand.baseDemand;
        
        // Apply price elasticity
        const elasticity = await this.getPriceElasticity(route, 'economy');
        
        // Calculate optimal price for this segment
        const basePrice = currentPrices[key] || 100;
        const demandFactor = segmentDemand / 100;
        
        let optimalPrice = basePrice;
        if (elasticity.elasticity < -1) {
          // Elastic demand - lower price to increase volume
          optimalPrice = basePrice * (1 - (1 - demandFactor) * Math.abs(elasticity.elasticity) * 0.1);
        } else {
          // Inelastic demand - can increase price
          optimalPrice = basePrice * (1 + demandFactor * 0.2);
        }

        // Apply O&D-specific rules
        optimalPrice = this.applyODRules(optimalPrice, route, segmentDemand);
        
        // Ensure price is within bounds
        optimalPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, optimalPrice));
        
        optimalPrices[key] = Math.round(optimalPrice);
        totalExpectedRevenue += optimalPrice * segmentDemand;
      }

      // Calculate expected load factor
      const totalCapacity = routes.length * 150; // Assuming 150 seats per flight
      const expectedPassengers = odDemand.baseDemand;
      const loadFactor = expectedPassengers / totalCapacity;

      // Generate recommendations
      const recommendations = this.generateODRecommendations(
        currentPrices,
        optimalPrices,
        loadFactor
      );

      const optimization: ODOptimization = {
        route: mainRoute.route || `${mainRoute.origin}-${routes[routes.length - 1].destination}`,
        segments: segmentKeys,
        optimalPrices,
        expectedRevenue: Math.round(totalExpectedRevenue),
        loadFactor: Math.round(loadFactor * 100) / 100,
        recommendations,
      };

      return optimization;
    } catch (error) {
      console.error('Error optimizing O&D revenue:', error);
      throw new Error(`Failed to optimize O&D revenue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Adjust price based on demand factor
   * @param basePrice - Base price
   * @param demandFactor - Demand factor (0-1)
   * @returns Adjusted price
   */
  adjustPriceBasedOnDemand(basePrice: number, demandFactor: number): number {
    if (demandFactor > 0.8) {
      // High demand - increase price
      const increase = (demandFactor - 0.8) * 1.5; // Up to 30% increase
      return basePrice * (1 + Math.min(increase, this.config.maxPriceIncrease));
    } else if (demandFactor < 0.5) {
      // Low demand - decrease price
      const decrease = (0.5 - demandFactor) * 0.8; // Up to 40% decrease
      return basePrice * (1 - Math.min(decrease, this.config.maxPriceDecrease));
    }
    return basePrice;
  }

  /**
   * Calculate bid price (minimum acceptable price)
   * @param route - Route information
   * @param date - Flight date
   * @param cabin - Cabin class
   * @returns Bid price calculation
   */
  async calculateBidPrice(
    route: RouteInfo,
    date: string,
    cabin: string = 'economy'
  ): Promise<BidPrice> {
    try {
      // Get base fare
      const baseFare = await this.getBaseFare(route, cabin);
      if (!baseFare) {
        throw new Error(`Base fare not found for route ${route.origin}-${route.destination}`);
      }

      // Calculate operating cost
      const operatingCost = await this.calculateOperatingCost(route, cabin);

      // Calculate displacement cost (future revenue foregone)
      const displacementCost = await this.calculateDisplacementCost(route, date, cabin);

      // Calculate opportunity cost
      const opportunityCost = Math.max(operatingCost, displacementCost);

      // Apply minimum margin
      const minMargin = operatingCost * this.config.minMarginPercent;
      const bidPrice = opportunityCost + minMargin;

      // Determine if price should be accepted based on inventory
      const loadFactor = await this.getInventoryFactor(route, date, cabin);
      const acceptPrice = loadFactor < this.config.targetLoadFactor;

      const margin = baseFare - bidPrice;

      return {
        route: route.route || `${route.origin}-${route.destination}`,
        date,
        cabin,
        bidPrice: Math.round(bidPrice * 100) / 100,
        displacementCost: Math.round(displacementCost * 100) / 100,
        opportunityCost: Math.round(opportunityCost * 100) / 100,
        margin: Math.round(margin * 100) / 100,
        acceptPrice,
      };
    } catch (error) {
      console.error('Error calculating bid price:', error);
      throw new Error(`Failed to calculate bid price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply seasonal pricing adjustment
   * @param basePrice - Base price
   * @param season - Season type
   * @param date - Flight date
   * @returns Seasonal pricing with multiplier
   */
  async applySeasonalPricing(
    basePrice: number,
    season: 'low' | 'shoulder' | 'peak',
    date: string
  ): Promise<SeasonalPricing> {
    let multiplier = 1.0;
    let reason = 'Standard pricing';

    switch (season) {
      case 'peak':
        multiplier = 1.25; // 25% increase
        reason = 'Peak season demand';
        break;
      case 'shoulder':
        multiplier = 1.05; // 5% increase
        reason = 'Shoulder season';
        break;
      case 'low':
        multiplier = 0.85; // 15% decrease
        reason = 'Low season promotion';
        break;
    }

    // Apply holiday/exceptional period adjustments
    const isHoliday = await this.isHolidayPeriod(date);
    if (isHoliday) {
      multiplier *= 1.15; // Additional 15% for holidays
      reason += ' with holiday surcharge';
    }

    return {
      season,
      multiplier,
      startDate: this.getSeasonStartDate(season, date),
      endDate: this.getSeasonEndDate(season, date),
      reason,
      price: basePrice * multiplier,
    };
  }

  /**
   * Calculate group pricing
   * @param groupSize - Number of passengers in group
   * @param route - Route information
   * @param date - Flight date
   * @returns Group pricing with terms
   */
  async getGroupPricing(
    groupSize: number,
    route: RouteInfo,
    date: string
  ): Promise<GroupPricing> {
    try {
      // Get base fare
      const basePrice = await this.getBaseFare(route, 'economy');
      if (!basePrice) {
        throw new Error(`Base fare not found for route ${route.origin}-${route.destination}`);
      }

      // Calculate discount based on group size
      let discountPercent = 0;
      if (groupSize >= 10 && groupSize < 20) {
        discountPercent = 0.05; // 5% discount
      } else if (groupSize >= 20 && groupSize < 50) {
        discountPercent = 0.10; // 10% discount
      } else if (groupSize >= 50) {
        discountPercent = 0.15; // 15% discount
      }

      // Adjust discount based on demand
      const demandForecast = await this.forecastDemand(route, date, this.getDaysOut(date));
      if (demandForecast.forecastedDemand < 50) {
        discountPercent = Math.min(discountPercent + 0.05, 0.25); // Extra 5% for low demand
      } else if (demandForecast.forecastedDemand > 80) {
        discountPercent = Math.max(discountPercent - 0.03, 0); // Reduce discount for high demand
      }

      const discountedPrice = basePrice * (1 - discountPercent);

      // Calculate group terms
      const today = new Date();
      const depositDue = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const finalPaymentDue = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      return {
        groupSize,
        route: route.route || `${route.origin}-${route.destination}`,
        date,
        basePrice,
        discountPercent,
        discountedPrice: Math.round(discountedPrice),
        terms: {
          depositPercent: 0.25, // 25% deposit
          depositDue,
          finalPaymentDue,
          cancellationPolicy: groupSize >= 20 
            ? 'Non-refundable deposit, 50% refund if cancelled 30+ days before departure'
            : 'Full refund if cancelled 14+ days before departure',
          nameChangeAllowed: true,
        },
      };
    } catch (error) {
      console.error('Error calculating group pricing:', error);
      throw new Error(`Failed to calculate group pricing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get corporate fare
   * @param corporateAccount - Corporate account ID
   * @param route - Route information
   * @param date - Flight date
   * @returns Corporate fare with rules
   */
  async getCorporateFare(
    corporateAccount: string,
    route: RouteInfo,
    date: string
  ): Promise<CorporateFare> {
    try {
      // Get base fare
      const baseFare = await this.getBaseFare(route, 'economy');
      if (!baseFare) {
        throw new Error(`Base fare not found for route ${route.origin}-${route.destination}`);
      }

      // Get corporate discount from database (simulated)
      const corporateDiscount = await this.getCorporateDiscount(corporateAccount);
      const discountPercent = corporateDiscount || 0.10; // Default 10%

      const discountedFare = baseFare * (1 - discountPercent);

      return {
        corporateAccount,
        route: route.route || `${route.origin}-${route.destination}`,
        date,
        baseFare,
        discountPercent,
        discountedFare: Math.round(discountedFare),
        fareRules: {
          advancePurchase: 0, // No advance purchase restriction for corporates
          minimumStay: 'None',
          maximumStay: '1 year',
          changeable: true,
          refundable: true,
        },
      };
    } catch (error) {
      console.error('Error getting corporate fare:', error);
      throw new Error(`Failed to get corporate fare: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate ancillary product price
   * @param productCode - Ancillary product code
   * @param route - Route information
   * @param cabin - Cabin class
   * @returns Ancillary price with adjustment
   */
  async calculateAncillaryPrice(
    productCode: string,
    route: RouteInfo,
    cabin: string = 'economy'
  ): Promise<AncillaryPrice> {
    try {
      // Get ancillary product from database
      const product = await db.ancillaryProduct.findUnique({
        where: { code: productCode },
      });

      if (!product) {
        throw new Error(`Ancillary product not found: ${productCode}`);
      }

      let dynamicPrice = product.price;
      let priceAdjustment = 0;
      let reason = 'Standard price';

      // Cabin-based adjustment
      if (cabin === 'business') {
        priceAdjustment = 0.25; // 25% premium for business
        reason = 'Business class premium';
      } else if (cabin === 'first') {
        priceAdjustment = 0.50; // 50% premium for first class
        reason = 'First class premium';
      }

      // Route-based adjustment for long-haul
      if (route.distance && route.distance > 3000) {
        priceAdjustment += 0.15;
        reason += ' for long-haul flight';
      }

      // Apply seasonal adjustment
      const season = this.getSeason(new Date().toISOString().split('T')[0]);
      if (season === 'peak') {
        priceAdjustment += 0.10;
      }

      dynamicPrice = product.price * (1 + priceAdjustment);

      return {
        productCode,
        productName: product.name,
        route: route.route || `${route.origin}-${route.destination}`,
        cabin,
        basePrice: product.price,
        dynamicPrice: Math.round(dynamicPrice),
        priceAdjustment: Math.round(priceAdjustment * 100) / 100,
        reason,
      };
    } catch (error) {
      console.error('Error calculating ancillary price:', error);
      throw new Error(`Failed to calculate ancillary price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get price elasticity for route and cabin
   * @param route - Route information
   * @param cabin - Cabin class
   * @returns Price elasticity model
   */
  async getPriceElasticity(route: RouteInfo, cabin: string): Promise<PriceElasticity> {
    try {
      const cacheKey = `elasticity:${route.origin}:${route.destination}:${cabin}`;
      const cached = this.getCache<PriceElasticity>(cacheKey);
      if (cached) return cached;

      // In a real implementation, this would be calculated from historical data
      // For now, we'll provide reasonable defaults based on route characteristics
      let elasticity = -1.2; // Default elastic
      let priceSensitivity: 'high' | 'medium' | 'low' = 'medium';

      // Business routes are less elastic
      if (cabin === 'business') {
        elasticity = -0.8;
        priceSensitivity = 'low';
      } else if (cabin === 'first') {
        elasticity = -0.5;
        priceSensitivity = 'low';
      }

      // Leisure routes are more elastic
      const isLeisureRoute = await this.isLeisureRoute(route);
      if (isLeisureRoute && cabin === 'economy') {
        elasticity = -1.5;
        priceSensitivity = 'high';
      }

      const elasticityModel: PriceElasticity = {
        route: route.route || `${route.origin}-${route.destination}`,
        cabin,
        elasticity,
        confidence: 0.75,
        priceSensitivity,
      };

      this.setCache(cacheKey, elasticityModel);
      return elasticityModel;
    } catch (error) {
      console.error('Error getting price elasticity:', error);
      return {
        route: route.route || `${route.origin}-${route.destination}`,
        cabin,
        elasticity: -1.2,
        confidence: 0.5,
        priceSensitivity: 'medium',
      };
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async getBaseFare(route: RouteInfo, cabin: string): Promise<number | null> {
    try {
      const fareClass = await db.fareClass.findFirst({
        where: {
          cabin,
          isActive: true,
        },
        orderBy: {
          baseFare: 'asc',
        },
      });

      return fareClass?.baseFare || null;
    } catch (error) {
      console.error('Error getting base fare:', error);
      return null;
    }
  }

  private getDaysOut(date: string): number {
    const departure = new Date(date);
    const now = new Date();
    const diffTime = departure.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  private getSeason(date: string): 'low' | 'shoulder' | 'peak' {
    const month = new Date(date).getMonth();
    
    // Peak seasons (example for Northern Hemisphere)
    if ((month >= 5 && month <= 7) || (month === 11 || month === 0)) {
      return 'peak';
    }
    
    // Shoulder seasons
    if ((month >= 3 && month <= 4) || (month >= 8 && month <= 10)) {
      return 'shoulder';
    }
    
    // Low season
    return 'low';
  }

  private getSeasonalityFactor(season: 'low' | 'shoulder' | 'peak'): number {
    switch (season) {
      case 'peak':
        return 1.3;
      case 'shoulder':
        return 1.1;
      case 'low':
        return 0.8;
      default:
        return 1.0;
    }
  }

  private getDayOfWeekFactor(dayOfWeek: number): number {
    // Friday and Sunday are high demand
    if (dayOfWeek === 5 || dayOfWeek === 0) return 1.2;
    // Monday and Saturday are medium demand
    if (dayOfWeek === 1 || dayOfWeek === 6) return 1.1;
    // Tuesday-Thursday are lower demand
    return 0.9;
  }

  private async getHistoricalDemand(route: RouteInfo, date: string): Promise<number[]> {
    try {
      // Get historical demand data from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const revenueData = await db.revenueData.findMany({
        where: {
          origin: route.origin,
          destination: route.destination,
          date: {
            gte: thirtyDaysAgo.toISOString().split('T')[0],
          },
        },
        orderBy: {
          date: 'asc',
        },
        take: 30,
      });

      return revenueData.map(d => d.loadFactor * 100);
    } catch (error) {
      console.error('Error getting historical demand:', error);
      return [50]; // Default value
    }
  }

  private async checkForEvents(route: RouteInfo, date: string): Promise<string[]> {
    // In a real implementation, this would check for events, holidays, conferences
    // For now, return empty array
    return [];
  }

  private calculateEventImpact(events: string[]): number {
    // Each event could increase demand by 10-20%
    return 1 + (events.length * 0.15);
  }

  private calculateBaseForecast(historicalData: number[], daysOut: number): number {
    if (historicalData.length === 0) return 50;

    const avgDemand = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
    
    // Demand increases as departure approaches
    const proximityFactor = 1 + (1 - Math.min(daysOut / 365, 1)) * 0.3;
    
    return avgDemand * proximityFactor;
  }

  private calculateForecastConfidence(historicalData: number[], daysOut: number): number {
    if (historicalData.length === 0) return 0.3;
    
    // More data = higher confidence
    const dataFactor = Math.min(historicalData.length / 30, 1) * 0.4;
    
    // Closer to departure = higher confidence
    const proximityFactor = (1 - Math.min(daysOut / 90, 1)) * 0.4;
    
    // Base confidence
    const baseConfidence = 0.3;
    
    return Math.min(baseConfidence + dataFactor + proximityFactor, 0.95);
  }

  private calculateHistoricalTrend(historicalData: number[]): number {
    if (historicalData.length < 2) return 0;

    const recent = historicalData.slice(-7);
    const older = historicalData.slice(0, 7);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    return ((recentAvg - olderAvg) / olderAvg) * 100;
  }

  private normalizeFactor(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  private analyzeCompetitorPrices(competitors: CompetitorPrice[], ourPrice: number): {
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    competitiveness: number;
  } {
    if (competitors.length === 0) {
      return {
        averagePrice: ourPrice,
        minPrice: ourPrice,
        maxPrice: ourPrice,
        competitiveness: 0.5,
      };
    }

    const prices = competitors.map(c => c.price);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Competitiveness: 1 if we're cheaper than average, 0 if more expensive
    const competitiveness = ourPrice <= averagePrice ? 1 - (ourPrice / maxPrice) * 0.5 : (minPrice / ourPrice) * 0.5;

    return {
      averagePrice,
      minPrice,
      maxPrice,
      competitiveness,
    };
  }

  private async getInventoryFactor(route: RouteInfo, date: string, cabin: string): Promise<number> {
    try {
      const inventory = await db.routeInventory.findFirst({
        where: {
          origin: route.origin,
          destination: route.destination,
          date,
        },
      });

      if (!inventory) return 0.5;

      const capacity = JSON.parse(inventory.capacity);
      const sold = JSON.parse(inventory.sold);
      
      const cabinCapacity = capacity[cabin] || 100;
      const cabinSold = sold[cabin] || 0;
      
      return cabinSold / cabinCapacity;
    } catch (error) {
      console.error('Error getting inventory factor:', error);
      return 0.5;
    }
  }

  private calculateWeightedPrice(basePrice: number, factors: {
    demand: number;
    competition: number;
    seasonality: number;
    inventory: number;
  }): number {
    const {
      demandWeight,
      competitorWeight,
      seasonalityWeight,
    } = this.config;

    let price = basePrice;
    
    // Apply demand factor
    price *= 1 + (factors.demand - 0.5) * demandWeight;
    
    // Apply competition factor (higher competitiveness = lower price)
    price *= 1 + (0.5 - factors.competition) * competitorWeight;
    
    // Apply seasonality
    price *= factors.seasonality;

    // Apply inventory factor (high inventory = higher price)
    price *= 1 + (factors.inventory - 0.5) * 0.2;

    return price;
  }

  private applyPriceBounds(basePrice: number, price: number): number {
    const maxPrice = basePrice * (1 + this.config.maxPriceIncrease);
    const minPrice = basePrice * (1 - this.config.maxPriceDecrease);
    
    return Math.max(minPrice, Math.min(maxPrice, price));
  }

  private calculateConfidence(factors: {
    demand: number;
    competition: number;
    seasonality: number;
    inventory: number;
  }): number {
    // Confidence based on consistency of factors
    const variance = Math.abs(factors.demand - factors.inventory);
    return Math.max(0.5, 1 - variance * 0.5);
  }

  private generateReasoning(
    basePrice: number,
    recommendedPrice: number,
    factors: any,
    demandForecast: DemandForecast
  ): string[] {
    const reasoning: string[] = [];

    if (recommendedPrice > basePrice) {
      reasoning.push(`Price increased by ${((recommendedPrice - basePrice) / basePrice * 100).toFixed(1)}%`);
    } else if (recommendedPrice < basePrice) {
      reasoning.push(`Price decreased by ${((basePrice - recommendedPrice) / basePrice * 100).toFixed(1)}%`);
    }

    if (factors.demand > 0.7) {
      reasoning.push(`High demand forecasted: ${demandForecast.forecastedDemand.toFixed(0)}%`);
    } else if (factors.demand < 0.4) {
      reasoning.push(`Low demand forecasted: ${demandForecast.forecastedDemand.toFixed(0)}%`);
    }

    if (factors.seasonality > 1.1) {
      reasoning.push('Seasonal pricing premium applied');
    } else if (factors.seasonality < 0.9) {
      reasoning.push('Seasonal discount applied');
    }

    if (factors.inventory > 0.8) {
      reasoning.push('High load factor, pricing for yield');
    } else if (factors.inventory < 0.5) {
      reasoning.push('Low load factor, pricing for volume');
    }

    return reasoning;
  }

  private async calculateODDemand(routes: RouteInfo[]): Promise<{
    baseDemand: number;
    segments: Record<string, number>;
  }> {
    let totalDemand = 0;
    const segments: Record<string, number> = {};

    for (const route of routes) {
      const forecast = await this.forecastDemand(
        route,
        new Date().toISOString().split('T')[0],
        30
      );
      const key = `${route.origin}-${route.destination}`;
      segments[key] = forecast.forecastedDemand;
      totalDemand += forecast.forecastedDemand;
    }

    return {
      baseDemand: totalDemand / routes.length,
      segments,
    };
  }

  private applyODRules(price: number, route: RouteInfo, demand: number): number {
    // Apply O&D-specific pricing rules
    let adjustedPrice = price;

    // Short-haul segments have lower elasticity
    if (route.distance && route.distance < 1000) {
      adjustedPrice *= 1.1;
    }

    return adjustedPrice;
  }

  private generateODRecommendations(
    currentPrices: Record<string, number>,
    optimalPrices: Record<string, number>,
    loadFactor: number
  ): string[] {
    const recommendations: string[] = [];

    for (const [segment, optimal] of Object.entries(optimalPrices)) {
      const current = currentPrices[segment] || 0;
      const diff = ((optimal - current) / current) * 100;

      if (Math.abs(diff) > 5) {
        if (diff > 0) {
          recommendations.push(`Increase ${segment} price by ${diff.toFixed(1)}% to $${optimal}`);
        } else {
          recommendations.push(`Decrease ${segment} price by ${Math.abs(diff).toFixed(1)}% to $${optimal}`);
        }
      }
    }

    if (loadFactor < 0.7) {
      recommendations.push('Consider promotional pricing to increase load factor');
    } else if (loadFactor > 0.95) {
      recommendations.push('High load factor - consider capacity optimization');
    }

    return recommendations;
  }

  private async calculateOperatingCost(route: RouteInfo, cabin: string): Promise<number> {
    // Simplified cost calculation
    const distance = route.distance || 1000;
    const costPerKm = cabin === 'economy' ? 0.05 : cabin === 'business' ? 0.12 : 0.20;
    return distance * costPerKm;
  }

  private async calculateDisplacementCost(
    route: RouteInfo,
    date: string,
    cabin: string
  ): Promise<number> {
    // Calculate expected future revenue if seat is not sold now
    const demandForecast = await this.forecastDemand(route, date, this.getDaysOut(date));
    const baseFare = await this.getBaseFare(route, cabin);
    
    if (!baseFare) return 50;

    // Higher expected demand = higher displacement cost
    return baseFare * (demandForecast.forecastedDemand / 100);
  }

  private getSeasonStartDate(season: 'low' | 'shoulder' | 'peak', referenceDate: string): string {
    // Simplified season dates based on reference date
    const date = new Date(referenceDate);
    const month = date.getMonth();

    switch (season) {
      case 'peak':
        if (month >= 5 && month <= 7) return `${date.getFullYear()}-06-01`;
        return `${date.getFullYear()}-12-01`;
      case 'shoulder':
        if (month >= 3 && month <= 4) return `${date.getFullYear()}-03-01`;
        return `${date.getFullYear()}-09-01`;
      default:
        return `${date.getFullYear()}-01-15`;
    }
  }

  private getSeasonEndDate(season: 'low' | 'shoulder' | 'peak', referenceDate: string): string {
    const date = new Date(referenceDate);
    const year = date.getFullYear();
    const month = date.getMonth();

    switch (season) {
      case 'peak':
        if (month >= 5 && month <= 7) return `${year}-08-31`;
        return `${year}-01-15`;
      case 'shoulder':
        if (month >= 3 && month <= 4) return `${year}-05-31`;
        return `${year}-11-30`;
      default:
        return `${year}-03-01`;
    }
  }

  private async isHolidayPeriod(date: string): Promise<boolean> {
    // Check if date falls within a holiday period
    const month = new Date(date).getMonth();
    const day = new Date(date).getDate();

    // Major holidays (simplified)
    const holidays = [
      { month: 11, day: 24 }, // Christmas Eve
      { month: 11, day: 25 }, // Christmas Day
      { month: 0, day: 1 },   // New Year's Day
      { month: 6, day: 4 },   // Independence Day (US)
      { month: 11, day: 25 }, // Thanksgiving (US, approximate)
    ];

    return holidays.some(h => h.month === month && h.day === day);
  }

  private async isLeisureRoute(route: RouteInfo): Promise<boolean> {
    // Identify leisure routes based on destination airports
    const leisureDestinations = [
      'MCO', // Orlando
      'LAS', // Las Vegas
      'HNL', // Honolulu
      'CUN', // Cancun
      'BCN', // Barcelona
      'IBZ', // Ibiza
      'MLE', // Maldives
      'BKK', // Bangkok
      'SYD', // Sydney
    ];

    return leisureDestinations.includes(route.destination);
  }

  private async getCorporateDiscount(corporateAccount: string): Promise<number | null> {
    // Get corporate discount from database
    try {
      // In a real implementation, query corporate accounts table
      // For now, return default discount
      return 0.10;
    } catch (error) {
      console.error('Error getting corporate discount:', error);
      return null;
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
   * Update pricing configuration
   * @param config - New configuration values
   */
  updateConfig(config: Partial<PricingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================
// Export singleton instance
// ============================================

export const pricingEngine = new PricingEngine();
