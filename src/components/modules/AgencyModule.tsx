'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { 
  Building2, 
  DollarSign, 
  Calculator, 
  Shield, 
  Bell, 
  Users,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  Activity,
  Target,
  Lock,
  Unlock,
  CreditCard,
  AlertOctagon,
  TrendingDown,
  Globe,
  MapPin,
  Phone,
  Mail,
  FileWarning,
  Scale,
  Gavel,
  Ban,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap
} from 'lucide-react'
import { useAirlineStore, type Agency, type ADM } from '@/lib/store'

// Fraud detection interfaces
interface FraudAlert {
  id: string
  agencyCode: string
  type: 'high_value_transaction' | 'rapid_booking' | 'unusual_pattern' | 'suspicious_payment' | 'refund_anomaly' | 'multiple_cancellations'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  transactionId?: string
  amount?: number
  detectedAt: string
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  riskScore: number
  details: {
    metric: string
    value: number
    threshold: number
  }[]
}

interface AgencyRestriction {
  id: string
  agencyCode: string
  type: 'booking_restriction' | 'route_restriction' | 'payment_restriction' | 'credit_hold' | 'suspension'
  reason: string
  appliedAt: string
  appliedBy: string
  expiresAt?: string
  isActive: boolean
  details: {
    restrictionType?: string
    affectedRoutes?: string[]
    paymentMethods?: string[]
    creditBlocked?: boolean
  }
}

interface ADMWorkflow {
  adm: ADM
  currentStage: 'draft' | 'review' | 'approval' | 'dispute' | 'settlement' | 'closed'
  approver?: string
  approvalDate?: string
  disputeReason?: string
  settlementAmount?: number
  settlementDate?: string
  history: {
    stage: string
    status: string
    timestamp: string
    actor: string
    notes?: string
  }[]
}

