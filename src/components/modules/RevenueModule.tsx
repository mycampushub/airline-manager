'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
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
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Layers,
  PieChart,
  LineChart,
  Settings,
  AlertCircle,
  Award
} from 'lucide-react'
import { useAirlineStore, type FareBasis } from '@/lib/store'
import { DEMO_ROUTES } from '@/lib/demoData'

interface PricingRule {
  id: string
  name: string
  route: string
  bookingClass: string
  minFare: number
  maxFare: number
  demandMultiplier: number
  competitorMatch: boolean
  active: boolean
}

interface ForecastData {
  id: string
  route: string
  period: string
  predictedLoadFactor: number
  predictedYield: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  recommendation: string
}

interface OptimizationAction {
  id: string
  type: 'price_increase' | 'price_decrease' | 'inventory_adjustment' | 'route_change'
  route: string
  description: string
  expectedImpact: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'applied' | 'dismissed'
}

export default function RevenueModule() {
  const { fareBasis, revenueData, demandForecasts, addFareBasis, updateRevenueData } = useAirlineStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('pricing')
  const [showFareDialog, setShowFareDialog] = useState(false)
  const [showRuleDialog, setShowRuleDialog] = useState(false)

  // Enhanced state - Generate from store data
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(() => {
    // Generate 30 pricing rules from fareBasis
    return fareBasis.slice(0, 30).map((fare, i) => ({
      id: `PR${String(i + 1).padStart(3, '0')}`,
      name: `${fare.name} Rule`,
      route: ['ALL', 'JFK-LHR', 'JFK-PAR', 'LAX-TYO', 'SIN-SYD', 'DXB-LHR', 'LHR-FRA', 'HKG-SIN'][i % 8],
      bookingClass: fare.bookingClass,
      minFare: Math.round(fare.baseFare * 0.8),
      maxFare: Math.round(fare.baseFare * 1.5),
      demandMultiplier: 0.8 + (i % 5) * 0.2,
      competitorMatch: i % 3 === 0,
      active: i % 5 !== 0
    }))
  })

  const [forecastData, setForecastData] = useState<ForecastData[]>([
    { id: 'FD1', route: 'JFK-LHR', period: 'Next 30 Days', predictedLoadFactor: 87, predictedYield: 0.185, confidence: 92, trend: 'up', recommendation: 'Increase prices by 10%' },
    { id: 'FD2', route: 'JFK-PAR', period: 'Next 30 Days', predictedLoadFactor: 82, predictedYield: 0.162, confidence: 88, trend: 'up', recommendation: 'Maintain current pricing' },
    { id: 'FD3', route: 'LAX-NRT', period: 'Next 30 Days', predictedLoadFactor: 76, predictedYield: 0.142, confidence: 85, trend: 'down', recommendation: 'Consider promotional pricing' },
    { id: 'FD4', route: 'SFO-HKG', period: 'Next 30 Days', predictedLoadFactor: 79, predictedYield: 0.128, confidence: 80, trend: 'stable', recommendation: 'Monitor demand trends' },
    { id: 'FD5', route: 'DXB-LHR', period: 'Next 30 Days', predictedLoadFactor: 84, predictedYield: 0.155, confidence: 90, trend: 'up', recommendation: 'Increase fares by 5%' },
    { id: 'FD6', route: 'SIN-SYD', period: 'Next 30 Days', predictedLoadFactor: 81, predictedYield: 0.135, confidence: 87, trend: 'stable', recommendation: 'Maintain current strategy' },
    { id: 'FD7', route: 'JFK-MIA', period: 'Next 30 Days', predictedLoadFactor: 88, predictedYield: 0.168, confidence: 94, trend: 'up', recommendation: 'Maximize revenue' },
    { id: 'FD8', route: 'ORD-LAX', period: 'Next 30 Days', predictedLoadFactor: 83, predictedYield: 0.145, confidence: 86, trend: 'up', recommendation: 'Adjust dynamic pricing' },
    { id: 'FD9', route: 'ATL-LHR', period: 'Next 30 Days', predictedLoadFactor: 80, predictedYield: 0.158, confidence: 84, trend: 'stable', recommendation: 'Monitor competitor pricing' },
    { id: 'FD10', route: 'DFW-NRT', period: 'Next 30 Days', predictedLoadFactor: 74, predictedYield: 0.132, confidence: 81, trend: 'down', recommendation: 'Launch promotional campaign' },
    { id: 'FD11', route: 'LHR-DXB', period: 'Next 30 Days', predictedLoadFactor: 85, predictedYield: 0.175, confidence: 91, trend: 'up', recommendation: 'Optimize inventory allocation' },
    { id: 'FD12', route: 'CDG-SIN', period: 'Next 30 Days', predictedLoadFactor: 77, predictedYield: 0.148, confidence: 83, trend: 'down', recommendation: 'Consider fare reduction' },
    { id: 'FD13', route: 'JFK-SFO', period: 'Next 30 Days', predictedLoadFactor: 86, predictedYield: 0.152, confidence: 89, trend: 'up', recommendation: 'Increase business class availability' },
    { id: 'FD14', route: 'LAX-HNL', period: 'Next 30 Days', predictedLoadFactor: 90, predictedYield: 0.138, confidence: 95, trend: 'up', recommendation: 'Maximize high-yield bookings' },
    { id: 'FD15', route: 'MIA-GRU', period: 'Next 30 Days', predictedLoadFactor: 78, predictedYield: 0.142, confidence: 82, trend: 'stable', recommendation: 'Focus on cargo revenue' },
    { id: 'FD16', route: 'FRA-JFK', period: 'Next 30 Days', predictedLoadFactor: 83, predictedYield: 0.178, confidence: 88, trend: 'up', recommendation: 'Target business travelers' },
    { id: 'FD17', route: 'AMS-LAX', period: 'Next 30 Days', predictedLoadFactor: 76, predictedYield: 0.150, confidence: 84, trend: 'down', recommendation: 'Adjust capacity if possible' },
    { id: 'FD18', route: 'HKG-SYD', period: 'Next 30 Days', predictedLoadFactor: 82, predictedYield: 0.146, confidence: 87, trend: 'stable', recommendation: 'Maintain fare structure' },
    { id: 'FD19', route: 'BKK-LHR', period: 'Next 30 Days', predictedLoadFactor: 79, predictedYield: 0.140, confidence: 85, trend: 'stable', recommendation: 'Monitor market trends' },
    { id: 'FD20', route: 'JFK-LAS', period: 'Next 30 Days', predictedLoadFactor: 92, predictedYield: 0.125, confidence: 96, trend: 'up', recommendation: 'Premium pricing strategy' },
    { id: 'FD21', route: 'ORD-MIA', period: 'Next 30 Days', predictedLoadFactor: 84, predictedYield: 0.138, confidence: 89, trend: 'up', recommendation: 'Expand connection traffic' },
    { id: 'FD22', route: 'LAX-MEX', period: 'Next 30 Days', predictedLoadFactor: 80, predictedYield: 0.118, confidence: 83, trend: 'stable', recommendation: 'Maintain competitive pricing' },
    { id: 'FD23', route: 'SFO-ICN', period: 'Next 30 Days', predictedLoadFactor: 75, predictedYield: 0.156, confidence: 81, trend: 'down', recommendation: 'Promotional fares needed' },
    { id: 'FD24', route: 'DXB-SYD', period: 'Next 30 Days', predictedLoadFactor: 72, predictedYield: 0.148, confidence: 79, trend: 'down', recommendation: 'Consider route optimization' },
    { id: 'FD25', route: 'LHR-JFK', period: 'Next 30 Days', predictedLoadFactor: 88, predictedYield: 0.190, confidence: 93, trend: 'up', recommendation: 'Increase premium cabin sales' },
    { id: 'FD26', route: 'CDG-FRA', period: 'Next 30 Days', predictedLoadFactor: 91, predictedYield: 0.095, confidence: 94, trend: 'up', recommendation: 'High-frequency route strategy' },
    { id: 'FD27', route: 'SIN-NRT', period: 'Next 30 Days', predictedLoadFactor: 83, predictedYield: 0.162, confidence: 88, trend: 'stable', recommendation: 'Maintain current pricing' },
    { id: 'FD28', route: 'HKG-LAX', period: 'Next 30 Days', predictedLoadFactor: 78, predictedYield: 0.165, confidence: 85, trend: 'stable', recommendation: 'Focus on cargo revenue' },
    { id: 'FD29', route: 'MIA-MAD', period: 'Next 30 Days', predictedLoadFactor: 81, predictedYield: 0.158, confidence: 87, trend: 'up', recommendation: 'Expand premium offerings' },
    { id: 'FD30', route: 'JFK-BCN', period: 'Next 30 Days', predictedLoadFactor: 85, predictedYield: 0.172, confidence: 90, trend: 'up', recommendation: 'Target tourist season demand' }
  ])

  const [optimizationActions, setOptimizationActions] = useState<OptimizationAction[]>([
    { id: 'OA1', type: 'price_increase', route: 'JFK-LHR', description: 'High demand detected, recommend 15% price increase', expectedImpact: '+$45,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA2', type: 'price_decrease', route: 'LAX-NRT', description: 'Low demand forecast, recommend 10% price decrease', expectedImpact: '+8% load factor', priority: 'medium', status: 'pending' },
    { id: 'OA3', type: 'inventory_adjustment', route: 'JFK-MIA', description: 'Shift 5 business class seats to economy', expectedImpact: '+$12,000 revenue', priority: 'medium', status: 'pending' },
    { id: 'OA4', type: 'price_increase', route: 'LAX-HNL', description: 'Peak travel season, recommend 20% premium fare', expectedImpact: '+$38,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA5', type: 'route_change', route: 'DFW-NRT', description: 'Consider reducing frequency due to low demand', expectedImpact: '-$15,000 cost', priority: 'low', status: 'pending' },
    { id: 'OA6', type: 'price_decrease', route: 'SFO-ICN', description: 'Competitor price match needed', expectedImpact: '+5% market share', priority: 'medium', status: 'pending' },
    { id: 'OA7', type: 'inventory_adjustment', route: 'JFK-SFO', description: 'Open additional economy seats for sale', expectedImpact: '+$22,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA8', type: 'price_increase', route: 'LHR-JFK', description: 'Business class demand surge detected', expectedImpact: '+$52,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA9', type: 'price_decrease', route: 'DXB-SYD', description: 'Low load factor, promotional pricing recommended', expectedImpact: '+10% bookings', priority: 'low', status: 'pending' },
    { id: 'OA10', type: 'route_change', route: 'CDG-FRA', description: 'Increase frequency on high-demand route', expectedImpact: '+$28,000 revenue', priority: 'medium', status: 'pending' },
    { id: 'OA11', type: 'price_increase', route: 'JFK-BCN', description: 'Summer travel demand peak', expectedImpact: '+$35,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA12', type: 'inventory_adjustment', route: 'SIN-SYD', description: 'Reduce first class, increase business class', expectedImpact: '+$18,000 revenue', priority: 'medium', status: 'pending' },
    { id: 'OA13', type: 'price_decrease', route: 'LAX-MEX', description: 'Regional competition requires fare adjustment', expectedImpact: '+6% load factor', priority: 'low', status: 'pending' },
    { id: 'OA14', type: 'price_increase', route: 'FRA-JFK', description: 'Corporate contract renewal pricing', expectedImpact: '+$48,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA15', type: 'route_change', route: 'MIA-GRU', description: 'Add connecting flight to increase O&D demand', expectedImpact: '+$25,000 revenue', priority: 'medium', status: 'pending' },
    { id: 'OA16', type: 'price_decrease', route: 'AMS-LAX', description: 'Off-season pricing adjustment', expectedImpact: '+7% load factor', priority: 'low', status: 'pending' },
    { id: 'OA17', type: 'inventory_adjustment', route: 'ORD-LAX', description: 'Reallocate inventory from business to premium economy', expectedImpact: '+$15,000 revenue', priority: 'medium', status: 'pending' },
    { id: 'OA18', type: 'price_increase', route: 'HKG-LAX', description: 'Cargo demand driving passenger revenue', expectedImpact: '+$42,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA19', type: 'price_decrease', route: 'CDG-SIN', description: 'Long-haul route stimulation needed', expectedImpact: '+9% bookings', priority: 'medium', status: 'pending' },
    { id: 'OA20', type: 'route_change', route: 'BKK-LHR', description: 'Seasonal frequency adjustment recommended', expectedImpact: '+$20,000 revenue', priority: 'low', status: 'pending' },
    { id: 'OA21', type: 'price_increase', route: 'DXB-LHR', description: 'Oil market impact on demand', expectedImpact: '+$38,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA22', type: 'inventory_adjustment', route: 'ATL-LHR', description: 'Increase premium economy capacity', expectedImpact: '+$16,000 revenue', priority: 'medium', status: 'pending' },
    { id: 'OA23', type: 'price_decrease', route: 'HKG-SYD', description: 'Competitive market pressure', expectedImpact: '+8% market share', priority: 'low', status: 'pending' },
    { id: 'OA24', type: 'price_increase', route: 'SIN-NRT', description: 'Business travel demand surge', expectedImpact: '+$32,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA25', type: 'route_change', route: 'MIA-MAD', description: 'Add weekend flight for leisure travelers', expectedImpact: '+$22,000 revenue', priority: 'medium', status: 'pending' },
    { id: 'OA26', type: 'price_decrease', route: 'ORD-MIA', description: 'Fill remaining capacity with promotional fares', expectedImpact: '+6% load factor', priority: 'low', status: 'pending' },
    { id: 'OA27', type: 'inventory_adjustment', route: 'JFK-LAS', description: 'Maximize high-yield weekend bookings', expectedImpact: '+$28,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA28', type: 'price_increase', route: 'SFO-HKG', description: 'Transpacific demand recovery', expectedImpact: '+$55,000 revenue', priority: 'high', status: 'pending' },
    { id: 'OA29', type: 'price_decrease', route: 'LHR-DXB', description: 'Regional market competition', expectedImpact: '+7% bookings', priority: 'medium', status: 'pending' },
    { id: 'OA30', type: 'route_change', route: 'JFK-PAR', description: 'Optimize connecting traffic through European hub', expectedImpact: '+$30,000 revenue', priority: 'medium', status: 'pending' }
  ])

  const [newRule, setNewRule] = useState({
    name: '',
    route: '',
    bookingClass: '',
    minFare: 0,
    maxFare: 0,
    demandMultiplier: 1,
    competitorMatch: false
  })

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

  const [pricingConfig, setPricingConfig] = useState({
    dynamicPricing: true,
    competitorMatch: true,
    seasonality: true,
    elasticity: true,
    demandThreshold: 80,
    priceSensitivity: 0.5
  })

  const handleAddFare = () => {
    addFareBasis(newFare)
    setShowFareDialog(false)
  }

  const handleCreateRule = () => {
    const rule: PricingRule = {
      id: `PR${pricingRules.length + 1}`,
      ...newRule,
      active: true
    }
    setPricingRules([...pricingRules, rule])
    setShowRuleDialog(false)
    setNewRule({ name: '', route: '', bookingClass: '', minFare: 0, maxFare: 0, demandMultiplier: 1, competitorMatch: false })
  }

  const handleApplyOptimization = (actionId: string) => {
    setOptimizationActions(optimizationActions.map(a => a.id === actionId ? { ...a, status: 'applied' as const } : a))
  }

  const handleDismissOptimization = (actionId: string) => {
    setOptimizationActions(optimizationActions.map(a => a.id === actionId ? { ...a, status: 'dismissed' as const } : a))
  }

  const handleToggleRule = (ruleId: string) => {
    setPricingRules(pricingRules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r))
  }

  // Additional handlers
  const handleExportReport = () => {
    const headers = ['Route', 'Date', 'Passengers', 'Revenue', 'Load Factor']
    const rows = revenueData.map(r => [r.route, r.date, r.passengers, r.revenue, r.loadFactor])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'revenue-report.csv'
    link.click()
    toast({ title: 'Report Exported', description: 'Revenue report exported to CSV' })
  }

  const handleConfigurePricing = () => {
    setShowRuleDialog(true)
    toast({ title: 'Pricing Configuration', description: 'Configure pricing settings' })
  }

  const handleRefreshRules = () => {
    setPricingRules([...pricingRules])
    toast({ title: 'Rules Refreshed', description: 'Pricing rules refreshed' })
  }

  // Calculations
  const totalRevenue = revenueData.reduce((sum, r) => sum + r.totalRevenue, 0)
  const activeRules = pricingRules.filter(r => r.active).length
  const pendingActions = optimizationActions.filter(a => a.status === 'pending').length

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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1 flex items-center flex-wrap gap-1">
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
            <div className="text-xs text-green-600 mt-1 flex items-center flex-wrap gap-1">
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
            <div className="text-xs text-green-600 mt-1 flex items-center flex-wrap gap-1">
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
            <div className="text-xs text-red-600 mt-1 flex items-center flex-wrap gap-1">
              <TrendingDown className="h-3 w-3" />
              -0.8% vs last month
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Actions</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingActions}</div>
            <div className="text-xs text-muted-foreground mt-1">awaiting review</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="forecast">Demand Forecast</TabsTrigger>
          <TabsTrigger value="optimization">Yield Optimization</TabsTrigger>
          <TabsTrigger value="yield">Yield Analysis</TabsTrigger>
        </TabsList>

        {/* Dynamic Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pricing Configuration</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleConfigurePricing}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { key: 'dynamicPricing', label: 'Dynamic Pricing', desc: 'Automatically adjust prices based on demand', icon: <Zap className="h-4 w-4" /> },
                    { key: 'competitorMatch', label: 'Competitor Price Matching', desc: 'Match or beat competitor prices', icon: <Target className="h-4 w-4" /> },
                    { key: 'seasonality', label: 'Seasonal Adjustments', desc: 'Adjust for seasonal demand patterns', icon: <Calendar className="h-4 w-4" /> },
                    { key: 'elasticity', label: 'Price Elasticity', desc: 'Consider price sensitivity', icon: <Activity className="h-4 w-4" /> }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-secondary/30 rounded-sm">
                      <div className="flex items-center flex-wrap gap-3">
                        <div className="text-primary">{item.icon}</div>
                        <div>
                          <div className="font-medium text-sm">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                      <Switch checked={pricingConfig[item.key as keyof typeof pricingConfig]} onCheckedChange={() => setPricingConfig({...pricingConfig, [item.key]: !pricingConfig[item.key as keyof typeof pricingConfig]})} />
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Demand Threshold</Label>
                      <span className="text-sm text-muted-foreground">{pricingConfig.demandThreshold}%</span>
                    </div>
                    <Slider
                      min={50}
                      max={100}
                      step={5}
                      value={[pricingConfig.demandThreshold]}
                      onValueChange={(v) => setPricingConfig({...pricingConfig, demandThreshold: v[0]})}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Price Sensitivity</Label>
                      <span className="text-sm text-muted-foreground">{pricingConfig.priceSensitivity}</span>
                    </div>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={[pricingConfig.priceSensitivity]}
                      onValueChange={(v) => setPricingConfig({...pricingConfig, priceSensitivity: v[0]})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <div className="flex items-center flex-wrap gap-4">
                          <div className="flex items-center flex-wrap gap-2">
                            <input type="checkbox" checked={newFare.changeable} onChange={(e) => setNewFare({...newFare, changeable: e.target.checked})} />
                            <Label className="text-sm">Changeable</Label>
                          </div>
                          <div className="flex items-center flex-wrap gap-2">
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
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto h-80">
                  <table className="enterprise-table min-w-[1000px]">
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
                        fareBasis.slice(0, 30).map((fare) => (
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
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pricing Rules</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefreshRules}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Pricing Rule</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Rule Name</Label>
                          <Input value={newRule.name} onChange={(e) => setNewRule({...newRule, name: e.target.value})} placeholder="Peak Hour Premium" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Route</Label>
                            <Select value={newRule.route} onValueChange={(v) => setNewRule({...newRule, route: v})}>
                              <SelectTrigger><SelectValue placeholder="All routes" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">All Routes</SelectItem>
                                <SelectItem value="JFK-LHR">JFK - LHR</SelectItem>
                                <SelectItem value="JFK-PAR">JFK - PAR</SelectItem>
                                <SelectItem value="LAX-TYO">LAX - TYO</SelectItem>
                                <SelectItem value="SIN-SYD">SIN - SYD</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Booking Class</Label>
                            <Select value={newRule.bookingClass} onValueChange={(v) => setNewRule({...newRule, bookingClass: v})}>
                              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
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
                            <Label>Min Fare ($)</Label>
                            <Input type="number" value={newRule.minFare || ''} onChange={(e) => setNewRule({...newRule, minFare: Number(e.target.value)})} />
                          </div>
                          <div>
                            <Label>Max Fare ($)</Label>
                            <Input type="number" value={newRule.maxFare || ''} onChange={(e) => setNewRule({...newRule, maxFare: Number(e.target.value)})} />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Demand Multiplier</Label>
                            <span className="text-sm text-muted-foreground">{newRule.demandMultiplier}x</span>
                          </div>
                          <Slider
                            min={0.5}
                            max={2.0}
                            step={0.1}
                            value={[newRule.demandMultiplier]}
                            onValueChange={(v) => setNewRule({...newRule, demandMultiplier: v[0]})}
                          />
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                          <input type="checkbox" checked={newRule.competitorMatch} onChange={(e) => setNewRule({...newRule, competitorMatch: e.target.checked})} />
                          <Label className="text-sm">Enable Competitor Price Matching</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRuleDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateRule}>Create Rule</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <CardDescription>
                Define pricing rules and automation logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>Rule Name</th>
                      <th>Route</th>
                      <th>Class</th>
                      <th>Fare Range</th>
                      <th>Multiplier</th>
                      <th>Competitor Match</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingRules.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No pricing rules configured
                        </td>
                      </tr>
                    ) : (
                      pricingRules.map((rule) => (
                        <tr key={rule.id}>
                          <td className="font-medium">{rule.name}</td>
                          <td className="text-sm">{rule.route}</td>
                          <td className="text-sm">{rule.bookingClass}</td>
                          <td className="text-sm">${rule.minFare} - ${rule.maxFare}</td>
                          <td className="text-sm">{rule.demandMultiplier}x</td>
                          <td>{rule.competitorMatch ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}</td>
                          <td>
                            <Badge variant={rule.active ? 'default' : 'secondary'}>
                              {rule.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => handleToggleRule(rule.id)}>
                              {rule.active ? <XCircle className="h-4 w-4 text-yellow-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
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

        {/* Demand Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Demand Forecasting</CardTitle>
                  <Badge variant="outline">AI-Powered</Badge>
                </div>
                <CardDescription>
                  ML-based demand prediction by route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {forecastData.map((forecast) => (
                    <div key={forecast.id} className="p-4 bg-secondary/30 rounded-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{forecast.route}</div>
                          <div className="text-xs text-muted-foreground">{forecast.period}</div>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                          {forecast.trend === 'up' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <TrendingUp className="h-3 w-3 mr-1 inline" />
                              Up
                            </Badge>
                          ) : forecast.trend === 'down' ? (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <TrendingDown className="h-3 w-3 mr-1 inline" />
                              Down
                            </Badge>
                          ) : (
                            <Badge variant="outline">Stable</Badge>
                          )}
                          <Badge variant="outline">{forecast.confidence}% confidence</Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-sm">
                          <div className="text-muted-foreground text-xs mb-1">Predicted Load Factor</div>
                          <div className="text-xl font-bold text-blue-600">{forecast.predictedLoadFactor}%</div>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-sm">
                          <div className="text-muted-foreground text-xs mb-1">Predicted Yield</div>
                          <div className="text-xl font-bold text-purple-600">${forecast.predictedYield}</div>
                        </div>
                      </div>
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-sm text-sm">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">AI Recommendation</span>
                        </div>
                        <div className="text-muted-foreground">{forecast.recommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
                <CardDescription>
                  Historical prediction accuracy metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { metric: 'Load Factor Prediction', accuracy: 94, trend: '+2.5%' },
                    { metric: 'Revenue Forecast', accuracy: 91, trend: '+1.8%' },
                    { metric: 'Demand Modeling', accuracy: 89, trend: '+3.2%' },
                    { metric: 'Price Elasticity', accuracy: 87, trend: '+4.1%' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-secondary/30 rounded-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{item.metric}</span>
                        <span className="text-sm text-green-600 flex items-center flex-wrap gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {item.trend}
                        </span>
                      </div>
                      <div className="flex items-center flex-wrap gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${item.accuracy}%` }}></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{item.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Yield Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>AI-Powered Optimization Recommendations</CardTitle>
              <CardDescription>
                Automated yield management suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto h-96">
                <div className="space-y-3">
                  {optimizationActions.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-muted-foreground">All optimizations applied</p>
                    </div>
                  ) : (
                    optimizationActions.map((action) => (
                      <div key={action.id} className={`p-4 border rounded-sm ${
                        action.priority === 'high' ? 'bg-red-50 border-red-200' : 
                        action.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' : 
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              {action.type === 'price_increase' ? <TrendingUp className="h-4 w-4" /> :
                               action.type === 'price_decrease' ? <TrendingDown className="h-4 w-4" /> :
                               <Settings className="h-4 w-4" />}
                              <span className="font-medium">{action.route}</span>
                              <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'secondary' : 'outline'}>
                                {action.priority}
                              </Badge>
                              <Badge variant={action.status === 'applied' ? 'default' : action.status === 'dismissed' ? 'secondary' : 'outline'}>
                                {action.status}
                              </Badge>
                            </div>
                            <div className="text-sm mb-2">{action.description}</div>
                            <div className="flex items-center flex-wrap gap-4 text-xs">
                              <div className="flex items-center flex-wrap gap-1">
                                <Zap className="h-3 w-3" />
                                <span className="text-muted-foreground">Expected: {action.expectedImpact}</span>
                              </div>
                            </div>
                          </div>
                          {action.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleApplyOptimization(action.id)}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDismissOptimization(action.id)}>
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yield Analysis Tab */}
        <TabsContent value="yield" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Route Yield</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {DEMO_ROUTES.slice(0, 30).map((route, i) => {
                    const yieldValue = (0.095 + (i % 15) * 0.006).toFixed(3)
                    return (
                      <div key={route.id} className="flex items-center justify-between text-sm">
                        <span>{route.origin}-{route.destination}</span>
                        <span className="font-medium">${yieldValue}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">O&D Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { route: 'JFK-LHR', status: 'Optimized' },
                    { route: 'JFK-PAR', status: 'Optimized' },
                    { route: 'LAX-TYO', status: 'Review' },
                    { route: 'SIN-SYD', status: 'Optimized' },
                    { route: 'DXB-LHR', status: 'Optimized' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{item.route}</span>
                      <Badge variant={item.status === 'Optimized' ? 'default' : 'secondary'}>{item.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Class Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { class: 'Economy', yield: '$0.095', change: '+12%' },
                    { class: 'Business', yield: '$0.285', change: '+8%' },
                    { class: 'First', yield: '$0.520', change: '-3%' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-secondary/30 rounded-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.class}</span>
                        <span className={`text-sm ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{item.change}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Yield: {item.yield}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
