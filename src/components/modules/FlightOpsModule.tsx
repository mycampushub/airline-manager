'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { useAirlineStore } from '@/lib/store'
import { 
  Calendar, 
  Clock, 
  Plane, 
  AlertTriangle, 
  MapPin, 
  Cloud, 
  FileText,
  Plus,
  Edit,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Settings,
  Route,
  CalendarClock,
  Clock as ClockIcon,
  Map as MapIcon,
  Layers,
  Database,
  DollarSign,
  Users,
  Gauge,
  Fuel,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  ArrowRight,
  Save,
  Eye,
  AlertCircle,
  Thermometer,
  Wind,
  Gauge as GaugeIcon
} from 'lucide-react'
import { type FlightSchedule, type DisruptionEvent } from '@/lib/store'

interface Route {
  id: string
  origin: string
  destination: string
  distance: number
  flightTime: number
  slots: Slot[]
  aircraftTypes: string[]
  priority: 'high' | 'medium' | 'low'
  demand: 'high' | 'medium' | 'low'
  competition: number
}

interface Slot {
  id: string
  time: string
  status: 'available' | 'assigned' | 'blocked' | 'maintenance'
  assignedTo?: string
}

interface SeasonalSchedule {
  id: string
  season: 'low' | 'shoulder' | 'peak'
  startDate: string
  endDate: string
  frequencyMultiplier: number
  pricingMultiplier: number
  notes: string
}

interface FleetAssignment {
  id: string
  registration: string
  aircraftType: string
  base: string
  utilizationRate: number
  routes: string[]
  maintenanceSchedule: MaintenanceEvent[]
}

interface MaintenanceEvent {
  id: string
  date: string
  type: 'a-check' | 'b-check' | 'c-check' | 'd-check' | 'line-maintenance'
  duration: number
  notes: string
}

