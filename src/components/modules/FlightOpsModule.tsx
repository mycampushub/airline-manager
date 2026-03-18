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
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/hooks/use-toast'
import { useAirlineStore } from '@/lib/store'
import { 
  Calendar, 
  Clock, 
  Plane, 
  AlertTriangle, 
  MapPin, 
  Cloud, 
  FileText,
  Plus,
  Edit,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Settings,
  Route,
  CalendarClock,
  Clock as ClockIcon,
  Map as MapIcon,
  Layers,
  Database,
  DollarSign,
  Users,
  Gauge,
  Fuel,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  ArrowRight,
  Save,
  Eye,
  AlertCircle,
  Thermometer,
  Wind,
  Gauge as GaugeIcon
} from 'lucide-react'
import { type FlightSchedule, type DisruptionEvent } from '@/lib/store'

interface Route {
  id: string
  origin: string
  destination: string
  distance: number
  flightTime: number
  slots: Slot[]
  aircraftTypes: string[]
  priority: 'high' | 'medium' | 'low'
  demand: 'high' | 'medium' | 'low'
  competition: number
}

interface Slot {
  id: string
  time: string
  status: 'available' | 'assigned' | 'blocked' | 'maintenance'
  assignedTo?: string
}

interface SeasonalSchedule {
  id: string
  season: 'low' | 'shoulder' | 'peak'
  startDate: string
  endDate: string
  frequencyMultiplier: number
  pricingMultiplier: number
  notes: string
}

interface FleetAssignment {
  id: string
  registration: string
  aircraftType: string
  base: string
  utilizationRate: number
  routes: string[]
  maintenanceSchedule: MaintenanceEvent[]
}

interface MaintenanceEvent {
  id: string
  date: string
  type: 'a-check' | 'b-check' | 'c-check' | 'd-check' | 'line-maintenance'
  duration: number
  notes: string
}

