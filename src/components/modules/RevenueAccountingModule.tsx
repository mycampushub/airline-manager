'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Calculator, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  ArrowDownLeft,
  CheckCircle,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

interface InterlinePartner {
  id: string
  partner: string
  flights: number
  pax: number
  receivable: number
  payable: number
  status: 'settled' | 'pending' | 'overdue'
}

interface BSPSettlement {
  id: string
  period: string
  region: string
  grossSales: number
  commission: number
  netRemittance: number
  status: 'settled' | 'pending' | 'submitted'
}

interface ProrationRecord {
  id: string
  ticket: string
  passenger: string
  segments: number
  baseFare: number
  tax: number
  proratedFare: number
  currency: string
}

export default function RevenueAccountingModule() {
  const { tickets, pnrs } = useAirlineStore()
  const { toast } = useToast()
  const [refreshing, setRefreshing] = useState(false)

  // Computed values from store
  const totalRevenue = useMemo(() => 
    tickets.reduce((sum, t) => sum + t.fare.total, 0), 
    [tickets]
  )
  
  const pendingTickets = useMemo(() => 
    tickets.filter(t => t.status === 'open').length,
    [tickets]
  )

  const refundedAmount = useMemo(() =>
    tickets.filter(t => t.status === 'refunded').reduce((sum, t) => sum + t.fare.total, 0),
    [tickets]
  )

  const interlinePartners: InterlinePartner[] = useMemo(() => [
    { id: '1', partner: 'British Airways', flights: 45, pax: 892, receivable: 35000, payable: 12000, status: 'settled' },
    { id: '2', partner: 'Lufthansa', flights: 32, pax: 645, receivable: 28000, payable: 18000, status: 'pending' },
    { id: '3', partner: 'Emirates', flights: 28, pax: 534, receivable: 26000, payable: 15000, status: 'pending' },
    { id: '4', partner: 'Singapore Airlines', flights: 22, pax: 421, receivable: 22000, payable: 9000, status: 'settled' },
    { id: '5', partner: 'Qatar Airways', flights: 18, pax: 356, receivable: 18000, payable: 7000, status: 'pending' }
  ], [])

  const bspSettlements: BSPSettlement[] = useMemo(() => [
    { id: '1', period: 'DEC 2024', region: 'Europe', grossSales: 1245000, commission: 62250, netRemittance: 1182750, status: 'submitted' },
    { id: '2', period: 'DEC 2024', region: 'Americas', grossSales: 890000, commission: 44500, netRemittance: 845500, status: 'pending' },
    { id: '3', period: 'NOV 2024', region: 'Europe', grossSales: 1150000, commission: 57500, netRemittance: 1092500, status: 'settled' },
    { id: '4', period: 'NOV 2024', region: 'Americas', grossSales: 820000, commission: 41000, netRemittance: 779000, status: 'settled' }
  ], [])

  const prorationRecords: ProrationRecord[] = useMemo(() => 
    tickets.slice(0, 15).map((t, i) => ({
      id: `${i + 1}`,
      ticket: t.ticketNumber,
      passenger: t.passengerName,
      segments: t.segments.length,
      baseFare: Math.round(t.fare.total * 0.8),
      tax: Math.round(t.fare.total * 0.2),
      proratedFare: t.fare.total,
      currency: t.fare.currency
    })),
    [tickets]
  )

  const interlineTotal = useMemo(() => ({
    receivable: interlinePartners.reduce((sum, p) => sum + p.receivable, 0),
    payable: interlinePartners.reduce((sum, p) => sum + p.payable, 0)
  }), [interlinePartners])

  const bspTotal = useMemo(() => ({
    current: bspSettlements.filter(s => s.period === 'DEC 2024').reduce((sum, s) => sum + s.grossSales, 0)
  }), [bspSettlements])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast({ title: 'Data Refreshed', description: 'Revenue accounting data has been updated' })
    }, 1000)
  }

  const handleExport = (type: string) => {
    let csvContent = ''
    let filename = ''
    
    switch (type) {
      case 'sales':
        const salesHeaders = ['Ticket', 'Passenger', 'Route', 'Amount', 'Status']
        const salesRows = tickets.map(t => [
          t.ticketNumber,
          t.passengerName,
          t.segments.map(s => `${s.origin}-${s.destination}`).join('; '),
          t.fare.total,
          t.status
        ])
        csvContent = [salesHeaders.join(','), ...salesRows.map(r => r.join(','))].join('\n')
        filename = 'sales-reconciliation'
        break
      case 'interline':
        const intHeaders = ['Partner', 'Flights', 'Pax', 'Receivable', 'Payable', 'Net', 'Status']
        const intRows = interlinePartners.map(p => [
          p.partner, p.flights, p.pax, p.receivable, p.payable, p.receivable - p.payable, p.status
        ])
        csvContent = [intHeaders.join(','), ...intRows.map(r => r.join(','))].join('\n')
        filename = 'interline-settlement'
        break
      case 'bsp':
        const bspHeaders = ['Period', 'Region', 'Gross', 'Commission', 'Net', 'Status']
        const bspRows = bspSettlements.map(s => [
          s.period, s.region, s.grossSales, s.commission, s.netRemittance, s.status
        ])
        csvContent = [bspHeaders.join(','), ...bspRows.map(r => r.join(','))].join('\n')
        filename = 'bsp-settlement'
        break
      case 'proration':
        const propHeaders = ['Ticket', 'Passenger', 'Segments', 'Base Fare', 'Tax', 'Total']
        const propRows = prorationRecords.map(p => [
          p.ticket, p.passenger, p.segments, p.baseFare, p.tax, p.proratedFare
        ])
        csvContent = [propHeaders.join(','), ...propRows.map(r => r.join(','))].join('\n')
        filename = 'proration-records'
        break
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
    
    toast({ title: 'Export Complete', description: `${filename}.csv has been downloaded` })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Revenue Accounting</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sales Reconciliation, Interline Settlement, and Proration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('sales')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">+18% vs last month</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Settlement</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(interlineTotal.receivable - interlineTotal.payable).toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{pendingTickets} pending</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Interline Revenue</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${interlineTotal.receivable.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{interlinePartners.length} partners</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Refunds Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${refundedAmount.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{tickets.filter(t => t.status === 'refunded').length} refunds</div>
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
              <ScrollArea className="h-80 overflow-x-auto">
                <table className="enterprise-table min-w-[1000px]">
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Interline Settlement</CardTitle>
                <CardDescription>Settlement with partner airlines</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('interline')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">Receivable</div>
                  <div className="text-2xl font-bold text-green-600">${interlineTotal.receivable.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">Payable</div>
                  <div className="text-2xl font-bold text-red-600">${interlineTotal.payable.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">Net Position</div>
                  <div className="text-2xl font-bold">${(interlineTotal.receivable - interlineTotal.payable).toLocaleString()}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="enterprise-table min-w-[900px]">
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
                  {interlinePartners.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.partner}</td>
                      <td className="text-sm">{item.flights}</td>
                      <td className="text-sm">{item.pax}</td>
                      <td className="text-sm text-green-600">${item.receivable.toLocaleString()}</td>
                      <td className="text-sm text-red-600">${item.payable.toLocaleString()}</td>
                      <td className="text-sm font-medium">${(item.receivable - item.payable).toLocaleString()}</td>
                      <td><Badge variant={item.status === 'settled' ? 'default' : 'secondary'}>{item.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bsp">
          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>BSP/ARC Settlement</CardTitle>
                <CardDescription>Settlement with Billing Settlement Plan</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('bsp')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">BSP Sales (Current)</div>
                  <div className="text-2xl font-bold">${bspTotal.current.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="text-sm text-muted-foreground">ARC Sales (Current)</div>
                  <div className="text-2xl font-bold">${(bspTotal.current * 0.71).toLocaleString()}</div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="enterprise-table min-w-[900px]">
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
                  {bspSettlements.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.period}</td>
                      <td>{item.region}</td>
                      <td className="text-sm">${item.grossSales.toLocaleString()}</td>
                      <td className="text-sm">${item.commission.toLocaleString()}</td>
                      <td className="text-sm font-medium">${item.netRemittance.toLocaleString()}</td>
                      <td><Badge variant={item.status === 'Settled' ? 'default' : item.status === 'Submitted' ? 'secondary' : 'outline'}>{item.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proration">
          <Card className="enterprise-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Proration Calculation</CardTitle>
                <CardDescription>Fare proration for multi-segment and interline itineraries</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('proration')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
              <table className="enterprise-table min-w-[900px]">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Passenger</th>
                    <th>Segments</th>
                    <th>Base Fare</th>
                    <th>Tax</th>
                    <th>Total</th>
                    <th>Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {prorationRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted-foreground py-8">
                        No proration records available
                      </td>
                    </tr>
                  ) : (
                    prorationRecords.map((item) => (
                      <tr key={item.id}>
                        <td className="font-mono">{item.ticket}</td>
                        <td>{item.passenger}</td>
                        <td>{item.segments}</td>
                        <td className="text-sm">${item.baseFare.toLocaleString()}</td>
                        <td className="text-sm">${item.tax.toLocaleString()}</td>
                        <td className="font-medium">${item.proratedFare.toLocaleString()}</td>
                        <td>{item.currency}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
