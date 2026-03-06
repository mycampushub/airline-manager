/**
 * Tax Engine
 * 
 * Comprehensive tax calculation engine for the Airline Manager.
 * Handles tax breakdown calculations, country-specific taxes, airport taxes,
 * fare-based taxes, refunds, interline tax handling, exemptions, and reporting.
 */

import { db } from '@/lib/db';

// ============================================
// Type Definitions
// ============================================

/**
 * Route information for tax calculation
 */
export interface TaxRouteInfo {
  origin: string;
  originCountry: string;
  destination: string;
  destinationCountry: string;
  isInternational: boolean;
  isDomestic: boolean;
  isOneWay: boolean;
  isRoundTrip: boolean;
  connectionPoints?: string[];
}

/**
 * Passenger information for tax calculation
 */
export interface PassengerInfo {
  type: 'adult' | 'child' | 'infant';
  count: number;
  residentCountry?: string;
  hasTaxExemption?: boolean;
  exemptionCode?: string;
}

/**
 * Tax breakdown item
 */
export interface TaxItem {
  code: string;
  name: string;
  amount: number;
  currency: string;
  type: 'country' | 'airport' | 'security' | 'fuel' | 'service' | 'other';
  isRefundable: boolean;
  appliesTo: 'all' | 'adult' | 'child' | 'infant';
}

/**
 * Complete tax breakdown result
 */
export interface TaxBreakdownResult {
  totalTax: number;
  currency: string;
  taxes: TaxItem[];
  byType: Record<string, number>;
  byCountry: Record<string, number>;
  refundableAmount: number;
  nonRefundableAmount: number;
  effectiveDate: Date;
}

/**
 * Country tax configuration
 */
export interface CountryTaxConfig {
  countryCode: string;
  countryName: string;
  taxes: TaxRule[];
  currency: string;
  taxThresholds?: TaxThreshold[];
}

/**
 * Individual tax rule
 */
export interface TaxRule {
  code: string;
  name: string;
  type: 'fixed' | 'percentage' | 'tiered';
  rate?: number;
  fixedAmount?: number;
  appliesTo: 'departure' | 'arrival' | 'both';
  taxType: 'country' | 'airport' | 'security' | 'fuel' | 'service' | 'other';
  isRefundable: boolean;
  passengerTypes: ('adult' | 'child' | 'infant')[];
  exemptions?: string[];
  effectiveFrom?: string;
  effectiveUntil?: string;
  tiers?: TaxTier[];
}

/**
 * Tax tier for tiered calculations
 */
export interface TaxTier {
  minFare: number;
  maxFare: number;
  rate: number;
  fixedAmount?: number;
}

/**
 * Tax threshold
 */
export interface TaxThreshold {
  type: string;
  threshold: number;
  reducedRate?: number;
  exemptBelow?: boolean;
}

/**
 * Airport tax configuration
 */
export interface AirportTaxConfig {
  airportCode: string;
  airportName: string;
  countryCode: string;
  taxes: AirportTaxRule[];
  currency: string;
}

/**
 * Airport-specific tax rule
 */
export interface AirportTaxRule {
  code: string;
  name: string;
  type: 'fixed' | 'percentage';
  amount: number;
  rate?: number;
  appliesTo: 'departure' | 'arrival' | 'transit';
  isRefundable: boolean;
  internationalOnly?: boolean;
  exemptions?: string[];
}

/**
 * Tax exemption details
 */
export interface TaxExemption {
  code: string;
  name: string;
  description: string;
  applicableTaxes: string[];
  passengerTypes: ('adult' | 'child' | 'infant')[];
  requiresDocumentation: boolean;
  validRoutes?: string[];
  validityPeriod?: {
    from: string;
    until: string;
  };
}

/**
 * Refund tax processing result
 */
export interface RefundTaxResult {
  ticketNumber: string;
  originalTaxAmount: number;
  refundableTaxAmount: number;
  nonRefundableTaxAmount: number;
  refundTaxes: TaxItem[];
  refundReason: string;
  processingDate: Date;
}

/**
 * Interline tax sharing configuration
 */
export interface InterlineTaxShare {
  partnerCode: string;
  partnerName: string;
  sharePercentage: number;
  responsibleTaxes: string[];
  settlementCurrency: string;
}

/**
 * Interline tax calculation result
 */
export interface InterlineTaxResult {
  totalTaxAmount: number;
  currency: string;
  partnerShares: Array<{
    partnerCode: string;
    shareAmount: number;
    taxes: TaxItem[];
  }>;
  ourShare: {
    amount: number;
    taxes: TaxItem[];
  };
  settlementDate: Date;
}

/**
 * Currency conversion result
 */
export interface CurrencyConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  conversionDate: Date;
}

