"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Package, Users } from "lucide-react"

interface SalesData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  topProducts: Array<{
    name: string
    quantity: number
    revenue: number
  }>
}

interface SalesAnalyticsProps {
  sellerId: string
}

export function SalesAnalytics({ sellerId }: SalesAnalyticsProps) {
  const [salesData, setSalesData] = useState<SalesData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    topProducts: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalesData()
  }, [sellerId])

  const fetchSalesData = async () => {
    try {
      // Fetch orders with live sales data
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          live_sales!inner(seller_id)
        `)
        .eq("live_sales.seller_id", sellerId)

      if (ordersError) throw ordersError

      // Fetch products count
      const { count: productsCount, error: productsError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", sellerId)

      if (productsError) throw productsError

      // Calculate analytics
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const totalOrders = orders?.length || 0

      // Calculate top products
      const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}

      orders?.forEach((order) => {
        order.items.forEach((item: any) => {
          if (!productSales[item.id]) {
            productSales[item.id] = {
              name: item.name,
              quantity: 0,
              revenue: 0,
            }
          }
          productSales[item.id].quantity += item.quantity
          productSales[item.id].revenue += item.price * item.quantity
        })
      })

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      setSalesData({
        totalRevenue,
        totalOrders,
        totalProducts: productsCount || 0,
        topProducts,
      })

      setLoading(false)
    } catch (error) {
      console.error("Error fetching sales data:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sales Analytics</h2>
        <p className="text-gray-600">Track your performance and identify top-selling products</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Completed purchases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">In your catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${salesData.totalOrders > 0 ? (salesData.totalRevenue / salesData.totalOrders).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Your best performers ranked by quantity sold</CardDescription>
        </CardHeader>
        <CardContent>
          {salesData.topProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sales data yet. Start selling to see your top products!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {salesData.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${product.revenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">📊 The Power of Data</CardTitle>
          <CardDescription className="text-green-700">
            Before Orderly, you never knew which products were your best sellers. Now you have clear insights to
            optimize your inventory and boost profits!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-900 mb-2">What you get:</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Real-time sales tracking</li>
                <li>• Product performance insights</li>
                <li>• Customer behavior data</li>
                <li>• Revenue optimization tips</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-2">Your ROI:</h4>
              <ul className="space-y-1 text-green-700">
                <li>• Stock the right products</li>
                <li>• Reduce dead inventory</li>
                <li>• Increase average order value</li>
                <li>• Make data-driven decisions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
