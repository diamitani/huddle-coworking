import { NextRequest, NextResponse } from "next/server"
import { getSpaces, type Space } from "@/lib/directory-server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase()
  const city = searchParams.get("city")
  const state = searchParams.get("state")
  const amenities = searchParams.get("amenities")?.split(",").filter(Boolean)
  const sort = searchParams.get("sort") || "featured"
  const mode = searchParams.get("mode") // work (default) | huddle | collaborate
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "30")

  let data: Space[] = [...getSpaces()]

  // Track lenses: HUDDLE = find people (events / event space),
  // COLLABORATE = find programs. WORK = the full directory.
  if (mode === "huddle") {
    data = data.filter(
      (s) => (s.events && s.events.length > 0) || s.event_space?.available
    )
  } else if (mode === "collaborate") {
    data = data.filter((s) => s.programs && s.programs.length > 0)
  }

  if (q) {
    data = data.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
    )
  }
  if (city) {
    data = data.filter((s) => s.city.toLowerCase() === city.toLowerCase())
  }
  if (state) {
    data = data.filter((s) => s.state.toLowerCase() === state.toLowerCase())
  }
  if (amenities && amenities.length > 0) {
    data = data.filter((s) => amenities.every((am) => (s.amenities || []).includes(am)))
  }

  // Featured listings first (paying operators), then alphabetical.
  const tierRank = (t: string) => (t === "premium" ? 2 : t === "featured" ? 1 : 0)
  if (sort === "name") {
    data.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    data.sort(
      (a, b) =>
        tierRank(b.featured_tier) - tierRank(a.featured_tier) || a.name.localeCompare(b.name)
    )
  }

  const total = data.length
  const start = (page - 1) * limit
  const results = data.slice(start, start + limit)

  const allData = getSpaces()
  const cities = [...new Set(allData.map((s) => s.city).filter(Boolean))].sort()
  const states = [...new Set(allData.map((s) => s.state).filter(Boolean))].sort()

  return NextResponse.json({ results, total, page, limit, cities, states })
}