/**
 * Tax report data
 */
export interface TaxReport {
  period: string;
  startDate: Date;
  endDate: Date;
  route?: string;
  totalRevenue: number;
  totalTaxCollected: number;
  taxesByType: Record<string, number>;
  taxesByCountry: Record<string, number>;
  taxesByRoute: Record<string, number>;
  refundableTaxes: number;
  refundedTaxes: number;
  netTaxCollected: number;
  passengerCount: number;
  generatedAt: Date;
}

// ============================================
// Tax Configuration Data
// ============================================

/**
 * Country tax configurations
 */
const COUNTRY_TAXES: Record<string, CountryTaxConfig> = {
  US: {
    countryCode: 'US',
    countryName: 'United States',
    currency: 'USD',
    taxes: [
      {
        code: 'US',
        name: 'US Transportation Tax',
        type: 'percentage',
        rate: 7.5,
        appliesTo: 'departure',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
      },
      {
        code: 'US_INTL',
        name: 'US International Arrival Tax',
        type: 'fixed',
        fixedAmount: 21.60,
        appliesTo: 'arrival',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
      },
      {
        code: 'US_ANIMAL',
        name: 'US Animal and Plant Health Inspection',
        type: 'fixed',
        fixedAmount: 4.15,
        appliesTo: 'arrival',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
      },
      {
        code: 'US_IMMIGRATION',
        name: 'US Immigration User Fee',
        type: 'fixed',
        fixedAmount: 7.00,
        appliesTo: 'arrival',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult'],
      },
      {
        code: 'US_CUSTOMS',
        name: 'US Customs User Fee',
        type: 'fixed',
        fixedAmount: 6.65,
        appliesTo: 'arrival',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult'],
      },
    ],
    taxThresholds: [
      {
        type: 'US',
        threshold: 100,
        reducedRate: 0,
        exemptBelow: true,
      },
    ],
  },
  UK: {
    countryCode: 'UK',
    countryName: 'United Kingdom',
    currency: 'GBP',
    taxes: [
      {
        code: 'GB',
        name: 'UK Air Passenger Duty',
        type: 'tiered',
        appliesTo: 'departure',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
        tiers: [
          { minFare: 0, maxFare: 2000, rate: 13, fixedAmount: 26 },
          { minFare: 2000, maxFare: Infinity, rate: 13, fixedAmount: 191 },
        ],
      },
      {
        code: 'GB_CHILD',
        name: 'UK APD Reduced Rate (Children)',
        type: 'fixed',
        fixedAmount: 13,
        appliesTo: 'departure',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['child'],
      },
    ],
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    currency: 'CAD',
    taxes: [
      {
        code: 'CA',
        name: 'Canada Air Travellers Security Charge',
        type: 'fixed',
        fixedAmount: 12.71,
        appliesTo: 'departure',
        taxType: 'security',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
      },
      {
        code: 'CA_AIRPORT',
        name: 'Canada Airport Improvement Fee',
        type: 'fixed',
        fixedAmount: 35.00,
        appliesTo: 'departure',
        taxType: 'airport',
        isRefundable: false,
        passengerTypes: ['adult', 'child'],
      },
    ],
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    currency: 'AUD',
    taxes: [
      {
        code: 'AU',
        name: 'Australia Passenger Movement Charge',
        type: 'fixed',
        fixedAmount: 60.00,
        appliesTo: 'departure',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
      },
    ],
  },
  FR: {
    countryCode: 'FR',
    countryName: 'France',
    currency: 'EUR',
    taxes: [
      {
        code: 'FR',
        name: 'France Solidarity Tax',
        type: 'fixed',
        fixedAmount: 4.63,
        appliesTo: 'departure',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
      },
      {
        code: 'FR_ANIMAL',
        name: 'France Animal Health Tax',
        type: 'fixed',
        fixedAmount: 2.84,
        appliesTo: 'arrival',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
      },
    ],
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    currency: 'EUR',
    taxes: [
      {
        code: 'DE',
        name: 'Germany Air Transportation Tax',
        type: 'tiered',
        appliesTo: 'departure',
        taxType: 'country',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
        tiers: [
          { minFare: 0, maxFare: 2500, rate: 0, fixedAmount: 7.50 },
          { minFare: 2500, maxFare: 6000, rate: 0, fixedAmount: 23.43 },
          { minFare: 6000, maxFare: Infinity, rate: 0, fixedAmount: 42.18 },
        ],
      },
    ],
  },
  JP: {
    countryCode: 'JP',
    countryName: 'Japan',
    currency: 'JPY',
    taxes: [
      {
        code: 'JP',
        name: 'Japan Passenger Service Facility Charge',
        type: 'fixed',
        fixedAmount: 1000,
        appliesTo: 'departure',
        taxType: 'airport',
        isRefundable: true,
        passengerTypes: ['adult', 'child'],
      },
    ],
  },
  CN: {
    countryCode: 'CN',
    countryName: 'China',
    currency: 'CNY',
    taxes: [
      {
        code: 'CN',
        name: 'China Construction Fee',
        type: 'fixed',
        fixedAmount: 50,
        appliesTo: 'departure',
        taxType: 'airport',
        isRefundable: false,
        passengerTypes: ['adult', 'child'],
      },
    ],
  },
};

