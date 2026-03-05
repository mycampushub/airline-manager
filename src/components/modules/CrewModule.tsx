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
  Users, 
  Calendar, 
  Clock, 
  Shield, 
  Plane, 
  MapPin, 
  Bed,
  Plus,
  Edit,
  CheckCircle,
  AlertTriangle,
  Timer,
  GraduationCap
} from 'lucide-react'
import { useAirlineStore, type CrewMember } from '@/lib/store'

export default function CrewModule() {
  const { crewMembers, crewSchedules, crewPairings, addCrewMember, assignCrewSchedule, createCrewPairing } = useAirlineStore()
  const [activeTab, setActiveTab] = useState('crew-schedule')
  const [showCrewDialog, setShowCrewDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  const [newCrew, setNewCrew] = useState({
    firstName: '',
    lastName: '',
    position: 'flight_attendant' as const,
    base: 'JFK',
    licenseNumber: '',
    licenseExpiry: '',
    medicalCertificate: '',
    medicalExpiry: ''
  })

  const handleAddCrew = () => {
    addCrewMember({
      ...newCrew,
      dateOfBirth: '1990-01-01',
      nationality: 'US',
      email: `${newCrew.firstName.toLowerCase()}.${newCrew.lastName.toLowerCase()}@airline.com`,
      phone: '+1-555-0123'
    })
    setShowCrewDialog(false)
  }

  const handleAssignSchedule = () => {
    assignCrewSchedule({
      crewId: crewMembers[0]?.id || '',
      type: 'flight',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '06:00',
      endTime: '14:00'
    })
    setShowScheduleDialog(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Crew Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Scheduling, Pairing, Duty Compliance, and Qualifications
          </p>
        </div>
        <Dialog open={showCrewDialog} onOpenChange={setShowCrewDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Crew Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Crew Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={newCrew.firstName} onChange={(e) => setNewCrew({...newCrew, firstName: e.target.value})} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={newCrew.lastName} onChange={(e) => setNewCrew({...newCrew, lastName: e.target.value})} />
                </div>
                <div>
                  <Label>Position</Label>
                  <Select value={newCrew.position} onValueChange={(v: any) => setNewCrew({...newCrew, position: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="captain">Captain</SelectItem>
                      <SelectItem value="first_officer">First Officer</SelectItem>
                      <SelectItem value="purser">Purser</SelectItem>
                      <SelectItem value="flight_attendant">Flight Attendant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base</Label>
                  <Select value={newCrew.base} onValueChange={(v) => setNewCrew({...newCrew, base: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JFK">JFK - New York</SelectItem>
                      <SelectItem value="LAX">LAX - Los Angeles</SelectItem>
                      <SelectItem value="LHR">LHR - London</SelectItem>
                      <SelectItem value="DXB">DXB - Dubai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>License Number</Label>
                  <Input value={newCrew.licenseNumber} onChange={(e) => setNewCrew({...newCrew, licenseNumber: e.target.value})} />
                </div>
                <div>
                  <Label>License Expiry</Label>
                  <Input type="date" value={newCrew.licenseExpiry} onChange={(e) => setNewCrew({...newCrew, licenseExpiry: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCrewDialog(false)}>Cancel</Button>
              <Button onClick={handleAddCrew}>Add Crew</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Crew Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Crew</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crewMembers.length}</div>
            <div className="text-xs text-muted-foreground mt-1">active members</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Duty</CardTitle>
            <Plane className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{crewMembers.filter(c => c.status === 'active').length}</div>
            <div className="text-xs text-muted-foreground mt-1">currently flying</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Training</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{crewMembers.filter(c => c.status === 'training').length}</div>
            <div className="text-xs text-muted-foreground mt-1">in training</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
            <Timer className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{crewMembers.filter(c => c.status === 'on_leave').length}</div>
            <div className="text-xs text-muted-foreground mt-1">on leave</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="crew-schedule">Crew Scheduling</TabsTrigger>
          <TabsTrigger value="crew-pairing">Crew Pairing</TabsTrigger>
          <TabsTrigger value="crew-qual">Qualifications</TabsTrigger>
        </TabsList>

        {/* Crew Scheduling Tab */}
        <TabsContent value="crew-schedule" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Crew Schedule</CardTitle>
                  <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Schedule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Crew Schedule</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Crew Member</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="Select crew" /></SelectTrigger>
                            <SelectContent>
                              {crewMembers.map(crew => (
                                <SelectItem key={crew.id} value={crew.id}>
                                  {crew.firstName} {crew.lastName} - {crew.position}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Time</Label>
                            <Input type="time" />
                          </div>
                          <div>
                            <Label>End Time</Label>
                            <Input type="time" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
                        <Button onClick={handleAssignSchedule}>Assign</Button>
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
                        <th>Crew</th>
                        <th>Position</th>
                        <th>Flight</th>
                        <th>Report</th>
                        <th>Release</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crewSchedules.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center text-muted-foreground py-8">
                            No crew schedules assigned
                          </td>
                        </tr>
                      ) : (
                        crewSchedules.map((schedule) => {
                          const crew = crewMembers.find(c => c.id === schedule.crewId)
                          return (
                            <tr key={schedule.id}>
                              <td className="font-medium">{crew?.firstName} {crew?.lastName}</td>
                              <td className="capitalize text-sm">{crew?.position.replace('_', ' ')}</td>
                              <td className="text-sm">{schedule.flightNumber || '-'}</td>
                              <td className="text-sm">{schedule.reportTime}</td>
                              <td className="text-sm">{schedule.releaseTime}</td>
                              <td>
                                <Badge variant={schedule.status === 'completed' ? 'default' : schedule.status === 'in_progress' ? 'secondary' : 'outline'} className="capitalize">
                                  {schedule.status}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Duty Time Compliance</CardTitle>
                <CardDescription>
                  ICAO/EASA/FAA duty time regulations monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Flight Duty Time</div>
                        <div className="text-xs text-muted-foreground">Max 13 hours</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Rest Period</div>
                        <div className="text-xs text-muted-foreground">Min 10 hours</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Monthly Flight Time</div>
                        <div className="text-xs text-muted-foreground">85/100 hours</div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crew Pairing Tab */}
        <TabsContent value="crew-pairing" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Crew Pairings</CardTitle>
                <Button size="sm" onClick={() => createCrewPairing({ pairingNumber: `PR${Math.random().toString().substr(2, 6)}`, base: 'JFK', startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pairing
                </Button>
              </div>
              <CardDescription>
                Optimized crew pairings with rest compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Pairing</th>
                      <th>Base</th>
                      <th>Period</th>
                      <th>Flights</th>
                      <th>Flight Time</th>
                      <th>Duty Time</th>
                      <th>Overnights</th>
                      <th>Compliant</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewPairings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No crew pairings created
                        </td>
                      </tr>
                    ) : (
                      crewPairings.map((pairing) => (
                        <tr key={pairing.id}>
                          <td className="font-mono font-medium">{pairing.pairingNumber}</td>
                          <td className="text-sm">{pairing.base}</td>
                          <td className="text-sm">{pairing.startDate} → {pairing.endDate}</td>
                          <td className="text-sm">{pairing.flights.length}</td>
                          <td className="text-sm">{pairing.totalFlightTime}h</td>
                          <td className="text-sm">{pairing.totalDutyTime}h</td>
                          <td className="text-sm">{pairing.overnightStops}</td>
                          <td>
                            {pairing.compliant ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                            )}
                          </td>
                          <td className="text-sm">${pairing.cost.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Qualifications Tab */}
        <TabsContent value="crew-qual" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Crew Qualifications & Licenses</CardTitle>
              <CardDescription>
                License tracking, expiry alerts, and qualification management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Crew</th>
                      <th>Position</th>
                      <th>License</th>
                      <th>License Expiry</th>
                      <th>Medical</th>
                      <th>Medical Expiry</th>
                      <th>Qualifications</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewMembers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No crew members
                        </td>
                      </tr>
                    ) : (
                      crewMembers.map((crew) => (
                        <tr key={crew.id}>
                          <td className="font-medium">{crew.firstName} {crew.lastName}</td>
                          <td className="capitalize text-sm">{crew.position.replace('_', ' ')}</td>
                          <td className="font-mono text-sm">{crew.licenseNumber || '-'}</td>
                          <td className="text-sm">{crew.licenseExpiry || '-'}</td>
                          <td className="font-mono text-sm">{crew.medicalCertificate || '-'}</td>
                          <td className="text-sm">{crew.medicalExpiry || '-'}</td>
                          <td className="text-sm">
                            <div className="flex flex-wrap gap-1">
                              {crew.qualifications.slice(0, 3).map((q, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{q}</Badge>
                              ))}
                            </div>
                          </td>
                          <td>
                            <Badge variant={crew.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {crew.status}
                            </Badge>
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
      </Tabs>
    </div>
  )
}
