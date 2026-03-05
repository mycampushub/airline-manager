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
import { 
  Heart, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Star, 
  Target,
  Plus,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function CRMModule() {
  const { customerProfiles, campaigns, complaints, addCustomer, createCampaign, logComplaint } = useAirlineStore()
  const [activeTab, setActiveTab] = useState('customers')
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)

  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const handleAddCustomer = () => {
    addCustomer({
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      contact: {
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: { street: '', city: '', state: '', country: '', postalCode: '' }
      }
    })
    setShowCustomerDialog(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">CRM & Loyalty</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customer Profiles, Loyalty Program, and Campaign Management
          </p>
        </div>
        <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input value={newCustomer.firstName} onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={newCustomer.lastName} onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>Cancel</Button>
              <Button onClick={handleAddCustomer}>Add Customer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerProfiles.length.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">+8% this month</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Loyalty Members</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customerProfiles.filter(c => c.loyalty.tier !== 'base').length.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">active members</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {complaints.filter(c => c.status === 'open').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">requiring attention</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">marketing campaigns</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customer Profiles</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Customer Profiles</CardTitle>
              <CardDescription>Manage customer information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Loyalty Tier</th>
                      <th>Points</th>
                      <th>Total Flights</th>
                      <th>Lifetime Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerProfiles.slice(0, 10).map((customer) => (
                      <tr key={customer.id}>
                        <td className="font-medium">{customer.firstName} {customer.lastName}</td>
                        <td className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.contact.email}
                          </div>
                        </td>
                        <td>
                          <Badge variant={customer.loyalty.tier === 'platinum' ? 'default' : customer.loyalty.tier === 'gold' ? 'secondary' : 'outline'} className="capitalize">
                            {customer.loyalty.tier}
                          </Badge>
                        </td>
                        <td className="text-sm">{customer.loyalty.pointsBalance.toLocaleString()}</td>
                        <td className="text-sm">{customer.travelHistory.totalFlights}</td>
                        <td className="text-sm font-medium">${customer.travelHistory.lifetimeValue.toLocaleString()}</td>
                        <td>
                          <Badge variant={customer.status === 'active' ? 'default' : 'destructive'} className="capitalize">
                            {customer.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loyalty">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {['base', 'silver', 'gold', 'platinum', 'elite'].map((tier) => {
              const count = customerProfiles.filter(c => c.loyalty.tier === tier).length
              return (
                <Card key={tier} className="enterprise-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base capitalize">{tier}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground mt-1">members</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Loyalty Program Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <h3 className="font-medium mb-2">Silver</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Priority check-in</li>
                    <li>• Extra baggage allowance</li>
                    <li>• Lounge access (international)</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <h3 className="font-medium mb-2">Gold</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All Silver benefits</li>
                    <li>• Priority boarding</li>
                    <li>• Lounge access (all flights)</li>
                    <li>• 25% bonus points</li>
                  </ul>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <h3 className="font-medium mb-2">Platinum</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• All Gold benefits</li>
                    <li>• First class upgrades</li>
                    <li>• Dedicated service line</li>
                    <li>• 50% bonus points</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Marketing Campaigns</CardTitle>
                <Button size="sm" onClick={() => createCampaign({ name: 'New Campaign', type: 'email', message: { subject: '', body: '', template: '' }, schedule: { startDate: new Date().toISOString(), sendTime: '09:00', frequency: 'once' } })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Type</th>
                      <th>Sent</th>
                      <th>Opened</th>
                      <th>Clicked</th>
                      <th>Converted</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No campaigns created
                        </td>
                      </tr>
                    ) : (
                      campaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td className="font-medium">{campaign.name}</td>
                          <td className="capitalize text-sm">{campaign.type}</td>
                          <td className="text-sm">{campaign.metrics.sent.toLocaleString()}</td>
                          <td className="text-sm">{campaign.metrics.opened.toLocaleString()}</td>
                          <td className="text-sm">{campaign.metrics.clicked.toLocaleString()}</td>
                          <td className="text-sm">{campaign.metrics.converted.toLocaleString()}</td>
                          <td>
                            <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {campaign.status}
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

        <TabsContent value="complaints">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Customer Complaints</CardTitle>
              <CardDescription>Track and resolve customer feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No complaints recorded
                        </td>
                      </tr>
                    ) : (
                      complaints.map((complaint) => (
                        <tr key={complaint.id}>
                          <td className="font-mono">{complaint.id}</td>
                          <td className="text-sm">{complaint.customerName}</td>
                          <td className="capitalize text-sm">{complaint.category.replace('_', ' ')}</td>
                          <td className="text-sm max-w-xs truncate">{complaint.subject}</td>
                          <td>
                            <Badge variant={complaint.severity === 'critical' ? 'destructive' : complaint.severity === 'high' ? 'secondary' : 'outline'} className="capitalize">
                              {complaint.severity}
                            </Badge>
                          </td>
                          <td>
                            <Badge variant={complaint.status === 'open' ? 'destructive' : complaint.status === 'resolved' ? 'default' : 'secondary'} className="capitalize">
                              {complaint.status}
                            </Badge>
                          </td>
                          <td className="text-sm">{new Date(complaint.dueDate).toLocaleDateString()}</td>
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
