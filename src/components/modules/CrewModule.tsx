'use client'

import { useState, useEffect } from 'react'
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
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
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
  GraduationCap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  BarChart3,
  Target,
  Zap,
  Award,
  XCircle
} from 'lucide-react'
import { useAirlineStore, type CrewMember } from '@/lib/store'

interface CrewBid {
  id: string
  crewId: string
  crewName: string
  pairingId?: string
  route: string
  startDate: string
  endDate: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface RosterEntry {
  id: string
  crewId: string
  crewName: string
  position: string
  base: string
  pairingId?: string
  flightNumber?: string
  route?: string
  startDate: string
  endDate: string
  dutyType: 'flight' | 'standby' | 'training' | 'leave'
  status: 'scheduled' | 'in_progress' | 'completed'
}

interface ComplianceAlert {
  id: string
  crewId: string
  crewName: string
  type: 'duty_time' | 'rest_period' | 'license_expiry' | 'medical_expiry' | 'monthly_hours'
  severity: 'critical' | 'warning' | 'info'
  message: string
  value: string
  limit: string
  createdAt: string
}

export default function CrewModule() {
  const { crewMembers, crewSchedules, crewPairings, addCrewMember, assignCrewSchedule, createCrewPairing, pendingAction, setPendingAction } = useAirlineStore()
  
  // Handle pending actions from App header
  useEffect(() => {
    if (pendingAction) {
      switch (pendingAction.action) {
        case 'new':
          setShowCrewDialog(true)
          break
        case 'print':
          window.print()
          break
        case 'export':
          handleExportData()
          break
      }
      setPendingAction(null)
    }
  }, [pendingAction])

  const handleExportData = () => {
    const headers = ['ID', 'Name', 'Position', 'Base', 'Status', 'Flight Hours']
    const rows = crewMembers.map(c => [
      c.employeeId, `${c.firstName} ${c.lastName}`, c.position, c.base, c.status, c.flightHours
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'crew-export.csv'
    link.click()
  }

  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('roster')
  const [showCrewDialog, setShowCrewDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showBidDialog, setShowBidDialog] = useState(false)
  const [showGenerateRosterDialog, setShowGenerateRosterDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)

  // Filter state
  const [rosterFilter, setRosterFilter] = useState({
    position: 'all',
    base: 'all',
    status: 'all',
    searchTerm: ''
  })

  // Enhanced state
  const [crewBids, setCrewBids] = useState<CrewBid[]>([
    { id: 'B1', crewId: 'C1', crewName: 'John Smith', route: 'JFK-LHR', startDate: '2024-12-15', endDate: '2024-12-18', priority: 'high', reason: 'Home for Christmas', status: 'pending', createdAt: '2024-12-01' },
    { id: 'B2', crewId: 'C2', crewName: 'Sarah Jones', route: 'LAX-TYO', startDate: '2024-12-20', endDate: '2024-12-23', priority: 'medium', reason: 'Preferred layover', status: 'approved', createdAt: '2024-12-02' }
  ])

  const [rosterEntries, setRosterEntries] = useState<RosterEntry[]>([
    { id: 'R1', crewId: 'C1', crewName: 'John Smith', position: 'Captain', base: 'JFK', pairingId: 'PR123456', flightNumber: 'AA123', route: 'JFK-LHR', startDate: '2024-12-10', endDate: '2024-12-12', dutyType: 'flight', status: 'in_progress' },
    { id: 'R2', crewId: 'C2', crewName: 'Sarah Jones', position: 'First Officer', base: 'JFK', pairingId: 'PR123456', flightNumber: 'AA123', route: 'JFK-LHR', startDate: '2024-12-10', endDate: '2024-12-12', dutyType: 'flight', status: 'in_progress' },
    { id: 'R3', crewId: 'C3', crewName: 'Mike Johnson', position: 'Purser', base: 'LAX', pairingId: 'PR234567', flightNumber: 'AA456', route: 'LAX-TYO', startDate: '2024-12-10', endDate: '2024-12-14', dutyType: 'flight', status: 'scheduled' },
    { id: 'R4', crewId: 'C4', crewName: 'Emily Brown', position: 'Flight Attendant', base: 'LAX', dutyType: 'standby', startDate: '2024-12-10', endDate: '2024-12-10', status: 'scheduled' }
  ])

  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([
    { id: 'CA1', crewId: 'C5', crewName: 'David Wilson', type: 'license_expiry', severity: 'warning', message: 'License expiring soon', value: '2025-01-15', limit: '2025-03-01', createdAt: '2024-12-10' },
    { id: 'CA2', crewId: 'C1', crewName: 'John Smith', type: 'monthly_hours', severity: 'critical', message: 'Monthly flight hours approaching limit', value: '95h', limit: '100h', createdAt: '2024-12-10' }
  ])

  const [newBid, setNewBid] = useState({
    crewId: '',
    route: '',
    startDate: '',
    endDate: '',
    priority: 'medium' as const,
    reason: ''
  })

  const [rosterConfig, setRosterConfig] = useState({
    period: 'month' as const,
    startDate: '',
    endDate: '',
    autoOptimize: true,
    considerBids: true,
    minRestHours: 10,
    maxDutyHours: 13
  })

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

  // Handlers
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

  const handleCreateBid = () => {
    if (!newBid.crewId || !newBid.route) return
    const crew = crewMembers.find(c => c.id === newBid.crewId)
    const bid: CrewBid = {
      id: `B${crewBids.length + 1}`,
      crewId: newBid.crewId,
      crewName: crew ? `${crew.firstName} ${crew.lastName}` : 'Unknown',
      route: newBid.route,
      startDate: newBid.startDate,
      endDate: newBid.endDate,
      priority: newBid.priority,
      reason: newBid.reason,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setCrewBids([...crewBids, bid])
    setShowBidDialog(false)
    setNewBid({ crewId: '', route: '', startDate: '', endDate: '', priority: 'medium', reason: '' })
  }

  const handleApproveBid = (bidId: string) => {
    setCrewBids(crewBids.map(b => b.id === bidId ? { ...b, status: 'approved' as const } : b))
  }

  const handleRejectBid = (bidId: string) => {
    setCrewBids(crewBids.map(b => b.id === bidId ? { ...b, status: 'rejected' as const } : b))
  }

  const handleGenerateRoster = () => {
    // Simulate roster generation
    const generatedRoster: RosterEntry[] = crewMembers.slice(0, 10).map((crew, i) => ({
      id: `R${i + 1}`,
      crewId: crew.id,
      crewName: `${crew.firstName} ${crew.lastName}`,
      position: crew.position,
      base: crew.base,
      pairingId: `PR${Math.random().toString().substr(2, 6)}`,
      flightNumber: `AA${100 + i}`,
      route: i % 2 === 0 ? 'JFK-LHR' : 'LAX-TYO',
      startDate: rosterConfig.startDate,
      endDate: rosterConfig.endDate,
      dutyType: i % 4 === 0 ? 'standby' : 'flight',
      status: 'scheduled'
    }))
    setRosterEntries(generatedRoster)
    setShowGenerateRosterDialog(false)
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

  const handleResolveAlert = (alertId: string) => {
    setComplianceAlerts(complianceAlerts.filter(a => a.id !== alertId))
  }

  // Additional handlers
  const handleFilterRoster = () => {
    setShowFilterDialog(true)
  }

  const applyRosterFilter = () => {
    setShowFilterDialog(false)
    toast({ title: 'Filter Applied', description: `Position: ${rosterFilter.position}, Base: ${rosterFilter.base}, Status: ${rosterFilter.status}` })
  }

  const clearRosterFilter = () => {
    setRosterFilter({ position: 'all', base: 'all', status: 'all', searchTerm: '' })
    setShowFilterDialog(false)
    toast({ title: 'Filter Cleared', description: 'All filters have been reset' })
  }

  // Get filtered roster entries
  const filteredRosterEntries = rosterEntries.filter(entry => {
    if (rosterFilter.position !== 'all' && entry.position !== rosterFilter.position) return false
    if (rosterFilter.base !== 'all' && entry.base !== rosterFilter.base) return false
    if (rosterFilter.status !== 'all' && entry.status !== rosterFilter.status) return false
    if (rosterFilter.searchTerm && !entry.crewName.toLowerCase().includes(rosterFilter.searchTerm.toLowerCase())) return false
    return true
  })

  const handleRefreshRoster = () => {
    toast({ title: 'Roster Refreshed', description: 'Latest crew data loaded' })
  }

  const handleEditRosterEntry = (entryId: string) => {
    const entry = rosterEntries.find(r => r.id === entryId)
    if (entry) {
      toast({ title: 'Edit Roster', description: `Editing ${entry.crewName}` })
    }
  }

  // Calculations
  const totalCrew = crewMembers.length
  const onDuty = crewMembers.filter(c => c.status === 'active').length
  const inTraining = crewMembers.filter(c => c.status === 'training').length
  const onLeave = crewMembers.filter(c => c.status === 'on_leave').length
  const pendingBids = crewBids.filter(b => b.status === 'pending').length
  const criticalAlerts = complianceAlerts.filter(a => a.severity === 'critical').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Crew Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Roster Generation, Bidding System, and Compliance Monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGenerateRosterDialog(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Generate Roster
          </Button>
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
      </div>

      {/* Crew Summary */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Crew</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCrew}</div>
            <div className="text-xs text-muted-foreground mt-1">active members</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Duty</CardTitle>
            <Plane className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onDuty}</div>
            <div className="text-xs text-muted-foreground mt-1">currently flying</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Training</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inTraining}</div>
            <div className="text-xs text-muted-foreground mt-1">in training</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On Leave</CardTitle>
            <Timer className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{onLeave}</div>
            <div className="text-xs text-muted-foreground mt-1">on leave</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bids</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingBids}</div>
            <div className="text-xs text-muted-foreground mt-1">awaiting review</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
            <div className="text-xs text-muted-foreground mt-1">critical issues</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="bidding">Bidding System</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Dashboard</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="pairing">Pairing</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
        </TabsList>

        {/* Roster Tab */}
        <TabsContent value="roster" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Crew Roster</CardTitle>
                  <CardDescription>
                    View and manage crew roster assignments
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFilterRoster}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRefreshRoster}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Crew</th>
                      <th>Position</th>
                      <th>Base</th>
                      <th>Route</th>
                      <th>Period</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rosterEntries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No roster entries. Generate a roster to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredRosterEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td className="font-medium">{entry.crewName}</td>
                          <td className="capitalize text-sm">{entry.position.replace('_', ' ')}</td>
                          <td className="text-sm">{entry.base}</td>
                          <td className="text-sm">{entry.route || '-'}</td>
                          <td className="text-sm">{entry.startDate} → {entry.endDate}</td>
                          <td>
                            <Badge variant={entry.dutyType === 'flight' ? 'default' : entry.dutyType === 'standby' ? 'secondary' : 'outline'} className="capitalize">
                              {entry.dutyType}
                            </Badge>
                          </td>
                          <td>
                            <Badge variant={entry.status === 'completed' ? 'default' : entry.status === 'in_progress' ? 'secondary' : 'outline'} className="capitalize">
                              {entry.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => handleEditRosterEntry(entry.id)}>
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

        {/* Bidding System Tab */}
        <TabsContent value="bidding" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Crew Bidding System</CardTitle>
                <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Bid
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Crew Bid</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Crew Member</Label>
                        <Select value={newBid.crewId} onValueChange={(v) => setNewBid({...newBid, crewId: v})}>
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
                      <div>
                        <Label>Preferred Route</Label>
                        <Select value={newBid.route} onValueChange={(v) => setNewBid({...newBid, route: v})}>
                          <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="JFK-LHR">JFK - LHR</SelectItem>
                            <SelectItem value="JFK-PAR">JFK - PAR</SelectItem>
                            <SelectItem value="LAX-TYO">LAX - TYO</SelectItem>
                            <SelectItem value="LAX-SYD">LAX - SYD</SelectItem>
                            <SelectItem value="SFO-HKG">SFO - HKG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input type="date" value={newBid.startDate} onChange={(e) => setNewBid({...newBid, startDate: e.target.value})} />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input type="date" value={newBid.endDate} onChange={(e) => setNewBid({...newBid, endDate: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select value={newBid.priority} onValueChange={(v: any) => setNewBid({...newBid, priority: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Reason</Label>
                        <Textarea value={newBid.reason} onChange={(e) => setNewBid({...newBid, reason: e.target.value})} placeholder="Why do you prefer this route?" rows={3} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBidDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateBid}>Submit Bid</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Crew members can bid for preferred routes and schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Crew</th>
                      <th>Route</th>
                      <th>Period</th>
                      <th>Priority</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewBids.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No bids submitted
                        </td>
                      </tr>
                    ) : (
                      crewBids.map((bid) => (
                        <tr key={bid.id}>
                          <td className="font-medium">{bid.crewName}</td>
                          <td className="text-sm">{bid.route}</td>
                          <td className="text-sm">{bid.startDate} → {bid.endDate}</td>
                          <td>
                            <Badge variant={bid.priority === 'high' ? 'destructive' : bid.priority === 'medium' ? 'secondary' : 'outline'}>
                              {bid.priority}
                            </Badge>
                          </td>
                          <td className="text-sm max-w-xs truncate">{bid.reason}</td>
                          <td>
                            <Badge variant={bid.status === 'approved' ? 'default' : bid.status === 'rejected' ? 'destructive' : 'secondary'} className="capitalize">
                              {bid.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="flex gap-1">
                              {bid.status === 'pending' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleApproveBid(bid.id)} title="Approve">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleRejectBid(bid.id)} title="Reject">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
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

        {/* Compliance Dashboard Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>
                  Real-time monitoring of crew compliance with regulations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">Flight Duty Time</div>
                        <div className="text-2xl font-bold text-green-600">7.5h</div>
                      </div>
                      <Shield className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="text-xs text-muted-foreground">Max: 13 hours</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">Rest Period</div>
                        <div className="text-2xl font-bold text-blue-600">12h</div>
                      </div>
                      <Bed className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="text-xs text-muted-foreground">Min: 10 hours</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">Monthly Hours</div>
                        <div className="text-2xl font-bold text-yellow-600">85h</div>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="text-xs text-muted-foreground">Max: 100 hours</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">Compliance Rate</div>
                        <div className="text-2xl font-bold text-purple-600">96%</div>
                      </div>
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-xs text-muted-foreground">Target: 95%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>
                  Compliance alerts requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <div className="space-y-3">
                    {complianceAlerts.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                        <p>No compliance alerts</p>
                      </div>
                    ) : (
                      complianceAlerts.map((alert) => (
                        <div key={alert.id} className={`p-3 border rounded-sm ${
                          alert.severity === 'critical' ? 'bg-red-50 border-red-200' : 
                          alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {alert.severity === 'critical' ? <AlertTriangle className="h-4 w-4 text-red-600" /> : 
                                 alert.severity === 'warning' ? <Zap className="h-4 w-4 text-yellow-600" /> : 
                                 <CheckCircle className="h-4 w-4 text-blue-600" />}
                                <span className="font-medium text-sm">{alert.crewName}</span>
                                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'} className="text-xs">
                                  {alert.severity}
                                </Badge>
                              </div>
                              <div className="text-sm">{alert.message}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {alert.value} / Limit: {alert.limit}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleResolveAlert(alert.id)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
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
        </TabsContent>

        {/* Pairing Tab */}
        <TabsContent value="pairing" className="space-y-4">
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
        <TabsContent value="qualifications" className="space-y-4">
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

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Roster</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Search by Name</Label>
              <Input 
                placeholder="Enter crew name..." 
                value={rosterFilter.searchTerm}
                onChange={(e) => setRosterFilter({...rosterFilter, searchTerm: e.target.value})}
              />
            </div>
            <div>
              <Label>Position</Label>
              <Select value={rosterFilter.position} onValueChange={(v) => setRosterFilter({...rosterFilter, position: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  <SelectItem value="Captain">Captain</SelectItem>
                  <SelectItem value="First Officer">First Officer</SelectItem>
                  <SelectItem value="Purser">Purser</SelectItem>
                  <SelectItem value="Flight Attendant">Flight Attendant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Base</Label>
              <Select value={rosterFilter.base} onValueChange={(v) => setRosterFilter({...rosterFilter, base: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bases</SelectItem>
                  <SelectItem value="JFK">JFK</SelectItem>
                  <SelectItem value="LAX">LAX</SelectItem>
                  <SelectItem value="SFO">SFO</SelectItem>
                  <SelectItem value="ORD">ORD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={rosterFilter.status} onValueChange={(v) => setRosterFilter({...rosterFilter, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={clearRosterFilter}>Clear All</Button>
            <Button onClick={applyRosterFilter}>Apply Filter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Roster Dialog */}
      <Dialog open={showGenerateRosterDialog} onOpenChange={setShowGenerateRosterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Crew Roster</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Period</Label>
                <Select value={rosterConfig.period} onValueChange={(v: any) => setRosterConfig({...rosterConfig, period: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Base</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="All bases" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bases</SelectItem>
                    <SelectItem value="JFK">JFK</SelectItem>
                    <SelectItem value="LAX">LAX</SelectItem>
                    <SelectItem value="LHR">LHR</SelectItem>
                    <SelectItem value="DXB">DXB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={rosterConfig.startDate} onChange={(e) => setRosterConfig({...rosterConfig, startDate: e.target.value})} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={rosterConfig.endDate} onChange={(e) => setRosterConfig({...rosterConfig, endDate: e.target.value})} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Auto-Optimize Pairings</div>
                  <div className="text-xs text-muted-foreground">Automatically optimize crew pairings</div>
                </div>
                <Switch checked={rosterConfig.autoOptimize} onCheckedChange={(v) => setRosterConfig({...rosterConfig, autoOptimize: v})} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Consider Bids</div>
                  <div className="text-xs text-muted-foreground">Include crew bid preferences</div>
                </div>
                <Switch checked={rosterConfig.considerBids} onCheckedChange={(v) => setRosterConfig({...rosterConfig, considerBids: v})} />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Min Rest Hours</Label>
                  <span className="text-sm text-muted-foreground">{rosterConfig.minRestHours}h</span>
                </div>
                <Slider
                  min={8}
                  max={14}
                  step={1}
                  value={[rosterConfig.minRestHours]}
                  onValueChange={(v) => setRosterConfig({...rosterConfig, minRestHours: v[0]})}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Max Duty Hours</Label>
                  <span className="text-sm text-muted-foreground">{rosterConfig.maxDutyHours}h</span>
                </div>
                <Slider
                  min={8}
                  max={16}
                  step={1}
                  value={[rosterConfig.maxDutyHours]}
                  onValueChange={(v) => setRosterConfig({...rosterConfig, maxDutyHours: v[0]})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateRosterDialog(false)}>Cancel</Button>
            <Button onClick={handleGenerateRoster}>Generate Roster</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
