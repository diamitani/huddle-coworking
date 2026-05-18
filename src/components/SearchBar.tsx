"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/cn"
import { cities, states, allAmenities } from "@/data/spaces"

interface SearchBarProps {
  variant?: "hero" | "compact"
}

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredCities = cities.filter(c =>
    c.toLowerCase().includes(query.toLowerCase())
  )

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (selectedCity) params.set("city", selectedCity)
    if (selectedState) params.set("state", selectedState)
    if (selectedAmenities.length) params.set("amenities", selectedAmenities.join(","))
    router.push(`/spaces?${params.toString()}`)
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const clearAll = () => {
    setQuery("")
    setSelectedCity("")
    setSelectedState("")
    setSelectedAmenities([])
  }

  const hasFilters = selectedCity || selectedState || selectedAmenities.length > 0

  if (variant === "compact") {
    return (
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center gap-2 bg-warm-100 rounded-xl px-4 py-2.5 border border-warm-200 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          <Search className="w-4 h-4 text-warm-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search spaces by city..."
            className="flex-1 bg-transparent text-sm text-navy-500 placeholder:text-warm-600 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showFilters ? "bg-brand-100 text-brand-600" : "hover:bg-warm-200 text-warm-600"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
        {showFilters && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-warm-200 p-4 z-20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider">Filters</span>
              {hasFilters && (
                <button onClick={clearAll} className="text-xs text-brand-500 hover:text-brand-600">
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-sm rounded-lg border border-warm-200 px-3 py-2 bg-white text-navy-500"
              >
                <option value="">All Cities</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-sm rounded-lg border border-warm-200 px-3 py-2 bg-white text-navy-500"
              >
                <option value="">All States</option>
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allAmenities.slice(0, 10).map(amenity => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-full border transition-colors",
                    selectedAmenities.includes(amenity)
                      ? "bg-brand-500 text-white border-brand-500"
                      : "border-warm-200 text-warm-700 hover:border-brand-300"
                  )}
                >
                  {amenity}
                </button>
              ))}
            </div>
            <button
              onClick={handleSearch}
              className="w-full bg-brand-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        )}
      </form>
    )
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 border border-white/20 px-5 py-3.5">
          <MapPin className="w-5 h-5 text-brand-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search by city, neighborhood, or space name..."
            className="flex-1 bg-transparent text-base text-navy-500 placeholder:text-warm-600/60 outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                showFilters || hasFilters
                  ? "bg-brand-50 text-brand-600"
                  : "bg-warm-100 text-warm-700 hover:bg-warm-200"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-500" />
              )}
            </button>
            <button
              type="submit"
              className="bg-brand-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>
        </div>

        {showSuggestions && query && filteredCities.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-warm-200 overflow-hidden z-20">
            {filteredCities.slice(0, 5).map(city => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setQuery(city)
                  setSelectedCity(city)
                  setShowSuggestions(false)
                }}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-navy-500 hover:bg-warm-50 text-left"
              >
                <MapPin className="w-4 h-4 text-warm-500" />
                {city}
              </button>
            ))}
          </div>
        )}

        {showFilters && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-warm-200 p-6 z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-navy-500">Refine Your Search</h3>
              {hasFilters && (
                <button onClick={clearAll} className="text-sm text-brand-500 hover:text-brand-600">
                  Clear all filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider mb-1.5">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500 bg-white"
                >
                  <option value="">All Cities</option>
                  {cities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider mb-1.5">State</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500 bg-white"
                >
                  <option value="">All States</option>
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider mb-1.5">Space Type</label>
                <select
                  className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500 bg-white"
                >
                  <option value="">All Types</option>
                  <option>Open Coworking</option>
                  <option>Private Office</option>
                  <option>Coworking + Events</option>
                  <option>Creative Studio</option>
                  <option>Wellness Space</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-warm-700 uppercase tracking-wider mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {allAmenities.map(amenity => (
                  <button
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={cn(
                      "text-sm px-3.5 py-2 rounded-full border transition-all",
                      selectedAmenities.includes(amenity)
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-white border-warm-200 text-warm-700 hover:border-brand-300 hover:text-brand-600"
                    )}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSearch}
                className="bg-brand-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-all"
              >
                Search Spaces
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
