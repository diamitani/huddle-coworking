import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-cognito"
import { saveSavedSpace, listSavedSpaces, deleteSavedSpace } from "@/lib/saved-store"
import { rateLimit, clientIp, clean } from "@/lib/abuse"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  try {
    const saved = await listSavedSpaces(user.sub)
    return NextResponse.json({ saved })
  } catch {
    return NextResponse.json({ error: "Saved spaces are unavailable right now." }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!rateLimit(`saved:${ip}`, 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 })
  }
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
  const space_name = clean(body.space_name, 200)
  const space_slug = clean(body.space_slug, 140)
  if (!space_name || !space_slug) {
    return NextResponse.json({ error: "space_name and space_slug are required." }, { status: 400 })
  }
  try {
    const record = await saveSavedSpace(user.sub, {
      space_name,
      space_city: clean(body.space_city, 120),
      space_state: clean(body.space_state, 10),
      space_slug,
    })
    return NextResponse.json({ saved: record })
  } catch {
    return NextResponse.json({ error: "Could not save right now." }, { status: 503 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
  const space_slug = clean(body.space_slug, 140)
  if (!space_slug) return NextResponse.json({ error: "space_slug is required." }, { status: 400 })
  try {
    await deleteSavedSpace(user.sub, space_slug)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Could not remove right now." }, { status: 503 })
  }
}
