"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface TopCity {
  city: string
  count: number
}

const cityImages: Record<string, string> = {
  "Denver": "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=600",
  "Chicago": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=600",
  "Atlanta": "https://images.unsplash.com/photo-1570032257806-7f4c8d07f156?w=600",
  "Boston": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600",
  "Los Angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=600",
  "Las Vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=600",
  "Portland": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=600",
  "Miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=600",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600",
  "Phoenix": "https://images.unsplash.com/photo-1570168009587-5e9b7b70e2ce?w=600",
  "Philadelphia": "https://images.unsplash.com/photo-1559578327-714b8f510eee?w=600",
  "Seattle": "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=600",
  "Austin": "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=600",
  "Tampa": "https://images.unsplash.com/photo-1592505303497-9e12e397c0ef?w=600",
}

export default function CityGrid() {
  const [topCities, setTopCities] = useState<TopCity[]>([])

  useEffect(() => {
    fetch("/data/stats.json")
      .then((r) => r.json())
      .then((d) => {
        if (d.topCities) {
          setTopCities(d.topCities.slice(0, 15))
        }
      })
      .catch(() => {})
  }, [])

  if (topCities.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-accent-50 text-accent-600 text-xs font-semibold uppercase tracking-wider mb-4">
              Browse by City
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500">
              Find Spaces in Top Cities
            </h2>
          </div>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:text-brand-700 transition-colors"
          >
            Browse all cities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {topCities.map((item, i) => (
            <motion.div
              key={item.city}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                href={`/spaces?city=${encodeURIComponent(item.city)}`}
                className="group relative block aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <img
                  src={cityImages[item.city] || "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600"}
                  alt={item.city}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 text-white">
                    <MapPin className="w-4 h-4" />
                    <h3 className="font-heading font-semibold text-sm">{item.city}</h3>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">
                    {item.count} {item.count === 1 ? "space" : "spaces"}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
