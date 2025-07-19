import type React from "react"
import Link from "next/link"

interface NavigationHeaderProps {
  title?: string
  subtitle?: string
  showBackToHome?: boolean
  rightContent?: React.ReactNode
}

export function NavigationHeader({ title, subtitle, showBackToHome = true, rightContent }: NavigationHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackToHome && (
            <Link href="/" className="flex items-center space-x-2 mr-4 hover:opacity-70 transition-opacity">
              <img src="/orderly-logo.png" alt="Orderly" className="h-6 w-6" />
              <span className="text-sm font-medium text-gray-600">← Home</span>
            </Link>
          )}
          {title && (
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          )}
        </div>
        {rightContent}
      </div>
    </header>
  )
}
