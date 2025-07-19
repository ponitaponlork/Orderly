"use client"

import { useState } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, CreditCard, Banknote, CheckCircle, MapPin, Phone } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  image_url: string
  quantity: number
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  totalPrice: number
  saleId: string
  onInventoryUpdate?: () => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  totalPrice,
  saleId,
  onInventoryUpdate,
}: CheckoutModalProps) {
  const [customerContact, setCustomerContact] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState("")

  const handleSubmitOrder = async () => {
    if (!customerContact || !customerAddress || !paymentMethod) {
      alert("Please fill in all required fields")
      return
    }

    if (!saleId) {
      alert("Unable to process order. Please refresh the page and try again.")
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        sale_id: saleId,
        customer_name: `Customer #${Math.floor(Math.random() * 10000)}`,
        customer_contact: customerContact,
        customer_address: customerAddress,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total_amount: totalPrice,
        payment_method: paymentMethod,
        status: "new",
      }

      console.log("Submitting order:", orderData)

      const { data, error } = await supabase.from("orders").insert(orderData).select().single()

      if (error) {
        console.error("Order submission error:", error)
        throw new Error(`Order failed: ${error.message}`)
      }

      console.log("Order created successfully:", data)
      setOrderId(data.id)

      // Update inventory
      const stockUpdates = cart.map(async (item) => {
        const { error: stockError } = await supabase.rpc("decrement_stock", {
          product_id: item.id,
          quantity: item.quantity,
        })

        if (stockError) {
          console.error("Stock update error:", stockError)
          // Don't throw error here as order is already created
        }
      })

      await Promise.all(stockUpdates)
      console.log("Inventory updated successfully")

      // Call the inventory update callback if provided
      if (onInventoryUpdate) {
        onInventoryUpdate()
      }

      setOrderComplete(true)
    } catch (error: any) {
      console.error("Error submitting order:", error)
      alert(`Failed to submit order: ${error.message}. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetModal = () => {
    setCustomerContact("")
    setCustomerAddress("")
    setPaymentMethod("")
    setOrderComplete(false)
    setOrderId("")
    onClose()
  }

  if (orderComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 Order Confirmed!</DialogTitle>
            <DialogDescription>
              Thank you for your purchase. Your order has been received and will be processed shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-4">Thank you for shopping with KH Shop!</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-mono text-sm font-bold">{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              We'll contact you at <strong>{customerContact}</strong> to confirm delivery details.
            </p>
            <Button onClick={resetModal} className="w-full bg-green-600 hover:bg-green-700">
              Continue Shopping 🛍️
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader className="flex-shrink-0 pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl">🛒 Quick Checkout</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">Just enter your contact number and location to complete your purchase.</DialogDescription>
        </DialogHeader>
        
                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-6">
  
          <div className="space-y-3 sm:space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
            <h3 className="font-semibold">Your Items</h3>
            {cart.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 sm:p-4 border rounded-lg">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate">{item.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="h-8 w-8 p-0">
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 sm:w-8 text-center text-sm">{item.quantity}</span>
                  <Button size="sm" variant="outline" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="h-8 w-8 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onRemoveItem(item.id)} className="h-8 w-8 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Simplified Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Contact Information</h3>
            <div className="grid gap-3 sm:gap-4">
              <div>
                <Label htmlFor="contact" className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </Label>
                <Input
                  id="contact"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  placeholder="Enter your phone number"
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium mb-2">
                  <MapPin className="h-4 w-4" /> Delivery Location
                </Label>
                <Textarea
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter your delivery location"
                  rows={2}
                  className="min-h-[48px] text-base resize-none"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-sm sm:text-base">Payment Method</h3>
            <div className="grid gap-3">
              <Button
                variant={paymentMethod === "aba" ? "default" : "outline"}
                onClick={() => setPaymentMethod("aba")}
                className="justify-start h-auto p-4"
              >
                <CreditCard className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Pay via ABA Bank</div>
                  <div className="text-sm opacity-70">Scan QR code to pay</div>
                </div>
              </Button>
              <Button
                variant={paymentMethod === "cod" ? "default" : "outline"}
                onClick={() => setPaymentMethod("cod")}
                className="justify-start h-auto p-4"
              >
                <Banknote className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm opacity-70">Pay when you receive</div>
                </div>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600">+ Delivery fee will be confirmed by seller</p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !customerContact || !customerAddress || !paymentMethod}
            className="w-full h-12 sm:h-14 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 touch-manipulation"
          >
            {isSubmitting ? "Processing Order... 🔄" : "Confirm Purchase 🛍️"}
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
