"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Users, Zap, Star } from 'lucide-react'
import { CheckoutModal } from "@/components/checkout-modal"
import Link from "next/link"

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
  facebook_live_url: string | null
  seller: {
    shop_name: string
  }
}

interface CartItem extends Product {
  quantity: number
}

interface LiveStorePageProps {
  sellerId: string
}

export function LiveStorePage({ sellerId }: LiveStorePageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [liveSale, setLiveSale] = useState<LiveSale | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lastFeaturedChange, setLastFeaturedChange] = useState<string | null>(null)

  useEffect(() => {
    fetchStoreData()
    subscribeToLiveSale()
    subscribeToProductChanges()
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
          console.log("🔴 LIVE UPDATE: Product featured changed!", payload.new)

          setLiveSale((prev) => (prev ? { ...prev, ...payload.new } : null))
          setLastFeaturedChange(new Date().toISOString())

          // Scroll featured product into view with enhanced effects
          if (payload.new.featured_product_id) {
            setTimeout(() => {
              const element = document.getElementById(`product-${payload.new.featured_product_id}`)
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" })

                // Add multiple visual effects
                element.classList.add("featured-glow", "featured-shake", "featured-zoom")

                // Show live notification
                showLiveNotification(payload.new.featured_product_id)

                // Remove effects after animation
                setTimeout(() => {
                  element.classList.remove("featured-glow", "featured-shake", "featured-zoom")
                }, 4000)
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

  const subscribeToProductChanges = () => {
    const channel = supabase
      .channel("product-inventory-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `seller_id=eq.${sellerId}`,
        },
        (payload) => {
          console.log("📦 INVENTORY UPDATE:", payload.new)
          
          // Update the products state with new inventory
          setProducts((prev) => 
            prev.map((product) => 
              product.id === payload.new.id 
                ? { ...product, stock_quantity: payload.new.stock_quantity }
                : product
            )
          )

          // Update cart items with new stock info
          setCart((prev) => 
            prev.map((item) => 
              item.id === payload.new.id 
                ? { ...item, stock_quantity: payload.new.stock_quantity }
                : item
            )
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const showLiveNotification = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    // Create floating notification
    const notification = document.createElement("div")
    notification.className = "live-notification"
    notification.innerHTML = `
      <div class="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span class="font-medium">NOW FEATURING: ${product.name}</span>
        <span class="text-yellow-300">⭐</span>
      </div>
    `

    document.body.appendChild(notification)

    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 5000)
  }

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        const newQuantity = Math.min(existing.quantity + 1, product.stock_quantity)
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item,
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

  const handleInventoryUpdate = () => {
    console.log("🔄 Refreshing inventory after order...")
    fetchStoreData()
    // Clear cart after successful order
    setCart([])
  }

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
  const getTotalPrice = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading KH Shop...</p>
        </div>
      </div>
    )
  }

  const featuredProduct = products.find((p) => p.id === liveSale?.featured_product_id)
  const otherProducts = products.filter((p) => p.id !== liveSale?.featured_product_id && p.image_url)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/khshop" className="flex items-center space-x-2 mr-4">
              <img src="/orderly-logo.png" alt="Orderly" className="h-6 w-6" />
              <span className="text-sm font-medium text-gray-600">← Live Streams</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">LIVE</span>
            </div>
            <h1 className="text-xl font-bold">{liveSale?.seller?.shop_name || "KH Shop"}</h1>
            {lastFeaturedChange && (
              <Badge className="bg-green-600 animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Interactive
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-4">
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Live Stream Section */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-0">
                                  <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
                    {/* Responsive video ratio - adapts to screen size */}
                    <div className="relative w-full video-container" style={{ paddingBottom: "min(140%, 70vh)" }}>
                    {liveSale?.facebook_live_url ? (
                      <iframe
                        src={`https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent(liveSale.facebook_live_url)}&show_text=false&width=267&t=0`}
                        className="absolute top-0 left-0 w-full h-full"
                        style={{
                          border: "none",
                          overflow: "hidden",
                          minHeight: "200px",
                        }}
                        scrolling="no"
                        frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        title={`${liveSale.seller?.shop_name} Live Stream`}
                      />
                    ) : (
                      <div className="absolute top-0 left-0 w-full h-full bg-gray-800 flex items-center justify-center">
                        <p className="text-white">Live stream will appear here</p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced overlay elements */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm z-10 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span>LIVE</span>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center space-x-1 bg-black/50 text-white px-2 py-1 rounded text-sm z-10">
                    <Users className="h-3 w-3" />
                    <span>247 watching</span>
                  </div>

                  {/* Interactive indicator */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1 bg-green-600 text-white px-2 py-1 rounded-full text-xs z-10">
                    <Zap className="h-3 w-3 animate-pulse" />
                    <span>Interactive</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Video Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">🔴 Live Interactive Bag Collection</h3>
                    <p className="text-sm text-blue-700">
                      Watch as products get featured in real-time! Inventory updates automatically when you purchase.
                    </p>
                  </div>
                  <Star className="h-5 w-5 text-yellow-500 animate-spin" style={{ animationDuration: "3s" }} />
                </div>
              </CardContent>
            </Card>

            {/* Live Activity Feed */}
            {lastFeaturedChange && (
              <Card className="bg-green-50 border-green-200 animate-fade-in">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-900">
                      🎯 Product featured {new Date(lastFeaturedChange).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Products Section */}
                      <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Products</h2>
              <Badge variant="outline" className="animate-pulse">
                <Zap className="h-3 w-3 mr-1" />
                Live Updates
              </Badge>
            </div>

            {/* Featured Product */}
            {featuredProduct && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                  <span className="text-sm font-medium text-blue-600 animate-pulse">🌟 NOW FEATURING</span>
                </div>

                <Card
                  id={`product-${featuredProduct.id}`}
                  className="border-2 border-blue-500 shadow-lg animate-pulse-border featured-product relative overflow-hidden"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-gradient"></div>

                  <CardContent className="p-4 relative z-10">
                    <div className="flex space-x-4">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={featuredProduct.image_url || "/placeholder.svg"}
                          alt={featuredProduct.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">{featuredProduct.name}</h3>
                        <p className="text-2xl font-bold text-blue-600">${featuredProduct.price.toFixed(2)}</p>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={featuredProduct.stock_quantity > 5 ? "default" : "destructive"}
                            className="animate-pulse"
                          >
                            {featuredProduct.stock_quantity} left!
                          </Badge>
                          <Button
                            onClick={() => addToCart(featuredProduct)}
                            disabled={featuredProduct.stock_quantity === 0}
                            className="bg-blue-600 hover:bg-blue-700 animate-bounce"
                            style={{ animationDuration: "2s" }}
                          >
                            Add to Cart 🛍️
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
                  <Card key={product.id} id={`product-${product.id}`} className="product-card">
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
        onInventoryUpdate={handleInventoryUpdate}
      />

      <style jsx>{`
        @keyframes pulse-border {
          0%, 100% { 
            border-color: rgb(59 130 246);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% { 
            border-color: rgb(147 197 253);
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }
        
        @keyframes featured-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
          }
        }

        @keyframes featured-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        @keyframes featured-zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        
        .featured-glow {
          animation: featured-glow 1s ease-in-out 3;
        }

        .featured-shake {
          animation: featured-shake 0.5s ease-in-out 3;
        }

        .featured-zoom {
          animation: featured-zoom 2s ease-in-out 2;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .product-card {
          transition: all 0.3s ease;
        }
        
        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .live-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          animation: fade-in 0.5s ease-out;
        }

        /* Responsive video adjustments */
        @media (max-width: 1024px) {
          .video-container {
            padding-bottom: min(100%, 50vh) !important;
          }
        }
        
        @media (max-width: 768px) {
          .video-container {
            padding-bottom: min(75%, 40vh) !important;
          }
          
          .container {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .video-container {
            padding-bottom: min(60%, 35vh) !important;
          }
        }
      `}</style>
    </div>
  )
}
