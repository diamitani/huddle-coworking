// Saved spaces — stored in this browser (localStorage). No account needed.
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, MapPin, X } from "lucide-react"
import { getSavedSlugs, toggleSaved } from "@/lib/saved"

interface SavedSpace {
  name: string
  city: string
  state: string
  slug: string
}

export default function SavedPage() {
  const [spaces, setSpaces] = useState<SavedSpace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const slugs = getSavedSlugs()
    let cancelled = false
    Promise.all(
      slugs.map((slug) =>
        fetch(`/api/spaces/${encodeURIComponent(slug)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return
      setSpaces(results.filter(Boolean) as SavedSpace[])
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const remove = (slug: string) => {
    toggleSaved(slug)
    setSpaces((s) => s.filter((x) => x.slug !== slug))
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-heading font-bold text-navy-500 mb-2">Saved Spaces</h1>
          <p className="text-warm-700">
            {spaces.length > 0
              ? `${spaces.length} saved on this device`
              : "Your saved coworking spaces will appear here."}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-warm-200 p-4 animate-pulse">
                <div className="aspect-[4/3] bg-warm-200 rounded-xl mb-4" />
                <div className="h-5 bg-warm-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-warm-200">
            <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-warm-400" />
            </div>
            <h2 className="text-xl font-heading font-semibold text-navy-500 mb-2">No saved spaces yet</h2>
            <p className="text-warm-600 text-sm mb-6 max-w-sm mx-auto">
              Tap the heart on any space to save it here for quick access.
            </p>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-all"
            >
              Browse Spaces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <div key={space.slug} className="relative group bg-white rounded-2xl border border-warm-200 overflow-hidden hover:shadow-lg transition-all">
                <button
                  onClick={() => remove(space.slug)}
                  aria-label="Remove from saved"
                  className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-white/90 border border-warm-200 hover:bg-warm-50"
                >
                  <X className="w-4 h-4 text-warm-600" />
                </button>
                <Link href={`/spaces/${space.slug}`} className="block">
                  <div className="aspect-[4/3] bg-warm-200 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600"
                      alt={space.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-semibold text-navy-500 line-clamp-1">{space.name}</h3>
                    <p className="text-sm text-warm-700 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {space.city}, {space.state}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
