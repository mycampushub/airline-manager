import type {
  PNR,
  Ticket,
  Passenger,
  FlightSegment,
  FareQuote,
  CheckInRecord,
  BaggageRecord,
  FlightInstance,
  CrewMember,
  CrewSchedule,
  MaintenanceRecord,
  CargoBooking,
  CustomerProfile,
  Agency,
  ADM,
  AncillaryProduct,
  RevenueData,
  FareBasis,
  Integration,
  AIPrediction,
  SustainabilityMetrics,
  AutomationRule,
  ULD
} from './store';

// ============= CONSTANTS =============

const AIRPORTS = ['JFK', 'LHR', 'LAX', 'TYO', 'SIN', 'DXB', 'SFO', 'HKG', 'FRA', 'PAR', 'SYD', 'MIA', 'ORD', 'CDG', 'BOM'];
const AIRCRAFT_REGISTRATIONS = ['N12345', 'N67890', 'N24680', 'N13579', 'N86420', 'N11223', 'N44556', 'N77889', 'N99001', 'N33445', 'N55667', 'N77880', 'N99002', 'N22334', 'N44557'];
const AIRCRAFT_TYPES = ['B777-300ER', 'B787-9', 'A350-900', 'A380-800', 'B737-800', 'A320neo', 'B777-200LR', 'A330-300'];
const EMPLOYEE_IDS = ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005', 'EMP006', 'EMP007', 'EMP008', 'EMP009', 'EMP010', 'EMP011', 'EMP012', 'EMP013', 'EMP014', 'EMP015'];
const FIRST_NAMES = ['James', 'Emma', 'Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Lisa', 'William', 'Maria', 'Richard', 'Patricia', 'Joseph', 'Linda', 'Thomas', 'Elizabeth', 'Charles', 'Susan', 'Christopher', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Helen', 'Mark', 'Sandra', 'Donald', 'Carol'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const AGENCY_NAMES = ['Global Travel Services', 'Wanderlust Travel', 'Business Trips Inc', 'Luxury Vacations', 'Quick Booking Agency', 'Corporate Travel Solutions', 'Adventure Works', 'Sky High Travel', 'Prime Booking', 'Elite Travel Partners', 'Worldwide Voyages', 'Flight Masters', 'Ticket Express', 'Voyager Travel', 'Horizon Travel Group'];

// ============= HELPER FUNCTIONS =============

function generateId(prefix: string, index: number): string {
  return `${prefix}${String(index + 1).padStart(4, '0')}`;
}

function generatePNRNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

function generateFlightNumber(prefix: string, index: number): string {
  return `${prefix}${String(index + 1).padStart(3, '0')}`;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

function generateDate(offsetDays: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDate(date);
}

function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// ============= GENERATE FLIGHT INSTANCES =============

const flightInstances: FlightInstance[] = [];

const flightRoutes = [
  { origin: 'JFK', destination: 'LHR', duration: 7 },
  { origin: 'JFK', destination: 'PAR', duration: 7.5 },
  { origin: 'LAX', destination: 'TYO', duration: 11 },
  { origin: 'SIN', destination: 'SYD', duration: 8 },
  { origin: 'DXB', destination: 'LHR', duration: 7 },
  { origin: 'SFO', destination: 'HKG', duration: 14 },
  { origin: 'FRA', destination: 'JFK', duration: 9 },
  { origin: 'LHR', destination: 'DXB', duration: 7 },
  { origin: 'TYO', destination: 'LAX', duration: 10 },
  { origin: 'SYD', destination: 'SIN', duration: 8 },
  { origin: 'HKG', destination: 'SFO', duration: 12 },
  { origin: 'PAR', destination: 'JFK', duration: 8 },
  { origin: 'BOM', destination: 'DXB', duration: 3 },
  { origin: 'DXB', destination: 'BOM', duration: 3 },
  { origin: 'MIA', destination: 'JFK', duration: 3 }
];

for (let i = 0; i < 35; i++) {
  const route = flightRoutes[i % flightRoutes.length];
  const flightNumber = generateFlightNumber('AA', 1000 + i);
  const date = generateDate(i % 5);
  const departureDateTime = new Date(`${date}T${randomInt(6, 22).toString().padStart(2, '0')}:00:00Z`);
  const arrivalDateTime = addHours(departureDateTime, route.duration);

  flightInstances.push({
    id: generateId('FLT', i),
    scheduleId: generateId('SCH', i),
    flightNumber: flightNumber,
    date: date,
    origin: route.origin,
    destination: route.destination,
    scheduledDeparture: formatTime(departureDateTime),
    scheduledArrival: formatTime(arrivalDateTime),
    estimatedDeparture: formatTime(departureDateTime),
    estimatedArrival: formatTime(arrivalDateTime),
    aircraftRegistration: AIRCRAFT_REGISTRATIONS[i % AIRCRAFT_REGISTRATIONS.length],
    aircraftType: AIRCRAFT_TYPES[i % AIRCRAFT_TYPES.length],
    captain: `Capt. ${randomFromArray(FIRST_NAMES)} ${randomFromArray(LAST_NAMES)}`,
    firstOfficer: `FO ${randomFromArray(FIRST_NAMES)} ${randomFromArray(LAST_NAMES)}`,
    cabinCrew: EMPLOYEE_IDS.slice(0, randomInt(8, 12)),
    status: ['scheduled', 'delayed', 'departed', 'arrived'][i % 4] as any,
    delayCode: i % 7 === 0 ? 'WX' : undefined,
    delayReason: i % 7 === 0 ? 'Weather conditions' : undefined,
    notams: ['Runway closure', 'ATC restrictions', 'Security measures'].slice(0, randomInt(0, 2)),
    loadFactor: randomInt(65, 98),
    passengers: randomInt(200, 450),
    cargo: randomInt(1000, 15000),
    mail: randomInt(100, 500),
    fuel: randomInt(30000, 80000)
  });
}

// ============= GENERATE CREW MEMBERS =============

const crewMembers: CrewMember[] = [];

for (let i = 0; i < 35; i++) {
  const position = i < 5 ? 'captain' : i < 10 ? 'first_officer' : i < 15 ? 'purser' : 'flight_attendant';
  crewMembers.push({
    id: generateId('CREW', i),
    employeeNumber: EMPLOYEE_IDS[i % EMPLOYEE_IDS.length],
    firstName: FIRST_NAMES[i % FIRST_NAMES.length],
    lastName: LAST_NAMES[i % LAST_NAMES.length],
    position: position as any,
    base: randomFromArray(['JFK', 'LAX', 'LHR', 'SIN', 'DXB']),
    qualifications: position === 'captain' || position === 'first_officer'
      ? ['B777', 'B787', 'A350', 'A380']
      : ['Safety', 'First Aid', 'Service', 'Security'],
    licenseNumber: `LIC${randomInt(100000, 999999)}`,
    licenseExpiry: '2026-12-31',
    medicalCertificate: `MED${randomInt(100000, 999999)}`,
    medicalExpiry: '2025-06-30',
    passportNumber: `P${randomInt(1000000, 9999999)}`,
    passportExpiry: '2030-01-01',
    dateOfBirth: '1980-01-01',
    nationality: 'US',
    email: `${FIRST_NAMES[i % FIRST_NAMES.length].toLowerCase()}.${LAST_NAMES[i % LAST_NAMES.length].toLowerCase()}@airline.com`,
    phone: `+1-555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
    status: 'active',
    currentDuty: i < 10 ? flightInstances[i].flightNumber : undefined,
    hoursFlown: randomInt(5000, 15000),
    hoursThisMonth: randomInt(20, 80),
    hoursLast30Days: randomInt(50, 150),
    domicile: randomFromArray(['JFK', 'LAX', 'LHR']),
    language: ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'].slice(0, randomInt(1, 4))
  });
}

// ============= GENERATE CREW SCHEDULES =============

const crewSchedules: CrewSchedule[] = [];

for (let i = 0; i < 35; i++) {
  const flight = flightInstances[i % flightInstances.length];
  const route = flightRoutes[i % flightRoutes.length];
  const startDate = new Date(flight.date);
  const departureTime = new Date(`${flight.date}T${flight.scheduledDeparture}:00Z`);

  crewSchedules.push({
    id: generateId('CS', i),
    crewId: crewMembers[i % crewMembers.length].id,
    type: 'flight',
    startDate: flight.date,
    endDate: flight.date,
    startTime: flight.scheduledDeparture,
    endTime: flight.scheduledArrival,
    flightId: flight.id,
    flightNumber: flight.flightNumber,
    route: `${flight.origin}-${flight.destination}`,
    position: crewMembers[i % crewMembers.length].position,
    reportTime: formatTime(addHours(departureTime, -2)),
    releaseTime: formatTime(addHours(departureTime, route.duration + 1)),
    dutyHours: route.duration + 3,
    status: ['scheduled', 'in_progress', 'completed'][i % 3] as any,
    hotel: i % 3 === 0 ? {
      name: 'Airport Hilton',
      address: '123 Airport Blvd',
      phone: '+1-555-100-2000',
      checkIn: formatTime(addHours(departureTime, route.duration + 2)),
      checkOut: formatTime(addHours(departureTime, route.duration + 14))
    } : undefined,
    transport: i % 4 === 0 ? {
      type: 'hotel_shuttle',
      pickup: flight.destination,
      dropoff: 'Airport Hilton'
    } : undefined
  });
}

// ============= GENERATE CUSTOMER PROFILES =============

const customerProfiles: CustomerProfile[] = [];

for (let i = 0; i < 35; i++) {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[i % LAST_NAMES.length];
  const tier = i < 5 ? 'platinum' : i < 12 ? 'gold' : i < 22 ? 'silver' : 'base';

  customerProfiles.push({
    id: generateId('CUST', i),
    title: ['Mr.', 'Ms.', 'Mrs.', 'Dr.'][i % 4],
    firstName: firstName,
    lastName: lastName,
    dateOfBirth: '1985-05-15',
    nationality: 'US',
    gender: i % 2 === 0 ? 'male' : 'female',
    contact: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+1-555-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      secondaryPhone: `+1-555-${randomInt(200, 999)}-${randomInt(1000, 9999)}`,
      address: {
        street: `${randomInt(100, 9999)} Main St`,
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: String(randomInt(10000, 99999))
      }
    },
    documents: {
      passportNumber: `P${randomInt(10000000, 99999999)}`,
      passportExpiry: '2030-12-31',
      nationalId: `SSN${randomInt(100, 999)}-${randomInt(10, 99)}-${randomInt(1000, 9999)}`
    },
    loyalty: {
      memberNumber: `FF${String(randomInt(1000000, 9999999))}`,
      tier: tier as any,
      pointsBalance: randomInt(5000, 500000),
      pointsEarned: randomInt(100000, 1000000),
      pointsRedeemed: randomInt(10000, 200000),
      tierPoints: randomInt(5000, 50000),
      nextTierPoints: 75000,
      nextTier: tier === 'platinum' ? 'elite' : tier === 'gold' ? 'platinum' : tier === 'silver' ? 'gold' : 'silver',
      joinDate: '2015-03-15',
      status: 'active',
      benefits: tier === 'platinum'
        ? ['Lounge Access', 'Priority Check-in', 'Extra Baggage', 'Priority Boarding', 'Complimentary Upgrades']
        : tier === 'gold'
        ? ['Lounge Access', 'Priority Check-in', 'Extra Baggage', 'Priority Boarding']
        : tier === 'silver'
        ? ['Priority Check-in', 'Extra Baggage']
        : ['Priority Check-in']
    },
    preferences: {
      seatPreference: [['Window'], ['Aisle'], ['Front'], ['Emergency Exit']][i % 4],
      mealPreference: ['Vegetarian', 'Halal', 'Kosher', 'Gluten-Free', 'Standard'][i % 5],
      language: 'English',
      notifications: {
        email: true,
        sms: i % 2 === 0,
        push: true
      },
      specialAssistance: i % 8 === 0 ? ['Wheelchair'] : []
    },
    travelHistory: {
      totalFlights: randomInt(10, 200),
      totalMiles: randomInt(10000, 200000),
      totalSegments: randomInt(15, 300),
      totalSpend: randomInt(5000, 50000),
      averageSpendPerTrip: randomInt(400, 1500),
      favoriteRoutes: ['JFK-LHR', 'LAX-TYO', 'SFO-HKG', 'JFK-PAR', 'SIN-SYD'].slice(0, randomInt(1, 3)),
      favoriteDestinations: ['LHR', 'TYO', 'HKG', 'PAR', 'SYD'].slice(0, randomInt(1, 3)),
      lastYearFlights: randomInt(5, 30),
      lastYearMiles: randomInt(5000, 50000),
      lastYearSpend: randomInt(2000, 15000),
      lifetimeValue: randomInt(10000, 100000),
      churnRisk: i < 15 ? 'low' : i < 28 ? 'medium' : 'high',
      nextBestAction: i < 15 ? 'Send Upgrade Offer' : i < 28 ? 'Send Promotional Email' : 'Send Retention Offer'
    },
    segments: [
      {
        segment: i < 10 ? 'business' : i < 20 ? 'vip' : 'frequent_flyer',
        confidence: randomInt(70, 95) / 100,
        assignedAt: '2024-01-15',
        criteria: ['High spend', 'Frequency', 'Loyalty Tier']
      }
    ],
    status: 'active',
    createdAt: '2015-03-15',
    lastModified: '2024-01-20',
    lastFlight: generateDate(-randomInt(1, 30))
  });
}

// ============= GENERATE AGENCIES =============

const agencies: Agency[] = [];

for (let i = 0; i < 35; i++) {
  const tier = i < 5 ? 'platinum' : i < 12 ? 'gold' : i < 22 ? 'silver' : 'bronze';
  const agencyName = AGENCY_NAMES[i % AGENCY_NAMES.length];

  agencies.push({
    id: generateId('AGENCY', i),
    code: `AG${String(i + 1).padStart(4, '0')}`,
    name: agencyName,
    type: ['iata', 'ota', 'corporate', 'tmc', 'iata'][i % 5] as any,
    iataNumber: i % 2 === 0 ? `IATA${randomInt(100000, 999999)}` : undefined,
    status: 'active',
    tier: tier as any,
    parentAgencyId: i % 7 === 0 ? generateId('AGENCY', Math.floor(i / 7)) : undefined,
    branchCode: i % 7 !== 0 ? `BR${i}` : undefined,
    address: {
      street: `${randomInt(100, 9999)} Business Ave`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'][i % 5],
      state: ['NY', 'CA', 'IL', 'TX', 'FL'][i % 5],
      country: 'USA',
      postalCode: String(randomInt(10000, 99999))
    },
    contact: {
      primaryContact: `${randomFromArray(FIRST_NAMES)} ${randomFromArray(LAST_NAMES)}`,
      email: `contact@agency${i + 1}.com`,
      phone: `+1-555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
      fax: `+1-555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`
    },
    credit: {
      limit: tier === 'platinum' ? 500000 : tier === 'gold' ? 250000 : tier === 'silver' ? 100000 : 50000,
      used: randomInt(10000, 100000),
      available: tier === 'platinum' ? 400000 : tier === 'gold' ? 200000 : tier === 'silver' ? 80000 : 40000,
      currency: 'USD',
      terms: 30,
      autoBlock: true,
      autoBlockThreshold: 90
    },
    commission: {
      standard: tier === 'platinum' ? 12 : tier === 'gold' ? 10 : tier === 'silver' ? 8 : 5,
      overrides: [
        {
          route: 'JFK-LHR',
          origin: 'JFK',
          destination: 'LHR',
          cabin: 'business',
          fareClass: 'J',
          rate: tier === 'platinum' ? 15 : 12,
          effectiveFrom: '2024-01-01'
        }
      ],
      volumeBonus: [
        {
          tier: 'Gold',
          minRevenue: 500000,
          bonusRate: 2,
          period: 'quarterly'
        },
        {
          tier: 'Platinum',
          minRevenue: 1000000,
          bonusRate: 3,
          period: 'quarterly'
        }
      ]
    },
    permissions: {
      canBook: true,
      canTicket: true,
      canRefund: i < 25,
      canExchange: i < 25,
      canViewFares: true,
      canViewAllFares: i < 15,
      canCreatePNR: true,
      canModifyPNR: true,
      canCancelPNR: i < 25,
      maxBookingsPerDay: tier === 'platinum' ? 500 : tier === 'gold' ? 200 : 100,
      maxPassengersPerBooking: 9,
      restrictedRoutes: [],
      allowedRoutes: [],
      paymentMethods: ['credit_card', 'debit_card', 'agency_credit']
    },
    performance: {
      totalBookings: randomInt(100, 5000),
      totalRevenue: randomInt(50000, 5000000),
      cancellationRate: randomInt(2, 15) / 100,
      noShowRate: randomInt(1, 10) / 100,
      lastBooking: generateDate(-randomInt(0, 7))
    },
    wallet: {
      balance: randomInt(5000, 50000),
      currency: 'USD',
      transactions: [
        {
          id: generateId('TXN', 0),
          type: 'credit',
          amount: 10000,
          currency: 'USD',
          balanceAfter: 15000,
          description: 'Wallet top-up',
          reference: 'TOPUP001',
          createdAt: generateDate(-5)
        }
      ]
    },
    createdAt: '2018-06-01',
    lastModified: generateDate(-1)
  });
}

// ============= GENERATE ADMs =============

const adms: ADM[] = [];

const admTypes: ADM['type'][] = ['fare_discrepancy', 'refund_violation', 'ticketing_error', 'documentation', 'other'];
const admStatuses: ADM['status'][] = ['issued', 'disputed', 'upheld', 'waived', 'paid'];

for (let i = 0; i < 35; i++) {
  const agency = agencies[i % agencies.length];
  const admType = admTypes[i % admTypes.length];
  const status = admStatuses[i % admStatuses.length];
  const daysAgo = randomInt(1, 60);
  const amount = randomInt(500, 10000);

  const ticketNumbers = [
    `176-${randomInt(100000000, 999999999)}`,
    `176-${randomInt(100000000, 999999999)}`
  ].slice(0, randomInt(1, 3));

  const pnrNumbers = [
    generatePNRNumber(),
    generatePNRNumber()
  ].slice(0, randomInt(1, 3));

  const adm: ADM = {
    id: generateId('ADM', i),
    number: `ADM-2024-${String(i + 1).padStart(4, '0')}`,
    agencyId: agency.id,
    agencyCode: agency.code,
    type: admType,
    amount: amount,
    currency: 'USD',
    reason: [
      'Incorrect fare applied - booking in lower class than ticketed',
      'Refund processed outside ticket rules - non-refundable fare',
      'Duplicate ticket issued - both tickets need to be voided',
      'Missing documentation for passenger travel',
      'Schedule change not properly communicated to passenger',
      'Incorrect taxes and fees applied to ticket',
      'Ticket issued after flight departure',
      'Name change not permitted per fare rules',
      'Reissue without proper fare calculation',
      'Unauthorized discount applied to booking'
    ][i % 10],
    ticketNumbers: ticketNumbers,
    pnrNumbers: pnrNumbers,
    status: status,
    issuedDate: generateDate(-daysAgo),
    dueDate: generateDate(-(daysAgo - 30)),
    notes: []
  };

  // Add optional fields based on status
  if (status === 'disputed') {
    adm.disputedDate = generateDate(-(daysAgo - 5));
    adm.disputeReason = 'Agency disputes the charge with supporting documentation';
    adm.notes.push('Dispute documentation received', 'Under review by revenue team');
  } else if (status === 'paid') {
    adm.paidDate = generateDate(-(daysAgo - 25));
    adm.notes.push('Payment received in full', 'Case closed');
  } else if (status === 'upheld') {
    adm.notes.push('ADM upheld after review', 'Agency acknowledged error');
  }

  adms.push(adm);
}

// ============= GENERATE PNRs =============

const pnrs: PNR[] = [];

for (let i = 0; i < 35; i++) {
  const customer = customerProfiles[i % customerProfiles.length];
  const flight = flightInstances[i % flightInstances.length];
  const pnrNumber = generatePNRNumber();
  const isRoundTrip = i % 3 === 0;

  const departureDateTime = new Date(`${flight.date}T${flight.scheduledDeparture}:00Z`);
  const segments: FlightSegment[] = [
    {
      id: generateId('SEG', i * 2),
      flightNumber: flight.flightNumber,
      airlineCode: 'AA',
      origin: flight.origin,
      destination: flight.destination,
      departureDate: flight.date,
      departureTime: flight.scheduledDeparture,
      arrivalDate: flight.date,
      arrivalTime: flight.scheduledArrival,
      aircraftType: flight.aircraftType,
      fareClass: ['Y', 'B', 'M', 'K', 'L', 'J', 'C', 'D'][i % 8],
      fareBasis: ['YHE', 'BHE', 'MHE', 'KHE', 'LHE', 'JHE', 'CHE', 'DHE'][i % 8],
      status: 'confirmed',
      boardingClass: i < 10 ? 'business' : 'economy'
    }
  ];

  if (isRoundTrip) {
    const returnFlight = flightInstances[(i + 1) % flightInstances.length];
    segments.push({
      id: generateId('SEG', i * 2 + 1),
      flightNumber: returnFlight.flightNumber,
      airlineCode: 'AA',
      origin: returnFlight.origin,
      destination: returnFlight.destination,
      departureDate: returnFlight.date,
      departureTime: returnFlight.scheduledDeparture,
      arrivalDate: returnFlight.date,
      arrivalTime: returnFlight.scheduledArrival,
      aircraftType: returnFlight.aircraftType,
      fareClass: segments[0].fareClass,
      fareBasis: segments[0].fareBasis,
      status: 'confirmed',
      boardingClass: segments[0].boardingClass
    });
  }

  const passengers: Passenger[] = [
    {
      id: generateId('PAX', i),
      title: customer.title,
      firstName: customer.firstName,
      lastName: customer.lastName,
      dateOfBirth: customer.dateOfBirth,
      passportNumber: customer.documents.passportNumber,
      passportExpiry: customer.documents.passportExpiry,
      nationality: customer.nationality,
      frequentFlyerNumber: customer.loyalty.memberNumber,
      frequentFlyerProgram: 'AA',
      ssr: i % 5 === 0 ? ['VGML'] : [],
      seatPreferences: ['Window', 'Aisle', 'Front', 'Emergency Exit'][i % 4],
      mealPreference: customer.preferences.mealPreference
    }
  ];

  // Add companion for some bookings
  if (i % 4 === 0) {
    passengers.push({
      id: generateId('PAX', i + 1000),
      title: 'Mr.',
      firstName: FIRST_NAMES[(i + 1) % FIRST_NAMES.length],
      lastName: LAST_NAMES[(i + 1) % LAST_NAMES.length],
      dateOfBirth: '1988-08-20',
      passportNumber: `P${randomInt(10000000, 99999999)}`,
      passportExpiry: '2030-06-15',
      nationality: 'US',
      ssr: [],
      seatPreferences: 'Aisle',
      mealPreference: 'Standard'
    });
  }

  const baseFare = segments[0].boardingClass === 'business' ? 1200 : 450;
  const totalFare = baseFare * passengers.length * (isRoundTrip ? 2 : 1);

  pnrs.push({
    pnrNumber: pnrNumber,
    createdAt: generateDate(-randomInt(30, 90)),
    createdBy: 'WEB',
    status: 'ticketed',
    passengers: passengers,
    segments: segments,
    fareQuote: {
      baseFare: totalFare,
      taxes: Math.round(totalFare * 0.25),
      fees: Math.round(totalFare * 0.05),
      total: Math.round(totalFare * 1.3),
      currency: 'USD',
      fareRules: ['Non-refundable', 'Changes permitted with fee', 'Advance purchase required']
    },
    contactInfo: {
      email: customer.contact.email,
      phone: customer.contact.phone,
      address: `${customer.contact.address.street}, ${customer.contact.address.city}, ${customer.contact.address.state} ${customer.contact.address.postalCode}`
    },
    paymentInfo: {
      paymentMethod: 'credit_card',
      cardLastFour: String(randomInt(1000, 9999)),
      amount: Math.round(totalFare * 1.3),
      currency: 'USD'
    },
    bookingClass: segments[0].fareClass,
    agentId: agencies[i % agencies.length].code,
    agencyCode: agencies[i % agencies.length].code,
    corporateAccount: i % 6 === 0 ? 'CORP001' : undefined,
    timeLimit: generateDate(-randomInt(1, 10)),
    remarks: i % 5 === 0 ? ['Special meal requested', 'Wheelchair assistance needed'] : [],
    tickets: [],
    seats: passengers.map((_, idx) => `${segments[0].boardingClass === 'business' ? randomInt(1, 4) : randomInt(10, 35)}${['A', 'C', 'D', 'F', 'H', 'K'][idx % 6]}`),
    isGroup: false,
    groupSize: undefined,
    linkedPNRs: [],
    source: i % 3 === 0 ? 'mobile' : i % 3 === 1 ? 'web' : 'agent'
  });
}

// ============= GENERATE TICKETS =============

const tickets: Ticket[] = [];

let ticketNumberCounter = 1760000001;
for (let i = 0; i < 35; i++) {
  const pnr = pnrs[i % pnrs.length];
  const passenger = pnr.passengers![0];

  const ticket: Ticket = {
    ticketNumber: String(ticketNumberCounter++),
    pnrNumber: pnr.pnrNumber,
    passengerId: passenger.id,
    passengerName: `${passenger.title} ${passenger.firstName} ${passenger.lastName}`,
    issuedAt: generateDate(-randomInt(1, 30)),
    issuedBy: 'AA',
    status: 'open',
    fare: pnr.fareQuote,
    segments: pnr.segments,
    taxes: [
      { code: 'US', name: 'US Transportation Tax', amount: Math.round(pnr.fareQuote!.total * 0.1), currency: 'USD' },
      { code: 'XT', name: 'International Tax', amount: Math.round(pnr.fareQuote!.total * 0.05), currency: 'USD' },
      { code: 'AY', name: 'Passenger Facility Charge', amount: 4.50, currency: 'USD' }
    ],
    commission: {
      amount: Math.round(pnr.fareQuote!.total * 0.1),
      rate: 10,
      paidTo: pnr.agencyCode!
    },
    validationAirline: 'AA',
    interlinePartners: ['BA', 'QF', 'CX'],
    isCodeshare: false,
    operatingCarrier: 'AA',
    voidableUntil: generateDate(-randomInt(0, 1)),
    refundable: pnr.segments![0].fareClass === 'J' || pnr.segments![0].fareClass === 'C',
    changePenalty: pnr.segments![0].boardingClass === 'business' ? 200 : 100,
    fareRules: pnr.fareQuote!.fareRules
  };

  tickets.push(ticket);

  // Add ticket to PNR
  pnr.tickets = pnr.tickets || [];
  pnr.tickets.push(ticket);

  // Add companion ticket if exists
  if (pnr.passengers!.length > 1) {
    const companion = pnr.passengers![1];
    tickets.push({
      ...ticket,
      ticketNumber: String(ticketNumberCounter++),
      passengerId: companion.id,
      passengerName: `${companion.title} ${companion.firstName} ${companion.lastName}`
    });
    pnr.tickets.push({
      ...ticket,
      ticketNumber: String(ticketNumberCounter++),
      passengerId: companion.id,
      passengerName: `${companion.title} ${companion.firstName} ${companion.lastName}`
    });
  }
}

// ============= GENERATE CHECK-IN RECORDS =============

const checkInRecords: CheckInRecord[] = [];

for (let i = 0; i < 35; i++) {
  const pnr = pnrs[i % pnrs.length];
  const passenger = pnr.passengers![0];
  const flight = pnr.segments![0];
  const checkInMethods: Array<'web' | 'mobile' | 'kiosk' | 'counter'> = ['web', 'mobile', 'kiosk', 'counter'];

  checkInRecords.push({
    id: generateId('CI', i),
    pnrNumber: pnr.pnrNumber,
    ticketNumber: tickets[i % tickets.length].ticketNumber,
    passengerId: passenger.id,
    passengerName: `${passenger.firstName} ${passenger.lastName}`,
    flightNumber: flight.flightNumber,
    date: flight.departureDate,
    checkInTime: `${flight.departureDate}T${randomInt(18, 23).toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}:00Z`,
    checkInMethod: checkInMethods[i % 4],
    seatNumber: pnr.seats![0],
    boardingPassIssued: true,
    boardingPassData: {
      passNumber: `BP${String(i + 1).padStart(6, '0')}`,
      issuedAt: `${flight.departureDate}T${randomInt(18, 23).toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}:00Z`,
      barcode: `M1${pnr.pnrNumber}${flight.flightNumber}${pnr.seats![0]}`
    },
    documentsVerified: true,
    visaValid: true,
    passportValid: true,
    bagsChecked: randomInt(0, 3),
    status: ['checked-in', 'boarded', 'no-show'][i % 3] as any
  });
}

// ============= GENERATE BAGGAGE RECORDS =============

const baggageRecords: BaggageRecord[] = [];

for (let i = 0; i < 35; i++) {
  const pnr = pnrs[i % pnrs.length];
  const passenger = pnr.passengers![0];
  const flight = pnr.segments![0];
  const tagNumber = `AA${generateDate()}${randomInt(1000, 9999)}`;

  baggageRecords.push({
    tagNumber: tagNumber,
    pnrNumber: pnr.pnrNumber,
    ticketNumber: tickets[i % tickets.length].ticketNumber,
    passengerId: passenger.id,
    passengerName: `${passenger.firstName} ${passenger.lastName}`,
    flightNumber: flight.flightNumber,
    origin: flight.origin,
    destination: flight.destination,
    weight: randomInt(15, 32),
    pieces: randomInt(1, 3),
    status: ['checked', 'loaded', 'transferred', 'delivered'][i % 4] as any,
    routing: [flight.origin, flight.destination],
    interline: false,
    specialHandling: i % 6 === 0 ? ['fragile'] : i % 8 === 0 ? ['priority'] : undefined,
    mishandledAt: i % 15 === 0 ? flight.destination : undefined,
    resolvedAt: i % 15 === 0 ? generateDate(-1) : undefined,
    fee: randomInt(0, 100),
    feePaid: true
  });
}

// ============= GENERATE MAINTENANCE RECORDS =============

const maintenanceRecords: MaintenanceRecord[] = [];

for (let i = 0; i < 35; i++) {
  const aircraft = AIRCRAFT_REGISTRATIONS[i % AIRCRAFT_REGISTRATIONS.length];
  const aircraftType = AIRCRAFT_TYPES[i % AIRCRAFT_TYPES.length];
  const categories: Array<'a-check' | 'b-check' | 'c-check' | 'd-check' | 'line_maintenance'> = ['a-check', 'b-check', 'c-check', 'd-check', 'line_maintenance'];
  const types: Array<'scheduled' | 'unscheduled' | 'inspection' | 'modification' | 'repair'> = ['scheduled', 'unscheduled', 'inspection', 'modification', 'repair'];

  maintenanceRecords.push({
    id: generateId('MRO', i),
    aircraftRegistration: aircraft,
    aircraftType: aircraftType,
    type: types[i % 5] as any,
    category: categories[i % 5] as any,
    description: [
      'Routine A-check inspection',
      'Engine performance check',
      'Landing gear overhaul',
      'Avionics system upgrade',
      'Cabin interior refurbishment'
    ][i % 5],
    status: ['pending', 'in_progress', 'completed'][i % 3] as any,
    priority: i < 5 ? 'critical' : i < 15 ? 'high' : i < 25 ? 'medium' : 'low',
    scheduledStart: generateDate(-randomInt(1, 30)),
    scheduledEnd: generateDate(-randomInt(0, 25)),
    actualStart: i % 3 !== 0 ? generateDate(-randomInt(1, 30)) : undefined,
    actualEnd: i % 3 === 0 ? generateDate(-randomInt(0, 25)) : undefined,
    station: randomFromArray(['JFK', 'LAX', 'LHR', 'SIN', 'DXB']),
    hangar: `Hangar ${String.fromCharCode(65 + (i % 4))}`,
    assignedTo: EMPLOYEE_IDS.slice(0, randomInt(2, 5)),
    workOrderNumber: `WO${randomInt(100000, 999999)}`,
    tasks: [
      {
        id: generateId('TASK', i * 3),
        description: 'Visual inspection',
        status: 'completed',
        completedBy: 'EMP001',
        completedAt: generateDate(-2)
      },
      {
        id: generateId('TASK', i * 3 + 1),
        description: 'System check',
        status: i % 2 === 0 ? 'completed' : 'in_progress',
        completedBy: i % 2 === 0 ? 'EMP002' : undefined,
        completedAt: i % 2 === 0 ? generateDate(-1) : undefined
      },
      {
        id: generateId('TASK', i * 3 + 2),
        description: 'Final sign-off',
        status: 'pending'
      }
    ],
    partsUsed: [
      {
        partNumber: 'P1001',
        quantity: 2,
        cost: 1500
      },
      {
        partNumber: 'P1002',
        quantity: 1,
        cost: 3200
      }
    ],
    laborHours: randomInt(4, 48),
    cost: randomInt(5000, 50000),
    signOff: {
      mechanic: 'John Smith',
      inspector: 'Robert Johnson',
      timestamp: generateDate(-1)
    },
    adCompliance: [
      {
        adNumber: `AD-${randomInt(2020, 2024)}-${randomInt(10, 99)}`,
        title: 'Emergency equipment inspection',
        issuedDate: '2024-01-01',
        complianceDate: generateDate(-10),
        recurring: true,
        nextDue: generateDate(180),
        status: 'compliant'
      }
    ]
  });
}

// ============= GENERATE CARGO BOOKINGS =============

const cargoBookings: CargoBooking[] = [];

for (let i = 0; i < 35; i++) {
  const flight = flightInstances[i % flightInstances.length];
  const awbNumber = `176-${randomInt(1000000, 9999999)}`;

  cargoBookings.push({
    id: generateId('CARGO', i),
    awbNumber: awbNumber,
    shipper: {
      name: ['Global Export Corp', 'Tech Solutions Ltd', 'Pharma International', 'Fashion World Inc'][i % 4],
      address: '123 Business Park',
      contact: '+1-555-100-2000',
      accountNumber: `ACC${randomInt(10000, 99999)}`
    },
    consignee: {
      name: ['Import Masters Ltd', 'Retail Giants Inc', 'Medical Supplies Co', 'Electronics World'][i % 4],
      address: '456 Trade Center',
      contact: '+44-20-7000-8000'
    },
    flightDetails: {
      flightNumber: flight.flightNumber,
      date: flight.date,
      origin: flight.origin,
      destination: flight.destination,
      routing: [flight.origin, flight.destination]
    },
    goods: {
      description: i % 4 === 0 ? 'Electronics' : i % 4 === 1 ? 'Pharmaceuticals' : i % 4 === 2 ? 'Textiles' : 'General Cargo',
      pieces: randomInt(5, 50),
      weight: randomInt(100, 2000),
      volume: randomInt(2, 50),
      weightUnit: 'kg',
      dangerousGoods: i % 10 === 0,
      dgClass: i % 10 === 0 ? '3' : undefined,
      unNumber: i % 10 === 0 ? 'UN1993' : undefined,
      perishable: i % 5 === 0,
      temperatureControlled: i % 5 === 0,
      requiredTemperature: i % 5 === 0 ? 4 : undefined,
      specialHandling: i % 6 === 0 ? ['FRAGILE'] : i % 8 === 0 ? ['PER'] : []
    },
    charges: {
      freight: randomInt(500, 5000),
      fuelSurcharge: randomInt(100, 500),
      securitySurcharge: randomInt(50, 150),
      otherCharges: randomInt(0, 200),
      total: randomInt(650, 5850),
      currency: 'USD',
      prepaid: i % 2 === 0,
      collect: i % 2 !== 0
    },
    status: ['booked', 'accepted', 'received', 'loaded', 'in_transit', 'arrived', 'delivered'][i % 7] as any,
    bookedAt: generateDate(-randomInt(5, 30)),
    bookedBy: 'CARGO001',
    uld: i % 3 === 0 ? `ULD${String.fromCharCode(65 + (i % 5))}${randomInt(100, 999)}` : undefined,
    tracking: [
      {
        timestamp: generateDate(-5),
        location: flight.origin,
        status: 'Booked',
        userId: 'CARGO001'
      },
      {
        timestamp: generateDate(-3),
        location: flight.origin,
        status: 'Received',
        userId: 'WAREHOUSE01'
      }
    ]
  });
}

// ============= GENERATE ULDs =============

const ulds: ULD[] = [];

const uldTypes = [
  { type: 'AKE', length: 153, width: 156, height: 163, maxWeight: 1588 },
  { type: 'DPE', length: 200, width: 153, height: 163, maxWeight: 2268 },
  { type: 'ALP', length: 307, width: 234, height: 244, maxWeight: 6033 },
  { type: 'AAP', length: 318, width: 224, height: 244, maxWeight: 6033 },
  { type: 'AGA', length: 224, width: 318, height: 244, maxWeight: 6033 }
];

const uldOwners = ['SQ', 'LH', 'EK', 'CX', 'QR', 'BA', 'EY', 'NH'];

const uldLocations = [
  'SIN Cargo Terminal - Bay 1',
  'SIN Cargo Terminal - Bay 2',
  'LHR Cargo Facility - Zone A',
  'LHR Cargo Facility - Zone B',
  'JFK Cargo Center - Terminal 1',
  'JFK Cargo Center - Terminal 2',
  'DXB Cargo Village - Section 1',
  'HKG Air Cargo Terminal - Area A',
  'In Transit - SQ123',
  'In Transit - LH456',
  'In Transit - EK789',
  'In Transit - CX321',
  'Maintenance Facility - SIN',
  'Maintenance Facility - LHR'
];

for (let i = 0; i < 35; i++) {
  const uldType = uldTypes[i % uldTypes.length];
  const owner = uldOwners[i % uldOwners.length];
  const status = i % 8 === 0 ? 'unserviceable' : i % 4 === 0 ? 'repairable' : 'serviceable';
  const locationIndex = i % uldLocations.length;
  const location = uldLocations[locationIndex];
  const isInTransit = location.startsWith('In Transit');
  const flightMatch = location.match(/In Transit - ([A-Z0-9]+)/);
  const currentFlight = flightMatch ? flightMatch[1] : undefined;

  ulds.push({
    id: generateId('ULD', i),
    uldNumber: `${uldType.type}${String(randomInt(10000, 99999))}${['AA', 'BB', 'CC', 'DD', 'EE'][i % 5]}`,
    type: uldType.type,
    owner: owner,
    condition: status as 'serviceable' | 'repairable' | 'unserviceable',
    location: location,
    currentFlight: currentFlight,
    lastInspection: generateDate(-randomInt(10, 90)),
    nextInspectionDue: generateDate(randomInt(30, 180)),
    dimensions: {
      length: uldType.length,
      width: uldType.width,
      height: uldType.height,
      maxWeight: uldType.maxWeight
    },
    contents: []
  });
}

// ============= GENERATE ANCILLARY PRODUCTS =============

const ancillaryProducts: AncillaryProduct[] = [];

const ancillaryData = [
  { code: 'SEAT', name: 'Extra Legroom Seat', category: 'seat', price: 75 },
  { code: 'BAG1', name: 'Extra Baggage 23kg', category: 'baggage', price: 50 },
  { code: 'BAG2', name: 'Extra Baggage 32kg', category: 'baggage', price: 100 },
  { code: 'MEAL', name: 'Gourmet Meal', category: 'meal', price: 35 },
  { code: 'MEAL2', name: 'Special Meal (VGML/HML)', category: 'meal', price: 25 },
  { code: 'LOUNGE', name: 'Lounge Access', category: 'lounge', price: 60 },
  { code: 'WIFI', name: 'In-flight WiFi', category: 'wifi', price: 25 },
  { code: 'INS', name: 'Travel Insurance', category: 'insurance', price: 45 },
  { code: 'UPG', name: 'Economy to Business Upgrade', category: 'upgrade', price: 500 },
  { code: 'PRIORITY', name: 'Priority Boarding', category: 'other', price: 20 }
];

for (let i = 0; i < 35; i++) {
  const product = ancillaryData[i % ancillaryData.length];

  ancillaryProducts.push({
    id: generateId('ANC', i),
    code: `${product.code}${String(i + 1).padStart(2, '0')}`,
    name: product.name,
    category: product.category as any,
    description: `${product.name} - Available on select flights`,
    price: product.price + (i % 5) * 10,
    currency: 'USD',
    taxIncluded: false,
    applicableRoutes: flightRoutes.slice(0, randomInt(3, 8)).map(r => `${r.origin}-${r.destination}`),
    applicableCabins: ['economy', 'business', 'first'].slice(0, randomInt(1, 3)),
    applicableFares: ['Y', 'B', 'M', 'K', 'J', 'C'].slice(0, randomInt(3, 6)),
    restrictions: i % 3 === 0 ? ['Not available on codeshare flights'] : [],
    availability: 'All routes',
    image: undefined,
    bundleId: i % 5 === 0 ? `BUNDLE${String(Math.floor(i / 5) + 1).padStart(3, '0')}` : undefined,
    commissionEligible: true,
    commissionRate: 10
  });
}

// ============= GENERATE REVENUE DATA =============

const revenueData: RevenueData[] = [];

for (let i = 0; i < 35; i++) {
  const route = flightRoutes[i % flightRoutes.length];
  const flight = flightInstances[i % flightInstances.length];
  const passengers = flight.passengers;
  const loadFactor = flight.loadFactor / 100;
  const revenue = passengers * randomInt(400, 1200);

  revenueData.push({
    route: `${route.origin}-${route.destination}`,
    origin: route.origin,
    destination: route.destination,
    date: generateDate(-i),
    flightNumber: flight.flightNumber,
    passengers: passengers,
    loadFactor: loadFactor,
    revenue: revenue,
    yield: generateCurrency(revenue / passengers),
    rask: generateCurrency(revenue / (passengers * route.duration * 1000)),
    cargoRevenue: randomInt(2000, 15000),
    ancillaryRevenue: randomInt(500, 5000),
    totalRevenue: revenue + randomInt(2500, 20000),
    costs: Math.round((revenue + randomInt(2500, 20000)) * 0.75),
    profit: Math.round((revenue + randomInt(2500, 20000)) * 0.25),
    margin: randomInt(15, 35) / 100,
    forecast: {
      predictedLoad: randomInt(75, 95) / 100,
      predictedRevenue: revenue * randomInt(90, 110) / 100,
      confidence: randomInt(75, 95) / 100,
      demandTrend: ['increasing', 'stable', 'decreasing'][i % 3] as any,
      recommendedActions: [
        'Adjust pricing strategy',
        'Increase marketing spend',
        'Monitor competitor activity'
      ].slice(0, randomInt(1, 3))
    }
  });
}

// ============= GENERATE FARE BASIS CODES =============

const fareBasis: FareBasis[] = [];

const fareBasisData = [
  { code: 'YHE', name: 'Economy Saver', bookingClass: 'Y', cabin: 'economy', baseFare: 350 },
  { code: 'BHE', name: 'Economy Flex', bookingClass: 'B', cabin: 'economy', baseFare: 450 },
  { code: 'MHE', name: 'Economy Plus', bookingClass: 'M', cabin: 'economy', baseFare: 550 },
  { code: 'JHE', name: 'Business Saver', bookingClass: 'J', cabin: 'business', baseFare: 1200 },
  { code: 'CHE', name: 'Business Flex', bookingClass: 'C', cabin: 'business', baseFare: 1500 },
  { code: 'FHE', name: 'First Class', bookingClass: 'F', cabin: 'first', baseFare: 3500 },
  { code: 'KHE', name: 'Economy Advanced Purchase', bookingClass: 'K', cabin: 'economy', baseFare: 280 },
  { code: 'LHE', name: 'Economy Last Minute', bookingClass: 'L', cabin: 'economy', baseFare: 600 },
  { code: 'DHE', name: 'Business Corporate', bookingClass: 'D', cabin: 'business', baseFare: 1300 },
  { code: 'IHE', name: 'Business Premium', bookingClass: 'I', cabin: 'business', baseFare: 1800 },
  { code: 'WHE', name: 'Premium Economy', bookingClass: 'W', cabin: 'economy', baseFare: 750 },
  { code: 'PHE', name: 'Premium Economy Flex', bookingClass: 'P', cabin: 'economy', baseFare: 850 },
  { code: 'AHE', name: 'First Class Saver', bookingClass: 'A', cabin: 'first', baseFare: 2800 },
  { code: 'OHE', name: 'Economy Student', bookingClass: 'O', cabin: 'economy', baseFare: 250 },
  { code: 'QHE', name: 'Economy Senior', bookingClass: 'Q', cabin: 'economy', baseFare: 300 }
];

for (let i = 0; i < 35; i++) {
  const fare = fareBasisData[i % fareBasisData.length];

  fareBasis.push({
    code: fare.code,
    name: fare.name,
    bookingClass: fare.bookingClass,
    cabin: fare.cabin as any,
    fareFamily: fare.cabin === 'first' ? 'First' : fare.cabin === 'business' ? 'Business' : 'Economy',
    baseFare: fare.baseFare + (i % 5) * 25,
    currency: 'USD',
    advancePurchase: i % 3 === 0 ? 21 : i % 3 === 1 ? 7 : 0,
    minStay: 'None',
    maxStay: '12 months',
    changeable: i % 3 !== 0,
    changeFee: i % 3 === 0 ? 0 : 150,
    refundable: i % 4 === 0,
    refundFee: i % 4 === 0 ? 0 : 200,
    seasonality: [
      {
        season: 'low',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        multiplier: 0.8
      },
      {
        season: 'peak',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        multiplier: 1.3
      },
      {
        season: 'super_peak',
        startDate: '2024-12-15',
        endDate: '2024-12-31',
        multiplier: 1.5
      }
    ],
    routing: 'Permitted',
    blackouts: i % 5 === 0 ? ['2024-12-24', '2024-12-25'] : [],
    companionRule: i % 6 === 0 ? '10% discount for companion' : undefined,
    corporateRule: i % 4 === 0 ? '5% discount for corporate accounts' : undefined,
    effectiveDate: '2024-01-01',
    expiryDate: '2024-12-31'
  });
}

// ============= GENERATE INTEGRATION RECORDS =============

const integrations: Integration[] = [];

const integrationData = [
  { name: 'Amadeus GDS', type: 'gds', provider: 'amadeus', endpoint: 'https://api.amadeus.com/v1' },
  { name: 'Sabre GDS', type: 'gds', provider: 'sabre', endpoint: 'https://api.sabre.com/v1' },
  { name: 'Travelport GDS', type: 'gds', provider: 'travelport', endpoint: 'https://api.travelport.com/v1' },
  { name: 'Stripe Payments', type: 'payment', provider: 'stripe', endpoint: 'https://api.stripe.com/v1' },
  { name: 'AODB Connection', type: 'airport', provider: 'aodb', endpoint: 'https://aodb.airport.example.com/api' },
  { name: 'BHS System', type: 'airport', provider: 'bhs', endpoint: 'https://bhs.airport.example.com/api' },
  { name: 'SAP Accounting', type: 'accounting', provider: 'sap', endpoint: 'https://sap.corp.example.com/api' },
  { name: 'Salesforce CRM', type: 'crm', provider: 'salesforce', endpoint: 'https://salesforce.corp.example.com/api' },
  { name: 'Loyalty Program', type: 'loyalty', provider: 'other', endpoint: 'https://loyalty.airline.com/api' },
  { name: 'Chatbot Service', type: 'chatbot', provider: 'other', endpoint: 'https://chatbot.airline.com/api' }
];

for (let i = 0; i < 15; i++) {
  const integration = integrationData[i % integrationData.length];

  integrations.push({
    id: generateId('INT', i),
    name: `${integration.name} ${i < 10 ? '' : '(Backup)'}`,
    type: integration.type as any,
    provider: integration.provider as any,
    status: ['active', 'active', 'active', 'inactive', 'error'][i % 5] as any,
    endpoint: integration.endpoint,
    credentials: {
      apiKey: `key_${randomInt(1000000, 9999999)}`,
      apiSecret: `****${randomInt(1000, 9999)}`
    },
    configuration: {
      timeout: 30000,
      retryAttempts: 3,
      rateLimit: 1000
    },
    lastSync: generateDate(-randomInt(0, 24)),
    lastSyncStatus: ['success', 'success', 'success', 'partial', 'failed'][i % 5] as any,
    metrics: {
      requestsToday: randomInt(100, 10000),
      requestsTotal: randomInt(100000, 10000000),
      errorsToday: i % 5 === 4 ? randomInt(10, 50) : 0,
      errorsTotal: randomInt(100, 5000),
      averageResponseTime: randomInt(100, 500)
    },
    webhooks: i % 3 === 0 ? [
      {
        id: generateId('WH', 0),
        name: 'Booking Notification',
        url: 'https://webhook.example.com/bookings',
        events: ['booking.created', 'booking.updated', 'booking.cancelled'],
        secret: `wh_secret_${randomInt(1000000, 9999999)}`,
        status: 'active',
        lastTriggered: generateDate(-randomInt(0, 12)),
        successRate: randomInt(95, 100) / 100
      }
    ] : []
  });
}

// ============= GENERATE AI PREDICTIONS =============

const aiPredictions: AIPrediction[] = [];

const predictionTypes = ['pricing', 'demand_forecast', 'maintenance_predictive', 'fraud_detection', 'personalization', 'disruption_recovery', 'revenue_anomaly'];

for (let i = 0; i < 20; i++) {
  const type = predictionTypes[i % predictionTypes.length];

  aiPredictions.push({
    modelId: `MODEL${String((i % 7) + 1).padStart(3, '0')}`,
    modelName: ['Dynamic Pricing Model', 'Demand Forecasting AI', 'Predictive Maintenance', 'Fraud Detection', 'Personalization Engine', 'Disruption Recovery', 'Revenue Anomaly Detection'][(i % 7)],
    type: type,
    timestamp: generateDate(-randomInt(0, 7)),
    input: {
      route: flightRoutes[i % flightRoutes.length],
      date: generateDate(randomInt(0, 30)),
      historicalData: 365,
      marketConditions: 'stable'
    },
    output: {
      predictedValue: randomInt(100, 1000),
      confidenceInterval: [randomInt(80, 120), randomInt(120, 160)],
      actionRecommended: type === 'pricing' ? 'Increase price by 5%' : type === 'demand_forecast' ? 'High demand expected' : type === 'maintenance_predictive' ? 'Schedule maintenance within 7 days' : type === 'fraud_detection' ? 'Review booking manually' : type === 'personalization' ? 'Send upgrade offer' : type === 'disruption_recovery' ? 'Prepare alternative routing' : 'Investigate revenue discrepancy'
    },
    confidence: randomInt(75, 98) / 100,
    recommendation: i % 3 === 0 ? 'Implement recommended action' : 'Monitor situation',
    implemented: i % 4 === 0,
    outcome: i % 4 === 0 ? 'Action completed successfully' : undefined
  });
}

// ============= GENERATE SUSTAINABILITY METRICS =============

const sustainabilityMetrics: SustainabilityMetrics[] = [];

const periods = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];

