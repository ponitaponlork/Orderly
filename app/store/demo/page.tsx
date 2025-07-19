"use client"
import { LiveStorePage } from "@/components/live-store-page"

export default function DemoStorePage() {
  // Using the demo seller ID from our seed data
  const demoSellerId = "550e8400-e29b-41d4-a716-446655440000"

  return <LiveStorePage sellerId={demoSellerId} />
}