/**
 * Airport tax configurations
 */
const AIRPORT_TAXES: Record<string, AirportTaxConfig> = {
  'JFK': {
    airportCode: 'JFK',
    airportName: 'John F. Kennedy International',
    countryCode: 'US',
    currency: 'USD',
    taxes: [
      {
        code: 'JFK_PFC',
        name: 'JFK Passenger Facility Charge',
        type: 'fixed',
        amount: 4.50,
        appliesTo: 'departure',
        isRefundable: false,
      },
    ],
  },
  'LAX': {
    airportCode: 'LAX',
    airportName: 'Los Angeles International',
    countryCode: 'US',
    currency: 'USD',
    taxes: [
      {
        code: 'LAX_PFC',
        name: 'LAX Passenger Facility Charge',
        type: 'fixed',
        amount: 4.50,
        appliesTo: 'departure',
        isRefundable: false,
      },
    ],
  },
  'LHR': {
    airportCode: 'LHR',
    airportName: 'London Heathrow',
    countryCode: 'UK',
    currency: 'GBP',
    taxes: [
      {
        code: 'LHR_AIF',
        name: 'Heathrow Airport Improvement Fee',
        type: 'fixed',
        amount: 50.00,
        appliesTo: 'departure',
        isRefundable: false,
      },
    ],
  },
  'CDG': {
    airportCode: 'CDG',
    airportName: 'Paris Charles de Gaulle',
    countryCode: 'FR',
    currency: 'EUR',
    taxes: [
      {
        code: 'CDG_TAX',
        name: 'CDG Airport Tax',
        type: 'fixed',
        amount: 15.00,
        appliesTo: 'departure',
        isRefundable: false,
      },
    ],
  },
  'DXB': {
    airportCode: 'DXB',
    airportName: 'Dubai International',
    countryCode: 'AE',
    currency: 'AED',
    taxes: [
      {
        code: 'DXB_SERVICE',
        name: 'Dubai Service Fee',
        type: 'fixed',
        amount: 35.00,
        appliesTo: 'departure',
        isRefundable: false,
      },
    ],
  },
};

/**
 * Tax exemption codes
 */
const TAX_EXEMPTIONS: Record<string, TaxExemption> = {
  'DIPLOMAT': {
    code: 'DIPLOMAT',
    name: 'Diplomatic Exemption',
    description: 'Tax exemption for diplomatic passport holders',
    applicableTaxes: ['US', 'GB', 'FR', 'DE'],
    passengerTypes: ['adult'],
    requiresDocumentation: true,
  },
  'CREW': {
    code: 'CREW',
    name: 'Crew Member Exemption',
    description: 'Tax exemption for operating crew members',
    applicableTaxes: ['US', 'CA', 'AU'],
    passengerTypes: ['adult'],
    requiresDocumentation: true,
  },
  'TRANSIT': {
    code: 'TRANSIT',
    name: 'Transit Exemption',
    description: 'Tax exemption for transit passengers',
    applicableTaxes: ['US_INTL', 'GB', 'FR'],
    passengerTypes: ['adult', 'child'],
    requiresDocumentation: false,
  },
  'REFUGEE': {
    code: 'REFUGEE',
    name: 'Refugee Exemption',
    description: 'Tax exemption for refugees',
    applicableTaxes: ['US', 'GB', 'CA'],
    passengerTypes: ['adult', 'child', 'infant'],
    requiresDocumentation: true,
  },
  'MILITARY': {
    code: 'MILITARY',
    name: 'Military Exemption',
    description: 'Tax exemption for military personnel on official travel',
    applicableTaxes: ['US', 'CA'],
    passengerTypes: ['adult'],
    requiresDocumentation: true,
  },
};

