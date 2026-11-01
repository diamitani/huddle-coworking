// GET /api/admin/leads?kind=inquiry|claim|listing|newsletter|featured_waitlist
// Password-gated admin read path for the lead funnels.
// Header: x-admin-key: <HUDDLE_ADMIN_PASSWORD>
import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { listRecords, type LeadKind } from "@/lib/lead-store"

const KINDS: LeadKind[] = ["inquiry", "claim", "listing", "newsletter", "featured_waitlist"]

function authorized(req: NextRequest): boolean {
  const expected = process.env.HUDDLE_ADMIN_PASSWORD
  const provided = req.headers.get("x-admin-key")
  if (!expected || !provided) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(provided)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const kind = new URL(req.url).searchParams.get("kind") as LeadKind
  if (!kind || !KINDS.includes(kind)) {
    return NextResponse.json({ error: "Invalid kind." }, { status: 400 })
  }
  try {
    const records = await listRecords(kind, 200)
    return NextResponse.json({ kind, count: records.length, records })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message === "lead-store-not-configured" ? "Lead store not configured." : "Failed to load." },
      { status: 500 }
    )
  }
}
