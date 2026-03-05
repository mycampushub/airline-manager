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
import { 
  Building2, 
  DollarSign, 
  Calculator, 
  Shield, 
  Bell, 
  Users,
  Plus,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { useAirlineStore, type Agency } from '@/lib/store'

export default function AgencyModule() {
  const { agencies, adms, addAgency, issueADM, updateAgencyCredit } = useAirlineStore()
  const [activeTab, setActiveTab] = useState('agency-hierarchy')
  const [showAgencyDialog, setShowAgencyDialog] = useState(false)
  const [showADMDialog, setShowADMDialog] = useState(false)

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agency & Sub-Agency Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Hierarchy, Credit & Wallet, Commission, and Controls
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencies.length}</div>
            <div className="text-xs text-muted-foreground mt-1">active partners</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Credit Exposure</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${agencies.reduce((sum, a) => sum + a.credit.used, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">of ${agencies.reduce((sum, a) => sum + a.credit.limit, 0).toLocaleString()} limit</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending ADMs</CardTitle>
            <Bell className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {adms.filter(a => a.status === 'issued').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">awaiting response</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agency Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.8M</div>
            <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="agency-hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="credit-wallet">Credit & Wallet</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="agent-control">Agent Control</TabsTrigger>
          <TabsTrigger value="adm">ADM/ACM</TabsTrigger>
        </TabsList>

        <TabsContent value="agency-hierarchy">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agency Hierarchy</CardTitle>
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
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Tier</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No agencies configured
                        </td>
                      </tr>
                    ) : (
                      agencies.map((agency) => (
                        <tr key={agency.id}>
                          <td className="font-mono font-medium">{agency.code}</td>
                          <td className="text-sm">{agency.name}</td>
                          <td><Badge variant="outline" className="uppercase">{agency.type}</Badge></td>
                          <td><Badge variant={agency.tier === 'platinum' ? 'default' : 'secondary'} className="capitalize">{agency.tier}</Badge></td>
                          <td className="text-sm">{agency.performance.totalBookings}</td>
                          <td className="text-sm">${agency.performance.totalRevenue.toLocaleString()}</td>
                          <td>
                            <Badge variant={agency.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                              {agency.status}
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

        <TabsContent value="credit-wallet">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Credit & Wallet Management</CardTitle>
              <CardDescription>Agency credit limits and wallet balances</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Agency</th>
                    <th>Credit Limit</th>
                    <th>Used</th>
                    <th>Available</th>
                    <th>Wallet Balance</th>
                    <th>Terms</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {agencies.slice(0, 5).map((agency) => (
                    <tr key={agency.id}>
                      <td className="font-medium">{agency.name}</td>
                      <td className="text-sm">${agency.credit.limit.toLocaleString()}</td>
                      <td className="text-sm">${agency.credit.used.toLocaleString()}</td>
                      <td className={`text-sm font-medium ${agency.credit.available < agency.credit.limit * 0.1 ? 'text-red-600' : ''}`}>
                        ${agency.credit.available.toLocaleString()}
                      </td>
                      <td className="text-sm">${agency.wallet.balance.toLocaleString()}</td>
                      <td className="text-sm">{agency.credit.terms} days</td>
                      <td>
                        {agency.credit.available < agency.credit.limit * 0.1 ? (
                          <Badge variant="destructive">Near Limit</Badge>
                        ) : (
                          <Badge variant="default">OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Commission Structure</CardTitle>
              <CardDescription>Standard rates and overrides by agency tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { tier: 'Platinum', rate: 9, bonus: '2% bonus' },
                  { tier: 'Gold', rate: 7, bonus: '1.5% bonus' },
                  { tier: 'Silver', rate: 5, bonus: '1% bonus' },
                  { tier: 'Bronze', rate: 4, bonus: '0.5% bonus' },
                  { tier: 'Standard', rate: 3, bonus: 'No bonus' }
                ].map((item, i) => (
                  <Card key={i} className="enterprise-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{item.tier}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{item.rate}%</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.bonus}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent-control">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Agent Control & Permissions</CardTitle>
              <CardDescription>Manage what agents can see and do</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Permission</th>
                    <th>Platinum</th>
                    <th>Gold</th>
                    <th>Silver</th>
                    <th>Bronze</th>
                    <th>Standard</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { perm: 'View All Fares', p: true, g: true, s: false, b: false, st: false },
                    { perm: 'Ticket Without Approval', p: true, g: true, s: true, b: false, st: false },
                    { perm: 'Process Refunds', p: true, g: true, s: true, b: true, st: false },
                    { perm: 'Modify PNR', p: true, g: true, s: true, b: true, st: true },
                    { perm: 'Cancel PNR', p: true, g: true, s: false, b: false, st: false }
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="font-medium">{item.perm}</td>
                      <td>{item.p ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}</td>
                      <td>{item.g ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}</td>
                      <td>{item.s ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}</td>
                      <td>{item.b ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}</td>
                      <td>{item.st ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adm">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ADM / ACM Management</CardTitle>
                <Dialog open={showADMDialog} onOpenChange={setShowADMDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Issue ADM
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Issue Agency Debit Memo (ADM)</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Agency Code</Label>
                          <Input value={newADM.agencyCode} onChange={(e) => setNewADM({...newADM, agencyCode: e.target.value})} />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select value={newADM.type} onValueChange={(v: any) => setNewADM({...newADM, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fare_discrepancy">Fare Discrepancy</SelectItem>
                              <SelectItem value="refund_violation">Refund Violation</SelectItem>
                              <SelectItem value="ticketing_error">Ticketing Error</SelectItem>
                              <SelectItem value="documentation">Documentation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Amount ($)</Label>
                          <Input type="number" value={newADM.amount} onChange={(e) => setNewADM({...newADM, amount: Number(e.target.value)})} />
                        </div>
                        <div>
                          <Label>Ticket Numbers (comma separated)</Label>
                          <Input value={newADM.ticketNumbers} onChange={(e) => setNewADM({...newADM, ticketNumbers: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label>Reason</Label>
                        <Input value={newADM.reason} onChange={(e) => setNewADM({...newADM, reason: e.target.value})} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowADMDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleIssueADM}>Issue ADM</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>ADM #</th>
                      <th>Agency</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Reason</th>
                      <th>Issued</th>
                      <th>Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adms.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No ADMs issued
                        </td>
                      </tr>
                    ) : (
                      adms.map((adm) => (
                        <tr key={adm.id}>
                          <td className="font-mono">{adm.number}</td>
                          <td className="text-sm">{adm.agencyCode}</td>
                          <td className="capitalize text-sm">{adm.type.replace('_', ' ')}</td>
                          <td className="text-sm text-red-600 font-medium">${adm.amount}</td>
                          <td className="text-sm max-w-xs truncate">{adm.reason}</td>
                          <td className="text-sm">{new Date(adm.issuedDate).toLocaleDateString()}</td>
                          <td className="text-sm">{new Date(adm.dueDate).toLocaleDateString()}</td>
                          <td>
                            <Badge variant={adm.status === 'issued' ? 'destructive' : adm.status === 'upheld' ? 'default' : 'secondary'} className="capitalize">
                              {adm.status}
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
      </Tabs>
    </div>
  )
}
