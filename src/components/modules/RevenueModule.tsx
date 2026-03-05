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
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Target,
  Plus,
  Calendar,
  Plane,
  Activity,
  Zap
} from 'lucide-react'
import { useAirlineStore, type FareBasis } from '@/lib/store'

export default function RevenueModule() {
  const { fareBasis, revenueData, demandForecasts, addFareBasis, updateRevenueData } = useAirlineStore()
  const [activeTab, setActiveTab] = useState('pricing')
  const [showFareDialog, setShowFareDialog] = useState(false)

  const [newFare, setNewFare] = useState({
    code: '',
    name: '',
    bookingClass: 'Y',
    cabin: 'economy' as const,
    baseFare: 0,
    currency: 'USD',
    advancePurchase: 0,
    changeable: true,
    refundable: true,
    changeFee: 0,
    refundFee: 0
  })

  const handleAddFare = () => {
    addFareBasis(newFare)
    setShowFareDialog(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Revenue Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Dynamic Pricing, Demand Forecasting, and Yield Optimization
          </p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueData.reduce((sum, r) => sum + r.totalRevenue, 0).toLocaleString()}
            </div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +15.3% vs last month
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Yield</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.142</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +2.1% vs last month
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Load Factor</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.2%</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +3.5% vs last month
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">RASK</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.119</div>
            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -0.8% vs last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
          <TabsTrigger value="yield">Yield Management</TabsTrigger>
        </TabsList>

        {/* Dynamic Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fare Basis Management</CardTitle>
                <Dialog open={showFareDialog} onOpenChange={setShowFareDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fare
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Fare Basis</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Fare Code</Label>
                          <Input value={newFare.code} onChange={(e) => setNewFare({...newFare, code: e.target.value})} placeholder="YEUR" />
                        </div>
                        <div>
                          <Label>Fare Name</Label>
                          <Input value={newFare.name} onChange={(e) => setNewFare({...newFare, name: e.target.value})} placeholder="Economy Flexible" />
                        </div>
                        <div>
                          <Label>Booking Class</Label>
                          <Select value={newFare.bookingClass} onValueChange={(v) => setNewFare({...newFare, bookingClass: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Y">Y - Economy</SelectItem>
                              <SelectItem value="B">B - Economy Flex</SelectItem>
                              <SelectItem value="M">M - Economy Premium</SelectItem>
                              <SelectItem value="J">J - Business</SelectItem>
                              <SelectItem value="F">F - First</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Cabin</Label>
                          <Select value={newFare.cabin} onValueChange={(v: any) => setNewFare({...newFare, cabin: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="economy">Economy</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="first">First</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Base Fare ($)</Label>
                          <Input type="number" value={newFare.baseFare} onChange={(e) => setNewFare({...newFare, baseFare: Number(e.target.value)})} />
                        </div>
                        <div>
                          <Label>Advance Purchase (days)</Label>
                          <Input type="number" value={newFare.advancePurchase} onChange={(e) => setNewFare({...newFare, advancePurchase: Number(e.target.value)})} />
                        </div>
                        <div>
                          <Label>Change Fee ($)</Label>
                          <Input type="number" value={newFare.changeFee} onChange={(e) => setNewFare({...newFare, changeFee: Number(e.target.value)})} />
                        </div>
                        <div>
                          <Label>Refund Fee ($)</Label>
                          <Input type="number" value={newFare.refundFee} onChange={(e) => setNewFare({...newFare, refundFee: Number(e.target.value)})} />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={newFare.changeable} onChange={(e) => setNewFare({...newFare, changeable: e.target.checked})} />
                          <Label className="text-sm">Changeable</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={newFare.refundable} onChange={(e) => setNewFare({...newFare, refundable: e.target.checked})} />
                          <Label className="text-sm">Refundable</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowFareDialog(false)}>Cancel</Button>
                      <Button onClick={handleAddFare}>Add Fare</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Manage fare basis, pricing rules, and dynamic pricing engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Class</th>
                      <th>Cabin</th>
                      <th>Base Fare</th>
                      <th>Adv. Purchase</th>
                      <th>Changeable</th>
                      <th>Refundable</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fareBasis.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No fare basis configured
                        </td>
                      </tr>
                    ) : (
                      fareBasis.map((fare) => (
                        <tr key={fare.code}>
                          <td className="font-mono font-medium">{fare.code}</td>
                          <td className="text-sm">{fare.name}</td>
                          <td><Badge variant="outline">{fare.bookingClass}</Badge></td>
                          <td className="capitalize text-sm">{fare.cabin}</td>
                          <td className="text-sm">${fare.baseFare}</td>
                          <td className="text-sm">{fare.advancePurchase} days</td>
                          <td>{fare.changeable ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}</td>
                          <td>{fare.refundable ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}</td>
                          <td>
                            <Badge variant="default">Active</Badge>
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

        {/* Demand Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Demand Forecasting</CardTitle>
                <CardDescription>
                  AI-powered demand prediction by route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['JFK-LHR', 'JFK-PAR', 'LAX-TYO', 'SIN-SYD', 'DXB-LHR'].map((route, i) => (
                    <div key={route} className="p-3 bg-secondary/30 rounded-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{route}</span>
                        <Badge variant={i < 2 ? 'default' : i < 4 ? 'secondary' : 'outline'}>
                          {i < 2 ? 'High Demand' : i < 4 ? 'Moderate' : 'Low Demand'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Predicted:</span>
                          <span className="ml-1 font-medium">{85 - i * 10}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trend:</span>
                          <span className="ml-1 flex items-center gap-1">
                            {i % 2 === 0 ? (
                              <><TrendingUp className="h-3 w-3 text-green-600" /> Up</>
                            ) : (
                              <><TrendingDown className="h-3 w-3 text-red-600" /> Down</>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="ml-1 font-medium">{90 - i * 5}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>AI Pricing Engine</CardTitle>
                <CardDescription>
                  Automated fare optimization based on demand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Price Adjustment Recommendation</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Based on current demand and competitor analysis
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">Route:</span>
                      <span className="ml-2 font-medium">JFK-LHR</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Suggested:</span>
                      <span className="ml-2 font-bold text-green-600">+15%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Competitor Price Match</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Dynamic Pricing</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Price Elasticity Model</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Seasonal Adjustments</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Yield Management Tab */}
        <TabsContent value="yield" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Route Yield</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['JFK-LHR: $0.185', 'JFK-PAR: $0.162', 'LAX-TYO: $0.142', 'SIN-SYD: $0.128', 'DXB-LHR: $0.155'].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{item.split(':')[0]}</span>
                      <span className="font-medium">{item.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">O&D Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>JFK-LHR</span>
                    <Badge variant="default">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>JFK-PAR</span>
                    <Badge variant="default">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>LAX-TYO</span>
                    <Badge variant="secondary">Review</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>SIN-SYD</span>
                    <Badge variant="default">Optimized</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>DXB-LHR</span>
                    <Badge variant="default">Optimized</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Class Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Economy</span>
                      <span className="text-sm text-green-600">+12%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Yield: $0.095</div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Business</span>
                      <span className="text-sm text-green-600">+8%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Yield: $0.285</div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">First</span>
                      <span className="text-sm text-red-600">-3%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Yield: $0.520</div>
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
