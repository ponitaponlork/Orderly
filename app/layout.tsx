import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
// Wrap the app with error boundary and add the logo to the root layout
import { ErrorBoundary } from "@/components/error-boundary"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Orderly - Transform Your Facebook Live Sales",
  description:
    "Bring order to Facebook Live commerce with real-time inventory, instant checkout, and powerful analytics.",
  icons: {
    icon: "/orderly-logo.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
