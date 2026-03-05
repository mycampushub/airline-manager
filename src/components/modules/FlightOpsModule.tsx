'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  XCircle
} from 'lucide-react'
import { useAirlineStore, type FlightSchedule, type DisruptionEvent } from '@/lib/store'

export default function FlightOpsModule() {
  const { flightSchedules, flightInstances, disruptions, createFlightSchedule, createDisruption } = useAirlineStore()
  const [activeTab, setActiveTab] = useState('schedule')
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showDisruptionDialog, setShowDisruptionDialog] = useState(false)

  const [newSchedule, setNewSchedule] = useState({
    flightNumber: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    aircraftType: 'B737-800',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7]
  })

  const [newDisruption, setNewDisruption] = useState({
    flightId: '',
    flightNumber: '',
    type: 'delay' as const,
    reason: '',
    code: ''
  })

  const handleCreateSchedule = () => {
    createFlightSchedule({
      ...newSchedule,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2025-12-31',
      duration: 480,
      distance: 5000
    })
    setShowScheduleDialog(false)
  }

  const handleCreateDisruption = () => {
    createDisruption({
      ...newDisruption,
      impact: {
        passengers: 0,
        connections: 0,
        estimatedCost: 0
      },
      actions: [],
      status: 'active',
      date: new Date().toISOString().split('T')[0]
    })
    setShowDisruptionDialog(false)
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
        <TabsContent value="schedule" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Flight Schedules</CardTitle>
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
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Flight Number</Label>
                          <Input value={newSchedule.flightNumber} onChange={(e) => setNewSchedule({...newSchedule, flightNumber: e.target.value})} placeholder="AA123" />
                        </div>
                        <div>
                          <Label>Aircraft Type</Label>
                          <Select value={newSchedule.aircraftType} onValueChange={(v) => setNewSchedule({...newSchedule, aircraftType: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B737-800">B737-800</SelectItem>
                              <SelectItem value="A320">A320</SelectItem>
                              <SelectItem value="B777-300ER">B777-300ER</SelectItem>
                              <SelectItem value="A350-900">A350-900</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Origin</Label>
                          <Input value={newSchedule.origin} onChange={(e) => setNewSchedule({...newSchedule, origin: e.target.value})} placeholder="JFK" />
                        </div>
                        <div>
                          <Label>Destination</Label>
                          <Input value={newSchedule.destination} onChange={(e) => setNewSchedule({...newSchedule, destination: e.target.value})} placeholder="LHR" />
                        </div>
                        <div>
                          <Label>Departure Time</Label>
                          <Input type="time" value={newSchedule.departureTime} onChange={(e) => setNewSchedule({...newSchedule, departureTime: e.target.value})} />
                        </div>
                        <div>
                          <Label>Arrival Time</Label>
                          <Input type="time" value={newSchedule.arrivalTime} onChange={(e) => setNewSchedule({...newSchedule, arrivalTime: e.target.value})} />
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
                Route planning, frequency management, and seasonal scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th>Route</th>
                      <th>Dep</th>
                      <th>Arr</th>
                      <th>Days</th>
                      <th>Aircraft</th>
                      <th>Frequency</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flightSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No flight schedules configured
                        </td>
                      </tr>
                    ) : (
                      flightSchedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td className="font-medium">{schedule.flightNumber}</td>
                          <td>{schedule.origin} → {schedule.destination}</td>
                          <td className="text-sm">{schedule.departureTime}</td>
                          <td className="text-sm">{schedule.arrivalTime}</td>
                          <td className="text-sm">{schedule.daysOfWeek.join(', ')}</td>
                          <td className="text-sm">{schedule.aircraftType}</td>
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
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
