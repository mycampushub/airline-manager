'use client'

import { create } from 'zustand'

// ============= TYPES =============

// PNR / Reservation Types
export interface Passenger {
  id: string
  title: string
  firstName: string
  lastName: string
  dateOfBirth: string
  passportNumber: string
  passportExpiry: string
  nationality: string
  frequentFlyerNumber?: string
  frequentFlyerProgram?: string
  ssr: string[]
  seatPreferences?: string
  mealPreference?: string
}

export interface FlightSegment {
  id: string
  flightNumber: string
  airlineCode: string
  origin: string
  destination: string
  departureDate: string
  departureTime: string
  arrivalDate: string
  arrivalTime: string
  aircraftType: string
  fareClass: string
  fareBasis: string
  status: 'confirmed' | 'waitlist' | 'standby'
  boardingClass: 'economy' | 'business' | 'first'
}

export interface FareQuote {
  baseFare: number
  taxes: number
  fees: number
  total: number
  currency: string
  fareRules: string[]
}

export interface PNR {
  pnrNumber: string
  createdAt: string
  createdBy: string
  status: 'confirmed' | 'waitlist' | 'cancelled' | 'ticketed' | 'void'
  passengers: Passenger[]
  segments: FlightSegment[]
  fareQuote: FareQuote
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  paymentInfo: {
    paymentMethod: string
    cardLastFour?: string
    amount: number
    currency: string
  }
  bookingClass: string
  agentId: string
  agencyCode: string
  corporateAccount?: string
  timeLimit?: string
  remarks: string[]
  tickets: Ticket[]
  emds: EMD[]
  isGroup: boolean
  groupSize?: number
  linkedPNRs?: string[]
  source: 'web' | 'mobile' | 'api' | 'agent'
}

// Ticketing Types
export interface Ticket {
  ticketNumber: string
  pnrNumber: string
  passengerId: string
  passengerName: string
  issuedAt: string
  issuedBy: string
  status: 'open' | 'void' | 'refunded' | 'exchanged' | 'used'
  fare: FareQuote
  segments: FlightSegment[]
  taxes: TaxBreakdown[]
  commission: {
    amount: number
    rate: number
    paidTo: string
  }
  validationAirline: string
  interlinePartners?: string[]
  isCodeshare: boolean
  operatingCarrier?: string
  voidableUntil: string
  refundable: boolean
  changePenalty: number
  fareRules: string[]
}

export interface EMD {
  emdNumber: string
  pnrNumber: string
  passengerId: string
  passengerName: string
  type: 'seat' | 'baggage' | 'meal' | 'lounge' | 'insurance' | 'other'
  description: string
  amount: number
  currency: string
  issuedAt: string
  status: 'active' | 'void' | 'refunded' | 'used'
  associatedTicket?: string
  serviceCode: string
}

export interface TaxBreakdown {
  code: string
  name: string
  amount: number
  currency: string
}

// Inventory Types
export interface FareClass {
  code: string
  name: string
  bookingClass: string
  cabin: 'economy' | 'business' | 'first'
  baseFare: number
  advancePurchaseDays: number
  minimumStay: string
  maximumStay: string
  changeAllowed: boolean
  refundable: boolean
  fareRules: string[]
}

export interface SeatMap {
  aircraftType: string
  cabin: 'economy' | 'business' | 'first'
  rows: number
  seatsPerRow: number
  seatConfiguration: SeatConfig[][]
  availableSeats: string[]
  blockedSeats: string[]
  occupiedSeats: string[]
}

export interface SeatConfig {
  seatNumber: string
  type: 'standard' | 'exit' | 'bulkhead' | 'wing' | 'window' | 'aisle' | 'middle'
  available: boolean
  price?: number
  characteristics?: string[]
}

export interface RouteInventory {
  route: string
  origin: string
  destination: string
  flightNumber: string
  date: string
  capacity: Record<string, number> // by booking class
  sold: Record<string, number>
  waitlist: Record<string, number>
  oversell: Record<string, number>
  blocked: Record<string, number>
  fareClasses: FareClass[]
  marriedSegments: string[]
}

// DCS Types
export interface CheckInRecord {
  id: string
  pnrNumber: string
  ticketNumber: string
  passengerId: string
  passengerName: string
  flightNumber: string
  date: string
  checkInTime: string
  checkInMethod: 'web' | 'mobile' | 'kiosk' | 'counter'
  seatNumber: string
  boardingPassIssued: boolean
  boardingPassData?: {
    passNumber: string
    issuedAt: string
    barcode: string
  }
  documentsVerified: boolean
  visaValid: boolean
  passportValid: boolean
  bagsChecked: number
  status: 'checked-in' | 'not-checked-in' | 'boarded' | 'no-show'
}

export interface BoardingRecord {
  id: string
  flightNumber: string
  date: string
  gate: string
  scheduledDeparture: string
  actualDeparture: string
  boardingStarted: string
  boardingCompleted: string
  boardedPassengers: number
  totalPassengers: number
  priorityBoarding: string[]
  standbyList: string[]
  gateChangeLog: GateChange[]
}

export interface GateChange {
  timestamp: string
  fromGate: string
  toGate: string
  reason: string
  notified: boolean
}

export interface LoadSheet {
  flightNumber: string
  date: string
  aircraftRegistration: string
  aircraftType: string
  totalWeight: number
  passengerWeight: number
  cargoWeight: number
  baggageWeight: number
  fuelWeight: number
  zeroFuelWeight: number
  takeoffWeight: number
  landingWeight: number
  trimSetting: number
  centerOfGravity: string
  distribution: {
    forward: number
    aft: number
  }
  generatedAt: string
  generatedBy: string
}

export interface BaggageRecord {
  tagNumber: string
  pnrNumber: string
  ticketNumber: string
  passengerId: string
  passengerName: string
  flightNumber: string
  origin: string
  destination: string
  weight: number
  pieces: number
  status: 'checked' | 'loaded' | 'transferred' | 'delivered' | 'mishandled' | 'lost'
  routing: string[]
  interline: boolean
  specialHandling?: ['fragile' | 'priority' | 'oversize' | 'heavy']
  mishandledAt?: string
  resolvedAt?: string
  fee: number
  feePaid: boolean
}

// Flight Operations Types
export interface FlightSchedule {
  id: string
  flightNumber: string
  airlineCode: string
  origin: string
  destination: string
  daysOfWeek: number[]
  startDate: string
  endDate: string
  departureTime: string
  arrivalTime: string
  aircraftType: string
  duration: number
  distance: number
  status: 'active' | 'inactive' | 'seasonal'
  slot: {
    origin: string
    destination: string
    slotTime: string
    slotOwner: string
  }
  frequencies: number
}

export interface FlightInstance {
  id: string
  scheduleId: string
  flightNumber: string
  date: string
  origin: string
  destination: string
  scheduledDeparture: string
  scheduledArrival: string
  estimatedDeparture?: string
  estimatedArrival?: string
  actualDeparture?: string
  actualArrival?: string
  aircraftRegistration: string
  aircraftType: string
  captain: string
  firstOfficer: string
  cabinCrew: string[]
  status: 'scheduled' | 'delayed' | 'departed' | 'arrived' | 'cancelled' | 'diverted'
  delayCode?: string
  delayReason?: string
  diversionAirport?: string
  weatherConditions?: string
  notams: string[]
  loadFactor: number
  passengers: number
  cargo: number
  mail: number
  fuel: number
}

