// POST /api/analytics — lightweight first-party pageview logging.
// Best-effort: never blocks rendering, stores no PII.
import { NextRequest, NextResponse } from "next/server"
import { saveRecord } from "@/lib/lead-store"
import { rateLimit, clientIp, clean } from "@/lib/abuse"

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!rateLimit(`analytics:${ip}`, 120, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const path = clean(body.path, 300)
  if (!path.startsWith("/")) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    await saveRecord("pageview", { path, referrer: clean(body.referrer, 300) })
  } catch {
    // Analytics must never break the page.
  }
  return NextResponse.json({ ok: true })
}
