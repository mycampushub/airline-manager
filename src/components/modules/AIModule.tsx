'use client'

import { useState, useEffect, useRef } from 'react'
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
  Cpu, Brain, Zap, Settings, TrendingUp, CheckCircle, AlertTriangle, Activity, Target, Shield, Plus,
  Play, Pause, RotateCcw, Eye, Edit, Trash2, RefreshCw, Download, Upload, Filter, Search, Clock,
  BarChart3, LineChart, Database, GitBranch, Layers, Workflow, AlertOctagon, Sparkles, Bolt, XCircle,
  FileText, Calendar, MapPin, Info, ChevronRight, MoreHorizontal, ArrowRight, Lightbulb, Wrench
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

// Extended interfaces for AI features
interface AIModel {
  id: string
  name: string
  type: 'pricing' | 'demand_forecast' | 'maintenance_predictive' | 'fraud_detection' | 'personalization' | 'disruption_recovery' | 'crew_optimization' | 'revenue_optimization'
  version: string
  status: 'training' | 'deployed' | 'deprecated' | 'failed'
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  lastTrained: string
  trainingProgress?: number
  hyperparameters: Record<string, any>
  features: string[]
  predictionsToday: number
  totalPredictions: number
  modelSize: number
  deployment: {
    endpoint: string
    latency: number
    uptime: number
  }
}

interface Prediction {
  id: string
  modelId: string
  modelName: string
  type: string
  timestamp: string
  input: Record<string, any>
  output: Record<string, any>
  confidence: number
  status: 'success' | 'failed' | 'processing'
  executed: boolean
  actionTaken?: string
  recommendedActions?: string[]
  latency: number
}

interface AutomationRule {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  priority: 'critical' | 'high' | 'medium' | 'low'
  trigger: {
    type: 'event' | 'schedule' | 'condition'
    source: string
    condition?: string
    schedule?: string
  }
  conditions: RuleCondition[]
  actions: RuleAction[]
  executions: number
  successRate: number
  lastExecuted: string
  nextExecution?: string
  enabled: boolean
  createdBy: string
  createdAt: string
}

interface RuleCondition {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between'
  value: any
  logicalOperator?: 'and' | 'or'
}

interface RuleAction {
  id: string
  type: 'notification' | 'update' | 'create' | 'delete' | 'webhook' | 'email'
  target: string
  parameters: Record<string, any>
}

