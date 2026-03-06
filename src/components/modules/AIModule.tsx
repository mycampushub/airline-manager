'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Cpu, 
  Brain, 
  Zap, 
  Settings, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  Activity,
  Target,
  Shield,
  Plus
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function AIModule() {
  const { aiModels, aiPredictions, automationRules, addAIModel, generatePrediction, createAutomationRule } = useAirlineStore()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI & Automation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI Models, Predictive Analytics, and Automation Rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">View All Models</Button>
          <Button>Train New Model</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiModels.length}</div>
            <div className="text-xs text-muted-foreground mt-1">deployed models</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Predictions Today</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiPredictions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">AI predictions generated</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Automation Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{automationRules.length}</div>
            <div className="text-xs text-green-600 mt-1">
              {automationRules.filter(r => r.status === 'active').length} active
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <div className="text-xs text-muted-foreground mt-1">model accuracy</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Deployed AI Models</CardTitle>
                <Button size="sm" onClick={() => addAIModel({ name: 'New Model', type: 'pricing', description: 'Custom AI model' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Model
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Dynamic Pricing Engine', type: 'pricing', accuracy: 94.5, status: 'deployed', lastTrained: '2024-12-01', predictions: 24500 },
                  { name: 'Demand Forecast', type: 'demand_forecast', accuracy: 92.8, status: 'deployed', lastTrained: '2024-11-28', predictions: 18200 },
                  { name: 'Predictive Maintenance', type: 'maintenance_predictive', accuracy: 91.2, status: 'deployed', lastTrained: '2024-11-25', predictions: 8500 },
                  { name: 'Fraud Detection', type: 'fraud_detection', accuracy: 96.3, status: 'deployed', lastTrained: '2024-12-02', predictions: 45200 },
                  { name: 'Customer Personalization', type: 'personalization', accuracy: 88.5, status: 'deployed', lastTrained: '2024-11-20', predictions: 32000 },
                  { name: 'Disruption Recovery', type: 'disruption_recovery', accuracy: 89.7, status: 'deployed', lastTrained: '2024-11-30', predictions: 12500 }
                ].map((model, i) => (
                  <Card key={i} className="enterprise-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{model.name}</CardTitle>
                        <Badge variant="default" className="capitalize">{model.type.replace('_', ' ')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Accuracy</span>
                          <span className="font-medium text-green-600">{model.accuracy}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Predictions</span>
                          <span className="font-medium">{model.predictions.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Last Trained</span>
                          <span className="text-sm">{model.lastTrained}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant="default" className="capitalize">{model.status}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Recent AI Predictions</CardTitle>
              <CardDescription>Latest predictions from AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Model</th>
                      <th>Type</th>
                      <th>Input</th>
                      <th>Prediction</th>
                      <th>Confidence</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiPredictions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No predictions yet
                        </td>
                      </tr>
                    ) : (
                      aiPredictions.slice(0, 20).map((pred) => (
                        <tr key={pred.id || Math.random()}>
                          <td className="text-sm">{new Date(pred.timestamp).toLocaleString()}</td>
                          <td className="text-sm">{pred.modelName}</td>
                          <td className="capitalize text-sm">{pred.type.replace('_', ' ')}</td>
                          <td className="text-sm max-w-xs truncate">{JSON.stringify(pred.input).substring(0, 50)}...</td>
                          <td className="text-sm max-w-xs truncate">{JSON.stringify(pred.output).substring(0, 50)}...</td>
                          <td className="text-sm font-medium">{(pred.confidence * 100).toFixed(1)}%</td>
                          <td>
                            {pred.implemented ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
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

        <TabsContent value="automation">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Automation Rules</CardTitle>
                <Button size="sm" onClick={() => createAutomationRule({ name: 'New Rule', description: 'Automation rule', trigger: { type: 'event' }, actions: [] })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Auto Price Adjustment', desc: 'Adjust prices based on demand', trigger: 'Demand threshold', priority: 'high', executions: 1250, success: 98.5 },
                  { name: 'Delay Notification', desc: 'Notify passengers of delays', trigger: 'Flight delay', priority: 'critical', executions: 85, success: 100 },
                  { name: 'Fraud Alert', desc: 'Flag suspicious bookings', trigger: 'Booking pattern', priority: 'high', executions: 320, success: 95.2 },
                  { name: 'Crew Scheduling', desc: 'Auto-assign crew to flights', trigger: 'Schedule change', priority: 'medium', executions: 450, success: 92.8 },
                  { name: 'Revenue Anomaly', desc: 'Detect revenue anomalies', trigger: 'Revenue deviation', priority: 'high', executions: 180, success: 94.1 },
                  { name: 'Customer Retention', desc: 'Identify at-risk customers', trigger: 'Behavior pattern', priority: 'medium', executions: 890, success: 89.3 }
                ].map((rule, i) => (
                  <Card key={i} className="enterprise-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                        <Badge variant={rule.priority === 'critical' ? 'destructive' : rule.priority === 'high' ? 'secondary' : 'outline'} className="capitalize">
                          {rule.priority}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">{rule.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trigger:</span>
                          <span>{rule.trigger}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Executions:</span>
                          <span className="font-medium">{rule.executions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Success Rate:</span>
                          <span className="font-medium text-green-600">{rule.success}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="flex-1" size="sm">Edit</Button>
                        <Button variant="outline" className="flex-1" size="sm">View Logs</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomaly">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Fraud Detection</CardTitle>
                <CardDescription>AI-powered fraud and anomaly detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-sm">
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
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm text-center">
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-xs text-muted-foreground mt-1">Anomalies Detected</div>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-sm text-center">
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
    </div>
  )
}