export default function FlightOpsModule() {
  const { flightSchedules, flightInstances, disruptions, createFlightSchedule, updateFlightSchedule, createDisruption, setDisruptions } = useAirlineStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('schedule')
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showDisruptionDialog, setShowDisruptionDialog] = useState(false)
  const [showRoutePlanningDialog, setShowRoutePlanningDialog] = useState(false)
  const [showSeasonalDialog, setShowSeasonalDialog] = useState(false)
  const [showSlotManagementDialog, setShowSlotManagementDialog] = useState(false)
  const [showFleetDialog, setShowFleetDialog] = useState(false)

  // New state for enhanced features
  const [routes, setRoutes] = useState<Route[]>([
    { id: 'R001', origin: 'JFK', destination: 'LHR', distance: 3450, flightTime: 425, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'high', demand: 'high', competition: 8 },
    { id: 'R002', origin: 'JFK', destination: 'CDG', distance: 3635, flightTime: 445, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'high', demand: 'high', competition: 6 },
    { id: 'R003', origin: 'LAX', destination: 'NRT', distance: 5479, flightTime: 690, slots: [], aircraftTypes: ['B777-300ER', 'A350-900'], priority: 'high', demand: 'high', competition: 5 },
    { id: 'R004', origin: 'SFO', destination: 'HKG', distance: 6907, flightTime: 885, slots: [], aircraftTypes: ['B777-300ER', 'A350-900'], priority: 'medium', demand: 'medium', competition: 4 },
    { id: 'R005', origin: 'DXB', destination: 'LHR', distance: 3474, flightTime: 455, slots: [], aircraftTypes: ['B777-300ER', 'A380', 'A350-900'], priority: 'high', demand: 'high', competition: 7 },
    { id: 'R006', origin: 'SIN', destination: 'SYD', distance: 3900, flightTime: 480, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'A330-300'], priority: 'medium', demand: 'medium', competition: 3 },
    { id: 'R007', origin: 'JFK', destination: 'MIA', distance: 1092, flightTime: 190, slots: [], aircraftTypes: ['B737-800', 'A320-200'], priority: 'medium', demand: 'high', competition: 5 },
    { id: 'R008', origin: 'ORD', destination: 'LAX', distance: 1745, flightTime: 260, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'high', demand: 'high', competition: 7 },
    { id: 'R009', origin: 'ATL', destination: 'LHR', distance: 4215, flightTime: 510, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'A330-900neo'], priority: 'high', demand: 'high', competition: 8 },
    { id: 'R010', origin: 'DFW', destination: 'NRT', distance: 6470, flightTime: 810, slots: [], aircraftTypes: ['B777-300ER', 'A350-900'], priority: 'medium', demand: 'medium', competition: 4 },
    { id: 'R011', origin: 'LHR', destination: 'DXB', distance: 3474, flightTime: 435, slots: [], aircraftTypes: ['B777-300ER', 'A380', 'A350-900'], priority: 'high', demand: 'high', competition: 6 },
    { id: 'R012', origin: 'CDG', destination: 'SIN', distance: 6738, flightTime: 810, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'A380-800'], priority: 'medium', demand: 'medium', competition: 5 },
    { id: 'R013', origin: 'JFK', destination: 'SFO', distance: 2572, flightTime: 360, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B787-9'], priority: 'high', demand: 'high', competition: 7 },
    { id: 'R014', origin: 'LAX', destination: 'HNL', distance: 2551, flightTime: 330, slots: [], aircraftTypes: ['B777-300ER', 'A330-300'], priority: 'medium', demand: 'medium', competition: 4 },
    { id: 'R015', origin: 'MIA', destination: 'GRU', distance: 4083, flightTime: 510, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'B787-9'], priority: 'medium', demand: 'high', competition: 3 },
    { id: 'R016', origin: 'FRA', destination: 'JFK', distance: 3852, flightTime: 510, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'medium', demand: 'medium', competition: 5 },
    { id: 'R017', origin: 'AMS', destination: 'LAX', distance: 5570, flightTime: 680, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'B787-9'], priority: 'high', demand: 'high', competition: 6 },
    { id: 'R018', origin: 'HKG', destination: 'SYD', distance: 4581, flightTime: 540, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'A330-300'], priority: 'high', demand: 'high', competition: 5 },
    { id: 'R019', origin: 'BKK', destination: 'LHR', distance: 5927, flightTime: 750, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'A380-800'], priority: 'high', demand: 'high', competition: 5 },
    { id: 'R020', origin: 'JFK', destination: 'LAS', distance: 2234, flightTime: 330, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'A321neo'], priority: 'medium', demand: 'medium', competition: 6 },
    { id: 'R021', origin: 'ORD', destination: 'MIA', distance: 1197, flightTime: 180, slots: [], aircraftTypes: ['B737-800', 'A320-200'], priority: 'high', demand: 'high', competition: 7 },
    { id: 'R022', origin: 'LAX', destination: 'MEX', distance: 1549, flightTime: 210, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'A321neo'], priority: 'medium', demand: 'high', competition: 4 },
    { id: 'R023', origin: 'SFO', destination: 'ICN', distance: 5658, flightTime: 720, slots: [], aircraftTypes: ['B777-300ER', 'A350-900'], priority: 'high', demand: 'high', competition: 5 },
    { id: 'R024', origin: 'DXB', destination: 'SYD', distance: 7525, flightTime: 840, slots: [], aircraftTypes: ['A380-800', 'A350-900', 'B777-300ER'], priority: 'medium', demand: 'medium', competition: 3 },
    { id: 'R025', origin: 'LHR', destination: 'JFK', distance: 3450, flightTime: 435, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'high', demand: 'high', competition: 7 },
    { id: 'R026', origin: 'CDG', destination: 'FRA', distance: 447, flightTime: 75, slots: [], aircraftTypes: ['A320-200', 'A321neo'], priority: 'medium', demand: 'medium', competition: 5 },
    { id: 'R027', origin: 'SIN', destination: 'NRT', distance: 3329, flightTime: 410, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'A330-300'], priority: 'high', demand: 'high', competition: 6 },
    { id: 'R028', origin: 'HKG', destination: 'LAX', distance: 6907, flightTime: 855, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'A380-800'], priority: 'medium', demand: 'medium', competition: 4 },
    { id: 'R029', origin: 'MIA', destination: 'MAD', distance: 4414, flightTime: 525, slots: [], aircraftTypes: ['B777-300ER', 'A350-900', 'A330-900neo'], priority: 'high', demand: 'high', competition: 6 },
    { id: 'R030', origin: 'JFK', destination: 'BCN', distance: 3900, flightTime: 470, slots: [], aircraftTypes: ['B737-800', 'A320-200', 'B777-300ER'], priority: 'high', demand: 'high', competition: 7 }
  ])

  const [seasonalSchedules, setSeasonalSchedules] = useState<SeasonalSchedule[]>([
    { id: 'SS1', season: 'low', startDate: '2024-01-15', endDate: '2024-03-31', frequencyMultiplier: 0.6, pricingMultiplier: 0.7, notes: 'Low demand period' },
    { id: 'SS2', season: 'shoulder', startDate: '2024-04-01', endDate: '2024-05-31', frequencyMultiplier: 0.8, pricingMultiplier: 0.85, notes: 'Shoulder season increasing' },
    { id: 'SS3', season: 'peak', startDate: '2024-06-01', endDate: '2024-08-31', frequencyMultiplier: 1.0, pricingMultiplier: 1.2, notes: 'Peak summer season' },
    { id: 'SS4', season: 'peak', startDate: '2024-09-01', endDate: '2024-10-31', frequencyMultiplier: 0.9, pricingMultiplier: 1.1, notes: 'Fall peak season' },
    { id: 'SS5', season: 'shoulder', startDate: '2024-11-01', endDate: '2024-12-15', frequencyMultiplier: 0.8, pricingMultiplier: 0.85, notes: 'Holiday shoulder season' },
    { id: 'SS6', season: 'peak', startDate: '2024-12-16', endDate: '2024-12-31', frequencyMultiplier: 1.3, pricingMultiplier: 1.4, notes: 'Christmas peak' },
    { id: 'SS7', season: 'low', startDate: '2025-01-01', endDate: '2025-03-15', frequencyMultiplier: 0.55, pricingMultiplier: 0.65, notes: 'Winter low season' },
    { id: 'SS8', season: 'shoulder', startDate: '2025-03-16', endDate: '2025-04-30', frequencyMultiplier: 0.75, pricingMultiplier: 0.8, notes: 'Spring shoulder' },
    { id: 'SS9', season: 'peak', startDate: '2025-05-01', endDate: '2025-08-31', frequencyMultiplier: 1.1, pricingMultiplier: 1.25, notes: 'Summer peak' },
    { id: 'SS10', season: 'shoulder', startDate: '2025-09-01', endDate: '2025-10-15', frequencyMultiplier: 0.85, pricingMultiplier: 0.9, notes: 'Fall shoulder' },
    { id: 'SS11', season: 'low', startDate: '2025-10-16', endDate: '2025-11-20', frequencyMultiplier: 0.6, pricingMultiplier: 0.7, notes: 'Autumn low' },
    { id: 'SS12', season: 'peak', startDate: '2025-11-21', endDate: '2025-12-31', frequencyMultiplier: 1.25, pricingMultiplier: 1.35, notes: 'Holiday peak' },
    { id: 'SS13', season: 'low', startDate: '2026-01-01', endDate: '2026-02-28', frequencyMultiplier: 0.5, pricingMultiplier: 0.6, notes: 'Deep winter' },
    { id: 'SS14', season: 'shoulder', startDate: '2026-03-01', endDate: '2026-04-30', frequencyMultiplier: 0.8, pricingMultiplier: 0.85, notes: 'Spring break' },
    { id: 'SS15', season: 'peak', startDate: '2026-05-01', endDate: '2026-09-15', frequencyMultiplier: 1.05, pricingMultiplier: 1.2, notes: 'Extended summer' },
    { id: 'SS16', season: 'shoulder', startDate: '2026-09-16', endDate: '2026-10-31', frequencyMultiplier: 0.9, pricingMultiplier: 0.95, notes: 'Fall shoulder' },
    { id: 'SS17', season: 'low', startDate: '2026-11-01', endDate: '2026-12-10', frequencyMultiplier: 0.65, pricingMultiplier: 0.75, notes: 'Pre-holiday' },
    { id: 'SS18', season: 'peak', startDate: '2026-12-11', endDate: '2026-12-31', frequencyMultiplier: 1.3, pricingMultiplier: 1.4, notes: 'Christmas/New Year' },
    { id: 'SS19', season: 'low', startDate: '2027-01-01', endDate: '2027-03-10', frequencyMultiplier: 0.55, pricingMultiplier: 0.65, notes: 'Post-holiday' },
    { id: 'SS20', season: 'shoulder', startDate: '2027-03-11', endDate: '2027-05-15', frequencyMultiplier: 0.8, pricingMultiplier: 0.85, notes: 'Spring shoulder extended' },
    { id: 'SS21', season: 'peak', startDate: '2027-05-16', endDate: '2027-09-30', frequencyMultiplier: 1.0, pricingMultiplier: 1.15, notes: 'Summer peak' },
    { id: 'SS22', season: 'shoulder', startDate: '2027-10-01', endDate: '2027-11-15', frequencyMultiplier: 0.85, pricingMultiplier: 0.9, notes: 'Autumn shoulder' },
    { id: 'SS23', season: 'low', startDate: '2027-11-16', endDate: '2027-12-05', frequencyMultiplier: 0.6, pricingMultiplier: 0.7, notes: 'Winter pre-peak' },
    { id: 'SS24', season: 'peak', startDate: '2027-12-06', endDate: '2027-12-31', frequencyMultiplier: 1.25, pricingMultiplier: 1.35, notes: 'Holiday season' },
    { id: 'SS25', season: 'low', startDate: '2028-01-01', endDate: '2028-02-20', frequencyMultiplier: 0.5, pricingMultiplier: 0.6, notes: 'Winter low extended' },
    { id: 'SS26', season: 'shoulder', startDate: '2028-02-21', endDate: '2028-04-15', frequencyMultiplier: 0.75, pricingMultiplier: 0.8, notes: 'Early spring' },
    { id: 'SS27', season: 'peak', startDate: '2028-04-16', endDate: '2028-08-20', frequencyMultiplier: 1.1, pricingMultiplier: 1.25, notes: 'Summer high' },
    { id: 'SS28', season: 'shoulder', startDate: '2028-08-21', endDate: '2028-10-20', frequencyMultiplier: 0.85, pricingMultiplier: 0.9, notes: 'Late summer/early fall' },
    { id: 'SS29', season: 'low', startDate: '2028-10-21', endDate: '2028-11-30', frequencyMultiplier: 0.6, pricingMultiplier: 0.7, notes: 'Fall low' },
    { id: 'SS30', season: 'peak', startDate: '2028-12-01', endDate: '2028-12-31', frequencyMultiplier: 1.3, pricingMultiplier: 1.4, notes: 'Year-end peak' }
  ])

  const [fleetAssignments, setFleetAssignments] = useState<FleetAssignment[]>([
    { id: 'FA1', registration: 'N12345', aircraftType: 'B737-800', base: 'JFK', utilizationRate: 92.5, routes: ['JFK-LHR', 'JFK-PAR', 'JFK-ORD'], maintenanceSchedule: [] },
    { id: 'FA2', registration: 'N67890', aircraftType: 'B737-800', base: 'JFK', utilizationRate: 88.3, routes: ['JFK-LAX', 'JFK-MIA', 'JFK-ORD'], maintenanceSchedule: [] },
    { id: 'FA3', registration: 'N24680', aircraftType: 'A320-200', base: 'LAX', utilizationRate: 95.2, routes: ['LAX-TYO', 'LAX-SFO', 'LAX-SYD'], maintenanceSchedule: [] },
    { id: 'FA4', registration: 'N97531', aircraftType: 'B777-300ER', base: 'LAX', utilizationRate: 94.8, routes: ['LAX-TYO', 'SFO-HKG', 'JFK-LHR'], maintenanceSchedule: [] },
    { id: 'FA5', registration: 'N86420', aircraftType: 'A350-900', base: 'JFK', utilizationRate: 96.5, routes: ['JFK-LHR', 'DXB-LHR', 'JFK-PAR'], maintenanceSchedule: [] },
    { id: 'FA6', registration: 'N11223', aircraftType: 'B737-800', base: 'JFK', utilizationRate: 89.1, routes: ['JFK-MIA', 'JFK-ORD', 'JFK-BOS'], maintenanceSchedule: [] },
    { id: 'FA7', registration: 'N44556', aircraftType: 'A320-200', base: 'LAX', utilizationRate: 91.7, routes: ['LAX-SFO', 'LAX-ORD', 'LAX-DEN'], maintenanceSchedule: [] },
    { id: 'FA8', registration: 'N77889', aircraftType: 'B777-200LR', base: 'SFO', utilizationRate: 93.4, routes: ['SFO-HKG', 'SFO-TYO', 'SFO-LAX'], maintenanceSchedule: [] },
    { id: 'FA9', registration: 'N99001', aircraftType: 'A380-800', base: 'DXB', utilizationRate: 95.8, routes: ['DXB-LHR', 'DXB-JFK', 'DXB-SYD'], maintenanceSchedule: [] },
    { id: 'FA10', registration: 'N33445', aircraftType: 'B787-9', base: 'LHR', utilizationRate: 90.2, routes: ['LHR-JFK', 'LHR-DXB', 'LHR-CDG'], maintenanceSchedule: [] },
    { id: 'FA11', registration: 'N55667', aircraftType: 'A330-300', base: 'SIN', utilizationRate: 87.6, routes: ['SIN-SYD', 'SIN-HKG', 'SIN-TYO'], maintenanceSchedule: [] },
    { id: 'FA12', registration: 'N77880', aircraftType: 'B777-300ER', base: 'JFK', utilizationRate: 94.1, routes: ['JFK-LHR', 'JFK-CDG', 'JFK-FRA'], maintenanceSchedule: [] },
    { id: 'FA13', registration: 'N99002', aircraftType: 'A350-900', base: 'LAX', utilizationRate: 92.8, routes: ['LAX-TYO', 'LAX-SIN', 'LAX-SYD'], maintenanceSchedule: [] },
    { id: 'FA14', registration: 'N22334', aircraftType: 'B737-800', base: 'MIA', utilizationRate: 88.9, routes: ['MIA-JFK', 'MIA-ORD', 'MIA-DFW'], maintenanceSchedule: [] },
    { id: 'FA15', registration: 'N44557', aircraftType: 'A320neo', base: 'ORD', utilizationRate: 90.5, routes: ['ORD-JFK', 'ORD-LAX', 'ORD-DEN'], maintenanceSchedule: [] },
    { id: 'FA16', registration: 'N11224', aircraftType: 'B787-9', base: 'SFO', utilizationRate: 93.7, routes: ['SFO-HKG', 'SFO-TYO', 'SFO-LAX'], maintenanceSchedule: [] },
    { id: 'FA17', registration: 'N44558', aircraftType: 'A380-800', base: 'DXB', utilizationRate: 96.2, routes: ['DXB-LHR', 'DXB-FRA', 'DXB-BOM'], maintenanceSchedule: [] },
    { id: 'FA18', registration: 'N77890', aircraftType: 'B777-200LR', base: 'LHR', utilizationRate: 91.3, routes: ['LHR-JFK', 'LHR-DXB', 'LHR-CDG'], maintenanceSchedule: [] },
    { id: 'FA19', registration: 'N99003', aircraftType: 'A350-900', base: 'SIN', utilizationRate: 89.4, routes: ['SIN-SYD', 'SIN-HKG', 'SIN-TYO'], maintenanceSchedule: [] },
    { id: 'FA20', registration: 'N22335', aircraftType: 'B737-800', base: 'JFK', utilizationRate: 87.8, routes: ['JFK-LAX', 'JFK-MIA', 'JFK-ORD'], maintenanceSchedule: [] },
    { id: 'FA21', registration: 'N44559', aircraftType: 'A320-200', base: 'LAX', utilizationRate: 92.1, routes: ['LAX-TYO', 'LAX-SFO', 'LAX-SYD'], maintenanceSchedule: [] },
    { id: 'FA22', registration: 'N77891', aircraftType: 'B777-300ER', base: 'SFO', utilizationRate: 94.5, routes: ['SFO-HKG', 'SFO-TYO', 'SFO-LAX'], maintenanceSchedule: [] },
    { id: 'FA23', registration: 'N99004', aircraftType: 'A350-900', base: 'DXB', utilizationRate: 95.1, routes: ['DXB-LHR', 'DXB-JFK', 'DXB-SYD'], maintenanceSchedule: [] },
    { id: 'FA24', registration: 'N22336', aircraftType: 'A330-300', base: 'LHR', utilizationRate: 90.8, routes: ['LHR-JFK', 'LHR-DXB', 'LHR-CDG'], maintenanceSchedule: [] },
    { id: 'FA25', registration: 'N44560', aircraftType: 'B737-800', base: 'SIN', utilizationRate: 88.2, routes: ['SIN-SYD', 'SIN-HKG', 'SIN-TYO'], maintenanceSchedule: [] },
    { id: 'FA26', registration: 'N77892', aircraftType: 'A320neo', base: 'MIA', utilizationRate: 91.6, routes: ['MIA-JFK', 'MIA-ORD', 'MIA-DFW'], maintenanceSchedule: [] },
    { id: 'FA27', registration: 'N99005', aircraftType: 'B787-9', base: 'ORD', utilizationRate: 89.7, routes: ['ORD-JFK', 'ORD-LAX', 'ORD-DEN'], maintenanceSchedule: [] },
    { id: 'FA28', registration: 'N22337', aircraftType: 'B777-300ER', base: 'FRA', utilizationRate: 93.2, routes: ['FRA-JFK', 'FRA-LHR', 'FRA-DXB'], maintenanceSchedule: [] },
    { id: 'FA29', registration: 'N44561', aircraftType: 'A380-800', base: 'CDG', utilizationRate: 96.0, routes: ['CDG-JFK', 'CDG-LHR', 'CDG-DXB'], maintenanceSchedule: [] },
    { id: 'FA30', registration: 'N77893', aircraftType: 'A350-900', base: 'HKG', utilizationRate: 92.4, routes: ['HKG-SFO', 'HKG-TYO', 'HKG-SIN'], maintenanceSchedule: [] }
  ])

  const [newSchedule, setNewSchedule] = useState({
    flightNumber: '',
    routeId: '',
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    aircraftType: 'B737-800',
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    effectiveSeason: 'low',
    slotId: '',
    fleetAssignmentId: '',
    seasonalAdjustment: false
  })

  const [newRoute, setNewRoute] = useState({
    origin: '',
    destination: '',
    distance: 0,
    flightTime: 0,
    aircraftTypes: ['B737-800'],
    priority: 'medium' as const,
    demand: 'medium' as const,
    competition: 3
  })

  const [newSeasonalSchedule, setNewSeasonalSchedule] = useState({
    season: 'low' as const,
    startDate: '',
    endDate: '',
    frequencyMultiplier: 0.8,
    pricingMultiplier: 0.85,
    notes: ''
  })

  const [newFleetAssignment, setNewFleetAssignment] = useState({
    registration: '',
    aircraftType: 'B737-800',
    base: '',
    routes: [] as string[],
    utilizationRate: 85
  })

  // Edit dialogs state
  const [showEditRouteDialog, setShowEditRouteDialog] = useState(false)
  const [showEditScheduleDialog, setShowEditScheduleDialog] = useState(false)
  const [showEditSeasonalDialog, setShowEditSeasonalDialog] = useState(false)
  const [showEditFleetDialog, setShowEditFleetDialog] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<FlightSchedule | null>(null)
  const [editingSeasonalSchedule, setEditingSeasonalSchedule] = useState<SeasonalSchedule | null>(null)
  const [editingFleetAssignment, setEditingFleetAssignment] = useState<FleetAssignment | null>(null)

  // Flight release state
  const [showFlightReleaseDialog, setShowFlightReleaseDialog] = useState(false)
  const [generatedFlightRelease, setGeneratedFlightRelease] = useState<any>(null)
  const [flightReleaseApproved, setFlightReleaseApproved] = useState(false)

  const [selectedSchedule, setSelectedSchedule] = useState<FlightSchedule | null>(null)

  // Disruption state
  const [newDisruption, setNewDisruption] = useState({
    flightNumber: '',
    type: 'delay' as const,
    code: '',
    reason: '',
    estimatedDelayMinutes: 0,
    passengersAffected: 0
  })

  // Dispatch state
  const [selectedFlightForDispatch, setSelectedFlightForDispatch] = useState<FlightSchedule | null>(null)
  const [selectedFlightForSchedule, setSelectedFlightForSchedule] = useState<FlightSchedule | null>(null)
  const [dispatchWeather, setDispatchWeather] = useState({
    departure: { condition: 'Clear skies', temp: 15, windSpeed: 10, windDirection: 270, visibility: 10, pressure: 1013, dewPoint: 8, cloudCeiling: 'Unlimited' },
    destination: { condition: 'Overcast', temp: 12, windSpeed: 15, windDirection: 310, visibility: 8, pressure: 1010, dewPoint: 9, cloudCeiling: '3000ft AGL' }
  })
  const [notams, setNotams] = useState([
    { id: 'A1234/24', airport: 'JFK', message: 'RWY 09L/27R closed for maintenance until 15DEC', type: 'maintenance' as const, validFrom: '2024-12-01', validTo: '2024-12-15' },
    { id: 'B5678/24', airport: 'JFK', message: 'Taxiway B partial closure due to construction', type: 'construction' as const, validFrom: '2024-12-01', validTo: '2024-12-20' },
    { id: 'C9012/24', airport: 'LHR', message: 'ILS approach out of service - use visual approach', type: 'navigation' as const, validFrom: '2024-12-05', validTo: '2024-12-10' },
    { id: 'D3456/24', airport: 'LAX', message: 'Crane operations 500ft AGL near terminal 4', type: 'obstacle' as const, validFrom: '2024-12-08', validTo: '2024-12-12' },
    { id: 'E7890/24', airport: 'SFO', message: 'Ground radar unreliable - use visual confirmation', type: 'navigation' as const, validFrom: '2024-12-10', validTo: '2024-12-14' },
    { id: 'F1122/24', airport: 'DXB', message: 'Fuel truck operations on apron C', type: 'airspace' as const, validFrom: '2024-12-01', validTo: '2024-12-31' },
    { id: 'G3344/24', airport: 'TYO', message: 'De-icing equipment in use at stands 1-10', type: 'maintenance' as const, validFrom: '2024-12-12', validTo: '2024-12-31' },
    { id: 'H5566/24', airport: 'SIN', message: 'Taxiway Alpha closed between intersections B and C', type: 'construction' as const, validFrom: '2024-12-01', validTo: '2024-12-25' },
    { id: 'I7788/24', airport: 'HKG', message: 'Temporary restricted airspace active for event', type: 'airspace' as const, validFrom: '2024-12-15', validTo: '2024-12-17' },
    { id: 'J9900/24', airport: 'FRA', message: 'RWY 07L/25R partial closure for lighting repair', type: 'maintenance' as const, validFrom: '2024-12-08', validTo: '2024-12-15' },
    { id: 'K1111/24', airport: 'CDG', message: 'Taxiway C closed for resurfacing', type: 'construction' as const, validFrom: '2024-12-10', validTo: '2024-12-30' },
    { id: 'L2222/24', airport: 'ORD', message: 'Gate A1-A5 unavailable due to construction', type: 'maintenance' as const, validFrom: '2024-12-05', validTo: '2024-12-20' },
    { id: 'M3333/24', airport: 'MIA', message: 'Approach radar reduced coverage sector 2', type: 'navigation' as const, validFrom: '2024-12-12', validTo: '2025-01-15' },
    { id: 'N4444/24', airport: 'ATL', message: 'Runway 27L closure for resurfacing', type: 'maintenance' as const, validFrom: '2024-12-08', validTo: '2024-12-28' },
    { id: 'O5555/24', airport: 'DFW', message: 'Cargo area B restricted access', type: 'airspace' as const, validFrom: '2024-12-01', validTo: '2024-12-31' },
    { id: 'P6666/24', airport: 'NRT', message: 'Typhoon response - limited operations', type: 'airspace' as const, validFrom: '2024-12-15', validTo: '2024-12-18' },
    { id: 'Q7777/24', airport: 'ICN', message: 'Navigation aids calibration in progress', type: 'navigation' as const, validFrom: '2024-12-10', validTo: '2024-12-25' },
    { id: 'R8888/24', airport: 'GRU', message: 'Terminal 3 partial closure for renovations', type: 'construction' as const, validFrom: '2024-12-01', validTo: '2025-02-28' },
    { id: 'S9999/24', airport: 'MAD', message: 'Radar service degraded - expect delays', type: 'navigation' as const, validFrom: '2024-12-12', validTo: '2024-12-22' },
    { id: 'T0001/24', airport: 'BCN', message: 'Runway 25R/07L lighting maintenance', type: 'maintenance' as const, validFrom: '2024-12-08', validTo: '2024-12-18' },
    { id: 'U0002/24', airport: 'AMS', message: 'Runway 18R/36L closure for repairs', type: 'maintenance' as const, validFrom: '2024-12-15', validTo: '2024-12-25' },
    { id: 'V0003/24', airport: 'BKK', message: 'Airside road construction - limited access', type: 'construction' as const, validFrom: '2024-12-05', validTo: '2024-12-20' },
    { id: 'W0004/24', airport: 'SYD', message: 'Runway 34L reconstruction ongoing', type: 'maintenance' as const, validFrom: '2024-12-01', validTo: '2025-01-31' },
    { id: 'X0005/24', airport: 'HNL', message: 'Fuel system maintenance at Terminal 2', type: 'maintenance' as const, validFrom: '2024-12-10', validTo: '2024-12-20' },
    { id: 'Y0006/24', airport: 'MEX', message: 'Radar approach not available - use visual', type: 'navigation' as const, validFrom: '2024-12-12', validTo: '2024-12-17' },
    { id: 'Z0007/24', airport: 'LAS', message: 'Gate B10-B15 closed for renovation', type: 'construction' as const, validFrom: '2024-12-08', validTo: '2024-12-28' },
    { id: 'A0008/24', airport: 'DEN', message: 'De-icing fluid shortage - limited capacity', type: 'maintenance' as const, validFrom: '2024-12-15', validTo: '2024-12-25' },
    { id: 'B0009/24', airport: 'PHX', message: 'Terminal 4 security checkpoint closed', type: 'airspace' as const, validFrom: '2024-12-10', validTo: '2024-12-15' },
    { id: 'C0010/24', airport: 'CLT', message: 'Taxiway M closed for maintenance', type: 'construction' as const, validFrom: '2024-12-05', validTo: '2024-12-18' },
    { id: 'D0011/24', airport: 'IAD', message: 'Runway 19R closure for lighting repair', type: 'maintenance' as const, validFrom: '2024-12-12', validTo: '2024-12-22' },
    { id: 'E0012/24', airport: 'SEA', message: 'Apron D construction - limited parking', type: 'construction' as const, validFrom: '2024-12-08', validTo: '2025-01-15' }
  ])
  const [atcRestrictions, setAtcRestrictions] = useState([
    { id: '1', region: 'EUR', type: 'Flow control', level: 'Moderate', description: 'Reduced slot availability', slotDelay: 15 },
    { id: '2', region: 'NAT', type: 'Route restrictions', level: 'Active', description: 'NAT Track A suspended', slotDelay: 30 },
    { id: '3', region: 'PAC', type: 'Flow control', level: 'Low', description: 'Pacific routes reduced capacity', slotDelay: 10 },
    { id: '4', region: 'USA', type: 'Ground delay', level: 'High', description: 'Weather delays at JFK', slotDelay: 45 },
    { id: '5', region: 'ASIA', type: 'Route restrictions', level: 'Moderate', description: 'Chinese airspace restrictions', slotDelay: 20 },
    { id: '6', region: 'MID', type: 'Flow control', level: 'Low', description: 'Middle East traffic management', slotDelay: 8 },
    { id: '7', region: 'EUR', type: 'Miles-in-trail', level: 'Moderate', description: '10nm spacing over France', slotDelay: 12 },
    { id: '8', region: 'NAT', type: 'Route restrictions', level: 'Active', description: 'Track B re-routing required', slotDelay: 25 },
    { id: '9', region: 'USA', type: 'Ground delay', level: 'Moderate', description: 'ATC staffing LAX', slotDelay: 20 },
    { id: '10', region: 'EUR', type: 'Flow control', level: 'High', description: 'London terminal capacity', slotDelay: 35 },
    { id: '11', region: 'ASIA', type: 'Route restrictions', level: 'Low', description: 'India airspace congestion', slotDelay: 15 },
    { id: '12', region: 'PAC', type: 'Miles-in-trail', level: 'Moderate', description: '20nm spacing over Pacific', slotDelay: 18 },
    { id: '13', region: 'MID', type: 'Ground delay', level: 'Active', description: 'Dubai weather restrictions', slotDelay: 40 },
    { id: '14', region: 'EUR', type: 'Flow control', level: 'Low', description: 'German sector capacity', slotDelay: 10 },
    { id: '15', region: 'NAT', type: 'Route restrictions', level: 'Moderate', description: 'Track C limited availability', slotDelay: 22 },
    { id: '16', region: 'USA', type: 'Miles-in-trail', level: 'High', description: 'East Coast spacing', slotDelay: 30 },
    { id: '17', region: 'ASIA', type: 'Flow control', level: 'Moderate', description: 'Tokyo terminal restrictions', slotDelay: 25 },
    { id: '18', region: 'PAC', type: 'Ground delay', level: 'Low', description: 'Sydney ATC staffing', slotDelay: 12 },
    { id: '19', region: 'EUR', type: 'Route restrictions', level: 'Active', description: 'French airspace closure', slotDelay: 45 },
    { id: '20', region: 'MID', type: 'Flow control', level: 'Moderate', description: 'Saudi Arabia routing', slotDelay: 18 },
    { id: '21', region: 'USA', type: 'Ground delay', level: 'High', description: 'Chicago weather', slotDelay: 50 },
    { id: '22', region: 'EUR', type: 'Miles-in-trail', level: 'Low', description: 'Spanish sector spacing', slotDelay: 8 },
    { id: '23', region: 'NAT', type: 'Flow control', level: 'Moderate', description: 'Track D weather deviation', slotDelay: 28 },
    { id: '24', region: 'ASIA', type: 'Route restrictions', level: 'Active', description: 'Korean airspace limits', slotDelay: 35 },
    { id: '25', region: 'PAC', type: 'Ground delay', level: 'Moderate', description: 'Honolulu capacity', slotDelay: 20 },
    { id: '26', region: 'EUR', type: 'Flow control', level: 'Low', description: 'Italian sector restrictions', slotDelay: 14 },
    { id: '27', region: 'MID', type: 'Route restrictions', level: 'Moderate', description: 'Egypt airspace flow', slotDelay: 16 },
    { id: '28', region: 'USA', type: 'Miles-in-trail', level: 'High', description: 'Denver spacing requirements', slotDelay: 32 },
    { id: '29', region: 'ASIA', type: 'Flow control', level: 'Low', description: 'Singapore terminal capacity', slotDelay: 11 },
    { id: '30', region: 'PAC', type: 'Ground delay', level: 'Moderate', description: 'Auckland weather', slotDelay: 24 }
  ])
  const [alternateAirports, setAlternateAirports] = useState([
    { code: 'MAN', name: 'Manchester', type: 'Primary', distance: 200, weather: 'VFR', estimatedDelay: 0 },
    { code: 'BHX', name: 'Birmingham', type: 'Secondary', distance: 150, weather: 'VFR', estimatedDelay: 5 },
    { code: 'STN', name: 'Stansted', type: 'Secondary', distance: 180, weather: 'MVFR', estimatedDelay: 10 },
    { code: 'LGW', name: 'Gatwick', type: 'Primary', distance: 120, weather: 'VFR', estimatedDelay: 15 },
    { code: 'LUT', name: 'Luton', type: 'Secondary', distance: 160, weather: 'VFR', estimatedDelay: 8 },
    { code: 'EWR', name: 'Newark', type: 'Primary', distance: 25, weather: 'MVFR', estimatedDelay: 20 },
    { code: 'JRB', name: 'Teterboro', type: 'Secondary', distance: 20, weather: 'VFR', estimatedDelay: 0 },
    { code: 'ISP', name: 'Long Island', type: 'Secondary', distance: 50, weather: 'VFR', estimatedDelay: 5 }
  ])
  const [fuelPlan, setFuelPlan] = useState({
    tripFuel: 18450,
    reserve: 3500,
    alternate: 2800,
    taxi: 400,
    contingency: 600
  })

  const handleCreateSchedule = () => {
    createFlightSchedule({
      ...newSchedule,
      flightNumber: newSchedule.flightNumber || generateFlightNumber(newRoute.origin, newRoute.destination),
      origin: newRoute.origin,
      destination: newRoute.destination,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2025-12-31',
      duration: newRoute.flightTime,
      distance: newRoute.distance,
      daysOfWeek: newSchedule.daysOfWeek,
      frequencies: calculateFrequency(newSchedule.daysOfWeek, newSchedule.effectiveSeason),
      aircraftType: newSchedule.aircraftType,
      slot: { origin: newSchedule.slotId, destination: newSchedule.slotId },
      status: 'active'
    })
    setShowScheduleDialog(false)
  }

  const handleCreateRoute = () => {
    const route: Route = {
      id: `R${routes.length + 1}`,
      ...newRoute,
      slots: generateTimeSlots(newRoute.flightTime)
    }
    setRoutes([...routes, route])
    setShowRoutePlanningDialog(false)
    resetRouteForm()
  }

  const handleCreateSeasonalSchedule = () => {
    const schedule: SeasonalSchedule = {
      id: `SS${seasonalSchedules.length + 1}`,
      ...newSeasonalSchedule
    }
    setSeasonalSchedules([...seasonalSchedules, schedule])
    setShowSeasonalDialog(false)
    resetSeasonalForm()
  }

  const handleCreateFleetAssignment = () => {
    const assignment: FleetAssignment = {
      id: `FA${fleetAssignments.length + 1}`,
      ...newFleetAssignment,
      maintenanceSchedule: []
    }
    setFleetAssignments([...fleetAssignments, assignment])
    setShowFleetDialog(false)
    resetFleetForm()
  }

  const generateFlightNumber = (origin: string, destination: string) => {
    const routeCode = `${origin}${destination}`
    const num = Math.floor(Math.random() * 900) + 100
    return `AA${routeCode}${num}`
  }

  const generateTimeSlots = (flightTime: number) => {
    const slots: Slot[] = []
    const startHour = 6 // 6 AM
    const endHour = 22 // 10 PM
    for (let h = startHour; h < endHour; h++) {
      slots.push({
        id: `slot-${h}`,
        time: `${h.toString().padStart(2, '0')}:00`,
        status: 'available'
      })
    }
    return slots
  }

  const calculateFrequency = (daysOfWeek: number[], season: string) => {
    const seasonalSchedule = seasonalSchedules.find(s => s.season === season)
    const baseFrequency = daysOfWeek.length
    const multiplier = seasonalSchedule?.frequencyMultiplier || 1
    return Math.round(baseFrequency * multiplier)
  }

  const resetRouteForm = () => {
    setNewRoute({
      origin: '',
      destination: '',
      distance: 0,
      flightTime: 0,
      aircraftTypes: ['B737-800'],
      priority: 'medium',
      demand: 'medium',
      competition: 3
    })
  }

  const resetSeasonalForm = () => {
    setNewSeasonalSchedule({
      season: 'low',
      startDate: '',
      endDate: '',
      frequencyMultiplier: 0.8,
      pricingMultiplier: 0.85,
      notes: ''
    })
  }

  const resetFleetForm = () => {
    setNewFleetAssignment({
      registration: '',
      aircraftType: 'B737-800',
      base: '',
      routes: [],
      utilizationRate: 85
    })
  }

  const getAircraftTypesForRoute = (routeId: string) => {
    const route = routes.find(r => r.id === routeId)
    return route?.aircraftTypes || ['B737-800']
  }

  // Disruption handlers
  const handleCreateDisruption = () => {
    if (!newDisruption.flightNumber) return

    const passengersAffected = flightInstances.find(f => f.flightNumber === newDisruption.flightNumber)?.bookedSeats || 150
    const estimatedCost = passengersAffected * 250 + (newDisruption.estimatedDelayMinutes * 5)

    createDisruption({
      flightNumber: newDisruption.flightNumber,
      type: newDisruption.type,
      code: newDisruption.code || 'GEN',
      reason: newDisruption.reason || 'Unknown',
      impact: {
        passengers: passengersAffected,
        estimatedCost,
        estimatedDelayMinutes: newDisruption.estimatedDelayMinutes
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      resolvedAt: null
    })
    setShowDisruptionDialog(false)
    setNewDisruption({
      flightNumber: '',
      type: 'delay',
      code: '',
      reason: '',
      estimatedDelayMinutes: 0,
      passengersAffected: 0
    })
  }

  const handleResolveDisruption = (disruptionId: string) => {
    const disruption = disruptions.find(d => d.id === disruptionId)
    if (!disruption) return

    // Find and update the disruption in store
    const updatedDisruptions = disruptions.map(d => 
      d.id === disruptionId ? { ...d, status: 'resolved', resolvedAt: new Date().toISOString() } : d
    )
    setDisruptions(updatedDisruptions)
    
    toast({ 
      title: 'Disruption Resolved', 
      description: `Disruption for ${disruption.flightNumber} has been resolved` 
    })
  }

  const handleAutoReaccommodate = (disruptionId: string) => {
    const disruption = disruptions.find(d => d.id === disruptionId)
    if (!disruption) return

    // Simulate auto-reaccommodation with realistic details
    const passengersReaccommodated = Math.floor(disruption.impact.passengers * 0.85) // 85% reaccommodated
    const alternativeFlights = Math.ceil(passengersReaccommodated / 150) // ~150 per flight
    
    toast({ 
      title: 'Auto-Reaccommodation Complete', 
      description: `${passengersReaccommodated} passengers rebooked across ${alternativeFlights} alternative flights` 
    })
  }

  // Dispatch handlers
  const handleGenerateFlightRelease = () => {
    if (!selectedFlightForDispatch) {
      toast({ title: 'No Flight Selected', description: 'Please select a flight first', variant: 'destructive' })
      return
    }

    setSelectedFlightForSchedule(selectedFlightForDispatch)
    setFlightReleaseApproved(false)

    // Generate a complete flight release with all required data
    const flightRelease = {
      flightNumber: selectedFlightForDispatch.flightNumber,
      origin: selectedFlightForDispatch.origin,
      destination: selectedFlightForDispatch.destination,
      aircraftType: selectedFlightForDispatch.aircraftType,
      departureTime: selectedFlightForDispatch.departureTime || '08:00',
      arrivalTime: selectedFlightForDispatch.arrivalTime || '16:25',
      generatedAt: new Date().toISOString(),
      weather: {
        departure: dispatchWeather.departure,
        destination: dispatchWeather.destination
      },
      notams: notams,
      atcRestrictions: atcRestrictions,
      alternateAirports: alternateAirports,
      fuelPlan: {
        ...fuelPlan,
        total: totalFuel
      },
      route: {
        distance: selectedFlightForDispatch?.distance || 0,
        flightTime: selectedFlightForDispatch?.duration || 0
      },
      crew: {
        captain: 'Capt. J. Smith',
        firstOfficer: 'F/O M. Johnson',
        cabinCrew: 4
      },
      status: 'Ready for departure'
    }

    setGeneratedFlightRelease(flightRelease)
    setShowFlightReleaseDialog(true)

    toast({ title: 'Flight Release Generated', description: `Flight ${selectedFlightForDispatch.flightNumber} release has been generated` })
  }

  const handleApproveFlightRelease = () => {
    setFlightReleaseApproved(true)
    toast({ title: 'Flight Release Approved', description: `Flight ${generatedFlightRelease?.flightNumber} has been approved for departure` })
  }

  const handleRefreshWeather = () => {
    // Simulate more realistic weather refresh with conditions
    const weatherConditions = ['Clear skies', 'Partly cloudy', 'Overcast', 'Light rain', 'Scattered clouds', 'Few clouds']
    const cloudCeilings = ['Unlimited', 'Unlimited', 'Unlimited', '5000ft AGL', '8000ft AGL', '2500ft AGL', '1500ft AGL']
    
    setDispatchWeather({
      departure: { 
        ...dispatchWeather.departure, 
        condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        temp: Math.round(dispatchWeather.departure.temp + (Math.random() - 0.5) * 8),
        windSpeed: Math.max(0, Math.min(50, dispatchWeather.departure.windSpeed + Math.round((Math.random() - 0.5) * 10))),
        windDirection: (dispatchWeather.departure.windDirection + Math.round((Math.random() - 0.5) * 30) + 360) % 360,
        visibility: Math.max(1, Math.min(20, Math.round(dispatchWeather.departure.visibility + (Math.random() - 0.5) * 3))),
        pressure: Math.round(dispatchWeather.departure.pressure + (Math.random() - 0.5) * 5),
        dewPoint: Math.round(dispatchWeather.departure.temp - Math.random() * 10),
        cloudCeiling: cloudCeilings[Math.floor(Math.random() * cloudCeilings.length)]
      },
      destination: { 
        ...dispatchWeather.destination, 
        condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        temp: Math.round(dispatchWeather.destination.temp + (Math.random() - 0.5) * 8),
        windSpeed: Math.max(0, Math.min(50, dispatchWeather.destination.windSpeed + Math.round((Math.random() - 0.5) * 10))),
        windDirection: (dispatchWeather.destination.windDirection + Math.round((Math.random() - 0.5) * 30) + 360) % 360,
        visibility: Math.max(1, Math.min(20, Math.round(dispatchWeather.destination.visibility + (Math.random() - 0.5) * 3))),
        pressure: Math.round(dispatchWeather.destination.pressure + (Math.random() - 0.5) * 5),
        dewPoint: Math.round(dispatchWeather.destination.temp - Math.random() * 10),
        cloudCeiling: cloudCeilings[Math.floor(Math.random() * cloudCeilings.length)]
      }
    })
    toast({ title: 'Weather Refreshed', description: 'Latest weather information loaded' })
  }

  const handleRefreshNotams = () => {
    // Simulate NOTAM refresh with new realistic NOTAMs
    const notamTypes = ['maintenance', 'construction', 'navigation', 'obstacle', 'airspace']
    const airports = ['JFK', 'LHR', 'LAX', 'TYO', 'SFO', 'DXB', 'FRA', 'PAR', 'SIN', 'HKG']
    const messages = [
      'RWY 04R/22L closed for maintenance',
      'ILS approach out of service - use visual approach',
      'Taxiway Alpha closed between intersections B and C',
      'Crane operations 500ft AGL near terminal 3',
      'Temporary restricted airspace active for event',
      'Ground radar unreliable - use visual confirmation',
      'Fuel truck operations on apron C',
      'De-icing equipment in use at stands 1-10'
    ]
    
    // Add 1-2 new NOTAMs randomly
    const newNotamsCount = Math.floor(Math.random() * 2) + 1
    const newNotams = Array.from({ length: newNotamsCount }, (_, i) => ({
      id: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}/24`,
      airport: airports[Math.floor(Math.random() * airports.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      type: notamTypes[Math.floor(Math.random() * notamTypes.length)] as 'maintenance' | 'construction' | 'navigation' | 'obstacle' | 'airspace',
      validFrom: new Date().toISOString().split('T')[0],
      validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
    
    setNotams([...newNotams, ...notams].slice(0, 10)) // Keep max 10 NOTAMs
    toast({ title: 'NOTAMs Refreshed', description: `${newNotamsCount} new NOTAM(s) loaded` })
  }

  const handleUpdateATC = () => {
    // Simulate ATC update with dynamic restrictions
    const regions = ['EUR', 'NAT', 'PAC', 'USA', 'ASIA', 'MID']
    const restrictionTypes = ['Flow control', 'Route restrictions', 'Slot reductions', 'Ground delay', 'Miles-in-trail']
    const levels = ['Active', 'Moderate', 'Low', 'High']
    
    // Update existing restrictions with new values
    const updatedRestrictions = atcRestrictions.map(restriction => ({
      ...restriction,
      level: levels[Math.floor(Math.random() * levels.length)],
      slotDelay: Math.max(0, restriction.slotDelay + Math.round((Math.random() - 0.5) * 15))
    }))
    
    // Occasionally add a new restriction
    if (Math.random() > 0.7) {
      const newRestriction = {
        id: String(updatedRestrictions.length + 1),
        region: regions[Math.floor(Math.random() * regions.length)],
        type: restrictionTypes[Math.floor(Math.random() * restrictionTypes.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        description: `Updated ${(new Date()).getHours()}:${String((new Date()).getMinutes()).padStart(2, '0')}`,
        slotDelay: Math.floor(Math.random() * 45)
      }
      setAtcRestrictions([newRestriction, ...updatedRestrictions].slice(0, 8))
    } else {
      setAtcRestrictions(updatedRestrictions)
    }
    
    // Update alternate airports with new delays
    setAlternateAirports(alternateAirports.map(alt => ({
      ...alt,
      estimatedDelay: Math.max(0, alt.estimatedDelay + Math.round((Math.random() - 0.5) * 10))
    })))
    
    toast({ title: 'ATC Updated', description: 'ATC restrictions have been updated' })
  }

  // Additional handlers for Edit buttons - now with dialogs
  const handleEditRoute = (routeId: string) => {
    const route = routes.find(r => r.id === routeId)
    if (route) {
      setEditingRoute(route)
      setShowEditRouteDialog(true)
    }
  }

  const handleEditSchedule = (scheduleId: string) => {
    const schedule = flightSchedules.find(s => s.id === scheduleId)
    if (schedule) {
      setEditingSchedule(schedule)
      setShowEditScheduleDialog(true)
    }
  }

  const handleEditSeasonalSchedule = (scheduleId: string) => {
    const schedule = seasonalSchedules.find(s => s.id === scheduleId)
    if (schedule) {
      setEditingSeasonalSchedule(schedule)
      setShowEditSeasonalDialog(true)
    }
  }

  const handleEditFleetAssignment = (assignmentId: string) => {
    const assignment = fleetAssignments.find(a => a.id === assignmentId)
    if (assignment) {
      setEditingFleetAssignment(assignment)
      setShowEditFleetDialog(true)
    }
  }

  // Save handlers for edit dialogs
  const handleSaveRoute = () => {
    if (!editingRoute) return
    setRoutes(routes.map(r => r.id === editingRoute.id ? editingRoute : r))
    setShowEditRouteDialog(false)
    setEditingRoute(null)
    toast({ title: 'Route Updated', description: `${editingRoute.origin} → ${editingRoute.destination} has been updated` })
  }

  const handleSaveSchedule = () => {
    if (!editingSchedule) return
    updateFlightSchedule(editingSchedule.id, editingSchedule)
    toast({ title: 'Schedule Updated', description: `${editingSchedule.flightNumber} has been updated` })
    setShowEditScheduleDialog(false)
    setEditingSchedule(null)
  }

  const handleSaveSeasonalSchedule = () => {
    if (!editingSeasonalSchedule) return
    setSeasonalSchedules(seasonalSchedules.map(s => s.id === editingSeasonalSchedule.id ? editingSeasonalSchedule : s))
    setShowEditSeasonalDialog(false)
    setEditingSeasonalSchedule(null)
    toast({ title: 'Seasonal Schedule Updated', description: `${editingSeasonalSchedule.season} season has been updated` })
  }

  const handleSaveFleetAssignment = () => {
    if (!editingFleetAssignment) return
    setFleetAssignments(fleetAssignments.map(f => f.id === editingFleetAssignment.id ? editingFleetAssignment : f))
    setShowEditFleetDialog(false)
    setEditingFleetAssignment(null)
    toast({ title: 'Fleet Assignment Updated', description: `${editingFleetAssignment.registration} has been updated` })
  }

  const handleDownloadPDF = () => {
    const flightNum = selectedFlightForDispatch?.flightNumber || 'Unknown'
    const origin = selectedFlightForDispatch?.origin || 'N/A'
    const dest = selectedFlightForDispatch?.destination || 'N/A'
    
    const pdfContent = `================================================================================
                              FLIGHT RELEASE DOCUMENT
================================================================================

Generated: ${new Date().toLocaleString()}
Flight: ${flightNum}
Route: ${origin} → ${dest}
Aircraft: ${selectedFlightForDispatch?.aircraftType || 'N/A'}
Status: Ready for departure

--------------------------------------------------------------------------------
                              FLIGHT INFORMATION
--------------------------------------------------------------------------------

Departure Time: ${selectedFlightForDispatch?.departureTime || 'N/A'}
Arrival Time: ${selectedFlightForDispatch?.arrivalTime || 'N/A'}
Flight Duration: ${selectedFlightForDispatch?.duration || 0} minutes
Distance: ${selectedFlightForDispatch?.distance || 0} km

--------------------------------------------------------------------------------
                              WEATHER INFORMATION
--------------------------------------------------------------------------------

DEPARTURE (${origin}):
  Conditions: ${dispatchWeather.departure.condition}
  Temperature: ${dispatchWeather.departure.temp}°C
  Wind: ${dispatchWeather.departure.windSpeed}kt from ${dispatchWeather.departure.windDirection}°
  Visibility: ${dispatchWeather.departure.visibility}km
  Pressure: ${dispatchWeather.departure.pressure} hPa
  Dew Point: ${dispatchWeather.departure.dewPoint}°C
  Cloud Ceiling: ${dispatchWeather.departure.cloudCeiling}

DESTINATION (${dest}):
  Conditions: ${dispatchWeather.destination.condition}
  Temperature: ${dispatchWeather.destination.temp}°C
  Wind: ${dispatchWeather.destination.windSpeed}kt from ${dispatchWeather.destination.windDirection}°
  Visibility: ${dispatchWeather.destination.visibility}km
  Pressure: ${dispatchWeather.destination.pressure} hPa
  Dew Point: ${dispatchWeather.destination.dewPoint}°C
  Cloud Ceiling: ${dispatchWeather.destination.cloudCeiling}

--------------------------------------------------------------------------------
                              ACTIVE NOTAMs
--------------------------------------------------------------------------------

${notams.map(n => `  ${n.id} - ${n.airport}
  Type: ${n.type}
  Valid: ${n.validFrom} to ${n.validTo}
  ${n.message}`).join('\n\n')}

--------------------------------------------------------------------------------
                              ATC RESTRICTIONS
--------------------------------------------------------------------------------

${atcRestrictions.map(r => `  ${r.region} - ${r.type}
  Level: ${r.level}
  Slot Delay: ${r.slotDelay}min
  ${r.description}`).join('\n\n')}

--------------------------------------------------------------------------------
                              ALTERNATE AIRPORTS
--------------------------------------------------------------------------------

${alternateAirports.map(a => `  ${a.code} - ${a.name} (${a.type})
  Distance: ${a.distance}nm
  Weather: ${a.weather}
  Est. Delay: ${a.estimatedDelay}min`).join('\n')}

--------------------------------------------------------------------------------
                              FUEL PLAN
--------------------------------------------------------------------------------

  Trip Fuel:      ${fuelPlan.tripFuel.toLocaleString()} kg
  Reserve Fuel:   ${fuelPlan.reserve.toLocaleString()} kg
  Alternate Fuel:  ${fuelPlan.alternate.toLocaleString()} kg
  Taxi Fuel:      ${fuelPlan.taxi.toLocaleString()} kg
  Contingency:    ${fuelPlan.contingency.toLocaleString()} kg
  -----------------------------------------------------------------------------
  TOTAL FUEL:     ${totalFuel.toLocaleString()} kg

--------------------------------------------------------------------------------
                              CREW INFORMATION
--------------------------------------------------------------------------------

  Captain:      Capt. J. Smith
  First Officer: F/O M. Johnson
  Cabin Crew:   4 Flight Attendants

================================================================================
                              END OF FLIGHT RELEASE
================================================================================
`
    
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `flight-release-${flightNum}-${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    
    toast({ title: 'Download Complete', description: 'Flight release document downloaded' })
  }

  const totalFuel = fuelPlan.tripFuel + fuelPlan.reserve + fuelPlan.alternate + fuelPlan.taxi + fuelPlan.contingency

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Flight Operations Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule Planning, Disruption Management, and Flight Dispatch
          </p>
        </div>
      </div>

      {/* Operations Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled Flights</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flightSchedules.length}</div>
            <div className="text-xs text-muted-foreground mt-1">active schedules</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Operations</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flightInstances.length}</div>
            <div className="text-xs text-muted-foreground mt-1">flights today</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <div className="text-xs text-green-600 mt-1">+2.3% vs last week</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Disruptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disruptions.filter(d => d.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">requiring attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Schedule Planning</TabsTrigger>
          <TabsTrigger value="disruption">Disruption Management</TabsTrigger>
          <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
        </TabsList>

        {/* Schedule Planning Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {/* Route Planning Section */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center flex-wrap gap-2">
                  <Route className="h-5 w-5" />
                  Route Planning
                </CardTitle>
                <Dialog open={showRoutePlanningDialog} onOpenChange={setShowRoutePlanningDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Route
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-w-[95vw]">
                    <DialogHeader>
                      <DialogTitle>Add New Route</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Origin Airport</Label>
                          <Input value={newRoute.origin} onChange={(e) => setNewRoute({...newRoute, origin: e.target.value})} placeholder="JFK" />
                        </div>
                        <div>
                          <Label>Destination Airport</Label>
                          <Input value={newRoute.destination} onChange={(e) => setNewRoute({...newRoute, destination: e.target.value})} placeholder="LHR" />
                        </div>
                        <div>
                          <Label>Distance (km)</Label>
                          <Input type="number" value={newRoute.distance || ''} onChange={(e) => setNewRoute({...newRoute, distance: Number(e.target.value)})} placeholder="5567" />
                        </div>
                        <div>
                          <Label>Flight Time (min)</Label>
                          <Input type="number" value={newRoute.flightTime || ''} onChange={(e) => setNewRoute({...newRoute, flightTime: Number(e.target.value)})} placeholder="435" />
                        </div>
                      </div>
                      <div>
                        <Label>Available Aircraft Types</Label>
                        <div className="space-y-2">
                          {['B737-800', 'A320-200', 'A330-300', 'B777-300ER', 'A350-900', 'A380'].map((type) => (
                            <div key={type} className="flex items-center flex-wrap space-x-2">
                              <input 
                                type="checkbox" 
                                id={`ac-${type}`}
                                checked={newRoute.aircraftTypes.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRoute({...newRoute, aircraftTypes: [...newRoute.aircraftTypes, type]})
                                  } else {
                                    setNewRoute({...newRoute, aircraftTypes: newRoute.aircraftTypes.filter(t => t !== type)})
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={`ac-${type}`} className="text-sm">{type}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Route Priority</Label>
                          <Select value={newRoute.priority} onValueChange={(v: any) => setNewRoute({...newRoute, priority: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Demand Level</Label>
                          <Select value={newRoute.demand} onValueChange={(v: any) => setNewRoute({...newRoute, demand: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Competitors</Label>
                          <Input type="number" value={newRoute.competition || ''} onChange={(e) => setNewRoute({...newRoute, competition: Number(e.target.value)})} placeholder="3" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRoutePlanningDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateRoute}>Add Route</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Define routes, aircraft compatibility, and market analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-80">
                <table className="enterprise-table min-w-[1000px]">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Distance</th>
                      <th>Flight Time</th>
                      <th>Priority</th>
                      <th>Demand</th>
                      <th>Aircraft Types</th>
                      <th>Competitors</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routes.map((route) => (
                      <tr key={route.id}>
                        <td className="font-medium">{route.origin} → {route.destination}</td>
                        <td>{route.distance.toLocaleString()} km</td>
                        <td>{route.flightTime} min</td>
                        <td>
                          <Badge variant={route.priority === 'high' ? 'default' : route.priority === 'medium' ? 'secondary' : 'outline'}>
                            {route.priority}
                          </Badge>
                        </td>
                        <td>
                          <Badge variant={route.demand === 'high' ? 'default' : route.demand === 'medium' ? 'secondary' : 'outline'}>
                            {route.demand}
                          </Badge>
                        </td>
                        <td className="text-sm">{route.aircraftTypes.join(', ')}</td>
                        <td>{route.competition}</td>
                        <td>
                          <Button variant="ghost" size="sm" onClick={() => handleEditRoute(route.id)}>
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

          {/* Schedule Planning Section */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center flex-wrap gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Flight Schedules
                </CardTitle>
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                    <DialogHeader>
                      <DialogTitle>Create Flight Schedule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Route</Label>
                          <Select value={newSchedule.routeId} onValueChange={(v) => setNewSchedule({...newSchedule, routeId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                            <SelectContent>
                              {routes.map(route => (
                                <SelectItem key={route.id} value={route.id}>{route.origin} → {route.destination}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Aircraft Type</Label>
                          <Select value={newSchedule.aircraftType} onValueChange={(v) => setNewSchedule({...newSchedule, aircraftType: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {getAircraftTypesForRoute(newSchedule.routeId).map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Effective Season</Label>
                          <Select value={newSchedule.effectiveSeason} onValueChange={(v: any) => setNewSchedule({...newSchedule, effectiveSeason: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Season</SelectItem>
                              <SelectItem value="shoulder">Shoulder Season</SelectItem>
                              <SelectItem value="peak">Peak Season</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Time Slots</Label>
                          <Select value={newSchedule.slotId} onValueChange={(v) => setNewSchedule({...newSchedule, slotId: v})}>
                            <SelectTrigger><SelectValue placeholder="Select slot" /></SelectTrigger>
                            <SelectContent>
                              {routes.find(r => r.id === newSchedule.routeId)?.slots.map((slot, i) => (
                                <SelectItem key={slot.id} value={slot.id}>
                                  {slot.time} ({slot.status})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Operating Days</Label>
                        <div className="flex flex-wrap gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                            const dayNum = i + 1
                            return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                setNewSchedule(prev => ({
                                  ...prev,
                                  daysOfWeek: prev.daysOfWeek.includes(dayNum)
                                    ? prev.daysOfWeek.filter(d => d !== dayNum)
                                    : [...prev.daysOfWeek, dayNum]
                                }))
                              }}
                              className={`px-3 py-2 text-sm rounded-md border ${
                                newSchedule.daysOfWeek.includes(dayNum)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border-gray-300 hover:bg-secondary'
                              }`}
                            >
                              {day}
                            </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
                      <Button onClick={handleCreateSchedule}>Create Schedule</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Create flight schedules with route, frequency, and fleet assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto h-80">
                <table className="enterprise-table min-w-[1100px]">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th>Route</th>
                      <th>Dep</th>
                      <th>Arr</th>
                      <th>Days</th>
                      <th>Aircraft</th>
                      <th>Season</th>
                      <th>Slot</th>
                      <th>Frequency</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flightSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td className="font-medium">{schedule.flightNumber}</td>
                        <td>{schedule.origin} → {schedule.destination}</td>
                        <td className="text-sm">{schedule.departureTime}</td>
                        <td className="text-sm">{schedule.arrivalTime}</td>
                        <td className="text-sm">{schedule.daysOfWeek.map(d => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d-1]).join(', ')}</td>
                        <td className="text-sm">{schedule.aircraftType}</td>
                        <td>
                          <Badge variant={schedule.season ? 'outline' : 'secondary'}>
                            {schedule.season || 'Standard'}
                          </Badge>
                        </td>
                        <td className="text-sm">{schedule.slot?.time || '-'}</td>
                        <td className="text-sm">{schedule.frequencies}/week</td>
                        <td>
                          <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                            {schedule.status}
                          </Badge>
                        </td>
                        <td>
                          <Button variant="ghost" size="sm" onClick={() => handleEditSchedule(schedule.id)}>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Seasonal Scheduling */}
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center flex-wrap gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Seasonal Schedules
                  </CardTitle>
                  <Dialog open={showSeasonalDialog} onOpenChange={setShowSeasonalDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Season
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                      <DialogHeader>
                        <DialogTitle>Add Seasonal Schedule</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Season</Label>
                            <Select value={newSeasonalSchedule.season} onValueChange={(v: any) => setNewSeasonalSchedule({...newSeasonalSchedule, season: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low Season</SelectItem>
                                <SelectItem value="shoulder">Shoulder Season</SelectItem>
                                <SelectItem value="peak">Peak Season</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input type="date" value={newSeasonalSchedule.startDate} onChange={(e) => setNewSeasonalSchedule({...newSeasonalSchedule, startDate: e.target.value})} />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input type="date" value={newSeasonalSchedule.endDate} onChange={(e) => setNewSeasonalSchedule({...newSeasonalSchedule, endDate: e.target.value})} />
                          </div>
                          <div>
                            <Label>Frequency Multiplier</Label>
                            <div className="flex items-center flex-wrap gap-4">
                              <Slider
                                min={0.5}
                                max={1.5}
                                step={0.1}
                                value={newSeasonalSchedule.frequencyMultiplier}
                                onValueChange={(v) => setNewSeasonalSchedule({...newSeasonalSchedule, frequencyMultiplier: v})}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground w-12">{newSeasonalSchedule.frequencyMultiplier}x</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Pricing Multiplier</Label>
                          <div className="flex items-center flex-wrap gap-4">
                            <Slider
                              min={0.5}
                              max={2.0}
                              step={0.05}
                              value={newSeasonalSchedule.pricingMultiplier}
                              onValueChange={(v) => setNewSeasonalSchedule({...newSeasonalSchedule, pricingMultiplier: v})}
                              className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground w-12">{newSeasonalSchedule.pricingMultiplier}x</span>
                          </div>
                        </div>
                        <div>
                          <Label>Notes</Label>
                          <Textarea value={newSeasonalSchedule.notes} onChange={(e) => setNewSeasonalSchedule({...newSeasonalSchedule, notes: e.target.value})} placeholder="Seasonal considerations..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSeasonalDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateSeasonalSchedule}>Add Season</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto h-80">
                  <table className="enterprise-table min-w-[800px]">
                    <thead>
                      <tr>
                        <th>Season</th>
                        <th>Period</th>
                        <th>Freq. Multiplier</th>
                        <th>Price Multiplier</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonalSchedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td className="font-medium capitalize">{schedule.season} Season</td>
                          <td className="text-sm">{schedule.startDate} to {schedule.endDate}</td>
                          <td className="text-sm font-medium text-primary">{schedule.frequencyMultiplier}x</td>
                          <td className="text-sm font-medium text-green-600">{schedule.pricingMultiplier}x</td>
                          <td className="text-sm text-muted-foreground max-w-xs truncate">{schedule.notes}</td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => handleEditSeasonalSchedule(schedule.id)}>
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

            {/* Fleet Assignment */}
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center flex-wrap gap-2">
                    <Database className="h-5 w-5" />
                    Fleet Assignment
                  </CardTitle>
                  <Dialog open={showFleetDialog} onOpenChange={setShowFleetDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign Fleet
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
                      <DialogHeader>
                        <DialogTitle>Assign Aircraft to Route</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label>Registration</Label>
                            <Select value={newFleetAssignment.registration} onValueChange={(v) => setNewFleetAssignment({...newFleetAssignment, registration: v})}>
                              <SelectTrigger><SelectValue placeholder="Select aircraft" /></SelectTrigger>
                              <SelectContent>
                                {fleetAssignments.map(fa => (
                                  <SelectItem key={fa.registration} value={fa.registration}>
                                    {fa.registration} ({fa.aircraftType})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Aircraft Type</Label>
                            <Select value={newFleetAssignment.aircraftType} onValueChange={(v) => setNewFleetAssignment({...newFleetAssignment, aircraftType: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="B737-800">B737-800</SelectItem>
                                <SelectItem value="A320-200">A320-200</SelectItem>
                                <SelectItem value="A330-300">A330-300</SelectItem>
                                <SelectItem value="B777-300ER">B777-300ER</SelectItem>
                                <SelectItem value="A350-900">A350-900</SelectItem>
                                <SelectItem value="A380">A380</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Base Airport</Label>
                            <Input value={newFleetAssignment.base} onChange={(e) => setNewFleetAssignment({...newFleetAssignment, base: e.target.value})} placeholder="JFK" />
                          </div>
                          <div>
                            <Label>Target Utilization %</Label>
                            <div className="flex items-center flex-wrap gap-4">
                              <Slider
                                min={60}
                                max={100}
                                value={newFleetAssignment.utilizationRate}
                                onValueChange={(v) => setNewFleetAssignment({...newFleetAssignment, utilizationRate: v})}
                                className="flex-1"
                              />
                              <span className="text-sm text-muted-foreground w-12">{newFleetAssignment.utilizationRate}%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Assigned Routes</Label>
                          <div className="space-y-2">
                            {routes.map(route => (
                              <div key={route.id} className="flex items-center flex-wrap space-x-2">
                                <input 
                                  type="checkbox"
                                  id={`route-${route.id}`}
                                  checked={newFleetAssignment.routes.includes(route.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewFleetAssignment({...newFleetAssignment, routes: [...newFleetAssignment.routes, route.id]})
                                    } else {
                                      setNewFleetAssignment({...newFleetAssignment, routes: newFleetAssignment.routes.filter(r => r !== route.id)})
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <label htmlFor={`route-${route.id}`} className="text-sm">{route.origin} → {route.destination}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowFleetDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateFleetAssignment}>Assign Fleet</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto h-80">
                  <table className="enterprise-table min-w-[900px]">
                    <thead>
                      <tr>
                        <th>Registration</th>
                        <th>Type</th>
                        <th>Base</th>
                        <th>Routes</th>
                        <th>Utilization</th>
                        <th>Maintenance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fleetAssignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td className="font-medium">{assignment.registration}</td>
                          <td>{assignment.aircraftType}</td>
                          <td>{assignment.base}</td>
                          <td className="text-sm">{assignment.routes.join(', ')}</td>
                          <td>
                            <div className="flex items-center flex-wrap gap-2">
                              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden min-w-0">
                                <div 
                                  className={`h-full transition-all ${assignment.utilizationRate >= 95 ? 'bg-green-500' : assignment.utilizationRate >= 85 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                  style={{ width: `${assignment.utilizationRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium whitespace-nowrap">{assignment.utilizationRate}%</span>
                            </div>
                          </td>
                          <td>
                            <Badge variant={assignment.maintenanceSchedule.length > 0 ? 'destructive' : 'secondary'}>
                              {assignment.maintenanceSchedule.length} scheduled
                            </Badge>
                          </td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => handleEditFleetAssignment(assignment.id)}>
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
          </div>
        </TabsContent>

        {/* Disruption Management Tab */}
        <TabsContent value="disruption" className="space-y-4">
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Disruption Management</CardTitle>
                <Dialog open={showDisruptionDialog} onOpenChange={setShowDisruptionDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Log Disruption
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Disruption Event</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Flight Number</Label>
                          <Select value={newDisruption.flightNumber} onValueChange={(v) => setNewDisruption({...newDisruption, flightNumber: v})}>
                            <SelectTrigger><SelectValue placeholder="Select flight" /></SelectTrigger>
                            <SelectContent>
                              {flightInstances.map(f => (
                                <SelectItem key={f.id} value={f.flightNumber}>{f.flightNumber} - {f.origin}→{f.destination}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Disruption Type</Label>
                          <Select value={newDisruption.type} onValueChange={(v: any) => setNewDisruption({...newDisruption, type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="delay">Delay</SelectItem>
                              <SelectItem value="cancellation">Cancellation</SelectItem>
                              <SelectItem value="diversion">Diversion</SelectItem>
                              <SelectItem value="aircraft_swap">Aircraft Swap</SelectItem>
                              <SelectItem value="crew_change">Crew Change</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Delay Code</Label>
                          <Select value={newDisruption.code} onValueChange={(v) => setNewDisruption({...newDisruption, code: v})}>
                            <SelectTrigger><SelectValue placeholder="Select code" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WX">WX - Weather</SelectItem>
                              <SelectItem value="MT">MT - Maintenance</SelectItem>
                              <SelectItem value="CT">CT - Crew</SelectItem>
                              <SelectItem value="AT">AT - ATC</SelectItem>
                              <SelectItem value="PS">PS - Passenger</SelectItem>
                              <SelectItem value="GEN">GEN - General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Est. Delay (minutes)</Label>
                          <Input type="number" value={newDisruption.estimatedDelayMinutes || ''} onChange={(e) => setNewDisruption({...newDisruption, estimatedDelayMinutes: Number(e.target.value)})} placeholder="30" />
                        </div>
                      </div>
                      <div>
                        <Label>Reason</Label>
                        <Textarea value={newDisruption.reason} onChange={(e) => setNewDisruption({...newDisruption, reason: e.target.value})} placeholder="Severe weather conditions at departure airport" rows={3} />
                      </div>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-sm">
                        <div className="flex items-center flex-wrap gap-2 text-sm">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-800">
                            Auto-reaccommodation will be available after logging. Affected passengers will be calculated automatically.
                          </span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDisruptionDialog(false)}>Cancel</Button>
                      <Button variant="destructive" onClick={handleCreateDisruption}>Log Disruption</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <CardDescription>
                Auto re-accommodation, passenger re-protection, and disruption handling
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto h-96">
                <table className="enterprise-table min-w-[1000px]">
                    <thead>
                      <tr>
                        <th>Flight</th>
                        <th>Type</th>
                        <th>Reason</th>
                        <th>Code</th>
                        <th>Pax Affected</th>
                        <th>Est. Cost</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disruptions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted-foreground py-8">
                            No disruption events recorded
                          </td>
                        </tr>
                      ) : (
                        disruptions.map((disruption) => (
                          <tr key={disruption.id}>
                            <td className="font-medium">{disruption.flightNumber}</td>
                            <td>
                              <Badge variant="destructive" className="capitalize">{disruption.type}</Badge>
                            </td>
                            <td className="text-sm">{disruption.reason}</td>
                            <td className="text-sm font-mono">{disruption.code}</td>
                            <td className="text-sm">{disruption.impact.passengers}</td>
                            <td className="text-sm text-red-600">${disruption.impact.estimatedCost.toLocaleString()}</td>
                            <td>
                              <Badge 
                                variant={disruption.status === 'active' ? 'destructive' : 
                                        disruption.status === 'resolved' ? 'default' : 'secondary'}
                                className="capitalize"
                              >
                                {disruption.status}
                              </Badge>
                            </td>
                            <td>
                              <div className="flex items-center flex-wrap gap-1">
                                {disruption.status === 'active' && (
                                  <>
                                    <Button variant="ghost" size="sm" onClick={() => handleAutoReaccommodate(disruption.id)} title="Auto-reaccommodate passengers">
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleResolveDisruption(disruption.id)} title="Resolve disruption">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </Button>
                                  </>
                                )}
                                {disruption.status === 'resolved' && (
                                  <Badge variant="default" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolved
                                  </Badge>
                                )}
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
        </TabsContent>

        {/* Dispatch Tab */}
        <TabsContent value="dispatch" className="space-y-4">
          {/* Flight Selection */}
          <Card className="enterprise-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Flight Selection</CardTitle>
                <Select value={selectedFlightForDispatch?.id || ''} onValueChange={(v) => setSelectedFlightForDispatch(flightSchedules.find(s => s.id === v) || null)}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="Select flight for dispatch" /></SelectTrigger>
                  <SelectContent>
                    {flightSchedules.map(schedule => (
                      <SelectItem key={schedule.id} value={schedule.id}>
                        {schedule.flightNumber} - {schedule.origin} → {schedule.destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Select a flight to view and manage dispatch information
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Flight Release</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleRefreshWeather}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <CardDescription>
                  Weather integration, NOTAMs, and flight documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <Cloud className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Departure Weather</span>
                      </div>
                      <Badge variant={dispatchWeather.departure.visibility >= 10 ? 'default' : 'destructive'} className="text-xs">
                        {dispatchWeather.departure.visibility >= 10 ? 'OK' : 'WARNING'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{dispatchWeather.departure.condition}, {dispatchWeather.departure.temp}°C</div>
                      <div>Wind: {dispatchWeather.departure.windSpeed}kt from {dispatchWeather.departure.windDirection}°</div>
                      <div>Visibility: {dispatchWeather.departure.visibility}km</div>
                      <div>Pressure: {dispatchWeather.departure.pressure} hPa</div>
                      <div>Cloud Ceiling: {dispatchWeather.departure.cloudCeiling}</div>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center flex-wrap gap-2">
                        <Cloud className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Destination Weather</span>
                      </div>
                      <Badge variant={dispatchWeather.destination.visibility >= 10 ? 'default' : 'destructive'} className="text-xs">
                        {dispatchWeather.destination.visibility >= 10 ? 'OK' : 'WARNING'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{dispatchWeather.destination.condition}, {dispatchWeather.destination.temp}°C</div>
                      <div>Wind: {dispatchWeather.destination.windSpeed}kt from {dispatchWeather.destination.windDirection}°</div>
                      <div>Visibility: {dispatchWeather.destination.visibility}km</div>
                      <div>Pressure: {dispatchWeather.destination.pressure} hPa</div>
                      <div>Cloud Ceiling: {dispatchWeather.destination.cloudCeiling}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">Active NOTAMs</h3>
                    <Button variant="ghost" size="sm" onClick={handleRefreshNotams}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="overflow-x-auto h-40">
                    <div className="space-y-2 min-w-full">
                      {notams.map(notam => (
                        <div key={notam.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded-sm text-sm min-w-[300px]">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="font-medium truncate">{notam.id} - {notam.airport}</div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">{notam.type}</Badge>
                          </div>
                          <div className="text-muted-foreground text-xs mt-1 break-words">{notam.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">Valid: {notam.validFrom} to {notam.validTo}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button className="w-full" onClick={handleGenerateFlightRelease}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Flight Release
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="enterprise-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ATC Integration</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleUpdateATC}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>
                <CardDescription>
                  Air Traffic Control restrictions and slot management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Slot Status</div>
                      <div className="text-xs text-muted-foreground mt-1">All slots confirmed</div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">ATC Restrictions</h3>
                  <div className="overflow-x-auto h-48">
                    <div className="space-y-2 min-w-full">
                      {atcRestrictions.map(restriction => (
                        <div key={restriction.id} className="p-2 bg-secondary/30 rounded-sm text-sm flex items-center justify-between min-w-[350px]">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{restriction.type} - {restriction.region}</div>
                            <div className="text-xs text-muted-foreground truncate">{restriction.description}</div>
                            <div className="text-xs text-orange-600">Slot Delay: {restriction.slotDelay}min</div>
                          </div>
                          <Badge variant={restriction.level === 'Active' || restriction.level === 'High' ? 'destructive' : 'outline'} className="flex-shrink-0 ml-2">
                            {restriction.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Alternate Airports</h3>
                  <div className="overflow-x-auto h-48">
                    <div className="space-y-2 min-w-full">
                      {alternateAirports.map(alt => (
                        <div key={alt.code} className="flex items-center justify-between text-sm p-2 bg-secondary/30 rounded-sm min-w-[300px]">
                          <div className="flex items-center flex-wrap gap-2 min-w-0 flex-1">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="font-medium truncate">{alt.code} ({alt.name})</div>
                              <div className="text-xs text-muted-foreground">{alt.distance}nm • {alt.weather}</div>
                              {alt.estimatedDelay > 0 && <div className="text-xs text-orange-600">Est. Delay: {alt.estimatedDelay}min</div>}
                            </div>
                          </div>
                          <Badge variant={alt.type === 'Primary' ? 'default' : 'secondary'} className="flex-shrink-0 ml-2">{alt.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Fuel Planning</h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center flex-wrap gap-2">
                        <Fuel className="h-5 w-5 text-primary" />
                        <span className="font-medium">Fuel Requirements</span>
                      </div>
                      <GaugeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Trip Fuel:</span>
                        <div className="font-medium">{fuelPlan.tripFuel.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reserve:</span>
                        <div className="font-medium">{fuelPlan.reserve.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Alternate:</span>
                        <div className="font-medium">{fuelPlan.alternate.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Taxi:</span>
                        <div className="font-medium">{fuelPlan.taxi.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contingency:</span>
                        <div className="font-medium">{fuelPlan.contingency.toLocaleString()} kg</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <div className="font-bold text-primary text-lg">{totalFuel.toLocaleString()} kg</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      Based on route distance, aircraft type, and weather conditions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flight Status Timeline */}
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Flight Status Timeline</CardTitle>
              <CardDescription>
                Track flight progress and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center justify-between min-w-[600px]">
                  {[
                    { status: 'scheduled', label: 'Scheduled', time: '08:00' },
                    { status: 'checkin_open', label: 'Check-in Open', time: '05:00' },
                    { status: 'boarding', label: 'Boarding', time: '07:30' },
                    { status: 'departed', label: 'Departed', time: '08:05' },
                    { status: 'enroute', label: 'En Route', time: '08:10' },
                    { status: 'arrived', label: 'Arrived', time: '16:25' }
                  ].map((milestone, i) => (
                    <div key={milestone.status} className="flex flex-col items-center flex-1 min-w-[100px]">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 ${i < 3 ? 'bg-primary' : 'bg-gray-300'}`} />
                      <div className="text-xs mt-2 font-medium text-center whitespace-nowrap">{milestone.label}</div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">{milestone.time}</div>
                      {i < 5 && <ArrowRight className="h-4 w-4 text-muted-foreground mt-2 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Route Dialog */}
      <Dialog open={showEditRouteDialog} onOpenChange={setShowEditRouteDialog}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
          </DialogHeader>
          {editingRoute && (
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Origin Airport</Label>
                  <Input value={editingRoute.origin} onChange={(e) => setEditingRoute({...editingRoute, origin: e.target.value})} />
                </div>
                <div>
                  <Label>Destination Airport</Label>
                  <Input value={editingRoute.destination} onChange={(e) => setEditingRoute({...editingRoute, destination: e.target.value})} />
                </div>
                <div>
                  <Label>Distance (km)</Label>
                  <Input type="number" value={editingRoute.distance} onChange={(e) => setEditingRoute({...editingRoute, distance: Number(e.target.value)})} />
                </div>
                <div>
                  <Label>Flight Time (min)</Label>
                  <Input type="number" value={editingRoute.flightTime} onChange={(e) => setEditingRoute({...editingRoute, flightTime: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Route Priority</Label>
                  <Select value={editingRoute.priority} onValueChange={(v: any) => setEditingRoute({...editingRoute, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Demand Level</Label>
                  <Select value={editingRoute.demand} onValueChange={(v: any) => setEditingRoute({...editingRoute, demand: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Aircraft Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['B737-800', 'A320-200', 'A330-300', 'B777-300ER', 'A350-900', 'A380'].map(type => (
                    <Badge key={type} variant={editingRoute.aircraftTypes.includes(type) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => {
                      if (editingRoute.aircraftTypes.includes(type)) {
                        setEditingRoute({...editingRoute, aircraftTypes: editingRoute.aircraftTypes.filter(t => t !== type)})
                      } else {
                        setEditingRoute({...editingRoute, aircraftTypes: [...editingRoute.aircraftTypes, type]})
                      }
                    }}>
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditRouteDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveRoute}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Seasonal Schedule Dialog */}
      <Dialog open={showEditSeasonalDialog} onOpenChange={setShowEditSeasonalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Seasonal Schedule</DialogTitle>
          </DialogHeader>
          {editingSeasonalSchedule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Season</Label>
                  <Select value={editingSeasonalSchedule.season} onValueChange={(v: any) => setEditingSeasonalSchedule({...editingSeasonalSchedule, season: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Season</SelectItem>
                      <SelectItem value="shoulder">Shoulder Season</SelectItem>
                      <SelectItem value="peak">Peak Season</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={editingSeasonalSchedule.startDate} onChange={(e) => setEditingSeasonalSchedule({...editingSeasonalSchedule, startDate: e.target.value})} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={editingSeasonalSchedule.endDate} onChange={(e) => setEditingSeasonalSchedule({...editingSeasonalSchedule, endDate: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Frequency Multiplier</Label>
                <div className="flex items-center flex-wrap gap-4 mt-2">
                  <Slider min={0.5} max={1.5} step={0.1} value={[editingSeasonalSchedule.frequencyMultiplier]} onValueChange={(v) => setEditingSeasonalSchedule({...editingSeasonalSchedule, frequencyMultiplier: v[0]})} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{editingSeasonalSchedule.frequencyMultiplier}x</span>
                </div>
              </div>
              <div>
                <Label>Pricing Multiplier</Label>
                <div className="flex items-center flex-wrap gap-4 mt-2">
                  <Slider min={0.5} max={2.0} step={0.05} value={[editingSeasonalSchedule.pricingMultiplier]} onValueChange={(v) => setEditingSeasonalSchedule({...editingSeasonalSchedule, pricingMultiplier: v[0]})} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{editingSeasonalSchedule.pricingMultiplier}x</span>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={editingSeasonalSchedule.notes} onChange={(e) => setEditingSeasonalSchedule({...editingSeasonalSchedule, notes: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditSeasonalDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSeasonalSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fleet Assignment Dialog */}
      <Dialog open={showEditFleetDialog} onOpenChange={setShowEditFleetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fleet Assignment</DialogTitle>
          </DialogHeader>
          {editingFleetAssignment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Registration</Label>
                  <Input value={editingFleetAssignment.registration} onChange={(e) => setEditingFleetAssignment({...editingFleetAssignment, registration: e.target.value})} />
                </div>
                <div>
                  <Label>Aircraft Type</Label>
                  <Select value={editingFleetAssignment.aircraftType} onValueChange={(v) => setEditingFleetAssignment({...editingFleetAssignment, aircraftType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B737-800">B737-800</SelectItem>
                      <SelectItem value="A320-200">A320-200</SelectItem>
                      <SelectItem value="A330-300">A330-300</SelectItem>
                      <SelectItem value="B777-300ER">B777-300ER</SelectItem>
                      <SelectItem value="A350-900">A350-900</SelectItem>
                      <SelectItem value="A380">A380</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Airport</Label>
                  <Input value={editingFleetAssignment.base} onChange={(e) => setEditingFleetAssignment({...editingFleetAssignment, base: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Target Utilization %</Label>
                <div className="flex items-center flex-wrap gap-4 mt-2">
                  <Slider min={60} max={100} value={[editingFleetAssignment.utilizationRate]} onValueChange={(v) => setEditingFleetAssignment({...editingFleetAssignment, utilizationRate: v[0]})} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-12">{editingFleetAssignment.utilizationRate}%</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditFleetDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveFleetAssignment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Flight Schedule Dialog */}
      <Dialog open={showEditScheduleDialog} onOpenChange={setShowEditScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Flight Schedule</DialogTitle>
          </DialogHeader>
          {editingSchedule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Flight Number</Label>
                  <Input value={editingSchedule.flightNumber} onChange={(e) => setEditingSchedule({...editingSchedule, flightNumber: e.target.value})} />
                </div>
                <div>
                  <Label>Route</Label>
                  <div className="text-sm font-medium mt-2">{editingSchedule.origin} → {editingSchedule.destination}</div>
                </div>
                <div>
                  <Label>Departure Time</Label>
                  <Input type="time" value={editingSchedule.departureTime} onChange={(e) => setEditingSchedule({...editingSchedule, departureTime: e.target.value})} />
                </div>
                <div>
                  <Label>Arrival Time</Label>
                  <Input type="time" value={editingSchedule.arrivalTime} onChange={(e) => setEditingSchedule({...editingSchedule, arrivalTime: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Aircraft Type</Label>
                  <Select value={editingSchedule.aircraftType} onValueChange={(v) => setEditingSchedule({...editingSchedule, aircraftType: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B737-800">B737-800</SelectItem>
                      <SelectItem value="A320-200">A320-200</SelectItem>
                      <SelectItem value="A330-300">A330-300</SelectItem>
                      <SelectItem value="B777-300ER">B777-300ER</SelectItem>
                      <SelectItem value="A350-900">A350-900</SelectItem>
                      <SelectItem value="A380">A380</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editingSchedule.status} onValueChange={(v: any) => setEditingSchedule({...editingSchedule, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Operating Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                    const dayNum = i + 1
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setEditingSchedule(prev => ({
                            ...prev!,
                            daysOfWeek: prev!.daysOfWeek.includes(dayNum)
                              ? prev!.daysOfWeek.filter(d => d !== dayNum)
                              : [...prev!.daysOfWeek, dayNum]
                          }))
                        }}
                        className={`px-3 py-2 text-sm rounded-md border ${
                          editingSchedule.daysOfWeek.includes(dayNum)
                            ? 'bg-primary text-primary-foreground'
                            : 'border-gray-300 hover:bg-secondary'
                        }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flight Release Dialog */}
      <Dialog open={showFlightReleaseDialog} onOpenChange={setShowFlightReleaseDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flight Release - {generatedFlightRelease?.flightNumber}</DialogTitle>
          </DialogHeader>
          {generatedFlightRelease && (
            <div className="space-y-6 py-4">
              {/* Flight Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Flight</div>
                  <div className="font-bold text-lg">{generatedFlightRelease.flightNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Route</div>
                  <div className="font-medium">{generatedFlightRelease.origin} → {generatedFlightRelease.destination}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Aircraft</div>
                  <div className="font-medium">{generatedFlightRelease.aircraftType}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className="mt-1" variant={flightReleaseApproved ? 'default' : 'secondary'}>
                    {flightReleaseApproved ? 'Approved' : 'Pending Approval'}
                  </Badge>
                </div>
              </div>

              {/* Weather */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center flex-wrap gap-2">
                      <Cloud className="h-4 w-4" />
                      Departure Weather ({generatedFlightRelease.origin})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Conditions:</span><span className="font-medium">{generatedFlightRelease.weather.departure.condition}</span></div>
                    <div className="flex justify-between"><span>Temperature:</span><span className="font-medium">{generatedFlightRelease.weather.departure.temp}°C</span></div>
                    <div className="flex justify-between"><span>Wind:</span><span className="font-medium">{generatedFlightRelease.weather.departure.windSpeed}kt from {generatedFlightRelease.weather.departure.windDirection}°</span></div>
                    <div className="flex justify-between"><span>Visibility:</span><span className="font-medium">{generatedFlightRelease.weather.departure.visibility}km</span></div>
                    <div className="flex justify-between"><span>Pressure:</span><span className="font-medium">{generatedFlightRelease.weather.departure.pressure} hPa</span></div>
                    <div className="flex justify-between"><span>Dew Point:</span><span className="font-medium">{generatedFlightRelease.weather.departure.dewPoint}°C</span></div>
                    <div className="flex justify-between"><span>Cloud Ceiling:</span><span className="font-medium">{generatedFlightRelease.weather.departure.cloudCeiling}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center flex-wrap gap-2">
                      <Cloud className="h-4 w-4" />
                      Destination Weather ({generatedFlightRelease.destination})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between"><span>Conditions:</span><span className="font-medium">{generatedFlightRelease.weather.destination.condition}</span></div>
                    <div className="flex justify-between"><span>Temperature:</span><span className="font-medium">{generatedFlightRelease.weather.destination.temp}°C</span></div>
                    <div className="flex justify-between"><span>Wind:</span><span className="font-medium">{generatedFlightRelease.weather.destination.windSpeed}kt from {generatedFlightRelease.weather.destination.windDirection}°</span></div>
                    <div className="flex justify-between"><span>Visibility:</span><span className="font-medium">{generatedFlightRelease.weather.destination.visibility}km</span></div>
                    <div className="flex justify-between"><span>Pressure:</span><span className="font-medium">{generatedFlightRelease.weather.destination.pressure} hPa</span></div>
                    <div className="flex justify-between"><span>Dew Point:</span><span className="font-medium">{generatedFlightRelease.weather.destination.dewPoint}°C</span></div>
                    <div className="flex justify-between"><span>Cloud Ceiling:</span><span className="font-medium">{generatedFlightRelease.weather.destination.cloudCeiling}</span></div>
                  </CardContent>
                </Card>
              </div>

              {/* NOTAMs */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Active NOTAMs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-y-auto h-40">
                    <div className="space-y-2">
                      {generatedFlightRelease.notams.map((notam: any) => (
                        <div key={notam.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{notam.id} - {notam.airport}</span>
                            <Badge variant="outline" className="text-xs">{notam.type}</Badge>
                          </div>
                          <div className="text-muted-foreground text-xs mt-1">{notam.message}</div>
                          <div className="text-xs text-muted-foreground">Valid: {notam.validFrom} to {notam.validTo}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ATC Restrictions & Alternates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">ATC Restrictions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {generatedFlightRelease.atcRestrictions.map((r: any) => (
                      <div key={r.id} className="p-2 bg-secondary/30 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">{r.region} - {r.type}</span>
                          <Badge variant={r.level === 'Active' ? 'destructive' : 'outline'}>{r.level}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{r.description}</div>
                        <div className="text-xs text-orange-600">Slot Delay: {r.slotDelay}min</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Alternate Airports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {generatedFlightRelease.alternateAirports.map((alt: any) => (
                      <div key={alt.code} className="p-2 bg-secondary/30 rounded text-sm">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{alt.code} ({alt.name})</div>
                            <div className="text-xs text-muted-foreground">{alt.distance}nm • {alt.weather}</div>
                          </div>
                          <Badge variant={alt.type === 'Primary' ? 'default' : 'secondary'}>{alt.type}</Badge>
                        </div>
                        {alt.estimatedDelay > 0 && <div className="text-xs text-orange-600 mt-1">Est. Delay: {alt.estimatedDelay}min</div>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Fuel Plan */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center flex-wrap gap-2">
                    <Fuel className="h-4 w-4" />
                    Fuel Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Trip Fuel</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.tripFuel.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Reserve Fuel</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.reserve.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Alternate Fuel</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.alternate.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Taxi Fuel</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.taxi.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-muted-foreground">Contingency</div>
                      <div className="font-bold text-lg">{generatedFlightRelease.fuelPlan.contingency.toLocaleString()} kg</div>
                    </div>
                    <div className="p-3 bg-primary text-primary-foreground rounded">
                      <div className="text-sm opacity-90">Total Fuel</div>
                      <div className="font-bold text-xl">{generatedFlightRelease.fuelPlan.total.toLocaleString()} kg</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Crew */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Crew Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Captain</div>
                      <div className="font-medium">{generatedFlightRelease.crew.captain}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">First Officer</div>
                      <div className="font-medium">{generatedFlightRelease.crew.firstOfficer}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cabin Crew</div>
                      <div className="font-medium">{generatedFlightRelease.crew.cabinCrew} Flight Attendants</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-muted-foreground text-center">
                Generated at {new Date(generatedFlightRelease.generatedAt).toLocaleString()}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlightReleaseDialog(false)}>Close</Button>
            {!flightReleaseApproved && (
              <Button onClick={handleApproveFlightRelease}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Release
              </Button>
            )}
            <Button onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
