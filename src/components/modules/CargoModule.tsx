'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  FileText, 
  Box, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Weight,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Truck,
  Plane,
  ArrowRight,
  MapPin,
  Clock,
  Thermometer,
  ShieldAlert,
  Activity,
  BarChart3,
  FileCheck,
  Receipt,
  AlertCircle,
  MoreHorizontal,
  XCircle,
  CheckSquare,
  Square,
  Printer,
  Share2,
  History,
  Wrench,
  AlertOctagon
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

// Extended interfaces for Cargo features
interface CargoBookingWorkflow {
  id: string
  awbNumber: string
  status: 'pending' | 'confirmed' | 'accepted' | 'rejected' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled'
  workflowStep: 'booking' | 'acceptance' | 'documentation' | 'loading' | 'transit' | 'unloading' | 'delivery' | 'completed'
  shipper: {
    name: string
    address: string
    contact: string
    email: string
    phone: string
  }
  consignee: {
    name: string
    address: string
    contact: string
    email: string
    phone: string
  }
  flightDetails: {
    flightNumber: string
    date: string
    origin: string
    destination: string
    routing: string[]
    etd: string
    eta: string
  }
  goods: {
    description: string
    pieces: number
    weight: number
    volume: number
    weightUnit: 'kg' | 'lb'
    dangerousGoods: boolean
    perishable: boolean
    temperatureControlled: boolean
    specialHandling: string[]
    declaredValue: number
    hsCode: string
  }
  charges: {
    freight: number
    fuel: number
    security: number
    handling: number
    other: number
    total: number
    currency: string
  }
  documents: {
    awbIssued: boolean
    commercialInvoice: boolean
    certificateOfOrigin: boolean
    dangerousGoodsDeclaration: boolean
    phytosanitary: boolean
  }
  history: WorkflowHistory[]
  createdAt: string
  updatedAt: string
}

interface WorkflowHistory {
  id: string
  timestamp: string
  action: string
  status: string
  performedBy: string
  notes?: string
}

interface ULDTracking {
  id: string
  uldNumber: string
  type: 'AKE' | 'AKE' | 'DPE' | 'ALP' | 'AAP' | 'AGA' | 'AAU' | 'AKE'
  owner: string
  status: 'available' | 'loaded' | 'in_transit' | 'unloaded' | 'damaged' | 'maintenance' | 'lost'
  location: string
  currentFlight?: string
  contents: {
    awbNumbers: string[]
    totalPieces: number
    totalWeight: number
  }
  specifications: {
    tareWeight: number
    maxGrossWeight: number
    internalVolume: number
    dimensions: {
      length: number
      width: number
      height: number
    }
  }
  damage?: {
    type: string
    description: string
    reportedDate: string
    reportedBy: string
    severity: 'minor' | 'moderate' | 'major'
    repaired: boolean
  }
  movements: ULDMovement[]
  lastInspection: string
  nextInspection: string
}

interface ULDMovement {
  id: string
  timestamp: string
  fromLocation: string
  toLocation: string
  flightNumber?: string
  type: 'loading' | 'unloading' | 'transfer' | 'return'
  performedBy: string
}

interface CargoRevenue {
  id: string
  awbNumber: string
  bookingId: string
  amount: number
  currency: string
  status: 'pending' | 'invoiced' | 'paid' | 'overdue' | 'cancelled'
  invoiceNumber?: string
  invoiceDate?: string
  dueDate: string
  paidDate?: string
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'check' | 'cash' | 'account'
  charges: {
    freight: number
    fuelSurcharge: number
    securityFee: number
    handlingFee: number
    customsFee: number
    otherCharges: number
    tax: number
  }
  discount: {
    amount: number
    reason: string
  }
  appliedRates: {
    ratePerKg: number
    minimumCharge: number
    weightChargeable: number
  }
  createdAt: string
  updatedAt: string
}