export default function AgencyModule() {
  const { agencies, adms, addAgency, issueADM, updateAgencyCredit, resolveADM } = useAirlineStore()
  const [activeTab, setActiveTab] = useState('fraud-detection')
  const [showAgencyDialog, setShowAgencyDialog] = useState(false)
  const [showADMDialog, setShowADMDialog] = useState(false)
  const [showRestrictionDialog, setShowRestrictionDialog] = useState(false)
  const [showFraudDetailDialog, setShowFraudDetailDialog] = useState(false)
  const [showADMWorkflowDialog, setShowADMWorkflowDialog] = useState(false)

  const [newAgency, setNewAgency] = useState({
    code: '',
    name: '',
    type: 'iata' as const,
    tier: 'silver' as const,
    creditLimit: 50000
  })

  const [newADM, setNewADM] = useState({
    agencyCode: '',
    type: 'fare_discrepancy' as const,
    amount: 0,
    reason: '',
    ticketNumbers: ''
  })

  const [newRestriction, setNewRestriction] = useState({
    agencyCode: '',
    type: 'booking_restriction' as const,
    reason: '',
    expiresAt: '',
    restrictionType: '',
    affectedRoutes: [] as string[]
  })

  const [selectedFraudAlert, setSelectedFraudAlert] = useState<FraudAlert | null>(null)
  const [selectedADM, setSelectedADM] = useState<ADM | null>(null)

  // Mock fraud alerts data
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([
    {
      id: 'FR-001',
      agencyCode: 'AGT001',
      type: 'high_value_transaction',
      severity: 'high',
      description: 'Unusually high-value transaction detected - $45,000 in single booking',
      transactionId: 'TXN-2024-12345',
      amount: 45000,
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'investigating',
      riskScore: 85,
      details: [
        { metric: 'Transaction Amount', value: 45000, threshold: 25000 },
        { metric: 'Historical Average', value: 2500, threshold: 25000 }
      ]
    },
    {
      id: 'FR-002',
      agencyCode: 'AGT003',
      type: 'rapid_booking',
      severity: 'medium',
      description: 'Rapid booking pattern - 15 bookings in 30 minutes',
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      riskScore: 62,
      details: [
        { metric: 'Bookings per Hour', value: 30, threshold: 10 }
      ]
    },
    {
      id: 'FR-003',
      agencyCode: 'AGT002',
      type: 'multiple_cancellations',
      severity: 'critical',
      description: 'High cancellation rate - 80% cancellation rate in last 24h',
      detectedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      riskScore: 92,
      details: [
        { metric: 'Cancellation Rate', value: 80, threshold: 30 },
        { metric: 'Cancelled Bookings', value: 12, threshold: 5 }
      ]
    },
    {
      id: 'FR-004',
      agencyCode: 'AGT005',
      type: 'suspicious_payment',
      severity: 'high',
      description: 'Payment from high-risk location detected',
      transactionId: 'TXN-2024-12349',
      amount: 8200,
      detectedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'investigating',
      riskScore: 78,
      details: [
        { metric: 'Risk Score', value: 78, threshold: 60 },
        { metric: 'Location Risk', value: 85, threshold: 70 }
      ]
    },
    {
      id: 'FR-005',
      agencyCode: 'AGT001',
      type: 'refund_anomaly',
      severity: 'medium',
      description: 'Unusual refund pattern - multiple refunds for same route',
      transactionId: 'TXN-2024-12352',
      amount: 3500,
      detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'resolved',
      riskScore: 55,
      details: [
        { metric: 'Refund Count (24h)', value: 5, threshold: 3 }
      ]
    }
  ])

  // Mock agency restrictions
  const [agencyRestrictions, setAgencyRestrictions] = useState<AgencyRestriction[]>([
    {
      id: 'RES-001',
      agencyCode: 'AGT003',
      type: 'credit_hold',
      reason: 'Credit limit exceeded - temporary hold until payment received',
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      appliedBy: 'system',
      isActive: true,
      details: {
        creditBlocked: true
      }
    },
    {
      id: 'RES-002',
      agencyCode: 'AGT002',
      type: 'route_restriction',
      reason: 'High cancellation rate on specific routes - restriction pending review',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      appliedBy: 'fraud_team',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      details: {
        restrictionType: 'partial',
        affectedRoutes: ['JFK-LHR', 'JFK-PAR', 'LAX-TYO']
      }
    },
    {
      id: 'RES-003',
      agencyCode: 'AGT005',
      type: 'payment_restriction',
      reason: 'Suspicious payment activity - card payments restricted',
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      appliedBy: 'risk_management',
      isActive: true,
      details: {
        paymentMethods: ['credit_card', 'debit_card']
      }
    }
  ])

  // Mock ADM workflows
  const [admWorkflows, setAdmWorkflows] = useState<ADMWorkflow[]>([
    {
      adm: {
        id: 'ADM-001',
        number: 'ADM-2024-001',
        agencyId: '1',
        agencyCode: 'AGT001',
        type: 'fare_discrepancy',
        amount: 2500,
        currency: 'USD',
        reason: 'Incorrect fare applied - booking in lower class than ticketed',
        ticketNumbers: ['176-1234567890', '176-1234567891'],
        pnrNumbers: ['ABC123'],
        status: 'issued',
        issuedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        notes: []
      },
      currentStage: 'review',
      approver: 'John Smith',
      approvalDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      history: [
        { stage: 'draft', status: 'created', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), actor: 'system', notes: 'ADM created automatically' },
        { stage: 'review', status: 'pending', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), actor: 'system' },
        { stage: 'review', status: 'assigned', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), actor: 'John Smith', notes: 'Assigned for review' }
      ]
    },
    {
      adm: {
        id: 'ADM-002',
        number: 'ADM-2024-002',
        agencyId: '2',
        agencyCode: 'AGT002',
        type: 'refund_violation',
        amount: 5800,
        currency: 'USD',
        reason: 'Refund processed outside ticket rules - non-refundable fare',
        ticketNumbers: ['176-9876543210'],
        pnrNumbers: ['DEF456'],
        status: 'disputed',
        issuedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        disputedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        disputeReason: 'Agency claims passenger was eligible for refund due to medical emergency',
        notes: ['Medical documentation received', 'Under review']
      },
      currentStage: 'dispute',
      history: [
        { stage: 'draft', status: 'created', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), actor: 'system' },
        { stage: 'review', status: 'approved', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), actor: 'Mary Johnson' },
        { stage: 'dispute', status: 'disputed', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), actor: 'AGT002', notes: 'Agency disputed with medical documentation' }
      ]
    },
    {
      adm: {
        id: 'ADM-003',
        number: 'ADM-2024-003',
        agencyId: '3',
        agencyCode: 'AGT003',
        type: 'ticketing_error',
        amount: 1200,
        currency: 'USD',
        reason: 'Duplicate ticket issued - both tickets need to be voided',
        ticketNumbers: ['176-5555555555', '176-5555555556'],
        pnrNumbers: ['GHI789'],
        status: 'upheld',
        issuedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: ['Agency acknowledged error', 'Payment received']
      },
      currentStage: 'settlement',
      settlementAmount: 1200,
      settlementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      history: [
        { stage: 'draft', status: 'created', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), actor: 'system' },
        { stage: 'review', status: 'approved', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), actor: 'Robert Chen' },
        { stage: 'approval', status: 'upheld', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(), actor: 'Finance Team' },
        { stage: 'settlement', status: 'paid', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), actor: 'system', notes: 'Payment processed successfully' }
      ]
    }
  ])

  // Handlers
  const handleAddAgency = () => {
    addAgency(newAgency)
    setShowAgencyDialog(false)
  }

  const handleIssueADM = () => {
    issueADM({
      ...newADM,
      agencyCode: newADM.agencyCode,
      ticketNumbers: newADM.ticketNumbers.split(',').map(t => t.trim())
    })
    setShowADMDialog(false)
  }

  const handleAddRestriction = () => {
    const restriction: AgencyRestriction = {
      id: `RES-${Date.now()}`,
      ...newRestriction,
      appliedAt: new Date().toISOString(),
      appliedBy: 'current_user',
      isActive: true,
      details: {
        restrictionType: newRestriction.restrictionType,
        affectedRoutes: newRestriction.affectedRoutes
      }
    }
    setAgencyRestrictions([...agencyRestrictions, restriction])
    setShowRestrictionDialog(false)
    setNewRestriction({
      agencyCode: '',
      type: 'booking_restriction',
      reason: '',
      expiresAt: '',
      restrictionType: '',
      affectedRoutes: []
    })
  }

  const handleResolveFraudAlert = (alertId: string) => {
    setFraudAlerts(fraudAlerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
    ))
  }

  const handleDismissFraudAlert = (alertId: string) => {
    setFraudAlerts(fraudAlerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'false_positive' as const } : alert
    ))
  }

  const handleActivateRestriction = (restrictionId: string) => {
    setAgencyRestrictions(agencyRestrictions.map(r =>
      r.id === restrictionId ? { ...r, isActive: true } : r
    ))
  }

  const handleDeactivateRestriction = (restrictionId: string) => {
    setAgencyRestrictions(agencyRestrictions.map(r =>
      r.id === restrictionId ? { ...r, isActive: false } : r
    ))
  }

  const handleApproveADM = (admId: string) => {
    setAdmWorkflows(workflows => workflows.map(wf => {
      if (wf.adm.id === admId) {
        return {
          ...wf,
          adm: { ...wf.adm, status: 'upheld' as const },
          currentStage: 'approval' as const,
          approver: 'current_user',
          approvalDate: new Date().toISOString(),
          history: [...wf.history, {
            stage: 'approval',
            status: 'approved',
            timestamp: new Date().toISOString(),
            actor: 'current_user',
            notes: 'ADM approved and upheld'
          }]
        }
      }
      return wf
    }))
    resolveADM(admId, 'Approved and upheld')
  }

  const handleWaiveADM = (admId: string) => {
    setAdmWorkflows(workflows => workflows.map(wf => {
      if (wf.adm.id === admId) {
        return {
          ...wf,
          adm: { ...wf.adm, status: 'waived' as const },
          currentStage: 'closed' as const,
          history: [...wf.history, {
            stage: 'closed',
            status: 'waived',
            timestamp: new Date().toISOString(),
            actor: 'current_user',
            notes: 'ADM waived - no action required'
          }]
        }
      }
      return wf
    }))
  }

  const handleRecordSettlement = (admId: string, amount: number) => {
    setAdmWorkflows(workflows => workflows.map(wf => {
      if (wf.adm.id === admId) {
        return {
          ...wf,
          adm: { ...wf.adm, status: 'paid' as const, paidDate: new Date().toISOString() },
          currentStage: 'settlement' as const,
          settlementAmount: amount,
          settlementDate: new Date().toISOString(),
          history: [...wf.history, {
            stage: 'settlement',
            status: 'paid',
            timestamp: new Date().toISOString(),
            actor: 'system',
            notes: `Settlement of $${amount} recorded`
          }]
        }
      }
      return wf
    }))
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const openFraudDetail = (alert: FraudAlert) => {
    setSelectedFraudAlert(alert)
    setShowFraudDetailDialog(true)
  }

  const openADMWorkflow = (adm: ADM) => {
    setSelectedADM(adm)
    setShowADMWorkflowDialog(true)
  }

  const getAgencyName = (code: string) => {
    return agencies.find(a => a.code === code)?.name || code
  }

  const getAgencyByCode = (code: string) => {
    return agencies.find(a => a.code === code)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agency Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Fraud Detection, Restrictions, and ADM Workflow Management
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fraud Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fraudAlerts.filter(a => a.status === 'open' || a.status === 'investigating').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">active alerts</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Restrictions</CardTitle>
            <Lock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {agencyRestrictions.filter(r => r.isActive).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">agencies restricted</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending ADMs</CardTitle>
            <FileWarning className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {admWorkflows.filter(wf => ['draft', 'review', 'approval', 'dispute'].includes(wf.currentStage)).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">awaiting action</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ADM Value</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${admWorkflows.reduce((sum, wf) => sum + wf.adm.amount, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">total outstanding</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Risk Score</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(fraudAlerts.reduce((sum, a) => sum + a.riskScore, 0) / fraudAlerts.length) || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">across all alerts</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fraud-detection">
            <ShieldAlert className="h-4 w-4 mr-2" />
            Fraud Detection
          </TabsTrigger>
          <TabsTrigger value="restrictions">
            <Lock className="h-4 w-4 mr-2" />
            Restrictions
          </TabsTrigger>
          <TabsTrigger value="adm-workflow">
            <FileWarning className="h-4 w-4 mr-2" />
            ADM Workflow
          </TabsTrigger>
          <TabsTrigger value="agency-management">
            <Building2 className="h-4 w-4 mr-2" />
            Agencies
          </TabsTrigger>
        </TabsList>

        {/* Fraud Detection Tab */}
        <TabsContent value="fraud-detection" className="space-y-6">
          {/* Fraud Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {fraudAlerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk</CardTitle>
                <AlertOctagon className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {fraudAlerts.filter(a => a.severity === 'high' && a.status !== 'resolved').length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
                <Bell className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {fraudAlerts.filter(a => a.severity === 'medium' && a.status !== 'resolved').length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {fraudAlerts.filter(a => (a.status === 'resolved' || a.status === 'false_positive') && 
                    new Date(a.detectedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fraud Alerts Table */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fraud Alerts</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <CardDescription>
                Monitor and respond to suspicious activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Alert ID</th>
                      <th>Agency</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Risk Score</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Detected</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fraudAlerts.map((alert) => (
                      <tr key={alert.id}>
                        <td className="font-mono text-sm">{alert.id}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getAgencyName(alert.agencyCode)}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant="outline" className="capitalize">
                            {alert.type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td>
                          <Badge className={getSeverityColor(alert.severity)}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {alert.severity}
                          </Badge>
                        </td>
                        <td>
                          <span className={`font-bold ${getRiskScoreColor(alert.riskScore)}`}>
                            {alert.riskScore}
                          </span>
                        </td>
                        <td className="text-sm max-w-xs truncate" title={alert.description}>
                          {alert.description}
                        </td>
                        <td className="text-sm">
                          {alert.amount ? `$${alert.amount.toLocaleString()}` : '-'}
                        </td>
                        <td>
                          <Badge variant={
                            alert.status === 'open' ? 'destructive' :
                            alert.status === 'investigating' ? 'default' :
                            alert.status === 'resolved' ? 'secondary' : 'outline'
                          } className="capitalize">
                            {alert.status}
                          </Badge>
                        </td>
                        <td className="text-sm">
                          {new Date(alert.detectedAt).toLocaleString()}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openFraudDetail(alert)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {alert.status === 'open' || alert.status === 'investigating' ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleResolveFraudAlert(alert.id)}
                                  title="Resolve"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDismissFraudAlert(alert.id)}
                                  title="Dismiss as False Positive"
                                >
                                  <XCircle className="h-4 w-4 text-gray-600" />
                                </Button>
                              </>
                            ) : null}
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

        {/* Restrictions Tab */}
        <TabsContent value="restrictions" className="space-y-6">
          {/* Restriction Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Holds</CardTitle>
                <CreditCard className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {agencyRestrictions.filter(r => r.type === 'credit_hold' && r.isActive).length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Route Restrictions</CardTitle>
                <MapPin className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {agencyRestrictions.filter(r => r.type === 'route_restriction' && r.isActive).length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Restrictions</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {agencyRestrictions.filter(r => r.type === 'payment_restriction' && r.isActive).length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspended Agencies</CardTitle>
                <Ban className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {agencyRestrictions.filter(r => r.type === 'suspension' && r.isActive).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Restrictions List */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agency Restrictions</CardTitle>
                <Dialog open={showRestrictionDialog} onOpenChange={setShowRestrictionDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Lock className="h-4 w-4 mr-2" />
                      Add Restriction
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Agency Restriction</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Agency</Label>
                        <Select value={newRestriction.agencyCode} onValueChange={(v) => setNewRestriction({...newRestriction, agencyCode: v})}>
                          <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
                          <SelectContent>
                            {agencies.map(agency => (
                              <SelectItem key={agency.id} value={agency.code}>{agency.name} ({agency.code})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Restriction Type</Label>
                        <Select value={newRestriction.type} onValueChange={(v: any) => setNewRestriction({...newRestriction, type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="booking_restriction">Booking Restriction</SelectItem>
                            <SelectItem value="route_restriction">Route Restriction</SelectItem>
                            <SelectItem value="payment_restriction">Payment Restriction</SelectItem>
                            <SelectItem value="credit_hold">Credit Hold</SelectItem>
                            <SelectItem value="suspension">Full Suspension</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newRestriction.type === 'route_restriction' && (
                        <div>
                          <Label>Restriction Scope</Label>
                          <Select value={newRestriction.restrictionType} onValueChange={(v) => setNewRestriction({...newRestriction, restrictionType: v})}>
                            <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Restriction</SelectItem>
                              <SelectItem value="partial">Partial (Specific Routes)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div>
                        <Label>Reason</Label>
                        <Textarea value={newRestriction.reason} onChange={(e) => setNewRestriction({...newRestriction, reason: e.target.value})} placeholder="Enter reason for restriction..." />
                      </div>
                      <div>
                        <Label>Expires At (Optional)</Label>
                        <Input type="date" value={newRestriction.expiresAt} onChange={(e) => setNewRestriction({...newRestriction, expiresAt: e.target.value})} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRestrictionDialog(false)}>Cancel</Button>
                      <Button onClick={handleAddRestriction}>Apply Restriction</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Manage agency restrictions and credit holds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Restriction ID</th>
                      <th>Agency</th>
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Applied By</th>
                      <th>Applied At</th>
                      <th>Expires</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencyRestrictions.map((restriction) => (
                      <tr key={restriction.id}>
                        <td className="font-mono text-sm">{restriction.id}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getAgencyName(restriction.agencyCode)}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={restriction.isActive ? 'destructive' : 'secondary'} className="capitalize">
                            {restriction.type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="text-sm max-w-xs truncate" title={restriction.reason}>
                          {restriction.reason}
                        </td>
                        <td className="text-sm">{restriction.appliedBy}</td>
                        <td className="text-sm">{new Date(restriction.appliedAt).toLocaleDateString()}</td>
                        <td className="text-sm">
                          {restriction.expiresAt ? new Date(restriction.expiresAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                          <Badge variant={restriction.isActive ? 'destructive' : 'secondary'} className="capitalize">
                            {restriction.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            {restriction.isActive ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeactivateRestriction(restriction.id)}
                                title="Deactivate"
                              >
                                <Unlock className="h-4 w-4 text-green-600" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleActivateRestriction(restriction.id)}
                                title="Activate"
                              >
                                <Lock className="h-4 w-4 text-orange-600" />
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

        {/* ADM Workflow Tab */}
        <TabsContent value="adm-workflow" className="space-y-6">
          {/* ADM Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
                <FileText className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {admWorkflows.filter(wf => wf.currentStage === 'draft').length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Review</CardTitle>
                <Eye className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {admWorkflows.filter(wf => wf.currentStage === 'review').length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disputed</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {admWorkflows.filter(wf => wf.currentStage === 'dispute').length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Settlement</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {admWorkflows.filter(wf => wf.currentStage === 'approval' && wf.adm.status !== 'paid').length}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Settled</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {admWorkflows.filter(wf => wf.currentStage === 'settlement').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ADM Workflow List */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ADM Workflow Management</CardTitle>
                <Dialog open={showADMDialog} onOpenChange={setShowADMDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <FileWarning className="h-4 w-4 mr-2" />
                      Issue New ADM
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Issue Agency Debit Memo (ADM)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Agency</Label>
                          <Select value={newADM.agencyCode} onValueChange={(v) => setNewADM({...newADM, agencyCode: v})}>
                            <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
                            <SelectContent>
                              {agencies.map(agency => (
                                <SelectItem key={agency.id} value={agency.code}>{agency.name} ({agency.code})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>ADM Type</Label>
                          <Select value={newADM.type} onValueChange={(v: any) => setNewADM({...newADM, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fare_discrepancy">Fare Discrepancy</SelectItem>
                              <SelectItem value="refund_violation">Refund Violation</SelectItem>
                              <SelectItem value="ticketing_error">Ticketing Error</SelectItem>
                              <SelectItem value="documentation">Documentation Issue</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Amount ($)</Label>
                          <Input type="number" value={newADM.amount || ''} onChange={(e) => setNewADM({...newADM, amount: Number(e.target.value)})} placeholder="0.00" />
                        </div>
                        <div>
                          <Label>Ticket Numbers (comma separated)</Label>
                          <Input value={newADM.ticketNumbers} onChange={(e) => setNewADM({...newADM, ticketNumbers: e.target.value})} placeholder="176-1234567890, 176-1234567891" />
                        </div>
                      </div>
                      <div>
                        <Label>Reason</Label>
                        <Textarea value={newADM.reason} onChange={(e) => setNewADM({...newADM, reason: e.target.value})} placeholder="Provide detailed reason for ADM..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowADMDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleIssueADM}>Issue ADM</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Track and manage Agency Debit Memos through approval workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>ADM #</th>
                      <th>Agency</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Reason</th>
                      <th>Stage</th>
                      <th>Status</th>
                      <th>Issued</th>
                      <th>Due</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admWorkflows.map((workflow) => (
                      <tr key={workflow.adm.id}>
                        <td className="font-mono text-sm">{workflow.adm.number}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getAgencyName(workflow.adm.agencyCode)}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant="outline" className="capitalize">
                            {workflow.adm.type.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="text-sm text-red-600 font-medium">
                          ${workflow.adm.amount.toLocaleString()}
                        </td>
                        <td className="text-sm max-w-xs truncate" title={workflow.adm.reason}>
                          {workflow.adm.reason}
                        </td>
                        <td>
                          <Badge 
                            variant={
                              workflow.currentStage === 'draft' ? 'secondary' :
                              workflow.currentStage === 'review' ? 'default' :
                              workflow.currentStage === 'dispute' ? 'destructive' :
                              workflow.currentStage === 'approval' ? 'default' :
                              'secondary'
                            } 
                            className="capitalize"
                          >
                            {workflow.currentStage}
                          </Badge>
                        </td>
                        <td>
                          <Badge 
                            variant={
                              workflow.adm.status === 'issued' ? 'destructive' :
                              workflow.adm.status === 'disputed' ? 'default' :
                              workflow.adm.status === 'upheld' ? 'default' :
                              workflow.adm.status === 'paid' ? 'secondary' :
                              'secondary'
                            } 
                            className="capitalize"
                          >
                            {workflow.adm.status}
                          </Badge>
                        </td>
                        <td className="text-sm">
                          {new Date(workflow.adm.issuedDate).toLocaleDateString()}
                        </td>
                        <td className="text-sm">
                          {new Date(workflow.adm.dueDate).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openADMWorkflow(workflow.adm)}
                              title="View Workflow"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {workflow.currentStage === 'review' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleApproveADM(workflow.adm.id)}
                                title="Approve ADM"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {workflow.currentStage === 'dispute' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleWaiveADM(workflow.adm.id)}
                                title="Waive ADM"
                              >
                                <XCircle className="h-4 w-4 text-gray-600" />
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

        {/* Agency Management Tab */}
        <TabsContent value="agency-management" className="space-y-6">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agency Management</CardTitle>
                <Dialog open={showAgencyDialog} onOpenChange={setShowAgencyDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Agency
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Agency</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Agency Code</Label>
                          <Input value={newAgency.code} onChange={(e) => setNewAgency({...newAgency, code: e.target.value})} placeholder="AGT001" />
                        </div>
                        <div>
                          <Label>Agency Name</Label>
                          <Input value={newAgency.name} onChange={(e) => setNewAgency({...newAgency, name: e.target.value})} />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select value={newAgency.type} onValueChange={(v: any) => setNewAgency({...newAgency, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="iata">IATA</SelectItem>
                              <SelectItem value="non_iata">Non-IATA</SelectItem>
                              <SelectItem value="corporate">Corporate</SelectItem>
                              <SelectItem value="ota">OTA</SelectItem>
                              <SelectItem value="tmc">TMC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tier</Label>
                          <Select value={newAgency.tier} onValueChange={(v: any) => setNewAgency({...newAgency, tier: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="platinum">Platinum</SelectItem>
                              <SelectItem value="gold">Gold</SelectItem>
                              <SelectItem value="silver">Silver</SelectItem>
                              <SelectItem value="bronze">Bronze</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Credit Limit ($)</Label>
                          <Input type="number" value={newAgency.creditLimit} onChange={(e) => setNewAgency({...newAgency, creditLimit: Number(e.target.value)})} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAgencyDialog(false)}>Cancel</Button>
                      <Button onClick={handleAddAgency}>Add Agency</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Tier</th>
                      <th>Credit Limit</th>
                      <th>Credit Used</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencies.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No agencies configured
                        </td>
                      </tr>
                    ) : (
                      agencies.map((agency) => {
                        const hasRestriction = agencyRestrictions.some(r => r.agencyCode === agency.code && r.isActive)
                        return (
                          <tr key={agency.id}>
                            <td className="font-mono font-medium">{agency.code}</td>
                            <td className="text-sm">{agency.name}</td>
                            <td><Badge variant="outline" className="uppercase">{agency.type}</Badge></td>
                            <td><Badge variant={agency.tier === 'platinum' ? 'default' : 'secondary'} className="capitalize">{agency.tier}</Badge></td>
                            <td className="text-sm">${agency.credit.limit.toLocaleString()}</td>
                            <td className="text-sm">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                                  <div 
                                    className={`h-2 rounded-full ${agency.credit.used / agency.credit.limit > 0.9 ? 'bg-red-600' : 'bg-green-600'}`}
                                    style={{ width: `${(agency.credit.used / agency.credit.limit) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs">{Math.round((agency.credit.used / agency.credit.limit) * 100)}%</span>
                              </div>
                            </td>
                            <td className="text-sm">{agency.performance.totalBookings}</td>
                            <td className="text-sm">${agency.performance.totalRevenue.toLocaleString()}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <Badge variant={agency.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                                  {agency.status}
                                </Badge>
                                {hasRestriction && (
                                  <Lock className="h-4 w-4 text-orange-600" title="Has active restrictions" />
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Fraud Alert Detail Dialog */}
      <Dialog open={showFraudDetailDialog} onOpenChange={setShowFraudDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Fraud Alert Details
            </DialogTitle>
          </DialogHeader>
          {selectedFraudAlert && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Alert ID</Label>
                  <p className="font-mono">{selectedFraudAlert.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Agency</Label>
                  <p>{getAgencyName(selectedFraudAlert.agencyCode)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="capitalize">{selectedFraudAlert.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Severity</Label>
                  <Badge className={getSeverityColor(selectedFraudAlert.severity)}>
                    {selectedFraudAlert.severity}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Risk Score</Label>
                  <p className={`text-2xl font-bold ${getRiskScoreColor(selectedFraudAlert.riskScore)}`}>
                    {selectedFraudAlert.riskScore}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p>{selectedFraudAlert.amount ? `$${selectedFraudAlert.amount.toLocaleString()}` : '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono">{selectedFraudAlert.transactionId || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Detected At</Label>
                  <p>{new Date(selectedFraudAlert.detectedAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{selectedFraudAlert.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Risk Factors</Label>
                <div className="mt-2 space-y-2">
                  {selectedFraudAlert.details.map((detail, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary rounded">
                      <span className="text-sm">{detail.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{detail.value}</span>
                        <span className="text-muted-foreground">/ {detail.threshold}</span>
                        {detail.value > detail.threshold && (
                          <ArrowUpRight className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFraudDetailDialog(false)}>Close</Button>
            {selectedFraudAlert && (selectedFraudAlert.status === 'open' || selectedFraudAlert.status === 'investigating') && (
              <>
                <Button variant="destructive" onClick={() => {
                  handleDismissFraudAlert(selectedFraudAlert.id)
                  setShowFraudDetailDialog(false)
                }}>
                  Dismiss as False Positive
                </Button>
                <Button onClick={() => {
                  handleResolveFraudAlert(selectedFraudAlert.id)
                  setShowFraudDetailDialog(false)
                }}>
                  Mark as Resolved
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADM Workflow Dialog */}
      <Dialog open={showADMWorkflowDialog} onOpenChange={setShowADMWorkflowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileWarning className="h-5 w-5" />
              ADM Workflow: {selectedADM?.number}
            </DialogTitle>
          </DialogHeader>
          {selectedADM && (() => {
            const workflow = admWorkflows.find(wf => wf.adm.id === selectedADM.id)
            if (!workflow) return null
            return (
              <div className="space-y-6 py-4">
                {/* ADM Details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary rounded">
                  <div>
                    <Label className="text-muted-foreground">Agency</Label>
                    <p className="font-medium">{getAgencyName(workflow.adm.agencyCode)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <p className="capitalize">{workflow.adm.type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="text-xl font-bold text-red-600">${workflow.adm.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant="outline" className="capitalize">{workflow.adm.status}</Badge>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Reason</Label>
                    <p className="text-sm mt-1">{workflow.adm.reason}</p>
                  </div>
                </div>

                {/* Workflow Stage */}
                <div>
                  <Label className="text-muted-foreground">Current Stage</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {['draft', 'review', 'approval', 'dispute', 'settlement', 'closed'].map((stage, i) => {
                      const isActive = workflow.currentStage === stage
                      const isPast = ['draft', 'review', 'approval', 'settlement', 'closed'].indexOf(workflow.currentStage) > i
                      return (
                        <div key={stage} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            isActive ? 'bg-primary text-primary-foreground' :
                            isPast ? 'bg-green-600 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {isPast ? <CheckCircle className="h-4 w-4" /> : i + 1}
                          </div>
                          {i < 5 && <div className={`w-12 h-1 ${isPast ? 'bg-green-600' : 'bg-gray-200'}`} />}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex-1 text-center">Draft</span>
                    <span className="flex-1 text-center">Review</span>
                    <span className="flex-1 text-center">Approval</span>
                    <span className="flex-1 text-center">Dispute</span>
                    <span className="flex-1 text-center">Settlement</span>
                    <span className="flex-1 text-center">Closed</span>
                  </div>
                </div>

                {/* History Timeline */}
                <div>
                  <Label className="text-muted-foreground">Workflow History</Label>
                  <div className="mt-2 space-y-3">
                    {workflow.history.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1 ${
                          item.status === 'approved' || item.status === 'paid' ? 'bg-green-600' :
                          item.status === 'disputed' ? 'bg-red-600' :
                          'bg-blue-600'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{item.stage}: {item.status}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">By: {item.actor}</p>
                          {item.notes && (
                            <p className="text-sm mt-1">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions based on stage */}
                {workflow.currentStage === 'review' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => {
                      handleApproveADM(workflow.adm.id)
                      setShowADMWorkflowDialog(false)
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve and Uplhold
                    </Button>
                  </div>
                )}

                {workflow.currentStage === 'dispute' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => {
                      handleWaiveADM(workflow.adm.id)
                      setShowADMWorkflowDialog(false)
                    }} variant="outline">
                      <XCircle className="h-4 w-4 mr-2" />
                      Waive ADM
                    </Button>
                    <Button onClick={() => {
                      handleApproveADM(workflow.adm.id)
                      setShowADMWorkflowDialog(false)
                    }}>
                      <Gavel className="h-4 w-4 mr-2" />
                      Uplhold ADM
                    </Button>
                  </div>
                )}

                {workflow.currentStage === 'approval' && workflow.adm.status !== 'paid' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => {
                      handleRecordSettlement(workflow.adm.id, workflow.adm.amount)
                      setShowADMWorkflowDialog(false)
                    }}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Record Settlement
                    </Button>
                  </div>
                )}
              </div>
            )
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowADMWorkflowDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
