"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, MapPin, Star } from "lucide-react"
import { motion } from "framer-motion"

interface FeaturedSpace {
  n: string
  c: string
  st: string
  d: string
  a: string[]
  ct: number
}

export default function FeaturedSpaces() {
  const [spaces, setSpaces] = useState<FeaturedSpace[]>([])

  useEffect(() => {
    fetch("/api/spaces?sort=ct&limit=6")
      .then((r) => r.json())
      .then((d) => setSpaces(d.results || []))
      .catch(() => {})
  }, [])

  if (spaces.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
              Featured Spaces
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500">
              Top Coworking Spaces
            </h2>
          </div>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:text-brand-700 transition-colors shrink-0"
          >
            View all spaces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space, i) => (
            <motion.div
              key={`${space.n}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Link
                href={`/spaces/${space.n.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[-\s]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 100)}`}
                className="block group bg-white rounded-2xl border border-warm-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-warm-200">
                  <img
                    src={`https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=450&fit=crop`}
                    alt={space.n}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-medium shadow-md">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-navy-500 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1">
                    {space.n}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-warm-700 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{space.c}, {space.st}</span>
                  </div>
                  <p className="text-sm text-warm-700 leading-relaxed line-clamp-2 mb-3">
                    {space.d}
                  </p>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {space.a.slice(0, 3).map((amenity) => (
                      <span key={amenity} className="text-xs text-warm-600 bg-warm-50 px-2 py-1 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-warm-200">
                    <span className="text-xs text-warm-600">{space.ct} contacts</span>
                    <span className="text-xs text-brand-600 font-medium group-hover:underline">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
