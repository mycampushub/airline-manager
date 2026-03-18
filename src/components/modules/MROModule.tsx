'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { 
  Wrench, 
  Settings, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Plus,
  Calendar,
  Plane,
  TrendingUp,
  BookOpen,
  ClipboardList,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'
import { DEMO_AIRCRAFT } from '@/lib/demoData'

interface MELItem {
  id: string
  itemNumber: string
  description: string
  aircraftRegistration: string
  category: 'A' | 'B' | 'C' | 'D'
  dispatchCondition: string
  repairInterval: string
  operationalProcedure: string
  maintenanceProcedure: string
  status: 'active' | 'deferred' | 'resolved'
  deferredDate: string
  deferredBy: string
  notes: string
}

interface CDLItem {
  id: string
  itemNumber: string
  description: string
  aircraftType: string
  category: 'performance' | 'instrument' | 'equipment'
  impactAssessment: string
  fuelAdjustment: number
  payloadAdjustment: number
  status: 'active' | 'inactive'
  validFrom: string
  validUntil: string
}

interface EngineeringLogEntry {
  id: string
  date: string
  aircraftRegistration: string
  type: 'maintenance' | 'inspection' | 'modification' | 'repair' | 'incident'
  description: string
  technician: string
  hours: number
  partsUsed: string[]
  nextDue: string
  status: 'completed' | 'in_progress' | 'deferred'
}

