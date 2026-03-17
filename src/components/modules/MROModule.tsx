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
  const { maintenanceRecords, parts, components, createMaintenanceRecord, updatePart, trackComponent } = useAirlineStore()
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

  // Enhanced state
  const [melItems, setMELItems] = useState<MELItem[]>([
    { id: 'MEL1', itemNumber: 'MEL-24-30-1', description: 'AC Generator #1', aircraftRegistration: 'N12345', category: 'B', dispatchCondition: 'Operational with one AC generator', repairInterval: '10 calendar days', operationalProcedure: 'Monitor electrical load', maintenanceProcedure: 'Replace generator', status: 'active', deferredDate: '2024-12-10', deferredBy: 'John Smith', notes: 'Part on order' },
    { id: 'MEL2', itemNumber: 'MEL-25-11-1', description: 'Weather Radar', aircraftRegistration: 'N67890', category: 'C', dispatchCondition: 'Day VFR only', repairInterval: '3 calendar days', operationalProcedure: 'Visual flight rules only', maintenanceProcedure: 'Repair radar antenna', status: 'deferred', deferredDate: '2024-12-08', deferredBy: 'Sarah Jones', notes: 'Awaiting parts from manufacturer' }
  ])

  const [cdlItems, setCDLItems] = useState<CDLItem[]>([
    { id: 'CDL1', itemNumber: 'CDL-27-21-1', description: 'Wing Leading Edge Panel #4', aircraftType: 'B737-800', category: 'performance', impactAssessment: 'Minor drag increase', fuelAdjustment: 0.5, payloadAdjustment: 0, status: 'active', validFrom: '2024-12-01', validUntil: '2024-12-31' },
    { id: 'CDL2', itemNumber: 'CDL-33-21-2', description: 'Landing Light Left', aircraftType: 'A320-200', category: 'equipment', impactAssessment: 'Night operations restricted', fuelAdjustment: 0, payloadAdjustment: 0, status: 'active', validFrom: '2024-12-05', validUntil: '2024-12-25' }
  ])

  const [engineeringLog, setEngineeringLog] = useState<EngineeringLogEntry[]>([
    { id: 'EL1', date: '2024-12-09', aircraftRegistration: 'N12345', type: 'maintenance', description: 'Engine oil change and filter replacement', technician: 'Mike Johnson', hours: 4.5, partsUsed: ['Oil Filter #1234', 'Engine Oil 15W-40'], nextDue: '2025-01-09', status: 'completed' },
    { id: 'EL2', date: '2024-12-08', aircraftRegistration: 'N67890', type: 'inspection', description: 'A-Check inspection completed', technician: 'Sarah Jones', hours: 8, partsUsed: ['Brake Pads #5678'], nextDue: '2025-03-08', status: 'completed' },
    { id: 'EL3', date: '2024-12-10', aircraftRegistration: 'N24680', type: 'repair', description: 'Landing gear strut replacement', technician: 'David Wilson', hours: 6, partsUsed: ['Strut Assembly #9012'], nextDue: '2025-06-10', status: 'in_progress' }
  ])

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
                      <div className="grid grid-cols-2 gap-4">
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
              <ScrollArea className="h-80">
                <table className="enterprise-table">
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
              </ScrollArea>
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
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>

                  {/* Parts Search Dialog */}
                  <Dialog open={showPartsSearchDialog} onOpenChange={setShowPartsSearchDialog}>
                    <DialogContent className="max-w-2xl">
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
                        <ScrollArea className="h-64">
                          {partsSearchResults.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                              {partsSearchTerm ? 'No parts found matching your search' : 'Enter a search term to find parts'}
                            </div>
                          ) : (
                            <table className="enterprise-table">
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
                          )}
                        </ScrollArea>
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
                        <div className="grid grid-cols-2 gap-4">
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
              <ScrollArea className="h-96">
                <table className="enterprise-table">
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
              </ScrollArea>
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
                      <div className="grid grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-2 gap-4">
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
              <ScrollArea className="h-96">
                <table className="enterprise-table">
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
              </ScrollArea>
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
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
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
              <ScrollArea className="h-96">
                <table className="enterprise-table">
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
              </ScrollArea>
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
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm">
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
                        <div className="grid grid-cols-2 gap-4">
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
              <ScrollArea className="h-96">
                <table className="enterprise-table">
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
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
