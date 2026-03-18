// Comprehensive Mock Data Initialization - Singapore Airlines Style
// 30+ realistic entries per major section

import { useAirlineStore } from './store'

const generateId = () => Math.random().toString(36).substr(2, 9)
const generatePNRNumber = () => `SQ${Math.random().toString(36).substr(2, 6).toUpperCase()}`
const generateTicketNumber = () => `618-${Math.random().toString().substr(2, 10)}`

const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

export const initializeSingaporeAirlinesData = () => {
  try {
    const store = useAirlineStore.getState()
    console.log('Initializing Singapore Airlines comprehensive mock data...')
    
    // Skip if data already initialized
    if (store.flightSchedules.length > 0) {
      console.log('Data already initialized, skipping...')
      return
    }

  // ==================== FLIGHT SCHEDULES (30+) ====================
  const flightSchedules = [
    { flightNumber: 'SQ11', origin: 'SIN', destination: 'JFK', departureTime: '00:35', arrivalTime: '06:35', aircraftType: 'B777-300ER', duration: 1080 },
    { flightNumber: 'SQ12', origin: 'JFK', destination: 'SIN', departureTime: '01:35', arrivalTime: '07:35+1', aircraftType: 'B777-300ER', duration: 1080 },
    { flightNumber: 'SQ21', origin: 'SIN', destination: 'LHR', departureTime: '00:05', arrivalTime: '06:35', aircraftType: 'A380-800', duration: 810 },
    { flightNumber: 'SQ22', origin: 'LHR', destination: 'SIN', departureTime: '22:30', arrivalTime: '17:55+1', aircraftType: 'A380-800', duration: 805 },
    { flightNumber: 'SQ25', origin: 'SIN', destination: 'FRA', departureTime: '00:50', arrivalTime: '07:05', aircraftType: 'B777-300ER', duration: 735 },
    { flightNumber: 'SQ26', origin: 'FRA', destination: 'SIN', departureTime: '22:15', arrivalTime: '16:40+1', aircraftType: 'B777-300ER', duration: 745 },
    { flightNumber: 'SQ5', origin: 'SIN', destination: 'HND', departureTime: '01:35', arrivalTime: '09:20', aircraftType: 'A350-900', duration: 405 },
    { flightNumber: 'SQ6', origin: 'HND', destination: 'SIN', departureTime: '11:00', arrivalTime: '16:55', aircraftType: 'A350-900', duration: 415 },
    { flightNumber: 'SQ11', origin: 'SIN', destination: 'LAX', departureTime: '00:05', arrivalTime: '06:20', aircraftType: 'B777-300ER', duration: 1035 },
    { flightNumber: 'SQ12', origin: 'LAX', destination: 'SIN', departureTime: '09:30', arrivalTime: '17:10+1', aircraftType: 'B777-300ER', duration: 1040 },
    { flightNumber: 'SQ231', origin: 'SIN', destination: 'SYD', departureTime: '09:00', arrivalTime: '18:20', aircraftType: 'B787-10', duration: 440 },
    { flightNumber: 'SQ232', origin: 'SYD', destination: 'SIN', departureTime: '21:55', arrivalTime: '04:35+1', aircraftType: 'B787-10', duration: 460 },
    { flightNumber: 'SQ861', origin: 'SIN', destination: 'HKG', departureTime: '07:25', arrivalTime: '11:20', aircraftType: 'A350-900', duration: 235 },
    { flightNumber: 'SQ862', origin: 'HKG', destination: 'SIN', departureTime: '12:40', arrivalTime: '16:35', aircraftType: 'A350-900', duration: 235 },
    { flightNumber: 'SQ713', origin: 'SIN', destination: 'MEL', departureTime: '10:35', arrivalTime: '20:30', aircraftType: 'B777-300ER', duration: 435 },
    { flightNumber: 'SQ714', origin: 'MEL', destination: 'SIN', departureTime: '22:30', arrivalTime: '05:20+1', aircraftType: 'B777-300ER', duration: 470 },
    { flightNumber: 'SQ975', origin: 'SIN', destination: 'DXB', departureTime: '22:05', arrivalTime: '02:35', aircraftType: 'A350-900', duration: 390 },
    { flightNumber: 'SQ976', origin: 'DXB', destination: 'SIN', departureTime: '03:50', arrivalTime: '15:20', aircraftType: 'A350-900', duration: 390 },
    { flightNumber: 'SQ403', origin: 'SIN', destination: 'ICN', departureTime: '17:45', arrivalTime: '23:30', aircraftType: 'B787-10', duration: 405 },
    { flightNumber: 'SQ404', origin: 'ICN', destination: 'SIN', departureTime: '01:20', arrivalTime: '07:05', aircraftType: 'B787-10', duration: 405 },
    { flightNumber: 'SQ453', origin: 'SIN', destination: 'BKK', departureTime: '08:45', arrivalTime: '10:05', aircraftType: 'A320neo', duration: 120 },
    { flightNumber: 'SQ454', origin: 'BKK', destination: 'SIN', departureTime: '11:25', arrivalTime: '14:50', aircraftType: 'A320neo', duration: 145 },
    { flightNumber: 'SQ891', origin: 'SIN', destination: 'MNL', departureTime: '12:40', arrivalTime: '16:45', aircraftType: 'A330-300', duration: 185 },
    { flightNumber: 'SQ892', origin: 'MNL', destination: 'SIN', departureTime: '17:50', arrivalTime: '21:15', aircraftType: 'A330-300', duration: 175 },
    { flightNumber: 'SQ945', origin: 'SIN', destination: 'KUL', departureTime: '06:00', arrivalTime: '07:10', aircraftType: 'A320neo', duration: 70 },
    { flightNumber: 'SQ946', origin: 'KUL', destination: 'SIN', departureTime: '08:00', arrivalTime: '09:15', aircraftType: 'A320neo', duration: 75 },
    { flightNumber: 'SQ321', origin: 'SIN', destination: 'PER', departureTime: '21:00', arrivalTime: '23:25', aircraftType: 'B737-800', duration: 265 },
    { flightNumber: 'SQ322', origin: 'PER', destination: 'SIN', departureTime: '00:30', arrivalTime: '06:20', aircraftType: 'B737-800', duration: 290 },
    { flightNumber: 'SQ15', origin: 'SIN', destination: 'ORD', departureTime: '00:55', arrivalTime: '07:25', aircraftType: 'B777-300ER', duration: 990 },
    { flightNumber: 'SQ16', origin: 'ORD', destination: 'SIN', departureTime: '09:45', arrivalTime: '17:05+1', aircraftType: 'B777-300ER', duration: 1000 },
    { flightNumber: 'SQ9', origin: 'SIN', destination: 'SFO', departureTime: '00:30', arrivalTime: '07:05', aircraftType: 'A350-900', duration: 995 },
    { flightNumber: 'SQ10', origin: 'SFO', destination: 'SIN', departureTime: '10:35', arrivalTime: '18:55+1', aircraftType: 'A350-900', duration: 1000 },
  ]

  flightSchedules.forEach((fs, idx) => {
    store.flightSchedules.push({
      id: `FS${String(idx + 1).padStart(3, '0')}`,
      flightNumber: fs.flightNumber,
      airlineCode: 'SQ',
      origin: fs.origin,
      destination: fs.destination,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      departureTime: fs.departureTime,
      arrivalTime: fs.arrivalTime,
      aircraftType: fs.aircraftType,
      duration: fs.duration,
      distance: Math.round(fs.duration * 8.5),
      status: 'active',
      slot: { origin: fs.origin, destination: fs.destination, slotTime: fs.departureTime, slotOwner: 'SQ' },
      frequencies: 1
    })
  })

  // ==================== FLIGHT INSTANCES (30+) ====================
  const routes = [
    { origin: 'SIN', destination: 'JFK', flights: ['SQ11', 'SQ12'] },
    { origin: 'SIN', destination: 'LHR', flights: ['SQ21', 'SQ22'] },
    { origin: 'SIN', destination: 'HND', flights: ['SQ5', 'SQ6'] },
    { origin: 'SIN', destination: 'LAX', flights: ['SQ11', 'SQ12'] },
    { origin: 'SIN', destination: 'SYD', flights: ['SQ231', 'SQ232'] },
    { origin: 'SIN', destination: 'HKG', flights: ['SQ861', 'SQ862'] },
    { origin: 'SIN', destination: 'MEL', flights: ['SQ713', 'SQ714'] },
    { origin: 'SIN', destination: 'DXB', flights: ['SQ975', 'SQ976'] },
    { origin: 'SIN', destination: 'ICN', flights: ['SQ403', 'SQ404'] },
    { origin: 'SIN', destination: 'BKK', flights: ['SQ453', 'SQ454'] },
  ]

  const aircraftRegistrations = [
    '9V-SWA', '9V-SWB', '9V-SWC', '9V-SWD', '9V-SWE',
    '9V-MWA', '9V-MWB', '9V-MWC', '9V-MWD', '9V-MWE',
    '9V-SJA', '9V-SJB', '9V-SJC', '9V-SJD', '9V-SJE'
  ]

  const captains = [
    'Capt. Tan Kim Seng', 'Capt. Lim Chee Keong', 'Capt. Ng Chee Kiong',
    'Capt. Ang Chin Huat', 'Capt. Goh Keng Koo', 'Capt. Seah Keng Maw',
    'Capt. Fong Yoon Kong', 'Capt. Chan Kong Yew', 'Capt. Yeo Kim Huat', 'Capt. Chong Chen Kit'
  ]

  const firstOfficers = [
    'FO. Daniel Tan', 'FO. Marcus Lee', 'FO. Kevin Wong',
    'FO. Ryan Cheng', 'FO. Justin Ng', 'FO. Brandon Sim',
    'FO. Nicholas Tay', 'FO. Andrew Quek', 'FO. Jason Ho', 'FO. Gavin Goh'
  ]

  const cabinCrew = [
    'Sarah Chen', 'Michelle Wong', 'Jennifer Tan', 'Amanda Lim', 'Rebecca Lee',
    'Grace Ng', 'Sophia Chee', 'Evelyn Teo', 'Claire Sim', 'Jessica Boo',
    'Ashley Koh', 'Vanessa Tay', 'Yvonne Chua', 'Patricia Ang', 'Shirley Phoon'
  ]

  let flightInstanceIdx = 1
  routes.forEach((route, rIdx) => {
    route.flights.forEach((flightNum, fIdx) => {
      for (let d = 0; d < 5; d++) {
        const date = new Date(Date.now() + d * 86400000).toISOString().split('T')[0]
        store.flightInstances.push({
          id: `FI${String(flightInstanceIdx++).padStart(3, '0')}`,
          scheduleId: `FS${rIdx * 2 + fIdx + 1}`,
          flightNumber: flightNum,
          date,
          origin: route.origin,
          destination: route.destination,
          scheduledDeparture: `${date}T${route.origin === 'SIN' ? '00:35:00' : '01:35:00'}Z`,
          scheduledArrival: `${flightNum.includes('+1') ? new Date(Date.now() + d * 86400000 + 86400000).toISOString().split('T')[0] : date}T06:35:00Z`,
          aircraftRegistration: aircraftRegistrations[(rIdx + fIdx) % aircraftRegistrations.length],
          aircraftType: flightNum.startsWith('SQ2') ? 'B777-300ER' : flightNum.startsWith('SQ3') ? 'B787-10' : 'A350-900',
          captain: captains[rIdx % captains.length],
          firstOfficer: firstOfficers[rIdx % firstOfficers.length],
          cabinCrew: [
            cabinCrew[(rIdx * 3) % cabinCrew.length],
            cabinCrew[(rIdx * 3 + 1) % cabinCrew.length],
            cabinCrew[(rIdx * 3 + 2) % cabinCrew.length],
          ],
          status: d === 0 ? 'scheduled' : 'scheduled',
          loadFactor: 65 + Math.floor(Math.random() * 30),
          passengers: 180 + Math.floor(Math.random() * 100),
          cargo: 2000 + Math.floor(Math.random() * 5000),
          mail: 200 + Math.floor(Math.random() * 500),
          fuel: 15000 + Math.floor(Math.random() * 15000),
          notams: []
        })
      }
    })
  })

  // ==================== CREW MEMBERS (30+) ====================
  const crewData = [
    { firstName: 'Tan', lastName: 'Kim Seng', position: 'captain', base: 'SIN', qualifications: ['B777', 'A380'], hours: 12500 },
    { firstName: 'Lim', lastName: 'Chee Keong', position: 'captain', base: 'SIN', qualifications: ['B777', 'B787'], hours: 11200 },
    { firstName: 'Ng', lastName: 'Chee Kiong', position: 'captain', base: 'SIN', qualifications: ['A350', 'A380'], hours: 10800 },
    { firstName: 'Ang', lastName: 'Chin Huat', position: 'captain', base: 'SIN', qualifications: ['B777', 'A350'], hours: 9800 },
    { firstName: 'Goh', lastName: 'Keng Koo', position: 'captain', base: 'SIN', qualifications: ['B787', 'B777'], hours: 9500 },
    { firstName: 'Seah', lastName: 'Keng Maw', position: 'captain', base: 'SIN', qualifications: ['A380', 'A350'], hours: 9200 },
    { firstName: 'Fong', lastName: 'Yoon Kong', position: 'first_officer', base: 'SIN', qualifications: ['B777'], hours: 4500 },
    { firstName: 'Chan', lastName: 'Kong Yew', position: 'first_officer', base: 'SIN', qualifications: ['B787'], hours: 4200 },
    { firstName: 'Yeo', lastName: 'Kim Huat', position: 'first_officer', base: 'SIN', qualifications: ['A350'], hours: 3800 },
    { firstName: 'Chong', lastName: 'Chen Kit', position: 'first_officer', base: 'SIN', qualifications: ['B777'], hours: 3500 },
    { firstName: 'Daniel', lastName: 'Tan', position: 'first_officer', base: 'SIN', qualifications: ['A380'], hours: 3200 },
    { firstName: 'Marcus', lastName: 'Lee', position: 'first_officer', base: 'SIN', qualifications: ['B787'], hours: 3000 },
    { firstName: 'Wong', lastName: 'Mei Ling', position: 'purser', base: 'SIN', qualifications: [], hours: 8500 },
    { firstName: 'Chen', lastName: 'Siok Ying', position: 'purser', base: 'SIN', qualifications: [], hours: 7800 },
    { firstName: 'Ng', lastName: 'Siew Lin', position: 'purser', base: 'SIN', qualifications: [], hours: 7200 },
    { firstName: 'Tan', lastName: 'Sook Yee', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 5500 },
    { firstName: 'Lim', lastName: 'Poh Choo', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 5200 },
    { firstName: 'Lee', lastName: 'Cheng Hoon', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 4800 },
    { firstName: 'Wong', lastName: 'Mui Neo', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 4500 },
    { firstName: 'Chee', lastName: 'Cheng Guan', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 4200 },
    { firstName: 'Teo', lastName: 'Kim Swan', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 3800 },
    { firstName: 'Sim', lastName: 'Ai Ling', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 3500 },
    { firstName: 'Boo', lastName: 'Geok Lan', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 3200 },
    { firstName: 'Koh', lastName: 'Bee Geok', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 2900 },
    { firstName: 'Tay', lastName: 'Siew Hong', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 2600 },
    { firstName: 'Chua', lastName: 'Geok Har', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 2300 },
    { firstName: 'Ang', lastName: 'Siew Lee', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 2000 },
    { firstName: 'Phoon', lastName: 'Geok Har', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 1800 },
    { firstName: 'Ho', lastName: 'Siew Kim', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 1500 },
    { firstName: 'Quek', lastName: 'Cheng Hoon', position: 'flight_attendant', base: 'SIN', qualifications: [], hours: 1200 },
  ]

  crewData.forEach((crew, idx) => {
    store.crewMembers.push({
      id: `CR${String(idx + 1).padStart(3, '0')}`,
      employeeNumber: `EMP${String(2024001 + idx).padStart(7, '0')}`,
      firstName: crew.firstName,
      lastName: crew.lastName,
      position: crew.position as any,
      base: crew.base,
      qualifications: crew.qualifications,
      licenseNumber: `LIC${2024000 + idx}`,
      licenseExpiry: '2026-12-31',
      medicalCertificate: `MED${2024000 + idx}`,
      medicalExpiry: '2025-06-30',
      passportNumber: `E${String(Math.floor(Math.random() * 900000000 + 100000000))}`,
      passportExpiry: '2030-12-31',
      dateOfBirth: `${1970 + Math.floor(Math.random() * 40)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      nationality: 'SG',
      email: `${crew.firstName.toLowerCase()}.${crew.lastName.toLowerCase().replace(' ', '')}@singaporeair.com.sg`,
      phone: `+65${Math.floor(Math.random() * 90000000 + 10000000)}`,
      status: 'active',
      hoursFlown: crew.hours,
      hoursThisMonth: Math.floor(crew.hours / 200),
      hoursLast30Days: Math.floor(crew.hours / 40),
      domicile: crew.base,
      language: ['English', 'Mandarin', 'Malay']
    })
  })

  // ==================== CUSTOMER PROFILES / KRISFLYER (30+) ====================
  const customerNames = [
    'John Smith', 'Mary Johnson', 'David Williams', 'Patricia Brown', 'Robert Jones',
    'Linda Garcia', 'Michael Miller', 'Barbara Davis', 'William Wilson', 'Elizabeth Moore',
    'James Taylor', 'Jessica Anderson', 'Robert Thomas', 'Ashley Jackson', 'David White',
    'Sarah Harris', 'Christopher Martin', 'Amanda Thompson', 'Matthew Robinson', 'Stephanie Clark',
    'Andrew Lewis', 'Jennifer Walker', 'Joshua Hall', 'Nicole Allen', 'Brandon Young',
    'Rachel King', 'Ryan Wright', 'Megan Scott', 'Kevin Green', 'Lauren Baker'
  ]

  const tiers = ['base', 'silver', 'gold', 'platinum', 'elite']

  customerNames.forEach((name, idx) => {
    const nameParts = name.split(' ')
    const tier = tiers[idx % tiers.length] as 'base' | 'silver' | 'gold' | 'platinum' | 'elite'
    const tierPoints = tier === 'elite' ? 50000 : tier === 'platinum' ? 25000 : tier === 'gold' ? 10000 : tier === 'silver' ? 5000 : 0
    
    store.customerProfiles.push({
      id: `CUST${String(idx + 1).padStart(4, '0')}`,
      title: idx % 2 === 0 ? 'Mr' : 'Ms',
      firstName: nameParts[0],
      lastName: nameParts[1],
      dateOfBirth: `${1965 + Math.floor(Math.random() * 35)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      nationality: 'SG',
      gender: idx % 2 === 0 ? 'male' : 'female',
      contact: {
        email: `${nameParts[0].toLowerCase()}.${nameParts[1].toLowerCase()}@email.com`,
        phone: `+65${Math.floor(Math.random() * 90000000 + 10000000)}`,
        address: {
          street: `${Math.floor(Math.random() * 500 + 1)} Orchard Road`,
          city: 'Singapore',
          state: '',
          country: 'Singapore',
          postalCode: `${Math.floor(Math.random() * 900000 + 100000)}`
        }
      },
      documents: {
        passportNumber: `E${Math.floor(Math.random() * 900000000 + 100000000)}`,
        passportExpiry: '2030-12-31'
      },
      loyalty: {
        memberNumber: `${6000000 + idx}`,
        tier,
        pointsBalance: tierPoints + Math.floor(Math.random() * 10000),
        pointsEarned: tierPoints + Math.floor(Math.random() * 20000),
        pointsRedeemed: Math.floor(Math.random() * 5000),
        tierPoints,
        nextTierPoints: tier === 'elite' ? 0 : tier === 'platinum' ? 50000 : tier === 'gold' ? 25000 : tier === 'silver' ? 10000 : 5000,
        nextTier: tier === 'base' ? 'silver' : tier === 'silver' ? 'gold' : tier === 'gold' ? 'platinum' : 'elite',
        joinDate: `${2015 + Math.floor(Math.random() * 9)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        status: 'active',
        benefits: tier === 'elite' ? ['Lounge Access', 'Priority Check-in', 'Extra Baggage', 'Suite Class'] : tier === 'platinum' ? ['Lounge Access', 'Priority Boarding', 'Extra Baggage'] : tier === 'gold' ? ['Priority Boarding', 'Bonus Points'] : []
      },
      preferences: {
        seatPreference: ['window', 'aisle', 'middle'][Math.floor(Math.random() * 3)] === 'middle' ? [] : [['window', 'aisle'][Math.floor(Math.random() * 2)]],
        mealPreference: ['standard', 'vegetarian', 'halal', 'kosher'][Math.floor(Math.random() * 4)],
        language: 'en',
        notifications: { email: true, sms: true, push: false },
        specialAssistance: []
      },
      travelHistory: {
        totalFlights: 25 + Math.floor(Math.random() * 100),
        totalMiles: 50000 + Math.floor(Math.random() * 200000),
        totalSegments: 30 + Math.floor(Math.random() * 150),
        totalSpend: 5000 + Math.floor(Math.random() * 50000),
        averageSpendPerTrip: 200 + Math.floor(Math.random() * 500),
        favoriteRoutes: ['SIN-LHR', 'SIN-HND', 'SIN-SYD'],
        favoriteDestinations: ['London', 'Tokyo', 'Sydney'],
        lastYearFlights: 10 + Math.floor(Math.random() * 30),
        lastYearMiles: 20000 + Math.floor(Math.random() * 80000),
        lastYearSpend: 2000 + Math.floor(Math.random() * 20000),
        lifetimeValue: 10000 + Math.floor(Math.random() * 100000),
        churnRisk: tier === 'elite' ? 'low' : tier === 'platinum' ? 'low' : 'medium',
        nextBestAction: 'Book SIN-LHR to reach Platinum status'
      },
      segments: [{ segment: 'business', confidence: 0.8, assignedAt: new Date().toISOString(), criteria: ['frequent_business_travel'] }],
      status: 'active',
      createdAt: `${2015 + Math.floor(Math.random() * 9)}-01-15T00:00:00Z`,
      lastModified: new Date().toISOString()
    })
  })

  // ==================== PNRs (30+) ====================
  const pnrOrigins = ['SIN', 'JFK', 'LHR', 'HND', 'LAX', 'SYD', 'HKG', 'DXB', 'ICN', 'BKK']
  const bookingClasses = ['Y', 'J', 'F', 'B', 'M', 'C']
  const statuses: ('confirmed' | 'ticketed' | 'waitlist')[] = ['confirmed', 'ticketed', 'waitlist']

  for (let i = 0; i < 35; i++) {
    const origin = pnrOrigins[i % pnrOrigins.length]
    const destination = pnrOrigins[(i + 1) % pnrOrigins.length]
    const passengerName = customerNames[i % customerNames.length]
    const nameParts = passengerName.split(' ')
    const bookingClass = bookingClasses[i % bookingClasses.length]
    const baseFare = bookingClass === 'F' ? 8000 : bookingClass === 'J' ? 4500 : bookingClass === 'C' ? 3500 : bookingClass === 'B' ? 1800 : bookingClass === 'M' ? 1200 : 800
    
    store.pnrs.push({
      pnrNumber: `SQ${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      passengers: [{
        id: `PAX${i + 1}`,
        title: i % 2 === 0 ? 'Mr' : 'Mrs',
        firstName: nameParts[0],
        lastName: nameParts[1],
        dateOfBirth: '1985-05-15',
        passportNumber: `E${Math.floor(Math.random() * 900000000 + 100000000)}`,
        passportExpiry: '2030-05-15',
        nationality: 'SG',
        ssr: [],
        seatPreferences: 'window',
        mealPreference: 'halal'
      }],
      segments: [{
        id: `SEG${i + 1}`,
        flightNumber: `SQ${100 + i}`,
        airlineCode: 'SQ',
        origin,
        destination,
        departureDate: i < 10 ? today : i < 20 ? tomorrow : nextWeek,
        departureTime: '00:35',
        arrivalDate: tomorrow,
        arrivalTime: '06:35',
        aircraftType: 'B777-300ER',
        fareClass: bookingClass,
        fareBasis: `${bookingClass}EX`,
        status: 'confirmed',
        boardingClass: bookingClass === 'F' || bookingClass === 'J' || bookingClass === 'C' ? 'business' : 'economy'
      }],
      fareQuote: {
        baseFare,
        taxes: Math.round(baseFare * 0.15),
        fees: Math.round(baseFare * 0.05),
        total: Math.round(baseFare * 1.2),
        currency: 'SGD',
        fareRules: ['Non-refundable', 'Changes allowed with fee']
      },
      contactInfo: {
        email: `${nameParts[0].toLowerCase()}.${nameParts[1].toLowerCase()}@email.com`,
        phone: `+65${Math.floor(Math.random() * 90000000 + 10000000)}`,
        address: 'Singapore'
      },
      paymentInfo: {
        paymentMethod: 'credit_card',
        cardLastFour: String(Math.floor(Math.random() * 9000 + 1000)),
        amount: Math.round(baseFare * 1.2),
        currency: 'SGD'
      },
      bookingClass,
      agentId: `AG${Math.floor(Math.random() * 10 + 1)}`,
      agencyCode: 'SIN001',
      remarks: [],
      isGroup: false,
      source: i % 3 === 0 ? 'web' : i % 3 === 1 ? 'agent' : 'mobile',
      status: statuses[i % 3],
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      tickets: [],
      emds: []
    })
  }

  // ==================== TICKETS (30+) ====================
  store.pnrs.forEach((pnr, idx) => {
    pnr.passengers.forEach(passenger => {
      store.tickets.push({
        ticketNumber: `618-${Math.random().toString().substr(2, 10)}`,
        pnrNumber: pnr.pnrNumber,
        passengerId: passenger.id,
        passengerName: `${passenger.title} ${passenger.firstName} ${passenger.lastName}`,
        fare: pnr.fareQuote,
        segments: pnr.segments,
        taxes: [
          { code: 'SG', name: 'Singapore Airport Tax', amount: pnr.fareQuote.taxes * 0.5, currency: 'SGD' },
          { code: 'YQ', name: 'Fuel Surcharge', amount: pnr.fareQuote.taxes * 0.3, currency: 'SGD' },
          { code: 'XR', name: 'Security Fee', amount: pnr.fareQuote.taxes * 0.2, currency: 'SGD' }
        ],
        commission: {
          amount: pnr.fareQuote.total * 0.05,
          rate: 5,
          paidTo: 'SIN001'
        },
        validationAirline: 'SQ',
        refundable: false,
        changePenalty: 200,
        issuedAt: new Date().toISOString(),
        issuedBy: 'system',
        status: 'open'
      })
    })
  })

  // ==================== AGENCIES (15+) ====================
  const agencies = [
    { name: 'Singapore Travel Express', code: 'STE001', type: 'iata' as const, city: 'Singapore', country: 'Singapore', tier: 'platinum' as const },
    { name: 'Global Air Tickets', code: 'GAT002', type: 'iata' as const, city: 'London', country: 'UK', tier: 'gold' as const },
    { name: 'Asia Pacific Travel', code: 'APT003', type: 'iata' as const, city: 'Tokyo', country: 'Japan', tier: 'gold' as const },
    { name: 'European Tours Ltd', code: 'ETL004', type: 'iata' as const, city: 'Paris', country: 'France', tier: 'silver' as const },
    { name: 'Middle East Airways', code: 'MEA005', type: 'iata' as const, city: 'Dubai', country: 'UAE', tier: 'gold' as const },
    { name: 'Australian Flights', code: 'AFL006', type: 'ota' as const, city: 'Sydney', country: 'Australia', tier: 'silver' as const },
    { name: 'US Travel Hub', code: 'UTH007', type: 'corporate' as const, city: 'New York', country: 'USA', tier: 'platinum' as const },
    { name: 'EuroConnect Travel', code: 'ECT008', type: 'tmc' as const, city: 'Frankfurt', country: 'Germany', tier: 'silver' as const },
    { name: 'Asia Connect Online', code: 'ACO009', type: 'ota' as const, city: 'Hong Kong', country: 'Hong Kong', tier: 'bronze' as const },
    { name: 'Premium Corporate Travel', code: 'PCT010', type: 'corporate' as const, city: 'Singapore', country: 'Singapore', tier: 'platinum' as const },
    { name: 'Holiday Makers Pte Ltd', code: 'HMPL11', type: 'non_iata' as const, city: 'Singapore', country: 'Singapore', tier: 'bronze' as const },
    { name: 'Business Class Bookings', code: 'BCB012', type: 'iata' as const, city: 'Los Angeles', country: 'USA', tier: 'gold' as const },
    { name: 'Express Travel Asia', code: 'ETA013', type: 'iata' as const, city: 'Bangkok', country: 'Thailand', tier: 'silver' as const },
    { name: 'Sky High Consultants', code: 'SHC014', type: 'tmc' as const, city: 'Sydney', country: 'Australia', tier: 'gold' as const },
    { name: 'Elite Travel Solutions', code: 'ETS015', type: 'corporate' as const, city: 'London', country: 'UK', tier: 'platinum' as const },
  ]

  agencies.forEach((agency, idx) => {
    store.agencies.push({
      id: `AGY${String(idx + 1).padStart(3, '0')}`,
      code: agency.code,
      name: agency.name,
      type: agency.type,
      iataNumber: agency.type === 'iata' ? `TA${20240000 + idx}` : undefined,
      status: 'active',
      tier: agency.tier,
      address: {
        street: `${Math.floor(Math.random() * 500 + 1)} Main Street`,
        city: agency.city,
        state: '',
        country: agency.country,
        postalCode: String(Math.floor(Math.random() * 900000 + 100000))
      },
      contact: {
        primaryContact: 'John Doe',
        email: `info@${agency.code.toLowerCase()}.com`,
        phone: `+${agency.country === 'Singapore' ? '65' : '1'}${Math.floor(Math.random() * 90000000 + 10000000)}`
      },
      credit: {
        limit: agency.tier === 'platinum' ? 500000 : agency.tier === 'gold' ? 250000 : agency.tier === 'silver' ? 100000 : 50000,
        used: Math.floor(Math.random() * 50000),
        available: agency.tier === 'platinum' ? 500000 - Math.floor(Math.random() * 50000) : agency.tier === 'gold' ? 250000 - Math.floor(Math.random() * 25000) : 100000 - Math.floor(Math.random() * 10000),
        currency: 'SGD',
        terms: 30,
        autoBlock: true,
        autoBlockThreshold: 90
      },
      commission: {
        standard: agency.tier === 'platinum' ? 9 : agency.tier === 'gold' ? 7 : agency.tier === 'silver' ? 5 : 3,
        overrides: [],
        volumeBonus: []
      },
      permissions: {
        canBook: true,
        canTicket: true,
        canRefund: true,
        canExchange: true,
        canViewFares: true,
        canViewAllFares: true,
        canCreatePNR: true,
        canModifyPNR: true,
        canCancelPNR: true,
        maxBookingsPerDay: 100,
        maxPassengersPerBooking: 9,
        restrictedRoutes: [],
        allowedRoutes: [],
        paymentMethods: ['cash', 'credit_card', 'corporate_account']
      },
      performance: {
        totalBookings: 500 + Math.floor(Math.random() * 2000),
        totalRevenue: 500000 + Math.floor(Math.random() * 2000000),
        cancellationRate: Math.random() * 5,
        noShowRate: Math.random() * 3,
        lastBooking: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString()
      },
      wallet: {
        balance: agency.tier === 'platinum' ? 100000 : agency.tier === 'gold' ? 50000 : 10000,
        currency: 'SGD',
        transactions: []
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    })
  })

  // ==================== ANCILLARY PRODUCTS (10+) ====================
  const ancillaryProducts = [
    { name: 'Extra Legroom Seat', code: 'SEAT-LEG', category: 'seat' as const, price: 120 },
    { name: 'Standard Seat Selection', code: 'SEAT-STD', category: 'seat' as const, price: 35 },
    { name: 'Extra Baggage 20kg', code: 'BAG-EXT20', category: 'baggage' as const, price: 80 },
    { name: 'Extra Baggage 30kg', code: 'BAG-EXT30', category: 'baggage' as const, price: 120 },
    { name: 'Priority Boarding', code: 'PRIO-BRD', category: 'other' as const, price: 25 },
    { name: 'KrisFirs Lounge Access', code: 'Lounge-SIN', category: 'lounge' as const, price: 150 },
    { name: 'Premium Meal Selection', code: 'MEAL-PRE', category: 'meal' as const, price: 45 },
    { name: 'KrisFlyer Miles Redemption', code: 'Miles-RED', category: 'other' as const, price: 0 },
    { name: 'Travel Insurance Basic', code: 'INS-BAS', category: 'insurance' as const, price: 50 },
    { name: 'Travel Insurance Premium', code: 'INS-PRE', category: 'insurance' as const, price: 120 },
    { name: 'Wi-Fi 1 Hour', code: 'WIFI-1H', category: 'wifi' as const, price: 15 },
    { name: 'Wi-Fi Full Flight', code: 'WIFI-FULL', category: 'wifi' as const, price: 32 },
  ]

  ancillaryProducts.forEach((product, idx) => {
    store.ancillaryProducts.push({
      id: `ANC${String(idx + 1).padStart(3, '0')}`,
      code: product.code,
      name: product.name,
      category: product.category,
      description: `${product.name} - Available on all Singapore Airlines flights`,
      price: product.price,
      currency: 'SGD',
      taxIncluded: true,
      applicableRoutes: ['*'],
      applicableCabins: ['economy', 'business', 'first'],
      applicableFares: ['*'],
      restrictions: [],
      availability: 'Available',
      commissionEligible: true,
      commissionRate: 5
    })
  })

  // ==================== BUNDLES (5+) ====================
  store.bundles = [
    { id: 'BND001', name: 'KrisFlyer Starter', code: 'KFS', description: 'Extra baggage + Priority boarding', products: ['BAG-EXT20', 'PRIO-BRD'], totalPrice: 90, savings: 15, currency: 'SGD', targetSegment: 'leisure', validity: 'Valid for 12 months', terms: ['Non-refundable'] },
    { id: 'BND002', name: 'Business Bundle', code: 'BIZ', description: 'Lounge access + Wi-Fi + Extra baggage', products: ['Lounge-SIN', 'WIFI-FULL', 'BAG-EXT20'], totalPrice: 220, savings: 45, currency: 'SGD', targetSegment: 'business', validity: 'Valid for 12 months', terms: ['Refundable'] },
    { id: 'BND003', name: 'Family Saver', code: 'FAM', description: 'Extra baggage for family + Meals', products: ['BAG-EXT30', 'MEAL-PRE'], totalPrice: 150, savings: 25, currency: 'SGD', targetSegment: 'family', validity: 'Valid for 6 months', terms: ['Non-refundable'] },
    { id: 'BND004', name: 'Premium Experience', code: 'PMX', description: 'Lounge + Wi-Fi + Seat + Insurance', products: ['Lounge-SIN', 'WIFI-FULL', 'SEAT-LEG', 'INS-PRE'], totalPrice: 290, savings: 65, currency: 'SGD', targetSegment: 'vip', validity: 'Valid for 12 months', terms: ['Fully refundable'] },
    { id: 'BND005', name: 'Connect & Travel', code: 'CNT', description: 'Wi-Fi + Entertainment pass', products: ['WIFI-1H'], totalPrice: 12, savings: 3, currency: 'SGD', targetSegment: 'leisure', validity: 'Valid for single flight', terms: ['Non-refundable'] },
  ]

  // ==================== PROMO CODES (5+) ====================
  store.promoCodes = [
    { code: 'KRISTIME', type: 'percentage' as const, value: 15, minSpend: 500, maxDiscount: 500, applicableRoutes: ['*'], applicableFares: ['Y', 'B', 'M'], validFrom: '2024-01-01', validUntil: '2024-12-31', usageLimit: 10000, usedCount: 3450, perCustomerLimit: 3, active: true, terms: ['Valid for Singapore residents'] },
    { code: 'SINGAPORE100', type: 'fixed' as const, value: 100, minSpend: 800, maxDiscount: 100, applicableRoutes: ['SIN-*'], applicableFares: ['*'], validFrom: '2024-01-01', validUntil: '2024-06-30', usageLimit: 5000, usedCount: 1200, perCustomerLimit: 2, active: true, terms: ['Valid on all SIN departures'] },
    { code: 'FIRSTCLASS25', type: 'percentage' as const, value: 25, minSpend: 3000, maxDiscount: 1000, applicableRoutes: ['*'], applicableFares: ['F', 'J'], validFrom: '2024-01-01', validUntil: '2024-12-31', usageLimit: 1000, usedCount: 250, perCustomerLimit: 1, active: true, terms: ['First and Business class only'] },
    { code: 'FLYAWAY10', type: 'percentage' as const, value: 10, minSpend: 300, maxDiscount: 200, applicableRoutes: ['*'], applicableFares: ['*'], validFrom: '2024-03-01', validUntil: '2024-05-31', usageLimit: 20000, usedCount: 8500, perCustomerLimit: 5, active: true, terms: ['Promotional fare'] },
    { code: 'CORPORATE20', type: 'percentage' as const, value: 20, minSpend: 5000, maxDiscount: 2000, applicableRoutes: ['*'], applicableFares: ['*'], validFrom: '2024-01-01', validUntil: '2024-12-31', usageLimit: 500, usedCount: 120, perCustomerLimit: 10, active: true, terms: ['Corporate accounts only'] },
  ]

  // ==================== MAINTENANCE RECORDS (10+) ====================
  const maintenanceRecords = [
    { aircraft: '9V-SWA', type: 'scheduled' as const, category: 'a-check' as const, description: 'Routine A-Check inspection', priority: 'medium' as const, station: 'SIN' },
    { aircraft: '9V-SWB', type: 'scheduled' as const, category: 'b-check' as const, description: 'Routine B-Check inspection', priority: 'medium' as const, station: 'SIN' },
    { aircraft: '9V-MWA', type: 'scheduled' as const, category: 'line_maintenance' as const, description: 'Line maintenance check', priority: 'low' as const, station: 'SIN' },
    { aircraft: '9V-SJA', type: 'unscheduled' as const, category: 'line_maintenance' as const, description: 'Engine vibration issue', priority: 'high' as const, station: 'LHR' },
    { aircraft: '9V-SJB', type: 'scheduled' as const, category: 'c-check' as const, description: 'Comprehensive C-Check', priority: 'medium' as const, station: 'SIN' },
    { aircraft: '9V-SWC', type: 'inspection' as const, category: 'a-check' as const, description: 'Annual A-Check inspection', priority: 'medium' as const, station: 'SIN' },
    { aircraft: '9V-MWB', type: 'repair' as const, category: 'line_maintenance' as const, description: 'Hydraulic system repair', priority: 'high' as const, station: 'HKG' },
    { aircraft: '9V-SWD', type: 'modification' as const, category: 'd-check' as const, description: 'Cabin interior modification', priority: 'low' as const, station: 'SIN' },
    { aircraft: '9V-SWE', type: 'scheduled' as const, category: 'a-check' as const, description: 'Routine A-Check', priority: 'medium' as const, station: 'SIN' },
    { aircraft: '9V-MWA', type: 'scheduled' as const, category: 'b-check' as const, description: 'B-Check inspection', priority: 'medium' as const, station: 'SIN' },
    { aircraft: '9V-MWB', type: 'unscheduled' as const, category: 'line_maintenance' as const, description: 'Lavatory service', priority: 'low' as const, station: 'DXB' },
  ]

  maintenanceRecords.forEach((record, idx) => {
    store.maintenanceRecords.push({
      id: `MNT${String(idx + 1).padStart(3, '0')}`,
      aircraftRegistration: record.aircraft,
      aircraftType: record.aircraft.includes('9V-SJ') ? 'B787-10' : record.aircraft.includes('9V-MW') ? 'A350-900' : 'B777-300ER',
      type: record.type,
      category: record.category,
      description: record.description,
      status: idx < 5 ? 'in_progress' : idx < 8 ? 'pending' : 'completed',
      priority: record.priority,
      scheduledStart: new Date(Date.now() - idx * 86400000).toISOString().split('T')[0],
      scheduledEnd: new Date(Date.now() + (5 - idx) * 86400000).toISOString().split('T')[0],
      actualStart: idx < 5 ? new Date().toISOString() : undefined,
      station: record.station,
      hangar: record.station === 'SIN' ? 'Hangar 1' : undefined,
      assignedTo: [`MECH${2024001 + idx}`, `MECH${2024002 + idx}`],
      workOrderNumber: `WO-2024-${String(1000 + idx).padStart(4, '0')}`,
      tasks: [
        { id: `T${idx * 3 + 1}`, description: 'Visual inspection', status: 'completed', completedBy: `MECH${2024001 + idx}`, completedAt: new Date().toISOString() },
        { id: `T${idx * 3 + 2}`, description: 'System check', status: idx < 3 ? 'in_progress' : 'pending' },
        { id: `T${idx * 3 + 3}`, description: 'Documentation', status: 'pending' }
      ],
      partsUsed: [],
      laborHours: 40 + Math.floor(Math.random() * 80),
      cost: 50000 + Math.floor(Math.random() * 100000),
      signOff: idx >= 8 ? { mechanic: 'MECH001', inspector: 'INS001', timestamp: new Date().toISOString() } : undefined,
      adCompliance: []
    })
  })

  // ==================== PARTS INVENTORY (15+) ====================
  const parts = [
    { name: 'Engine Oil Qulton', partNumber: 'OIL-QTL-001', category: 'Consumables', manufacturer: 'Qulton', quantity: 100, minStock: 50, unitCost: 150 },
    { name: 'Brake Pad Assembly', partNumber: 'BRK-PAD-777', category: 'Wear Items', manufacturer: 'Messier-Bugatti', quantity: 20, minStock: 10, unitCost: 15000 },
    { name: 'Avionics Computer Unit', partNumber: 'AVN-CPU-350', category: 'Avionics', manufacturer: 'Honeywell', quantity: 8, minStock: 4, unitCost: 85000 },
    { name: 'Emergency Exit Slide', partNumber: 'EXIT-SLD-001', category: 'Safety Equipment', manufacturer: 'Airbus', quantity: 15, minStock: 8, unitCost: 45000 },
    { name: 'Passenger Seat Economy', partNumber: 'SEAT-ECON-001', category: 'Interior', manufacturer: 'Recaro', quantity: 50, minStock: 20, unitCost: 3500 },
    { name: 'Passenger Seat Business', partNumber: 'SEAT-BIZ-001', category: 'Interior', manufacturer: 'Safran', quantity: 25, minStock: 10, unitCost: 25000 },
    { name: 'Landing Gear Tire', partNumber: 'TIRE-LG-777', category: 'Wear Items', manufacturer: 'Michelin', quantity: 30, minStock: 15, unitCost: 8000 },
    { name: 'APU Battery Pack', partNumber: 'APU-BAT-001', category: 'Power Systems', manufacturer: 'Securaplane', quantity: 12, minStock: 6, unitCost: 22000 },
    { name: 'Navigation Display', partNumber: 'NAV-DISP-001', category: 'Avionics', manufacturer: 'Collins', quantity: 6, minStock: 3, unitCost: 120000 },
    { name: 'Water Waste Tank', partNumber: 'WTR-TNK-001', category: 'Plumbing', manufacturer: 'Diehl', quantity: 10, minStock: 5, unitCost: 18000 },
    { name: 'Oxygen Bottle Assembly', partNumber: 'OXY-BOT-001', category: 'Safety Equipment', manufacturer: 'B/E Aerospace', quantity: 40, minStock: 20, unitCost: 2500 },
    { name: 'Cargo Container', partNumber: 'CARGO-CNT-001', category: 'Cargo', manufacturer: 'Nordic', quantity: 100, minStock: 50, unitCost: 5000 },
    { name: 'IFE Server Unit', partNumber: 'IFE-SRV-001', category: 'Entertainment', manufacturer: 'Panasonic', quantity: 5, minStock: 2, unitCost: 250000 },
    { name: 'Cockpit Door Lock', partNumber: 'COCK-DOR-001', category: 'Security', manufacturer: 'Airbus', quantity: 20, minStock: 10, unitCost: 35000 },
    { name: 'Cargo Door Actuator', partNumber: 'CRG-ACT-001', category: 'Actuators', manufacturer: 'Honeywell', quantity: 8, minStock: 4, unitCost: 45000 },
  ]

  parts.forEach((part, idx) => {
    store.parts.push({
      partNumber: part.partNumber,
      name: part.name,
      description: `${part.name} for ${part.category}`,
      category: part.category,
      manufacturer: part.manufacturer,
      quantityOnHand: part.quantity,
      minimumStock: part.minStock,
      reorderQuantity: part.minStock,
      unitCost: part.unitCost,
      location: `Warehouse ${String.fromCharCode(65 + (idx % 6))}-${Math.floor(idx / 6) + 1}`,
      serialTracking: part.unitCost > 10000,
      aircraftApplicability: ['B777-300ER', 'B787-10', 'A350-900', 'A380-800']
    })
  })

  // ==================== REVENUE DATA (20+) ====================
  const revenueRoutes = [
    { route: 'SIN-JFK', origin: 'SIN', destination: 'JFK' },
    { route: 'SIN-LHR', origin: 'SIN', destination: 'LHR' },
    { route: 'SIN-HND', origin: 'SIN', destination: 'HND' },
    { route: 'SIN-LAX', origin: 'SIN', destination: 'LAX' },
    { route: 'SIN-SYD', origin: 'SIN', destination: 'SYD' },
    { route: 'SIN-HKG', origin: 'SIN', destination: 'HKG' },
    { route: 'SIN-DXB', origin: 'SIN', destination: 'DXB' },
    { route: 'SIN-ICN', origin: 'SIN', destination: 'ICN' },
    { route: 'SIN-BKK', origin: 'SIN', destination: 'BKK' },
    { route: 'SIN-MEL', origin: 'SIN', destination: 'MEL' },
    { route: 'SIN-FRA', origin: 'SIN', destination: 'FRA' },
    { route: 'SIN-MNL', origin: 'SIN', destination: 'MNL' },
    { route: 'SIN-PER', origin: 'SIN', destination: 'PER' },
    { route: 'SIN-KUL', origin: 'SIN', destination: 'KUL' },
    { route: 'SIN-ORD', origin: 'SIN', destination: 'ORD' },
    { route: 'SIN-SFO', origin: 'SIN', destination: 'SFO' },
  ]

  revenueRoutes.forEach((r, idx) => {
    for (let d = 0; d < 7; d++) {
      const date = new Date(Date.now() - d * 86400000).toISOString().split('T')[0]
      const passengers = 150 + Math.floor(Math.random() * 150)
      const baseFare = r.route.includes('JFK') || r.route.includes('LAX') || r.route.includes('SFO') || r.route.includes('ORD') ? 2500 : r.route.includes('LHR') || r.route.includes('FRA') ? 2000 : r.route.includes('HND') || r.route.includes('ICN') ? 1200 : 800
      
      store.revenueData.push({
        route: r.route,
        origin: r.origin,
        destination: r.destination,
        date,
        flightNumber: `SQ${100 + idx}`,
        passengers,
        loadFactor: Math.round((passengers / 300) * 100),
        revenue: passengers * baseFare,
        yield: baseFare / 10,
        rask: baseFare / 12,
        cargoRevenue: Math.floor(Math.random() * 50000),
        ancillaryRevenue: Math.floor(Math.random() * 30000),
        totalRevenue: passengers * baseFare + Math.floor(Math.random() * 80000),
        costs: passengers * baseFare * 0.65,
        profit: passengers * baseFare * 0.35,
        margin: 35,
        forecast: {
          predictedLoad: 75 + Math.floor(Math.random() * 20),
          predictedRevenue: passengers * baseFare * 1.1,
          confidence: 0.75 + Math.random() * 0.2,
          demandTrend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any,
          recommendedActions: ['Increase frequency', 'Adjust pricing', 'Maintain current strategy']
        }
      })
    }
  })

  // ==================== CAMPAIGNS (5+) ====================
  const campaigns = [
    { name: 'KrisFlyer Double Miles', type: 'email' as const, status: 'active' as const, subject: 'Earn Double KrisFlyer Miles!' },
    { name: 'Business Class Sale', type: 'email' as const, status: 'active' as const, subject: 'Up to 30% Off Business Class' },
    { name: 'Premium Economy Launch', type: 'multi_channel' as const, status: 'scheduled' as const, subject: 'Introducing Premium Economy' },
    { name: 'Holiday Travel Deals', type: 'sms' as const, status: 'draft' as const, subject: 'Holiday Deals Inside' },
    { name: 'First Class Experience', type: 'push' as const, status: 'completed' as const, subject: 'Experience the Suites' },
  ]

  campaigns.forEach((campaign, idx) => {
    store.campaigns.push({
      id: `CMP${String(idx + 1).padStart(3, '0')}`,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      targetSegments: ['business', 'leisure', 'frequent_flyer'],
      targetTiers: ['silver', 'gold', 'platinum', 'elite'],
      message: {
        subject: campaign.subject,
        body: `Dear Member,\n\n${campaign.name}\n\nBook now and enjoy exclusive benefits with Singapore Airlines.`,
        template: `campaign-${idx + 1}`
      },
      schedule: {
        startDate: idx < 3 ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        sendTime: '09:00',
        frequency: 'once'
      },
      metrics: {
        sent: campaign.status === 'completed' ? 50000 : 0,
        delivered: campaign.status === 'completed' ? 48000 : 0,
        opened: campaign.status === 'completed' ? 24000 : 0,
        clicked: campaign.status === 'completed' ? 4800 : 0,
        converted: campaign.status === 'completed' ? 480 : 0,
        unsubscribed: campaign.status === 'completed' ? 120 : 0
      },
      createdBy: 'system',
      createdAt: new Date().toISOString()
    })
  })

  // ==================== COMPLAINTS (5+) ====================
  const complaints = [
    { category: 'flight_delay', subject: 'Flight SQ21 delayed 3 hours', severity: 'high' as const },
    { category: 'baggage', subject: 'Baggage lost on arrival', severity: 'high' as const },
    { category: 'service', subject: 'Poor cabin service', severity: 'medium' as const },
    { category: 'booking', subject: 'Unable to change booking', severity: 'medium' as const },
    { category: 'refund', subject: 'Refund not processed', severity: 'high' as const },
    { category: 'cancellation', subject: 'Flight cancellation issue', severity: 'critical' as const },
  ]

  complaints.forEach((complaint, idx) => {
    store.logComplaint({
      customerId: `CUST${String(idx + 1).padStart(4, '0')}`,
      customerName: customerNames[idx],
      category: complaint.category as any,
      subject: complaint.subject,
      description: `${complaint.subject} - Customer reporting issues.`,
      severity: complaint.severity,
      channel: idx % 3 === 0 ? 'email' : idx % 3 === 1 ? 'phone' : 'web',
      pnrNumber: store.pnrs[idx]?.pnrNumber,
      flightNumber: `SQ${100 + idx}`,
      flightDate: today,
      priority: complaint.severity === 'critical' ? 1 : complaint.severity === 'high' ? 2 : 3,
      sla: '48 hours',
      compensation: complaint.severity === 'high' || complaint.severity === 'critical' ? { type: 'voucher', amount: 200, currency: 'SGD' } : undefined
    })
  })

  // ==================== FARE BASIS (20+) ====================
  const fareBasisData = [
    { code: 'F', name: 'First Class Full', bookingClass: 'F', cabin: 'first' as const, baseFare: 8500 },
    { code: 'A', name: 'First Class Discount', bookingClass: 'A', cabin: 'first' as const, baseFare: 6500 },
    { code: 'J', name: 'Business Class Full', bookingClass: 'J', cabin: 'business' as const, baseFare: 4500 },
    { code: 'C', name: 'Business Class Flex', bookingClass: 'C', cabin: 'business' as const, baseFare: 3800 },
    { code: 'D', name: 'Business Class Promo', bookingClass: 'D', cabin: 'business' as const, baseFare: 2800 },
    { code: 'Y', name: 'Economy Full', bookingClass: 'Y', cabin: 'economy' as const, baseFare: 1200 },
    { code: 'B', name: 'Economy Flex', bookingClass: 'B', cabin: 'economy' as const, baseFare: 980 },
    { code: 'M', name: 'Economy Semi-Flex', bookingClass: 'M', cabin: 'economy' as const, baseFare: 750 },
    { code: 'E', name: 'Economy Basic', bookingClass: 'E', cabin: 'economy' as const, baseFare: 550 },
    { code: 'Q', name: 'Economy Saver', bookingClass: 'Q', cabin: 'economy' as const, baseFare: 420 },
    { code: 'K', name: 'Economy Promo', bookingClass: 'K', cabin: 'economy' as const, baseFare: 320 },
    { code: 'H', name: 'Economy Light', bookingClass: 'H', cabin: 'economy' as const, baseFare: 280 },
    { code: 'L', name: 'Economy Value', bookingClass: 'L', cabin: 'economy' as const, baseFare: 220 },
    { code: 'T', name: 'Economy Basic', bookingClass: 'T', cabin: 'economy' as const, baseFare: 180 },
    { code: 'N', name: 'Economy Ultra Low', bookingClass: 'N', cabin: 'economy' as const, baseFare: 120 },
  ]

  fareBasisData.forEach((fare, idx) => {
    store.fareBasis.push({
      code: fare.code,
      name: fare.name,
      bookingClass: fare.bookingClass,
      cabin: fare.cabin,
      fareFamily: fare.cabin === 'first' ? 'First Suite' : fare.cabin === 'business' ? 'Business Class' : 'Economy Flex',
      baseFare: fare.baseFare,
      currency: 'SGD',
      advancePurchase: fare.cabin === 'economy' ? 14 : 0,
      minStay: fare.cabin === 'economy' ? '3' : '0',
      maxStay: '365',
      changeable: fare.cabin !== 'economy',
      changeFee: fare.cabin === 'economy' ? 150 : 0,
      refundable: fare.cabin === 'first' || fare.cabin === 'business',
      refundFee: fare.cabin === 'economy' ? 200 : 0,
      seasonality: [],
      routing: 'SIN-*',
      blackouts: [],
      effectiveDate: '2024-01-01'
    })
  })

  // ==================== INVENTORY BLOCKS (15+) ====================
  const inventoryBlocksData = [
    { agentId: 'AGT001', agentName: 'Corporate Travel Co', route: 'SIN-LHR', cabin: 'business' as const, seats: 10 },
    { agentId: 'AGT002', agentName: 'Global Tours', route: 'SIN-TYO', cabin: 'economy' as const, seats: 15 },
    { agentId: 'AGT003', agentName: 'Elite Travel', route: 'SIN-SYD', cabin: 'business' as const, seats: 8 },
    { agentId: 'AGT001', agentName: 'Corporate Travel Co', route: 'SIN-HKG', cabin: 'economy' as const, seats: 20 },
    { agentId: 'AGT004', agentName: 'Budget Flights', route: 'SIN-BKK', cabin: 'economy' as const, seats: 25 },
    { agentId: 'AGT002', agentName: 'Global Tours', route: 'SIN-DXB', cabin: 'business' as const, seats: 6 },
    { agentId: 'AGT005', agentName: 'Premium Travel', route: 'SIN-LAX', cabin: 'first' as const, seats: 4 },
  ]

  inventoryBlocksData.forEach((block, idx) => {
    store.inventoryBlocks.push({
      id: `BLK${String(idx + 1).padStart(3, '0')}`,
      agentId: block.agentId,
      route: block.route,
      date: today,
      cabin: block.cabin,
      seats: block.seats,
      createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
      expiresAt: new Date(Date.now() + (7 - idx) * 86400000).toISOString()
    })
  })

  // ==================== GROUP ALLOTMENTS (10+) ====================
  const groupAllotmentsData = [
    { groupName: 'Tech Conference 2024', corporateId: 'CORP001', route: 'SIN-LHR', cabin: 'economy' as const, totalSeats: 50, fareClass: 'Y' },
    { groupName: 'Medical Summit', corporateId: 'CORP002', route: 'SIN-TYO', cabin: 'business' as const, totalSeats: 30, fareClass: 'C' },
    { groupName: 'Annual Sales Meeting', corporateId: 'CORP003', route: 'SIN-SYD', cabin: 'economy' as const, totalSeats: 40, fareClass: 'B' },
    { groupName: 'Executive Retreat', corporateId: 'CORP004', route: 'SIN-DXB', cabin: 'business' as const, totalSeats: 20, fareClass: 'J' },
    { groupName: 'University Exchange', corporateId: 'CORP005', route: 'SIN-LAX', cabin: 'economy' as const, totalSeats: 60, fareClass: 'M' },
    { groupName: 'Sports Team', corporateId: 'CORP006', route: 'SIN-MEL', cabin: 'economy' as const, totalSeats: 25, fareClass: 'Y' },
  ]

  groupAllotmentsData.forEach((allotment, idx) => {
    store.groupAllotments.push({
      id: `GRP${String(idx + 1).padStart(3, '0')}`,
      groupName: allotment.groupName,
      corporateId: allotment.corporateId,
      route: allotment.route,
      departureDate: nextWeek,
      returnDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      cabin: allotment.cabin,
      totalSeats: allotment.totalSeats,
      bookedSeats: Math.floor(allotment.totalSeats * Math.random() * 0.8),
      fareClass: allotment.fareClass,
      status: 'active' as const
    })
  })

  // ==================== BLACKOUT DATES (10+) ====================
  const blackoutDatesData = [
    { route: 'SIN-LHR', startDate: '2024-12-20', endDate: '2024-12-26', cabin: 'economy' as const, reason: 'Holiday Peak Season' },
    { route: 'SIN-TYO', startDate: '2024-12-31', endDate: '2025-01-02', cabin: 'economy' as const, reason: 'New Year Holiday' },
    { route: 'SIN-SYD', startDate: '2024-12-24', endDate: '2024-12-26', cabin: 'business' as const, reason: 'Christmas Period' },
    { route: 'SIN-LAX', startDate: '2024-07-01', endDate: '2024-08-31', cabin: 'economy' as const, reason: 'Summer Peak' },
    { route: 'SIN-HKG', startDate: '2024-02-10', endDate: '2024-02-15', cabin: 'economy' as const, reason: 'Chinese New Year' },
    { route: 'SIN-DXB', startDate: '2024-12-20', endDate: '2024-12-31', cabin: 'business' as const, reason: 'Holiday Travel' },
  ]

  blackoutDatesData.forEach((blackout, idx) => {
    store.blackoutDates.push({
      id: `BOD${String(idx + 1).padStart(3, '0')}`,
      route: blackout.route,
      startDate: blackout.startDate,
      endDate: blackout.endDate,
      cabin: blackout.cabin,
      reason: blackout.reason
    })
  })

  // ==================== FARE FAMILIES (5+) ====================
  const fareFamiliesData = [
    { name: 'First Suite', cabin: 'first' as const, fareClasses: ['F', 'A'], features: ['Private suite', 'Fully flat bed', 'Priority check-in', 'Lounge access'] },
    { name: 'Business Class', cabin: 'business' as const, fareClasses: ['J', 'C', 'D'], features: ['Reclining seat', 'Priority boarding', 'Extra baggage', 'Lounge access'] },
    { name: 'Economy Flex', cabin: 'economy' as const, fareClasses: ['Y', 'B', 'M'], features: ['Standard seat', 'Changeable', 'Refundable', 'Extra miles'] },
    { name: 'Economy Saver', cabin: 'economy' as const, fareClasses: ['E', 'Q', 'K'], features: ['Basic seat', 'Limited changes', 'No refunds'] },
    { name: 'Economy Basic', cabin: 'economy' as const, fareClasses: ['H', 'L', 'T', 'N'], features: ['Basic seat', 'No changes', 'No refunds', 'Minimum miles'] },
  ]

  fareFamiliesData.forEach((family, idx) => {
    const baseMarkup = family.cabin === 'first' ? 25 : family.cabin === 'business' ? 15 : 5
    store.fareFamilies.push({
      id: `FF${idx + 1}`,
      name: family.name,
      cabin: family.cabin,
      fareClasses: family.fareClasses,
      features: family.features,
      createdAt: new Date().toISOString(),
      pricingRules: {
        baseMarkup,
        seasonalMultiplier: 1.0,
        demandThreshold: 80
      }
    })
  })

  // ==================== INTEGRATIONS (10+) ====================
  const integrations = [
    { name: 'Amadeus GDS', type: 'gds' as const, provider: 'amadeus' as const, status: 'active' as const },
    { name: 'Sabre GDS', type: 'gds' as const, provider: 'sabre' as const, status: 'active' as const },
    { name: 'Travelport GDS', type: 'gds' as const, provider: 'travelport' as const, status: 'active' as const },
    { name: 'Stripe Payments', type: 'payment' as const, provider: 'stripe' as const, status: 'active' as const },
    { name: 'PayPal', type: 'payment' as const, provider: 'paypal' as const, status: 'active' as const },
    { name: 'Cargo Management System', type: 'airport' as const, provider: 'other' as const, status: 'active' as const },
    { name: 'SAP Accounting', type: 'accounting' as const, provider: 'sap' as const, status: 'active' as const },
    { name: 'Salesforce CRM', type: 'crm' as const, provider: 'salesforce' as const, status: 'active' as const },
    { name: 'KrisFlyer Loyalty', type: 'loyalty' as const, provider: 'other' as const, status: 'active' as const },
    { name: 'FlightStats', type: 'other' as const, provider: 'other' as const, status: 'active' as const },
  ]

  integrations.forEach((integration, idx) => {
    store.integrations.push({
      id: `INT${String(idx + 1).padStart(3, '0')}`,
      name: integration.name,
      type: integration.type,
      provider: integration.provider,
      status: integration.status,
      endpoint: `https://api.${integration.provider === 'amadeus' ? 'amadeus' : integration.provider === 'sabre' ? 'sabre' : integration.provider === 'stripe' ? 'stripe' : 'airline'}.com/v1`,
      lastSync: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      lastSyncStatus: Math.random() > 0.1 ? 'success' as const : 'partial' as const,
      metrics: {
        requestsToday: Math.floor(Math.random() * 10000),
        requestsTotal: Math.floor(Math.random() * 1000000),
        errorsToday: Math.floor(Math.random() * 50),
        errorsTotal: Math.floor(Math.random() * 500),
        averageResponseTime: 100 + Math.floor(Math.random() * 400)
      },
      credentials: { apiKey: 'mock-key' },
      configuration: { timeout: 30000 },
      webhooks: []
    })
  })

  // ==================== USERS (10+) ====================
  const users = [
    { firstName: 'System', lastName: 'Administrator', role: 'admin', department: 'IT', username: 'admin' },
    { firstName: 'Sarah', lastName: 'Tan', role: 'agent', department: 'Sales', username: 'stan' },
    { firstName: 'Michael', lastName: 'Lee', role: 'agent', department: 'Sales', username: 'mlee' },
    { firstName: 'Jennifer', lastName: 'Wong', role: 'supervisor', department: 'Operations', username: 'jwong' },
    { firstName: 'David', lastName: 'Chua', role: 'manager', department: 'Revenue', username: 'dchua' },
    { firstName: 'Lisa', lastName: 'Ang', role: 'analyst', department: 'Analytics', username: 'lang' },
    { firstName: 'James', lastName: 'Goh', role: 'agent', department: 'Check-in', username: 'jgoh' },
    { firstName: 'Grace', lastName: 'Lim', role: 'agent', department: 'Customer Service', username: 'glim' },
    { firstName: 'Kevin', lastName: 'Ng', role: 'manager', department: 'Crew', username: 'kng' },
    { firstName: 'Michelle', lastName: 'Teo', role: 'admin', department: 'Finance', username: 'mteo' },
  ]

  users.forEach((user, idx) => {
    store.users.push({
      id: `USR${String(idx + 1).padStart(3, '0')}`,
      username: user.username,
      email: `${user.username}@singaporeair.com.sg`,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.role === 'admin' ? [{ module: '*', actions: ['*'] }] : [
        { module: 'pss', actions: ['create', 'read', 'update'] },
        { module: 'dcs', actions: ['read'] }
      ],
      department: user.department,
      location: 'SIN',
      mfaEnabled: user.role === 'admin',
      status: 'active',
      lastLogin: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 365).toISOString(),
      sessions: []
    })
  })

  // ==================== SUSTAINABILITY METRICS ====================
  store.recordSustainabilityMetrics({
    period: '2024-Q1',
    flights: 15000,
    fuelConsumed: 350000000,
    co2Emissions: 110250000,
    co2PerPaxKm: 0.092,
    co2PerTonneKm: 0.510,
    efficiency: 88,
    carbonOffsetsSold: 25000,
    carbonOffsetsRetired: 15000,
    renewableEnergy: 45,
    wasteRecycled: 78,
    targets: {
      fuelEfficiency: { current: 88, target: 92, year: 2025 },
      co2Reduction: { current: -8, target: -15, year: 2030 },
      renewableEnergy: { current: 45, target: 60, year: 2025 }
    },
    initiatives: [
      { id: 'SUST01', name: 'SAF Blending Program', type: 'fuel' as const, description: 'Sustainable Aviation Fuel adoption', status: 'active' as const, startDate: '2023-01-01', investment: 50000000, savings: { fuel: 50000, co2: 15000, cost: 200000 }, progress: 35 },
      { id: 'SUST02', name: 'Fleet Modernization', type: 'fleet' as const, description: 'New fuel-efficient aircraft', status: 'active' as const, startDate: '2022-01-01', investment: 5000000000, savings: { fuel: 5000000, co2: 1575000, cost: 15000000 }, progress: 60 },
      { id: 'SUST03', name: 'Ground Support Electrification', type: 'operations' as const, description: 'Electric ground vehicles', status: 'planned' as const, startDate: '2025-01-01', investment: 20000000, savings: { fuel: 5000, co2: 1500, cost: 50000 }, progress: 0 }
    ]
  })

  // ==================== KPI DASHBOARD ====================
  store.kpiDashboard = {
    period: 'today',
    metrics: {
      bookings: { total: store.pnrs.length, change: 12, trend: 'up' as any },
      passengers: { total: store.pnrs.reduce((sum, p) => sum + p.passengers.length, 0), change: 15, trend: 'up' as any },
      revenue: { total: store.tickets.reduce((sum, t) => sum + t.fare.total, 0), change: 18, trend: 'up' as any },
      loadFactor: { value: 78.5, change: 2.5, trend: 'up' as any },
      yield: { value: 0.15, change: 0.01, trend: 'up' as any },
      ancillaryRevenue: { total: store.emds.reduce((sum, e) => sum + e.amount, 0), change: 22, trend: 'up' as any },
      onTimePerformance: { value: 92.3, change: 1.2, trend: 'up' as any },
      cancellations: { count: 3, rate: 1.2, change: -0.5, trend: 'down' as any }
    },
    topRoutes: [
      { route: 'SIN-LHR', origin: 'SIN', destination: 'LHR', flights: 28, passengers: 8400, loadFactor: 87.5, revenue: 4200000, yield: 0.18, growth: 5.2 },
      { route: 'SIN-JFK', origin: 'SIN', destination: 'JFK', flights: 21, passengers: 6300, loadFactor: 85.0, revenue: 3780000, yield: 0.22, growth: 3.8 },
      { route: 'SIN-HND', origin: 'SIN', destination: 'HND', flights: 28, passengers: 9800, loadFactor: 91.2, revenue: 2940000, yield: 0.12, growth: 8.5 },
    ],
    topAgents: [
      { agentId: 'AG001', agentCode: 'STE001', agentName: 'Singapore Travel Express', bookings: 450, passengers: 1200, revenue: 850000, commission: 42500, growth: 15.2 },
      { agentId: 'AG002', agentCode: 'GAT002', agentName: 'Global Air Tickets', bookings: 380, passengers: 950, revenue: 680000, commission: 34000, growth: 8.5 },
      { agentId: 'AG003', agentCode: 'APT003', agentName: 'Asia Pacific Travel', bookings: 320, passengers: 780, revenue: 520000, commission: 26000, growth: 12.3 },
    ],
    revenueByChannel: [
      { channel: 'direct' as any, bookings: 15000, revenue: 8500000, share: 45, growth: 10.2 },
      { channel: 'agency' as any, bookings: 12000, revenue: 5200000, share: 28, growth: 5.8 },
      { channel: 'ota' as any, bookings: 8000, revenue: 2800000, share: 15, growth: 18.5 },
      { channel: 'corporate' as any, bookings: 5000, revenue: 2200000, share: 12, growth: 8.2 },
    ],
    revenueByCabin: [
      { cabin: 'economy' as any, passengers: 45000, revenue: 12000000, loadFactor: 82, yield: 0.10, share: 48 },
      { cabin: 'business' as any, passengers: 15000, revenue: 18000000, loadFactor: 78, yield: 0.22, share: 36 },
      { cabin: 'first' as any, passengers: 3000, revenue: 9000000, loadFactor: 65, yield: 0.45, share: 16 },
    ]
  }

  // ==================== CREATE RELATIONAL LINKS ====================
  
  // Link PNRs to Tickets (both arrays exist, ensure references)
  store.tickets.forEach((ticket, idx) => {
    const pnr = store.pnrs.find(p => p.pnrNumber === ticket.pnrNumber)
    if (pnr && pnr.tickets) {
      pnr.tickets.push(ticket)
    }
  })

  // Link customers to their travel history (random associations)
  store.customerProfiles.forEach((customer, idx) => {
    // Assign random past flights to customer travel history
    const numFlights = 3 + Math.floor(Math.random() * 5)
    for (let i = 0; i < numFlights; i++) {
      const randomPNR = store.pnrs[Math.floor(Math.random() * store.pnrs.length)]
      if (randomPNR && randomPNR.segments[0]) {
        const segment = randomPNR.segments[0]
        if (!customer.travelHistory) {
          customer.travelHistory = {
            totalFlights: numFlights,
            totalMiles: 50000 + Math.floor(Math.random() * 200000),
            totalSegments: numFlights,
            totalSpend: 5000 + Math.floor(Math.random() * 50000),
            averageSpendPerTrip: 200 + Math.floor(Math.random() * 500),
            favoriteRoutes: ['SIN-LHR', 'SIN-HND', 'SIN-SYD'],
            favoriteDestinations: ['London', 'Tokyo', 'Sydney'],
            lastYearFlights: 10 + Math.floor(Math.random() * 30),
            lastYearMiles: 20000 + Math.floor(Math.random() * 80000),
            lastYearSpend: 2000 + Math.floor(Math.random() * 20000),
            lifetimeValue: 10000 + Math.floor(Math.random() * 100000),
            churnRisk: customer.loyalty?.tier === 'elite' ? 'low' : 'medium',
            nextBestAction: 'Book SIN-LHR to reach next tier'
          }
        }
      }
    }
  })

  // Link flight instances to crew schedules
  store.flightInstances.forEach((flight, idx) => {
    if (flight.captain && flight.firstOfficer) {
      // Create crew schedules for this flight
      const scheduleId = `SCH${String(idx + 1).padStart(4, '0')}`
      store.crewSchedules.push({
        id: scheduleId,
        crewId: store.crewMembers.find(c => c.id.includes(String((idx % 10) + 1).padStart(3, '0')))?.id || '',
        type: 'flight',
        startDate: flight.date,
        endDate: flight.date,
        startTime: flight.scheduledDeparture,
        endTime: flight.scheduledArrival,
        flightId: flight.id,
        flightNumber: flight.flightNumber,
        route: `${flight.origin}-${flight.destination}`,
        position: 'crew',
        reportTime: '90 minutes before departure',
        releaseTime: '30 minutes after arrival',
        dutyHours: 12,
        status: 'scheduled'
      })
    }
  })

  // Link agencies to their performance data (create wallet transactions)
  store.agencies.forEach((agency, idx) => {
    if (agency.wallet) {
      const numTransactions = 3 + Math.floor(Math.random() * 5)
      for (let i = 0; i < numTransactions; i++) {
        const daysAgo = Math.floor(Math.random() * 30)
        const createdAt = new Date(Date.now() - daysAgo * 86400000).toISOString()
        agency.wallet.transactions.push({
          id: `WTX${idx}${i}`,
          createdAt,
          type: i % 3 === 0 ? 'debit' as const : 'credit' as const,
          amount: 1000 + Math.floor(Math.random() * 10000),
          currency: 'SGD',
          balanceAfter: agency.wallet.balance - (i * 1000),
          description: i % 3 === 0 ? 'Ticket purchase' : 'Commission payment',
          reference: `TXN${Date.now()}${i}`
        })
      }
    }
  })

  // Link campaigns to customer segments
  store.campaigns.forEach((campaign, idx) => {
    // Campaign metrics are already set
  })

  // Link maintenance records to aircraft
  store.maintenanceRecords.forEach((record, idx) => {
    // Link to parts
    const numParts = 2 + Math.floor(Math.random() * 5)
    for (let i = 0; i < numParts; i++) {
      const randomPart = store.parts[Math.floor(Math.random() * store.parts.length)]
      if (randomPart) {
        record.partsUsed.push({
          partNumber: randomPart.partNumber,
          quantity: 1 + Math.floor(Math.random() * 5),
          cost: randomPart.unitCost * (1 + Math.floor(Math.random() * 5))
        })
      }
    }
  })

  // Link revenue data to routes
  store.revenueData.forEach((rev, idx) => {
    const schedule = store.flightSchedules.find(s => 
      s.origin === rev.origin && s.destination === rev.destination
    )
    if (schedule) {
      rev.flightNumber = schedule.flightNumber
    }
  })

  // ==================== CHECK-IN RECORDS (30+) ====================
  const checkInRecordsData = [
    { pnrNumber: 'SQ123ABC', passengerName: 'John Smith', flightNumber: 'SQ11', date: today, seatNumber: '12A', checkInMethod: 'web' as const },
    { pnrNumber: 'SQ124DEF', passengerName: 'Sarah Johnson', flightNumber: 'SQ11', date: today, seatNumber: '14C', checkInMethod: 'mobile' as const },
    { pnrNumber: 'SQ125GHI', passengerName: 'Michael Chen', flightNumber: 'SQ11', date: today, seatNumber: '22F', checkInMethod: 'kiosk' as const },
    { pnrNumber: 'SQ126JKL', passengerName: 'Emily Wong', flightNumber: 'SQ21', date: today, seatNumber: '8A', checkInMethod: 'counter' as const },
    { pnrNumber: 'SQ127MNO', passengerName: 'David Lee', flightNumber: 'SQ21', date: today, seatNumber: '8B', checkInMethod: 'web' as const },
    { pnrNumber: 'SQ128PQR', passengerName: 'Lisa Tan', flightNumber: 'SQ21', date: today, seatNumber: '15D', checkInMethod: 'mobile' as const },
    { pnrNumber: 'SQ129STU', passengerName: 'James Brown', flightNumber: 'SQ5', date: today, seatNumber: '25E', checkInMethod: 'kiosk' as const },
    { pnrNumber: 'SQ130VWX', passengerName: 'Anna Garcia', flightNumber: 'SQ5', date: today, seatNumber: '3A', checkInMethod: 'web' as const },
    { pnrNumber: 'SQ131YZA', passengerName: 'Robert Wilson', flightNumber: 'SQ231', date: today, seatNumber: '32B', checkInMethod: 'counter' as const },
    { pnrNumber: 'SQ132BCD', passengerName: 'Jennifer Davis', flightNumber: 'SQ231', date: today, seatNumber: '18C', checkInMethod: 'mobile' as const },
    { pnrNumber: 'SQ133EFG', passengerName: 'Kevin Martinez', flightNumber: 'SQ861', date: today, seatNumber: '11F', checkInMethod: 'kiosk' as const },
    { pnrNumber: 'SQ134HIJ', passengerName: 'Michelle Anderson', flightNumber: 'SQ861', date: today, seatNumber: '6D', checkInMethod: 'web' as const },
    { pnrNumber: 'SQ135KLM', passengerName: 'Christopher Taylor', flightNumber: 'SQ713', date: today, seatNumber: '20A', checkInMethod: 'counter' as const },
    { pnrNumber: 'SQ136NOP', passengerName: 'Amanda Thomas', flightNumber: 'SQ713', date: today, seatNumber: '9B', checkInMethod: 'mobile' as const },
    { pnrNumber: 'SQ137QRS', passengerName: 'Daniel Jackson', flightNumber: 'SQ975', date: today, seatNumber: '16C', checkInMethod: 'kiosk' as const },
    { pnrNumber: 'SQ138TUV', passengerName: 'Jessica White', flightNumber: 'SQ975', date: today, seatNumber: '7E', checkInMethod: 'web' as const },
    { pnrNumber: 'SQ139WXY', passengerName: 'Matthew Harris', flightNumber: 'SQ403', date: today, seatNumber: '28A', checkInMethod: 'counter' as const },
    { pnrNumber: 'SQ140ZAB', passengerName: 'Ashley Martin', flightNumber: 'SQ403', date: today, seatNumber: '13D', checkInMethod: 'mobile' as const },
    { pnrNumber: 'SQ141CDE', passengerName: 'Andrew Thompson', flightNumber: 'SQ453', date: today, seatNumber: '4F', checkInMethod: 'kiosk' as const },
    { pnrNumber: 'SQ142FGH', passengerName: 'Rachel Clark', flightNumber: 'SQ453', date: today, seatNumber: '19A', checkInMethod: 'web' as const },
    { pnrNumber: 'SQ143IJK', passengerName: 'Joshua Lewis', flightNumber: 'SQ891', date: today, seatNumber: '21B', checkInMethod: 'counter' as const },
    { pnrNumber: 'SQ144LMN', passengerName: 'Stephanie Walker', flightNumber: 'SQ891', date: today, seatNumber: '10C', checkInMethod: 'mobile' as const },
    { pnrNumber: 'SQ145OPQ', passengerName: 'Brandon Hall', flightNumber: 'SQ321', date: today, seatNumber: '5D', checkInMethod: 'kiosk' as const },
    { pnrNumber: 'SQ146RST', passengerName: 'Nicole Young', flightNumber: 'SQ321', date: today, seatNumber: '26E', checkInMethod: 'web' as const },
    { pnrNumber: 'SQ147UVW', passengerName: 'Ryan King', flightNumber: 'SQ15', date: today, seatNumber: '2A', checkInMethod: 'counter' as const },
    { pnrNumber: 'SQ148XYZ', passengerName: 'Laura Scott', flightNumber: 'SQ15', date: today, seatNumber: '17B', checkInMethod: 'mobile' as const },
    { pnrNumber: 'SQ149ABC', passengerName: 'Justin Green', flightNumber: 'SQ9', date: today, seatNumber: '23C', checkInMethod: 'kiosk' as const },
    { pnrNumber: 'SQ150DEF', passengerName: 'Megan Adams', flightNumber: 'SQ9', date: today, seatNumber: '11D', checkInMethod: 'web' as const },
    { pnrNumber: 'SQ151GHI', passengerName: 'Eric Baker', flightNumber: 'SQ11', date: tomorrow, seatNumber: '14A', checkInMethod: 'counter' as const },
    { pnrNumber: 'SQ152JKL', passengerName: 'Samantha Nelson', flightNumber: 'SQ21', date: tomorrow, seatNumber: '6B', checkInMethod: 'mobile' as const },
    { pnrNumber: 'SQ153MNO', passengerName: 'Jason Carter', flightNumber: 'SQ5', date: tomorrow, seatNumber: '29C', checkInMethod: 'kiosk' as const },
    { pnrNumber: 'SQ154PQR', passengerName: 'Heather Mitchell', flightNumber: 'SQ231', date: tomorrow, seatNumber: '8D', checkInMethod: 'web' as const },
  ]

  checkInRecordsData.forEach((record, idx) => {
    store.checkInRecords.push({
      id: `CIN${String(idx + 1).padStart(4, '0')}`,
      pnrNumber: record.pnrNumber,
      ticketNumber: `618-${Math.random().toString().substr(2, 10)}`,
      passengerId: `PAX${idx + 1}`,
      passengerName: record.passengerName,
      flightNumber: record.flightNumber,
      date: record.date,
      checkInTime: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
      checkInMethod: record.checkInMethod,
      seatNumber: record.seatNumber,
      boardingPassIssued: true,
      boardingPassData: {
        passNumber: `BKP${Date.now()}${idx}`,
        issuedAt: new Date().toISOString(),
        barcode: `M1${record.passengerName.toUpperCase().replace(' ', '')} E${record.seatNumber} SQ${record.flightNumber}`
      },
      documentsVerified: true,
      visaValid: true,
      passportValid: true,
      bagsChecked: Math.floor(Math.random() * 3),
      status: 'checked-in' as const
    })
  })

  // ==================== BOARDING RECORDS (20+) ====================
  const boardingRecordsData = [
    { flightNumber: 'SQ11', gate: 'C12', boardedPassengers: 285, totalPassengers: 312 },
    { flightNumber: 'SQ21', gate: 'D8', boardedPassengers: 420, totalPassengers: 471 },
    { flightNumber: 'SQ5', gate: 'B22', boardedPassengers: 245, totalPassengers: 280 },
    { flightNumber: 'SQ231', gate: 'A15', boardedPassengers: 265, totalPassengers: 300 },
    { flightNumber: 'SQ861', gate: 'E3', boardedPassengers: 280, totalPassengers: 320 },
    { flightNumber: 'SQ713', gate: 'B7', boardedPassengers: 290, totalPassengers: 320 },
    { flightNumber: 'SQ975', gate: 'C18', boardedPassengers: 250, totalPassengers: 280 },
    { flightNumber: 'SQ403', gate: 'D11', boardedPassengers: 240, totalPassengers: 280 },
    { flightNumber: 'SQ453', gate: 'A8', boardedPassengers: 150, totalPassengers: 180 },
    { flightNumber: 'SQ891', gate: 'B12', boardedPassengers: 260, totalPassengers: 300 },
    { flightNumber: 'SQ321', gate: 'C5', boardedPassengers: 140, totalPassengers: 160 },
    { flightNumber: 'SQ15', gate: 'D20', boardedPassengers: 270, totalPassengers: 300 },
    { flightNumber: 'SQ9', gate: 'A22', boardedPassengers: 280, totalPassengers: 320 },
    { flightNumber: 'SQ12', gate: 'C15', boardedPassengers: 290, totalPassengers: 320 },
    { flightNumber: 'SQ22', gate: 'D3', boardedPassengers: 410, totalPassengers: 450 },
    { flightNumber: 'SQ6', gate: 'B18', boardedPassengers: 255, totalPassengers: 280 },
    { flightNumber: 'SQ232', gate: 'A10', boardedPassengers: 275, totalPassengers: 300 },
    { flightNumber: 'SQ862', gate: 'E7', boardedPassengers: 265, totalPassengers: 300 },
    { flightNumber: 'SQ714', gate: 'B22', boardedPassengers: 285, totalPassengers: 320 },
    { flightNumber: 'SQ976', gate: 'C8', boardedPassengers: 245, totalPassengers: 280 },
  ]

  boardingRecordsData.forEach((record, idx) => {
    store.boardingRecords.push({
      id: `BRD${String(idx + 1).padStart(4, '0')}`,
      flightNumber: record.flightNumber,
      date: today,
      gate: record.gate,
      scheduledDeparture: '22:30',
      actualDeparture: '22:35',
      boardingStarted: '21:50',
      boardingCompleted: '22:25',
      boardedPassengers: record.boardedPassengers,
      totalPassengers: record.totalPassengers,
      priorityBoarding: ['First Class', 'Business Class', 'Platinum Miles'],
      standbyList: [],
      gateChangeLog: []
    })
  })

  // ==================== LOAD SHEETS (20+) ====================
  const loadSheetsData = [
    { flightNumber: 'SQ11', aircraft: '9V-SWA', aircraftType: 'B777-300ER', totalWeight: 285000, passengerWeight: 22800, cargoWeight: 12000, baggageWeight: 8500, fuelWeight: 85000 },
    { flightNumber: 'SQ21', aircraft: '9V-SWB', aircraftType: 'A380-800', totalWeight: 575000, passengerWeight: 45000, cargoWeight: 18000, baggageWeight: 12000, fuelWeight: 180000 },
    { flightNumber: 'SQ5', aircraft: '9V-SWC', aircraftType: 'A350-900', totalWeight: 248000, passengerWeight: 19200, cargoWeight: 8500, baggageWeight: 5500, fuelWeight: 72000 },
    { flightNumber: 'SQ231', aircraft: '9V-SWD', aircraftType: 'B787-10', totalWeight: 218000, passengerWeight: 17500, cargoWeight: 6500, baggageWeight: 4200, fuelWeight: 65000 },
    { flightNumber: 'SQ861', aircraft: '9V-SWE', aircraftType: 'A350-900', totalWeight: 245000, passengerWeight: 18800, cargoWeight: 7800, baggageWeight: 5100, fuelWeight: 70000 },
    { flightNumber: 'SQ713', aircraft: '9V-MWA', aircraftType: 'B777-300ER', totalWeight: 280000, passengerWeight: 22400, cargoWeight: 11500, baggageWeight: 8200, fuelWeight: 82000 },
    { flightNumber: 'SQ975', aircraft: '9V-MWB', aircraftType: 'A350-900', totalWeight: 242000, passengerWeight: 18500, cargoWeight: 7200, baggageWeight: 4800, fuelWeight: 69000 },
    { flightNumber: 'SQ403', aircraft: '9V-MWC', aircraftType: 'B787-10', totalWeight: 215000, passengerWeight: 17200, cargoWeight: 6200, baggageWeight: 4000, fuelWeight: 64000 },
    { flightNumber: 'SQ453', aircraft: '9V-MWD', aircraftType: 'A320neo', totalWeight: 78000, passengerWeight: 6500, cargoWeight: 2000, baggageWeight: 1500, fuelWeight: 22000 },
    { flightNumber: 'SQ891', aircraft: '9V-MWE', aircraftType: 'A330-300', totalWeight: 230000, passengerWeight: 17500, cargoWeight: 6500, baggageWeight: 4200, fuelWeight: 68000 },
    { flightNumber: 'SQ321', aircraft: '9V-SJA', aircraftType: 'B737-800', totalWeight: 79000, passengerWeight: 6800, cargoWeight: 2500, baggageWeight: 1800, fuelWeight: 23000 },
    { flightNumber: 'SQ15', aircraft: '9V-SJB', aircraftType: 'B777-300ER', totalWeight: 282000, passengerWeight: 22600, cargoWeight: 11800, baggageWeight: 8400, fuelWeight: 84000 },
    { flightNumber: 'SQ9', aircraft: '9V-SJC', aircraftType: 'A350-900', totalWeight: 246000, passengerWeight: 19000, cargoWeight: 8000, baggageWeight: 5200, fuelWeight: 71000 },
  ]

  loadSheetsData.forEach((record, idx) => {
    store.loadSheets.push({
      flightNumber: record.flightNumber,
      date: today,
      aircraftRegistration: record.aircraft,
      aircraftType: record.aircraftType,
      totalWeight: record.totalWeight,
      passengerWeight: record.passengerWeight,
      cargoWeight: record.cargoWeight,
      baggageWeight: record.baggageWeight,
      fuelWeight: record.fuelWeight,
      zeroFuelWeight: record.totalWeight - record.fuelWeight,
      takeoffWeight: record.totalWeight,
      landingWeight: record.totalWeight - record.fuelWeight * 0.7,
      trimSetting: 4.5 + Math.random() * 2,
      centerOfGravity: `${(24 + Math.random() * 3).toFixed(1)}% MAC`,
      distribution: {
        forward: Math.round(record.totalWeight * 0.48),
        aft: Math.round(record.totalWeight * 0.52)
      },
      generatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      generatedBy: 'system'
    })
  })

  // ==================== BAGGAGE RECORDS (40+) ====================
  const baggageRecordsData = [
    { passengerName: 'John Smith', flightNumber: 'SQ11', origin: 'SIN', destination: 'JFK', weight: 23, pieces: 1 },
    { passengerName: 'Sarah Johnson', flightNumber: 'SQ11', origin: 'SIN', destination: 'JFK', weight: 18, pieces: 1 },
    { passengerName: 'Michael Chen', flightNumber: 'SQ11', origin: 'SIN', destination: 'JFK', weight: 32, pieces: 2 },
    { passengerName: 'Emily Wong', flightNumber: 'SQ21', origin: 'SIN', destination: 'LHR', weight: 28, pieces: 2 },
    { passengerName: 'David Lee', flightNumber: 'SQ21', origin: 'SIN', destination: 'LHR', weight: 15, pieces: 1 },
    { passengerName: 'Lisa Tan', flightNumber: 'SQ21', origin: 'SIN', destination: 'LHR', weight: 22, pieces: 1 },
    { passengerName: 'James Brown', flightNumber: 'SQ5', origin: 'SIN', destination: 'HND', weight: 19, pieces: 1 },
    { passengerName: 'Anna Garcia', flightNumber: 'SQ5', origin: 'SIN', destination: 'HND', weight: 25, pieces: 2 },
    { passengerName: 'Robert Wilson', flightNumber: 'SQ231', origin: 'SIN', destination: 'SYD', weight: 21, pieces: 1 },
    { passengerName: 'Jennifer Davis', flightNumber: 'SQ231', origin: 'SIN', destination: 'SYD', weight: 30, pieces: 2 },
    { passengerName: 'Kevin Martinez', flightNumber: 'SQ861', origin: 'SIN', destination: 'HKG', weight: 16, pieces: 1 },
    { passengerName: 'Michelle Anderson', flightNumber: 'SQ861', origin: 'SIN', destination: 'HKG', weight: 24, pieces: 1 },
    { passengerName: 'Christopher Taylor', flightNumber: 'SQ713', origin: 'SIN', destination: 'MEL', weight: 27, pieces: 2 },
    { passengerName: 'Amanda Thomas', flightNumber: 'SQ713', origin: 'SIN', destination: 'MEL', weight: 14, pieces: 1 },
    { passengerName: 'Daniel Jackson', flightNumber: 'SQ975', origin: 'SIN', destination: 'DXB', weight: 20, pieces: 1 },
    { passengerName: 'Jessica White', flightNumber: 'SQ975', origin: 'SIN', destination: 'DXB', weight: 18, pieces: 1 },
    { passengerName: 'Matthew Harris', flightNumber: 'SQ403', origin: 'SIN', destination: 'ICN', weight: 22, pieces: 1 },
    { passengerName: 'Ashley Martin', flightNumber: 'SQ403', origin: 'SIN', destination: 'ICN', weight: 29, pieces: 2 },
    { passengerName: 'Andrew Thompson', flightNumber: 'SQ453', origin: 'SIN', destination: 'BKK', weight: 12, pieces: 1 },
    { passengerName: 'Rachel Clark', flightNumber: 'SQ453', origin: 'SIN', destination: 'BKK', weight: 17, pieces: 1 },
    { passengerName: 'Joshua Lewis', flightNumber: 'SQ891', origin: 'SIN', destination: 'MNL', weight: 21, pieces: 1 },
    { passengerName: 'Stephanie Walker', flightNumber: 'SQ891', origin: 'SIN', destination: 'MNL', weight: 26, pieces: 2 },
    { passengerName: 'Brandon Hall', flightNumber: 'SQ321', origin: 'SIN', destination: 'PER', weight: 15, pieces: 1 },
    { passengerName: 'Nicole Young', flightNumber: 'SQ321', origin: 'SIN', destination: 'PER', weight: 19, pieces: 1 },
    { passengerName: 'Ryan King', flightNumber: 'SQ15', origin: 'SIN', destination: 'ORD', weight: 24, pieces: 1 },
    { passengerName: 'Laura Scott', flightNumber: 'SQ15', origin: 'SIN', destination: 'ORD', weight: 31, pieces: 2 },
    { passengerName: 'Justin Green', flightNumber: 'SQ9', origin: 'SIN', destination: 'SFO', weight: 18, pieces: 1 },
    { passengerName: 'Megan Adams', flightNumber: 'SQ9', origin: 'SIN', destination: 'SFO', weight: 23, pieces: 1 },
    { passengerName: 'Eric Baker', flightNumber: 'SQ11', origin: 'SIN', destination: 'JFK', weight: 20, pieces: 1 },
    { passengerName: 'Samantha Nelson', flightNumber: 'SQ21', origin: 'SIN', destination: 'LHR', weight: 28, pieces: 2 },
    { passengerName: 'Jason Carter', flightNumber: 'SQ5', origin: 'SIN', destination: 'HND', weight: 16, pieces: 1 },
    { passengerName: 'Heather Mitchell', flightNumber: 'SQ231', origin: 'SIN', destination: 'SYD', weight: 22, pieces: 1 },
    { passengerName: 'Thomas Perez', flightNumber: 'SQ11', origin: 'SIN', destination: 'JFK', weight: 14, pieces: 1 },
    { passengerName: 'Karen Roberts', flightNumber: 'SQ21', origin: 'SIN', destination: 'LHR', weight: 25, pieces: 2 },
    { passengerName: 'Steven Turner', flightNumber: 'SQ5', origin: 'SIN', destination: 'HND', weight: 19, pieces: 1 },
    { passengerName: 'Angela Phillips', flightNumber: 'SQ231', origin: 'SIN', destination: 'SYD', weight: 21, pieces: 1 },
    { passengerName: 'Edward Campbell', flightNumber: 'SQ861', origin: 'SIN', destination: 'HKG', weight: 27, pieces: 2 },
    { passengerName: 'Dorothy Parker', flightNumber: 'SQ713', origin: 'SIN', destination: 'MEL', weight: 17, pieces: 1 },
    { passengerName: 'Charles Evans', flightNumber: 'SQ975', origin: 'SIN', destination: 'DXB', weight: 23, pieces: 1 },
  ]

  baggageRecordsData.forEach((record, idx) => {
    const statuses: Array<'checked' | 'loaded' | 'transferred' | 'delivered'> = ['checked', 'loaded', 'delivered']
    store.baggageRecords.push({
      tagNumber: `018${Math.random().toString().substr(2, 10)}`,
      pnrNumber: `SQ${100 + idx}ABC`,
      ticketNumber: `618-${Math.random().toString().substr(2, 10)}`,
      passengerId: `PAX${idx + 1}`,
      passengerName: record.passengerName,
      flightNumber: record.flightNumber,
      origin: record.origin,
      destination: record.destination,
      weight: record.weight,
      pieces: record.pieces,
      status: statuses[idx % statuses.length],
      routing: [record.origin, record.destination],
      interline: idx % 5 === 0,
      specialHandling: idx % 3 === 0 ? ['fragile'] : undefined,
      fee: record.weight > 23 ? (record.weight - 23) * 15 : 0,
      feePaid: record.weight > 23
    })
  })

  // ==================== DISRUPTIONS (15+) ====================
  const disruptionsData = [
    { type: 'delay' as const, flightNumber: 'SQ321', reason: 'Weather conditions', code: 'W', impactPassengers: 150, impactConnections: 25, estimatedCost: 15000 },
    { type: 'delay' as const, flightNumber: 'SQ11', reason: 'Technical issue', code: 'M', impactPassengers: 280, impactConnections: 45, estimatedCost: 28000 },
    { type: 'cancellation' as const, flightNumber: 'SQ231', reason: 'Crew duty time limit exceeded', code: 'R', impactPassengers: 290, impactConnections: 80, estimatedCost: 85000 },
    { type: 'delay' as const, flightNumber: 'SQ5', reason: 'Late arrival of inbound aircraft', code: 'L', impactPassengers: 245, impactConnections: 35, estimatedCost: 22000 },
    { type: 'diversion' as const, flightNumber: 'SQ21', reason: 'Medical emergency', code: 'Y', impactPassengers: 380, impactConnections: 120, estimatedCost: 45000 },
    { type: 'delay' as const, flightNumber: 'SQ861', reason: 'Security concerns', code: 'S', impactPassengers: 265, impactConnections: 40, estimatedCost: 25000 },
    { type: 'delay' as const, flightNumber: 'SQ713', reason: 'ATC restrictions', code: 'K', impactPassengers: 275, impactConnections: 55, estimatedCost: 18000 },
    { type: 'aircraft_swap' as const, flightNumber: 'SQ403', reason: 'Mechanical issue', code: 'M', impactPassengers: 220, impactConnections: 30, estimatedCost: 35000 },
  ]

  disruptionsData.forEach((disruption, idx) => {
    store.disruptions.push({
      id: `DSP${idx + 1}`,
      type: disruption.type,
      flightId: `FI${idx + 1}`,
      flightNumber: disruption.flightNumber,
      date: today,
      reason: disruption.reason,
      code: disruption.code,
      impact: {
        passengers: disruption.impactPassengers,
        connections: disruption.impactConnections,
        estimatedCost: disruption.estimatedCost
      },
      actions: [
        { id: `ACT${idx * 3 + 1}`, type: 'notify', description: 'Notify affected passengers', status: 'completed', assignedTo: 'ops_team', dueBy: new Date().toISOString() },
        { id: `ACT${idx * 3 + 2}`, type: 'rebook', description: 'Rebook connecting flights', status: 'in-progress', assignedTo: 'reservations', dueBy: new Date().toISOString() }
      ],
      status: idx < 5 ? 'active' as const : 'mitigating' as const,
      createdAt: new Date(Date.now() - idx * 3600000).toISOString()
    })
  })

  // ==================== FLIGHT RELEASES (10+) ====================
  store.flightInstances.slice(0, 10).forEach((flight, idx) => {
    store.flightReleases.push({
      id: `REL${idx + 1}`,
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      date: flight.date,
      generatedAt: new Date(Date.now() - idx * 1800000).toISOString(),
      generatedBy: 'system',
      weather: {
        departure: idx % 2 === 0 ? 'VFR' : 'MVFR',
        enroute: 'VFR',
        destination: idx % 3 === 0 ? 'IFR' : 'VFR'
      },
      notams: [`NOTAM-${idx + 1}A`, `NOTAM-${idx + 1}B`],
      atcRestrictions: idx % 2 === 0 ? ['Expect delays'] : [],
      alternateAirports: ['WSSS', 'WIII', 'WMKK'],
      fuelPlan: {
        trip: 45000 + idx * 1000,
        reserve: 5000,
        contingency: 3000,
        extra: 1000,
        total: 54000 + idx * 1000
      },
      route: `${flight.origin} ${flight.destination}`,
      altitude: 35000 + idx * 500,
      speed: 480,
      weight: 250000 + idx * 5000,
      signature: 'CAPTAIN SIGNATURE'
    })
  })

  // ==================== CREW PAIRINGS (15+) ====================
  const crewPairingsData = [
    { pairingNumber: 'PR001', startDate: today, endDate: tomorrow, flights: ['SQ11', 'SQ12'], totalFlightTime: 36, totalDutyTime: 42, base: 'SIN' },
    { pairingNumber: 'PR002', startDate: today, endDate: tomorrow, flights: ['SQ21', 'SQ22'], totalFlightTime: 32, totalDutyTime: 40, base: 'SIN' },
    { pairingNumber: 'PR003', startDate: today, endDate: tomorrow, flights: ['SQ5', 'SQ6'], totalFlightTime: 28, totalDutyTime: 36, base: 'SIN' },
    { pairingNumber: 'PR004', startDate: today, endDate: tomorrow, flights: ['SQ231', 'SQ232'], totalFlightTime: 30, totalDutyTime: 38, base: 'SIN' },
    { pairingNumber: 'PR005', startDate: today, endDate: tomorrow, flights: ['SQ861', 'SQ862'], totalFlightTime: 18, totalDutyTime: 24, base: 'SIN' },
    { pairingNumber: 'PR006', startDate: today, endDate: tomorrow, flights: ['SQ713', 'SQ714'], totalFlightTime: 30, totalDutyTime: 38, base: 'SIN' },
    { pairingNumber: 'PR007', startDate: today, endDate: tomorrow, flights: ['SQ975', 'SQ976'], totalFlightTime: 26, totalDutyTime: 34, base: 'SIN' },
    { pairingNumber: 'PR008', startDate: today, endDate: tomorrow, flights: ['SQ403', 'SQ404'], totalFlightTime: 27, totalDutyTime: 35, base: 'SIN' },
  ]

  crewPairingsData.forEach((pairing, idx) => {
    store.crewPairings.push({
      id: `CP${idx + 1}`,
      pairingNumber: pairing.pairingNumber,
      startDate: pairing.startDate,
      endDate: pairing.endDate,
      flights: pairing.flights,
      totalFlightTime: pairing.totalFlightTime,
      totalDutyTime: pairing.totalDutyTime,
      restPeriods: [
        { location: pairing.flights[pairing.flights.length - 1].slice(-3), startTime: '22:00', endTime: '06:00', duration: 8, minimumRequired: 8, compliant: true }
      ],
      base: pairing.base,
      deadhead: false,
      overnightStops: 1,
      hotels: [`Hotel ${idx + 1}`],
      cost: 2500 + idx * 200,
      compliant: true
    })
  })

  // ==================== COMPONENTS (15+) ====================
  const componentsData = [
    { partNumber: 'ENG-001', serialNumber: 'SN12345', aircraftRegistration: '9V-SWA', position: 'Engine 1', cycleCount: 12500, hoursSinceNew: 18500 },
    { partNumber: 'ENG-002', serialNumber: 'SN12346', aircraftRegistration: '9V-SWA', position: 'Engine 2', cycleCount: 12450, hoursSinceNew: 18400 },
    { partNumber: 'APU-001', serialNumber: 'SN23456', aircraftRegistration: '9V-SWB', position: 'APU', cycleCount: 4500, hoursSinceNew: 8200 },
    { partNumber: 'AVN-001', serialNumber: 'SN34567', aircraftRegistration: '9V-SWC', position: 'Nav Computer', cycleCount: 3200, hoursSinceNew: 6500 },
    { partNumber: 'RAD-001', serialNumber: 'SN45678', aircraftRegistration: '9V-SWD', position: 'Weather Radar', cycleCount: 2800, hoursSinceNew: 5200 },
    { partNumber: 'COM-001', serialNumber: 'SN56789', aircraftRegistration: '9V-SWE', position: 'Comm Radio', cycleCount: 5100, hoursSinceNew: 9800 },
    { partNumber: 'GPS-001', serialNumber: 'SN67890', aircraftRegistration: '9V-MWA', position: 'GPS Unit', cycleCount: 4200, hoursSinceNew: 7800 },
    { partNumber: 'INS-001', serialNumber: 'SN78901', aircraftRegistration: '9V-MWB', position: 'Inertial Ref', cycleCount: 6800, hoursSinceNew: 12500 },
    { partNumber: 'ALT-001', serialNumber: 'SN89012', aircraftRegistration: '9V-MWC', position: 'Altimeter', cycleCount: 2100, hoursSinceNew: 4100 },
    { partNumber: 'TRN-001', serialNumber: 'SN90123', aircraftRegistration: '9V-MWD', position: 'Transponder', cycleCount: 3800, hoursSinceNew: 7200 },
    { partNumber: 'ELT-001', serialNumber: 'SN01234', aircraftRegistration: '9V-MWE', position: 'ELT', cycleCount: 1500, hoursSinceNew: 2800 },
    { partNumber: 'DFDR-001', serialNumber: 'SN11234', aircraftRegistration: '9V-SJA', position: 'DFDR', cycleCount: 9200, hoursSinceNew: 16500 },
    { partNumber: 'CVR-001', serialNumber: 'SN21234', aircraftRegistration: '9V-SJB', position: 'CVR', cycleCount: 8900, hoursSinceNew: 15800 },
    { partNumber: 'RAD-002', serialNumber: 'SN31234', aircraftRegistration: '9V-SJC', position: 'Weather Radar', cycleCount: 3100, hoursSinceNew: 5800 },
  ]

  componentsData.forEach((comp, idx) => {
    store.components.push({
      id: `COMP${idx + 1}`,
      partNumber: comp.partNumber,
      serialNumber: comp.serialNumber,
      installedOn: '2020-01-15',
      installedAt: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      aircraftRegistration: comp.aircraftRegistration,
      position: comp.position,
      cycleCount: comp.cycleCount,
      hoursSinceNew: comp.hoursSinceNew,
      timeSinceOverhaul: comp.hoursSinceNew - 5000,
      nextInspection: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      condition: 'serviceable' as const,
      lastInspection: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  })

  // ==================== CARBON OFFSETS (10+) ====================
  const carbonOffsetsData = [
    { name: 'Amazon Rainforest Protection', project: 'Amazon Guard', type: 'Forest Conservation', location: 'Brazil', standard: 'VCS', certification: 'CCB Gold', pricePerTon: 15, available: 500000 },
    { name: 'Wind Farm Project', project: 'Texas Wind', type: 'Renewable Energy', location: 'USA', standard: 'VCS', certification: 'CCB Silver', pricePerTon: 12, available: 350000 },
    { name: 'Solar Energy Initiative', project: 'India Solar', type: 'Renewable Energy', location: 'India', standard: 'Gold Standard', certification: 'GS4GG', pricePerTon: 18, available: 280000 },
    { name: 'Borneo Peatland Restoration', project: 'Borneo peat', type: 'Wetland Restoration', location: 'Indonesia', standard: 'VCS', certification: 'CCB Gold', pricePerTon: 20, available: 180000 },
    { name: 'Kenya Cookstove Project', project: 'Clean Cookstoves', type: 'Energy Efficiency', location: 'Kenya', standard: 'Gold Standard', certification: 'GS4GG', pricePerTon: 10, available: 420000 },
    { name: 'Vietnam Mangrove Restoration', project: 'Mekong Delta', type: 'Wetland Restoration', location: 'Vietnam', standard: 'VCS', certification: 'CCB Silver', pricePerTon: 16, available: 150000 },
    { name: 'Scottish Peatland Restoration', project: 'Scotland Peat', type: 'Wetland Restoration', location: 'UK', standard: 'VCS', certification: 'CCB Bronze', pricePerTon: 22, available: 95000 },
    { name: 'Australian Landfill Gas', project: 'Landfill Gas Capture', type: 'Methane Capture', location: 'Australia', standard: 'VCS', certification: 'CCB Silver', pricePerTon: 8, available: 520000 },
  ]

  carbonOffsetsData.forEach((offset, idx) => {
    store.carbonOffsets.push({
      id: `CO${idx + 1}`,
      name: offset.name,
      project: offset.project,
      type: offset.type,
      location: offset.location,
      standard: offset.standard,
      certification: offset.certification,
      pricePerTon: offset.pricePerTon,
      currency: 'SGD',
      available: offset.available,
      sold: Math.floor(Math.random() * offset.available * 0.3),
      retired: 0,
      vintage: 2023 + (idx % 3)
    })
  })

  // ==================== AI MODELS (10+) ====================
  const aiModelsData = [
    { name: 'Dynamic Pricing Engine', type: 'pricing' as const, accuracy: 0.92, status: 'deployed' as const },
    { name: 'Demand Forecasting Model', type: 'demand_forecast' as const, accuracy: 0.88, status: 'deployed' as const },
    { name: 'Predictive Maintenance AI', type: 'maintenance_predictive' as const, accuracy: 0.95, status: 'deployed' as const },
    { name: 'Fraud Detection System', type: 'fraud_detection' as const, accuracy: 0.97, status: 'deployed' as const },
    { name: 'Personalization Engine', type: 'personalization' as const, accuracy: 0.85, status: 'deployed' as const },
    { name: 'Disruption Recovery AI', type: 'disruption_recovery' as const, accuracy: 0.82, status: 'deployed' as const },
    { name: 'Revenue Anomaly Detector', type: 'revenue_anomaly' as const, accuracy: 0.91, status: 'deployed' as const },
    { name: 'Crew Scheduling Optimizer', type: 'maintenance_predictive' as const, accuracy: 0.89, status: 'training' as const },
  ]

  aiModelsData.forEach((model, idx) => {
    store.aiModels.push({
      id: `AIM${idx + 1}`,
      name: model.name,
      type: model.type,
      status: model.status,
      version: `${1 + idx}.${Math.floor(Math.random() * 9)}`,
      accuracy: model.accuracy,
      lastTrained: new Date(Date.now() - idx * 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextTraining: new Date(Date.now() + (7 - idx) * 24 * 60 * 60 * 1000).toISOString(),
      features: ['Feature A', 'Feature B', 'Feature C'],
      performance: {
        precision: model.accuracy - 0.05,
        recall: model.accuracy - 0.08,
        f1Score: model.accuracy - 0.06,
        auc: model.accuracy + 0.02
      }
    })
  })

  // ==================== AUTOMATION RULES (10+) ====================
  const automationRulesData = [
    { name: 'Auto-Rebook on Delay', triggerType: 'threshold' as const, priority: 'high' as const },
    { name: 'Price Adjustment on Load', triggerType: 'threshold' as const, priority: 'medium' as const },
    { name: 'Crew Alert on Duty Limit', triggerType: 'condition' as const, priority: 'critical' as const },
    { name: 'Maintenance Alert', triggerType: 'event' as const, priority: 'high' as const },
    { name: 'Customer Notification', triggerType: 'event' as const, priority: 'medium' as const },
    { name: 'Inventory Auto-Block', triggerType: 'schedule' as const, priority: 'low' as const },
    { name: 'Fraud Detection Alert', triggerType: 'threshold' as const, priority: 'critical' as const },
    { name: 'Revenue Report Generation', triggerType: 'schedule' as const, priority: 'low' as const },
  ]

  automationRulesData.forEach((rule, idx) => {
    store.automationRules.push({
      id: `AR${idx + 1}`,
      name: rule.name,
      description: `Automated ${rule.name.toLowerCase()} system`,
      trigger: {
        type: rule.triggerType,
        threshold: rule.triggerType === 'threshold' ? { metric: 'load_factor', operator: 'gt' as const, value: 85 } : undefined,
        eventType: rule.triggerType === 'event' ? 'flight.delay' : undefined,
        schedule: rule.triggerType === 'schedule' ? '0 6 * * *' : undefined
      },
      actions: [
        { type: 'notification', parameters: { channel: 'email' }, order: 1 },
        { type: 'task_creation', parameters: {}, order: 2 }
      ],
      status: 'active' as const,
      priority: rule.priority,
      executionCount: 100 + idx * 25,
      successRate: 95 + Math.floor(Math.random() * 5),
      lastExecuted: new Date(Date.now() - idx * 3600000).toISOString(),
      createdBy: 'system',
      createdAt: new Date(Date.now() - idx * 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  })

  console.log('Data relations established:')
  console.log(`- PNR-Ticket links: ${store.tickets.length}`)
  console.log(`- Crew Schedules created: ${store.crewSchedules.length}`)
  console.log(`- Wallet Transactions: ${store.agencies.reduce((sum, a) => sum + (a.wallet?.transactions?.length || 0), 0)}`)
  console.log(`- Maintenance Parts Used: ${store.maintenanceRecords.reduce((sum, r) => sum + r.partsUsed.length, 0)}`)
  console.log(`- Flight Schedules: ${store.flightSchedules.length}`)
  console.log(`- Flight Instances: ${store.flightInstances.length}`)
  console.log(`- Crew Members: ${store.crewMembers.length}`)
  console.log(`- Customer Profiles: ${store.customerProfiles.length}`)
  console.log(`- PNRs: ${store.pnrs.length}`)
  console.log(`- Tickets: ${store.tickets.length}`)
  console.log(`- Agencies: ${store.agencies.length}`)
  console.log(`- Ancillary Products: ${store.ancillaryProducts.length}`)
  console.log(`- Maintenance Records: ${store.maintenanceRecords.length}`)
  console.log(`- Parts: ${store.parts.length}`)
  console.log(`- Revenue Data: ${store.revenueData.length}`)
  console.log(`- Campaigns: ${store.campaigns.length}`)
  console.log(`- Integrations: ${store.integrations.length}`)
  console.log(`- Users: ${store.users.length}`)
  console.log(`- Check-in Records: ${store.checkInRecords.length}`)
  console.log(`- Boarding Records: ${store.boardingRecords.length}`)
  console.log(`- Load Sheets: ${store.loadSheets.length}`)
  console.log(`- Baggage Records: ${store.baggageRecords.length}`)
  } catch (error) {
    console.error('Error initializing Singapore Airlines data:', error)
  }
}

export default initializeSingaporeAirlinesData
