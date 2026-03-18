'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  ShoppingCart, 
  Package, 
  Armchair, 
  Coffee, 
  Briefcase, 
  Shield, 
  Tag,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { useAirlineStore } from '@/lib/store'

interface AncillaryProduct {
  id: string
  name: string
  category: 'seat' | 'baggage' | 'lounge' | 'meal' | 'insurance' | 'upgrade'
  price: number
  description: string
}

const defaultProducts: AncillaryProduct[] = [
  { id: '1', name: 'Extra Legroom Seat', category: 'seat', price: 45, description: 'Additional 6 inches of legroom' },
  { id: '2', name: 'Extra Baggage (23kg)', category: 'baggage', price: 75, description: 'Additional checked bag' },
  { id: '3', name: 'Lounge Access', category: 'lounge', price: 50, description: 'Airport lounge entry' },
  { id: '4', name: 'Premium Meal', category: 'meal', price: 25, description: 'Gourmet in-flight meal' },
  { id: '5', name: 'Travel Insurance', category: 'insurance', price: 35, description: 'Comprehensive coverage' },
  { id: '6', name: 'Priority Boarding', category: 'upgrade', price: 20, description: 'Board before group 3' }
]

export default function AncillaryModule() {
  const { tickets, emds, ancillaryProducts, bundles, promoCodes } = useAirlineStore()
  const { toast } = useToast()
  
  const [products, setProducts] = useState<AncillaryProduct[]>(defaultProducts)
  const [showConfigureDialog, setShowConfigureDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<AncillaryProduct | null>(null)
  const [editPrice, setEditPrice] = useState('')

  // Calculate ancillary revenue from EMDs (Electronic Miscellaneous Documents)
  const ancillaryRevenue = useMemo(() => {
    return emds.reduce((sum, emd) => sum + emd.amount, 0)
  }, [emds])

  // Calculate bundle revenue (mock calculation)
  const bundleRevenue = useMemo(() => {
    return Math.round(ancillaryRevenue * 0.3)
  }, [ancillaryRevenue])

  const totalAncillaryRevenue = ancillaryRevenue + bundleRevenue

  // Handlers for Ancillary Module
  const handleConfigureProduct = (product: AncillaryProduct) => {
    setSelectedProduct(product)
    setEditPrice(product.price.toString())
    setShowConfigureDialog(true)
  }

  const handleSaveProduct = () => {
    if (selectedProduct && editPrice) {
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, price: parseFloat(editPrice) } : p
      ))
      toast({ title: 'Product Updated', description: `${selectedProduct.name} price updated to $${editPrice}` })
      setShowConfigureDialog(false)
    }
  }

  const handleSelectBundle = (bundleName: string) => {
    toast({ title: 'Bundle Selected', description: `${bundleName} bundle has been applied to bookings` })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Retailing & Ancillary</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Seat Selection, Baggage, Lounge, Meals, and Bundled Products
          </p>
        </div>
      </div>

      {/* Ancillary Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ancillaryProducts.length}</div>
            <div className="text-xs text-muted-foreground mt-1">ancillary services</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bundles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundles.length}</div>
            <div className="text-xs text-muted-foreground mt-1">fare bundles</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Promos</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoCodes.filter(p => p.active).length}</div>
            <div className="text-xs text-muted-foreground mt-1">promo codes</div>
          </CardContent>
        </Card>

        <Card className="enterprise-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ancillary Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAncillaryRevenue > 0 ? `$${(totalAncillaryRevenue / 1000).toFixed(1)}K` : '$0'}</div>
            <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{emds.length > 0 ? '22' : '0'}% vs last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="bundles">Bundles</TabsTrigger>
          <TabsTrigger value="promos">Promo Codes</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Ancillary Products</CardTitle>
              <CardDescription>Seat selection, baggage, meals, lounge access, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const iconMap: Record<string, any> = {
                    seat: Armchair,
                    baggage: Package,
                    lounge: Briefcase,
                    meal: Coffee,
                    insurance: Shield,
                    upgrade: Tag
                  }
                  const Icon = iconMap[product.category] || Tag
                  return (
                    <Card key={product.id} className="enterprise-card">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <Icon className="h-5 w-5 text-primary" />
                          <Badge variant="outline" className="capitalize">{product.category}</Badge>
                        </div>
                        <CardTitle className="text-base mt-2">{product.name}</CardTitle>
                        <CardDescription className="text-sm">{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">${product.price}</span>
                          <Button size="sm" onClick={() => handleConfigureProduct(product)}>
                            Configure
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bundles Tab */}
        <TabsContent value="bundles">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Fare Bundles</CardTitle>
              <CardDescription>Packaged offerings with value pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Essential', price: 299, savings: 0, items: ['Personal item', 'Seat selection'] },
                  { name: 'Standard', price: 349, savings: 25, items: ['Carry-on', 'Seat selection', 'Meal'] },
                  { name: 'Flex', price: 449, savings: 50, items: ['Checked bag', 'Flexible changes', 'Lounge'] },
                  { name: 'Premium', price: 699, savings: 100, items: ['2 Bags', 'Priority boarding', 'Lounge', 'Meal'] }
                ].map((bundle, i) => (
                  <Card key={i} className={`enterprise-card ${i === 2 ? 'border-primary border-2' : ''}`}>
                    <CardHeader>
                      <CardTitle className="text-center">{bundle.name}</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">${bundle.price}</span>
                        {bundle.savings > 0 && (
                          <div className="text-sm text-green-600">Save ${bundle.savings}</div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {bundle.items.map((item, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm">
                            <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full mt-4" 
                        variant={i === 2 ? 'default' : 'outline'}
                        onClick={() => handleSelectBundle(bundle.name)}
                      >
                        {i === 2 ? 'Popular' : 'Select'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promos">
          <Card className="enterprise-card">
            <CardHeader>
              <CardTitle>Promo Codes</CardTitle>
              <CardDescription>Discount codes and promotional offers</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Type</th>
                      <th>Value</th>
                      <th>Min Spend</th>
                      <th>Valid Until</th>
                      <th>Used</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No promo codes configured
                        </td>
                      </tr>
                    ) : (
                      promoCodes.map((promo) => (
                        <tr key={promo.code}>
                          <td className="font-mono font-medium">{promo.code}</td>
                          <td className="capitalize">{promo.type}</td>
                          <td>{promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}</td>
                          <td>${promo.minSpend || 0}</td>
                          <td>{new Date(promo.validUntil).toLocaleDateString()}</td>
                          <td>{promo.usedCount}/{promo.usageLimit}</td>
                          <td>
                            <Badge variant={promo.active ? 'default' : 'secondary'}>
                              {promo.active ? 'Active' : 'Inactive'}
                            </Badge>
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

      {/* Configure Product Dialog */}
      <Dialog open={showConfigureDialog} onOpenChange={setShowConfigureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Product Name</Label>
              <Input value={selectedProduct?.name || ''} disabled />
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input 
                type="number" 
                value={editPrice} 
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={selectedProduct?.category || ''} disabled className="capitalize" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={selectedProduct?.description || ''} disabled />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigureDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProduct}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
