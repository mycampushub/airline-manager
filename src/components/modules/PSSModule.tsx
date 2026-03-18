'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
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
  CheckCircle,
  Armchair,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Settings,
  MapPin,
  CalendarDays,
  Lock,
  Unlock,
  TrendingUp,
  User,
  Users2,
  LayoutGrid,
  Eye,
  EyeOff,
  AlertTriangle,
  Layers,
  Zap,
  FileEdit,
  Receipt,
  Calculator,
  FileCheck,
  History,
  Download,
  BarChart3,
  Percent,
  Info,
  XCircle,
  RefreshCw,
  Printer,
  Share2,
  Building,
  ShoppingCart
} from 'lucide-react'
import { useAirlineStore, type PNR, type Passenger, type FlightSegment, type Ticket, type TaxBreakdown } from '@/lib/store'

type SeatStatus = 'available' | 'occupied' | 'blocked' | 'selected' | 'premium'
type CabinClass = 'economy' | 'business' | 'first'

interface Seat {
  id: string
  row: number
  column: string
  status: SeatStatus
  price?: number
  isExitRow?: boolean
  isWing?: boolean
  isWindow?: boolean
  isAisle?: boolean
  cabin: CabinClass
  legroom?: number
  recline?: number
}

interface FareClass {
  code: string
  name: string
  hierarchy: number
  capacity: number
  sold: number
  available: number
  isOpen: boolean
  price: number
  parentCode?: string | null
  children?: string[]
  restrictions?: {
    advancePurchase?: number
    minStay?: number
    maxStay?: number
  }
}

interface FareFamily {
  id: string
  name: string
  cabin: CabinClass
  fareClasses: string[]
  features: string[]
  isActive: boolean
  pricingRules: {
    baseMarkup: number
    demandMultiplier: number
  }
}

interface ODRoute {
  id: string
  origin: string
  destination: string
  stops: number
  segments: {
    flightNumber: string
    origin: string
    destination: string
    departureTime: string
    arrivalTime: string
    aircraft: string
    duration: number
  }[]
  totalPrice: number
  totalDuration: number
  availableFareClasses: string[]
}

interface BlockedInventory {
  id: string
  agentId: string
  agentName: string
  seats: number
  route: string
  date: string
  expiresAt: string
  fareClass: string
  status: 'active' | 'expired' | 'released'
}

interface GroupAllotment {
  id: string
  groupName: string
  seats: number
  utilized: number
  route: string
  date: string
  deadline: string
  status: 'active' | 'expired' | 'cancelled'
}

interface BlackoutDate {
  id: string
  route: string
  startDate: string
  endDate: string
  cabin?: CabinClass
  fareClass?: string
  reason: string
}

interface FareClassConfig {
  code: string
  name: string
  hierarchy: number
  capacity: number
  price: number
  restrictions: {
    advancePurchase: number
    minStay: number
    maxStay: number
  }
}