for (let i = 0; i < 12; i++) {
  sustainabilityMetrics.push({
    period: periods[i],
    flights: randomInt(800, 1200),
    fuelConsumed: randomInt(50000000, 80000000),
    co2Emissions: randomInt(150000000, 250000000),
    co2PerPaxKm: generateCurrency(randomInt(85, 115) / 100),
    co2PerTonneKm: generateCurrency(randomInt(500, 700) / 100),
    efficiency: randomInt(35, 45) / 100,
    carbonOffsetsSold: randomInt(5000, 20000),
    carbonOffsetsRetired: randomInt(4000, 18000),
    renewableEnergy: randomInt(10, 30) / 100,
    wasteRecycled: randomInt(60, 85) / 100,
    targets: {
      fuelEfficiency: { current: randomInt(35, 40) / 100, target: 0.45, year: 2025 },
      co2Reduction: { current: randomInt(-15, -10), target: -20, year: 2025 },
      renewableEnergy: { current: randomInt(15, 25) / 100, target: 0.35, year: 2025 }
    },
    initiatives: [
      {
        id: generateId('SUST', 0),
        name: 'Fleet Modernization',
        type: 'fleet',
        description: 'Replacing older aircraft with fuel-efficient models',
        status: i < 6 ? 'active' : 'completed',
        startDate: '2023-01-01',
        endDate: '2025-12-31',
        investment: 500000000,
        savings: {
          fuel: randomInt(5000000, 8000000),
          co2: randomInt(15000000, 25000000),
          cost: randomInt(2000000, 4000000)
        },
        progress: i < 6 ? randomInt(40, 70) : 100
      },
      {
        id: generateId('SUST', 1),
        name: 'Sustainable Aviation Fuel',
        type: 'fuel',
        description: 'Blending SAF with conventional jet fuel',
        status: 'active',
        startDate: '2024-01-01',
        investment: 100000000,
        savings: {
          fuel: randomInt(1000000, 2000000),
          co2: randomInt(3000000, 6000000),
          cost: randomInt(500000, 1000000)
        },
        progress: randomInt(20, 50)
      }
    ]
  });
}

