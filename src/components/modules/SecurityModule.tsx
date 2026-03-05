'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle, 
  Lock, 
  Key,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function SecurityModule() {
  const { users, auditLogs, securityEvents } = useAirlineStore()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Security & Compliance</h2>
          <p className="text-sm text-muted-foreground mt-1">
            RBAC, Audit Trail, and Fraud Monitoring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <div className="text-xs text-muted-foreground mt-1">events today</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityEvents.filter(e => e.status === 'open').length}
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
              {users.filter(u => u.mfaEnabled).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">users protected</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rbac" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rbac">RBAC</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="rbac">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
              <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>MFA</th>
                    <th>Last Login</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted-foreground py-8">
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Complete system activity log</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Details</th>
                      <th>IP Address</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No audit logs
                        </td>
                      </tr>
                    ) : (
                      auditLogs.slice(0, 20).map((log) => (
                        <tr key={log.id}>
                          <td className="text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="text-sm">{log.username}</td>
                          <td className="text-sm">{log.action}</td>
                          <td className="text-sm capitalize">{log.module}</td>
                          <td className="text-sm max-w-xs truncate">{log.details}</td>
                          <td className="font-mono text-sm">{log.ipAddress}</td>
                          <td>
                            {log.result === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
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

        <TabsContent value="events">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Suspicious activity and security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Severity</th>
                      <th>Description</th>
                      <th>IP Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted-foreground py-8">
                          No security events
                        </td>
                      </tr>
                    ) : (
                      securityEvents.map((event) => (
                        <tr key={event.id}>
                          <td className="text-sm">{new Date(event.timestamp).toLocaleString()}</td>
                          <td className="capitalize text-sm">{event.type.replace('_', ' ')}</td>
                          <td>
                            <Badge variant={event.severity === 'critical' ? 'destructive' : event.severity === 'high' ? 'secondary' : 'outline'} className="capitalize">
                              {event.severity}
                            </Badge>
                          </td>
                          <td className="text-sm max-w-xs truncate">{event.description}</td>
                          <td className="font-mono text-sm">{event.ipAddress}</td>
                          <td>
                            <Badge variant={event.status === 'open' ? 'destructive' : event.status === 'resolved' ? 'default' : 'secondary'} className="capitalize">
                              {event.status}
                            </Badge>
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

        <TabsContent value="compliance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'PCI-DSS', status: 'compliant', last: '2024-12-01' },
                    { name: 'GDPR', status: 'compliant', last: '2024-11-15' },
                    { name: 'SOC 2', status: 'in_progress', last: '2024-12-10' },
                    { name: 'ISO 27001', status: 'compliant', last: '2024-10-20' }
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-secondary/30 rounded-sm flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">Last audit: {item.last}</div>
                      </div>
                      <Badge variant={item.status === 'compliant' ? 'default' : 'secondary'} className="capitalize">
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Data Encryption</span>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Access Control</span>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Key Management</span>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Audit Logging</span>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
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
