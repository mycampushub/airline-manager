'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
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
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Plug, 
  Globe, 
  Database, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Plus,
  RefreshCw,
  Activity,
  AlertCircle,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  Clock,
  Zap,
  ArrowRight,
  Webhook,
  History,
  BarChart3,
  Key,
  Shield,
  CheckSquare,
  Square,
  Filter,
  Search,
  Download,
  Upload,
  MoreHorizontal,
  ChevronRight,
  XCircle as CloseIcon
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

// Extended interfaces for Integration features
interface ConnectionConfig {
  id: string
  name: string
  type: 'gds' | 'ndc' | 'payment' | 'airport' | 'accounting' | 'crm' | 'loyalty' | 'crew'
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  endpoint: string
  apiKey: string
  apiSecret: string
  authType: 'api_key' | 'oauth2' | 'basic_auth' | 'bearer_token'
  lastSync: string
  lastSuccess: string
  lastError?: string
  metrics: {
    requestsToday: number
    requestsTotal: number
    errorsToday: number
    errorsTotal: number
    avgResponseTime: number
    uptime: number
  }
  config: {
    timeout: number
    retryAttempts: number
    rateLimitPerMinute: number
    enabled: boolean
  }
}

interface WebhookConfig {
  id: string
  name: string
  targetUrl: string
  events: string[]
  headers: Record<string, string>
  secret: string
  status: 'active' | 'paused' | 'error'
  retryPolicy: {
    maxAttempts: number
    backoffSeconds: number
  }
  created: string
  lastTriggered: string
  successRate: number
  deliveryCount: number
  failureCount: number
}

interface WebhookDelivery {
  id: string
  webhookId: string
  webhookName: string
  eventType: string
  payload: Record<string, any>
  targetUrl: string
  status: 'success' | 'failed' | 'retrying' | 'pending'
  statusCode?: number
  attempt: number
  maxAttempts: number
  duration: number
  timestamp: string
  errorMessage?: string
}

interface SyncJob {
  id: string
  name: string
  source: string
  target: string
  type: 'full' | 'incremental' | 'realtime'
  status: 'running' | 'completed' | 'failed' | 'paused' | 'scheduled'
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual'
  lastRun: string
  nextRun: string
  duration: number
  recordsProcessed: number
  recordsFailed: number
  progress: number
  logs: SyncLog[]
}

interface SyncLog {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error'
  message: string
  details?: string
}