export default function CargoModule() {
  const { cargoBookings, ulds, createCargoBooking, pendingAction, setPendingAction } = useAirlineStore()
  const { toast } = useToast()
  
  // Handle pending actions from App header
  useEffect(() => {
    if (pendingAction) {
      switch (pendingAction.action) {
        case 'new':
          setShowBookingDialog(true)
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

  const handleExportData = () => {
    const headers = ['AWB', 'Shipper', 'Consignee', 'Origin', 'Destination', 'Weight', 'Status']
    const rows = cargoBookings.map(b => [
      b.awbNumber, b.shipper.name, b.consignee.name, 
      b.flightDetails.origin, b.flightDetails.destination,
      b.goods.weight, b.status
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'cargo-export.csv'
    link.click()
  }

  // Booking Workflow state
  const [bookings, setBookings] = useState<CargoBookingWorkflow[]>([])
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<CargoBookingWorkflow | null>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'in_transit' | 'delivered'>('all')
  
  // ULD Tracking state
  const [uldTrackings, setUldTrackings] = useState<ULDTracking[]>([])
  const [showULDDialog, setShowULDDialog] = useState(false)
  const [selectedULD, setSelectedULD] = useState<ULDTracking | null>(null)
  const [showULDDetails, setShowULDDetails] = useState(false)
  const [showDamageDialog, setShowDamageDialog] = useState(false)
  const [uldFilter, setUldFilter] = useState<'all' | 'available' | 'loaded' | 'in_transit' | 'damaged'>('all')
  
  // Revenue state
  const [revenues, setRevenues] = useState<CargoRevenue[]>([])
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [selectedRevenue, setSelectedRevenue] = useState<CargoRevenue | null>(null)
  const [revenueFilter, setRevenueFilter] = useState<'all' | 'pending' | 'invoiced' | 'paid' | 'overdue'>('all')
  
  // Form states
  const [newBooking, setNewBooking] = useState({
    awbNumber: '',
    shipperName: '',
    shipperContact: '',
    shipperEmail: '',
    consigneeName: '',
    consigneeContact: '',
    consigneeEmail: '',
    flightNumber: '',
    origin: '',
    destination: '',
    pieces: 0,
    weight: 0,
    volume: 0,
    description: '',
    dangerousGoods: false,
    perishable: false,
    temperatureControlled: false,
    declaredValue: 0,
    hsCode: ''
  })
  
  const [damageReport, setDamageReport] = useState({
    type: '',
    description: '',
    severity: 'minor' as 'minor' | 'moderate' | 'major'
  })
  
  const initializedRef = useRef(false)

  // Initialize mock data functions
  const initializeBookings = () => {
    const bookingData: CargoBookingWorkflow[] = [
      {
        id: 'cb-001',
        awbNumber: '176-12345678',
        status: 'in_transit',
        workflowStep: 'transit',
        shipper: {
          name: 'ABC Electronics Ltd',
          address: '123 Tech Park, Singapore',
          contact: 'John Tan',
          email: 'john@abcelectronics.com',
          phone: '+65 6789 0123'
        },
        consignee: {
          name: 'Tech Solutions Inc',
          address: '456 Innovation Dr, San Francisco, CA',
          contact: 'Sarah Johnson',
          email: 'sarah@techsolutions.com',
          phone: '+1 415 555 0123'
        },
        flightDetails: {
          flightNumber: 'SQ123',
          date: '2024-01-18',
          origin: 'SIN',
          destination: 'SFO',
          routing: ['SIN', 'HKG', 'SFO'],
          etd: '2024-01-18T23:30:00Z',
          eta: '2024-01-19T15:45:00Z'
        },
        goods: {
          description: 'Electronic components - Class 9',
          pieces: 50,
          weight: 450,
          volume: 2.5,
          weightUnit: 'kg',
          dangerousGoods: false,
          perishable: false,
          temperatureControlled: false,
          specialHandling: ['fragile', 'high_value'],
          declaredValue: 125000,
          hsCode: '85423100'
        },
        charges: {
          freight: 2450,
          fuel: 320,
          security: 85,
          handling: 120,
          other: 0,
          total: 2975,
          currency: 'USD'
        },
        documents: {
          awbIssued: true,
          commercialInvoice: true,
          certificateOfOrigin: true,
          dangerousGoodsDeclaration: false,
          phytosanitary: false
        },
        history: [
          { id: 'wh-001', timestamp: '2024-01-17T10:00:00Z', action: 'Booking Created', status: 'pending', performedBy: 'system' },
          { id: 'wh-002', timestamp: '2024-01-17T11:30:00Z', action: 'Booking Confirmed', status: 'confirmed', performedBy: 'cargo_agent' },
          { id: 'wh-003', timestamp: '2024-01-18T20:00:00Z', action: 'Documentation Complete', status: 'accepted', performedBy: 'documentation' },
          { id: 'wh-004', timestamp: '2024-01-18T22:00:00Z', action: 'Cargo Loaded', status: 'in_transit', performedBy: 'ramp_agent' }
        ],
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-18T22:00:00Z'
      },
      {
        id: 'cb-002',
        awbNumber: '176-87654321',
        status: 'delivered',
        workflowStep: 'completed',
        shipper: {
          name: 'Fresh Produce Co',
          address: '789 Farm Road, Kenya',
          contact: 'James Omondi',
          email: 'james@freshproduce.co.ke',
          phone: '+254 712 345 678'
        },
        consignee: {
          name: 'Global Foods Ltd',
          address: '321 Market St, London, UK',
          contact: 'Emma Smith',
          email: 'emma@globalfoods.com',
          phone: '+44 20 7123 4567'
        },
        flightDetails: {
          flightNumber: 'KQ456',
          date: '2024-01-15',
          origin: 'NBO',
          destination: 'LHR',
          routing: ['NBO', 'LHR'],
          etd: '2024-01-15T06:00:00Z',
          eta: '2024-01-15T14:30:00Z'
        },
        goods: {
          description: 'Fresh flowers - Temperature controlled',
          pieces: 200,
          weight: 800,
          volume: 6.0,
          weightUnit: 'kg',
          dangerousGoods: false,
          perishable: true,
          temperatureControlled: true,
          specialHandling: ['perishable', 'temperature_controlled'],
          declaredValue: 45000,
          hsCode: '06031100'
        },
        charges: {
          freight: 3200,
          fuel: 450,
          security: 120,
          handling: 180,
          other: 50,
          total: 4000,
          currency: 'USD'
        },
        documents: {
          awbIssued: true,
          commercialInvoice: true,
          certificateOfOrigin: true,
          dangerousGoodsDeclaration: false,
          phytosanitary: true
        },
        history: [
          { id: 'wh-005', timestamp: '2024-01-14T08:00:00Z', action: 'Booking Created', status: 'pending', performedBy: 'system' },
          { id: 'wh-006', timestamp: '2024-01-14T09:00:00Z', action: 'Booking Confirmed', status: 'confirmed', performedBy: 'cargo_agent' },
          { id: 'wh-007', timestamp: '2024-01-15T04:00:00Z', action: 'Cargo Loaded', status: 'in_transit', performedBy: 'ramp_agent' },
          { id: 'wh-008', timestamp: '2024-01-15T15:00:00Z', action: 'Cargo Unloaded', status: 'arrived', performedBy: 'ramp_agent' },
          { id: 'wh-009', timestamp: '2024-01-15T17:00:00Z', action: 'Cargo Delivered', status: 'delivered', performedBy: 'delivery_agent' }
        ],
        createdAt: '2024-01-14T08:00:00Z',
        updatedAt: '2024-01-15T17:00:00Z'
      },
      {
        id: 'cb-003',
        awbNumber: '176-11223344',
        status: 'pending',
        workflowStep: 'booking',
        shipper: {
          name: 'ChemCorp International',
          address: '555 Industrial Ave, Germany',
          contact: 'Hans Mueller',
          email: 'hans@chemcorp.de',
          phone: '+49 30 1234 5678'
        },
        consignee: {
          name: 'Pharma Distributors SA',
          address: '888 Blvd du Commerce, Belgium',
          contact: 'Marie Dubois',
          email: 'marie@pharmadist.be',
          phone: '+32 2 345 6789'
        },
        flightDetails: {
          flightNumber: 'LH789',
          date: '2024-01-19',
          origin: 'FRA',
          destination: 'BRU',
          routing: ['FRA', 'BRU'],
          etd: '2024-01-19T10:00:00Z',
          eta: '2024-01-19T11:15:00Z'
        },
        goods: {
          description: 'Chemical reagents - Class 3 Dangerous Goods',
          pieces: 30,
          weight: 600,
          volume: 1.8,
          weightUnit: 'kg',
          dangerousGoods: true,
          perishable: false,
          temperatureControlled: false,
          specialHandling: ['dangerous_goods', 'hazardous'],
          declaredValue: 85000,
          hsCode: '38220000'
        },
        charges: {
          freight: 1800,
          fuel: 240,
          security: 150,
          handling: 200,
          other: 75,
          total: 2465,
          currency: 'USD'
        },
        documents: {
          awbIssued: false,
          commercialInvoice: false,
          certificateOfOrigin: false,
          dangerousGoodsDeclaration: false,
          phytosanitary: false
        },
        history: [
          { id: 'wh-010', timestamp: '2024-01-18T14:00:00Z', action: 'Booking Created', status: 'pending', performedBy: 'system' }
        ],
        createdAt: '2024-01-18T14:00:00Z',
        updatedAt: '2024-01-18T14:00:00Z'
      }
    ]
    setBookings(bookingData)
  }

  const initializeULDTrackings = () => {
    const uldData: ULDTracking[] = [
      {
        id: 'uld-001',
        uldNumber: 'AKE12345AA',
        type: 'AKE',
        owner: 'SQ',
        status: 'in_transit',
        location: 'In Flight - SQ123',
        currentFlight: 'SQ123',
        contents: {
          awbNumbers: ['176-12345678'],
          totalPieces: 50,
          totalWeight: 450
        },
        specifications: {
          tareWeight: 85,
          maxGrossWeight: 1588,
          internalVolume: 4.3,
          dimensions: { length: 153, width: 156, height: 163 }
        },
        movements: [
          { id: 'm-001', timestamp: '2024-01-18T20:00:00Z', fromLocation: 'SIN Cargo Terminal', toLocation: 'SQ123', flightNumber: 'SQ123', type: 'loading', performedBy: 'ramp_agent_s' },
          { id: 'm-002', timestamp: '2024-01-18T22:30:00Z', fromLocation: 'SIN', toLocation: 'HKG', flightNumber: 'SQ123', type: 'transfer', performedBy: 'system' }
        ],
        lastInspection: '2024-01-15',
        nextInspection: '2024-04-15'
      },
      {
        id: 'uld-002',
        uldNumber: 'AKE67890BB',
        type: 'AKE',
        owner: 'SQ',
        status: 'available',
        location: 'SIN Cargo Terminal - Bay 12',
        contents: {
          awbNumbers: [],
          totalPieces: 0,
          totalWeight: 0
        },
        specifications: {
          tareWeight: 85,
          maxGrossWeight: 1588,
          internalVolume: 4.3,
          dimensions: { length: 153, width: 156, height: 163 }
        },
        movements: [
          { id: 'm-003', timestamp: '2024-01-18T14:00:00Z', fromLocation: 'SQ456', toLocation: 'SIN Cargo Terminal', flightNumber: 'SQ456', type: 'unloading', performedBy: 'ramp_agent_s' }
        ],
        lastInspection: '2024-01-10',
        nextInspection: '2024-04-10'
      },
      {
        id: 'uld-003',
        uldNumber: 'DPE11111CC',
        type: 'DPE',
        owner: 'LH',
        status: 'damaged',
        location: 'FRA Maintenance Facility',
        contents: {
          awbNumbers: [],
          totalPieces: 0,
          totalWeight: 0
        },
        specifications: {
          tareWeight: 135,
          maxGrossWeight: 2268,
          internalVolume: 7.1,
          dimensions: { length: 200, width: 153, height: 163 }
        },
        damage: {
          type: 'Structural Damage',
          description: 'Dent on bottom panel - forklift impact',
          reportedDate: '2024-01-17',
          reportedBy: 'ramp_agent_f',
          severity: 'moderate',
          repaired: false
        },
        movements: [
          { id: 'm-004', timestamp: '2024-01-17T16:00:00Z', fromLocation: 'LH789', toLocation: 'FRA Cargo Terminal', flightNumber: 'LH789', type: 'unloading', performedBy: 'ramp_agent_f' },
          { id: 'm-005', timestamp: '2024-01-17T17:00:00Z', fromLocation: 'FRA Cargo Terminal', toLocation: 'FRA Maintenance Facility', type: 'loading', performedBy: 'maintenance' }
        ],
        lastInspection: '2024-01-17',
        nextInspection: '2024-01-24'
      }
    ]
    setUldTrackings(uldData)
  }

  const initializeRevenues = () => {
    const revenueData: CargoRevenue[] = [
      {
        id: 'rev-001',
        awbNumber: '176-12345678',
        bookingId: 'cb-001',
        amount: 2975,
        currency: 'USD',
        status: 'invoiced',
        invoiceNumber: 'INV-2024-012345',
        invoiceDate: '2024-01-17',
        dueDate: '2024-02-16',
        charges: {
          freight: 2450,
          fuelSurcharge: 320,
          securityFee: 85,
          handlingFee: 120,
          customsFee: 0,
          otherCharges: 0,
          tax: 0
        },
        discount: {
          amount: 0,
          reason: ''
        },
        appliedRates: {
          ratePerKg: 5.44,
          minimumCharge: 50,
          weightChargeable: 450
        },
        createdAt: '2024-01-17T11:30:00Z',
        updatedAt: '2024-01-17T11:30:00Z'
      },
      {
        id: 'rev-002',
        awbNumber: '176-87654321',
        bookingId: 'cb-002',
        amount: 4000,
        currency: 'USD',
        status: 'paid',
        invoiceNumber: 'INV-2024-012346',
        invoiceDate: '2024-01-14',
        dueDate: '2024-02-13',
        paidDate: '2024-01-20',
        paymentMethod: 'bank_transfer',
        charges: {
          freight: 3200,
          fuelSurcharge: 450,
          securityFee: 120,
          handlingFee: 180,
          customsFee: 0,
          otherCharges: 50,
          tax: 0
        },
        discount: {
          amount: 100,
          reason: 'Volume discount - 20+ shipments Q4 2023'
        },
        appliedRates: {
          ratePerKg: 4.00,
          minimumCharge: 50,
          weightChargeable: 800
        },
        createdAt: '2024-01-14T09:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z'
      },
      {
        id: 'rev-003',
        awbNumber: '176-99887766',
        bookingId: 'cb-004',
        amount: 1850,
        currency: 'USD',
        status: 'overdue',
        invoiceNumber: 'INV-2024-011990',
        invoiceDate: '2024-01-01',
        dueDate: '2024-01-31',
        charges: {
          freight: 1500,
          fuelSurcharge: 200,
          securityFee: 65,
          handlingFee: 85,
          customsFee: 0,
          otherCharges: 0,
          tax: 0
        },
        discount: {
          amount: 0,
          reason: ''
        },
        appliedRates: {
          ratePerKg: 3.70,
          minimumCharge: 50,
          weightChargeable: 500
        },
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z'
      },
      {
        id: 'rev-004',
        awbNumber: '176-55443322',
        bookingId: 'cb-005',
        amount: 5600,
        currency: 'USD',
        status: 'pending',
        charges: {
          freight: 4500,
          fuelSurcharge: 600,
          securityFee: 200,
          handlingFee: 300,
          customsFee: 0,
          otherCharges: 0,
          tax: 0
        },
        discount: {
          amount: 0,
          reason: ''
        },
        appliedRates: {
          ratePerKg: 5.60,
          minimumCharge: 50,
          weightChargeable: 1000
        },
        createdAt: '2024-01-18T16:00:00Z',
        updatedAt: '2024-01-18T16:00:00Z',
        dueDate: '2024-02-17'
      }
    ]
    setRevenues(revenueData)
  }

  // Initialize all mock data on component mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    setTimeout(() => {
      initializeBookings()
      initializeULDTrackings()
      initializeRevenues()
    }, 0)
  }, [])

  // Handlers for Bookings
  const handleCreateBooking = () => {
    const booking: CargoBookingWorkflow = {
      id: `cb-${Date.now()}`,
      awbNumber: newBooking.awbNumber,
      status: 'pending',
      workflowStep: 'booking',
      shipper: {
        name: newBooking.shipperName,
        address: '',
        contact: newBooking.shipperContact,
        email: newBooking.shipperEmail,
        phone: ''
      },
      consignee: {
        name: newBooking.consigneeName,
        address: '',
        contact: newBooking.consigneeContact,
        email: newBooking.consigneeEmail,
        phone: ''
      },
      flightDetails: {
        flightNumber: newBooking.flightNumber,
        date: new Date().toISOString().split('T')[0],
        origin: newBooking.origin,
        destination: newBooking.destination,
        routing: [newBooking.origin, newBooking.destination],
        etd: '',
        eta: ''
      },
      goods: {
        description: newBooking.description,
        pieces: newBooking.pieces,
        weight: newBooking.weight,
        volume: newBooking.volume,
        weightUnit: 'kg',
        dangerousGoods: newBooking.dangerousGoods,
        perishable: newBooking.perishable,
        temperatureControlled: newBooking.temperatureControlled,
        specialHandling: [],
        declaredValue: newBooking.declaredValue,
        hsCode: newBooking.hsCode
      },
      charges: {
        freight: newBooking.weight * 5,
        fuel: Math.round(newBooking.weight * 0.5),
        security: 85,
        handling: 120,
        other: 0,
        total: 0,
        currency: 'USD'
      },
      documents: {
        awbIssued: false,
        commercialInvoice: false,
        certificateOfOrigin: false,
        dangerousGoodsDeclaration: false,
        phytosanitary: false
      },
      history: [{
        id: `wh-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Booking Created',
        status: 'pending',
        performedBy: 'system'
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    booking.charges.total = booking.charges.freight + booking.charges.fuel + booking.charges.security + booking.charges.handling
    setBookings([...bookings, booking])
    setShowBookingDialog(false)
    setNewBooking({
      awbNumber: '', shipperName: '', shipperContact: '', shipperEmail: '',
      consigneeName: '', consigneeContact: '', consigneeEmail: '',
      flightNumber: '', origin: '', destination: '',
      pieces: 0, weight: 0, volume: 0, description: '',
      dangerousGoods: false, perishable: false, temperatureControlled: false,
      declaredValue: 0, hsCode: ''
    })
  }

  const handleUpdateBookingStatus = (bookingId: string, status: string) => {
    const stepMap: Record<string, any> = {
      'confirmed': 'acceptance',
      'accepted': 'documentation',
      'in_transit': 'transit',
      'arrived': 'unloading',
      'delivered': 'completed'
    }
    
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: status as any,
              workflowStep: stepMap[status] || b.workflowStep,
              history: [...b.history, {
                id: `wh-${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: `Status updated to ${status}`,
                status: status,
                performedBy: 'current_user'
              }],
              updatedAt: new Date().toISOString()
            }
          : b
      )
    )
  }

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, status: 'cancelled' as const, updatedAt: new Date().toISOString() }
            : b
        )
      )
    }
  }

  // Handlers for ULDs
  const handleReportDamage = (uldId: string) => {
    setUldTrackings(prev =>
      prev.map(u =>
        u.id === uldId
          ? {
              ...u,
              status: 'damaged' as const,
              damage: {
                type: damageReport.type,
                description: damageReport.description,
                reportedDate: new Date().toISOString().split('T')[0],
                reportedBy: 'current_user',
                severity: damageReport.severity,
                repaired: false
              },
              movements: [...u.movements, {
                id: `m-${Date.now()}`,
                timestamp: new Date().toISOString(),
                fromLocation: u.location,
                toLocation: 'Maintenance Facility',
                type: 'loading',
                performedBy: 'current_user'
              }]
            }
          : u
      )
    )
    setShowDamageDialog(false)
    setDamageReport({ type: '', description: '', severity: 'minor' })
  }

  const handleRepairULD = (uldId: string) => {
    setUldTrackings(prev =>
      prev.map(u =>
        u.id === uldId && u.damage
          ? {
              ...u,
              status: 'available' as const,
              damage: { ...u.damage, repaired: true }
            }
          : u
      )
    )
  }

  // Handlers for Revenue
  const handleGenerateInvoice = (revenueId: string) => {
    const invoiceNumber = `INV-2024-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`
    setRevenues(prev =>
      prev.map(r =>
        r.id === revenueId
          ? {
              ...r,
              status: 'invoiced' as const,
              invoiceNumber,
              invoiceDate: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString()
            }
          : r
      )
    )
  }

  const handleRecordPayment = (revenueId: string, method: string) => {
    setRevenues(prev =>
      prev.map(r =>
        r.id === revenueId
          ? {
              ...r,
              status: 'paid' as const,
              paidDate: new Date().toISOString().split('T')[0],
              paymentMethod: method as any,
              updatedAt: new Date().toISOString()
            }
          : r
      )
    )
  }

  // Additional handlers for Cargo Module
  const handleExportRevenue = () => {
    const headers = ['Invoice', 'Amount', 'Status', 'Due Date']
    const rows = revenues.map(r => [r.invoiceNumber || '', r.amount, r.status, r.dueDate])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `cargo-revenue-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast({ title: 'Revenue Data Exported', description: 'Revenue data exported to CSV' })
  }

  const handleViewBookingDetails = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      setSelectedBooking(booking)
      setShowBookingDetails(true)
      toast({ title: 'Booking Details', description: `Viewing ${booking.awbNumber}` })
    }
  }

  const handlePrintAWB = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      const printContent = `
        <html><head><title>AWB ${booking.awbNumber}</title>
        <style>body { font-family: Arial; padding: 20px; }</style></head><body>
          <h1>Airwaybill</h1>
          <p><strong>AWB:</strong> ${booking.awbNumber}</p>
          <p><strong>Shipper:</strong> ${booking.shipper.name}</p>
          <p><strong>Consignee:</strong> ${booking.consignee.name}</p>
          <p><strong>Route:</strong> ${booking.flightDetails.origin} → ${booking.flightDetails.destination}</p>
          <p><strong>Weight:</strong> ${booking.goods.weight} kg</p>
        </body></html>
      `
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(printContent)
        win.document.close()
        win.print()
      }
      toast({ title: 'AWB Printed', description: `Printing AWB ${booking.awbNumber}` })
    }
  }

  const handlePrintInvoice = (revenueId: string) => {
    const revenue = revenues.find(r => r.id === revenueId)
    if (revenue) {
      const printContent = `
        <html><head><title>Invoice ${revenue.invoiceNumber}</title>
        <style>body { font-family: Arial; padding: 20px; }</style></head><body>
          <h1>Invoice</h1>
          <p><strong>Invoice #:</strong> ${revenue.invoiceNumber}</p>
          <p><strong>Due Date:</strong> ${revenue.dueDate}</p>
          <p><strong>Amount:</strong> $${revenue.amount}</p>
          <p><strong>Status:</strong> ${revenue.status}</p>
        </body></html>
      `
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(printContent)
        win.document.close()
        win.print()
      }
      toast({ title: 'Invoice Printed', description: `Printing invoice ${revenue.invoiceNumber}` })
    }
  }

  const handleViewULD = (uldId: string) => {
    const uld = uldTrackings.find(u => u.id === uldId)
    if (uld) {
      setSelectedULD(uld)
      setShowULDDetails(true)
      toast({ title: 'ULD Details', description: `${uld.uldNumber} - ${uld.status}` })
    }
  }

  const handleViewBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      setSelectedBooking(booking)
      setShowBookingDetails(true)
    }
  }

  // Utility functions
  const getBookingStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      accepted: 'default',
      in_transit: 'outline',
      arrived: 'outline',
      delivered: 'default',
      cancelled: 'destructive'
    }
    return (
      <Badge variant={(variants[status as keyof typeof variants] || variants.pending) as 'default' | 'destructive' | 'outline' | 'secondary'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getULDStatusBadge = (status: string) => {
    const colors = {
      available: 'bg-green-500',
      loaded: 'bg-blue-500',
      in_transit: 'bg-purple-500',
      unloaded: 'bg-gray-500',
      damaged: 'bg-red-500',
      maintenance: 'bg-yellow-500',
      lost: 'bg-red-600'
    }
    return (
      <Badge className={`${colors[status as keyof typeof colors] || colors.available} capitalize`}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getRevenueStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      invoiced: 'default',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'outline'
    }
    return (
      <Badge variant={(variants[status as keyof typeof variants] || variants.pending) as 'default' | 'destructive' | 'outline' | 'secondary'} className="capitalize">
        {status}
      </Badge>
    )
  }

  // Calculate summary metrics
  const totalWeight = bookings.reduce((sum, b) => sum + b.goods.weight, 0)
  const totalRevenue = revenues.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.amount, 0)
  const pendingRevenue = revenues.filter(r => r.status === 'pending' || r.status === 'invoiced' || r.status === 'overdue').reduce((sum, r) => sum + r.amount, 0)
  const availableULDs = uldTrackings.filter(u => u.status === 'available').length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cargo Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Booking Workflow, ULD Tracking, and Revenue Accounting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            initializeBookings()
            initializeULDTrackings()
            initializeRevenues()
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={() => setShowBookingDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.filter(b => ['pending', 'confirmed', 'accepted', 'in_transit'].includes(b.status)).length}</div>
            <div className="text-xs text-muted-foreground mt-1">of {bookings.length} total</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cargo</CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight.toLocaleString()} kg</div>
            <div className="text-xs text-muted-foreground mt-1">{bookings.reduce((sum, b) => sum + b.goods.pieces, 0)} pieces</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available ULDs</CardTitle>
            <Box className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableULDs}</div>
            <div className="text-xs text-muted-foreground mt-1">of {uldTrackings.length} total</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${(totalRevenue / 1000).toFixed(0)}K</div>
            <div className="text-xs text-muted-foreground mt-1">paid this month</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${(pendingRevenue / 1000).toFixed(0)}K</div>
            <div className="text-xs text-muted-foreground mt-1">to be collected</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="uld">ULD Tracking</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Accounting</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Cargo Bookings</CardTitle>
                  <CardDescription>Manage air waybills and shipment workflow</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={bookingFilter} onValueChange={(v: any) => setBookingFilter(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>AWB Number</th>
                      <th>Route</th>
                      <th>Shipper</th>
                      <th>Consignee</th>
                      <th>Goods</th>
                      <th>Weight</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted-foreground py-8">
                          No cargo bookings
                        </td>
                      </tr>
                    ) : (
                      bookings
                        .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                        .map((booking) => (
                        <tr key={booking.id}>
                          <td className="font-mono font-medium">{booking.awbNumber}</td>
                          <td className="text-sm">
                            <div className="flex items-center gap-1">
                              <span>{booking.flightDetails.origin}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span>{booking.flightDetails.destination}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{booking.flightDetails.flightNumber}</div>
                          </td>
                          <td className="text-sm">
                            <div className="font-medium">{booking.shipper.name}</div>
                            <div className="text-xs text-muted-foreground">{booking.shipper.contact}</div>
                          </td>
                          <td className="text-sm">
                            <div className="font-medium">{booking.consignee.name}</div>
                            <div className="text-xs text-muted-foreground">{booking.consignee.contact}</div>
                          </td>
                          <td className="text-sm">
                            <div>{booking.goods.description.substring(0, 25)}...</div>
                            <div className="flex gap-1 mt-1">
                              {booking.goods.dangerousGoods && <Badge variant="destructive" className="text-xs">DG</Badge>}
                              {booking.goods.perishable && <Badge variant="secondary" className="text-xs">PER</Badge>}
                              {booking.goods.temperatureControlled && <Badge variant="outline" className="text-xs"><Thermometer className="h-3 w-3 inline mr-1" />Temp</Badge>}
                            </div>
                          </td>
                          <td className="text-sm">{booking.goods.weight} kg</td>
                          <td>{getBookingStatusBadge(booking.status)}</td>
                          <td>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedBooking(booking); setShowBookingDetails(true) }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {booking.status === 'pending' && (
                                <Button variant="ghost" size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {booking.status === 'confirmed' && (
                                <Button variant="ghost" size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'accepted')}>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {booking.status === 'accepted' && (
                                <Button variant="ghost" size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'in_transit')}>
                                  <Plane className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              {booking.status === 'in_transit' && (
                                <Button variant="ghost" size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'delivered')}>
                                  <Truck className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {!['delivered', 'cancelled'].includes(booking.status) && (
                                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteBooking(booking.id)}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
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
        </TabsContent>

        {/* ULD Tracking Tab */}
        <TabsContent value="uld">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ULD Tracking</CardTitle>
                  <CardDescription>Track and manage Unit Load Devices</CardDescription>
                </div>
                <Select value={uldFilter} onValueChange={(v: any) => setUldFilter(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="loaded">Loaded</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {uldTrackings.length === 0 ? (
                  <div className="col-span-3 text-center py-12">
                    <Box className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No ULDs tracked</p>
                  </div>
                ) : (
                  uldTrackings
                    .filter(u => uldFilter === 'all' || u.status === uldFilter)
                    .map((uld) => (
                    <Card key={uld.id} className="enterprise-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{uld.uldNumber}</CardTitle>
                            <CardDescription className="text-xs">Type: {uld.type} | Owner: {uld.owner}</CardDescription>
                          </div>
                          {getULDStatusBadge(uld.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <div className="text-muted-foreground">Location</div>
                            <div className="font-medium">{uld.location}</div>
                          </div>
                          {uld.currentFlight && (
                            <div className="text-sm">
                              <div className="text-muted-foreground">Flight</div>
                              <div className="font-medium">{uld.currentFlight}</div>
                            </div>
                          )}
                          {uld.contents.totalPieces > 0 && (
                            <div className="p-2 bg-secondary/20 rounded text-sm">
                              <div className="flex justify-between">
                                <span>AWBs:</span>
                                <span className="font-medium">{uld.contents.awbNumbers.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pieces:</span>
                                <span className="font-medium">{uld.contents.totalPieces}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Weight:</span>
                                <span className="font-medium">{uld.contents.totalWeight} kg</span>
                              </div>
                            </div>
                          )}
                          {uld.damage && !uld.damage.repaired && (
                            <Alert variant="destructive">
                              <AlertOctagon className="h-4 w-4" />
                              <AlertDescription className="text-xs">
                                {uld.damage.type} - {uld.damage.severity}
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="flex gap-1">
                            <Button variant="outline" className="flex-1" size="sm" onClick={() => { setSelectedULD(uld); setShowULDDetails(true) }}>
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            {!uld.damage && (
                              <Button variant="outline" size="sm" onClick={() => { setSelectedULD(uld); setShowDamageDialog(true) }}>
                                <AlertTriangle className="h-4 w-4" />
                              </Button>
                            )}
                            {uld.damage && !uld.damage.repaired && (
                              <Button variant="outline" size="sm" onClick={() => handleRepairULD(uld.id)}>
                                <Wrench className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Accounting Tab */}
        <TabsContent value="revenue">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue Accounting</CardTitle>
                  <CardDescription>Manage invoices and payments</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={revenueFilter} onValueChange={(v: any) => setRevenueFilter(v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="invoiced">Invoiced</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={handleExportRevenue}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>AWB Number</th>
                      <th>Invoice</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Charges</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenues.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No revenue records
                        </td>
                      </tr>
                    ) : (
                      revenues
                        .filter(r => revenueFilter === 'all' || r.status === revenueFilter)
                        .map((revenue) => (
                        <tr key={revenue.id}>
                          <td className="font-mono font-medium">{revenue.awbNumber}</td>
                          <td className="text-sm">{revenue.invoiceNumber || '-'}</td>
                          <td className="font-medium">{revenue.currency} {revenue.amount.toLocaleString()}</td>
                          <td className="text-sm">{new Date(revenue.dueDate).toLocaleDateString()}</td>
                          <td>{getRevenueStatusBadge(revenue.status)}</td>
                          <td className="text-sm">
                            <div className="text-xs space-y-1">
                              <div>Freight: {revenue.currency} {revenue.charges.freight}</div>
                              <div>Fuel: {revenue.currency} {revenue.charges.fuelSurcharge}</div>
                              {revenue.discount.amount > 0 && (
                                <div className="text-green-600">Discount: -{revenue.currency} {revenue.discount.amount}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedRevenue(revenue); setShowInvoiceDialog(true) }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              {revenue.status === 'pending' && (
                                <Button variant="ghost" size="sm" onClick={() => handleGenerateInvoice(revenue.id)}>
                                  <FileCheck className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              {revenue.status === 'invoiced' && (
                                <Button variant="ghost" size="sm" onClick={() => handleRecordPayment(revenue.id, 'bank_transfer')}>
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {revenue.status === 'invoiced' && (
                                <Button variant="ghost" size="sm" onClick={() => handlePrintInvoice(revenue.id)}>
                                  <Printer className="h-4 w-4" />
                                </Button>
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
        </TabsContent>
      </Tabs>

      {/* New Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Cargo Booking</DialogTitle>
            <DialogDescription>Fill in the shipment details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Shipment Information</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Label>AWB Number</Label>
                  <Input value={newBooking.awbNumber} onChange={(e) => setNewBooking({...newBooking, awbNumber: e.target.value})} placeholder="176-12345678" />
                </div>
                <div className="col-span-2">
                  <Label>Goods Description</Label>
                  <Input value={newBooking.description} onChange={(e) => setNewBooking({...newBooking, description: e.target.value})} placeholder="Description of goods" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <Label>Pieces</Label>
                  <Input type="number" value={newBooking.pieces} onChange={(e) => setNewBooking({...newBooking, pieces: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" value={newBooking.weight} onChange={(e) => setNewBooking({...newBooking, weight: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Volume (m³)</Label>
                  <Input type="number" step="0.1" value={newBooking.volume} onChange={(e) => setNewBooking({...newBooking, volume: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Declared Value ($)</Label>
                  <Input type="number" value={newBooking.declaredValue} onChange={(e) => setNewBooking({...newBooking, declaredValue: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>HS Code</Label>
                  <Input value={newBooking.hsCode} onChange={(e) => setNewBooking({...newBooking, hsCode: e.target.value})} placeholder="00000000" />
                </div>
                <div className="flex items-end gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newBooking.dangerousGoods}
                      onCheckedChange={(checked) => setNewBooking({...newBooking, dangerousGoods: checked})}
                    />
                    <Label className="text-sm">Dangerous Goods</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newBooking.perishable}
                      onCheckedChange={(checked) => setNewBooking({...newBooking, perishable: checked})}
                    />
                    <Label className="text-sm">Perishable</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newBooking.temperatureControlled}
                      onCheckedChange={(checked) => setNewBooking({...newBooking, temperatureControlled: checked})}
                    />
                    <Label className="text-sm">Temp Controlled</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Flight Details</h4>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Flight Number</Label>
                  <Input value={newBooking.flightNumber} onChange={(e) => setNewBooking({...newBooking, flightNumber: e.target.value})} placeholder="AA123" />
                </div>
                <div>
                  <Label>Origin</Label>
                  <Input value={newBooking.origin} onChange={(e) => setNewBooking({...newBooking, origin: e.target.value.toUpperCase()})} placeholder="JFK" maxLength={3} />
                </div>
                <div>
                  <Label>Destination</Label>
                  <Input value={newBooking.destination} onChange={(e) => setNewBooking({...newBooking, destination: e.target.value.toUpperCase()})} placeholder="LHR" maxLength={3} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Shipper Information</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={newBooking.shipperName} onChange={(e) => setNewBooking({...newBooking, shipperName: e.target.value})} />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input value={newBooking.shipperContact} onChange={(e) => setNewBooking({...newBooking, shipperContact: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={newBooking.shipperEmail} onChange={(e) => setNewBooking({...newBooking, shipperEmail: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Consignee Information</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={newBooking.consigneeName} onChange={(e) => setNewBooking({...newBooking, consigneeName: e.target.value})} />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input value={newBooking.consigneeContact} onChange={(e) => setNewBooking({...newBooking, consigneeContact: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={newBooking.consigneeEmail} onChange={(e) => setNewBooking({...newBooking, consigneeEmail: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateBooking}>
              <Plus className="h-4 w-4 mr-2" />
              Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details - {selectedBooking?.awbNumber}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getBookingStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <Label>Workflow Step</Label>
                    <div className="text-sm font-medium mt-1 capitalize">{selectedBooking.workflowStep.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <Label>Flight</Label>
                    <div className="text-sm font-medium mt-1">{selectedBooking.flightDetails.flightNumber}</div>
                  </div>
                  <div>
                    <Label>Route</Label>
                    <div className="text-sm font-medium mt-1">{selectedBooking.flightDetails.origin} → {selectedBooking.flightDetails.destination}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Goods Information</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Description</Label>
                      <div className="text-sm font-medium mt-1">{selectedBooking.goods.description}</div>
                    </div>
                    <div>
                      <Label>Pieces</Label>
                      <div className="text-sm font-medium mt-1">{selectedBooking.goods.pieces}</div>
                    </div>
                    <div>
                      <Label>Weight</Label>
                      <div className="text-sm font-medium mt-1">{selectedBooking.goods.weight} {selectedBooking.goods.weightUnit}</div>
                    </div>
                    <div>
                      <Label>Volume</Label>
                      <div className="text-sm font-medium mt-1">{selectedBooking.goods.volume} m³</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    {selectedBooking.goods.dangerousGoods && <Badge variant="destructive">Dangerous Goods</Badge>}
                    {selectedBooking.goods.perishable && <Badge variant="secondary">Perishable</Badge>}
                    {selectedBooking.goods.temperatureControlled && <Badge variant="outline"><Thermometer className="h-3 w-3 inline mr-1" />Temperature Controlled</Badge>}
                    {selectedBooking.goods.specialHandling.map(sh => (
                      <Badge key={sh} variant="outline" className="capitalize">{sh.replace('_', ' ')}</Badge>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Charges</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Freight</div>
                      <div className="text-lg font-bold">{selectedBooking.charges.currency} {selectedBooking.charges.freight.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Fuel Surcharge</div>
                      <div className="text-lg font-bold">{selectedBooking.charges.currency} {selectedBooking.charges.fuel.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-secondary/20 rounded">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-lg font-bold text-green-600">{selectedBooking.charges.currency} {selectedBooking.charges.total.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Documents Status</h4>
                  <div className="grid grid-cols-5 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      {selectedBooking.documents.awbIssued ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                      <span>AWB Issued</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedBooking.documents.commercialInvoice ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                      <span>Commercial Invoice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedBooking.documents.certificateOfOrigin ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                      <span>Certificate of Origin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedBooking.documents.dangerousGoodsDeclaration ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                      <span>DG Declaration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedBooking.documents.phytosanitary ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                      <span>Phytosanitary</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Workflow History</h4>
                  <ScrollArea className="h-48 border rounded-sm p-2">
                    <div className="space-y-2">
                      {selectedBooking.history.map((hist) => (
                        <div key={hist.id} className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{new Date(hist.timestamp).toLocaleString()}</span>
                            <Badge variant="outline" className="text-xs capitalize">{hist.action}</Badge>
                          </div>
                          <div className="ml-5 text-xs text-muted-foreground mt-1">
                            {hist.notes && `Note: ${hist.notes}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDetails(false)}>Close</Button>
            <Button variant="outline" onClick={() => selectedBooking && handlePrintAWB(selectedBooking.id)}>
              <Printer className="h-4 w-4 mr-2" />
              Print AWB
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ULD Details Dialog */}
      <Dialog open={showULDDetails} onOpenChange={setShowULDDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ULD Details - {selectedULD?.uldNumber}</DialogTitle>
          </DialogHeader>
          {selectedULD && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>ULD Number</Label>
                    <div className="text-sm font-medium mt-1">{selectedULD.uldNumber}</div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <div className="text-sm font-medium mt-1">{selectedULD.type}</div>
                  </div>
                  <div>
                    <Label>Owner</Label>
                    <div className="text-sm font-medium mt-1">{selectedULD.owner}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getULDStatusBadge(selectedULD.status)}</div>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <div className="text-sm font-medium mt-1">{selectedULD.location}</div>
                  </div>
                  {selectedULD.currentFlight && (
                    <div>
                      <Label>Current Flight</Label>
                      <div className="text-sm font-medium mt-1">{selectedULD.currentFlight}</div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Specifications</h4>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Tare Weight</div>
                      <div className="font-medium">{selectedULD.specifications.tareWeight} kg</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Max Gross Weight</div>
                      <div className="font-medium">{selectedULD.specifications.maxGrossWeight} kg</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Internal Volume</div>
                      <div className="font-medium">{selectedULD.specifications.internalVolume} m³</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Dimensions</div>
                      <div className="font-medium">{selectedULD.specifications.dimensions.length}×{selectedULD.specifications.dimensions.width}×{selectedULD.specifications.dimensions.height} cm</div>
                    </div>
                  </div>
                </div>

                {selectedULD.contents.totalPieces > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Contents</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">AWBs</div>
                        <div className="font-medium">{selectedULD.contents.awbNumbers.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Pieces</div>
                        <div className="font-medium">{selectedULD.contents.totalPieces}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Weight</div>
                        <div className="font-medium">{selectedULD.contents.totalWeight} kg</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      AWB Numbers: {selectedULD.contents.awbNumbers.join(', ')}
                    </div>
                  </div>
                )}

                {selectedULD.damage && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Damage Report</h4>
                    <Alert variant={selectedULD.damage.repaired ? 'default' : 'destructive'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{selectedULD.damage.type}</div>
                        <div className="text-sm mt-1">{selectedULD.damage.description}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Reported: {selectedULD.damage.reportedDate} by {selectedULD.damage.reportedBy} | 
                          Severity: {selectedULD.damage.severity} |
                          Status: {selectedULD.damage.repaired ? 'Repaired' : 'Pending Repair'}
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Movement History</h4>
                  <ScrollArea className="h-48 border rounded-sm p-2">
                    <div className="space-y-2">
                      {selectedULD.movements.map((movement) => (
                        <div key={movement.id} className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{new Date(movement.timestamp).toLocaleString()}</span>
                            <Badge variant="outline" className="text-xs capitalize">{movement.type}</Badge>
                          </div>
                          <div className="ml-5 text-xs mt-1">
                            {movement.fromLocation} <ArrowRight className="h-3 w-3 inline mx-1" /> {movement.toLocation}
                            {movement.flightNumber && <span className="ml-2 text-muted-foreground">({movement.flightNumber})</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Last Inspection</div>
                    <div className="font-medium">{selectedULD.lastInspection}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Next Inspection</div>
                    <div className="font-medium">{selectedULD.nextInspection}</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowULDDetails(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Damage Report Dialog */}
      <Dialog open={showDamageDialog} onOpenChange={setShowDamageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report ULD Damage</DialogTitle>
            <DialogDescription>Report damage for ULD {selectedULD?.uldNumber}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Damage Type</Label>
              <Select value={damageReport.type} onValueChange={(v) => setDamageReport({...damageReport, type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select damage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Structural Damage">Structural Damage</SelectItem>
                  <SelectItem value="Door Damage">Door Damage</SelectItem>
                  <SelectItem value="Floor Damage">Floor Damage</SelectItem>
                  <SelectItem value="Latching System Damage">Latching System Damage</SelectItem>
                  <SelectItem value="Cosmetic Damage">Cosmetic Damage</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select value={damageReport.severity} onValueChange={(v: any) => setDamageReport({...damageReport, severity: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={damageReport.description}
                onChange={(e) => setDamageReport({...damageReport, description: e.target.value})}
                placeholder="Describe the damage..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDamageDialog(false)}>Cancel</Button>
            <Button onClick={() => selectedULD && handleReportDamage(selectedULD.id)}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedRevenue?.invoiceNumber || 'Pending'}</DialogTitle>
          </DialogHeader>
          {selectedRevenue && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>AWB Number</Label>
                  <div className="text-sm font-medium mt-1 font-mono">{selectedRevenue.awbNumber}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getRevenueStatusBadge(selectedRevenue.status)}</div>
                </div>
                <div>
                  <Label>Invoice Date</Label>
                  <div className="text-sm font-medium mt-1">{selectedRevenue.invoiceDate || '-'}</div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <div className="text-sm font-medium mt-1">{new Date(selectedRevenue.dueDate).toLocaleDateString()}</div>
                </div>
                {selectedRevenue.paidDate && (
                  <div>
                    <Label>Paid Date</Label>
                    <div className="text-sm font-medium mt-1">{new Date(selectedRevenue.paidDate).toLocaleDateString()}</div>
                  </div>
                )}
                {selectedRevenue.paymentMethod && (
                  <div>
                    <Label>Payment Method</Label>
                    <div className="text-sm font-medium mt-1 capitalize">{selectedRevenue.paymentMethod.replace('_', ' ')}</div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Charges Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Freight Charge</span>
                    <span>{selectedRevenue.currency} {selectedRevenue.charges.freight.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Surcharge</span>
                    <span>{selectedRevenue.currency} {selectedRevenue.charges.fuelSurcharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Fee</span>
                    <span>{selectedRevenue.currency} {selectedRevenue.charges.securityFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling Fee</span>
                    <span>{selectedRevenue.currency} {selectedRevenue.charges.handlingFee.toLocaleString()}</span>
                  </div>
                  {selectedRevenue.charges.customsFee > 0 && (
                    <div className="flex justify-between">
                      <span>Customs Fee</span>
                      <span>{selectedRevenue.currency} {selectedRevenue.charges.customsFee.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRevenue.charges.otherCharges > 0 && (
                    <div className="flex justify-between">
                      <span>Other Charges</span>
                      <span>{selectedRevenue.currency} {selectedRevenue.charges.otherCharges.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedRevenue.discount.amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({selectedRevenue.discount.reason})</span>
                      <span>-{selectedRevenue.currency} {selectedRevenue.discount.amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">{selectedRevenue.currency} {selectedRevenue.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Applied Rates</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Rate per kg</div>
                    <div className="font-medium">{selectedRevenue.currency} {selectedRevenue.appliedRates.ratePerKg.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Chargeable Weight</div>
                    <div className="font-medium">{selectedRevenue.appliedRates.weightChargeable} kg</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Minimum Charge</div>
                    <div className="font-medium">{selectedRevenue.currency} {selectedRevenue.appliedRates.minimumCharge}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>Close</Button>
            {selectedRevenue?.status === 'invoiced' && (
              <Button variant="outline" onClick={() => handlePrintInvoice(selectedRevenue.id)}>
                <Printer className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
            )}
            {selectedRevenue?.status === 'invoiced' && (
              <Button onClick={() => handleRecordPayment(selectedRevenue.id, 'bank_transfer')}>
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
