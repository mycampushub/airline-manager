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
  CheckCircle, 
  XCircle, 
  Clock, 
  UserCheck, 
  Plane, 
  Package, 
  Scale,
  FileText,
  Scan,
  Users,
  QrCode,
  ArrowRight,
  Printer,
  Search
} from 'lucide-react'
import { useAirlineStore, type CheckInRecord, type BaggageRecord } from '@/lib/store'

export default function DCSModule() {
  const { 
    checkInRecords, 
    boardingRecords, 
    loadSheets, 
    baggageRecords,
    createCheckIn,
    updateBoarding,
    generateLoadSheet,
    addBaggage,
    pnrs 
  } = useAirlineStore()
  const [activeTab, setActiveTab] = useState('checkin')
  const [selectedFlight, setSelectedFlight] = useState('AA123')
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [showBaggageDialog, setShowBaggageDialog] = useState(false)

  const [newCheckIn, setNewCheckIn] = useState({
    pnrNumber: '',
    ticketNumber: '',
    passengerId: '',
    passengerName: '',
    seatNumber: '',
    flightNumber: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [newBaggage, setNewBaggage] = useState({
    tagNumber: '',
    pnrNumber: '',
    passengerId: '',
    passengerName: '',
    flightNumber: '',
    weight: 0,
    pieces: 1
  })

  const handleCheckIn = () => {
    createCheckIn({
      ...newCheckIn,
      checkInMethod: 'counter',
      documentsVerified: true,
      visaValid: true,
      passportValid: true
    })
    setShowCheckInDialog(false)
  }

  const handleAddBaggage = () => {
    addBaggage({
      ...newBaggage,
      origin: 'JFK',
      destination: 'LHR',
      status: 'checked',
      fee: 0,
      feePaid: true
    })
    setShowBaggageDialog(false)
  }

  const handleStartBoarding = () => {
    updateBoarding(selectedFlight, new Date().toISOString().split('T')[0], {
      boardingStarted: new Date().toISOString(),
      status: 'boarding'
    })
  }

  const handleGenerateLoadSheet = () => {
    generateLoadSheet(selectedFlight, new Date().toISOString().split('T')[0])
  }

  const flightOptions = ['AA123', 'AA456', 'AA789', 'BA234', 'BA567', 'LH890']
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Departure Control System (DCS)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Check-in, Boarding, Load & Balance, and Baggage Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedFlight} onValueChange={setSelectedFlight}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Flight" />
            </SelectTrigger>
            <SelectContent>
              {flightOptions.map(flight => (
                <SelectItem key={flight} value={flight}>{flight}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Flight Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkInRecords.filter(c => c.flightNumber === selectedFlight && c.date === today).length}</div>
            <div className="text-xs text-muted-foreground mt-1">of 180 passengers</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Boarded</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {boardingRecords.find(b => b.flightNumber === selectedFlight && b.date === today)?.boardedPassengers || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">passengers boarded</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Baggage</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {baggageRecords.filter(b => b.flightNumber === selectedFlight).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">bags processed</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Load Sheet</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today) ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Clock className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today) ? 'Generated' : 'Pending'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="checkin">Check-In</TabsTrigger>
          <TabsTrigger value="boarding">Boarding</TabsTrigger>
          <TabsTrigger value="loadbalance">Load & Balance</TabsTrigger>
          <TabsTrigger value="baggage">Baggage</TabsTrigger>
        </TabsList>

        {/* Check-In Tab */}
        <TabsContent value="checkin" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Passenger Check-In</CardTitle>
                <div className="flex items-center gap-2">
                  <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Check-In Passenger
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Check-In Passenger</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>PNR Number</Label>
                            <Input value={newCheckIn.pnrNumber} onChange={(e) => setNewCheckIn({...newCheckIn, pnrNumber: e.target.value})} placeholder="ABC12345" />
                          </div>
                          <div>
                            <Label>Ticket Number</Label>
                            <Input value={newCheckIn.ticketNumber} onChange={(e) => setNewCheckIn({...newCheckIn, ticketNumber: e.target.value})} placeholder="176-1234567890" />
                          </div>
                          <div>
                            <Label>Passenger Name</Label>
                            <Input value={newCheckIn.passengerName} onChange={(e) => setNewCheckIn({...newCheckIn, passengerName: e.target.value})} />
                          </div>
                          <div>
                            <Label>Seat Number</Label>
                            <Input value={newCheckIn.seatNumber} onChange={(e) => setNewCheckIn({...newCheckIn, seatNumber: e.target.value})} placeholder="12A" />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>Cancel</Button>
                        <Button onClick={handleCheckIn}>Check-In</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <CardDescription>
                Web, mobile, kiosk, and counter check-in management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Passenger</th>
                      <th>PNR</th>
                      <th>Seat</th>
                      <th>Method</th>
                      <th>Time</th>
                      <th>Documents</th>
                      <th>Bags</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkInRecords.filter(c => c.flightNumber === selectedFlight).length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No check-ins for this flight yet
                        </td>
                      </tr>
                    ) : (
                      checkInRecords.filter(c => c.flightNumber === selectedFlight).map((checkIn) => (
                        <tr key={checkIn.id}>
                          <td className="font-medium">{checkIn.passengerName}</td>
                          <td className="font-mono text-sm">{checkIn.pnrNumber}</td>
                          <td className="font-mono">{checkIn.seatNumber}</td>
                          <td><Badge variant="outline" className="capitalize">{checkIn.checkInMethod}</Badge></td>
                          <td className="text-sm">{new Date(checkIn.checkInTime).toLocaleTimeString()}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              {checkIn.documentsVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              {checkIn.passportValid && checkIn.visaValid ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </td>
                          <td>{checkIn.bagsChecked}</td>
                          <td>
                            <Badge variant={checkIn.status === 'checked-in' ? 'default' : checkIn.status === 'boarded' ? 'secondary' : 'destructive'} className="capitalize">
                              {checkIn.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" title="Print Boarding Pass">
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Scan Documents">
                                <Scan className="h-4 w-4" />
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

          {/* Check-in Methods Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Web Check-In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {checkInRecords.filter(c => c.checkInMethod === 'web').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">completed online</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Mobile Check-In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {checkInRecords.filter(c => c.checkInMethod === 'mobile').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">via mobile app</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Kiosk Check-In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {checkInRecords.filter(c => c.checkInMethod === 'kiosk').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">self-service</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Counter Check-In</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {checkInRecords.filter(c => c.checkInMethod === 'counter').length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">agent-assisted</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Boarding Tab */}
        <TabsContent value="boarding" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Boarding Control</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleStartBoarding}>
                    <Plane className="h-4 w-4 mr-2" />
                    Start Boarding
                  </Button>
                </div>
              </div>
              <CardDescription>
                Priority boarding, standby handling, and gate management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Boarding Progress */}
                <div className="p-4 bg-secondary/30 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Boarding Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {boardingRecords.find(b => b.flightNumber === selectedFlight && b.date === today)?.boardedPassengers || 0} / 180
                    </span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ width: `${((boardingRecords.find(b => b.flightNumber === selectedFlight && b.date === today)?.boardedPassengers || 0) / 180) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Boarding Groups */}
                <div className="grid grid-cols-5 gap-2">
                  {['Group 1', 'Group 2', 'Group 3', 'Group 4', 'Group 5'].map((group, i) => (
                    <div key={group} className={`p-3 rounded-sm text-center ${i < 2 ? 'bg-primary/20' : 'bg-secondary/30'}`}>
                      <div className="font-medium text-sm">{group}</div>
                      <div className="text-2xl font-bold mt-1">{35 - i * 5}</div>
                      <div className="text-xs text-muted-foreground">remaining</div>
                    </div>
                  ))}
                </div>

                {/* Gate Information */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="enterprise-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Gate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">A12</div>
                    </CardContent>
                  </Card>
                  <Card className="enterprise-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Scheduled Departure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">14:30</div>
                    </CardContent>
                  </Card>
                  <Card className="enterprise-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Standby</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">3</div>
                      <div className="text-xs text-muted-foreground">passengers</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Load & Balance Tab */}
        <TabsContent value="loadbalance" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weight & Balance</CardTitle>
                <Button onClick={handleGenerateLoadSheet}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Load Sheet
                </Button>
              </div>
              <CardDescription>
                Aircraft weight calculation, trim sheet, and load optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today) ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="text-sm text-muted-foreground">Takeoff Weight</div>
                      <div className="text-2xl font-bold mt-1">
                        {loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.takeoffWeight.toLocaleString()} kg
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="text-sm text-muted-foreground">Zero Fuel Weight</div>
                      <div className="text-2xl font-bold mt-1">
                        {loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.zeroFuelWeight.toLocaleString()} kg
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="text-sm text-muted-foreground">Fuel</div>
                      <div className="text-2xl font-bold mt-1">
                        {loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.fuelWeight.toLocaleString()} kg
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="text-sm text-muted-foreground">CG Position</div>
                      <div className="text-2xl font-bold mt-1">
                        {loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.centerOfGravity}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-sm space-y-3">
                      <h3 className="font-medium">Weight Distribution</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Passengers</span>
                          <span className="font-medium">{loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.passengerWeight.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Cargo</span>
                          <span className="font-medium">{loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.cargoWeight.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Baggage</span>
                          <span className="font-medium">{loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.baggageWeight.toLocaleString()} kg</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/30 rounded-sm space-y-3">
                      <h3 className="font-medium">Load Distribution</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Forward</span>
                          <span className="font-medium">{loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.distribution.forward.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Aft</span>
                          <span className="font-medium">{loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.distribution.aft.toLocaleString()} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Trim Setting</span>
                          <span className="font-medium">{loadSheets.find(l => l.flightNumber === selectedFlight && l.date === today)?.trimSetting}°</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Load sheet not generated yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Generate load sheet after all passengers are checked in</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Baggage Tab */}
        <TabsContent value="baggage" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Baggage Management</CardTitle>
                <Dialog open={showBaggageDialog} onOpenChange={setShowBaggageDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Package className="h-4 w-4 mr-2" />
                      Add Baggage
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Baggage</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tag Number</Label>
                          <Input value={newBaggage.tagNumber} onChange={(e) => setNewBaggage({...newBaggage, tagNumber: e.target.value})} placeholder="BG12345678" />
                        </div>
                        <div>
                          <Label>PNR Number</Label>
                          <Input value={newBaggage.pnrNumber} onChange={(e) => setNewBaggage({...newBaggage, pnrNumber: e.target.value})} />
                        </div>
                        <div>
                          <Label>Passenger Name</Label>
                          <Input value={newBaggage.passengerName} onChange={(e) => setNewBaggage({...newBaggage, passengerName: e.target.value})} />
                        </div>
                        <div>
                          <Label>Weight (kg)</Label>
                          <Input type="number" value={newBaggage.weight} onChange={(e) => setNewBaggage({...newBaggage, weight: Number(e.target.value)})} />
                        </div>
                        <div>
                          <Label>Pieces</Label>
                          <Input type="number" value={newBaggage.pieces} onChange={(e) => setNewBaggage({...newBaggage, pieces: Number(e.target.value)})} />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBaggageDialog(false)}>Cancel</Button>
                      <Button onClick={handleAddBaggage}>Add Baggage</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Baggage tag generation, reconciliation, and tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Tag Number</th>
                      <th>Passenger</th>
                      <th>PNR</th>
                      <th>Route</th>
                      <th>Weight</th>
                      <th>Pieces</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baggageRecords.filter(b => b.flightNumber === selectedFlight).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No baggage records for this flight
                        </td>
                      </tr>
                    ) : (
                      baggageRecords.filter(b => b.flightNumber === selectedFlight).map((bag) => (
                        <tr key={bag.tagNumber}>
                          <td className="font-mono font-medium">{bag.tagNumber}</td>
                          <td className="text-sm">{bag.passengerName}</td>
                          <td className="font-mono text-sm">{bag.pnrNumber}</td>
                          <td className="text-sm flex items-center gap-1">
                            {bag.origin} <ArrowRight className="h-3 w-3" /> {bag.destination}
                          </td>
                          <td className="text-sm">{bag.weight} kg</td>
                          <td className="text-sm">{bag.pieces}</td>
                          <td>
                            <Badge 
                              variant={bag.status === 'loaded' ? 'default' : 
                                      bag.status === 'mishandled' ? 'destructive' : 'outline'}
                              className="capitalize"
                            >
                              {bag.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="ghost" size="sm" title="Print Tag">
                              <Printer className="h-4 w-4" />
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
    </div>
  )
}
