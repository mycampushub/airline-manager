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
import { Slider } from '@/components/ui/slider'
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  Lock, 
  Key,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  UserCheck,
  Bell,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Smartphone,
  Mail,
  CreditCard,
  MapPin,
  Activity,
  ShieldCheck,
  AlertOctagon,
  Fingerprint,
  Wifi,
  Database,
  Server,
  Globe,
  UserX,
  CheckSquare,
  Square,
  MoreHorizontal,
  ChevronRight,
  AlertCircle as AlertWarningIcon,
  AlertCircle,
  Info,
  Plus,
  ArrowRight,
  Save,
  LogOut,
  Monitor,
  History,
  Scan,
  Zap,
  Bug
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

// Extended interfaces for Security features
interface MFAMethod {
  id: string
  name: string
  type: 'sms' | 'email' | 'authenticator' | 'hardware_key'
  enabled: boolean
  description: string
  setupDate?: string
  lastUsed?: string
  icon: React.ReactNode
}

interface Session {
  id: string
  userId: string
  userName: string
  device: string
  browser: string
  ip: string
  location: string
  loginTime: string
  lastActivity: string
  status: 'active' | 'expired' | 'terminated'
  currentSession: boolean
}

interface SecurityAlert {
  id: string
  type: 'brute_force' | 'suspicious_login' | 'malware_detected' | 'data_breach' | 'unauthorized_access'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  sourceIp: string
  target: string
  timestamp: string
  status: 'open' | 'investigating' | 'resolved' | 'false_positive'
  assignedTo?: string
  notes: string[]
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  createdAt: string
  system: boolean
}

interface AuditLogDetail {
  id: string
  timestamp: string
  userId: string
  username: string
  action: string
  module: string
  entity: string
  entityId: string
  oldValue?: string
  newValue?: string
  ipAddress: string
  userAgent: string
  result: 'success' | 'failure'
  riskScore: number
  metadata?: Record<string, any>
}

interface ComplianceCheck {
  id: string
  name: string
  framework: string
  status: 'compliant' | 'non_compliant' | 'in_progress' | 'not_applicable'
  lastAuditDate: string
  nextAuditDate: string
  score: number
  requirements: {
    total: number
    passed: number
    failed: number
    inProgress: number
  }
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAgeDays: number
  preventReuse: number
  historyRetention: number
}

