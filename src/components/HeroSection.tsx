"use client"

import { ArrowRight, TrendingUp, Building2, Award } from "lucide-react"
import Link from "next/link"
import SearchBar from "./SearchBar"

const stats = [
  { label: "Coworking Spaces", value: "1,200+", icon: Building2 },
  { label: "Cities Covered", value: "50+", icon: TrendingUp },
  { label: "Active Members", value: "85K+", icon: Users },
  { label: "Avg. Rating", value: "4.7", icon: Star },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-[90dvh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920"
          alt="Coworking space"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-500/95 via-navy-500/80 to-navy-500/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-500/40 via-transparent to-transparent" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white/80 font-medium">The #1 Coworking Directory</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1] tracking-tight mb-5">
            Find Your Perfect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-accent-400">
              Coworking Space
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-xl leading-relaxed mb-8">
            Discover 1,200+ coworking spaces across 50+ US cities. Compare amenities, pricing, and community — then book or apply for membership in minutes.
          </p>

          <SearchBar variant="hero" />
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Users({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function UsersPlaceholder() {
  return null
}
