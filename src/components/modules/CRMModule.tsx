'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
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
  MapPin,
  PieChart,
  BarChart3,
  LineChart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  RefreshCw,
  Send,
  Settings,
  Award,
  Gift,
  Plane,
  Coffee,
  Armchair,
  Utensils,
  Brain,
  Activity,
  Zap,
  Eye,
  Download,
  Upload,
  MoreHorizontal,
  ChevronRight,
  Flag,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Timer,
  UserCheck,
  Layers
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'
import { DEMO_PASSENGERS } from '@/lib/demoData'

// Extended interfaces for new features
interface CustomerSegmentData {
  name: string
  count: number
  percentage: number
  avgSpend: number
  avgLoyaltyTier: string
  growthRate: number
  criteria: string[]
  color: string
}

interface NPSScore {
  score: number
  promoters: number
  passives: number
  detractors: number
  totalResponses: number
  responseRate: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
}

interface NPSTrendData {
  month: string
  score: number
  promoters: number
  passives: number
  detractors: number
}

interface NPSSegmentData {
  segment: string
  score: number
  responses: number
}

interface CampaignTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  subject?: string
  body: string
  variables: string[]
}

interface ABTestGroup {
  id: string
  name: string
  percentage: number
  message: {
    subject: string
    body: string
  }
  metrics: {
    sent: number
    opened: number
    clicked: number
    converted: number
  }
}

interface CampaignAnalytics {
  campaignId: string
  campaignName: string
  sent: number
  delivered: number
  opened: number
  openRate: number
  clicked: number
  clickRate: number
  converted: number
  conversionRate: number
  unsubscribed: number
  revenue: number
}

interface ComplaintWorkflow {
  id: string
  complaintId: string
  customerName: string
  category: string
  subject: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'
  assignedTo: string
  slaHours: number
  createdAt: string
  dueDate: string
  resolvedAt?: string
  resolutionTimeHours?: number
  escalated: boolean
  escalationReason?: string
  notes: string[]
}

interface TravelPreference {
  customerId: string
  customerName: string
  seatType: string[]
  mealPreference: string
  cabinPreference: string
  bookingPattern: string
  avgDaysBeforeTravel: number
  ancillaryPurchaseRate: number
  favoriteRoutes: string[]
  lastUpdated: string
}

interface PartnerPoints {
  id: string
  partnerName: string
  partnerType: 'hotel' | 'car_rental' | 'credit_card' | 'shopping' | 'dining'
  pointsEarned: number
  pointsRedeemed: number
  conversionRate: number
  recentActivity: {
    date: string
    type: 'earn' | 'redeem'
    points: number
    description: string
  }[]
}

interface RewardRedemption {
  id: string
  customerId: string
  customerName: string
  rewardType: 'flight_upgrade' | 'lounge_access' | 'extra_baggage' | 'partner_hotel' | 'partner_car' | 'miles_transfer'
  pointsCost: number
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  requestedAt: string
  processedAt?: string
  details: string
}

