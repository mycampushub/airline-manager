'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// import { ScrollArea } from '@/components/ui/scroll-area'
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
import { DEMO_BOOKINGS, DEMO_FLIGHTS, DEMO_AIRCRAFT, DEMO_ROUTES } from '@/lib/demoData'

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
  const initializedRef = useRef(false)

  // Initialize mock data with 30 items each
  const interlinePartners: InterlinePartner[] = useMemo(() => {
    return DEMO_ROUTES.map((route, i) => ({
      id: `partner-${String(i + 1).padStart(3, '0')}`,
      partner: ['British Airways', 'Lufthansa', 'Emirates', 'Singapore Airlines', 'Qatar Airways', 'Air France', 'KLM', 'ANA', 'Cathay Pacific', 'Qantas', 'Delta Air Lines', 'United Airlines', 'American Airlines', 'Korean Air', 'Swiss International', 'Iberia', 'Finnair', 'Austrian', 'Turkish Airlines', 'Etihad Airways', 'LATAM', 'Air Canada', 'SAS', 'LOT Polish', 'TAP Portugal', 'Brussels Airlines', 'Aer Lingus', 'Czech Airlines', 'Aegean', 'Air Serbia'][i],
      flights: 20 + (i * 5) % 50,
      pax: 400 + (i * 15) % 900,
      receivable: 15000 + (i * 2500),
      payable: 5000 + (i * 1500),
      status: ['settled', 'pending', 'overdue'][i % 3] as 'settled' | 'pending' | 'overdue'
    }))
  }, [])

  const bspSettlements: BSPSettlement[] = useMemo(() => {
    const periods = ['DEC 2024', 'NOV 2024', 'OCT 2024', 'SEP 2024', 'AUG 2024']
    const regions = ['Europe', 'Americas', 'Asia Pacific', 'Middle East', 'Africa']
    return Array.from({ length: 30 }, (_, i) => ({
      id: `bsp-${String(i + 1).padStart(3, '0')}`,
      period: periods[i % 5],
      region: regions[i % 5],
      grossSales: 500000 + (i * 100000),
      commission: Math.round((500000 + (i * 100000)) * 0.05),
      netRemittance: Math.round((500000 + (i * 100000)) * 0.95),
      status: ['settled', 'pending', 'submitted'][i % 3] as 'settled' | 'pending' | 'submitted'
    }))
  }, [])

  const prorationRecords: ProrationRecord[] = useMemo(() => {
    return DEMO_BOOKINGS.map((booking, i) => {
      const flight = DEMO_FLIGHTS[i % DEMO_FLIGHTS.length]
      const route = DEMO_ROUTES.find(r => r.id === flight.routeId)
      return {
        id: `prop-${String(i + 1).padStart(3, '0')}`,
        ticket: booking.id,
        passenger: DEMO_BOOKINGS[i % DEMO_BOOKINGS.length].id,
        segments: 1 + (i % 4),
        baseFare: Math.round(booking.fare * 0.8),
        tax: Math.round(booking.fare * 0.2),
        proratedFare: booking.fare,
        currency: 'USD'
      }
    })
  }, [])

  // Computed values from store
  const totalRevenue = useMemo(() =>
    DEMO_BOOKINGS.reduce((sum, b) => sum + b.fare, 0),
    []
  )

  const pendingTickets = useMemo(() =>
    DEMO_BOOKINGS.filter(b => b.status !== 'confirmed').length,
    []
  )

  const refundedAmount = useMemo(() =>
    DEMO_BOOKINGS.filter(b => b.status === 'cancelled').reduce((sum, b) => sum + b.fare, 0),
    []
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
        const salesRows = DEMO_BOOKINGS.map(b => {
          const flight = DEMO_FLIGHTS.find(f => f.id === b.flightId)
          return [
            b.id,
            b.passengerId,
            flight ? `${flight.origin}-${flight.destination}` : 'N/A',
            b.fare,
            b.status
          ]
        })
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
              <div className="overflow-x-auto h-80">
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
                    {DEMO_BOOKINGS.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No tickets to reconcile
                        </td>
                      </tr>
                    ) : (
                      DEMO_BOOKINGS.map((booking) => {
                        const flight = DEMO_FLIGHTS.find(f => f.id === booking.flightId)
                        return (
                          <tr key={booking.id}>
                            <td className="font-mono">{booking.id}</td>
                            <td className="text-sm">{booking.passengerId}</td>
                            <td className="text-sm">{flight ? `${flight.origin}→${flight.destination}` : 'N/A'}</td>
                            <td className="text-sm">${Math.round(booking.fare * 0.8)}</td>
                            <td className="text-sm">${Math.round(booking.fare * 0.2)}</td>
                            <td className="text-sm font-medium">${booking.fare}</td>
                            <td><Badge variant="outline">{booking.channel}</Badge></td>
                            <td><CheckCircle className="h-5 w-5 text-green-600" /></td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
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
