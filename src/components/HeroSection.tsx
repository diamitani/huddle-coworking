"use client"

import { useState, useEffect } from "react"
import { Building2, TrendingUp, MapPin, Globe } from "lucide-react"
import SearchBar from "./SearchBar"

export default function HeroSection() {
  const [stats, setStats] = useState({
    totalSpaces: 0,
    totalCities: 0,
    topStates: {} as Record<string, number>,
  })

  useEffect(() => {
    fetch("/data/stats.json")
      .then((r) => r.json())
      .then((d) =>
        setStats({
          totalSpaces: d.totalSpaces,
          totalCities: d.totalCities,
          topStates: d.topStates,
        })
      )
      .catch(() => {})
  }, [])

  const statItems = [
    {
      label: "Coworking Spaces",
      value: stats.totalSpaces
        ? `${(stats.totalSpaces / 1000).toFixed(1)}K+`
        : "7.4K+",
      icon: Building2,
    },
    {
      label: "Cities Covered",
      value: stats.totalCities ? `${stats.totalCities}+` : "1,100+",
      icon: MapPin,
    },
    {
      label: "States",
      value: Object.keys(stats.topStates).length
        ? `${Object.keys(stats.topStates).length}+`
        : "50",
      icon: Globe,
    },
    {
      label: "Top State",
      value: stats.topStates.CA ? "California" : "CA",
      icon: TrendingUp,
    },
  ]

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
            Discover {stats.totalSpaces || "7,000+"} coworking spaces across {stats.totalCities || "1,100+"} US cities. Compare amenities, locations, and contact spaces directly.
          </p>

          <SearchBar variant="hero" />
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
          {statItems.map((stat) => (
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
