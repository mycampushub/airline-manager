'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { ScrollArea } from '@/components/ui/scroll-area'
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
  const { toast } = useToast()
  
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
    const reports: ESGReport[] = Array.from({ length: 30 }, (_, i) => {
      const year = 2024 - Math.floor(i / 4)
      const quarter = (i % 4) + 1
      return {
        id: `esg-${year}-q${quarter}`,
        reportType: i % 4 === 0 ? ('annual' as const) : ('quarterly' as const),
        year,
        quarter: i % 4 === 0 ? undefined : quarter,
        status: ['published', 'published', 'review', 'draft'][i % 4] as 'draft' | 'review' | 'published',
        environmental: {
          co2Emissions: 2000000 + (i * 100000),
          fuelConsumption: 600000000 + (i * 50000000),
          energyConsumption: 100000000 + (i * 10000000),
          waterUsage: 4000000 + (i * 500000),
          wasteGenerated: 8000 + (i * 500),
          wasteRecycled: 6000 + (i * 400),
          renewableEnergy: 0.30 + (i * 0.02)
        },
        social: {
          employees: 40000 + (i * 500),
          diversityInclusion: 0.35 + (i * 0.02),
          trainingHours: 100000 + (i * 10000),
          healthSafetyIncidents: 10 + (i % 5),
          communityInvestment: 2000000 + (i * 200000),
          customerSatisfaction: 0.80 + (i * 0.02)
        },
        governance: {
          boardDiversity: 0.35 + (i * 0.03),
          ethicsCompliance: 0.95 + (i * 0.01),
          riskManagement: 0.90 + (i * 0.02),
          dataPrivacy: 0.90 + (i * 0.01),
          antiCorruption: 0.95 + (i * 0.01)
        },
        createdAt: new Date(Date.now() - (i * 90) * 86400000).toISOString(),
        publishedAt: i % 4 === 0 ? new Date(Date.now() - (i * 90 + 15) * 86400000).toISOString() : undefined
      }
    })
    setEsgReports(reports)
  }

  const initializeOptimizations = () => {
    const optNames = [
      'Direct Route Optimization', 'SAF Adoption Program', 'A320neo Fleet Upgrade', 'Weight Reduction Initiative',
      'B777X Fleet Modernization', 'Continuous Descent Approach', 'Single Engine Taxiing', 'Aerodynamic Winglets',
      'Electric Ground Equipment', 'Solar Airport Installations', 'Waste Reduction Program', 'Water Conservation',
      'Sustainable Catering', 'Paperless Operations', 'LED Lighting Upgrade', 'Hybrid Electric Aircraft',
      'Hydrogen Fuel Research', 'Carbon Capture Program', 'Forest Restoration Project', 'Ocean Clean-up Initiative',
      'Biodiesel Ground Vehicles', 'Smart Building Systems', 'Renewable Energy Contracts', 'Fuel Cell APU',
      'Lightweight Materials', 'Efficient Flight Planning', 'Crew Scheduling Optimization', 'Aircraft Cleaning Protocol',
      'Recycling Enhancement', 'Composting Program'
    ]
    const types: ('route_optimization' | 'fleet_upgrade' | 'saf_adoption' | 'weight_reduction' | 'operational')[] = [
      'route_optimization', 'saf_adoption', 'fleet_upgrade', 'weight_reduction',
      'fleet_upgrade', 'operational', 'operational', 'operational',
      'operational', 'operational', 'operational', 'operational',
      'operational', 'operational', 'operational', 'fleet_upgrade',
      'fleet_upgrade', 'operational', 'operational', 'operational',
      'operational', 'operational', 'operational', 'operational',
      'weight_reduction', 'route_optimization', 'operational', 'operational',
      'operational', 'operational'
    ]
    const statuses: ('proposed' | 'in_progress' | 'implemented' | 'completed')[] = [
      'in_progress', 'proposed', 'in_progress', 'completed',
      'in_progress', 'proposed', 'implemented', 'completed',
      'proposed', 'in_progress', 'implemented', 'completed',
      'proposed', 'in_progress', 'implemented', 'proposed',
      'in_progress', 'proposed', 'completed', 'completed',
      'in_progress', 'implemented', 'completed', 'proposed',
      'in_progress', 'completed', 'implemented', 'proposed',
      'completed', 'implemented'
    ]
    const priorities: ('high' | 'medium' | 'low')[] = [
      'high', 'high', 'medium', 'medium',
      'high', 'medium', 'low', 'low',
      'medium', 'high', 'low', 'medium',
      'low', 'medium', 'low', 'high',
      'high', 'medium', 'medium', 'low',
      'medium', 'low', 'low', 'high',
      'medium', 'low', 'high', 'medium',
      'low', 'medium'
    ]
    const descriptions = [
      'Implement AI-powered direct routing for long-haul flights to reduce fuel consumption',
      'Blend 10% Sustainable Aviation Fuel across all flights from 2025',
      'Replace 20 A320ceo with A320neo aircraft for 15% fuel efficiency improvement',
      'Reduce aircraft weight through lightweight materials and optimized catering',
      'Introduce B777X aircraft with 20% better fuel efficiency',
      'Implement continuous descent approach procedures to reduce fuel burn',
      'Use single engine taxiing where possible to reduce ground fuel consumption',
      'Install winglet devices on all aircraft to improve aerodynamic efficiency',
      'Replace diesel ground equipment with electric alternatives',
      'Install solar panels at all major hub airports',
      'Implement comprehensive waste reduction and recycling program',
      'Reduce water consumption across all airport operations',
      'Source sustainable and locally-produced catering options',
      'Transition to fully paperless operational procedures',
      'Replace all airport lighting with energy-efficient LEDs',
      'Invest in hybrid-electric aircraft technology development',
      'Research hydrogen fuel as potential aviation fuel source',
      'Implement carbon capture technology at major facilities',
      'Support forest restoration projects for carbon sequestration',
      'Participate in ocean plastic clean-up initiatives',
      'Transition ground vehicles to biodiesel fuel',
      'Implement smart building management systems',
      'Secure renewable energy contracts for all operations',
      'Install fuel cell auxiliary power units',
      'Replace aircraft interiors with lightweight materials',
      'Implement AI-optimized flight planning',
      'Optimize crew scheduling to reduce deadhead flights',
      'Implement eco-friendly aircraft cleaning protocols',
      'Enhance recycling and waste sorting capabilities',
      'Implement food waste composting program'
    ]
    const responsible = [
      'Flight Operations', 'Fuel Management', 'Fleet Management', 'Operations',
      'Fleet Management', 'Flight Operations', 'Operations', 'Fleet Management',
      'Ground Operations', 'Facilities', 'Operations', 'Facilities',
      'Catering', 'IT', 'Facilities', 'Engineering',
      'Research & Development', 'Research & Development', 'Sustainability', 'Sustainability',
      'Ground Operations', 'Facilities', 'Facilities', 'Sustainability',
      'Engineering', 'Flight Operations', 'Operations', 'Ground Operations',
      'Operations', 'Catering'
    ]

    const opts: CarbonOptimization[] = Array.from({ length: 30 }, (_, i) => {
      const status = statuses[i]
      return {
        id: `opt-${String(i + 1).padStart(3, '0')}`,
        name: optNames[i],
        type: types[i],
        status,
        priority: priorities[i],
        description: descriptions[i],
        estimatedSavings: {
          co2: 10000 + (i * 5000) % 100000,
          fuel: 5000000 + (i * 1000000) % 50000000,
          cost: 1000000 + (i * 500000) % 20000000
        },
        actualSavings: (status === 'in_progress' || status === 'completed' || status === 'implemented') ? {
          co2: (10000 + (i * 5000) % 100000) * (0.3 + (i * 0.05)),
          fuel: (5000000 + (i * 1000000) % 50000000) * (0.3 + (i * 0.05)),
          cost: (1000000 + (i * 500000) % 20000000) * (0.3 + (i * 0.05))
        } : undefined,
        implementationCost: 1000000 + (i * 2000000) % 10000000,
        paybackPeriod: 1 + (i % 8),
        progress: status === 'proposed' ? 0 : status === 'completed' || status === 'implemented' ? 100 : 30 + (i * 10) % 70,
        startDate: new Date(Date.now() - (i * 180) * 86400000).toISOString(),
        targetDate: new Date(Date.now() + ((i % 5) + 1) * 365 * 86400000).toISOString(),
        responsible: responsible[i]
      }
    })
    setOptimizations(opts)
  }

  const initializeOffsetPortfolio = () => {
    const projectNames = [
      'Amazon Rainforest Preservation', 'Texas Wind Farm', 'Solar Power India', 'Ocean Conservation Project',
      'Borneo Reforestation', 'Norway Hydroelectric', 'Kenya Clean Cooking', 'Brazil Biogas Project',
      'China Solar Farm', 'Australia Land Restoration', 'Indonesia Peatland Protection', 'Canada Forest Management',
      'Chile Geothermal Energy', 'South Africa Wind Farm', 'Philippines Mangrove Restoration', 'India Biomass Energy',
      'Colombia Biodiversity Project', 'Turkey Solar Park', 'Vietnam Hydro Project', 'Mexico Wind Energy',
      'Peru Rainforest Protection', 'Thailand Solar Initiative', 'Malaysia Carbon Sequestration', 'Argentina Wind Farm',
      'Nigeria Renewable Energy', 'Bangladesh Solar Home Systems', 'Pakistan Biogas Initiative', 'Ethiopia Clean Energy',
      'Ghana Forest Project', 'Tanzania Wind Power'
    ]
    const projectTypes: ('reforestation' | 'renewable_energy' | 'waste_management' | 'blue_carbon' | 'biochar')[] = [
      'reforestation', 'renewable_energy', 'renewable_energy', 'blue_carbon',
      'reforestation', 'renewable_energy', 'waste_management', 'biochar',
      'renewable_energy', 'reforestation', 'blue_carbon', 'reforestation',
      'renewable_energy', 'renewable_energy', 'blue_carbon', 'biochar',
      'reforestation', 'renewable_energy', 'renewable_energy', 'renewable_energy',
      'reforestation', 'renewable_energy', 'reforestation', 'renewable_energy',
      'renewable_energy', 'renewable_energy', 'biochar', 'renewable_energy',
      'reforestation', 'renewable_energy'
    ]
    const locations = [
      'Amazon, Brazil', 'Texas, USA', 'Rajasthan, India', 'Pacific Ocean',
      'Borneo, Indonesia', 'Western Norway', 'Rural Kenya', 'São Paulo, Brazil',
      'Gansu, China', 'Western Australia', 'Sumatra, Indonesia', 'British Columbia, Canada',
      'Northern Chile', 'Western Cape, South Africa', 'Palawan, Philippines', 'Punjab, India',
      'Chocó, Colombia', 'Ankara, Turkey', 'Mekong Delta, Vietnam', 'Oaxaca, Mexico',
      'Madre de Dios, Peru', 'Chiang Mai, Thailand', 'Sarawak, Malaysia', 'Patagonia, Argentina',
      'Lagos, Nigeria', 'Dhaka, Bangladesh', 'Punjab, Pakistan', 'Addis Ababa, Ethiopia',
      'Ashanti, Ghana', 'Dodoma, Tanzania'
    ]
    const certifications = [
      'VCS, CCBS', 'Gold Standard', 'VCS', 'VCS, Blue Carbon',
      'VCS, CCBS', 'Gold Standard', 'CDM', 'Gold Standard',
      'VCS', 'VCS, CCBS', 'VCS, Blue Carbon', 'VCS',
      'Gold Standard', 'VCS', 'VCS, Blue Carbon', 'Gold Standard',
      'VCS, CCBS', 'VCS', 'CDM', 'VCS',
      'VCS, CCBS', 'VCS', 'VCS, CCBS', 'Gold Standard',
      'CDM', 'CDM', 'Gold Standard', 'CDM',
      'VCS, CCBS', 'VCS'
    ]
    const coBenefits = [
      ['Biodiversity Conservation', 'Community Development', 'Indigenous Rights'],
      ['Clean Energy', 'Job Creation', 'Energy Independence'],
      ['Clean Energy', 'Rural Development', 'Technology Transfer'],
      ['Marine Biodiversity', 'Coastal Protection', 'Sustainable Fisheries'],
      ['Biodiversity Conservation', 'Indigenous Rights', 'Forest Protection'],
      ['Clean Energy', 'Carbon Storage', 'Hydrological Benefits'],
      ['Health Benefits', 'Reduced Deforestation', 'Community Empowerment'],
      ['Waste Reduction', 'Methane Capture', 'Soil Improvement'],
      ['Clean Energy', 'Air Quality', 'Job Creation'],
      ['Biodiversity', 'Soil Restoration', 'Water Conservation'],
      ['Coastal Protection', 'Biodiversity', 'Fisheries Support'],
      ['Sustainable Forestry', 'Biodiversity', 'Carbon Storage'],
      ['Clean Energy', 'Grid Stability', 'Job Creation'],
      ['Clean Energy', 'Rural Electrification', 'Technology Transfer'],
      ['Biodiversity', 'Coastal Protection', 'Community Development'],
      ['Agricultural Benefits', 'Waste Reduction', 'Rural Development'],
      ['Biodiversity', 'Water Resources', 'Community Development'],
      ['Clean Energy', 'Job Creation', 'Technology Transfer'],
      ['Clean Energy', 'Grid Integration', 'Economic Development'],
      ['Clean Energy', 'Economic Development', 'Technology Transfer'],
      ['Forest Protection', 'Biodiversity', 'Indigenous Rights'],
      ['Clean Energy', 'Job Creation', 'Rural Development'],
      ['Biodiversity', 'Carbon Storage', 'Water Conservation'],
      ['Clean Energy', 'Air Quality', 'Job Creation'],
      ['Clean Energy', 'Rural Electrification', 'Health Benefits'],
      ['Waste Reduction', 'Clean Energy', 'Rural Development'],
      ['Clean Energy', 'Health Benefits', 'Economic Development'],
      ['Forest Protection', 'Biodiversity', 'Community Development'],
      ['Clean Energy', 'Job Creation', 'Grid Stability']
    ]

    const portfolio: OffsetPortfolio[] = Array.from({ length: 30 }, (_, i) => {
      const totalPurchased = 10000 + (i * 5000) % 100000
      const totalRetired = Math.floor(totalPurchased * (0.3 + (i * 0.02)))
      return {
        id: `off-${String(i + 1).padStart(3, '0')}`,
        projectName: projectNames[i],
        projectType: projectTypes[i],
        location: locations[i],
        certification: certifications[i],
        pricePerTonne: 8 + (i * 2) % 25,
        totalPurchased,
        totalSpent: totalPurchased * (8 + (i * 2) % 25),
        totalRetired,
        available: totalPurchased - totalRetired,
        vintage: 2020 + (i % 5),
        status: ['active', 'active', 'active', 'retired'][i % 4] as 'active' | 'retired' | 'expired',
        purchaseHistory: [
          { id: `p-${i * 10 + 1}`, date: new Date(Date.now() - (i * 30) * 86400000).toISOString(), quantity: Math.floor(totalPurchased * 0.5), price: 8 + (i * 2) % 25, totalCost: Math.floor(totalPurchased * 0.5) * (8 + (i * 2) % 25), retirementDate: i % 4 === 3 ? new Date(Date.now() - (i * 30 + 180) * 86400000).toISOString() : undefined },
          { id: `p-${i * 10 + 2}`, date: new Date(Date.now() - (i * 30 + 15) * 86400000).toISOString(), quantity: Math.floor(totalPurchased * 0.3), price: 8 + (i * 2) % 25, totalCost: Math.floor(totalPurchased * 0.3) * (8 + (i * 2) % 25), retirementDate: i % 4 === 3 ? new Date(Date.now() - (i * 30 + 195) * 86400000).toISOString() : undefined },
          { id: `p-${i * 10 + 3}`, date: new Date(Date.now() - (i * 30 + 7) * 86400000).toISOString(), quantity: Math.floor(totalPurchased * 0.2), price: 8 + (i * 2) % 25, totalCost: Math.floor(totalPurchased * 0.2) * (8 + (i * 2) % 25) }
        ],
        coBenefits: coBenefits[i],
        riskRating: ['low', 'low', 'medium', 'medium'][i % 4] as 'low' | 'medium' | 'high'
      }
    })
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
    setSustainabilityMetrics([...sustainabilityMetrics.map(m => ({ ...m, updatedAt: new Date().toISOString() }))])
    toast({ title: 'Data Refreshed', description: 'Sustainability data refreshed' })
  }

  const handleExportESGReports = () => {
    const headers = ['Report', 'Period', 'Score', 'Status']
    const rows = esgReports.map(r => [r.reportName, r.period, r.esgScore, r.status])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'esg-reports.csv'
    link.click()
    toast({ title: 'ESG Reports Exported', description: 'ESG reports exported to CSV' })
  }

  const handleExportOffsetPortfolio = () => {
    const headers = ['Project', 'Type', 'Credits', 'Price']
    const rows = offsetPortfolio.map(o => [o.projectName, o.type, o.credits, o.pricePerCredit])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'offset-portfolio.csv'
    link.click()
    toast({ title: 'Portfolio Exported', description: 'Offset portfolio exported to CSV' })
  }

  const handleExportSustainabilityData = () => {
    const headers = ['Metric', 'Value', 'Unit', 'Date']
    const rows = sustainabilityMetrics.map(m => [m.metricName, m.value, m.unit, m.date])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'sustainability-data.csv'
    link.click()
    toast({ title: 'Data Exported', description: 'Sustainability data exported to CSV' })
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
        <div className="flex items-center flex-wrap gap-2">
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
              <div className="overflow-y-auto h-96">
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
                          <div className="flex items-center flex-wrap gap-2">
                            {getStatusBadge(report.status)}
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedReport(report); setShowReportDetails(true) }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
              </div>
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
              <div className="overflow-y-auto h-96">
                <div className="space-y-4">
                  {optimizations.map((opt) => (
                    <Card key={opt.id} className="enterprise-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center flex-wrap gap-2">
                              <CardTitle className="text-base">{opt.name}</CardTitle>
                              {getPriorityBadge(opt.priority)}
                            </div>
                            <CardDescription className="text-xs mt-1">
                              {opt.type.replace('_', ' ')} | {opt.responsible}
                            </CardDescription>
                          </div>
                          <div className="flex items-center flex-wrap gap-2">
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs p-2 bg-secondary/20 rounded-sm">
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
              </div>
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
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1100px]">
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
                          <div className="flex items-center flex-wrap gap-1">
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
              </div>
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
                {Array.from({ length: 30 }, (_, i) => {
                  const types = ['fleet', 'fuel', 'operations', 'ground']
                  const statuses = ['active', 'active', 'active', 'planned']
                  const initiativeNames = [
                    'Fleet Modernization', 'Sustainable Aviation Fuel', 'Weight Reduction', 'Electric Ground Equipment',
                    'Route Optimization', 'Waste Recycling', 'Water Conservation', 'Energy Efficiency',
                    'Solar Installations', 'Carbon Offsetting', 'Biodiversity Protection', 'Community Engagement',
                    'Employee Training', 'Supply Chain Sustainability', 'Paperless Operations', 'Eco-friendly Catering',
                    'Green Building Design', 'Renewable Energy Procurement', 'Sustainable Procurement', 'Noise Reduction',
                    'Air Quality Improvement', 'Habitat Restoration', 'Climate Adaptation', 'Circular Economy',
                    'Sustainable Packaging', 'Green Logistics', 'Eco-tourism Partnerships', 'Carbon-neutral Operations',
                    'Sustainable Agriculture Sourcing', 'Marine Conservation', 'Urban Greening', 'Sustainable Water Management'
                  ]
                  const type = types[i % 4]
                  return (
                    <div key={i} className="p-4 bg-secondary/30 rounded-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-wrap gap-2">
                          {type === 'fleet' && <Plane className="h-5 w-5 text-blue-600" />}
                          {type === 'fuel' && <Droplets className="h-5 w-5 text-blue-600" />}
                          {type === 'operations' && <Zap className="h-5 w-5 text-yellow-600" />}
                          {type === 'ground' && <Recycle className="h-5 w-5 text-green-600" />}
                          <span className="font-medium">{initiativeNames[i]}</span>
                        </div>
                        <Badge variant={statuses[i % 4] === 'active' ? 'default' : 'secondary'} className="capitalize">
                          {statuses[i % 4]}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Fuel:</span>
                          <span className="ml-1 font-medium">{(5000 + (i * 2000)).toLocaleString()}L</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CO2:</span>
                          <span className="ml-1 font-medium text-green-600">{(10000 + (i * 3000)).toLocaleString()}t</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Savings:</span>
                          <span className="ml-1 font-medium">${(1 + (i * 0.5)).toFixed(1)}M</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span>{statuses[i % 4] === 'planned' ? 0 : 30 + (i * 2) % 70}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 transition-all" style={{ width: `${statuses[i % 4] === 'planned' ? 0 : 30 + (i * 2) % 70}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                {Array.from({ length: 30 }, (_, i) => {
                  const targetNames = [
                    'Fuel Efficiency', 'CO2 Reduction', 'Renewable Energy', 'Waste Recycling', 'Board Diversity',
                    'Water Usage Reduction', 'Employee Training', 'Community Investment', 'Supply Chain Sustainability',
                    'Gender Equality', 'Ethics Compliance', 'Risk Management', 'Data Privacy', 'Anti-Corruption',
                    'Biodiversity Protection', 'Air Quality', 'Noise Reduction', 'Paper Usage Reduction',
                    'Single-use Plastic Elimination', 'Sustainable Sourcing', 'Carbon Neutrality', 'Employee Engagement',
                    'Customer Satisfaction', 'Supplier Diversity', 'Local Community Support', 'Green Building Certification',
                    'Circular Economy', 'Climate Resilience', 'Human Rights', 'Transparency Reporting'
                  ]
                  const units = ['L/100km', '%', '%', '%', '%', 'kL/pax', 'hrs/employee', '$M', '%',
                    '%', '%', '%', '%', '%', 'ha', 'µg/m³', 'dB', 'tonnes',
                    'tonnes', '%', 'tonnes', '%', '%', '%', '$M', 'Level',
                    '%', 'Level', 'Score', '%']
                  const colors = ['blue', 'green', 'yellow', 'purple', 'pink', 'cyan', 'orange', 'teal', 'indigo',
                    'red', 'lime', 'amber', 'violet', 'rose', 'emerald', 'sky', 'fuchsia',
                    'sage', 'coral', 'mint', 'gold', 'lavender', 'peach', 'bronze', 'silver',
                    'platinum', 'diamond', 'crystal', 'pearl']
                  const current = 20 + (i * 3) % 80
                  const target = 50 + (i * 5) % 50
                  const onTrack = current >= target
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{targetNames[i]}</span>
                        <span className="text-sm text-muted-foreground">Target: 202{4 + (i % 6)}</span>
                      </div>
                      <div className="flex items-center flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="h-4 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all bg-${colors[i % colors.length]}-600`}
                              style={{ width: `${Math.min((current / target) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{current}{units[i]}</span>
                          <span className="text-muted-foreground mx-2">/</span>
                          <span className="text-muted-foreground">{target}{units[i]}</span>
                        </div>
                        <Badge variant={onTrack ? 'default' : 'secondary'}>
                          {onTrack ? 'On Track' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
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
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ESG Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="space-y-4 py-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-sm">
                  <h4 className="font-medium mb-3 flex items-center flex-wrap gap-2">
                    <Globe className="h-4 w-4" />
                    Environmental
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                  <h4 className="font-medium mb-3 flex items-center flex-wrap gap-2">
                    <Users className="h-4 w-4" />
                    Social
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
                  <h4 className="font-medium mb-3 flex items-center flex-wrap gap-2">
                    <Building2 className="h-4 w-4" />
                    Governance
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
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
            </div>
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
              const printContent = `
                <html><head><title>ESG Report ${periodLabel}</title>
                <style>body { font-family: Arial; padding: 20px; }</style></head><body>
                  <h1>ESG Report - ${periodLabel}</h1>
                  <p><strong>ESG Score:</strong> ${Math.round(esgScore)}%</p>
                  <p><strong>CO2 Emissions:</strong> ${selectedReport.environmental.co2Emissions}</p>
                  <p><strong>Employees:</strong> ${selectedReport.social.employees}</p>
                </body></html>
              `
              const win = window.open('', '_blank')
              if (win) {
                win.document.write(printContent)
                win.document.close()
                win.print()
              }
              toast({ title: 'Report Downloaded', description: `ESG Report: ${periodLabel}, Score: ${Math.round(esgScore)}%` })
            }}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Optimization Details Dialog */}
      <Dialog open={showOptimizationDetails} onOpenChange={setShowOptimizationDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Carbon Optimization Details</DialogTitle>
          </DialogHeader>
          {selectedOptimization && (
            <div className="space-y-4 py-4">
              <div className="flex items-center flex-wrap gap-2">
                {getPriorityBadge(selectedOptimization.priority)}
                {getStatusBadge(selectedOptimization.status)}
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1">{selectedOptimization.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