export interface DisruptionEvent {
  id: string
  type: 'delay' | 'cancellation' | 'diversion' | 'aircraft_swap' | 'crew_change'
  flightId: string
  flightNumber: string
  date: string
  reason: string
  code: string
  impact: {
    passengers: number
    connections: number
    estimatedCost: number
  }
  actions: DisruptionAction[]
  status: 'active' | 'mitigating' | 'resolved'
  createdAt: string
  resolvedAt?: string
}

export interface DisruptionAction {
  id: string
  type: 'rebook' | 'reaccommodate' | 'compensate' | 'notify' | 'refund'
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  assignedTo: string
  dueBy: string
  completedAt?: string
}

export interface FlightRelease {
  id: string
  flightId: string
  flightNumber: string
  date: string
  generatedAt: string
  generatedBy: string
  weather: {
  departure: string
  enroute: string
  destination: string
  }
  notams: string[]
  atcRestrictions: string[]
  alternateAirports: string[]
  fuelPlan: {
    trip: number
    reserve: number
    contingency: number
    extra: number
    total: number
  }
  route: string
  altitude: number
  speed: number
  weight: number
  signature: string
}

// Crew Management Types
export interface CrewMember {
  id: string
  employeeNumber: string
  firstName: string
  lastName: string
  position: 'captain' | 'first_officer' | 'purser' | 'flight_attendant' | 'check_in_agent' | 'ramp_agent'
  base: string
  qualifications: string[]
  licenseNumber: string
  licenseExpiry: string
  medicalCertificate: string
  medicalExpiry: string
  passportNumber: string
  passportExpiry: string
  dateOfBirth: string
  nationality: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'on_leave' | 'training' | 'suspended'
  currentDuty?: string
  hoursFlown: number
  hoursThisMonth: number
  hoursLast30Days: number
  domicile: string
  language: string[]
}

export interface CrewSchedule {
  id: string
  crewId: string
  type: 'flight' | 'standby' | 'training' | 'leave' | 'reserve'
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  flightId?: string
  flightNumber?: string
  route?: string
  position: string
  reportTime: string
  releaseTime: string
  dutyHours: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  hotel?: {
    name: string
    address: string
    phone: string
    checkIn: string
    checkOut: string
  }
  transport?: {
    type: 'hotel_shuttle' | 'taxi' | 'rental' | 'public'
    pickup: string
    dropoff: string
  }
}

export interface CrewPairing {
  id: string
  pairingNumber: string
  startDate: string
  endDate: string
  flights: string[]
  totalFlightTime: number
  totalDutyTime: number
  restPeriods: RestPeriod[]
  base: string
  deadhead: boolean
  overnightStops: number
  hotels: string[]
  cost: number
  compliant: boolean
  complianceNotes?: string[]
}

export interface RestPeriod {
  location: string
  startTime: string
  endTime: string
  duration: number
  minimumRequired: number
  compliant: boolean
}

// MRO Types
export interface MaintenanceRecord {
  id: string
  aircraftRegistration: string
  aircraftType: string
  type: 'scheduled' | 'unscheduled' | 'inspection' | 'modification' | 'repair'
  category: 'a-check' | 'b-check' | 'c-check' | 'd-check' | 'line_maintenance'
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  scheduledStart: string
  scheduledEnd: string
  actualStart?: string
  actualEnd?: string
  station: string
  hangar?: string
  assignedTo: string[]
  workOrderNumber: string
  tasks: MaintenanceTask[]
  partsUsed: PartUsage[]
  laborHours: number
  cost: number
  signOff: {
    mechanic: string
    inspector: string
    timestamp: string
  }
  adCompliance?: ADCompliance[]
}

export interface MaintenanceTask {
  id: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  completedBy?: string
  completedAt?: string
  reference?: string
}

export interface ADCompliance {
  adNumber: string
  title: string
  issuedDate: string
  complianceDate: string
  recurring: boolean
  nextDue?: string
  status: 'compliant' | 'due' | 'overdue'
}

export interface Part {
  partNumber: string
  name: string
  description: string
  category: string
  manufacturer: string
  quantityOnHand: number
  minimumStock: number
  reorderQuantity: number
  unitCost: number
  location: string
  shelfLife?: string
  serialTracking: boolean
  aircraftApplicability: string[]
}

export interface PartUsage {
  partNumber: string
  quantity: number
  serialNumbers?: string[]
  cost: number
}

export interface Component {
  id: string
  partNumber: string
  serialNumber: string
  installedOn: string
  installedAt: string
  aircraftRegistration: string
  position: string
  cycleCount: number
  hoursSinceNew: number
  timeSinceOverhaul: number
  nextOverhaulDue?: string
  condition: 'serviceable' | 'unserviceable' | 'repairable' | 'scrapped'
  lastInspection: string
  nextInspection: string
}

// Revenue Management Types
export interface FareBasis {
  code: string
  name: string
  bookingClass: string
  cabin: 'economy' | 'business' | 'first'
  fareFamily: string
  baseFare: number
  currency: string
  advancePurchase: number
  minStay: string
  maxStay: string
  changeable: boolean
  changeFee: number
  refundable: boolean
  refundFee: number
  seasonality: SeasonalFare[]
  routing: string
  blackouts: string[]
  companionRule?: string
  corporateRule?: string
  effectiveDate: string
  expiryDate?: string
}

export interface SeasonalFare {
  season: 'low' | 'shoulder' | 'peak' | 'super_peak'
  startDate: string
  endDate: string
  multiplier: number
}

export interface RevenueData {
  route: string
  origin: string
  destination: string
  date: string
  flightNumber: string
  passengers: number
  loadFactor: number
  revenue: number
  yield: number
  rask: number // Revenue per Available Seat Kilometer
  cargoRevenue: number
  ancillaryRevenue: number
  totalRevenue: number
  costs: number
  profit: number
  margin: number
  forecast: RevenueForecast
}

export interface RevenueForecast {
  predictedLoad: number
  predictedRevenue: number
  confidence: number
  demandTrend: 'increasing' | 'stable' | 'decreasing'
  recommendedActions: string[]
}

export interface DemandForecast {
  route: string
  origin: string
  destination: string
  period: string
  historicalData: {
    date: string
    passengers: number
    revenue: number
  }[]
  forecast: {
    date: string
    predictedPassengers: number
    predictedRevenue: number
    confidence: number
  }[]
  factors: {
    seasonality: number
    events: string[]
    competition: string[]
    economic: string
  }
}

// Ancillary Types
export interface AncillaryProduct {
  id: string
  code: string
  name: string
  category: 'seat' | 'baggage' | 'meal' | 'lounge' | 'wifi' | 'insurance' | 'upgrade' | 'other'
  description: string
  price: number
  currency: string
  taxIncluded: boolean
  applicableRoutes: string[]
  applicableCabins: string[]
  applicableFares: string[]
  restrictions: string[]
  availability: string
  image?: string
  bundleId?: string
  commissionEligible: boolean
  commissionRate: number
}

export interface Bundle {
  id: string
  name: string
  code: string
  description: string
  products: string[]
  totalPrice: number
  savings: number
  currency: string
  targetSegment: string
  validity: string
  terms: string[]
}

export interface PromoCode {
  code: string
  type: 'percentage' | 'fixed' | 'ancillary' | 'bundle'
  value: number
  currency?: string
  minSpend?: number
  maxDiscount?: number
  applicableRoutes: string[]
  applicableFares: string[]
  validFrom: string
  validUntil: string
  usageLimit: number
  usedCount: number
  perCustomerLimit: number
  active: boolean
  terms: string[]
}

