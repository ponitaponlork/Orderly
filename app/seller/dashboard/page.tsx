"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { NavigationHeader } from "@/components/navigation-header"
import { ProductManagement } from "@/components/product-management"
import { OrdersFeed } from "@/components/orders-feed"
import { SalesAnalytics } from "@/components/sales-analytics"
import { ExternalLink, Copy, Check, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DashboardData {
  seller: {
    id: string
    shop_name: string
    name: string
  }
  liveSale: {
    id: string
    facebook_live_url: string | null
    active: boolean
  }
  stats: {
    total_orders: number
    total_revenue: number
    active_viewers: number
  }
}

export default function SellerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveUrl, setLiveUrl] = useState("")
  const [updating, setUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [products, setProducts] = useState<Array<{id: string, name: string, price: number, stock_quantity: number, image_url: string}>>([])

  const handleProductsChange = (newProducts: Array<{id: string, name: string, price: number, stock_quantity: number, image_url: string}>) => {
    setProducts(newProducts)
  }

  // Generate clean store URL from shop name
  const generateStoreUrl = (shopName: string) => {
    const cleanName = shopName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    return `${window.location.origin}/${cleanName}`
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        // Try to create demo session
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email: "kh@demo.com",
          password: "demo123",
        })

        if (signInError) {
          throw new Error("Authentication failed")
        }
      }

      // Get seller data
      let seller = await supabase
        .from("sellers")
        .select("id, shop_name, name")
        .eq("id", "550e8400-e29b-41d4-a716-446655440000")
        .maybeSingle()

      if (seller.error) {
        console.error("Seller query error:", seller.error)
        throw new Error("Failed to load seller data")
      }

      if (!seller.data) {
        // Create demo seller if it doesn't exist
        const { data: newSeller, error: createError } = await supabase
          .from("sellers")
          .insert({
            id: "550e8400-e29b-41d4-a716-446655440000",
            shop_name: "KH Shop",
            name: "Demo Seller",
            email: "kh@demo.com",
          })
          .select("id, shop_name, name")
          .single()

        if (createError) {
          console.error("Error creating seller:", createError)
          throw new Error("Failed to create seller account")
        }

        seller.data = newSeller
      }

      // Get or create live sale
      let { data: liveSaleData, error: liveSaleError } = await supabase
        .from("live_sales")
        .select("id, facebook_live_url, active")
        .eq("seller_id", seller.data!.id)
        .maybeSingle()

      if (liveSaleError) {
        console.error("Live sale query error:", liveSaleError)
      }

      if (!liveSaleData) {
        // Create live sale record
        const { data: newLiveSale, error: createLiveSaleError } = await supabase
          .from("live_sales")
          .insert({
            seller_id: seller.data!.id,
            facebook_live_url: "https://www.facebook.com/watch/live/?ref=watch_permalink&v=1234567890",
            active: true,
          })
          .select("id, facebook_live_url, active")
          .single()

        if (createLiveSaleError) {
          console.error("Error creating live sale:", createLiveSaleError)
          // Use default values if creation fails
          liveSaleData = {
            id: "temp-id",
            facebook_live_url: "https://www.facebook.com/watch/live/?ref=watch_permalink&v=1234567890",
            active: true,
          }
        } else {
          liveSaleData = newLiveSale
        }
      }

      // Get stats
      const { data: orders } = await supabase.from("orders").select("total_amount").eq("seller_id", seller.data!.id)

      const stats = {
        total_orders: orders?.length || 0,
        total_revenue: orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
        active_viewers: Math.floor(Math.random() * 50) + 10, // Simulated for demo
      }

      setData({ seller: seller.data!, liveSale: liveSaleData, stats })
      setLiveUrl(liveSaleData.facebook_live_url || "")
    } catch (err) {
      console.error("Dashboard error:", err)
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const updateLiveUrl = async () => {
    if (!data) return

    try {
      setUpdating(true)
      const { error } = await supabase
        .from("live_sales")
        .update({ facebook_live_url: liveUrl })
        .eq("id", data.liveSale.id)

      if (error) throw error

      setData((prev) =>
        prev
          ? {
              ...prev,
              liveSale: { ...prev.liveSale, facebook_live_url: liveUrl },
            }
          : null,
      )

      toast({
        title: "Success",
        description: "Live video URL updated successfully",
      })
    } catch (err) {
      console.error("Error updating live URL:", err)
      toast({
        title: "Error",
        description: "Failed to update live video URL",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const copyStoreUrl = async () => {
    if (!data) return

    const storeUrl = generateStoreUrl(data.seller.shop_name)

    try {
      await navigator.clipboard.writeText(storeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied!",
        description: "Store URL copied to clipboard",
      })
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      })
    }
  }

  const openStore = () => {
    if (!data) return
    const storeUrl = generateStoreUrl(data.seller.shop_name)
    window.open(storeUrl, "_blank")
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Dashboard Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={loadDashboardData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button asChild>
              <a href="/seller/login">Back to Login</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const storeUrl = generateStoreUrl(data.seller.shop_name)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title={`${data.seller.shop_name} Dashboard`}
        subtitle={`Welcome back, ${data.seller.name}`}
        rightContent={
          <div className="flex items-center gap-3">
            <Button onClick={copyStoreUrl} variant="outline" size="sm">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy Store URL"}
            </Button>
            <Button onClick={openStore} size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Store
            </Button>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Badge variant="secondary">{data.stats.total_orders}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.total_orders}</div>
              <p className="text-xs text-muted-foreground">orders received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Badge variant="secondary">${data.stats.total_revenue}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data.stats.total_revenue}</div>
              <p className="text-xs text-muted-foreground">total earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Viewers</CardTitle>
              <Badge variant="default" className="bg-green-500">
                {data.stats.active_viewers}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.active_viewers}</div>
              <p className="text-xs text-muted-foreground">watching now</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Video URL Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Facebook Live Video</CardTitle>
            <CardDescription>
              Update your Facebook Live video URL so customers can watch while they shop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="live-url">Facebook Live URL</Label>
                <Input
                  id="live-url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://www.facebook.com/watch/live/?v=..."
                />
              </div>
              <div className="flex items-end">
                <Button onClick={updateLiveUrl} disabled={updating}>
                  {updating ? "Updating..." : "Update URL"}
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <strong>Your store URL:</strong>{" "}
              <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {storeUrl}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductManagement sellerId={data.seller.id} products={products} onProductsChange={handleProductsChange} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersFeed sellerId={data.seller.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <SalesAnalytics sellerId={data.seller.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