export default function AIModule() {
  const { aiModels, aiPredictions, automationRules, addAIModel, generatePrediction, createAutomationRule } = useAirlineStore()
  
  // Models state
  const [models, setModels] = useState<AIModel[]>([])
  const [showModelDialog, setShowModelDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [showModelDetails, setShowModelDetails] = useState(false)
  const [trainingModels, setTrainingModels] = useState<Set<string>>(new Set())
  
  // Predictions state
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showPredictionDialog, setShowPredictionDialog] = useState(false)
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null)
  const [predictionFilter, setPredictionFilter] = useState<'all' | 'success' | 'failed' | 'processing'>('all')
  
  // Rules state
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [showRuleBuilder, setShowRuleBuilder] = useState(false)
  const [ruleFilter, setRuleFilter] = useState<'all' | 'active' | 'paused' | 'draft'>('all')
  
  // Rule builder state
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    triggerType: 'event' as const,
    triggerSource: '',
    priority: 'medium' as const
  })
  
  const [conditions, setConditions] = useState<RuleCondition[]>([])
  const [actions, setActions] = useState<RuleAction[]>([])
  
  const initializedRef = useRef(false)

  // Initialize mock data functions
  const initializeModels = () => {
    const modelNames = [
      'Dynamic Pricing Engine v3', 'Demand Forecast Pro', 'Predictive Maintenance AI', 'Fraud Detection Neural Net',
      'Customer Churn Predictor', 'Revenue Optimization AI', 'Crew Scheduling AI', 'Fuel Efficiency Model',
      'Baggage Handling AI', 'Flight Delay Predictor', 'Customer Sentiment Analyzer', 'Ancillary Sales AI',
      'Route Optimization Engine', 'Inventory Management AI', 'Network Disruption AI', 'Personalization Engine',
      'Customer Lifetime Value AI', 'Pricing Elasticity Model', 'No-Show Predictor', 'Overbooking Optimization AI',
      'Ancillary Revenue AI', 'Loyalty Program AI', 'Customer Segmentation AI', 'Flight Performance AI',
      'Crew Fatigue Predictor', 'Maintenance Scheduler AI', 'Weather Impact Model', 'Competitor Intelligence AI',
      'Dynamic Pricing AI v4', 'Revenue Management AI'
    ]
    const modelTypes: ('pricing' | 'demand_forecast' | 'maintenance_predictive' | 'fraud_detection' | 'personalization' | 'disruption_recovery' | 'crew_optimization' | 'revenue_optimization')[] = [
      'pricing', 'demand_forecast', 'maintenance_predictive', 'fraud_detection',
      'personalization', 'revenue_optimization', 'crew_optimization', 'revenue_optimization',
      'revenue_optimization', 'disruption_recovery', 'personalization', 'revenue_optimization',
      'disruption_recovery', 'revenue_optimization', 'disruption_recovery', 'personalization',
      'personalization', 'pricing', 'demand_forecast', 'demand_forecast',
      'revenue_optimization', 'personalization', 'personalization', 'demand_forecast',
      'crew_optimization', 'maintenance_predictive', 'demand_forecast', 'pricing',
      'pricing', 'revenue_optimization'
    ]
    const statuses: ('training' | 'deployed' | 'deprecated' | 'failed')[] = [
      'deployed', 'deployed', 'deployed', 'deployed',
      'deployed', 'deployed', 'training', 'deployed',
      'deployed', 'deployed', 'deployed', 'deployed',
      'deployed', 'deployed', 'training', 'deployed',
      'deployed', 'deployed', 'deployed', 'deployed',
      'deployed', 'training', 'deployed', 'deployed',
      'deployed', 'deployed', 'deployed', 'deployed',
      'training', 'deployed'
    ]

    const modelData: AIModel[] = Array.from({ length: 30 }, (_, i) => ({
      id: `model-${String(i + 1).padStart(3, '0')}`,
      name: modelNames[i],
      type: modelTypes[i],
      version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      status: statuses[i],
      accuracy: 85 + (Math.random() * 14),
      precision: 83 + (Math.random() * 16),
      recall: 85 + (Math.random() * 14),
      f1Score: 84 + (Math.random() * 15),
      lastTrained: new Date(Date.now() - (i * 2) * 86400000).toISOString().split('T')[0],
      predictionsToday: Math.floor(5000 + Math.random() * 50000),
      totalPredictions: Math.floor(1000000 + Math.random() * 50000000),
      modelSize: Math.floor(100 + Math.random() * 400),
      trainingProgress: statuses[i] === 'training' ? Math.floor(Math.random() * 100) : undefined,
      hyperparameters: {
        learning_rate: Math.pow(10, -3 - Math.floor(Math.random() * 3)),
        epochs: 50 + Math.floor(Math.random() * 500),
        batch_size: [16, 32, 64, 128, 256][Math.floor(Math.random() * 5)],
        optimizer: ['adam', 'rmsprop', 'sgd', 'adagrad'][Math.floor(Math.random() * 4)],
        hidden_layers: 2 + Math.floor(Math.random() * 6)
      },
      features: ['feature_1', 'feature_2', 'feature_3', 'feature_4', 'feature_5'].slice(0, 3 + Math.floor(Math.random() * 3)),
      deployment: {
        endpoint: `/api/models/${modelTypes[i]}`,
        latency: Math.floor(20 + Math.random() * 100),
        uptime: 99.5 + Math.random() * 0.49
      }
    }))
    setModels(modelData)
  }

  const initializePredictions = () => {
    const predictionData: Prediction[] = Array.from({ length: 30 }, (_, i) => {
      const modelTypes = ['pricing', 'demand_forecast', 'maintenance_predictive', 'fraud_detection', 'personalization', 'disruption_recovery', 'crew_optimization', 'revenue_optimization']
      const type = modelTypes[i % modelTypes.length]
      const statusTypes: ('success' | 'failed' | 'processing')[] = ['success', 'success', 'success', 'processing', 'failed']
      const status = statusTypes[i % statusTypes.length]
      
      return {
        id: `pred-${String(i + 1).padStart(3, '0')}`,
        modelId: `model-${String((i % 30) + 1).padStart(3, '0')}`,
        modelName: ['Dynamic Pricing Engine v3', 'Demand Forecast Pro', 'Predictive Maintenance AI', 'Fraud Detection Neural Net', 'Customer Churn Predictor', 'Revenue Optimization AI', 'Crew Scheduling AI', 'Fuel Efficiency Model'][i % 8],
        type,
        timestamp: new Date(Date.now() - (i * 5) * 60000).toISOString(),
        input: { 
          flight_id: `FL${String((i % 30) + 1).padStart(4, '0')}`,
          route: ['JFK-LHR', 'LAX-NRT', 'SFO-HKG', 'SIN-SYD', 'DXB-LHR', 'CDG-SIN', 'JFK-SFO', 'LAX-MIA'][i % 8],
          passenger_count: 120 + (i * 3) % 100,
          date: '2024-02-01',
          days_to_departure: 1 + (i % 30)
        },
        output: {
          prediction_value: Math.random() * 100,
          confidence_interval: [Math.random() * 50, Math.random() * 50 + 50],
          recommendation: 'Take action based on prediction'
        },
        confidence: 0.7 + (Math.random() * 0.29),
        status,
        executed: status === 'success' && Math.random() > 0.3,
        actionTaken: status === 'success' && Math.random() > 0.3 ? 'Prediction executed' : undefined,
        recommendedActions: status === 'success' ? ['Action 1', 'Action 2', 'Action 3'] : undefined,
        latency: Math.floor(20 + Math.random() * 100)
      }
    })
    setPredictions(predictionData)
  }

  const initializeRules = () => {
    const ruleNames = [
      'Auto Price Adjustment', 'Flight Delay Notification', 'Fraud Alert Escalation', 'Crew Optimization',
      'Baggage Misrouting Alert', 'Maintenance Trigger', 'Customer Churn Prevention', 'Revenue Alert',
      'Overbooking Adjustment', 'No-Show Optimization', 'Dynamic Inventory Update', 'Fare Class Adjustment',
      'Ancillary Offer Trigger', 'Loyalty Point Bonus', 'Customer Re-engagement', 'Competitor Price Watch',
      'Weather Disruption Response', 'Gate Assignment Optimization', 'Fuel Cost Alert', 'Route Performance Monitor',
      'Agent Performance Alert', 'Queue Management', 'Booking Cancellation Follow-up', 'Waitlist Promotion',
      'Group Booking Alert', 'Corporate Contract Enforcement', 'Agency Commission Adjustment', 'Payment Verification',
      'Document Expiry Alert', 'Seasonal Campaign Trigger'
    ]
    const ruleDescriptions = [
      'Automatically adjust prices based on demand threshold',
      'Notify passengers automatically when flight is delayed',
      'Escalate high-risk fraud alerts to security team',
      'Optimize crew assignments based on schedule changes',
      'Detect and flag misrouted baggage for recovery',
      'Trigger maintenance requests based on predictive data',
      'Identify customers at risk of churning and send offers',
      'Alert when revenue falls below expected thresholds',
      'Adjust overbooking levels based on no-show predictions',
      'Optimize no-show handling for better seat utilization',
      'Dynamically update inventory based on demand patterns',
      'Adjust fare class availability based on demand',
      'Trigger personalized ancillary offers at booking',
      'Award loyalty points for qualifying activities',
      'Re-engage inactive customers with targeted offers',
      'Monitor competitor pricing and adjust accordingly',
      'Automatically respond to weather-related disruptions',
      'Optimize gate assignments for efficient operations',
      'Alert when fuel costs exceed budget thresholds',
      'Monitor route performance and flag underperformers',
      'Track agent performance and send alerts',
      'Manage customer service queues efficiently',
      'Follow up on booking cancellations for feedback',
      'Promote waitlisted customers when seats become available',
      'Alert on large group bookings for special handling',
      'Enforce corporate contract rules and pricing',
      'Adjust agency commissions based on performance',
      'Verify high-value payments for fraud prevention',
      'Alert on expiring travel documents',
      'Trigger seasonal marketing campaigns'
    ]
    const triggerSources = [
      'pricing_engine', 'flight_ops', 'fraud_detection', 'crew_management',
      'baggage_system', 'maintenance_system', 'crm', 'revenue_system',
      'inventory_system', 'booking_system', 'inventory_system', 'pricing_engine',
      'booking_system', 'loyalty_system', 'crm', 'pricing_engine',
      'flight_ops', 'airport_ops', 'finance', 'operations',
      'customer_service', 'customer_service', 'crm', 'booking_system',
      'sales_system', 'corporate_sales', 'agency_system', 'payment_system',
      'document_system', 'marketing_system'
    ]
    const priorities: ('critical' | 'high' | 'medium' | 'low')[] = [
      'high', 'critical', 'critical', 'medium',
      'high', 'high', 'medium', 'high',
      'medium', 'medium', 'medium', 'high',
      'medium', 'low', 'medium', 'high',
      'critical', 'medium', 'high', 'medium',
      'low', 'medium', 'low', 'medium',
      'high', 'medium', 'medium', 'critical',
      'high', 'low'
    ]
    const statuses: ('active' | 'paused' | 'draft')[] = [
      'active', 'active', 'active', 'active',
      'active', 'active', 'active', 'active',
      'active', 'active', 'active', 'active',
      'active', 'paused', 'active', 'active',
      'active', 'active', 'active', 'active',
      'active', 'active', 'paused', 'active',
      'active', 'active', 'active', 'active',
      'active', 'active'
    ]
    const creators = [
      'revenue_manager', 'ops_manager', 'security_manager', 'crew_manager',
      'baggage_manager', 'maintenance_manager', 'crm_manager', 'revenue_manager',
      'inventory_manager', 'booking_manager', 'inventory_manager', 'pricing_manager',
      'booking_manager', 'loyalty_manager', 'crm_manager', 'pricing_manager',
      'flight_ops_manager', 'airport_manager', 'finance_manager', 'operations_manager',
      'customer_service_manager', 'customer_service_manager', 'crm_manager', 'booking_manager',
      'sales_manager', 'corporate_sales_manager', 'agency_manager', 'payment_manager',
      'document_manager', 'marketing_manager'
    ]

    const ruleData: AutomationRule[] = Array.from({ length: 30 }, (_, i) => ({
      id: `rule-${String(i + 1).padStart(3, '0')}`,
      name: ruleNames[i],
      description: ruleDescriptions[i],
      status: statuses[i],
      priority: priorities[i],
      trigger: {
        type: ['event', 'condition', 'schedule'][i % 3] as 'event' | 'condition' | 'schedule',
        source: triggerSources[i],
        condition: 'condition based trigger'
      },
      conditions: [
        { id: `c-${String(i + 1).padStart(3, '0')}`, field: 'field_name', operator: 'equals' as const, value: 'value' }
      ],
      actions: [
        { id: `a-${String(i + 1).padStart(3, '0')}`, type: 'notification' as const, target: 'target_system', parameters: {} }
      ],
      executions: Math.floor(100 + Math.random() * 5000),
      successRate: 90 + Math.random() * 10,
      lastExecuted: new Date(Date.now() - (i * 60) * 60000).toISOString(),
      enabled: statuses[i] === 'active',
      createdBy: creators[i],
      createdAt: new Date(Date.now() - (i + 30) * 86400000).toISOString().split('T')[0]
    }))
    setRules(ruleData)
  }

  // Initialize all mock data on component mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    setTimeout(() => {
      initializeModels()
      initializePredictions()
      initializeRules()
    }, 0)
  }, [])

  // Handlers
  const handleTrainModel = (modelId: string) => {
    setTrainingModels(prev => new Set([...prev, modelId]))
    setModels(prev =>
      prev.map(m =>
        m.id === modelId
          ? { ...m, status: 'training' as const, trainingProgress: 0 }
          : m
      )
    )
    
    // Simulate training progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setModels(prev =>
        prev.map(m =>
          m.id === modelId
            ? { ...m, trainingProgress: progress }
            : m
        )
      )
      
      if (progress >= 100) {
        clearInterval(interval)
        setTrainingModels(prev => {
          const newSet = new Set(prev)
          newSet.delete(modelId)
          return newSet
        })
        setModels(prev =>
          prev.map(m =>
            m.id === modelId
              ? { ...m, status: 'deployed' as const, trainingProgress: undefined, lastTrained: new Date().toISOString().split('T')[0], accuracy: Math.min(m.accuracy + Math.random() * 2, 99) }
              : m
          )
        )
      }
    }, 500)
  }

  const handleAddCondition = () => {
    setConditions([...conditions, {
      id: `c-${Date.now()}`,
      field: '',
      operator: 'equals',
      value: ''
    }])
  }

  const handleAddAction = () => {
    setActions([...actions, {
      id: `a-${Date.now()}`,
      type: 'notification',
      target: '',
      parameters: {}
    }])
  }

  const handleCreateRule = () => {
    const rule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name,
      description: newRule.description,
      status: 'active',
      priority: newRule.priority,
      trigger: {
        type: newRule.triggerType,
        source: newRule.triggerSource,
        condition: conditions[0] ? `${conditions[0].field} ${conditions[0].operator} ${conditions[0].value}` : undefined
      },
      conditions,
      actions,
      executions: 0,
      successRate: 100,
      lastExecuted: '-',
      enabled: true,
      createdBy: 'current_user',
      createdAt: new Date().toISOString().split('T')[0]
    }
    setRules([...rules, rule])
    setShowRuleBuilder(false)
    setNewRule({ name: '', description: '', triggerType: 'event', triggerSource: '', priority: 'medium' })
    setConditions([])
    setActions([])
  }

  // Utility functions
  const getStatusBadge = (status: string) => {
    const variants = {
      training: 'secondary',
      deployed: 'default',
      deprecated: 'outline',
      success: 'default',
      failed: 'destructive',
      processing: 'secondary',
      active: 'default',
      paused: 'outline',
      draft: 'secondary'
    }
    return (
      <Badge variant={(variants[status as keyof typeof variants] || variants.deployed) as 'default' | 'destructive' | 'outline' | 'secondary'} className="capitalize">
        {status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return (
      <Badge className={`${colors[priority as keyof typeof colors] || colors.medium} capitalize`}>
        {priority}
      </Badge>
    )
  }

  // Calculate summary metrics
  const avgAccuracy = models.length > 0 ? (models.reduce((sum, m) => sum + m.accuracy, 0) / models.length).toFixed(1) : '0'
  const totalPredictionsToday = predictions.length
  const activeRules = rules.filter(r => r.status === 'active' && r.enabled).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI & Automation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Model Training, Predictive Analytics, and Automation Rules
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            initializeModels()
            initializePredictions()
            initializeRules()
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={() => setShowModelDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Train New Model
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Models</CardTitle>
            <Brain className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <div className="text-xs text-muted-foreground mt-1">{models.filter(m => m.status === 'deployed').length} deployed</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Predictions Today</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredictionsToday}</div>
            <div className="text-xs text-muted-foreground mt-1">AI predictions</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeRules}</div>
            <div className="text-xs text-muted-foreground mt-1">of {rules.length} total</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{avgAccuracy}%</div>
            <div className="text-xs text-muted-foreground mt-1">model accuracy</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {models.length > 0 ? Math.round(models.reduce((sum, m) => sum + m.deployment.latency, 0) / models.length) : 0}ms
            </div>
            <div className="text-xs text-muted-foreground mt-1">inference time</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="rule-builder">Rule Builder</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly Detection</TabsTrigger>
        </TabsList>

        {/* AI Models Tab */}
        <TabsContent value="models">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Models</CardTitle>
                  <CardDescription>Manage and monitor deployed machine learning models</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.map((model) => (
                    <Card key={model.id} className="enterprise-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{model.name}</CardTitle>
                            <CardDescription className="text-xs">v{model.version} | {model.type.replace('_', ' ')}</CardDescription>
                          </div>
                          {getStatusBadge(model.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {model.status === 'training' && model.trainingProgress !== undefined && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Training Progress</span>
                                <span>{model.trainingProgress}%</span>
                              </div>
                              <Progress value={model.trainingProgress} className="h-2" />
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div>
                              <div className="text-muted-foreground">Accuracy</div>
                              <div className="font-medium text-green-600">{model.accuracy}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">F1 Score</div>
                              <div className="font-medium">{model.f1Score}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Predictions Today</div>
                              <div className="font-medium">{model.predictionsToday.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Latency</div>
                              <div className="font-medium">{model.deployment.latency}ms</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" size="sm" onClick={() => { setSelectedModel(model); setShowModelDetails(true) }}>
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            {model.status === 'deployed' && (
                              <Button variant="outline" size="sm" onClick={() => handleTrainModel(model.id)} disabled={trainingModels.has(model.id)}>
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
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

        {/* Predictions Tab */}
        <TabsContent value="predictions">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Predictions</CardTitle>
                  <CardDescription>Recent predictions and recommendations</CardDescription>
                </div>
                <Select value={predictionFilter} onValueChange={(v: any) => setPredictionFilter(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Model</th>
                      <th>Type</th>
                      <th>Input</th>
                      <th>Output</th>
                      <th>Confidence</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No predictions yet
                        </td>
                      </tr>
                    ) : (
                      predictions
                        .filter(p => predictionFilter === 'all' || p.status === predictionFilter)
                        .map((pred) => (
                        <tr key={pred.id}>
                          <td className="text-sm">{new Date(pred.timestamp).toLocaleString()}</td>
                          <td className="text-sm font-medium">{pred.modelName}</td>
                          <td>
                            <Badge variant="outline" className="text-xs capitalize">{pred.type.replace('_', ' ')}</Badge>
                          </td>
                          <td className="text-sm max-w-xs truncate">
                            <pre className="text-xs">{JSON.stringify(pred.input).substring(0, 50)}...</pre>
                          </td>
                          <td className="text-sm max-w-xs truncate">
                            <pre className="text-xs">{JSON.stringify(pred.output).substring(0, 50)}...</pre>
                          </td>
                          <td className="text-sm font-medium">{(pred.confidence * 100).toFixed(1)}%</td>
                          <td>{getStatusBadge(pred.status)}</td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedPrediction(pred); setShowPredictionDialog(true) }}>
                              <Eye className="h-4 w-4" />
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

        {/* Automation Rules Tab */}
        <TabsContent value="rules">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Automation Rules</CardTitle>
                  <CardDescription>Manage automated workflow rules</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={ruleFilter} onValueChange={(v: any) => setRuleFilter(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowRuleBuilder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-y-auto h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rules.length === 0 ? (
                    <div className="col-span-2 text-center py-12">
                      <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No automation rules configured</p>
                    </div>
                  ) : (
                    rules
                      .filter(r => ruleFilter === 'all' || r.status === ruleFilter)
                      .map((rule) => (
                      <Card key={rule.id} className="enterprise-card">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{rule.name}</CardTitle>
                              <CardDescription className="text-xs">{rule.description}</CardDescription>
                            </div>
                            <div className="flex items-center flex-wrap gap-2">
                              {getPriorityBadge(rule.priority)}
                              <Switch checked={rule.enabled} onCheckedChange={() => {
                                setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                              }} />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="text-sm">
                              <div className="text-muted-foreground">Trigger</div>
                              <div className="font-medium capitalize">{rule.trigger.type}: {rule.trigger.source}</div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-muted-foreground">Conditions</div>
                                <div className="font-medium">{rule.conditions.length}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Actions</div>
                                <div className="font-medium">{rule.actions.length}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Executions</div>
                                <div className="font-medium">{rule.executions.toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" className="flex-1" size="sm">
                                <Activity className="h-4 w-4 mr-1" />
                                Logs
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rule Builder Tab */}
        <TabsContent value="rule-builder">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Rule Builder</CardTitle>
              <CardDescription>Create automation rules with visual builder</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Rule Definition */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Rule Name</Label>
                    <Input value={newRule.name} onChange={(e) => setNewRule({...newRule, name: e.target.value})} placeholder="Enter rule name" />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={newRule.priority} onValueChange={(v: any) => setNewRule({...newRule, priority: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={newRule.description} onChange={(e) => setNewRule({...newRule, description: e.target.value})} placeholder="Describe what this rule does" />
                </div>

                {/* Trigger Configuration */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center flex-wrap gap-2">
                    <Bolt className="h-4 w-4" />
                    Trigger Configuration
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Trigger Type</Label>
                      <Select value={newRule.triggerType} onValueChange={(v: any) => setNewRule({...newRule, triggerType: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event">Event</SelectItem>
                          <SelectItem value="schedule">Schedule</SelectItem>
                          <SelectItem value="condition">Condition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Source</Label>
                      <Input value={newRule.triggerSource} onChange={(e) => setNewRule({...newRule, triggerSource: e.target.value})} placeholder="e.g., flight_ops, pricing_engine" />
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center flex-wrap gap-2">
                      <Filter className="h-4 w-4" />
                      Conditions
                    </h4>
                    <Button variant="outline" size="sm" onClick={handleAddCondition}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Condition
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {conditions.map((condition, index) => (
                      <div key={condition.id} className="flex items-center flex-wrap gap-2 p-3 bg-secondary/20 rounded-sm">
                        <Input
                          placeholder="Field"
                          value={condition.field}
                          onChange={(e) => {
                            const newConditions = [...conditions]
                            newConditions[index].field = e.target.value
                            setConditions(newConditions)
                          }}
                          className="w-32"
                        />
                        <Select value={condition.operator} onValueChange={(v: any) => {
                          const newConditions = [...conditions]
                          newConditions[index].operator = v
                          setConditions(newConditions)
                        }}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                            <SelectItem value="between">Between</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Value"
                          value={condition.value}
                          onChange={(e) => {
                            const newConditions = [...conditions]
                            newConditions[index].value = e.target.value
                            setConditions(newConditions)
                          }}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="sm" onClick={() => {
                          setConditions(conditions.filter((_, i) => i !== index))
                        }}>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                    {conditions.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No conditions added. Click "Add Condition" to start building your rule.
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium flex items-center flex-wrap gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Actions
                    </h4>
                    <Button variant="outline" size="sm" onClick={handleAddAction}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Action
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {actions.map((action, index) => (
                      <div key={action.id} className="flex items-center flex-wrap gap-2 p-3 bg-secondary/20 rounded-sm">
                        <Select value={action.type} onValueChange={(v: any) => {
                          const newActions = [...actions]
                          newActions[index].type = v
                          setActions(newActions)
                        }}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="notification">Notification</SelectItem>
                            <SelectItem value="update">Update</SelectItem>
                            <SelectItem value="create">Create</SelectItem>
                            <SelectItem value="delete">Delete</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Target"
                          value={action.target}
                          onChange={(e) => {
                            const newActions = [...actions]
                            newActions[index].target = e.target.value
                            setActions(newActions)
                          }}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="sm" onClick={() => {
                          setActions(actions.filter((_, i) => i !== index))
                        }}>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                    {actions.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No actions added. Click "Add Action" to define what happens when the rule triggers.
                      </div>
                    )}
                  </div>
                </div>

                {/* Create Button */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setShowRuleBuilder(false)
                    setNewRule({ name: '', description: '', triggerType: 'event', triggerSource: '', priority: 'medium' })
                    setConditions([])
                    setActions([])
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRule} disabled={!newRule.name || !newRule.triggerSource}>
                    <Workflow className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomaly Detection Tab */}
        <TabsContent value="anomaly">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Fraud Detection</CardTitle>
                <CardDescription>AI-powered fraud and anomaly detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-medium">System Status</span>
                      </div>
                      <Badge variant="default">Protected</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Real-time fraud detection active across all channels
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Recent Alerts</h3>
                    {[
                      { type: 'Suspicious Booking', severity: 'high', time: '2 hours ago', status: 'investigating' },
                      { type: 'Unusual Payment', severity: 'medium', time: '5 hours ago', status: 'resolved' },
                      { type: 'Velocity Violation', severity: 'low', time: '1 day ago', status: 'false_positive' }
                    ].map((alert, i) => (
                      <div key={i} className="p-3 bg-secondary/30 rounded-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{alert.type}</span>
                          <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'outline'} className="capitalize">
                            {alert.severity}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{alert.time}</span>
                          <Badge variant={alert.status === 'investigating' ? 'secondary' : alert.status === 'resolved' ? 'default' : 'outline'} className="capitalize">
                            {alert.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Revenue Anomaly Detection</CardTitle>
                <CardDescription>Identify unusual revenue patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm text-center">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs text-muted-foreground mt-1">Anomalies Detected</div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-sm text-center">
                      <div className="text-2xl font-bold">$245K</div>
                      <div className="text-xs text-muted-foreground mt-1">Potential Savings</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Detected Anomalies</h3>
                    {[
                      { route: 'JFK-LHR', type: 'Revenue Drop', value: '-15%', detected: '2 hours ago', confidence: 92 },
                      { route: 'LAX-TYO', type: 'Unusual Spike', value: '+28%', detected: '6 hours ago', confidence: 88 },
                      { route: 'SIN-SYD', type: 'Yield Variance', value: '-8%', detected: '1 day ago', confidence: 85 }
                    ].map((anomaly, i) => (
                      <div key={i} className="p-3 bg-secondary/30 rounded-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{anomaly.route}</span>
                          <Badge variant="outline">{anomaly.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{anomaly.detected}</span>
                          <span className="font-medium">{anomaly.confidence}% confidence</span>
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

      {/* Model Details Dialog */}
      <Dialog open={showModelDetails} onOpenChange={setShowModelDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Model Details</DialogTitle>
          </DialogHeader>
          {selectedModel && (
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <div className="text-sm font-medium mt-1">{selectedModel.name}</div>
                  </div>
                  <div>
                    <Label>Version</Label>
                    <div className="text-sm font-medium mt-1">{selectedModel.version}</div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="text-sm font-medium mt-1 capitalize">{selectedModel.type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedModel.status)}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Performance Metrics</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-sm">
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                      <div className="text-lg font-bold text-green-700 dark:text-green-400">{selectedModel.accuracy}%</div>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm">
                      <div className="text-xs text-muted-foreground">Precision</div>
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-400">{selectedModel.precision}</div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-sm">
                      <div className="text-xs text-muted-foreground">Recall</div>
                      <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{selectedModel.recall}</div>
                    </div>
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-sm">
                      <div className="text-xs text-muted-foreground">F1 Score</div>
                      <div className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{selectedModel.f1Score}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Hyperparameters</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(selectedModel.hyperparameters).map(([key, value]) => (
                      <div key={key}>
                        <div className="text-muted-foreground capitalize">{key.replace('_', ' ')}</div>
                        <div className="font-medium">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedModel.features.map((feature, i) => (
                      <Badge key={i} variant="outline" className="capitalize">{feature.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Deployment</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Endpoint</div>
                      <div className="font-mono text-xs mt-1">{selectedModel.deployment.endpoint}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Latency</div>
                      <div className="font-medium">{selectedModel.deployment.latency}ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Uptime</div>
                      <div className="font-medium text-green-600">{selectedModel.deployment.uptime}%</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Last Trained</div>
                    <div className="font-medium">{selectedModel.lastTrained}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Predictions</div>
                    <div className="font-medium">{selectedModel.totalPredictions.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModelDetails(false)}>Close</Button>
            <Button onClick={() => selectedModel && handleTrainModel(selectedModel.id)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retrain Model
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prediction Details Dialog */}
      <Dialog open={showPredictionDialog} onOpenChange={setShowPredictionDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Model</Label>
                  <div className="text-sm font-medium mt-1">{selectedPrediction.modelName}</div>
                </div>
                <div>
                  <Label>Type</Label>
                  <div className="text-sm font-medium mt-1 capitalize">{selectedPrediction.type.replace('_', ' ')}</div>
                </div>
                <div>
                  <Label>Confidence</Label>
                  <div className="text-sm font-medium mt-1">{(selectedPrediction.confidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <Label>Latency</Label>
                  <div className="text-sm font-medium mt-1">{selectedPrediction.latency}ms</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Input</h4>
                <div className="p-3 bg-secondary/20 rounded-sm">
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(selectedPrediction.input, null, 2)}</pre>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Output</h4>
                <div className="p-3 bg-secondary/20 rounded-sm">
                  <pre className="text-xs overflow-x-auto">{JSON.stringify(selectedPrediction.output, null, 2)}</pre>
                </div>
              </div>

              {selectedPrediction.recommendedActions && selectedPrediction.recommendedActions.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center flex-wrap gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {selectedPrediction.recommendedActions.map((action, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPrediction.actionTaken && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center flex-wrap gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Action Taken
                  </h4>
                  <p className="text-sm">{selectedPrediction.actionTaken}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPredictionDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
