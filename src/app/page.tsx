'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Plane, 
  Ticket, 
  Users, 
  Wrench, 
  DollarSign, 
  ShoppingCart, 
  Calculator, 
  Building2, 
  Heart, 
  BarChart3, 
  Shield, 
  Plug, 
  Package, 
  Leaf, 
  Cpu, 
  ChevronRight, 
  ChevronDown,
  Menu,
  X,
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  Clock,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAirlineStore } from '@/lib/store'
import DashboardModule from '@/components/modules/DashboardModule'
import PSSModule from '@/components/modules/PSSModule'
import DCSModule from '@/components/modules/DCSModule'
import FlightOpsModule from '@/components/modules/FlightOpsModule'
import CrewModule from '@/components/modules/CrewModule'
import MROModule from '@/components/modules/MROModule'
import RevenueModule from '@/components/modules/RevenueModule'
import AncillaryModule from '@/components/modules/AncillaryModule'
import RevenueAccountingModule from '@/components/modules/RevenueAccountingModule'
import AgencyModule from '@/components/modules/AgencyModule'
import CRMModule from '@/components/modules/CRMModule'
import AnalyticsModule from '@/components/modules/AnalyticsModule'
import SecurityModule from '@/components/modules/SecurityModule'
import IntegrationModule from '@/components/modules/IntegrationModule'
import CargoModule from '@/components/modules/CargoModule'
import SustainabilityModule from '@/components/modules/SustainabilityModule'
import AIModule from '@/components/modules/AIModule'

interface MenuItem {
  id: string
  label: string
  icon: any
  children?: MenuItem[]
  badge?: string
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'pss',
    label: 'Core PSS',
    icon: Plane,
    children: [
      { id: 'reservations', label: 'Reservations (CRS)', icon: Ticket },
      { id: 'ticketing', label: 'Ticketing', icon: Ticket },
      { id: 'inventory', label: 'Inventory Management', icon: BarChart3 }
    ]
  },
  {
    id: 'dcs',
    label: 'Departure Control',
    icon: Plane,
    children: [
      { id: 'checkin', label: 'Check-In', icon: User },
      { id: 'boarding', label: 'Boarding', icon: Plane },
      { id: 'loadbalance', label: 'Load & Balance', icon: BarChart3 },
      { id: 'baggage', label: 'Baggage', icon: Package }
    ]
  },
  {
    id: 'flightops',
    label: 'Flight Operations',
    icon: Plane,
    children: [
      { id: 'schedule', label: 'Schedule Planning', icon: Clock },
      { id: 'disruption', label: 'Disruption Mgmt', icon: Bell },
      { id: 'dispatch', label: 'Dispatch', icon: Globe }
    ]
  },
  {
    id: 'crew',
    label: 'Crew Management',
    icon: Users,
    children: [
      { id: 'crew-schedule', label: 'Crew Scheduling', icon: Clock },
      { id: 'crew-pairing', label: 'Crew Pairing', icon: Users },
      { id: 'crew-qual', label: 'Qualifications', icon: Shield }
    ]
  },
  {
    id: 'mro',
    label: 'M & E (MRO)',
    icon: Wrench,
    children: [
      { id: 'maintenance', label: 'Maintenance', icon: Wrench },
      { id: 'engineering', label: 'Engineering', icon: Cpu },
      { id: 'parts', label: 'Parts Inventory', icon: Package }
    ]
  },
  {
    id: 'revenue',
    label: 'Revenue Management',
    icon: DollarSign,
    children: [
      { id: 'pricing', label: 'Dynamic Pricing', icon: DollarSign },
      { id: 'forecast', label: 'Demand Forecast', icon: BarChart3 },
      { id: 'yield', label: 'Yield Mgmt', icon: Calculator }
    ]
  },
  {
    id: 'ancillary',
    label: 'Retailing & Ancillary',
    icon: ShoppingCart,
    badge: 'New'
  },
  {
    id: 'revenue-acct',
    label: 'Revenue Accounting',
    icon: Calculator
  },
  {
    id: 'agency',
    label: 'Agency Management',
    icon: Building2,
    children: [
      { id: 'agency-hierarchy', label: 'Agency Hierarchy', icon: Building2 },
      { id: 'credit-wallet', label: 'Credit & Wallet', icon: DollarSign },
      { id: 'commission', label: 'Commission', icon: Calculator },
      { id: 'agent-control', label: 'Agent Control', icon: Shield },
      { id: 'adm', label: 'ADM/ACM', icon: Bell }
    ]
  },
  {
    id: 'crm',
    label: 'CRM & Loyalty',
    icon: Heart
  },
  {
    id: 'analytics',
    label: 'Analytics & BI',
    icon: BarChart3
  },
  {
    id: 'security',
    label: 'Security & Compliance',
    icon: Shield
  },
  {
    id: 'integration',
    label: 'Integrations',
    icon: Plug
  },
  {
    id: 'cargo',
    label: 'Cargo Management',
    icon: Package
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    icon: Leaf
  },
  {
    id: 'ai',
    label: 'AI & Automation',
    icon: Cpu,
    badge: 'AI'
  }
]