export default function SecurityModule() {
  const { users, auditLogs, securityEvents } = useAirlineStore()
  
  // MFA state
  const [mfaMethods, setMfaMethods] = useState<MFAMethod[]>([])
  const [showMFADialog, setShowMFADialog] = useState(false)
  const [mfaSetupMethod, setMfaSetupMethod] = useState<string>('sms')
  
  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([])
  const [showSessionDialog, setShowSessionDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  
  // Security Alerts state
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [alertFilter, setAlertFilter] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'false_positive'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  
  // Roles & Permissions state
  const [roles, setRoles] = useState<Role[]>([])
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  
  // Audit Logs state
  const [detailedAuditLogs, setDetailedAuditLogs] = useState<AuditLogDetail[]>([])
  const [auditFilter, setAuditFilter] = useState({
    module: 'all',
    action: 'all',
    result: 'all',
    dateRange: '7d'
  })
  
  // Compliance state
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([])
  
  // Password Policy state
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>({
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAgeDays: 90,
    preventReuse: 5,
    historyRetention: 10
  })
  
  // Ref to prevent duplicate initialization
  const initializedRef = useRef(false)

  // Initialize mock data functions
  const initializeMFAMethods = () => {
    const methods: MFAMethod[] = [
      {
        id: 'mfa-001',
        name: 'SMS Authentication',
        type: 'sms',
        enabled: true,
        description: 'Receive one-time codes via SMS',
        setupDate: '2024-01-10',
        lastUsed: '2024-01-18T14:30:00Z',
        icon: <Smartphone className="h-5 w-5" />
      },
      {
        id: 'mfa-002',
        name: 'Email Authentication',
        type: 'email',
        enabled: true,
        description: 'Receive one-time codes via email',
        setupDate: '2024-01-05',
        lastUsed: '2024-01-17T09:15:00Z',
        icon: <Mail className="h-5 w-5" />
      },
      {
        id: 'mfa-003',
        name: 'Authenticator App',
        type: 'authenticator',
        enabled: false,
        description: 'TOTP codes via Google/Microsoft Authenticator',
        icon: <Smartphone className="h-5 w-5" />
      },
      {
        id: 'mfa-004',
        name: 'Hardware Security Key',
        type: 'hardware_key',
        enabled: false,
        description: 'YubiKey or similar hardware token',
        icon: <Key className="h-5 w-5" />
      }
    ]
    setMfaMethods(methods)
  }

  const initializeSessions = () => {
    const sessionData: Session[] = [
      {
        id: 'sess-001',
        userId: 'user-001',
        userName: 'John Smith',
        device: 'MacBook Pro',
        browser: 'Chrome 120',
        ip: '192.168.1.100',
        location: 'New York, US',
        loginTime: '2024-01-18T08:00:00Z',
        lastActivity: '2024-01-18T15:30:00Z',
        status: 'active',
        currentSession: true
      },
      {
        id: 'sess-002',
        userId: 'user-001',
        userName: 'John Smith',
        device: 'iPhone 15',
        browser: 'Safari Mobile',
        ip: '192.168.1.105',
        location: 'New York, US',
        loginTime: '2024-01-17T14:00:00Z',
        lastActivity: '2024-01-17T18:30:00Z',
        status: 'expired',
        currentSession: false
      },
      {
        id: 'sess-003',
        userId: 'user-002',
        userName: 'Sarah Johnson',
        device: 'Windows 11',
        browser: 'Edge 120',
        ip: '192.168.1.110',
        location: 'London, GB',
        loginTime: '2024-01-18T09:00:00Z',
        lastActivity: '2024-01-18T15:45:00Z',
        status: 'active',
        currentSession: false
      },
      {
        id: 'sess-004',
        userId: 'user-003',
        userName: 'Mike Wilson',
        device: 'iPhone 14',
        browser: 'Safari Mobile',
        ip: '192.168.1.120',
        location: 'Unknown',
        loginTime: '2024-01-16T10:30:00Z',
        lastActivity: '2024-01-16T12:00:00Z',
        status: 'terminated',
        currentSession: false
      }
    ]
    setSessions(sessionData)
  }

  const initializeSecurityAlerts = () => {
    const alerts: SecurityAlert[] = [
      {
        id: 'alert-001',
        type: 'brute_force',
        severity: 'high',
        title: 'Brute Force Attack Detected',
        description: 'Multiple failed login attempts detected from IP 198.51.100.42 targeting user accounts',
        sourceIp: '198.51.100.42',
        target: 'Multiple User Accounts',
        timestamp: '2024-01-18T14:30:00Z',
        status: 'investigating',
        assignedTo: 'security-team@airline.com',
        notes: ['IP blocked temporarily', 'Affected users notified', 'Monitoring for follow-up attacks']
      },
      {
        id: 'alert-002',
        type: 'suspicious_login',
        severity: 'medium',
        title: 'Suspicious Login Activity',
        description: 'Login from unusual location (Russia) for user with US-based history',
        sourceIp: '91.107.234.56',
        target: 'john.smith@airline.com',
        timestamp: '2024-01-18T10:15:00Z',
        status: 'open',
        notes: ['User contacted for verification', 'Account temporarily locked']
      },
      {
        id: 'alert-003',
        type: 'data_breach',
        severity: 'critical',
        title: 'Potential Data Breach Detected',
        description: 'Unusual data export activity detected from admin account',
        sourceIp: '192.168.1.50',
        target: 'Admin Dashboard',
        timestamp: '2024-01-15T03:45:00Z',
        status: 'resolved',
        assignedTo: 'it-security@airline.com',
        notes: ['Investigation completed', 'Was authorized activity by admin', 'No actual breach']
      }
    ]
    setSecurityAlerts(alerts)
  }

  const initializeRoles = () => {
    const roleData: Role[] = [
      {
        id: 'role-001',
        name: 'Super Admin',
        description: 'Full system access including all modules and settings',
        permissions: ['all'],
        userCount: 2,
        createdAt: '2024-01-01',
        system: true
      },
      {
        id: 'role-002',
        name: 'Flight Ops Manager',
        description: 'Access to flight operations, schedule management, and dispatch',
        permissions: ['flights.read', 'flights.write', 'dispatch.read', 'dispatch.write', 'crew.read', 'crew.write'],
        userCount: 5,
        createdAt: '2024-01-01',
        system: false
      },
      {
        id: 'role-003',
        name: 'Revenue Manager',
        description: 'Access to pricing, revenue analytics, and reporting',
        permissions: ['pricing.read', 'pricing.write', 'revenue.read', 'revenue.write', 'reports.read'],
        userCount: 3,
        createdAt: '2024-01-01',
        system: false
      },
      {
        id: 'role-004',
        name: 'Customer Service Agent',
        description: 'Access to customer data, PNR management, and complaint handling',
        permissions: ['customers.read', 'customers.write', 'pnrs.read', 'pnrs.write', 'complaints.read', 'complaints.write'],
        userCount: 15,
        createdAt: '2024-01-01',
        system: false
      },
      {
        id: 'role-005',
        name: 'View Only',
        description: 'Read-only access to assigned modules',
        permissions: ['dashboard.read', 'flights.read', 'revenue.read', 'customers.read'],
        userCount: 8,
        createdAt: '2024-01-01',
        system: false
      }
    ]
    setRoles(roleData)
  }

  const initializeDetailedAuditLogs = () => {
    const logs: AuditLogDetail[] = [
      {
        id: 'audit-001',
        timestamp: '2024-01-18T15:45:00Z',
        userId: 'user-001',
        username: 'john.smith',
        action: 'update',
        module: 'flight-ops',
        entity: 'FlightInstance',
        entityId: 'FL-001',
        oldValue: '{"status": "scheduled", "gate": "A12"}',
        newValue: '{"status": "delayed", "gate": "A15"}',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        result: 'success',
        riskScore: 0.1,
        metadata: { reason: 'weather_delay' }
      },
      {
        id: 'audit-002',
        timestamp: '2024-01-18T14:30:00Z',
        userId: 'user-002',
        username: 'sarah.johnson',
        action: 'create',
        module: 'crew',
        entity: 'CrewSchedule',
        entityId: 'CS-001',
        newValue: '{"crewId": "crew-001", "flightId": "FL-001", "position": "Captain"}',
        ipAddress: '192.168.1.110',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        result: 'success',
        riskScore: 0.05,
        metadata: { autoGenerated: true }
      },
      {
        id: 'audit-003',
        timestamp: '2024-01-18T13:15:00Z',
        userId: 'user-003',
        username: 'mike.wilson',
        action: 'delete',
        module: 'dcs',
        entity: 'Baggage',
        entityId: 'BG-001',
        oldValue: '{"status": "checked_in"}',
        ipAddress: '192.168.1.120',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)',
        result: 'failure',
        riskScore: 0.8,
        metadata: { reason: 'permission_denied', user_not_authorized: true }
      },
      {
        id: 'audit-004',
        timestamp: '2024-01-18T12:00:00Z',
        userId: 'user-001',
        username: 'john.smith',
        action: 'login',
        module: 'auth',
        entity: 'Session',
        entityId: 'sess-001',
        newValue: '{"deviceId": "device-001", "mfaVerified": true}',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        result: 'success',
        riskScore: 0.05,
        metadata: { mfaMethod: 'authenticator', loginType: 'successful' }
      },
      {
        id: 'audit-005',
        timestamp: '2024-01-18T10:30:00Z',
        userId: 'user-004',
        username: 'emily.chen',
        action: 'export',
        module: 'analytics',
        entity: 'Report',
        entityId: 'RPT-001',
        newValue: '{"reportType": "revenue", "period": "30d", "format": "pdf"}',
        ipAddress: '10.0.0.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        result: 'success',
        riskScore: 0.02,
        metadata: { reportSize: '2.4MB', 'records': 1520 }
      }
    ]
    setDetailedAuditLogs(logs)
  }

  const initializeComplianceChecks = () => {
    const checks: ComplianceCheck[] = [
      {
        id: 'comp-001',
        name: 'PCI-DSS',
        framework: 'PCI DSS v4.0',
        status: 'compliant',
        lastAuditDate: '2024-12-01',
        nextAuditDate: '2025-12-01',
        score: 98,
        requirements: {
          total: 285,
          passed: 279,
          failed: 0,
          inProgress: 6
        },
        findings: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      },
      {
        id: 'comp-002',
        name: 'GDPR',
        framework: 'GDPR',
        status: 'compliant',
        lastAuditDate: '2024-11-15',
        nextAuditDate: '2025-11-15',
        score: 95,
        requirements: {
          total: 93,
          passed: 88,
          failed: 0,
          inProgress: 5
        },
        findings: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 5
        }
      },
      {
        id: 'comp-003',
        name: 'SOC 2 Type II',
        framework: 'SOC 2',
        status: 'in_progress',
        lastAuditDate: '2024-06-15',
        nextAuditDate: '2024-12-31',
        score: 87,
        requirements: {
          total: 208,
          passed: 180,
          failed: 12,
          inProgress: 16
        },
        findings: {
          critical: 2,
          high: 5,
          medium: 5,
          low: 5
        }
      },
      {
        id: 'comp-004',
        name: 'ISO 27001:2013',
        framework: 'ISO 27001',
        status: 'compliant',
        lastAuditDate: '2024-10-20',
        nextAuditDate: '2025-10-20',
        score: 92,
        requirements: {
          total: 114,
          passed: 105,
          failed: 0,
          inProgress: 9
        },
        findings: {
          critical: 0,
          high: 1,
          medium: 3,
          low: 5
        }
      },
      {
        id: 'comp-005',
        name: 'NIST CSF',
        framework: 'NIST Cybersecurity Framework',
        status: 'in_progress',
        lastAuditDate: '2024-09-01',
        nextAuditDate: '2025-03-01',
        score: 82,
        requirements: {
          total: 108,
          passed: 85,
          failed: 8,
          inProgress: 15
        },
        findings: {
          critical: 1,
          high: 3,
          medium: 4,
          low: 0
        }
      },
      {
        id: 'comp-006',
        name: 'HIPAA',
        framework: 'HIPAA',
        status: 'not_applicable',
        lastAuditDate: '-',
        nextAuditDate: '-',
        score: 0,
        requirements: { total: 0, passed: 0, failed: 0, inProgress: 0 },
        findings: { critical: 0, high: 0, medium: 0, low: 0 }
      }
    ]
    setComplianceChecks(checks)
  }

  // Initialize all mock data on component mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    setTimeout(() => {
      initializeMFAMethods()
      initializeSessions()
      initializeSecurityAlerts()
      initializeRoles()
      initializeDetailedAuditLogs()
      initializeComplianceChecks()
    }, 0)
  }, [])

  // Handlers
  const handleToggleMFA = (methodId: string) => {
    setMfaMethods(prev =>
      prev.map(m =>
        m.id === methodId
          ? { ...m, enabled: !m.enabled }
          : m
      )
    )
  }

  const handleSetupMFA = () => {
    setMfaMethods(prev =>
      prev.map(m =>
        m.id === `mfa-${mfaSetupMethod === 'sms' ? '001' : mfaSetupMethod === 'email' ? '002' : mfaSetupMethod === 'authenticator' ? '003' : '004'}`
          ? { ...m, enabled: true, setupDate: new Date().toISOString().split('T')[0] }
          : m
      )
    )
    setShowMFADialog(false)
  }

  const handleTerminateSession = (sessionId: string) => {
    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? { ...s, status: 'terminated' as const }
          : s
      )
    )
  }

  const handleUpdateAlertStatus = (alertId: string, status: string, note?: string) => {
    setSecurityAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? {
              ...a,
              status: status as any,
              notes: note ? [...a.notes, note] : a.notes
            }
          : a
      )
    )
    setSelectedAlert(null)
    setShowAlertDialog(false)
  }

  const handleSavePasswordPolicy = () => {
    // In production, this would save to backend
    alert('Password policy updated successfully')
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    }
    return (
      <Badge className={colors[severity as keyof typeof colors] || colors.low} variant="default">
        {severity}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      compliant: 'bg-green-500',
      in_progress: 'bg-yellow-500',
      non_compliant: 'bg-red-500',
      not_applicable: 'bg-gray-500'
    }
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.not_applicable} variant="default">
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getAlertStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      investigating: 'secondary',
      resolved: 'default',
      false_positive: 'outline'
    }
    return (
      <Badge variant={variants[status as keyof typeof variants] || variants.open} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Security & Compliance</h2>
          <p className="text-sm text-muted-foreground mt-1">
            RBAC, MFA, Audit Trail, Fraud Monitoring, and Compliance Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            initializeMFAMethods()
            initializeSessions()
            initializeSecurityAlerts()
            initializeDetailedAuditLogs()
            initializeComplianceChecks()
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
            <div className="text-xs text-muted-foreground mt-1">of {users.length} total</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Audit Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detailedAuditLogs.length}</div>
            <div className="text-xs text-muted-foreground">events today</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityAlerts.filter(a => a.status === 'open').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">requiring attention</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">MFA Enabled</CardTitle>
            <Key className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mfaMethods.filter(m => m.enabled).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">methods enabled</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            <Monitor className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {sessions.filter(s => s.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">current sessions</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(complianceChecks.reduce((sum, c) => c.score !== 0 ? sum + c.score : sum, 0) / complianceChecks.filter(c => c.score !== 0).length)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">average score</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rbac" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="rbac">RBAC & Users</TabsTrigger>
          <TabsTrigger value="mfa">MFA Configuration</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Dashboard</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="password">Password Policy</TabsTrigger>
        </TabsList>

        {/* RBAC & Users Tab */}
        <TabsContent value="rbac">
          <div className="space-y-6">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Role-Based Access Control</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export RBAC Matrix
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>MFA</th>
                        <th>Last Login</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted-foreground py-8">
                            No users configured
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td className="font-medium">{user.firstName} {user.lastName}</td>
                            <td>{user.role}</td>
                            <td className="text-sm">{user.department}</td>
                            <td>
                              {user.mfaEnabled ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </td>
                            <td className="text-sm">{new Date(user.lastLogin).toLocaleString()}</td>
                            <td>
                              <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                                {user.status}
                              </Badge>
                            </td>
                            <td>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        {/* MFA Configuration Tab */}
        <TabsContent value="mfa">
          <div className="space-y-6">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Multi-Factor Authentication</CardTitle>
                    <CardDescription>Configure MFA methods for enhanced security</CardDescription>
                  </div>
                  <Button onClick={() => setShowMFADialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Setup New Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mfaMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-sm">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${method.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {method.icon}
                        </div>
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{method.description}</div>
                          {method.setupDate && (
                            <div className="text-xs text-muted-foreground">
                              Setup: {method.setupDate}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={method.enabled}
                          onCheckedChange={() => handleToggleMFA(method.id)}
                        />
                        {method.enabled && method.lastUsed && (
                          <span className="text-xs text-muted-foreground">
                            Last used: {new Date(method.lastUsed).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>MFA Statistics</CardTitle>
                <CardDescription>Usage metrics for MFA authentication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-sm">
                    <div className="text-2xl font-bold">{users.filter(u => u.mfaEnabled).length}</div>
                    <div className="text-sm text-muted-foreground">Users with MFA</div>
                    <div className="text-xs text-green-600 mt-1">
                      {Math.round((users.filter(u => u.mfaEnabled).length / users.length) * 100)}% adoption
                    </div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-sm">
                    <div className="text-2xl font-bold">{mfaMethods.filter(m => m.enabled).length}</div>
                    <div className="text-sm text-muted-foreground">Methods Active</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-sm">
                    <div className="text-2xl font-bold">
                      {detailedAuditLogs.filter(l => l.action === 'login' && l.metadata?.mfaVerified).length}
                    </div>
                    <div className="text-sm text-muted-foreground">MFA Logins Today</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-sm">
                    <div className="text-2xl font-bold text-green-700">99.8%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MFA Setup Dialog */}
          <Dialog open={showMFADialog} onOpenChange={setShowMFADialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Setup MFA Method</DialogTitle>
                <DialogDescription>
                  Choose an authentication method and follow the setup instructions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Select Method</Label>
                  <Select value={mfaSetupMethod} onValueChange={setMfaSetupMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a method..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS Authentication</SelectItem>
                      <SelectItem value="email">Email Authentication</SelectItem>
                      <SelectItem value="authenticator">Authenticator App</SelectItem>
                      <SelectItem value="hardware_key">Hardware Security Key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {mfaSetupMethod === 'sms' && 'You will receive a 6-digit code via SMS for each login attempt'}
                    {mfaSetupMethod === 'email' && 'A 6-digit code will be sent to your registered email'}
                    {mfaSetupMethod === 'authenticator' && 'Scan the QR code with your authenticator app to add your account'}
                    {mfaSetupMethod === 'hardware_key' && 'Insert your security key and follow the prompts to register'}
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMFADialog(false)}>Cancel</Button>
                <Button onClick={handleSetupMFA}>
                  <Fingerprint className="h-4 w-4 mr-2" />
                  Setup Method
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    {sessions.filter(s => s.status === 'active').length} active sessions
                  </CardDescription>
                </div>
                <Button
                  variant="outline" size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to terminate all other sessions except the current one?')) {
                      setSessions(prev =>
                        prev.map(s =>
                          s.currentSession ? s : { ...s, status: 'terminated' as const }
                        )
                      )
                    }
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Terminate All Other Sessions
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Device</th>
                      <th>Browser</th>
                      <th>IP Address</th>
                      <th>Location</th>
                      <th>Session Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td className="font-medium">
                          {session.userName}
                          {session.currentSession && (
                            <Badge variant="secondary" className="ml-2 text-xs">Current</Badge>
                          )}
                        </td>
                        <td className="text-sm">
                          <div className="flex items-center gap-2">
                            {session.device.includes('iPhone') ? <Smartphone className="h-4 w-4 text-blue-600" /> :
                             session.device.includes('Mac') ? <Activity className="h-4 w-4 text-gray-600" /> :
                             <Monitor className="h-4 w-4 text-gray-600" />}
                            {session.device}
                          </div>
                        </td>
                        <td className="text-sm">{session.browser}</td>
                        <td className="font-mono text-sm">{session.ip}</td>
                        <td className="text-sm">{session.location}</td>
                        <td className="text-sm">
                          <div className="flex flex-col">
                            <span>{new Date(session.loginTime).toLocaleDateString()}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(session.lastActivity).toLocaleTimeString()}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={
                            session.status === 'active' ? 'default' :
                            session.status === 'expired' ? 'secondary' : 'outline'
                          } className="capitalize">
                            {session.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td>
                          {!session.currentSession && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTerminateSession(session.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          {session.currentSession && (
                            <Button variant="ghost" size="sm" disabled>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Alerts Tab */}
        <TabsContent value="alerts">
          <div className="space-y-6">
            {/* Alert Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={alertFilter}
                  onValueChange={(v) => setAlertFilter(v as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="false_positive">False Positive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={severityFilter}
                  onValueChange={(v) => setSeverityFilter(v as any)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Alerts Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="enterprise-card border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Critical</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {securityAlerts.filter(a => a.severity === 'critical').length}
                  </div>
                  <div className="text-xs text-muted-foreground">requiring immediate action</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">High</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {securityAlerts.filter(a => a.severity === 'high').length}
                  </div>
                  <div className="text-xs text-muted-foreground">requiring attention</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card border-yellow-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Medium</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {securityAlerts.filter(a => a.severity === 'medium').length}
                  </div>
                  <div className="text-xs text-muted-foreground">monitoring</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Low</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {securityAlerts.filter(a => a.severity === 'low').length}
                  </div>
                  <div className="text-xs text-muted-foreground">informational</div>
                </CardContent>
              </Card>
            </div>

            {/* Security Alerts Table */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Security Alerts</CardTitle>
                <CardDescription>
                  {securityAlerts.filter(a => a.status === 'open').length} open alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {securityAlerts
                      .filter(alert => alertFilter === 'all' || alert.status === alertFilter)
                      .filter(alert => severityFilter === 'all' || alert.severity === severityFilter)
                      .map((alert) => (
                        <div key={alert.id} className={`p-4 border rounded-sm ${
                          alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                          alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                          alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${
                                alert.severity === 'critical' ? 'bg-red-100' :
                                alert.severity === 'high' ? 'bg-orange-100' :
                                alert.severity === 'medium' ? 'bg-yellow-100' :
                                'bg-blue-100'
                              }`}>
                                <AlertTriangle className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  {getSeverityBadge(alert.severity)}
                                  <span className="font-medium">{alert.title}</span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">{alert.description}</div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{alert.sourceIp}</span>
                                  <span>•</span>
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div>
                                {getAlertStatusBadge(alert.status)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAlert(alert)
                                  setShowAlertDialog(true)
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Alert Details Dialog */}
            <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Security Alert Details</DialogTitle>
                  <DialogDescription>
                    {selectedAlert?.title}
                  </DialogDescription>
                </DialogHeader>
                {selectedAlert && (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Alert Type</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getSeverityBadge(selectedAlert.severity)}
                          <span className="font-medium capitalize">{selectedAlert.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div>
                        <Label>Severity</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={selectedAlert.severity === 'critical' ? 'destructive' : selectedAlert.severity === 'high' ? 'secondary' : 'outline'}>
                            {selectedAlert.severity}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label>Source IP</Label>
                        <div className="font-mono text-sm mt-1">{selectedAlert.sourceIp}</div>
                      </div>
                      <div>
                        <Label>Timestamp</Label>
                        <div className="text-sm mt-1">{new Date(selectedAlert.timestamp).toLocaleString()}</div>
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">{selectedAlert.description}</p>
                    </div>

                    <div>
                      <Label>Current Status</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getAlertStatusBadge(selectedAlert.status)}
                        {selectedAlert.assignedTo && (
                          <span className="text-sm text-muted-foreground">• Assigned to: {selectedAlert.assignedTo}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <ScrollArea className="h-32 mt-2 border rounded-lg p-3">
                        <div className="space-y-2">
                          {selectedAlert.notes.map((note, idx) => (
                            <div key={idx} className="text-sm p-2 bg-secondary/20 rounded">
                              {note}
                            </div>
                          ))}
                          {selectedAlert.notes.length === 0 && (
                            <div className="text-sm text-muted-foreground text-center py-2">No notes added yet</div>
                          )}
                        </div>
                      </ScrollArea>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value=""
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                        />
                        <Button onClick={() => handleUpdateAlertStatus(selectedAlert.id, selectedAlert.status, newNote)}>
                          Add Note
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      {selectedAlert.status === 'open' && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'investigating', 'Assigned to security team for investigation')}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            Investigate
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'resolved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </>
                      )}
                      {selectedAlert.status === 'investigating' && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'open', 'Reopened for further investigation')}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Reopen
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'resolved', 'Investigation completed, no issues found')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </>
                      )}
                      {selectedAlert.status === 'resolved' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'open', 'Reopened for further review')}
                        >
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Reopen
                        </Button>
                      )}
                      {selectedAlert.status === 'false_positive' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleUpdateAlertStatus(selectedAlert.id, 'resolved', 'Marked as false positive - no action needed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit">
          <div className="space-y-6">
            {/* Audit Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={auditFilter.module} onValueChange={(v) => setAuditFilter(prev => ({ ...prev, module: v }))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    <SelectItem value="flight-ops">Flight Ops</SelectItem>
                    <SelectItem value="crew">Crew</SelectItem>
                    <SelectItem value="dcs">DCS</SelectItem>
                    <SelectItem value="pss">PSS</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="auth-ops">Auth</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="crm">CRM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search audits..." className="w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground" />
                <Button variant="outline" size="sm">
                  Export Logs
                </Button>
              </div>
            </div>

            {/* Audit Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{detailedAuditLogs.length}</div>
                  <div className="text-xs text-muted-foreground">logged events</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((detailedAuditLogs.filter(l => l.result === 'success').length / detailedAuditLogs.length) * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">successful operations</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Failed Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {detailedAuditLogs.filter(l => l.result === 'failure').length}
                  </div>
                  <div className="text-xs text-muted-foreground">failed operations</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Avg Risk Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(detailedAuditLogs.reduce((sum, l) => sum + l.riskScore, 0) / detailedAuditLogs.length)}
                  </div>
                  <div className="text-xs text-muted-foreground">average risk level</div>
                </CardContent>
              </Card>
            </div>

            {/* Audit Logs Table */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>Detailed system activity log with change tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Module</th>
                        <th>Entity</th>
                        <th>IP Address</th>
                        <th>Risk</th>
                        <th>Result</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedAuditLogs
                        .filter(log => auditFilter.module === 'all' || log.module === auditFilter.module)
                        .slice(0, 50)
                        .map((log) => (
                          <tr key={log.id}>
                            <td className="text-sm whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="text-sm font-medium">{log.username}</td>
                            <td className="text-sm capitalize">{log.action}</td>
                            <td className="text-sm capitalize">{log.module}</td>
                            <td className="text-sm">{log.entity}: {log.entityId}</td>
                            <td className="font-mono text-xs">{log.ipAddress}</td>
                            <td>
                              <span className={`font-bold ${
                                log.riskScore >= 0.8 ? 'text-red-600' :
                                log.riskScore >= 0.5 ? 'text-orange-600' :
                                log.riskScore >= 0.3 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {log.riskScore}
                              </span>
                            </td>
                            <td>
                              {log.result === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                            </td>
                            <td>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAlert({
                                  id: log.id,
                                  type: 'audit_log',
                                  severity: log.riskScore >= 0.8 ? 'critical' : log.riskScore >= 0.5 ? 'high' : log.riskScore >= 0.3 ? 'medium' : 'low',
                                  title: `Audit Log: ${log.action} on ${log.entity}`,
                                  description: `${log.username} performed ${log.action} on ${log.entity} from ${log.ipAddress}`,
                                  sourceIp: log.ipAddress,
                                  target: `${log.entity} (${log.entityId})`,
                                  timestamp: log.timestamp,
                                  status: 'resolved',
                                  notes: []
                                })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
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

        {/* Compliance Dashboard Tab */}
        <TabsContent value="compliance">
          <div className="space-y-6">
            {/* Compliance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(complianceChecks.reduce((sum, c) => c.score !== 0 ? sum + c.score : sum, 0) / complianceChecks.filter(c => c.score !== 0).length)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {complianceChecks.filter(c => c.score !== 0).length} frameworks audited
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {complianceChecks.filter(c => c.status === 'compliant').length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((complianceChecks.filter(c => c.status === 'compliant').length / complianceChecks.length) * 100)}% of frameworks
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {complianceChecks.filter(c => c.status === 'in_progress').length}
                  </div>
                  <div className="text-xs text-muted-foreground">frameworks being audited</div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Non-Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {complianceChecks.filter(c => c.status === 'non_compliant').length}
                  </div>
                  <div className="text-xs text-muted-foreground">requiring immediate action</div>
                </CardContent>
              </Card>
            </div>

            {/* Findings Summary */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Findings Summary</CardTitle>
                <CardDescription>Critical, High, Medium, and Low priority findings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="h-5 w-5 text-red-600" />
                        <span className="font-medium">Critical</span>
                      </div>
                      <div className="text-2xl font-bold text-red-600">
                        {complianceChecks.reduce((sum, c) => sum + c.findings.critical, 0)}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span className="font-medium">High</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {complianceChecks.reduce((sum, c) => sum + c.findings.high, 0)}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertWarningIcon className="h-5 w-5 text-yellow-600" />
                        <span className="font-medium">Medium</span>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {complianceChecks.reduce((sum, c) => sum + c.findings.medium, 0)}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Low</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {complianceChecks.reduce((sum, c) => sum + c.findings.low, 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Framework Details */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Compliance Framework Details</CardTitle>
                <CardDescription>Status of each compliance framework audit</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {complianceChecks.map((check) => (
                      <div key={check.id} className="p-4 border rounded-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{check.name}</span>
                              {getStatusBadge(check.status)}
                              <span className="text-sm text-muted-foreground ml-2">{check.framework}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Last Audit: {check.lastAuditDate} • Next Audit: {check.nextAuditDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {check.score !== 0 ? check.score : 'N/A'}%
                            </div>
                            <div className="text-xs text-muted-foreground">compliance score</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Total Requirements</div>
                            <div className="font-medium">{check.requirements.total}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Passed</div>
                            <div className="font-medium text-green-600">{check.requirements.passed}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Failed</div>
                            <div className="font-medium text-red-600">{check.requirements.failed}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">In Progress</div>
                            <div className="font-medium text-yellow-600">{check.requirements.inProgress}</div>
                          </div>
                        </div>
                        {check.status === 'in_progress' && check.requirements.failed > 0 && (
                          <Alert className="mt-3">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {check.requirements.failed} critical findings need attention before next audit
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles">
          <div className="space-y-6">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Roles & Permissions</CardTitle>
                    <CardDescription>Define access roles and permission sets</CardDescription>
                  </div>
                  <Button onClick={() => setShowRoleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <div key={role.id} className="p-4 border rounded-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold">{role.name}</span>
                              {role.system && <Badge variant="secondary" className="ml-2">System</Badge>}
                            </div>
                            <div className="text-sm text-muted-foreground">{role.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{role.userCount}</div>
                            <div className="text-xs text-muted-foreground">users</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Created</div>
                            <div className="font-medium">{new Date(role.createdAt).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Permissions</div>
                            <div className="font-medium">{role.permissions.length} permissions</div>
                          </div>
                        </div>
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground mb-2">Permissions:</div>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.slice(0, 4).map((perm, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {perm}
                              </Badge>
                            ))}
                            {role.permissions.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 4} more
                              </Badge>
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

        {/* Password Policy Tab */}
        <TabsContent value="password">
          <div className="space-y-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Password Policy Configuration</CardTitle>
                <CardDescription>
                  Configure password requirements and security policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Minimum Password Length</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[passwordPolicy.minLength]}
                          onValueChange={(value) => setPasswordPolicy(prev => ({ ...prev, minLength: value[0] }))}
                          min={6}
                          max={20}
                          step={1}
                          className="flex-1"
                        />
                        <span className="font-bold">{passwordPolicy.minLength}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Minimum required characters for passwords. Recommended: 12+ characters for strong security.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Uppercase</Label>
                        <p className="text-xs text-muted-foreground">Require at least one uppercase letter (A-Z)</p>
                      </div>
                      <Switch
                        checked={passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, requireUppercase: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Lowercase</Label>
                        <p className="text-xs text-muted-foreground">Require at least one lowercase letter (a-z)</p>
                      </div>
                      <Switch
                        checked={passwordPolicy.requireLowercase}
                        onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, requireLowercase: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Numbers</Label>
                        <p className="text-xs text-muted-foreground">Require at least one number (0-9)</p>
                      </div>
                      <Switch
                        checked={passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, requireNumbers: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Special Characters</Label>
                        <p className="text-xs text-muted-foreground">Require at least one special character (!@#$%^&*)</p>
                      </div>
                      <Switch
                        checked={passwordPolicy.requireSpecialChars}
                        onCheckedChange={(checked) => setPasswordPolicy(prev => ({ ...prev, requireSpecialChars: checked }))}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-4">Password Expiration & Reuse</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Maximum Password Age</Label>
                            <p className="text-xs text-muted-foreground">Force password change after this many days</p>
                          </div>
                          <Input
                            type="number"
                            value={passwordPolicy.maxAgeDays}
                            onChange={(e) => setPasswordPolicy(prev => ({ ...prev, maxAgeDays: parseInt(e.target.value) || 90 }))}
                            min={30}
                            max={365}
                            className="w-full"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Prevent Password Reuse</Label>
                            <p className="text-xs text-muted-foreground">Number of previous passwords that cannot be reused</p>
                          </div>
                          <Input
                            type="number"
                            value={passwordPolicy.preventReuse}
                            onChange={(e) => setPasswordPolicy(prev => ({ ...prev, preventReuse: parseInt(e.target.value) || 5 }))}
                            min={0}
                            max={20}
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Password History Retention</Label>
                            <p className="text-xs text-muted-foreground">Number of past passwords to keep in history</p>
                          </div>
                          <Input
                            type="number"
                            value={passwordPolicy.historyRetention}
                            onChange={(e) => setPasswordPolicy(prev => ({ ...prev, historyRetention: parseInt(e.target.value) || 10 }))}
                            min={1}
                            max={50}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button onClick={handleSavePasswordPolicy} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Save Password Policy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertDescription>
                Password policy changes will apply to new password updates only. Existing passwords will remain valid until next expiration.
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
