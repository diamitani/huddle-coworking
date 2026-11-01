// Authenticated inquiry endpoints. Writes go to the same durable lead store
// as the anonymous funnel (POST /api/leads) with the user's sub attached,
// so the dashboard's "my inquiries" tab reads back from one place.
// No RDS dependency.
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-cognito"
import { saveRecord, listRecords } from "@/lib/lead-store"
import { rateLimit, clientIp, clean } from "@/lib/abuse"

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!rateLimit(`inquiries:${ip}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 })
  }
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
  const space_name = clean(body.space_name, 200)
  if (!space_name) {
    return NextResponse.json({ error: "Space name is required" }, { status: 400 })
  }

  try {
    const result = await saveRecord("inquiry", {
      user_sub: user.sub,
      user_email: user.email,
      space_name,
      space_city: clean(body.space_city, 120),
      space_state: clean(body.space_state, 10),
      space_website: clean(body.space_website, 500),
      inquiry_type: clean(body.inquiry_type, 40) || "membership",
      message: clean(body.message, 2000),
      source: "dashboard",
    })
    return NextResponse.json({ inquiry: { id: result.id, space_name } })
  } catch {
    return NextResponse.json({ error: "Could not submit right now." }, { status: 503 })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  try {
    const all = await listRecords("inquiry", 200)
    const mine = all.filter(
      (r) => r.user_sub === user.sub || (user.email && r.user_email === user.email)
    )
    return NextResponse.json({ inquiries: mine })
  } catch {
    return NextResponse.json({ error: "Could not load inquiries." }, { status: 503 })
  }
}