// ============= GENERATE PARTS =============

const parts: any[] = [];

const partCategories = ['Engine', 'Landing Gear', 'Avionics', 'Hydraulics', 'Electrical', 'Cabin', 'Fuel System', 'Airframe'];
const partNames = [
  'Turbine Blade', 'Combustion Chamber', 'Fuel Pump', 'Oil Filter', 'Starter Motor',
  'Landing Gear Strut', 'Brake Assembly', 'Tire Assembly', 'Wheel Hub', 'Anti-skid Sensor',
  'Flight Computer', 'Navigation Receiver', 'Communication Radio', 'Transponder', 'Display Unit',
  'Hydraulic Pump', 'Actuator', 'Accumulator', 'Valve Assembly', 'Hydraulic Hose',
  'Generator', 'Battery Unit', 'Circuit Breaker', 'Wiring Harness', 'Light Assembly',
  'Seat Assembly', 'Overhead Bin', 'Galley Equipment', 'Lavatory Module', 'Cabin Panel',
  'Fuel Tank', 'Fuel Gauge', 'Fuel Pump', 'Fuel Filter', 'Fuel Line',
  'Fuselage Panel', 'Wing Flap', 'Rudder Assembly', 'Elevator', 'Stabilizer'
];
const manufacturers = ['Boeing', 'Airbus', 'GE Aviation', 'Rolls-Royce', 'Pratt & Whitney', 'Honeywell', 'Collins Aerospace', 'Safran', 'UTC Aerospace', 'Leonardo'];

