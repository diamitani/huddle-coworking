"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import SpaceCard from "@/components/SpaceCard"
import { getSpacesByCity, cities } from "@/data/spaces"

const cityBanners: Record<string, string> = {
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200",
  "Austin": "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1200",
  "Los Angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=1200",
  "Chicago": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1200",
  "Denver": "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=1200",
  "Seattle": "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=1200",
  "Miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200",
  "Portland": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=1200",
  "Boston": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=1200",
}

export default function CityPage() {
  const params = useParams()
  const cityName = (params.city as string).replace(/-/g, " ")
  const city = cities.find(c => c.toLowerCase() === cityName.toLowerCase())
  const citySpaces = city ? getSpacesByCity(city) : []

  if (!city) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-navy-500 mb-2">City not found</h1>
          <Link href="/cities" className="text-brand-500 hover:text-brand-600">Browse all cities</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-100">
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src={cityBanners[city]}
          alt={city}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-500/80 via-navy-500/40 to-navy-500/20" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link href="/cities" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              All cities
            </Link>
            <div className="flex items-center gap-3 text-white mb-2">
              <MapPin className="w-6 h-6 text-brand-400" />
              <h1 className="text-4xl sm:text-5xl font-heading font-bold">{city}</h1>
            </div>
            <p className="text-white/70 text-lg">
              {citySpaces.length} coworking {citySpaces.length === 1 ? "space" : "spaces"} available
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {citySpaces.map((space, i) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <SpaceCard space={space} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