export default function FlightOpsModule() {
  const { flightSchedules, flightInstances, disruptions, createFlightSchedule, updateFlightSchedule, createDisruption, setDisruptions } = useAirlineStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('schedule')
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showDisruptionDialog, setShowDisruptionDialog] = useState(false)
  const [showRoutePlanningDialog, setShowRoutePlanningDialog] = useState(false)
  const [showSeasonalDialog, setShowSeasonalDialog] = useState(false)
  const [showSlotManagementDialog, setShowSlotManagementDialog] = useState(false)
  const [showFleetDialog, setShowFleetDialog] = useState(false)

  // New state for enhanced features
  const [routes, setRoutes] = useState<Route[]>([
    { id: 'R1', origin: 'JFK', destination: 'LHR', distance: 5567, flightTime: 435, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'high', demand: 'high', competition: 8 },
    { id: 'R2', origin: 'JFK', destination: 'PAR', distance: 5837, flightTime: 440, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'high', demand: 'high', competition: 6 },
    { id: 'R3', origin: 'LAX', destination: 'TYO', distance: 8781, flightTime: 680, slots: [], aircraftTypes: ['B777-300ER', 'A350-900'], priority: 'high', demand: 'high', competition: 5 },
    { id: 'R4', origin: 'SFO', destination: 'HKG', distance: 11136, flightTime: 870, slots: [], aircraftTypes: ['B777-300ER', 'A350-900'], priority: 'medium', demand: 'medium', competition: 4 },
    { id: 'R5', origin: 'SIN', destination: 'SYD', distance: 6309, flightTime: 490, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'A330-300'], priority: 'medium', demand: 'medium', competition: 3 },
    { id: 'R6', origin: 'DXB', destination: 'LHR', distance: 5479, flightTime: 430, slots: [], aircraftTypes: ['B777-300ER', 'A380', 'A350-900'], priority: 'high', demand: 'high', competition: 7 },
    { id: 'R7', origin: 'FRA', destination: 'JFK', distance: 6385, flightTime: 500, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'medium', demand: 'medium', competition: 5 }
  ])

  const [seasonalSchedules, setSeasonalSchedules] = useState<SeasonalSchedule[]>([
    { id: 'SS1', season: 'low', startDate: '2024-01-15', endDate: '2024-03-31', frequencyMultiplier: 0.6, pricingMultiplier: 0.7, notes: 'Low demand period' },
    { id: 'SS2', season: 'shoulder', startDate: '2024-04-01', endDate: '2024-05-31', frequencyMultiplier: 0.8, pricingMultiplier: 0.85, notes: 'Shoulder season increasing' },
    { id: 'SS3', season: 'peak', startDate: '2024-06-01', endDate: '2024-08-31', frequencyMultiplier: 1.0, pricingMultiplier: 1.2, notes: 'Peak summer season' },
    { id: 'SS4', season: 'peak', startDate: '2024-09-01', endDate: '2024-10-31', frequencyMultiplier: 0.9, pricingMultiplier: 1.1, notes: 'Fall peak season' },
    { id: 'SS5', season: 'shoulder', startDate: '2024-11-01', endDate: '2024-12-15', frequencyMultiplier: 0.8, pricingMultiplier: 0.85, notes: 'Holiday shoulder season' }
  ])

  const [fleetAssignments, setFleetAssignments] = useState<FleetAssignment[]>([
    { id: 'FA1', registration: 'N12345', aircraftType: 'B737-800', base: 'JFK', utilizationRate: 92.5, routes: ['JFK-LHR', 'JFK-PAR', 'JFK-ORD'], maintenanceSchedule: [] },
    { id: 'FA2', registration: 'N67890', aircraftType: 'B737-800', base: 'JFK', utilizationRate: 88.3, routes: ['JFK-LAX', 'JFK-MIA', 'JFK-ORD'], maintenanceSchedule: [] },
    { id: 'FA3', registration: 'N24680', aircraftType: 'A320-200', base: 'LAX', utilizationRate: 95.2, routes: ['LAX-TYO', 'LAX-SFO', 'LAX-SYD'], maintenanceSchedule: [] },
    { id: 'FA4', registration: 'N97531', aircraftType: 'B777-300ER', base: 'LAX', utilizationRate: 94.8, routes: ['LAX-TYO', 'SFO-HKG', 'JFK-LHR'], maintenanceSchedule: [] },
    { id: 'FA5', registration: 'N86420', aircraftType: 'A350-900', base: 'JFK', utilizationRate: 96.5, routes: ['JFK-LHR', 'DXB-LHR', 'JFK-PAR'], maintenanceSchedule: [] }
  ])

  const [newSchedule, setNewSchedule] = useState({
    flightNumber: '',
    routeId: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    aircraftType: 'B737-800',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    effectiveSeason: 'low',
    slotId: '',
    fleetAssignmentId: '',
    seasonalAdjustment: false
  })

  const [newRoute, setNewRoute] = useState({
    origin: '',
    destination: '',
    distance: 0,
    flightTime: 0,
    aircraftTypes: ['B737-800'],
    priority: 'medium' as const,
    demand: 'medium' as const,
    competition: 3
  })

  const [newSeasonalSchedule, setNewSeasonalSchedule] = useState({
    season: 'low' as const,
    startDate: '',
    endDate: '',
    frequencyMultiplier: 0.8,
    pricingMultiplier: 0.85,
    notes: ''
  })

  const [newFleetAssignment, setNewFleetAssignment] = useState({
    registration: '',
    aircraftType: 'B737-800',
    base: '',
    routes: [] as string[],
    utilizationRate: 85
  })

  // Edit dialogs state
  const [showEditRouteDialog, setShowEditRouteDialog] = useState(false)
  const [showEditScheduleDialog, setShowEditScheduleDialog] = useState(false)
  const [showEditSeasonalDialog, setShowEditSeasonalDialog] = useState(false)
  const [showEditFleetDialog, setShowEditFleetDialog] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<FlightSchedule | null>(null)
  const [editingSeasonalSchedule, setEditingSeasonalSchedule] = useState<SeasonalSchedule | null>(null)
  const [editingFleetAssignment, setEditingFleetAssignment] = useState<FleetAssignment | null>(null)

  // Flight release state
  const [showFlightReleaseDialog, setShowFlightReleaseDialog] = useState(false)
  const [generatedFlightRelease, setGeneratedFlightRelease] = useState<any>(null)
  const [flightReleaseApproved, setFlightReleaseApproved] = useState(false)

  const [selectedSchedule, setSelectedSchedule] = useState<FlightSchedule | null>(null)

  // Disruption state
  const [newDisruption, setNewDisruption] = useState({
    flightNumber: '',
    type: 'delay' as const,
    code: '',
    reason: '',
    estimatedDelayMinutes: 0,
    passengersAffected: 0
  })

  // Dispatch state
  const [selectedFlightForDispatch, setSelectedFlightForDispatch] = useState<FlightSchedule | null>(null)
  const [selectedFlightForSchedule, setSelectedFlightForSchedule] = useState<FlightSchedule | null>(null)
  const [dispatchWeather, setDispatchWeather] = useState({
    departure: { condition: 'Clear skies', temp: 15, windSpeed: 10, windDirection: 270, visibility: 10, pressure: 1013, dewPoint: 8, cloudCeiling: 'Unlimited' },
    destination: { condition: 'Overcast', temp: 12, windSpeed: 15, windDirection: 310, visibility: 8, pressure: 1010, dewPoint: 9, cloudCeiling: '3000ft AGL' }
  })
  const [notams, setNotams] = useState([
    { id: 'A1234/24', airport: 'JFK', message: 'RWY 09L/27R closed for maintenance until 15DEC', type: 'maintenance' as const, validFrom: '2024-12-01', validTo: '2024-12-15' },
    { id: 'B5678/24', airport: 'JFK', message: 'Taxiway B partial closure due to construction', type: 'construction' as const, validFrom: '2024-12-01', validTo: '2024-12-20' },
    { id: 'C9012/24', airport: 'LHR', message: 'ILS approach out of service - use visual approach', type: 'navigation' as const, validFrom: '2024-12-05', validTo: '2024-12-10' }
  ])
  const [atcRestrictions, setAtcRestrictions] = useState([
    { id: '1', region: 'EUR', type: 'Flow control', level: 'Moderate', description: 'Reduced slot availability', slotDelay: 15 },
    { id: '2', region: 'NAT', type: 'Route restrictions', level: 'Active', description: 'NAT Track A suspended', slotDelay: 30 }
  ])
  const [alternateAirports, setAlternateAirports] = useState([
    { code: 'MAN', name: 'Manchester', type: 'Primary', distance: 200, weather: 'VFR', estimatedDelay: 0 },
    { code: 'BHX', name: 'Birmingham', type: 'Secondary', distance: 150, weather: 'VFR', estimatedDelay: 5 }
  ])
  const [fuelPlan, setFuelPlan] = useState({
    tripFuel: 18450,
    reserve: 3500,
    alternate: 2800,
    taxi: 400,
    contingency: 600
  })

  const handleCreateSchedule = () => {
    createFlightSchedule({
      ...newSchedule,
      flightNumber: newSchedule.flightNumber || generateFlightNumber(newRoute.origin, newRoute.destination),
      origin: newRoute.origin,
      destination: newRoute.destination,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2025-12-31',
      duration: newRoute.flightTime,
      distance: newRoute.distance,
      daysOfWeek: newSchedule.daysOfWeek,
      frequencies: calculateFrequency(newSchedule.daysOfWeek, newSchedule.effectiveSeason),
      aircraftType: newSchedule.aircraftType,
      slot: { origin: newSchedule.slotId, destination: newSchedule.slotId },
      status: 'active'
    })
    setShowScheduleDialog(false)
  }

  const handleCreateRoute = () => {
    const route: Route = {
      id: `R${routes.length + 1}`,
      ...newRoute,
      slots: generateTimeSlots(newRoute.flightTime)
    }
    setRoutes([...routes, route])
    setShowRoutePlanningDialog(false)
    resetRouteForm()
  }

  const handleCreateSeasonalSchedule = () => {
    const schedule: SeasonalSchedule = {
      id: `SS${seasonalSchedules.length + 1}`,
      ...newSeasonalSchedule
    }
    setSeasonalSchedules([...seasonalSchedules, schedule])
    setShowSeasonalDialog(false)
    resetSeasonalForm()
  }

  const handleCreateFleetAssignment = () => {
    const assignment: FleetAssignment = {
      id: `FA${fleetAssignments.length + 1}`,
      ...newFleetAssignment,
      maintenanceSchedule: []
    }
    setFleetAssignments([...fleetAssignments, assignment])
    setShowFleetDialog(false)
    resetFleetForm()
  }

  const generateFlightNumber = (origin: string, destination: string) => {
    const routeCode = `${origin}${destination}`
    const num = Math.floor(Math.random() * 900) + 100
    return `AA${routeCode}${num}`
  }

  const generateTimeSlots = (flightTime: number) => {
    const slots: Slot[] = []
    const startHour = 6 // 6 AM
    const endHour = 22 // 10 PM
    for (let h = startHour; h < endHour; h++) {
      slots.push({
        id: `slot-${h}`,
        time: `${h.toString().padStart(2, '0')}:00`,
        status: 'available'
      })
    }
    return slots
  }

  const calculateFrequency = (daysOfWeek: number[], season: string) => {
    const seasonalSchedule = seasonalSchedules.find(s => s.season === season)
    const baseFrequency = daysOfWeek.length
    const multiplier = seasonalSchedule?.frequencyMultiplier || 1
    return Math.round(baseFrequency * multiplier)
  }

  const resetRouteForm = () => {
    setNewRoute({
      origin: '',
      destination: '',
      distance: 0,
      flightTime: 0,
      aircraftTypes: ['B737-800'],
      priority: 'medium',
      demand: 'medium',
      competition: 3
    })
  }

  const resetSeasonalForm = () => {
    setNewSeasonalSchedule({
      season: 'low',
      startDate: '',
      endDate: '',
      frequencyMultiplier: 0.8,
      pricingMultiplier: 0.85,
      notes: ''
    })
  }

  const resetFleetForm = () => {
    setNewFleetAssignment({
      registration: '',
      aircraftType: 'B737-800',
      base: '',
      routes: [],
      utilizationRate: 85
    })
  }

  const getAircraftTypesForRoute = (routeId: string) => {
    const route = routes.find(r => r.id === routeId)
    return route?.aircraftTypes || ['B737-800']
  }

  // Disruption handlers
  const handleCreateDisruption = () => {
    if (!newDisruption.flightNumber) return

    const passengersAffected = flightInstances.find(f => f.flightNumber === newDisruption.flightNumber)?.bookedSeats || 150
    const estimatedCost = passengersAffected * 250 + (newDisruption.estimatedDelayMinutes * 5)

    createDisruption({
      flightNumber: newDisruption.flightNumber,
      type: newDisruption.type,
      code: newDisruption.code || 'GEN',
      reason: newDisruption.reason || 'Unknown',
      impact: {
        passengers: passengersAffected,
        estimatedCost,
        estimatedDelayMinutes: newDisruption.estimatedDelayMinutes
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    })
    setShowDisruptionDialog(false)
    setNewDisruption({
      flightNumber: '',
      type: 'delay',
      code: '',
      reason: '',
      estimatedDelayMinutes: 0,
      passengersAffected: 0
    })
  }

  const handleResolveDisruption = (disruptionId: string) => {
    const disruption = disruptions.find(d => d.id === disruptionId)
    if (!disruption) return

    // Find and update the disruption in store
    const updatedDisruptions = disruptions.map(d => 
      d.id === disruptionId ? { ...d, status: 'resolved', resolvedAt: new Date().toISOString() } : d
    )
    setDisruptions(updatedDisruptions)
    
    toast({ 
      title: 'Disruption Resolved', 
      description: `Disruption for ${disruption.flightNumber} has been resolved` 
    })
  }

  const handleAutoReaccommodate = (disruptionId: string) => {
    const disruption = disruptions.find(d => d.id === disruptionId)
    if (!disruption) return

    // Simulate auto-reaccommodation with realistic details
    const passengersReaccommodated = Math.floor(disruption.impact.passengers * 0.85) // 85% reaccommodated
    const alternativeFlights = Math.ceil(passengersReaccommodated / 150) // ~150 per flight
    
    toast({ 
      title: 'Auto-Reaccommodation Complete', 
      description: `${passengersReaccommodated} passengers rebooked across ${alternativeFlights} alternative flights` 
    })
  }

  // Dispatch handlers
  const handleGenerateFlightRelease = () => {
    if (!selectedFlightForDispatch) {
      toast({ title: 'No Flight Selected', description: 'Please select a flight first', variant: 'destructive' })
      return
    }

    setSelectedFlightForSchedule(selectedFlightForDispatch)
    setFlightReleaseApproved(false)

    // Generate a complete flight release with all required data
    const flightRelease = {
      flightNumber: selectedFlightForDispatch.flightNumber,
      origin: selectedFlightForDispatch.origin,
      destination: selectedFlightForDispatch.destination,
      aircraftType: selectedFlightForDispatch.aircraftType,
      departureTime: selectedFlightForDispatch.departureTime || '08:00',
      arrivalTime: selectedFlightForDispatch.arrivalTime || '16:25',
      generatedAt: new Date().toISOString(),
      weather: {
        departure: dispatchWeather.departure,
        destination: dispatchWeather.destination
      },
      notams: notams,
      atcRestrictions: atcRestrictions,
      alternateAirports: alternateAirports,
      fuelPlan: {
        ...fuelPlan,
        total: totalFuel
      },
      route: {
        distance: selectedFlightForDispatch?.distance || 0,
        flightTime: selectedFlightForDispatch?.duration || 0
      },
      crew: {
        captain: 'Capt. J. Smith',
        firstOfficer: 'F/O M. Johnson',
        cabinCrew: 4
      },
      status: 'Ready for departure'
    }

    setGeneratedFlightRelease(flightRelease)
    setShowFlightReleaseDialog(true)

    toast({ title: 'Flight Release Generated', description: `Flight ${selectedFlightForDispatch.flightNumber} release has been generated` })
  }

  const handleApproveFlightRelease = () => {
    setFlightReleaseApproved(true)
    toast({ title: 'Flight Release Approved', description: `Flight ${generatedFlightRelease?.flightNumber} has been approved for departure` })
  }

  const handleRefreshWeather = () => {
    // Simulate more realistic weather refresh with conditions
    const weatherConditions = ['Clear skies', 'Partly cloudy', 'Overcast', 'Light rain', 'Scattered clouds', 'Few clouds']
    const cloudCeilings = ['Unlimited', 'Unlimited', 'Unlimited', '5000ft AGL', '8000ft AGL', '2500ft AGL', '1500ft AGL']
    
    setDispatchWeather({
      departure: { 
        ...dispatchWeather.departure, 
        condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        temp: Math.round(dispatchWeather.departure.temp + (Math.random() - 0.5) * 8),
        windSpeed: Math.max(0, Math.min(50, dispatchWeather.departure.windSpeed + Math.round((Math.random() - 0.5) * 10))),
        windDirection: (dispatchWeather.departure.windDirection + Math.round((Math.random() - 0.5) * 30) + 360) % 360,
        visibility: Math.max(1, Math.min(20, Math.round(dispatchWeather.departure.visibility + (Math.random() - 0.5) * 3))),
        pressure: Math.round(dispatchWeather.departure.pressure + (Math.random() - 0.5) * 5),
        dewPoint: Math.round(dispatchWeather.departure.temp - Math.random() * 10),
        cloudCeiling: cloudCeilings[Math.floor(Math.random() * cloudCeilings.length)]
      },
      destination: { 
        ...dispatchWeather.destination, 
        condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        temp: Math.round(dispatchWeather.destination.temp + (Math.random() - 0.5) * 8),
        windSpeed: Math.max(0, Math.min(50, dispatchWeather.destination.windSpeed + Math.round((Math.random() - 0.5) * 10))),
        windDirection: (dispatchWeather.destination.windDirection + Math.round((Math.random() - 0.5) * 30) + 360) % 360,
        visibility: Math.max(1, Math.min(20, Math.round(dispatchWeather.destination.visibility + (Math.random() - 0.5) * 3))),
        pressure: Math.round(dispatchWeather.destination.pressure + (Math.random() - 0.5) * 5),
        dewPoint: Math.round(dispatchWeather.destination.temp - Math.random() * 10),
        cloudCeiling: cloudCeilings[Math.floor(Math.random() * cloudCeilings.length)]
      }
    })
    toast({ title: 'Weather Refreshed', description: 'Latest weather information loaded' })
  }

  const handleRefreshNotams = () => {
    // Simulate NOTAM refresh with new realistic NOTAMs
    const notamTypes = ['maintenance', 'construction', 'navigation', 'obstacle', 'airspace']
    const airports = ['JFK', 'LHR', 'LAX', 'TYO', 'SFO', 'DXB', 'FRA', 'PAR', 'SIN', 'HKG']
    const messages = [
      'RWY 04R/22L closed for maintenance',
      'ILS approach out of service - use visual approach',
      'Taxiway Alpha closed between intersections B and C',
      'Crane operations 500ft AGL near terminal 3',
      'Temporary restricted airspace active for event',
      'Ground radar unreliable - use visual confirmation',
      'Fuel truck operations on apron C',
      'De-icing equipment in use at stands 1-10'
    ]
    
    // Add 1-2 new NOTAMs randomly
    const newNotamsCount = Math.floor(Math.random() * 2) + 1
    const newNotams = Array.from({ length: newNotamsCount }, (_, i) => ({
      id: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}/24`,
      airport: airports[Math.floor(Math.random() * airports.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      type: notamTypes[Math.floor(Math.random() * notamTypes.length)] as 'maintenance' | 'construction' | 'navigation' | 'obstacle' | 'airspace',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
    
    setNotams([...newNotams, ...notams].slice(0, 10)) // Keep max 10 NOTAMs
    toast({ title: 'NOTAMs Refreshed', description: `${newNotamsCount} new NOTAM(s) loaded` })
  }

  const handleUpdateATC = () => {
    // Simulate ATC update with dynamic restrictions
    const regions = ['EUR', 'NAT', 'PAC', 'USA', 'ASIA', 'MID']
    const restrictionTypes = ['Flow control', 'Route restrictions', 'Slot reductions', 'Ground delay', 'Miles-in-trail']
    const levels = ['Active', 'Moderate', 'Low', 'High']
    
    // Update existing restrictions with new values
    const updatedRestrictions = atcRestrictions.map(restriction => ({
      ...restriction,
      level: levels[Math.floor(Math.random() * levels.length)],
      slotDelay: Math.max(0, restriction.slotDelay + Math.round((Math.random() - 0.5) * 15))
    }))
    
    // Occasionally add a new restriction
    if (Math.random() > 0.7) {
      const newRestriction = {
        id: String(updatedRestrictions.length + 1),
        region: regions[Math.floor(Math.random() * regions.length)],
        type: restrictionTypes[Math.floor(Math.random() * restrictionTypes.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        description: `Updated at ${new Date().toLocaleTimeString()}`,
        slotDelay: Math.floor(Math.random() * 45)
      }
      setAtcRestrictions([newRestriction, ...updatedRestrictions].slice(0, 8))
    } else {
      setAtcRestrictions(updatedRestrictions)
    }
    
    // Update alternate airports with new delays
    setAlternateAirports(alternateAirports.map(alt => ({
      ...alt,
      estimatedDelay: Math.max(0, alt.estimatedDelay + Math.round((Math.random() - 0.5) * 10))
    })))
    
    toast({ title: 'ATC Updated', description: 'ATC restrictions have been updated' })
  }

  // Additional handlers for Edit buttons - now with dialogs
  const handleEditRoute = (routeId: string) => {
    const route = routes.find(r => r.id === routeId)
    if (route) {
      setEditingRoute(route)
      setShowEditRouteDialog(true)
    }
  }

  const handleEditSchedule = (scheduleId: string) => {
    const schedule = flightSchedules.find(s => s.id === scheduleId)
    if (schedule) {
      setEditingSchedule(schedule)
      setShowEditScheduleDialog(true)
    }
  }

  const handleEditSeasonalSchedule = (scheduleId: string) => {
    const schedule = seasonalSchedules.find(s => s.id === scheduleId)
    if (schedule) {
      setEditingSeasonalSchedule(schedule)
      setShowEditSeasonalDialog(true)
    }
  }

  const handleEditFleetAssignment = (assignmentId: string) => {
    const assignment = fleetAssignments.find(a => a.id === assignmentId)
    if (assignment) {
      setEditingFleetAssignment(assignment)
      setShowEditFleetDialog(true)
    }
  }

  // Save handlers for edit dialogs
  const handleSaveRoute = () => {
    if (!editingRoute) return
    setRoutes(routes.map(r => r.id === editingRoute.id ? editingRoute : r))
    setShowEditRouteDialog(false)
    setEditingRoute(null)
    toast({ title: 'Route Updated', description: `${editingRoute.origin} → ${editingRoute.destination} has been updated` })
  }

  const handleSaveSchedule = () => {
    if (!editingSchedule) return
    updateFlightSchedule(editingSchedule.id, editingSchedule)
    toast({ title: 'Schedule Updated', description: `${editingSchedule.flightNumber} has been updated` })
    setShowEditScheduleDialog(false)
    setEditingSchedule(null)
  }

  const handleSaveSeasonalSchedule = () => {
    if (!editingSeasonalSchedule) return
    setSeasonalSchedules(seasonalSchedules.map(s => s.id === editingSeasonalSchedule.id ? editingSeasonalSchedule : s))
    setShowEditSeasonalDialog(false)
    setEditingSeasonalSchedule(null)
    toast({ title: 'Seasonal Schedule Updated', description: `${editingSeasonalSchedule.season} season has been updated` })
  }

  const handleSaveFleetAssignment = () => {
    if (!editingFleetAssignment) return
    setFleetAssignments(fleetAssignments.map(f => f.id === editingFleetAssignment.id ? editingFleetAssignment : f))
    setShowEditFleetDialog(false)
    setEditingFleetAssignment(null)
    toast({ title: 'Fleet Assignment Updated', description: `${editingFleetAssignment.registration} has been updated` })
  }

  const handleDownloadPDF = () => {
    const flightNum = selectedFlightForDispatch?.flightNumber || 'Unknown'
    const origin = selectedFlightForDispatch?.origin || 'N/A'
    const dest = selectedFlightForDispatch?.destination || 'N/A'
    
    const pdfContent = `================================================================================
                              FLIGHT RELEASE DOCUMENT
================================================================================

Generated: ${new Date().toLocaleString()}
Flight: ${flightNum}
Route: ${origin} → ${dest}
Aircraft: ${selectedFlightForDispatch?.aircraftType || 'N/A'}
Status: Ready for departure

--------------------------------------------------------------------------------
                              FLIGHT INFORMATION
--------------------------------------------------------------------------------

Departure Time: ${selectedFlightForDispatch?.departureTime || 'N/A'}
Arrival Time: ${selectedFlightForDispatch?.arrivalTime || 'N/A'}
Flight Duration: ${selectedFlightForDispatch?.duration || 0} minutes
Distance: ${selectedFlightForDispatch?.distance || 0} km

--------------------------------------------------------------------------------
                              WEATHER INFORMATION
--------------------------------------------------------------------------------

DEPARTURE (${origin}):
  Conditions: ${dispatchWeather.departure.condition}
  Temperature: ${dispatchWeather.departure.temp}°C
  Wind: ${dispatchWeather.departure.windSpeed}kt from ${dispatchWeather.departure.windDirection}°
  Visibility: ${dispatchWeather.departure.visibility}km
  Pressure: ${dispatchWeather.departure.pressure} hPa
  Dew Point: ${dispatchWeather.departure.dewPoint}°C
  Cloud Ceiling: ${dispatchWeather.departure.cloudCeiling}

DESTINATION (${dest}):
  Conditions: ${dispatchWeather.destination.condition}
  Temperature: ${dispatchWeather.destination.temp}°C
  Wind: ${dispatchWeather.destination.windSpeed}kt from ${dispatchWeather.destination.windDirection}°
  Visibility: ${dispatchWeather.destination.visibility}km
  Pressure: ${dispatchWeather.destination.pressure} hPa
  Dew Point: ${dispatchWeather.destination.dewPoint}°C
  Cloud Ceiling: ${dispatchWeather.destination.cloudCeiling}

--------------------------------------------------------------------------------
                              ACTIVE NOTAMs
--------------------------------------------------------------------------------

${notams.map(n => `  ${n.id} - ${n.airport}
  Type: ${n.type}
  Valid: ${n.validFrom} to ${n.validTo}
  ${n.message}`).join('\n\n')}

--------------------------------------------------------------------------------
                              ATC RESTRICTIONS
--------------------------------------------------------------------------------

${atcRestrictions.map(r => `  ${r.region} - ${r.type}
  Level: ${r.level}
  Slot Delay: ${r.slotDelay}min
  ${r.description}`).join('\n\n')}

--------------------------------------------------------------------------------
                              ALTERNATE AIRPORTS
--------------------------------------------------------------------------------

${alternateAirports.map(a => `  ${a.code} - ${a.name} (${a.type})
  Distance: ${a.distance}nm
  Weather: ${a.weather}
  Est. Delay: ${a.estimatedDelay}min`).join('\n')}

--------------------------------------------------------------------------------
                              FUEL PLAN
--------------------------------------------------------------------------------

  Trip Fuel:      ${fuelPlan.tripFuel.toLocaleString()} kg
  Reserve Fuel:   ${fuelPlan.reserve.toLocaleString()} kg
  Alternate Fuel:  ${fuelPlan.alternate.toLocaleString()} kg
  Taxi Fuel:      ${fuelPlan.taxi.toLocaleString()} kg
  Contingency:    ${fuelPlan.contingency.toLocaleString()} kg
  -----------------------------------------------------------------------------
  TOTAL FUEL:     ${totalFuel.toLocaleString()} kg

--------------------------------------------------------------------------------
                              CREW INFORMATION
--------------------------------------------------------------------------------

  Captain:      Capt. J. Smith
  First Officer: F/O M. Johnson
  Cabin Crew:   4 Flight Attendants

================================================================================
                              END OF FLIGHT RELEASE
================================================================================
`
    
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `flight-release-${flightNum}-${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    
    toast({ title: 'Download Complete', description: 'Flight release document downloaded' })
  }

  const totalFuel = fuelPlan.tripFuel + fuelPlan.reserve + fuelPlan.alternate + fuelPlan.taxi + fuelPlan.contingency

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Flight Operations Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule Planning, Disruption Management, and Flight Dispatch
          </p>
        </div>
      </div>

      {/* Operations Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Flights</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flightSchedules.length}</div>
            <div className="text-xs text-muted-foreground mt-1">active schedules</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Operations</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flightInstances.length}</div>
            <div className="text-xs text-muted-foreground mt-1">flights today</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <div className="text-xs text-green-600 mt-1">+2.3% vs last week</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Disruptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disruptions.filter(d => d.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">requiring attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Schedule Planning</TabsTrigger>
          <TabsTrigger value="disruption">Disruption Management</TabsTrigger>
          <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
        </TabsList>

        {/* Schedule Planning Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {/* Route Planning Section */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center flex-wrap gap-2">
                  <Route className="h-5 w-5" />
                  Route Planning
                </CardTitle>
                <Dialog open={showRoutePlanningDialog} onOpenChange={setShowRoutePlanningDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Route
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Route</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Origin Airport</Label>
                          <Input value={newRoute.origin} onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})} placeholder="JFK" />
                        </div>
                        <div>
                          <Label>Destination Airport</Label>
                          <Input value={newRoute.destination} onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})} placeholder="LHR" />
                        </div>
                        <div>
                          <Label>Distance (km)</Label>
                          <Input type="number" value={newRoute.distance || ''} onChange={(e) => setNewRoute({...newRoute, distance: Number(e.target.value)})} placeholder="5567" />
                        </div>
                        <div>
                          <Label>Flight Time (min)</Label>
                          <Input type="number" value={newRoute.flightTime || ''} onChange={(e) => setNewRoute({...newRoute, flightTime: Number(e.target.value)})} placeholder="435" />
                        </div>
                      </div>
                      <div>
                        <Label>Available Aircraft Types</Label>
                        <div className="space-y-2">
                          {['B737-800', 'A320-200', 'A330-300', 'B777-300ER', 'A350-900', 'A380'].map((type) => (
                            <div key={type} className="flex items-center flex-wrap space-x-2">
                              <input 
                                type="checkbox" 
                                id={`ac-${type}`}
                                checked={newRoute.aircraftTypes.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRoute({...newRoute, aircraftTypes: [...newRoute.aircraftTypes, type]})
                                  } else {
                                    setNewRoute({...newRoute, aircraftTypes: newRoute.aircraftTypes.filter(t => t !== type)})
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={`ac-${type}`} className="text-sm">{type}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Route Priority</Label>
                          <Select value={newRoute.priority} onValueChange={(v: any) => setNewRoute({...newRoute, priority: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Demand Level</Label>
                          <Select value={newRoute.demand} onValueChange={(v: any) => setNewRoute({...newRoute, demand: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Competitors</Label>
                          <Input type="number" value={newRoute.competition || ''} onChange={(e) => setNewRoute({...newRoute, competition: Number(e.target.value)})} placeholder="3" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRoutePlanningDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateRoute}>Add Route</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Define routes, aircraft compatibility, and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 overflow-x-auto">
                <table className="enterprise-table min-w-[1000px]">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Distance</th>
                      <th>Flight Time</th>
                      <th>Priority</th>
                      <th>Demand</th>
                      <th>Aircraft Types</th>
                      <th>Competitors</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((route) => (
                      <tr key={route.id}>
                        <td className="font-medium">{route.origin} → {route.destination}</td>
                        <td>{route.distance.toLocaleString()} km</td>
                        <td>{route.flightTime} min</td>
                        <td>
                          <Badge variant={route.priority === 'high' ? 'default' : route.priority === 'medium' ? 'secondary' : 'outline'}>
                            {route.priority}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant={route.demand === 'high' ? 'default' : route.demand === 'medium' ? 'secondary' : 'outline'}>
                            {route.demand}
                          </Badge>
                        </td>
                        <td className="text-sm">{route.aircraftTypes.join(', ')}</td>
                        <td>{route.competition}</td>
                        <td>
                          <Button variant="ghost" size="sm" onClick={() => handleEditRoute(route.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Schedule Planning Section */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center flex-wrap gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Flight Schedules
                </CardTitle>
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Flight Schedule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Route</Label>
                          <Select value={newSchedule.routeId} onValueChange={(v) => setNewSchedule({...newSchedule, routeId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                            <SelectContent>
                              {routes.map(route => (
                                <SelectItem key={route.id} value={route.id}>{route.origin} → {route.destination}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Aircraft Type</Label>
                          <Select value={newSchedule.aircraftType} onValueChange={(v) => setNewSchedule({...newSchedule, aircraftType: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {getAircraftTypesForRoute(newSchedule.routeId).map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Effective Season</Label>
                          <Select value={newSchedule.effectiveSeason} onValueChange={(v: any) => setNewSchedule({...newSchedule, effectiveSeason: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Season</SelectItem>
                              <SelectItem value="shoulder">Shoulder Season</SelectItem>
                              <SelectItem value="peak">Peak Season</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Time Slots</Label>
                          <Select value={newSchedule.slotId} onValueChange={(v) => setNewSchedule({...newSchedule, slotId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                            <SelectContent>
                              {routes.find(r => r.id === newSchedule.routeId)?.slots.map((slot, i) => (
                                <SelectItem key={slot.id} value={slot.id}>
                                  {slot.time} ({slot.status})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Operating Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                            const dayNum = i + 1
                            return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setNewSchedule(prev => ({
                                  ...prev,
                                  daysOfWeek: prev.daysOfWeek.includes(dayNum)
                                    ? prev.daysOfWeek.filter(d => d !== dayNum)
                                    : [...prev.daysOfWeek, dayNum]
                                }))
                              }}
                              className={`px-3 py-2 text-sm rounded-md border ${
                                newSchedule.daysOfWeek.includes(dayNum)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border-gray-300 hover:bg-secondary'
                              }`}
                            >
                              {day}
                            </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateSchedule}>Create Schedule</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Create flight schedules with route, frequency, and fleet assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 overflow-x-auto">
                <table className="enterprise-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th>Route</th>
                      <th>Dep</th>
                      <th>Arr</th>
                      <th>Days</th>
                      <th>Aircraft</th>
                      <th>Season</th>
                      <th>Slot</th>
                      <th>Frequency</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flightSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td className="font-medium">{schedule.flightNumber}</td>
                        <td>{schedule.origin} → {schedule.destination}</td>
                        <td className="text-sm">{schedule.departureTime}</td>
                        <td className="text-sm">{schedule.arrivalTime}</td>
                        <td className="text-sm">{schedule.daysOfWeek.map(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d-1]).join(', ')}</td>
                        <td className="text-sm">{schedule.aircraftType}</td>
                        <td>
                          <Badge variant={schedule.season ? 'outline' : 'secondary'}>
                            {schedule.season || 'Standard'}
                          </Badge>
                        </td>
                        <td className="text-sm">{schedule.slot?.time || '-'}</td>
                        <td className="text-sm">{schedule.frequencies}/week</td>
                        <td>
                          <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                            {schedule.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="ghost" size="sm" onClick={() => handleEditSchedule(schedule.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seasonal Scheduling */}
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center flex-wrap gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Seasonal Schedules
                  </CardTitle>
                  <Dialog open={showSeasonalDialog} onOpenChange={setShowSeasonalDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Season
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Seasonal Schedule</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Season</Label>
                            <Select value={newSeasonalSchedule.season} onValueChange={(v: any) => setNewSeasonalSchedule({...newSeasonalSchedule, season: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low Season</SelectItem>
                                <SelectItem value="shoulder">Shoulder Season</SelectItem>
                                <SelectItem value="peak">Peak Season</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={newSeasonalSchedule.startDate} onChange={(e) => setNewSeasonalSchedule({...newSeasonalSchedule, startDate: e.target.value})} />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input type="date" value={newSeasonalSchedule.endDate} onChange={(e) => setNewSeasonalSchedule({...newSeasonalSchedule, endDate: e.target.value})} />
                          </div>
                          <div>
                            <Label>Frequency Multiplier</Label>
                            <div className="flex items-center flex-wrap gap-4">
                              <Slider
                                min={0.5}
                                max={1.5}
                                step={0.1}
                                value={newSeasonalSchedule.frequencyMultiplier}
                                onValueChange={(v) => setNewSeasonalSchedule({...newSeasonalSchedule, frequencyMultiplier: v})}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground w-12">{newSeasonalSchedule.frequencyMultiplier}x</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Pricing Multiplier</Label>
                          <div className="flex items-center flex-wrap gap-4">
                            <Slider
                              min={0.5}
                              max={2.0}
                              step={0.05}
                              value={newSeasonalSchedule.pricingMultiplier}
                              onValueChange={(v) => setNewSeasonalSchedule({...newSeasonalSchedule, pricingMultiplier: v})}
                              className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground w-12">{newSeasonalSchedule.pricingMultiplier}x</span>
                          </div>
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Textarea value={newSeasonalSchedule.notes} onChange={(e) => setNewSeasonalSchedule({...newSeasonalSchedule, notes: e.target.value})} placeholder="Seasonal considerations..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSeasonalDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateSeasonalSchedule}>Add Season</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 overflow-x-auto">
                  <table className="enterprise-table min-w-[800px]">
                    <thead>
                      <tr>
                        <th>Season</th>
                        <th>Period</th>
                        <th>Freq. Multiplier</th>
                        <th>Price Multiplier</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonalSchedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td className="font-medium capitalize">{schedule.season} Season</td>
                          <td className="text-sm">{schedule.startDate} to {schedule.endDate}</td>
                          <td className="text-sm font-medium text-primary">{schedule.frequencyMultiplier}x</td>
                          <td className="text-sm font-medium text-green-600">{schedule.pricingMultiplier}x</td>
                          <td className="text-sm text-muted-foreground max-w-xs truncate">{schedule.notes}</td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => handleEditSeasonalSchedule(schedule.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Fleet Assignment */}
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center flex-wrap gap-2">
                    <Database className="h-5 w-5" />
                    Fleet Assignment
                  </CardTitle>
                  <Dialog open={showFleetDialog} onOpenChange={setShowFleetDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Fleet
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Aircraft to Route</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Registration</Label>
                            <Select value={newFleetAssignment.registration} onValueChange={(v) => setNewFleetAssignment({...newFleetAssignment, registration: v})}>
                              <SelectTrigger><SelectValue placeholder="Select aircraft" /></SelectTrigger>
                              <SelectContent>
                                {fleetAssignments.map(fa => (
                                  <SelectItem key={fa.registration} value={fa.registration}>
                                    {fa.registration} ({fa.aircraftType})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Aircraft Type</Label>
                            <Select value={newFleetAssignment.aircraftType} onValueChange={(v) => setNewFleetAssignment({...newFleetAssignment, aircraftType: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="B737-800">B737-800</SelectItem>
                                <SelectItem value="A320-200">A320-200</SelectItem>
                                <SelectItem value="A330-300">A330-300</SelectItem>
                                <SelectItem value="B777-300ER">B777-300ER</SelectItem>
                                <SelectItem value="A350-900">A350-900</SelectItem>
                                <SelectItem value="A380">A380</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Base Airport</Label>
                            <Input value={newFleetAssignment.base} onChange={(e) => setNewFleetAssignment({...newFleetAssignment, base: e.target.value})} placeholder="JFK" />
                          </div>
                          <div>
                            <Label>Target Utilization %</Label>
                            <div className="flex items-center flex-wrap gap-4">
                              <Slider
                                min={60}
                                max={100}
                                value={newFleetAssignment.utilizationRate}
                                onValueChange={(v) => setNewFleetAssignment({...newFleetAssignment, utilizationRate: v})}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground w-12">{newFleetAssignment.utilizationRate}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Assigned Routes</Label>
                          <div className="space-y-2">
                            {routes.map(route => (
                              <div key={route.id} className="flex items-center flex-wrap space-x-2">
                                <input 
                                  type="checkbox"
                                  id={`route-${route.id}`}
                                  checked={newFleetAssignment.routes.includes(route.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewFleetAssignment({...newFleetAssignment, routes: [...newFleetAssignment.routes, route.id]})
                                    } else {
                                      setNewFleetAssignment({...newFleetAssignment, routes: newFleetAssignment.routes.filter(r => r !== route.id)})
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <label htmlFor={`route-${route.id}`} className="text-sm">{route.origin} → {route.destination}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFleetDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateFleetAssignment}>Assign Fleet</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 overflow-x-auto">
                  <table className="enterprise-table min-w-[900px]">
                    <thead>
                      <tr>
                        <th>Registration</th>
                        <th>Type</th>
                        <th>Base</th>
                        <th>Routes</th>
                        <th>Utilization</th>
                        <th>Maintenance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetAssignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td className="font-medium">{assignment.registration}</td>
                          <td>{assignment.aircraftType}</td>
                          <td>{assignment.base}</td>
                          <td className="text-sm">{assignment.routes.join(', ')}</td>
                          <td>
                            <div className="flex items-center flex-wrap gap-2">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${assignment.utilizationRate >= 95 ? 'bg-green-500' : assignment.utilizationRate >= 85 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                  style={{ width: `${assignment.utilizationRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{assignment.utilizationRate}%</span>
                            </div>
                          </td>
                          <td>
                            <Badge variant={assignment.maintenanceSchedule.length > 0 ? 'destructive' : 'secondary'}>
                              {assignment.maintenanceSchedule.length} scheduled
                            </Badge>
                          </td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => handleEditFleetAssignment(assignment.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Disruption Management Tab */}
        <TabsContent value="disruption" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Disruption Management</CardTitle>
                <Dialog open={showDisruptionDialog} onOpenChange={setShowDisruptionDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Log Disruption
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Disruption Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Flight Number</Label>
                          <Select value={newDisruption.flightNumber} onValueChange={(v) => setNewDisruption({...newDisruption, flightNumber: v})}>
                            <SelectTrigger><SelectValue placeholder="Select flight" /></SelectTrigger>
                            <SelectContent>
                              {flightInstances.map(f => (
                                <SelectItem key={f.id} value={f.flightNumber}>{f.flightNumber} - {f.origin}→{f.destination}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Disruption Type</Label>
                          <Select value={newDisruption.type} onValueChange={(v: any) => setNewDisruption({...newDisruption, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="delay">Delay</SelectItem>
                              <SelectItem value="cancellation">Cancellation</SelectItem>
                              <SelectItem value="diversion">Diversion</SelectItem>
                              <SelectItem value="aircraft_swap">Aircraft Swap</SelectItem>
                              <SelectItem value="crew_change">Crew Change</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Delay Code</Label>
                          <Select value={newDisruption.code} onValueChange={(v) => setNewDisruption({...newDisruption, code: v})}>
                            <SelectTrigger><SelectValue placeholder="Select code" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WX">WX - Weather</SelectItem>
                              <SelectItem value="MT">MT - Maintenance</SelectItem>
                              <SelectItem value="CT">CT - Crew</SelectItem>
                              <SelectItem value="AT">AT - ATC</SelectItem>
                              <SelectItem value="PS">PS - Passenger</SelectItem>
                              <SelectItem value="GEN">GEN - General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Est. Delay (minutes)</Label>
                          <Input type="number" value={newDisruption.estimatedDelayMinutes || ''} onChange={(e) => setNewDisruption({...newDisruption, estimatedDelayMinutes: Number(e.target.value)})} placeholder="30" />
                        </div>
                      </div>
                      <div>
                        <Label>Reason</Label>
                        <Textarea value={newDisruption.reason} onChange={(e) => setNewDisruption({...newDisruption, reason: e.target.value})} placeholder="Severe weather conditions at departure airport" rows={3} />
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-sm">
                        <div className="flex items-center flex-wrap gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-800">
                            Auto-reaccommodation will be available after logging. Affected passengers will be calculated automatically.
                          </span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDisruptionDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleCreateDisruption}>Log Disruption</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Auto re-accommodation, passenger re-protection, and disruption handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 overflow-x-auto">
                <table className="enterprise-table min-w-[1000px]">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Code</th>
                      <th>Pax Affected</th>
                      <th>Est. Cost</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disruptions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No disruption events recorded
                        </td>
                      </tr>
                    ) : (
                      disruptions.map((disruption) => (
                        <tr key={disruption.id}>
                          <td className="font-medium">{disruption.flightNumber}</td>
                          <td>
                            <Badge variant="destructive" className="capitalize">{disruption.type}</Badge>
                          </td>
                          <td className="text-sm">{disruption.reason}</td>
                          <td className="text-sm font-mono">{disruption.code}</td>
                          <td className="text-sm">{disruption.impact.passengers}</td>
                          <td className="text-sm text-red-600">${disruption.impact.estimatedCost.toLocaleString()}</td>
                          <td>
                            <Badge 
                              variant={disruption.status === 'active' ? 'destructive' : 
                                      disruption.status === 'resolved' ? 'default' : 'secondary'}
                              className="capitalize"
                            >
                              {disruption.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="flex items-center flex-wrap gap-1">
                              {disruption.status === 'active' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleAutoReaccommodate(disruption.id)} title="Auto-reaccommodate passengers">
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleResolveDisruption(disruption.id)} title="Resolve disruption">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                </>
                              )}
                              {disruption.status === 'resolved' && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dispatch Tab */}
        <TabsContent value="dispatch" className="space-y-4">
          {/* Flight Selection */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Flight Selection</CardTitle>
                <Select value={selectedFlightForDispatch?.id || ''} onValueChange={(v) => setSelectedFlightForDispatch(flightSchedules.find(s => s.id === v) || null)}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="Select flight for dispatch" /></SelectTrigger>
                  <SelectContent>
                    {flightSchedules.map(schedule => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {schedule.flightNumber} - {schedule.origin} → {schedule.destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Select a flight to view and manage dispatch information
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Flight Release</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleRefreshWeather}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <CardDescription>
                  Weather integration, NOTAMs, and flight documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <Cloud className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Departure Weather</span>
                      </div>
                      <Badge variant={dispatchWeather.departure.visibility >= 10 ? 'default' : 'destructive'} className="text-xs">
                        {dispatchWeather.departure.visibility >= 10 ? 'OK' : 'WARNING'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{dispatchWeather.departure.condition}, {dispatchWeather.departure.temp}°C</div>
                      <div>Wind: {dispatchWeather.departure.windSpeed}kt from {dispatchWeather.departure.windDirection}°</div>
                      <div>Visibility: {dispatchWeather.departure.visibility}km</div>
                      <div>Pressure: {dispatchWeather.departure.pressure} hPa</div>
                      <div>Cloud Ceiling: {dispatchWeather.departure.cloudCeiling}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <Cloud className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Destination Weather</span>
                      </div>
                      <Badge variant={dispatchWeather.destination.visibility >= 10 ? 'default' : 'destructive'} className="text-xs">
                        {dispatchWeather.destination.visibility >= 10 ? 'OK' : 'WARNING'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{dispatchWeather.destination.condition}, {dispatchWeather.destination.temp}°C</div>
                      <div>Wind: {dispatchWeather.destination.windSpeed}kt from {dispatchWeather.destination.windDirection}°</div>
                      <div>Visibility: {dispatchWeather.destination.visibility}km</div>
                      <div>Pressure: {dispatchWeather.destination.pressure} hPa</div>
                      <div>Cloud Ceiling: {dispatchWeather.destination.cloudCeiling}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Active NOTAMs</h3>
                    <Button variant="ghost" size="sm" onClick={handleRefreshNotams}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {notams.map(notam => (
                        <div key={notam.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded-sm text-sm">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{notam.id} - {notam.airport}</div>
                            <Badge variant="outline" className="text-xs">{notam.type}</Badge>
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">{notam.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">Valid: {notam.validFrom} to {notam.validTo}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button className="w-full" onClick={handleGenerateFlightRelease}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Flight Release
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ATC Integration</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleUpdateATC}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
                <CardDescription>
                  Air Traffic Control restrictions and slot management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Slot Status</div>
                      <div className="text-xs text-muted-foreground mt-1">All slots confirmed</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">ATC Restrictions</h3>
                  <div className="space-y-2">
                    {atcRestrictions.map(restriction => (
                      <div key={restriction.id} className="p-2 bg-secondary/30 rounded-sm text-sm flex items-center justify-between">
                        <div>
                          <div className="font-medium">{restriction.type} - {restriction.region}</div>
                          <div className="text-xs text-muted-foreground">{restriction.description}</div>
                          <div className="text-xs text-orange-600">Slot Delay: {restriction.slotDelay}min</div>
                        </div>
                        <Badge variant={restriction.level === 'Active' || restriction.level === 'High' ? 'destructive' : 'outline'}>
                          {restriction.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Alternate Airports</h3>
                  <div className="space-y-2">
                    {alternateAirports.map(alt => (
                      <div key={alt.code} className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded-sm">
                        <div className="flex items-center flex-wrap gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{alt.code} ({alt.name})</div>
                            <div className="text-xs text-muted-foreground">{alt.distance}nm • {alt.weather}</div>
                            {alt.estimatedDelay > 0 && <div className="text-xs text-orange-600">Est. Delay: {alt.estimatedDelay}min</div>}
                          </div>
                        </div>
                        <Badge variant={alt.type === 'Primary' ? 'default' : 'secondary'}>{alt.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Fuel Planning</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center flex-wrap gap-2">
                        <Fuel className="h-5 w-5 text-primary" />
                        <span className="font-medium">Fuel Requirements</span>
                      </div>
                      <GaugeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trip Fuel:</span>
                        <div className="font-medium">{fuelPlan.tripFuel.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reserve:</span>
                        <div className="font-medium">{fuelPlan.reserve.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Alternate:</span>
                        <div className="font-medium">{fuelPlan.alternate.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taxi:</span>
                        <div className="font-medium">{fuelPlan.taxi.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contingency:</span>
                        <div className="font-medium">{fuelPlan.contingency.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <div className="font-bold text-primary text-lg">{totalFuel.toLocaleString()} kg</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      Based on route distance, aircraft type, and weather conditions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flight Status Timeline */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Flight Status Timeline</CardTitle>
              <CardDescription>
                Track flight progress and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between overflow-x-auto">
                {[
                  { status: 'scheduled', label: 'Scheduled', time: '08:00' },
                  { status: 'checkin_open', label: 'Check-in Open', time: '05:00' },
                  { status: 'boarding', label: 'Boarding', time: '07:30' },
                  { status: 'departed', label: 'Departed', time: '08:05' },
                  { status: 'enroute', label: 'En Route', time: '08:10' },
                  { status: 'arrived', label: 'Arrived', time: '16:25' }
                ].map((milestone, i) => (
                  <div key={milestone.status} className="flex flex-col items-center flex-1 min-w-[80px]">
                    <div className={`w-4 h-4 rounded-full ${i < 3 ? 'bg-primary' : 'bg-gray-300'}`} />
                    <div className="text-xs mt-2 font-medium text-center">{milestone.label}</div>
                    <div className="text-xs text-muted-foreground">{milestone.time}</div>
                    {i < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground mt-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Route Dialog */}
      <Dialog open={showEditRouteDialog} onOpenChange={setShowEditRouteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          {editingRoute && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Origin Airport</Label>
                  <Input value={editingRoute.origin} onChange={(e) => setEditingRoute({...editingRoute, origin: e.target.value})} />
                </div>
                <div>
                  <Label>Destination Airport</Label>
                  <Input value={editingRoute.destination} onChange={(e) => setEditingRoute({...editingRoute, destination: e.target.value})} />
                </div>
                <div>
                  <Label>Distance (km)</Label>
                  <Input type="number" value={editingRoute.distance} onChange={(e) => setEditingRoute({...editingRoute, distance: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Flight Time (min)</Label>
                  <Input type="number" value={editingRoute.flightTime} onChange={(e) => setEditingRoute({...editingRoute, flightTime: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Route Priority</Label>
                  <Select value={editingRoute.priority} onValueChange={(v: any) => setEditingRoute({...editingRoute, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Demand Level</Label>
                  <Select value={editingRoute.demand} onValueChange={(v: any) => setEditingRoute({...editingRoute, demand: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Aircraft Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['B737-800', 'A320-200', 'A330-300', 'B777-300ER', 'A350-900', 'A380'].map(type => (
                    <Badge key={type} variant={editingRoute.aircraftTypes.includes(type) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => {
                      if (editingRoute.aircraftTypes.includes(type)) {
                        setEditingRoute({...editingRoute, aircraftTypes: editingRoute.aircraftTypes.filter(t => t !== type)})
                      } else {
                        setEditingRoute({...editingRoute, aircraftTypes: [...editingRoute.aircraftTypes, type]})
                      }
                    }}>
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRouteDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveRoute}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Seasonal Schedule Dialog */}
      <Dialog open={showEditSeasonalDialog} onOpenChange={setShowEditSeasonalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Seasonal Schedule</DialogTitle>
          </DialogHeader>
          {editingSeasonalSchedule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Season</Label>
                  <Select value={editingSeasonalSchedule.season} onValueChange={(v: any) => setEditingSeasonalSchedule({...editingSeasonalSchedule, season: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Season</SelectItem>
                      <SelectItem value="shoulder">Shoulder Season</SelectItem>
                      <SelectItem value="peak">Peak Season</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={editingSeasonalSchedule.startDate} onChange={(e) => setEditingSeasonalSchedule({...editingSeasonalSchedule, startDate: e.target.value})} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={editingSeasonalSchedule.endDate} onChange={(e) => setEditingSeasonalSchedule({...editingSeasonalSchedule, endDate: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Frequency Multiplier</Label>
                <div className="flex items-center flex-wrap gap-4 mt-2">
                  <Slider min={0.5} max={1.5} step={0.1} value={[editingSeasonalSchedule.frequencyMultiplier]} onValueChange={(v) => setEditingSeasonalSchedule({...editingSeasonalSchedule, frequencyMultiplier: v[0]})} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{editingSeasonalSchedule.frequencyMultiplier}x</span>
                </div>
              </div>
              <div>
                <Label>Pricing Multiplier</Label>
                <div className="flex items-center flex-wrap gap-4 mt-2">
                  <Slider min={0.5} max={2.0} step={0.05} value={[editingSeasonalSchedule.pricingMultiplier]} onValueChange={(v) => setEditingSeasonalSchedule({...editingSeasonalSchedule, pricingMultiplier: v[0]})} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{editingSeasonalSchedule.pricingMultiplier}x</span>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={editingSeasonalSchedule.notes} onChange={(e) => setEditingSeasonalSchedule({...editingSeasonalSchedule, notes: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSeasonalDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSeasonalSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fleet Assignment Dialog */}
      <Dialog open={showEditFleetDialog} onOpenChange={setShowEditFleetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fleet Assignment</DialogTitle>
          </DialogHeader>
          {editingFleetAssignment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Registration</Label>
                  <Input value={editingFleetAssignment.registration} onChange={(e) => setEditingFleetAssignment({...editingFleetAssignment, registration: e.target.value})} />
                </div>
                <div>
                  <Label>Aircraft Type</Label>
                  <Select value={editingFleetAssignment.aircraftType} onValueChange={(v) => setEditingFleetAssignment({...editingFleetAssignment, aircraftType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B737-800">B737-800</SelectItem>
                      <SelectItem value="A320-200">A320-200</SelectItem>
                      <SelectItem value="A330-300">A330-300</SelectItem>
                      <SelectItem value="B777-300ER">B777-300ER</SelectItem>
                      <SelectItem value="A350-900">A350-900</SelectItem>
                      <SelectItem value="A380">A380</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Airport</Label>
                  <Input value={editingFleetAssignment.base} onChange={(e) => setEditingFleetAssignment({...editingFleetAssignment, base: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Target Utilization %</Label>
                <div className="flex items-center flex-wrap gap-4 mt-2">
                  <Slider min={60} max={100} value={[editingFleetAssignment.utilizationRate]} onValueChange={(v) => setEditingFleetAssignment({...editingFleetAssignment, utilizationRate: v[0]})} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{editingFleetAssignment.utilizationRate}%</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFleetDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveFleetAssignment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Flight Schedule Dialog */}
      <Dialog open={showEditScheduleDialog} onOpenChange={setShowEditScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Flight Schedule</DialogTitle>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Flight Number</Label>
                  <Input value={editingSchedule.flightNumber} onChange={(e) => setEditingSchedule({...editingSchedule, flightNumber: e.target.value})} />
                </div>
                <div>
                  <Label>Route</Label>
                  <div className="text-sm font-medium mt-2">{editingSchedule.origin} → {editingSchedule.destination}</div>
                </div>
                <div>
                  <Label>Departure Time</Label>
                  <Input type="time" value={editingSchedule.departureTime} onChange={(e) => setEditingSchedule({...editingSchedule, departureTime: e.target.value})} />
                </div>
                <div>
                  <Label>Arrival Time</Label>
                  <Input type="time" value={editingSchedule.arrivalTime} onChange={(e) => setEditingSchedule({...editingSchedule, arrivalTime: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Aircraft Type</Label>
                  <Select value={editingSchedule.aircraftType} onValueChange={(v) => setEditingSchedule({...editingSchedule, aircraftType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B737-800">B737-800</SelectItem>
                      <SelectItem value="A320-200">A320-200</SelectItem>
                      <SelectItem value="A330-300">A330-300</SelectItem>
                      <SelectItem value="B777-300ER">B777-300ER</SelectItem>
                      <SelectItem value="A350-900">A350-900</SelectItem>
                      <SelectItem value="A380">A380</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editingSchedule.status} onValueChange={(v: any) => setEditingSchedule({...editingSchedule, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Operating Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const dayNum = i + 1
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setEditingSchedule(prev => ({
                            ...prev!,
                            daysOfWeek: prev!.daysOfWeek.includes(dayNum)
                              ? prev!.daysOfWeek.filter(d => d !== dayNum)
                              : [...prev!.daysOfWeek, dayNum]
                          }))
                        }}
                        className={`px-3 py-2 text-sm rounded-md border ${
                          editingSchedule.daysOfWeek.includes(dayNum)
                            ? 'bg-primary text-primary-foreground'
                            : 'border-gray-300 hover:bg-secondary'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flight Release Dialog */}
      <Dialog open={showFlightReleaseDialog} onOpenChange={setShowFlightReleaseDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flight Release - {generatedFlightRelease?.flightNumber}</DialogTitle>
          </DialogHeader>
          {generatedFlightRelease && (
            <div className="space-y-6 py-4">
              {/* Flight Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Flight</div>
                  <div className="font-bold text-lg">{generatedFlightRelease.flightNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Route</div>
                  <div className="font-medium">{generatedFlightRelease.origin} → {generatedFlightRelease.destination}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Aircraft</div>
                  <div className="font-medium">{generatedFlightRelease.aircraftType}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className="mt-1" variant={flightReleaseApproved ? 'default' : 'secondary'}>
                    {flightReleaseApproved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </div>
              </div>

              {/* Weather */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center flex-wrap gap-2">
                      <Cloud className="h-4 w-4" />
                      Departure Weather ({generatedFlightRelease.origin})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Conditions:</span><span className="font-medium">{generatedFlightRelease.weather.departure.condition}</span></div>
                    <div className="flex justify-between"><span>Temperature:</span><span className="font-medium">{generatedFlightRelease.weather.departure.temp}°C</span></div>
                    <div className="flex justify-between"><span>Wind:</span><span className="font-medium">{generatedFlightRelease.weather.departure.windSpeed}kt from {generatedFlightRelease.weather.departure.windDirection}°</span></div>
                    <div className="flex justify-between"><span>Visibility:</span><span className="font-medium">{generatedFlightRelease.weather.departure.visibility}km</span></div>
                    <div className="flex justify-between"><span>Pressure:</span><span className="font-medium">{generatedFlightRelease.weather.departure.pressure} hPa</span></div>
                    <div className="flex justify-between"><span>Dew Point:</span><span className="font-medium">{generatedFlightRelease.weather.departure.dewPoint}°C</span></div>
                    <div className="flex justify-between"><span>Cloud Ceiling:</span><span className="font-medium">{generatedFlightRelease.weather.departure.cloudCeiling}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center flex-wrap gap-2">
                      <Cloud className="h-4 w-4" />
                      Destination Weather ({generatedFlightRelease.destination})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Conditions:</span><span className="font-medium">{generatedFlightRelease.weather.destination.condition}</span></div>
                    <div className="flex justify-between"><span>Temperature:</span><span className="font-medium">{generatedFlightRelease.weather.destination.temp}°C</span></div>
                    <div className="flex justify-between"><span>Wind:</span><span className="font-medium">{generatedFlightRelease.weather.destination.windSpeed}kt from {generatedFlightRelease.weather.destination.windDirection}°</span></div>
                    <div className="flex justify-between"><span>Visibility:</span><span className="font-medium">{generatedFlightRelease.weather.destination.visibility}km</span></div>
                    <div className="flex justify-between"><span>Pressure:</span><span className="font-medium">{generatedFlightRelease.weather.destination.pressure} hPa</span></div>
                    <div className="flex justify-between"><span>Dew Point:</span><span className="font-medium">{generatedFlightRelease.weather.destination.dewPoint}°C</span></div>
                    <div className="flex justify-between"><span>Cloud Ceiling:</span><span className="font-medium">{generatedFlightRelease.weather.destination.cloudCeiling}</span></div>
                  </CardContent>
                </Card>
              </div>

              {/* NOTAMs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Active NOTAMs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {generatedFlightRelease.notams.map((notam: any) => (
                        <div key={notam.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{notam.id} - {notam.airport}</span>
                            <Badge variant="outline" className="text-xs">{notam.type}</Badge>
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">{notam.message}</div>
                          <div className="text-xs text-muted-foreground">Valid: {notam.validFrom} to {notam.validTo}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* ATC Restrictions & Alternates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">ATC Restrictions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {generatedFlightRelease.atcRestrictions.map((r: any) => (
                      <div key={r.id} className="p-2 bg-secondary/30 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{r.region} - {r.type}</span>
                          <Badge variant={r.level === 'Active' ? 'destructive' : 'outline'}>{r.level}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
                        <div className="text-xs text-orange-600">Slot Delay: {r.slotDelay}min</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Alternate Airports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {generatedFlightRelease.alternateAirports.map((alt: any) => (
                      <div key={alt.code} className="p-2 bg-secondary/30 rounded text-sm">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{alt.code} ({alt.name})</div>
                            <div className="text-xs text-muted-foreground">{alt.distance}nm • {alt.weather}</div>
                          </div>
                          <Badge variant={alt.type === 'Primary' ? 'default' : 'secondary'}>{alt.type}</Badge>
                        </div>
                        {alt.estimatedDelay > 0 && <div className="text-xs text-orange-600 mt-1">Est. Delay: {alt.estimatedDelay}min</div>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Fuel Plan */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center flex-wrap gap-2">
                    <Fuel className="h-4 w-4" />
                    Fuel Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Trip Fuel</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.tripFuel.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Reserve Fuel</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.reserve.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Alternate Fuel</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.alternate.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Taxi Fuel</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.taxi.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Contingency</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.contingency.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-primary text-primary-foreground rounded">
                      <div className="text-sm opacity-90">Total Fuel</div>
                      <div className="font-bold text-xl">{generatedFlightRelease.fuelPlan.total.toLocaleString()} kg</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Crew */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Crew Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Captain</div>
                      <div className="font-medium">{generatedFlightRelease.crew.captain}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">First Officer</div>
                      <div className="font-medium">{generatedFlightRelease.crew.firstOfficer}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cabin Crew</div>
                      <div className="font-medium">{generatedFlightRelease.crew.cabinCrew} Flight Attendants</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground text-center">
                Generated at {new Date(generatedFlightRelease.generatedAt).toLocaleString()}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlightReleaseDialog(false)}>Close</Button>
            {!flightReleaseApproved && (
              <Button onClick={handleApproveFlightRelease}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Release
              </Button>
            )}
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