for (let i = 0; i < 35; i++) {
  const category = partCategories[i % partCategories.length];
  const name = partNames[i % partNames.length];
  const manufacturer = manufacturers[i % manufacturers.length];

  parts.push({
    partNumber: `P${String(i + 1).padStart(4, '0')}-${category.substring(0, 3).toUpperCase()}`,
    name: name,
    description: `${name} for commercial aircraft - ${manufacturer} specification`,
    category: category,
    manufacturer: manufacturer,
    quantityOnHand: randomInt(1, 50),
    minimumStock: randomInt(2, 10),
    reorderQuantity: randomInt(10, 25),
    unitCost: randomInt(100, 50000),
    location: `Shelf ${String.fromCharCode(65 + (i % 6))}-${randomInt(1, 20)}`,
    shelfLife: i % 4 === 0 ? '2027-12-31' : undefined,
    serialTracking: i % 3 === 0,
    aircraftApplicability: AIRCRAFT_TYPES.slice(0, randomInt(1, 4))
  });
}

// ============= GENERATE COMPONENTS =============

const components: any[] = [];

const componentPositions = ['Left Wing', 'Right Wing', 'Nose', 'Tail', 'Fuselage', 'Cockpit', 'Cabin Forward', 'Cabin Aft'];

for (let i = 0; i < 35; i++) {
  const part = parts[i % parts.length];
  const aircraftRegistration = AIRCRAFT_REGISTRATIONS[i % AIRCRAFT_REGISTRATIONS.length];

  components.push({
    id: generateId('COMP', i),
    partNumber: part.partNumber,
    serialNumber: `SN${randomInt(100000, 999999)}`,
    installedOn: new Date().toISOString().split('T')[0],
    installedAt: generateDate(-randomInt(30, 365)),
    aircraftRegistration: aircraftRegistration,
    position: componentPositions[i % componentPositions.length],
    cycleCount: randomInt(100, 15000),
    hoursSinceNew: randomInt(500, 25000),
    timeSinceOverhaul: randomInt(100, 8000),
    nextOverhaulDue: i % 2 === 0 ? generateDate(randomInt(30, 365)) : undefined,
    condition: ['serviceable', 'unserviceable', 'repairable', 'scrapped'][i % 4] as any,
    lastInspection: generateDate(-randomInt(1, 30)),
    nextInspection: generateDate(randomInt(1, 90))
  });
}

