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
  Gauge
} from 'lucide-react'
import { useAirlineStore, type FlightSchedule, type DisruptionEvent } from '@/lib/store'

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
  const { flightSchedules, flightInstances, disruptions, createFlightSchedule, createDisruption } = useAirlineStore()
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
    { id: 'FA4', registration: 'N97531', registration: 'N97531', aircraftType: 'B777-300ER', base: 'LAX', utilizationRate: 94.8, routes: ['LAX-TYO', 'SFO-HKG', 'JFK-LHR'], maintenanceSchedule: [] },
    { id: 'FA5', registration: 'N86420', registration: 'N86420', aircraftType: 'A350-900', base: 'JFK', utilizationRate: 96.5, routes: ['JFK-LHR', 'DXB-LHR', 'JFK-PAR'], maintenanceSchedule: [] }
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

  const [selectedSchedule, setSelectedSchedule] = useState<FlightSchedule | null>(null)

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

  const generateTimeSlots = (flightTime: number) => => {
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
                <CardTitle className="flex items-center gap-2">
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
                      <div className="grid grid-cols-2 gap-4">
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
                            <div key={type} className="flex items-center space-x-2">
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
                      <div className="grid grid-cols-3 gap-4">
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
              <ScrollArea className="h-80">
                <table className="enterprise-table">
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
                          <Button variant="ghost" size="sm">
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
                <CardTitle className="flex items-center gap-2">
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
                      <div className="grid grid-cols-2 gap-4">
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
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const dayNum = i + 1
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
                          ))}
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
              <ScrollArea className="h-80">
                <table className="enterprise-table">
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
                          <Button variant="ghost" size="sm">
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
                  <CardTitle className="flex items-center gap-2">
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
                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="flex items-center gap-4">
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
                          <div className="flex items-center gap-4">
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
                <ScrollArea className="h-80">
                  <table className="enterprise-table">
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
                          <td className="text-sm font-medium text-blue-600">{schedule.frequencyMultiplier}x</td>
                          <td className="text-sm font-medium text-green-600">{schedule.pricingMultiplier}x</td>
                          <td className="text-sm text-muted-foreground max-w-xs truncate">{schedule.notes}</td>
                          <td>
                            <Button variant="ghost" size="sm">
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
                  <CardTitle className="flex items-center gap-2">
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
                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="flex items-center gap-4">
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
                              <div key={route.id} className="flex items-center space-x-2">
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
                <ScrollArea className="h-80">
                  <table className="enterprise-table">
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
                            <div className="flex items-center gap-2">
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
                            <Button variant="ghost" size="sm">
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Flight Number</Label>
                          <Input value={newDisruption.flightNumber} onChange={(e) => setNewDisruption({...newDisruption, flightNumber: e.target.value})} />
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
                          <Input value={newDisruption.code} onChange={(e) => setNewDisruption({...newDisruption, code: e.target.value})} placeholder="WX" />
                        </div>
                      </div>
                      <div>
                        <Label>Reason</Label>
                        <Input value={newDisruption.reason} onChange={(e) => setNewDisruption({...newDisruption, reason: e.target.value})} placeholder="Severe weather conditions" />
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
              <ScrollArea className="h-96">
                <table className="enterprise-table">
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
                            <div className="flex items-center gap-1">
                              {disruption.status === 'active' && (
                                <Button variant="ghost" size="sm">Resolve</Button>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Flight Release</CardTitle>
                <CardDescription>
                  Weather integration, NOTAMs, and flight documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Departure Weather</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Clear skies, 15°C, wind 10kt from 270°
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Cloud className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Destination Weather</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Overcast, 12°C, wind 15kt from 310°
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Active NOTAMs</h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-sm text-sm">
                      <div className="font-medium">NOTAM A1234/24</div>
                      <div className="text-muted-foreground">RWY 09L/27R closed for maintenance until 15DEC</div>
                    </div>
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-sm text-sm">
                      <div className="font-medium">NOTAM B5678/24</div>
                      <div className="text-muted-foreground">Taxiway B partial closure due to construction</div>
                    </div>
                  </div>
                </div>

                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Flight Release
                </Button>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>ATC Integration</CardTitle>
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
                    <div className="p-2 bg-secondary/30 rounded-sm text-sm flex items-center justify-between">
                      <span>Flow control - EUR Region</span>
                      <Badge variant="outline">Moderate</Badge>
                    </div>
                    <div className="p-2 bg-secondary/30 rounded-sm text-sm flex items-center justify-between">
                      <span>Route restrictions - NAT Tracks</span>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Alternate Airports</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>MAN (Manchester) - Primary</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>BHX (Birmingham) - Secondary</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Fuel Planning</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Fuel Requirements</span>
                      </div>
                      <Gauge className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trip Fuel:</span>
                        <div className="font-medium">18,450 kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reserve:</span>
                        <div className="font-medium">3,500 kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Alternate:</span>
                        <div className="font-medium">2,800 kg</div>
                      </div>
                      <div>
                        <span className="text>Total:</span>
                        <div className="font-bold text-blue-600">24,750 kg</div>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
