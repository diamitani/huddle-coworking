// Shared directory types + pure helpers. Safe to import from client
// components (no node builtins). Server-only loaders live in
// directory-server.ts.

export interface SpacePricing {
  day_pass?: number | null
  hot_desk_monthly?: number | null
  dedicated_desk_monthly?: number | null
  private_office_monthly?: number | null
  meeting_room_hourly?: number | null
  currency?: "USD"
  source?: "brand" | "operator" | null
  updated_at?: string | null
}

export interface SpaceHours {
  /** Structured now so future access tiers (e.g. night-access memberships) need no remodel. */
  access?: "24/7" | "business_hours" | "extended" | null
  staffed?: string | null
}

export interface EventSpaceInfo {
  available?: boolean
  capacity?: number | null
  description?: string
}

export interface SpaceEvent {
  title: string
  date?: string
  url?: string
  source?: string
}

export interface SpaceProgram {
  title: string
  type?: "workshop" | "course" | "accelerator" | "open_studio" | "class" | string
  schedule?: string | null
  price?: string | null
  url?: string | null
  source?: string | null
}

export interface Space {
  /** Legacy int id — the master backend maps this to metadata.legacy_id. */
  id: number
  name: string
  city: string
  state: string // 2-letter code
  website: string
  description: string // may be "" — never fabricated
  amenities: string[] // sourced only
  latitude: number | null // null when unknown — never a fake pin
  longitude: number | null // null when unknown — never a fake pin
  slug: string // stored unique slug (name+city)
  phone: string // validated phone or ""
  email?: string // business email only
  featured_tier: "none" | "featured" | "premium"
  // --- expanded coworking model (Patrick 2026-10-31) ---
  address?: string // full street address, "" when unknown
  pricing?: SpacePricing | null // null = unknown; never fabricated
  hours?: SpaceHours | null // carries future night-access tiers
  membership_tiers?: { name: string; price?: string | null }[] // offered tiers
  event_space?: EventSpaceInfo | null
  events?: SpaceEvent[] // public, sourced events only (HUDDLE track)
  programs?: SpaceProgram[] // public, sourced programs only (COLLABORATE track)
  services?: string[] // sourced service keys only
}

export interface FeaturedTier {
  slug: string
  tier: "featured" | "premium"
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 100)
}

export interface DirectoryStats {
  totalSpaces: number
  totalCities: number
  totalStates: number
  topStates: Record<string, number>
  topCities: { city: string; count: number }[]
}

export const SITE_URL = "https://huddleco.work"