export default function Home() {
  const { currentModule, currentView, setCurrentModule, setCurrentView, sidebarCollapsed, toggleSidebar, updateKPIDashboard } = useAirlineStore()
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['pss', 'dcs', 'flightops', 'crew', 'mro', 'revenue', 'agency']))
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    updateKPIDashboard('today')
    return () => clearInterval(timer)
  }, [updateKPIDashboard])

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(menuId)) {
        newSet.delete(menuId)
      } else {
        newSet.add(menuId)
      }
      return newSet
    })
  }

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      toggleMenu(item.id)
    } else {
      setCurrentModule(item.id)
      setCurrentView('overview')
    }
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const Icon = item.icon
    const isActive = currentModule === item.id
    const isExpanded = expandedMenus.has(item.id)
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id}>
        <button
          onClick={() => handleMenuClick(item)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/20 ${
            isActive ? 'bg-primary/30 text-primary-foreground font-medium' : 'text-sidebar-foreground'
          } ${level > 0 ? 'ml-4' : ''}`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                isExpanded ? (
                  <ChevronDown className="h-3 w-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-3 w-3 flex-shrink-0" />
                )
              )}
            </>
          )}
        </button>
        {hasChildren && isExpanded && !sidebarCollapsed && (
          <div className="space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardModule />
      case 'pss':
      case 'reservations':
      case 'ticketing':
      case 'inventory':
        return <PSSModule />
      case 'dcs':
      case 'checkin':
      case 'boarding':
      case 'loadbalance':
      case 'baggage':
        return <DCSModule />
      case 'flightops':
      case 'schedule':
      case 'disruption':
      case 'dispatch':
        return <FlightOpsModule />
      case 'crew':
      case 'crew-schedule':
      case 'crew-pairing':
      case 'crew-qual':
        return <CrewModule />
      case 'mro':
      case 'maintenance':
      case 'engineering':
      case 'parts':
        return <MROModule />
      case 'revenue':
      case 'pricing':
      case 'forecast':
      case 'yield':
        return <RevenueModule />
      case 'ancillary':
        return <AncillaryModule />
      case 'revenue-acct':
        return <RevenueAccountingModule />
      case 'agency':
      case 'agency-hierarchy':
      case 'credit-wallet':
      case 'commission':
      case 'agent-control':
      case 'adm':
        return <AgencyModule />
      case 'crm':
        return <CRMModule />
      case 'analytics':
        return <AnalyticsModule />
      case 'security':
        return <SecurityModule />
      case 'integration':
        return <IntegrationModule />
      case 'cargo':
        return <CargoModule />
      case 'sustainability':
        return <SustainabilityModule />
      case 'ai':
        return <AIModule />
      default:
        return <DashboardModule />
    }
  }

  const getModuleTitle = () => {
    const item = menuItems.find(m => m.id === currentModule)
    if (item) return item.label
    
    for (const menu of menuItems) {
      if (menu.children) {
        const child = menu.children.find(c => c.id === currentModule)
        if (child) return child.label
      }
    }
    return 'Dashboard'
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-12' : 'w-64'} flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}>
        {/* Logo Area */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-sidebar-foreground">AeroEnterprise</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-sidebar-accent transition-colors"
          >
            {sidebarCollapsed ? (
              <Menu className="h-5 w-5 text-sidebar-foreground" />
            ) : (
              <X className="h-5 w-5 text-sidebar-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <div className="space-y-0.5 px-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-3 border-t border-sidebar-border">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@aero.com</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mx-auto">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Ribbon Header */}
        <header className="enterprise-ribbon h-12 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-primary-foreground">
              {getModuleTitle()}
            </h1>
            <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                New
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                Delete
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                Print
              </Button>
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PNR, Ticket, Passenger..."
                className="w-64 h-8 pl-8 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm"
              />
            </div>
            <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8">
              <Bell className="h-4 w-4" />
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">3</Badge>
            </Button>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10 h-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Breadcrumb Bar */}
        <div className="h-8 bg-secondary/50 border-b border-border flex items-center px-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">AeroEnterprise</span>
            <ChevronRight className="h-3 w-3" />
            <span>{getModuleTitle()}</span>
            {currentView !== 'overview' && (
              <>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground capitalize">{currentView}</span>
              </>
            )}
          </div>
        </div>

        {/* Module Content */}
        <main className="flex-1 overflow-auto bg-background">
          {renderModule()}
        </main>

        {/* Status Bar */}
        <footer className="h-6 bg-sidebar border-t border-sidebar-border flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4 text-xs text-sidebar-foreground">
            <span>Ready</span>
            <span>•</span>
            <span>Server: Online</span>
            <span>•</span>
            <span>DB: Connected</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-sidebar-foreground">
            <span>{currentTime.toLocaleString()}</span>
            <span>•</span>
            <span>v2.5.1</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
