'use client'

import { useState, useEffect, useRef } from 'react'
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
  Clock,
  AlertTriangle,
  Info,
  CheckCircle,
  Download,
  Printer,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ScrollBar } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
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

interface Notification {
  id: string
  type: 'alert' | 'info' | 'success'
  title: string
  message: string
  time: string
  read: boolean
  actionUrl?: string
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
  const { currentModule, currentView, setCurrentModule, setCurrentView, sidebarCollapsed, toggleSidebar, updateKPIDashboard, pnrs, tickets, flightInstances } = useAirlineStore()
  const { toast } = useToast()
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'alert',
      title: 'Flight Delay Alert',
      message: 'Flight AE202 to LAX is delayed by 2 hours due to weather conditions.',
      time: '10 minutes ago',
      read: false,
      actionUrl: '#flightops'
    },
    {
      id: '2',
      type: 'info',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2:00 AM UTC.',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'success',
      title: 'Revenue Target Met',
      message: 'Daily revenue target of $500,000 has been achieved.',
      time: '2 hours ago',
      read: true
    }
  ])

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

  // Ribbon button handlers
  const handleNew = () => {
    const moduleActions: Record<string, string> = {
      'pss': 'Creating new PNR (Passenger Name Record)...',
      'dcs': 'Opening new check-in session...',
      'flightops': 'Creating new flight schedule...',
      'crew': 'Adding new crew member...',
      'mro': 'Creating new maintenance work order...',
      'revenue': 'Setting up new fare basis...',
      'ancillary': 'Adding new ancillary product...',
      'agency': 'Registering new agency...',
      'crm': 'Adding new customer profile...',
      'analytics': 'Creating new dashboard...',
      'security': 'Adding new user...',
      'integration': 'Configuring new integration...',
      'cargo': 'Creating new cargo booking...',
      'sustainability': 'Adding new sustainability initiative...',
      'ai': 'Creating new automation rule...',
      'dashboard': 'Creating new widget...'
    }
    toast({
      title: 'New Item',
      description: moduleActions[currentModule] || 'Creating new item...'
    })
  }

  const handleEdit = () => {
    toast({
      title: 'Edit Mode',
      description: `Edit mode activated for ${getModuleTitle()}`
    })
  }

  const handleDelete = () => {
    toast({
      title: 'Delete Item',
      description: 'Select an item to delete',
      variant: 'destructive'
    })
  }

  const handlePrint = () => {
    const moduleReports: Record<string, string> = {
      'pss': 'Printing PNR report...',
      'dcs': 'Printing boarding passes...',
      'flightops': 'Printing flight schedule...',
      'crew': 'Printing crew roster...',
      'mro': 'Printing work order...',
      'revenue': 'Printing revenue report...',
      'ancillary': 'Printing product catalog...',
      'agency': 'Printing agency statement...',
      'crm': 'Printing customer report...',
      'analytics': 'Printing analytics dashboard...',
      'security': 'Printing audit log...',
      'integration': 'Printing integration status...',
      'cargo': 'Printing air waybill...',
      'sustainability': 'Printing sustainability report...'
    }
    toast({
      title: 'Print',
      description: moduleReports[currentModule] || 'Preparing print view...'
    })
    setTimeout(() => window.print(), 500)
  }

  const handleExport = () => {
    toast({
      title: 'Export Data',
      description: `Exporting ${getModuleTitle()} data to CSV...`
    })
    // Simulate export delay
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: 'Data has been exported successfully'
      })
    }, 1500)
  }

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    // Search across PNRs, tickets, and flights
    const results: any[] = []

    // Search PNRs
    pnrs.forEach(pnr => {
      const matchesPNR = pnr.pnrNumber.toLowerCase().includes(query.toLowerCase())
      const matchesPassenger = pnr.passengers.some(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query.toLowerCase())
      )
      const matchesEmail = pnr.contactInfo.email.toLowerCase().includes(query.toLowerCase())

      if (matchesPNR || matchesPassenger || matchesEmail) {
        results.push({
          type: 'PNR',
          id: pnr.pnrNumber,
          label: `${pnr.pnrNumber} - ${pnr.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}`,
          status: pnr.status
        })
      }
    })

    // Search Tickets
    tickets.forEach(ticket => {
      const matchesTicket = ticket.ticketNumber.toLowerCase().includes(query.toLowerCase())
      const matchesPassenger = ticket.passengerName.toLowerCase().includes(query.toLowerCase())

      if (matchesTicket || matchesPassenger) {
        results.push({
          type: 'Ticket',
          id: ticket.ticketNumber,
          label: `${ticket.ticketNumber} - ${ticket.passengerName}`,
          status: ticket.status
        })
      }
    })

    // Search Flights
    flightInstances.forEach(flight => {
      const matchesFlight = flight.flightNumber.toLowerCase().includes(query.toLowerCase())
      const matchesRoute = `${flight.origin} ${flight.destination}`.toLowerCase().includes(query.toLowerCase())

      if (matchesFlight || matchesRoute) {
        results.push({
          type: 'Flight',
          id: flight.flightNumber,
          label: `${flight.flightNumber} - ${flight.origin} → ${flight.destination}`,
          status: flight.status,
          date: flight.date
        })
      }
    })

    setSearchResults(results.slice(0, 10)) // Limit to 10 results
  }

  const handleSearchResultClick = (result: any) => {
    toast({
      title: 'Navigation',
      description: `Navigating to ${result.type}: ${result.id}`
    })
    setSearchQuery('')
    setSearchResults([])

    // Navigate to appropriate module
    if (result.type === 'PNR' || result.type === 'Ticket') {
      setCurrentModule('pss')
    } else if (result.type === 'Flight') {
      setCurrentModule('flightops')
    }
  }

  // Notification handlers
  const unreadCount = notifications.filter(n => !n.read).length

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    )
    toast({
      title: notification.title,
      description: notification.message
    })

    // Navigate if action URL is provided
    if (notification.actionUrl) {
      const targetModule = notification.actionUrl.replace('#', '')
      if (targetModule) {
        setCurrentModule(targetModule)
      }
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast({
      title: 'Notifications',
      description: 'All notifications marked as read'
    })
  }

  // Settings handler
  const handleSettings = () => {
    setShowSettings(true)
  }

  const handleSaveSettings = () => {
    setShowSettings(false)
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been saved successfully'
    })
  }

  // Logout handler
  const handleLogout = () => {
    toast({
      title: 'Logging Out',
      description: 'You are being logged out...'
    })
    // Simulate logout - in a real app, this would clear auth tokens and redirect
    setTimeout(() => {
      window.location.reload()
    }, 1500)
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
        <header className="enterprise-ribbon h-12 flex items-center justify-between px-4 flex-shrink-0 relative">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-primary-foreground">
              {getModuleTitle()}
            </h1>
            <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleNew} className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                <FileText className="h-3.5 w-3.5 mr-1" />
                New
              </Button>
              <Button variant="ghost" size="sm" onClick={handleEdit} className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={handlePrint} className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                <Printer className="h-3.5 w-3.5 mr-1" />
                Print
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExport} className="text-primary-foreground hover:bg-primary-foreground/10 h-8 text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PNR, Ticket, Passenger..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64 h-8 pl-8 bg-background/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm"
              />
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full text-left px-3 py-2 hover:bg-primary/10 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-foreground">{result.type}: {result.id}</div>
                          <div className="text-xs text-muted-foreground truncate">{result.label}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {result.status}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Separator orientation="vertical" className="h-6 bg-primary-foreground/30" />
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-primary-foreground hover:bg-primary-foreground/10 h-8 relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 absolute -top-1 -right-1">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-background border border-border rounded-md shadow-lg z-50">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left p-3 border-b border-border/50 hover:bg-primary/5 ${
                            !notification.read ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {notification.type === 'alert' && (
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notification.type === 'info' && (
                              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            )}
                            {notification.type === 'success' && (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground">{notification.title}</div>
                              <div className="text-xs text-muted-foreground truncate">{notification.message}</div>
                              <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleSettings} className="text-primary-foreground hover:bg-primary-foreground/10 h-8">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:bg-primary-foreground/10 h-8">
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

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Appearance</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sidebar State</span>
                <span className="text-sm">{sidebarCollapsed ? 'Collapsed' : 'Expanded'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Notifications</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email Notifications</span>
                <span className="text-sm text-primary">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Push Notifications</span>
                <span className="text-sm text-primary">Enabled</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Data Refresh</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Auto-refresh Interval</span>
                <span className="text-sm">30 seconds</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">System</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm">v2.5.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Environment</span>
                <span className="text-sm">Production</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
