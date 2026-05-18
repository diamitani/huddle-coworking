"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, MapPin, Star, Map } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { cn } from "@/lib/cn"

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false })

interface SpaceResult {
  id: number
  n: string
  c: string
  st: string
  w: string
  d: string
  a: string[]
  ct: number
  lat?: number
  lng?: number
}

function SpacesContent() {
  const searchParams = useSearchParams()

  const [results, setResults] = useState<SpaceResult[]>([])
  const [allSpaces, setAllSpaces] = useState<SpaceResult[]>([])
  const [total, setTotal] = useState(0)
  const [cities, setCities] = useState<string[]>([])
  const [states, setStates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "")
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "")
  const [sort, setSort] = useState("ct")
  const [page, setPage] = useState(1)

  const fetchSpaces = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (selectedCity) params.set("city", selectedCity)
    if (selectedState) params.set("state", selectedState)
    params.set("sort", sort)
    params.set("page", String(page))
    params.set("limit", "30")

    try {
      const res = await fetch(`/api/spaces?${params}`)
      const data = await res.json()
      setResults(data.results)
      setTotal(data.total)
      if (data.cities && cities.length === 0) setCities(data.cities)
      if (data.states && states.length === 0) setStates(data.states)
    } catch (e) {
      console.error("Failed to fetch spaces", e)
    } finally {
      setLoading(false)
    }
  }, [query, selectedCity, selectedState, sort, page])

  // Load full dataset once for map
  useEffect(() => {
    fetch("/data/directory.json")
      .then((r) => r.json())
      .then((d) => setAllSpaces(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchSpaces()
  }, [fetchSpaces])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    setPage(1)
    fetchSpaces()
  }

  const clearFilters = () => {
    setQuery("")
    setSelectedCity("")
    setSelectedState("")
    setPage(1)
  }

  const hasFilters = query || selectedCity || selectedState
  const totalPages = Math.ceil(total / 30)

  return (
    <div className="min-h-screen pt-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500 mb-2">
            Discover Coworking Spaces
          </h1>
          <p className="text-warm-700">
            {total.toLocaleString()} coworking spaces across the US
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, city, or keyword..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-warm-200 bg-white text-navy-500 text-sm outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setPage(1) }}
              className="rounded-xl border border-warm-200 px-4 py-3 text-sm text-navy-500 bg-white min-w-[160px]"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={selectedState}
              onChange={(e) => { setSelectedState(e.target.value); setPage(1) }}
              className="rounded-xl border border-warm-200 px-4 py-3 text-sm text-navy-500 bg-white min-w-[100px]"
            >
              <option value="">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all"
            >
              Search
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-3 rounded-xl text-sm text-warm-600 hover:text-navy-500"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-warm-600">
            {loading ? "Searching..." : `${total.toLocaleString()} results`}
            {(query || selectedCity || selectedState) && (
              <button onClick={clearFilters} className="ml-2 text-brand-500 hover:text-brand-600">
                (clear filters)
              </button>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                showMap
                  ? "bg-brand-50 text-brand-600 border border-brand-200"
                  : "border border-warm-200 text-warm-700 hover:bg-warm-50"
              )}
            >
              <Map className="w-4 h-4" />
              {showMap ? "Hide Map" : "Show Map"}
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-warm-200 px-3.5 py-2 text-sm text-navy-500 bg-white"
            >
              <option value="ct">Most Popular</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        {showMap && (
          <div className="mb-6">
            <MapView
              spaces={allSpaces}
              height="400px"
              onCitySelect={(city, state) => {
                setSelectedCity(city)
                setSelectedState(state)
                setPage(1)
                setShowMap(false)
              }}
            />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-warm-200 p-4 animate-pulse">
                <div className="aspect-[4/3] bg-warm-200 rounded-xl mb-4" />
                <div className="h-5 bg-warm-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-warm-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-warm-200 rounded w-full mb-2" />
                <div className="h-4 bg-warm-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 text-warm-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy-500 mb-2">No spaces found</h3>
            <p className="text-warm-600 mb-4">Try adjusting your search filters.</p>
            <button onClick={clearFilters} className="text-brand-500 font-medium">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((space, i) => (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
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
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 text-xs font-medium text-navy-500">
                        <Star className="w-3.5 h-3.5 text-accent-500" fill="currentColor" />
                        {space.ct > 50 ? "Popular" : "Verified"}
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
                      <div className="flex items-center gap-3 mb-3">
                        {space.a.slice(0, 3).map((amenity) => (
                          <span key={amenity} className="text-xs text-warm-600 bg-warm-50 px-2 py-1 rounded-full">
                            {amenity}
                          </span>
                        ))}
                        {space.a.length > 3 && (
                          <span className="text-xs text-warm-500">+{space.a.length - 3}</span>
                        )}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-warm-200 text-sm text-navy-500 disabled:opacity-40 hover:bg-white transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-10 h-10 rounded-xl text-sm font-medium transition-colors",
                        p === page
                          ? "bg-brand-500 text-white"
                          : "border border-warm-200 text-navy-500 hover:bg-white"
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-warm-200 text-sm text-navy-500 disabled:opacity-40 hover:bg-white transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SpacesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 bg-warm-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-warm-200 rounded-xl w-96" />
            <div className="h-6 bg-warm-200 rounded-xl w-64" />
            <div className="h-14 bg-warm-200 rounded-xl w-full" />
            <div className="grid grid-cols-3 gap-5">
              {[1,2,3].map(i => <div key={i} className="h-80 bg-warm-200 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    }>
      <SpacesContent />
    </Suspense>
  )
}
