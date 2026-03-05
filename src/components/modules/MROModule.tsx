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
  TrendingUp
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function MROModule() {
  const { maintenanceRecords, parts, components, createMaintenanceRecord, updatePart, trackComponent } = useAirlineStore()
  const [activeTab, setActiveTab] = useState('maintenance')
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false)
  const [showPartDialog, setShowPartDialog] = useState(false)

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

  const handleCreateMaintenance = () => {
    createMaintenanceRecord({
      ...newMaintenance,
      tasks: [{ id: '1', description: newMaintenance.description, status: 'pending' }]
    })
    setShowMaintenanceDialog(false)
  }

  const handleAddPart = () => {
    updatePart(newPart.partNumber || 'NEW', newPart)
    setShowPartDialog(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Maintenance & Engineering (MRO)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aircraft Maintenance, Engineering, and Parts Inventory
          </p>
        </div>
      </div>

      {/* MRO Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceRecords.filter(m => m.status === 'in_progress').length}</div>
            <div className="text-xs text-muted-foreground mt-1">in progress</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{maintenanceRecords.filter(m => m.status === 'pending').length}</div>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Components Tracked</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{components.length}</div>
            <div className="text-xs text-muted-foreground mt-1">lifecycle tracking</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="engineering">Engineering</TabsTrigger>
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
                            <Button variant="ghost" size="sm">
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

        {/* Engineering Tab */}
        <TabsContent value="engineering" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Airworthiness Directives (AD)</CardTitle>
                <CardDescription>
                  Track and manage regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">AD 2024-12-15</div>
                        <div className="text-xs text-muted-foreground mt-1">Engine inspection - All B737-800</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Next due: 2025-01-15</div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">AD 2024-11-20</div>
                        <div className="text-xs text-muted-foreground mt-1">Landing gear component check</div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-xs text-yellow-700 mt-2">Due: 2024-12-20 (14 days)</div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">AD 2024-10-05</div>
                        <div className="text-xs text-muted-foreground mt-1">Fuel system modification</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Completed: 2024-11-01</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Component Lifecycle</CardTitle>
                <CardDescription>
                  Track component usage, cycles, and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {components.length === 0 ? (
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No components tracked</p>
                    <p className="text-sm text-muted-foreground mt-1">Add components to track their lifecycle</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {components.slice(0, 5).map((comp) => (
                        <div key={comp.id} className="p-3 bg-secondary/30 rounded-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{comp.partNumber}</span>
                            <Badge variant={comp.condition === 'serviceable' ? 'default' : 'destructive'} className="capitalize">
                              {comp.condition}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Cycles:</span>
                              <span className="ml-1 font-medium">{comp.cycleCount}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Hours:</span>
                              <span className="ml-1 font-medium">{comp.hoursSinceNew}h</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Inspection:</span>
                              <span className="ml-1">{comp.lastInspection}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Next Due:</span>
                              <span className="ml-1">{comp.nextInspection}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Predictive Maintenance</CardTitle>
              <CardDescription>
                AI-powered predictive maintenance analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/30 rounded-sm text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">94%</div>
                  <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm text-center">
                  <Plane className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Predicted Issues (30 days)</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$2.4M</div>
                  <div className="text-sm text-muted-foreground">Cost Avoided (YTD)</div>
                </div>
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
                          <Input value={newPart.category} onChange={(e) => setNewPart({...newPart, category: e.target.value})} />
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
                        <Input value={newPart.description} onChange={(e) => setNewPart({...newPart, description: e.target.value})} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPartDialog(false)}>Cancel</Button>
                      <Button onClick={handleAddPart}>Add Part</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Spare parts inventory and stock management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
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
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
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
