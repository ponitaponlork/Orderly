"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Play, Users } from "lucide-react"
import { CheckoutModal } from "@/components/checkout-modal"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  stock_quantity: number
}

interface LiveSale {
  id: string
  featured_product_id: string | null
  seller: {
    shop_name: string
  }
}

interface CartItem extends Product {
  quantity: number
}

export default function LiveStorePage() {
  const params = useParams()
  const sellerId = params.sellerId as string

  const [products, setProducts] = useState<Product[]>([])
  const [liveSale, setLiveSale] = useState<LiveSale | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStoreData()
    subscribeToLiveSale()
  }, [sellerId])

  const fetchStoreData = async () => {
    try {
      // Fetch products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false })

      // Fetch live sale with seller info
      const { data: liveSaleData } = await supabase
        .from("live_sales")
        .select(`
          *,
          seller:sellers(shop_name)
        `)
        .eq("seller_id", sellerId)
        .eq("active", true)
        .single()

      setProducts(productsData || [])
      setLiveSale(liveSaleData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching store data:", error)
      setLoading(false)
    }
  }

  const subscribeToLiveSale = () => {
    const channel = supabase
      .channel("live-sale-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_sales",
          filter: `seller_id=eq.${sellerId}`,
        },
        (payload) => {
          setLiveSale((prev) => (prev ? { ...prev, ...payload.new } : null))

          // Scroll featured product into view
          if (payload.new.featured_product_id) {
            setTimeout(() => {
              const element = document.getElementById(`product-${payload.new.featured_product_id}`)
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            }, 100)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock_quantity) } : item,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId)
      return
    }

    setCart((prev) => prev.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading store...</p>
        </div>
      </div>
    )
  }

  const featuredProduct = products.find((p) => p.id === liveSale?.featured_product_id)
  const otherProducts = products.filter((p) => p.id !== liveSale?.featured_product_id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">LIVE</span>
            </div>
            <h1 className="text-xl font-bold">{liveSale?.seller?.shop_name || "Live Store"}</h1>
          </div>

          <Button onClick={() => setIsCheckoutOpen(true)} className="relative" disabled={cart.length === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart
            {getTotalItems() > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Live Stream Section */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-70" />
                      <h3 className="text-lg font-semibold mb-2">Live Fashion Show</h3>
                      <p className="text-sm opacity-70">Streaming now on Facebook Live</p>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>LIVE</span>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    <Users className="h-3 w-3" />
                    <span>247 watching</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Available Products</h2>

            {/* Featured Product */}
            {featuredProduct && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-600">NOW FEATURING</span>
                </div>

                <Card
                  id={`product-${featuredProduct.id}`}
                  className="border-2 border-blue-500 shadow-lg animate-pulse-border"
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={featuredProduct.image_url || "/placeholder.svg"}
                          alt={featuredProduct.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">{featuredProduct.name}</h3>
                        <p className="text-2xl font-bold text-blue-600">${featuredProduct.price.toFixed(2)}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant={featuredProduct.stock_quantity > 5 ? "default" : "destructive"}>
                            Only {featuredProduct.stock_quantity} left!
                          </Badge>
                          <Button
                            onClick={() => addToCart(featuredProduct)}
                            disabled={featuredProduct.stock_quantity === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other Products */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">All Products</h3>
              <div className="grid gap-4">
                {otherProducts.map((product) => (
                  <Card key={product.id} id={`product-${product.id}`}>
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Image
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant={product.stock_quantity > 5 ? "secondary" : "destructive"}>
                              {product.stock_quantity} left
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              disabled={product.stock_quantity === 0}
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        totalPrice={getTotalPrice()}
        saleId={liveSale?.id || ""}
      />

      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgb(59 130 246); }
          50% { border-color: rgb(147 197 253); }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
