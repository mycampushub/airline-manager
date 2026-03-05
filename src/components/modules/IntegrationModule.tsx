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
  Plug, 
  Globe, 
  Database, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Plus,
  RefreshCw,
  Activity
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function IntegrationModule() {
  const { integrations, addIntegration } = useAirlineStore()
  const [showIntegrationDialog, setShowIntegrationDialog] = useState(false)

  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'gds' as const,
    provider: 'amadeus' as const,
    endpoint: ''
  })

  const handleAddIntegration = () => {
    addIntegration(newIntegration)
    setShowIntegrationDialog(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integrations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            GDS, NDC API, Payment Gateways, and System Connections
          </p>
        </div>
        <Dialog open={showIntegrationDialog} onOpenChange={setShowIntegrationDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Integration Name</Label>
                <Input value={newIntegration.name} onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={newIntegration.type} onValueChange={(v: any) => setNewIntegration({...newIntegration, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gds">GDS</SelectItem>
                      <SelectItem value="nds">NDC API</SelectItem>
                      <SelectItem value="payment">Payment Gateway</SelectItem>
                      <SelectItem value="airport">Airport System</SelectItem>
                      <SelectItem value="accounting">Accounting ERP</SelectItem>
                      <SelectItem value="crm">CRM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Provider</Label>
                  <Select value={newIntegration.provider} onValueChange={(v: any) => setNewIntegration({...newIntegration, provider: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amadeus">Amadeus</SelectItem>
                      <SelectItem value="sabre">Sabre</SelectItem>
                      <SelectItem value="travelport">Travelport</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="sap">SAP</SelectItem>
                      <SelectItem value="oracle">Oracle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Endpoint URL</Label>
                <Input value={newIntegration.endpoint} onChange={(e) => setNewIntegration({...newIntegration, endpoint: e.target.value})} placeholder="https://api.example.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIntegrationDialog(false)}>Cancel</Button>
              <Button onClick={handleAddIntegration}>Add Integration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Integrations</CardTitle>
            <Plug className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</div>
            <div className="text-xs text-muted-foreground mt-1">of {integrations.length} total</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Requests Today</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.reduce((sum, i) => sum + i.metrics.requestsToday, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">total requests</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <div className="text-xs text-muted-foreground mt-1">across all integrations</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            <RefreshCw className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <div className="text-xs text-muted-foreground mt-1">average latency</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="gds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gds">GDS</TabsTrigger>
          <TabsTrigger value="nds">NDC API</TabsTrigger>
          <TabsTrigger value="payment">Payment Gateways</TabsTrigger>
          <TabsTrigger value="airport">Airport Systems</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="gds">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>GDS Connections</CardTitle>
              <CardDescription>Amadeus, Sabre, and Travelport integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Amadeus', status: 'active', requests: 45230, errors: 12, latency: 180 },
                  { name: 'Sabre', status: 'active', requests: 38920, errors: 8, latency: 210 },
                  { name: 'Travelport', status: 'active', requests: 28450, errors: 5, latency: 195 }
                ].map((gds, i) => (
                  <Card key={i} className="enterprise-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{gds.name}</CardTitle>
                        <Badge variant={gds.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                          {gds.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requests:</span>
                          <span className="font-medium">{gds.requests.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Errors:</span>
                          <span className="font-medium text-red-600">{gds.errors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Latency:</span>
                          <span className="font-medium">{gds.latency}ms</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nds">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>NDC API</CardTitle>
              <CardDescription>IATA New Distribution Capability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">API Status</span>
                    <Badge variant="default">Operational</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    All NDC endpoints responding normally
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Version</span>
                    <Badge variant="secondary">NDC 20.2</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Latest IATA NDC standard implemented
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Payment processing integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Stripe', status: 'active', transactions: 15420, volume: 2450000, success: 99.9 },
                  { name: 'PayPal', status: 'active', transactions: 8920, volume: 1280000, success: 99.7 },
                  { name: 'Adyen', status: 'active', transactions: 12350, volume: 1890000, success: 99.8 }
                ].map((gateway, i) => (
                  <div key={i} className="p-4 bg-secondary/30 rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{gateway.name}</span>
                      <Badge variant={gateway.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                        {gateway.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Transactions</div>
                        <div className="font-medium">{gateway.transactions.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Volume</div>
                        <div className="font-medium">${gateway.volume.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success</div>
                        <div className="font-medium text-green-600">{gateway.success}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="airport">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Airport Systems</CardTitle>
              <CardDescription>AODB, BHS, and other airport integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>System</th>
                    <th>Airport</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Sync</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { system: 'AODB', airport: 'JFK', type: 'Departure Control', status: 'connected', sync: '2 min ago' },
                    { system: 'BHS', airport: 'JFK', type: 'Baggage Handling', status: 'connected', sync: '1 min ago' },
                    { system: 'AODB', airport: 'LHR', type: 'Departure Control', status: 'connected', sync: '3 min ago' },
                    { system: 'BHS', airport: 'LHR', type: 'Baggage Handling', status: 'warning', sync: '15 min ago' }
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="font-medium">{item.system}</td>
                      <td>{item.airport}</td>
                      <td className="text-sm">{item.type}</td>
                      <td>
                        <Badge variant={item.status === 'connected' ? 'default' : 'destructive'} className="capitalize">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="text-sm">{item.sync}</td>
                      <td>
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>Configure webhooks for real-time notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Plug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Webhooks can be configured for each integration</p>
                <Button className="mt-4">Configure Webhooks</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
