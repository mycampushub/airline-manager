'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Leaf, Droplets, Zap, Recycle, TrendingDown, Target, TreePine, Globe, Plane,
  Download, Upload, BarChart3, PieChart, LineChart, FileText, CheckCircle, XCircle,
  AlertTriangle, Calendar, MapPin, Filter, Search, RefreshCw, Eye, Plus, Settings,
  Users, Building2, Shield, Award, Factory, Wind, Sun, Waves, Database, Activity,
  ArrowUp, ArrowDown, Info, MoreHorizontal, ChevronRight, Clock
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

// Extended interfaces for Sustainability features
interface ESGReport {
  id: string
  reportType: 'annual' | 'quarterly' | 'monthly'
  year: number
  quarter?: number
  month?: number
  status: 'draft' | 'review' | 'published'
  environmental: {
    co2Emissions: number
    fuelConsumption: number
    energyConsumption: number
    waterUsage: number
    wasteGenerated: number
    wasteRecycled: number
    renewableEnergy: number
  }
  social: {
    employees: number
    diversityInclusion: number
    trainingHours: number
    healthSafetyIncidents: number
    communityInvestment: number
    customerSatisfaction: number
  }
  governance: {
    boardDiversity: number
    ethicsCompliance: number
    riskManagement: number
    dataPrivacy: number
    antiCorruption: number
  }
  createdAt: string
  publishedAt?: string
}

interface CarbonOptimization {
  id: string
  name: string
  type: 'route_optimization' | 'fleet_upgrade' | 'saf_adoption' | 'weight_reduction' | 'operational'
  status: 'proposed' | 'in_progress' | 'implemented' | 'completed'
  priority: 'high' | 'medium' | 'low'
  description: string
  estimatedSavings: {
    co2: number
    fuel: number
    cost: number
  }
  actualSavings?: {
    co2: number
    fuel: number
    cost: number
  }
  implementationCost: number
  paybackPeriod: number
  progress: number
  startDate: string
  targetDate: string
  responsible: string
}

interface OffsetPortfolio {
  id: string
  projectName: string
  projectType: 'reforestation' | 'renewable_energy' | 'waste_management' | 'blue_carbon' | 'biochar'
  location: string
  certification: string
  pricePerTonne: number
  totalPurchased: number
  totalSpent: number
  totalRetired: number
  available: number
  vintage: number
  status: 'active' | 'retired' | 'expired'
  purchaseHistory: OffsetPurchase[]
  coBenefits: string[]
  riskRating: 'low' | 'medium' | 'high'
}

interface OffsetPurchase {
  id: string
  date: string
  quantity: number
  price: number
  totalCost: number
  retirementDate?: string
}

