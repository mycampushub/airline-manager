'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Leaf, 
  Droplets, 
  Zap, 
  Recycle, 
  TrendingDown, 
  Target,
  TreePine,
  Globe,
  Plane
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function SustainabilityModule() {
  const { sustainabilityMetrics, carbonOffsets, sellCarbonOffset } = useAirlineStore()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sustainability</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fuel Burn Analytics, Emissions Tracking, and ESG Reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Download ESG Report</Button>
          <Button>View Targets</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CO2 Emissions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M tonnes</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -8% vs target
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fuel Efficiency</CardTitle>
            <Droplets className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2L/100km</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -5% improvement
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Offsets</CardTitle>
            <TreePine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">450K tonnes</div>
            <div className="text-xs text-muted-foreground mt-1">offsets sold YTD</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Renewable Energy</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35%</div>
            <div className="text-xs text-muted-foreground mt-1">of total energy</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="emissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="offsets">Carbon Offsets</TabsTrigger>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
        </TabsList>

        <TabsContent value="emissions">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Emissions Tracking</CardTitle>
              <CardDescription>CO2 emissions by route and aircraft type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Emissions by Route (Top 5)</h3>
                  {[
                    { route: 'JFK-LHR', co2: 125000, perPaxKm: 0.085 },
                    { route: 'LAX-TYO', co2: 145000, perPaxKm: 0.092 },
                    { route: 'SIN-SYD', co2: 98000, perPaxKm: 0.078 },
                    { route: 'DXB-LHR', co2: 118000, perPaxKm: 0.088 },
                    { route: 'JFK-PAR', co2: 92000, perPaxKm: 0.082 }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-secondary/30 rounded-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.route}</span>
                        <span className="text-sm">{item.co2.toLocaleString()} tonnes CO2</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.perPaxKm} kg CO2 per passenger-km
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Monthly Emissions Trend</h3>
                  <div className="space-y-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                      <div key={month} className="flex items-center gap-3">
                        <span className="w-12 text-sm">{month}</span>
                        <div className="flex-1 h-6 bg-secondary rounded-sm overflow-hidden">
                          <div 
                            className="h-full bg-green-600 transition-all"
                            style={{ width: `${75 - i * 8}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-20 text-right">{(200 - i * 15).toFixed(1)}K tonnes</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offsets">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Carbon Offset Programs</CardTitle>
              <CardDescription>Available carbon offset projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Forest Preservation', location: 'Amazon, Brazil', type: 'Reforestation', price: 15, available: 50000, sold: 32000 },
                  { name: 'Wind Farm', location: 'Texas, USA', type: 'Renewable Energy', price: 12, available: 75000, sold: 45000 },
                  { name: 'Solar Power', location: 'Rajasthan, India', type: 'Renewable Energy', price: 10, available: 60000, sold: 38000 },
                  { name: 'Methane Capture', location: 'Queensland, Australia', type: 'Waste Management', price: 18, available: 40000, sold: 25000 },
                  { name: 'Biomass Energy', location: 'Sweden', type: 'Renewable Energy', price: 14, available: 55000, sold: 30000 },
                  { name: 'Ocean Conservation', location: 'Pacific Ocean', type: 'Blue Carbon', price: 20, available: 30000, sold: 15000 }
                ].map((offset, i) => (
                  <Card key={i} className="enterprise-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{offset.name}</CardTitle>
                      <CardDescription className="text-sm">{offset.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{offset.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-medium">${offset.price}/tonne</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span>{(offset.available - offset.sold).toLocaleString()} tonnes</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" size="sm" onClick={() => sellCarbonOffset(offset.id || String(i), 1000)}>
                        Purchase Offset
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="initiatives">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Sustainability Initiatives</CardTitle>
              <CardDescription>Active and planned sustainability programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Fleet Modernization', type: 'fleet', status: 'active', savings: { fuel: 45000, co2: 142000, cost: 12.5 }, progress: 75 },
                  { name: 'Sustainable Aviation Fuel', type: 'fuel', status: 'active', savings: { fuel: 28000, co2: 88000, cost: 8.2 }, progress: 45 },
                  { name: 'Weight Reduction', type: 'operations', status: 'active', savings: { fuel: 12000, co2: 38000, cost: 3.5 }, progress: 90 },
                  { name: 'Electric Ground Equipment', type: 'ground', status: 'planned', savings: { fuel: 8000, co2: 25000, cost: 2.1 }, progress: 0 },
                  { name: 'Route Optimization', type: 'operations', status: 'active', savings: { fuel: 15000, co2: 47000, cost: 4.8 }, progress: 60 },
                  { name: 'Waste Recycling', type: 'ground', status: 'active', savings: { fuel: 0, co2: 5000, cost: 1.2 }, progress: 85 }
                ].map((initiative, i) => (
                  <div key={i} className="p-4 bg-secondary/30 rounded-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {initiative.type === 'fleet' && <Plane className="h-5 w-5 text-blue-600" />}
                        {initiative.type === 'fuel' && <Droplets className="h-5 w-5 text-blue-600" />}
                        {initiative.type === 'operations' && <Zap className="h-5 w-5 text-yellow-600" />}
                        {initiative.type === 'ground' && <Recycle className="h-5 w-5 text-green-600" />}
                        <span className="font-medium">{initiative.name}</span>
                      </div>
                      <Badge variant={initiative.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                        {initiative.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fuel:</span>
                        <span className="ml-1 font-medium">{initiative.savings.fuel.toLocaleString()}L</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CO2:</span>
                        <span className="ml-1 font-medium text-green-600">{initiative.savings.co2.toLocaleString()}t</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Savings:</span>
                        <span className="ml-1 font-medium">${initiative.savings.cost}M</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{initiative.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-green-600 transition-all" style={{ width: `${initiative.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>ESG Targets</CardTitle>
              <CardDescription>Sustainability goals and progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { name: 'Fuel Efficiency', current: 3.2, target: 3.0, unit: 'L/100km', year: 2025, color: 'blue' },
                  { name: 'CO2 Reduction', current: 8, target: 20, unit: '%', year: 2025, color: 'green' },
                  { name: 'Renewable Energy', current: 35, target: 50, unit: '%', year: 2025, color: 'yellow' }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">Target: {item.year}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-4 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${item.color === 'blue' ? 'bg-blue-600' : item.color === 'green' ? 'bg-green-600' : 'bg-yellow-600'}`}
                            style={{ width: `${(item.current / item.target) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{item.current}{item.unit}</span>
                        <span className="text-muted-foreground mx-2">/</span>
                        <span className="text-muted-foreground">{item.target}{item.unit}</span>
                      </div>
                      <Badge variant={item.current >= item.target ? 'default' : 'secondary'}>
                        {item.current >= item.target ? 'On Track' : 'In Progress'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
