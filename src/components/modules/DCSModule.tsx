'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
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
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
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
  Search,
  AlertTriangle,
  Download,
  Settings,
  Bell,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Eye,
  Edit,
  Trash2,
  Barcode,
  Ticket,
  Zap,
  Shield,
  MapPin,
  Calendar,
  TrendingUp,
  Gauge,
  AlertCircle,
  Info,
  Plus,
  DollarSign,
  Briefcase,
  Guitar,
  PawPrint,
  FlaskConical,
  Globe,
  Shuffle,
  Truck,
  Receipt,
  Calculator,
  Thermometer,
  Layers,
  Navigation
} from 'lucide-react'
import { useAirlineStore, type CheckInRecord, type BaggageRecord } from '@/lib/store'

interface BoardingPassenger {
  id: string
  passengerName: string
  seatNumber: string
  ticketNumber: string
  sequence: number
  status: 'not-boarded' | 'boarding' | 'boarded' | 'offloaded'
  boardingTime?: string
  group: 'preboard' | 'group1' | 'group2' | 'group3' | 'standby'
}

interface StandbyPassenger {
  id: string
  passengerName: string
  ticketNumber: string
  priority: number
  requestedSeat?: string
  status: 'waiting' | 'boarded' | 'denied'
}

interface LoadSheetData {
  aircraft: string
  takeoffWeight: number
  zeroFuelWeight: number
  landingWeight: number
  operatingEmptyWeight: number
  payloadWeight: number
  fuelWeight: number
  passengerWeight: number
  cargoWeight: number
  baggageWeight: number
  centerOfGravity: number
  trimSetting: number
  distribution: {
    forward: number
    aft: number
  }
  envelopeStatus: 'in-envelope' | 'forward-limit' | 'aft-limit'
  approved: boolean
  approvedBy?: string
  approvedAt?: string
}

interface BaggageTracking {
  id: string
  tagNumber: string
  passengerName: string
  pnrNumber: string
  origin: string
  destination: string
  flightNumber: string
  weight: number
  pieces: number
  status: 'checked' | 'loaded' | 'offloaded' | 'mishandled' | 'in-transit'
  carousel?: string
  location?: string
  lastScanned?: string
  mishandledType?: 'lost' | 'delayed' | 'damaged' | 'pilfered'
  mishandledRemarks?: string
  interlinePartners?: string[]
}

interface GateInfo {
  gate: string
  scheduledOpen: string
  status: 'open' | 'closed' | 'delayed'
  changeReason?: string
  previousGate?: string
}

// Upgrade Types
type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first'

interface UpgradeOption {
  from: CabinClass
  to: CabinClass
  price: number
  currency: string
}

interface UpgradeRequest {
  passengerId: string
  passengerName: string
  currentCabin: CabinClass
  requestedCabin: CabinClass
  price: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  timestamp: string
}

// Baggage Types
interface BaggageDetail {
  pieces: number
  weightPerPiece: number
  totalWeight: number
  weightLimit: number
  excessWeight: number
  excessFee: number
  feePerKg: number
  tags: string[]
}

// SSR Types
type SSRType = 'wheelchair' | 'meal' | 'assistance' | 'pet' | 'infant' | 'unaccompanied_minor' | 'medical' | 'other'
type SSRStatus = 'requested' | 'confirmed' | 'pending' | 'unavailable'

interface SSRRequest {
  id: string
  type: SSRType
  description: string
  status: SSRStatus
  cost?: number
  notes?: string
  confirmedAt?: string
}

// Document Validation Types
type DocumentType = 'passport' | 'visa' | 'health_certificate' | 'national_id' | 'driving_license' | 'other'
type ValidationStatus = 'valid' | 'expired' | 'expiring_soon' | 'invalid' | 'not_verified'

interface DocumentInfo {
  type: DocumentType
  number: string
  expiryDate: string
  issuingCountry: string
  status: ValidationStatus
  verifiedAt?: string
  scanned?: boolean
  alertReason?: string
}

// ============================================
// Enhanced Baggage Types
// ============================================

type RouteType = 'domestic' | 'international' | 'transatlantic' | 'transpacific'
type SeasonType = 'low' | 'shoulder' | 'peak'
type FrequentFlyerTier = 'none' | 'silver' | 'gold' | 'platinum'
type SpecialBaggageType = 'golf_clubs' | 'ski_equipment' | 'surfboard' | 'bicycle' | 'musical_instrument' | 'pet_cabin' | 'pet_hold' | 'fragile' | 'medical' | 'wheelchair' | 'stroller' | 'car_seat'
type DGClass = '1' | '2.1' | '2.2' | '2.3' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type DGStatus = 'permitted' | 'restricted' | 'prohibited'
type InterlineStatus = 'pending' | 'transferred' | 'received' | 'delivered'

interface BaggageFeeCalculation {
  routeType: RouteType
  cabinClass: CabinClass
  pieces: number
  weight: number
  specialBaggage: SpecialBaggageType[]
  frequentFlyerTier: FrequentFlyerTier
  season: SeasonType
  corporateContract?: boolean
  baseFee: number
  excessPieceFee: number
  excessWeightFee: number
  specialBaggageFee: number
  overweightCharge: number
  oversizeCharge: number
  tierDiscount: number
  corporateDiscount: number
  totalFee: number
  currency: string
  feeBreakdown: FeeBreakdownItem[]
  warnings: string[]
  restrictions: string[]
}

interface FeeBreakdownItem {
  type: string
  description: string
  amount: number
  currency: string
  discounted?: boolean
}

interface ExcessBaggageRule {
  routeType: RouteType
  season: SeasonType
  cabinClass: CabinClass
  allowedPieces: number
  allowedWeight: number
  weightUnit: string
  feePerPiece: number
  feePerKg: number
  maxPieces: number
  maxWeight: number
  overweightThreshold: number
  overweightCharge: number
  oversizeThreshold: number
  oversizeCharge: number
  tierAllowances: Record<FrequentFlyerTier, { extraPieces: number; extraWeight: number }>
  corporateAllowances?: { extraPieces: number; extraWeight: number }
}

interface SpecialBaggageRule {
  type: SpecialBaggageType
  name: string
  description: string
  fee: number
  currency: string
  maxWeight: number
  maxDimensions: { length: number; width: number; height: number }
  restrictions: string[]
  requirements: string[]
  requiresApproval: boolean
  requiresHealthCert: boolean
  cabinAllowed: boolean
  holdOnly: boolean
  fragile: boolean
  priority: boolean
}

interface SpecialBaggageRequest {
  id: string
  passengerId: string
  passengerName: string
  type: SpecialBaggageType
  weight: number
  dimensions?: { length: number; width: number; height: number }
  healthCertificate?: string
  vaccinationRecord?: string
  specialInstructions?: string
  approved: boolean
  fee: number
  status: 'pending' | 'approved' | 'rejected' | 'checked'
  restrictions: string[]
  requirements: string[]
}

interface DangerousGoodsItem {
  id: string
  dgClass: DGClass
  unNumber: string
  properShippingName: string
  quantity: number
  unit: string
  packingGroup: 'I' | 'II' | 'III'
  status: DGStatus
  requiresDeclaration: boolean
  specialHandling: string[]
  restrictions: string[]
  documentationRequired: string[]
  approved: boolean
  approvedBy?: string
  approvedAt?: string
}

interface InterlineSegment {
  airlineCode: string
  flightNumber: string
  origin: string
  destination: string
  status: InterlineStatus
  transferTime?: number
  carousel?: string
  trackedAt?: string
}

interface InterlineBaggage {
  id: string
  tagNumber: string
  passengerId: string
  passengerName: string
  finalDestination: string
  segments: InterlineSegment[]
  currentLocation: string
  status: InterlineStatus
  interlinePartners: string[]
  feeSettled: boolean
  feeAmount: number
  trackingHistory: BaggageTrackingPoint[]
  lastUpdated: string
  estimatedDelivery?: string
  lostDelayed?: boolean
  resolutionRemarks?: string
}

