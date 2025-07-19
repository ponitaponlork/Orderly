"use client"
import { LiveStorePage } from "@/components/live-store-page"
import { useEffect, useState, use } from "react"
import { supabase } from "@/lib/supabase"

interface StorePageProps {
  params: Promise<{
    storename: string
  }>
}

export default function StorePage({ params }: StorePageProps) {
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function findSeller() {
      try {
        // Unwrap the params Promise
        const resolvedParams = await params
        // Convert URL-friendly name back to shop name for lookup
        const shopName = resolvedParams.storename
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        // First try exact match with the URL-friendly name
        let { data: seller, error: sellerError } = await supabase
          .from("sellers")
          .select("id")
          .ilike("shop_name", shopName)
          .single()

        // If not found, try some common variations
        if (!seller && !sellerError) {
          // Try with "Shop" appended
          const { data: sellerWithShop } = await supabase
            .from("sellers")
            .select("id")
            .ilike("shop_name", `${shopName} Shop`)
            .single()

          if (sellerWithShop) {
            seller = sellerWithShop
          }
        }

        // If still not found and it's "khshop", use the demo seller
        if (!seller && resolvedParams.storename.toLowerCase() === "khshop") {
          setSellerId("550e8400-e29b-41d4-a716-446655440000")
          setLoading(false)
          return
        }

        if (seller) {
          setSellerId(seller.id)
        } else {
          setError("Store not found")
        }
      } catch (err) {
        console.error("Error finding seller:", err)
        setError("Error loading store")
      } finally {
        setLoading(false)
      }
    }

    findSeller()
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    )
  }

  if (error || !sellerId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-6">The store you're looking for doesn't exist.</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    )
  }

  return <LiveStorePage sellerId={sellerId} />
}