export default function SustainabilityModule() {
  const { sustainabilityMetrics, carbonOffsets, sellCarbonOffset } = useAirlineStore()
  
  // ESG Reports state
  const [esgReports, setEsgReports] = useState<ESGReport[]>([])
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ESGReport | null>(null)
  const [showReportDetails, setShowReportDetails] = useState(false)
  
  // Carbon Optimization state
  const [optimizations, setOptimizations] = useState<CarbonOptimization[]>([])
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false)
  const [selectedOptimization, setSelectedOptimization] = useState<CarbonOptimization | null>(null)
  const [showOptimizationDetails, setShowOptimizationDetails] = useState(false)
  
  // Offset Portfolio state
  const [offsetPortfolio, setOffsetPortfolio] = useState<OffsetPortfolio[]>([])
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [selectedOffset, setSelectedOffset] = useState<OffsetPortfolio | null>(null)
  const [purchaseQuantity, setPurchaseQuantity] = useState(0)
  
  const initializedRef = useRef(false)

  // Initialize mock data functions
  const initializeESGReports = () => {
    const reports: ESGReport[] = [
      {
        id: 'esg-2024-q1',
        reportType: 'quarterly',
        year: 2024,
        quarter: 1,
        status: 'published',
        environmental: {
          co2Emissions: 2450000,
          fuelConsumption: 785000000,
          energyConsumption: 125000000,
          waterUsage: 4500000,
          wasteGenerated: 8900,
          wasteRecycled: 6700,
          renewableEnergy: 0.35
        },
        social: {
          employees: 45000,
          diversityInclusion: 0.42,
          trainingHours: 125000,
          healthSafetyIncidents: 3,
          communityInvestment: 2500000,
          customerSatisfaction: 0.87
        },
        governance: {
          boardDiversity: 0.45,
          ethicsCompliance: 0.98,
          riskManagement: 0.95,
          dataPrivacy: 0.94,
          antiCorruption: 0.99
        },
        createdAt: '2024-04-01',
        publishedAt: '2024-04-15'
      },
      {
        id: 'esg-2023-annual',
        reportType: 'annual',
        year: 2023,
        status: 'published',
        environmental: {
          co2Emissions: 9800000,
          fuelConsumption: 3120000000,
          energyConsumption: 485000000,
          waterUsage: 17500000,
          wasteGenerated: 35000,
          wasteRecycled: 24500,
          renewableEnergy: 0.32
        },
        social: {
          employees: 43500,
          diversityInclusion: 0.40,
          trainingHours: 450000,
          healthSafetyIncidents: 12,
          communityInvestment: 8500000,
          customerSatisfaction: 0.85
        },
        governance: {
          boardDiversity: 0.40,
          ethicsCompliance: 0.97,
          riskManagement: 0.93,
          dataPrivacy: 0.92,
          antiCorruption: 0.98
        },
        createdAt: '2024-01-15',
        publishedAt: '2024-02-28'
      }
    ]
    setEsgReports(reports)
  }

  const initializeOptimizations = () => {
    const opts: CarbonOptimization[] = [
      {
        id: 'opt-001',
        name: 'Direct Route Optimization',
        type: 'route_optimization',
        status: 'in_progress',
        priority: 'high',
        description: 'Implement AI-powered direct routing for long-haul flights to reduce fuel consumption',
        estimatedSavings: { co2: 85000, fuel: 27000000, cost: 21500000 },
        actualSavings: { co2: 42000, fuel: 13500000, cost: 10750000 },
        implementationCost: 3500000,
        paybackPeriod: 6,
        progress: 50,
        startDate: '2024-01-01',
        targetDate: '2024-12-31',
        responsible: 'Flight Operations'
      },
      {
        id: 'opt-002',
        name: 'SAF Adoption Program',
        type: 'saf_adoption',
        status: 'proposed',
        priority: 'high',
        description: 'Blend 10% Sustainable Aviation Fuel across all flights from 2025',
        estimatedSavings: { co2: 245000, fuel: 0, cost: -18500000 },
        implementationCost: 45000000,
        paybackPeriod: 3,
        progress: 0,
        startDate: '2025-01-01',
        targetDate: '2027-12-31',
        responsible: 'Fuel Management'
      },
      {
        id: 'opt-003',
        name: 'A320neo Fleet Upgrade',
        type: 'fleet_upgrade',
        status: 'in_progress',
        priority: 'medium',
        description: 'Replace 20 A320ceo with A320neo aircraft for 15% fuel efficiency improvement',
        estimatedSavings: { co2: 125000, fuel: 40000000, cost: 32000000 },
        actualSavings: { co2: 35000, fuel: 11000000, cost: 8800000 },
        implementationCost: 1200000000,
        paybackPeriod: 8,
        progress: 35,
        startDate: '2023-01-01',
        targetDate: '2026-12-31',
        responsible: 'Fleet Management'
      },
      {
        id: 'opt-004',
        name: 'Weight Reduction Initiative',
        type: 'weight_reduction',
        status: 'completed',
        priority: 'medium',
        description: 'Reduce aircraft weight through lightweight materials and optimized catering',
        estimatedSavings: { co2: 28000, fuel: 9000000, cost: 7200000 },
        actualSavings: { co2: 32000, fuel: 10200000, cost: 8160000 },
        implementationCost: 4500000,
        paybackPeriod: 2,
        progress: 100,
        startDate: '2023-01-01',
        targetDate: '2023-12-31',
        responsible: 'Operations'
      }
    ]
    setOptimizations(opts)
  }

  const initializeOffsetPortfolio = () => {
    const portfolio: OffsetPortfolio[] = [
      {
        id: 'off-001',
        projectName: 'Amazon Rainforest Preservation',
        projectType: 'reforestation',
        location: 'Amazon, Brazil',
        certification: 'VCS, CCBS',
        pricePerTonne: 15,
        totalPurchased: 50000,
        totalSpent: 750000,
        totalRetired: 32000,
        available: 18000,
        vintage: 2023,
        status: 'active',
        purchaseHistory: [
          { id: 'p-001', date: '2024-01-15', quantity: 20000, price: 15, totalCost: 300000, retirementDate: '2024-06-30' },
          { id: 'p-002', date: '2024-07-01', quantity: 12000, price: 15, totalCost: 180000, retirementDate: '2024-12-31' },
          { id: 'p-003', date: '2024-08-01', quantity: 18000, price: 15, totalCost: 270000 }
        ],
        coBenefits: ['Biodiversity Conservation', 'Community Development', 'Indigenous Rights'],
        riskRating: 'low'
      },
      {
        id: 'off-002',
        projectName: 'Texas Wind Farm',
        projectType: 'renewable_energy',
        location: 'Texas, USA',
        certification: 'Gold Standard',
        pricePerTonne: 12,
        totalPurchased: 75000,
        totalSpent: 900000,
        totalRetired: 45000,
        available: 30000,
        vintage: 2022,
        status: 'active',
        purchaseHistory: [
          { id: 'p-004', date: '2023-06-01', quantity: 45000, price: 12, totalCost: 540000, retirementDate: '2024-03-31' },
          { id: 'p-005', date: '2024-04-01', quantity: 30000, price: 12, totalCost: 360000 }
        ],
        coBenefits: ['Clean Energy', 'Job Creation', 'Energy Independence'],
        riskRating: 'low'
      },
      {
        id: 'off-003',
        projectName: 'Solar Power India',
        projectType: 'renewable_energy',
        location: 'Rajasthan, India',
        certification: 'VCS',
        pricePerTonne: 10,
        totalPurchased: 60000,
        totalSpent: 600000,
        totalRetired: 38000,
        available: 22000,
        vintage: 2023,
        status: 'active',
        purchaseHistory: [
          { id: 'p-006', date: '2024-02-01', quantity: 38000, price: 10, totalCost: 380000, retirementDate: '2024-09-30' },
          { id: 'p-007', date: '2024-10-01', quantity: 22000, price: 10, totalCost: 220000 }
        ],
        coBenefits: ['Clean Energy', 'Rural Development', 'Technology Transfer'],
        riskRating: 'medium'
      },
      {
        id: 'off-004',
        projectName: 'Ocean Conservation Project',
        projectType: 'blue_carbon',
        location: 'Pacific Ocean',
        certification: 'VCS, Blue Carbon',
        pricePerTonne: 20,
        totalPurchased: 30000,
        totalSpent: 600000,
        totalRetired: 15000,
        available: 15000,
        vintage: 2024,
        status: 'active',
        purchaseHistory: [
          { id: 'p-008', date: '2024-05-01', quantity: 15000, price: 20, totalCost: 300000, retirementDate: '2024-11-30' },
          { id: 'p-009', date: '2024-12-01', quantity: 15000, price: 20, totalCost: 300000 }
        ],
        coBenefits: ['Marine Biodiversity', 'Coastal Protection', 'Sustainable Fisheries'],
        riskRating: 'medium'
      }
    ]
    setOffsetPortfolio(portfolio)
  }

  // Initialize all mock data on component mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    setTimeout(() => {
      initializeESGReports()
      initializeOptimizations()
      initializeOffsetPortfolio()
    }, 0)
  }, [])

  // Handlers
  const handlePurchaseOffset = () => {
    if (selectedOffset && purchaseQuantity > 0) {
      const totalCost = purchaseQuantity * selectedOffset.pricePerTonne
      setOffsetPortfolio(prev =>
        prev.map(o =>
          o.id === selectedOffset.id
            ? {
                ...o,
                totalPurchased: o.totalPurchased + purchaseQuantity,
                totalSpent: o.totalSpent + totalCost,
                available: o.available + purchaseQuantity,
                purchaseHistory: [...o.purchaseHistory, {
                  id: `p-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  quantity: purchaseQuantity,
                  price: selectedOffset.pricePerTonne,
                  totalCost
                }]
              }
            : o
        )
      )
      setShowPurchaseDialog(false)
      setPurchaseQuantity(0)
      setSelectedOffset(null)
    }
  }

  const handleRetireOffset = (offsetId: string, quantity: number) => {
    setOffsetPortfolio(prev =>
      prev.map(o =>
        o.id === offsetId
          ? {
              ...o,
              totalRetired: o.totalRetired + quantity,
              available: o.available - quantity,
              purchaseHistory: o.purchaseHistory.map(ph =>
                !ph.retirementDate && ph.quantity >= quantity
                  ? { ...ph, retirementDate: new Date().toISOString().split('T')[0] }
                  : ph
              )
            }
          : o
      )
    )
  }

  // Additional handlers for Sustainability Module
  const handleRefreshSustainabilityData = () => {
    alert('Sustainability data refreshed')
    console.log('Refreshing sustainability metrics...')
  }

  const handleExportESGReports = () => {
    alert('ESG reports exported')
    console.log('Exporting ESG reports:', esgReports)
  }

  const handleExportOffsetPortfolio = () => {
    alert('Offset portfolio exported')
    console.log('Exporting offset portfolio:', offsetPortfolio)
  }

  const handleExportSustainabilityData = () => {
    alert('Sustainability data exported')
    console.log('Exporting sustainability data...')
  }

  // Utility functions
  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      review: 'outline',
      published: 'default',
      proposed: 'secondary',
      in_progress: 'outline',
      implemented: 'default',
      completed: 'default',
      active: 'default',
      retired: 'secondary',
      expired: 'destructive'
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] || variants.draft} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return (
      <Badge className={`${colors[priority as keyof typeof colors] || colors.low} capitalize`}>
        {priority}
      </Badge>
    )
  }

  // Calculate summary metrics
  const totalCO2 = esgReports.reduce((sum, r) => Math.max(sum, r.environmental.co2Emissions), 0)
  const totalOffsets = offsetPortfolio.reduce((sum, o) => sum + o.totalRetired, 0)
  const netCO2 = totalCO2 - totalOffsets
  const totalSavings = optimizations.reduce((sum, o) => sum + (o.actualSavings?.co2 || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sustainability</h2>
          <p className="text-sm text-muted-foreground mt-1">
            ESG Reports, Carbon Optimization, and Offset Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            initializeESGReports()
            initializeOptimizations()
            initializeOffsetPortfolio()
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportESGReports}>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CO2 Emissions</CardTitle>
            <Globe className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalCO2 / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-muted-foreground mt-1">tonnes YTD</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offsets Retired</CardTitle>
            <TreePine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(totalOffsets / 1000).toFixed(0)}K</div>
            <div className="text-xs text-muted-foreground mt-1">tonnes</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Emissions</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{(netCO2 / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-muted-foreground mt-1">tonnes (net)</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Optimization Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{(totalSavings / 1000).toFixed(0)}K</div>
            <div className="text-xs text-muted-foreground mt-1">tonnes CO2 saved</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ESG Score</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">A-</div>
            <div className="text-xs text-muted-foreground mt-1">overall rating</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="esg" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="esg">ESG Reports</TabsTrigger>
          <TabsTrigger value="optimization">Carbon Optimization</TabsTrigger>
          <TabsTrigger value="offsets">Offset Portfolio</TabsTrigger>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
        </TabsList>

        {/* ESG Reports Tab */}
        <TabsContent value="esg">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ESG Reports</CardTitle>
                  <CardDescription>Environmental, Social, and Governance performance reports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {esgReports.map((report) => (
                    <Card key={report.id} className="enterprise-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {report.reportType === 'annual' ? `Annual Report ${report.year}` :
                               report.reportType === 'quarterly' ? `Q${report.quarter} ${report.year}` :
                               `${new Date(report.month + '-01-2024').toLocaleString('default', { month: 'long' })} ${report.year}`}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              Published: {report.publishedAt || 'Draft'}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(report.status)}
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedReport(report); setShowReportDetails(true) }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-sm">
                            <div className="text-xs text-muted-foreground">Environmental</div>
                            <div className="text-lg font-bold text-green-700 dark:text-green-400">
                              {(report.environmental.co2Emissions / 1000000).toFixed(1)}M t CO2
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round(report.environmental.renewableEnergy * 100)}% renewable
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
                            <div className="text-xs text-muted-foreground">Social</div>
                            <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                              {Math.round(report.social.diversityInclusion * 100)}% diversity
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {(report.social.customerSatisfaction * 100).toFixed(0)}% satisfaction
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-sm">
                            <div className="text-xs text-muted-foreground">Governance</div>
                            <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                              {Math.round(report.governance.boardDiversity * 100)}% board diversity
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {Math.round(report.governance.ethicsCompliance * 100)}% compliance
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Carbon Optimization Tab */}
        <TabsContent value="optimization">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Carbon Optimization Initiatives</CardTitle>
                  <CardDescription>Active and proposed carbon reduction programs</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {optimizations.map((opt) => (
                    <Card key={opt.id} className="enterprise-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{opt.name}</CardTitle>
                              {getPriorityBadge(opt.priority)}
                            </div>
                            <CardDescription className="text-xs mt-1">
                              {opt.type.replace('_', ' ')} | {opt.responsible}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(opt.status)}
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedOptimization(opt); setShowOptimizationDetails(true) }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm text-muted-foreground">{opt.description}</p>
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div>
                              <div className="text-muted-foreground">Est. CO2 Savings</div>
                              <div className="font-medium text-green-600">{opt.estimatedSavings.co2.toLocaleString()} t</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Implementation Cost</div>
                              <div className="font-medium">${(opt.implementationCost / 1000000).toFixed(1)}M</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Payback Period</div>
                              <div className="font-medium">{opt.paybackPeriod} years</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Target Date</div>
                              <div className="font-medium">{new Date(opt.targetDate).toLocaleDateString()}</div>
                            </div>
                          </div>
                          {opt.status !== 'proposed' && opt.status !== 'completed' && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Progress</span>
                                <span>{opt.progress}%</span>
                              </div>
                              <Progress value={opt.progress} className="h-2" />
                            </div>
                          )}
                          {opt.actualSavings && (
                            <div className="grid grid-cols-3 gap-2 text-xs p-2 bg-secondary/20 rounded-sm">
                              <div>
                                <span className="text-muted-foreground">CO2: </span>
                                <span className="font-medium">{opt.actualSavings.co2.toLocaleString()} t</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fuel: </span>
                                <span className="font-medium">{(opt.actualSavings.fuel / 1000000).toFixed(1)}M L</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Cost: </span>
                                <span className="font-medium">${(opt.actualSavings.cost / 1000000).toFixed(1)}M</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offset Portfolio Tab */}
        <TabsContent value="offsets">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Carbon Offset Portfolio</CardTitle>
                  <CardDescription>Manage carbon credit purchases and retirements</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportOffsetPortfolio}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Portfolio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Purchased</th>
                      <th>Retired</th>
                      <th>Available</th>
                      <th>Investment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offsetPortfolio.map((offset) => (
                      <tr key={offset.id}>
                        <td>
                          <div className="font-medium">{offset.projectName}</div>
                          <div className="text-xs text-muted-foreground">{offset.certification}</div>
                        </td>
                        <td className="capitalize">{offset.projectType.replace('_', ' ')}</td>
                        <td className="text-sm">{offset.location}</td>
                        <td className="text-sm">{offset.totalPurchased.toLocaleString()} t</td>
                        <td className="text-sm text-green-600">{offset.totalRetired.toLocaleString()} t</td>
                        <td className="text-sm font-medium">{offset.available.toLocaleString()} t</td>
                        <td className="text-sm">${offset.totalSpent.toLocaleString()}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedOffset(offset); setShowPurchaseDialog(true) }}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            {offset.available > 0 && (
                              <Button variant="ghost" size="sm" onClick={() => handleRetireOffset(offset.id, Math.min(1000, offset.available))}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Initiatives Tab */}
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

        {/* Targets Tab */}
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
                  { name: 'Renewable Energy', current: 35, target: 50, unit: '%', year: 2025, color: 'yellow' },
                  { name: 'Waste Recycling', current: 75, target: 90, unit: '%', year: 2026, color: 'purple' },
                  { name: 'Board Diversity', current: 45, target: 50, unit: '%', year: 2025, color: 'pink' }
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
                            className={`h-full transition-all ${
                              item.color === 'blue' ? 'bg-blue-600' :
                              item.color === 'green' ? 'bg-green-600' :
                              item.color === 'yellow' ? 'bg-yellow-600' :
                              item.color === 'purple' ? 'bg-purple-600' : 'bg-pink-600'
                            }`}
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

      {/* Purchase Offset Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Carbon Offsets</DialogTitle>
            <DialogDescription>
              {selectedOffset?.projectName} - ${selectedOffset?.pricePerTonne}/tonne
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Quantity (tonnes)</Label>
              <Input
                type="number"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
              />
            </div>
            {selectedOffset && purchaseQuantity > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Total Cost: ${purchaseQuantity * selectedOffset.pricePerTonne.toLocaleString()}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseDialog(false)}>Cancel</Button>
            <Button onClick={handlePurchaseOffset} disabled={purchaseQuantity <= 0}>
              Purchase Offsets
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ESG Report Details Dialog */}
      <Dialog open={showReportDetails} onOpenChange={setShowReportDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ESG Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-sm">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Environmental
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">CO2 Emissions</div>
                      <div className="font-medium">{(selectedReport.environmental.co2Emissions / 1000000).toFixed(2)}M tonnes</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fuel Consumption</div>
                      <div className="font-medium">{(selectedReport.environmental.fuelConsumption / 1000000).toFixed(0)}M litres</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Renewable Energy</div>
                      <div className="font-medium">{Math.round(selectedReport.environmental.renewableEnergy * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Water Usage</div>
                      <div className="font-medium">{(selectedReport.environmental.waterUsage / 1000000).toFixed(1)}M m³</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Waste Recycled</div>
                      <div className="font-medium">{Math.round((selectedReport.environmental.wasteRecycled / selectedReport.environmental.wasteGenerated) * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Energy Consumption</div>
                      <div className="font-medium">{(selectedReport.environmental.energyConsumption / 1000000).toFixed(0)}M kWh</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Social
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Employees</div>
                      <div className="font-medium">{selectedReport.social.employees.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Diversity & Inclusion</div>
                      <div className="font-medium">{Math.round(selectedReport.social.diversityInclusion * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Training Hours</div>
                      <div className="font-medium">{selectedReport.social.trainingHours.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Safety Incidents</div>
                      <div className="font-medium">{selectedReport.social.healthSafetyIncidents}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Community Investment</div>
                      <div className="font-medium">${(selectedReport.social.communityInvestment / 1000000).toFixed(1)}M</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Customer Satisfaction</div>
                      <div className="font-medium">{Math.round(selectedReport.social.customerSatisfaction * 100)}%</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-sm">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Governance
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Board Diversity</div>
                      <div className="font-medium">{Math.round(selectedReport.governance.boardDiversity * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Ethics Compliance</div>
                      <div className="font-medium">{Math.round(selectedReport.governance.ethicsCompliance * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Risk Management</div>
                      <div className="font-medium">{Math.round(selectedReport.governance.riskManagement * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Data Privacy</div>
                      <div className="font-medium">{Math.round(selectedReport.governance.dataPrivacy * 100)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Anti-Corruption</div>
                      <div className="font-medium">{Math.round(selectedReport.governance.antiCorruption * 100)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDetails(false)}>Close</Button>
            <Button variant="outline" onClick={() => {
              const periodLabel = selectedReport.reportType === 'annual' 
                ? `${selectedReport.year}` 
                : selectedReport.quarter 
                  ? `Q${selectedReport.quarter} ${selectedReport.year}`
                  : `${selectedReport.month}/${selectedReport.year}`;
              const esgScore = ((selectedReport.environmental.co2Emissions * 0.4) + 
                               (selectedReport.social.employees * selectedReport.social.diversityInclusion * 0.3) + 
                               (selectedReport.governance.boardDiversity * 0.3)) * 100;
              alert(`Downloading ESG Report: ${periodLabel}\nESG Score: ${Math.round(esgScore)}%`)
              console.log('Downloading ESG report:', selectedReport)
            }}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Optimization Details Dialog */}
      <Dialog open={showOptimizationDetails} onOpenChange={setShowOptimizationDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Carbon Optimization Details</DialogTitle>
          </DialogHeader>
          {selectedOptimization && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                {getPriorityBadge(selectedOptimization.priority)}
                {getStatusBadge(selectedOptimization.status)}
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedOptimization.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <div className="text-sm font-medium mt-1 capitalize">{selectedOptimization.type.replace('_', ' ')}</div>
                </div>
                <div>
                  <Label>Responsible</Label>
                  <div className="text-sm font-medium mt-1">{selectedOptimization.responsible}</div>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <div className="text-sm font-medium mt-1">{new Date(selectedOptimization.startDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <Label>Target Date</Label>
                  <div className="text-sm font-medium mt-1">{new Date(selectedOptimization.targetDate).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Estimated Savings</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-sm">
                    <div className="text-xs text-muted-foreground">CO2 Reduction</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-400">
                      {selectedOptimization.estimatedSavings.co2.toLocaleString()} t
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
                    <div className="text-xs text-muted-foreground">Fuel Savings</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      {(selectedOptimization.estimatedSavings.fuel / 1000000).toFixed(1)}M L
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-sm">
                    <div className="text-xs text-muted-foreground">Cost Savings</div>
                    <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                      ${(selectedOptimization.estimatedSavings.cost / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </div>

              {selectedOptimization.actualSavings && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Actual Savings (To Date)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-sm">
                      <div className="text-xs text-muted-foreground">CO2 Reduced</div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-400">
                        {selectedOptimization.actualSavings.co2.toLocaleString()} t
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
                      <div className="text-xs text-muted-foreground">Fuel Saved</div>
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                        {(selectedOptimization.actualSavings.fuel / 1000000).toFixed(1)}M L
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-sm">
                      <div className="text-xs text-muted-foreground">Cost Saved</div>
                      <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                        ${(selectedOptimization.actualSavings.cost / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Implementation Cost</div>
                  <div className="font-medium">${(selectedOptimization.implementationCost / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Payback Period</div>
                  <div className="font-medium">{selectedOptimization.paybackPeriod} years</div>
                </div>
              </div>

              {selectedOptimization.status !== 'proposed' && selectedOptimization.status !== 'completed' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{selectedOptimization.progress}%</span>
                  </div>
                  <Progress value={selectedOptimization.progress} className="h-2" />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptimizationDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
