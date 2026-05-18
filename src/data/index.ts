// Data layer for Huddle directory

const DATA_URL = "/data/directory.json"

export interface DirectoryEntry {
  id: number
  n: string
  c: string
  st: string
  w: string
  d: string
  a: string[]
  ct: number
}

let _cache: DirectoryEntry[] | null = null

export async function getDirectory(): Promise<DirectoryEntry[]> {
  if (_cache) return _cache
  const res = await fetch(DATA_URL)
  _cache = await res.json()
  return _cache!
}

export async function searchSpaces(params: {
  q?: string
  city?: string
  state?: string
  amenities?: string[]
  sort?: "ct" | "name"
  page?: number
  limit?: number
}): Promise<{ results: DirectoryEntry[]; total: number }> {
  let data = await getDirectory()
  const { q, city, state, amenities, sort = "ct", page = 1, limit = 30 } = params

  if (q) {
    const query = q.toLowerCase()
    data = data.filter(
      (s) =>
        s.n.toLowerCase().includes(query) ||
        s.c.toLowerCase().includes(query) ||
        s.d.toLowerCase().includes(query)
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

  return { results, total }
}

export function getCitiesAndStates(data: DirectoryEntry[]): {
  cities: string[]
  states: string[]
} {
  const cities = [...new Set(data.map((s) => s.c).filter(Boolean))].sort()
  const states = [...new Set(data.map((s) => s.st).filter(Boolean))].sort()
  return { cities, states }
}
