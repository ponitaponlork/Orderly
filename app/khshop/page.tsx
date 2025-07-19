"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NavigationHeader } from "@/components/navigation-header"
import { Users, Play, ShoppingBag, Zap } from 'lucide-react'
import Link from "next/link"

interface LiveStream {
  id: string
  seller_id: string
  facebook_live_url: string | null
  active: boolean
  seller: {
    shop_name: string
    name: string
  }
  viewers: number
  featured_product?: {
    name: string
    price: number
    image_url: string
  }
}

export default function LiveStreamsPage() {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLiveStreams()
  }, [])

  const fetchLiveStreams = async () => {
    try {
      // Fetch active live sales with seller information and featured products
      const { data: liveSales, error } = await supabase
        .from("live_sales")
        .select(`
          *,
          seller:sellers(shop_name, name),
          featured_product:products(name, price, image_url)
        `)
        .eq("active", true)
        .not("featured_product_id", "is", null)

      if (error) throw error

      // Filter out streams without featured products and add mock viewer counts
      const streamsWithViewers = (liveSales || [])
        .filter((stream: any) => stream.featured_product && stream.featured_product.image_url)
        .map((stream: any) => ({
          ...stream,
          viewers: Math.floor(Math.random() * 200) + 10
        }))

      setLiveStreams(streamsWithViewers)
    } catch (error) {
      console.error("Error fetching live streams:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateStoreUrl = (shopName: string) => {
    const cleanName = shopName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
    return `/${cleanName}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live streams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader
        title="Live Shopping Streams"
        subtitle="Choose a live stream to watch and shop"
        showBackToHome={true}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Shop Live with Real Sellers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch live product demonstrations and buy instantly while sellers showcase their items
          </p>
        </div>

        {/* Live Streams Grid */}
        {liveStreams.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Live Streams</h3>
            <p className="text-gray-500">Check back later for live shopping streams!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 hover:border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <Badge variant="destructive" className="bg-red-500">
                        LIVE
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-medium">{stream.viewers}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{stream.seller.shop_name}</CardTitle>
                  <p className="text-gray-600">with {stream.seller.name}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Featured Product Preview */}
                  {stream.featured_product && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Now Featuring</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12">
                          <Image
                            src={stream.featured_product.image_url || "/placeholder.svg"}
                            alt={stream.featured_product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{stream.featured_product.name}</p>
                          <p className="text-lg font-bold text-green-600">
                            ${stream.featured_product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link href={generateStoreUrl(stream.seller.shop_name)}>
                      <Button className="w-full" size="lg">
                        <Play className="mr-2 h-4 w-4" />
                        Watch & Shop Live
                      </Button>
                    </Link>
                    
                    {stream.facebook_live_url && (
                      <a 
                        href={stream.facebook_live_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button variant="outline" className="w-full" size="sm">
                          View on Facebook
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