export default function PSSModule() {
  const { pnrs, tickets, emds, createPNR, updatePNR, deletePNR, searchPNRs, issueTicket, voidTicket, refundTicket, exchangeTicket, issueEMD, pendingAction, setPendingAction, inventoryBlocks, groupAllotments, blackoutDates, fareFamilies, addInventoryBlock, removeInventoryBlock, addGroupAllotment, addBlackoutDate, removeBlackoutDate, addFareFamily } = useAirlineStore()
  const { toast } = useToast()
  
  // Handle pending actions from App header
  useEffect(() => {
    if (pendingAction) {
      switch (pendingAction.action) {
        case 'new':
          setShowCreateDialog(true)
          break
        case 'print':
          window.print()
          break
        case 'export':
          handleExportData()
          break
      }
      setPendingAction(null)
    }
  }, [pendingAction])
  
  // Generate demo data if needed
  useEffect(() => {
    // Generate additional PNRs if we don't have enough
    if (pnrs.length < 30) {
      const routes = [
        { origin: 'JFK', destination: 'LHR', flightNumber: 'AA100', duration: 420, aircraft: 'B777-300ER' },
        { origin: 'JFK', destination: 'LAX', flightNumber: 'AA200', duration: 375, aircraft: 'B787-9' },
        { origin: 'JFK', destination: 'ORD', flightNumber: 'AA300', duration: 120, aircraft: 'B737-800' },
        { origin: 'LAX', destination: 'LHR', flightNumber: 'AA400', duration: 645, aircraft: 'A350-900' },
        { origin: 'LAX', destination: 'SFO', flightNumber: 'AA500', duration: 90, aircraft: 'A320-200' },
        { origin: 'ORD', destination: 'MIA', flightNumber: 'AA600', duration: 180, aircraft: 'B737-800' },
        { origin: 'LHR', destination: 'CDG', flightNumber: 'AA700', duration: 75, aircraft: 'A320-200' },
        { origin: 'SFO', destination: 'SEA', flightNumber: 'AA800', duration: 130, aircraft: 'B737-800' },
        { origin: 'MIA', destination: 'ATL', flightNumber: 'AA900', duration: 120, aircraft: 'B737-800' },
        { origin: 'CDG', destination: 'FRA', flightNumber: 'AA1000', duration: 60, aircraft: 'A320-200' },
      ]
      
      const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra']
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
      
      const fareBases = [
        { code: 'YEXP', name: 'Economy Express', cabin: 'economy' as const, baseFare: 200 },
        { code: 'YFLEX', name: 'Economy Flexible', cabin: 'economy' as const, baseFare: 280 },
        { code: 'BFLEX', name: 'Business Flexible', cabin: 'business' as const, baseFare: 600 },
        { code: 'JPREM', name: 'Business Premium', cabin: 'business' as const, baseFare: 800 },
        { code: 'FFIRST', name: 'First Class', cabin: 'first' as const, baseFare: 1200 },
      ]
      
      const statuses: Array<'confirmed' | 'ticketed' | 'waitlist' | 'cancelled'> = ['confirmed', 'confirmed', 'confirmed', 'ticketed', 'ticketed', 'waitlist', 'cancelled']
      
      for (let i = pnrs.length; i < 30; i++) {
        const route = routes[Math.floor(Math.random() * routes.length)]
        const fare = fareBases[Math.floor(Math.random() * fareBases.length)]
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const departureDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const departureTime = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'][Math.floor(Math.random() * 9)]
        const arrivalDate = new Date(new Date(departureDate).getTime() + route.duration * 60 * 1000).toISOString().split('T')[0]
        const arrivalHours = parseInt(departureTime.split(':')[0]) + Math.floor(route.duration / 60)
        const arrivalMins = parseInt(departureTime.split(':')[1]) + (route.duration % 60)
        const arrivalTime = `${(arrivalHours % 24).toString().padStart(2, '0')}:${(arrivalMins % 60).toString().padStart(2, '0')}`
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        const passenger = {
          id: `P${String(i + 1000).padStart(4, '0')}`,
          title: ['Mr', 'Ms', 'Mrs', 'Dr'][Math.floor(Math.random() * 4)],
          firstName,
          lastName,
          dateOfBirth: `198${Math.floor(Math.random() * 9)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          passportNumber: `P${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
          passportExpiry: `202${Math.floor(Math.random() * 5) + 5}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
          nationality: ['US', 'UK', 'CA', 'AU', 'DE', 'FR'][Math.floor(Math.random() * 6)],
          ssr: [],
        }
        
        const pnr = createPNR({
          passengers: [passenger],
          segments: [{
            id: `SEG-${i + 1000}`,
            flightNumber: route.flightNumber,
            airlineCode: 'AA',
            origin: route.origin,
            destination: route.destination,
            departureDate,
            departureTime,
            arrivalDate,
            arrivalTime,
            aircraftType: route.aircraft,
            fareClass: fare.cabin === 'economy' ? 'Y' : fare.cabin === 'business' ? 'J' : 'F',
            fareBasis: fare.code,
            status: 'confirmed',
            boardingClass: fare.cabin,
          }],
          fareQuote: {
            baseFare: fare.baseFare,
            taxes: fare.baseFare * 0.15,
            fees: 40,
            total: fare.baseFare * 1.15 + 40,
            currency: 'USD',
            fareRules: fare.cabin === 'economy' ? ['Non-refundable', 'Changes allowed with fee'] : ['Fully refundable', 'Changes allowed'],
          },
          contactInfo: {
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
            phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
            address: `${Math.floor(Math.random() * 9999) + 1} Main St, City, ST 00000`,
          },
          paymentInfo: {
            paymentMethod: 'credit_card',
            cardLastFour: String(Math.floor(Math.random() * 9000) + 1000),
            amount: fare.baseFare * 1.15 + 40,
            currency: 'USD',
          },
          bookingClass: fare.cabin === 'economy' ? 'Y' : fare.cabin === 'business' ? 'J' : 'F',
          agentId: `AG${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
          agencyCode: 'TRAVEL01',
          remarks: [],
          status,
          source: ['web', 'mobile', 'api', 'agent'][Math.floor(Math.random() * 4)] as any,
        })
        
        // Issue ticket for confirmed and ticketed PNRs
        if (status !== 'cancelled' && status !== 'waitlist') {
          issueTicket({
            ticketNumber: '',
            pnrNumber: pnr.pnrNumber,
            passengerId: passenger.id,
            passengerName: `${passenger.title} ${firstName} ${lastName}`,
            fare: pnr.fareQuote,
            segments: pnr.segments,
            taxes: [
              { code: 'US', name: 'US Transportation Tax', amount: pnr.fareQuote.taxes * 0.4, currency: 'USD' },
              { code: 'XF', name: 'Passenger Facility Charge', amount: pnr.fareQuote.taxes * 0.3, currency: 'USD' },
              { code: 'AY', name: 'US User Fee', amount: pnr.fareQuote.taxes * 0.3, currency: 'USD' }
            ],
            commission: {
              amount: pnr.fareQuote.total * 0.07,
              rate: 7,
              paidTo: 'TRAVEL01'
            },
            validationAirline: 'AA',
            refundable: fare.cabin !== 'economy',
            changePenalty: fare.cabin === 'economy' ? 200 : 0
          })
        }
      }
    }
  }, [pnrs.length, createPNR, issueTicket])
  
  const handleExportData = () => {
    const headers = ['PNR', 'Status', 'Passengers', 'Origin', 'Destination', 'Amount']
    const rows = pnrs.map(p => [p.pnrNumber, p.status, p.passengers.map(x => `${x.firstName} ${x.lastName}`).join('; '), p.segments[0]?.origin || '', p.segments[0]?.destination || '', p.fareQuote.total])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'pnrs-export.csv'
    link.click()
  }
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPNR, setSelectedPNR] = useState<PNR | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('reservations')

  // Inventory Tab State
  const [inventorySubTab, setInventorySubTab] = useState('overview')
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [selectedAircraft, setSelectedAircraft] = useState('B737-800')
  const [selectedCabin, setSelectedCabin] = useState<CabinClass>('economy')
  const [odOrigin, setOdOrigin] = useState('JFK')
  const [odDestination, setOdDestination] = useState('LHR')
  const [odDate, setOdDate] = useState('')
  const [odRoutes, setOdRoutes] = useState<ODRoute[]>([])
  
  // Fare Classes with hierarchy support
  const [fareClasses, setFareClasses] = useState<FareClass[]>([
    // First Class
    { code: 'F', name: 'First Full', hierarchy: 1, capacity: 10, sold: 4, available: 6, isOpen: true, price: 1500, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }, parentCode: null },
    { code: 'A', name: 'First Discount', hierarchy: 2, capacity: 8, sold: 5, available: 3, isOpen: true, price: 1200, restrictions: { advancePurchase: 7, minStay: 0, maxStay: 180 }, parentCode: 'F' },
    { code: 'P', name: 'First Promo', hierarchy: 3, capacity: 5, sold: 3, available: 2, isOpen: true, price: 950, restrictions: { advancePurchase: 14, minStay: 3, maxStay: 90 }, parentCode: 'F' },
    // Business Class
    { code: 'J', name: 'Business Full', hierarchy: 4, capacity: 20, sold: 12, available: 8, isOpen: true, price: 800, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }, parentCode: null },
    { code: 'C', name: 'Business Flex', hierarchy: 5, capacity: 15, sold: 10, available: 5, isOpen: true, price: 700, restrictions: { advancePurchase: 3, minStay: 0, maxStay: 180 }, parentCode: 'J' },
    { code: 'D', name: 'Business Promo', hierarchy: 6, capacity: 10, sold: 7, available: 3, isOpen: true, price: 600, restrictions: { advancePurchase: 14, minStay: 3, maxStay: 90 }, parentCode: 'J' },
    { code: 'I', name: 'Business Corporate', hierarchy: 7, capacity: 12, sold: 8, available: 4, isOpen: true, price: 750, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }, parentCode: 'J' },
    { code: 'Z', name: 'Business Premium', hierarchy: 8, capacity: 8, sold: 5, available: 3, isOpen: true, price: 850, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }, parentCode: 'J' },
    { code: 'R', name: 'Business Saver', hierarchy: 9, capacity: 10, sold: 8, available: 2, isOpen: true, price: 550, restrictions: { advancePurchase: 21, minStay: 7, maxStay: 30 }, parentCode: 'J' },
    // Economy Class
    { code: 'Y', name: 'Economy Full', hierarchy: 10, capacity: 50, sold: 32, available: 18, isOpen: true, price: 350, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }, parentCode: null },
    { code: 'B', name: 'Economy Flex', hierarchy: 11, capacity: 40, sold: 28, available: 12, isOpen: true, price: 380, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }, parentCode: 'Y' },
    { code: 'M', name: 'Economy Semi-Flex', hierarchy: 12, capacity: 35, sold: 30, available: 5, isOpen: true, price: 320, restrictions: { advancePurchase: 7, minStay: 3, maxStay: 180 }, parentCode: 'Y' },
    { code: 'Q', name: 'Economy Saver', hierarchy: 13, capacity: 30, sold: 25, available: 5, isOpen: true, price: 280, restrictions: { advancePurchase: 14, minStay: 7, maxStay: 90 }, parentCode: 'B' },
    { code: 'K', name: 'Economy Promo', hierarchy: 14, capacity: 25, sold: 20, available: 5, isOpen: true, price: 240, restrictions: { advancePurchase: 21, minStay: 14, maxStay: 30 }, parentCode: 'B' },
    { code: 'L', name: 'Economy Deep Discount', hierarchy: 15, capacity: 20, sold: 15, available: 5, isOpen: true, price: 200, restrictions: { advancePurchase: 30, minStay: 0, maxStay: 30 }, parentCode: 'M' },
    { code: 'T', name: 'Economy Flash Sale', hierarchy: 16, capacity: 15, sold: 12, available: 3, isOpen: true, price: 150, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 7 }, parentCode: 'Q' },
    { code: 'E', name: 'Economy Basic', hierarchy: 17, capacity: 10, sold: 8, available: 2, isOpen: true, price: 120, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 0 }, parentCode: 'L' },
    { code: 'N', name: 'Economy No Frills', hierarchy: 18, capacity: 15, sold: 12, available: 3, isOpen: true, price: 100, restrictions: { advancePurchase: 0, minStay: 0, maxStay: 0 }, parentCode: 'E' },
    { code: 'W', name: 'Economy Weekend', hierarchy: 19, capacity: 12, sold: 9, available: 3, isOpen: true, price: 180, restrictions: { advancePurchase: 7, minStay: 0, maxStay: 3 }, parentCode: 'K' },
    { code: 'S', name: 'Economy Student', hierarchy: 20, capacity: 20, sold: 16, available: 4, isOpen: true, price: 160, restrictions: { advancePurchase: 30, minStay: 7, maxStay: 180 }, parentCode: 'M' },
    { code: 'V', name: 'Economy Corporate', hierarchy: 21, capacity: 25, sold: 18, available: 7, isOpen: true, price: 300, restrictions: { advancePurchase: 3, minStay: 0, maxStay: 365 }, parentCode: 'Y' },
  ])
  
  // Fare class bucket status history
  const [bucketStatusHistory, setBucketStatusHistory] = useState<Record<string, { timestamp: string, status: boolean, reason: string }[]>>({})
  
  // Route-specific inventory
  const [routeInventory, setRouteInventory] = useState<Record<string, {
    capacity: number
    sold: number
    fareClasses: Record<string, { capacity: number, sold: number, isOpen: boolean }>
    overbooking: { economy: number, business: number, first: number }
    blackoutDates: BlackoutDate[]
  }>>({
    'JFK-LHR': {
      capacity: 200,
      sold: 176,
      fareClasses: {
        'Y': { capacity: 50, sold: 42, isOpen: true },
        'B': { capacity: 40, sold: 35, isOpen: true },
        'J': { capacity: 20, sold: 16, isOpen: true },
        'F': { capacity: 10, sold: 8, isOpen: true },
      },
      overbooking: { economy: 5, business: 2, first: 0 },
      blackoutDates: [{ id: '1', route: 'JFK-LHR', startDate: '2024-12-20', endDate: '2024-12-26', cabin: 'economy', reason: 'Holiday peak' }]
    },
    'JFK-LAX': {
      capacity: 180,
      sold: 135,
      fareClasses: {
        'Y': { capacity: 45, sold: 38, isOpen: true },
        'B': { capacity: 35, sold: 28, isOpen: true },
        'J': { capacity: 18, sold: 12, isOpen: true },
      },
      overbooking: { economy: 4, business: 1, first: 0 },
      blackoutDates: []
    },
    'LHR-CDG': {
      capacity: 150,
      sold: 120,
      fareClasses: {
        'Y': { capacity: 40, sold: 32, isOpen: true },
        'B': { capacity: 30, sold: 24, isOpen: true },
        'J': { capacity: 15, sold: 12, isOpen: true },
      },
      overbooking: { economy: 3, business: 1, first: 0 },
      blackoutDates: []
    },
    'LAX-SFO': {
      capacity: 160,
      sold: 128,
      fareClasses: {
        'Y': { capacity: 45, sold: 38, isOpen: true },
        'B': { capacity: 35, sold: 28, isOpen: true },
      },
      overbooking: { economy: 4, business: 0, first: 0 },
      blackoutDates: []
    },
    'ORD-MIA': {
      capacity: 140,
      sold: 105,
      fareClasses: {
        'Y': { capacity: 40, sold: 32, isOpen: true },
        'B': { capacity: 30, sold: 24, isOpen: true },
        'J': { capacity: 15, sold: 11, isOpen: true },
      },
      overbooking: { economy: 3, business: 1, first: 0 },
      blackoutDates: []
    },
    'CDG-FRA': {
      capacity: 130,
      sold: 98,
      fareClasses: {
        'Y': { capacity: 38, sold: 30, isOpen: true },
        'B': { capacity: 28, sold: 22, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'SFO-SEA': {
      capacity: 120,
      sold: 90,
      fareClasses: {
        'Y': { capacity: 40, sold: 32, isOpen: true },
        'B': { capacity: 25, sold: 20, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'MIA-ATL': {
      capacity: 140,
      sold: 112,
      fareClasses: {
        'Y': { capacity: 42, sold: 35, isOpen: true },
        'B': { capacity: 32, sold: 26, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'FRA-MUC': {
      capacity: 110,
      sold: 82,
      fareClasses: {
        'Y': { capacity: 35, sold: 28, isOpen: true },
        'B': { capacity: 25, sold: 19, isOpen: true },
      },
      overbooking: { economy: 2, business: 0, first: 0 },
      blackoutDates: []
    },
    'JFK-ORD': {
      capacity: 150,
      sold: 120,
      fareClasses: {
        'Y': { capacity: 45, sold: 38, isOpen: true },
        'B': { capacity: 30, sold: 24, isOpen: true },
        'J': { capacity: 12, sold: 9, isOpen: true },
      },
      overbooking: { economy: 4, business: 1, first: 0 },
      blackoutDates: []
    },
    'LAX-SEA': {
      capacity: 130,
      sold: 97,
      fareClasses: {
        'Y': { capacity: 40, sold: 32, isOpen: true },
        'B': { capacity: 28, sold: 21, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'ORD-DEN': {
      capacity: 140,
      sold: 105,
      fareClasses: {
        'Y': { capacity: 42, sold: 33, isOpen: true },
        'B': { capacity: 30, sold: 24, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'LHR-MAD': {
      capacity: 145,
      sold: 109,
      fareClasses: {
        'Y': { capacity: 40, sold: 32, isOpen: true },
        'B': { capacity: 32, sold: 25, isOpen: true },
        'J': { capacity: 14, sold: 11, isOpen: true },
      },
      overbooking: { economy: 3, business: 1, first: 0 },
      blackoutDates: []
    },
    'CDG-ROM': {
      capacity: 135,
      sold: 101,
      fareClasses: {
        'Y': { capacity: 38, sold: 30, isOpen: true },
        'B': { capacity: 30, sold: 23, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'SFO-DEN': {
      capacity: 125,
      sold: 94,
      fareClasses: {
        'Y': { capacity: 38, sold: 30, isOpen: true },
        'B': { capacity: 26, sold: 20, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'MIA-DFW': {
      capacity: 150,
      sold: 113,
      fareClasses: {
        'Y': { capacity: 45, sold: 36, isOpen: true },
        'B': { capacity: 32, sold: 25, isOpen: true },
        'J': { capacity: 12, sold: 9, isOpen: true },
      },
      overbooking: { economy: 4, business: 1, first: 0 },
      blackoutDates: []
    },
    'ATL-CLT': {
      capacity: 130,
      sold: 104,
      fareClasses: {
        'Y': { capacity: 40, sold: 32, isOpen: true },
        'B': { capacity: 28, sold: 22, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'JFK-IAD': {
      capacity: 140,
      sold: 112,
      fareClasses: {
        'Y': { capacity: 42, sold: 34, isOpen: true },
        'B': { capacity: 30, sold: 24, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'LAX-DEN': {
      capacity: 145,
      sold: 116,
      fareClasses: {
        'Y': { capacity: 43, sold: 34, isOpen: true },
        'B': { capacity: 32, sold: 26, isOpen: true },
        'J': { capacity: 10, sold: 8, isOpen: true },
      },
      overbooking: { economy: 4, business: 1, first: 0 },
      blackoutDates: []
    },
    'ORD-ATL': {
      capacity: 135,
      sold: 108,
      fareClasses: {
        'Y': { capacity: 40, sold: 32, isOpen: true },
        'B': { capacity: 30, sold: 24, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'LHR-FRA': {
      capacity: 155,
      sold: 124,
      fareClasses: {
        'Y': { capacity: 45, sold: 36, isOpen: true },
        'B': { capacity: 35, sold: 28, isOpen: true },
        'J': { capacity: 15, sold: 12, isOpen: true },
        'F': { capacity: 8, sold: 6, isOpen: true },
      },
      overbooking: { economy: 4, business: 2, first: 0 },
      blackoutDates: []
    },
    'CDG-AMS': {
      capacity: 120,
      sold: 90,
      fareClasses: {
        'Y': { capacity: 38, sold: 30, isOpen: true },
        'B': { capacity: 26, sold: 20, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'SFO-PHX': {
      capacity: 125,
      sold: 100,
      fareClasses: {
        'Y': { capacity: 38, sold: 30, isOpen: true },
        'B': { capacity: 28, sold: 22, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'MIA-TPA': {
      capacity: 115,
      sold: 86,
      fareClasses: {
        'Y': { capacity: 35, sold: 28, isOpen: true },
        'B': { capacity: 25, sold: 19, isOpen: true },
      },
      overbooking: { economy: 2, business: 0, first: 0 },
      blackoutDates: []
    },
    'ATL-MCO': {
      capacity: 140,
      sold: 112,
      fareClasses: {
        'Y': { capacity: 42, sold: 34, isOpen: true },
        'B': { capacity: 30, sold: 24, isOpen: true },
      },
      overbooking: { economy: 3, business: 0, first: 0 },
      blackoutDates: []
    },
    'JFK-BOS': {
      capacity: 130,
      sold: 104,
      fareClasses: {
        'Y': { capacity: 40, sold: 32, isOpen: true },
        'B': { capacity: 28, sold: 22, isOpen: true },
        'J': { capacity: 12, sold: 9, isOpen: true },
      },
      overbooking: { economy: 3, business: 1, first: 0 },
      blackoutDates: []
    },
    'LAX-ORD': {
      capacity: 180,
      sold: 144,
      fareClasses: {
        'Y': { capacity: 48, sold: 38, isOpen: true },
        'B': { capacity: 35, sold: 28, isOpen: true },
        'J': { capacity: 18, sold: 14, isOpen: true },
      },
      overbooking: { economy: 4, business: 1, first: 0 },
      blackoutDates: []
    },
    'ORD-LAX': {
      capacity: 180,
      sold: 153,
      fareClasses: {
        'Y': { capacity: 50, sold: 42, isOpen: true },
        'B': { capacity: 38, sold: 30, isOpen: true },
        'J': { capacity: 18, sold: 15, isOpen: true },
      },
      overbooking: { economy: 4, business: 1, first: 0 },
      blackoutDates: []
    },
  })
  
  // Dynamic capacity adjustments
  const [capacityAdjustments, setCapacityAdjustments] = useState<Record<string, {
    route: string
    date: string
    originalCapacity: number
    adjustedCapacity: number
    reason: string
    timestamp: string
  }>>({
    '1': { route: 'JFK-LHR', date: '2024-12-15', originalCapacity: 200, adjustedCapacity: 205, reason: 'High demand', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    '2': { route: 'LAX-SFO', date: '2024-12-15', originalCapacity: 180, adjustedCapacity: 177, reason: 'Low demand forecast', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  })
  
  const [overbookingSettings, setOverbookingSettings] = useState({
    economy: 5,
    business: 2,
    first: 0,
    autoAdjust: true,
    loadFactorThreshold: 85,
  })
  
  const [blockedInventory, setBlockedInventory] = useState<BlockedInventory[]>([
    { id: '1', agentId: 'AGT001', agentName: 'Travel Corp', seats: 10, route: 'JFK-LHR', date: '2024-02-15', expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), fareClass: 'Y', status: 'active' },
    { id: '2', agentId: 'AGT002', agentName: 'Global Travel', seats: 5, route: 'JFK-LAX', date: '2024-02-16', expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), fareClass: 'B', status: 'active' },
  ])
  
  // Seat map state with selection support
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set())
  const [blockedSeats, setBlockedSeats] = useState<Set<string>>(new Set(['10A', '10B', '11A', '11B']))
  const [seatsOccupied, setSeatsOccupied] = useState<Set<string>>(new Set())
  
  // Seat configurations per aircraft type
  const [seatConfigurations, setSeatConfigurations] = useState<Record<string, {
    economy: { rows: number, columns: string[], exitRows: number[], wingRows: number[], premiumRows: number }
    business: { rows: number, columns: string[], exitRows: number[], wingRows: number[], premiumRows: number }
    first: { rows: number, columns: string[], exitRows: number[], wingRows: number[], premiumRows: number }
  }>>({
    'B737-800': {
      economy: { rows: 24, columns: ['A', 'B', 'C', 'D', 'E', 'F'], exitRows: [11, 12], wingRows: [18, 19, 20, 21], premiumRows: 4 },
      business: { rows: 9, columns: ['A', 'C', 'D', 'F'], exitRows: [], wingRows: [5, 6], premiumRows: 9 },
      first: { rows: 4, columns: ['A', 'D'], exitRows: [], wingRows: [], premiumRows: 4 }
    },
    'A320-200': {
      economy: { rows: 25, columns: ['A', 'B', 'C', 'D', 'E', 'F'], exitRows: [12, 13], wingRows: [19, 20, 21, 22], premiumRows: 4 },
      business: { rows: 10, columns: ['A', 'C', 'D', 'F'], exitRows: [], wingRows: [5, 6], premiumRows: 10 },
      first: { rows: 4, columns: ['A', 'D'], exitRows: [], wingRows: [], premiumRows: 4 }
    },
    'B777-300ER': {
      economy: { rows: 35, columns: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'], exitRows: [31, 32, 33], wingRows: [25, 26, 27, 28], premiumRows: 6 },
      business: { rows: 12, columns: ['A', 'D', 'G', 'K'], exitRows: [], wingRows: [6, 7], premiumRows: 12 },
      first: { rows: 6, columns: ['A', 'K'], exitRows: [], wingRows: [], premiumRows: 6 }
    },
    'A350-900': {
      economy: { rows: 32, columns: ['A', 'C', 'D', 'G', 'H', 'K', 'L'], exitRows: [30, 31], wingRows: [22, 23, 24, 25], premiumRows: 5 },
      business: { rows: 14, columns: ['A', 'D', 'G', 'K'], exitRows: [], wingRows: [7, 8], premiumRows: 14 },
      first: { rows: 6, columns: ['A', 'K'], exitRows: [], wingRows: [], premiumRows: 6 }
    }
  })
  
  // Fare class restrictions
  const [fareClassRestrictions, setFareClassRestrictions] = useState<Record<string, {
    route?: string
    cabin?: CabinClass
    seasonalRestrictions?: { period: string, startDate: string, endDate: string }[]
    bookingClassRestrictions?: string[]
    corporateFareRules?: { corporateId: string, discount: number, restrictions: string[] }[]
    groupBookingRules?: { minPax: number, maxPax: number, depositRequired: boolean }[]
    nestedRestrictions?: { canBookInto: string[], cannotBookInto: string[] }
  }>>({
    'Y': {
      cabin: 'economy',
      seasonalRestrictions: [
        { period: 'Peak Holiday', startDate: '2024-12-20', endDate: '2024-12-26' },
        { period: 'Summer Peak', startDate: '2024-07-01', endDate: '2024-08-31' }
      ],
      groupBookingRules: [{ minPax: 10, maxPax: 50, depositRequired: true }]
    },
    'F': {
      cabin: 'first',
      corporateFareRules: [{ corporateId: 'CORP001', discount: 15, restrictions: ['No advance purchase required', 'Full refundable'] }],
      nestedRestrictions: { canBookInto: ['A', 'J', 'C', 'Y', 'B', 'M', 'Q'], cannotBookInto: [] }
    }
  })
  
  // Confirmation dialog state
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} })
  
  // O&D search options
  const [odOptions, setOdOptions] = useState({
    maxStops: 2,
    includeMarriedSegments: true,
    allowOpenJaw: true,
    preferredCabin: 'economy' as CabinClass
  })

  // Dynamic Capacity Adjustment state
  const [loadFactorThreshold, setLoadFactorThreshold] = useState(85)
  const [autoAdjustCapacity, setAutoAdjustCapacity] = useState(true)

  // Dialog states
  const [showFareClassDialog, setShowFareClassDialog] = useState(false)
  const [editingFareClass, setEditingFareClass] = useState<FareClassConfig | null>(null)
  const [showFareFamilyDialog, setShowFareFamilyDialog] = useState(false)
  const [showOverbookingDialog, setShowOverbookingDialog] = useState(false)
  const [showBlockInventoryDialog, setShowBlockInventoryDialog] = useState(false)
  const [showGroupAllotmentDialog, setShowGroupAllotmentDialog] = useState(false)
  const [showBlackoutDialog, setShowBlackoutDialog] = useState(false)
  const [showSeatConfigDialog, setShowSeatConfigDialog] = useState(false)

  // PNR Management Dialogs
  const [showSplitDialog, setShowSplitDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [showRequoteDialog, setShowRequoteDialog] = useState(false)
  const [showQueueDialog, setShowQueueDialog] = useState(false)
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false)

  // Single passenger/segment state (for legacy compatibility)
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

  // Multi-segment booking state
  const [segments, setSegments] = useState<FlightSegment[]>([{ ...newSegment, id: `SEG-${Date.now()}` }])
  const [passengers, setPassengers] = useState<Passenger[]>([{ ...newPassenger, id: `PAX-${Date.now()}` }])

  // PNR operation state
  const [selectedPNRsForMerge, setSelectedPNRsForMerge] = useState<string[]>([])
  const [splitPassengerGroups, setSplitPassengerGroups] = useState<number[][]>([])
  const [requoteResult, setRequoteResult] = useState<any>(null)
  const [queuePriority, setQueuePriority] = useState(5)
  const [waitlistFlight, setWaitlistFlight] = useState({ flightNumber: '', date: '' })

  // Ticketing Dialog States
  const [showPartialExchangeDialog, setShowPartialExchangeDialog] = useState(false)
  const [showInvoluntaryRefundDialog, setShowInvoluntaryRefundDialog] = useState(false)
  const [showTaxCalculatorDialog, setShowTaxCalculatorDialog] = useState(false)
  const [showRefundFeeCalculator, setShowRefundFeeCalculator] = useState(false)
  const [showCommissionDialog, setShowCommissionDialog] = useState(false)
  const [showAuditTrailDialog, setShowAuditTrailDialog] = useState(false)
  const [showBSPReportingDialog, setShowBSPReportingDialog] = useState(false)
  const [showTicketDetailDialog, setShowTicketDetailDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  // Ticketing operation state
  const [selectedSegmentsForExchange, setSelectedSegmentsForExchange] = useState<string[]>([])
  const [exchangeNewFare, setExchangeNewFare] = useState(0)
  const [involuntaryRefundReason, setInvoluntaryRefundReason] = useState('')
  const [involuntaryRefundApprover, setInvoluntaryRefundApprover] = useState('')
  const [taxCalculatorParams, setTaxCalculatorParams] = useState({
    origin: '',
    destination: '',
    fare: 0,
    passengerType: 'adult' as 'adult' | 'child' | 'infant',
    routeType: 'domestic' as 'domestic' | 'international'
  })
  const [calculatedTaxes, setCalculatedTaxes] = useState<TaxBreakdown[]>([])
  const [refundFeeParams, setRefundFeeParams] = useState({
    timeToDeparture: 0,
    fareClass: 'economy' as 'first' | 'business' | 'economy',
    refundReason: 'voluntary' as 'voluntary' | 'involuntary',
    fareType: 'regular' as 'regular' | 'promotional'
  })
  const [calculatedRefundFee, setCalculatedRefundFee] = useState(0)
  const [bspReportPeriod, setBSPReportPeriod] = useState('daily' as 'daily' | 'weekly' | 'monthly')
  const [bspReportType, setBSPReportType] = useState('settlement' as 'settlement' | 'billing' | 'refunds')

  // Additional PSS Features State
  const [selectedCorporateAccount, setSelectedCorporateAccount] = useState<string>('')
  const [isGroupBooking, setIsGroupBooking] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupBookingDiscount, setGroupBookingDiscount] = useState(0)
  const [fareRuleViolations, setFareRuleViolations] = useState<string[]>([])
  const [showFareRulesDialog, setShowFareRulesDialog] = useState(false)
  const [showSSRDialog, setShowSSRDialog] = useState(false)
  const [selectedPassengerSSR, setSelectedPassengerSSR] = useState<number | null>(null)
  const [showTimeLimitDialog, setShowTimeLimitDialog] = useState(false)
  const [newTimeLimit, setNewTimeLimit] = useState('')
  const [showMarriedSegmentsDialog, setShowMarriedSegmentsDialog] = useState(false)
  const [marriedSegmentKey, setMarriedSegmentKey] = useState('')
  const [showRemarksDialog, setShowRemarksDialog] = useState(false)
  const [newRemark, setNewRemark] = useState('')
  const [remarkCategory, setRemarkCategory] = useState('internal')
  const [showCorporateDialog, setShowCorporateDialog] = useState(false)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [showEMDDialog, setShowEMDDialog] = useState(false)
  const [selectedEMD, setSelectedEMD] = useState<any>(null)

  // In-memory ticket audit trail
  const [ticketAuditTrail, setTicketAuditTrail] = useState<any[]>([])

  // O&D Booking State
  const [selectedODRoute, setSelectedODRoute] = useState<ODRoute | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
    cabinClass: 'economy' as CabinClass,
    fareClass: 'Y'
  })

  // Additional Form State for Fare Class Management
  const [newFareClass, setNewFareClass] = useState({
    code: '',
    name: '',
    hierarchy: 1,
    capacity: 50,
    price: 0,
    restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }
  })

  // Additional Form State for Fare Family
  const [newFareFamily, setNewFareFamily] = useState({
    name: '',
    cabin: 'economy' as CabinClass,
    fareClasses: [] as string[],
    features: '',
    baseMarkup: 0,
    demandMultiplier: 1
  })

  // Form Validation State
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation Functions
  const validatePNRForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate passengers
    if (passengers.length === 0) {
      newErrors.passengers = 'At least one passenger is required'
    }

    // Validate segments
    if (segments.length === 0) {
      newErrors.segments = 'At least one flight segment is required'
    }

    // Validate contact info
    if (!newPNR.contactInfo.email || !/^[^\s@]+@\s+\.\s]+$/.test(newPNR.contactInfo.email)) {
      newErrors.contactInfo = 'Please enter a valid email address'
    }

    // Validate phone
    if (!newPNR.contactInfo.phone) {
      newErrors.phone = 'Phone number is required'
    }

    // Validate departure dates
    segments.forEach((seg, index) => {
      if (!seg.departureDate) {
        newErrors[`segment${index}_departureDate`] = `Departure date is required for segment ${index + 1}`
      }
      if (!seg.departureTime) {
        newErrors[`segment${index}_departureTime`] = `Departure time is required for segment ${index + 1}`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateFareClassForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!newFareClass.code) {
      newErrors.code = 'Fare class code is required'
    }
    if (!newFareClass.name) {
      newErrors.name = 'Fare class name is required'
    }
    if (!newFareClass.capacity || newFareClass.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0'
    }
    if (!newFareClass.price || newFareClass.price < 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    if (newFareClass.hierarchy < 1 || newFareClass.hierarchy > 13) {
      newErrors.hierarchy = 'Hierarchy must be between 1 and 13'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateFareFamilyForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!newFareFamily.name) {
      newErrors.name = 'Fare family name is required'
    }
    if (!newFareFamily.cabin) {
      newErrors.cabin = 'Cabin class is required'
    }
    if (newFareFamily.fareClasses.length === 0) {
      newErrors.fareClasses = 'At least one fare class is required'
    }
    if (newFareFamily.features.trim() === '') {
      newErrors.features = 'Features description is required'
    }
    if (newFareFamily.baseMarkup < 0) {
      newErrors.baseMarkup = 'Base markup must be >= 0'
    }
    if (newFareFamily.demandMultiplier < 0 || newFareFamily.demandMultiplier > 3) {
      newErrors.demandMultiplier = 'Demand multiplier must be between 0 and 3'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateBookingForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!bookingForm.origin || !bookingForm.destination) {
      newErrors.origin = 'Origin and destination are required'
    }
    if (bookingForm.origin === bookingForm.destination) {
      newErrors.destination = 'Origin and destination must be different'
    }
    if (!bookingForm.date) {
      newErrors.date = 'Travel date is required'
    }
    if (!bookingForm.passengers || bookingForm.passengers < 1) {
      newErrors.passengers = 'At least 1 passenger is required'
    }
    if (bookingForm.passengers > 9) {
      newErrors.passengers = 'Maximum 9 passengers per booking'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form Reset Functions
  const resetPNRForm = () => {
    setNewPNR({
      contactInfo: { email: '', phone: '', address: '' },
      remarks: ['']
    })
    setSegments([{ ...newSegment }])
    setPassengers([{ ...newPassenger }])
    setErrors({})
  }

  const resetFareClassForm = () => {
    setNewFareClass({
      code: '',
      name: '',
      hierarchy: 1,
      capacity: 50,
      price: 0,
      restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }
    })
    setErrors({})
  }

  const resetFareFamilyForm = () => {
    setNewFareFamily({
      name: '',
      cabin: 'economy',
      fareClasses: [],
      features: '',
      baseMarkup: 0,
      demandMultiplier: 1
    })
    setErrors({})
  }

  // Loading Wrapper
  const withLoading = async (fn: () => Promise<void>) => {
    setIsSubmitting(true)
    try {
      await fn()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Additional Form State for Block Inventory
  const [newBlockInventory, setNewBlockInventory] = useState({
    agentId: '',
    route: '',
    date: '',
    seats: 0,
    fareClass: '',
    duration: 30
  })

  // Additional Form State for Group Allotment
  const [newGroupAllotment, setNewGroupAllotment] = useState({
    groupName: '',
    route: '',
    date: '',
    seats: 0,
    deadline: ''
  })

  // Additional Form State for Blackout Date
  const [newBlackoutDate, setNewBlackoutDate] = useState({
    route: '',
    startDate: '',
    endDate: '',
    cabin: undefined as CabinClass | undefined,
    fareClass: '',
    reason: ''
  })

  // Ticketing helper interfaces
  interface TaxRate {
    code: string
    name: string
    rate: number
    refundable: boolean
    appliesTo: 'domestic' | 'international' | 'both'
  }

  const taxRates: TaxRate[] = [
    { code: 'US', name: 'US Transportation Tax', rate: 0.075, refundable: true, appliesTo: 'domestic' },
    { code: 'AY', name: 'US Flight Segment Tax', rate: 4.50, refundable: true, appliesTo: 'domestic' },
    { code: 'XF', name: 'Passenger Facility Charge', rate: 4.50, refundable: true, appliesTo: 'domestic' },
    { code: 'XA', name: 'Animal and Plant Health Inspection', rate: 3.96, refundable: true, appliesTo: 'international' },
    { code: 'YC', name: 'Immigration User Fee', rate: 7.00, refundable: true, appliesTo: 'international' },
    { code: 'XY', name: 'Customs User Fee', rate: 5.50, refundable: true, appliesTo: 'international' },
    { code: 'YM', name: 'Passenger Security Service Fee', rate: 5.60, refundable: true, appliesTo: 'international' },
    { code: 'XT', name: 'Foreign Government Tax', rate: 0.15, refundable: false, appliesTo: 'international' },
    { code: 'QX', name: 'Ticket Service Charge', rate: 0.05, refundable: true, appliesTo: 'both' },
  ]

  // Generate seat map based on aircraft type
  const generateSeatMap = (aircraft: string, cabin: CabinClass): Seat[] => {
    const seats: Seat[] = []
    const config = getAircraftConfig(aircraft, cabin)
    
    for (let row = config.startRow; row <= config.endRow; row++) {
      config.columns.forEach((col) => {
        const isExitRow = config.exitRows?.includes(row)
        const isWing = config.wingRows?.includes(row)
        const isWindow = col === config.columns[0] || col === config.columns[config.columns.length - 1]
        const isAisle = config.aisleIndices?.includes(config.columns.indexOf(col))
        const isPremium = row <= config.premiumRows
        
        const status: SeatStatus = blockedSeats.has(`${row}${col}`) ? 'blocked' :
                                    seatsOccupied.has(`${row}${col}`) ? 'occupied' :
                                    Math.random() > 0.7 ? 'occupied' : 
                                    Math.random() > 0.9 ? 'blocked' : 
                                    isPremium ? 'premium' : 'available'
        
        seats.push({
          id: `${row}${col}`,
          row,
          column: col,
          status,
          price: isPremium ? 450 : 350,
          isExitRow,
          isWing,
          isWindow,
          isAisle,
          cabin,
          legroom: isPremium ? 38 : 32,
          recline: isPremium ? 8 : 5
        })
      })
    }
    
    return seats
  }

  const getAircraftConfig = (aircraft: string, cabin: CabinClass) => {
    const configs: Record<string, any> = {
      'B737-800': {
        economy: { startRow: 10, endRow: 33, columns: ['A', 'B', 'C', 'D', 'E', 'F'], exitRows: [11, 12], wingRows: [18, 19, 20, 21], premiumRows: 11, aisleIndices: [2, 3] },
        business: { startRow: 1, endRow: 9, columns: ['A', 'C', 'D', 'F'], exitRows: [], wingRows: [5, 6], premiumRows: 9, aisleIndices: [1, 2] },
        first: { startRow: 1, endRow: 4, columns: ['A', 'D'], exitRows: [], wingRows: [], premiumRows: 4, aisleIndices: [1] }
      },
      'A320-200': {
        economy: { startRow: 11, endRow: 35, columns: ['A', 'B', 'C', 'D', 'E', 'F'], exitRows: [12, 13], wingRows: [19, 20, 21, 22], premiumRows: 12, aisleIndices: [2, 3] },
        business: { startRow: 1, endRow: 10, columns: ['A', 'C', 'D', 'F'], exitRows: [], wingRows: [5, 6], premiumRows: 10, aisleIndices: [1, 2] },
        first: { startRow: 1, endRow: 4, columns: ['A', 'D'], exitRows: [], wingRows: [], premiumRows: 4, aisleIndices: [1] }
      }
    }
    return configs[aircraft]?.[cabin] || configs['B737-800'][cabin]
  }

  const seats = generateSeatMap(selectedAircraft, selectedCabin)

  // ENHANCED SEAT MAP with selection, blocking, and pricing
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return
    
    if (seat.status === 'blocked') {
      // Offer to unblock seat
      setConfirmationDialog({
        isOpen: true,
        title: `Unblock Seat ${seat.id}?`,
        message: `This seat is currently blocked. Do you want to unblock it?`,
        onConfirm: () => {
          setBlockedSeats(prev => {
            const newBlocked = new Set(prev)
            newBlocked.delete(seat.id)
            return newBlocked
          })
          setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} })
        }
      })
      return
    }
    
    // Toggle seat selection
    setSelectedSeats(prev => {
      const newSelected = new Set(prev)
      if (newSelected.has(seat.id)) {
        newSelected.delete(seat.id)
      } else {
        newSelected.add(seat.id)
      }
      return newSelected
    })
    
    setSelectedSeat(seat)
  }
  
  const handleBlockSeat = (seatId: string) => {
    setBlockedSeats(prev => {
      const newBlocked = new Set(prev)
      if (newBlocked.has(seatId)) {
        newBlocked.delete(seatId)
      } else {
        newBlocked.add(seatId)
      }
      // Also remove from selection if blocked
      setSelectedSeats(prev => {
        const newSelected = new Set(prev)
        newSelected.delete(seatId)
        return newSelected
      })
      return newBlocked
    })
  }
  
  const handleBulkBlockSeats = (row: number) => {
    const rowSeats = seats.filter(s => s.row === row)
    const areAllBlocked = rowSeats.every(s => blockedSeats.has(s.id))
    
    if (areAllBlocked) {
      // Unblock all seats in row
      setBlockedSeats(prev => {
        const newBlocked = new Set(prev)
        rowSeats.forEach(s => newBlocked.delete(s.id))
        return newBlocked
      })
    } else {
      // Block all available seats in row
      setBlockedSeats(prev => {
        const newBlocked = new Set(prev)
        rowSeats.forEach(s => {
          if (s.status === 'available' || s.status === 'premium') {
            newBlocked.add(s.id)
            setSelectedSeats(prev => {
              const newSelected = new Set(prev)
              newSelected.delete(s.id)
              return newSelected
            })
          }
        })
        return newBlocked
      })
    }
  }
  
  // State for saved seat assignments
  const [savedSeatAssignments, setSavedSeatAssignments] = useState<{seatId: string, pnrNumber: string, price: number, timestamp: string}[]>([])
  
  const handleSaveSeatSelection = () => {
    if (selectedSeats.size === 0) {
      toast({ title: 'No Seats Selected', description: 'Please select at least one seat to save' })
      return
    }
    
    // If no PNR is selected, create a new one
    if (!selectedPNR) {
      toast({ title: 'No PNR Selected', description: 'Please select or create a PNR first' })
      return
    }
    
    // Calculate total price and save seats
    const totalPrice = Array.from(selectedSeats).reduce((sum, seatId) => {
      const seat = seats.find(s => s.id === seatId)
      return sum + (seat?.price || 0)
    }, 0)
    
    // Update the selected PNR with the selected seats
    updatePNR(selectedPNR.pnrNumber, {
      seats: Array.from(selectedSeats),
      remarks: [
        ...(selectedPNR.remarks || []),
        `Seat(s) selected: ${Array.from(selectedSeats).join(', ')} on ${selectedAircraft}`
      ]
    })
    
    // Also save to savedSeatAssignments for reference
    const newAssignments = Array.from(selectedSeats).map(seatId => ({
      seatId,
      pnrNumber: selectedPNR.pnrNumber,
      price: seats.find(s => s.id === seatId)?.price || 0,
      timestamp: new Date().toISOString()
    }))
    
    setSavedSeatAssignments([...savedSeatAssignments, ...newAssignments])
    
    // Mark seats as occupied in the seat map
    setSeatsOccupied(prev => {
      const newOccupied = new Set(prev)
      selectedSeats.forEach(seatId => newOccupied.add(seatId))
      return newOccupied
    })
    
    setSelectedSeats(new Set())
    setSelectedSeat(null)
    
    toast({
      title: 'Seats Saved',
      description: `${selectedSeats.size} seat(s) saved to PNR ${selectedPNR.pnrNumber}`
    })
  }

  // REAL-TIME FARE CLASS CONTROL with confirmation and history
  const handleToggleFareBucket = (code: string) => {
    const fareClass = fareClasses.find(fc => fc.code === code)
    if (!fareClass) return
    
    const newStatus = !fareClass.isOpen
    const action = newStatus ? 'open' : 'close'
    
    // Show confirmation for closing buckets
    if (!newStatus) {
      setConfirmationDialog({
        isOpen: true,
        title: `Close Fare Bucket ${code}?`,
        message: `You are about to close the ${code} (${fareClass.name}) fare bucket. This will prevent new bookings in this class. Are you sure?`,
        onConfirm: () => {
          updateFareBucketStatus(code, newStatus)
          setConfirmationDialog({ isOpen: false, title: '', message: '', onConfirm: () => {} })
        }
      })
    } else {
      updateFareBucketStatus(code, newStatus)
    }
  }
  
  const updateFareBucketStatus = (code: string, isOpen: boolean) => {
    const now = new Date().toISOString()
    const reason = isOpen ? 'Manual open' : 'Manual close'
    
    // Update fare class status
    setFareClasses(fareClasses.map(fc => 
      fc.code === code ? { ...fc, isOpen } : fc
    ))
    
    // Record history
    setBucketStatusHistory(prev => ({
      ...prev,
      [code]: [
        ...(prev[code] || []),
        { timestamp: now, status: isOpen, reason }
      ].slice(-20) // Keep last 20 entries
    }))
    
    // Handle nested fare classes - if parent closes, children close
    if (!isOpen) {
      const children = fareClasses.filter(fc => fc.parentCode === code)
      children.forEach(child => {
        setFareClasses(prev => prev.map(fc => 
          fc.code === child.code ? { ...fc, isOpen: false } : fc
        ))
        setBucketStatusHistory(prev => ({
          ...prev,
          [child.code]: [
            ...(prev[child.code] || []),
            { timestamp: now, status: false, reason: `Parent ${code} closed` }
          ].slice(-20)
        }))
      })
    }
  }

  // O&D CONTROL - Enhanced with in-memory calculation
  const handleSearchOD = () => {
    const routes = calculateODAvailability(
      odOrigin,
      odDestination,
      odDate || new Date().toISOString().split('T')[0],
      odOptions.maxStops
    )
    setOdRoutes(routes)
  }
  
  const calculateODAvailability = (origin: string, destination: string, date: string, maxStops: number): ODRoute[] => {
    // Simulated connecting routes database
    const connectingRoutes = [
      { flightNumber: 'AA100', origin: 'JFK', destination: 'LHR', departureTime: '18:30', arrivalTime: '06:30+1', aircraft: 'B777-300ER', duration: 420 },
      { flightNumber: 'AA106', origin: 'JFK', destination: 'LAX', departureTime: '09:00', arrivalTime: '12:15', aircraft: 'B777-300ER', duration: 375 },
      { flightNumber: 'AA287', origin: 'LAX', destination: 'LHR', departureTime: '16:45', arrivalTime: '10:30+1', aircraft: 'A350-900', duration: 645 },
      { flightNumber: 'AA156', origin: 'JFK', destination: 'ORD', departureTime: '11:00', arrivalTime: '13:00', aircraft: 'B737-800', duration: 120 },
      { flightNumber: 'AA98', origin: 'ORD', destination: 'LHR', departureTime: '17:30', arrivalTime: '07:00+1', aircraft: 'B777-300ER', duration: 510 },
      { flightNumber: 'BA117', origin: 'JFK', destination: 'LHR', departureTime: '19:00', arrivalTime: '07:00+1', aircraft: 'A350-900', duration: 420 },
      { flightNumber: 'VS4', origin: 'JFK', destination: 'LHR', departureTime: '20:30', arrivalTime: '08:30+1', aircraft: 'A350-1000', duration: 420 },
      { flightNumber: 'DL1', origin: 'JFK', destination: 'CDG', departureTime: '17:25', arrivalTime: '07:25+1', aircraft: 'A330-900', duration: 420 },
      { flightNumber: 'AF7', origin: 'CDG', destination: 'LHR', departureTime: '09:00', arrivalTime: '09:45', aircraft: 'A320-200', duration: 45 },
      { flightNumber: 'LH400', origin: 'JFK', destination: 'FRA', departureTime: '16:00', arrivalTime: '06:00+1', aircraft: 'B747-8', duration: 480 },
      { flightNumber: 'LH450', origin: 'FRA', destination: 'LHR', departureTime: '08:30', arrivalTime: '09:20', aircraft: 'A320neo', duration: 50 },
    ]
    
    const routes: ODRoute[] = []
    
    // Find direct flights
    const directFlights = connectingRoutes.filter(r => r.origin === origin && r.destination === destination)
    directFlights.forEach(flight => {
      const price = calculateRoutePrice([flight], 'economy')
      routes.push({
        id: `direct-${flight.flightNumber}`,
        origin,
        destination,
        stops: 0,
        segments: [flight],
        totalPrice: price,
        totalDuration: flight.duration,
        availableFareClasses: getAvailableFareClassesForRoute(flight.origin, flight.destination)
      })
    })
    
    // Find 1-stop connections if allowed
    if (maxStops >= 1) {
      const firstLegs = connectingRoutes.filter(r => r.origin === origin)
      firstLegs.forEach(firstLeg => {
        const secondLegs = connectingRoutes.filter(r => 
          r.origin === firstLeg.destination && 
          r.destination === destination &&
          isValidConnection(firstLeg.arrivalTime, r.departureTime)
        )
        secondLegs.forEach(secondLeg => {
          const price = calculateRoutePrice([firstLeg, secondLeg], 'economy')
          routes.push({
            id: `1stop-${firstLeg.flightNumber}-${secondLeg.flightNumber}`,
            origin,
            destination,
            stops: 1,
            segments: [firstLeg, secondLeg],
            totalPrice: price * 0.9, // Discount for connecting flights
            totalDuration: firstLeg.duration + secondLeg.duration + 120, // Include 2h connection
            availableFareClasses: mergeFareClasses([
              getAvailableFareClassesForRoute(firstLeg.origin, firstLeg.destination),
              getAvailableFareClassesForRoute(secondLeg.origin, secondLeg.destination)
            ])
          })
        })
      })
    }
    
    // Find 2-stop connections if allowed
    if (maxStops >= 2) {
      const firstLegs = connectingRoutes.filter(r => r.origin === origin)
      firstLegs.forEach(firstLeg => {
        const secondLegs = connectingRoutes.filter(r => 
          r.origin === firstLeg.destination && 
          isValidConnection(firstLeg.arrivalTime, r.departureTime)
        )
        secondLegs.forEach(secondLeg => {
          const thirdLegs = connectingRoutes.filter(r => 
            r.origin === secondLeg.destination && 
            r.destination === destination &&
            isValidConnection(secondLeg.arrivalTime, r.departureTime)
          )
          thirdLegs.forEach(thirdLeg => {
            const price = calculateRoutePrice([firstLeg, secondLeg, thirdLeg], 'economy')
            routes.push({
              id: `2stop-${firstLeg.flightNumber}-${secondLeg.flightNumber}-${thirdLeg.flightNumber}`,
              origin,
              destination,
              stops: 2,
              segments: [firstLeg, secondLeg, thirdLeg],
              totalPrice: price * 0.85,
              totalDuration: firstLeg.duration + secondLeg.duration + thirdLeg.duration + 240,
              availableFareClasses: mergeFareClasses([
                getAvailableFareClassesForRoute(firstLeg.origin, firstLeg.destination),
                getAvailableFareClassesForRoute(secondLeg.origin, secondLeg.destination),
                getAvailableFareClassesForRoute(thirdLeg.origin, thirdLeg.destination)
              ])
            })
          })
        })
      })
    }
    
    // Sort by price and return top options
    return routes.sort((a, b) => a.totalPrice - b.totalPrice).slice(0, 10)
  }
  
  const calculateRoutePrice = (segments: any[], cabin: string): number => {
    const basePrice = segments.length * 250
    const cabinMultiplier = cabin === 'first' ? 4 : cabin === 'business' ? 2.5 : 1
    return Math.round(basePrice * cabinMultiplier)
  }
  
  const isValidConnection = (arrivalTime: string, departureTime: string): boolean => {
    // Parse arrival and departure times (simplified)
    const arrival = parseInt(arrivalTime.split(':')[0])
    const departure = parseInt(departureTime.split(':')[0])
    const minConnectionTime = 1 // hour
    const maxConnectionTime = 6 // hours
    
    const connectionTime = departure - arrival
    return connectionTime >= minConnectionTime && connectionTime <= maxConnectionTime
  }
  
  const getAvailableFareClassesForRoute = (origin: string, destination: string): string[] => {
    const route = `${origin}-${destination}`
    const inventory = routeInventory[route]
    if (!inventory) return ['Y', 'B', 'M']
    
    return Object.entries(inventory.fareClasses)
      .filter(([_, data]) => data.isOpen && data.sold < data.capacity)
      .map(([code]) => code)
  }
  
  const mergeFareClasses = (fareClassLists: string[][]): string[] => {
    const allClasses = fareClassLists.flat()
    return Array.from(new Set(allClasses)).sort()
  }

  const handleCreatePNR = async () => {
    // Validate form first
    if (!validatePNRForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Calculate fare based on segments and passengers
      const baseFarePerSegment = 250
      const totalBaseFare = baseFarePerSegment * segments.length * passengers.length
      const taxes = Math.round(totalBaseFare * 0.2) // 20% taxes
      const fees = Math.round(totalBaseFare * 0.1) // 10% fees
      const total = totalBaseFare + taxes + fees

      createPNR({
        passengers: passengers.map(p => ({
          ...p,
          id: p.id || `PAX-${Date.now()}-${Math.random().toString(36).substring(7)}`
        })),
        segments: segments.map(s => ({
          ...s,
          id: s.id || `SEG-${Date.now()}-${Math.random().toString(36).substring(7)}`
        })),
        contactInfo: newPNR.contactInfo,
        remarks: newPNR.remarks.filter(r => r.trim()),
        fareQuote: {
          baseFare: totalBaseFare,
          taxes,
          fees,
          total,
          currency: 'USD',
          fareRules: segments.length > 1
            ? ['Multi-city booking', 'Same fare class required for all segments']
            : ['Non-refundable', 'No changes allowed']
        },
        paymentInfo: {
          paymentMethod: 'credit_card',
          amount: total,
          currency: 'USD'
        },
        seats: Array.from(selectedSeats)
      })
      setSeatsOccupied(prev => {
        const newOccupied = new Set(prev)
        selectedSeats.forEach(seat => newOccupied.add(seat))
        return newOccupied
      })
      setSelectedSeats(new Set())
      setShowCreateDialog(false)
      resetPNRForm()
      toast({
        title: 'PNR Created',
        description: `Successfully created PNR for ${passengers.length} passenger(s)`
      })
    } catch (error) {
      console.error('Error creating PNR:', error)
      toast({
        title: 'Error',
        description: 'Failed to create PNR. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
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

  // PNR Split Handler
  const handleSplitPNR = () => {
    if (!selectedPNR || splitPassengerGroups.length === 0) return

    // In-memory split logic
    const newPNRs: PNR[] = []
    const originalPNR = selectedPNR

    splitPassengerGroups.forEach((group, index) => {
      const groupPassengers = group.map(idx => originalPNR.passengers[idx])
      const newPNRNumber = `SPL${Math.random().toString(36).substring(2, 8).toUpperCase()}`

      const newPNR: PNR = {
        ...originalPNR,
        pnrNumber: newPNRNumber,
        passengers: groupPassengers,
        createdAt: new Date().toISOString(),
        remarks: [
          ...originalPNR.remarks,
          `Split from ${originalPNR.pnrNumber} - Group ${index + 1}`
        ]
      }

      newPNRs.push(newPNR)
    })

    // Update original PNR to remove split passengers
    const splitPassengerIndices = splitPassengerGroups.flat()
    const remainingPassengers = originalPNR.passengers.filter((_, idx) => !splitPassengerIndices.includes(idx))

    if (remainingPassengers.length === 0) {
      deletePNR(originalPNR.pnrNumber)
    } else {
      updatePNR(originalPNR.pnrNumber, {
        passengers: remainingPassengers,
        remarks: [
          ...originalPNR.remarks,
          `Split - Passengers moved to ${newPNRs.map(p => p.pnrNumber).join(', ')}`
        ]
      })
    }

    // Create new PNRs
    newPNRs.forEach(pnr => {
      createPNR(pnr)
    })

    setShowSplitDialog(false)
    setSelectedPNR(null)
    setSplitPassengerGroups([])
  }

  // PNR Merge Handler
  const handleMergePNRs = () => {
    if (selectedPNRsForMerge.length < 2) return

    const pnersToMerge = pnrs.filter(p => selectedPNRsForMerge.includes(p.pnrNumber))
    if (pnersToMerge.length < 2) return

    // Create merged PNR
    const mergedPNRNumber = `MRG${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const allPassengers = pnersToMerge.flatMap(p => p.passengers)
    const allSegments = pnersToMerge.flatMap(p => p.segments)
    const totalFare = pnersToMerge.reduce((sum, p) => sum + p.fareQuote.total, 0)
    const totalBaseFare = pnersToMerge.reduce((sum, p) => sum + p.fareQuote.baseFare, 0)
    const totalTaxes = pnersToMerge.reduce((sum, p) => sum + p.fareQuote.taxes, 0)
    const totalFees = pnersToMerge.reduce((sum, p) => sum + p.fareQuote.fees, 0)

    const mergedPNR: PNR = {
      pnrNumber: mergedPNRNumber,
      passengers: allPassengers,
      segments: allSegments,
      contactInfo: pnersToMerge[0].contactInfo,
      remarks: [
        `Merged from: ${selectedPNRsForMerge.join(', ')}`,
        ...pnersToMerge.flatMap(p => p.remarks)
      ],
      fareQuote: {
        baseFare: totalBaseFare,
        taxes: totalTaxes,
        fees: totalFees,
        total: totalFare,
        currency: 'USD',
        fareRules: ['Merged booking', ...pnersToMerge.flatMap(p => p.fareQuote.fareRules)]
      },
      status: 'confirmed',
      agencyCode: pnersToMerge[0].agencyCode,
      createdAt: new Date().toISOString()
    }

    // Delete original PNRs and create merged one
    selectedPNRsForMerge.forEach(pnrNumber => deletePNR(pnrNumber))
    createPNR(mergedPNR)

    setShowMergeDialog(false)
    setSelectedPNRsForMerge([])
  }

  // Fare Re-quote Handler
  const handleRequoteFare = () => {
    if (!selectedPNR) return

    const timeToDeparture = Math.random() * 30 // Simulated days to departure
    const demandFactor = 1 + (Math.random() * 0.3 - 0.15) // +/- 15%
    const baseFare = selectedPNR.fareQuote.baseFare
    const newBaseFare = Math.round(baseFare * demandFactor)
    const newTaxes = Math.round(selectedPNR.fareQuote.taxes * (1 + Math.random() * 0.1))
    const newFees = selectedPNR.fareQuote.fees
    const newTotal = newBaseFare + newTaxes + newFees

    const fareDifference = newTotal - selectedPNR.fareQuote.total

    setRequoteResult({
      originalFare: selectedPNR.fareQuote.total,
      newFare: newTotal,
      fareDifference,
      breakdown: {
        originalBaseFare: selectedPNR.fareQuote.baseFare,
        newBaseFare,
        originalTaxes: selectedPNR.fareQuote.taxes,
        newTaxes,
        fees: newFees
      },
      reason: fareDifference > 0 ? 'Price increased due to demand' : 'Price decreased due to availability',
      timeToDeparture,
      demandFactor: (demandFactor - 1) * 100
    })
  }

  // Queue Assignment Handler
  const handleAssignQueue = () => {
    if (!selectedPNR) return

    updatePNR(selectedPNR.pnrNumber, {
      queuePosition: queuePriority,
      remarks: [
        ...selectedPNR.remarks,
        `Assigned queue position: ${queuePriority}`
      ]
    })

    setShowQueueDialog(false)
  }

  // Waitlist Processing Handler
  const handleProcessWaitlist = () => {
    const waitlistedPNRs = pnrs.filter(p => p.status === 'waitlist')
    const flightDate = waitlistFlight.date || new Date().toISOString().split('T')[0]

    // Simulate promoting some waitlisted PNRs
    const promotedCount = Math.min(waitlistedPNRs.length, Math.floor(Math.random() * 3) + 1)
    const promotedPNRs = waitlistedPNRs.slice(0, promotedCount)

    promotedPNRs.forEach(pnr => {
      updatePNR(pnr.pnrNumber, {
        status: 'confirmed',
        remarks: [
          ...pnr.remarks,
          `Promoted from waitlist on ${new Date().toLocaleString()}`
        ]
      })
    })

    setShowWaitlistDialog(false)
    setWaitlistFlight({ flightNumber: '', date: '' })
  }

  // O&D Booking Handler
  const handleBookRoute = (route: ODRoute) => {
    setSelectedODRoute(route)
    setBookingForm({
      origin: route.segments[0].origin,
      destination: route.segments[route.segments.length - 1].destination,
      date: odDate || new Date().toISOString().split('T')[0],
      passengers: 1,
      cabinClass: 'economy',
      fareClass: route.availableFareClasses[0] || 'Y'
    })
    setShowBookingDialog(true)
  }

  const handleCreateBooking = async () => {
    if (!selectedODRoute) return

    // Validate form first
    if (!validateBookingForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Create passengers based on booking form
      const passengers: Passenger[] = Array.from({ length: bookingForm.passengers }, (_, i) => ({
        id: `PAX-${Date.now()}-${i}`,
        title: i === 0 ? 'Mr' : 'Ms',
        firstName: `Passenger${i + 1}`,
        lastName: 'Test',
        dateOfBirth: '1990-01-01',
        passportNumber: `P${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        passportExpiry: '2028-12-31',
        nationality: 'US',
        ssr: []
      }))

      // Create PNR from selected O&D route
      const newPNR: PNR = {
        pnrNumber: `OD${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        createdBy: 'web',
        status: 'confirmed',
        passengers,
        segments: selectedODRoute.segments.map((seg, idx) => ({
          ...seg,
          id: `SEG-${Date.now()}-${idx}`,
          fareClass: bookingForm.fareClass,
          boardingClass: bookingForm.cabinClass as 'economy' | 'business' | 'first'
        })),
        fareQuote: {
          baseFare: Math.round(selectedODRoute.totalPrice / bookingForm.passengers * 0.8),
          taxes: Math.round(selectedODRoute.totalPrice / bookingForm.passengers * 0.15),
          fees: Math.round(selectedODRoute.totalPrice / bookingForm.passengers * 0.05),
          total: selectedODRoute.totalPrice,
          currency: 'USD',
          fareRules: ['O&D booking', `Route: ${selectedODRoute.origin}-${selectedODRoute.destination}`]
        },
        contactInfo: {
          email: `passenger${1}@example.com`,
          phone: '+1-555-0123456',
          address: '123 Main St, New York, NY'
        },
        paymentInfo: {
          paymentMethod: 'credit_card',
          amount: selectedODRoute.totalPrice * bookingForm.passengers,
          currency: 'USD'
        },
        seats: [],
        source: 'web',
        isGroup: bookingForm.passengers > 1
      }

      createPNR(newPNR)
      setShowBookingDialog(false)
      toast({
        title: 'Booking Created',
        description: `PNR ${newPNR.pnrNumber} created for ${newPNR.passengers.length} passenger(s)`
      })

      // Clear selection and reset form
      setSelectedODRoute(null)
      setBookingForm({
        origin: '',
        destination: '',
        date: '',
        passengers: 1,
        cabinClass: 'economy',
        fareClass: 'Y'
      })
      setOdRoutes([])
      setErrors({})
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============ TICKETING HANDLERS ============

  // Partial Exchange Handler
  const handlePartialExchange = () => {
    if (!selectedTicket || selectedSegmentsForExchange.length === 0) return

    // Calculate exchange details
    const originalFare = selectedTicket.fare.total
    const selectedFare = exchangeNewFare || Math.round(originalFare * 1.2)
    const fareDifference = selectedFare - originalFare
    const changeFee = selectedTicket.changePenalty || 200
    const totalDue = fareDifference > 0 ? fareDifference + changeFee : changeFee

    // Create audit trail entry
    const auditEntry = {
      id: `AUD-${Date.now()}`,
      ticketNumber: selectedTicket.ticketNumber,
      action: 'partial_exchange',
      timestamp: new Date().toISOString(),
      user: 'system',
      reason: 'Voluntary exchange of selected segments',
      before: {
        fare: originalFare,
        segments: selectedTicket.segments.map(s => `${s.origin}-${s.destination}`).join(', ')
      },
      after: {
        fare: selectedFare,
        exchangedSegments: selectedSegmentsForExchange.join(', ')
      },
      changeFee,
      fareDifference,
      totalDue
    }

    setTicketAuditTrail([...ticketAuditTrail, auditEntry])

    // Perform exchange in store
    exchangeTicket(selectedTicket.ticketNumber, {
      ...selectedTicket.fare,
      total: selectedFare
    })

    setShowPartialExchangeDialog(false)
    setSelectedSegmentsForExchange([])
    setExchangeNewFare(0)
  }

  // Involuntary Refund Handler
  const handleInvoluntaryRefund = () => {
    if (!selectedTicket || !involuntaryRefundReason || !involuntaryRefundApprover) return

    // Calculate refund amount (full fare + taxes for involuntary refunds)
    const refundableAmount = selectedTicket.fare.total

    // Create audit trail entry
    const auditEntry = {
      id: `AUD-${Date.now()}`,
      ticketNumber: selectedTicket.ticketNumber,
      action: 'involuntary_refund',
      timestamp: new Date().toISOString(),
      user: 'system',
      reason: involuntaryRefundReason,
      approver: involuntaryRefundApprover,
      before: {
        status: selectedTicket.status,
        fare: selectedTicket.fare.total
      },
      after: {
        status: 'refunded',
        refundAmount: refundableAmount
      },
      refundBreakdown: {
        baseFare: selectedTicket.fare.baseFare,
        taxes: selectedTicket.fare.taxes,
        fees: selectedTicket.fare.fees,
        total: refundableAmount
      }
    }

    setTicketAuditTrail([...ticketAuditTrail, auditEntry])

    // Process refund
    refundTicket(selectedTicket.ticketNumber, `Involuntary: ${involuntaryRefundReason}`)

    setShowInvoluntaryRefundDialog(false)
    setInvoluntaryRefundReason('')
    setInvoluntaryRefundApprover('')
    setSelectedTicket(null)
  }

  // Tax Calculator Handler
  const handleCalculateTaxes = () => {
    const { fare, passengerType, routeType } = taxCalculatorParams
    const passengerMultiplier = passengerType === 'adult' ? 1 : passengerType === 'child' ? 0.75 : 0.1

    const applicableTaxes = taxRates.filter(tax =>
      tax.appliesTo === routeType || tax.appliesTo === 'both'
    )

    const calculated: TaxBreakdown[] = applicableTaxes.map(tax => {
      let amount = 0
      if (tax.rate > 1) {
        // Fixed amount
        amount = tax.rate * passengerMultiplier
      } else {
        // Percentage
        amount = fare * tax.rate * passengerMultiplier
      }

      return {
        code: tax.code,
        name: tax.name,
        amount: Math.round(amount * 100) / 100,
        currency: 'USD'
      }
    })

    setCalculatedTaxes(calculated)
  }

  // Refund Fee Calculator Handler
  const handleCalculateRefundFee = () => {
    const { timeToDeparture, fareClass, refundReason, fareType } = refundFeeParams

    let baseFee = 0

    // Time-based penalty
    if (refundReason === 'voluntary') {
      if (timeToDeparture < 24) {
        baseFee = fareClass === 'economy' ? 200 : fareClass === 'business' ? 400 : 600
      } else if (timeToDeparture < 72) {
        baseFee = fareClass === 'economy' ? 150 : fareClass === 'business' ? 300 : 500
      } else {
        baseFee = fareClass === 'economy' ? 100 : fareClass === 'business' ? 200 : 350
      }
    } else {
      // Involuntary refunds have no fee
      baseFee = 0
    }

    // Fare type modifier
    const fareTypeModifier = fareType === 'promotional' ? 1.5 : 1

    const finalFee = Math.round(baseFee * fareTypeModifier)
    setCalculatedRefundFee(finalFee)
  }

  // BSP Report Generator Handler
  const handleGenerateBSPReport = () => {
    // Generate in-memory BSP report
    const now = new Date()
    let startDate: Date

    switch (bspReportPeriod) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    const reportTickets = tickets.filter(t => {
      const issuedDate = new Date(t.issuedAt)
      return issuedDate >= startDate && issuedDate <= now
    })

    const report = {
      period: bspReportPeriod,
      type: bspReportType,
      generatedAt: now.toISOString(),
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      summary: {
        totalTickets: reportTickets.length,
        totalFare: reportTickets.reduce((sum, t) => sum + t.fare.baseFare, 0),
        totalTaxes: reportTickets.reduce((sum, t) => sum + t.fare.taxes, 0),
        totalFees: reportTickets.reduce((sum, t) => sum + t.fare.fees, 0),
        totalAmount: reportTickets.reduce((sum, t) => sum + t.fare.total, 0),
        totalCommission: reportTickets.reduce((sum, t) => sum + t.commission.amount, 0)
      },
      byType: {
        issued: reportTickets.filter(t => t.status === 'open').length,
        voided: reportTickets.filter(t => t.status === 'void').length,
        refunded: reportTickets.filter(t => t.status === 'refunded').length,
        exchanged: reportTickets.filter(t => t.status === 'exchanged').length
      },
      transactions: reportTickets.map(t => ({
        ticketNumber: t.ticketNumber,
        pnrNumber: t.pnrNumber,
        passengerName: t.passengerName,
        fare: t.fare.total,
        commission: t.commission.amount,
        status: t.status,
        issuedAt: t.issuedAt
      }))
    }

    // In a real application, this would trigger a file download
    // Generate CSV download
    const headers = ['Period', 'Total Tickets', 'Total Amount', 'Issued', 'Voided', 'Refunded']
    const rows = [[bspReportPeriod, report.summary.totalTickets, report.summary.totalAmount, report.summary.issued, report.summary.voided, report.summary.refunded]]
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bsp-report-${bspReportType}-${bspReportPeriod}.csv`
    link.click()
    
    toast({ title: 'BSP Report Generated', description: `Report for ${bspReportPeriod} downloaded` })
    setShowBSPReportingDialog(false)
  }

  // View Ticket Details Handler
  const handleViewTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDetailDialog(true)
  }

  // View Audit Trail Handler
  const handleViewAuditTrail = (ticketNumber: string) => {
    const trail = ticketAuditTrail.filter(a => a.ticketNumber === ticketNumber)
    setSelectedTicket(tickets.find(t => t.ticketNumber === ticketNumber) || null)
    setShowAuditTrailDialog(true)
  }

  // Add Segment Handler
  const handleAddSegment = () => {
    const newSegmentData: FlightSegment = {
      id: `SEG-${Date.now()}`,
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
    }
    setSegments([...segments, newSegmentData])
  }

  // Remove Segment Handler
  const handleRemoveSegment = (index: number) => {
    if (segments.length > 1) {
      setSegments(segments.filter((_, i) => i !== index))
    }
  }

  // Update Segment Handler
  const handleUpdateSegment = (index: number, field: string, value: any) => {
    const updatedSegments = [...segments]
    updatedSegments[index] = { ...updatedSegments[index], [field]: value }
    setSegments(updatedSegments)
  }

  // Add Passenger Handler
  const handleAddPassenger = () => {
    const newPassengerData: Passenger = {
      id: `PAX-${Date.now()}`,
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      passportExpiry: '',
      nationality: '',
      ssr: []
    }
    setPassengers([...passengers, newPassengerData])
  }

  // Remove Passenger Handler
  const handleRemovePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index))
    }
  }

  // Update Passenger Handler
  const handleUpdatePassenger = (index: number, field: string, value: any) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value }
    setPassengers(updatedPassengers)
  }

  // ==================== NEW HANDLERS FOR MISSING FUNCTIONALITY ====================

  // Corporate Booking Handler
  const handleSelectCorporateAccount = (accountId: string) => {
    setSelectedCorporateAccount(accountId)
    // Apply corporate fare rules
    if (accountId) {
      setGroupBookingDiscount(10) // 10% corporate discount
      toast({ title: 'Corporate Account', description: `Corporate account ${accountId} selected. 10% discount applied.` })
    } else {
      setGroupBookingDiscount(0)
    }
  }

  // Group Booking Handler
  const handleToggleGroupBooking = () => {
    setIsGroupBooking(!isGroupBooking)
    if (!isGroupBooking) {
      // Enable group booking mode
      setGroupBookingDiscount(passengers.length >= 10 ? 15 : 0)
    } else {
      setGroupBookingDiscount(0)
      setGroupName('')
    }
  }

  const handleValidateFareRules = () => {
    const violations: string[] = []
    
    // Validate advance purchase requirement
    const fareClass = fareClasses.find(fc => fc.code === segments[0]?.fareClass)
    if (fareClass?.restrictions?.advancePurchase && fareClass.restrictions.advancePurchase > 0) {
      const departureDate = new Date(segments[0]?.departureDate || '')
      const today = new Date()
      const daysBeforeDeparture = Math.floor((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      if (daysBeforeDeparture < fareClass.restrictions.advancePurchase) {
        violations.push(`Fare requires ${fareClass.restrictions.advancePurchase} days advance purchase`)
      }
    }

    // Validate min/max stay
    if (fareClass?.restrictions?.minStay && fareClass.restrictions.minStay > 0) {
      if (segments.length < 2) {
        violations.push(`Fare requires minimum stay of ${fareClass.restrictions.minStay} days`)
      }
    }

    // Validate same fare class for multi-segment
    if (segments.length > 1) {
      const firstClass = segments[0].fareClass
      const differentClass = segments.find(s => s.fareClass !== firstClass)
      if (differentClass) {
        violations.push('All segments must have same fare class for married segment booking')
      }
    }

    setFareRuleViolations(violations)
    setShowFareRulesDialog(true)
  }

  // SSR Management Handler
  const handleOpenSSRDialog = (passengerIndex: number) => {
    setSelectedPassengerSSR(passengerIndex)
    setShowSSRDialog(true)
  }

  const handleAddSSR = (ssrCode: string, ssrName: string, price: number) => {
    if (selectedPassengerSSR !== null) {
      const updatedPassengers = [...passengers]
      const currentSSR = updatedPassengers[selectedPassengerSSR].ssr || []
      if (!currentSSR.find(s => s.code === ssrCode)) {
        updatedPassengers[selectedPassengerSSR] = {
          ...updatedPassengers[selectedPassengerSSR],
          ssr: [...currentSSR, { code: ssrCode, name: ssrName, price, status: 'requested' }]
        }
        setPassengers(updatedPassengers)
        toast({ title: 'SSR Added', description: `SSR ${ssrName} added for passenger` })
      } else {
        toast({ title: 'SSR Exists', description: 'SSR already exists for this passenger', variant: 'destructive' })
      }
    }
  }

  const handleRemoveSSR = (ssrCode: string) => {
    if (selectedPassengerSSR !== null) {
      const updatedPassengers = [...passengers]
      updatedPassengers[selectedPassengerSSR] = {
        ...updatedPassengers[selectedPassengerSSR],
        ssr: updatedPassengers[selectedPassengerSSR].ssr?.filter(s => s.code !== ssrCode) || []
      }
      setPassengers(updatedPassengers)
    }
  }

  // Time Limit Management Handler
  const handleExtendTimeLimit = () => {
    if (selectedPNR && newTimeLimit) {
      updatePNR(selectedPNR.pnrNumber, {
        timeLimit: newTimeLimit,
        remarks: [
          ...selectedPNR.remarks,
          `Time limit extended to ${newTimeLimit}`
        ]
      })
      setShowTimeLimitDialog(false)
      setNewTimeLimit('')
      toast({ title: 'Time Limit Extended', description: `Time limit extended to ${newTimeLimit}` })
    }
  }

  // Married Segment Handler
  const handleValidateMarriedSegments = () => {
    if (segments.length < 2) {
      toast({ title: 'Validation Error', description: 'Married segments require at least 2 segments', variant: 'destructive' })
      return
    }

    // Validate segment connectivity
    for (let i = 0; i < segments.length - 1; i++) {
      if (segments[i].destination !== segments[i + 1].origin) {
        toast({ title: 'Validation Error', description: `Segment ${i + 1} destination (${segments[i].destination}) must match segment ${i + 2} origin (${segments[i + 1].origin})`, variant: 'destructive' })
        return
      }
    }

    // Validate fare class consistency
    const firstFareClass = segments[0].fareClass
    const hasDifferentClass = segments.some(s => s.fareClass !== firstFareClass)
    if (hasDifferentClass) {
      toast({ title: 'Validation Error', description: 'All married segments must have same fare class', variant: 'destructive' })
      return
    }

    // Generate married segment key
    const key = segments.map(s => s.flightNumber).join('-')
    setMarriedSegmentKey(key)
    setShowMarriedSegmentsDialog(true)
  }

  // Booking Remarks Handler
  const handleAddRemark = () => {
    if (selectedPNR && newRemark.trim()) {
      const fullRemark = `${remarkCategory.toUpperCase()}: ${newRemark}`
      updatePNR(selectedPNR.pnrNumber, {
        remarks: [...selectedPNR.remarks, fullRemark]
      })
      setNewRemark('')
      setShowRemarksDialog(false)
      toast({ title: 'Remark Added', description: 'Remark added successfully' })
    }
  }

  // EMD Management Handler
  const handleIssueEMD = () => {
    if (selectedTicket) {
      const emdNumber = `EMD-${Date.now()}`
      issueEMD({
        emdNumber,
        pnrNumber: selectedTicket.pnrNumber,
        passengerId: selectedTicket.passengerId,
        passengerName: selectedTicket.passengerName,
        type: 'ancillary',
        amount: 50, // Example EMD amount
        currency: 'USD',
        reason: 'Baggage fee',
        status: 'open',
        createdAt: new Date().toISOString()
      })
      toast({ title: 'EMD Issued', description: `EMD ${emdNumber} issued for ${selectedTicket.passengerName}` })
    }
  }

  // Ticket Reprint Handler
  const handleReprintTicket = () => {
    if (selectedTicket) {
      const printContent = `
        <html><head><title>Ticket ${selectedTicket.ticketNumber}</title>
        <style>body { font-family: Arial; padding: 20px; }</style></head><body>
          <h1>Electronic Ticket</h1>
          <p><strong>Ticket Number:</strong> ${selectedTicket.ticketNumber}</p>
          <p><strong>Passenger:</strong> ${selectedTicket.passengerName}</p>
          <p><strong>PNR:</strong> ${selectedTicket.pnrNumber}</p>
          <p><strong>Route:</strong> ${selectedTicket.route}</p>
        </body></html>
      `
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(printContent)
        win.document.close()
        win.print()
      }
      toast({ title: 'Ticket Reprinted', description: `Reprinting ticket ${selectedTicket.ticketNumber}` })
    }
  }

  // Email Ticket Handler
  const handleEmailTicket = () => {
    if (selectedTicket && selectedPNR) {
      const email = selectedPNR.contactInfo.email
      if (email) {
        toast({ title: 'Ticket Sent', description: `Ticket ${selectedTicket.ticketNumber} sent to ${email}` })
      } else {
        toast({ title: 'Error', description: 'No email address in PNR contact information', variant: 'destructive' })
      }
    }
  }

  // SMS Ticket Handler
  const handleSMSTicket = () => {
    if (selectedTicket && selectedPNR) {
      const phone = selectedPNR.contactInfo.phone
      if (phone) {
        toast({ title: 'Mobile Ticket Sent', description: `Ticket sent to ${phone}` })
      } else {
        toast({ title: 'Error', description: 'No phone number in PNR contact information', variant: 'destructive' })
      }
    }
  }

  // Check PNR Time Limits
  const handleCheckTimeLimits = () => {
    const now = new Date()
    let expiredCount = 0
    pnrs.forEach(pnr => {
      if (pnr.timeLimit) {
        const limitTime = new Date(pnr.timeLimit)
        if (limitTime < now && pnr.status !== 'ticketed' && pnr.status !== 'cancelled') {
          expiredCount++
          // Auto-cancel would go here
          updatePNR(pnr.pnrNumber, { status: 'cancelled', remarks: [...pnr.remarks, 'Auto-cancelled: Time limit expired'] })
        }
      }
    })
    toast({ title: 'Time Limits Checked', description: `${expiredCount} PNR(s) auto-cancelled due to expired time limits` })
  }

  // Fare Class Management Handlers
  const handleSaveFareClass = async () => {
    // Validate form first
    if (!validateFareClassForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      const existing = fareClasses.find(fc => fc.code === newFareClass.code)
      if (existing) {
        toast({
          title: 'Validation Error',
          description: 'Fare class code already exists',
          variant: 'destructive'
        })
        return
      }

      setFareClasses([...fareClasses, {
        ...newFareClass,
        sold: 0,
        available: newFareClass.capacity,
        isOpen: true,
        parentCode: null
      }])
      setShowFareClassDialog(false)
      resetFareClassForm()
      toast({
        title: 'Fare Class Created',
        description: `Fare class ${newFareClass.code} created successfully`
      })
    } catch (error) {
      console.error('Error saving fare class:', error)
      toast({
        title: 'Error',
        description: 'Failed to save fare class. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditFareClass = (code: string) => {
    const fareClass = fareClasses.find(fc => fc.code === code)
    if (fareClass) {
      setEditingFareClass(fareClass)
      setShowFareClassDialog(true)
    }
  }

  const handleUpdateFareClass = (originalCode: string) => {
    if (!editingFareClass) return
    
    setFareClasses(fareClasses.map(fc => 
      fc.code === originalCode ? editingFareClass : fc
    ))
    setShowFareClassDialog(false)
    setEditingFareClass(null)
    toast({ title: 'Fare Class Updated', description: `Fare class ${originalCode} updated` })
    setNewFareClass({
      code: '',
      name: '',
      hierarchy: 1,
      capacity: 50,
      price: 0,
      restrictions: { advancePurchase: 0, minStay: 0, maxStay: 365 }
    })
  }

  const handleViewFareClassDetails = (code: string) => {
    const fareClass = fareClasses.find(fc => fc.code === code)
    if (fareClass) {
      toast({ 
        title: `Fare Class: ${code}`, 
        description: `Name: ${fareClass.name}, Hierarchy: ${fareClass.hierarchy}, Capacity: ${fareClass.capacity}, Price: $${fareClass.price}` 
      })
    }
  }

  // Block Inventory Handlers
  const handleBlockInventory = () => {
    if (!newBlockInventory.agentId || !newBlockInventory.route || !newBlockInventory.date || newBlockInventory.seats === 0) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' })
      return
    }

    const agent = blockedInventory.find(b => b.agentId === newBlockInventory.agentId && b.route === newBlockInventory.route && b.date === newBlockInventory.date)
    if (agent) {
      toast({ title: 'Validation Error', description: 'Inventory already blocked for this agent on this route and date', variant: 'destructive' })
      return
    }

    const expiresAt = new Date(newBlockInventory.date + 'T23:59:59').getTime() + newBlockInventory.duration * 60 * 1000

    setBlockedInventory([...blockedInventory, {
      id: `BLK-${Date.now()}`,
      agentId: newBlockInventory.agentId,
      agentName: newBlockInventory.agentId,
      seats: newBlockInventory.seats,
      route: newBlockInventory.route,
      date: newBlockInventory.date,
      expiresAt: new Date(expiresAt).toISOString(),
      fareClass: newBlockInventory.fareClass,
      status: 'active'
    }])
    setShowBlockInventoryDialog(false)
    setNewBlockInventory({
      agentId: '',
      route: '',
      date: '',
      seats: 0,
      fareClass: '',
      duration: 30
    })
    addInventoryBlock({
      agentId: newBlockInventory.agentId,
      route: newBlockInventory.route,
      date: newBlockInventory.date,
      cabin: 'economy',
      seats: newBlockInventory.seats
    })
    toast({ title: 'Inventory Blocked', description: `${newBlockInventory.seats} seats blocked for ${newBlockInventory.agentId}` })
  }

  const handleUnblockInventory = (id: string) => {
    setBlockedInventory(blockedInventory.filter(b => b.id !== id))
    removeInventoryBlock(id)
    toast({ title: 'Inventory Released', description: 'Inventory block released' })
  }

  // Group Allotment Handlers
  const handleCreateAllotment = () => {
    if (!newGroupAllotment.groupName || !newGroupAllotment.route || !newGroupAllotment.date || newGroupAllotment.seats === 0) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' })
      return
    }

    addGroupAllotment({
      groupName: newGroupAllotment.groupName,
      corporateId: '',
      route: newGroupAllotment.route,
      departureDate: newGroupAllotment.date,
      returnDate: newGroupAllotment.deadline || newGroupAllotment.date,
      cabin: 'economy',
      totalSeats: newGroupAllotment.seats,
      fareClass: newGroupAllotment.fareClass || 'Y'
    })
    setShowGroupAllotmentDialog(false)
    setNewGroupAllotment({
      groupName: '',
      route: '',
      date: '',
      seats: 0,
      deadline: ''
    })
    toast({ title: 'Group Allotment Created', description: `Group allotment created for ${newGroupAllotment.groupName}` })
  }

  // Blackout Date Handlers
  const handleAddBlackout = () => {
    if (!newBlackoutDate.route || !newBlackoutDate.startDate || !newBlackoutDate.endDate) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' })
      return
    }

    addBlackoutDate({
      route: newBlackoutDate.route,
      startDate: newBlackoutDate.startDate,
      endDate: newBlackoutDate.endDate,
      cabin: newBlackoutDate.cabin,
      reason: newBlackoutDate.reason
    })
    setShowBlackoutDialog(false)
    setNewBlackoutDate({
      route: '',
      startDate: '',
      endDate: '',
      cabin: undefined,
      fareClass: '',
      reason: ''
    })
    toast({ title: 'Blackout Date Added', description: 'Blackout date added' })
  }

  const handleDeleteBlackout = (id: string) => {
    removeBlackoutDate(id)
    toast({ title: 'Blackout Date Removed', description: 'Blackout date removed' })
  }

  // Fare Family Handlers
  const handleSaveFareFamily = async () => {
    // Validate form first
    if (!validateFareFamilyForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)
    try {
      addFareFamily({
        name: newFareFamily.name,
        cabin: newFareFamily.cabin,
        fareClasses: newFareFamily.fareClasses,
        features: newFareFamily.features.split(',').map(f => f.trim())
      })
      setShowFareFamilyDialog(false)
      resetFareFamilyForm()
      toast({
        title: 'Fare Family Created',
        description: `Fare family "${newFareFamily.name}" created successfully`
      })
    } catch (error) {
      console.error('Error saving fare family:', error)
      toast({
        title: 'Error',
        description: 'Failed to save fare family. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditFareFamily = (id: string) => {
    const family = fareFamilies.find(f => f.id === id)
    if (family) {
      setNewFareFamily({
        name: family.name,
        cabin: family.cabin,
        fareClasses: family.fareClasses,
        features: family.features.join(', '),
        baseMarkup: 0,
        demandMultiplier: 1
      })
      setEditingFareFamily(family)
      setShowFareFamilyDialog(true)
    }
  }

  const handleViewFareFamily = (id: string) => {
    const family = fareFamilies.find(f => f.id === id)
    if (family) {
      toast({ 
        title: `Fare Family: ${family.name}`, 
        description: `Cabin: ${family.cabin}, Fare Classes: ${family.fareClasses.join(', ')}, Features: ${family.features.join(', ')}` 
      })
    }
  }

  const resetForms = () => {
    // Reset multi-passenger and multi-segment arrays
    setPassengers([{
      id: '',
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      passportExpiry: '',
      nationality: '',
      ssr: []
    }])
    setSegments([{
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
    }])
    
    // Reset single passenger/segment (legacy, kept for compatibility)
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

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case 'available': return 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300'
      case 'occupied': return 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
      case 'blocked': return 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed'
      case 'selected': return 'bg-blue-500 text-white border-blue-600'
      case 'premium': return 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-400'
      default: return 'bg-gray-100'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

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
        <div className="flex items-center flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCheckTimeLimits}>
            <Clock className="h-4 w-4 mr-2" />
            Check Time Limits
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowWaitlistDialog(true)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Process Waitlist
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowMergeDialog(true)}>
            <Merge className="h-4 w-4 mr-2" />
            Merge PNRs
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New PNR
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New PNR</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Flight Segments */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Flight Segments</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddSegment}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Segment
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {segments.map((segment, index) => (
                      <Card key={segment.id || index} className="p-4 bg-secondary/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Segment {index + 1}</span>
                          {segments.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveSegment(index)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Flight Number</Label>
                            <Input 
                              value={segment.flightNumber} 
                              onChange={(e) => handleUpdateSegment(index, 'flightNumber', e.target.value)} 
                              placeholder="AA123" 
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Origin</Label>
                            <Input 
                              value={segment.origin} 
                              onChange={(e) => handleUpdateSegment(index, 'origin', e.target.value)} 
                              placeholder="JFK" 
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Destination</Label>
                            <Input 
                              value={segment.destination} 
                              onChange={(e) => handleUpdateSegment(index, 'destination', e.target.value)} 
                              placeholder="LHR" 
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Departure Date</Label>
                            <Input 
                              type="date" 
                              value={segment.departureDate} 
                              onChange={(e) => handleUpdateSegment(index, 'departureDate', e.target.value)} 
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Departure Time</Label>
                            <Input 
                              type="time" 
                              value={segment.departureTime} 
                              onChange={(e) => handleUpdateSegment(index, 'departureTime', e.target.value)} 
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Fare Class</Label>
                            <Select value={segment.fareClass} onValueChange={(v) => handleUpdateSegment(index, 'fareClass', v)}>
                              <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Y">Y - Economy</SelectItem>
                                <SelectItem value="B">B - Economy Flex</SelectItem>
                                <SelectItem value="M">M - Semi-Flex</SelectItem>
                                <SelectItem value="Q">Q - Saver</SelectItem>
                                <SelectItem value="J">J - Business</SelectItem>
                                <SelectItem value="F">F - First</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Passengers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Passengers</h3>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddPassenger}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Passenger
                    </Button>
                  </div>
                  <div className="overflow-y-auto max-h-64">
                    <div className="space-y-3">
                      {passengers.map((passenger, index) => (
                        <Card key={passenger.id || index} className="p-4 bg-secondary/30">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Passenger {index + 1}</span>
                            {passengers.length > 1 && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemovePassenger(index)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Title</Label>
                              <Select value={passenger.title} onValueChange={(v) => handleUpdatePassenger(index, 'title', v)}>
                                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Mr">Mr</SelectItem>
                                  <SelectItem value="Mrs">Mrs</SelectItem>
                                  <SelectItem value="Ms">Ms</SelectItem>
                                  <SelectItem value="Dr">Dr</SelectItem>
                                  <SelectItem value="Inf">Infant</SelectItem>
                                  <SelectItem value="Chd">Child</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Date of Birth</Label>
                              <Input 
                                type="date" 
                                value={passenger.dateOfBirth} 
                                onChange={(e) => handleUpdatePassenger(index, 'dateOfBirth', e.target.value)} 
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">First Name</Label>
                              <Input 
                                value={passenger.firstName} 
                                onChange={(e) => handleUpdatePassenger(index, 'firstName', e.target.value)} 
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Last Name</Label>
                              <Input 
                                value={passenger.lastName} 
                                onChange={(e) => handleUpdatePassenger(index, 'lastName', e.target.value)} 
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Passport Number</Label>
                              <Input 
                                value={passenger.passportNumber} 
                                onChange={(e) => handleUpdatePassenger(index, 'passportNumber', e.target.value)} 
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Passport Expiry</Label>
                              <Input 
                                type="date" 
                                value={passenger.passportExpiry} 
                                onChange={(e) => handleUpdatePassenger(index, 'passportExpiry', e.target.value)} 
                                className="text-sm"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label className="text-xs">Nationality</Label>
                              <Input 
                                value={passenger.nationality} 
                                onChange={(e) => handleUpdatePassenger(index, 'nationality', e.target.value)} 
                                placeholder="e.g., US, UK, CA" 
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input 
                        value={newPNR.contactInfo.email} 
                        onChange={(e) => setNewPNR({...newPNR, contactInfo: {...newPNR.contactInfo, email: e.target.value}})} 
                        className={errors.contactInfo ? 'border-red-500' : ''}
                      />
                      {errors.contactInfo && (
                        <p className="text-xs text-red-500 mt-1">{errors.contactInfo}</p>
                      )}
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input 
                        value={newPNR.contactInfo.phone} 
                        onChange={(e) => setNewPNR({...newPNR, contactInfo: {...newPNR.contactInfo, phone: e.target.value}})} 
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Textarea value={newPNR.contactInfo.address} onChange={(e) => setNewPNR({...newPNR, contactInfo: {...newPNR.contactInfo, address: e.target.value}})} />
                    </div>
                  </div>
                </div>

                {/* Booking Type & Remarks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Booking Type</Label>
                    <div className="flex gap-2 mt-1">
                      <Select defaultValue="standard">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="group">Group Booking</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => setShowCorporateDialog(true)} title="Corporate Profiles">
                        <Building className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setShowGroupDialog(true)} title="Group Settings">
                        <Users2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedCorporateAccount && (
                      <p className="text-xs text-muted-foreground mt-1">Corporate: {selectedCorporateAccount}</p>
                    )}
                    {isGroupBooking && (
                      <p className="text-xs text-muted-foreground mt-1">Group: {groupName || 'Unnamed'} ({passengers.length} pax)</p>
                    )}
                  </div>
                  <div>
                    <Label>Remarks</Label>
                    <Textarea 
                      placeholder="Add booking remarks..." 
                      value={newPNR.remarks[0]} 
                      onChange={(e) => setNewPNR({...newPNR, remarks: [e.target.value]})} 
                    />
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleValidateFareRules}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Validate Fare Rules
                  </Button>
                  {segments.length > 1 && (
                    <Button variant="outline" size="sm" onClick={handleValidateMarriedSegments}>
                      <Layers className="h-4 w-4 mr-2" />
                      Validate Married Segments
                    </Button>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                <Button onClick={handleCreatePNR} disabled={isSubmitting}>
                  {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  {isSubmitting ? 'Creating...' : 'Create PNR'}
                </Button>
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
                <div>
                  <CardTitle>PNR Management</CardTitle>
                  <CardDescription>
                    Create, modify, split, merge, and manage passenger name records
                  </CardDescription>
                </div>
                <div className="flex items-center flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowMergeDialog(true)}>
                    <Merge className="h-4 w-4 mr-2" />
                    Merge PNRs
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowWaitlistDialog(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Process Waitlist
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search PNR, passenger..." 
                      className="pl-8 w-48"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[900px]">
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
                              <div key={i} className="text-sm flex items-center flex-wrap gap-1">
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
                            <div className="flex items-center flex-wrap gap-1 flex-wrap">
                              <Button variant="ghost" size="sm" onClick={() => setSelectedPNR(pnr)} title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {pnr.passengers.length > 1 && (
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedPNR(pnr); setShowSplitDialog(true); }} title="Split PNR">
                                  <Split className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedPNR(pnr); setShowRequoteDialog(true); }} title="Re-quote Fare">
                                <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedPNR(pnr); setShowQueueDialog(true); }} title="Assign Queue">
                                <Clock className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedPNR(pnr); setShowTimeLimitDialog(true); }} title="Extend Time Limit">
                                <CalendarDays className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedPNR(pnr); setShowRemarksDialog(true); }} title="Add Remark">
                                <FileEdit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedPNR(pnr); setShowFareRulesDialog(true); handleValidateFareRules(); }} title="Validate Fare Rules">
                                <FileCheck className="h-4 w-4" />
                              </Button>
                              {pnr.segments.length > 1 && (
                                <Button variant="ghost" size="sm" onClick={() => { setSelectedPNR(pnr); setShowMarriedSegmentsDialog(true); handleValidateMarriedSegments(); }} title="Validate Married Segments">
                                  <Layers className="h-4 w-4" />
                                </Button>
                              )}
                              {pnr.status !== 'ticketed' && (
                                <Button variant="ghost" size="sm" onClick={() => handleIssueTicket(pnr)} title="Issue Ticket">
                                  <TicketIcon className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => deletePNR(pnr.pnrNumber)} title="Delete PNR">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{p.title} {p.firstName} {p.lastName}</div>
                            <div className="text-sm text-muted-foreground">
                              DOB: {p.dateOfBirth} | Passport: {p.passportNumber} | {p.nationality}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => { 
                            setSelectedPNR(selectedPNR);
                            // Temporarily set passenger data for SSR
                            setPassengers(selectedPNR.passengers);
                            handleOpenSSRDialog(i);
                          }}>
                            <Users className="h-4 w-4 mr-1" />
                            SSR
                          </Button>
                        </div>
                        {p.ssr && p.ssr.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {p.ssr.map((ssr, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {ssr.code}: {ssr.name}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-3 bg-secondary/30 rounded-sm">
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
          {/* Ticketing Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={showTaxCalculatorDialog} onOpenChange={setShowTaxCalculatorDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Calculator className="h-4 w-4 mr-2" />
                  Tax Calculator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Tax Breakdown Calculator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Origin Airport</Label>
                      <Input 
                        placeholder="e.g., JFK" 
                        value={taxCalculatorParams.origin}
                        onChange={(e) => setTaxCalculatorParams({...taxCalculatorParams, origin: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Destination Airport</Label>
                      <Input 
                        placeholder="e.g., LHR" 
                        value={taxCalculatorParams.destination}
                        onChange={(e) => setTaxCalculatorParams({...taxCalculatorParams, destination: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Base Fare ($)</Label>
                    <Input 
                      type="number" 
                      value={taxCalculatorParams.fare || ''}
                      onChange={(e) => setTaxCalculatorParams({...taxCalculatorParams, fare: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Route Type</Label>
                      <Select 
                        value={taxCalculatorParams.routeType} 
                        onValueChange={(v: 'domestic' | 'international') => setTaxCalculatorParams({...taxCalculatorParams, routeType: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="domestic">Domestic</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Passenger Type</Label>
                      <Select 
                        value={taxCalculatorParams.passengerType} 
                        onValueChange={(v: 'adult' | 'child' | 'infant') => setTaxCalculatorParams({...taxCalculatorParams, passengerType: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adult">Adult (100%)</SelectItem>
                          <SelectItem value="child">Child (75%)</SelectItem>
                          <SelectItem value="infant">Infant (10%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCalculateTaxes} className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Taxes
                  </Button>
                  
                  {calculatedTaxes.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <Separator />
                      <h4 className="font-medium">Tax Breakdown</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {calculatedTaxes.map((tax, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                            <div className="flex items-center flex-wrap gap-2">
                              <Badge variant="outline" className="font-mono">{tax.code}</Badge>
                              <span className="text-sm">{tax.name}</span>
                            </div>
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="font-medium">${tax.amount.toFixed(2)}</span>
                              {taxRates.find(r => r.code === tax.code)?.refundable && (
                                <Badge variant="default" className="text-xs">Refundable</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between font-medium">
                        <span>Total Taxes</span>
                        <span>${calculatedTaxes.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTaxCalculatorDialog(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showRefundFeeCalculator} onOpenChange={setShowRefundFeeCalculator}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Refund Fee Calculator
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Refund Fee Calculator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Time Until Departure (hours)</Label>
                    <Input 
                      type="number" 
                      value={refundFeeParams.timeToDeparture || ''}
                      onChange={(e) => setRefundFeeParams({...refundFeeParams, timeToDeparture: parseFloat(e.target.value) || 0})}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Hours remaining before flight departure</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Fare Class</Label>
                      <Select 
                        value={refundFeeParams.fareClass} 
                        onValueChange={(v: 'first' | 'business' | 'economy') => setRefundFeeParams({...refundFeeParams, fareClass: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="first">First</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Refund Reason</Label>
                      <Select 
                        value={refundFeeParams.refundReason} 
                        onValueChange={(v: 'voluntary' | 'involuntary') => setRefundFeeParams({...refundFeeParams, refundReason: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="voluntary">Voluntary (Passenger-initiated)</SelectItem>
                          <SelectItem value="involuntary">Involuntary (Airline-initiated)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Fare Type</Label>
                    <Select 
                      value={refundFeeParams.fareType} 
                      onValueChange={(v: 'regular' | 'promotional') => setRefundFeeParams({...refundFeeParams, fareType: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular Fare</SelectItem>
                        <SelectItem value="promotional">Promotional Fare (50% higher fees)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCalculateRefundFee} className="w-full">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Refund Fee
                  </Button>

                  {calculatedRefundFee > 0 && (
                    <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Calculated Refund Fee</p>
                          <p className="text-xs text-muted-foreground">
                            {refundFeeParams.timeToDeparture < 24 && '< 24 hours before departure'}
                            {refundFeeParams.timeToDeparture >= 24 && refundFeeParams.timeToDeparture < 72 && '24-72 hours before departure'}
                            {refundFeeParams.timeToDeparture >= 72 && '> 72 hours before departure'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${calculatedRefundFee}</p>
                          {refundFeeParams.refundReason === 'involuntary' && (
                            <Badge variant="default" className="text-xs mt-1">No Fee - Involuntary</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRefundFeeCalculator(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showBSPReportingDialog} onOpenChange={setShowBSPReportingDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  BSP/ARC Reporting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>BSP/ARC Reporting</DialogTitle>
                  <DialogDescription>Generate settlement, billing, and refund reports</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Report Period</Label>
                      <Select 
                        value={bspReportPeriod} 
                        onValueChange={(v: 'daily' | 'weekly' | 'monthly') => setBSPReportPeriod(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Report Type</Label>
                      <Select 
                        value={bspReportType} 
                        onValueChange={(v: 'settlement' | 'billing' | 'refunds') => setBSPReportType(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="settlement">Settlement Report</SelectItem>
                          <SelectItem value="billing">Billing Report</SelectItem>
                          <SelectItem value="refunds">Refund Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <Card className="p-4">
                      <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</div>
                      <div className="text-xs text-muted-foreground">Issued Tickets</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'void').length}</div>
                      <div className="text-xs text-muted-foreground">Voided</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'refunded').length}</div>
                      <div className="text-xs text-muted-foreground">Refunded</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold">${tickets.reduce((sum, t) => sum + t.fare.total, 0).toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">Total Value</div>
                    </Card>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleGenerateBSPReport} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" onClick={() => setShowBSPReportingDialog(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Ticket Management */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Ticket Management</CardTitle>
              <CardDescription>
                E-ticket issuance, reissue, refund, and exchange operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1000px]">
                  <thead>
                    <tr>
                      <th>Ticket Number</th>
                      <th>Passenger</th>
                      <th>PNR</th>
                      <th>Route</th>
                      <th>Fare</th>
                      <th>Commission</th>
                      <th>Issued</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted-foreground py-8">
                          No tickets issued yet. Issue tickets from the Reservations tab.
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
                          <td className="text-sm">
                            <div>${ticket.commission.amount}</div>
                            <div className="text-xs text-muted-foreground">({ticket.commission.rate}%)</div>
                          </td>
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
                            <div className="flex items-center flex-wrap gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewTicketDetails(ticket)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {ticket.status === 'open' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedTicket(ticket)
                                      setShowPartialExchangeDialog(true)
                                    }}
                                    title="Exchange"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedTicket(ticket)
                                      setShowInvoluntaryRefundDialog(true)
                                    }}
                                    title="Involuntary Refund"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => voidTicket(ticket.ticketNumber)} 
                                    title="Void"
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => refundTicket(ticket.ticketNumber, 'Voluntary refund')} 
                                    title="Refund"
                                  >
                                    <DollarSign className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewAuditTrail(ticket.ticketNumber)}
                                title="Audit Trail"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
                <div className="overflow-x-auto h-48">
                  <table className="enterprise-table min-w-[900px]">
                    <thead>
                      <tr>
                        <th>EMD Number</th>
                        <th>Passenger</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
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
                          <td>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => voidEMD(emd.emdNumber)}
                              title="Void EMD"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PARTIAL EXCHANGE DIALOG */}
          <Dialog open={showPartialExchangeDialog} onOpenChange={setShowPartialExchangeDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Partial Exchange - {selectedTicket?.ticketNumber}</DialogTitle>
                <DialogDescription>
                  Exchange selected flight segments only. Original ticket will be exchanged for new ticket with updated fare.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedTicket && (
                  <>
                    {/* Original Ticket Info */}
                    <div className="p-4 bg-secondary/20 rounded-lg">
                      <h4 className="font-medium mb-3">Original Ticket Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Passenger:</span> {selectedTicket.passengerName}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current Fare:</span> ${selectedTicket.fare.total}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Base Fare:</span> ${selectedTicket.fare.baseFare}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Change Penalty:</span> ${selectedTicket.changePenalty || 0}
                        </div>
                      </div>
                    </div>

                    {/* Segment Selection */}
                    <div>
                      <Label className="text-base font-medium">Select Segments to Exchange</Label>
                      <p className="text-xs text-muted-foreground mb-3">Choose which flight segments you want to change</p>
                      <div className="space-y-2">
                        {selectedTicket.segments.map((segment, idx) => (
                          <div 
                            key={idx}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedSegmentsForExchange.includes(segment.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-border hover:bg-secondary/20'
                            }`}
                            onClick={() => {
                              if (selectedSegmentsForExchange.includes(segment.id)) {
                                setSelectedSegmentsForExchange(selectedSegmentsForExchange.filter(id => id !== segment.id))
                              } else {
                                setSelectedSegmentsForExchange([...selectedSegmentsForExchange, segment.id])
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-wrap gap-3">
                                <Checkbox 
                                  checked={selectedSegmentsForExchange.includes(segment.id)}
                                  readOnly
                                />
                                <div>
                                  <div className="font-medium">{segment.flightNumber}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {segment.origin} → {segment.destination}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div>{segment.departureDate}</div>
                                <div className="text-muted-foreground">{segment.departureTime}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* New Fare Input */}
                    <div>
                      <Label>New Fare ($)</Label>
                      <Input 
                        type="number" 
                        value={exchangeNewFare || ''}
                        onChange={(e) => setExchangeNewFare(parseFloat(e.target.value) || 0)}
                        placeholder="Enter new fare amount"
                      />
                    </div>

                    {/* Fare Breakdown */}
                    {selectedSegmentsForExchange.length > 0 && exchangeNewFare > 0 && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium mb-3">Exchange Calculation</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Original Fare:</span>
                            <span>${selectedTicket.fare.total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>New Fare:</span>
                            <span>${exchangeNewFare}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fare Difference:</span>
                            <span className={exchangeNewFare - selectedTicket.fare.total > 0 ? 'text-red-600' : 'text-green-600'}>
                              ${exchangeNewFare - selectedTicket.fare.total}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Change Fee:</span>
                            <span>${selectedTicket.changePenalty || 0}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-medium text-base">
                            <span>Total Due / Refund:</span>
                            <span className={exchangeNewFare - selectedTicket.fare.total + (selectedTicket.changePenalty || 0) > 0 ? 'text-red-600' : 'text-green-600'}>
                              ${(exchangeNewFare - selectedTicket.fare.total + (selectedTicket.changePenalty || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fare Rules */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center flex-wrap gap-2">
                        <Info className="h-4 w-4" />
                        Fare Rules & Restrictions
                      </h4>
                      <ul className="text-sm space-y-1 text-amber-800">
                        {selectedTicket.fareRules.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span>•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Exchange fee of ${selectedTicket.changePenalty || 0} applies to voluntary changes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span>•</span>
                          <span>Fare difference will be collected or refunded based on new fare</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowPartialExchangeDialog(false)
                  setSelectedSegmentsForExchange([])
                  setExchangeNewFare(0)
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePartialExchange}
                  disabled={selectedSegmentsForExchange.length === 0 || exchangeNewFare === 0}
                >
                  Process Exchange
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* INVOLUNTARY REFUND DIALOG */}
          <Dialog open={showInvoluntaryRefundDialog} onOpenChange={setShowInvoluntaryRefundDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Involuntary Refund - {selectedTicket?.ticketNumber}</DialogTitle>
                <DialogDescription>
                  Process airline-initiated refunds for delays, cancellations, and other disruptions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedTicket && (
                  <>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium mb-3 flex items-center flex-wrap gap-2 text-red-800">
                        <AlertTriangle className="h-4 w-4" />
                        Involuntary Refund Information
                      </h4>
                      <p className="text-sm text-red-700 mb-3">
                        Involuntary refunds are airline-initiated and typically result in full refund without penalties.
                        Common reasons include flight cancellations, significant delays, and schedule changes.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Ticket Number:</span>
                          <span className="font-mono">{selectedTicket.ticketNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Passenger:</span>
                          <span>{selectedTicket.passengerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Original Amount:</span>
                          <span>${selectedTicket.fare.total}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Refund Reason *</Label>
                      <Select value={involuntaryRefundReason} onValueChange={setInvoluntaryRefundReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason for refund" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flight_cancelled">Flight Cancelled</SelectItem>
                          <SelectItem value="significant_delay">Significant Delay (2+ hours)</SelectItem>
                          <SelectItem value="schedule_change">Schedule Change</SelectItem>
                          <SelectItem value="flight_diverted">Flight Diverted</SelectItem>
                          <SelectItem value="equipment_change">Equipment Change</SelectItem>
                          <SelectItem value="route_discontinuation">Route Discontinuation</SelectItem>
                          <SelectItem value="other">Other (Specify)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {involuntaryRefundReason === 'other' && (
                      <div>
                        <Label>Specify Reason</Label>
                        <Textarea 
                          placeholder="Please provide details..."
                          value={involuntaryRefundReason === 'other' ? '' : involuntaryRefundReason}
                          onChange={(e) => setInvoluntaryRefundReason(`Other: ${e.target.value}`)}
                        />
                      </div>
                    )}

                    <div>
                      <Label>Approver Name *</Label>
                      <Input 
                        placeholder="Enter approver name"
                        value={involuntaryRefundApprover}
                        onChange={(e) => setInvoluntaryRefundApprover(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Manager or supervisor approval required for involuntary refunds</p>
                    </div>

                    {/* Refund Breakdown */}
                    <div className="p-4 bg-secondary/20 rounded-lg">
                      <h4 className="font-medium mb-3">Refund Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Fare:</span>
                          <span>${selectedTicket.fare.baseFare}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes:</span>
                          <span>${selectedTicket.fare.taxes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fees:</span>
                          <span>${selectedTicket.fare.fees}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium text-base">
                          <span>Total Refund:</span>
                          <span className="text-green-600">${selectedTicket.fare.total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tax Breakdown */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">Tax Breakdown (Refundable)</h4>
                      <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                        {selectedTicket.taxes.length > 0 ? (
                          selectedTicket.taxes.map((tax, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>{tax.code} - {tax.name}</span>
                              <span>${tax.amount.toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground">
                            Estimated taxes: ${Math.round(selectedTicket.fare.taxes)} (full amount refundable)
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowInvoluntaryRefundDialog(false)
                  setInvoluntaryRefundReason('')
                  setInvoluntaryRefundApprover('')
                }}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleInvoluntaryRefund}
                  disabled={!involuntaryRefundReason || !involuntaryRefundApprover}
                >
                  Process Refund
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* TICKET DETAIL DIALOG */}
          <Dialog open={showTicketDetailDialog} onOpenChange={setShowTicketDetailDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Ticket Details - {selectedTicket?.ticketNumber}</span>
                  {selectedTicket?.isCodeshare && (
                    <Badge variant="outline" className="flex items-center flex-wrap gap-1">
                      <Share2 className="h-3 w-3" />
                      Codeshare
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              {selectedTicket && (
                <div className="space-y-4 py-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <Badge 
                        variant={selectedTicket.status === 'open' ? 'default' : 
                                selectedTicket.status === 'void' ? 'destructive' : 'secondary'}
                        className="capitalize mt-1"
                      >
                        {selectedTicket.status}
                      </Badge>
                    </Card>
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Total Fare</div>
                      <div className="font-bold text-lg">${selectedTicket.fare.total}</div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Commission</div>
                      <div className="font-bold text-lg">${selectedTicket.commission.amount}</div>
                      <div className="text-xs text-muted-foreground">({selectedTicket.commission.rate}%)</div>
                    </Card>
                    <Card className="p-3">
                      <div className="text-xs text-muted-foreground">Refundable</div>
                      <div className="mt-1">
                        {selectedTicket.refundable ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Passenger & PNR Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Passenger Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span> {selectedTicket.passengerName}
                        </div>
                        <div>
                          <span className="text-muted-foreground">PNR:</span> <span className="font-mono">{selectedTicket.pnrNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Issued:</span> {new Date(selectedTicket.issuedAt).toLocaleString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Issued By:</span> {selectedTicket.issuedBy}
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Carrier Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Marketing Carrier:</span> {selectedTicket.segments[0]?.airlineCode}
                        </div>
                        {selectedTicket.operatingCarrier && (
                          <div>
                            <span className="text-muted-foreground">Operating Carrier:</span> {selectedTicket.operatingCarrier}
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Validation Airline:</span> {selectedTicket.validationAirline}
                        </div>
                        {selectedTicket.isCodeshare && (
                          <div>
                            <Badge variant="outline" className="mt-2">
                              This is a codeshare flight
                            </Badge>
                          </div>
                        )}
                        {selectedTicket.interlinePartners && selectedTicket.interlinePartners.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Interline Partners:</span>
                            <div className="flex gap-1 mt-1">
                              {selectedTicket.interlinePartners.map((partner, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{partner}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>

                  {/* Flight Segments */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Flight Segments</h4>
                    <div className="space-y-3">
                      {selectedTicket.segments.map((segment, idx) => (
                        <div key={idx} className="flex items-center flex-wrap gap-4 p-3 bg-secondary/20 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{segment.flightNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {segment.origin} → {segment.destination}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div>{segment.departureDate}</div>
                            <div className="text-muted-foreground">{segment.departureTime}</div>
                          </div>
                          <div className="text-right text-sm">
                            <div>{segment.arrivalDate}</div>
                            <div className="text-muted-foreground">{segment.arrivalTime}</div>
                          </div>
                          <Badge variant="outline">{segment.boardingClass}</Badge>
                          <Badge variant="outline">{segment.fareClass}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Fare Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Fare Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Fare:</span>
                          <span>${selectedTicket.fare.baseFare}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes:</span>
                          <span>${selectedTicket.fare.taxes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fees:</span>
                          <span>${selectedTicket.fare.fees}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium text-base">
                          <span>Total:</span>
                          <span>${selectedTicket.fare.total}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Commission Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Commission Amount:</span>
                          <span>${selectedTicket.commission.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Commission Rate:</span>
                          <span>{selectedTicket.commission.rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paid To:</span>
                          <span>{selectedTicket.commission.paidTo || 'N/A'}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Tax Breakdown */}
                  {selectedTicket.taxes.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Tax Breakdown</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {selectedTicket.taxes.map((tax, idx) => (
                          <div key={idx} className="flex justify-between p-2 bg-secondary/20 rounded">
                            <div>
                              <Badge variant="outline" className="mr-2">{tax.code}</Badge>
                              {tax.name}
                            </div>
                            <span>${tax.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Fare Rules */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Fare Rules & Restrictions</h4>
                    <ul className="space-y-2 text-sm">
                      {selectedTicket.fareRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>Change Penalty: ${selectedTicket.changePenalty || 0}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>
                          {selectedTicket.refundable ? (
                            <span className="text-green-600">Refundable</span>
                          ) : (
                            <span className="text-red-600">Non-refundable</span>
                          )}
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>Voidable until: {new Date(selectedTicket.voidableUntil).toLocaleString()}</span>
                      </li>
                    </ul>
                  </Card>

                  {/* Ticketing Actions */}
                  <Card className="p-4">
                    <h4 className="font-medium mb-3">Ticket Actions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Button variant="outline" size="sm" onClick={handleReprintTicket} className="justify-start">
                        <Printer className="h-4 w-4 mr-2" />
                        Reprint
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleEmailTicket} className="justify-start">
                        <Share2 className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleSMSTicket} className="justify-start">
                        <Zap className="h-4 w-4 mr-2" />
                        SMS
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { 
                          setSelectedEMD(null); 
                          setShowEMDDialog(true); 
                        }} 
                        className="justify-start"
                      >
                        <Receipt className="h-4 w-4 mr-2" />
                        EMD
                      </Button>
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center flex-wrap gap-2 text-sm text-blue-900">
                        <Info className="h-4 w-4" />
                        <span>Mobile ticket includes QR code for boarding</span>
                      </div>
                    </div>
                  </Card>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowTicketDetailDialog(false)}>
                      Close
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowTicketDetailDialog(false)
                      handleViewAuditTrail(selectedTicket.ticketNumber)
                    }}>
                      <History className="h-4 w-4 mr-2" />
                      View Audit Trail
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* AUDIT TRAIL DIALOG */}
          <Dialog open={showAuditTrailDialog} onOpenChange={setShowAuditTrailDialog}>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Ticket Audit Trail - {selectedTicket?.ticketNumber}
                </DialogTitle>
                <DialogDescription>
                  Complete history of all actions performed on this ticket
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedTicket && (
                  <>
                    <Card className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Passenger:</span>
                          <div className="font-medium">{selectedTicket.passengerName}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">PNR:</span>
                          <div className="font-mono font-medium">{selectedTicket.pnrNumber}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current Status:</span>
                          <div>
                            <Badge 
                              variant={selectedTicket.status === 'open' ? 'default' : 
                                      selectedTicket.status === 'void' ? 'destructive' : 'secondary'}
                              className="capitalize"
                            >
                              {selectedTicket.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Amount:</span>
                          <div className="font-medium">${selectedTicket.fare.total}</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Audit History</h4>
                      {ticketAuditTrail.filter(a => a.ticketNumber === selectedTicket.ticketNumber).length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">
                          No audit trail entries found for this ticket
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {ticketAuditTrail
                            .filter(a => a.ticketNumber === selectedTicket.ticketNumber)
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((entry, idx) => (
                              <div key={idx} className="p-3 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center flex-wrap gap-2">
                                    <Badge variant="outline" className="capitalize">
                                      {entry.action.replace('_', ' ')}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(entry.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    By: {entry.user}
                                  </span>
                                </div>
                                {entry.reason && (
                                  <div className="text-sm mb-2">
                                    <span className="text-muted-foreground">Reason:</span> {entry.reason}
                                  </div>
                                )}
                                {entry.approver && (
                                  <div className="text-sm mb-2">
                                    <span className="text-muted-foreground">Approver:</span> {entry.approver}
                                  </div>
                                )}
                                {entry.before && (
                                  <div className="text-sm bg-red-50 p-2 rounded mb-2">
                                    <div className="font-medium text-red-800 mb-1">Before:</div>
                                    <pre className="text-xs text-red-700 whitespace-pre-wrap">
                                      {JSON.stringify(entry.before, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {entry.after && (
                                  <div className="text-sm bg-green-50 p-2 rounded">
                                    <div className="font-medium text-green-800 mb-1">After:</div>
                                    <pre className="text-xs text-green-700 whitespace-pre-wrap">
                                      {JSON.stringify(entry.after, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </Card>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAuditTrailDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Tabs value={inventorySubTab} onValueChange={setInventorySubTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="seatmap">Seat Map</TabsTrigger>
              <TabsTrigger value="od">O&D Control</TabsTrigger>
              <TabsTrigger value="fareclasses">Fare Classes</TabsTrigger>
              <TabsTrigger value="overbooking">Overbooking</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center flex-wrap gap-2">
                      <Layers className="h-4 w-4" />
                      Fare Class Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {fareClasses.slice(0, 6).map((fc) => (
                        <div key={fc.code} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{fc.code} - {fc.name}</span>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-muted-foreground">{fc.sold}/{fc.capacity}</span>
                            <Badge variant={fc.isOpen ? 'default' : 'secondary'} className="text-xs">
                              {fc.isOpen ? 'Open' : 'Closed'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center flex-wrap gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Overbooking Control
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Economy</span>
                        <span className="font-medium text-green-600">+{overbookingSettings.economy} seats</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Business</span>
                        <span className="font-medium text-green-600">+{overbookingSettings.business} seats</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>First</span>
                        <span className="font-medium text-muted-foreground">+{overbookingSettings.first} seats</span>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        Threshold: {overbookingSettings.loadFactorThreshold}% load factor
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Auto-adjust</span>
                        <Switch checked={overbookingSettings.autoAdjust} onCheckedChange={(v) => setOverbookingSettings({...overbookingSettings, autoAdjust: v})} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center flex-wrap gap-2">
                      <Armchair className="h-4 w-4" />
                      Seat Map Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Aircraft:</span>
                        <span className="font-medium ml-2">{selectedAircraft}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Configuration:</span>
                        <span className="font-medium ml-2">3-3 (Economy)</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Total Seats:</span>
                        <span className="font-medium ml-2">{seats.length}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-medium ml-2 text-green-600">
                          {seats.filter(s => s.status === 'available' || s.status === 'premium').length}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setInventorySubTab('seatmap')}>
                        View Full Seat Map
                      </Button>
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
                  <div className="overflow-x-auto">
                    <table className="enterprise-table min-w-[900px]">
                      <thead>
                        <tr>
                          <th>Family</th>
                          <th>Cabin</th>
                          <th>Fare Classes</th>
                          <th>Features</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                    <tbody>
                      {fareFamilies.map((family) => (
                        <tr key={family.id}>
                          <td className="font-medium">{family.name}</td>
                          <td className="capitalize">{family.cabin}</td>
                          <td>
                            {family.fareClasses.map(fc => (
                              <Badge key={fc} variant="outline" className="mr-1">{fc}</Badge>
                            ))}
                          </td>
                          <td className="text-sm text-muted-foreground max-w-xs truncate">
                            {family.features.join(', ')}
                          </td>
                          <td>
                            <Badge variant={family.isActive ? 'default' : 'secondary'}>
                              {family.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seat Map Tab */}
            <TabsContent value="seatmap" className="space-y-4">
              <Card className="enterprise-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Interactive Seat Map</CardTitle>
                    <div className="flex items-center flex-wrap gap-4">
                      <div className="flex items-center flex-wrap gap-2">
                        <Label>Aircraft:</Label>
                        <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="B737-800">Boeing 737-800</SelectItem>
                            <SelectItem value="A320-200">Airbus A320-200</SelectItem>
                            <SelectItem value="B777-300ER">Boeing 777-300ER</SelectItem>
                            <SelectItem value="A350-900">Airbus A350-900</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center flex-wrap gap-2">
                        <Label>Cabin:</Label>
                        <Select value={selectedCabin} onValueChange={(v: CabinClass) => setSelectedCabin(v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="economy">Economy</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="first">First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <CardDescription>
                    Click on available seats to select. View seat details and pricing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Legend */}
                  <div className="flex items-center flex-wrap gap-6 mb-6 text-sm">
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="w-6 h-6 bg-amber-100 border border-amber-400 rounded"></div>
                      <span>Premium</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
                      <span>Blocked</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <div className="w-6 h-6 bg-blue-500 border border-blue-600 rounded"></div>
                      <span>Selected</span>
                    </div>
                  </div>

                  {/* Seat Map */}
                  <div className="overflow-y-auto max-h-96">
                    <div className="flex justify-center">
                      <div className="space-y-1 w-full max-w-4xl px-2 sm:px-0">
                        {/* Aircraft nose */}
                        <div className="w-full flex justify-center mb-4">
                          <div className="bg-gray-200 text-gray-600 px-4 sm:px-6 py-2 rounded-t-full text-xs sm:text-sm font-medium">
                            {selectedAircraft} - {selectedCabin.toUpperCase()}
                          </div>
                        </div>
                        
                        {/* Seats grid */}
                        <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                          {Array.from(new Set(seats.map(s => s.row))).sort((a, b) => a - b).map((row) => (
                            <div key={row} className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-muted-foreground">{row}</span>
                              <div className="flex items-center flex-wrap gap-0.5 sm:gap-1 overflow-x-auto">
                                {seats.filter(s => s.row === row).sort((a, b) => a.column.localeCompare(b.column)).map((seat) => (
                                  <button
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat)}
                                    disabled={seat.status === 'occupied' || seat.status === 'blocked'}
                                    className={`
                                      w-8 h-8 sm:w-10 sm:h-10 rounded border-2 flex items-center justify-center text-[10px] sm:text-xs font-medium flex-shrink-0
                                      ${getSeatColor(seat.status)}
                                      ${seat.isExitRow ? 'ring-2 ring-orange-400' : ''}
                                      ${seat.isWindow ? 'rounded-l' : ''}
                                      ${seat.isAisle ? 'mx-0.5 sm:mx-1' : ''}
                                      transition-all
                                    `}
                                    title={`${seat.id}${seat.isWindow ? ' (Window)' : ''}${seat.isAisle ? ' (Aisle)' : ''}${seat.isExitRow ? ' (Exit Row)' : ''} - $${seat.price}`}
                                  >
                                    {seat.column}
                                  </button>
                                ))}
                              </div>
                              <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-muted-foreground">{row}</span>
                            </div>
                          ))}
                        </div>

                        {/* Aircraft tail */}
                        <div className="w-full flex justify-center mt-4">
                          <div className="bg-gray-200 text-gray-600 px-6 sm:px-8 py-2 rounded-b-full text-xs sm:text-sm">
                            ◄
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Seat Details */}
                  {selectedSeat && (
                    <Card className="mt-4 bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <h4 className="font-semibold">Seat {selectedSeat.id}</h4>
                            <div className="flex items-center flex-wrap gap-4 text-sm">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-semibold text-lg">${selectedSeat.price}</span>
                              {selectedSeat.status === 'premium' && (
                                <Badge variant="secondary">Premium</Badge>
                              )}
                            </div>
                            <div className="flex items-center flex-wrap gap-4 text-sm">
                              <span className="text-muted-foreground">Characteristics:</span>
                              <div className="flex items-center flex-wrap gap-2">
                                {selectedSeat.isWindow && <Badge variant="outline">Window</Badge>}
                                {selectedSeat.isAisle && <Badge variant="outline">Aisle</Badge>}
                                {selectedSeat.isExitRow && <Badge variant="outline">Exit Row</Badge>}
                                {selectedSeat.isWing && <Badge variant="outline">Wing</Badge>}
                              </div>
                            </div>
                            <div className="flex items-center flex-wrap gap-4 text-sm">
                              <span className="text-muted-foreground">Legroom:</span>
                              <span>{selectedSeat.legroom} inches</span>
                              <span className="text-muted-foreground ml-4">Recline:</span>
                              <span>{selectedSeat.recline} inches</span>
                            </div>
                          </div>
                          <Button onClick={() => setSelectedSeat(null)}>
                            Deselect
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Seat Configuration Button */}
                  <div className="mt-4 flex justify-end">
                    <Dialog open={showSeatConfigDialog} onOpenChange={setShowSeatConfigDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Seat Map
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Seat Configuration Manager</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Aircraft Type</Label>
                            <Select value={selectedAircraft} onValueChange={setSelectedAircraft}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="B737-800">Boeing 737-800</SelectItem>
                                <SelectItem value="A320-200">Airbus A320-200</SelectItem>
                                <SelectItem value="B777-300ER">Boeing 777-300ER</SelectItem>
                                <SelectItem value="A350-900">Airbus A350-900</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Configuration Name</Label>
                            <Input placeholder="e.g., Standard 3-3 Layout" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Economy Rows</Label>
                              <Input type="number" defaultValue={24} />
                            </div>
                            <div>
                              <Label>Business Rows</Label>
                              <Input type="number" defaultValue={9} />
                            </div>
                          </div>
                          <div>
                            <Label>Seat Layout</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select layout" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="3-3">3-3 (Narrowbody)</SelectItem>
                                <SelectItem value="2-4-2">2-4-2 (Widebody)</SelectItem>
                                <SelectItem value="3-4-3">3-4-3 (Large Widebody)</SelectItem>
                                <SelectItem value="1-2-1">1-2-1 (Business)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowSeatConfigDialog(false)}>Cancel</Button>
                          <Button>Save Configuration</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* O&D Control Tab */}
            <TabsContent value="od" className="space-y-4">
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Origin-Destination Control</CardTitle>
                  <CardDescription>
                    Search and manage availability across connecting flight options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-4 mb-6">
                    <div>
                      <Label>Origin</Label>
                      <Input value={odOrigin} onChange={(e) => setOdOrigin(e.target.value.toUpperCase())} placeholder="JFK" className="w-24" />
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground mb-2" />
                    <div>
                      <Label>Destination</Label>
                      <Input value={odDestination} onChange={(e) => setOdDestination(e.target.value.toUpperCase())} placeholder="LHR" className="w-24" />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input type="date" value={odDate} onChange={(e) => setOdDate(e.target.value)} />
                    </div>
                    <Button onClick={handleSearchOD}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  {odRoutes.length > 0 ? (
                    <div className="overflow-y-auto max-h-96">
                      <div className="space-y-3">
                        {odRoutes.map((route, idx) => (
                          <Card key={route.id} className="border-2">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center flex-wrap gap-3">
                                  <Badge variant={idx === 0 ? 'default' : 'secondary'}>
                                    {idx === 0 ? 'Best Price' : `${route.stops} Stop${route.stops > 1 ? 's' : ''}`}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">{formatDuration(route.totalDuration)}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-600">${route.totalPrice}</div>
                                  <div className="text-xs text-muted-foreground">per person</div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                {route.segments.map((seg, segIdx) => (
                                  <div key={segIdx} className="flex items-center flex-wrap gap-3 text-sm p-2 bg-secondary/20 rounded">
                                    <div className="flex-1">
                                      <div className="flex items-center flex-wrap gap-2">
                                        <span className="font-semibold">{seg.flightNumber}</span>
                                        <span className="text-muted-foreground">{seg.aircraft}</span>
                                      </div>
                                      <div className="flex items-center flex-wrap gap-2 mt-1">
                                        <span className="font-medium">{seg.origin}</span>
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-medium">{seg.destination}</span>
                                      </div>
                                    </div>
                                    <div className="text-right text-muted-foreground">
                                      <div>{seg.departureTime}</div>
                                      <div>{seg.arrivalTime}</div>
                                    </div>
                                    {segIdx < route.segments.length - 1 && (
                                      <div className="text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3 inline mr-1" />
                                        Layover
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="mt-3 flex items-center flex-wrap gap-2">
                                <span className="text-xs text-muted-foreground">Fare Classes:</span>
                                {route.availableFareClasses.slice(0, 5).map(fc => (
                                  <Badge key={fc} variant="outline" className="text-xs">{fc}</Badge>
                                ))}
                                {route.availableFareClasses.length > 5 && (
                                  <Badge variant="outline" className="text-xs">+{route.availableFareClasses.length - 5} more</Badge>
                                )}
                              </div>
                              <div className="mt-4 pt-4 border-t">
                                <Button 
                                  className="w-full" 
                                  onClick={() => handleBookRoute(route)}
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Book This Route
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Plane className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Enter origin, destination, and date to search for available routes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Fare Classes Tab */}
            <TabsContent value="fareclasses" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Fare Class Management</h3>
                  <p className="text-sm text-muted-foreground">Configure fare classes, hierarchy, and restrictions</p>
                </div>
                <Dialog open={showFareClassDialog} onOpenChange={(open) => { setShowFareClassDialog(open); if (!open) setEditingFareClass(null) }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Fare Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingFareClass ? 'Edit Fare Class' : 'Configure Fare Class'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Fare Class Code</Label>
                          <Input 
                            value={editingFareClass ? editingFareClass.code : newFareClass.code} 
                            onChange={(e) => editingFareClass ? setEditingFareClass({...editingFareClass, code: e.target.value.toUpperCase()}) : setNewFareClass({...newFareClass, code: e.target.value.toUpperCase()})} 
                            placeholder="e.g., Y, B, M" 
                            maxLength={1} 
                            disabled={!!editingFareClass}
                            className={errors.code ? 'border-red-500' : ''}
                          />
                          {errors.code && (
                            <p className="text-xs text-red-500 mt-1">{errors.code}</p>
                          )}
                        </div>
                        <div>
                          <Label>Name</Label>
                          <Input 
                            value={editingFareClass ? editingFareClass.name : newFareClass.name} 
                            onChange={(e) => editingFareClass ? setEditingFareClass({...editingFareClass, name: e.target.value}) : setNewFareClass({...newFareClass, name: e.target.value})} 
                            placeholder="e.g., Economy Full" 
                            className={errors.name ? 'border-red-500' : ''}
                          />
                          {errors.name && (
                            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Hierarchy Level</Label>
                          <Input 
                            type="number" 
                            value={editingFareClass ? editingFareClass.hierarchy : newFareClass.hierarchy} 
                            onChange={(e) => editingFareClass ? setEditingFareClass({...editingFareClass, hierarchy: Number(e.target.value)}) : setNewFareClass({...newFareClass, hierarchy: Number(e.target.value)})} 
                            placeholder="1-10" 
                            className={errors.hierarchy ? 'border-red-500' : ''}
                          />
                          {errors.hierarchy && (
                            <p className="text-xs text-red-500 mt-1">{errors.hierarchy}</p>
                          )}
                        </div>
                        <div>
                          <Label>Capacity</Label>
                          <Input 
                            type="number" 
                            value={editingFareClass ? editingFareClass.capacity : newFareClass.capacity} 
                            onChange={(e) => editingFareClass ? setEditingFareClass({...editingFareClass, capacity: Number(e.target.value)}) : setNewFareClass({...newFareClass, capacity: Number(e.target.value)})} 
                            placeholder="Number of seats" 
                            className={errors.capacity ? 'border-red-500' : ''}
                          />
                          {errors.capacity && (
                            <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input 
                          type="number" 
                          value={editingFareClass ? editingFareClass.price : newFareClass.price} 
                          onChange={(e) => editingFareClass ? setEditingFareClass({...editingFareClass, price: Number(e.target.value)}) : setNewFareClass({...newFareClass, price: Number(e.target.value)})} 
                          placeholder="Base price" 
                          className={errors.price ? 'border-red-500' : ''}
                        />
                        {errors.price && (
                          <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Advance Purchase (days)</Label>
                          <Input 
                            type="number" 
                            value={editingFareClass ? editingFareClass.restrictions.advancePurchase : newFareClass.restrictions.advancePurchase} 
                            onChange={(e) => editingFareClass ? setEditingFareClass({...editingFareClass, restrictions: {...editingFareClass.restrictions, advancePurchase: Number(e.target.value)}}) : setNewFareClass({...newFareClass, restrictions: {...newFareClass.restrictions, advancePurchase: Number(e.target.value)}})} 
                          />
                        </div>
                        <div>
                          <Label>Min Stay (days)</Label>
                          <Input 
                            type="number" 
                            value={editingFareClass ? editingFareClass.restrictions.minStay : newFareClass.restrictions.minStay} 
                            onChange={(e) => editingFareClass ? setEditingFareClass({...editingFareClass, restrictions: {...editingFareClass.restrictions, minStay: Number(e.target.value)}}) : setNewFareClass({...newFareClass, restrictions: {...newFareClass.restrictions, minStay: Number(e.target.value)}})} 
                          />
                        </div>
                        <div>
                          <Label>Max Stay (days)</Label>
                          <Input 
                            type="number" 
                            value={editingFareClass ? editingFareClass.restrictions.maxStay : newFareClass.restrictions.maxStay} 
                            onChange={(e) => editingFareClass ? setEditingFareClass({...editingFareClass, restrictions: {...editingFareClass.restrictions, maxStay: Number(e.target.value)}}) : setNewFareClass({...newFareClass, restrictions: {...newFareClass.restrictions, maxStay: Number(e.target.value)}})} 
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setShowFareClassDialog(false); setEditingFareClass(null) }}>Cancel</Button>
                      <Button 
                        onClick={() => editingFareClass ? handleUpdateFareClass(editingFareClass.code) : handleSaveFareClass()}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                        {isSubmitting ? 'Saving...' : (editingFareClass ? 'Update Fare Class' : 'Save Fare Class')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="enterprise-card">
                <CardContent className="pt-6">
                  <div className="overflow-x-auto max-h-96">
                    <table className="enterprise-table min-w-[1000px]">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Name</th>
                          <th>Hierarchy</th>
                          <th>Capacity</th>
                          <th>Sold</th>
                          <th>Available</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fareClasses.map((fc) => (
                          <tr key={fc.code}>
                            <td className="font-mono font-bold">{fc.code}</td>
                            <td>{fc.name}</td>
                            <td>
                              <Badge variant="outline">{fc.hierarchy}</Badge>
                            </td>
                            <td>{fc.capacity}</td>
                            <td>{fc.sold}</td>
                            <td className={fc.available < 5 ? 'text-red-600 font-medium' : ''}>
                              {fc.available}
                            </td>
                            <td>${fc.price}</td>
                            <td>
                              <Button
                                variant={fc.isOpen ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleFareBucket(fc.code)}
                              >
                                {fc.isOpen ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                                {fc.isOpen ? 'Open' : 'Closed'}
                              </Button>
                            </td>
                            <td>
                              <div className="flex items-center flex-wrap gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleEditFareClass(fc.code)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleViewFareClassDetails(fc.code)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Fare Class Hierarchy Visualization */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="text-base">Fare Class Hierarchy</CardTitle>
                  <CardDescription>Visual representation of fare class nesting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 overflow-x-auto pb-4">
                    {fareClasses
                      .sort((a, b) => a.hierarchy - b.hierarchy)
                      .map((fc, idx) => (
                        <div key={fc.code} className="flex items-center">
                          {idx > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />}
                          <div className={`p-3 rounded border-2 ${fc.available < 5 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'} min-w-[100px] text-center`}>
                            <div className="font-bold text-lg">{fc.code}</div>
                            <div className="text-xs text-muted-foreground">{fc.available} avail</div>
                            <div className="text-xs font-medium">${fc.price}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <ArrowRight className="h-4 w-4 inline mr-1" />
                    Higher hierarchy classes can book into lower hierarchy classes when inventory is available
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Overbooking Tab */}
            <TabsContent value="overbooking" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Overbooking Control</h3>
                  <p className="text-sm text-muted-foreground">Configure overbooking limits and compensation rules</p>
                </div>
                <Dialog open={showOverbookingDialog} onOpenChange={setShowOverbookingDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Overbooking
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Overbooking Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div>
                        <Label>Economy Overbooking Limit</Label>
                        <div className="flex items-center flex-wrap gap-4 mt-2">
                          <Slider
                            value={[overbookingSettings.economy]}
                            onValueChange={(v) => setOverbookingSettings({...overbookingSettings, economy: v[0]})}
                            max={20}
                            min={0}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-12 text-right font-medium">+{overbookingSettings.economy}</span>
                        </div>
                      </div>
                      <div>
                        <Label>Business Overbooking Limit</Label>
                        <div className="flex items-center flex-wrap gap-4 mt-2">
                          <Slider
                            value={[overbookingSettings.business]}
                            onValueChange={(v) => setOverbookingSettings({...overbookingSettings, business: v[0]})}
                            max={10}
                            min={0}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-12 text-right font-medium">+{overbookingSettings.business}</span>
                        </div>
                      </div>
                      <div>
                        <Label>First Overbooking Limit</Label>
                        <div className="flex items-center flex-wrap gap-4 mt-2">
                          <Slider
                            value={[overbookingSettings.first]}
                            onValueChange={(v) => setOverbookingSettings({...overbookingSettings, first: v[0]})}
                            max={5}
                            min={0}
                            step={1}
                            className="flex-1"
                          />
                          <span className="w-12 text-right font-medium">+{overbookingSettings.first}</span>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label>Load Factor Threshold for Auto-Adjust (%)</Label>
                        <div className="flex items-center flex-wrap gap-4 mt-2">
                          <Slider
                            value={[overbookingSettings.loadFactorThreshold]}
                            onValueChange={(v) => setOverbookingSettings({...overbookingSettings, loadFactorThreshold: v[0]})}
                            max={100}
                            min={50}
                            step={5}
                            className="flex-1"
                          />
                          <span className="w-12 text-right font-medium">{overbookingSettings.loadFactorThreshold}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Auto-Adjust Overbooking Based on Demand</Label>
                        <Switch
                          checked={overbookingSettings.autoAdjust}
                          onCheckedChange={(v) => setOverbookingSettings({...overbookingSettings, autoAdjust: v})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowOverbookingDialog(false)}>Cancel</Button>
                      <Button>Save Settings</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="text-base">Current Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Economy</span>
                      <Badge variant="default">+{overbookingSettings.economy}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Business</span>
                      <Badge variant="default">+{overbookingSettings.business}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>First</span>
                      <Badge variant="secondary">+{overbookingSettings.first}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="text-base">Denied Boarding History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">This Month</span>
                      <span className="font-medium">3 passengers</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg. Compensation</span>
                      <span className="font-medium">$450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Incident</span>
                      <span className="font-medium">2 days ago</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="text-base">Compensation Rules</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Voluntary</span>
                      <span className="font-medium">$200 - $400</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Involuntary (&lt;2hr)</span>
                      <span className="font-medium">200% fare</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Involuntary (&gt;2hr)</span>
                      <span className="font-medium">400% fare</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle className="text-base">Seasonal Overbooking Adjustments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="enterprise-table min-w-[800px]">
                    <thead>
                      <tr>
                        <th>Season</th>
                        <th>Period</th>
                        <th>Economy</th>
                        <th>Business</th>
                        <th>First</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Peak Holiday</td>
                        <td>Dec 20 - Jan 5</td>
                        <td>+10</td>
                        <td>+5</td>
                        <td>+2</td>
                        <td><Badge variant="default">Active</Badge></td>
                      </tr>
                      <tr>
                        <td>Summer Peak</td>
                        <td>Jun 15 - Aug 31</td>
                        <td>+8</td>
                        <td>+4</td>
                        <td>+1</td>
                        <td><Badge variant="secondary">Scheduled</Badge></td>
                      </tr>
                      <tr>
                        <td>Low Season</td>
                        <td>Nov - Mar (excl. holidays)</td>
                        <td>+3</td>
                        <td>+1</td>
                        <td>0</td>
                        <td><Badge variant="outline">Inactive</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agent Blocked Inventory */}
                <Card className="enterprise-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Agent Blocked Inventory</CardTitle>
                      <Dialog open={showBlockInventoryDialog} onOpenChange={setShowBlockInventoryDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Lock className="h-4 w-4 mr-2" />
                            Block Seats
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Block Inventory for Agent</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Agent ID</Label>
                              <Input value={newBlockInventory.agentId} onChange={(e) => setNewBlockInventory({...newBlockInventory, agentId: e.target.value})} placeholder="e.g., AGT001" />
                            </div>
                            <div>
                              <Label>Route</Label>
                              <Input value={newBlockInventory.route} onChange={(e) => setNewBlockInventory({...newBlockInventory, route: e.target.value})} placeholder="e.g., JFK-LHR" />
                            </div>
                            <div>
                              <Label>Date</Label>
                              <Input type="date" value={newBlockInventory.date} onChange={(e) => setNewBlockInventory({...newBlockInventory, date: e.target.value})} />
                            </div>
                            <div>
                              <Label>Number of Seats</Label>
                              <Input type="number" value={newBlockInventory.seats} onChange={(e) => setNewBlockInventory({...newBlockInventory, seats: Number(e.target.value)})} placeholder="Number of seats to block" />
                            </div>
                            <div>
                              <Label>Fare Class</Label>
                              <Select value={newBlockInventory.fareClass} onValueChange={(v) => setNewBlockInventory({...newBlockInventory, fareClass: v})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select fare class" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fareClasses.map(fc => (
                                    <SelectItem key={fc.code} value={fc.code}>{fc.code} - {fc.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Block Duration (minutes)</Label>
                              <Input type="number" value={newBlockInventory.duration} onChange={(e) => setNewBlockInventory({...newBlockInventory, duration: Number(e.target.value)})} defaultValue={30} />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowBlockInventoryDialog(false)}>Cancel</Button>
                            <Button onClick={handleBlockInventory}>Block Seats</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-y-auto max-h-64">
                      <div className="space-y-2">
                        {blockedInventory.map((block) => (
                          <div key={block.id} className="p-3 bg-secondary/20 rounded flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{block.agentName}</div>
                              <div className="text-xs text-muted-foreground">
                                {block.route} | {block.date} | {block.seats} seats ({block.fareClass})
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Expires: {new Date(block.expiresAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex items-center flex-wrap gap-2">
                              <Badge variant={block.status === 'active' ? 'default' : 'secondary'}>
                                {block.status}
                              </Badge>
                              {block.status === 'active' && (
                                <Button variant="ghost" size="sm" onClick={() => handleUnblockInventory(block.id)}>
                                  <Unlock className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Group Seat Allotment */}
                <Card className="enterprise-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Group Seat Allotment</CardTitle>
                      <Dialog open={showGroupAllotmentDialog} onOpenChange={setShowGroupAllotmentDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Users2 className="h-4 w-4 mr-2" />
                            Create Allotment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Group Allotment</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Group Name</Label>
                              <Input value={newGroupAllotment.groupName} onChange={(e) => setNewGroupAllotment({...newGroupAllotment, groupName: e.target.value})} placeholder="e.g., Corporate Summit 2024" />
                            </div>
                            <div>
                              <Label>Route</Label>
                              <Input value={newGroupAllotment.route} onChange={(e) => setNewGroupAllotment({...newGroupAllotment, route: e.target.value})} placeholder="e.g., JFK-LHR" />
                            </div>
                            <div>
                              <Label>Travel Date</Label>
                              <Input type="date" value={newGroupAllotment.date} onChange={(e) => setNewGroupAllotment({...newGroupAllotment, date: e.target.value})} />
                            </div>
                            <div>
                              <Label>Number of Seats</Label>
                              <Input type="number" value={newGroupAllotment.seats} onChange={(e) => setNewGroupAllotment({...newGroupAllotment, seats: Number(e.target.value)})} placeholder="Total seats for group" />
                            </div>
                            <div>
                              <Label>Booking Deadline</Label>
                              <Input type="date" value={newGroupAllotment.deadline} onChange={(e) => setNewGroupAllotment({...newGroupAllotment, deadline: e.target.value})} />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowGroupAllotmentDialog(false)}>Cancel</Button>
                            <Button onClick={handleCreateAllotment}>Create Allotment</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-y-auto max-h-64">
                      <div className="space-y-2">
                        {groupAllotments.map((group) => (
                          <div key={group.id} className="p-3 bg-secondary/20 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">{group.groupName}</div>
                              <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                                {group.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {group.route} | {group.date}
                            </div>
                            <div className="flex items-center flex-wrap gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Utilization:</span>
                                <span className="font-medium ml-1">{group.utilized}/{group.seats}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Deadline:</span>
                                <span className="font-medium ml-1">{group.deadline}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(group.utilized / group.seats) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dynamic Capacity Adjustment */}
                <Card className="enterprise-card">
                  <CardHeader>
                    <CardTitle className="text-base">Dynamic Capacity Adjustment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Load Factor Threshold (%)</Label>
                      <div className="flex items-center flex-wrap gap-4 mt-2">
                        <Slider
                          value={[loadFactorThreshold]}
                          onValueChange={(v) => setLoadFactorThreshold(v[0])}
                          max={100}
                          min={50}
                          step={5}
                          className="flex-1"
                        />
                        <span className="w-12 text-right font-medium">{loadFactorThreshold}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Auto-Adjust Based on Demand</Label>
                      <Switch checked={autoAdjustCapacity} onCheckedChange={setAutoAdjustCapacity} />
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm text-muted-foreground">Adjustment History</Label>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                          <span>JFK-LHR</span>
                          <span className="text-green-600">+5 seats</span>
                          <span className="text-muted-foreground">2h ago</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                          <span>LAX-SFO</span>
                          <span className="text-red-600">-3 seats</span>
                          <span className="text-muted-foreground">5h ago</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Blackout Date Management */}
                <Card className="enterprise-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Blackout Dates</CardTitle>
                      <Dialog open={showBlackoutDialog} onOpenChange={setShowBlackoutDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Add Blackout
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Blackout Date</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Route</Label>
                              <Input value={newBlackoutDate.route} onChange={(e) => setNewBlackoutDate({...newBlackoutDate, route: e.target.value})} placeholder="e.g., JFK-LHR or * for all routes" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label>Start Date</Label>
                                <Input type="date" value={newBlackoutDate.startDate} onChange={(e) => setNewBlackoutDate({...newBlackoutDate, startDate: e.target.value})} />
                              </div>
                              <div>
                                <Label>End Date</Label>
                                <Input type="date" value={newBlackoutDate.endDate} onChange={(e) => setNewBlackoutDate({...newBlackoutDate, endDate: e.target.value})} />
                              </div>
                            </div>
                            <div>
                              <Label>Cabin (Optional)</Label>
                              <Select value={newBlackoutDate.cabin || ''} onValueChange={(v) => setNewBlackoutDate({...newBlackoutDate, cabin: v === 'all' ? undefined : v as CabinClass})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="All cabins" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Cabins</SelectItem>
                                  <SelectItem value="economy">Economy</SelectItem>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="first">First</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Fare Class (Optional)</Label>
                              <Select value={newBlackoutDate.fareClass} onValueChange={(v) => setNewBlackoutDate({...newBlackoutDate, fareClass: v})}>
                                <SelectTrigger>
                                  <SelectValue placeholder="All fare classes" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">All Fare Classes</SelectItem>
                                  {fareClasses.map(fc => (
                                    <SelectItem key={fc.code} value={fc.code}>{fc.code}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Reason</Label>
                              <Textarea value={newBlackoutDate.reason} onChange={(e) => setNewBlackoutDate({...newBlackoutDate, reason: e.target.value})} placeholder="e.g., Holiday peak, maintenance, etc." />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowBlackoutDialog(false)}>Cancel</Button>
                            <Button onClick={handleAddBlackout}>Add Blackout</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-y-auto max-h-64">
                      <div className="space-y-2">
                        {blackoutDates.map((blackout) => (
                          <div key={blackout.id} className="p-3 bg-red-50 border border-red-200 rounded flex items-center justify-between">
                            <div>
                              <div className="flex items-center flex-wrap gap-2">
                                <Badge variant="destructive" className="text-xs">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Blackout
                                </Badge>
                                <span className="font-medium text-sm">{blackout.route}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {blackout.startDate} → {blackout.endDate}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {blackout.reason}
                                {blackout.cabin && ` | ${blackout.cabin}`}
                                {blackout.fareClass && ` | ${blackout.fareClass}`}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteBlackout(blackout.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fare Families Configuration */}
              <Card className="enterprise-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Fare Families Configuration</CardTitle>
                    <Dialog open={showFareFamilyDialog} onOpenChange={setShowFareFamilyDialog}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Fare Family
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-w-[95vw] sm:max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Configure Fare Family</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Family Name</Label>
                              <Input 
                                value={newFareFamily.name} 
                                onChange={(e) => setNewFareFamily({...newFareFamily, name: e.target.value})} 
                                placeholder="e.g., Premium Economy" 
                                className={errors.name ? 'border-red-500' : ''}
                              />
                              {errors.name && (
                                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                              )}
                            </div>
                            <div>
                              <Label>Cabin Class</Label>
                              <Select value={newFareFamily.cabin} onValueChange={(v) => setNewFareFamily({...newFareFamily, cabin: v as CabinClass})}>
                                <SelectTrigger className={errors.cabin ? 'border-red-500' : ''}>
                                  <SelectValue placeholder="Select cabin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="economy">Economy</SelectItem>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="first">First</SelectItem>
                                </SelectContent>
                              </Select>
                              {errors.cabin && (
                                <p className="text-xs text-red-500 mt-1">{errors.cabin}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label>Assigned Fare Classes</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {fareClasses.map(fc => (
                                <Badge 
                                  key={fc.code} 
                                  variant={newFareFamily.fareClasses.includes(fc.code) ? 'default' : 'outline'} 
                                  className={`cursor-pointer hover:bg-secondary ${errors.fareClasses ? 'ring-2 ring-red-500' : ''}`}
                                  onClick={() => {
                                    const newClasses = newFareFamily.fareClasses.includes(fc.code)
                                      ? newFareFamily.fareClasses.filter(c => c !== fc.code)
                                      : [...newFareFamily.fareClasses, fc.code]
                                    setNewFareFamily({...newFareFamily, fareClasses: newClasses})
                                  }}
                                >
                                  <Checkbox className="mr-2" checked={newFareFamily.fareClasses.includes(fc.code)} readOnly />
                                  {fc.code}
                                </Badge>
                              ))}
                            </div>
                            {errors.fareClasses && (
                              <p className="text-xs text-red-500 mt-1">{errors.fareClasses}</p>
                            )}
                          </div>
                          <div>
                            <Label>Features & Benefits</Label>
                            <Textarea 
                              value={newFareFamily.features} 
                              onChange={(e) => setNewFareFamily({...newFareFamily, features: e.target.value})} 
                              placeholder="Enter features separated by commas..." 
                              className={errors.features ? 'border-red-500' : ''}
                            />
                            {errors.features && (
                              <p className="text-xs text-red-500 mt-1">{errors.features}</p>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Base Markup (%)</Label>
                              <Input 
                                type="number" 
                                value={newFareFamily.baseMarkup} 
                                onChange={(e) => setNewFareFamily({...newFareFamily, baseMarkup: Number(e.target.value)})} 
                                placeholder="0" 
                                className={errors.baseMarkup ? 'border-red-500' : ''}
                              />
                              {errors.baseMarkup && (
                                <p className="text-xs text-red-500 mt-1">{errors.baseMarkup}</p>
                              )}
                            </div>
                            <div>
                              <Label>Demand Multiplier</Label>
                              <Input 
                                type="number" 
                                step="0.1" 
                                value={newFareFamily.demandMultiplier} 
                                onChange={(e) => setNewFareFamily({...newFareFamily, demandMultiplier: Number(e.target.value)})} 
                                placeholder="1.0" 
                                className={errors.demandMultiplier ? 'border-red-500' : ''}
                              />
                              {errors.demandMultiplier && (
                                <p className="text-xs text-red-500 mt-1">{errors.demandMultiplier}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowFareFamilyDialog(false)}>Cancel</Button>
                          <Button onClick={handleSaveFareFamily} disabled={isSubmitting}>
                            {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                            {isSubmitting ? 'Saving...' : 'Save Family'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fareFamilies.map((family) => (
                      <Card key={family.id} className="border-2">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{family.name}</CardTitle>
                            <Badge variant={family.isActive ? 'default' : 'secondary'}>
                              {family.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <CardDescription className="capitalize">{family.cabin} Class</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Fare Classes</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {family.fareClasses.map(fc => (
                                <Badge key={fc} variant="outline" className="text-xs">{fc}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Features</Label>
                            <div className="mt-1 space-y-1">
                              {family.features.slice(0, 3).map((feature, idx) => (
                                <div key={idx} className="text-xs flex items-center flex-wrap gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  {feature}
                                </div>
                              ))}
                              {family.features.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{family.features.length - 3} more features
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground">Markup:</span>
                            <span className="font-medium">+{family.pricingRules.baseMarkup}%</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditFareFamily(family.id)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleViewFareFamily(family.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Route-Specific Inventory */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Route-Specific Inventory</CardTitle>
                  <CardDescription>Configure inventory and pricing by route</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto max-h-80">
                    <table className="enterprise-table min-w-[900px]">
                      <thead>
                        <tr>
                          <th>Route</th>
                          <th>Cabin</th>
                          <th>Capacity</th>
                          <th>Sold</th>
                          <th>Load Factor</th>
                          <th>Pricing Tier</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-medium">JFK-LHR</td>
                          <td>Economy</td>
                          <td>200</td>
                          <td>176</td>
                          <td>
                            <div className="flex items-center flex-wrap gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '88%' }} />
                              </div>
                              <span className="text-sm">88%</span>
                            </div>
                          </td>
                          <td>High Demand</td>
                          <td>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="font-medium">JFK-LAX</td>
                          <td>Economy</td>
                          <td>180</td>
                          <td>135</td>
                          <td>
                            <div className="flex items-center flex-wrap gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }} />
                              </div>
                              <span className="text-sm">75%</span>
                            </div>
                          </td>
                          <td>Standard</td>
                          <td>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="font-medium">LHR-CDG</td>
                          <td>Business</td>
                          <td>40</td>
                          <td>32</td>
                          <td>
                            <div className="flex items-center flex-wrap gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }} />
                              </div>
                              <span className="text-sm">80%</span>
                            </div>
                          </td>
                          <td>Standard</td>
                          <td>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* PNR Split Dialog */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Split PNR - {selectedPNR?.pnrNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select passengers to create separate PNRs. Each group will become a new PNR.
            </p>
            <div className="space-y-3">
              {selectedPNR?.passengers.map((p, idx) => (
                <div key={idx} className="flex items-center flex-wrap gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id={`pax-${idx}`}
                    checked={splitPassengerGroups.some(g => g.includes(idx))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSplitPassengerGroups([[idx]])
                      } else {
                        setSplitPassengerGroups(splitPassengerGroups.filter(g => !g.includes(idx)))
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`pax-${idx}`} className="font-medium">
                      {p.title} {p.firstName} {p.lastName}
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      DOB: {p.dateOfBirth} | Passport: {p.passportNumber}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {splitPassengerGroups.length === 0 && (
              <p className="text-sm text-amber-600 flex items-center flex-wrap gap-2">
                <AlertTriangle className="h-4 w-4" />
                Select at least one passenger to split
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowSplitDialog(false); setSplitPassengerGroups([]); }}>
              Cancel
            </Button>
            <Button onClick={handleSplitPNR} disabled={splitPassengerGroups.length === 0}>
              Split PNR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PNR Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Merge Multiple PNRs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select 2 or more PNRs to merge into a single PNR. All passengers and segments will be combined.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pnrs.filter(p => p.status !== 'cancelled').map((pnr) => (
                <div key={pnr.pnrNumber} className="flex items-center flex-wrap gap-3 p-3 border rounded-lg">
                  <Checkbox
                    id={`pnr-${pnr.pnrNumber}`}
                    checked={selectedPNRsForMerge.includes(pnr.pnrNumber)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPNRsForMerge([...selectedPNRsForMerge, pnr.pnrNumber])
                      } else {
                        setSelectedPNRsForMerge(selectedPNRsForMerge.filter(n => n !== pnr.pnrNumber))
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`pnr-${pnr.pnrNumber}`} className="font-medium">
                      {pnr.pnrNumber}
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      {pnr.passengers.length} passengers | {pnr.segments.length} segments | ${pnr.fareQuote.total}
                    </div>
                  </div>
                  <Badge variant={pnr.status === 'confirmed' ? 'default' : 'secondary'}>
                    {pnr.status}
                  </Badge>
                </div>
              ))}
            </div>
            {selectedPNRsForMerge.length < 2 && (
              <p className="text-sm text-amber-600 flex items-center flex-wrap gap-2">
                <AlertTriangle className="h-4 w-4" />
                Select at least 2 PNRs to merge
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowMergeDialog(false); setSelectedPNRsForMerge([]); }}>
              Cancel
            </Button>
            <Button onClick={handleMergePNRs} disabled={selectedPNRsForMerge.length < 2}>
              Merge PNRs ({selectedPNRsForMerge.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fare Re-quote Dialog */}
      <Dialog open={showRequoteDialog} onOpenChange={setShowRequoteDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fare Re-quote - {selectedPNR?.pnrNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!requoteResult ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Recalculate fare based on current demand and availability.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <Label className="text-muted-foreground">Current Fare</Label>
                    <p className="text-2xl font-bold">${selectedPNR?.fareQuote.total}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Route</Label>
                    <p className="font-medium">
                      {selectedPNR?.segments.map(s => `${s.origin}-${s.destination}`).join(' → ')}
                    </p>
                  </div>
                </div>
                <Button onClick={handleRequoteFare} className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Calculate New Fare
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <Label className="text-muted-foreground">Original Fare</Label>
                    <p className="text-2xl font-bold">${requoteResult.originalFare}</p>
                  </div>
                  <div className={`p-4 rounded-lg ${requoteResult.fareDifference > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <Label className="text-muted-foreground">New Fare</Label>
                    <p className="text-2xl font-bold">${requoteResult.newFare}</p>
                    <div className={`text-sm font-medium mt-1 ${requoteResult.fareDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {requoteResult.fareDifference > 0 ? '+' : ''}${requoteResult.fareDifference}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">{requoteResult.reason}</p>
                  <div className="text-xs text-blue-700 mt-2">
                    Demand Factor: {requoteResult.demandFactor.toFixed(1)}% | Time to Departure: {requoteResult.timeToDeparture.toFixed(0)} days
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Base Fare</Label>
                    <p>${requoteResult.breakdown.originalBaseFare} → ${requoteResult.breakdown.newBaseFare}</p>
                  </div>
                  <div>
                    <Label>Taxes</Label>
                    <p>${requoteResult.breakdown.originalTaxes} → ${requoteResult.breakdown.newTaxes}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    if (selectedPNR) {
                      updatePNR(selectedPNR.pnrNumber, {
                        fareQuote: {
                          ...selectedPNR.fareQuote,
                          baseFare: requoteResult.breakdown.newBaseFare,
                          taxes: requoteResult.breakdown.newTaxes,
                          total: requoteResult.newFare
                        },
                        remarks: [
                          ...selectedPNR.remarks,
                          `Fare re-quoted: ${requoteResult.originalFare} → ${requoteResult.newFare}`
                        ]
                      })
                    }
                    setShowRequoteDialog(false)
                    setRequoteResult(null)
                  }}
                  className="w-full"
                >
                  Apply New Fare
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRequoteDialog(false); setRequoteResult(null); }}>
              {requoteResult ? 'Back' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Queue Assignment Dialog */}
      <Dialog open={showQueueDialog} onOpenChange={setShowQueueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Queue Position - {selectedPNR?.pnrNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Assign a queue priority (1 = highest, 10 = lowest)
            </p>
            <div className="space-y-4">
              <div>
                <Label>Current Queue Position: {selectedPNR?.queuePosition || 'Not assigned'}</Label>
              </div>
              <div>
                <Label>New Queue Position: {queuePriority}</Label>
                <Slider
                  value={[queuePriority]}
                  onValueChange={(value) => setQueuePriority(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 (Highest)</span>
                  <span>5 (Medium)</span>
                  <span>10 (Lowest)</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQueueDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignQueue}>
              Assign Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waitlist Processing Dialog */}
      <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Waitlist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Flight Number</Label>
                <Input
                  placeholder="AA123"
                  value={waitlistFlight.flightNumber}
                  onChange={(e) => setWaitlistFlight({ ...waitlistFlight, flightNumber: e.target.value })}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={waitlistFlight.date}
                  onChange={(e) => setWaitlistFlight({ ...waitlistFlight, date: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Current Waitlist ({pnrs.filter(p => p.status === 'waitlist').length} PNRs)</h4>
              <div className="overflow-y-auto h-48">
                {pnrs.filter(p => p.status === 'waitlist').map((pnr) => (
                  <div key={pnr.pnrNumber} className="p-2 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{pnr.pnrNumber}</span>
                      <Badge variant="secondary">Position {pnr.queuePosition || 'N/A'}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pnr.passengers.length} passengers | {pnr.segments[0]?.origin} → {pnr.segments[0]?.destination}
                    </div>
                  </div>
                ))}
                {pnrs.filter(p => p.status === 'waitlist').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No PNRs on waitlist</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 flex items-center flex-wrap gap-2">
                <AlertTriangle className="h-4 w-4" />
                Processing will promote eligible waitlisted PNRs to confirmed status based on available inventory
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWaitlistDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessWaitlist}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Process Waitlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              {selectedODRoute && `${selectedODRoute.origin} → ${selectedODRoute.destination} • $${selectedODRoute.totalPrice} per person`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedODRoute && (
              <>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="font-medium mb-3">Selected Route Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route:</span>
                      <span>{selectedODRoute.origin} → {selectedODRoute.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stops:</span>
                      <span>{selectedODRoute.stops} {selectedODRoute.stops === 1 ? 'stop' : 'stops'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(selectedODRoute.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flight(s):</span>
                      <span>{selectedODRoute.segments.map(s => s.flightNumber).join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Classes:</span>
                      <span>{selectedODRoute.availableFareClasses.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Number of Passengers</Label>
                    <Input
                      type="number"
                      min="1"
                      max="9"
                      value={bookingForm.passengers}
                      onChange={(e) => setBookingForm({ ...bookingForm, passengers: parseInt(e.target.value) || 1 })}
                      className={errors.passengers ? 'border-red-500' : ''}
                    />
                    {errors.passengers && (
                      <p className="text-xs text-red-500 mt-1">{errors.passengers}</p>
                    )}
                  </div>
                  <div>
                    <Label>Cabin Class</Label>
                    <Select 
                      value={bookingForm.cabinClass} 
                      onValueChange={(v: any) => setBookingForm({ ...bookingForm, cabinClass: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="first">First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fare Class</Label>
                    <Select 
                      value={bookingForm.fareClass} 
                      onValueChange={(v: any) => setBookingForm({ ...bookingForm, fareClass: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedODRoute.availableFareClasses.map(fc => (
                          <SelectItem key={fc} value={fc}>{fc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {errors.origin && (
                  <p className="text-xs text-red-500">{errors.origin}</p>
                )}
                {errors.destination && (
                  <p className="text-xs text-red-500">{errors.destination}</p>
                )}
                {errors.date && (
                  <p className="text-xs text-red-500">{errors.date}</p>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Price Information</AlertTitle>
                  <AlertDescription>
                    Total Price: <strong>${(selectedODRoute.totalPrice * bookingForm.passengers).toLocaleString()}</strong> for {bookingForm.passengers} passenger(s)
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBooking} disabled={!selectedODRoute || isSubmitting}>
              {isSubmitting && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Booking...' : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Complete Booking
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SSR Management Dialog */}
      <Dialog open={showSSRDialog} onOpenChange={setShowSSRDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>SSR Management - {passengers[selectedPassengerSSR || 0]?.firstName} {passengers[selectedPassengerSSR || 0]?.lastName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-medium mb-2">Available SSRs</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { code: 'VGML', name: 'Vegetarian Meal', price: 0 },
                  { code: 'MLML', name: 'Muslim Meal', price: 0 },
                  { code: 'SFML', name: 'Seafood Meal', price: 0 },
                  { code: 'KSML', name: 'Kosher Meal', price: 0 },
                  { code: 'BLND', name: 'Blind Passenger', price: 0 },
                  { code: 'DEAF', name: 'Deaf Passenger', price: 0 },
                  { code: 'WCHR', name: 'Wheelchair', price: 0 },
                  { code: 'EXST', name: 'Extra Seat', price: 150 },
                  { code: 'PETC', name: 'Pet in Cabin', price: 75 },
                  { code: 'UMNR', name: 'Unaccompanied Minor', price: 100 }
                ].map(ssr => (
                  <Button
                    key={ssr.code}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSSR(ssr.code, ssr.name, ssr.price)}
                    className="justify-start"
                  >
                    <span className="font-mono font-bold mr-2">{ssr.code}</span>
                    {ssr.name}
                    {ssr.price > 0 && <span className="ml-auto text-sm">+${ssr.price}</span>}
                  </Button>
                ))}
              </div>
            </div>
            
            {selectedPassengerSSR !== null && passengers[selectedPassengerSSR].ssr && passengers[selectedPassengerSSR].ssr!.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Current SSRs</h4>
                <div className="space-y-2">
                  {passengers[selectedPassengerSSR].ssr!.map(ssr => (
                    <div key={ssr.code} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                      <div className="flex items-center flex-wrap gap-2">
                        <Badge variant="outline" className="font-mono">{ssr.code}</Badge>
                        <span className="text-sm">{ssr.name}</span>
                        {ssr.price > 0 && <span className="text-sm text-muted-foreground">(${ssr.price})</span>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveSSR(ssr.code)}>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSSRDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fare Rules Dialog */}
      <Dialog open={showFareRulesDialog} onOpenChange={setShowFareRulesDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fare Rule Validation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {fareRuleViolations.length === 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center flex-wrap gap-2 text-green-900">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">All fare rules validated successfully!</span>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center flex-wrap gap-2 text-red-900 mb-2">
                    <XCircle className="h-5 w-5" />
                    <span className="font-medium">{fareRuleViolations.length} fare rule violation(s) found</span>
                  </div>
                  <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                    {fareRuleViolations.map((violation, idx) => (
                      <li key={idx}>{violation}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div>
              <h4 className="font-medium mb-2">Applicable Fare Rules</h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-secondary/20 rounded">
                  <span className="font-medium">Advance Purchase:</span> {fareClasses.find(fc => fc.code === segments[0]?.fareClass)?.restrictions?.advancePurchase || 0} days
                </div>
                <div className="p-2 bg-secondary/20 rounded">
                  <span className="font-medium">Minimum Stay:</span> {fareClasses.find(fc => fc.code === segments[0]?.fareClass)?.restrictions?.minStay || 0} days
                </div>
                <div className="p-2 bg-secondary/20 rounded">
                  <span className="font-medium">Maximum Stay:</span> {fareClasses.find(fc => fc.code === segments[0]?.fareClass)?.restrictions?.maxStay || 0} days
                </div>
                <div className="p-2 bg-secondary/20 rounded">
                  <span className="font-medium">Refundable:</span> {segments[0]?.fareClass === 'Y' || segments[0]?.fareClass === 'F' ? 'Yes' : 'No'}
                </div>
                <div className="p-2 bg-secondary/20 rounded">
                  <span className="font-medium">Changes Allowed:</span> {segments[0]?.fareClass === 'Y' || segments[0]?.fareClass === 'B' ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowFareRulesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Limit Dialog */}
      <Dialog open={showTimeLimitDialog} onOpenChange={setShowTimeLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Time Limit - {selectedPNR?.pnrNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Current Time Limit</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedPNR?.timeLimit || 'No time limit set'}
              </p>
            </div>
            <div>
              <Label>New Time Limit</Label>
              <Input
                type="datetime-local"
                value={newTimeLimit}
                onChange={(e) => setNewTimeLimit(e.target.value)}
              />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900 flex items-center flex-wrap gap-2">
                <Clock className="h-4 w-4" />
                Extending time limit gives customer more time to complete payment
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimeLimitDialog(false)}>Cancel</Button>
            <Button onClick={handleExtendTimeLimit} disabled={!newTimeLimit}>Extend Time Limit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Married Segments Dialog */}
      <Dialog open={showMarriedSegmentsDialog} onOpenChange={setShowMarriedSegmentsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Married Segment Validation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center flex-wrap gap-2 text-green-900">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Segments validated as married segments!</span>
              </div>
            </div>
            
            <div>
              <Label>Married Segment Key</Label>
              <Input value={marriedSegmentKey} readOnly className="mt-1 font-mono" />
            </div>

            <div>
              <h4 className="font-medium mb-2">Segment Details</h4>
              <div className="space-y-2">
                {segments.map((seg, idx) => (
                  <div key={seg.id || idx} className="p-2 bg-secondary/20 rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Segment {idx + 1}: {seg.flightNumber}</span>
                      <Badge variant="outline">{seg.fareClass}</Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {seg.origin} → {seg.destination} | {seg.departureDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <Layers className="h-4 w-4 inline mr-1" />
                Married segments must be booked, cancelled, and modified together
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowMarriedSegmentsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remarks Dialog */}
      <Dialog open={showRemarksDialog} onOpenChange={setShowRemarksDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Booking Remark - {selectedPNR?.pnrNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Remark Category</Label>
              <Select value={remarkCategory} onValueChange={setRemarkCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal (Airline Only)</SelectItem>
                  <SelectItem value="external">External (Visible to Customer)</SelectItem>
                  <SelectItem value="os">Other Service Info</SelectItem>
                  <SelectItem value="rm">Remark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remark Text</Label>
              <Textarea
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter remark..."
                className="mt-1"
                rows={3}
              />
            </div>

            {selectedPNR && selectedPNR.remarks.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Existing Remarks</h4>
                <div className="overflow-y-auto h-32">
                  {selectedPNR.remarks.map((remark, idx) => (
                    <div key={idx} className="p-2 border-b last:border-0 text-sm">
                      {remark}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemarksDialog(false)}>Cancel</Button>
            <Button onClick={handleAddRemark} disabled={!newRemark.trim()}>Add Remark</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Corporate Booking Dialog */}
      <Dialog open={showCorporateDialog} onOpenChange={setShowCorporateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Corporate Booking Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Select Corporate Account</Label>
              <Select value={selectedCorporateAccount} onValueChange={handleSelectCorporateAccount}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select account..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CORP001">Acme Corp (15% discount)</SelectItem>
                  <SelectItem value="CORP002">Tech Global (12% discount)</SelectItem>
                  <SelectItem value="CORP003">Travel Solutions (10% discount)</SelectItem>
                  <SelectItem value="CORP004">Global Enterprises (20% discount)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCorporateAccount && (
              <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900">Corporate Benefits</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 10-20% fare discount</li>
                  <li>• No advance purchase required</li>
                  <li>• Full refundable tickets</li>
                  <li>• Free seat selection</li>
                  <li>• Priority boarding</li>
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCorporateDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowCorporateDialog(false)}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Booking Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Group Booking Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Enable Group Booking</Label>
              <Switch checked={isGroupBooking} onCheckedChange={handleToggleGroupBooking} />
            </div>

            {isGroupBooking && (
              <>
                <div>
                  <Label>Group Name</Label>
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="e.g., Company Retreat 2024"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Number of Passengers</Label>
                  <p className="text-sm text-muted-foreground mt-1">{passengers.length} passengers</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900">Group Discount Applied</span>
                    <Badge variant="default">{groupBookingDiscount}% OFF</Badge>
                  </div>
                  <p className="text-sm text-green-800">
                    {passengers.length >= 50 ? '50+ passengers: 20% discount' :
                      passengers.length >= 20 ? '20-49 passengers: 15% discount' :
                      passengers.length >= 10 ? '10-19 passengers: 10% discount' :
                      'Minimum 10 passengers for group discount'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Group Fare Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Name changes allowed until 7 days before departure</li>
                    <li>• 25% deposit required at booking</li>
                    <li>• Full payment due 30 days before departure</li>
                    <li>• Cancellation fees apply after deposit</li>
                  </ul>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupDialog(false)}>Cancel</Button>
            <Button onClick={() => setShowGroupDialog(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EMD Management Dialog */}
      <Dialog open={showEMDDialog} onOpenChange={setShowEMDDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>EMD (Electronic Miscellaneous Document)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedEMD ? (
              <div className="space-y-3">
                <div>
                  <Label>EMD Number</Label>
                  <Input value={selectedEMD.emdNumber} readOnly className="mt-1 font-mono" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Passenger</Label>
                    <p className="text-sm mt-1">{selectedEMD.passengerName}</p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="text-sm mt-1 font-medium">${selectedEMD.amount} {selectedEMD.currency}</p>
                  </div>
                </div>
                <div>
                  <Label>Reason</Label>
                  <p className="text-sm mt-1">{selectedEMD.reason}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedEMD.status === 'open' ? 'default' : 'secondary'} className="mt-1 capitalize">
                    {selectedEMD.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No EMD selected</p>
            )}

            {selectedTicket && (
              <Button onClick={handleIssueEMD} className="w-full">
                <Receipt className="h-4 w-4 mr-2" />
                Issue New EMD for {selectedTicket.passengerName}
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEMDDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ================= VALIDATION FUNCTIONS =================

const validatePNRForm = (): boolean => {
  const errors: Record<string, string> = {}

  // Validate passengers
  if (passengers.length === 0) {
    errors.passengers = 'At least one passenger is required'
  }

  // Validate segments
  if (segments.length === 0) {
    errors.segments = 'At least one flight segment is required'
  }

  // Validate each passenger
  passengers.forEach((pax, index) => {
    if (!pax.firstName || !pax.lastName) {
      errors[`passenger-${index}-name`] = `${pax.firstName ? 'First name is required' : 'Last name is required'}`
    }
    if (!pax.dateOfBirth || !pax.passportNumber) {
      errors[`passenger-${index}-docs`] = 'Date of birth and passport are required'
    }
    if (!pax.nationality) {
      errors[`passenger-${index}-nationality`] = 'Nationality is required'
    }
  })

  // Validate segments
  segments.forEach((seg, index) => {
    if (!seg.flightNumber || !seg.origin || !seg.destination) {
      errors[`segment-${index}-details`] = 'All flight details are required'
    }
  })

  return Object.keys(errors).length === 0
}

const validateBookingForm = (): boolean => {
  const errors: Record<string, string> = {}

  if (!bookingForm.origin || !bookingForm.destination) {
    errors.origin = 'Origin and destination are required'
  }
  if (!bookingForm.date) {
    errors.date = 'Travel date is required'
  }
  if (bookingForm.passengers < 1) {
    errors.passengers = 'At least 1 passenger is required'
  }
  if (bookingForm.passengers > 9) {
    errors.passengers = 'Maximum 9 passengers per booking'
  }

  return Object.keys(errors).length === 0
}

const validateFareClassForm = (): boolean => {
  const errors: Record<string, string> = {}

  if (!newFareClass.code || !newFareClass.name) {
    errors.code = 'Fare class code is required'
    errors.name = 'Fare class name is required'
  }
  if (!newFareClass.hierarchy || newFareClass.hierarchy < 1 || newFareClass.hierarchy > 13) {
    errors.hierarchy = 'Hierarchy must be between 1 and 13'
  }
  if (!newFareClass.capacity || newFareClass.capacity < 1 || newFareClass.capacity > 500) {
    errors.capacity = 'Capacity must be between 1 and 500'
  }
  if (!newFareClass.price || newFareClass.price <= 0) {
    errors.price = 'Price must be greater than 0'
  }

  return Object.keys(errors).length === 0
}

// ================== END VALIDATION =================

