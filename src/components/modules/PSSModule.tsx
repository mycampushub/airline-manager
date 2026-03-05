'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Ticket as TicketIcon, 
  Users, 
  Calendar,
  Plane,
  DollarSign,
  Split,
  Merge,
  Clock,
  FileText,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { useAirlineStore, type PNR, type Passenger, type FlightSegment } from '@/lib/store'

export default function PSSModule() {
  const { pnrs, tickets, emds, createPNR, updatePNR, deletePNR, searchPNRs, issueTicket, voidTicket, refundTicket, issueEMD } = useAirlineStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPNR, setSelectedPNR] = useState<PNR | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('reservations')

  const [newPassenger, setNewPassenger] = useState<Passenger>({
    id: '',
    title: 'Mr',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    passportNumber: '',
    passportExpiry: '',
    nationality: '',
    ssr: []
  })

  const [newSegment, setNewSegment] = useState<FlightSegment>({
    id: '',
    flightNumber: '',
    airlineCode: 'AA',
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    aircraftType: 'B737-800',
    fareClass: 'Y',
    fareBasis: 'YEUR',
    status: 'confirmed',
    boardingClass: 'economy'
  })

  const [newPNR, setNewPNR] = useState({
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    remarks: ['']
  })

  const handleCreatePNR = () => {
    createPNR({
      passengers: [newPassenger],
      segments: [newSegment],
      contactInfo: newPNR.contactInfo,
      remarks: newPNR.remarks.filter(r => r.trim()),
      fareQuote: {
        baseFare: 250,
        taxes: 50,
        fees: 25,
        total: 325,
        currency: 'USD',
        fareRules: ['Non-refundable', 'No changes allowed']
      },
      paymentInfo: {
        paymentMethod: 'credit_card',
        amount: 325,
        currency: 'USD'
      }
    })
    setShowCreateDialog(false)
    resetForms()
  }

  const handleIssueTicket = (pnr: PNR) => {
    pnr.passengers.forEach(passenger => {
      issueTicket({
        pnrNumber: pnr.pnrNumber,
        passengerId: passenger.id,
        passengerName: `${passenger.title} ${passenger.firstName} ${passenger.lastName}`,
        fare: pnr.fareQuote,
        segments: pnr.segments
      })
    })
    updatePNR(pnr.pnrNumber, { status: 'ticketed' })
  }

  const handleVoidTicket = (ticketNumber: string) => {
    voidTicket(ticketNumber)
  }

  const resetForms = () => {
    setNewPassenger({
      id: '',
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      passportExpiry: '',
      nationality: '',
      ssr: []
    })
    setNewSegment({
      id: '',
      flightNumber: '',
      airlineCode: 'AA',
      origin: '',
      destination: '',
      departureDate: '',
      departureTime: '',
      arrivalDate: '',
      arrivalTime: '',
      aircraftType: 'B737-800',
      fareClass: 'Y',
      fareBasis: 'YEUR',
      status: 'confirmed',
      boardingClass: 'economy'
    })
    setNewPNR({
      contactInfo: { email: '', phone: '', address: '' },
      remarks: ['']
    })
  }

  const filteredPNRs = searchQuery ? searchPNRs(searchQuery) : pnrs

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Passenger Service System (PSS)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Core Reservation, Ticketing, and Inventory Management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New PNR
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New PNR</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Passenger Details */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Passenger Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Select value={newPassenger.title} onValueChange={(v) => setNewPassenger({...newPassenger, title: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Mrs">Mrs</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                          <SelectItem value="Dr">Dr</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input type="date" value={newPassenger.dateOfBirth} onChange={(e) => setNewPassenger({...newPassenger, dateOfBirth: e.target.value})} />
                    </div>
                    <div>
                      <Label>First Name</Label>
                      <Input value={newPassenger.firstName} onChange={(e) => setNewPassenger({...newPassenger, firstName: e.target.value})} />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <Input value={newPassenger.lastName} onChange={(e) => setNewPassenger({...newPassenger, lastName: e.target.value})} />
                    </div>
                    <div>
                      <Label>Passport Number</Label>
                      <Input value={newPassenger.passportNumber} onChange={(e) => setNewPassenger({...newPassenger, passportNumber: e.target.value})} />
                    </div>
                    <div>
                      <Label>Passport Expiry</Label>
                      <Input type="date" value={newPassenger.passportExpiry} onChange={(e) => setNewPassenger({...newPassenger, passportExpiry: e.target.value})} />
                    </div>
                    <div>
                      <Label>Nationality</Label>
                      <Input value={newPassenger.nationality} onChange={(e) => setNewPassenger({...newPassenger, nationality: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Flight Segment */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Flight Segment</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Flight Number</Label>
                      <Input value={newSegment.flightNumber} onChange={(e) => setNewSegment({...newSegment, flightNumber: e.target.value})} placeholder="AA123" />
                    </div>
                    <div>
                      <Label>Origin</Label>
                      <Input value={newSegment.origin} onChange={(e) => setNewSegment({...newSegment, origin: e.target.value})} placeholder="JFK" />
                    </div>
                    <div>
                      <Label>Destination</Label>
                      <Input value={newSegment.destination} onChange={(e) => setNewSegment({...newSegment, destination: e.target.value})} placeholder="LHR" />
                    </div>
                    <div>
                      <Label>Departure Date</Label>
                      <Input type="date" value={newSegment.departureDate} onChange={(e) => setNewSegment({...newSegment, departureDate: e.target.value})} />
                    </div>
                    <div>
                      <Label>Departure Time</Label>
                      <Input type="time" value={newSegment.departureTime} onChange={(e) => setNewSegment({...newSegment, departureTime: e.target.value})} />
                    </div>
                    <div>
                      <Label>Fare Class</Label>
                      <Select value={newSegment.fareClass} onValueChange={(v) => setNewSegment({...newSegment, fareClass: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Y">Y - Economy</SelectItem>
                          <SelectItem value="B">B - Economy Flex</SelectItem>
                          <SelectItem value="J">J - Business</SelectItem>
                          <SelectItem value="F">F - First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input value={newPNR.contactInfo.email} onChange={(e) => setNewPNR({...newPNR, contactInfo: {...newPNR.contactInfo, email: e.target.value}})} />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={newPNR.contactInfo.phone} onChange={(e) => setNewPNR({...newPNR, contactInfo: {...newPNR.contactInfo, phone: e.target.value}})} />
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Textarea value={newPNR.contactInfo.address} onChange={(e) => setNewPNR({...newPNR, contactInfo: {...newPNR.contactInfo, address: e.target.value}})} />
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <Label>Remarks</Label>
                  <Textarea placeholder="Add booking remarks..." value={newPNR.remarks[0]} onChange={(e) => setNewPNR({...newPNR, remarks: [e.target.value]})} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreatePNR}>Create PNR</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="reservations">Reservations (CRS)</TabsTrigger>
          <TabsTrigger value="ticketing">Ticketing</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>PNR Management</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search PNR, passenger..." 
                      className="pl-8 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <CardDescription>
                Create, modify, split, merge, and manage passenger name records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>PNR</th>
                      <th>Passengers</th>
                      <th>Route</th>
                      <th>Travel Date</th>
                      <th>Status</th>
                      <th>Fare</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPNRs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No PNRs found. Create a new PNR to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredPNRs.map((pnr) => (
                        <tr key={pnr.pnrNumber}>
                          <td className="font-mono font-medium">{pnr.pnrNumber}</td>
                          <td>
                            {pnr.passengers.map((p, i) => (
                              <div key={i} className="text-sm">{p.title} {p.firstName} {p.lastName}</div>
                            ))}
                          </td>
                          <td>
                            {pnr.segments.map((s, i) => (
                              <div key={i} className="text-sm flex items-center gap-1">
                                {s.origin} <ArrowRight className="h-3 w-3" /> {s.destination}
                              </div>
                            ))}
                          </td>
                          <td className="text-sm">{pnr.segments[0]?.departureDate || '-'}</td>
                          <td>
                            <Badge variant={pnr.status === 'confirmed' ? 'default' : pnr.status === 'ticketed' ? 'secondary' : 'destructive'} className="capitalize">
                              {pnr.status}
                            </Badge>
                          </td>
                          <td className="text-sm">${pnr.fareQuote.total}</td>
                          <td>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedPNR(pnr)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {pnr.status !== 'ticketed' && (
                                <Button variant="ghost" size="sm" onClick={() => handleIssueTicket(pnr)}>
                                  <TicketIcon className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => deletePNR(pnr.pnrNumber)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
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

          {/* PNR Detail View */}
          {selectedPNR && (
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>PNR Details: {selectedPNR.pnrNumber}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setSelectedPNR(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p className="font-medium capitalize">{selectedPNR.status}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="font-medium">{new Date(selectedPNR.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Agency</Label>
                    <p className="font-medium">{selectedPNR.agencyCode}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Passengers</h3>
                  <div className="space-y-2">
                    {selectedPNR.passengers.map((p, i) => (
                      <div key={i} className="p-3 bg-secondary/30 rounded-sm">
                        <div className="font-medium">{p.title} {p.firstName} {p.lastName}</div>
                        <div className="text-sm text-muted-foreground">
                          DOB: {p.dateOfBirth} | Passport: {p.passportNumber} | {p.nationality}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Flight Segments</h3>
                  <div className="space-y-2">
                    {selectedPNR.segments.map((s, i) => (
                      <div key={i} className="p-3 bg-secondary/30 rounded-sm flex items-center justify-between">
                        <div>
                          <div className="font-medium">{s.flightNumber} - {s.aircraftType}</div>
                          <div className="text-sm text-muted-foreground">
                            {s.origin} → {s.destination} | {s.departureDate} {s.departureTime}
                          </div>
                        </div>
                        <Badge variant="outline">{s.fareClass} Class</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Fare Quote</h3>
                  <div className="grid grid-cols-4 gap-4 p-3 bg-secondary/30 rounded-sm">
                    <div>
                      <Label className="text-muted-foreground">Base Fare</Label>
                      <p className="font-medium">${selectedPNR.fareQuote.baseFare}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Taxes</Label>
                      <p className="font-medium">${selectedPNR.fareQuote.taxes}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Fees</Label>
                      <p className="font-medium">${selectedPNR.fareQuote.fees}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Total</Label>
                      <p className="font-bold">${selectedPNR.fareQuote.total}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ticketing Tab */}
        <TabsContent value="ticketing" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Ticket Management</CardTitle>
              <CardDescription>
                E-ticket issuance, EMD, reissue, refund, and interline ticketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Ticket Number</th>
                      <th>Passenger</th>
                      <th>PNR</th>
                      <th>Route</th>
                      <th>Fare</th>
                      <th>Issued</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No tickets issued yet
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => (
                        <tr key={ticket.ticketNumber}>
                          <td className="font-mono font-medium">{ticket.ticketNumber}</td>
                          <td className="text-sm">{ticket.passengerName}</td>
                          <td className="font-mono text-sm">{ticket.pnrNumber}</td>
                          <td className="text-sm">
                            {ticket.segments.map((s, i) => (
                              <div key={i}>{s.origin} → {s.destination}</div>
                            ))}
                          </td>
                          <td className="text-sm">${ticket.fare.total}</td>
                          <td className="text-sm">{new Date(ticket.issuedAt).toLocaleDateString()}</td>
                          <td>
                            <Badge 
                              variant={ticket.status === 'open' ? 'default' : 
                                      ticket.status === 'void' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {ticket.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              {ticket.status === 'open' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleVoidTicket(ticket.ticketNumber)} title="Void">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => refundTicket(ticket.ticketNumber, 'Passenger request')} title="Refund">
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
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

          {/* EMD Section */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Electronic Misc Documents (EMD)</CardTitle>
              <CardDescription>
                Ancillary services, seat selections, baggage fees, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emds.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No EMDs issued yet
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>EMD Number</th>
                        <th>Passenger</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emds.map((emd) => (
                        <tr key={emd.emdNumber}>
                          <td className="font-mono font-medium">{emd.emdNumber}</td>
                          <td className="text-sm">{emd.passengerName}</td>
                          <td><Badge variant="outline" className="capitalize">{emd.type}</Badge></td>
                          <td className="text-sm">{emd.description}</td>
                          <td className="text-sm">${emd.amount}</td>
                          <td>
                            <Badge variant={emd.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {emd.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Fare Class Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Y', 'B', 'M', 'Q', 'K', 'L', 'T', 'E'].map((rbd) => (
                    <div key={rbd} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{rbd}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">9/9</span>
                        <Badge variant="outline" className="text-xs">Open</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Overbooking Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Economy</span>
                    <span className="font-medium">+5 seats</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Business</span>
                    <span className="font-medium">+2 seats</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>First</span>
                    <span className="font-medium">0 seats</span>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    Configured per route and season
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base">Seat Map Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Aircraft:</span>
                    <span className="font-medium ml-2">B737-800</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Configuration:</span>
                    <span className="font-medium ml-2">3-3</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total Seats:</span>
                    <span className="font-medium ml-2">189</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Available:</span>
                    <span className="font-medium ml-2 text-green-600">142</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Fare Families</CardTitle>
              <CardDescription>
                Manage fare families, bundled products, and pricing tiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>Family</th>
                    <th>Cabin</th>
                    <th>Fare Classes</th>
                    <th>Features</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">Basic Economy</td>
                    <td>Economy</td>
                    <td><Badge variant="outline">E</Badge> <Badge variant="outline">T</Badge></td>
                    <td className="text-sm text-muted-foreground">Personal item, no changes</td>
                    <td><Badge variant="default">Active</Badge></td>
                  </tr>
                  <tr>
                    <td className="font-medium">Standard</td>
                    <td>Economy</td>
                    <td><Badge variant="outline">Y</Badge> <Badge variant="outline">B</Badge></td>
                    <td className="text-sm text-muted-foreground">Carry-on, seat selection</td>
                    <td><Badge variant="default">Active</Badge></td>
                  </tr>
                  <tr>
                    <td className="font-medium">Flex</td>
                    <td>Economy</td>
                    <td><Badge variant="outline">M</Badge> <Badge variant="outline">Q</Badge></td>
                    <td className="text-sm text-muted-foreground">Full baggage, free changes</td>
                    <td><Badge variant="default">Active</Badge></td>
                  </tr>
                  <tr>
                    <td className="font-medium">Business</td>
                    <td>Business</td>
                    <td><Badge variant="outline">J</Badge> <Badge variant="outline">C</Badge></td>
                    <td className="text-sm text-muted-foreground">Lounge, priority, full service</td>
                    <td><Badge variant="default">Active</Badge></td>
                  </tr>
                  <tr>
                    <td className="font-medium">First</td>
                    <td>First</td>
                    <td><Badge variant="outline">F</Badge> <Badge variant="outline">A</Badge></td>
                    <td className="text-sm text-muted-foreground">Suites, private terminal, chef</td>
                    <td><Badge variant="default">Active</Badge></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
