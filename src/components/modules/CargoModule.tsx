'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  FileText, 
  Box, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Weight,
  Calendar,
  DollarSign
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

export default function CargoModule() {
  const { cargoBookings, ulds, createCargoBooking } = useAirlineStore()
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  const [newBooking, setNewBooking] = useState({
    awbNumber: '',
    shipperName: '',
    consigneeName: '',
    flightNumber: '',
    pieces: 0,
    weight: 0,
    description: ''
  })

  const handleCreateBooking = () => {
    createCargoBooking({
      awbNumber: newBooking.awbNumber,
      shipper: { name: newBooking.shipperName, address: '', contact: '' },
      consignee: { name: newBooking.consigneeName, address: '', contact: '' },
      flightDetails: { flightNumber: newBooking.flightNumber, date: new Date().toISOString().split('T')[0], origin: 'JFK', destination: 'LHR', routing: [] },
      goods: { description: newBooking.description, pieces: newBooking.pieces, weight: newBooking.weight, volume: 0, weightUnit: 'kg' as const, dangerousGoods: false, perishable: false, temperatureControlled: false, specialHandling: [] }
    })
    setShowBookingDialog(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cargo Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            AWB Management, ULD Tracking, and Cargo Operations
          </p>
        </div>
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Cargo Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>AWB Number</Label>
                  <Input value={newBooking.awbNumber} onChange={(e) => setNewBooking({...newBooking, awbNumber: e.target.value})} placeholder="176-1234567890" />
                </div>
                <div>
                  <Label>Flight Number</Label>
                  <Input value={newBooking.flightNumber} onChange={(e) => setNewBooking({...newBooking, flightNumber: e.target.value})} placeholder="AA123" />
                </div>
                <div>
                  <Label>Shipper Name</Label>
                  <Input value={newBooking.shipperName} onChange={(e) => setNewBooking({...newBooking, shipperName: e.target.value})} />
                </div>
                <div>
                  <Label>Consignee Name</Label>
                  <Input value={newBooking.consigneeName} onChange={(e) => setNewBooking({...newBooking, consigneeName: e.target.value})} />
                </div>
                <div>
                  <Label>Pieces</Label>
                  <Input type="number" value={newBooking.pieces} onChange={(e) => setNewBooking({...newBooking, pieces: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={newBooking.weight} onChange={(e) => setNewBooking({...newBooking, weight: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input value={newBooking.description} onChange={(e) => setNewBooking({...newBooking, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBookingDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateBooking}>Create Booking</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cargoBookings.length}</div>
            <div className="text-xs text-muted-foreground mt-1">AWBs in transit</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cargo</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cargoBookings.reduce((sum, b) => sum + b.goods.weight, 0).toLocaleString()} kg
            </div>
            <div className="text-xs text-muted-foreground mt-1">total weight</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ULDs Tracked</CardTitle>
            <Box className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ulds.length}</div>
            <div className="text-xs text-muted-foreground mt-1">active ULDs</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$890K</div>
            <div className="text-xs text-green-600 mt-1">+18% this month</div>
          </CardContent>
        </Card>
      </div>

      <Card className="enterprise-card">
        <CardHeader>
          <CardTitle>Cargo Bookings</CardTitle>
          <CardDescription>Manage air waybills and shipments</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>AWB Number</th>
                  <th>Shipper</th>
                  <th>Consignee</th>
                  <th>Flight</th>
                  <th>Route</th>
                  <th>Pieces</th>
                  <th>Weight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cargoBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted-foreground py-8">
                      No cargo bookings
                    </td>
                  </tr>
                ) : (
                  cargoBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="font-mono font-medium">{booking.awbNumber}</td>
                      <td className="text-sm">{booking.shipper.name}</td>
                      <td className="text-sm">{booking.consignee.name}</td>
                      <td className="text-sm">{booking.flightDetails.flightNumber}</td>
                      <td className="text-sm">{booking.flightDetails.origin} → {booking.flightDetails.destination}</td>
                      <td className="text-sm">{booking.goods.pieces}</td>
                      <td className="text-sm">{booking.goods.weight} kg</td>
                      <td>
                        <Badge variant={booking.status === 'booked' ? 'default' : booking.status === 'delivered' ? 'secondary' : 'outline'} className="capitalize">
                          {booking.status}
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
    </div>
  )
}
