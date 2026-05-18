"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Search, MapPin, User } from "lucide-react"
import { cn } from "@/lib/cn"

const navLinks = [
  { href: "/spaces", label: "Discover" },
  { href: "/cities", label: "Cities" },
  { href: "/membership", label: "Pricing" },
  { href: "/list-your-space", label: "List Your Space" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-warm-200 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              "text-xl font-heading font-bold tracking-tight transition-colors",
              scrolled ? "text-navy-500" : "text-white"
            )}>Huddle</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  scrolled
                    ? "text-navy-500/70 hover:text-navy-500 hover:bg-warm-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/spaces"
              className={cn(
                "hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                scrolled
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
              )}
            >
              <Search className="w-4 h-4" />
              <span>Search Spaces</span>
            </Link>
            <Link
              href="/saved"
              className={cn(
                "p-2 rounded-lg transition-all",
                scrolled
                  ? "text-navy-500/60 hover:text-navy-500 hover:bg-warm-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "md:hidden p-2 rounded-lg transition-all",
                scrolled
                  ? "text-navy-500 hover:bg-warm-100"
                  : "text-white hover:bg-white/10"
              )}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-warm-200 shadow-lg animate-in slide-in-from-top-2">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-navy-500/70 hover:text-navy-500 hover:bg-warm-100 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-warm-200" />
            <Link
              href="/spaces"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500 text-white font-medium"
            >
              <Search className="w-4 h-4" />
              Search Spaces
            </Link>
            <Link
              href="/saved"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-navy-500/70 hover:text-navy-500 hover:bg-warm-100 font-medium"
            >
              My Account
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