// ============= GENERATE AUTOMATION RULES =============

const automationRules: AutomationRule[] = [];

const ruleTemplates = [
  {
    name: 'Auto-cancel unpaid bookings',
    description: 'Automatically cancel PNRs that exceed payment time limit',
    triggerType: 'schedule',
    condition: 'pnp.timeLimit < now AND pnr.status = "confirmed"',
    actions: [
      { type: 'data_update', params: { field: 'status', value: 'cancelled' } },
      { type: 'notification', params: { channel: 'email', template: 'cancellation_notice' } }
    ]
  },
  {
    name: 'Delay notification',
    description: 'Send notifications when flights are delayed',
    triggerType: 'event',
    eventType: 'flight.delayed',
    actions: [
      { type: 'notification', params: { channel: ['email', 'sms'], template: 'delay_notification' } }
    ]
  },
  {
    name: 'High-value customer upgrade',
    description: 'Offer complimentary upgrades to platinum members on load < 80%',
    triggerType: 'condition',
    condition: 'customer.tier = "platinum" AND flight.loadFactor < 0.8',
    actions: [
      { type: 'notification', params: { channel: 'email', template: 'upgrade_offer' } }
    ]
  },
  {
    name: 'Maintenance alert',
    description: 'Alert maintenance team when aircraft exceeds flight hours threshold',
    triggerType: 'threshold',
    threshold: { metric: 'aircraft.flightHours', operator: 'gte', value: 8000 },
    actions: [
      { type: 'task_creation', params: { assignee: 'maintenance', priority: 'high' } },
      { type: 'notification', params: { channel: 'email', template: 'maintenance_alert' } }
    ]
  },
  {
    name: 'Fare change alert',
    description: 'Notify agencies when significant fare changes occur',
    triggerType: 'event',
    eventType: 'fare.changed',
    actions: [
      { type: 'notification', params: { channel: 'email', template: 'fare_change_notification' } },
      { type: 'api_call', params: { endpoint: '/agency/notify', method: 'POST' } }
    ]
  },
  {
    name: 'Baggage mishandled workflow',
    description: 'Initiate baggage recovery workflow when bags are mishandled',
    triggerType: 'event',
    eventType: 'baggage.mishandled',
    actions: [
      { type: 'task_creation', params: { assignee: 'baggage_services', priority: 'high' } },
      { type: 'notification', params: { channel: ['email', 'sms'], template: 'baggage_delay_notification' } },
      { type: 'data_update', params: { field: 'status', value: 'investigating' } }
    ]
  },
  {
    name: 'Revenue anomaly detection',
    description: 'Flag revenue reports with significant deviations from forecast',
    triggerType: 'threshold',
    threshold: { metric: 'revenue.variance', operator: 'gt', value: 15 },
    actions: [
      { type: 'task_creation', params: { assignee: 'revenue_management', priority: 'medium' } },
      { type: 'notification', params: { channel: 'email', template: 'revenue_anomaly_alert' } }
    ]
  }
];

