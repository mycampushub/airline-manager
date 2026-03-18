'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
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
  DollarSign,
  Brain,
  Zap,
  LineChart,
  Settings,
  Play,
  Download,
  Calendar,
  Users,
  Plane,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp as TrendUpIcon,
  Building2,
  Globe,
  Store,
  Briefcase,
  Award,
  Star,
  Medal,
  Crown,
  Gem,
  TrendingDown as TrendDownIcon,
  Percent,
  CreditCard,
  MapPin,
  User,
  Heart,
  Map,
  Wrench,
  Fuel,
  Clock as ClockIcon,
  Gauge,
  UserCheck,
  Timer,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Bell,
  BellRing,
  X,
  FileText,
  ArrowLeft,
  ArrowRight,
  Filter,
  XCircle
} from 'lucide-react'
import { useAirlineStore, AIModel, AIPrediction } from '@/lib/store'

export default function AnalyticsModule() {
  const { kpiDashboard, pnrs, tickets, flightInstances, aiModels, aiPredictions, generatePrediction } = useAirlineStore()
  const { toast } = useToast()
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false)
  const [showDashboardConfigDialog, setShowDashboardConfigDialog] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<string>('JFK-LHR')
  const [predictionPeriod, setPredictionPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  // KPI Alerts Data
  const kpiAlerts = [
    { id: 'alert-1', type: 'warning', kpi: 'On-Time Performance', currentValue: 92.8, threshold: 95, message: 'On-time performance fell below 95% threshold on LAX-TYO route', time: '10 min ago', status: 'active', route: 'LAX-TYO', trend: 'declining' },
    { id: 'alert-2', type: 'critical', kpi: 'Load Factor', currentValue: 75.2, threshold: 80, message: 'Load factor below 80% threshold on SFO-HKG route', time: '25 min ago', status: 'active', route: 'SFO-HKG', trend: 'declining' },
    { id: 'alert-3', type: 'info', kpi: 'Revenue', currentValue: 4250000, threshold: 4000000, message: 'Revenue target exceeded by 6.25%', time: '1 hour ago', status: 'acknowledged', route: 'All', trend: 'increasing' },
    { id: 'alert-4', type: 'warning', kpi: 'Cancellation Rate', currentValue: 3.79, threshold: 3.0, message: 'OTA cancellation rate above 3% threshold', time: '2 hours ago', status: 'active', route: 'All Channels', trend: 'increasing' },
    { id: 'alert-5', type: 'critical', kpi: 'Crew Fatigue', currentValue: 6.8, threshold: 5.0, message: 'Flight Attendant fatigue risk above 5% threshold', time: '3 hours ago', status: 'resolved', route: 'All Bases', trend: 'stable' },
    { id: 'alert-6', type: 'info', kpi: 'Fuel Efficiency', currentValue: 2.75, threshold: 2.90, message: 'A320 fleet fuel efficiency improved by 5.2%', time: '4 hours ago', status: 'acknowledged', route: 'A320 Fleet', trend: 'improving' }
  ]
  
  const [alerts, setAlerts] = useState(kpiAlerts)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  // Sample AI Models data
  const sampleAIModels: AIModel[] = [
    {
      id: 'model-1',
      name: 'Demand Forecast Engine',
      type: 'demand_forecast',
      status: 'deployed',
      version: 'v2.3.1',
      accuracy: 94.2,
      lastTrained: '2024-01-15',
      nextTraining: '2024-02-15',
      features: ['historical_bookings', 'seasonality', 'events', 'competition', 'pricing', 'weather'],
      performance: {
        precision: 0.93,
        recall: 0.91,
        f1Score: 0.92,
        auc: 0.96
      }
    },
    {
      id: 'model-2',
      name: 'Dynamic Pricing Optimizer',
      type: 'pricing',
      status: 'deployed',
      version: 'v1.8.4',
      accuracy: 91.7,
      lastTrained: '2024-01-10',
      nextTraining: '2024-02-10',
      features: ['demand', 'competition', 'seasonality', 'inventory', 'lead_time', 'cabin_class'],
      performance: {
        precision: 0.89,
        recall: 0.92,
        f1Score: 0.90,
        auc: 0.94
      }
    },
    {
      id: 'model-3',
      name: 'Revenue Anomaly Detector',
      type: 'revenue_anomaly',
      status: 'deployed',
      version: 'v1.2.0',
      accuracy: 96.5,
      lastTrained: '2024-01-08',
      nextTraining: '2024-02-08',
      features: ['revenue_patterns', 'route_metrics', 'seasonality', 'external_factors'],
      performance: {
        precision: 0.95,
        recall: 0.96,
        f1Score: 0.95,
        auc: 0.98
      }
    },
    {
      id: 'model-4',
      name: 'Predictive Maintenance',
      type: 'maintenance_predictive',
      status: 'training',
      version: 'v0.9.2-beta',
      accuracy: 87.3,
      lastTrained: '2024-01-05',
      nextTraining: '2024-01-20',
      features: ['component_age', 'flight_hours', 'maintenance_history', 'environmental', 'operational_data'],
      performance: {
        precision: 0.85,
        recall: 0.88,
        f1Score: 0.86,
        auc: 0.91
      }
    },
    {
      id: 'model-5',
      name: 'Fraud Detection System',
      type: 'fraud_detection',
      status: 'deployed',
      version: 'v2.1.3',
      accuracy: 98.2,
      lastTrained: '2024-01-12',
      nextTraining: '2024-02-12',
      features: ['booking_patterns', 'payment_behavior', 'user_behavior', 'velocity_checks', 'ip_analysis'],
      performance: {
        precision: 0.97,
        recall: 0.98,
        f1Score: 0.97,
        auc: 0.99
      }
    },
    {
      id: 'model-6',
      name: 'Customer Personalization',
      type: 'personalization',
      status: 'deployed',
      version: 'v1.5.2',
      accuracy: 89.6,
      lastTrained: '2024-01-14',
      nextTraining: '2024-02-14',
      features: ['travel_history', 'preferences', 'loyalty_tier', 'booking_patterns', 'demographics'],
      performance: {
        precision: 0.88,
        recall: 0.90,
        f1Score: 0.89,
        auc: 0.93
      }
    }
  ]

  // Sample predictions
  const samplePredictions: AIPrediction[] = [
    {
      modelId: 'model-1',
      modelName: 'Demand Forecast Engine',
      type: 'demand_forecast',
      timestamp: '2024-01-18T10:30:00Z',
      input: { route: 'JFK-LHR', period: '30d', cabin: 'all' },
      output: { predictedLoad: 87.5, predictedRevenue: 4250000, confidence: 94, trend: 'increasing' },
      confidence: 94,
      recommendation: 'Increase pricing by 8-12% for next 30 days due to high demand forecast',
      implemented: true,
      outcome: 'Revenue increased by 10.2% vs forecast'
    },
    {
      modelId: 'model-2',
      modelName: 'Dynamic Pricing Optimizer',
      type: 'pricing',
      timestamp: '2024-01-18T09:15:00Z',
      input: { route: 'LAX-TYO', fareClass: 'Y', daysToDeparture: 14 },
      output: { optimalPrice: 850, demandElasticity: -1.2, competitorPrice: 820 },
      confidence: 91,
      recommendation: 'Set optimal price at $850, 3.7% above competitor due to higher service quality',
      implemented: true,
      outcome: 'Achieved 89% load factor at $850 average fare'
    },
    {
      modelId: 'model-5',
      modelName: 'Fraud Detection System',
      type: 'fraud_detection',
      timestamp: '2024-01-18T08:45:00Z',
      input: { bookingId: 'PNR-ABC123', paymentMethod: 'credit_card', ip: '192.168.1.100' },
      output: { riskScore: 0.15, riskLevel: 'low', flaggedPatterns: [] },
      confidence: 98,
      recommendation: 'Proceed with booking - low risk detected',
      implemented: true,
      outcome: 'Booking processed successfully'
    }
  ]

  const routeProfitabilityData = [
    { route: 'JFK-LHR', flights: 120, pax: 21500, lf: 89.5, revenue: 4250000, costs: 3400000, profit: 850000, margin: 20, predictedLF: 91.2, predictedRevenue: 4580000, growth: 12.5 },
    { route: 'JFK-PAR', flights: 95, pax: 16800, lf: 86.2, revenue: 3120000, costs: 2540000, profit: 580000, margin: 18.6, predictedLF: 88.5, predictedRevenue: 3380000, growth: 8.3 },
    { route: 'LAX-TYO', flights: 85, pax: 14200, lf: 82.8, revenue: 3800000, costs: 3180000, profit: 620000, margin: 16.3, predictedLF: 85.0, predictedRevenue: 4020000, growth: -2.1 },
    { route: 'SIN-SYD', flights: 110, pax: 18900, lf: 84.5, revenue: 2980000, costs: 2530000, profit: 450000, margin: 15.1, predictedLF: 86.8, predictedRevenue: 3180000, growth: 5.7 },
    { route: 'DXB-LHR', flights: 100, pax: 17800, lf: 87.2, revenue: 3560000, costs: 2880000, profit: 680000, margin: 19.1, predictedLF: 89.0, predictedRevenue: 3850000, growth: 10.2 },
    { route: 'SFO-HKG', flights: 75, pax: 12500, lf: 79.3, revenue: 2650000, costs: 2380000, profit: 270000, margin: 10.2, predictedLF: 82.5, predictedRevenue: 2850000, growth: 3.4 },
    { route: 'FRA-JFK', flights: 90, pax: 15600, lf: 83.7, revenue: 2890000, costs: 2420000, profit: 470000, margin: 16.3, predictedLF: 85.9, predictedRevenue: 3090000, growth: 6.8 }
  ]

  // Enhanced Agent Performance Data
  const agentPerformanceData = [
    {
      agentId: 'agent-1',
      agentCode: 'AGT-001',
      agentName: 'Global Travel Partners',
      type: 'iata',
      tier: 'platinum',
      bookings: 2847,
      passengers: 8541,
      revenue: 4250000,
      commission: 255000,
      commissionRate: 6.0,
      avgBookingValue: 1493,
      cancellationRate: 2.3,
      noShowRate: 1.8,
      growth: 15.2,
      yoyGrowth: 12.8,
      topRoutes: ['JFK-LHR', 'LAX-TYO', 'DXB-LHR'],
      lastBooking: '2024-01-18',
      creditUtilization: 78,
      ranking: 1
    },
    {
      agentId: 'agent-2',
      agentCode: 'AGT-002',
      agentName: 'Corporate Travel Solutions',
      type: 'corporate',
      tier: 'gold',
      bookings: 2156,
      passengers: 6468,
      revenue: 3180000,
      commission: 159000,
      commissionRate: 5.0,
      avgBookingValue: 1475,
      cancellationRate: 1.9,
      noShowRate: 1.2,
      growth: 12.5,
      yoyGrowth: 10.3,
      topRoutes: ['JFK-PAR', 'FRA-JFK', 'SIN-SYD'],
      lastBooking: '2024-01-18',
      creditUtilization: 65,
      ranking: 2
    },
    {
      agentId: 'agent-3',
      agentCode: 'AGT-003',
      agentName: 'Flight Center International',
      type: 'ota',
      tier: 'gold',
      bookings: 1923,
      passengers: 5769,
      revenue: 2890000,
      commission: 144500,
      commissionRate: 5.0,
      avgBookingValue: 1503,
      cancellationRate: 3.1,
      noShowRate: 2.5,
      growth: 8.7,
      yoyGrowth: 7.2,
      topRoutes: ['SFO-HKG', 'LAX-TYO', 'JFK-LHR'],
      lastBooking: '2024-01-17',
      creditUtilization: 82,
      ranking: 3
    },
    {
      agentId: 'agent-4',
      agentCode: 'AGT-004',
      agentName: 'Worldwide Travel Net',
      type: 'iata',
      tier: 'silver',
      bookings: 1654,
      passengers: 4962,
      revenue: 2450000,
      commission: 122500,
      commissionRate: 5.0,
      avgBookingValue: 1481,
      cancellationRate: 2.8,
      noShowRate: 2.1,
      growth: 6.4,
      yoyGrowth: 5.8,
      topRoutes: ['DXB-LHR', 'JFK-PAR', 'SIN-SYD'],
      lastBooking: '2024-01-17',
      creditUtilization: 55,
      ranking: 4
    },
    {
      agentId: 'agent-5',
      agentCode: 'AGT-005',
      agentName: 'Sky High Travels',
      type: 'tmc',
      tier: 'silver',
      bookings: 1432,
      passengers: 4296,
      revenue: 2120000,
      commission: 106000,
      commissionRate: 5.0,
      avgBookingValue: 1481,
      cancellationRate: 2.5,
      noShowRate: 1.9,
      growth: 4.8,
      yoyGrowth: 3.9,
      topRoutes: ['JFK-LHR', 'FRA-JFK', 'LAX-TYO'],
      lastBooking: '2024-01-16',
      creditUtilization: 48,
      ranking: 5
    },
    {
      agentId: 'agent-6',
      agentCode: 'AGT-006',
      agentName: 'Direct Bookings',
      type: 'direct',
      tier: 'standard',
      bookings: 12543,
      passengers: 37629,
      revenue: 15600000,
      commission: 0,
      commissionRate: 0,
      avgBookingValue: 1243,
      cancellationRate: 4.2,
      noShowRate: 3.5,
      growth: 18.5,
      yoyGrowth: 15.2,
      topRoutes: ['JFK-LHR', 'LAX-TYO', 'JFK-PAR'],
      lastBooking: '2024-01-18',
      creditUtilization: 0,
      ranking: 6
    }
  ]

  // Channel performance summary
  const channelSummary = [
    { channel: 'direct', name: 'Direct Website', icon: Globe, revenue: 15600000, bookings: 12543, share: 52.3, growth: 18.5, color: 'blue' },
    { channel: 'agency', name: 'Travel Agencies', icon: Building2, revenue: 7420000, bookings: 5936, share: 24.9, growth: 10.2, color: 'green' },
    { channel: 'ota', name: 'Online Travel Agents', icon: Store, revenue: 4120000, bookings: 3296, share: 13.8, growth: 8.7, color: 'purple' },
    { channel: 'corporate', name: 'Corporate Accounts', icon: Briefcase, revenue: 1980000, bookings: 1584, share: 6.6, growth: 12.5, color: 'orange' },
    { channel: 'gds', name: 'GDS Connections', icon: MapPin, revenue: 720000, bookings: 576, share: 2.4, growth: 5.3, color: 'red' }
  ]

  // Passenger Analytics Data
  const passengerAnalytics = {
    demographics: [
      { segment: 'Business Travelers', count: 12543, percentage: 42, avgSpend: 1850, loyaltyTier: 'Gold/Platinum', growth: 12.5 },
      { segment: 'Leisure Travelers', count: 14287, percentage: 48, avgSpend: 980, loyaltyTier: 'Base/Silver', growth: 8.3 },
      { segment: 'VIP/High Value', count: 1856, percentage: 6, avgSpend: 4500, loyaltyTier: 'Platinum/Elite', growth: 15.2 },
      { segment: 'Student/Youth', count: 1143, percentage: 4, avgSpend: 650, loyaltyTier: 'Base', growth: 5.7 }
    ],
    loyaltyTiers: [
      { tier: 'Elite', members: 1250, revenue: 4500000, avgFlights: 18, retentionRate: 96.5, color: 'purple' },
      { tier: 'Platinum', members: 3450, revenue: 8750000, avgFlights: 14, retentionRate: 94.2, color: 'yellow' },
      { tier: 'Gold', members: 8750, revenue: 11200000, avgFlights: 10, retentionRate: 91.8, color: 'orange' },
      { tier: 'Silver', members: 15600, revenue: 9800000, avgFlights: 6, retentionRate: 87.5, color: 'gray' },
      { tier: 'Base', members: 28500, revenue: 6200000, avgFlights: 2, retentionRate: 72.3, color: 'blue' }
    ],
    travelPatterns: [
      { route: 'JFK-LHR', passengers: 21500, frequency: 'daily', avgStay: 7, purpose: 'Business 60% / Leisure 40%', growth: 12.5 },
      { route: 'LAX-TYO', passengers: 14200, frequency: 'daily', avgStay: 10, purpose: 'Business 45% / Leisure 55%', growth: -2.1 },
      { route: 'SIN-SYD', passengers: 18900, frequency: 'daily', avgStay: 5, purpose: 'Business 35% / Leisure 65%', growth: 5.7 },
      { route: 'DXB-LHR', passengers: 17800, frequency: 'daily', avgStay: 8, purpose: 'Business 50% / Leisure 50%', growth: 10.2 },
      { route: 'JFK-PAR', passengers: 16800, frequency: 'daily', avgStay: 6, purpose: 'Business 55% / Leisure 45%', growth: 8.3 }
    ],
    ancillaryPurchases: [
      { service: 'Seat Selection', purchases: 28500, revenue: 1425000, penetrationRate: 95, avgPrice: 50 },
      { service: 'Extra Baggage', purchases: 12500, revenue: 1875000, penetrationRate: 42, avgPrice: 150 },
      { service: 'Meal Upgrades', purchases: 18500, revenue: 555000, penetrationRate: 62, avgPrice: 30 },
      { service: 'Lounge Access', purchases: 4500, revenue: 1350000, penetrationRate: 15, avgPrice: 300 },
      { service: 'Travel Insurance', purchases: 22000, revenue: 880000, penetrationRate: 73, avgPrice: 40 }
    ]
  }

  // Aircraft Utilization Data
  const aircraftUtilization = {
    fleet: [
      { registration: 'N12345', type: 'B737-800', utilizationRate: 92.5, blockHours: 2850, cycles: 1240, fuelEfficiency: 2.8, status: 'active', maintenanceDue: '2024-02-15', routes: 15 },
      { registration: 'N67890', type: 'B737-800', utilizationRate: 88.3, blockHours: 2680, cycles: 1180, fuelEfficiency: 2.9, status: 'active', maintenanceDue: '2024-02-28', routes: 14 },
      { registration: 'N24680', type: 'A320-200', utilizationRate: 95.2, blockHours: 2950, cycles: 1320, fuelEfficiency: 2.7, status: 'active', maintenanceDue: '2024-03-01', routes: 16 },
      { registration: 'N13579', type: 'A320-200', utilizationRate: 90.1, blockHours: 2720, cycles: 1210, fuelEfficiency: 2.8, status: 'maintenance', maintenanceDue: '2024-01-20', routes: 14 },
      { registration: 'N97531', type: 'B777-300ER', utilizationRate: 94.8, blockHours: 3100, cycles: 860, fuelEfficiency: 3.2, status: 'active', maintenanceDue: '2024-02-20', routes: 8 },
      { registration: 'N86420', type: 'A350-900', utilizationRate: 96.5, blockHours: 3250, cycles: 920, fuelEfficiency: 3.0, status: 'active', maintenanceDue: '2024-03-10', routes: 9 }
    ],
    byType: [
      { type: 'B737-800', count: 2, avgUtilization: 90.4, totalBlockHours: 5530, fuelEfficiency: 2.85, reliability: 98.5 },
      { type: 'A320-200', count: 2, avgUtilization: 92.7, totalBlockHours: 5670, fuelEfficiency: 2.75, reliability: 99.1 },
      { type: 'B777-300ER', count: 1, avgUtilization: 94.8, totalBlockHours: 3100, fuelEfficiency: 3.2, reliability: 97.8 },
      { type: 'A350-900', count: 1, avgUtilization: 96.5, totalBlockHours: 3250, fuelEfficiency: 3.0, reliability: 99.3 }
    ],
    metrics: {
      totalFleet: 6,
      avgUtilization: 93.2,
      totalBlockHours: 17550,
      totalCycles: 6730,
      avgFuelEfficiency: 2.89,
      onTimePerformance: 94.5,
      reliability: 98.7,
      maintenanceDowntime: 1.2
    }
  }

  // Crew Utilization Data
  const crewUtilization = {
    summary: {
      totalCrew: 485,
      activeCrew: 445,
      onLeave: 25,
      inTraining: 15,
      avgDutyHours: 68.5,
      avgFlightHours: 52.3,
      utilizationRate: 87.2
    },
    byPosition: [
      { position: 'Captain', count: 85, avgHours: 58, utilization: 92.5, qualificationRate: 98.8, fatigueRisk: 3.2 },
      { position: 'First Officer', count: 92, avgHours: 54, utilization: 89.3, qualificationRate: 96.5, fatigueRisk: 4.1 },
      { position: 'Purser', count: 78, avgHours: 62, utilization: 88.7, qualificationRate: 95.2, fatigueRisk: 5.3 },
      { position: 'Flight Attendant', count: 230, avgHours: 65, utilization: 85.4, qualificationRate: 94.8, fatigueRisk: 6.8 }
    ],
    topPerformers: [
      { name: 'John Smith', position: 'Captain', employeeId: 'EMP-001', base: 'JFK', hoursFlown: 285, onTime: 99.2, rating: 4.9 },
      { name: 'Sarah Johnson', position: 'Purser', employeeId: 'EMP-002', base: 'LAX', hoursFlown: 268, onTime: 98.7, rating: 4.8 },
      { name: 'Michael Chen', position: 'Captain', employeeId: 'EMP-003', base: 'SFO', hoursFlown: 275, onTime: 97.8, rating: 4.7 },
      { name: 'Emily Davis', position: 'First Officer', employeeId: 'EMP-004', base: 'ORD', hoursFlown: 242, onTime: 98.5, rating: 4.7 }
    ]
  }

  // Cancellation Analysis Data
  const cancellationAnalysis = {
    summary: {
      totalBookings: 29835,
      totalCancellations: 842,
      cancellationRate: 2.8,
      totalRefunds: 2840000,
      avgRefund: 3373,
      trends: [
        { period: 'Jan', bookings: 28500, cancellations: 780, rate: 2.74 },
        { period: 'Feb', bookings: 29200, cancellations: 815, rate: 2.79 },
        { period: 'Mar', bookings: 29835, cancellations: 842, rate: 2.82 }
      ]
    },
    byReason: [
      { reason: 'Schedule Change', count: 245, percentage: 29.1, avgRefundAmount: 3200, trend: 'increasing' },
      { reason: 'Personal Reasons', count: 285, percentage: 33.8, avgRefundAmount: 2800, trend: 'stable' },
      { reason: 'Health Emergency', count: 78, percentage: 9.3, avgRefundAmount: 3500, trend: 'stable' },
      { reason: 'Price Found Lower', count: 134, percentage: 15.9, avgRefundAmount: 3100, trend: 'increasing' },
      { reason: 'Work Conflict', count: 100, percentage: 11.9, avgRefundAmount: 3400, trend: 'decreasing' }
    ],
    byRoute: [
      { route: 'JFK-LHR', bookings: 5420, cancellations: 142, rate: 2.62, revenue: 425000, reason: 'Schedule Change' },
      { route: 'LAX-TYO', bookings: 3850, cancellations: 128, rate: 3.32, revenue: 398000, reason: 'Price Found Lower' },
      { route: 'JFK-PAR', bookings: 4100, cancellations: 115, rate: 2.80, revenue: 345000, reason: 'Personal Reasons' },
      { route: 'SIN-SYD', bookings: 4600, cancellations: 135, rate: 2.93, revenue: 425000, reason: 'Schedule Change' },
      { route: 'DXB-LHR', bookings: 4450, cancellations: 120, rate: 2.70, revenue: 385000, reason: 'Health Emergency' },
      { route: 'SFO-HKG', bookings: 3700, cancellations: 115, rate: 3.11, revenue: 358000, reason: 'Work Conflict' },
      { route: 'FRA-JFK', bookings: 3715, cancellations: 87, rate: 2.34, revenue: 282000, reason: 'Personal Reasons' }
    ],
    byChannel: [
      { channel: 'Direct', bookings: 12543, cancellations: 420, rate: 3.35, avgRefund: 3100 },
      { channel: 'Agencies', bookings: 5936, cancellations: 145, rate: 2.44, avgRefund: 3600 },
      { channel: 'OTA', bookings: 3296, cancellations: 125, rate: 3.79, avgRefund: 2900 },
      { channel: 'Corporate', bookings: 1584, cancellations: 85, rate: 5.37, avgRefund: 4200 },
      { channel: 'GDS', bookings: 576, cancellations: 67, rate: 11.63, avgRefund: 3800 }
    ],
    predictions: [
      { route: 'LAX-TYO', currentRate: 3.32, predictedRate: 3.85, confidence: 87, driver: 'Competition Pricing', recommendedAction: 'Monitor competitive pricing, consider price matching' },
      { route: 'SFO-HKG', currentRate: 3.11, predictedRate: 3.45, confidence: 82, driver: 'Seasonal Demand Drop', recommendedAction: 'Add flexible fare options, enhance cancellation policies' },
      { route: 'GDS Channel', currentRate: 11.63, predictedRate: 12.50, confidence: 79, driver: 'B2B Booking Patterns', recommendedAction: 'Review GDS contract terms, consider bulk booking incentives' }
    ]
  }

  // Demand Trend Analysis Data
  const demandTrends = {
    overall: {
      totalDemand: 29835,
      growthRate: 12.5,
      demandIndex: 112.5,
      trend: 'increasing'
    },
    byRoute: [
      { route: 'JFK-LHR', current: 21500, previous: 19100, growth: 12.6, trend: 'up', seasonality: 'peak', next30d: '+15.2%', confidence: 94 },
      { route: 'LAX-TYO', current: 14200, previous: 14500, growth: -2.1, trend: 'down', seasonality: 'off-peak', next30d: '-1.5%', confidence: 89 },
      { route: 'SIN-SYD', current: 18900, previous: 17880, growth: 5.7, trend: 'up', seasonality: 'normal', next30d: '+8.3%', confidence: 91 },
      { route: 'DXB-LHR', current: 17800, previous: 16150, growth: 10.2, trend: 'up', seasonality: 'peak', next30d: '+12.0%', confidence: 93 },
      { route: 'JFK-PAR', current: 16800, previous: 15520, growth: 8.3, trend: 'up', seasonality: 'normal', next30d: '+9.5%', confidence: 92 },
      { route: 'SFO-HKG', current: 12500, previous: 12090, growth: 3.4, trend: 'up', seasonality: 'off-peak', next30d: '+4.2%', confidence: 87 },
      { route: 'FRA-JFK', current: 15600, previous: 14610, growth: 6.8, trend: 'up', seasonality: 'normal', next30d: '+7.8%', confidence: 90 }
    ],
    byCabin: [
      { cabin: 'Business', demand: 12543, growth: 15.2, utilization: 89.5, forecast: '+12.0%' },
      { cabin: 'Economy', demand: 14287, growth: 10.8, utilization: 87.2, forecast: '+8.5%' },
      { cabin: 'First', demand: 1856, growth: 18.5, utilization: 92.3, forecast: '+15.0%' }
    ],
    upcomingEvents: [
      { event: 'Summer Holidays', startDate: '2024-06-15', endDate: '2024-08-31', impact: 'high', affectedRoutes: ['JFK-LHR', 'DXB-LHR', 'SIN-SYD'], demandIncrease: '+25%' },
      { event: 'Olympic Games', startDate: '2024-07-26', endDate: '2024-08-11', impact: 'very-high', affectedRoutes: ['FRA-JFK', 'JFK-PAR'], demandIncrease: '+40%' },
      { event: 'Business Conference', startDate: '2024-03-25', endDate: '2024-03-28', impact: 'medium', affectedRoutes: ['JFK-LHR', 'SFO-HKG'], demandIncrease: '+15%' }
    ]
  }

  // Operational KPIs Data
  const operationalKPIs = {
    onTimePerformance: {
      overall: 94.5,
      byRoute: [
        { route: 'JFK-LHR', onTime: 96.2, delays: 12, avgDelay: 15 },
        { route: 'LAX-TYO', onTime: 92.8, delays: 18, avgDelay: 28 },
        { route: 'SIN-SYD', onTime: 95.5, delays: 10, avgDelay: 12 },
        { route: 'DXB-LHR', onTime: 93.1, delays: 15, avgDelay: 22 },
        { route: 'JFK-PAR', onTime: 94.8, delays: 11, avgDelay: 18 }
      ]
    },
    delayAnalysis: {
      totalDelays: 66,
      delayCodes: [
        { code: 'WX', description: 'Weather', count: 18, percentage: 27.3, avgMinutes: 45 },
        { code: 'MT', description: 'Maintenance', count: 12, percentage: 18.2, avgMinutes: 62 },
        { code: 'ATC', description: 'ATC/Flow Control', count: 15, percentage: 22.7, avgMinutes: 28 },
        { code: 'OPS', description: 'Operational', count: 10, percentage: 15.2, avgMinutes: 35 },
        { code: 'CX', description: 'Crew Issues', count: 6, percentage: 9.1, avgMinutes: 52 },
        { code: 'OT', description: 'Other', count: 5, percentage: 7.5, avgMinutes: 22 }
      ]
    },
    disruptionMetrics: {
      total: 8,
      byType: [
        { type: 'delay', count: 5, impact: 245, resolved: 4, avgResolutionTime: 45 },
        { type: 'cancellation', count: 1, impact: 180, resolved: 1, avgResolutionTime: 120 },
        { type: 'diversion', count: 2, impact: 320, resolved: 2, avgResolutionTime: 90 }
      ]
    }
  }

  const handleGeneratePrediction = async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const newPrediction = generatePrediction(selectedModel || 'model-1', {
      route: selectedRoute,
      period: predictionPeriod,
      timestamp: new Date().toISOString()
    })
    setIsGenerating(false)
    setPredictionDialogOpen(false)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      kpiDashboard,
      routeProfitability: routeProfitabilityData,
      agentPerformance: agentPerformanceData,
      operationalKPIs,
      cancellationAnalysis,
      demandTrends
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId))
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a))
  }

  // Additional handlers
  const handleCustomDashboard = () => {
    setShowDashboardConfigDialog(true)
    toast({ title: 'Dashboard Configuration', description: 'Customize your analytics dashboard' })
  }

  const handleExportTopAgents = () => {
    const headers = ['Agent', 'Bookings', 'Revenue', 'Growth']
    const rows = kpiDashboard.topAgents.map(a => [a.agentName, a.bookings, a.revenue, a.growth])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'top-agents.csv'
    link.click()
    toast({ title: 'Data Exported', description: 'Top agents data exported to CSV' })
  }

  const handleRetrainModels = () => {
    setIsGenerating(true)
    setTimeout(() => {
      // Update models in place - use aiModels directly
      toast({ title: 'Models Retrained', description: 'AI models have been retrained' })
      setIsGenerating(false)
    }, 2000)
  }

  const handleFilterAlerts = () => {
    toast({ title: 'Filter Applied', description: 'Alert filters applied' })
  }

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        handleRefresh()
      }, 30000) // Refresh every 30 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="h-4 w-4 text-purple-500" />
      case 'gold': return <Medal className="h-4 w-4 text-yellow-500" />
      case 'silver': return <Award className="h-4 w-4 text-gray-400" />
      default: return <Star className="h-4 w-4 text-blue-400" />
    }
  }

  const getTierBadge = (tier: string) => {
    const colors = {
      platinum: 'bg-purple-100 text-purple-700 border-purple-300',
      gold: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      silver: 'bg-gray-100 text-gray-700 border-gray-300',
      standard: 'bg-blue-100 text-blue-700 border-blue-300'
    }
    return (
      <Badge className={colors[tier as keyof typeof colors] || colors.standard} variant="outline">
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Business Intelligence</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time KPIs, Route Profitability, and AI-Powered Predictions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-sm">
              <Bell className={`h-4 w-4 ${alerts.filter(a => a.status === 'active').length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className="text-sm font-medium">{alerts.filter(a => a.status === 'active').length} Alerts</span>
            </div>
            <Button variant={autoRefresh ? 'default' : 'outline'} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto' : 'Auto-Refresh'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleCustomDashboard}>
            <Settings className="h-4 w-4 mr-2" />
            Custom Dashboard
          </Button>
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
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="routes">Route Analytics</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="passengers">Passenger Analytics</TabsTrigger>
          <TabsTrigger value="aircraft">Aircraft Utilization</TabsTrigger>
          <TabsTrigger value="crew">Crew Utilization</TabsTrigger>
          <TabsTrigger value="operations">Operational KPIs</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Notifications</TabsTrigger>
          <TabsTrigger value="cancellations">Cancellation & Trends</TabsTrigger>
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
              <CardDescription>Performance metrics with AI predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Flights</th>
                      <th>Passengers</th>
                      <th>Current LF</th>
                      <th>Predicted LF</th>
                      <th>Revenue</th>
                      <th>Costs</th>
                      <th>Profit</th>
                      <th>Margin</th>
                      <th>Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeProfitabilityData.map((item, i) => (
                      <tr key={i}>
                        <td className="font-medium">{item.route}</td>
                        <td className="text-sm">{item.flights}</td>
                        <td className="text-sm">{item.pax.toLocaleString()}</td>
                        <td className="text-sm">{item.lf}%</td>
                        <td className="text-sm text-blue-600 font-medium">{item.predictedLF}%</td>
                        <td className="text-sm font-medium">${item.revenue.toLocaleString()}</td>
                        <td className="text-sm text-muted-foreground">${item.costs.toLocaleString()}</td>
                        <td className="text-sm font-medium text-green-600">${item.profit.toLocaleString()}</td>
                        <td className="text-sm">{item.margin}%</td>
                        <td className={`text-sm ${item.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.growth >= 0 ? '+' : ''}{item.growth}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <div className="space-y-6">
            {/* Channel Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {channelSummary.map((channel) => {
                const Icon = channel.icon
                return (
                  <Card key={channel.channel} className="enterprise-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="p-2 bg-secondary rounded-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className={`text-xs ${channel.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {channel.growth >= 0 ? '+' : ''}{channel.growth}%
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">${(channel.revenue / 1000000).toFixed(1)}M</div>
                      <div className="text-xs text-muted-foreground">{channel.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{channel.bookings.toLocaleString()} bookings</div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-primary" style={{ width: `${channel.share}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Agent Performance Table */}
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Agent Channel Performance
                    </CardTitle>
                    <CardDescription>Detailed metrics by sales channel and agent</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportTopAgents}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Agent</th>
                        <th>Type</th>
                        <th>Tier</th>
                        <th>Bookings</th>
                        <th>Passengers</th>
                        <th>Revenue</th>
                        <th>Commission</th>
                        <th>Rate</th>
                        <th>Avg Booking</th>
                        <th>Canc. Rate</th>
                        <th>No-Show</th>
                        <th>Growth</th>
                        <th>YoY</th>
                        <th>Top Routes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentPerformanceData.map((agent) => (
                        <tr key={agent.agentId}>
                          <td className="text-center">
                            {agent.ranking <= 3 ? (
                              <Badge variant="default" className="gap-1">
                                {getTierIcon(agent.tier)}
                                #{agent.ranking}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">#{agent.ranking}</span>
                            )}
                          </td>
                          <td>
                            <div>
                              <div className="font-medium">{agent.agentName}</div>
                              <div className="text-xs text-muted-foreground">{agent.agentCode}</div>
                            </div>
                          </td>
                          <td className="text-sm capitalize">{agent.type}</td>
                          <td>{getTierBadge(agent.tier)}</td>
                          <td className="text-sm">{agent.bookings.toLocaleString()}</td>
                          <td className="text-sm">{agent.passengers.toLocaleString()}</td>
                          <td className="text-sm font-medium">${agent.revenue.toLocaleString()}</td>
                          <td className="text-sm text-green-600">${agent.commission.toLocaleString()}</td>
                          <td className="text-sm">{agent.commissionRate}%</td>
                          <td className="text-sm">${agent.avgBookingValue}</td>
                          <td className={`text-sm ${agent.cancellationRate > 3 ? 'text-red-600' : 'text-green-600'}`}>
                            {agent.cancellationRate}%
                          </td>
                          <td className="text-sm">{agent.noShowRate}%</td>
                          <td className={`text-sm ${agent.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {agent.growth >= 0 ? '+' : ''}{agent.growth}%
                          </td>
                          <td className={`text-sm ${agent.yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {agent.yoyGrowth >= 0 ? '+' : ''}{agent.yoyGrowth}%
                          </td>
                          <td className="text-sm">
                            <div className="flex flex-wrap gap-1">
                              {agent.topRoutes.slice(0, 2).map((route, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {route}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Agent Metrics Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agentPerformanceData.slice(0, 3).map((agent, i) => (
                      <div key={agent.agentId} className="flex items-center justify-between p-3 bg-secondary/30 rounded-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                            i === 1 ? 'bg-gray-100 text-gray-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>
                            #{i + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{agent.agentName}</div>
                            <div className="text-xs text-muted-foreground">{agent.revenue.toLocaleString()} bookings</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">${(agent.revenue / 1000000).toFixed(2)}M</div>
                          <div className="text-xs text-green-600">+{agent.growth}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="h-5 w-5" />
                    Commission Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Commission</span>
                      <span className="font-bold text-lg">$887,000</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average Rate</span>
                      <span className="font-medium">4.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Highest Payer</span>
                      <span className="font-medium">Global Travel</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Commission by Tier</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Crown className="h-3 w-3 text-purple-500" />
                            Platinum
                          </span>
                          <span>$420,000</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Medal className="h-3 w-3 text-yellow-500" />
                            Gold
                          </span>
                          <span>$303,500</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Award className="h-3 w-3 text-gray-400" />
                            Silver
                          </span>
                          <span>$163,500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendUpIcon className="h-5 w-5" />
                    Growth Leaders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agentPerformanceData
                      .sort((a, b) => b.growth - a.growth)
                      .slice(0, 4)
                      .map((agent, i) => (
                        <div key={agent.agentId} className="flex items-center justify-between p-3 bg-secondary/30 rounded-sm">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{agent.agentName}</div>
                            <div className="text-xs text-muted-foreground">{agent.bookings.toLocaleString()} bookings</div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold flex items-center gap-1 ${
                              agent.growth >= 10 ? 'text-green-600' : 'text-blue-600'
                            }`}>
                              {agent.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendDownIcon className="h-3 w-3" />}
                              {agent.growth}%
                            </div>
                            <div className="text-xs text-muted-foreground">YoY: {agent.yoyGrowth}%</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="space-y-6">
            {/* AI Models Section */}
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI Models
                    </CardTitle>
                    <CardDescription>Machine learning models for predictive analytics</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRetrainModels}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retrain Models
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {sampleAIModels.map((model) => (
                      <div key={model.id} className="p-4 border rounded-sm hover:bg-secondary/50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{model.name}</h4>
                              <Badge variant={model.status === 'deployed' ? 'default' : 'secondary'}>
                                {model.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Type: {model.type.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{model.accuracy}%</div>
                            <div className="text-xs text-muted-foreground">Accuracy</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-xs text-muted-foreground">Precision</div>
                            <div className="font-medium">{(model.performance.precision * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Recall</div>
                            <div className="font-medium">{(model.performance.recall * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">F1 Score</div>
                            <div className="font-medium">{(model.performance.f1Score * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">AUC</div>
                            <div className="font-medium">{(model.performance.auc * 100).toFixed(1)}%</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>v{model.version}</span>
                            <span>Features: {model.features.length}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Last: {model.lastTrained}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Next: {model.nextTraining}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Prediction Generation Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Generate Predictions
                  </CardTitle>
                  <CardDescription>Run AI models to generate predictions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Model</label>
                    <select 
                      className="w-full p-2 border rounded-sm bg-background"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      <option value="">Choose a model...</option>
                      {sampleAIModels.map((model) => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Route</label>
                    <select 
                      className="w-full p-2 border rounded-sm bg-background"
                      value={selectedRoute}
                      onChange={(e) => setSelectedRoute(e.target.value)}
                    >
                      {routeProfitabilityData.map((route) => (
                        <option key={route.route} value={route.route}>{route.route}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Prediction Period</label>
                    <div className="flex gap-2">
                      {(['7d', '30d', '90d'] as const).map((period) => (
                        <Button
                          key={period}
                          variant={predictionPeriod === period ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPredictionPeriod(period)}
                        >
                          {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleGeneratePrediction}
                    disabled={!selectedModel || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Generate Prediction
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Quick Forecast
                  </CardTitle>
                  <CardDescription>Next 30 days prediction</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="font-medium">Predicted Revenue</span>
                      </div>
                      <span className="text-2xl font-bold text-green-700">$12.4M</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-medium">Expected Load Factor</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-700">86%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-medium">Forecast Accuracy</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-700">94%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-full">
                          <TrendUpIcon className="h-4 w-4 text-orange-600" />
                        </div>
                        <span className="font-medium">Demand Trend</span>
                      </div>
                      <span className="text-lg font-bold text-orange-700">Increasing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Predictions Section */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Predictions
                </CardTitle>
                <CardDescription>Latest AI-generated predictions and outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Model</th>
                        <th>Type</th>
                        <th>Input</th>
                        <th>Output</th>
                        <th>Confidence</th>
                        <th>Status</th>
                        <th>Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {samplePredictions.map((prediction, i) => (
                        <tr key={i}>
                          <td className="font-medium">{prediction.modelName}</td>
                          <td className="text-sm">{prediction.type.replace('_', ' ')}</td>
                          <td className="text-sm max-w-32 truncate">
                            {JSON.stringify(prediction.input)}
                          </td>
                          <td className="text-sm max-w-40 truncate">
                            {JSON.stringify(prediction.output)}
                          </td>
                          <td className="text-sm font-medium text-blue-600">{prediction.confidence}%</td>
                          <td>
                            {prediction.implemented ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Implemented
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </td>
                          <td className="text-sm max-w-48 truncate">{prediction.outcome}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="passengers">
          <div className="space-y-6">
            {/* Passenger Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Passenger Segments
                  </CardTitle>
                  <CardDescription>Demographics by travel purpose</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <div className="space-y-4">
                      {passengerAnalytics.demographics.map((segment, i) => (
                        <div key={i} className="p-4 border rounded-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                i === 0 ? 'bg-blue-100' : 
                                i === 1 ? 'bg-green-100' : 
                                i === 2 ? 'bg-purple-100' : 
                                'bg-orange-100'
                              }`}>
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="font-medium">{segment.segment}</div>
                                <div className="text-sm text-muted-foreground">{segment.count.toLocaleString()} passengers</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{segment.percentage}%</div>
                              <div className={`text-xs ${segment.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {segment.growth >= 0 ? '+' : ''}{segment.growth}%
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Avg Spend:</span>
                              <span className="ml-2 font-medium">${segment.avgSpend}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Loyalty Tier:</span>
                              <span className="ml-2 font-medium">{segment.loyaltyTier}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Loyalty Tier Analysis
                  </CardTitle>
                  <CardDescription>Member distribution by tier</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Tier</th>
                          <th>Members</th>
                          <th>Revenue</th>
                          <th>Avg Flights</th>
                          <th>Retention</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengerAnalytics.loyaltyTiers.map((tier, i) => (
                          <tr key={i}>
                            <td className="font-medium">{tier.tier}</td>
                            <td>{tier.members.toLocaleString()}</td>
                            <td className="font-medium">${(tier.revenue / 1000000).toFixed(2)}M</td>
                            <td>{tier.avgFlights}</td>
                            <td className={tier.retentionRate >= 90 ? 'text-green-600' : 'text-blue-600'}>
                              {tier.retentionRate}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Travel Patterns and Ancillary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Travel Patterns by Route
                  </CardTitle>
                  <CardDescription>Passenger behavior on key routes</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Route</th>
                          <th>Passengers</th>
                          <th>Frequency</th>
                          <th>Avg Stay</th>
                          <th>Purpose</th>
                          <th>Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengerAnalytics.travelPatterns.map((pattern, i) => (
                          <tr key={i}>
                            <td className="font-medium">{pattern.route}</td>
                            <td>{pattern.passengers.toLocaleString()}</td>
                            <td className="capitalize">{pattern.frequency}</td>
                            <td>{pattern.avgStay} days</td>
                            <td className="text-xs">{pattern.purpose}</td>
                            <td className={`text-sm ${pattern.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pattern.growth >= 0 ? '+' : ''}{pattern.growth}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Ancillary Services
                  </CardTitle>
                  <CardDescription>Service purchase penetration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {passengerAnalytics.ancillaryPurchases.map((service, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{service.service}</span>
                          <span className="text-muted-foreground">${(service.revenue / 1000000).toFixed(2)}M</span>
                        </div>
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${service.penetrationRate}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{service.purchases.toLocaleString()} purchases</span>
                          <span>{service.penetrationRate}% penetration • ${service.avgPrice} avg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="aircraft">
          <div className="space-y-6">
            {/* Fleet Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Fleet</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aircraftUtilization.metrics.totalFleet}</div>
                  <div className="text-xs text-muted-foreground mt-1">Aircraft</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Utilization</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aircraftUtilization.metrics.avgUtilization}%</div>
                  <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2.3%
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Block Hours</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aircraftUtilization.metrics.totalBlockHours.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">This month</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Reliability</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{aircraftUtilization.metrics.reliability}%</div>
                  <div className="text-xs text-muted-foreground mt-1">On-time performance</div>
                </CardContent>
              </Card>
            </div>

            {/* Fleet Utilization Table */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Fleet Utilization
                </CardTitle>
                <CardDescription>Detailed metrics by aircraft</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Registration</th>
                        <th>Type</th>
                        <th>Utilization</th>
                        <th>Block Hours</th>
                        <th>Cycles</th>
                        <th>Fuel Eff.</th>
                        <th>Status</th>
                        <th>Maintenance</th>
                        <th>Routes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aircraftUtilization.fleet.map((aircraft, i) => (
                        <tr key={i}>
                          <td className="font-medium">{aircraft.registration}</td>
                          <td>{aircraft.type}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden w-24">
                                <div 
                                  className={`h-full ${aircraft.utilizationRate >= 95 ? 'bg-green-500' : aircraft.utilizationRate >= 90 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                  style={{ width: `${aircraft.utilizationRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{aircraft.utilizationRate}%</span>
                            </div>
                          </td>
                          <td>{aircraft.blockHours.toLocaleString()}</td>
                          <td>{aircraft.cycles.toLocaleString()}</td>
                          <td>{aircraft.fuelEfficiency}L/km</td>
                          <td>
                            <Badge variant={aircraft.status === 'active' ? 'default' : 'secondary'}>
                              {aircraft.status}
                            </Badge>
                          </td>
                          <td className="text-sm">{aircraft.maintenanceDue}</td>
                          <td>{aircraft.routes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Aircraft Type Analysis */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance by Aircraft Type
                </CardTitle>
                <CardDescription>Fleet metrics grouped by aircraft type</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Aircraft Type</th>
                        <th>Count</th>
                        <th>Avg Utilization</th>
                        <th>Total Block Hours</th>
                        <th>Fuel Efficiency</th>
                        <th>Reliability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aircraftUtilization.byType.map((type, i) => (
                        <tr key={i}>
                          <td className="font-medium">{type.type}</td>
                          <td>{type.count}</td>
                          <td className="font-medium">{type.avgUtilization}%</td>
                          <td>{type.totalBlockHours.toLocaleString()}</td>
                          <td>{type.fuelEfficiency}L/km</td>
                          <td className={type.reliability >= 99 ? 'text-green-600' : 'text-blue-600'}>
                            {type.reliability}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crew">
          <div className="space-y-6">
            {/* Crew Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Crew</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{crewUtilization.summary.totalCrew}</div>
                  <div className="text-xs text-muted-foreground mt-1">{crewUtilization.summary.activeCrew} active</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duty Hours</CardTitle>
                  <Timer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{crewUtilization.summary.avgDutyHours}h</div>
                  <div className="text-xs text-muted-foreground mt-1">Per month</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Flight Hours</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{crewUtilization.summary.avgFlightHours}h</div>
                  <div className="text-xs text-muted-foreground mt-1">Average per crew</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle>
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{crewUtilization.summary.utilizationRate}%</div>
                  <div className="text-xs text-muted-foreground mt-1">Overall rate</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Utilization by Position */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utilization by Position
                  </CardTitle>
                  <CardDescription>Crew metrics by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Position</th>
                          <th>Count</th>
                          <th>Avg Hours</th>
                          <th>Utilization</th>
                          <th>Qual Rate</th>
                          <th>Fatigue Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {crewUtilization.byPosition.map((pos, i) => (
                          <tr key={i}>
                            <td className="font-medium">{pos.position}</td>
                            <td>{pos.count}</td>
                            <td>{pos.avgHours}h</td>
                            <td className={pos.utilization >= 90 ? 'text-green-600' : 'text-blue-600'}>
                              {pos.utilization}%
                            </td>
                            <td>{pos.qualificationRate}%</td>
                            <td className={pos.fatigueRisk > 5 ? 'text-red-600' : 'text-yellow-600'}>
                              {pos.fatigueRisk}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Highest rated crew members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crewUtilization.topPerformers.map((crew, i) => (
                      <div key={i} className="p-4 border rounded-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                              i === 0 ? 'bg-yellow-500' : 
                              i === 1 ? 'bg-gray-400' : 
                              i === 2 ? 'bg-orange-400' : 
                              'bg-blue-500'
                            }`}>
                              {i + 1}
                            </div>
                            <div>
                              <div className="font-medium">{crew.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {crew.position} • {crew.base}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-yellow-500">{crew.rating} ★</div>
                            <div className="text-xs text-muted-foreground">Rating</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Hours:</span>
                            <span className="ml-1 font-medium">{crew.hoursFlown}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">On-Time:</span>
                            <span className="ml-1 font-medium text-green-600">{crew.onTime}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ID:</span>
                            <span className="ml-1 font-medium">{crew.employeeId}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <div className="space-y-6">
            {/* On-Time Performance Overview */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  On-Time Performance
                </CardTitle>
                <CardDescription>Overall: {operationalKPIs.onTimePerformance.overall}% on-time</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Route</th>
                        <th>On-Time %</th>
                        <th>Delays</th>
                        <th>Avg Delay</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {operationalKPIs.onTimePerformance.byRoute.map((route, i) => (
                        <tr key={i}>
                          <td className="font-medium">{route.route}</td>
                          <td className="font-medium">{route.onTime}%</td>
                          <td>{route.delays}</td>
                          <td>{route.avgDelay} min</td>
                          <td>
                            <Badge variant={route.onTime >= 95 ? 'default' : route.onTime >= 93 ? 'secondary' : 'destructive'}>
                              {route.onTime >= 95 ? 'Excellent' : route.onTime >= 93 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Delay Analysis */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Delay Analysis
                  </CardTitle>
                  <CardDescription>Total delays: {operationalKPIs.delayAnalysis.totalDelays}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Description</th>
                          <th>Count</th>
                          <th>Percentage</th>
                          <th>Avg Minutes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {operationalKPIs.delayAnalysis.delayCodes.map((delay, i) => (
                          <tr key={i}>
                            <td className="font-medium">{delay.code}</td>
                            <td>{delay.description}</td>
                            <td>{delay.count}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden w-20">
                                  <div 
                                    className={`h-full ${delay.percentage >= 20 ? 'bg-red-500' : delay.percentage >= 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${delay.percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm">{delay.percentage}%</span>
                              </div>
                            </td>
                            <td className="text-sm">{delay.avgMinutes} min</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Disruption Metrics */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Disruption Metrics
                  </CardTitle>
                  <CardDescription>Total disruptions: {operationalKPIs.disruptionMetrics.total}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {operationalKPIs.disruptionMetrics.byType.map((disruption, i) => (
                      <div key={i} className="p-4 border rounded-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-full ${
                              disruption.type === 'delay' ? 'bg-yellow-100' : 
                              disruption.type === 'cancellation' ? 'bg-red-100' : 
                              'bg-orange-100'
                            }`}>
                              <Radio className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium capitalize">{disruption.type}s</div>
                              <div className="text-sm text-muted-foreground">{disruption.count} occurrences</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-red-600">{disruption.impact}</div>
                            <div className="text-xs text-muted-foreground">Pax impacted</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Resolved:</span>
                            <span className="ml-2 font-medium">{disruption.resolved}/{disruption.count}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Resolution:</span>
                            <span className="ml-2 font-medium">{disruption.avgResolutionTime} min</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Alerts & Notifications Tab */}
        <TabsContent value="alerts">
          <div className="space-y-6">
            {/* Alerts Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">{alerts.filter(a => a.status === 'active').length} active</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{alerts.filter(a => a.type === 'critical' && a.status === 'active').length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Requires action</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card border-yellow-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{alerts.filter(a => a.type === 'warning' && a.status === 'active').length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Monitor closely</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{alerts.filter(a => a.status === 'resolved' || a.status === 'acknowledged').length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Action taken</div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts List */}
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BellRing className="h-5 w-5" />
                      KPI Alerts
                    </CardTitle>
                    <CardDescription>Real-time threshold alerts and notifications</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleFilterAlerts}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 border rounded-sm ${
                        alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        alert.status === 'resolved' ? 'bg-green-50 border-green-200 opacity-60' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              alert.type === 'critical' ? 'bg-red-100' :
                              alert.type === 'warning' ? 'bg-yellow-100' :
                              'bg-blue-100'
                            }`}>
                              {alert.type === 'critical' ? (
                                <XCircle className="h-4 w-4 text-red-600" />
                              ) : alert.type === 'warning' ? (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{alert.kpi}</div>
                              <div className="text-sm text-muted-foreground mt-1">{alert.message}</div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{alert.route}</span>
                                <span>•</span>
                                <span className={`flex items-center gap-1 ${
                                  alert.trend === 'increasing' ? 'text-red-600' :
                                  alert.trend === 'decreasing' ? 'text-green-600' :
                                  'text-blue-600'
                                }`}>
                                  {alert.trend === 'increasing' ? <TrendingUp className="h-3 w-3" /> :
                                   alert.trend === 'decreasing' ? <TrendingDown className="h-3 w-3" /> :
                                   <Activity className="h-3 w-3" />}
                                  {alert.trend}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">{alert.time}</div>
                            <Badge variant={
                              alert.status === 'active' ? 'default' :
                              alert.status === 'acknowledged' ? 'secondary' :
                              'outline'
                            } className="text-xs">
                              {alert.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t mt-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Value: </span>
                            <span className="font-medium">{alert.currentValue}</span>
                            <span className="text-muted-foreground mx-2">|</span>
                            <span className="text-muted-foreground">Threshold: </span>
                            <span className="font-medium">{alert.threshold}</span>
                          </div>
                          <div className="flex gap-2">
                            {alert.status === 'active' && (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                                  Acknowledge
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDismissAlert(alert.id)}>
                                  <X className="h-3 w-3 mr-1" />
                                  Dismiss
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cancellation & Trends Tab */}
        <TabsContent value="cancellations">
          <div className="space-y-6">
            {/* Cancellation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cancellationAnalysis.summary.totalBookings.toLocaleString()}</div>
                  <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    +12.5%
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cancellations</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cancellationAnalysis.summary.totalCancellations.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">{cancellationAnalysis.summary.cancellationRate}% rate</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Refunds</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(cancellationAnalysis.summary.totalRefunds / 1000000).toFixed(2)}M</div>
                  <div className="text-xs text-muted-foreground mt-1">Avg: ${cancellationAnalysis.summary.avgRefund}</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Trend</CardTitle>
                  <TrendUpIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">+2.9%</div>
                  <div className="text-xs text-muted-foreground mt-1">Rate change</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cancellation by Reason */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Cancellation by Reason
                  </CardTitle>
                  <CardDescription>Primary reasons for booking cancellations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <div className="space-y-3">
                      {cancellationAnalysis.byReason.map((item, i) => (
                        <div key={i} className="p-3 border rounded-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.reason}</span>
                              <Badge variant={
                                item.trend === 'increasing' ? 'destructive' :
                                item.trend === 'decreasing' ? 'default' :
                                'secondary'
                              } className="text-xs">
                                {item.trend}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{item.percentage}%</div>
                              <div className="text-xs text-muted-foreground">{item.count} bookings</div>
                            </div>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>Avg Refund: ${item.avgRefundAmount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Cancellation by Route */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Cancellation by Route
                  </CardTitle>
                  <CardDescription>Route-specific cancellation rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Route</th>
                          <th>Bookings</th>
                          <th>Cancellations</th>
                          <th>Rate</th>
                          <th>Top Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancellationAnalysis.byRoute.map((route, i) => (
                          <tr key={i}>
                            <td className="font-medium">{route.route}</td>
                            <td>{route.bookings.toLocaleString()}</td>
                            <td>{route.cancellations}</td>
                            <td className={route.rate > 3 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {route.rate}%
                            </td>
                            <td className="text-sm">{route.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Cancellation by Channel */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Cancellation by Channel
                  </CardTitle>
                  <CardDescription>Channel breakdown and refund amounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Channel</th>
                          <th>Bookings</th>
                          <th>Cancellations</th>
                          <th>Rate</th>
                          <th>Avg Refund</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancellationAnalysis.byChannel.map((channel, i) => (
                          <tr key={i}>
                            <td className="font-medium capitalize">{channel.channel}</td>
                            <td>{channel.bookings.toLocaleString()}</td>
                            <td>{channel.cancellations}</td>
                            <td className={channel.rate > 3 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {channel.rate}%
                            </td>
                            <td>${channel.avgRefund}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* AI Predictions for Cancellations */}
              <Card className="enterprise-card border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    AI Cancellation Predictions
                  </CardTitle>
                  <CardDescription>ML-powered cancellation risk forecasts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cancellationAnalysis.predictions.map((pred, i) => (
                      <div key={i} className="p-4 border border-purple-200 bg-purple-50 rounded-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{pred.route}</div>
                            <div className="text-sm text-muted-foreground">Driver: {pred.driver}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-700">{pred.predictedRate}%</div>
                            <div className="text-xs text-muted-foreground">vs {pred.currentRate}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-600"
                                  style={{ width: `${pred.confidence}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{pred.confidence}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 bg-white rounded-sm text-sm">
                          <span className="font-medium">Recommendation:</span> {pred.recommendedAction}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Demand Trends Section */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Demand Trend Analysis
                </CardTitle>
                <CardDescription>AI-powered demand forecasting and upcoming events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Demand by Route */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold mb-4">Demand by Route</h4>
                    <ScrollArea className="h-64">
                      <table className="enterprise-table">
                        <thead>
                          <tr>
                            <th>Route</th>
                            <th>Current</th>
                            <th>Previous</th>
                            <th>Growth</th>
                            <th>Next 30d</th>
                            <th>Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {demandTrends.byRoute.map((route, i) => (
                            <tr key={i}>
                              <td className="font-medium">
                                <div className="flex items-center gap-2">
                                  {route.route}
                                  <Badge variant="outline" className="text-xs">{route.seasonality}</Badge>
                                </div>
                              </td>
                              <td>{route.current.toLocaleString()}</td>
                              <td>{route.previous.toLocaleString()}</td>
                              <td className={route.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {route.growth >= 0 ? '+' : ''}{route.growth}%
                              </td>
                              <td className="text-sm font-medium text-blue-600">{route.next30d}</td>
                              <td>{route.confidence}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  </div>

                  {/* Demand by Cabin */}
                  <div>
                    <h4 className="font-semibold mb-4">Demand by Cabin</h4>
                    <div className="space-y-3">
                      {demandTrends.byCabin.map((cabin, i) => (
                        <div key={i} className="p-3 border rounded-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{cabin.cabin}</span>
                            <Badge variant="outline" className="text-xs">{cabin.forecast}</Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Demand</span>
                              <span className="font-medium">{cabin.demand.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Growth</span>
                              <span className={cabin.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {cabin.growth >= 0 ? '+' : ''}{cabin.growth}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Utilization</span>
                              <span className="font-medium">{cabin.utilization}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Upcoming Events Impact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {demandTrends.upcomingEvents.map((event, i) => (
                      <div key={i} className={`p-4 border rounded-sm ${
                        event.impact === 'very-high' ? 'bg-red-50 border-red-200' :
                        event.impact === 'high' ? 'bg-orange-50 border-orange-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{event.event}</div>
                          <Badge variant={
                            event.impact === 'very-high' ? 'destructive' :
                            event.impact === 'high' ? 'default' :
                            'secondary'
                          } className="text-xs">
                            {event.impact}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {event.startDate} - {event.endDate}
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{event.affectedRoutes.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendUpIcon className="h-3 w-3 text-green-600" />
                            <span className="font-medium text-green-600">{event.demandIncrease}</span>
                            <span className="text-muted-foreground">demand increase</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
