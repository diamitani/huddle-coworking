"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

const cityImages: Record<string, string> = {
  "Denver": "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800",
  "Chicago": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800",
  "Atlanta": "https://images.unsplash.com/photo-1570032257806-7f4c8d07f156?w=800",
  "Boston": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800",
  "Los Angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800",
  "Las Vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=800",
  "Portland": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=800",
  "Miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
  "Phoenix": "https://images.unsplash.com/photo-1570168009587-5e9b7b70e2ce?w=800",
  "Philadelphia": "https://images.unsplash.com/photo-1559578327-714b8f510eee?w=800",
  "Seattle": "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800",
  "Austin": "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800",
  "Tampa": "https://images.unsplash.com/photo-1592505303497-9e12e397c0ef?w=800",
}

export default function CitiesPage() {
  const [cityList, setCityList] = useState<Array<{ city: string; count: number }>>([])

  useEffect(() => {
    fetch("/data/stats.json")
      .then((r) => r.json())
      .then((d) => setCityList(d.topCities || []))
      .catch(() => {})
  }, [])

  if (cityList.length === 0) return null

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500 mb-3">
            Browse Coworking Spaces by City
          </h1>
          <p className="text-warm-700 text-lg">
            Find the perfect workspace in {cityList.length} cities across the United States.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cityList.map((item) => (
            <Link
              key={item.city}
              href={`/spaces?city=${encodeURIComponent(item.city)}`}
              className="group relative block aspect-[16/9] rounded-2xl overflow-hidden"
            >
              <img
                src={cityImages[item.city] || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800"}
                alt={item.city}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 text-white mb-1">
                  <MapPin className="w-5 h-5" />
                  <h2 className="text-xl font-heading font-bold">{item.city}</h2>
                </div>
                <p className="text-white/70 text-sm">
                  {item.count} coworking {item.count === 1 ? "space" : "spaces"}
                </p>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-navy-500 text-xs font-medium">
                  View spaces <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
