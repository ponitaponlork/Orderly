import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Zap, TrendingUp, Play } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/orderly-logo.png" alt="Orderly" className="h-8 w-8" />
            <span className="text-2xl font-bold text-gray-900">Orderly</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/seller/login">
              <Button variant="outline">Merchant Login</Button>
            </Link>
            <Link href="/khshop">
              <Button>Live Demo</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 flex-1">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-12">Turn Facebook Live Into Real Sales</h1>
          <p className="text-xl text-gray-600 mb-16">
            Stop losing customers in the comments. Orderly gives your viewers a real store where they can buy instantly
            while you're live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/khshop">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-40">
                <Play className="mr-2 h-5 w-5" />
                Customer
              </Button>
            </Link>
            <Link href="/seller/login">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-40">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Merchant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-4 px-4 bg-[#3a6ad6] text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-lg font-bold mb-2">Ready to Transform Your Live Sales?</h2>
          <p className="text-sm mb-3 opacity-90">
            Join sellers who've already streamlined their Facebook Live business
          </p>
          <Link href="/seller/login">
            <Button size="sm" className="text-sm px-4 py-2 bg-white text-blue-600 hover:bg-gray-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="text-lg font-bold">Orderly</span>
          </div>
          <p className="text-gray-400 text-sm">Bringing order to Facebook Live commerce.</p>
        </div>
      </footer>
    </div>
  )
}
