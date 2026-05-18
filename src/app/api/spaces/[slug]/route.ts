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

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[-\s]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 100)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const data = getData()
  const space = data.find((s) => slugify(s.n) === slug)

  if (!space) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 })
  }

  return NextResponse.json(space)
}
