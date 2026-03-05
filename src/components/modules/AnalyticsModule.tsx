'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function AnalyticsModule() {
  const { kpiDashboard, pnrs, tickets, flightInstances } = useAirlineStore()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Business Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time KPIs, Route Profitability, and Performance Analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>Custom Dashboard</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiDashboard.metrics.revenue.total.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {kpiDashboard.metrics.revenue.change}%
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Load Factor</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiDashboard.metrics.loadFactor.value}%</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {kpiDashboard.metrics.loadFactor.change}%
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Yield</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpiDashboard.metrics.yield.value}</div>
            <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3" />
              {Math.abs(kpiDashboard.metrics.yield.change)}%
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On-Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiDashboard.metrics.onTimePerformance.value}%</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {kpiDashboard.metrics.onTimePerformance.change}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kpi" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="routes">Route Analytics</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="kpi">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Revenue by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kpiDashboard.revenueByChannel.map((channel) => (
                    <div key={channel.channel} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{channel.channel.replace('_', ' ')}</span>
                        <span className="text-muted-foreground">${channel.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${channel.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Revenue by Cabin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {kpiDashboard.revenueByCabin.map((cabin) => (
                    <div key={cabin.cabin} className="text-center p-4 bg-secondary/30 rounded-sm">
                      <div className="text-2xl font-bold">${cabin.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground capitalize mt-1">{cabin.cabin}</div>
                      <div className="text-xs text-muted-foreground mt-1">{cabin.passengers} pax</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Route Profitability</CardTitle>
              <CardDescription>Performance metrics by route</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Flights</th>
                      <th>Passengers</th>
                      <th>Load Factor</th>
                      <th>Revenue</th>
                      <th>Yield</th>
                      <th>Growth</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { route: 'JFK-LHR', flights: 120, pax: 21500, lf: 89.5, rev: 4250000, yield: 0.185, growth: 12.5, profit: 850000 },
                      { route: 'JFK-PAR', flights: 95, pax: 16800, lf: 86.2, rev: 3120000, yield: 0.162, growth: 8.3, profit: 580000 },
                      { route: 'LAX-TYO', flights: 85, pax: 14200, lf: 82.8, rev: 3800000, yield: 0.142, growth: -2.1, profit: 620000 },
                      { route: 'SIN-SYD', flights: 110, pax: 18900, lf: 84.5, rev: 2980000, yield: 0.128, growth: 5.7, profit: 450000 },
                      { route: 'DXB-LHR', flights: 100, pax: 17800, lf: 87.2, rev: 3560000, yield: 0.155, growth: 10.2, profit: 680000 }
                    ].map((item, i) => (
                      <tr key={i}>
                        <td className="font-medium">{item.route}</td>
                        <td className="text-sm">{item.flights}</td>
                        <td className="text-sm">{item.pax.toLocaleString()}</td>
                        <td className="text-sm">{item.lf}%</td>
                        <td className="text-sm font-medium">${item.rev.toLocaleString()}</td>
                        <td className="text-sm">${item.yield}</td>
                        <td className={`text-sm ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </td>
                        <td className="text-sm font-medium text-green-600">${item.profit.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Agent Channel Performance</CardTitle>
              <CardDescription>Performance metrics by sales channel</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Bookings</th>
                      <th>Passengers</th>
                      <th>Revenue</th>
                      <th>Commission</th>
                      <th>Growth</th>
                      <th>Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpiDashboard.topAgents.map((agent, i) => (
                      <tr key={agent.agentId}>
                        <td className="font-medium">{agent.agentName}</td>
                        <td className="text-sm">{agent.bookings}</td>
                        <td className="text-sm">{agent.passengers}</td>
                        <td className="text-sm font-medium">${agent.revenue.toLocaleString()}</td>
                        <td className="text-sm">${agent.commission.toLocaleString()}</td>
                        <td className={`text-sm ${agent.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {agent.growth >= 0 ? '+' : ''}{agent.growth}%
                        </td>
                        <td><Badge variant={i < 3 ? 'default' : 'outline'}>#{i + 1}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Demand Forecast</CardTitle>
                <CardDescription>AI-powered demand prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['JFK-LHR', 'JFK-PAR', 'LAX-TYO', 'SIN-SYD'].map((route, i) => (
                    <div key={route} className="p-3 bg-secondary/30 rounded-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{route}</span>
                        <Badge variant={i < 2 ? 'default' : 'secondary'}>
                          {i < 2 ? 'High Demand' : 'Moderate'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Predicted LF:</span>
                          <span className="ml-1 font-medium">{90 - i * 5}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="ml-1 font-medium">{95 - i * 3}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Next 30 days prediction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                    <span className="font-medium">Predicted Revenue</span>
                    <span className="text-2xl font-bold">$12.4M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-sm">
                    <span className="font-medium">Expected Load Factor</span>
                    <span className="text-2xl font-bold">86%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-sm">
                    <span className="font-medium">Forecast Accuracy</span>
                    <span className="text-2xl font-bold">94%</span>
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