// Agency Types
export interface Agency {
  id: string
  code: string
  name: string
  type: 'iata' | 'non_iata' | 'corporate' | 'ota' | 'tmc'
  iataNumber?: string
  status: 'active' | 'suspended' | 'inactive'
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'standard'
  parentAgencyId?: string
  branchCode?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  contact: {
    primaryContact: string
    email: string
    phone: string
    fax?: string
  }
  credit: {
    limit: number
    used: number
    available: number
    currency: string
    terms: number // days
    autoBlock: boolean
    autoBlockThreshold: number
  }
  commission: {
    standard: number
    overrides: CommissionOverride[]
    volumeBonus: VolumeBonus[]
  }
  permissions: AgencyPermissions
  performance: {
    totalBookings: number
    totalRevenue: number
    cancellationRate: number
    noShowRate: number
    lastBooking: string
  }
  wallet: {
    balance: number
    currency: string
    transactions: WalletTransaction[]
  }
  createdAt: string
  lastModified: string
}

export interface CommissionOverride {
  route: string
  origin: string
  destination: string
  cabin: string
  fareClass: string
  rate: number
  effectiveFrom: string
  effectiveUntil?: string
}

export interface VolumeBonus {
  tier: string
  minRevenue: number
  bonusRate: number
  period: 'monthly' | 'quarterly' | 'annual'
}

export interface AgencyPermissions {
  canBook: boolean
  canTicket: boolean
  canRefund: boolean
  canExchange: boolean
  canViewFares: boolean
  canViewAllFares: boolean
  canCreatePNR: boolean
  canModifyPNR: boolean
  canCancelPNR: boolean
  maxBookingsPerDay: number
  maxPassengersPerBooking: number
  restrictedRoutes: string[]
  allowedRoutes: string[]
  paymentMethods: string[]
}

export interface WalletTransaction {
  id: string
  type: 'credit' | 'debit' | 'refund' | 'adjustment'
  amount: number
  currency: string
  balanceAfter: number
  description: string
  reference?: string
  createdAt: string
}

export interface ADM {
  id: string
  number: string
  agencyId: string
  agencyCode: string
  type: 'fare_discrepancy' | 'refund_violation' | 'ticketing_error' | 'documentation' | 'other'
  amount: number
  currency: string
  reason: string
  ticketNumbers: string[]
  pnrNumbers: string[]
  status: 'draft' | 'issued' | 'disputed' | 'upheld' | 'waived' | 'paid'
  issuedDate: string
  dueDate: string
  paidDate?: string
  disputedDate?: string
  disputeReason?: string
  notes: string[]
}

// CRM Types
export interface CustomerProfile {
  id: string
  title: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  contact: {
    email: string
    phone: string
    secondaryPhone?: string
    address: {
      street: string
      city: string
      state: string
      country: string
      postalCode: string
    }
  }
  documents: {
    passportNumber?: string
    passportExpiry?: string
    nationalId?: string
    drivingLicense?: string
  }
  loyalty: LoyaltyProfile
  preferences: CustomerPreferences
  travelHistory: CustomerTravelHistory
  segments: CustomerSegment[]
  status: 'active' | 'inactive' | 'blacklisted'
  createdAt: string
  lastModified: string
  lastFlight?: string
}

export interface LoyaltyProfile {
  memberNumber: string
  tier: 'base' | 'silver' | 'gold' | 'platinum' | 'elite'
  pointsBalance: number
  pointsEarned: number
  pointsRedeemed: number
  tierPoints: number
  nextTierPoints: number
  nextTier: string
  joinDate: string
  status: 'active' | 'suspended'
  benefits: string[]
}

export interface CustomerPreferences {
  seatPreference: string[]
  mealPreference: string
  language: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  specialAssistance: string[]
}

export interface CustomerTravelHistory {
  totalFlights: number
  totalMiles: number
  totalSegments: number
  totalSpend: number
  averageSpendPerTrip: number
  favoriteRoutes: string[]
  favoriteDestinations: string[]
  lastYearFlights: number
  lastYearMiles: number
  lastYearSpend: number
  lifetimeValue: number
  churnRisk: 'low' | 'medium' | 'high'
  nextBestAction: string
}

export interface TravelHistory {
  flights: FlightHistory[]
}

export interface FlightHistory {
  pnrNumber: string
  ticketNumber: string
  flightNumber: string
  date: string
  route: string
  cabin: string
  fareClass: string
  pointsEarned: number
  amount: number
}

export interface CustomerSegment {
  segment: 'business' | 'leisure' | 'vip' | 'price_sensitive' | 'frequent_flyer' | 'corporate' | 'family'
  confidence: number
  assignedAt: string
  criteria: string[]
}

export interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'in_app' | 'multi_channel'
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused'
  targetSegments: string[]
  targetTiers: string[]
  message: {
    subject: string
    body: string
    template: string
  }
  schedule: {
    startDate: string
    endDate?: string
    sendTime: string
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  }
  metrics: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    converted: number
    unsubscribed: number
  }
  createdAt: string
  createdBy: string
}

export interface Complaint {
  id: string
  customerId: string
  customerName: string
  category: 'flight_delay' | 'cancellation' | 'baggage' | 'service' | 'booking' | 'refund' | 'other'
  subject: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  channel: 'email' | 'phone' | 'web' | 'social' | 'airport'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'
  pnrNumber?: string
  flightNumber?: string
  flightDate?: string
  assignedTo?: string
  priority: number
  sla: string
  createdAt: string
  dueDate: string
  resolvedAt?: string
  resolution?: string
  compensation?: {
    type: string
    amount: number
    currency: string
  }
  followUpRequired: boolean
  followUpDate?: string
}

// Analytics Types
export interface KPIDashboard {
  period: 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'this_year'
  metrics: {
    bookings: {
      total: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }
    passengers: {
      total: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }
    revenue: {
      total: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }
    loadFactor: {
      value: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }
    yield: {
      value: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }
    ancillaryRevenue: {
      total: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }
    onTimePerformance: {
      value: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }
    cancellations: {
      count: number
      rate: number
      change: number
      trend: 'up' | 'down' | 'stable'
    }
  }
  topRoutes: RouteMetric[]
  topAgents: AgentMetric[]
  revenueByChannel: ChannelMetric[]
  revenueByCabin: CabinMetric[]
}

export interface RouteMetric {
  route: string
  origin: string
  destination: string
  flights: number
  passengers: number
  loadFactor: number
  revenue: number
  yield: number
  growth: number
}

export interface AgentMetric {
  agentId: string
  agentCode: string
  agentName: string
  bookings: number
  passengers: number
  revenue: number
  commission: number
  growth: number
}

export interface ChannelMetric {
  channel: 'direct' | 'agency' | 'ota' | 'corporate' | 'gds'
  bookings: number
  revenue: number
  share: number
  growth: number
}

export interface CabinMetric {
  cabin: 'economy' | 'business' | 'first'
  passengers: number
  revenue: number
  loadFactor: number
  yield: number
  share: number
}

// Security Types
export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions: Permission[]
  department: string
  location: string
  status: 'active' | 'inactive' | 'locked' | 'pending'
  lastLogin: string
  createdAt: string
  mfaEnabled: boolean
  sessions: Session[]
}

export interface Permission {
  module: string
  actions: string[]
}

export interface Session {
  id: string
  startedAt: string
  endedAt?: string
  ipAddress: string
  device: string
  browser: string
  location: string
}

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  username: string
  action: string
  module: string
  details: string
  ipAddress: string
  userAgent: string
  result: 'success' | 'failure'
  sessionId?: string
}

