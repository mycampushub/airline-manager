// Enhanced Store Initialization - Mock Data Generators
// This file provides comprehensive mock data for all modules

import { useEnhancedAirlineStore } from './enhanced-store-part1'

export const initializeAllMockData = () => {
  const store = useEnhancedAirlineStore.getState()

  // 1. Initialize basic mock data
  store.initializeMockData()

  // 2. Create sample PNRs
  const samplePNRs = [
    store.createPNR({
      passengers: [
        {
          id: 'P001',
          title: 'Mr',
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1985-05-15',
          passportNumber: 'P123456789',
          passportExpiry: '2028-05-15',
          nationality: 'US',
          ssr: [],
          seatPreferences: 'window',
          mealPreference: 'vegetarian'
        },
        {
          id: 'P002',
          title: 'Mrs',
          firstName: 'Jane',
          lastName: 'Smith',
          dateOfBirth: '1987-08-20',
          passportNumber: 'P987654321',
          passportExpiry: '2028-08-20',
          nationality: 'US',
          ssr: ['VGML'],
          seatPreferences: 'aisle',
          mealPreference: 'vegetarian'
        }
      ],
      segments: [
        {
          id: 'S001',
          flightNumber: 'AA100',
          airlineCode: 'AA',
          origin: 'JFK',
          destination: 'LHR',
          departureDate: new Date().toISOString().split('T')[0],
          departureTime: '20:00',
          arrivalDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          arrivalTime: '08:00',
          aircraftType: 'B777-300ER',
          fareClass: 'Y',
          fareBasis: 'YEXP',
          status: 'confirmed',
          boardingClass: 'economy',
          cabinClass: 'economy'
        }
      ],
      fareQuote: {
        baseFare: 800,
        taxes: 120,
        fees: 40,
        total: 960,
        currency: 'USD',
        fareRules: ['Non-refundable', 'Changes allowed with fee']
      },
      contactInfo: {
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        address: '123 Main St, New York, NY 10001'
      },
      paymentInfo: {
        paymentMethod: 'credit_card',
        cardLastFour: '1234',
        amount: 960,
        currency: 'USD'
      },
      bookingClass: 'Y',
      agentId: 'AG001',
      agencyCode: 'TRAVEL01',
      remarks: ['Honeymoon trip'],
      isGroup: false,
      source: 'agent',
      status: 'confirmed'
    }),
    store.createPNR({
      passengers: [
        {
          id: 'P003',
          title: 'Ms',
          firstName: 'Emily',
          lastName: 'Johnson',
          dateOfBirth: '1990-12-10',
          passportNumber: 'P456789123',
          passportExpiry: '2027-12-10',
          nationality: 'US',
          ssr: ['WCHR'],
          seatPreferences: 'aisle',
          mealPreference: ''
        }
      ],
      segments: [
        {
          id: 'S002',
          flightNumber: 'AA200',
          airlineCode: 'AA',
          origin: 'JFK',
          destination: 'LAX',
          departureDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          departureTime: '10:00',
          arrivalDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          arrivalTime: '13:00',
          aircraftType: 'B787-9',
          fareClass: 'J',
          fareBasis: 'JFLEX',
          status: 'confirmed',
          boardingClass: 'business',
          cabinClass: 'business'
        }
      ],
      fareQuote: {
        baseFare: 1200,
        taxes: 180,
        fees: 60,
        total: 1440,
        currency: 'USD',
        fareRules: ['Fully refundable', 'Changes allowed']
      },
      contactInfo: {
        email: 'emily.johnson@email.com',
        phone: '+1-555-0202',
        address: '456 Oak Ave, Los Angeles, CA 90001'
      },
      paymentInfo: {
        paymentMethod: 'credit_card',
        cardLastFour: '5678',
        amount: 1440,
        currency: 'USD'
      },
      bookingClass: 'J',
      agentId: 'AG001',
      agencyCode: 'TRAVEL01',
      remarks: ['Business travel'],
      isGroup: false,
      source: 'web',
      status: 'ticketed'
    })
  ]

  // 3. Create tickets for PNRs
  samplePNRs.forEach((pnr, index) => {
    pnr.passengers.forEach((passenger) => {
      const ticket = store.issueTicket({
        ticketNumber: '',
        pnrNumber: pnr.pnrNumber,
        passengerId: passenger.id,
        passengerName: `${passenger.firstName} ${passenger.lastName}`,
        fare: pnr.fareQuote,
        segments: pnr.segments,
        taxes: [
          { code: 'US', name: 'US Transportation Tax', amount: pnr.fareQuote.taxes * 0.4, currency: 'USD' },
          { code: 'XF', name: 'Passenger Facility Charge', amount: pnr.fareQuote.taxes * 0.3, currency: 'USD' },
          { code: 'AY', name: 'US User Fee', amount: pnr.fareQuote.taxes * 0.3, currency: 'USD' }
        ],
        commission: {
          amount: pnr.fareQuote.total * 0.07,
          rate: 7,
          paidTo: 'TRAVEL01'
        },
        validationAirline: 'AA',
        refundable: pnr.fareQuote.fareRules.some(rule => rule.includes('refundable')),
        changePenalty: pnr.fareQuote.fareRules.some(rule => rule.includes('Non-refundable')) ? 200 : 0
      })

      // Update PNR with ticket reference
      store.updatePNR(pnr.pnrNumber, {
        tickets: [...(pnr.tickets || []), ticket]
      })
    })
  })

  // 4. Create check-in records
  samplePNRs.forEach((pnr) => {
    pnr.passengers.forEach((passenger) => {
      const ticket = store.getTicketsForPNR(pnr.pnrNumber)[0]
      const segment = pnr.segments[0]

      if (ticket && segment) {
        store.createCheckIn({
          pnrNumber: pnr.pnrNumber,
          ticketNumber: ticket.ticketNumber,
          passengerId: passenger.id,
          passengerName: `${passenger.firstName} ${passenger.lastName}`,
          flightNumber: segment.flightNumber,
          date: segment.departureDate,
          checkInMethod: Math.random() > 0.5 ? 'web' : 'mobile',
          seatNumber: `${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 10) + 1}`,
          boardingPassIssued: true,
          boardingPassData: {
            passNumber: `BP${Date.now()}`,
            issuedAt: new Date().toISOString(),
            barcode: `${ticket.ticketNumber}-${Date.now()}`
          },
          documentsVerified: true,
          visaValid: true,
          passportValid: true,
          bagsChecked: Math.floor(Math.random() * 3),
          status: 'checked-in'
        })
      }
    })
  })

  // 5. Create baggage records
  samplePNRs.forEach((pnr) => {
    pnr.passengers.forEach((passenger) => {
      const segment = pnr.segments[0]
      const tagInfo = store.generateBaggageTag(pnr.pnrNumber, passenger.id, segment?.flightNumber || '')

      store.addBaggage({
        tagNumber: tagInfo.tagNumber,
        pnrNumber: pnr.pnrNumber,
        ticketNumber: store.getTicketsForPNR(pnr.pnrNumber)[0]?.ticketNumber || '',
        passengerId: passenger.id,
        passengerName: `${passenger.firstName} ${passenger.lastName}`,
        flightNumber: segment?.flightNumber || '',
        origin: segment?.origin || '',
        destination: segment?.destination || '',
        weight: 20 + Math.random() * 10,
        pieces: 1 + Math.floor(Math.random() * 2),
        fee: 0,
        feePaid: true
      })
    })
  })

  // 6. Create crew schedules
  const crewMembers = store.crewMembers
  crewMembers.forEach((crew) => {
    store.assignCrewSchedule({
      crewId: crew.id,
      type: 'flight',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '02:00',
      flightId: 'FI001',
      flightNumber: 'AA100',
      route: 'JFK-LHR',
      position: crew.position,
      reportTime: '17:30',
      releaseTime: '02:30',
      dutyHours: 8,
      status: 'scheduled',
      hotel: {
        name: 'London Heathrow Hotel',
        address: 'Bath Road, Harmondsworth, Hayes UB3 5JN',
        phone: '+44 20 8759 1000',
        checkIn: '10:00',
        checkOut: '16:00'
      },
      transport: {
        type: 'hotel_shuttle',
        pickup: 'LHR Terminal 3',
        dropoff: 'London Heathrow Hotel'
      }
    })
  })

  // 7. Create maintenance records
  store.createMaintenanceRecord({
    aircraftRegistration: 'N12345',
    aircraftType: 'B777-300ER',
    type: 'scheduled',
    category: 'a-check',
    description: 'Routine A-check inspection',
    status: 'in_progress',
    priority: 'medium',
    scheduledStart: new Date().toISOString().split('T')[0],
    scheduledEnd: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    actualStart: new Date().toISOString(),
    station: 'JFK',
    hangar: 'Hangar 1',
    assignedTo: ['MECH001', 'MECH002'],
    workOrderNumber: 'WO-2024-001',
    tasks: [
      { id: 'T001', description: 'Inspect landing gear', status: 'completed', completedBy: 'MECH001', completedAt: new Date().toISOString() },
      { id: 'T002', description: 'Check engine oil levels', status: 'in_progress', completedBy: 'MECH002' },
      { id: 'T003', description: 'Verify avionics systems', status: 'pending' }
    ],
    partsUsed: [
      { partNumber: 'OIL-777-001', quantity: 2, serialNumbers: ['SN001', 'SN002'], cost: 150 }
    ],
    laborHours: 8,
    cost: 1200,
    signOff: {
      mechanic: 'MECH001',
      inspector: 'INS001',
      timestamp: new Date().toISOString()
    },
    adCompliance: [
      { adNumber: 'AD-2024-001', title: 'Landing Gear Inspection', issuedDate: '2024-01-01', complianceDate: '2024-01-15', recurring: true, nextDue: '2024-07-15', status: 'compliant' }
    ]
  })

  // 8. Create parts inventory
  const mockParts = [
    {
      partNumber: 'OIL-777-001',
      name: 'Engine Oil B777',
      description: 'High-quality engine oil for B777 aircraft',
      category: 'Consumables',
      manufacturer: 'ExxonMobil',
      quantityOnHand: 50,
      minimumStock: 20,
      reorderQuantity: 30,
      unitCost: 75,
      location: 'Shelf A-1',
      shelfLife: '2025-12-31',
      serialTracking: false,
      aircraftApplicability: ['B777-200', 'B777-300ER']
    },
    {
      partNumber: 'TIRE-B777-MAIN',
      name: 'Main Landing Gear Tire',
      description: 'Main landing gear tire for B777',
      category: 'Wear Items',
      manufacturer: 'Michelin',
      quantityOnHand: 8,
      minimumStock: 4,
      reorderQuantity: 4,
      unitCost: 2500,
      location: 'Shelf B-2',
      serialTracking: true,
      aircraftApplicability: ['B777-200', 'B777-300ER']
    },
    {
      partNumber: 'SEAT-ECONOMY-B787',
      name: 'Economy Class Seat',
      description: 'Economy class passenger seat for B787',
      category: 'Interior',
      manufacturer: 'Collins Aerospace',
      quantityOnHand: 20,
      minimumStock: 10,
      reorderQuantity: 10,
      unitCost: 850,
      location: 'Warehouse 1',
      serialTracking: false,
      aircraftApplicability: ['B787-8', 'B787-9']
    }
  ]

  mockParts.forEach(part => {
    store.updatePart(part.partNumber, part)
  })

  // 9. Create fare basis
  const mockFareBasis = [
    {
      code: 'YEXP',
      name: 'Economy Express',
      bookingClass: 'Y',
      cabin: 'economy',
      fareFamily: 'Basic Economy',
      baseFare: 200,
      currency: 'USD',
      advancePurchase: 0,
      minStay: '0',
      maxStay: '30',
      changeable: false,
      changeFee: 200,
      refundable: false,
      refundFee: 0,
      seasonality: [
        { season: 'peak', startDate: '2024-06-01', endDate: '2024-08-31', multiplier: 1.2 },
        { season: 'low', startDate: '2024-01-15', endDate: '2024-03-31', multiplier: 0.7 }
      ],
      routing: 'JFK-LAX',
      blackouts: ['2024-12-24', '2024-12-25'],
      effectiveDate: '2024-01-01'
    },
    {
      code: 'JFLEX',
      name: 'Business Flexible',
      bookingClass: 'J',
      cabin: 'business',
      fareFamily: 'Business',
      baseFare: 600,
      currency: 'USD',
      advancePurchase: 3,
      minStay: '0',
      maxStay: '365',
      changeable: true,
      changeFee: 0,
      refundable: true,
      refundFee: 50,
      seasonality: [
        { season: 'peak', startDate: '2024-06-01', endDate: '2024-08-31', multiplier: 1.3 },
        { season: 'low', startDate: '2024-01-15', endDate: '2024-03-31', multiplier: 0.75 }
      ],
      routing: 'JFK-LAX',
      blackouts: [],
      effectiveDate: '2024-01-01'
    },
    {
      code: 'FFIRST',
      name: 'First Class',
      bookingClass: 'F',
      cabin: 'first',
      fareFamily: 'First',
      baseFare: 1200,
      currency: 'USD',
      advancePurchase: 0,
      minStay: '0',
      maxStay: '365',
      changeable: true,
      changeFee: 0,
      refundable: true,
      refundFee: 0,
      seasonality: [],
      routing: 'JFK-LAX',
      blackouts: [],
      effectiveDate: '2024-01-01'
    }
  ]

  mockFareBasis.forEach(fare => store.addFareBasis(fare))

  // 10. Create revenue data
  const today = new Date().toISOString().split('T')[0]
  store.updateRevenueData('JFK-LHR', today, {
    route: 'JFK-LHR',
    origin: 'JFK',
    destination: 'LHR',
    date: today,
    flightNumber: 'AA100',
    passengers: 210,
    loadFactor: 70,
    revenue: 168000,
    yield: 800,
    rask: 0.12,
    cargoRevenue: 5000,
    ancillaryRevenue: 8000,
    totalRevenue: 181000,
    costs: 120000,
    profit: 61000,
    margin: 33.7,
    forecast: {
      predictedLoad: 75,
      predictedRevenue: 180000,
      confidence: 0.85,
      demandTrend: 'increasing',
      recommendedActions: ['Increase frequency', 'Add business class capacity']
    }
  })

  store.updateRevenueData('JFK-LAX', today, {
    route: 'JFK-LAX',
    origin: 'JFK',
    destination: 'LAX',
    date: today,
    flightNumber: 'AA200',
    passengers: 225,
    loadFactor: 78,
    revenue: 168750,
    yield: 750,
    rask: 0.15,
    cargoRevenue: 3000,
    ancillaryRevenue: 6500,
    totalRevenue: 178250,
    costs: 125000,
    profit: 53250,
    margin: 29.9,
    forecast: {
      predictedLoad: 82,
      predictedRevenue: 180000,
      confidence: 0.88,
      demandTrend: 'stable',
      recommendedActions: ['Maintain current pricing', 'Promote business class']
    }
  })

  // 11. Create demand forecasts
  store.demandForecasts = [
    {
      route: 'JFK-LHR',
      origin: 'JFK',
      destination: 'LHR',
      period: '2024-Q1',
      historicalData: [
        { date: '2024-01-01', passengers: 180, revenue: 144000 },
        { date: '2024-01-02', passengers: 190, revenue: 152000 },
        { date: '2024-01-03', passengers: 185, revenue: 148000 }
      ],
      forecast: [
        { date: '2024-01-15', predictedPassengers: 195, predictedRevenue: 156000, confidence: 0.85 },
        { date: '2024-01-16', predictedPassengers: 200, predictedRevenue: 160000, confidence: 0.87 },
        { date: '2024-01-17', predictedPassengers: 198, predictedRevenue: 158400, confidence: 0.86 }
      ],
      factors: {
        seasonality: 0.95,
        events: ['Holiday travel expected'],
        competition: ['United Airlines increasing frequency'],
        economic: 'Stable demand expected'
      }
    }
  ]

  // 12. Create ancillary products
  const mockAncillaryProducts = [
    {
      id: 'ANC001',
      code: 'SEAT-EXTRA',
      name: 'Extra Legroom Seat',
      category: 'seat',
      description: 'Additional legroom for enhanced comfort',
      price: 50,
      currency: 'USD',
      taxIncluded: true,
      applicableRoutes: ['JFK-LHR', 'JFK-LAX', 'LAX-TYO'],
      applicableCabins: ['economy'],
      applicableFares: ['Y', 'B'],
      restrictions: ['Not available on exit rows'],
      availability: 'Available',
      commissionEligible: true,
      commissionRate: 5
    },
    {
      id: 'ANC002',
      code: 'BAG-EXTRA',
      name: 'Extra Baggage',
      category: 'baggage',
      description: 'Additional checked bag up to 23kg',
      price: 100,
      currency: 'USD',
      taxIncluded: false,
      applicableRoutes: ['*'],
      applicableCabins: ['economy', 'business', 'first'],
      applicableFares: ['*'],
      restrictions: [],
      availability: 'Available',
      commissionEligible: true,
      commissionRate: 5
    },
    {
      id: 'ANC003',
      code: 'MEAL-PREMIUM',
      name: 'Premium Meal',
      category: 'meal',
      description: 'Gourmet meal selection',
      price: 25,
      currency: 'USD',
      taxIncluded: true,
      applicableRoutes: ['*'],
      applicableCabins: ['economy', 'business', 'first'],
      applicableFares: ['*'],
      restrictions: ['Must be ordered 24h before departure'],
      availability: 'Available',
      commissionEligible: true,
      commissionRate: 3
    },
    {
      id: 'ANC004',
      code: 'LOUNGE-ACCESS',
      name: 'Lounge Access',
      category: 'lounge',
      description: 'Airport lounge access before flight',
      price: 75,
      currency: 'USD',
      taxIncluded: true,
      applicableRoutes: ['*'],
      applicableCabins: ['economy', 'business', 'first'],
      applicableFares: ['*'],
      restrictions: ['Valid 3 hours before departure'],
      availability: 'Available',
      commissionEligible: true,
      commissionRate: 5
    },
    {
      id: 'ANC005',
      code: 'INS-TRAVEL',
      name: 'Travel Insurance',
      category: 'insurance',
      description: 'Comprehensive travel insurance coverage',
      price: 35,
      currency: 'USD',
      taxIncluded: true,
      applicableRoutes: ['*'],
      applicableCabins: ['*'],
      applicableFares: ['*'],
      restrictions: ['Must be purchased at booking'],
      availability: 'Available',
      commissionEligible: true,
      commissionRate: 10
    }
  ]

  mockAncillaryProducts.forEach(product => {
    store.ancillaryProducts = [...store.ancillaryProducts, product]
  })

  // 13. Create bundles
  const mockBundles = [
    {
      id: 'BND001',
      name: 'Comfort Bundle',
      code: 'COMFORT',
      description: 'Extra legroom + Premium meal + Lounge access',
      products: ['ANC001', 'ANC003', 'ANC004'],
      totalPrice: 135,
      savings: 15,
      currency: 'USD',
      targetSegment: 'leisure',
      validity: 'Valid for all routes',
      terms: ['Non-refundable', 'Cannot be combined with other offers']
    },
    {
      id: 'BND002',
      name: 'Business Plus Bundle',
      code: 'BIZPLUS',
      description: 'Extra baggage + Travel insurance + Priority boarding',
      products: ['ANC002', 'ANC005'],
      totalPrice: 120,
      savings: 15,
      currency: 'USD',
      targetSegment: 'business',
      validity: 'Valid for all routes',
      terms: ['Refundable before departure', 'Can be modified']
    }
  ]

  mockBundles.forEach(bundle => {
    store.bundles = [...store.bundles, bundle]
  })

  // 14. Create promo codes
  const mockPromoCodes = [
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minSpend: 200,
      maxDiscount: 100,
      applicableRoutes: ['*'],
      applicableFares: ['Y', 'B', 'J'],
      validFrom: '2024-01-01',
      validUntil: '2024-12-31',
      usageLimit: 10000,
      usedCount: 1250,
      perCustomerLimit: 3,
      active: true,
      terms: ['First-time customers only', 'Cannot be combined with other offers']
    },
    {
      code: 'SUMMER25',
      type: 'percentage',
      value: 25,
      minSpend: 500,
      maxDiscount: 250,
      applicableRoutes: ['JFK-LAX', 'JFK-LHR', 'LAX-TYO'],
      applicableFares: ['Y', 'B'],
      validFrom: '2024-06-01',
      validUntil: '2024-08-31',
      usageLimit: 5000,
      usedCount: 890,
      perCustomerLimit: 2,
      active: true,
      terms: ['Summer travel only', 'Minimum 7 days advance purchase']
    }
  ]

  mockPromoCodes.forEach(promo => {
    store.promoCodes = [...store.promoCodes, promo]
  })

  // 15. Create ADMs
  store.issueADM({
    number: 'ADM-2024-001',
    agencyId: 'AG001',
    agencyCode: 'TRAVEL01',
    type: 'fare_discrepancy',
    amount: 250,
    currency: 'USD',
    reason: 'Incorrect fare applied - should have used corporate fare',
    ticketNumbers: ['176-1234567890'],
    pnrNumbers: ['ABC123XYZ'],
    status: 'issued'
  })

  // 16. Create campaigns
  store.createCampaign({
    name: 'Summer Sale Promotion',
    type: 'email',
    status: 'active',
    targetSegments: ['leisure', 'price_sensitive'],
    targetTiers: ['silver', 'gold'],
    message: {
      subject: 'Summer Sale - Up to 25% Off!',
      body: 'Book now and save on your summer travel with our special promotion.',
      template: 'summer-sale-2024'
    },
    schedule: {
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      sendTime: '09:00',
      frequency: 'weekly'
    }
  })

  // 17. Create complaints
  store.logComplaint({
    customerId: 'CUST001',
    customerName: 'Robert Chen',
    category: 'baggage',
    subject: 'Delayed baggage delivery',
    description: 'Baggage was delayed by 24 hours on flight AA100 from JFK to LHR',
    severity: 'medium',
    channel: 'web',
    pnrNumber: 'ABC123XYZ',
    flightNumber: 'AA100',
    flightDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    priority: 2,
    sla: '48 hours',
    compensation: {
      type: 'voucher',
      amount: 100,
      currency: 'USD'
    }
  })

  // 18. Create users
  store.addUser({
    username: 'admin',
    email: 'admin@aerocommerce.com',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'admin',
    permissions: [
      { module: '*', actions: ['*'] }
    ],
    department: 'IT',
    location: 'HQ',
    mfaEnabled: true
  })

  store.addUser({
    username: 'agent001',
    email: 'agent001@aerocommerce.com',
    firstName: 'Sarah',
    lastName: 'Agent',
    role: 'agent',
    permissions: [
      { module: 'pss', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'dcs', actions: ['read'] },
      { module: 'revenue', actions: ['read'] }
    ],
    department: 'Sales',
    location: 'JFK',
    mfaEnabled: false
  })

  // 19. Create security events
  store.reportSecurityEvent({
    type: 'login_attempt',
    severity: 'low',
    description: 'Failed login attempt from unknown IP',
    ipAddress: '192.168.1.100'
  })

  // 20. Create cargo bookings
  store.createCargoBooking({
    shipper: {
      name: 'Global Shipping Co',
      address: '789 Cargo Way, Miami, FL 33101',
      contact: 'shipping@global.com',
      accountNumber: 'ACCT001'
    },
    consignee: {
      name: 'Euro Imports Ltd',
      address: '321 Trade St, London, UK E1 6AN',
      contact: 'import@euroimports.co.uk'
    },
    flightDetails: {
      flightNumber: 'AA100',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      origin: 'JFK',
      destination: 'LHR',
      routing: ['JFK-LHR']
    },
    goods: {
      description: 'Electronics components',
      pieces: 5,
      weight: 150,
      volume: 2.5,
      weightUnit: 'kg',
      dangerousGoods: false,
      perishable: false,
      temperatureControlled: false,
      specialHandling: ['fragile']
    },
    status: 'booked'
  })

  // 21. Create ULDs
  store.uls = [
    {
      id: 'ULD001',
      uldNumber: 'AKE12345AA',
      type: 'AKE',
      owner: 'AA',
      condition: 'serviceable',
      location: 'JFK',
      currentFlight: 'AA100',
      lastInspection: '2024-01-01',
      nextInspectionDue: '2024-07-01',
      dimensions: {
        length: 153,
        width: 156,
        height: 163,
        maxWeight: 1588
      },
      contents: ['Cargo booking CB001']
    },
    {
      id: 'ULD002',
      uldNumber: 'AKH67890BB',
      type: 'AKH',
      owner: 'AA',
      condition: 'serviceable',
      location: 'LAX',
      currentFlight: 'AA200',
      lastInspection: '2024-01-05',
      nextInspectionDue: '2024-07-05',
      dimensions: {
        length: 244,
        width: 153,
        height: 163,
        maxWeight: 6033
      },
      contents: []
    }
  ]

  // 22. Create sustainability metrics
  store.recordSustainabilityMetrics({
    period: '2024-Q1',
    flights: 1250,
    fuelConsumed: 25000000,
    co2Emissions: 7875000,
    co2PerPaxKm: 0.095,
    co2PerTonneKm: 0.525,
    efficiency: 85,
    carbonOffsetsSold: 50000,
    carbonOffsetsRetired: 30000,
    renewableEnergy: 35,
    wasteRecycled: 80,
    targets: {
      fuelEfficiency: { current: 85, target: 90, year: 2025 },
      co2Reduction: { current: -5, target: -10, year: 2025 },
      renewableEnergy: { current: 35, target: 50, year: 2025 }
    },
    initiatives: [
      {
        id: 'SUST001',
        name: 'Fleet Modernization',
        type: 'fleet',
        description: 'Replacing older aircraft with fuel-efficient models',
        status: 'active',
        startDate: '2023-01-01',
        endDate: '2025-12-31',
        investment: 500000000,
        savings: { fuel: 5000000, co2: 1575000, cost: 15000000 },
        progress: 45
      },
      {
        id: 'SUST002',
        name: 'Sustainable Aviation Fuel',
        type: 'fuel',
        description: 'Blending SAF with conventional jet fuel',
        status: 'active',
        startDate: '2024-01-01',
        investment: 10000000,
        savings: { fuel: 100000, co2: 31500, cost: 200000 },
        progress: 30
      }
    ]
  })

  // 23. Create carbon offsets
  store.carbonOffsets = [
    {
      id: 'CO001',
      name: 'Wind Farm Project',
      project: 'Global Wind Energy',
      type: 'Wind Energy',
      location: 'Texas, USA',
      standard: 'Gold Standard',
      certification: 'GS-1234',
      pricePerTon: 25,
      currency: 'USD',
      available: 50000,
      sold: 30000,
      retired: 20000,
      vintage: 2023
    },
    {
      id: 'CO002',
      name: 'Reforestation Project',
      project: 'Amazon Reforestation',
      type: 'Forestry',
      location: 'Amazon Basin, Brazil',
      standard: 'VCS',
      certification: 'VCS-5678',
      pricePerTon: 30,
      currency: 'USD',
      available: 30000,
      sold: 15000,
      retired: 10000,
      vintage: 2023
    }
  ]

  // 24. Create automation rules
  store.createAutomationRule({
    name: 'Auto-cancel expired PNRs',
    description: 'Automatically cancel PNRs that have passed their time limit',
    trigger: {
      type: 'schedule',
      schedule: '0 */6 * * *' // Every 6 hours
    },
    actions: [
      {
        type: 'data_update',
        parameters: { action: 'cancel_expired_pnrs' },
        order: 1
      },
      {
        type: 'notification',
        parameters: { recipients: ['revenue@aerocommerce.com'], template: 'expired_pnr_cancellation' },
        order: 2
      }
    ],
    priority: 'high',
    executionCount: 0,
    successRate: 100,
    lastExecuted: new Date().toISOString()
  })

  store.createAutomationRule({
    name: 'Send pre-departure notifications',
    description: 'Send boarding notifications 24 hours before departure',
    trigger: {
      type: 'schedule',
      schedule: '0 9 * * *' // Daily at 9 AM
    },
    actions: [
      {
        type: 'notification',
        parameters: { template: 'pre_departure_notification', channels: ['email', 'sms'] },
        order: 1
      }
    ],
    priority: 'medium',
    executionCount: 0,
    successRate: 95,
    lastExecuted: new Date().toISOString()
  })

  // 25. Create load sheets
  store.generateLoadSheet('AA100', new Date().toISOString().split('T')[0])
  store.generateLoadSheet('AA200', new Date().toISOString().split('T')[0])

  // 26. Create boarding records
  store.startBoarding('AA100', new Date().toISOString().split('T')[0], 'A12')
  store.startBoarding('AA200', new Date(Date.now() + 86400000).toISOString().split('T')[0], 'B22')

  console.log('All mock data initialized successfully!')
}

export default initializeAllMockData