export default function CRMModule() {
  const { customerProfiles, campaigns, complaints, addCustomer, createCampaign, logComplaint } = useAirlineStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('customers')
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  
  // Ref to ensure initialization only happens once
  const initializedRef = useRef(false)

  // Customer dialog state
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  // Segmentation state
  const [segmentationData, setSegmentationData] = useState<CustomerSegmentData[]>([])
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegmentData | null>(null)

  // NPS state
  const [npsScore, setNpsScore] = useState<NPSScore>({
    score: 45,
    promoters: 450,
    passives: 300,
    detractors: 250,
    totalResponses: 1000,
    responseRate: 23.5,
    trend: 'up',
    trendValue: 5.2
  })
  const [npsTrendData, setNpsTrendData] = useState<NPSTrendData[]>([])
  const [npsSegmentData, setNpsSegmentData] = useState<NPSSegmentData[]>([])
  const [showAddNPSDialog, setShowAddNPSDialog] = useState(false)
  const [newNPSRating, setNewNPSRating] = useState<number>(0)

  // Campaign Builder state
  const [showCampaignBuilderDialog, setShowCampaignBuilderDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null)
  const [campaignTemplates, setCampaignTemplates] = useState<CampaignTemplate[]>([])
  const [abTestGroups, setAbTestGroups] = useState<ABTestGroup[]>([])
  const [enableABTesting, setEnableABTesting] = useState(false)
  const [campaignSchedule, setCampaignSchedule] = useState({
    startDate: new Date().toISOString().split('T')[0],
    sendTime: '09:00',
    frequency: 'once' as 'once' | 'daily' | 'weekly' | 'monthly',
    automateEmail: true,
    automateSMS: false
  })
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'push',
    targetSegments: [] as string[],
    targetTiers: [] as string[],
    subject: '',
    body: ''
  })
  const [campaignAnalytics, setCampaignAnalytics] = useState<CampaignAnalytics[]>([])

  // Complaint Workflow state
  const [complaintWorkflows, setComplaintWorkflows] = useState<ComplaintWorkflow[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWorkflow | null>(null)
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false)
  const [newNote, setNewNote] = useState('')

  // Travel Preferences state
  const [travelPreferences, setTravelPreferences] = useState<TravelPreference[]>([])
  const [selectedPreference, setSelectedPreference] = useState<TravelPreference | null>(null)

  // Partner Points & Rewards state
  const [partnerPoints, setPartnerPoints] = useState<PartnerPoints[]>([])
  const [rewardRedemptions, setRewardRedemptions] = useState<RewardRedemption[]>([])
  const [showRedemptionDialog, setShowRedemptionDialog] = useState(false)
  const [newRedemption, setNewRedemption] = useState({
    customerId: '',
    rewardType: 'flight_upgrade' as 'flight_upgrade' | 'lounge_access' | 'extra_baggage' | 'partner_hotel' | 'partner_car' | 'miles_transfer',
    pointsCost: 0,
    details: ''
  })

  // Initialize mock data functions (must be declared before useEffect)
  const initializeSegmentationData = () => {
    const segments: CustomerSegmentData[] = [
      {
        name: 'Business',
        count: 3420,
        percentage: 34.2,
        avgSpend: 1250,
        avgLoyaltyTier: 'Gold',
        growthRate: 12.5,
        criteria: ['Frequent business travel', 'Corporate bookings', 'Flexible dates', 'Premium cabin preference'],
        color: 'bg-blue-500'
      },
      {
        name: 'Leisure',
        count: 4850,
        percentage: 48.5,
        avgSpend: 450,
        avgLoyaltyTier: 'Silver',
        growthRate: 8.3,
        criteria: ['Personal travel', 'Price sensitive', 'Advance bookings', 'Family travel'],
        color: 'bg-green-500'
      },
      {
        name: 'VIP',
        count: 280,
        percentage: 2.8,
        avgSpend: 3200,
        avgLoyaltyTier: 'Platinum',
        growthRate: 15.7,
        criteria: ['High lifetime value', 'Elite status', 'Premium services', 'Multi-year loyalty'],
        color: 'bg-purple-500'
      },
      {
        name: 'Student',
        count: 1450,
        percentage: 14.5,
        avgSpend: 320,
        avgLoyaltyTier: 'Base',
        growthRate: 22.1,
        criteria: ['Age 18-25', 'Discount fares', 'Flexible travel', 'Low frequency'],
        color: 'bg-orange-500'
      }
    ]
    setSegmentationData(segments)
  }

  const initializeNPSTrendData = () => {
    const trend: NPSTrendData[] = [
      { month: 'Jan-22', score: 32, promoters: 320, passives: 330, detractors: 350 },
      { month: 'Feb-22', score: 34, promoters: 340, passives: 320, detractors: 340 },
      { month: 'Mar-22', score: 35, promoters: 350, passives: 325, detractors: 325 },
      { month: 'Apr-22', score: 33, promoters: 330, passives: 340, detractors: 330 },
      { month: 'May-22', score: 36, promoters: 360, passives: 320, detractors: 320 },
      { month: 'Jun-22', score: 38, promoters: 380, passives: 310, detractors: 310 },
      { month: 'Jul-22', score: 37, promoters: 370, passives: 315, detractors: 315 },
      { month: 'Aug-22', score: 39, promoters: 390, passives: 305, detractors: 305 },
      { month: 'Sep-22', score: 38, promoters: 380, passives: 310, detractors: 310 },
      { month: 'Oct-22', score: 40, promoters: 400, passives: 300, detractors: 300 },
      { month: 'Nov-22', score: 41, promoters: 410, passives: 295, detractors: 295 },
      { month: 'Dec-22', score: 39, promoters: 390, passives: 305, detractors: 305 },
      { month: 'Jan-23', score: 38, promoters: 380, passives: 320, detractors: 300 },
      { month: 'Feb-23', score: 40, promoters: 400, passives: 310, detractors: 290 },
      { month: 'Mar-23', score: 42, promoters: 420, passives: 300, detractors: 280 },
      { month: 'Apr-23', score: 39, promoters: 390, passives: 320, detractors: 290 },
      { month: 'May-23', score: 43, promoters: 430, passives: 300, detractors: 270 },
      { month: 'Jun-23', score: 45, promoters: 450, passives: 300, detractors: 250 },
      { month: 'Jul-23', score: 44, promoters: 440, passives: 305, detractors: 255 },
      { month: 'Aug-23', score: 46, promoters: 460, passives: 295, detractors: 245 },
      { month: 'Sep-23', score: 44, promoters: 440, passives: 300, detractors: 260 },
      { month: 'Oct-23', score: 47, promoters: 470, passives: 290, detractors: 240 },
      { month: 'Nov-23', score: 46, promoters: 460, passives: 295, detractors: 245 },
      { month: 'Dec-23', score: 44, promoters: 440, passives: 305, detractors: 255 },
      { month: 'Jan-24', score: 43, promoters: 430, passives: 310, detractors: 260 },
      { month: 'Feb-24', score: 45, promoters: 450, passives: 305, detractors: 245 },
      { month: 'Mar-24', score: 46, promoters: 460, passives: 300, detractors: 240 },
      { month: 'Apr-24', score: 44, promoters: 440, passives: 310, detractors: 250 },
      { month: 'May-24', score: 47, promoters: 470, passives: 295, detractors: 235 },
      { month: 'Jun-24', score: 48, promoters: 480, passives: 290, detractors: 230 }
    ]
    setNpsTrendData(trend)
  }

  const initializeNPSSegmentData = () => {
    const segmentNPS: NPSSegmentData[] = [
      { segment: 'Business', score: 52, responses: 340 },
      { segment: 'Leisure', score: 41, responses: 485 },
      { segment: 'VIP', score: 78, responses: 28 },
      { segment: 'Student', score: 35, responses: 147 }
    ]
    setNpsSegmentData(segmentNPS)
  }

  const initializeCampaignTemplates = () => {
    const templates: CampaignTemplate[] = [
      {
        id: 'promo-booking',
        name: 'Promo Booking Campaign',
        type: 'email',
        subject: '🎉 Special Offer: Up to 30% Off Your Next Flight!',
        body: 'Dear {{customerName}},\n\nTake advantage of our exclusive offer and save up to 30% on your next booking. Use code: {{promoCode}}\n\nOffer valid until {{expiryDate}}.\n\nBest regards,\n{{airlineName}}',
        variables: ['customerName', 'promoCode', 'expiryDate', 'airlineName']
      },
      {
        id: 'loyalty-reminder',
        name: 'Loyalty Points Reminder',
        type: 'email',
        subject: 'You have {{points}} points waiting to be redeemed!',
        body: 'Dear {{customerName}},\n\nDid you know you have {{points}} loyalty points? Redeem them for upgrades, lounge access, and more!\n\nClick here to explore rewards.\n\nBest regards,\n{{airlineName}}',
        variables: ['customerName', 'points', 'airlineName']
      },
      {
        id: 'flight-reminder',
        name: 'Flight Reminder',
        type: 'sms',
        body: 'Hi {{customerName}}, your flight {{flightNumber}} from {{origin}} to {{destination}} departs on {{departureDate}}. Check in now to get your boarding pass.',
        variables: ['customerName', 'flightNumber', 'origin', 'destination', 'departureDate']
      },
      {
        id: 'feedback-request',
        name: 'Post-Flight Feedback',
        type: 'email',
        subject: 'How was your experience with {{airlineName}}?',
        body: 'Dear {{customerName}},\n\nWe value your feedback! Please take a moment to rate your recent flight from {{origin}} to {{destination}}.\n\nYour feedback helps us improve.\n\nRate your experience: {{feedbackLink}}\n\nThank you for flying with us!',
        variables: ['customerName', 'airlineName', 'origin', 'destination', 'feedbackLink']
      },
      {
        id: 'upgrade-offer',
        name: 'Upgrade Offer',
        type: 'email',
        subject: '✨ Upgrade to Business Class for your upcoming flight!',
        body: 'Dear {{customerName}},\n\nAs a valued {{tier}} member, we are pleased to offer you an exclusive upgrade to Business Class for your flight {{flightNumber}}.\n\nUpgrade fee: {{upgradePrice}}\n\nConfirm your upgrade now!',
        variables: ['customerName', 'tier', 'flightNumber', 'upgradePrice']
      }
    ]
    setCampaignTemplates(templates)
  }

  const initializeCampaignAnalytics = () => {
    const analytics: CampaignAnalytics[] = [
      {
        campaignId: 'camp-001',
        campaignName: 'Summer Sale 2024',
        sent: 50000,
        delivered: 48500,
        opened: 24250,
        openRate: 50.0,
        clicked: 7275,
        clickRate: 30.0,
        converted: 1455,
        conversionRate: 20.0,
        unsubscribed: 242,
        revenue: 145500
      },
      {
        campaignId: 'camp-002',
        campaignName: 'Loyalty Bonus',
        sent: 15000,
        delivered: 14850,
        opened: 9675,
        openRate: 65.2,
        clicked: 3870,
        clickRate: 40.0,
        converted: 1161,
        conversionRate: 30.0,
        unsubscribed: 48,
        revenue: 58050
      },
      {
        campaignId: 'camp-003',
        campaignName: 'New Route Launch',
        sent: 30000,
        delivered: 29100,
        opened: 11640,
        openRate: 40.0,
        clicked: 2330,
        clickRate: 20.0,
        converted: 465,
        conversionRate: 20.0,
        unsubscribed: 116,
        revenue: 23250
      }
    ]
    setCampaignAnalytics(analytics)
  }

  const initializeComplaintWorkflows = () => {
    const categories = ['flight_delay', 'baggage', 'service', 'cancellation', 'refund', 'seat', 'meal', 'lounge', 'upgrade', 'check_in']
    const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical']
    const statuses: Array<'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated'> = ['open', 'in_progress', 'resolved', 'closed', 'escalated']
    const agents = ['Sarah Johnson', 'Mike Wilson', 'Lisa Anderson', 'John Smith', 'Emily Brown', 'David Lee', 'Maria Garcia', 'Tom Wilson', 'Amy Chen', 'Bob Jones']
    const customers = ['James Smith', 'Mary Johnson', 'John Williams', 'Patricia Brown', 'Robert Jones', 'Jennifer Garcia', 'Michael Miller', 'Linda Davis', 'William Rodriguez', 'Elizabeth Martinez', 'David Hernandez', 'Barbara Lopez', 'Richard Gonzalez', 'Susan Wilson', 'Joseph Anderson', 'Jessica Thomas', 'Christopher Taylor', 'Nancy Moore', 'Daniel Jackson', 'Lisa Martin', 'Matthew Lee', 'Betty Perez', 'Anthony Thompson', 'Margaret White', 'Mark Harris', 'Sandra Clark', 'Donald Lewis', 'Ashley Robinson', 'Paul Walker', 'Emily Hall']
    const subjects = [
      'Missed connecting flight due to delay', 'Lost baggage on flight', 'Rude behavior from flight attendant', 'Flight cancelled without notice',
      'Refund not processed after 30 days', 'Seat assignment changed without notification', 'Special meal not provided', 'Lounge access denied',
      'Upgrade not applied despite payment', 'Long wait at check-in counter', 'Overbooking resulted in being bumped', 'Poor in-flight entertainment',
      'Wifi not working on flight', 'Gate change not communicated', 'Late baggage delivery', 'Damaged luggage received',
      'Incorrect fare charged', 'Priority boarding not honored', 'Child seat not available', 'Medical assistance delayed',
      'Special assistance not provided', 'Flight diverted without explanation', 'Crew shortage caused delay', 'Air conditioning not working',
      'Toilet facilities unclean', 'Pilot announcement unclear', 'Turbulence caused injury', 'Lost item on aircraft', 'Priority baggage not received'
    ]

    const workflows: ComplaintWorkflow[] = Array.from({ length: 30 }, (_, i) => ({
      id: `wf-${String(i + 1).padStart(3, '0')}`,
      complaintId: `CMP-${String(i + 1).padStart(6, '0')}`,
      customerName: customers[i],
      category: categories[i % categories.length],
      subject: subjects[i],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      assignedTo: agents[i % agents.length],
      slaHours: [12, 24, 48, 72][i % 4],
      createdAt: `2024-01-${String((i % 30) + 1).padStart(2, '0')}T${String(8 + (i * 2) % 12).padStart(2, '0')}:00:00Z`,
      dueDate: `2024-01-${String(((i % 30) + 2) % 30 + 1).padStart(2, '0')}T${String(8 + (i * 2) % 12).padStart(2, '0')}:00:00Z`,
      resolvedAt: statuses[i % statuses.length] === 'resolved' || statuses[i % statuses.length] === 'closed' ? `2024-01-${String(((i % 30) + 3) % 30 + 1).padStart(2, '0')}T${String(10 + (i * 2) % 12).padStart(2, '0')}:00:00Z` : undefined,
      resolutionTimeHours: statuses[i % statuses.length] === 'resolved' || statuses[i % statuses.length] === 'closed' ? 24 + i : undefined,
      escalated: i % 10 === 0,
      escalationReason: i % 10 === 0 ? 'Customer requested escalation' : undefined,
      notes: ['Initial complaint received', 'Customer contacted', 'Investigation in progress', 'Solution proposed'].slice(0, (i % 4) + 1)
    }))

    setComplaintWorkflows(workflows)
  }

  const initializeTravelPreferences = () => {
    const seatTypes = [['window'], ['aisle'], ['window', 'aisle'], ['middle'], ['window', 'middle']]
    const mealPrefs = ['vegetarian', 'no_preference', 'halal', 'kosher', 'vegan', 'gluten_free', 'diabetic', 'child_meal']
    const cabinPrefs = ['economy', 'business', 'first', 'premium_economy']
    const bookingPatterns = ['advance', 'last_minute', 'flexible']
    const routeSets = [
      ['JFK-LHR', 'JFK-CDG', 'LHR-JFK'],
      ['SFO-HND', 'LAX-NRT', 'SIN-HKG'],
      ['DXB-LHR', 'AUH-JFK', 'DOH-LAX'],
      ['FRA-JFK', 'AMS-LAX', 'CDG-SIN'],
      ['HKG-SYD', 'BKK-LHR', 'SIN-NRT'],
      ['JFK-MIA', 'ORD-LAX', 'DFW-ATL'],
      ['LAX-HNL', 'SFO-LAS', 'MIA-GRU'],
      ['LHR-DXB', 'CDG-FRA', 'AMS-IST'],
      ['JFK-SFO', 'BOS-LAX', 'PHL-ORD'],
      ['ATL-LHR', 'MIA-MAD', 'JFK-BCN']
    ]
    const customers = ['James Smith', 'Mary Johnson', 'John Williams', 'Patricia Brown', 'Robert Jones', 'Jennifer Garcia', 'Michael Miller', 'Linda Davis', 'William Rodriguez', 'Elizabeth Martinez', 'David Hernandez', 'Barbara Lopez', 'Richard Gonzalez', 'Susan Wilson', 'Joseph Anderson', 'Jessica Thomas', 'Christopher Taylor', 'Nancy Moore', 'Daniel Jackson', 'Lisa Martin', 'Matthew Lee', 'Betty Perez', 'Anthony Thompson', 'Margaret White', 'Mark Harris', 'Sandra Clark', 'Donald Lewis', 'Ashley Robinson', 'Paul Walker', 'Emily Hall']

    const prefs: TravelPreference[] = Array.from({ length: 30 }, (_, i) => ({
      customerId: `cust-${String(i + 1).padStart(3, '0')}`,
      customerName: customers[i],
      seatType: seatTypes[i % seatTypes.length],
      mealPreference: mealPrefs[i % mealPrefs.length],
      cabinPreference: cabinPrefs[i % cabinPrefs.length],
      bookingPattern: bookingPatterns[i % bookingPatterns.length],
      avgDaysBeforeTravel: 3 + (i * 5) % 28,
      ancillaryPurchaseRate: 0.2 + (i * 2.5) % 80 / 100,
      favoriteRoutes: routeSets[i % routeSets.length],
      lastUpdated: `2024-01-${String((i % 30) + 1).padStart(2, '0')}`
    }))

    setTravelPreferences(prefs)
  }

  const initializePartnerPoints = () => {
    const partnerTypes: Array<'hotel' | 'car_rental' | 'credit_card' | 'shopping' | 'dining'> = ['hotel', 'car_rental', 'credit_card', 'shopping', 'dining']
    const partnerNames = [
      'Hilton Hotels', 'Hertz Car Rental', 'Chase Sapphire', 'Marriott Bonvoy', 'Avis Rent a Car',
      'American Express', 'IHG Rewards', 'Budget Car Rental', 'Citi AAdvantage', 'Enterprise Rent-A-Car',
      'Hyatt Hotels', 'National Car Rental', 'Capital One', 'Wyndham Rewards', 'Alamo Rent a Car',
      'Best Western', 'Dollar Car Thrifty', 'Discover Card', 'Choice Hotels', 'Sixt Rent a Car',
      'Accor Hotels', 'Europcar', 'Bank of America', 'Radisson Rewards', 'Hertz Gold Plus Rewards'
    ]
    const activities = [
      { type: 'earn' as const, desc: 'Stay at property' },
      { type: 'redeem' as const, desc: 'Free night redemption' },
      { type: 'earn' as const, desc: 'Daily spend bonus' },
      { type: 'redeem' as const, desc: 'Points transfer' },
      { type: 'earn' as const, desc: 'Bonus points promotion' },
      { type: 'redeem' as const, desc: 'Upgrade redemption' }
    ]

    const partners: PartnerPoints[] = Array.from({ length: 30 }, (_, i) => {
      const earned = 50000 + (i * 15000)
      const redeemed = Math.floor(earned * (0.4 + (i % 6) * 0.1))
      return {
        id: `partner-${String(i + 1).padStart(3, '0')}`,
        partnerName: partnerNames[i % partnerNames.length],
        partnerType: partnerTypes[i % partnerTypes.length],
        pointsEarned: earned,
        pointsRedeemed: redeemed,
        conversionRate: 1.0 + (i % 5) * 0.3,
        recentActivity: Array.from({ length: 3 }, (_, j) => ({
          date: `2024-01-${String((j + 1) % 30 + 1).padStart(2, '0')}`,
          type: activities[(i + j) % activities.length].type,
          points: 1000 + ((i + j) * 500) % 10000,
          description: `${activities[(i + j) % activities.length].desc} - ${partnerNames[i % partnerNames.length]}`
        }))
      }
    })

    setPartnerPoints(partners)
  }

  const initializeRewardRedemptions = () => {
    const rewardTypes: Array<'flight_upgrade' | 'lounge_access' | 'extra_baggage' | 'partner_hotel' | 'partner_car' | 'miles_transfer'> = ['flight_upgrade', 'lounge_access', 'extra_baggage', 'partner_hotel', 'partner_car', 'miles_transfer']
    const statuses: Array<'pending' | 'approved' | 'completed' | 'rejected'> = ['pending', 'approved', 'completed', 'rejected']
    const customers = ['James Smith', 'Mary Johnson', 'John Williams', 'Patricia Brown', 'Robert Jones', 'Jennifer Garcia', 'Michael Miller', 'Linda Davis', 'William Rodriguez', 'Elizabeth Martinez', 'David Hernandez', 'Barbara Lopez', 'Richard Gonzalez', 'Susan Wilson', 'Joseph Anderson', 'Jessica Thomas', 'Christopher Taylor', 'Nancy Moore', 'Daniel Jackson', 'Lisa Martin', 'Matthew Lee', 'Betty Perez', 'Anthony Thompson', 'Margaret White', 'Mark Harris', 'Sandra Clark', 'Donald Lewis', 'Ashley Robinson', 'Paul Walker', 'Emily Hall']
    const details = [
      'Upgrade from Economy to Business on flight', 'Lounge access at JFK Terminal 7', 'Free night at Hilton London Heathrow',
      'Extra baggage allowance for international flight', 'Free weekend car rental with Hertz', 'Points transfer to family member account',
      'Business class upgrade on transatlantic flight', 'Priority boarding and fast track security', 'Complimentary hotel stay during layover',
      'Premium economy seat selection', 'Free car rental upgrade', 'Miles transfer to airline partner',
      'First class upgrade award redemption', 'Lounge access at international hub', 'Free night at partner resort',
      'Additional checked baggage allowance', 'Luxury car rental for weekend', 'Points transfer to spouse account',
      'Suite upgrade at partner hotel', 'Airport transfer service', 'Miles donation to charity program',
      'Flight upgrade for companion travel', 'Annual lounge membership', 'Free hotel night with breakfast',
      'Excess baggage waiver', 'Premium car rental category upgrade', 'Points transfer to corporate account'
    ]

    const redemptions: RewardRedemption[] = Array.from({ length: 30 }, (_, i) => {
      const status = statuses[i % statuses.length]
      return {
        id: `red-${String(i + 1).padStart(3, '0')}`,
        customerId: `cust-${String(i + 1).padStart(3, '0')}`,
        customerName: customers[i],
        rewardType: rewardTypes[i % rewardTypes.length],
        pointsCost: 5000 + (i * 3000) % 50000,
        status: status,
        requestedAt: `2024-01-${String((i % 30) + 1).padStart(2, '0')}T${String(8 + (i * 2) % 12).padStart(2, '0')}:00:00Z`,
        processedAt: status !== 'pending' ? `2024-01-${String(((i % 30) + 2) % 30 + 1).padStart(2, '0')}T${String(10 + (i * 2) % 12).padStart(2, '0')}:00:00Z` : undefined,
        details: `${details[i % details.length]} - ${['JFK-LHR', 'LAX-NRT', 'SFO-HKG', 'ORD-MIA', 'DFW-ATL'][i % 5]}`
      }
    })

    setRewardRedemptions(redemptions)
  }

  // Initialize mock data on component mount (once)
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    
    setTimeout(() => {
      initializeSegmentationData()
      initializeNPSTrendData()
      initializeNPSSegmentData()
      initializeCampaignTemplates()
      initializeCampaignAnalytics()
      initializeComplaintWorkflows()
      initializeTravelPreferences()
      initializePartnerPoints()
      initializeRewardRedemptions()
    }, 0)
  }, [])

  // Handlers
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
    setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' })
  }

  const handleSelectTemplate = (template: CampaignTemplate) => {
    setSelectedTemplate(template)
    setNewCampaign({
      ...newCampaign,
      type: template.type,
      subject: template.subject || '',
      body: template.body
    })
  }

  const handleCreateCampaign = () => {
    createCampaign({
      name: newCampaign.name,
      type: newCampaign.type,
      message: {
        subject: newCampaign.subject,
        body: newCampaign.body,
        template: selectedTemplate?.id || ''
      },
      schedule: {
        startDate: campaignSchedule.startDate,
        sendTime: campaignSchedule.sendTime,
        frequency: campaignSchedule.frequency
      }
    })
    setShowCampaignBuilderDialog(false)
    resetCampaignForm()
  }

  const resetCampaignForm = () => {
    setNewCampaign({
      name: '',
      type: 'email',
      targetSegments: [],
      targetTiers: [],
      subject: '',
      body: ''
    })
    setSelectedTemplate(null)
    setEnableABTesting(false)
    setAbTestGroups([])
  }

  const handleUpdateComplaintStatus = (workflowId: string, newStatus: string) => {
    setComplaintWorkflows(prev =>
      prev.map(wf =>
        wf.id === workflowId
          ? {
              ...wf,
              status: newStatus as any,
              resolvedAt: newStatus === 'resolved' || newStatus === 'closed' ? new Date().toISOString() : undefined,
              resolutionTimeHours: newStatus === 'resolved' || newStatus === 'closed'
                ? Math.round((new Date().getTime() - new Date(wf.createdAt).getTime()) / (1000 * 60 * 60))
                : undefined
            }
          : wf
      )
    )
  }

  const handleAddNote = (workflowId: string) => {
    if (!newNote.trim()) return
    setComplaintWorkflows(prev =>
      prev.map(wf =>
        wf.id === workflowId
          ? { ...wf, notes: [...wf.notes, newNote] }
          : wf
      )
    )
    setNewNote('')
  }

  const handleEscalateComplaint = (workflowId: string, reason: string) => {
    setComplaintWorkflows(prev =>
      prev.map(wf =>
        wf.id === workflowId
          ? {
              ...wf,
              status: 'escalated',
              escalated: true,
              escalationReason: reason,
              priority: 'critical'
            }
          : wf
      )
    )
  }

  const handleCreateRedemption = () => {
    const customer = customerProfiles.find(c => c.id === newRedemption.customerId)
    if (!customer) return

    const redemption: RewardRedemption = {
      id: `red-${Date.now()}`,
      customerId: newRedemption.customerId,
      customerName: `${customer.firstName} ${customer.lastName}`,
      rewardType: newRedemption.rewardType,
      pointsCost: newRedemption.pointsCost,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      details: newRedemption.details
    }

    setRewardRedemptions(prev => [redemption, ...prev])
    setShowRedemptionDialog(false)
    setNewRedemption({
      customerId: '',
      rewardType: 'flight_upgrade',
      pointsCost: 0,
      details: ''
    })
  }

  const handleProcessRedemption = (redemptionId: string, action: 'approve' | 'reject') => {
    setRewardRedemptions(prev =>
      prev.map(r =>
        r.id === redemptionId
          ? {
              ...r,
              status: action === 'approve' ? 'approved' : 'rejected',
              processedAt: new Date().toISOString()
            }
          : r
      )
    )
  }

  const handleAddNPSRating = () => {
    if (newNPSRating === 0) return
    const updatedPromoters = newNPSRating >= 9 ? npsScore.promoters + 1 : npsScore.promoters
    const updatedPassives = newNPSRating >= 7 && newNPSRating <= 8 ? npsScore.passives + 1 : npsScore.passives
    const updatedDetractors = newNPSRating <= 6 ? npsScore.detractors + 1 : npsScore.detractors
    const total = updatedPromoters + updatedPassives + updatedDetractors
    const newScore = Math.round(((updatedPromoters - updatedDetractors) / total) * 100)

    setNpsScore({
      score: newScore,
      promoters: updatedPromoters,
      passives: updatedPassives,
      detractors: updatedDetractors,
      totalResponses: total,
      responseRate: Math.round((total / 4255) * 100 * 10) / 10,
      trend: newScore > npsScore.score ? 'up' : newScore < npsScore.score ? 'down' : 'stable',
      trendValue: Math.abs(newScore - npsScore.score)
    })
    setNewNPSRating(0)
    setShowAddNPSDialog(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">CRM & Loyalty</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Customer Segmentation, NPS Tracking, Campaigns, and Rewards
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Summary Cards */}
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
            <CardTitle className="text-sm font-medium text-muted-foreground">NPS Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{npsScore.score}</div>
            <div className="text-xs text-green-600 mt-1">
              {npsScore.trend === 'up' && <ArrowUp className="h-3 w-3 inline mr-1" />}
              {npsScore.trend === 'down' && <ArrowDown className="h-3 w-3 inline mr-1" />}
              {npsScore.trendValue}% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Complaints</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {complaintWorkflows.filter(c => c.status === 'open').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">requiring attention</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="customers">Customer Profiles</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
          <TabsTrigger value="nps">NPS Tracking</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="campaign-builder">Campaign Builder</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="complaint-workflow">Complaint Workflow</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="partners">Partner Points</TabsTrigger>
        </TabsList>

        {/* Customer Profiles Tab */}
        <TabsContent value="customers">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Customer Profiles</CardTitle>
              <CardDescription>Manage customer information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-80">
                <table className="enterprise-table min-w-[1000px]">
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
                    {customerProfiles.slice(0, 30).map((customer) => (
                      <tr key={customer.id}>
                        <td className="font-medium">{customer.firstName} {customer.lastName}</td>
                        <td className="text-sm">
                          <div className="flex items-center flex-wrap gap-1">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Segmentation Tab */}
        <TabsContent value="segmentation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center flex-wrap gap-2">
                  <Layers className="h-5 w-5" />
                  Customer Segments
                </CardTitle>
                <CardDescription>Analytics by customer segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segmentationData.map((segment) => (
                    <div
                      key={segment.name}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedSegment?.name === segment.name ? 'border-primary bg-primary/10' : 'border-border'}`}
                      onClick={() => setSelectedSegment(segment)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center flex-wrap gap-3">
                          <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                          <h3 className="font-semibold text-lg">{segment.name}</h3>
                        </div>
                        <Badge variant="outline">{segment.percentage}%</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Count</div>
                          <div className="font-semibold">{segment.count.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Spend</div>
                          <div className="font-semibold">${segment.avgSpend.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Growth</div>
                          <div className="font-semibold text-green-600">
                            <ArrowUp className="h-3 w-3 inline mr-1" />
                            {segment.growthRate}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Segment Details</CardTitle>
                <CardDescription>
                  {selectedSegment ? selectedSegment.name : 'Select a segment to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSegment ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="text-sm text-muted-foreground">Total Customers</div>
                        <div className="text-2xl font-bold">{selectedSegment.count.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground mt-1">{selectedSegment.percentage}% of total</div>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="text-sm text-muted-foreground">Average Loyalty Tier</div>
                        <div className="text-2xl font-bold capitalize">{selectedSegment.avgLoyaltyTier}</div>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="text-sm text-muted-foreground">Average Spend</div>
                        <div className="text-2xl font-bold">${selectedSegment.avgSpend.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground mt-1">per trip</div>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="text-sm text-muted-foreground">Growth Rate</div>
                        <div className="text-2xl font-bold text-green-600">
                          <ArrowUp className="h-4 w-4 inline mr-1" />
                          {selectedSegment.growthRate}%
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">year over year</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Segmentation Criteria</h4>
                      <div className="space-y-2">
                        {selectedSegment.criteria.map((criterion, idx) => (
                          <div key={idx} className="flex items-center flex-wrap gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {criterion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a segment to view detailed analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NPS Tracking Tab */}
        <TabsContent value="nps">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">NPS Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{npsScore.score}</div>
                  <div className={`text-sm mt-1 ${npsScore.trend === 'up' ? 'text-green-600' : npsScore.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {npsScore.trend === 'up' && <ArrowUp className="h-4 w-4 inline mr-1" />}
                    {npsScore.trend === 'down' && <ArrowDown className="h-4 w-4 inline mr-1" />}
                    {npsScore.trendValue}% from last month
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Promoters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{npsScore.promoters}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {Math.round((npsScore.promoters / npsScore.totalResponses) * 100)}% of respondents
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Passives</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{npsScore.passives}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {Math.round((npsScore.passives / npsScore.totalResponses) * 100)}% of respondents
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Detractors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{npsScore.detractors}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {Math.round((npsScore.detractors / npsScore.totalResponses) * 100)}% of respondents
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>NPS Trend Over Time</CardTitle>
                  <CardDescription>Last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {npsTrendData.map((data, idx) => (
                      <div key={idx} className="flex items-center flex-wrap gap-4">
                        <div className="w-16 text-sm text-muted-foreground">{data.month}</div>
                        <div className="flex-1">
                          <div className="h-8 bg-secondary/30 rounded relative overflow-hidden">
                            <div
                              className={`absolute left-0 top-0 h-full rounded transition-all ${
                                data.score >= 50 ? 'bg-green-500' : data.score >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.abs(data.score)}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                              {data.score}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="enterprise-card">
                <CardHeader>
                  <CardTitle>NPS by Customer Segment</CardTitle>
                  <CardDescription>Score breakdown by segment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {npsSegmentData.map((data, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{data.segment}</span>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="font-semibold">{data.score}</span>
                            <Badge variant="outline">{data.responses} responses</Badge>
                          </div>
                        </div>
                        <div className="h-3 bg-secondary/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              data.score >= 50 ? 'bg-green-500' : data.score >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(data.score + 100) / 2}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Add NPS Rating</CardTitle>
                    <CardDescription>Record a customer's NPS rating</CardDescription>
                  </div>
                  <Dialog open={showAddNPSDialog} onOpenChange={setShowAddNPSDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Rating
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Record NPS Rating</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>How likely are you to recommend us? (0-10)</Label>
                          <div className="flex items-center flex-wrap gap-2 mt-2">
                            <Slider
                              value={[newNPSRating]}
                              onValueChange={(v) => setNewNPSRating(v[0])}
                              min={0}
                              max={10}
                              step={1}
                              className="flex-1"
                            />
                            <div className="w-12 text-center font-bold text-lg">{newNPSRating}</div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Not likely</span>
                            <span>Very likely</span>
                          </div>
                        </div>
                        {newNPSRating >= 9 && (
                          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-700">
                            <ThumbsUp className="h-4 w-4 inline mr-2" />
                            Promoter: Likely to recommend
                          </div>
                        )}
                        {newNPSRating >= 7 && newNPSRating <= 8 && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-700">
                            <Minus className="h-4 w-4 inline mr-2" />
                            Passive: Satisfied but unenthusiastic
                          </div>
                        )}
                        {newNPSRating <= 6 && newNPSRating > 0 && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-700">
                            <ThumbsDown className="h-4 w-4 inline mr-2" />
                            Detractor: Unlikely to recommend
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddNPSDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddNPSRating}>Save Rating</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="font-medium">Promoters (9-10)</span>
                    </div>
                    <div className="text-2xl font-bold">{npsScore.promoters.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Loyal enthusiasts</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="font-medium">Passives (7-8)</span>
                    </div>
                    <div className="text-2xl font-bold">{npsScore.passives.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Satisfied but unenthusiastic</div>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <span className="font-medium">Detractors (0-6)</span>
                    </div>
                    <div className="text-2xl font-bold">{npsScore.detractors.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Unhappy customers</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Response Rate</div>
                      <div className="text-xl font-bold">{npsScore.responseRate}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Responses</div>
                      <div className="text-xl font-bold">{npsScore.totalResponses.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loyalty Program Tab */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

        {/* Campaigns Tab */}
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
              <div className="overflow-x-auto h-80">
                <table className="enterprise-table min-w-[1000px]">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Builder Tab */}
        <TabsContent value="campaign-builder">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Campaign Builder</h3>
                <p className="text-sm text-muted-foreground">Create and manage marketing campaigns</p>
              </div>
              <Dialog open={showCampaignBuilderDialog} onOpenChange={setShowCampaignBuilderDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Campaign</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Campaign Templates */}
                    <div>
                      <Label className="text-base font-semibold">Select Template</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {campaignTemplates.map((template) => (
                          <div
                            key={template.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedTemplate?.id === template.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleSelectTemplate(template)}
                          >
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              {template.type === 'email' && <Mail className="h-4 w-4" />}
                              {template.type === 'sms' && <Phone className="h-4 w-4" />}
                              <span className="font-medium">{template.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {template.subject || template.body}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Campaign Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Campaign Name</Label>
                        <Input
                          value={newCampaign.name}
                          onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                          placeholder="Summer Sale 2024"
                        />
                      </div>
                      <div>
                        <Label>Campaign Type</Label>
                        <Select
                          value={newCampaign.type}
                          onValueChange={(v) => setNewCampaign({...newCampaign, type: v as any})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="push">Push Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Targeting */}
                    <div>
                      <Label>Target Segments</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {segmentationData.map((seg) => (
                          <Badge
                            key={seg.name}
                            variant={newCampaign.targetSegments.includes(seg.name) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => {
                              setNewCampaign(prev => ({
                                ...prev,
                                targetSegments: prev.targetSegments.includes(seg.name)
                                  ? prev.targetSegments.filter(s => s !== seg.name)
                                  : [...prev.targetSegments, seg.name]
                              }))
                            }}
                          >
                            {seg.name}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Target Tiers</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['base', 'silver', 'gold', 'platinum', 'elite'].map((tier) => (
                          <Badge
                            key={tier}
                            variant={newCampaign.targetTiers.includes(tier) ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() => {
                              setNewCampaign(prev => ({
                                ...prev,
                                targetTiers: prev.targetTiers.includes(tier)
                                  ? prev.targetTiers.filter(t => t !== tier)
                                  : [...prev.targetTiers, tier]
                              }))
                            }}
                          >
                            {tier}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Message Content */}
                    {newCampaign.type === 'email' && (
                      <div>
                        <Label>Subject Line</Label>
                        <Input
                          value={newCampaign.subject}
                          onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                          placeholder="Special offer inside!"
                        />
                      </div>
                    )}
                    <div>
                      <Label>Message Body</Label>
                      <Textarea
                        value={newCampaign.body}
                        onChange={(e) => setNewCampaign({...newCampaign, body: e.target.value})}
                        placeholder="Your message here..."
                        rows={6}
                      />
                      {selectedTemplate && (
                        <div className="mt-2">
                          <Label className="text-xs text-muted-foreground">Available Variables:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedTemplate.variables.map((v) => (
                              <Badge key={v} variant="outline" className="text-xs">
                                {'{{'}{v}{'}}'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scheduling */}
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Schedule & Automation</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={campaignSchedule.startDate}
                            onChange={(e) => setCampaignSchedule({...campaignSchedule, startDate: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Send Time</Label>
                          <Input
                            type="time"
                            value={campaignSchedule.sendTime}
                            onChange={(e) => setCampaignSchedule({...campaignSchedule, sendTime: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Frequency</Label>
                          <Select
                            value={campaignSchedule.frequency}
                            onValueChange={(v) => setCampaignSchedule({...campaignSchedule, frequency: v as any})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="once">Once</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-6 mt-4">
                        <div className="flex items-center flex-wrap gap-2">
                          <Switch
                            checked={campaignSchedule.automateEmail}
                            onCheckedChange={(v) => setCampaignSchedule({...campaignSchedule, automateEmail: v})}
                          />
                          <Label className="cursor-pointer">Auto-send Email</Label>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                          <Switch
                            checked={campaignSchedule.automateSMS}
                            onCheckedChange={(v) => setCampaignSchedule({...campaignSchedule, automateSMS: v})}
                          />
                          <Label className="cursor-pointer">Auto-send SMS</Label>
                        </div>
                      </div>
                    </div>

                    {/* A/B Testing */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-base font-semibold">A/B Testing</Label>
                        <Switch
                          checked={enableABTesting}
                          onCheckedChange={setEnableABTesting}
                        />
                      </div>
                      {enableABTesting && (
                        <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label>Group A Name</Label>
                              <Input placeholder="Control Group" />
                            </div>
                            <div>
                              <Label>Group B Name</Label>
                              <Input placeholder="Test Group" />
                            </div>
                          </div>
                          <div>
                            <Label>Test Group Percentage: {50}%</Label>
                            <Slider
                              value={[50]}
                              min={10}
                              max={50}
                              step={10}
                              className="mt-2"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setShowCampaignBuilderDialog(false); resetCampaignForm() }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCampaign}>
                      <Send className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Campaign Analytics Dashboard */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Campaign Analytics</CardTitle>
                <CardDescription>Performance metrics for all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto h-80">
                  <table className="enterprise-table min-w-[1000px]">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Sent</th>
                        <th>Open Rate</th>
                        <th>Click Rate</th>
                        <th>Conversion Rate</th>
                        <th>Revenue</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignAnalytics.map((analytics) => (
                        <tr key={analytics.campaignId}>
                          <td className="font-medium">{analytics.campaignName}</td>
                          <td className="text-sm">{analytics.sent.toLocaleString()}</td>
                          <td>
                            <Badge variant={analytics.openRate >= 50 ? 'default' : analytics.openRate >= 30 ? 'secondary' : 'outline'}>
                              {analytics.openRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td>
                            <Badge variant={analytics.clickRate >= 30 ? 'default' : analytics.clickRate >= 20 ? 'secondary' : 'outline'}>
                              {analytics.clickRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td>
                            <Badge variant={analytics.conversionRate >= 25 ? 'default' : analytics.conversionRate >= 15 ? 'secondary' : 'outline'}>
                              {analytics.conversionRate.toFixed(1)}%
                            </Badge>
                          </td>
                          <td className="font-medium text-green-600">${analytics.revenue.toLocaleString()}</td>
                          <td>
                            <Button size="sm" variant="ghost" onClick={() => toast({ 
                              title: `Campaign: ${analytics.campaignName}`, 
                              description: `Sent: ${analytics.sent}, Opened: ${analytics.opened}, Clicked: ${analytics.clicked}, Revenue: $${analytics.revenue.toLocaleString()}` 
                            })}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Complaints Tab (Original) */}
        <TabsContent value="complaints">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Customer Complaints</CardTitle>
              <CardDescription>Track and resolve customer feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-80">
                <table className="enterprise-table min-w-[1100px]">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaint Workflow Tab */}
        <TabsContent value="complaint-workflow">
          <div className="space-y-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Complaint Workflow Management</CardTitle>
                <CardDescription>SLA tracking, resolution workflow, and escalation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto h-96">
                  <table className="enterprise-table min-w-[1100px]">
                    <thead>
                      <tr>
                        <th>Complaint ID</th>
                        <th>Customer</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>SLA</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaintWorkflows.map((wf) => (
                        <tr key={wf.id}>
                          <td className="font-mono text-sm">{wf.complaintId}</td>
                          <td className="text-sm">{wf.customerName}</td>
                          <td className="capitalize text-sm">{wf.category.replace('_', ' ')}</td>
                          <td>
                            <Badge
                              variant={
                                wf.priority === 'critical' ? 'destructive' :
                                wf.priority === 'high' ? 'secondary' : 'outline'
                              }
                              className="capitalize"
                            >
                              {wf.priority}
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              variant={
                                wf.status === 'open' ? 'destructive' :
                                wf.status === 'resolved' ? 'default' :
                                wf.status === 'escalated' ? 'secondary' : 'outline'
                              }
                              className="capitalize"
                            >
                              {wf.status.replace('_', ' ')}
                            </Badge>
                            {wf.escalated && <Flag className="h-3 w-3 inline ml-1 text-red-600" />}
                          </td>
                          <td className="text-sm">
                            <div className="flex items-center flex-wrap gap-1">
                              <Timer className="h-3 w-3" />
                              {wf.slaHours}h
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Due: {new Date(wf.dueDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="text-sm">{wf.assignedTo}</td>
                          <td>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setSelectedComplaint(wf); setShowWorkflowDialog(true) }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Status Timeline */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Resolution Workflow</CardTitle>
                <CardDescription>Complaint status flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {[
                    { status: 'open', label: 'Open', icon: AlertCircle },
                    { status: 'in_progress', label: 'In Progress', icon: Activity },
                    { status: 'resolved', label: 'Resolved', icon: CheckCircle },
                    { status: 'closed', label: 'Closed', icon: UserCheck }
                  ].map((step, idx) => (
                    <div key={step.status} className="flex-1 flex items-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <step.icon className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm mt-2 font-medium">{step.label}</span>
                      </div>
                      {idx < 3 && <ChevronRight className="h-5 w-5 text-muted-foreground mx-2" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Travel Preferences Tab */}
        <TabsContent value="preferences">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center flex-wrap gap-2">
                  <Settings className="h-5 w-5" />
                  Travel Preferences
                </CardTitle>
                <CardDescription>Customer preference tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-y-auto h-96">
                  <div className="space-y-3">
                    {travelPreferences.map((pref) => (
                      <div
                        key={pref.customerId}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPreference?.customerId === pref.customerId
                            ? 'border-primary bg-primary/10'
                            : 'border-border'
                        }`}
                        onClick={() => setSelectedPreference(pref)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{pref.customerName}</h3>
                          <Badge variant="outline">{pref.cabinPreference}</Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center flex-wrap gap-2">
                            <Armchair className="h-4 w-4 text-muted-foreground" />
                            {pref.seatType.join(', ')}
                          </div>
                          <div className="flex items-center flex-wrap gap-2">
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                            {pref.mealPreference}
                          </div>
                          <div className="flex items-center flex-wrap gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {pref.bookingPattern.replace('_', ' ')}
                          </div>
                          <div className="flex items-center flex-wrap gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            {pref.ancillaryPurchaseRate * 100}% ancillary rate
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle>Preference Details</CardTitle>
                <CardDescription>
                  {selectedPreference ? selectedPreference.customerName : 'Select a customer to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPreference ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                          <Armchair className="h-4 w-4" />
                          Seat Preference
                        </div>
                        <div className="font-semibold">{selectedPreference.seatType.join(', ')}</div>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                          <Utensils className="h-4 w-4" />
                          Meal Preference
                        </div>
                        <div className="font-semibold capitalize">{selectedPreference.mealPreference.replace('_', ' ')}</div>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                          <Plane className="h-4 w-4" />
                          Cabin Preference
                        </div>
                        <div className="font-semibold capitalize">{selectedPreference.cabinPreference}</div>
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          Booking Pattern
                        </div>
                        <div className="font-semibold capitalize">{selectedPreference.bookingPattern.replace('_', ' ')}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-2">
                        <Brain className="h-4 w-4" />
                        Behavior Analytics
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                        <div>
                          <div className="text-xs text-muted-foreground">Avg Days Before Travel</div>
                          <div className="text-lg font-bold">{selectedPreference.avgDaysBeforeTravel} days</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Ancillary Purchase Rate</div>
                          <div className="text-lg font-bold">{selectedPreference.ancillaryPurchaseRate * 100}%</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        Favorite Routes
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPreference.favoriteRoutes.map((route, idx) => (
                          <Badge key={idx} variant="secondary">{route}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Last Updated: {new Date(selectedPreference.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a customer to view preference details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Partner Points Tab */}
        <TabsContent value="partners">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Partner Points */}
            <Card className="enterprise-card">
              <CardHeader>
                <CardTitle className="flex items-center flex-wrap gap-2">
                  <Award className="h-5 w-5" />
                  Partner Points
                </CardTitle>
                <CardDescription>Earn and redeem points with partners</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partnerPoints.map((partner) => (
                    <div key={partner.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center flex-wrap gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Gift className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{partner.partnerName}</h3>
                            <Badge variant="outline" className="capitalize text-xs">{partner.partnerType.replace('_', ' ')}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{partner.pointsEarned.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">points earned</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Points Redeemed</div>
                          <div className="font-semibold">{partner.pointsRedeemed.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Conversion Rate</div>
                          <div className="font-semibold">1:{partner.conversionRate}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-2">Recent Activity</div>
                        <div className="overflow-y-auto h-24">
                          <div className="space-y-2">
                            {partner.recentActivity.slice(0, 3).map((activity, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs p-2 bg-secondary/20 rounded">
                                <div className="flex items-center flex-wrap gap-2">
                                  {activity.type === 'earn' ? <ArrowUp className="h-3 w-3 text-green-600" /> : <ArrowDown className="h-3 w-3 text-red-600" />}
                                  <span>{activity.description}</span>
                                </div>
                                <div className="flex items-center flex-wrap gap-2">
                                  <span className="text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</span>
                                  <span className={`font-semibold ${activity.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                                    {activity.type === 'earn' ? '+' : '-'}{activity.points.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reward Redemptions */}
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center flex-wrap gap-2">
                      <Gift className="h-5 w-5" />
                      Reward Redemptions
                    </CardTitle>
                    <CardDescription>Process reward requests</CardDescription>
                  </div>
                  <Dialog open={showRedemptionDialog} onOpenChange={setShowRedemptionDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Redemption
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Reward Redemption</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Customer</Label>
                          <Select
                            value={newRedemption.customerId}
                            onValueChange={(v) => setNewRedemption({...newRedemption, customerId: v})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                            <SelectContent>
                              {customerProfiles.slice(0, 10).map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.firstName} {customer.lastName} ({customer.loyalty.pointsBalance.toLocaleString()} pts)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Reward Type</Label>
                          <Select
                            value={newRedemption.rewardType}
                            onValueChange={(v) => setNewRedemption({...newRedemption, rewardType: v as any})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="flight_upgrade">Flight Upgrade</SelectItem>
                              <SelectItem value="lounge_access">Lounge Access</SelectItem>
                              <SelectItem value="extra_baggage">Extra Baggage</SelectItem>
                              <SelectItem value="partner_hotel">Partner Hotel</SelectItem>
                              <SelectItem value="partner_car">Partner Car Rental</SelectItem>
                              <SelectItem value="miles_transfer">Miles Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Points Cost</Label>
                          <Input
                            type="number"
                            value={newRedemption.pointsCost}
                            onChange={(e) => setNewRedemption({...newRedemption, pointsCost: parseInt(e.target.value) || 0})}
                            placeholder="25000"
                          />
                        </div>
                        <div>
                          <Label>Details</Label>
                          <Textarea
                            value={newRedemption.details}
                            onChange={(e) => setNewRedemption({...newRedemption, details: e.target.value})}
                            placeholder="Flight number, dates, etc."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRedemptionDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateRedemption}>Create Redemption</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-y-auto h-96">
                  <div className="space-y-3">
                    {rewardRedemptions.map((redemption) => (
                      <div key={redemption.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center flex-wrap gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Gift className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{redemption.customerName}</h3>
                              <Badge variant="outline" className="capitalize text-xs">
                                {redemption.rewardType.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{redemption.pointsCost.toLocaleString()} pts</div>
                            <Badge
                              variant={
                                redemption.status === 'completed' ? 'default' :
                                redemption.status === 'approved' ? 'secondary' :
                                redemption.status === 'pending' ? 'outline' : 'destructive'
                              }
                              className="capitalize text-xs"
                            >
                              {redemption.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{redemption.details}</p>
                        {redemption.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleProcessRedemption(redemption.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleProcessRedemption(redemption.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {redemption.processedAt && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Processed: {new Date(redemption.processedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Complaint Workflow Detail Dialog */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Complaint Details - {selectedComplaint?.complaintId}</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <div className="font-medium">{selectedComplaint.customerName}</div>
                </div>
                <div>
                  <Label>Category</Label>
                  <div className="font-medium capitalize">{selectedComplaint.category.replace('_', ' ')}</div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <div className="font-medium">{selectedComplaint.subject}</div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge
                    variant={
                      selectedComplaint.priority === 'critical' ? 'destructive' :
                      selectedComplaint.priority === 'high' ? 'secondary' : 'outline'
                    }
                    className="capitalize"
                  >
                    {selectedComplaint.priority}
                  </Badge>
                </div>
                <div>
                  <Label>SLA</Label>
                  <div className="flex items-center flex-wrap gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedComplaint.slaHours} hours</span>
                  </div>
                </div>
                <div>
                  <Label>Due Date</Label>
                  <div className="font-medium">{new Date(selectedComplaint.dueDate).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <div className="flex gap-2 mt-2">
                  {(['open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedComplaint.status === status ? 'default' : 'outline'}
                      onClick={() => handleUpdateComplaintStatus(selectedComplaint.id, status)}
                      className="capitalize"
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {!selectedComplaint.escalated && (
                <div>
                  <Label>Escalation</Label>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-2"
                    onClick={() => handleEscalateComplaint(selectedComplaint.id, 'SLA exceeded - requires management attention')}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Escalate Complaint
                  </Button>
                </div>
              )}

              <div>
                <Label>Notes</Label>
                <div className="overflow-y-auto h-32">
                  <div className="space-y-2">
                    {selectedComplaint.notes.map((note, idx) => (
                      <div key={idx} className="text-sm p-2 bg-secondary/20 rounded">
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                  />
                  <Button onClick={() => handleAddNote(selectedComplaint.id)}>Add</Button>
                </div>
              </div>

              {selectedComplaint.resolutionTimeHours && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center flex-wrap gap-2 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span>Resolved in {selectedComplaint.resolutionTimeHours} hours</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
