// POST /api/newsletter — newsletter signup that actually stores.
import { NextRequest, NextResponse } from "next/server"
import { saveRecord } from "@/lib/lead-store"
import { rateLimit, clientIp, isHoneypotFilled, validEmail, clean } from "@/lib/abuse"

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!rateLimit(`newsletter:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (isHoneypotFilled(body)) return NextResponse.json({ ok: true })

  const email = clean(body.email, 254)
  if (!validEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  try {
    await saveRecord("newsletter", { email, source: clean(body.source, 60) || "site" })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if ((err as Error).message === "lead-store-not-configured") {
      return NextResponse.json(
        { error: "Signup is being connected. Please try again shortly." },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