for (let i = 0; i < 8; i++) {
  const template = ruleTemplates[i % ruleTemplates.length];

  automationRules.push({
    id: generateId('RULE', i),
    name: template.name,
    description: template.description,
    trigger: {
      type: template.triggerType as any,
      schedule: template.triggerType === 'schedule' ? '0 */2 * * *' : undefined,
      eventType: template.eventType,
      condition: template.condition,
      threshold: template.threshold
    } as any,
    actions: template.actions.map((action, idx) => ({
      type: action.type as any,
      parameters: action.params,
      order: idx + 1
    })),
    status: ['active', 'active', 'active', 'paused'][i % 4] as any,
    priority: i < 2 ? 'high' : i < 5 ? 'medium' : 'low',
    executionCount: randomInt(100, 5000),
    successRate: randomInt(95, 100) / 100,
    lastExecuted: generateDate(-randomInt(0, 24)),
    nextExecution: generateDate(randomInt(1, 48)),
    createdBy: 'SYSTEM',
    createdAt: '2023-06-01'
  });
}

// ============= GENERATE FLIGHT SCHEDULES =============

const flightSchedules: FlightSchedule[] = [];

for (let i = 0; i < 35; i++) {
  const route = flightRoutes[i % flightRoutes.length];
  const flightNumber = generateFlightNumber('AA', 100 + i);
  const daysOfWeek = [1, 2, 3, 4, 5, 6, 7].slice(0, randomInt(3, 8));
  
  flightSchedules.push({
    id: generateId('SCH', i),
    flightNumber: flightNumber,
    airlineCode: 'AA',
    origin: route.origin,
    destination: route.destination,
    daysOfWeek: daysOfWeek,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    departureTime: `${randomInt(6, 22).toString().padStart(2, '0')}:00`,
    arrivalTime: `${randomInt(6, 22).toString().padStart(2, '0')}:00`,
    aircraftType: AIRCRAFT_TYPES[i % AIRCRAFT_TYPES.length],
    duration: route.duration * 60,
    distance: route.distance * 1.852, // Convert nm to km
    status: ['active', 'active', 'active', 'seasonal'][i % 4] as any,
    slot: {
      origin: `${randomInt(6, 22).toString().padStart(2, '0')}:00`,
      destination: `${randomInt(6, 22).toString().padStart(2, '0')}:00`,
      slotTime: `${randomInt(6, 22).toString().padStart(2, '0')}:00`,
      slotOwner: 'AA'
    },
    frequencies: daysOfWeek.length
  });
}