/**
 * Exchange rates (simplified - in production would use API)
 */
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { USD: 1, EUR: 0.92, GBP: 0.79, CAD: 1.36, AUD: 1.53, JPY: 149.50, CNY: 7.24, AED: 3.67 },
  EUR: { USD: 1.09, EUR: 1, GBP: 0.86, CAD: 1.48, AUD: 1.67, JPY: 162.50, CNY: 7.87, AED: 3.99 },
  GBP: { USD: 1.27, EUR: 1.16, GBP: 1, CAD: 1.72, AUD: 1.94, JPY: 189.24, CNY: 9.16, AED: 4.65 },
  CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, CAD: 1, AUD: 1.13, JPY: 110.07, CNY: 5.32, AED: 2.70 },
  AUD: { USD: 0.65, EUR: 0.60, GBP: 0.52, CAD: 0.89, AUD: 1, JPY: 97.71, CNY: 4.73, AED: 2.40 },
  JPY: { USD: 0.0067, EUR: 0.0062, GBP: 0.0053, CAD: 0.0091, AUD: 0.0102, JPY: 1, CNY: 0.048, AED: 0.025 },
  CNY: { USD: 0.14, EUR: 0.13, GBP: 0.11, CAD: 0.19, AUD: 0.21, JPY: 20.66, CNY: 1, AED: 0.51 },
  AED: { USD: 0.27, EUR: 0.25, GBP: 0.22, CAD: 0.37, AUD: 0.42, JPY: 40.12, CNY: 1.97, AED: 1 },
};

// ============================================
// Tax Engine Class
// ============================================

