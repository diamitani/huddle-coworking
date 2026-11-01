// POST /api/leads — anonymous tour/inquiry funnel (the money funnel).
// No login required. Validates, rate-limits, stores durably via lead-store.
import { NextRequest, NextResponse } from "next/server"
import { saveRecord } from "@/lib/lead-store"
import { rateLimit, clientIp, isHoneypotFilled, validEmail, clean } from "@/lib/abuse"

const TYPES = new Set(["tour", "membership", "pricing", "event", "other"])

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!rateLimit(`leads:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (isHoneypotFilled(body)) {
    // Pretend success to bots.
    return NextResponse.json({ ok: true })
  }

  const name = clean(body.name, 120)
  const email = clean(body.email, 254)

  // Featured/Premium waitlist (from the pricing page — checkout opens after
  // Stripe activation).
  if (body.kind === "featured_waitlist") {
    const tier = body.tier === "premium" ? "premium" : "featured"
    if (!name || !validEmail(email)) {
      return NextResponse.json({ error: "Please provide your name and a valid email." }, { status: 400 })
    }
    try {
      await saveRecord("featured_waitlist", {
        name,
        email,
        space_name: clean(body.space_name, 200),
        tier,
      })
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

  const inquiryType = typeof body.inquiry_type === "string" && TYPES.has(body.inquiry_type)
    ? body.inquiry_type
    : "tour"

  if (!name || !validEmail(email)) {
    return NextResponse.json({ error: "Please provide your name and a valid email." }, { status: 400 })
  }

  try {
    const result = await saveRecord("inquiry", {
      name,
      email,
      phone: clean(body.phone, 40),
      space_name: clean(body.space_name, 200),
      space_city: clean(body.space_city, 120),
      space_state: clean(body.space_state, 10),
      space_slug: clean(body.space_slug, 140),
      inquiry_type: inquiryType,
      message: clean(body.message, 2000),
    })
    return NextResponse.json({ ok: true, id: result.id })
  } catch (err) {
    if ((err as Error).message === "lead-store-not-configured") {
      return NextResponse.json(
        { error: "Inquiry capture is being connected. Please try again shortly." },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
