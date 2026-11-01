// POST /api/claims — claim-your-listing + new space submissions.
// Anonymous. Stored durably for admin review (feeds the featured upsell).
import { NextRequest, NextResponse } from "next/server"
import { saveRecord } from "@/lib/lead-store"
import { rateLimit, clientIp, isHoneypotFilled, validEmail, clean } from "@/lib/abuse"

const PRICE_KEYS = [
  "day_pass",
  "hot_desk_monthly",
  "dedicated_desk_monthly",
  "private_office_monthly",
  "meeting_room_hourly",
] as const

const SERVICE_KEYS = new Set([
  "mail_handling",
  "virtual_office",
  "event_hosting",
  "meeting_rooms",
  "phone_booth",
  "wellness",
  "childcare",
  "podcast_studio",
])

const ACCESS_KEYS = new Set(["24/7", "extended", "business_hours"])

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""))
  return Number.isFinite(n) && n > 0 && n < 1000000 ? Math.round(n) : null
}

/** Operator self-reported pricing — stored for review, never auto-published. */
function sanitizePricing(v: unknown): Record<string, number | null> | null {
  if (!v || typeof v !== "object") return null
  const obj = v as Record<string, unknown>
  const out: Record<string, number | null> = {}
  let any = false
  for (const k of PRICE_KEYS) {
    out[k] = num(obj[k])
    if (out[k] != null) any = true
  }
  return any ? out : null
}

function sanitizeHours(v: unknown): { access: string } | null {
  if (!v || typeof v !== "object") return null
  const access = (v as Record<string, unknown>).access
  return typeof access === "string" && ACCESS_KEYS.has(access) ? { access } : null
}

function sanitizeServices(v: unknown): string[] | null {
  if (!Array.isArray(v)) return null
  const out = v.filter((s): s is string => typeof s === "string" && SERVICE_KEYS.has(s))
  return out.length > 0 ? out : null
}

function sanitizeEventSpace(v: unknown): { available: boolean; capacity: number | null } | null {
  if (!v || typeof v !== "object") return null
  const obj = v as Record<string, unknown>
  if (obj.available !== true) return null
  return { available: true, capacity: num(obj.capacity) }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req)
  if (!rateLimit(`claims:${ip}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  if (isHoneypotFilled(body)) return NextResponse.json({ ok: true })

  const kind = body.kind === "listing" ? "listing" : "claim"
  const claimantName = clean(body.claimant_name || body.submitter_name, 120)
  const claimantEmail = clean(body.claimant_email || body.submitter_email, 254)
  const spaceName = clean(body.space_name, 200)

  if (!spaceName || !claimantName || !validEmail(claimantEmail)) {
    return NextResponse.json(
      { error: "Please provide the space name, your name, and a valid email." },
      { status: 400 }
    )
  }

  try {
    if (kind === "listing") {
      await saveRecord("listing", {
        space_name: spaceName,
        city: clean(body.city, 120),
        state: clean(body.state, 10),
        address: clean(body.address, 300),
        website: clean(body.website, 300),
        phone: clean(body.phone, 40),
        email: clean(body.email, 254),
        description: clean(body.description, 2000),
        submitter_name: claimantName,
        submitter_email: claimantEmail,
      })
    } else {
      await saveRecord("claim", {
        space_name: spaceName,
        space_slug: clean(body.space_slug, 140),
        space_city: clean(body.space_city, 120),
        space_state: clean(body.space_state, 10),
        claimant_name: claimantName,
        claimant_email: claimantEmail,
        claimant_phone: clean(body.claimant_phone || body.phone, 40),
        claimant_role: clean(body.claimant_role, 120),
        proof_url: clean(body.proof_url, 500),
        // Operator self-reported data (reviewed before publishing to
        // public/data/operator_pricing.json via scripts/rebuild_served.py).
        operator_pricing: sanitizePricing(body.pricing),
        operator_hours: sanitizeHours(body.hours),
        operator_services: sanitizeServices(body.services),
        operator_event_space: sanitizeEventSpace(body.event_space),
      })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    if ((err as Error).message === "lead-store-not-configured") {
      return NextResponse.json(
        { error: "Submission capture is being connected. Please try again shortly." },
        { status: 503 }
      )
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
