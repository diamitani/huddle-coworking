"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, MapPin } from "lucide-react"

export default function BookingsPage() {
  const [suggestions, setSuggestions] = useState<Array<{ n: string; c: string; st: string }>>([])

  useEffect(() => {
    fetch("/api/spaces?sort=ct&limit=3")
      .then((r) => r.json())
      .then((d) => setSuggestions(d.results || []))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-heading font-bold text-navy-500 mb-2">My Bookings</h1>
          <p className="text-warm-700">View and manage your bookings and membership applications.</p>
        </div>

        <div className="text-center py-16 bg-white rounded-2xl border border-warm-200">
          <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-warm-400" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-navy-500 mb-2">No bookings yet</h2>
          <p className="text-warm-600 text-sm mb-6 max-w-sm mx-auto">
            When you book a day pass, meeting room, or apply for membership, it will appear here.
          </p>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-all"
          >
            Browse Spaces
          </Link>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-heading font-semibold text-navy-500 mb-6">Popular spaces to explore</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((space, i) => (
                <Link
                  key={i}
                  href={`/spaces/${space.n.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[-\s]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 100)}`}
                  className="block group bg-white rounded-2xl border border-warm-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] bg-warm-200 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600"
                      alt={space.n}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-navy-500 line-clamp-1">{space.n}</h3>
                    <p className="text-sm text-warm-700 mt-1">
                      <MapPin className="w-3.5 h-3.5 inline" /> {space.c}, {space.st}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