export interface SecurityEvent {
  id: string
  type: 'login_attempt' | 'unauthorized_access' | 'suspicious_activity' | 'data_breach' | 'fraud_attempt'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  userId?: string
  ipAddress: string
  timestamp: string
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
  resolution?: string
  resolvedAt?: string
}

// Integration Types
export interface Integration {
  id: string
  name: string
  type: 'gds' | 'nds' | 'payment' | 'airport' | 'accounting' | 'crm' | 'loyalty' | 'chatbot' | 'webhook' | 'other'
  provider: 'amadeus' | 'sabre' | 'travelport' | 'stripe' | 'paypal' | 'aodb' | 'bhs' | 'sap' | 'oracle' | 'salesforce' | 'other'
  status: 'active' | 'inactive' | 'error' | 'testing'
  endpoint: string
  credentials: {
    apiKey?: string
    apiSecret?: string
    username?: string
    password?: string
    certificate?: string
  }
  configuration: Record<string, any>
  lastSync: string
  lastSyncStatus: 'success' | 'partial' | 'failed'
  metrics: {
    requestsToday: number
    requestsTotal: number
    errorsToday: number
    errorsTotal: number
    averageResponseTime: number
  }
  webhooks: Webhook[]
}

export interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  secret: string
  status: 'active' | 'inactive'
  lastTriggered?: string
  successRate: number
}

// Cargo Types
export interface CargoBooking {
  id: string
  awbNumber: string
  shipper: {
    name: string
    address: string
    contact: string
    accountNumber?: string
  }
  consignee: {
    name: string
    address: string
    contact: string
  }
  flightDetails: {
    flightNumber: string
    date: string
    origin: string
    destination: string
    routing: string[]
  }
  goods: {
    description: string
    pieces: number
    weight: number
    volume: number
    weightUnit: 'kg' | 'lb'
    dangerousGoods: boolean
    dgClass?: string
    unNumber?: string
    perishable: boolean
    temperatureControlled: boolean
    requiredTemperature?: number
    specialHandling: string[]
  }
  charges: {
    freight: number
    fuelSurcharge: number
    securitySurcharge: number
    otherCharges: number
    total: number
    currency: string
    prepaid: boolean
    collect: boolean
  }
  status: 'booked' | 'accepted' | 'received' | 'loaded' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled'
  bookedAt: string
  bookedBy: string
  uld?: string
  tracking: CargoTracking[]
}

export interface CargoTracking {
  timestamp: string
  location: string
  status: string
  remarks?: string
  userId?: string
}

export interface ULD {
  id: string
  uldNumber: string
  type: string
  owner: string
  condition: 'serviceable' | 'repairable' | 'unserviceable'
  location: string
  currentFlight?: string
  lastInspection: string
  nextInspectionDue: string
  dimensions: {
    length: number
    width: number
    height: number
    maxWeight: number
  }
  contents: string[]
}

// Sustainability Types
export interface SustainabilityMetrics {
  period: string
  flights: number
  fuelConsumed: number
  co2Emissions: number
  co2PerPaxKm: number
  co2PerTonneKm: number
  efficiency: number
  carbonOffsetsSold: number
  carbonOffsetsRetired: number
  renewableEnergy: number
  wasteRecycled: number
  targets: {
    fuelEfficiency: { current: number; target: number; year: number }
    co2Reduction: { current: number; target: number; year: number }
    renewableEnergy: { current: number; target: number; year: number }
  }
  initiatives: SustainabilityInitiative[]
}

export interface SustainabilityInitiative {
  id: string
  name: string
  type: 'fuel' | 'fleet' | 'operations' | 'ground' | 'offsets' | 'other'
  description: string
  status: 'planned' | 'active' | 'completed'
  startDate: string
  endDate?: string
  investment: number
  savings: {
    fuel: number
    co2: number
    cost: number
  }
  progress: number
}

export interface CarbonOffset {
  id: string
  name: string
  project: string
  type: string
  location: string
  standard: string
  certification: string
  pricePerTon: number
  currency: string
  available: number
  sold: number
  retired: number
  vintage: number
}

// AI & Automation Types
export interface AIModel {
  id: string
  name: string
  type: 'pricing' | 'demand_forecast' | 'maintenance_predictive' | 'fraud_detection' | 'personalization' | 'disruption_recovery' | 'revenue_anomaly'
  status: 'training' | 'deployed' | 'retired'
  version: string
  accuracy: number
  lastTrained: string
  nextTraining: string
  features: string[]
  performance: {
    precision: number
    recall: number
    f1Score: number
    auc: number
  }
}

export interface AIPrediction {
  modelId: string
  modelName: string
  type: string
  timestamp: string
  input: Record<string, any>
  output: Record<string, any>
  confidence: number
  recommendation?: string
  implemented: boolean
  outcome?: string
}

export interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: AutomationTrigger
  actions: AutomationAction[]
  status: 'active' | 'inactive' | 'paused'
  priority: 'low' | 'medium' | 'high' | 'critical'
  executionCount: number
  successRate: number
  lastExecuted: string
  nextExecution?: string
  createdBy: string
  createdAt: string
}

export interface AutomationTrigger {
  type: 'schedule' | 'event' | 'condition' | 'threshold'
  schedule?: string
  eventType?: string
  condition?: string
  threshold?: {
    metric: string
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
    value: number
  }
}

export interface AutomationAction {
  type: 'notification' | 'task_creation' | 'data_update' | 'api_call' | 'email' | 'sms'
  parameters: Record<string, any>
  order: number
}

// ============= STORE INTERFACE =============

interface AirlineStore {
  // PSS Data
  pnrs: PNR[]
  tickets: Ticket[]
  emds: EMD[]
  fareClasses: FareClass[]
  routeInventory: RouteInventory[]
  
  // DCS Data
  checkInRecords: CheckInRecord[]
  boardingRecords: BoardingRecord[]
  loadSheets: LoadSheet[]
  baggageRecords: BaggageRecord[]
  
  // Flight Operations Data
  flightSchedules: FlightSchedule[]
  flightInstances: FlightInstance[]
  disruptions: DisruptionEvent[]
  flightReleases: FlightRelease[]
  
  // Crew Data
  crewMembers: CrewMember[]
  crewSchedules: CrewSchedule[]
  crewPairings: CrewPairing[]
  
  // MRO Data
  maintenanceRecords: MaintenanceRecord[]
  parts: Part[]
  components: Component[]
  
  // Revenue Management Data
  fareBasis: FareBasis[]
  revenueData: RevenueData[]
  demandForecasts: DemandForecast[]
  
  // Ancillary Data
  ancillaryProducts: AncillaryProduct[]
  bundles: Bundle[]
  promoCodes: PromoCode[]
  
  // Agency Data
  agencies: Agency[]
  adms: ADM[]
  
  // CRM Data
  customerProfiles: CustomerProfile[]
  campaigns: Campaign[]
  complaints: Complaint[]
  
  // Analytics Data
  kpiDashboard: KPIDashboard
  
  // Security Data
  users: User[]
  auditLogs: AuditLog[]
  securityEvents: SecurityEvent[]
  
  // Integration Data
  integrations: Integration[]
  
  // Cargo Data
  cargoBookings: CargoBooking[]
  ulds: ULD[]
  
  // Sustainability Data
  sustainabilityMetrics: SustainabilityMetrics[]
  carbonOffsets: CarbonOffset[]
  