export default function MROModule() {
  const { maintenanceRecords, parts, components, createMaintenanceRecord, updatePart, trackComponent, pendingAction, setPendingAction } = useAirlineStore()
  
  // Initialize enhanced state with generated data from store
  const [melItems, setMELItems] = useState<MELItem[]>(() => {
    const items: MELItem[] = []
    const categories: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']
    const mdescriptions = ['AC Generator #1', 'Weather Radar', 'Landing Light', 'Cabin Pressurization', 'APU Start', 'Navigation Display', 'Communication Radio', 'Fuel Gauge', 'Hydraulic Pump', 'Brake System', 'Engine EGT Indicator', 'Stall Warning', 'Pitot Tube', 'Static Port', 'Windshield Wiper', 'Emergency Light', 'Oxygen System', 'Seat Belt Sign', 'No Smoking Sign', 'Fasten Seatbelt', 'Overhead Light', 'Reading Light', 'Call Button', 'Attendant Phone', 'Cabin Intercom', 'PA System', 'Galley Power', 'Lavatory Flush', 'Water System', 'Waste Tank']
    
    for (let i = 0; i < 30; i++) {
      const aircraft = DEMO_AIRCRAFT[i].registration
      items.push({
        id: `MEL${i + 1}`,
        itemNumber: `MEL-${String(24 + (i % 6))}-${String(30 + (i % 20)).padStart(2, '0')}-${i + 1}`,
        description: mdescriptions[i % mdescriptions.length],
        aircraftRegistration: aircraft,
        category: categories[i % 4],
        dispatchCondition: categories[i % 4] === 'A' ? 'No operational procedures required' : 'Operational with restrictions',
        repairInterval: categories[i % 4] === 'A' ? 'Not applicable' : categories[i % 4] === 'C' ? '3 calendar days' : categories[i % 4] === 'D' ? '120 calendar days' : '10 calendar days',
        operationalProcedure: categories[i % 4] === 'A' ? 'N/A' : 'Monitor system performance',
        maintenanceProcedure: 'Replace or repair component',
        status: ['active', 'active', 'active', 'deferred', 'resolved'][i % 5] as any,
        deferredDate: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        deferredBy: ['John Smith', 'Sarah Jones', 'Mike Johnson', 'David Wilson', 'Emily Brown'][i % 5],
        notes: i % 3 === 0 ? 'Part on order' : i % 4 === 0 ? 'Awaiting manufacturer' : 'Scheduled for repair'
      })
    }
    return items
  })

  const [cdlItems, setCDLItems] = useState<CDLItem[]>(() => {
    const items: CDLItem[] = []
    const aircraftTypes = ['B737-800', 'B777-300ER', 'B787-9', 'A320neo', 'A350-900', 'A380-800', 'B737-800', 'A330-300']
    const descriptions = ['Wing Leading Edge Panel #4', 'Landing Light Left', 'Cabin Window Panel #12', 'Cargo Door Seal', 'Engine Cowling Panel', 'Stabilizer Tip Fairing', 'Fuselage Panel Section 5', 'Nose Cone Panel', 'Tail Cone Panel', 'Wing Flap Panel #2', 'Aileron Panel', 'Elevator Panel', 'Rudder Panel', 'Slats Panel #3', 'Spoilers Panel', 'Gear Door Panel', 'Wheel Well Panel', 'Pylon Fairing', 'Thrust Reverser Panel', 'Fan Cowl Panel']
    
    for (let i = 0; i < 30; i++) {
      const aircraftType = DEMO_AIRCRAFT[i].type
      items.push({
        id: `CDL${i + 1}`,
        itemNumber: `CDL-${String(27 + (i % 8))}-${String(21 + (i % 10)).padStart(2, '0')}-${i + 1}`,
        description: descriptions[i % descriptions.length],
        aircraftType: aircraftType,
        category: ['performance', 'instrument', 'equipment'][i % 3] as any,
        impactAssessment: i % 3 === 0 ? 'Minor drag increase' : i % 3 === 1 ? 'Instrument indication affected' : 'Operational restriction',
        fuelAdjustment: i % 2 === 0 ? 0.5 : 0,
        payloadAdjustment: i % 4 === 0 ? 100 : 0,
        status: ['active', 'active', 'inactive'][i % 3] as any,
        validFrom: new Date(Date.now() - (i + 1) * 86400000).toISOString().split('T')[0],
        validUntil: new Date(Date.now() + (30 - i) * 86400000).toISOString().split('T')[0]
      })
    }
    return items
  })

  const [engineeringLog, setEngineeringLog] = useState<EngineeringLogEntry[]>(() => {
    const entries: EngineeringLogEntry[] = []
    const technicians = ['Mike Johnson', 'Sarah Jones', 'David Wilson', 'Emily Brown', 'Robert Taylor', 'Lisa Chen', 'James White', 'Maria Garcia', 'Thomas Anderson', 'Jennifer Lee']
    const types: Array<'maintenance' | 'inspection' | 'modification' | 'repair' | 'incident'> = ['maintenance', 'inspection', 'modification', 'repair', 'incident']
    const partLists = [
      ['Oil Filter #1234', 'Engine Oil 15W-40'],
      ['Brake Pads #5678', 'Brake Assembly #9012'],
      ['Strut Assembly #9012', 'Hydraulic Fluid #7890'],
      ['Navigation Unit #3456', 'Antenna Cable #7890'],
      ['Fuel Pump #2345', 'Fuel Line #6789'],
      ['Landing Light #4567', 'Bulb #8901'],
      ['Cabin Light #5678', 'Wiring Harness #1234'],
      ['Seat Belt #6789', 'Buckle #9012'],
      ['Oxygen Mask #7890', 'Oxygen Bottle #2345'],
      ['Fire Extinguisher #8901', 'Mounting Bracket #3456']
    ]
    
    for (let i = 0; i < 30; i++) {
      const aircraft = DEMO_AIRCRAFT[i]
      entries.push({
        id: `EL${i + 1}`,
        date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
        aircraftRegistration: aircraft.registration,
        type: types[i % 5],
        description: [
          'Engine oil change and filter replacement',
          'A-Check inspection completed',
          'Landing gear strut replacement',
          'Navigation system upgrade',
          'Avionics troubleshooting',
          'Cabin interior refurbishment',
          'Hydraulic system overhaul',
          'Fuel system inspection',
          'Electrical system maintenance',
          'Emergency equipment check',
          'APU maintenance',
          'Engine performance test',
          'Radar system calibration',
          'Communication radio replacement',
          'Transponder update',
          'Flight computer upgrade',
          'Autopilot system check',
          'Pressurization system service',
          'Air conditioning maintenance',
          'Lighting system repair'
        ][i % 20],
        technician: technicians[i % technicians.length],
        hours: [2.5, 4.5, 6, 8, 3, 5, 7.5, 4, 6.5, 5.5][i % 10],
        partsUsed: partLists[i % partLists.length],
        nextDue: new Date(Date.now() + (30 + i * 10) * 86400000).toISOString().split('T')[0],
        status: ['completed', 'completed', 'in_progress', 'completed', 'deferred'][i % 5] as any
      })
    }
    return entries
  })
  
  // Handle pending actions from App header
  useEffect(() => {
    if (pendingAction) {
      switch (pendingAction.action) {
        case 'new':
          setShowMaintenanceDialog(true)
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
    const headers = ['ID', 'Aircraft', 'Type', 'Status', 'Date', 'Priority']
    const rows = maintenanceRecords.map(m => [
      m.id, m.aircraftId, m.type, m.status, m.scheduledDate, m.priority
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'mro-export.csv'
    link.click()
  }

  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('maintenance')
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false)
  const [showPartDialog, setShowPartDialog] = useState(false)
  const [showMELDialog, setShowMELDialog] = useState(false)
  const [showLogDialog, setShowLogDialog] = useState(false)
  const [showPartsSearchDialog, setShowPartsSearchDialog] = useState(false)

  // Search state
  const [partsSearchTerm, setPartsSearchTerm] = useState('')
  const [partsSearchResults, setPartsSearchResults] = useState<any[]>([])

  const [newMEL, setNewMEL] = useState({
    itemNumber: '',
    description: '',
    aircraftRegistration: '',
    category: 'B' as const,
    dispatchCondition: '',
    repairInterval: '',
    operationalProcedure: '',
    maintenanceProcedure: '',
    notes: ''
  })

  const [newLog, setNewLog] = useState({
    aircraftRegistration: '',
    type: 'maintenance' as const,
    description: '',
    technician: '',
    hours: 0,
    partsUsed: '',
    nextDue: ''
  })

  const [newMaintenance, setNewMaintenance] = useState({
    aircraftRegistration: '',
    aircraftType: 'B737-800',
    type: 'scheduled' as const,
    category: 'a-check' as const,
    description: '',
    priority: 'medium' as const,
    scheduledStart: '',
    scheduledEnd: '',
    station: 'JFK'
  })

  const handleCreateMaintenance = () => {
    if (!newMaintenance.aircraftRegistration || !newMaintenance.description) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
      return
    }
    
    createMaintenanceRecord({
      aircraftRegistration: newMaintenance.aircraftRegistration,
      aircraftType: newMaintenance.aircraftType,
      type: newMaintenance.type,
      category: newMaintenance.category,
      description: newMaintenance.description,
      priority: newMaintenance.priority,
      scheduledStart: newMaintenance.scheduledStart || new Date().toISOString(),
      scheduledEnd: newMaintenance.scheduledEnd || new Date(Date.now() + 86400000).toISOString(),
      station: newMaintenance.station,
      status: 'pending',
      tasks: [],
      partsUsed: [],
      laborHours: 0,
      cost: 0
    })
    
    setShowMaintenanceDialog(false)
    setNewMaintenance({
      aircraftRegistration: '',
      aircraftType: 'B737-800',
      type: 'scheduled' as const,
      category: 'a-check' as const,
      description: '',
      priority: 'medium' as const,
      scheduledStart: '',
      scheduledEnd: '',
      station: 'JFK'
    })
    toast({ title: 'Work Order Created', description: 'Maintenance work order has been created' })
  }

  const [newPart, setNewPart] = useState({
    partNumber: '',
    name: '',
    description: '',
    category: 'Engine',
    manufacturer: '',
    quantityOnHand: 0,
    minimumStock: 5,
    unitCost: 0
  })

  // Handlers
  const handleViewWorkOrder = (wo: any) => {
    toast({ title: 'Work Order Details', description: `${wo.workOrderNumber} - ${wo.aircraftRegistration}` })
  }

  const handleRefreshParts = () => {
    toast({ title: 'Parts Inventory Refreshed', description: 'Latest inventory data loaded' })
  }

  const handleSearchParts = () => {
    if (!partsSearchTerm.trim()) {
      toast({ title: 'Search', description: 'Please enter a search term' })
      return
    }
    const results = parts.filter(p => 
      p.partNumber.toLowerCase().includes(partsSearchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(partsSearchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(partsSearchTerm.toLowerCase())
    )
    setPartsSearchResults(results)
    setShowPartsSearchDialog(true)
    toast({ title: 'Search Results', description: `Found ${results.length} matching parts` })
  }

  const handleExportMEL = () => {
    toast({ title: 'Export Complete', description: 'MEL items exported successfully' })
  }

  const handleImportMEL = () => {
    toast({ title: 'Import', description: 'Opening MEL import dialog...' })
  }

  const handleViewLogEntry = (log: any) => {
    toast({ title: 'Log Entry Details', description: `${log.entryNumber} - ${log.aircraftRegistration}` })
  }

  const handleExportCDL = () => {
    toast({ title: 'Export Complete', description: 'CDL data exported successfully' })
  }

  const handleImportCDL = () => {
    toast({ title: 'Import', description: 'Opening CDL import dialog...' })
  }

  const handleExportParts = () => {
    toast({ title: 'Export Complete', description: 'Parts inventory exported successfully' })
  }

  const handleImportParts = () => {
    toast({ title: 'Import', description: 'Opening parts import dialog...' })
  }

  const handleAddPart = () => {
    updatePart(newPart.partNumber || 'NEW', newPart)
    setShowPartDialog(false)
  }

  const handleCreateMEL = () => {
    const mel: MELItem = {
      id: `MEL${melItems.length + 1}`,
      ...newMEL,
      status: 'active',
      deferredDate: new Date().toISOString().split('T')[0],
      deferredBy: 'Current User',
      notes: newMEL.notes
    }
    setMELItems([...melItems, mel])
    setShowMELDialog(false)
    setNewMEL({ itemNumber: '', description: '', aircraftRegistration: '', category: 'B', dispatchCondition: '', repairInterval: '', operationalProcedure: '', maintenanceProcedure: '', notes: '' })
  }

  const handleResolveMEL = (melId: string) => {
    setMELItems(melItems.map(m => m.id === melId ? { ...m, status: 'resolved' as const } : m))
  }

  const handleAddLogEntry = () => {
    const log: EngineeringLogEntry = {
      id: `EL${engineeringLog.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      ...newLog,
      partsUsed: newLog.partsUsed.split(',').map(p => p.trim()).filter(p => p),
      status: 'completed'
    }
    setEngineeringLog([log, ...engineeringLog])
    setShowLogDialog(false)
    setNewLog({ aircraftRegistration: '', type: 'maintenance', description: '', technician: '', hours: 0, partsUsed: '', nextDue: '' })
  }

  const handleResolveLog = (logId: string) => {
    setEngineeringLog(engineeringLog.map(l => l.id === logId ? { ...l, status: 'completed' as const } : l))
  }

  // Calculations
  const activeWorkOrders = maintenanceRecords.filter(m => m.status === 'in_progress').length
  const pendingTasks = maintenanceRecords.filter(m => m.status === 'pending').length
  const activeMEL = melItems.filter(m => m.status === 'active').length
  const lowStockParts = parts.filter(p => p.quantityOnHand <= p.minimumStock).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Maintenance & Engineering (MRO)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aircraft Maintenance, Engineering Logbook, Parts Inventory, MEL/CDL
          </p>
        </div>
      </div>

      {/* MRO Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkOrders}</div>
            <div className="text-xs text-muted-foreground mt-1">in progress</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
            <div className="text-xs text-muted-foreground mt-1">awaiting action</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Parts Inventory</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{parts.length}</div>
            <div className="text-xs text-muted-foreground mt-1">unique parts</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active MEL Items</CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeMEL}</div>
            <div className="text-xs text-muted-foreground mt-1">deferred items</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockParts}</div>
            <div className="text-xs text-muted-foreground mt-1">need reorder</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="engineering">Engineering Logbook</TabsTrigger>
          <TabsTrigger value="mel">MEL</TabsTrigger>
          <TabsTrigger value="cdl">CDL</TabsTrigger>
          <TabsTrigger value="parts">Parts Inventory</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Maintenance Records</CardTitle>
                <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Work Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Maintenance Work Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Aircraft Registration</Label>
                          <Input value={newMaintenance.aircraftRegistration} onChange={(e) => setNewMaintenance({...newMaintenance, aircraftRegistration: e.target.value})} placeholder="N12345" />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select value={newMaintenance.type} onValueChange={(v: any) => setNewMaintenance({...newMaintenance, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="unscheduled">Unscheduled</SelectItem>
                              <SelectItem value="inspection">Inspection</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select value={newMaintenance.category} onValueChange={(v: any) => setNewMaintenance({...newMaintenance, category: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="a-check">A-Check</SelectItem>
                              <SelectItem value="b-check">B-Check</SelectItem>
                              <SelectItem value="c-check">C-Check</SelectItem>
                              <SelectItem value="d-check">D-Check</SelectItem>
                              <SelectItem value="line_maintenance">Line Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <Select value={newMaintenance.priority} onValueChange={(v: any) => setNewMaintenance({...newMaintenance, priority: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Scheduled Start</Label>
                          <Input type="datetime-local" value={newMaintenance.scheduledStart} onChange={(e) => setNewMaintenance({...newMaintenance, scheduledStart: e.target.value})} />
                        </div>
                        <div>
                          <Label>Scheduled End</Label>
                          <Input type="datetime-local" value={newMaintenance.scheduledEnd} onChange={(e) => setNewMaintenance({...newMaintenance, scheduledEnd: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input value={newMaintenance.description} onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})} placeholder="Describe the maintenance task" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowMaintenanceDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateMaintenance}>Create Work Order</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Aircraft maintenance planning and execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-80">
                <table className="enterprise-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>WO #</th>
                      <th>Aircraft</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Scheduled</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No maintenance records
                        </td>
                      </tr>
                    ) : (
                      maintenanceRecords.map((record) => (
                        <tr key={record.id}>
                          <td className="font-mono font-medium">{record.workOrderNumber}</td>
                          <td className="text-sm">{record.aircraftRegistration}</td>
                          <td className="capitalize text-sm">{record.type}</td>
                          <td className="text-sm uppercase">{record.category.replace('_', '-')}</td>
                          <td className="text-sm max-w-xs truncate">{record.description}</td>
                          <td>
                            <Badge variant={record.priority === 'critical' ? 'destructive' : record.priority === 'high' ? 'secondary' : 'outline'} className="capitalize">
                              {record.priority}
                            </Badge>
                          </td>
                          <td className="text-sm">{new Date(record.scheduledStart).toLocaleDateString()}</td>
                          <td>
                            <Badge variant={record.status === 'completed' ? 'default' : record.status === 'in_progress' ? 'secondary' : 'outline'} className="capitalize">
                              {record.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => handleViewWorkOrder(record.id)}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engineering Logbook Tab */}
        <TabsContent value="engineering" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Engineering Logbook</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast({ title: 'Search', description: 'Search functionality opened' })}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: 'Filter', description: 'Filter options opened' })}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>

                  {/* Parts Search Dialog */}
                  <Dialog open={showPartsSearchDialog} onOpenChange={setShowPartsSearchDialog}>
                    <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Parts Search Results</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Search parts by number, description, or category..." 
                            value={partsSearchTerm}
                            onChange={(e) => setPartsSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchParts()}
                          />
                          <Button onClick={handleSearchParts}>Search</Button>
                        </div>
                        <div className="overflow-y-auto h-64">
                          {partsSearchResults.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                              {partsSearchTerm ? 'No parts found matching your search' : 'Enter a search term to find parts'}
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="enterprise-table min-w-[800px]">
                              <thead>
                                <tr>
                                  <th>Part Number</th>
                                  <th>Description</th>
                                  <th>Category</th>
                                  <th>Stock</th>
                                  <th>Unit Cost</th>
                                </tr>
                              </thead>
                              <tbody>
                                {partsSearchResults.map((part) => (
                                  <tr key={part.id || part.partNumber}>
                                    <td className="font-mono">{part.partNumber}</td>
                                    <td>{part.description}</td>
                                    <td className="capitalize">{part.category}</td>
                                    <td>
                                      <Badge variant={part.quantityOnHand <= part.minimumStock ? 'destructive' : 'default'}>
                                        {part.quantityOnHand}
                                      </Badge>
                                    </td>
                                    <td>${part.unitCost}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Engineering Log Entry</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Aircraft Registration</Label>
                            <Input value={newLog.aircraftRegistration} onChange={(e) => setNewLog({...newLog, aircraftRegistration: e.target.value})} placeholder="N12345" />
                          </div>
                          <div>
                            <Label>Entry Type</Label>
                            <Select value={newLog.type} onValueChange={(v: any) => setNewLog({...newLog, type: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="inspection">Inspection</SelectItem>
                                <SelectItem value="modification">Modification</SelectItem>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="incident">Incident</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Technician</Label>
                            <Input value={newLog.technician} onChange={(e) => setNewLog({...newLog, technician: e.target.value})} placeholder="John Smith" />
                          </div>
                          <div>
                            <Label>Hours Worked</Label>
                            <Input type="number" value={newLog.hours || ''} onChange={(e) => setNewLog({...newLog, hours: Number(e.target.value)})} placeholder="4.5" />
                          </div>
                          <div className="col-span-2">
                            <Label>Next Due Date</Label>
                            <Input type="date" value={newLog.nextDue} onChange={(e) => setNewLog({...newLog, nextDue: e.target.value})} />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={newLog.description} onChange={(e) => setNewLog({...newLog, description: e.target.value})} placeholder="Describe the work performed" rows={3} />
                        </div>
                        <div>
                          <Label>Parts Used (comma-separated)</Label>
                          <Input value={newLog.partsUsed} onChange={(e) => setNewLog({...newLog, partsUsed: e.target.value})} placeholder="Oil Filter #1234, Engine Oil 15W-40" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddLogEntry}>Add Entry</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <CardDescription>
                Complete engineering maintenance history and documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1200px]">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Aircraft</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Technician</th>
                      <th>Hours</th>
                      <th>Parts Used</th>
                      <th>Next Due</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {engineeringLog.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-muted-foreground py-8">
                          No engineering log entries
                        </td>
                      </tr>
                    ) : (
                      engineeringLog.map((log) => (
                        <tr key={log.id}>
                          <td className="text-sm">{log.date}</td>
                          <td className="font-mono text-sm">{log.aircraftRegistration}</td>
                          <td>
                            <Badge variant="outline" className="capitalize">{log.type}</Badge>
                          </td>
                          <td className="text-sm max-w-xs truncate">{log.description}</td>
                          <td className="text-sm">{log.technician}</td>
                          <td className="text-sm">{log.hours}h</td>
                          <td className="text-sm max-w-xs truncate">
                            {log.partsUsed.slice(0, 2).join(', ')}
                            {log.partsUsed.length > 2 && ` +${log.partsUsed.length - 2} more`}
                          </td>
                          <td className="text-sm">{log.nextDue}</td>
                          <td>
                            <Badge variant={log.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                              {log.status}
                            </Badge>
                          </td>
                          <td>
                            {log.status === 'in_progress' && (
                              <Button variant="ghost" size="sm" onClick={() => handleResolveLog(log.id)}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEL Tab */}
        <TabsContent value="mel" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Minimum Equipment List (MEL)</CardTitle>
                <Dialog open={showMELDialog} onOpenChange={setShowMELDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add MEL Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Defer MEL Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>MEL Item Number</Label>
                          <Input value={newMEL.itemNumber} onChange={(e) => setNewMEL({...newMEL, itemNumber: e.target.value})} placeholder="MEL-24-30-1" />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select value={newMEL.category} onValueChange={(v: any) => setNewMEL({...newMEL, category: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">Category A (No operational procedures)</SelectItem>
                              <SelectItem value="B">Category B (With procedures)</SelectItem>
                              <SelectItem value="C">Category C (Limited time)</SelectItem>
                              <SelectItem value="D">Category D (Long-term)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Aircraft Registration</Label>
                          <Input value={newMEL.aircraftRegistration} onChange={(e) => setNewMEL({...newMEL, aircraftRegistration: e.target.value})} placeholder="N12345" />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input value={newMEL.description} onChange={(e) => setNewMEL({...newMEL, description: e.target.value})} placeholder="Component description" />
                      </div>
                      <div>
                        <Label>Dispatch Condition</Label>
                        <Textarea value={newMEL.dispatchCondition} onChange={(e) => setNewMEL({...newMEL, dispatchCondition: e.target.value})} placeholder="Conditions for dispatch with item inoperative" rows={2} />
                      </div>
                      <div>
                        <Label>Repair Interval</Label>
                        <Input value={newMEL.repairInterval} onChange={(e) => setNewMEL({...newMEL, repairInterval: e.target.value})} placeholder="10 calendar days" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Operational Procedure</Label>
                          <Textarea value={newMEL.operationalProcedure} onChange={(e) => setNewMEL({...newMEL, operationalProcedure: e.target.value})} placeholder="Crew procedures" rows={2} />
                        </div>
                        <div>
                          <Label>Maintenance Procedure</Label>
                          <Textarea value={newMEL.maintenanceProcedure} onChange={(e) => setNewMEL({...newMEL, maintenanceProcedure: e.target.value})} placeholder="Maintenance actions" rows={2} />
                        </div>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea value={newMEL.notes} onChange={(e) => setNewMEL({...newMEL, notes: e.target.value})} placeholder="Additional notes or remarks" rows={2} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowMELDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateMEL}>Defer Item</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Manage deferred equipment items and dispatch conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>MEL #</th>
                      <th>Item</th>
                      <th>Aircraft</th>
                      <th>Category</th>
                      <th>Repair Interval</th>
                      <th>Dispatch Condition</th>
                      <th>Deferred Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {melItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No MEL items deferred
                        </td>
                      </tr>
                    ) : (
                      melItems.map((mel) => (
                        <tr key={mel.id}>
                          <td className="font-mono font-medium text-sm">{mel.itemNumber}</td>
                          <td className="text-sm">{mel.description}</td>
                          <td className="text-sm">{mel.aircraftRegistration}</td>
                          <td>
                            <Badge variant={mel.category === 'A' ? 'default' : mel.category === 'B' ? 'secondary' : 'outline'}>
                              Category {mel.category}
                            </Badge>
                          </td>
                          <td className="text-sm">{mel.repairInterval}</td>
                          <td className="text-sm max-w-xs truncate">{mel.dispatchCondition}</td>
                          <td className="text-sm">{mel.deferredDate}</td>
                          <td>
                            <Badge variant={mel.status === 'active' ? 'destructive' : 'default'} className="capitalize">
                              {mel.status}
                            </Badge>
                          </td>
                          <td>
                            {mel.status === 'active' && (
                              <Button variant="ghost" size="sm" onClick={() => handleResolveMEL(mel.id)} title="Resolve MEL">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CDL Tab */}
        <TabsContent value="cdl" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuration Deviation List (CDL)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCDL}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImportCDL}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
              <CardDescription>
                Manage configuration deviations and performance adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>CDL #</th>
                      <th>Item</th>
                      <th>Aircraft Type</th>
                      <th>Category</th>
                      <th>Impact Assessment</th>
                      <th>Fuel Adj.</th>
                      <th>Payload Adj.</th>
                      <th>Valid Period</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cdlItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No CDL items
                        </td>
                      </tr>
                    ) : (
                      cdlItems.map((cdl) => (
                        <tr key={cdl.id}>
                          <td className="font-mono font-medium text-sm">{cdl.itemNumber}</td>
                          <td className="text-sm">{cdl.description}</td>
                          <td className="text-sm">{cdl.aircraftType}</td>
                          <td>
                            <Badge variant="outline" className="capitalize">{cdl.category}</Badge>
                          </td>
                          <td className="text-sm max-w-xs truncate">{cdl.impactAssessment}</td>
                          <td className="text-sm">{cdl.fuelAdjustment}%</td>
                          <td className="text-sm">{cdl.payloadAdjustment}kg</td>
                          <td className="text-sm">{cdl.validFrom} → {cdl.validUntil}</td>
                          <td>
                            <Badge variant={cdl.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {cdl.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parts Inventory Tab */}
        <TabsContent value="parts" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Parts Inventory</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSearchParts}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: 'Filter', description: 'Filter options opened' })}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Dialog open={showPartDialog} onOpenChange={setShowPartDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Part
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Part to Inventory</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Part Number</Label>
                            <Input value={newPart.partNumber} onChange={(e) => setNewPart({...newPart, partNumber: e.target.value})} />
                          </div>
                          <div>
                            <Label>Name</Label>
                            <Input value={newPart.name} onChange={(e) => setNewPart({...newPart, name: e.target.value})} />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Select value={newPart.category} onValueChange={(v) => setNewPart({...newPart, category: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Engine">Engine</SelectItem>
                                <SelectItem value="Landing Gear">Landing Gear</SelectItem>
                                <SelectItem value="Avionics">Avionics</SelectItem>
                                <SelectItem value="Hydraulics">Hydraulics</SelectItem>
                                <SelectItem value="Electrical">Electrical</SelectItem>
                                <SelectItem value="Cabin">Cabin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Manufacturer</Label>
                            <Input value={newPart.manufacturer} onChange={(e) => setNewPart({...newPart, manufacturer: e.target.value})} />
                          </div>
                          <div>
                            <Label>Quantity On Hand</Label>
                            <Input type="number" value={newPart.quantityOnHand} onChange={(e) => setNewPart({...newPart, quantityOnHand: Number(e.target.value)})} />
                          </div>
                          <div>
                            <Label>Minimum Stock</Label>
                            <Input type="number" value={newPart.minimumStock} onChange={(e) => setNewPart({...newPart, minimumStock: Number(e.target.value)})} />
                          </div>
                          <div className="col-span-2">
                            <Label>Unit Cost ($)</Label>
                            <Input type="number" value={newPart.unitCost} onChange={(e) => setNewPart({...newPart, unitCost: Number(e.target.value)})} />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea value={newPart.description} onChange={(e) => setNewPart({...newPart, description: e.target.value})} placeholder="Part description" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPartDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddPart}>Add Part</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <CardDescription>
                Spare parts inventory and stock management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>Part Number</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Manufacturer</th>
                      <th>On Hand</th>
                      <th>Min Stock</th>
                      <th>Unit Cost</th>
                      <th>Total Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No parts in inventory
                        </td>
                      </tr>
                    ) : (
                      parts.map((part) => (
                        <tr key={part.partNumber}>
                          <td className="font-mono font-medium">{part.partNumber}</td>
                          <td className="text-sm">{part.name}</td>
                          <td className="text-sm">{part.category}</td>
                          <td className="text-sm">{part.manufacturer}</td>
                          <td className="text-sm">{part.quantityOnHand}</td>
                          <td className="text-sm">{part.minimumStock}</td>
                          <td className="text-sm">${part.unitCost.toLocaleString()}</td>
                          <td className="text-sm font-medium">${(part.quantityOnHand * part.unitCost).toLocaleString()}</td>
                          <td>
                            {part.quantityOnHand <= part.minimumStock ? (
                              <Badge variant="destructive">Low Stock</Badge>
                            ) : (
                              <Badge variant="default">In Stock</Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Aircraft Components</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast({ title: 'Filter', description: 'Filter options opened' })}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: 'Export', description: 'Components exported successfully' })}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <CardDescription>
                Installed aircraft components tracking and maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1200px]">
                  <thead>
                    <tr>
                      <th>Serial Number</th>
                      <th>Part Number</th>
                      <th>Aircraft</th>
                      <th>Position</th>
                      <th>Cycles</th>
                      <th>Hours</th>
                      <th>Condition</th>
                      <th>Last Inspection</th>
                      <th>Next Inspection</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-muted-foreground py-8">
                          No components found
                        </td>
                      </tr>
                    ) : (
                      components.map((comp) => (
                        <tr key={comp.id}>
                          <td className="font-mono text-sm">{comp.serialNumber}</td>
                          <td className="text-sm">{comp.partNumber}</td>
                          <td className="text-sm">{comp.aircraftRegistration}</td>
                          <td className="text-sm">{comp.position}</td>
                          <td className="text-sm">{comp.cycleCount.toLocaleString()}</td>
                          <td className="text-sm">{comp.hoursSinceNew.toLocaleString()}h</td>
                          <td>
                            <Badge variant={comp.condition === 'serviceable' ? 'default' : comp.condition === 'unserviceable' ? 'destructive' : 'secondary'} className="capitalize">
                              {comp.condition}
                            </Badge>
                          </td>
                          <td className="text-sm">{comp.lastInspection}</td>
                          <td className="text-sm">{comp.nextInspection}</td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Component Details', description: `${comp.serialNumber} - ${comp.partNumber}` })}>
                              <FileText className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