// ============= GENERATE DISRUPTION EVENTS =============

const disruptions: DisruptionEvent[] = [];

const disruptionTypes: Array<'delay' | 'cancellation' | 'diversion' | 'aircraft_swap' | 'crew_change'> = 
  ['delay', 'cancellation', 'diversion', 'aircraft_swap', 'crew_change'];
const disruptionCodes = ['WX', 'MT', 'CT', 'AT', 'PS', 'GEN'];
const disruptionReasons = [
  'Severe weather conditions at departure airport',
  'Aircraft maintenance issue discovered during pre-flight check',
  'Crew scheduling conflict due to previous flight delay',
  'ATC slot reduction due to high traffic volume',
  'Passenger medical emergency requiring aircraft return',
  'Technical issue with navigation systems',
  'Ground handling equipment malfunction',
  'Security breach at terminal',
  'Fuel contamination detected',
  'Crew duty time limitations'
];

for (let i = 0; i < 35; i++) {
  const flight = flightInstances[i % flightInstances.length];
  const disruptionType = disruptionTypes[i % disruptionTypes.length];
  const passengersAffected = flight.passengers;
  
  disruptions.push({
    id: generateId('DSP', i),
    type: disruptionType,
    flightId: flight.id,
    flightNumber: flight.flightNumber,
    date: flight.date,
    reason: disruptionReasons[i % disruptionReasons.length],
    code: disruptionCodes[i % disruptionCodes.length],
    impact: {
      passengers: passengersAffected,
      connections: Math.floor(passengersAffected * 0.15),
      estimatedCost: passengersAffected * randomInt(200, 500) + randomInt(5000, 20000)
    },
    actions: [],
    status: ['active', 'mitigating', 'resolved'][i % 3] as any,
    createdAt: `${flight.date}T${randomInt(0, 23).toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}:00Z`,
    resolvedAt: i % 3 === 2 ? `${flight.date}T${randomInt(0, 23).toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}:00Z` : undefined
  });
}