export default function IntegrationModule() {
  const { integrations, addIntegration } = useAirlineStore()
  const { toast } = useToast()
  
  // Connections state
  const [connections, setConnections] = useState<ConnectionConfig[]>([])
  const [showConnectionDialog, setShowConnectionDialog] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<ConnectionConfig | null>(null)
  const [showConnectionDetails, setShowConnectionDetails] = useState(false)
  const [connectionFilter, setConnectionFilter] = useState('all')
  
  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
  const [showWebhookDialog, setShowWebhookDialog] = useState(false)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null)
  const [showWebhookDetails, setShowWebhookDetails] = useState(false)
  const [webhookDeliveries, setWebhookDeliveries] = useState<WebhookDelivery[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null)
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false)
  const [availableEvents] = useState([
    'booking.created', 'booking.updated', 'booking.cancelled',
    'flight.scheduled', 'flight.departed', 'flight.arrived', 'flight.delayed',
    'passenger.checked_in', 'passenger.boarded',
    'payment.succeeded', 'payment.failed', 'payment.refunded',
    'crew.assigned', 'crew.replaced'
  ])
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  
  // Sync state
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([])
  const [showSyncDialog, setShowSyncDialog] = useState(false)
  const [selectedSync, setSelectedSync] = useState<SyncJob | null>(null)
  const [showSyncDetails, setShowSyncDetails] = useState(false)
  const [syncFilter, setSyncFilter] = useState('all')
  
  // Connection form state
  const [newConnection, setNewConnection] = useState({
    name: '',
    type: 'gds' as const,
    provider: 'amadeus' as const,
    endpoint: '',
    apiKey: '',
    apiSecret: '',
    authType: 'api_key' as const
  })
  
  // Webhook form state
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    targetUrl: '',
    secret: ''
  })
  
  // Sync form state
  const [newSync, setNewSync] = useState({
    name: '',
    source: '',
    target: '',
    type: 'incremental' as const,
    frequency: 'hourly' as const
  })
  
  const initializedRef = useRef(false)

  // Initialize mock data functions
  const initializeConnections = () => {
    const connData: ConnectionConfig[] = [
      {
        id: 'conn-001',
        name: 'Amadeus Production',
        type: 'gds',
        provider: 'amadeus',
        status: 'connected',
        endpoint: 'https://api.amadeus.com/v1',
        apiKey: 'amadeus_prod_***',
        apiSecret: '************',
        authType: 'oauth2',
        lastSync: '2024-01-18T15:30:00Z',
        lastSuccess: '2024-01-18T15:30:00Z',
        metrics: {
          requestsToday: 45230,
          requestsTotal: 1542390,
          errorsToday: 12,
          errorsTotal: 234,
          avgResponseTime: 180,
          uptime: 99.95
        },
        config: {
          timeout: 30000,
          retryAttempts: 3,
          rateLimitPerMinute: 1000,
          enabled: true
        }
      },
      {
        id: 'conn-002',
        name: 'Sabre GDS',
        type: 'gds',
        provider: 'sabre',
        status: 'connected',
        endpoint: 'https://api.sabre.com/v2',
        apiKey: 'sabre_prod_***',
        apiSecret: '************',
        authType: 'bearer_token',
        lastSync: '2024-01-18T15:25:00Z',
        lastSuccess: '2024-01-18T15:25:00Z',
        metrics: {
          requestsToday: 38920,
          requestsTotal: 1298450,
          errorsToday: 8,
          errorsTotal: 189,
          avgResponseTime: 210,
          uptime: 99.92
        },
        config: {
          timeout: 30000,
          retryAttempts: 3,
          rateLimitPerMinute: 800,
          enabled: true
        }
      },
      {
        id: 'conn-003',
        name: 'Stripe Payment',
        type: 'payment',
        provider: 'stripe',
        status: 'connected',
        endpoint: 'https://api.stripe.com/v1',
        apiKey: 'sk_live_***',
        apiSecret: '************',
        authType: 'api_key',
        lastSync: '2024-01-18T15:35:00Z',
        lastSuccess: '2024-01-18T15:35:00Z',
        metrics: {
          requestsToday: 15420,
          requestsTotal: 523450,
          errorsToday: 3,
          errorsTotal: 45,
          avgResponseTime: 120,
          uptime: 99.98
        },
        config: {
          timeout: 15000,
          retryAttempts: 2,
          rateLimitPerMinute: 500,
          enabled: true
        }
      },
      {
        id: 'conn-004',
        name: 'JFK AODB',
        type: 'airport',
        provider: 'sita',
        status: 'connected',
        endpoint: 'https://aodb.jfk.aero/api',
        apiKey: 'jfk_aodb_***',
        apiSecret: '************',
        authType: 'api_key',
        lastSync: '2024-01-18T15:28:00Z',
        lastSuccess: '2024-01-18T15:28:00Z',
        metrics: {
          requestsToday: 2340,
          requestsTotal: 156780,
          errorsToday: 0,
          errorsTotal: 12,
          avgResponseTime: 95,
          uptime: 99.99
        },
        config: {
          timeout: 10000,
          retryAttempts: 2,
          rateLimitPerMinute: 200,
          enabled: true
        }
      },
      {
        id: 'conn-005',
        name: 'LHR BHS',
        type: 'airport',
        provider: 'sita',
        status: 'error',
        endpoint: 'https://bhs.lhr.aero/api',
        apiKey: 'lhr_bhs_***',
        apiSecret: '************',
        authType: 'api_key',
        lastSync: '2024-01-18T14:15:00Z',
        lastSuccess: '2024-01-18T12:30:00Z',
        lastError: 'Connection timeout after 10 seconds',
        metrics: {
          requestsToday: 1890,
          requestsTotal: 98760,
          errorsToday: 25,
          errorsTotal: 156,
          avgResponseTime: 450,
          uptime: 97.45
        },
        config: {
          timeout: 10000,
          retryAttempts: 2,
          rateLimitPerMinute: 150,
          enabled: true
        }
      }
    ]
    setConnections(connData)
  }

  const initializeWebhooks = () => {
    const webhookData: WebhookConfig[] = [
      {
        id: 'web-001',
        name: 'Booking Notifications',
        targetUrl: 'https://partner.example.com/webhooks/bookings',
        events: ['booking.created', 'booking.updated', 'booking.cancelled'],
        headers: {
          'X-Webhook-Secret': 'secret_key',
          'Content-Type': 'application/json'
        },
        secret: 'whsec_***',
        status: 'active',
        retryPolicy: {
          maxAttempts: 3,
          backoffSeconds: 60
        },
        created: '2024-01-01',
        lastTriggered: '2024-01-18T15:30:00Z',
        successRate: 99.5,
        deliveryCount: 12450,
        failureCount: 62
      },
      {
        id: 'web-002',
        name: 'Flight Status Updates',
        targetUrl: 'https://app.example.com/flight-updates',
        events: ['flight.scheduled', 'flight.departed', 'flight.arrived', 'flight.delayed'],
        headers: {
          'Authorization': 'Bearer token',
          'Content-Type': 'application/json'
        },
        secret: 'whsec_***',
        status: 'active',
        retryPolicy: {
          maxAttempts: 5,
          backoffSeconds: 30
        },
        created: '2024-01-05',
        lastTriggered: '2024-01-18T15:25:00Z',
        successRate: 98.2,
        deliveryCount: 8760,
        failureCount: 160
      },
      {
        id: 'web-003',
        name: 'Payment Events',
        targetUrl: 'https://billing.example.com/payments',
        events: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
        headers: {
          'X-Partner-Id': 'partner_123',
          'Content-Type': 'application/json'
        },
        secret: 'whsec_***',
        status: 'active',
        retryPolicy: {
          maxAttempts: 3,
          backoffSeconds: 120
        },
        created: '2024-01-10',
        lastTriggered: '2024-01-18T15:35:00Z',
        successRate: 99.9,
        deliveryCount: 45230,
        failureCount: 45
      }
    ]
    setWebhooks(webhookData)
  }

  const initializeWebhookDeliveries = () => {
    const deliveryData: WebhookDelivery[] = [
      {
        id: 'del-001',
        webhookId: 'web-001',
        webhookName: 'Booking Notifications',
        eventType: 'booking.created',
        payload: { bookingId: 'BK-001', pnr: 'ABC123', passengerCount: 2, totalAmount: 450.00 },
        targetUrl: 'https://partner.example.com/webhooks/bookings',
        status: 'success',
        statusCode: 200,
        attempt: 1,
        maxAttempts: 3,
        duration: 245,
        timestamp: '2024-01-18T15:30:00Z'
      },
      {
        id: 'del-002',
        webhookId: 'web-002',
        webhookName: 'Flight Status Updates',
        eventType: 'flight.delayed',
        payload: { flightId: 'FL-001', flightNumber: 'AA123', delayMinutes: 45, reason: 'weather' },
        targetUrl: 'https://app.example.com/flight-updates',
        status: 'failed',
        attempt: 3,
        maxAttempts: 5,
        duration: 0,
        timestamp: '2024-01-18T15:20:00Z',
        errorMessage: 'Connection timeout after 30 seconds'
      },
      {
        id: 'del-003',
        webhookId: 'web-003',
        webhookName: 'Payment Events',
        eventType: 'payment.succeeded',
        payload: { paymentId: 'PAY-001', amount: 299.99, currency: 'USD', bookingId: 'BK-002' },
        targetUrl: 'https://billing.example.com/payments',
        status: 'success',
        statusCode: 200,
        attempt: 1,
        maxAttempts: 3,
        duration: 180,
        timestamp: '2024-01-18T15:35:00Z'
      },
      {
        id: 'del-004',
        webhookId: 'web-001',
        webhookName: 'Booking Notifications',
        eventType: 'booking.updated',
        payload: { bookingId: 'BK-003', pnr: 'XYZ789', changes: ['seat_assignment', 'special_meal'] },
        targetUrl: 'https://partner.example.com/webhooks/bookings',
        status: 'retrying',
        attempt: 2,
        maxAttempts: 3,
        duration: 0,
        timestamp: '2024-01-18T15:25:00Z',
        errorMessage: '503 Service Unavailable - retrying in 60s'
      }
    ]
    setWebhookDeliveries(deliveryData)
  }

  const initializeSyncJobs = () => {
    const syncData: SyncJob[] = [
      {
        id: 'sync-001',
        name: 'GDS Flight Schedule Sync',
        source: 'Amadeus GDS',
        target: 'Internal Database',
        type: 'incremental',
        status: 'running',
        frequency: 'hourly',
        lastRun: '2024-01-18T14:00:00Z',
        nextRun: '2024-01-18T16:00:00Z',
        duration: 180,
        recordsProcessed: 2450,
        recordsFailed: 0,
        progress: 75,
        logs: [
          { id: 'log-001', timestamp: '2024-01-18T15:00:00Z', level: 'info', message: 'Sync job started' },
          { id: 'log-002', timestamp: '2024-01-18T15:01:00Z', level: 'info', message: 'Fetching flight schedules from Amadeus' },
          { id: 'log-003', timestamp: '2024-01-18T15:02:00Z', level: 'info', message: 'Processing 2450 flight records' },
          { id: 'log-004', timestamp: '2024-01-18T15:03:00Z', level: 'info', message: '75% complete - 1837 records processed' }
        ]
      },
      {
        id: 'sync-002',
        name: 'Crew Data Sync',
        source: 'Crew Management System',
        target: 'Flight Ops',
        type: 'incremental',
        status: 'completed',
        frequency: 'daily',
        lastRun: '2024-01-18T02:00:00Z',
        nextRun: '2024-01-19T02:00:00Z',
        duration: 95,
        recordsProcessed: 450,
        recordsFailed: 0,
        progress: 100,
        logs: [
          { id: 'log-005', timestamp: '2024-01-18T02:00:00Z', level: 'info', message: 'Daily crew sync started' },
          { id: 'log-006', timestamp: '2024-01-18T02:01:00Z', level: 'info', message: '450 crew records synced successfully' },
          { id: 'log-007', timestamp: '2024-01-18T02:01:35Z', level: 'info', message: 'Sync job completed successfully' }
        ]
      },
      {
        id: 'sync-003',
        name: 'Passenger Data Sync',
        source: 'PNR Database',
        target: 'Analytics Warehouse',
        type: 'full',
        status: 'failed',
        frequency: 'weekly',
        lastRun: '2024-01-17T03:00:00Z',
        nextRun: '2024-01-24T03:00:00Z',
        duration: 0,
        recordsProcessed: 12450,
        recordsFailed: 320,
        progress: 45,
        logs: [
          { id: 'log-008', timestamp: '2024-01-17T03:00:00Z', level: 'info', message: 'Weekly full sync started' },
          { id: 'log-009', timestamp: '2024-01-17T03:15:00Z', level: 'warning', message: 'Slow response from database' },
          { id: 'log-010', timestamp: '2024-01-17T03:20:00Z', level: 'error', message: 'Connection timeout - 320 records failed' },
          { id: 'log-011', timestamp: '2024-01-17T03:20:00Z', level: 'error', message: 'Sync job failed' }
        ]
      },
      {
        id: 'sync-004',
        name: 'Real-time Baggage Tracking',
        source: 'BHS Systems',
        target: 'DCS',
        type: 'realtime',
        status: 'running',
        frequency: 'realtime',
        lastRun: '2024-01-18T15:35:00Z',
        nextRun: 'Continuous',
        duration: 3600,
        recordsProcessed: 8920,
        recordsFailed: 5,
        progress: 100,
        logs: [
          { id: 'log-012', timestamp: '2024-01-18T12:00:00Z', level: 'info', message: 'Real-time baggage tracking started' },
          { id: 'log-013', timestamp: '2024-01-18T15:30:00Z', level: 'warning', message: '5 baggage records failed to sync from LHR BHS' },
          { id: 'log-014', timestamp: '2024-01-18T15:35:00Z', level: 'info', message: '8920 baggage records processed' }
        ]
      }
    ]
    setSyncJobs(syncData)
  }

  // Initialize all mock data on component mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    setTimeout(() => {
      initializeConnections()
      initializeWebhooks()
      initializeWebhookDeliveries()
      initializeSyncJobs()
    }, 0)
  }, [])

  // Handlers for Connections
  const handleAddConnection = () => {
    const newConn: ConnectionConfig = {
      id: `conn-${Date.now()}`,
      name: newConnection.name,
      type: newConnection.type,
      provider: newConnection.provider,
      status: 'pending',
      endpoint: newConnection.endpoint,
      apiKey: newConnection.apiKey,
      apiSecret: newConnection.apiSecret,
      authType: newConnection.authType,
      lastSync: new Date().toISOString(),
      lastSuccess: '',
      metrics: {
        requestsToday: 0,
        requestsTotal: 0,
        errorsToday: 0,
        errorsTotal: 0,
        avgResponseTime: 0,
        uptime: 100
      },
      config: {
        timeout: 30000,
        retryAttempts: 3,
        rateLimitPerMinute: 500,
        enabled: true
      }
    }
    setConnections([...connections, newConn])
    setShowConnectionDialog(false)
    setNewConnection({ name: '', type: 'gds', provider: 'amadeus', endpoint: '', apiKey: '', apiSecret: '', authType: 'api_key' })
  }

  const handleTestConnection = (connId: string) => {
    setConnections(prev =>
      prev.map(c =>
        c.id === connId
          ? { ...c, status: 'connected' as const, lastSuccess: new Date().toISOString() }
          : c
      )
    )
  }

  const handleToggleConnection = (connId: string) => {
    setConnections(prev =>
      prev.map(c =>
        c.id === connId
          ? { ...c, config: { ...c.config, enabled: !c.config.enabled }, status: c.config.enabled ? 'disconnected' as const : 'connected' as const }
          : c
      )
    )
  }

  const handleDeleteConnection = (connId: string) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      setConnections(prev => prev.filter(c => c.id !== connId))
    }
  }

  // Handlers for Webhooks
  const handleAddWebhook = () => {
    const newHook: WebhookConfig = {
      id: `web-${Date.now()}`,
      name: newWebhook.name,
      targetUrl: newWebhook.targetUrl,
      events: selectedEvents,
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': newWebhook.secret
      },
      secret: newWebhook.secret,
      status: 'active',
      retryPolicy: {
        maxAttempts: 3,
        backoffSeconds: 60
      },
      created: new Date().toISOString().split('T')[0],
      lastTriggered: '',
      successRate: 100,
      deliveryCount: 0,
      failureCount: 0
    }
    setWebhooks([...webhooks, newHook])
    setShowWebhookDialog(false)
    setNewWebhook({ name: '', targetUrl: '', secret: '' })
    setSelectedEvents([])
  }

  const handleToggleWebhook = (webhookId: string) => {
    setWebhooks(prev =>
      prev.map(w =>
        w.id === webhookId
          ? { ...w, status: w.status === 'active' ? 'paused' as const : 'active' as const }
          : w
      )
    )
  }

  const handleDeleteWebhook = (webhookId: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      setWebhooks(prev => prev.filter(w => w.id !== webhookId))
    }
  }

  const handleToggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    )
  }

  // Handlers for Sync Jobs
  const handleAddSync = () => {
    const newJob: SyncJob = {
      id: `sync-${Date.now()}`,
      name: newSync.name,
      source: newSync.source,
      target: newSync.target,
      type: newSync.type,
      status: 'scheduled',
      frequency: newSync.frequency,
      lastRun: '-',
      nextRun: new Date().toISOString(),
      duration: 0,
      recordsProcessed: 0,
      recordsFailed: 0,
      progress: 0,
      logs: [{ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), level: 'info', message: 'Sync job created' }]
    }
    setSyncJobs([...syncJobs, newJob])
    setShowSyncDialog(false)
    setNewSync({ name: '', source: '', target: '', type: 'incremental', frequency: 'hourly' })
  }

  const handleRunSync = (syncId: string) => {
    setSyncJobs(prev =>
      prev.map(s =>
        s.id === syncId
          ? { ...s, status: 'running' as const, progress: 0, logs: [...s.logs, { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), level: 'info', message: 'Sync job started' }] }
          : s
      )
    )
  }

  const handlePauseSync = (syncId: string) => {
    setSyncJobs(prev =>
      prev.map(s =>
        s.id === syncId
          ? { ...s, status: 'paused' as const }
          : s
      )
    )
  }

  const handleDeleteSync = (syncId: string) => {
    if (confirm('Are you sure you want to delete this sync job?')) {
      setSyncJobs(prev => prev.filter(s => s.id !== syncId))
    }
  }

  // Additional handlers for Integration Module
  const handleFilterDeliveries = () => {
    toast({ title: 'Filter Applied', description: 'Webhook deliveries filtered' })
  }

  const handleExportDeliveries = () => {
    const headers = ['ID', 'Event', 'Status', 'Timestamp', 'Attempts']
    const rows = webhookDeliveries.map(d => [d.id, d.event, d.status, d.timestamp, d.attempts])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'webhook-deliveries.csv'
    link.click()
    toast({ title: 'Deliveries Exported', description: 'Webhook deliveries exported to CSV' })
  }

  const handleRetryDelivery = (deliveryId: string) => {
    setWebhookDeliveries(deliveries => deliveries.map(d => 
      d.id === deliveryId ? { ...d, status: 'pending', attempts: d.attempts + 1 } : d
    ))
    toast({ title: 'Delivery Retried', description: `Retrying delivery: ${deliveryId}` })
  }

  // Utility functions
  const getConnectionStatusBadge = (status: string) => {
    const variants = {
      connected: 'default',
      disconnected: 'secondary',
      error: 'destructive',
      pending: 'outline'
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] || variants.pending} className="capitalize">
        {status}
      </Badge>
    )
  }

  const getSyncStatusBadge = (status: string) => {
    const colors = {
      running: 'bg-blue-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      paused: 'bg-yellow-500',
      scheduled: 'bg-gray-500'
    }
    return (
      <Badge className={`${colors[status as keyof typeof colors] || colors.scheduled} capitalize`}>
        {status}
      </Badge>
    )
  }

  const getLogLevelBadge = (level: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-700',
      warning: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700'
    }
    return (
      <Badge className={colors[level as keyof typeof colors] || colors.info} variant="outline">
        {level.toUpperCase()}
      </Badge>
    )
  }

  // Calculate summary metrics
  const activeConnections = connections.filter(c => c.status === 'connected' && c.config.enabled).length
  const totalRequests = connections.reduce((sum, c) => sum + c.metrics.requestsToday, 0)
  const avgSuccessRate = connections.length > 0
    ? Math.round((1 - connections.reduce((sum, c) => sum + c.metrics.errorsToday, 0) / totalRequests) * 100)
    : 100
  const avgResponseTime = connections.length > 0
    ? Math.round(connections.reduce((sum, c) => sum + c.metrics.avgResponseTime, 0) / connections.length)
    : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Integrations</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connections, Webhooks, and Sync Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            initializeConnections()
            initializeWebhooks()
            initializeWebhookDeliveries()
            initializeSyncJobs()
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Connections</CardTitle>
            <Plug className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConnections}</div>
            <div className="text-xs text-muted-foreground mt-1">of {connections.length} total</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">API Requests Today</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">total requests</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgSuccessRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">across all integrations</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <div className="text-xs text-muted-foreground mt-1">average latency</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Webhooks</CardTitle>
            <Webhook className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{webhooks.filter(w => w.status === 'active').length}</div>
            <div className="text-xs text-muted-foreground mt-1">of {webhooks.length} total</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sync">Sync Monitoring</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery Logs</TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>External Connections</CardTitle>
                  <CardDescription>Manage GDS, payment gateways, and system integrations</CardDescription>
                </div>
                <Button onClick={() => setShowConnectionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={connectionFilter} onValueChange={setConnectionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="gds">GDS</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="airport">Airport Systems</SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Connection</th>
                      <th>Type</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Requests Today</th>
                      <th>Errors</th>
                      <th>Response Time</th>
                      <th>Uptime</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No connections configured
                        </td>
                      </tr>
                    ) : (
                      connections
                        .filter(c => connectionFilter === 'all' || c.type === connectionFilter)
                        .map((conn) => (
                        <tr key={conn.id}>
                          <td className="font-medium">
                            <div>{conn.name}</div>
                            <div className="text-xs text-muted-foreground">{conn.endpoint}</div>
                          </td>
                          <td className="capitalize">{conn.type}</td>
                          <td className="capitalize">{conn.provider}</td>
                          <td>{getConnectionStatusBadge(conn.status)}</td>
                          <td className="font-medium">{conn.metrics.requestsToday.toLocaleString()}</td>
                          <td className={conn.metrics.errorsToday > 0 ? 'text-red-600 font-medium' : ''}>
                            {conn.metrics.errorsToday}
                          </td>
                          <td>{conn.metrics.avgResponseTime}ms</td>
                          <td>{conn.metrics.uptime}%</td>
                          <td>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedConnection(conn); setShowConnectionDetails(true) }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleTestConnection(conn.id)}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Switch
                                checked={conn.config.enabled}
                                onCheckedChange={() => handleToggleConnection(conn.id)}
                              />
                              <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteConnection(conn.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Configure webhooks for real-time event notifications</CardDescription>
                </div>
                <Button onClick={() => setShowWebhookDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {webhooks.length === 0 ? (
                    <div className="text-center py-12">
                      <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No webhooks configured</p>
                    </div>
                  ) : (
                    webhooks.map((webhook) => (
                      <div key={webhook.id} className="p-4 border rounded-sm space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{webhook.name}</h4>
                              <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                                {webhook.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{webhook.targetUrl}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedWebhook(webhook); setShowWebhookDetails(true) }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Switch
                              checked={webhook.status === 'active'}
                              onCheckedChange={() => handleToggleWebhook(webhook.id)}
                            />
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteWebhook(webhook.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <div className="text-muted-foreground">Deliveries</div>
                            <div className="font-medium">{webhook.deliveryCount.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Failures</div>
                            <div className="font-medium text-red-600">{webhook.failureCount}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Success Rate</div>
                            <div className="font-medium text-green-600">{webhook.successRate}%</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Last Triggered</div>
                            <div className="font-medium">{webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : '-'}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Monitoring Tab */}
        <TabsContent value="sync">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sync Jobs</CardTitle>
                  <CardDescription>Monitor and manage data synchronization tasks</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={syncFilter} onValueChange={setSyncFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowSyncDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sync Job
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No sync jobs configured</p>
                  </div>
                ) : (
                  syncJobs
                    .filter(s => syncFilter === 'all' || s.status === syncFilter)
                    .map((sync) => (
                    <div key={sync.id} className="p-4 border rounded-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{sync.name}</h4>
                            {getSyncStatusBadge(sync.status)}
                            <Badge variant="outline" className="capitalize">{sync.frequency}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {sync.source} <ArrowRight className="h-3 w-3 inline mx-1" /> {sync.target}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedSync(sync); setShowSyncDetails(true) }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {sync.status !== 'running' && (
                            <Button variant="ghost" size="sm" onClick={() => handleRunSync(sync.id)}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {sync.status === 'running' && (
                            <Button variant="ghost" size="sm" onClick={() => handlePauseSync(sync.id)}>
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteSync(sync.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {sync.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{sync.progress}%</span>
                          </div>
                          <Progress value={sync.progress} className="h-2" />
                        </div>
                      )}
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Records Processed</div>
                          <div className="font-medium">{sync.recordsProcessed.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Failed</div>
                          <div className={`font-medium ${sync.recordsFailed > 0 ? 'text-red-600' : ''}`}>
                            {sync.recordsFailed}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Last Run</div>
                          <div className="font-medium">{sync.lastRun !== '-' ? new Date(sync.lastRun).toLocaleString() : '-'}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Next Run</div>
                          <div className="font-medium">{sync.nextRun !== 'Continuous' ? new Date(sync.nextRun).toLocaleString() : 'Continuous'}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Logs Tab */}
        <TabsContent value="deliveries">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhook Delivery Logs</CardTitle>
                  <CardDescription>View webhook delivery attempts and status</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleFilterDeliveries}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportDeliveries}>
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
                      <th>Timestamp</th>
                      <th>Webhook</th>
                      <th>Event</th>
                      <th>Status</th>
                      <th>Attempt</th>
                      <th>Duration</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhookDeliveries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No delivery records
                        </td>
                      </tr>
                    ) : (
                      webhookDeliveries.map((delivery) => (
                        <tr key={delivery.id}>
                          <td className="text-sm">{new Date(delivery.timestamp).toLocaleString()}</td>
                          <td className="font-medium">{delivery.webhookName}</td>
                          <td>
                            <Badge variant="outline" className="text-xs">{delivery.eventType}</Badge>
                          </td>
                          <td>
                            <Badge variant={
                              delivery.status === 'success' ? 'default' :
                              delivery.status === 'failed' ? 'destructive' :
                              delivery.status === 'retrying' ? 'secondary' : 'outline'
                            } className="capitalize">
                              {delivery.status}
                            </Badge>
                          </td>
                          <td>{delivery.attempt}/{delivery.maxAttempts}</td>
                          <td>{delivery.duration}ms</td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedDelivery(delivery); setShowDeliveryDialog(true) }}>
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
      </Tabs>

      {/* Add Connection Dialog */}
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Connection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Connection Name</Label>
              <Input value={newConnection.name} onChange={(e) => setNewConnection({...newConnection, name: e.target.value})} placeholder="e.g., Amadeus Production" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={newConnection.type} onValueChange={(v: any) => setNewConnection({...newConnection, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gds">GDS</SelectItem>
                    <SelectItem value="ndc">NDC API</SelectItem>
                    <SelectItem value="payment">Payment Gateway</SelectItem>
                    <SelectItem value="airport">Airport System</SelectItem>
                    <SelectItem value="accounting">Accounting ERP</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Provider</Label>
                <Select value={newConnection.provider} onValueChange={(v: any) => setNewConnection({...newConnection, provider: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amadeus">Amadeus</SelectItem>
                    <SelectItem value="sabre">Sabre</SelectItem>
                    <SelectItem value="travelport">Travelport</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="adyen">Adyen</SelectItem>
                    <SelectItem value="sita">SITA</SelectItem>
                    <SelectItem value="sap">SAP</SelectItem>
                    <SelectItem value="oracle">Oracle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Endpoint URL</Label>
              <Input value={newConnection.endpoint} onChange={(e) => setNewConnection({...newConnection, endpoint: e.target.value})} placeholder="https://api.example.com/v1" />
            </div>
            <div>
              <Label>Authentication Type</Label>
              <Select value={newConnection.authType} onValueChange={(v: any) => setNewConnection({...newConnection, authType: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  <SelectItem value="basic_auth">Basic Auth</SelectItem>
                  <SelectItem value="bearer_token">Bearer Token</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>API Key / Client ID</Label>
                <Input value={newConnection.apiKey} onChange={(e) => setNewConnection({...newConnection, apiKey: e.target.value})} type="password" />
              </div>
              <div>
                <Label>API Secret / Client Secret</Label>
                <Input value={newConnection.apiSecret} onChange={(e) => setNewConnection({...newConnection, apiSecret: e.target.value})} type="password" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectionDialog(false)}>Cancel</Button>
            <Button onClick={handleAddConnection}>
              <Plug className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connection Details Dialog */}
      <Dialog open={showConnectionDetails} onOpenChange={setShowConnectionDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connection Details</DialogTitle>
          </DialogHeader>
          {selectedConnection && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <div className="text-sm font-medium mt-1">{selectedConnection.name}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getConnectionStatusBadge(selectedConnection.status)}</div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="text-sm font-medium mt-1 capitalize">{selectedConnection.type}</div>
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <div className="text-sm font-medium mt-1 capitalize">{selectedConnection.provider}</div>
                  </div>
                  <div className="col-span-2">
                    <Label>Endpoint</Label>
                    <div className="text-sm font-mono mt-1 bg-secondary/20 p-2 rounded">{selectedConnection.endpoint}</div>
                  </div>
                  <div>
                    <Label>Auth Type</Label>
                    <div className="text-sm font-medium mt-1 capitalize">{selectedConnection.authType.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <Label>Last Sync</Label>
                    <div className="text-sm font-medium mt-1">{new Date(selectedConnection.lastSync).toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Metrics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Requests Today</div>
                      <div className="text-lg font-bold">{selectedConnection.metrics.requestsToday.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Errors Today</div>
                      <div className="text-lg font-bold text-red-600">{selectedConnection.metrics.errorsToday}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Avg Response</div>
                      <div className="text-lg font-bold">{selectedConnection.metrics.avgResponseTime}ms</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Total Requests</div>
                      <div className="text-lg font-bold">{selectedConnection.metrics.requestsTotal.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Total Errors</div>
                      <div className="text-lg font-bold">{selectedConnection.metrics.errorsTotal}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Uptime</div>
                      <div className="text-lg font-bold text-green-600">{selectedConnection.metrics.uptime}%</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Configuration</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Timeout</div>
                      <div className="font-medium">{selectedConnection.config.timeout}ms</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Retry Attempts</div>
                      <div className="font-medium">{selectedConnection.config.retryAttempts}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Rate Limit</div>
                      <div className="font-medium">{selectedConnection.config.rateLimitPerMinute}/min</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Enabled</div>
                      <div className="font-medium">{selectedConnection.config.enabled ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>

                {selectedConnection.lastError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{selectedConnection.lastError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectionDetails(false)}>Close</Button>
            <Button onClick={() => selectedConnection && handleTestConnection(selectedConnection.id)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Webhook Name</Label>
              <Input value={newWebhook.name} onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})} placeholder="e.g., Booking Notifications" />
            </div>
            <div>
              <Label>Target URL</Label>
              <Input value={newWebhook.targetUrl} onChange={(e) => setNewWebhook({...newWebhook, targetUrl: e.target.value})} placeholder="https://example.com/webhook" />
            </div>
            <div>
              <Label>Events</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {availableEvents.map((event) => (
                  <div key={event} className="flex items-center gap-2 p-2 border rounded-sm">
                    {selectedEvents.includes(event) ? (
                      <CheckSquare className="h-4 w-4 text-primary cursor-pointer" onClick={() => handleToggleEvent(event)} />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => handleToggleEvent(event)} />
                    )}
                    <span className="text-sm">{event}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label>Webhook Secret</Label>
              <Input value={newWebhook.secret} onChange={(e) => setNewWebhook({...newWebhook, secret: e.target.value})} type="password" placeholder="Used for signature verification" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWebhookDialog(false)}>Cancel</Button>
            <Button onClick={handleAddWebhook} disabled={selectedEvents.length === 0}>
              <Webhook className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Details Dialog */}
      <Dialog open={showWebhookDetails} onOpenChange={setShowWebhookDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Webhook Details</DialogTitle>
          </DialogHeader>
          {selectedWebhook && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <div className="text-sm font-medium mt-1">{selectedWebhook.name}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge variant={selectedWebhook.status === 'active' ? 'default' : 'secondary'}>
                        {selectedWebhook.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label>Target URL</Label>
                    <div className="text-sm font-mono mt-1 bg-secondary/20 p-2 rounded break-all">{selectedWebhook.targetUrl}</div>
                  </div>
                </div>

                <div>
                  <Label>Events</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedWebhook.events.map((event) => (
                      <Badge key={event} variant="outline">{event}</Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Statistics</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Deliveries</div>
                      <div className="text-lg font-bold">{selectedWebhook.deliveryCount.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Failures</div>
                      <div className="text-lg font-bold text-red-600">{selectedWebhook.failureCount}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                      <div className="text-lg font-bold text-green-600">{selectedWebhook.successRate}%</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Last Triggered</div>
                      <div className="text-sm font-medium">{selectedWebhook.lastTriggered ? new Date(selectedWebhook.lastTriggered).toLocaleString() : '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Retry Policy</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Max Attempts</div>
                      <div className="font-medium">{selectedWebhook.retryPolicy.maxAttempts}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Backoff</div>
                      <div className="font-medium">{selectedWebhook.retryPolicy.backoffSeconds}s</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Headers</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(selectedWebhook.headers).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium w-1/3">{key}:</span>
                        <span className="text-muted-foreground break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWebhookDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Sync Job Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Sync Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Job Name</Label>
              <Input value={newSync.name} onChange={(e) => setNewSync({...newSync, name: e.target.value})} placeholder="e.g., GDS Flight Schedule Sync" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Source System</Label>
                <Input value={newSync.source} onChange={(e) => setNewSync({...newSync, source: e.target.value})} placeholder="e.g., Amadeus GDS" />
              </div>
              <div>
                <Label>Target System</Label>
                <Input value={newSync.target} onChange={(e) => setNewSync({...newSync, target: e.target.value})} placeholder="e.g., Internal Database" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sync Type</Label>
                <Select value={newSync.type} onValueChange={(v: any) => setNewSync({...newSync, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Sync</SelectItem>
                    <SelectItem value="incremental">Incremental</SelectItem>
                    <SelectItem value="realtime">Real-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequency</Label>
                <Select value={newSync.frequency} onValueChange={(v: any) => setNewSync({...newSync, frequency: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>Cancel</Button>
            <Button onClick={handleAddSync}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Create Sync Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Job Details Dialog */}
      <Dialog open={showSyncDetails} onOpenChange={setShowSyncDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sync Job Details</DialogTitle>
          </DialogHeader>
          {selectedSync && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <div className="text-sm font-medium mt-1">{selectedSync.name}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getSyncStatusBadge(selectedSync.status)}</div>
                  </div>
                  <div>
                    <Label>Source</Label>
                    <div className="text-sm font-medium mt-1">{selectedSync.source}</div>
                  </div>
                  <div>
                    <Label>Target</Label>
                    <div className="text-sm font-medium mt-1">{selectedSync.target}</div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="text-sm font-medium mt-1 capitalize">{selectedSync.type}</div>
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <div className="text-sm font-medium mt-1 capitalize">{selectedSync.frequency}</div>
                  </div>
                </div>

                {selectedSync.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{selectedSync.progress}%</span>
                    </div>
                    <Progress value={selectedSync.progress} className="h-2" />
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Statistics</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Records Processed</div>
                      <div className="text-lg font-bold">{selectedSync.recordsProcessed.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Failed</div>
                      <div className="text-lg font-bold text-red-600">{selectedSync.recordsFailed}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="text-lg font-bold">{selectedSync.duration}s</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                      <div className="text-lg font-bold text-green-600">
                        {selectedSync.recordsProcessed > 0
                          ? Math.round(((selectedSync.recordsProcessed - selectedSync.recordsFailed) / selectedSync.recordsProcessed) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Last Run</div>
                    <div className="font-medium">{selectedSync.lastRun !== '-' ? new Date(selectedSync.lastRun).toLocaleString() : '-'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Next Run</div>
                    <div className="font-medium">{selectedSync.nextRun !== 'Continuous' ? new Date(selectedSync.nextRun).toLocaleString() : 'Continuous'}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Execution Logs</h4>
                  <ScrollArea className="h-48 border rounded-sm p-2">
                    <div className="space-y-2">
                      {selectedSync.logs.map((log) => (
                        <div key={log.id} className="text-sm">
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            {getLogLevelBadge(log.level)}
                            <span>{log.message}</span>
                          </div>
                          {log.details && (
                            <div className="text-xs text-muted-foreground mt-1 ml-32">{log.details}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDetails(false)}>Close</Button>
            {selectedSync && selectedSync.status !== 'running' && (
              <Button onClick={() => { handleRunSync(selectedSync.id); setShowSyncDetails(false) }}>
                <Play className="h-4 w-4 mr-2" />
                Run Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Delivery Details Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Webhook Delivery Details</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Webhook</Label>
                    <div className="text-sm font-medium mt-1">{selectedDelivery.webhookName}</div>
                  </div>
                  <div>
                    <Label>Event Type</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedDelivery.eventType}</Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      <Badge variant={
                        selectedDelivery.status === 'success' ? 'default' :
                        selectedDelivery.status === 'failed' ? 'destructive' :
                        selectedDelivery.status === 'retrying' ? 'secondary' : 'outline'
                      } className="capitalize">
                        {selectedDelivery.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Timestamp</Label>
                    <div className="text-sm font-medium mt-1">{new Date(selectedDelivery.timestamp).toLocaleString()}</div>
                  </div>
                  <div>
                    <Label>Attempt</Label>
                    <div className="text-sm font-medium mt-1">{selectedDelivery.attempt} / {selectedDelivery.maxAttempts}</div>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <div className="text-sm font-medium mt-1">{selectedDelivery.duration}ms</div>
                  </div>
                  {selectedDelivery.statusCode && (
                    <div>
                      <Label>Status Code</Label>
                      <div className="text-sm font-medium mt-1">{selectedDelivery.statusCode}</div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Target URL</h4>
                  <div className="text-sm font-mono bg-secondary/20 p-2 rounded break-all">{selectedDelivery.targetUrl}</div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Payload</h4>
                  <div className="text-sm font-mono bg-secondary/20 p-2 rounded overflow-x-auto">
                    <pre>{JSON.stringify(selectedDelivery.payload, null, 2)}</pre>
                  </div>
                </div>

                {selectedDelivery.errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{selectedDelivery.errorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>Close</Button>
            {selectedDelivery && selectedDelivery.status === 'failed' && (
              <Button onClick={() => handleRetryDelivery(selectedDelivery.id)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Delivery
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
