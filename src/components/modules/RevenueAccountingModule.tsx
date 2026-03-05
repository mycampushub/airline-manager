'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  ArrowDownLeft,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function RevenueAccountingModule() {
  const { tickets, pnrs } = useAirlineStore()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Revenue Accounting</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sales Reconciliation, Interline Settlement, and Proration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${tickets.reduce((sum, t) => sum + t.fare.total, 0).toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">+18% vs last month</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Settlement</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245,000</div>
            <div className="text-xs text-muted-foreground mt-1">47 transactions</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Interline Revenue</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$89,000</div>
            <div className="text-xs text-muted-foreground mt-1">12 partners</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refunds Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$34,500</div>
            <div className="text-xs text-muted-foreground mt-1">23 refunds</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Reconciliation</TabsTrigger>
          <TabsTrigger value="interline">Interline Settlement</TabsTrigger>
          <TabsTrigger value="bsp">BSP/ARC Settlement</TabsTrigger>
          <TabsTrigger value="proration">Proration</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Ticket Sales Reconciliation</CardTitle>
              <CardDescription>Match ticket sales with payment records</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Passenger</th>
                      <th>Route</th>
                      <th>Fare</th>
                      <th>Taxes</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Reconciled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No tickets to reconcile
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => (
                        <tr key={ticket.ticketNumber}>
                          <td className="font-mono">{ticket.ticketNumber}</td>
                          <td className="text-sm">{ticket.passengerName}</td>
                          <td className="text-sm">{ticket.segments[0]?.origin}→{ticket.segments[0]?.destination}</td>
                          <td className="text-sm">${ticket.fare.baseFare}</td>
                          <td className="text-sm">${ticket.fare.taxes}</td>
                          <td className="text-sm font-medium">${ticket.fare.total}</td>
                          <td><Badge variant="outline">Credit Card</Badge></td>
                          <td><CheckCircle className="h-5 w-5 text-green-600" /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interline">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Interline Settlement</CardTitle>
              <CardDescription>Settlement with partner airlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">Receivable</div>
                  <div className="text-2xl font-bold text-green-600">$89,000</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">Payable</div>
                  <div className="text-2xl font-bold text-red-600">$45,000</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">Net Position</div>
                  <div className="text-2xl font-bold">$44,000</div>
                </div>
              </div>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Flights</th>
                    <th>Pax</th>
                    <th>Receivable</th>
                    <th>Payable</th>
                    <th>Net</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { partner: 'British Airways', flights: 45, pax: 892, rec: 35000, pay: 12000, net: 23000, status: 'Settled' },
                    { partner: 'Lufthansa', flights: 32, pax: 645, rec: 28000, pay: 18000, net: 10000, status: 'Pending' },
                    { partner: 'Emirates', flights: 28, pax: 534, rec: 26000, pay: 15000, net: 11000, status: 'Pending' }
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="font-medium">{item.partner}</td>
                      <td className="text-sm">{item.flights}</td>
                      <td className="text-sm">{item.pax}</td>
                      <td className="text-sm text-green-600">${item.rec.toLocaleString()}</td>
                      <td className="text-sm text-red-600">${item.pay.toLocaleString()}</td>
                      <td className="text-sm font-medium">${item.net.toLocaleString()}</td>
                      <td><Badge variant={item.status === 'Settled' ? 'default' : 'secondary'}>{item.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bsp">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>BSP/ARC Settlement</CardTitle>
              <CardDescription>Settlement with Billing Settlement Plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">BSP Sales (Current)</div>
                  <div className="text-2xl font-bold">$1,245,000</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">ARC Sales (Current)</div>
                  <div className="text-2xl font-bold">$890,000</div>
                </div>
              </div>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Settlement Period</th>
                    <th>Region</th>
                    <th>Gross Sales</th>
                    <th>Commission</th>
                    <th>Net Remittance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { period: 'DEC 2024', region: 'Europe', gross: 1245000, comm: 62250, net: 1182750, status: 'Submitted' },
                    { period: 'DEC 2024', region: 'Americas', gross: 890000, comm: 44500, net: 845500, status: 'Pending' },
                    { period: 'NOV 2024', region: 'Europe', gross: 1150000, comm: 57500, net: 1092500, status: 'Settled' }
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="font-medium">{item.period}</td>
                      <td>{item.region}</td>
                      <td className="text-sm">${item.gross.toLocaleString()}</td>
                      <td className="text-sm">${item.comm.toLocaleString()}</td>
                      <td className="text-sm font-medium">${item.net.toLocaleString()}</td>
                      <td><Badge variant={item.status === 'Settled' ? 'default' : item.status === 'Submitted' ? 'secondary' : 'outline'}>{item.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proration">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Proration Calculation</CardTitle>
              <CardDescription>Fare proration for multi-segment and interline itineraries</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Total Fare</th>
                    <th>Segments</th>
                    <th>Proration Method</th>
                    <th>Segment 1</th>
                    <th>Segment 2</th>
                    <th>Segment 3</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { ticket: '176-1234567890', fare: 850, segments: 3, method: 'Distance', s1: 320, s2: 280, s3: 250 },
                    { ticket: '176-1234567891', fare: 620, segments: 2, method: 'Fare Class', s1: 380, s2: 240, s3: 0 },
                    { ticket: '176-1234567892', fare: 1240, segments: 4, method: 'Mileage', s1: 290, s2: 350, s3: 280, s4: 320 }
                  ].map((item, i) => (
                    <tr key={i}>
                      <td className="font-mono">{item.ticket}</td>
                      <td className="font-medium">${item.fare}</td>
                      <td>{item.segments}</td>
                      <td>{item.method}</td>
                      <td className="text-sm">${item.s1}</td>
                      <td className="text-sm">${item.s2}</td>
                      <td className="text-sm">${item.s3 || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