// ============= GENERATE FLIGHT RELEASES =============

const flightReleases: FlightRelease[] = [];

for (let i = 0; i < 35; i++) {
  const flight = flightInstances[i % flightInstances.length];
  const schedule = flightSchedules[i % flightSchedules.length];
  
  flightReleases.push({
    id: generateId('FRL', i),
    flightId: flight.id,
    flightNumber: flight.flightNumber,
    date: flight.date,
    generatedAt: `${flight.date}T${randomInt(0, 6).toString().padStart(2, '0')}:${randomInt(0, 59).toString().padStart(2, '0')}:00Z`,
    generatedBy: 'DISPATCH01',
    weather: {
      departure: 'Clear skies, 15°C, wind 270°/10kt, visibility 10km',
      enroute: 'Scattered clouds, temperature -45°C at FL350',
      destination: 'Overcast, 12°C, wind 310°/15kt, visibility 8km'
    },
    notams: [
      `RWY closure at ${flight.origin}`,
      `Taxiway restrictions at ${flight.destination}`,
      'Navigation system maintenance'
    ].slice(0, randomInt(1, 4)),
    atcRestrictions: [
      'Flow control in effect',
      'Slot delays expected',
      'Route restrictions active'
    ].slice(0, randomInt(0, 3)),
    alternateAirports: [
      flight.destination === 'LHR' ? 'MAN' : 'BHX',
      flight.destination === 'JFK' ? 'EWR' : 'LGA'
    ].slice(0, randomInt(1, 3)),
    fuelPlan: {
      trip: randomInt(15000, 50000),
      reserve: randomInt(3000, 8000),
      contingency: randomInt(500, 2000),
      extra: randomInt(0, 1000),
      total: 0
    } as any,
    route: `${flight.origin}-${flight.destination} direct`,
    altitude: randomInt(33000, 41000),
    speed: Math.floor(randomInt(450, 580)),
    weight: randomInt(200000, 350000),
    signature: `Capt. ${randomFromArray(FIRST_NAMES)} ${randomFromArray(LAST_NAMES)}`
  });
  
  // Calculate total fuel
  const lastRelease = flightReleases[flightReleases.length - 1];
  if (lastRelease.fuelPlan) {
    lastRelease.fuelPlan.total = 
      lastRelease.fuelPlan.trip + 
      lastRelease.fuelPlan.reserve + 
      lastRelease.fuelPlan.contingency + 
      lastRelease.fuelPlan.extra;
  }
}

// ============= EXPORT DEMO DATA =============

export const demoData = {
  // Flight Operations
  flightSchedules,
  flightInstances,
  disruptions,
  flightReleases,

  // PSS Data
  pnrs,
  tickets,

  // DCS Data
  checkInRecords,
  baggageRecords,

  // Crew Data
  crewMembers,
  crewSchedules,

  // MRO Data
  maintenanceRecords,
  parts,
  components,

  // Cargo Data
  cargoBookings,
  ulds,

  // CRM Data
  customerProfiles,

  // Agency Data
  agencies,
  adms,

  // Ancillary Data
  ancillaryProducts,

  // Revenue Management
  revenueData,
  fareBasis,

  // Integration Data
  integrations,

  // AI & Automation
  aiPredictions,
  automationRules,

  // Sustainability
  sustainabilityMetrics
};

export default demoData;