export class TaxEngine {
  /**
   * Calculates complete tax breakdown for a booking
   * 
   * @param fare - Base fare amount
   * @param route - Route information
   * @param cabin - Cabin class
   * @param passengers - Array of passenger information
   * @param currency - Target currency
   * @returns Complete tax breakdown result
   */
  async calculateTaxBreakdown(
    fare: number,
    route: TaxRouteInfo,
    cabin: string,
    passengers: PassengerInfo[],
    currency: string = 'USD'
  ): Promise<TaxBreakdownResult> {
    try {
      const taxes: TaxItem[] = [];
      const byType: Record<string, number> = {};
      const byCountry: Record<string, number> = {};
      let totalTax = 0;
      let refundableAmount = 0;

      // Get taxes for origin country (departure taxes)
      if (route.originCountry) {
        const originTaxes = await this.getCountryTaxes(route.originCountry);
        for (const taxRule of originTaxes.taxes) {
          if (taxRule.appliesTo === 'departure' || taxRule.appliesTo === 'both') {
            const taxItems = await this.applyTaxRule(taxRule, fare, passengers, route, route.originCountry);
            taxes.push(...taxItems);
          }
        }
      }

      // Get taxes for destination country (arrival taxes)
      if (route.destinationCountry && route.destinationCountry !== route.originCountry) {
        const destTaxes = await this.getCountryTaxes(route.destinationCountry);
        for (const taxRule of destTaxes.taxes) {
          if (taxRule.appliesTo === 'arrival' || taxRule.appliesTo === 'both') {
            const taxItems = await this.applyTaxRule(taxRule, fare, passengers, route, route.destinationCountry);
            taxes.push(...taxItems);
          }
        }
      }

      // Get airport taxes
      const originAirportTaxes = await this.getAirportTaxes(route.origin);
      for (const airportTax of originAirportTaxes.taxes) {
        if (airportTax.appliesTo === 'departure') {
          const taxItem = await this.applyAirportTax(airportTax, passengers, route, route.originCountry);
          if (taxItem) taxes.push(taxItem);
        }
      }

      if (route.destination !== route.origin) {
        const destAirportTaxes = await this.getAirportTaxes(route.destination);
        for (const airportTax of destAirportTaxes.taxes) {
          if (airportTax.appliesTo === 'arrival') {
            const taxItem = await this.applyAirportTax(airportTax, passengers, route, route.destinationCountry);
            if (taxItem) taxes.push(taxItem);
          }
        }
      }

      // Process taxes and convert currency if needed
      for (const tax of taxes) {
        const convertedTax = await this.convertTaxCurrency(tax.amount, tax.currency, currency);
        
        const finalTax: TaxItem = {
          ...tax,
          amount: convertedTax.convertedAmount,
          currency,
        };

        // Aggregate totals
        totalTax += finalTax.amount;
        byType[finalTax.type] = (byType[finalTax.type] || 0) + finalTax.amount;
        byCountry[route.originCountry] = (byCountry[route.originCountry] || 0) + finalTax.amount;
        
        if (finalTax.isRefundable) {
          refundableAmount += finalTax.amount;
        }
      }

      const result: TaxBreakdownResult = {
        totalTax: Math.round(totalTax * 100) / 100,
        currency,
        taxes,
        byType,
        byCountry,
        refundableAmount: Math.round(refundableAmount * 100) / 100,
        nonRefundableAmount: Math.round((totalTax - refundableAmount) * 100) / 100,
        effectiveDate: new Date(),
      };

      return result;
    } catch (error) {
      throw new Error(`Failed to calculate tax breakdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Applies a tax rule to calculate tax for passengers
   * 
   * @param taxRule - The tax rule to apply
   * @param fare - Base fare
   * @param passengers - Passenger information
   * @param route - Route information
   * @param countryCode - Country code for currency
   * @returns Array of tax items
   */
  private async applyTaxRule(
    taxRule: TaxRule,
    fare: number,
    passengers: PassengerInfo[],
    route: TaxRouteInfo,
    countryCode: string
  ): Promise<TaxItem[]> {
    const taxItems: TaxItem[] = [];
    const countryConfig = COUNTRY_TAXES[countryCode];

    for (const passenger of passengers) {
      // Check if tax applies to this passenger type
      if (!taxRule.passengerTypes.includes(passenger.type)) {
        continue;
      }

      // Check for exemptions
      if (passenger.hasTaxExemption && passenger.exemptionCode) {
        const exemption = TAX_EXEMPTIONS[passenger.exemptionCode];
        if (exemption && exemption.applicableTaxes.includes(taxRule.code)) {
          continue; // Skip this tax due to exemption
        }
      }

      let taxAmount = 0;

      // Calculate tax based on type
      switch (taxRule.type) {
        case 'fixed':
          taxAmount = taxRule.fixedAmount || 0;
          break;

        case 'percentage':
          taxAmount = (fare * (taxRule.rate || 0)) / 100;
          break;

        case 'tiered':
          taxAmount = this.calculateTieredTax(taxRule.tiers || [], fare);
          break;
      }

      // Apply thresholds if configured
      if (countryConfig?.taxThresholds) {
        for (const threshold of countryConfig.taxThresholds) {
          if (threshold.type === taxRule.code) {
            if (threshold.exemptBelow && fare < threshold.threshold) {
              taxAmount = 0;
            } else if (threshold.reducedRate && fare < threshold.threshold) {
              taxAmount = taxAmount * (threshold.reducedRate / 100);
            }
          }
        }
      }

      if (taxAmount > 0) {
        taxItems.push({
          code: taxRule.code,
          name: taxRule.name,
          amount: Math.round(taxAmount * 100) / 100,
          currency: countryConfig.currency,
          type: taxRule.taxType,
          isRefundable: taxRule.isRefundable,
          appliesTo: passenger.type,
        });
      }
    }

    return taxItems;
  }

  /**
   * Calculates tiered tax based on fare ranges
   * 
   * @param tiers - Tax tiers
   * @param fare - Base fare
   * @returns Calculated tax amount
   */
  private calculateTieredTax(tiers: TaxTier[], fare: number): number {
    for (const tier of tiers) {
      if (fare >= tier.minFare && fare < tier.maxFare) {
        if (tier.fixedAmount) {
          return tier.fixedAmount;
        }
        return (fare * tier.rate) / 100;
      }
    }
    // If no tier matches, use the highest tier
    const highestTier = tiers[tiers.length - 1];
    return highestTier.fixedAmount || (fare * highestTier.rate) / 100;
  }

  /**
   * Applies an airport tax
   * 
   * @param airportTax - Airport tax rule
   * @param passengers - Passenger information
   * @param route - Route information
   * @param countryCode - Country code
   * @returns Tax item or null
   */
  private async applyAirportTax(
    airportTax: AirportTaxRule,
    passengers: PassengerInfo[],
    route: TaxRouteInfo,
    countryCode: string
  ): Promise<TaxItem | null> {
    // Check if international only
    if (airportTax.internationalOnly && !route.isInternational) {
      return null;
    }

    // Calculate total passengers subject to this tax
    const applicablePassengers = passengers.reduce((count, p) => {
      // Check exemptions
      if (p.hasTaxExemption && p.exemptionCode) {
        const exemption = TAX_EXEMPTIONS[p.exemptionCode];
        if (exemption && exemption.applicableTaxes.includes(airportTax.code)) {
          return count;
        }
      }
      return count + p.count;
    }, 0);

    if (applicablePassengers === 0) {
      return null;
    }

    let amount = 0;
    if (airportTax.type === 'fixed') {
      amount = airportTax.amount * applicablePassengers;
    } else if (airportTax.type === 'percentage' && airportTax.rate) {
      // Would need fare amount for percentage
      amount = 0; // Placeholder
    }

    return {
      code: airportTax.code,
      name: airportTax.name,
      amount: Math.round(amount * 100) / 100,
      currency: AIRPORT_TAXES[Object.keys(AIRPORT_TAXES).find(code => 
        AIRPORT_TAXES[code].taxes.some(t => t.code === airportTax.code)
      ) || '']?.currency || 'USD',
      type: 'airport',
      isRefundable: airportTax.isRefundable,
      appliesTo: 'all',
    };
  }

  /**
   * Gets country-specific tax configuration
   * 
   * @param countryCode - ISO country code
   * @returns Country tax configuration
   */
  async getCountryTaxes(countryCode: string): Promise<CountryTaxConfig> {
    const config = COUNTRY_TAXES[countryCode.toUpperCase()];
    
    if (!config) {
      // Return default configuration for unknown countries
      return {
        countryCode: countryCode.toUpperCase(),
        countryName: countryCode.toUpperCase(),
        currency: 'USD',
        taxes: [],
      };
    }

    return config;
  }

  /**
   * Gets airport-specific tax configuration
   * 
   * @param airportCode - IATA airport code
   * @returns Airport tax configuration
   */
  async getAirportTaxes(airportCode: string): Promise<AirportTaxConfig> {
    const config = AIRPORT_TAXES[airportCode.toUpperCase()];
    
    if (!config) {
      // Return default configuration for unknown airports
      return {
        airportCode: airportCode.toUpperCase(),
        airportName: airportCode.toUpperCase(),
        countryCode: 'Unknown',
        currency: 'USD',
        taxes: [],
      };
    }

    return config;
  }

  /**
   * Calculates fare-based tax
   * 
   * @param fare - Base fare amount
   * @param taxRate - Tax rate percentage
   * @param passengers - Number of passengers
   * @returns Calculated tax amount
   */
  async calculateFareTax(
    fare: number,
    taxRate: number,
    passengers: number
  ): Promise<number> {
    const taxAmount = (fare * taxRate / 100) * passengers;
    return Math.round(taxAmount * 100) / 100;
  }

  /**
   * Processes tax refunds for a ticket
   * 
   * @param ticketNumber - The ticket number
   * @param reason - Refund reason
   * @returns Refund tax result
   */
  async processRefundTaxes(
    ticketNumber: string,
    reason: string
  ): Promise<RefundTaxResult> {
    try {
      // Get ticket with tax breakdown
      const ticket = await db.ticket.findUnique({
        where: { ticketNumber },
      });

      if (!ticket) {
        throw new Error(`Ticket ${ticketNumber} not found`);
      }

      // Parse tax breakdown from ticket
      const taxBreakdown = JSON.parse(ticket.taxBreakdown || '[]') as TaxItem[];
      
      const refundTaxes: TaxItem[] = [];
      let refundableAmount = 0;
      let nonRefundableAmount = 0;

      // Determine which taxes are refundable based on reason
      const nonRefundableReasons = ['no-show', 'voluntary_cancel'];
      const isNonRefundable = nonRefundableReasons.includes(reason);

      for (const tax of taxBreakdown) {
        let isTaxRefundable = tax.isRefundable;

        // Some taxes are non-refundable for certain reasons
        if (isNonRefundable) {
          isTaxRefundable = false;
        }

        // Airport fees are typically non-refundable
        if (tax.type === 'airport') {
          isTaxRefundable = false;
        }

        if (isTaxRefundable) {
          refundTaxes.push(tax);
          refundableAmount += tax.amount;
        } else {
          nonRefundableAmount += tax.amount;
        }
      }

      const result: RefundTaxResult = {
        ticketNumber,
        originalTaxAmount: ticket.taxes,
        refundableTaxAmount: Math.round(refundableAmount * 100) / 100,
        nonRefundableTaxAmount: Math.round(nonRefundableAmount * 100) / 100,
        refundTaxes,
        refundReason: reason,
        processingDate: new Date(),
      };

      return result;
    } catch (error) {
      throw new Error(`Failed to process refund taxes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculates interline tax sharing between partner airlines
   * 
   * @param taxAmount - Total tax amount
   * @param partnerShares - Array of partner share configurations
   * @param currency - Tax currency
   * @returns Interline tax calculation result
   */
  async calculateInterlineTax(
    taxAmount: number,
    partnerShares: InterlineTaxShare[],
    currency: string
  ): Promise<InterlineTaxResult> {
    try {
      const ourShareAmount = taxAmount * (1 - partnerShares.reduce((sum, p) => sum + p.sharePercentage, 0) / 100);
      
      const partnerResults = partnerShares.map(partner => {
        const shareAmount = (taxAmount * partner.sharePercentage) / 100;
        return {
          partnerCode: partner.partnerCode,
          shareAmount: Math.round(shareAmount * 100) / 100,
          taxes: [] as TaxItem[], // Would be populated with specific taxes
        };
      });

      const result: InterlineTaxResult = {
        totalTaxAmount: taxAmount,
        currency,
        partnerShares: partnerResults,
        ourShare: {
          amount: Math.round(ourShareAmount * 100) / 100,
          taxes: [], // Would be populated with our specific taxes
        },
        settlementDate: new Date(),
      };

      return result;
    } catch (error) {
      throw new Error(`Failed to calculate interline tax: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates tax exemption code and applicability
   * 
   * @param exemptionCode - Exemption code to validate
   * @param route - Route information
   * @param passengerType - Passenger type
   * @returns Validation result
   */
  async validateTaxExemption(
    exemptionCode: string,
    route: TaxRouteInfo,
    passengerType: 'adult' | 'child' | 'infant'
  ): Promise<{
    isValid: boolean;
    exemption?: TaxExemption;
    requiresDocumentation: boolean;
    applicableTaxes: string[];
    message: string;
  }> {
    const exemption = TAX_EXEMPTIONS[exemptionCode.toUpperCase()];

    if (!exemption) {
      return {
        isValid: false,
        requiresDocumentation: false,
        applicableTaxes: [],
        message: `Invalid exemption code: ${exemptionCode}`,
      };
    }

    // Check if exemption applies to passenger type
    if (!exemption.passengerTypes.includes(passengerType)) {
      return {
        isValid: false,
        exemption,
        requiresDocumentation: exemption.requiresDocumentation,
        applicableTaxes: [],
        message: `Exemption not applicable to passenger type: ${passengerType}`,
      };
    }

    // Check validity period if defined
    if (exemption.validityPeriod) {
      const now = new Date();
      const fromDate = new Date(exemption.validityPeriod.from);
      const untilDate = new Date(exemption.validityPeriod.until);
      
      if (now < fromDate || now > untilDate) {
        return {
          isValid: false,
          exemption,
          requiresDocumentation: exemption.requiresDocumentation,
          applicableTaxes: [],
          message: 'Exemption is not currently valid',
        };
      }
    }

    // Check route validity if defined
    if (exemption.validRoutes && exemption.validRoutes.length > 0) {
      const routeKey = `${route.origin}-${route.destination}`;
      const isValidRoute = exemption.validRoutes.some(r => 
        r === routeKey || r === route.origin || r === route.destination
      );

      if (!isValidRoute) {
        return {
          isValid: false,
          exemption,
          requiresDocumentation: exemption.requiresDocumentation,
          applicableTaxes: [],
          message: 'Exemption not valid for this route',
        };
      }
    }

    return {
      isValid: true,
      exemption,
      requiresDocumentation: exemption.requiresDocumentation,
      applicableTaxes: exemption.applicableTaxes,
      message: 'Exemption is valid and applicable',
    };
  }

  /**
   * Converts tax amount between currencies
   * 
   * @param taxAmount - Amount to convert
   * @param fromCurrency - Source currency
   * @param toCurrency - Target currency
   * @returns Currency conversion result
   */
  async convertTaxCurrency(
    taxAmount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversionResult> {
    try {
      const from = fromCurrency.toUpperCase();
      const to = toCurrency.toUpperCase();

      if (from === to) {
        return {
          originalAmount: taxAmount,
          originalCurrency: from,
          convertedAmount: taxAmount,
          targetCurrency: to,
          exchangeRate: 1,
          conversionDate: new Date(),
        };
      }

      // Get exchange rate
      const rate = EXCHANGE_RATES[from]?.[to];
      
      if (!rate) {
        throw new Error(`Exchange rate not available for ${from} to ${to}`);
      }

      const convertedAmount = Math.round(taxAmount * rate * 100) / 100;

      return {
        originalAmount: taxAmount,
        originalCurrency: from,
        convertedAmount,
        targetCurrency: to,
        exchangeRate: rate,
        conversionDate: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to convert currency: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generates tax report for a given period and route
   * 
   * @param period - Reporting period ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
   * @param route - Optional route filter
   * @param startDate - Start date for the report
   * @param endDate - End date for the report
   * @returns Generated tax report
   */
  async generateTaxReport(
    period: string,
    route?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TaxReport> {
    try {
      // Default to last 30 days if not specified
      const end = endDate || new Date();
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Query tickets within the period
      const whereClause: any = {
        status: 'open',
      };

      if (route) {
        // Would need to join with segments or PNR to filter by route
        // For now, we'll skip route filtering
      }

      const tickets = await db.ticket.findMany({
        where: whereClause,
      });

      const taxesByType: Record<string, number> = {};
      const taxesByCountry: Record<string, number> = {};
      const taxesByRoute: Record<string, number> = {};
      let totalTaxCollected = 0;
      let refundableTaxes = 0;
      let refundedTaxes = 0;
      let passengerCount = 0;

      for (const ticket of tickets) {
        const taxBreakdown = JSON.parse(ticket.taxBreakdown || '[]') as TaxItem[];
        
        for (const tax of taxBreakdown) {
          totalTaxCollected += tax.amount;
          taxesByType[tax.type] = (taxesByType[tax.type] || 0) + tax.amount;
          
          // Would need to map tax codes to countries
          taxesByCountry['Unknown'] = (taxesByCountry['Unknown'] || 0) + tax.amount;

          if (tax.isRefundable) {
            refundableTaxes += tax.amount;
          }
        }

        // Count passengers (simplified - would need proper counting)
        passengerCount++;
      }

      // Get refunded taxes
      const refundedTickets = await db.ticket.findMany({
        where: {
          status: { in: ['refunded', 'void'] },
          issuedAt: { gte: start, lte: end },
        },
      });

      for (const ticket of refundedTickets) {
        const taxBreakdown = JSON.parse(ticket.taxBreakdown || '[]') as TaxItem[];
        for (const tax of taxBreakdown) {
          if (tax.isRefundable) {
            refundedTaxes += tax.amount;
          }
        }
      }

      const report: TaxReport = {
        period,
        startDate: start,
        endDate: end,
        route,
        totalRevenue: tickets.reduce((sum, t) => sum + t.totalFare, 0),
        totalTaxCollected: Math.round(totalTaxCollected * 100) / 100,
        taxesByType,
        taxesByCountry,
        taxesByRoute,
        refundableTaxes: Math.round(refundableTaxes * 100) / 100,
        refundedTaxes: Math.round(refundedTaxes * 100) / 100,
        netTaxCollected: Math.round((totalTaxCollected - refundedTaxes) * 100) / 100,
        passengerCount,
        generatedAt: new Date(),
      };

      return report;
    } catch (error) {
      throw new Error(`Failed to generate tax report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets applicable taxes for a route
   * 
   * @param route - Route information
   * @returns Array of applicable tax rules
   */
  async getApplicableTaxes(route: TaxRouteInfo): Promise<TaxRule[]> {
    const applicableTaxes: TaxRule[] = [];

    // Get origin country taxes
    if (route.originCountry) {
      const originTaxes = await this.getCountryTaxes(route.originCountry);
      applicableTaxes.push(...originTaxes.taxes.filter(t => t.appliesTo === 'departure' || t.appliesTo === 'both'));
    }

    // Get destination country taxes
    if (route.destinationCountry && route.destinationCountry !== route.originCountry) {
      const destTaxes = await this.getCountryTaxes(route.destinationCountry);
      applicableTaxes.push(...destTaxes.taxes.filter(t => t.appliesTo === 'arrival' || t.appliesTo === 'both'));
    }

    return applicableTaxes;
  }

  /**
   * Updates exchange rates (would call external API in production)
   * 
   * @param baseCurrency - Base currency
   * @returns Updated exchange rates
   */
  async updateExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    // In production, this would call a currency exchange API
    // For now, return the hardcoded rates
    return EXCHANGE_RATES[baseCurrency.toUpperCase()] || {};
  }

  /**
   * Gets tax summary by country
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Tax summary by country
   */
  async getTaxSummaryByCountry(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ country: string; countryCode: string; totalTax: number; currency: string }>> {
    const tickets = await db.ticket.findMany({
      where: {
        issuedAt: { gte: startDate, lte: endDate },
        status: 'open',
      },
    });

    const countryTotals: Record<string, { total: number; currency: string; name: string }> = {};

    for (const ticket of tickets) {
      const taxBreakdown = JSON.parse(ticket.taxBreakdown || '[]') as TaxItem[];
      
      for (const tax of taxBreakdown) {
        // Simplified country mapping - would need proper tax code to country mapping
        const countryCode = this.mapTaxCodeToCountry(tax.code);
        if (!countryTotals[countryCode]) {
          countryTotals[countryCode] = { total: 0, currency: tax.currency, name: countryCode };
        }
        countryTotals[countryCode].total += tax.amount;
      }
    }

    return Object.entries(countryTotals).map(([countryCode, data]) => ({
      countryCode,
      country: data.name,
      totalTax: Math.round(data.total * 100) / 100,
      currency: data.currency,
    }));
  }

  /**
   * Maps tax code to country code
   * 
   * @param taxCode - Tax code
   * @returns Country code
   */
  private mapTaxCodeToCountry(taxCode: string): string {
    const countryMap: Record<string, string> = {
      'US': 'US',
      'US_INTL': 'US',
      'US_ANIMAL': 'US',
      'US_IMMIGRATION': 'US',
      'US_CUSTOMS': 'US',
      'GB': 'UK',
      'GB_CHILD': 'UK',
      'CA': 'CA',
      'CA_AIRPORT': 'CA',
      'AU': 'AU',
      'FR': 'FR',
      'FR_ANIMAL': 'FR',
      'DE': 'DE',
      'JP': 'JP',
      'CN': 'CN',
    };
    return countryMap[taxCode] || 'Unknown';
  }
}

// Export singleton instance
export const taxEngine = new TaxEngine();
