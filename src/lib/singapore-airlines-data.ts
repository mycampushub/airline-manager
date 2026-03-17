// Comprehensive Mock Data Initialization - Singapore Airlines Style
// 30+ realistic entries per major section

import { useEnhancedAirlineStore } from './enhanced-store-part1'

const generateId = () => Math.random().toString(36).substr(2, 9)
const generatePNRNumber = () => `SQ${Math.random().toString(36).substr(2, 6).toUpperCase()}`
const generateTicketNumber = () => `618-${Math.random().toString().substr(2, 10)}`

const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

export const initializeSingaporeAirlinesData = () => {
  const store = useEnhancedAirlineStore.getState()

  console.log('Initializing Singapore Airlines comprehensive mock data...')

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
    store.createFlightSchedule({
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
  const captains = [
    'Capt. Tan Kim Seng', 'Capt. Lim Chee Keong', 'Capt. Ng Chee Kiong',
    'Capt. Ang Chin Huat', 'Capt. Goh Keng Koo', 'Capt. Seah Keng Maw',
    'Capt. Fong Yoon Kong', 'Capt. Chan Kong Yew', 'Capt. Yeo Kim Huat',
    'Capt. Chong Chen Kit'
  ]

  const firstOfficers = [
    'FO. Daniel Tan', 'FO. Marcus Lee', 'FO. Kevin Wong',
    'FO. Ryan Cheng', 'FO. Justin Ng', 'FO. Brandon Sim',
    'FO. Nicholas Tay', 'FO. Andrew Quek', 'FO. Jason Ho',
    'FO. Gavin Goh'
  ]

  const cabinCrew = [
    'Sarah Chen', 'Michelle Wong', 'Jennifer Tan', 'Amanda Lim', 'Rebecca Lee',
    'Grace Ng', 'Sophia Chee', 'Evelyn Teo', 'Claire Sim', 'Jessica Boo',
    'Ashley Koh', 'Vanessa Tay', 'Yvonne Chua', 'Patricia Ang', 'Shirley Phoon'
  ]

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
    
    store.createPNR({
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
      status: statuses[i % 3]
    })
  }

  // ==================== TICKETS (30+) ====================
  store.pnrs.forEach((pnr, idx) => {
    pnr.passengers.forEach(passenger => {
      store.issueTicket({
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
        changePenalty: 200
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
    store.addAgency({
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
      }
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
    store.createMaintenanceRecord({
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
      cost: 50000 + Math.floor(Math.random() * 100000)
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
      
      store.updateRevenueData(r.route, date, {
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
    store.createCampaign({
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
      }
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
    store.addIntegration({
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
      }
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
    store.addUser({
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
      mfaEnabled: user.role === 'admin'
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
}

export default initializeSingaporeAirlinesData
