import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

const DATA_PATH = join(process.cwd(), "public", "data", "directory.json")

interface Space {
  id: number
  n: string
  c: string
  st: string
  w: string
  d: string
  a: string[]
  ct: number
}

let _data: Space[] | null = null

function getData(): Space[] {
  if (!_data) {
    const raw = readFileSync(DATA_PATH, "utf-8")
    _data = JSON.parse(raw) as Space[]
  }
  return _data!
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase()
  const city = searchParams.get("city")
  const state = searchParams.get("state")
  const amenities = searchParams.get("amenities")?.split(",").filter(Boolean)
  const sort = searchParams.get("sort") || "ct"
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "30")

  let data = getData()

  if (q) {
    data = data.filter(
      (s) =>
        s.n.toLowerCase().includes(q) ||
        s.c.toLowerCase().includes(q) ||
        s.d.toLowerCase().includes(q)
    )
  }
  if (city) {
    data = data.filter((s) => s.c.toLowerCase() === city.toLowerCase())
  }
  if (state) {
    data = data.filter((s) => s.st.toLowerCase() === state.toLowerCase())
  }
  if (amenities && amenities.length > 0) {
    data = data.filter((s) => amenities.every((a) => s.a.includes(a)))
  }

  if (sort === "name") {
    data.sort((a, b) => a.n.localeCompare(b.n))
  } else {
    data.sort((a, b) => b.ct - a.ct)
  }

  const total = data.length
  const start = (page - 1) * limit
  const results = data.slice(start, start + limit)

  // Get all unique cities and states for filters
  const allData = getData()
  const cities = [...new Set(allData.map((s) => s.c).filter(Boolean))].sort()
  const states = [...new Set(allData.map((s) => s.st).filter(Boolean))].sort()

  return NextResponse.json({ results, total, page, limit, cities, states })
}
