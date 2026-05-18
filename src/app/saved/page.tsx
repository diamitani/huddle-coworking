"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import SpaceCard from "@/components/SpaceCard"
import { getFeaturedSpaces } from "@/data/spaces"

export default function SavedPage() {
  const suggested = getFeaturedSpaces().slice(0, 3)

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-heading font-bold text-navy-500 mb-2">Saved Spaces</h1>
          <p className="text-warm-700">Your saved coworking spaces will appear here.</p>
        </div>

        <div className="text-center py-16 bg-white rounded-2xl border border-warm-200">
          <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-warm-400" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-navy-500 mb-2">No saved spaces yet</h2>
          <p className="text-warm-600 text-sm mb-6 max-w-sm mx-auto">
            Start exploring and save spaces you like. They&#39;ll be here for quick access.
          </p>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-all"
          >
            Browse Spaces
          </Link>
        </div>

        {suggested.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-heading font-semibold text-navy-500 mb-6">Featured spaces you might like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggested.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
