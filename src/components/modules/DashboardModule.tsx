'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  TrendingUp, 
  TrendingDown, 
  Plane, 
  Users, 
  DollarSign, 
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  MapPin,
  Activity,
  Zap,
  Bell,
  MoreHorizontal,
  Download,
  Filter,
  RefreshCw,
  Wrench
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

interface StatCardProps {
  title: string
  value: number | string
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: any
  prefix?: string
  suffix?: string
  detail?: string
}

const StatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  prefix = '', 
  suffix = '',
  detail
}: StatCardProps) => (
  <Card className="enterprise-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</div>
      <div className="flex items-center gap-1 mt-1">
        {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-600" />}
        {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-600" />}
        <span className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
        <span className="text-xs text-muted-foreground ml-1">vs last period</span>
      </div>
      {detail && <div className="text-xs text-muted-foreground mt-1">{detail}</div>}
    </CardContent>
  </Card>
)

export default function DashboardModule() {
  const { kpiDashboard, pnrs, tickets, flightInstances, disruptions, crewMembers, maintenanceRecords } = useAirlineStore()
  const metrics = kpiDashboard.metrics
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  const alerts = [
    { id: 1, type: 'critical', title: 'Flight AA123 Delayed', message: 'Weather conditions at JFK causing 2h delay', time: '10 min ago', acknowledged: false },
    { id: 2, type: 'warning', title: 'Low Inventory on JFK-LHR', message: 'Y class at 15% remaining', time: '25 min ago', acknowledged: false },
    { id: 3, type: 'info', title: 'New GDS Integration', message: 'Travelport connection established', time: '1 hour ago', acknowledged: true },
    { id: 4, type: 'warning', title: 'Crew Duty Time Alert', message: 'Crew member C123 approaching limit', time: '2 hours ago', acknowledged: false }
  ]

  // Handlers for Dashboard Module
  const handleSetToday = () => {
    alert('Viewing today\'s operations')
    console.log('Showing today\'s data')
  }

  const handleShowFilters = () => {
    alert('Open filters dialog - Feature to be implemented')
  }

  const handleRefresh = () => {
    alert('Refreshing dashboard data...')
    console.log('Refreshing dashboard metrics')
  }

  const handleDownloadReport = () => {
    alert('Downloading dashboard report')
    console.log('Downloading report as PDF...')
  }

  const handleViewAlerts = () => {
    setActiveTab('alerts')
  }

  const handleAcknowledgeAll = () => {
    setAlerts(alerts.map(a => ({ ...a, acknowledged: true })))
    alert(`Acknowledged ${alerts.length} alerts`)
  }

  const handleClearResolved = () => {
    setAlerts(alerts.filter(a => !a.acknowledged || a.status !== 'resolved'))
    alert('Cleared resolved alerts')
  }

  const handleAcknowledgeAlert = (alert: any) => {
    setAlerts(alerts.map(a => a.id === alert.id ? { ...a, acknowledged: true } : a))
  }

  const handleViewAlertDetails = (alert: any) => {
    setSelectedAlert(alert)
  }

  const handleAcknowledgeSingleAlert = (alert: any) => {
    setAlerts(alerts.map(a => a.id === alert.id ? { ...a, acknowledged: true } : a))
    setSelectedAlert(null)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Executive Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time overview of airline operations and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSetToday}>
            <Calendar className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleShowFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(a => !a.acknowledged && a.type === 'critical').length > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="font-medium text-red-900 dark:text-red-100">
                    {alerts.filter(a => !a.acknowledged && a.type === 'critical').length} Critical Alert{alerts.filter(a => !a.acknowledged && a.type === 'critical').length > 1 ? 's' : ''} Require Attention
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">
                    {alerts.filter(a => !a.acknowledged && a.type === 'critical').map(a => a.title).join(', ')}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="destructive">
                <Bell className="h-4 w-4 mr-2" />
                View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="alerts">Alerts Center</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Primary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Bookings"
              value={metrics.bookings.total}
              change={metrics.bookings.change}
              trend={metrics.bookings.trend}
              icon={Plane}
              detail={`${metrics.bookings.total * 0.03?.toFixed(0)} today`}
            />
            <StatCard
              title="Passengers"
              value={metrics.passengers.total}
              change={metrics.passengers.change}
              trend={metrics.passengers.trend}
              icon={Users}
              detail={`${metrics.passengers.total * 0.85?.toFixed(0)} boarded`}
            />
            <StatCard
              title="Revenue"
              value={metrics.revenue.total}
              change={metrics.revenue.change}
              trend={metrics.revenue.trend}
              icon={DollarSign}
              prefix="$"
              detail="$1.2M ancillary included"
            />
            <StatCard
              title="Load Factor"
              value={metrics.loadFactor.value}
              change={metrics.loadFactor.change}
              trend={metrics.loadFactor.trend}
              icon={BarChart3}
              suffix="%"
              detail="Industry avg: 82%"
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Yield"
              value={metrics.yield.value}
              change={metrics.yield.change}
              trend={metrics.yield.trend}
              icon={DollarSign}
              prefix="$"
              suffix="/km"
            />
            <StatCard
              title="Ancillary Revenue"
              value={metrics.ancillaryRevenue.total}
              change={metrics.ancillaryRevenue.change}
              trend={metrics.ancillaryRevenue.trend}
              icon={Package}
              prefix="$"
            />
            <StatCard
              title="On-Time Performance"
              value={metrics.onTimePerformance.value}
              change={metrics.onTimePerformance.change}
              trend={metrics.onTimePerformance.trend}
              icon={Clock}
              suffix="%"
            />
            <StatCard
              title="Cancellations"
              value={metrics.cancellations.count}
              change={metrics.cancellations.change}
              trend={metrics.cancellations.trend}
              icon={AlertTriangle}
            />
          </div>

          {/* Active Flights and Revenue Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="enterprise-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Today's Flights</CardTitle>
                    <Badge variant="secondary">{flightInstances.length} Active</Badge>
                  </div>
                  <CardDescription>Real-time flight status and operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Flight</th>
                          <th>Route</th>
                          <th>Dep</th>
                          <th>Arr</th>
                          <th>Aircraft</th>
                          <th>Load</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {flightInstances.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center text-muted-foreground py-8">
                              No active flights today
                            </td>
                          </tr>
                        ) : (
                          flightInstances.slice(0, 10).map((flight) => (
                            <tr key={flight.id}>
                              <td className="font-medium">{flight.flightNumber}</td>
                              <td>{flight.origin} → {flight.destination}</td>
                              <td>{flight.scheduledDeparture}</td>
                              <td>{flight.scheduledArrival}</td>
                              <td>{flight.aircraftType}</td>
                              <td>{flight.loadFactor}%</td>
                              <td>
                                <Badge 
                                  variant={flight.status === 'scheduled' ? 'default' : 
                                          flight.status === 'delayed' ? 'destructive' :
                                          flight.status === 'departed' ? 'secondary' : 'default'}
                                  className="capitalize"
                                >
                                  {flight.status}
                                </Badge>
                              </td>
                              <td>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
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
            </div>

            <div className="space-y-4">
              {/* Revenue Distribution */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="text-base">Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpiDashboard.revenueByChannel.map((channel) => (
                      <div key={channel.channel} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium capitalize">{channel.channel.replace('_', ' ')}</span>
                          <span className="text-muted-foreground">${(channel.revenue / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
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

              {/* Revenue by Cabin */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="text-base">Revenue by Cabin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpiDashboard.revenueByCabin.map((cabin) => (
                      <div key={cabin.cabin} className="flex items-center justify-between p-2 bg-secondary/30 rounded-sm">
                        <div>
                          <div className="text-xs text-muted-foreground capitalize">{cabin.cabin}</div>
                          <div className="text-sm font-medium">${cabin.revenue.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{cabin.passengers}</div>
                          <div className="text-xs text-muted-foreground">pax</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Flights</CardTitle>
                <Plane className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{flightInstances.length}</div>
                <div className="text-xs text-muted-foreground mt-1">in the air</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">94.2%</div>
                <div className="text-xs text-muted-foreground mt-1">of {flightInstances.length} flights</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Delays</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {flightInstances.filter(f => f.status === 'delayed').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">avg 45 min delay</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Crew on Duty</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{crewMembers.filter(c => c.status === 'active').length}</div>
                <div className="text-xs text-muted-foreground mt-1">of {crewMembers.length} total</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Station Performance */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Station Performance</CardTitle>
                <CardDescription>Operational metrics by hub</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { station: 'JFK', flights: 45, ontime: 92, delay: 8, status: 'good' },
                    { station: 'LHR', flights: 38, ontime: 95, delay: 5, status: 'good' },
                    { station: 'LAX', flights: 32, ontime: 88, delay: 12, status: 'warning' },
                    { station: 'DXB', flights: 28, ontime: 97, delay: 3, status: 'good' },
                    { station: 'SIN', flights: 25, ontime: 90, delay: 10, status: 'good' }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-sm">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{s.station}</div>
                          <div className="text-xs text-muted-foreground">{s.flights} flights today</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{s.ontime}% on-time</div>
                        <Badge variant={s.status === 'good' ? 'default' : 'secondary'} className="text-xs">
                          {s.delay} delayed
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fleet Status */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Fleet Status</CardTitle>
                <CardDescription>Aircraft utilization and availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">In Service</span>
                    </div>
                    <span className="text-2xl font-bold">42</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">In Flight</span>
                    </div>
                    <span className="text-2xl font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Maintenance</span>
                    </div>
                    <span className="text-2xl font-bold">5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Standby</span>
                    </div>
                    <span className="text-2xl font-bold">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Maintenance */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Active Maintenance</CardTitle>
              <CardDescription>Current work orders and scheduled maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>WO #</th>
                      <th>Aircraft</th>
                      <th>Type</th>
                      <th>Station</th>
                      <th>Priority</th>
                      <th>Started</th>
                      <th>Est. Completion</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceRecords.filter(m => m.status === 'in_progress').slice(0, 5).map((record) => (
                      <tr key={record.id}>
                        <td className="font-mono font-medium">{record.workOrderNumber}</td>
                        <td className="text-sm">{record.aircraftRegistration}</td>
                        <td className="capitalize text-sm">{record.category.replace('_', '-')}</td>
                        <td className="text-sm">{record.station}</td>
                        <td>
                          <Badge variant={record.priority === 'critical' ? 'destructive' : record.priority === 'high' ? 'secondary' : 'outline'} className="capitalize">
                            {record.priority}
                          </Badge>
                        </td>
                        <td className="text-sm">{new Date(record.scheduledStart).toLocaleTimeString()}</td>
                        <td className="text-sm">{new Date(record.scheduledEnd).toLocaleTimeString()}</td>
                        <td>
                          <Badge variant="secondary" className="animate-pulse">In Progress</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={metrics.revenue.total}
              change={metrics.revenue.change}
              trend={metrics.revenue.trend}
              icon={DollarSign}
              prefix="$"
            />
            <StatCard
              title="Yield per RPK"
              value={metrics.yield.value}
              change={metrics.yield.change}
              trend={metrics.yield.trend}
              icon={Activity}
              prefix="$"
            />
            <StatCard
              title="RASK"
              value={0.12}
              change={-0.8}
              trend="down"
              icon={BarChart3}
              prefix="$"
            />
            <StatCard
              title="CASK"
              value={0.09}
              change={-1.2}
              trend="up"
              icon={Zap}
              prefix="$"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Route */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Revenue by Route (Top 5)</CardTitle>
                <CardDescription>Highest revenue generating routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { route: 'JFK-LHR', revenue: 4250000, growth: 12.5, lf: 89.5 },
                    { route: 'LAX-TYO', revenue: 3800000, growth: -2.1, lf: 82.8 },
                    { route: 'DXB-LHR', revenue: 3560000, growth: 10.2, lf: 87.2 },
                    { route: 'JFK-PAR', revenue: 3120000, growth: 8.3, lf: 86.2 },
                    { route: 'SIN-SYD', revenue: 2980000, growth: 5.7, lf: 84.5 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold">{i + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{item.route}</div>
                          <div className="text-xs text-muted-foreground">LF: {item.lf}%</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${(item.revenue / 1000000).toFixed(2)}M</div>
                        <div className={`text-xs ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cost Breakdown */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>Operational cost distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Fuel', amount: 4500000, percent: 35, trend: 'down' },
                    { category: 'Labor', amount: 3200000, percent: 25, trend: 'up' },
                    { category: 'Aircraft', amount: 2600000, percent: 20, trend: 'stable' },
                    { category: 'Airport & ATC', amount: 1500000, percent: 12, trend: 'up' },
                    { category: 'Other', amount: 1000000, percent: 8, trend: 'down' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-muted-foreground">${(item.amount / 1000000).toFixed(2)}M ({item.percent}%)</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${item.trend === 'up' ? 'bg-red-500' : item.trend === 'down' ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125,847</div>
                <div className="text-xs text-green-600 mt-1">+8% this month</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Loyalty Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89,234</div>
                <div className="text-xs text-muted-foreground mt-1">71% enrollment rate</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">NPS Score</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">72</div>
                <div className="text-xs text-green-600 mt-1">+5 vs last quarter</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Repeat Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <div className="text-xs text-green-600 mt-1">+3% improvement</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings */}
            <Card className="enterprise-card lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest reservations across all channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>PNR</th>
                        <th>Passenger</th>
                        <th>Route</th>
                        <th>Amount</th>
                        <th>Channel</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pnrs.slice(-5).reverse().map((pnr) => (
                        <tr key={pnr.pnrNumber}>
                          <td className="font-mono font-medium">{pnr.pnrNumber}</td>
                          <td className="text-sm">{pnr.passengers[0]?.firstName} {pnr.passengers[0]?.lastName}</td>
                          <td className="text-sm">{pnr.segments[0]?.origin} → {pnr.segments[0]?.destination}</td>
                          <td className="text-sm">${pnr.fareQuote.total}</td>
                          <td><Badge variant="outline" className="text-xs">Web</Badge></td>
                          <td className="text-sm">{new Date(pnr.createdAt).toLocaleTimeString()}</td>
                          <td>
                            <Badge variant={pnr.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                              {pnr.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Customer Satisfaction */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Satisfaction Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-sm">
                    <div className="text-3xl font-bold text-green-600">4.6</div>
                    <div className="text-sm text-muted-foreground">Average Rating (out of 5)</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Excellent (5★)</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Good (4★)</span>
                      <span className="font-medium">32%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average (3★)</span>
                      <span className="font-medium">15%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Poor (2★ or below)</span>
                      <span className="font-medium text-red-600">8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="enterprise-card border-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.type === 'critical' && !a.acknowledged).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">unacknowledged</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card border-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
                <Bell className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.type === 'warning' && !a.acknowledged).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">unacknowledged</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Info</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alerts.filter(a => a.type === 'info').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">informational</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <div className="text-xs text-muted-foreground mt-1">all alerts</div>
              </CardContent>
            </Card>
          </div>

          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alerts Center</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleAcknowledgeAll}>Acknowledge All</Button>
                  <Button variant="outline" size="sm" onClick={handleClearResolved}>Clear Resolved</Button>
                </div>
              </div>
              <CardDescription>System notifications and operational alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-sm border ${
                        alert.acknowledged 
                          ? 'bg-secondary/30 border-muted' 
                          : alert.type === 'critical'
                          ? 'bg-red-50 border-red-200 dark:bg-red-950'
                          : alert.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {alert.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />}
                          {alert.type === 'warning' && <Bell className="h-5 w-5 text-yellow-600 mt-0.5" />}
                          {alert.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{alert.title}</span>
                              {!alert.acknowledged && <Badge variant="destructive" className="text-xs">New</Badge>}
                              {alert.acknowledged && <Badge variant="outline" className="text-xs">Acknowledged</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                            <div className="text-xs text-muted-foreground mt-2">{alert.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!alert.acknowledged && (
                            <Button size="sm" variant="outline" onClick={() => handleAcknowledgeSingleAlert(alert)}>
                              Acknowledge
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => setSelectedAlert(alert)}>
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{alert.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <div className="text-sm text-muted-foreground">Message</div>
                                  <div className="mt-1">{alert.message}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Time</div>
                                  <div className="mt-1">{alert.time}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Type</div>
                                  <div className="mt-1 capitalize">{alert.type}</div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
