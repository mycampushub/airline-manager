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
    const modelData: AIModel[] = [
      {
        id: 'model-001',
        name: 'Dynamic Pricing Engine v3',
        type: 'pricing',
        version: '3.2.1',
        status: 'deployed',
        accuracy: 94.5,
        precision: 93.2,
        recall: 95.8,
        f1Score: 94.5,
        lastTrained: '2024-01-15',
        predictionsToday: 24500,
        totalPredictions: 12500000,
        modelSize: 256,
        hyperparameters: {
          learning_rate: 0.001,
          epochs: 100,
          batch_size: 32,
          optimizer: 'adam',
          hidden_layers: 4
        },
        features: ['demand', 'competitor_prices', 'seasonality', 'events', 'booking_lead_time'],
        deployment: {
          endpoint: '/api/models/pricing',
          latency: 45,
          uptime: 99.98
        }
      },
      {
        id: 'model-002',
        name: 'Demand Forecast Pro',
        type: 'demand_forecast',
        version: '2.1.0',
        status: 'deployed',
        accuracy: 92.8,
        precision: 91.5,
        recall: 94.0,
        f1Score: 92.7,
        lastTrained: '2024-01-10',
        predictionsToday: 18200,
        totalPredictions: 8900000,
        modelSize: 180,
        hyperparameters: {
          learning_rate: 0.01,
          epochs: 150,
          batch_size: 64,
          optimizer: 'rmsprop',
          hidden_layers: 3
        },
        features: ['historical_bookings', 'seasonality', 'economic_indicators', 'events', 'weather'],
        deployment: {
          endpoint: '/api/models/demand',
          latency: 65,
          uptime: 99.95
        }
      },
      {
        id: 'model-003',
        name: 'Predictive Maintenance AI',
        type: 'maintenance_predictive',
        version: '1.5.0',
        status: 'deployed',
        accuracy: 91.2,
        precision: 89.8,
        recall: 92.5,
        f1Score: 91.1,
        lastTrained: '2024-01-08',
        predictionsToday: 8500,
        totalPredictions: 4500000,
        modelSize: 145,
        hyperparameters: {
          learning_rate: 0.005,
          epochs: 200,
          batch_size: 128,
          optimizer: 'adam',
          hidden_layers: 5
        },
        features: ['sensor_data', 'flight_hours', 'maintenance_history', 'environmental_conditions'],
        deployment: {
          endpoint: '/api/models/maintenance',
          latency: 80,
          uptime: 99.99
        }
      },
      {
        id: 'model-004',
        name: 'Fraud Detection Neural Net',
        type: 'fraud_detection',
        version: '4.0.0',
        status: 'deployed',
        accuracy: 96.3,
        precision: 97.1,
        recall: 95.5,
        f1Score: 96.3,
        lastTrained: '2024-01-16',
        predictionsToday: 45200,
        totalPredictions: 25000000,
        modelSize: 320,
        hyperparameters: {
          learning_rate: 0.001,
          epochs: 300,
          batch_size: 256,
          optimizer: 'adam',
          hidden_layers: 6
        },
        features: ['booking_patterns', 'payment_behavior', 'user_history', 'ip_geolocation', 'device_fingerprint'],
        deployment: {
          endpoint: '/api/models/fraud',
          latency: 35,
          uptime: 99.99
        }
      }
    ]
    setModels(modelData)
  }

  const initializePredictions = () => {
    const predictionData: Prediction[] = [
      {
        id: 'pred-001',
        modelId: 'model-001',
        modelName: 'Dynamic Pricing Engine v3',
        type: 'pricing',
        timestamp: '2024-01-18T15:30:00Z',
        input: { route: 'JFK-LHR', date: '2024-02-01', days_to_departure: 14, current_load: 0.75 },
        output: { recommended_price: 850, confidence_interval: [820, 880], demand_forecast: 0.82 },
        confidence: 0.92,
        status: 'success',
        executed: true,
        actionTaken: 'Price adjusted to $850',
        recommendedActions: ['Increase price by 5%', 'Monitor booking rate', 'Consider adding capacity'],
        latency: 42
      },
      {
        id: 'pred-002',
        modelId: 'model-002',
        modelName: 'Demand Forecast Pro',
        type: 'demand_forecast',
        timestamp: '2024-01-18T15:25:00Z',
        input: { route: 'SIN-SYD', period: 'Q2-2024', historical_data: '12_months' },
        output: { forecast_demand: 45000, growth_rate: 0.12, confidence: 0.88 },
        confidence: 0.88,
        status: 'success',
        executed: false,
        recommendedActions: ['Increase capacity on SIN-SYD', 'Consider additional frequencies', 'Monitor competitor pricing'],
        latency: 68
      },
      {
        id: 'pred-003',
        modelId: 'model-003',
        modelName: 'Predictive Maintenance AI',
        type: 'maintenance_predictive',
        timestamp: '2024-01-18T15:20:00Z',
        input: { aircraft_id: 'N12345', component: 'engine_1', flight_hours: 4500, sensor_vibration: 0.045 },
        output: { failure_probability: 0.78, predicted_failure_date: '2024-02-15', recommendation: 'Schedule maintenance' },
        confidence: 0.91,
        status: 'success',
        executed: true,
        actionTaken: 'Maintenance scheduled for 2024-02-01',
        recommendedActions: ['Schedule engine inspection', 'Prepare spare parts', 'Reassign affected flights'],
        latency: 75
      },
      {
        id: 'pred-004',
        modelId: 'model-004',
        modelName: 'Fraud Detection Neural Net',
        type: 'fraud_detection',
        timestamp: '2024-01-18T15:15:00Z',
        input: { booking_id: 'BK-12345', payment_amount: 2500, user_history_score: 0.3, ip_risk: 0.7 },
        output: { fraud_probability: 0.92, risk_level: 'high', recommended_action: 'block_and_review' },
        confidence: 0.96,
        status: 'success',
        executed: true,
        actionTaken: 'Booking blocked for manual review',
        recommendedActions: ['Flag user account', 'Request additional verification', 'Escalate to fraud team'],
        latency: 33
      }
    ]
    setPredictions(predictionData)
  }

  const initializeRules = () => {
    const ruleData: AutomationRule[] = [
      {
        id: 'rule-001',
        name: 'Auto Price Adjustment',
        description: 'Automatically adjust prices based on demand threshold',
        status: 'active',
        priority: 'high',
        trigger: {
          type: 'condition',
          source: 'pricing_engine',
          condition: 'demand > 0.8'
        },
        conditions: [
          { id: 'c-001', field: 'demand', operator: 'greater_than', value: 0.8 }
        ],
        actions: [
          { id: 'a-001', type: 'update', target: 'price', parameters: { adjustment: 'increase', percentage: 5 } }
        ],
        executions: 1250,
        successRate: 98.5,
        lastExecuted: '2024-01-18T15:30:00Z',
        enabled: true,
        createdBy: 'revenue_manager',
        createdAt: '2024-01-01'
      },
      {
        id: 'rule-002',
        name: 'Flight Delay Notification',
        description: 'Notify passengers automatically when flight is delayed',
        status: 'active',
        priority: 'critical',
        trigger: {
          type: 'event',
          source: 'flight_ops',
          condition: 'flight.status == delayed'
        },
        conditions: [
          { id: 'c-002', field: 'status', operator: 'equals', value: 'delayed' }
        ],
        actions: [
          { id: 'a-002', type: 'notification', target: 'passenger', parameters: { channel: 'sms', template: 'delay_notification' } },
          { id: 'a-003', type: 'email', target: 'passenger', parameters: { template: 'delay_email' } }
        ],
        executions: 85,
        successRate: 100,
        lastExecuted: '2024-01-18T14:15:00Z',
        enabled: true,
        createdBy: 'ops_manager',
        createdAt: '2024-01-01'
      },
      {
        id: 'rule-003',
        name: 'Fraud Alert Escalation',
        description: 'Escalate high-risk fraud alerts to security team',
        status: 'active',
        priority: 'critical',
        trigger: {
          type: 'event',
          source: 'fraud_detection',
          condition: 'fraud_probability > 0.9'
        },
        conditions: [
          { id: 'c-003', field: 'fraud_probability', operator: 'greater_than', value: 0.9 }
        ],
        actions: [
          { id: 'a-004', type: 'notification', target: 'security_team', parameters: { priority: 'urgent', channel: 'slack' } },
          { id: 'a-005', type: 'webhook', target: 'security_system', parameters: { endpoint: '/api/security/alert', method: 'POST' } }
        ],
        executions: 320,
        successRate: 95.2,
        lastExecuted: '2024-01-18T15:15:00Z',
        enabled: true,
        createdBy: 'security_manager',
        createdAt: '2024-01-01'
      },
      {
        id: 'rule-004',
        name: 'Crew Optimization',
        description: 'Optimize crew assignments based on schedule changes',
        status: 'active',
        priority: 'medium',
        trigger: {
          type: 'event',
          source: 'crew_management',
          condition: 'schedule.changed == true'
        },
        conditions: [
          { id: 'c-004', field: 'changed', operator: 'equals', value: true }
        ],
        actions: [
          { id: 'a-006', type: 'update', target: 'crew_assignment', parameters: { action: 'reoptimize', consider_rest: true } }
        ],
        executions: 450,
        successRate: 92.8,
        lastExecuted: '2024-01-18T12:00:00Z',
        enabled: true,
        createdBy: 'crew_manager',
        createdAt: '2024-01-05'
      }
    ]
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
      failed: 'destructive',
      success: 'default',
      failed: 'destructive',
      processing: 'secondary',
      active: 'default',
      paused: 'outline',
      draft: 'secondary'
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] || variants.deployed} className="capitalize">
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
        <div className="flex items-center gap-2">
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
              <ScrollArea className="h-96">
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
                          <div className="grid grid-cols-2 gap-2 text-sm">
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
              </ScrollArea>
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
              <ScrollArea className="h-96">
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
              </ScrollArea>
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
              <ScrollArea className="h-96">
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
                            <div className="flex items-center gap-2">
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
                            <div className="grid grid-cols-3 gap-2 text-sm">
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
              </ScrollArea>
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
                <div className="grid grid-cols-2 gap-4">
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
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Bolt className="h-4 w-4" />
                    Trigger Configuration
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
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
                    <h4 className="font-medium flex items-center gap-2">
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
                      <div key={condition.id} className="flex items-center gap-2 p-3 bg-secondary/20 rounded-sm">
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
                    <h4 className="font-medium flex items-center gap-2">
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
                      <div key={action.id} className="flex items-center gap-2 p-3 bg-secondary/20 rounded-sm">
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
                      <div className="flex items-center gap-2">
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
                  <div className="grid grid-cols-2 gap-4">
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
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-4 gap-4">
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
                  <div className="grid grid-cols-3 gap-2 text-sm">
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
                  <div className="grid grid-cols-3 gap-4 text-sm">
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

                <div className="grid grid-cols-2 gap-4 text-sm">
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
            </ScrollArea>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prediction Details</DialogTitle>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <h4 className="font-medium mb-3 flex items-center gap-2">
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
                  <h4 className="font-medium mb-3 flex items-center gap-2">
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
