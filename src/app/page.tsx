'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Plane, 
  PlaneTakeoff,
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
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAirlineStore } from '@/lib/store'
import { initializeAllMockData } from '@/lib/initialize-mock-data'
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
    label: 'Passenger Service',
    icon: Plane
  },
  {
    id: 'dcs',
    label: 'Departure Control',
    icon: PlaneTakeoff
  },
  {
    id: 'flightops',
    label: 'Flight Operations',
    icon: Plane
  },
  {
    id: 'crew',
    label: 'Crew Management',
    icon: Users
  },
  {
    id: 'mro',
    label: 'Maintenance & Engineering',
    icon: Wrench
  },
  {
    id: 'revenue',
    label: 'Revenue Management',
    icon: DollarSign
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
    icon: Building2
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
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    // Initialize mock data on first load
    initializeAllMockData()
    updateKPIDashboard('today')
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [updateKPIDashboard])

  const handleMenuClick = (item: MenuItem) => {
    setCurrentModule(item.id)
    setCurrentView('overview')
  }

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon
    const isActive = currentModule === item.id

    return (
      <button
        key={item.id}
        onClick={() => handleMenuClick(item)}
        className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/20 ${
          isActive ? 'bg-primary/30 text-primary-foreground font-medium' : 'text-sidebar-foreground'
        }`}
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
          </>
        )}
      </button>
    )
  }

  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardModule />
      case 'pss':
        return <PSSModule />
      case 'dcs':
        return <DCSModule />
      case 'flightops':
        return <FlightOpsModule />
      case 'crew':
        return <CrewModule />
      case 'mro':
        return <MROModule />
      case 'revenue':
        return <RevenueModule />
      case 'ancillary':
        return <AncillaryModule />
      case 'revenue-acct':
        return <RevenueAccountingModule />
      case 'agency':
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
    return item ? item.label : 'Dashboard'
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
            {currentTime && <span suppressHydrationWarning>{currentTime.toLocaleString()}</span>}
            <span>•</span>
            <span>v2.5.1</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
