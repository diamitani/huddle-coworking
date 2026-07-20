"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, X, Lock, ArrowRight } from "lucide-react"

const FREE_VIEWS = 5
const STORAGE_KEY = "huddle_space_views"
const DISMISSED_KEY = "huddle_gate_dismissed"

interface SpaceGateProps {
  children: React.ReactNode
}

export default function SpaceGate({ children }: SpaceGateProps) {
  const pathname = usePathname()
  const [showGate, setShowGate] = useState(false)
  const [viewCount, setViewCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    // Check auth
    fetch("/api/auth/me")
      .then((r) => setIsLoggedIn(r.ok))
      .catch(() => setIsLoggedIn(false))
  }, [])

  useEffect(() => {
    if (isLoggedIn === null || isLoggedIn === true) return
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    // Only count space detail pages
    if (!pathname.startsWith("/spaces/") || pathname === "/spaces") return

    const views = parseInt(sessionStorage.getItem(STORAGE_KEY) || "0") + 1
    sessionStorage.setItem(STORAGE_KEY, String(views))
    setViewCount(views)

    if (views >= FREE_VIEWS) {
      // Short delay so the page renders first
      setTimeout(() => setShowGate(true), 400)
    }
  }, [pathname, isLoggedIn])

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1")
    setShowGate(false)
  }

  if (!showGate) return <>{children}</>

  return (
    <div className="relative">
      {/* Blurred content underneath */}
      <div className="pointer-events-none select-none" style={{ filter: "blur(6px)", userSelect: "none" }}>
        {children}
      </div>

      {/* Gate overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/60 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-warm-400 hover:text-warm-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center">
              <Lock className="w-7 h-7 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-heading font-bold text-navy-500 text-center mb-2">
            You&#39;ve viewed {FREE_VIEWS} spaces
          </h2>
          <p className="text-warm-600 text-sm text-center mb-6">
            Create a free account to keep browsing, save favorites, and contact spaces directly.
          </p>

          <div className="space-y-3">
            <Link
              href={`/signup?redirect=${encodeURIComponent(pathname)}`}
              className="flex items-center justify-center gap-2 w-full bg-brand-500 text-white rounded-xl py-3 font-semibold hover:bg-brand-600 transition-colors"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              className="flex items-center justify-center w-full border border-warm-200 text-navy-500 rounded-xl py-3 font-medium hover:bg-warm-50 transition-colors text-sm"
            >
              Sign in to existing account
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-3 justify-center text-xs text-warm-500">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              Free forever
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              No credit card
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              1,200+ spaces
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