  // AI & Automation Data
  aiModels: AIModel[]
  aiPredictions: AIPrediction[]
  automationRules: AutomationRule[]
  
  // UI State
  currentModule: string
  currentView: string
  sidebarCollapsed: boolean
  
  // Actions
  setCurrentModule: (module: string) => void
  setCurrentView: (view: string) => void
  toggleSidebar: () => void
  
  // PSS Actions
  createPNR: (pnr: Partial<PNR>) => PNR
  updatePNR: (pnrNumber: string, updates: Partial<PNR>) => PNR
  deletePNR: (pnrNumber: string) => void
  getPNR: (pnrNumber: string) => PNR | undefined
  searchPNRs: (query: string) => PNR[]
  
  issueTicket: (ticket: Partial<Ticket>) => Ticket
  voidTicket: (ticketNumber: string) => Ticket
  refundTicket: (ticketNumber: string, reason: string) => Ticket
  exchangeTicket: (ticketNumber: string, newFare: FareQuote) => Ticket
  
  issueEMD: (emd: Partial<EMD>) => EMD
  voidEMD: (emdNumber: string) => EMD
  
  // DCS Actions
  createCheckIn: (checkIn: Partial<CheckInRecord>) => CheckInRecord
  updateBoarding: (flightNumber: string, date: string, updates: Partial<BoardingRecord>) => BoardingRecord
  generateLoadSheet: (flightNumber: string, date: string) => LoadSheet
  addBaggage: (baggage: Partial<BaggageRecord>) => BaggageRecord
  
  // Flight Operations Actions
  createFlightSchedule: (schedule: Partial<FlightSchedule>) => FlightSchedule
  updateFlightInstance: (id: string, updates: Partial<FlightInstance>) => FlightInstance
  createDisruption: (disruption: Partial<DisruptionEvent>) => DisruptionEvent
  generateFlightRelease: (flightId: string) => FlightRelease
  
  // Crew Actions
  addCrewMember: (crew: Partial<CrewMember>) => CrewMember
  assignCrewSchedule: (schedule: Partial<CrewSchedule>) => CrewSchedule
  createCrewPairing: (pairing: Partial<CrewPairing>) => CrewPairing
  
  // MRO Actions
  createMaintenanceRecord: (record: Partial<MaintenanceRecord>) => MaintenanceRecord
  updatePart: (partNumber: string, updates: Partial<Part>) => Part
  trackComponent: (component: Partial<Component>) => Component
  
  // Revenue Management Actions
  addFareBasis: (fare: Partial<FareBasis>) => FareBasis
  updateRevenueData: (route: string, date: string, data: Partial<RevenueData>) => RevenueData
  
  // Agency Actions
  addAgency: (agency: Partial<Agency>) => Agency
  updateAgencyCredit: (agencyId: string, amount: number) => Agency
  issueADM: (adm: Partial<ADM>) => ADM
  resolveADM: (admId: string, resolution: string) => ADM
  
  // CRM Actions
  addCustomer: (customer: Partial<CustomerProfile>) => CustomerProfile
  updateCustomerPreferences: (customerId: string, preferences: Partial<CustomerPreferences>) => CustomerProfile
  createCampaign: (campaign: Partial<Campaign>) => Campaign
  logComplaint: (complaint: Partial<Complaint>) => Complaint
  
  // Analytics Actions
  updateKPIDashboard: (period: string) => void
  
  // Security Actions
  addUser: (user: Partial<User>) => User
  logAudit: (log: Partial<AuditLog>) => AuditLog
  reportSecurityEvent: (event: Partial<SecurityEvent>) => SecurityEvent
  
  // Integration Actions
  addIntegration: (integration: Partial<Integration>) => Integration
  triggerWebhook: (integrationId: string, event: string) => void
  
  // Cargo Actions
  createCargoBooking: (booking: Partial<CargoBooking>) => CargoBooking
  updateULD: (uldNumber: string, updates: Partial<ULD>) => ULD
  
  // Sustainability Actions
  recordSustainabilityMetrics: (metrics: Partial<SustainabilityMetrics>) => SustainabilityMetrics
  sellCarbonOffset: (offsetId: string, quantity: number) => CarbonOffset
  
  // AI Actions
  addAIModel: (model: Partial<AIModel>) => AIModel
  generatePrediction: (modelId: string, input: Record<string, any>) => AIPrediction
  createAutomationRule: (rule: Partial<AutomationRule>) => AutomationRule
}

// ============= STORE CREATION =============

const generateId = () => Math.random().toString(36).substr(2, 9)

