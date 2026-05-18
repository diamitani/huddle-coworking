"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, MapPin } from "lucide-react"
import { motion } from "framer-motion"

const cityBanners: Record<string, string> = {
  "Denver": "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=1200",
  "Chicago": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=1200",
  "Atlanta": "https://images.unsplash.com/photo-1570032257806-7f4c8d07f156?w=1200",
  "Boston": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=1200",
  "Los Angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=1200",
  "Las Vegas": "https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=1200",
  "Portland": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=1200",
  "Miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200",
  "New York": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
  "San Francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200",
  "Phoenix": "https://images.unsplash.com/photo-1570168009587-5e9b7b70e2ce?w=1200",
  "Seattle": "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=1200",
  "Austin": "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=1200",
  "Tampa": "https://images.unsplash.com/photo-1592505303497-9e12e397c0ef?w=1200",
}

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200"

export default function CityPage() {
  const params = useParams()
  const cityName = decodeURIComponent(params.city as string)
  const [spaces, setSpaces] = useState<Array<{ id: number; n: string; c: string; st: string; d: string; ct: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/spaces?city=${encodeURIComponent(cityName)}&limit=50`)
      .then((r) => r.json())
      .then((d) => {
        setSpaces(d.results || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [cityName])

  const formatCityName = cityName.charAt(0).toUpperCase() + cityName.slice(1)

  return (
    <div className="min-h-screen bg-warm-100">
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src={cityBanners[formatCityName] || DEFAULT_BANNER}
          alt={formatCityName}
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
              <h1 className="text-4xl sm:text-5xl font-heading font-bold">{formatCityName}</h1>
            </div>
            <p className="text-white/70 text-lg">
              {loading ? "Loading..." : `${spaces.length} coworking ${spaces.length === 1 ? "space" : "spaces"}`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-warm-200 p-4 animate-pulse">
                <div className="aspect-[4/3] bg-warm-200 rounded-xl mb-4" />
                <div className="h-5 bg-warm-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-warm-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 text-warm-300 mx-auto mb-4" />
            <h2 className="text-xl font-heading font-semibold text-navy-500 mb-2">No spaces found in {formatCityName}</h2>
            <p className="text-warm-600 mb-6">We haven&apos;t added this city yet. Try browsing all spaces.</p>
            <Link href="/spaces" className="bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600">
              Browse All Spaces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space, i) => (
              <motion.div
                key={space.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  href={`/spaces/${space.n.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[-\s]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 100)}`}
                  className="block group bg-white rounded-2xl border border-warm-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-warm-200">
                    <img
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600"
                      alt={space.n}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-navy-500 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1">{space.n}</h3>
                    <p className="text-sm text-warm-700 line-clamp-2 mb-3">{space.d}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-warm-200">
                      <span className="text-xs text-warm-600">{space.ct} contacts</span>
                      <span className="text-xs text-brand-600 font-medium group-hover:underline">View Details &rarr;</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
