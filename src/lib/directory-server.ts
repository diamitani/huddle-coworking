// Server-only directory data access (node fs). Import from server
// components and API routes only — never from client components.
import "server-only"
import { readFileSync, existsSync } from "fs"
import { join } from "path"
import {
  slugifyName,
  type Space,
  type DirectoryStats,
} from "./directory"

export { slugifyName, SITE_URL } from "./directory"
export type { Space, DirectoryStats, SpacePricing, SpaceHours, EventSpaceInfo, SpaceEvent, SpaceProgram } from "./directory"

const DATA_PATH = join(process.cwd(), "public", "data", "directory.json")
const STATS_PATH = join(process.cwd(), "public", "data", "stats.json")
const FEATURED_PATH = join(process.cwd(), "public", "data", "featured.json")

let _spaces: Space[] | null = null
let _featured: Record<string, "featured" | "premium"> | null = null

function getFeaturedMap(): Record<string, "featured" | "premium"> {
  if (!_featured) {
    try {
      _featured = existsSync(FEATURED_PATH)
        ? (JSON.parse(readFileSync(FEATURED_PATH, "utf-8")) as Record<string, "featured" | "premium">)
        : {}
    } catch {
      _featured = {}
    }
  }
  return _featured!
}

export function getSpaces(): Space[] {
  if (!_spaces) {
    const raw = JSON.parse(readFileSync(DATA_PATH, "utf-8")) as Space[]
    const featuredMap = getFeaturedMap()
    _spaces = raw.map((s) => {
      const slug = s.slug || slugifyName(`${s.name}-${s.city}`)
      const mapTier = featuredMap[slug]
      return {
        ...s,
        slug,
        phone: s.phone || "",
        featured_tier: s.featured_tier && s.featured_tier !== "none" ? s.featured_tier : mapTier || "none",
      }
    })
  }
  return _spaces!
}

/** Match on stored slug; fall back to legacy slugify(name) for old URLs. */
export function getSpaceBySlug(slug: string): { space: Space; canonical: boolean } | null {
  const spaces = getSpaces()
  const direct = spaces.find((s) => s.slug === slug)
  if (direct) return { space: direct, canonical: true }
  const legacy = spaces.find((s) => slugifyName(s.name) === slug)
  if (legacy) return { space: legacy, canonical: false }
  return null
}

export function getStats(): DirectoryStats {
  const spaces = getSpaces()
  const cities = new Set(spaces.map((s) => s.city).filter(Boolean))
  const states = new Set(spaces.map((s) => s.state).filter(Boolean))
  let topStates: Record<string, number> = {}
  let topCities: { city: string; count: number }[] = []
  try {
    const raw = JSON.parse(readFileSync(STATS_PATH, "utf-8"))
    topStates = raw.topStates || {}
    topCities = raw.topCities || []
  } catch {
    // stats.json missing — counts above are still computed from data
  }
  return {
    totalSpaces: spaces.length,
    totalCities: cities.size,
    totalStates: states.size,
    topStates,
    topCities,
  }
}

export function getFeaturedSpaces(): Space[] {
  return getSpaces().filter((s) => s.featured_tier !== "none")
}

export function getCities(): string[] {
  return [...new Set(getSpaces().map((s) => s.city).filter(Boolean))].sort()
}

export function getSpacesByCity(city: string): Space[] {
  return getSpaces().filter((s) => s.city.toLowerCase() === city.toLowerCase())
}
