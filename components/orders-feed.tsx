"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Package, Phone, MapPin, DollarSign, RefreshCw } from "lucide-react"

interface Order {
  id: string
  customer_name: string
  customer_contact: string
  customer_address: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  total_amount: number
  payment_method: string
  status: string
  created_at: string
}

interface OrdersFeedProps {
  sellerId: string
}

export function OrdersFeed({ sellerId }: OrdersFeedProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchOrders()
    subscribeToOrders()
  }, [sellerId])

  const fetchOrders = async () => {
    try {
      setRefreshing(true)
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          live_sales!inner(seller_id)
        `)
        .eq("live_sales.seller_id", sellerId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(data || [])
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setLoading(false)
    } finally {
      setRefreshing(false)
    }
  }

  const subscribeToOrders = () => {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          // Check if this order belongs to this seller
          fetchOrders() // Refetch to ensure we get the right orders
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (error) throw error

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))

      // Show success message
      alert(`✅ Order status updated to: ${status}`)
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Orders Feed</h2>
          <p className="text-gray-600">New orders appear here in real-time</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-400" />
            <Badge variant="secondary">{orders.filter((o) => o.status === "new").length} new</Badge>
          </div>
          <Button variant="outline" onClick={fetchOrders} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 text-center">
              Orders will appear here when customers make purchases during your live stream
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className={order.status === "new" ? "border-blue-200 bg-blue-50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_contact}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <p className="text-sm text-gray-600">{order.customer_address}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium">Items Ordered:</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Total: ${order.total_amount.toFixed(2)}</span>
                    <Badge variant="outline">{order.payment_method === "aba" ? "ABA Bank" : "Cash on Delivery"}</Badge>
                  </div>

                  {/* Status Actions */}
                  <div className="flex space-x-2">
                    {order.status === "new" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "confirmed")}>
                        Confirm
                      </Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "shipped")}>
                        Mark Shipped
                      </Button>
                    )}
                    {order.status === "shipped" && (
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "delivered")}>
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