export default function DCSModule() {
  const {
    flightInstances,
    checkInRecords,
    baggageRecords,
    boardingRecords,
    loadSheets,
    createCheckIn,
    updateBoarding,
    generateLoadSheet,
    addBaggage,
    pnrs,
    pendingAction,
    setPendingAction
  } = useAirlineStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('checkin')
  
  // Fee calculation state
  const [calculatedFees, setCalculatedFees] = useState<{type: string, amount: number}[]>([])

  // Handle pending actions from App header
  useEffect(() => {
    if (pendingAction) {
      switch (pendingAction.action) {
        case 'new':
          setShowCheckInDialog(true)
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
    if (!flightInstances || flightInstances.length === 0) return
    const headers = ['Flight', 'Origin', 'Destination', 'Date', 'Status', 'Aircraft']
    const rows = flightInstances.map(f => [
      f.flightNumber, f.origin, f.destination, f.departureDate, f.status, f.aircraftType
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'dcs-export.csv'
    link.click()
  }

  const [selectedFlight, setSelectedFlight] = useState('AA123')
  const [showCheckInDialog, setShowCheckInDialog] = useState(false)
  const [showBaggageDialog, setShowBaggageDialog] = useState(false)
  const [showBoardingControlDialog, setShowBoardingControlDialog] = useState(false)
  const [showGateChangeDialog, setShowGateChangeDialog] = useState(false)
  const [showLoadSheetDialog, setShowLoadSheetDialog] = useState(false)
  const [showBaggageReconciliationDialog, setShowBaggageReconciliationDialog] = useState(false)
  const [showMishandledDialog, setShowMishandledDialog] = useState(false)

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

  // Boarding state
  const [boardingStarted, setBoardingStarted] = useState(false)
  const [boardingPassengers, setBoardingPassengers] = useState<BoardingPassenger[]>([])
  const [standbyList, setStandbyList] = useState<StandbyPassenger[]>([])
  const [currentBoardingGroup, setCurrentBoardingGroup] = useState<'preboard' | 'group1' | 'group2' | 'group3'>('preboard')
  const [scannedTicket, setScannedTicket] = useState('')
  const [boardingGate, setBoardingGate] = useState<GateInfo>({ gate: 'A12', scheduledOpen: '14:00', status: 'open' })
  const [offloadReason, setOffloadReason] = useState('')

  // Load & Balance state
  const [loadSheetData, setLoadSheetData] = useState<LoadSheetData | null>(null)
  const [selectedAircraft, setSelectedAircraft] = useState('B737-800')
  const [manualOverride, setManualOverride] = useState(false)

  // Baggage state
  const [baggageTracking, setBaggageTracking] = useState<BaggageTracking[]>([])
  const [reconciledBags, setReconciledBags] = useState<BaggageTracking[]>([])
  const [mishandledBaggage, setMishandledBaggage] = useState<BaggageTracking[]>([])
  const [baggageSearch, setBaggageSearch] = useState('')

  // Upgrade state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedUpgradePassenger, setSelectedUpgradePassenger] = useState<CheckInRecord | null>(null)
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([])
  const [selectedUpgradeCabin, setSelectedUpgradeCabin] = useState<CabinClass>('business')
  const [upgradeHistory, setUpgradeHistory] = useState<Record<string, UpgradeRequest[]>>({})

  // Enhanced baggage state
  const [showBaggageDetailDialog, setShowBaggageDetailDialog] = useState(false)
  const [selectedBaggagePassenger, setSelectedBaggagePassenger] = useState<CheckInRecord | null>(null)
  const [baggageDetails, setBaggageDetails] = useState<Record<string, BaggageDetail>>({})
  const [currentBaggageDetail, setCurrentBaggageDetail] = useState<BaggageDetail>({
    pieces: 0,
    weightPerPiece: 0,
    totalWeight: 0,
    weightLimit: 23,
    excessWeight: 0,
    excessFee: 0,
    feePerKg: 15,
    tags: []
  })

  // SSR state
  const [showSSRDialog, setShowSSRDialog] = useState(false)
  const [selectedSSRPassenger, setSelectedSSRPassenger] = useState<CheckInRecord | null>(null)
  const [ssrRequests, setSSRRequests] = useState<Record<string, SSRRequest[]>>({})
  const [selectedSSRType, setSelectedSSRType] = useState<SSRType>('meal')
  const [ssrNotes, setSSRNotes] = useState('')

  // Document validation state
  const [showDocumentDialog, setShowDocumentDialog] = useState(false)
  const [selectedDocumentPassenger, setSelectedDocumentPassenger] = useState<CheckInRecord | null>(null)
  const [documentInfo, setDocumentInfo] = useState<Record<string, DocumentInfo[]>>({})
  const [currentDocumentType, setCurrentDocumentType] = useState<DocumentType>('passport')
  const [currentDocumentNumber, setCurrentDocumentNumber] = useState('')
  const [currentDocumentExpiry, setCurrentDocumentExpiry] = useState('')
  const [currentDocumentCountry, setCurrentDocumentCountry] = useState('')

  // ============================================
  // Enhanced Baggage Feature State
  // ============================================

  // Baggage Fee Calculator state
  const [showFeeCalculatorDialog, setShowFeeCalculatorDialog] = useState(false)
  const [feeCalculation, setFeeCalculation] = useState<BaggageFeeCalculation | null>(null)
  const [feeCalculatorForm, setFeeCalculatorForm] = useState({
    routeType: 'international' as RouteType,
    cabinClass: 'economy' as CabinClass,
    pieces: 1,
    weight: 23,
    specialBaggage: [] as SpecialBaggageType[],
    frequentFlyerTier: 'none' as FrequentFlyerTier,
    season: 'shoulder' as SeasonType,
    corporateContract: false
  })

  // Excess Baggage Rules Engine state
  const [showExcessRulesDialog, setShowExcessRulesDialog] = useState(false)
  const [excessRules, setExcessRules] = useState<ExcessBaggageRule[]>([])
  const [selectedRuleRoute, setSelectedRuleRoute] = useState<RouteType>('international')
  const [selectedRuleSeason, setSelectedRuleSeason] = useState<SeasonType>('shoulder')
  const [selectedRuleCabin, setSelectedRuleCabin] = useState<CabinClass>('economy')

  // Special Baggage Handling state
  const [showSpecialBaggageDialog, setShowSpecialBaggageDialog] = useState(false)
  const [specialBaggageRequests, setSpecialBaggageRequests] = useState<SpecialBaggageRequest[]>([])
  const [selectedSpecialBaggageType, setSelectedSpecialBaggageType] = useState<SpecialBaggageType>('golf_clubs')
  const [specialBaggageForm, setSpecialBaggageForm] = useState({
    passengerId: '',
    passengerName: '',
    weight: 15,
    dimensions: { length: 120, width: 30, height: 20 },
    healthCertificate: '',
    vaccinationRecord: '',
    specialInstructions: ''
  })
  
  // Additional state for real functionality
  const [selectedBaggage, setSelectedBaggage] = useState<BaggageTracking | null>(null)
  const [showExamineBagDialog, setShowExamineBagDialog] = useState(false)
  const [alternateAirports, setAlternateAirports] = useState<{code: string, name: string, time: number}[]>([])
  const [showDivertedFlightDialog, setShowDivertedFlightDialog] = useState(false)
  const [interlineAgreements, setInterlineAgreements] = useState<{id: string, airline: string, code: string, active: boolean}[]>([])
  const [excessBaggageRules, setExcessBaggageRules] = useState<{type: string, rate: number}[]>([
    { type: 'excess_weight', rate: 15 },
    { type: 'excess_piece', rate: 200 }
  ])

  // Dangerous Goods Management state
  const [showDangerousGoodsDialog, setShowDangerousGoodsDialog] = useState(false)
  const [dangerousGoodsItems, setDangerousGoodsItems] = useState<DangerousGoodsItem[]>([])
  const [selectedDGClass, setSelectedDGClass] = useState<DGClass>('9')
  const [dgForm, setDgForm] = useState({
    unNumber: 'UN3480',
    properShippingName: 'Lithium ion batteries',
    quantity: 1,
    unit: 'pieces',
    packingGroup: 'II' as 'I' | 'II' | 'III'
  })

  // Interline Baggage Tracking state
  const [showInterlineDialog, setShowInterlineDialog] = useState(false)
  const [interlineBaggage, setInterlineBaggage] = useState<InterlineBaggage[]>([])
  const [selectedInterlineBaggage, setSelectedInterlineBaggage] = useState<InterlineBaggage | null>(null)
  const [interlineForm, setInterlineForm] = useState({
    passengerId: '',
    passengerName: '',
    finalDestination: 'CDG',
    segments: [
      { airlineCode: 'AA', flightNumber: 'AA123', origin: 'JFK', destination: 'LHR', status: 'pending' as InterlineStatus },
      { airlineCode: 'BA', flightNumber: 'BA456', origin: 'LHR', destination: 'CDG', status: 'pending' as InterlineStatus }
    ] as InterlineSegment[]
  })

  // Upgrade handlers
  const handleOpenUpgradeDialog = (passenger: CheckInRecord) => {
    setSelectedUpgradePassenger(passenger)
    setSelectedUpgradeCabin('business')
    setShowUpgradeDialog(true)
  }

  const calculateUpgradeCost = (currentCabin: CabinClass, targetCabin: CabinClass): number => {
    const prices: Record<CabinClass, number> = {
      economy: 0,
      premium_economy: 150,
      business: 400,
      first: 800
    }
    return prices[targetCabin] - prices[currentCabin]
  }

  const handleProcessUpgrade = () => {
    if (selectedUpgradePassenger) {
      const cost = calculateUpgradeCost('economy', selectedUpgradeCabin)
      const upgradeRequest: UpgradeRequest = {
        passengerId: selectedUpgradePassenger.passengerId,
        passengerName: selectedUpgradePassenger.passengerName,
        currentCabin: 'economy',
        requestedCabin: selectedUpgradeCabin,
        price: cost,
        status: 'paid',
        timestamp: new Date().toISOString()
      }
      
      const passengerId = selectedUpgradePassenger.passengerId
      setUpgradeRequests([...upgradeRequests, upgradeRequest])
      setUpgradeHistory({
        ...upgradeHistory,
        [passengerId]: [...(upgradeHistory[passengerId] || []), upgradeRequest]
      })
      
      setShowUpgradeDialog(false)
    }
  }

  // Enhanced baggage handlers
  const handleOpenBaggageDetailDialog = (passenger: CheckInRecord) => {
    setSelectedBaggagePassenger(passenger)
    const existingDetail = baggageDetails[passenger.passengerId] || {
      pieces: 0,
      weightPerPiece: 0,
      totalWeight: 0,
      weightLimit: 23,
      excessWeight: 0,
      excessFee: 0,
      feePerKg: 15,
      tags: []
    }
    setCurrentBaggageDetail(existingDetail)
    setShowBaggageDetailDialog(true)
  }

  const handleBaggageDetailChange = (field: keyof BaggageDetail, value: any) => {
    const updated = { ...currentBaggageDetail }
    if (field === 'pieces') {
      updated.pieces = value
      updated.totalWeight = value * updated.weightPerPiece
    } else if (field === 'weightPerPiece') {
      updated.weightPerPiece = value
      updated.totalWeight = updated.pieces * value
    }
    
    // Calculate excess weight and fees
    const totalWeight = updated.totalWeight
    const weightLimit = updated.weightLimit
    const excessWeight = Math.max(0, totalWeight - weightLimit)
    updated.excessWeight = excessWeight
    updated.excessFee = excessWeight * updated.feePerKg
    
    setCurrentBaggageDetail(updated)
  }

  const handleGenerateBaggageTags = (pieces: number): string[] => {
    const tags: string[] = []
    for (let i = 0; i < pieces; i++) {
      const tagNumber = `BAG-${Date.now().toString().slice(-6)}-${String(i + 1).padStart(3, '0')}`
      tags.push(tagNumber)
    }
    return tags
  }

  const handleSaveBaggageDetails = () => {
    if (selectedBaggagePassenger) {
      const tags = handleGenerateBaggageTags(currentBaggageDetail.pieces)
      const detailWithTags = { ...currentBaggageDetail, tags }
      setBaggageDetails({
        ...baggageDetails,
        [selectedBaggagePassenger.passengerId]: detailWithTags
      })
      setShowBaggageDetailDialog(false)
    }
  }

  // SSR handlers
  const handleOpenSSRDialog = (passenger: CheckInRecord) => {
    setSelectedSSRPassenger(passenger)
    setSelectedSSRType('meal')
    setSSRNotes('')
    setShowSSRDialog(true)
  }

  const handleAddSSR = () => {
    if (selectedSSRPassenger) {
      const ssrRequest: SSRRequest = {
        id: `SSR-${Date.now()}`,
        type: selectedSSRType,
        description: getSSRDescription(selectedSSRType),
        status: 'confirmed',
        cost: getSSRCost(selectedSSRType),
        notes: ssrNotes || undefined,
        confirmedAt: new Date().toISOString()
      }
      
      const passengerId = selectedSSRPassenger.passengerId
      setSSRRequests({
        ...ssrRequests,
        [passengerId]: [...(ssrRequests[passengerId] || []), ssrRequest]
      })
      
      setShowSSRDialog(false)
      setSSRNotes('')
    }
  }

  const getSSRDescription = (type: SSRType): string => {
    const descriptions: Record<SSRType, string> = {
      wheelchair: 'Wheelchair assistance required',
      meal: 'Special meal preference',
      assistance: 'Special assistance needed',
      pet: 'Pet in cabin',
      infant: 'Infant with bassinet',
      unaccompanied_minor: 'Unaccompanied minor',
      medical: 'Medical condition',
      other: 'Other special request'
    }
    return descriptions[type]
  }

  const getSSRCost = (type: SSRType): number | undefined => {
    const costs: Partial<Record<SSRType, number>> = {
      wheelchair: 0,
      meal: 25,
      pet: 200,
      infant: 0,
      medical: 0
    }
    return costs[type]
  }

  const getSSRStatusBadge = (status: SSRStatus) => {
    const variants: Record<SSRStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      requested: 'secondary',
      pending: 'outline',
      unavailable: 'destructive'
    }
    return variants[status]
  }

  // Document validation handlers
  const handleOpenDocumentDialog = (passenger: CheckInRecord) => {
    setSelectedDocumentPassenger(passenger)
    setCurrentDocumentType('passport')
    setCurrentDocumentNumber('')
    setCurrentDocumentExpiry('')
    setCurrentDocumentCountry('')
    setShowDocumentDialog(true)
  }

  const validateDocument = (type: DocumentType, number: string, expiryDate: string): { status: ValidationStatus; alertReason?: string } => {
    if (!number || !expiryDate) {
      return { status: 'not_verified', alertReason: 'Document details not provided' }
    }
    
    const expiry = new Date(expiryDate)
    const today = new Date()
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(today.getMonth() + 6)
    
    if (expiry < today) {
      return { status: 'expired', alertReason: 'Document has expired' }
    }
    
    if (expiry < sixMonthsFromNow) {
      return { status: 'expiring_soon', alertReason: 'Document expires within 6 months' }
    }
    
    return { status: 'valid' }
  }

  const handleSaveDocument = () => {
    if (selectedDocumentPassenger && currentDocumentNumber && currentDocumentExpiry) {
      const validation = validateDocument(currentDocumentType, currentDocumentNumber, currentDocumentExpiry)
      const document: DocumentInfo = {
        type: currentDocumentType,
        number: currentDocumentNumber,
        expiryDate: currentDocumentExpiry,
        issuingCountry: currentDocumentCountry,
        status: validation.status,
        verifiedAt: new Date().toISOString(),
        scanned: true,
        alertReason: validation.alertReason
      }
      
      const passengerId = selectedDocumentPassenger.passengerId
      setDocumentInfo({
        ...documentInfo,
        [passengerId]: [...(documentInfo[passengerId] || []), document]
      })
      
      setShowDocumentDialog(false)
    }
  }

  const getDocumentStatusColor = (status: ValidationStatus): string => {
    const colors: Record<ValidationStatus, string> = {
      valid: 'text-green-600',
      expired: 'text-red-600',
      expiring_soon: 'text-yellow-600',
      invalid: 'text-red-600',
      not_verified: 'text-gray-600'
    }
    return colors[status]
  }

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

  // Boarding Control Handlers
  const handleInitializeBoarding = () => {
    // Initialize boarding passengers from check-ins
    const checkedInPassengers = checkInRecords.filter(c => 
      c.flightNumber === selectedFlight && c.date === new Date().toISOString().split('T')[0] && c.status !== 'boarded'
    )

    const boardingPassengerList: BoardingPassenger[] = checkedInPassengers.map((p, index) => {
      const group = index < 5 ? 'preboard' : index < 15 ? 'group1' : index < 25 ? 'group2' : 'group3'
      return {
        id: `BP-${Date.now()}-${index}`,
        passengerName: p.passengerName,
        seatNumber: p.seatNumber,
        ticketNumber: p.ticketNumber || `TKT-${index}`,
        sequence: index + 1,
        status: 'not-boarded',
        group: group as 'preboard' | 'group1' | 'group2' | 'group3'
      }
    })

    setBoardingPassengers(boardingPassengerList)
    setBoardingStarted(true)
    updateBoarding(selectedFlight, new Date().toISOString().split('T')[0], {
      boardingStarted: new Date().toISOString(),
      status: 'boarding',
      boardedPassengers: 0
    })

    // Initialize standby list
    const standbys: StandbyPassenger[] = [
      { id: 'SB-1', passengerName: 'John Smith', ticketNumber: 'TKT-999', priority: 1, status: 'waiting' },
      { id: 'SB-2', passengerName: 'Jane Doe', ticketNumber: 'TKT-998', priority: 2, status: 'waiting' },
      { id: 'SB-3', passengerName: 'Bob Wilson', ticketNumber: 'TKT-997', priority: 3, status: 'waiting' }
    ]
    setStandbyList(standbys)
  }

  const handleBoardPassenger = (passenger: BoardingPassenger) => {
    if (passenger.status === 'boarded') return

    const updatedPassengers = boardingPassengers.map(p => 
      p.id === passenger.id ? { ...p, status: 'boarded', boardingTime: new Date().toISOString() } : p
    )
    setBoardingPassengers(updatedPassengers)

    updateBoarding(selectedFlight, new Date().toISOString().split('T')[0], {
      boardedPassengers: updatedPassengers.filter(p => p.status === 'boarded').length
    })
  }

  const handleScanBoardingPass = () => {
    const passenger = boardingPassengers.find(p => 
      p.ticketNumber === scannedTicket && p.status === 'not-boarded'
    )

    if (passenger) {
      handleBoardPassenger(passenger)
      setScannedTicket('')
    }
  }

  const handleOffloadPassenger = (passenger: BoardingPassenger) => {
    const updatedPassengers = boardingPassengers.map(p => 
      p.id === passenger.id ? { ...p, status: 'offloaded' } : p
    )
    setBoardingPassengers(updatedPassengers)
    setShowBoardingControlDialog(false)
  }

  const handleProcessStandby = () => {
    const boardedCount = boardingPassengers.filter(p => p.status === 'boarded').length
    const availableSeats = 180 - boardedCount

    const processedStandbys = standbyList.slice(0, Math.min(availableSeats, standbyList.length)).map(s => ({
      ...s,
      status: 'boarded' as const
    }))

    setStandbyList(standbyList.filter(s => !processedStandbys.find(ps => ps.id === s.id)))

    processedStandbys.forEach(sb => {
      const boardingPass: BoardingPassenger = {
        id: `BP-${Date.now()}-${Math.random()}`,
        passengerName: sb.passengerName,
        seatNumber: `ST-${Math.floor(Math.random() * 40) + 1}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(Math.random() * 6)]}`,
        ticketNumber: sb.ticketNumber,
        sequence: boardingPassengers.length + 1,
        status: 'boarded' as const,
        group: 'standby'
      }
      setBoardingPassengers(prev => [...prev, boardingPass])
    })

    updateBoarding(selectedFlight, new Date().toISOString().split('T')[0], {
      boardedPassengers: boardingPassengers.filter(p => p.status === 'boarded').length
    })
  }

  const handleCheckReconciliation = () => {
    const boarded = boardingPassengers.filter(p => p.status === 'boarded').length
    const checkedIn = checkInRecords.filter(c => 
      c.flightNumber === selectedFlight && c.date === new Date().toISOString().split('T')[0]
    ).length

    const discrepancies = checkedIn - boarded

    setReconciledBags(baggageRecords.filter(b => b.flightNumber === selectedFlight).map(bag => ({
      ...bag,
      id: `BT-${Date.now()}`,
      status: bag.status,
      location: 'carousel-' + (bag.tagNumber.slice(-1))
    })))
  }

  const handleGateChange = () => {
    const newGate = boardingGate.gate === 'A12' ? 'B8' : 'A12'
    setBoardingGate({
      ...boardingGate,
      gate: newGate,
      previousGate: boardingGate.gate,
      changeReason: 'Operational requirement',
      status: 'open'
    })
    setShowGateChangeDialog(false)
  }

  // Load & Balance Handlers
  const handleGenerateLoadSheetData = () => {
    const passengerWeight = 180 * boardingPassengers.filter(p => p.status === 'boarded').length
    const baggageWeight = baggageRecords.filter(b => b.flightNumber === selectedFlight).reduce((sum, b) => sum + b.weight, 0)
    const cargoWeight = 0
    const fuelWeight = 15000
    const oew = 42000
    const dow = 44000
    const zfw = oew + passengerWeight + baggageWeight + cargoWeight
    const tow = zfw + fuelWeight
    const law = tow - 5000

    const cgPosition = 25 + (Math.random() * 10 - 5) // Simulated CG between 20-30%
    const trimSetting = Math.round(cgPosition * 2 - 40)

    const loadSheet: LoadSheetData = {
      aircraft: selectedAircraft,
      takeoffWeight: tow,
      zeroFuelWeight: zfw,
      landingWeight: law,
      operatingEmptyWeight: oew,
      payloadWeight: passengerWeight + baggageWeight + cargoWeight,
      fuelWeight,
      passengerWeight,
      cargoWeight,
      baggageWeight,
      centerOfGravity: cgPosition,
      trimSetting,
      distribution: {
        forward: Math.round(passengerWeight * 0.4 + cargoWeight * 0.3 + baggageWeight * 0.3),
        aft: Math.round(passengerWeight * 0.6 + cargoWeight * 0.7 + baggageWeight * 0.7)
      },
      envelopeStatus: cgPosition >= 22 && cgPosition <= 28 ? 'in-envelope' : cgPosition < 22 ? 'forward-limit' : 'aft-limit',
      approved: false
    }

    setLoadSheetData(loadSheetData)
    setShowLoadSheetDialog(true)
  }

  const handleApproveLoadSheet = () => {
    if (loadSheetData) {
      setLoadSheetData({
        ...loadSheetData,
        approved: true,
        approvedBy: 'Agent',
        approvedAt: new Date().toISOString()
      })
    }
    setShowLoadSheetDialog(false)
  }

  const handleBaggageReconciliation = () => {
    // Simulate baggage reconciliation
    const allBags = baggageRecords.filter(b => b.flightNumber === selectedFlight)
    const reconciled: BaggageTracking[] = allBags.map((bag, i) => ({
      id: `BT-${Date.now()}-${i}`,
      tagNumber: bag.tagNumber,
      passengerName: bag.passengerName,
      pnrNumber: bag.pnrNumber,
      origin: bag.origin,
      destination: bag.destination,
      flightNumber: bag.flightNumber,
      weight: bag.weight,
      pieces: bag.pieces,
      status: 'loaded' as const,
      carousel: `C${(i % 4) + 1}`,
      location: 'aircraft',
      lastScanned: new Date().toISOString()
    }))

    setReconciledBags(reconciled)
    setShowBaggageReconciliationDialog(true)
  }

  const handleReportMishandled = (bag: BaggageTracking) => {
    const mishandled: BaggageTracking = {
      ...bag,
      status: 'mishandled' as const,
      mishandledType: 'delayed' as const,
      mishandledRemarks: 'Missing at final carousel'
    }
    setMishandledBaggage([...mishandledBaggage, mishandled])
    setBaggageTracking(baggageTracking.filter(b => b.id !== bag.id))
    setShowMishandledDialog(true)
  }

  const handleResolveMishandled = (bag: BaggageTracking, resolution: string) => {
    const resolved = {
      ...bag,
      status: 'loaded' as const,
      mishandledRemarks: `Resolved: ${resolution}`
    }
    setMishandledBaggage(mishandledBaggage.filter(b => b.id !== bag.id))
    setBaggageTracking([...baggageTracking, resolved])
    setShowMishandledDialog(false)
  }

  // ============================================
  // Enhanced Baggage Feature Handlers
  // ============================================

  // Baggage Fee Calculator Handlers
  const calculateBaggageFee = () => {
    const { routeType, cabinClass, pieces, weight, specialBaggage, frequentFlyerTier, season, corporateContract } = feeCalculatorForm
    
    // Get baggage allowance based on cabin class
    const cabinAllowances: Record<CabinClass, { pieces: number; weight: number }> = {
      first: { pieces: 3, weight: 46 },
      business: { pieces: 2, weight: 32 },
      economy: { pieces: 1, weight: 23 },
      premium_economy: { pieces: 2, weight: 23 }
    }
    
    const allowance = cabinAllowances[cabinClass] || cabinAllowances.economy
    
    // Get route-specific fees
    const routeFees: Record<RouteType, { perPiece: number; perKg: number }> = {
      domestic: { perPiece: 25, perKg: 10 },
      international: { perPiece: 60, perKg: 20 },
      transatlantic: { perPiece: 100, perKg: 30 },
      transpacific: { perPiece: 120, perKg: 35 }
    }
    
    const fees = routeFees[routeType]
    
    // Get seasonal multiplier
    const seasonalMultipliers: Record<SeasonType, number> = {
      low: 0.8,
      shoulder: 1.0,
      peak: 1.2
    }
    const seasonMultiplier = seasonalMultipliers[season]
    
    // Get tier discount
    const tierDiscounts: Record<FrequentFlyerTier, number> = {
      none: 0,
      silver: 0.1,
      gold: 0.2,
      platinum: 0.3
    }
    const tierDiscount = tierDiscounts[frequentFlyerTier]
    
    const corporateDiscount = corporateContract ? 0.15 : 0
    
    // Calculate excess pieces
    const excessPieces = Math.max(0, pieces - allowance.pieces)
    const excessPieceFee = excessPieces * fees.perPiece * seasonMultiplier
    
    // Calculate excess weight
    const allowedTotalWeight = allowance.pieces * allowance.weight
    const excessWeight = Math.max(0, weight - allowedTotalWeight)
    const excessWeightFee = Math.ceil(excessWeight) * fees.perKg * seasonMultiplier
    
    // Calculate special baggage fees
    const specialBaggageFees: Record<SpecialBaggageType, number> = {
      golf_clubs: 75,
      ski_equipment: 75,
      surfboard: 150,
      bicycle: 100,
      musical_instrument: 100,
      pet_cabin: 200,
      pet_hold: 150,
      fragile: 25,
      medical: 0,
      wheelchair: 0,
      stroller: 0,
      car_seat: 0
    }
    
    let specialBaggageFee = 0
    specialBaggage.forEach(type => {
      specialBaggageFee += specialBaggageFees[type] || 0
    })
    
    // Calculate overweight charges (if a single bag exceeds 32kg)
    const weightPerPiece = pieces > 0 ? weight / pieces : 0
    let overweightCharge = 0
    if (weightPerPiece > 32 && weightPerPiece <= 45) {
      overweightCharge = 100
    } else if (weightPerPiece > 45) {
      overweightCharge = 200
    }
    
    // Build fee breakdown
    const breakdown: FeeBreakdownItem[] = []
    
    if (excessPieces > 0) {
      breakdown.push({
        type: 'excess_piece',
        description: `Excess baggage (${excessPieces} piece${excessPieces > 1 ? 's' : ''})`,
        amount: excessPieceFee,
        currency: 'USD'
      })
    }
    
    if (excessWeight > 0) {
      breakdown.push({
        type: 'excess_weight',
        description: `Excess weight (${excessWeight.toFixed(1)} kg)`,
        amount: excessWeightFee,
        currency: 'USD'
      })
    }
    
    if (specialBaggage.length > 0) {
      specialBaggage.forEach(type => {
        breakdown.push({
          type: 'special_baggage',
          description: `${type.replace(/_/g, ' ').toUpperCase()}`,
          amount: specialBaggageFees[type] || 0,
          currency: 'USD'
        })
      })
    }
    
    if (overweightCharge > 0) {
      breakdown.push({
        type: 'overweight',
        description: `Overweight charge (>${weightPerPiece > 45 ? '45' : '32'}kg)`,
        amount: overweightCharge,
        currency: 'USD'
      })
    }
    
    const subtotal = excessPieceFee + excessWeightFee + specialBaggageFee + overweightCharge
    const tierDiscountAmount = subtotal * tierDiscount
    const corporateDiscountAmount = subtotal * corporateDiscount
    const totalFee = subtotal - tierDiscountAmount - corporateDiscountAmount
    
    // Generate warnings and restrictions
    const warnings: string[] = []
    const restrictions: string[] = []
    
    if (excessPieces > 0) {
      warnings.push(`Exceeds free baggage allowance by ${excessPieces} piece(s)`)
    }
    if (excessWeight > 0) {
      warnings.push(`Exceeds weight allowance by ${excessWeight.toFixed(1)} kg`)
    }
    if (weightPerPiece > 45) {
      restrictions.push('Bags over 45kg may be refused for safety reasons')
    }
    if (weightPerPiece > 32) {
      warnings.push('One or more bags exceed standard weight limit (32kg)')
    }
    
    const calculation: BaggageFeeCalculation = {
      routeType,
      cabinClass,
      pieces,
      weight,
      specialBaggage,
      frequentFlyerTier,
      season,
      corporateContract,
      baseFee: 0,
      excessPieceFee,
      excessWeightFee,
      specialBaggageFee,
      overweightCharge,
      oversizeCharge: 0,
      tierDiscount: tierDiscountAmount,
      corporateDiscount: corporateDiscountAmount,
      totalFee,
      currency: 'USD',
      feeBreakdown: breakdown,
      warnings,
      restrictions
    }
    
    setFeeCalculation(calculation)
  }

  const handleCalculateFee = () => {
    calculateBaggageFee()
  }

  // Excess Baggage Rules Engine Handlers
  const loadExcessRules = () => {
    const rules: ExcessBaggageRule[] = [
      {
        routeType: selectedRuleRoute,
        season: selectedRuleSeason,
        cabinClass: selectedRuleCabin,
        allowedPieces: selectedRuleCabin === 'first' ? 3 : selectedRuleCabin === 'business' ? 2 : selectedRuleCabin === 'premium_economy' ? 2 : 1,
        allowedWeight: selectedRuleCabin === 'first' ? 46 : selectedRuleCabin === 'business' ? 32 : 23,
        weightUnit: 'kg',
        feePerPiece: selectedRuleRoute === 'domestic' ? 25 : selectedRuleRoute === 'international' ? 60 : selectedRuleRoute === 'transatlantic' ? 100 : 120,
        feePerKg: selectedRuleRoute === 'domestic' ? 10 : selectedRuleRoute === 'international' ? 20 : selectedRuleRoute === 'transatlantic' ? 30 : 35,
        maxPieces: 10,
        maxWeight: 100,
        overweightThreshold: 32,
        overweightCharge: 100,
        oversizeThreshold: 203,
        oversizeCharge: 100,
        tierAllowances: {
          none: { extraPieces: 0, extraWeight: 0 },
          silver: { extraPieces: 1, extraWeight: 7 },
          gold: { extraPieces: 1, extraWeight: 10 },
          platinum: { extraPieces: 2, extraWeight: 15 }
        },
        corporateAllowances: { extraPieces: 1, extraWeight: 10 }
      }
    ]
    setExcessRules(rules)
  }

  const handleViewExcessRules = () => {
    loadExcessRules()
    setShowExcessRulesDialog(true)
  }

  // Special Baggage Handling Handlers
  const getSpecialBaggageRule = (type: SpecialBaggageType): SpecialBaggageRule => {
    const rules: Record<SpecialBaggageType, SpecialBaggageRule> = {
      golf_clubs: {
        type: 'golf_clubs',
        name: 'Golf Clubs',
        description: 'Standard golf bag with clubs',
        fee: 75,
        currency: 'USD',
        maxWeight: 23,
        maxDimensions: { length: 200, width: 35, height: 25 },
        restrictions: ['max_weight_23kg', 'max_length_200cm'],
        requirements: ['Must be in proper golf bag'],
        requiresApproval: false,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: false,
        priority: false
      },
      ski_equipment: {
        type: 'ski_equipment',
        name: 'Ski Equipment',
        description: 'Skis, poles, and boots',
        fee: 75,
        currency: 'USD',
        maxWeight: 23,
        maxDimensions: { length: 200, width: 30, height: 20 },
        restrictions: ['max_weight_23kg'],
        requirements: ['Must be in ski bag or case'],
        requiresApproval: false,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: false,
        priority: false
      },
      surfboard: {
        type: 'surfboard',
        name: 'Surfboard',
        description: 'Surfboard in protective case',
        fee: 150,
        currency: 'USD',
        maxWeight: 32,
        maxDimensions: { length: 300, width: 80, height: 20 },
        restrictions: ['max_length_300cm'],
        requirements: ['Must be in protective case', 'Fins removed'],
        requiresApproval: true,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: true,
        priority: true
      },
      bicycle: {
        type: 'bicycle',
        name: 'Bicycle',
        description: 'Bicycle in bike box or case',
        fee: 100,
        currency: 'USD',
        maxWeight: 32,
        maxDimensions: { length: 150, width: 80, height: 30 },
        restrictions: ['must_be_packed', 'handlebars_removed', 'pedals_removed'],
        requirements: ['Must be in proper bike box', 'No fuel in tank'],
        requiresApproval: true,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: true,
        priority: false
      },
      musical_instrument: {
        type: 'musical_instrument',
        name: 'Musical Instrument',
        description: 'Musical instrument with or without case',
        fee: 100,
        currency: 'USD',
        maxWeight: 23,
        maxDimensions: { length: 120, width: 40, height: 20 },
        restrictions: ['max_weight_23kg'],
        requirements: ['Fragile tag required'],
        requiresApproval: true,
        requiresHealthCert: false,
        cabinAllowed: true,
        holdOnly: false,
        fragile: true,
        priority: true
      },
      pet_cabin: {
        type: 'pet_cabin',
        name: 'Pet in Cabin',
        description: 'Small pet in approved carrier',
        fee: 200,
        currency: 'USD',
        maxWeight: 8,
        maxDimensions: { length: 45, width: 30, height: 25 },
        restrictions: ['max_weight_8kg'],
        requirements: ['Health certificate required', 'Vaccination record required', 'Advance notice required'],
        requiresApproval: true,
        requiresHealthCert: true,
        cabinAllowed: true,
        holdOnly: false,
        fragile: false,
        priority: true
      },
      pet_hold: {
        type: 'pet_hold',
        name: 'Pet in Hold',
        description: 'Larger pet in approved crate',
        fee: 150,
        currency: 'USD',
        maxWeight: 75,
        maxDimensions: { length: 120, width: 80, height: 85 },
        restrictions: ['pets_over_32kg_cargo_only'],
        requirements: ['Health certificate required', 'Vaccination record required', 'Food/water attached'],
        requiresApproval: true,
        requiresHealthCert: true,
        cabinAllowed: false,
        holdOnly: true,
        fragile: false,
        priority: true
      },
      fragile: {
        type: 'fragile',
        name: 'Fragile Item',
        description: 'Fragile items requiring special handling',
        fee: 25,
        currency: 'USD',
        maxWeight: 32,
        maxDimensions: { length: 100, width: 60, height: 50 },
        restrictions: [],
        requirements: ['Fragile tag required', 'Proper packaging required'],
        requiresApproval: false,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: true,
        priority: true
      },
      medical: {
        type: 'medical',
        name: 'Medical Equipment',
        description: 'Medical equipment or supplies',
        fee: 0,
        currency: 'USD',
        maxWeight: 50,
        maxDimensions: { length: 100, width: 60, height: 50 },
        restrictions: [],
        requirements: ['Medical documentation required'],
        requiresApproval: false,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: true,
        priority: true
      },
      wheelchair: {
        type: 'wheelchair',
        name: 'Wheelchair',
        description: 'Manual or electric wheelchair',
        fee: 0,
        currency: 'USD',
        maxWeight: 100,
        maxDimensions: { length: 120, width: 70, height: 100 },
        restrictions: [],
        requirements: ['Battery must be removed for electric wheelchairs'],
        requiresApproval: false,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: true,
        priority: true
      },
      stroller: {
        type: 'stroller',
        name: 'Stroller',
        description: 'Baby stroller',
        fee: 0,
        currency: 'USD',
        maxWeight: 20,
        maxDimensions: { length: 100, width: 60, height: 100 },
        restrictions: [],
        requirements: [],
        requiresApproval: false,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: false,
        priority: true
      },
      car_seat: {
        type: 'car_seat',
        name: 'Car Seat',
        description: 'Child car seat',
        fee: 0,
        currency: 'USD',
        maxWeight: 15,
        maxDimensions: { length: 70, width: 50, height: 60 },
        restrictions: [],
        requirements: [],
        requiresApproval: false,
        requiresHealthCert: false,
        cabinAllowed: false,
        holdOnly: true,
        fragile: false,
        priority: true
      }
    }
    return rules[type]
  }

  const handleAddSpecialBaggageRequest = () => {
    const rule = getSpecialBaggageRule(selectedSpecialBaggageType)
    
    const request: SpecialBaggageRequest = {
      id: `SBR-${Date.now()}`,
      passengerId: specialBaggageForm.passengerId || `PAX-${Date.now()}`,
      passengerName: specialBaggageForm.passengerName || 'Unknown Passenger',
      type: selectedSpecialBaggageType,
      weight: specialBaggageForm.weight,
      dimensions: specialBaggageForm.dimensions,
      healthCertificate: specialBaggageForm.healthCertificate,
      vaccinationRecord: specialBaggageForm.vaccinationRecord,
      specialInstructions: specialBaggageForm.specialInstructions,
      approved: !rule.requiresApproval,
      fee: rule.fee,
      status: !rule.requiresApproval ? 'approved' : 'pending',
      restrictions: rule.restrictions,
      requirements: rule.requirements
    }
    
    setSpecialBaggageRequests([...specialBaggageRequests, request])
    setShowSpecialBaggageDialog(false)
    
    // Reset form
    setSpecialBaggageForm({
      passengerId: '',
      passengerName: '',
      weight: 15,
      dimensions: { length: 120, width: 30, height: 20 },
      healthCertificate: '',
      vaccinationRecord: '',
      specialInstructions: ''
    })
  }

  const handleApproveSpecialBaggage = (requestId: string) => {
    setSpecialBaggageRequests(specialBaggageRequests.map(req => 
      req.id === requestId ? { ...req, approved: true, status: 'approved' as const } : req
    ))
  }

  const handleRejectSpecialBaggage = (requestId: string) => {
    setSpecialBaggageRequests(specialBaggageRequests.map(req => 
      req.id === requestId ? { ...req, approved: false, status: 'rejected' as const } : req
    ))
  }

  // Additional handlers for DCS Module
  const handlePrintBoardingPass = (checkIn: CheckInRecord) => {
    const printContent = `
      <html><head><title>Boarding Pass</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        .bp { border: 2px solid #000; padding: 20px; max-width: 400px; }
        .header { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
        .row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; }
      </style></head><body>
        <div class="bp">
          <div class="header">BOARDING PASS</div>
          <div class="row"><span class="label">Flight:</span><span>${checkIn.flightNumber}</span></div>
          <div class="row"><span class="label">Passenger:</span><span>${checkIn.passengerName}</span></div>
          <div class="row"><span class="label">Seat:</span><span>${checkIn.seatNumber}</span></div>
          <div class="row"><span class="label">Date:</span><span>${checkIn.date}</span></div>
          <div class="row"><span class="label">Gate:</span><span>${checkIn.gate || 'TBD'}</span></div>
        </div>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
    toast({ title: 'Boarding Pass Printed', description: `Boarding pass for ${checkIn.passengerName}` })
  }

  const handlePrintBaggageTag = (bag: BaggageTracking) => {
    const printContent = `
      <html><head><title>Baggage Tag</title>
      <style>
        body { font-family: Arial; padding: 20px; }
        .tag { border: 2px solid #000; padding: 20px; max-width: 300px; }
        .header { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
      </style></head><body>
        <div class="tag">
          <div class="header">BAGGAGE TAG</div>
          <div>Tag: ${bag.tagNumber}</div>
          <div>Route: ${bag.route}</div>
          <div>Weight: ${bag.weight}kg</div>
          <div>Flight: ${bag.flightNumber}</div>
        </div>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
    toast({ title: 'Baggage Tag Printed', description: `Tag: ${bag.tagNumber}` })
  }

  const handleExamineBag = (bag: BaggageTracking) => {
    setSelectedBaggage(bag)
    setShowExamineBagDialog(true)
    toast({ title: 'Baggage Examined', description: `Examining ${bag.tagNumber}` })
  }

  const handleReconcileBag = (bag: BaggageTracking) => {
    setBaggageTracking(baggageTracking.map(b => b.id === bag.id ? { ...b, status: 'loaded' as const } : b))
    toast({ title: 'Baggage Reconciled', description: `${bag.tagNumber} marked as loaded` })
  }

  const handleViewFlightDetails = (flightNumber: string) => {
    const flight = flightInstances.find(f => f.flightNumber === flightNumber)
    if (flight) {
      setSelectedFlight(flight.flightNumber)
      toast({ 
        title: `Flight ${flight.flightNumber}`, 
        description: `${flight.origin} → ${flight.destination} | Status: ${flight.status} | Gate: ${flight.gate || 'TBD'}` 
      })
    }
  }

  // Quick action handlers
  const handleExportLoadSheet = () => {
    const headers = ['Flight', 'Date', 'Origin', 'Destination', 'PAX', 'Baggage', 'Cargo', 'Mail']
    const rows = loadSheetData.map(ls => [
      ls.flightNumber, ls.date, ls.origin, ls.destination, ls.pax, ls.baggage, ls.cargo, ls.mail
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `loadsheet-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast({ title: 'Load Sheet Exported', description: 'Load sheet data exported to CSV' })
  }

  const handlePrintLoadSheet = () => {
    const printContent = `
      <html><head><title>Load Sheet</title>
      <style>body { font-family: Arial; padding: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }</style></head><body>
        <h1>Load Sheet</h1>
        <table><thead><tr><th>Flight</th><th>Date</th><th>Origin</th><th>Dest</th><th>PAX</th><th>Bag</th><th>Cargo</th></tr></thead>
        <tbody>${loadSheetData.map(ls => `<tr><td>${ls.flightNumber}</td><td>${ls.date}</td><td>${ls.origin}</td><td>${ls.destination}</td><td>${ls.pax}</td><td>${ls.baggage}</td><td>${ls.cargo}</td></tr>`).join('')}</tbody></table>
      </body></html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
      win.print()
    }
    toast({ title: 'Load Sheet Sent to Printer', description: 'Load sheet printed successfully' })
  }

  const handleBackToCalculator = () => {
    setShowCGCaclulatorDialog(false)
    toast({ title: 'Returned to CG Calculator', description: 'CG Calculator ready' })
  }

  const handleAlternateAirport = () => {
    const options = [
      { code: 'KJFK', name: 'New York JFK', time: 45 },
      { code: 'KEWR', name: 'Newark', time: 50 },
      { code: 'KLGA', name: 'LaGuardia', time: 55 }
    ]
    setAlternateAirports(options)
    setShowDivertedFlightDialog(true)
    toast({ title: 'Alternate Airports', description: 'Showing diversion options' })
  }

  // Dangerous Goods Management Handlers
  const getDGClassInfo = (dgClass: DGClass) => {
    const classes: Record<DGClass, { name: string; permitted: boolean; description: string }> = {
      '1': { name: 'Explosives', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '2.1': { name: 'Flammable Gases', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '2.2': { name: 'Non-Flammable Gases', permitted: true, description: 'Limited quantity only, approval required' },
      '2.3': { name: 'Toxic Gases', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '3': { name: 'Flammable Liquids', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '4': { name: 'Flammable Solids', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '5': { name: 'Oxidizing Substances', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '6': { name: 'Toxic Substances', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '7': { name: 'Radioactive Material', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '8': { name: 'Corrosives', permitted: false, description: 'Completely prohibited on passenger aircraft' },
      '9': { name: 'Miscellaneous', permitted: true, description: 'Limited quantity only, declaration required' }
    }
    return classes[dgClass]
  }

  const getPermittedUNNumbers = (dgClass: DGClass): string[] => {
    const permitted: Record<string, string[]> = {
      '2.2': ['UN1845', 'UN1072'],
      '9': ['UN3090', 'UN3091', 'UN3480', 'UN3481', 'UN1845', 'UN1993', 'UN1219']
    }
    return permitted[dgClass] || []
  }

  const validateDangerousGoods = () => {
    const classInfo = getDGClassInfo(selectedDGClass)
    const permittedUNs = getPermittedUNNumbers(selectedDGClass)
    const isPermitted = classInfo.permitted && permittedUNs.includes(dgForm.unNumber)
    
    const item: DangerousGoodsItem = {
      id: `DG-${Date.now()}`,
      dgClass: selectedDGClass,
      unNumber: dgForm.unNumber,
      properShippingName: dgForm.properShippingName,
      quantity: dgForm.quantity,
      unit: dgForm.unit,
      packingGroup: dgForm.packingGroup,
      status: isPermitted ? 'permitted' : 'prohibited',
      requiresDeclaration: isPermitted,
      specialHandling: isPermitted ? ['Limited quantity only', 'Cargo only', 'Declaration required'] : ['PROHIBITED'],
      restrictions: isPermitted ? [] : ['Not permitted on passenger aircraft'],
      documentationRequired: isPermitted ? ['Dangerous Goods Declaration', 'Air Waybill'] : [],
      approved: isPermitted,
      approvedBy: isPermitted ? 'Agent' : undefined,
      approvedAt: isPermitted ? new Date().toISOString() : undefined
    }
    
    setDangerousGoodsItems([...dangerousGoodsItems, item])
  }

  const handleValidateDangerousGoods = () => {
    validateDangerousGoods()
  }

  // Interline Baggage Tracking Handlers
  const handleAddInterlineBaggage = () => {
    const newInterlineBaggage: InterlineBaggage = {
      id: `IL-${Date.now()}`,
      tagNumber: `INT-${Date.now().toString().slice(-6)}`,
      passengerId: interlineForm.passengerId || `PAX-${Date.now()}`,
      passengerName: interlineForm.passengerName || 'Unknown Passenger',
      finalDestination: interlineForm.finalDestination,
      segments: interlineForm.segments,
      currentLocation: 'JFK - Check-in',
      status: 'pending',
      interlinePartners: ['BA'],
      feeSettled: false,
      feeAmount: interlineForm.segments.length * 50,
      trackingHistory: [{
        location: 'JFK - Check-in',
        status: 'checked',
        timestamp: new Date(),
        flightNumber: interlineForm.segments[0]?.flightNumber
      }],
      lastUpdated: new Date().toISOString()
    }
    
    setInterlineBaggage([...interlineBaggage, newInterlineBaggage])
    setShowInterlineDialog(false)
  }

  const handleUpdateInterlineStatus = (baggageId: string, segmentIndex: number, newStatus: InterlineStatus) => {
    setInterlineBaggage(interlineBaggage.map(bag => {
      if (bag.id === baggageId) {
        const updatedSegments = [...bag.segments]
        updatedSegments[segmentIndex] = { ...updatedSegments[segmentIndex], status: newStatus, trackedAt: new Date().toISOString() }
        
        return {
          ...bag,
          segments: updatedSegments,
          status: newStatus,
          currentLocation: `${updatedSegments[segmentIndex].destination} - ${newStatus}`,
          lastUpdated: new Date().toISOString()
        }
      }
      return bag
    }))
  }

  const handleSettleInterlineFee = (baggageId: string) => {
    setInterlineBaggage(interlineBaggage.map(bag => 
      bag.id === baggageId ? { ...bag, feeSettled: true } : bag
    ))
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
                  <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Upgrade Cabin Class</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        {selectedUpgradePassenger && (
                          <>
                            <div className="p-4 bg-secondary/30 rounded-sm">
                              <div className="font-medium">Passenger: {selectedUpgradePassenger.passengerName}</div>
                              <div className="text-sm text-muted-foreground">Seat: {selectedUpgradePassenger.seatNumber} | PNR: {selectedUpgradePassenger.pnrNumber}</div>
                            </div>
                            
                            <div>
                              <Label>Select New Cabin Class</Label>
                              <Select value={selectedUpgradeCabin} onValueChange={(v: CabinClass) => setSelectedUpgradeCabin(v)}>
                                <SelectTrigger className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="premium_economy">Premium Economy (+$150)</SelectItem>
                                  <SelectItem value="business">Business Class (+$400)</SelectItem>
                                  <SelectItem value="first">First Class (+$800)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="p-4 bg-primary/10 rounded-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Upgrade Cost:</span>
                                <span className="text-2xl font-bold">
                                  ${calculateUpgradeCost('economy', selectedUpgradeCabin)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                From: Economy → To: {selectedUpgradeCabin.replace('_', ' ').toUpperCase()}
                              </div>
                            </div>

                            {upgradeHistory[selectedUpgradePassenger.passengerId]?.length > 0 && (
                              <div>
                                <Label className="mb-2 block">Upgrade History</Label>
                                <ScrollArea className="h-32 border rounded-md p-2">
                                  {upgradeHistory[selectedUpgradePassenger.passengerId].map((upgrade, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-1 border-b last:border-0">
                                      <span className="text-sm">{upgrade.requestedCabin.replace('_', ' ').toUpperCase()}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={upgrade.status === 'paid' ? 'default' : 'outline'} className="capitalize">{upgrade.status}</Badge>
                                        <span className="text-sm font-medium">${upgrade.price}</span>
                                      </div>
                                    </div>
                                  ))}
                                </ScrollArea>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>Cancel</Button>
                        <Button onClick={handleProcessUpgrade}>Confirm & Pay</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
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
                      <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
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

                        {/* Baggage Section in Check-in Dialog */}
                        <div className="border-t pt-4">
                          <Label className="text-base font-medium mb-3 block">Baggage Information</Label>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Number of Pieces</Label>
                              <Input type="number" min="0" defaultValue={0} onChange={(e) => {
                                const pieces = parseInt(e.target.value) || 0
                                setNewCheckIn({ ...newCheckIn, bagsChecked: pieces })
                              }} />
                            </div>
                            <div>
                              <Label>Weight per Piece (kg)</Label>
                              <Input type="number" min="0" defaultValue={23} />
                            </div>
                            <div>
                              <Label>Total Weight (kg)</Label>
                              <Input type="number" min="0" disabled />
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Weight limit: 23kg | Excess fee: $15/kg
                          </div>
                        </div>

                        {/* SSR Section in Check-in Dialog */}
                        <div className="border-t pt-4">
                          <Label className="text-base font-medium mb-3 block">Special Services</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { type: 'wheelchair' as SSRType, label: 'Wheelchair' },
                              { type: 'meal' as SSRType, label: 'Special Meal' },
                              { type: 'assistance' as SSRType, label: 'Special Assistance' },
                              { type: 'pet' as SSRType, label: 'Pet in Cabin' }
                            ].map((ssr) => (
                              <div key={ssr.type} className="flex items-center justify-between p-2 border rounded-sm">
                                <span className="text-sm">{ssr.label}</span>
                                <Switch />
                              </div>
                            ))}
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
                      <th>Baggage</th>
                      <th>SSR</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkInRecords.filter(c => c.flightNumber === selectedFlight).length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-muted-foreground py-8">
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
                            <div className="flex items-center gap-1">
                              {checkIn.documentsVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              {documentInfo[checkIn.passengerId]?.some(d => d.status === 'expiring_soon') && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span>{checkIn.bagsChecked} pcs</span>
                              <Button variant="ghost" size="sm" onClick={() => handleOpenBaggageDetailDialog(checkIn)}>
                                <Package className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td>
                            {ssrRequests[checkIn.passengerId]?.length > 0 ? (
                              <div className="flex gap-1">
                                {ssrRequests[checkIn.passengerId].slice(0, 2).map((ssr) => (
                                  <Badge key={ssr.id} variant={getSSRStatusBadge(ssr.status)} className="text-xs">
                                    {ssr.type.substring(0, 3)}
                                  </Badge>
                                ))}
                                {ssrRequests[checkIn.passengerId].length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{ssrRequests[checkIn.passengerId].length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td>
                            <Badge variant={checkIn.status === 'checked-in' ? 'default' : checkIn.status === 'boarded' ? 'secondary' : 'destructive'} className="capitalize">
                              {checkIn.status}
                            </Badge>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" title="Print Boarding Pass" onClick={() => handlePrintBoardingPass(checkIn)}>
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="View Documents" onClick={() => handleOpenDocumentDialog(checkIn)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Manage SSR" onClick={() => handleOpenSSRDialog(checkIn)}>
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Upgrade" onClick={() => handleOpenUpgradeDialog(checkIn)}>
                                <Zap className="h-4 w-4" />
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

          {/* Baggage Detail Dialog */}
          <Dialog open={showBaggageDetailDialog} onOpenChange={setShowBaggageDetailDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Baggage Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedBaggagePassenger && (
                  <>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="font-medium">{selectedBaggagePassenger.passengerName}</div>
                      <div className="text-sm text-muted-foreground">Seat: {selectedBaggagePassenger.seatNumber}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Number of Pieces</Label>
                        <Input
                          type="number"
                          min="0"
                          value={currentBaggageDetail.pieces}
                          onChange={(e) => handleBaggageDetailChange('pieces', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Weight per Piece (kg)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={currentBaggageDetail.weightPerPiece}
                          onChange={(e) => handleBaggageDetailChange('weightPerPiece', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>Total Weight (kg)</Label>
                        <Input
                          type="number"
                          value={currentBaggageDetail.totalWeight.toFixed(1)}
                          disabled
                        />
                      </div>
                      <div>
                        <Label>Weight Limit (kg)</Label>
                        <Input
                          type="number"
                          value={currentBaggageDetail.weightLimit}
                          onChange={(e) => handleBaggageDetailChange('weightLimit', parseFloat(e.target.value) || 23)}
                        />
                      </div>
                    </div>

                    {currentBaggageDetail.excessWeight > 0 && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-sm">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Excess Baggage Detected</span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Excess Weight:</span>
                            <span className="font-medium">{currentBaggageDetail.excessWeight} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fee Rate:</span>
                            <span className="font-medium">${currentBaggageDetail.feePerKg}/kg</span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Total Excess Fee:</span>
                            <span className="font-bold text-lg">${currentBaggageDetail.excessFee.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentBaggageDetail.tags.length > 0 && (
                      <div>
                        <Label>Generated Baggage Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentBaggageDetail.tags.map((tag, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-sm">
                              <Barcode className="h-4 w-4" />
                              <span className="font-mono text-sm">{tag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowBaggageDetailDialog(false)}>Cancel</Button>
                <Button onClick={handleSaveBaggageDetails}>Save & Generate Tags</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* SSR Dialog */}
          <Dialog open={showSSRDialog} onOpenChange={setShowSSRDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Special Service Requests</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {selectedSSRPassenger && (
                  <>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="font-medium">{selectedSSRPassenger.passengerName}</div>
                      <div className="text-sm text-muted-foreground">Seat: {selectedSSRPassenger.seatNumber} | PNR: {selectedSSRPassenger.pnrNumber}</div>
                    </div>

                    <div>
                      <Label>Request Type</Label>
                      <Select value={selectedSSRType} onValueChange={(v: SSRType) => setSelectedSSRType(v)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wheelchair">Wheelchair Assistance</SelectItem>
                          <SelectItem value="meal">Special Meal</SelectItem>
                          <SelectItem value="assistance">Special Assistance</SelectItem>
                          <SelectItem value="pet">Pet in Cabin</SelectItem>
                          <SelectItem value="infant">Infant with Bassinet</SelectItem>
                          <SelectItem value="unaccompanied_minor">Unaccompanied Minor</SelectItem>
                          <SelectItem value="medical">Medical Condition</SelectItem>
                          <SelectItem value="other">Other Request</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Notes / Special Instructions</Label>
                      <Textarea
                        placeholder="Enter any special handling instructions..."
                        value={ssrNotes}
                        onChange={(e) => setSSRNotes(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    {getSSRCost(selectedSSRType) !== undefined && (
                      <div className="p-4 bg-primary/10 rounded-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Service Cost:</span>
                          <span className="text-xl font-bold">${getSSRCost(selectedSSRType)}</span>
                        </div>
                      </div>
                    )}

                    {ssrRequests[selectedSSRPassenger.passengerId]?.length > 0 && (
                      <div>
                        <Label className="mb-2 block">Existing Requests</Label>
                        <ScrollArea className="h-32 border rounded-md p-2">
                          {ssrRequests[selectedSSRPassenger.passengerId].map((ssr) => (
                            <div key={ssr.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <div className="text-sm font-medium">{ssr.description}</div>
                                {ssr.notes && <div className="text-xs text-muted-foreground">{ssr.notes}</div>}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getSSRStatusBadge(ssr.status)} className="capitalize text-xs">{ssr.status}</Badge>
                                {ssr.cost !== undefined && <span className="text-sm">${ssr.cost}</span>}
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>
                    )}
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSSRDialog(false)}>Close</Button>
                <Button onClick={handleAddSSR}>Add Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Document Validation Dialog */}
          <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Document Verification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                {selectedDocumentPassenger && (
                  <>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="font-medium">{selectedDocumentPassenger.passengerName}</div>
                      <div className="text-sm text-muted-foreground">Seat: {selectedDocumentPassenger.seatNumber} | PNR: {selectedDocumentPassenger.pnrNumber}</div>
                    </div>

                    {/* Add New Document */}
                    <div className="border rounded-md p-4 space-y-4">
                      <Label className="text-base font-medium">Add Document</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Document Type</Label>
                          <Select value={currentDocumentType} onValueChange={(v: DocumentType) => setCurrentDocumentType(v)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="visa">Visa</SelectItem>
                              <SelectItem value="health_certificate">Health Certificate</SelectItem>
                              <SelectItem value="national_id">National ID</SelectItem>
                              <SelectItem value="driving_license">Driving License</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Document Number</Label>
                          <Input
                            placeholder="Enter document number"
                            value={currentDocumentNumber}
                            onChange={(e) => setCurrentDocumentNumber(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Expiry Date</Label>
                          <Input
                            type="date"
                            value={currentDocumentExpiry}
                            onChange={(e) => setCurrentDocumentExpiry(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label>Issuing Country</Label>
                          <Input
                            placeholder="e.g., US, UK, CA"
                            value={currentDocumentCountry}
                            onChange={(e) => setCurrentDocumentCountry(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                          // Simulate document scan
                          setCurrentDocumentNumber(`DOC${Date.now()}`)
                          setCurrentDocumentExpiry('2026-12-31')
                          setCurrentDocumentCountry('US')
                        }}>
                          <Scan className="h-4 w-4 mr-2" />
                          Scan Document
                        </Button>
                        <Button onClick={handleSaveDocument}>Verify & Save</Button>
                      </div>
                    </div>

                    {/* Document Checklist */}
                    {documentInfo[selectedDocumentPassenger.passengerId]?.length > 0 && (
                      <div>
                        <Label className="text-base font-medium mb-2 block">Document Checklist</Label>
                        <ScrollArea className="h-48 border rounded-md">
                          <table className="w-full">
                            <thead className="bg-secondary/50">
                              <tr>
                                <th className="text-left p-2 text-sm">Type</th>
                                <th className="text-left p-2 text-sm">Number</th>
                                <th className="text-left p-2 text-sm">Expiry</th>
                                <th className="text-left p-2 text-sm">Country</th>
                                <th className="text-left p-2 text-sm">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {documentInfo[selectedDocumentPassenger.passengerId].map((doc, idx) => (
                                <tr key={idx} className="border-b">
                                  <td className="p-2 text-sm capitalize">{doc.type.replace('_', ' ')}</td>
                                  <td className="p-2 text-sm font-mono">{doc.number}</td>
                                  <td className="p-2 text-sm">{doc.expiryDate}</td>
                                  <td className="p-2 text-sm">{doc.issuingCountry}</td>
                                  <td className="p-2">
                                    <div className={`flex items-center gap-1 text-sm font-medium ${getDocumentStatusColor(doc.status)}`}>
                                      {doc.status === 'valid' && <CheckCircle className="h-4 w-4" />}
                                      {doc.status === 'expired' && <XCircle className="h-4 w-4" />}
                                      {doc.status === 'expiring_soon' && <AlertTriangle className="h-4 w-4" />}
                                      <span className="capitalize">{doc.status.replace('_', ' ')}</span>
                                    </div>
                                    {doc.alertReason && (
                                      <div className="text-xs text-muted-foreground mt-1">{doc.alertReason}</div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </ScrollArea>
                      </div>
                    )}

                    {/* Required Documents Summary */}
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <Label className="text-base font-medium mb-2 block">Required Documents</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Passport</span>
                          <Badge variant={documentInfo[selectedDocumentPassenger.passengerId]?.some(d => d.type === 'passport') ? 'default' : 'outline'}>
                            {documentInfo[selectedDocumentPassenger.passengerId]?.some(d => d.type === 'passport') ? 'Verified' : 'Required'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Visa (if required)</span>
                          <Badge variant="outline">Not Required</Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setShowDocumentDialog(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Boarding Tab */}
        <TabsContent value="boarding" className="space-y-4">
          {!boardingStarted ? (
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Boarding Control - {selectedFlight}</CardTitle>
                  <Button onClick={handleInitializeBoarding} disabled={checkInRecords.length === 0}>
                    <Plane className="h-4 w-4 mr-2" />
                    Initialize Boarding
                  </Button>
                </div>
                <CardDescription>
                  Initialize boarding process to start passenger boarding
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Boarding not initialized yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {checkInRecords.filter(c => c.flightNumber === selectedFlight).length} passengers checked in
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Boarding Control System */}
              <Card className="enterprise-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Boarding Control System</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setShowGateChangeDialog(true)}>
                        <Bell className="h-4 w-4 mr-2" />
                        Gate Change
                      </Button>
                      <Button variant="outline" onClick={handleCheckReconciliation}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check Reconciliation
                      </Button>
                      <Button variant="outline" onClick={() => setShowBoardingControlDialog(true)}>
                        <Settings className="h-4 w-4 mr-2" />
                        Boarding Controls
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Priority boarding, standby processing, gate management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Boarding Progress */}
                  <div className="p-4 bg-secondary/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Boarding Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {boardingPassengers.filter(p => p.status === 'boarded').length} / {boardingPassengers.length} ({Math.round((boardingPassengers.filter(p => p.status === 'boarded').length / boardingPassengers.length) * 100)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(boardingPassengers.filter(p => p.status === 'boarded').length / boardingPassengers.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Boarding Groups Status */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Preboard', group: 'preboard', count: boardingPassengers.filter(p => p.group === 'preboard' && p.status === 'boarded').length, total: 5 },
                      { name: 'Group 1', group: 'group1', count: boardingPassengers.filter(p => p.group === 'group1' && p.status === 'boarded').length, total: 40 },
                      { name: 'Group 2', group: 'group2', count: boardingPassengers.filter(p => p.group === 'group2' && p.status === 'boarded').length, total: 45 },
                      { name: 'Group 3', group: 'group3', count: boardingPassengers.filter(p => p.group === 'group3' && p.status === 'boarded').length, total: 35 }
                    ].map((g, i) => (
                      <div key={g.name} className={`p-3 rounded-sm text-center ${g.group === currentBoardingGroup ? 'bg-blue-100 border-blue-300' : 'bg-secondary/30'}`}>
                        <div className="font-medium text-sm">{g.name}</div>
                        <div className="text-lg font-bold">{g.count}/{g.total}</div>
                      </div>
                    ))}
                  </div>

                  {/* Priority/Standby Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="enterprise-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Priority Boarding</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Preboard</span>
                          <Badge variant="default">
                            {boardingPassengers.filter(p => p.group === 'preboard' && p.status === 'boarded').length}/5
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Group 1</span>
                          <Badge variant="outline">
                            {boardingPassengers.filter(p => p.group === 'group1' && p.status === 'boarded').length}/40
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Process Next Group
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="enterprise-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Standby</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Waiting</span>
                          <Badge variant="secondary">
                            {standbyList.filter(s => s.status === 'waiting').length}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={handleProcessStandby}
                          disabled={boardingPassengers.filter(p => p.status === 'boarded').length >= 175}
                          className="w-full"
                        >
                          Process Standby ({standbyList.length} waiting)
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Boarding Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setCurrentBoardingGroup(currentBoardingGroup === 'preboard' ? 'group1' : 'preboard')}>
                      {currentBoardingGroup === 'preboard' ? 'Start Regular Boarding' : 'Back to Priority'}
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentBoardingGroup('standby')}>
                      Handle Standby
                    </Button>
                    <Button variant="outline" onClick={() => setShowBoardingControlDialog(true)}>
                      View All Passengers
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Boarding Passengers List */}
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>Boarding Passengers ({boardingPassengers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <table className="enterprise-table">
                      <thead>
                        <tr>
                          <th>Sequence</th>
                          <th>Passenger</th>
                          <th>Seat</th>
                          <th>Group</th>
                          <th>Status</th>
                          <th>Time</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {boardingPassengers.map((passenger) => (
                          <tr key={passenger.id}>
                            <td className="font-medium">{passenger.sequence}</td>
                            <td className="text-sm">{passenger.passengerName}</td>
                            <td className="font-mono">{passenger.seatNumber}</td>
                            <td><Badge variant={passenger.group === 'preboard' ? 'default' : 'outline'}>{passenger.group}</Badge></td>
                            <td>
                              <Badge 
                                variant={
                                  passenger.status === 'boarded' ? 'default' : 
                                  passenger.status === 'boarding' ? 'secondary' : 
                                  passenger.status === 'offloaded' ? 'destructive' : 'outline'
                                }
                                className="capitalize"
                              >
                                {passenger.status}
                              </Badge>
                            </td>
                            <td className="text-sm">{passenger.boardingTime ? new Date(passenger.boardingTime).toLocaleTimeString() : '-'}</td>
                            <td>
                              <div className="flex items-center gap-1">
                                {passenger.status === 'not-boarded' && (
                                  <Button variant="ghost" size="sm" onClick={() => handleBoardPassenger(passenger)}>
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {passenger.status === 'boarded' && (
                                  <Button variant="ghost" size="sm" onClick={() => handleOffloadPassenger(passenger)}>
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Load & Balance Tab */}
        <TabsContent value="loadbalance" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weight & Balance - {selectedFlight}</CardTitle>
                <Button onClick={handleGenerateLoadSheetData}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Load Sheet
                </Button>
              </div>
              <CardDescription>
                Weight calculation, CG envelope, trim sheet, and load optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadSheetData ? (
                <div className="space-y-6">
                  {/* Critical Alerts */}
                  {loadSheetData.envelopeStatus !== 'in-envelope' && (
                    <div className={`p-4 border rounded-md ${loadSheetData.envelopeStatus === 'forward-limit' ? 'border-red-500 bg-red-50 dark:bg-red-950' : 'border-amber-500 bg-amber-50 dark:bg-amber-950'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <span className="font-medium">
                          {loadSheetData.envelope === 'forward-limit' ? 'CG OUT OF ENVELOPE (Forward Limit)' : 'CG OUT OF ENVELOPE (Aft Limit)'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Current CG: {loadSheetData.centerOfGravity}% | Limit: {loadSheetData.envelopeStatus === 'forward-limit' ? '22%' : '28%'}
                      </p>
                    </div>
                  )}

                  {/* Weight Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="text-sm text-muted-foreground">Takeoff Weight</div>
                      <div className="text-2xl font-bold mt-1">{(loadSheetData.takeoffWeight / 1000).toFixed(1)}t</div>
                    </div>
                    <div className={`p-4 rounded-sm ${loadSheetData.takeoffWeight > 79000 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="text-sm text-muted-foreground">Takeoff Weight</div>
                      <div className="text-2xl font-bold mt-1">{(loadSheetData.takeoffWeight / 1000).toFixed(1)}t</div>
                      {loadSheetData.takeoffWeight > 79000 && (
                        <div className="text-xs text-red-600 mt-1">Over MTOW (79,000kg)</div>
                      )}
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="text-sm text-muted-foreground">Zero Fuel Weight</div>
                      <div className="text-2xl font-bold mt-1">{(loadSheetData.zeroFuelWeight / 1000).toFixed(1)}t</div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="text-sm text-muted-landing-foreground">Fuel</div>
                      <div className="text-2xl font-bold mt-1">{(loadSheetData.fuelWeight / 1000).toFixed(1)}t</div>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-sm">
                      <div className="text-sm text-muted-foreground">CG Position</div>
                      <div className={`text-2xl font-bold mt-1 ${loadSheetData.centerOfGravity >= 22 && loadSheetData.centerOfGravity <= 28 ? 'text-green-600' : 'text-red-600'}`}>
                        {loadSheetData.centerOfGravity.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Weight Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="enterprise-card">
                      <CardHeader>
                        <CardTitle className="text-base">Weight Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span>Passengers</span>
                          <span className="font-medium">{(loadSheetData.passengerWeight / 1000).toFixed(1)}t</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Baggage</span>
                          <span className="font-medium">{(loadSheetData.baggageWeight / 1000).toFixed(1)}t</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Cargo</span>
                          <span className="font-medium">{(loadSheetData.cargoWeight / 1000).toFixed(1)}t</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Fuel</span>
                          <span className="font-medium">{(loadSheetData.fuelWeight / 1000).toFixed(1)}t</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span>Payload</span>
                          <span className="font-medium">{(loadSheetData.payloadWeight / 1000).toFixed(1)}t</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="enterprise-card">
                      <CardHeader>
                        <CardTitle className="text-base">Load Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span>Forward Cargo</span>
                            <span className="font-medium">{(loadSheetData.distribution.forward / 1000).toFixed(1)}t</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-3 bg-blue-500 transition-all"
                              style={{ width: `${(loadSheetData.distribution.forward / loadSheetData.payloadWeight * 100) || 50}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span>Aft Cargo</span>
                            <span className="font-medium">{(loadSheetData.distribution.aft / 1000).toFixed(1)}t</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-3 bg-purple-500 transition-all"
                              style={{ width: `${(loadSheetData.distribution.aft / loadSheetData.payloadWeight * 100) || 50}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span>Trim Setting</span>
                            <span className="font-medium">{loadSheetData.trimSetting}°</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gauge className="h-3 w-3" />
                            <span className="text-xs text-muted-foreground">Stabilizer trim</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* CG Envelope Visualization */}
                  <Card className="enterprise-card">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        CG Envelope
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative h-32 bg-white border-2 rounded-lg p-4">
                        {/* Envelope Diagram */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 h-28 w-0.5 bg-gray-300 rounded"></div>
                        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 h-28 w-px bg-gray-800 rounded-full"></div>
                        
                        {/* Envelope Area */}
                        <div 
                          className="absolute left-1/4 top-1/2 -translate-y-1/2 h-24 w-48 border-2 bg-gray-200 rounded"
                        >
                          {/* Current CG */}
                          <div 
                            className={`absolute top-1/2 -translate-y-1/2 left-4 w-1 h-1 bg-yellow-500 rounded-full border-2 border-yellow-600`}
                            style={{ left: `${Math.min(100, Math.max(0, loadSheetData.centerOfGravity))}%` }}
                          >
                            <div className="absolute top-1/2 -translate-y-1/2 left-1 w-full h-px bg-yellow-600 rounded-full" style={{ marginLeft: '-4px' }}></div>
                          </div>

                          {/* Envelope Limits */}
                          <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-full h-px bg-red-500/30 rounded-l border-red-800" style={{ left: '22%' }}></div>
                          <div className="absolute top-1/2 -translate-y-1/2 right-1/4 w-full h-px bg-red-500/30 rounded-r border-red-800" style={{ right: '22%' }}></div>

                          {/* Center Line */}
                          <div className="absolute top-1/2 -translate-y-1/2 left-1/4 w-full h-px bg-green-500/30 border-green-800"></div>

                          {/* Current CG Indicator */}
                          <div className="absolute top-1/2 -translate-y-1/2 left-4 w-full h-1 bg-blue-500 rounded-full border-2 border-blue-600 shadow-lg">
                            <div className="absolute top-1/2 -translate-y-1/2 left-1 w-full h-px bg-blue-400 rounded" style={{ marginLeft: '-4px' }}></div>
                          </div>
                        </div>

                        {/* Axis Labels */}
                        <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-muted-foreground px-1">
                          <span>20%</span>
                          <span>28%</span>
                          <span>Center</span>
                          <span>72%</span>
                          <span>80%</span>
                        </div>
                      </div>

                      {/* CG Status */}
                      <div className={`p-3 rounded-lg ${loadSheetData.envelopeStatus === 'in-envelope' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center gap-2">
                          {loadSheetData.envelopeStatus === 'in-envelope' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          )}
                          <span className={`font-medium ${loadSheetData.envelopeStatus === 'in-envelope' ? 'text-green-700' : 'text-red-700'}`}>
                            {loadSheetData.envelopeStatus === 'in-envelope' ? 'In Envelope' : 'OUT OF ENVELOPE'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {loadSheetData.envelopeStatus === 'in-envelope' ? 'All limits satisfied' : 'Adjust weight distribution'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Approval Section */}
                  <Card className="enterprise-card">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <Settings className="h-4 w-4" />
                        Load Sheet Control
                      </CardTitle>
                      <Switch
                        checked={manualOverride}
                        onCheckedChange={setManualOverride}
                      />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!loadSheetData.approved ? (
                        <Button 
                          onClick={handleApproveLoadSheet}
                          className="w-full"
                          disabled={loadSheetData.envelopeStatus !== 'in-envelope'}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Load Sheet
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span>Approved By</span>
                            <span className="font-medium">{loadSheetData.approvedBy}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Approved At</span>
                            <span className="font-medium">{new Date(loadSheetData.approvedAt!).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Status</span>
                            <Badge variant="default">Approved</Badge>
                          </div>
                          <Button variant="outline" onClick={() => setLoadSheetData(null)} className="w-full">
                            Reset Load Sheet
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" className="h-auto flex flex-col items-center justify-center gap-1" onClick={handleExportLoadSheet}>
                      <Download className="h-4 w-4" />
                      <span className="text-xs">Export</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex flex-col items-center justify-center gap-1" onClick={handlePrintLoadSheet}>
                      <Printer className="h-4 w-4" />
                      <span className="text-xs">Print</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex flex-col items-center justify-center gap-1" onClick={handleBackToCalculator}>
                      <ArrowLeft className="h-4 w-4" />
                      <span className="text-xs">Back to Calculator</span>
                    </Button>
                    <Button variant="outline" className="h-auto flex-col items-center justify-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">Alternate Airport</span>
                    </Button>
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
          {/* Baggage Management Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Total Bags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{baggageRecords.filter(b => b.flightNumber === selectedFlight).length}</div>
                <div className="text-xs text-muted-foreground">bags processed</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Reconciled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {reconciledBags.length}
                </div>
                <div className="text-xs text-muted-foreground">bags reconciled</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Mishandled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {mishandledBaggage.length}
                </div>
                <div className="text-xs text-muted-foreground">bags requiring attention</div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Controls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setShowBaggageReconciliationDialog(true)} className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reconcile All Bags
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Baggage Search and Actions */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Baggage Management - {selectedFlight}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by tag number, passenger, or PNR..." 
                    className="pl-8 w-64"
                    value={baggageSearch}
                    onChange={(e) => setBaggageSearch(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowBaggageDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Baggage
                </Button>
                <Button variant="outline" onClick={() => setShowBaggageReconciliationDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reconcile
                </Button>
                <Button variant="outline" onClick={() => setShowFeeCalculatorDialog(true)}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Fee Calculator
                </Button>
                <Button variant="outline" onClick={() => setShowExcessRulesDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Excess Rules
                </Button>
                <Button variant="outline" onClick={() => setShowSpecialBaggageDialog(true)}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Special Baggage
                </Button>
                <Button variant="outline" onClick={() => setShowDangerousGoodsDialog(true)}>
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Dangerous Goods
                </Button>
                <Button variant="outline" onClick={() => setShowInterlineDialog(true)}>
                  <Globe className="h-4 w-4 mr-2" />
                  Interline
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Tag</th>
                      <th>Passenger</th>
                      <th>PNR</th>
                      <th>Route</th>
                      <th>Weight</th>
                      <th>Pieces</th>
                      <th>Status</th>
                      <th>Carousel</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baggageRecords.filter(b => b.flightNumber === selectedFlight).filter(bag => 
                      !baggageSearch || 
                      bag.tagNumber.toLowerCase().includes(baggageSearch.toLowerCase()) ||
                      bag.passengerName.toLowerCase().includes(baggageSearch.toLowerCase()) ||
                      bag.pnrNumber.toLowerCase().includes(baggageSearch.toLowerCase())
                    ).map((bag, i) => (
                      <tr key={bag.id || i}>
                        <td className="font-mono text-sm">
                          {bag.tagNumber}
                        </td>
                        <td className="text-sm">{bag.passengerName}</td>
                        <td className="font-mono text-sm">{bag.pnrNumber}</td>
                        <td className="text-sm">
                          {bag.origin} <ArrowRight className="h-3 w-3" /> {bag.destination}
                        </td>
                        <td className="text-sm">{bag.weight} kg</td>
                        <td className="text-sm">{bag.pieces}</td>
                        <td>
                          <Badge 
                            variant={
                              bag.status === 'loaded' ? 'default' : 
                              bag.status === 'mishandled' ? 'destructive' : 'outline'
                            }
                            className="capitalize"
                          >
                            {bag.status}
                          </Badge>
                        </td>
                        <td>{bag.carousel || '-'}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => {
                              setBaggageTracking([...baggageTracking, {
                                ...bag,
                                id: `BT-${Date.now()}-${Math.random()}`,
                                lastScanned: new Date().toISOString()
                              }])
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              handleReportMishandled(bag)
                            }}>
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Baggage Reconciliation Dialog */}
          <Dialog open={showBaggageReconciliationDialog} onOpenChange={setShowBaggageReconciliationDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Baggage Reconciliation - {selectedFlight}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Reconciliation Results</p>
                    <p className="text-sm text-blue-700">
                      Matched {reconciledBags.length} of {baggageRecords.filter(b => b.flightNumber === selectedFlight).length} bags to passengers
                    </p>
                  </div>
                </div>

                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    {reconciledBags.map((bag, i) => (
                      <div key={bag.id} className="flex items-center justify-between p-3 bg-green-50 border-green-200 rounded">
                        <div className="flex items-center gap-3 flex-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="font-medium text-sm">{bag.tagNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {bag.passengerName} - {bag.pnrNumber}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bag.location} • {bag.origin} → {bag.destination}
                        </div>
                        <Badge variant="default" className="text-xs">
                          Matched ✓
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBaggageReconciliationDialog(false)}>
                    Close
                  </Button>
                  <Button onClick={() => setShowBaggageReconciliationDialog(false)}>
                    Complete Reconciliation
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Mishandled Baggage Dialog */}
          <Dialog open={showMishandledDialog} onOpenChange={setShowMishandledDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Mishandled Baggage Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Report and resolve mishandled baggage
                </p>

                {mishandledBaggage.length > 0 ? (
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2">
                      {mishandledBaggage.map((bag, i) => (
                        <div key={bag.id} className="p-3 border border-red-200 bg-red-50 rounded flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <div>
                              <div className="font-medium text-sm">{bag.tagNumber}</div>
                              <div className="text-xs text-muted-foreground">
                                {bag.passengerName} - {bag.pnrNumber}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleResolveMishandled(bag, 'Delivered to carousel')}>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleResolveMishandled(bag, 'Sent to final destination')}>
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No mishandled baggage reported</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowMishandledDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowMishandledDialog(false)
                }}>
                  View All Mishandled Reports
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Baggage Management Card */}
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
                            <Button variant="ghost" size="sm" title="Print Tag" onClick={() => handlePrintBaggageTag(bag)}>
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

          {/* Fee Calculator Dialog */}
          <Dialog open={showFeeCalculatorDialog} onOpenChange={setShowFeeCalculatorDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Baggage Fee Calculator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Route Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select route type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                      <SelectItem value="transatlantic">Transatlantic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cabin Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cabin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Baggage Weight (kg)</Label>
                  <Input type="number" placeholder="23" />
                </div>
                <div>
                  <Label>Number of Pieces</Label>
                  <Input type="number" placeholder="1" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowFeeCalculatorDialog(false)}>Cancel</Button>
                <Button onClick={() => { 
                  setCalculatedFees([
                    { type: 'Excess Baggage', amount: 150 },
                    { type: 'Handling Fee', amount: 50 }
                  ])
                  toast({ title: 'Fee Calculated', description: 'Total: $200' })
                }}>Calculate</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Special Baggage Dialog */}
          <Dialog open={showSpecialBaggageDialog} onOpenChange={setShowSpecialBaggageDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Special Baggage Handling</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Special Item Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="golf">Golf Equipment</SelectItem>
                      <SelectItem value="ski">Ski Equipment</SelectItem>
                      <SelectItem value="surf">Surfboard</SelectItem>
                      <SelectItem value="bicycle">Bicycle</SelectItem>
                      <SelectItem value="instrument">Musical Instrument</SelectItem>
                      <SelectItem value="pet">Pet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Length" />
                    <Input placeholder="Width" />
                    <Input placeholder="Height" />
                  </div>
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" placeholder="Weight" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSpecialBaggageDialog(false)}>Cancel</Button>
                <Button onClick={() => { 
                  setSpecialBaggageRequests([...specialBaggageRequests, {
                    id: `SBR-${Date.now()}`,
                    passengerName: 'New Request',
                    flightNumber: selectedFlight,
                    itemDescription: 'Special Item',
                    dimensions: '',
                    weight: 0,
                    status: 'pending',
                    approved: null,
                    requestedAt: new Date().toISOString()
                  }])
                  toast({ title: 'Special Baggage Request Submitted', description: 'Request added to queue' })
                  setShowSpecialBaggageDialog(false) 
                }}>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dangerous Goods Dialog */}
          <Dialog open={showDangerousGoodsDialog} onOpenChange={setShowDangerousGoodsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Dangerous Goods Declaration</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>UN Number</Label>
                  <Input placeholder="UN 1993" />
                </div>
                <div>
                  <Label>Proper Shipping Name</Label>
                  <Input placeholder="Flammable liquid" />
                </div>
                <div>
                  <Label>Class</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Class 3 - Flammable Liquids</SelectItem>
                      <SelectItem value="8">Class 8 - Corrosives</SelectItem>
                      <SelectItem value="2.1">Class 2.1 - Flammable Gas</SelectItem>
                      <SelectItem value="5.1">Class 5.1 - Oxidizers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity (kg)</Label>
                  <Input type="number" placeholder="Weight" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDangerousGoodsDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { 
                  setDangerousGoodsDeclarations([...dangerousGoodsDeclarations, {
                    id: `DG-${Date.now()}`,
                    flightNumber: selectedFlight,
                    unNumber: 'UN 1993',
                    properShippingName: 'Flammable liquid',
                    class: '3',
                    packingGroup: 'II',
                    quantity: 100,
                    unit: 'kg',
                    declaredBy: 'Crew',
                    declaredAt: new Date().toISOString()
                  }])
                  toast({ title: 'Dangerous Goods Declared', description: 'Declaration recorded' })
                  setShowDangerousGoodsDialog(false) 
                }}>Declare</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Interline Dialog */}
          <Dialog open={showInterlineDialog} onOpenChange={setShowInterlineDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Interline Baggage Agreement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Partner Airline</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select airline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aa">American Airlines</SelectItem>
                      <SelectItem value="ua">United Airlines</SelectItem>
                      <SelectItem value="dl">Delta Air Lines</SelectItem>
                      <SelectItem value="ba">British Airways</SelectItem>
                      <SelectItem value="lh">Lufthansa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Agreement Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="through">Through Check-in</SelectItem>
                      <SelectItem value="transfer">Transfer Baggage</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="active" />
                  <Label htmlFor="active">Active Agreement</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInterlineDialog(false)}>Cancel</Button>
                <Button onClick={() => { 
                  setInterlineAgreements([...interlineAgreements, {
                    id: `IA-${Date.now()}`,
                    airline: 'Partner Airline',
                    code: 'PA',
                    active: true
                  }])
                  toast({ title: 'Agreement Saved', description: 'Interline agreement saved' })
                  setShowInterlineDialog(false) 
                }}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Excess Baggage Rules Dialog */}
          <Dialog open={showExcessRulesDialog} onOpenChange={setShowExcessRulesDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Excess Baggage Rules</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Route</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                      <SelectItem value="all">All Routes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Excess Weight (per kg)</Label>
                  <Input type="number" placeholder="15" />
                </div>
                <div>
                  <Label>Excess Piece Fee</Label>
                  <Input type="number" placeholder="200" />
                </div>
                <div>
                  <Label>Max Weight per Piece (kg)</Label>
                  <Input type="number" placeholder="32" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowExcessRulesDialog(false)}>Cancel</Button>
                <Button onClick={() => { 
                  setExcessBaggageRules([
                    { type: 'excess_weight', rate: 15 },
                    { type: 'excess_piece', rate: 200 },
                    { type: 'max_weight', rate: 32 }
                  ])
                  toast({ title: 'Rules Saved', description: 'Excess baggage rules updated' })
                  setShowExcessRulesDialog(false) 
                }}>Save Rules</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