export const useAirlineStore = create<AirlineStore>((set, get) => ({
  // Initial State
  pnrs: [],
  tickets: [],
  emds: [],
  fareClasses: [],
  routeInventory: [],
  checkInRecords: [],
  boardingRecords: [],
  loadSheets: [],
  baggageRecords: [],
  flightSchedules: [],
  flightInstances: [],
  disruptions: [],
  flightReleases: [],
  crewMembers: [],
  crewSchedules: [],
  crewPairings: [],
  maintenanceRecords: [],
  parts: [],
  components: [],
  fareBasis: [],
  revenueData: [],
  demandForecasts: [],
  ancillaryProducts: [],
  bundles: [],
  promoCodes: [],
  agencies: [],
  adms: [],
  customerProfiles: [],
  campaigns: [],
  complaints: [],
  kpiDashboard: {
    period: 'today',
    metrics: {
      bookings: { total: 0, change: 0, trend: 'stable' },
      passengers: { total: 0, change: 0, trend: 'stable' },
      revenue: { total: 0, change: 0, trend: 'stable' },
      loadFactor: { value: 0, change: 0, trend: 'stable' },
      yield: { value: 0, change: 0, trend: 'stable' },
      ancillaryRevenue: { total: 0, change: 0, trend: 'stable' },
      onTimePerformance: { value: 0, change: 0, trend: 'stable' },
      cancellations: { count: 0, rate: 0, change: 0, trend: 'stable' }
    },
    topRoutes: [],
    topAgents: [],
    revenueByChannel: [],
    revenueByCabin: []
  },
  users: [],
  auditLogs: [],
  securityEvents: [],
  integrations: [],
  cargoBookings: [],
  ulds: [],
  sustainabilityMetrics: [],
  carbonOffsets: [],
  aiModels: [],
  aiPredictions: [],
  automationRules: [],
  
  // UI State
  currentModule: 'dashboard',
  currentView: 'overview',
  sidebarCollapsed: false,
  
  // UI Actions
  setCurrentModule: (module) => set({ currentModule: module }),
  setCurrentView: (view) => set({ currentView: view }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  // PSS Actions
  createPNR: (pnr) => {
    const newPNR: PNR = {
      pnrNumber: pnr.pnrNumber || `ABC${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      status: 'confirmed',
      passengers: pnr.passengers || [],
      segments: pnr.segments || [],
      fareQuote: pnr.fareQuote || {
        baseFare: 0,
        taxes: 0,
        fees: 0,
        total: 0,
        currency: 'USD',
        fareRules: []
      },
      contactInfo: pnr.contactInfo || {
        email: '',
        phone: '',
        address: ''
      },
      paymentInfo: pnr.paymentInfo || {
        paymentMethod: 'cash',
        amount: 0,
        currency: 'USD'
      },
      bookingClass: pnr.bookingClass || 'Y',
      agentId: pnr.agentId || 'system',
      agencyCode: pnr.agencyCode || 'DEFAULT',
      remarks: pnr.remarks || [],
      tickets: [],
      emds: [],
      isGroup: pnr.isGroup || false,
      source: pnr.source || 'agent',
      ...pnr
    }
    set((state) => ({ pnrs: [...state.pnrs, newPNR] }))
    return newPNR
  },
  
  updatePNR: (pnrNumber, updates) => {
    set((state) => ({
      pnrs: state.pnrs.map((pnr) =>
        pnr.pnrNumber === pnrNumber ? { ...pnr, ...updates } : pnr
      )
    }))
    return get().pnrs.find((pnr) => pnr.pnrNumber === pnrNumber)!
  },
  
  deletePNR: (pnrNumber) => {
    set((state) => ({ pnrs: state.pnrs.filter((pnr) => pnr.pnrNumber !== pnrNumber) }))
  },
  
  getPNR: (pnrNumber) => {
    return get().pnrs.find((pnr) => pnr.pnrNumber === pnrNumber)
  },
  
  searchPNRs: (query) => {
    const state = get()
    const lowerQuery = query.toLowerCase()
    return state.pnrs.filter((pnr) =>
      pnr.pnrNumber.toLowerCase().includes(lowerQuery) ||
      pnr.passengers.some((p) => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(lowerQuery)
      ) ||
      pnr.contactInfo.email.toLowerCase().includes(lowerQuery)
    )
  },
  
  issueTicket: (ticket) => {
    const newTicket: Ticket = {
      ticketNumber: ticket.ticketNumber || `176-${Math.random().toString().substr(2, 10)}`,
      issuedAt: new Date().toISOString(),
      issuedBy: 'system',
      status: 'open',
      taxes: [],
      commission: { amount: 0, rate: 0, paidTo: '' },
      isCodeshare: false,
      voidableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      refundable: true,
      changePenalty: 0,
      fareRules: [],
      ...ticket
    }
    set((state) => ({ tickets: [...state.tickets, newTicket] }))
    return newTicket
  },
  
  voidTicket: (ticketNumber) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.ticketNumber === ticketNumber ? { ...t, status: 'void' as const } : t
      )
    }))
    return get().tickets.find((t) => t.ticketNumber === ticketNumber)!
  },
  
  refundTicket: (ticketNumber, reason) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.ticketNumber === ticketNumber ? { ...t, status: 'refunded' as const } : t
      )
    }))
    return get().tickets.find((t) => t.ticketNumber === ticketNumber)!
  },
  
  exchangeTicket: (ticketNumber, newFare) => {
    const newTicket = get().issueTicket({
      ...get().tickets.find((t) => t.ticketNumber === ticketNumber)!,
      fare: newFare
    })
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.ticketNumber === ticketNumber ? { ...t, status: 'exchanged' as const } : t
      )
    }))
    return newTicket
  },
  
  issueEMD: (emd) => {
    const newEMD: EMD = {
      emdNumber: emd.emdNumber || `176-${Math.random().toString().substr(2, 10)}`,
      issuedAt: new Date().toISOString(),
      status: 'active',
      ...emd
    }
    set((state) => ({ emds: [...state.emds, newEMD] }))
    return newEMD
  },
  
  voidEMD: (emdNumber) => {
    set((state) => ({
      emds: state.emds.map((e) =>
        e.emdNumber === emdNumber ? { ...e, status: 'void' as const } : e
      )
    }))
    return get().emds.find((e) => e.emdNumber === emdNumber)!
  },
  
  // DCS Actions
  createCheckIn: (checkIn) => {
    const newCheckIn: CheckInRecord = {
      id: generateId(),
      checkInTime: new Date().toISOString(),
      boardingPassIssued: false,
      documentsVerified: false,
      visaValid: false,
      passportValid: false,
      bagsChecked: 0,
      status: 'checked-in',
      ...checkIn
    }
    set((state) => ({ checkInRecords: [...state.checkInRecords, newCheckIn] }))
    return newCheckIn
  },
  
  updateBoarding: (flightNumber, date, updates) => {
    set((state) => ({
      boardingRecords: state.boardingRecords.map((b) =>
        b.flightNumber === flightNumber && b.date === date
          ? { ...b, ...updates }
          : b
      )
    }))
    return get().boardingRecords.find(
      (b) => b.flightNumber === flightNumber && b.date === date
    )!
  },
  
  generateLoadSheet: (flightNumber, date) => {
    const loadSheet: LoadSheet = {
      flightNumber,
      date,
      aircraftRegistration: 'N12345',
      aircraftType: 'B737-800',
      totalWeight: 70000,
      passengerWeight: 12000,
      cargoWeight: 5000,
      baggageWeight: 3000,
      fuelWeight: 15000,
      zeroFuelWeight: 55000,
      takeoffWeight: 70000,
      landingWeight: 55000,
      trimSetting: 5.2,
      centerOfGravity: '25.2% MAC',
      distribution: { forward: 28000, aft: 27000 },
      generatedAt: new Date().toISOString(),
      generatedBy: 'system'
    }
    set((state) => ({ loadSheets: [...state.loadSheets, loadSheet] }))
    return loadSheet
  },
  
  addBaggage: (baggage) => {
    const newBaggage: BaggageRecord = {
      tagNumber: baggage.tagNumber || `BG${Math.random().toString().substr(2, 8)}`,
      routing: [],
      interline: false,
      fee: 0,
      feePaid: false,
      status: 'checked',
      ...baggage
    }
    set((state) => ({ baggageRecords: [...state.baggageRecords, newBaggage] }))
    return newBaggage
  },
  
  // Flight Operations Actions
  createFlightSchedule: (schedule) => {
    const newSchedule: FlightSchedule = {
      id: generateId(),
      status: 'active',
      slot: {
        origin: '',
        destination: '',
        slotTime: '',
        slotOwner: ''
      },
      frequencies: 1,
      ...schedule
    }
    set((state) => ({ flightSchedules: [...state.flightSchedules, newSchedule] }))
    return newSchedule
  },
  
  updateFlightInstance: (id, updates) => {
    set((state) => ({
      flightInstances: state.flightInstances.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      )
    }))
    return get().flightInstances.find((f) => f.id === id)!
  },
  
  createDisruption: (disruption) => {
    const newDisruption: DisruptionEvent = {
      id: generateId(),
      impact: {
        passengers: 0,
        connections: 0,
        estimatedCost: 0
      },
      actions: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      ...disruption
    }
    set((state) => ({ disruptions: [...state.disruptions, newDisruption] }))
    return newDisruption
  },
  
  generateFlightRelease: (flightId) => {
    const release: FlightRelease = {
      id: generateId(),
      flightId,
      flightNumber: '',
      date: new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
      weather: {
        departure: '',
        enroute: '',
        destination: ''
      },
      notams: [],
      atcRestrictions: [],
      alternateAirports: [],
      fuelPlan: {
        trip: 0,
        reserve: 0,
        contingency: 0,
        extra: 0,
        total: 0
      },
      route: '',
      altitude: 35000,
      speed: 480,
      weight: 0,
      signature: ''
    }
    set((state) => ({ flightReleases: [...state.flightReleases, release] }))
    return release
  },
  
  // Crew Actions
  addCrewMember: (crew) => {
    const newCrew: CrewMember = {
      id: generateId(),
      employeeNumber: crew.employeeNumber || `EMP${Math.random().toString().substr(2, 6)}`,
      status: 'active',
      hoursFlown: 0,
      hoursThisMonth: 0,
      hoursLast30Days: 0,
      language: ['en'],
      ...crew
    }
    set((state) => ({ crewMembers: [...state.crewMembers, newCrew] }))
    return newCrew
  },
  
  assignCrewSchedule: (schedule) => {
    const newSchedule: CrewSchedule = {
      id: generateId(),
      status: 'scheduled',
      dutyHours: 0,
      ...schedule
    }
    set((state) => ({ crewSchedules: [...state.crewSchedules, newSchedule] }))
    return newSchedule
  },
  
  createCrewPairing: (pairing) => {
    const newPairing: CrewPairing = {
      id: generateId(),
      pairingNumber: pairing.pairingNumber || `PR${Math.random().toString().substr(2, 6)}`,
      totalFlightTime: 0,
      totalDutyTime: 0,
      restPeriods: [],
      deadhead: false,
      overnightStops: 0,
      hotels: [],
      cost: 0,
      compliant: true,
      ...pairing
    }
    set((state) => ({ crewPairings: [...state.crewPairings, newPairing] }))
    return newPairing
  },
  
  // MRO Actions
  createMaintenanceRecord: (record) => {
    const newRecord: MaintenanceRecord = {
      id: generateId(),
      workOrderNumber: `WO${Math.random().toString().substr(2, 8)}`,
      status: 'pending',
      tasks: [],
      partsUsed: [],
      laborHours: 0,
      cost: 0,
      signOff: {
        mechanic: '',
        inspector: '',
        timestamp: ''
      },
      ...record
    }
    set((state) => ({ maintenanceRecords: [...state.maintenanceRecords, newRecord] }))
    return newRecord
  },
  
  updatePart: (partNumber, updates) => {
    set((state) => ({
      parts: state.parts.map((p) =>
        p.partNumber === partNumber ? { ...p, ...updates } : p
      )
    }))
    return get().parts.find((p) => p.partNumber === partNumber)!
  },
  
  trackComponent: (component) => {
    const newComponent: Component = {
      id: generateId(),
      installedAt: new Date().toISOString(),
      cycleCount: 0,
      hoursSinceNew: 0,
      timeSinceOverhaul: 0,
      condition: 'serviceable',
      lastInspection: new Date().toISOString(),
      nextInspection: '',
      ...component
    }
    set((state) => ({ components: [...state.components, newComponent] }))
    return newComponent
  },
  
  // Revenue Management Actions
  addFareBasis: (fare) => {
    const newFare: FareBasis = {
      code: fare.code || `FARE${Math.random().toString().substr(2, 4)}`,
      cabin: 'economy',
      fareFamily: 'standard',
      currency: 'USD',
      advancePurchase: 0,
      minStay: '0',
      maxStay: '365',
      changeable: true,
      changeFee: 0,
      refundable: true,
      refundFee: 0,
      seasonality: [],
      routing: '',
      blackouts: [],
      effectiveDate: new Date().toISOString(),
      ...fare
    }
    set((state) => ({ fareBasis: [...state.fareBasis, newFare] }))
    return newFare
  },
  
  updateRevenueData: (route, date, data) => {
    set((state) => {
      const existingIndex = state.revenueData.findIndex(
        (r) => r.route === route && r.date === date
      )
      if (existingIndex >= 0) {
        const updated = [...state.revenueData]
        updated[existingIndex] = { ...updated[existingIndex], ...data }
        return { revenueData: updated }
      }
      return {
        revenueData: [
          ...state.revenueData,
          {
            route,
            origin: '',
            destination: '',
            date,
            flightNumber: '',
            passengers: 0,
            loadFactor: 0,
            revenue: 0,
            yield: 0,
            rask: 0,
            cargoRevenue: 0,
            ancillaryRevenue: 0,
            totalRevenue: 0,
            costs: 0,
            profit: 0,
            margin: 0,
            forecast: {
              predictedLoad: 0,
              predictedRevenue: 0,
              confidence: 0,
              demandTrend: 'stable',
              recommendedActions: []
            },
            ...data
          }
        ]
      }
    })
    return get().revenueData.find(
      (r) => r.route === route && r.date === date
    )!
  },
  
  // Agency Actions
  addAgency: (agency) => {
    const newAgency: Agency = {
      id: generateId(),
      code: agency.code || `AGT${Math.random().toString().substr(2, 4)}`,
      status: 'active',
      tier: 'standard',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: ''
      },
      contact: {
        primaryContact: '',
        email: '',
        phone: ''
      },
      credit: {
        limit: 0,
        used: 0,
        available: 0,
        currency: 'USD',
        terms: 30,
        autoBlock: false,
        autoBlockThreshold: 90
      },
      commission: {
        standard: 5,
        overrides: [],
        volumeBonus: []
      },
      permissions: {
        canBook: true,
        canTicket: true,
        canRefund: true,
        canExchange: true,
        canViewFares: true,
        canViewAllFares: false,
        canCreatePNR: true,
        canModifyPNR: true,
        canCancelPNR: true,
        maxBookingsPerDay: 100,
        maxPassengersPerBooking: 9,
        restrictedRoutes: [],
        allowedRoutes: [],
        paymentMethods: ['cash', 'credit_card']
      },
      performance: {
        totalBookings: 0,
        totalRevenue: 0,
        cancellationRate: 0,
        noShowRate: 0,
        lastBooking: ''
      },
      wallet: {
        balance: 0,
        currency: 'USD',
        transactions: []
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ...agency
    }
    set((state) => ({ agencies: [...state.agencies, newAgency] }))
    return newAgency
  },
  
  updateAgencyCredit: (agencyId, amount) => {
    set((state) => ({
      agencies: state.agencies.map((a) =>
        a.id === agencyId
          ? {
              ...a,
              credit: {
                ...a.credit,
                used: a.credit.used + amount,
                available: a.credit.available - amount
              }
            }
          : a
      )
    }))
    return get().agencies.find((a) => a.id === agencyId)!
  },
  
  issueADM: (adm) => {
    const newADM: ADM = {
      id: generateId(),
      number: `ADM${Math.random().toString().substr(2, 8)}`,
      ticketNumbers: [],
      pnrNumbers: [],
      status: 'issued',
      issuedDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: [],
      ...adm
    }
    set((state) => ({ adms: [...state.adms, newADM] }))
    return newADM
  },
  
  resolveADM: (admId, resolution) => {
    set((state) => ({
      adms: state.adms.map((a) =>
        a.id === admId
          ? {
              ...a,
              status: 'upheld' as const,
              resolution,
              resolvedAt: new Date().toISOString()
            }
          : a
      )
    }))
    return get().adms.find((a) => a.id === admId)!
  },
  
  // CRM Actions
  addCustomer: (customer) => {
    const newCustomer: CustomerProfile = {
      id: generateId(),
      contact: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: ''
        }
      },
      documents: {},
      loyalty: {
        memberNumber: `FF${Math.random().toString().substr(2, 10)}`,
        tier: 'base',
        pointsBalance: 0,
        pointsEarned: 0,
        pointsRedeemed: 0,
        tierPoints: 0,
        nextTierPoints: 0,
        nextTier: 'silver',
        joinDate: new Date().toISOString(),
        status: 'active',
        benefits: []
      },
      preferences: {
        seatPreference: [],
        mealPreference: 'standard',
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          push: false
        },
        specialAssistance: []
      },
      travelHistory: {
        flights: []
      },
      segments: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      ...customer
    }
    set((state) => ({ customerProfiles: [...state.customerProfiles, newCustomer] }))
    return newCustomer
  },
  
  updateCustomerPreferences: (customerId, preferences) => {
    set((state) => ({
      customerProfiles: state.customerProfiles.map((c) =>
        c.id === customerId ? { ...c, preferences: { ...c.preferences, ...preferences } } : c
      )
    }))
    return get().customerProfiles.find((c) => c.id === customerId)!
  },
  
  createCampaign: (campaign) => {
    const newCampaign: Campaign = {
      id: generateId(),
      status: 'draft',
      targetSegments: [],
      targetTiers: [],
      message: {
        subject: '',
        body: '',
        template: ''
      },
      schedule: {
        startDate: new Date().toISOString(),
        sendTime: '09:00',
        frequency: 'once'
      },
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        unsubscribed: 0
      },
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      ...campaign
    }
    set((state) => ({ campaigns: [...state.campaigns, newCampaign] }))
    return newCampaign
  },
  
  logComplaint: (complaint) => {
    const newComplaint: Complaint = {
      id: generateId(),
      status: 'open',
      severity: 'medium',
      channel: 'web',
      priority: 3,
      sla: '48 hours',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      followUpRequired: false,
      ...complaint
    }
    set((state) => ({ complaints: [...state.complaints, newComplaint] }))
    return newComplaint
  },
  
  // Analytics Actions
  updateKPIDashboard: (period) => {
    set((state) => ({
      kpiDashboard: {
        ...state.kpiDashboard,
        period: period as any,
        metrics: {
          ...state.kpiDashboard.metrics,
          bookings: { total: state.pnrs.length, change: 12, trend: 'up' },
          passengers: { total: state.pnrs.reduce((sum, p) => sum + p.passengers.length, 0), change: 8, trend: 'up' },
          revenue: { total: state.tickets.reduce((sum, t) => sum + t.fare.total, 0), change: 15, trend: 'up' },
          loadFactor: { value: 82.5, change: 2.3, trend: 'up' },
          yield: { value: 0.12, change: -0.01, trend: 'down' },
          ancillaryRevenue: { total: state.emds.reduce((sum, e) => sum + e.amount, 0), change: 20, trend: 'up' },
          onTimePerformance: { value: 91.2, change: 1.5, trend: 'up' },
          cancellations: { count: state.pnrs.filter(p => p.status === 'cancelled').length, rate: 2.1, change: -0.5, trend: 'down' }
        }
      }
    }))
  },
  
  // Security Actions
  addUser: (user) => {
    const newUser: User = {
      id: generateId(),
      permissions: [],
      status: 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      mfaEnabled: false,
      sessions: [],
      ...user
    }
    set((state) => ({ users: [...state.users, newUser] }))
    return newUser
  },
  
  logAudit: (log) => {
    const newLog: AuditLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      result: 'success',
      ...log
    }
    set((state) => ({ auditLogs: [...state.auditLogs, newLog] }))
    return newLog
  },
  
  reportSecurityEvent: (event) => {
    const newEvent: SecurityEvent = {
      id: generateId(),
      severity: 'medium',
      status: 'open',
      timestamp: new Date().toISOString(),
      ...event
    }
    set((state) => ({ securityEvents: [...state.securityEvents, newEvent] }))
    return newEvent
  },
  
  // Integration Actions
  addIntegration: (integration) => {
    const newIntegration: Integration = {
      id: generateId(),
      credentials: {},
      configuration: {},
      lastSync: new Date().toISOString(),
      lastSyncStatus: 'success',
      metrics: {
        requestsToday: 0,
        requestsTotal: 0,
        errorsToday: 0,
        errorsTotal: 0,
        averageResponseTime: 0
      },
      webhooks: [],
      ...integration
    }
    set((state) => ({ integrations: [...state.integrations, newIntegration] }))
    return newIntegration
  },
  
  triggerWebhook: (integrationId, event) => {
    console.log(`Triggering webhook for integration ${integrationId} with event ${event}`)
  },
  
  // Cargo Actions
  createCargoBooking: (booking) => {
    const newBooking: CargoBooking = {
      id: generateId(),
      awbNumber: booking.awbNumber || `176-${Math.random().toString().substr(2, 10)}`,
      goods: {
        pieces: 0,
        weight: 0,
        volume: 0,
        weightUnit: 'kg',
        dangerousGoods: false,
        perishable: false,
        temperatureControlled: false,
        specialHandling: [],
        ...booking.goods
      },
      charges: {
        freight: 0,
        fuelSurcharge: 0,
        securitySurcharge: 0,
        otherCharges: 0,
        total: 0,
        currency: 'USD',
        prepaid: false,
        collect: false
      },
      status: 'booked',
      bookedAt: new Date().toISOString(),
      bookedBy: 'system',
      tracking: [],
      ...booking
    }
    set((state) => ({ cargoBookings: [...state.cargoBookings, newBooking] }))
    return newBooking
  },
  
  updateULD: (uldNumber, updates) => {
    set((state) => ({
      ulds: state.ulds.map((u) =>
        u.uldNumber === uldNumber ? { ...u, ...updates } : u
      )
    }))
    return get().ulds.find((u) => u.uldNumber === uldNumber)!
  },
  
  // Sustainability Actions
  recordSustainabilityMetrics: (metrics) => {
    const newMetrics: SustainabilityMetrics = {
      period: metrics.period || new Date().toISOString().split('T')[0],
      flights: 0,
      fuelConsumed: 0,
      co2Emissions: 0,
      co2PerPaxKm: 0,
      co2PerTonneKm: 0,
      efficiency: 0,
      carbonOffsetsSold: 0,
      carbonOffsetsRetired: 0,
      renewableEnergy: 0,
      wasteRecycled: 0,
      targets: {
        fuelEfficiency: { current: 0, target: 0, year: 2025 },
        co2Reduction: { current: 0, target: 0, year: 2025 },
        renewableEnergy: { current: 0, target: 0, year: 2025 }
      },
      initiatives: [],
      ...metrics
    }
    set((state) => ({ sustainabilityMetrics: [...state.sustainabilityMetrics, newMetrics] }))
    return newMetrics
  },
  
  sellCarbonOffset: (offsetId, quantity) => {
    set((state) => ({
      carbonOffsets: state.carbonOffsets.map((o) =>
        o.id === offsetId
          ? { ...o, sold: o.sold + quantity, available: o.available - quantity }
          : o
      )
    }))
    return get().carbonOffsets.find((o) => o.id === offsetId)!
  },
  
  // AI Actions
  addAIModel: (model) => {
    const newModel: AIModel = {
      id: generateId(),
      status: 'deployed',
      version: '1.0',
      accuracy: 0,
      lastTrained: new Date().toISOString(),
      nextTraining: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: [],
      performance: {
        precision: 0,
        recall: 0,
        f1Score: 0,
        auc: 0
      },
      ...model
    }
    set((state) => ({ aiModels: [...state.aiModels, newModel] }))
    return newModel
  },
  
  generatePrediction: (modelId, input) => {
    const prediction: AIPrediction = {
      modelId,
      modelName: get().aiModels.find((m) => m.id === modelId)?.name || '',
      type: '',
      timestamp: new Date().toISOString(),
      input,
      output: {},
      confidence: 0.85,
      implemented: false
    }
    set((state) => ({ aiPredictions: [...state.aiPredictions, prediction] }))
    return prediction
  },
  
  createAutomationRule: (rule) => {
    const newRule: AutomationRule = {
      id: generateId(),
      status: 'active',
      priority: 'medium',
      executionCount: 0,
      successRate: 100,
      lastExecuted: new Date().toISOString(),
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      trigger: {
        type: 'event'
      },
      actions: [],
      ...rule
    }
    set((state) => ({ automationRules: [...state.automationRules, newRule] }))
    return newRule
  }
}))
