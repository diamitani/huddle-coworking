// Durable lead storage for Huddle's revenue funnels.
// Providers (first configured wins):
//   1. Supabase — when NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
//      (tables in supabase/migrations/001_lead_capture.sql).
//   2. Vercel Blob (private store "huddle-leads") — when BLOB_READ_WRITE_TOKEN is set.
//      One JSON object per record; this is the live provider on Vercel today.
// If neither is configured, saves throw — the API routes return a clear 503
// instead of silently dropping the submission.

import { put, list } from "@vercel/blob"
import { createClient } from "@supabase/supabase-js"

export type LeadKind =
  | "inquiry" // tour / membership / pricing / event request from a listing page
  | "claim" // claim-your-listing request
  | "listing" // brand-new space submission
  | "newsletter" // newsletter signup
  | "featured_waitlist" // operator wants Featured/Premium when checkout opens
  | "pageview" // lightweight analytics

export interface StoreResult {
  ok: boolean
  id: string
}

function hasSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

function hasBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

const SUPABASE_TABLES: Record<LeadKind, string> = {
  inquiry: "lead_inquiries",
  claim: "claim_requests",
  listing: "space_submissions",
  newsletter: "newsletter_signups",
  featured_waitlist: "featured_waitlist",
  pageview: "page_views",
}

async function saveToSupabase(kind: LeadKind, data: Record<string, unknown>): Promise<StoreResult> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const table = SUPABASE_TABLES[kind]
  const payload: Record<string, unknown> =
    kind === "pageview"
      ? { path: data.path, referrer: data.referrer ?? null }
      : { ...data, status: kind === "newsletter" ? "subscribed" : "new" }
  const { data: row, error } = await client
    .from(table)
    .insert(payload)
    .select("id")
    .single()
  if (error) throw new Error(`supabase insert failed: ${error.message}`)
  return { ok: true, id: String(row?.id ?? "") }
}

async function saveToBlob(kind: LeadKind, data: Record<string, unknown>): Promise<StoreResult> {
  const now = new Date()
  const ym = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
  const rand = Math.random().toString(36).slice(2, 10)
  // Newsletter dedupes on email hash so re-signups overwrite instead of duplicating.
  const pathname =
    kind === "newsletter" && typeof data.email === "string"
      ? `huddle/newsletter/${hashEmail(data.email)}.json`
      : `huddle/${kind}/${ym}/${now.getTime()}-${rand}.json`
  const body = JSON.stringify({ kind, created_at: now.toISOString(), ...data })
  // Timeout wrapper: a store outage should 500, never hang the request.
  const putPromise = put(pathname, body, {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  })
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("blob store timeout")), 15000)
  )
  const blob = await Promise.race([putPromise, timeout])
  return { ok: true, id: blob.url }
}

function hashEmail(email: string): string {
  let h = 0
  const s = email.trim().toLowerCase()
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return `e${Math.abs(h).toString(36)}`
}

export async function saveRecord(
  kind: LeadKind,
  data: Record<string, unknown>
): Promise<StoreResult> {
  if (hasSupabase()) return saveToSupabase(kind, data)
  if (hasBlob()) return saveToBlob(kind, data)
  throw new Error("lead-store-not-configured")
}

export function storeStatus(): { supabase: boolean; blob: boolean } {
  return { supabase: hasSupabase(), blob: hasBlob() }
}

/** Admin read path: newest records first. Supabase or Blob. */
export async function listRecords(kind: LeadKind, limit = 100): Promise<Record<string, unknown>[]> {
  if (hasSupabase()) {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await client
      .from(SUPABASE_TABLES[kind])
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw new Error(`supabase list failed: ${error.message}`)
    return (data ?? []) as Record<string, unknown>[]
  }
  if (hasBlob()) {
    const token = process.env.BLOB_READ_WRITE_TOKEN!
    const { blobs } = await list({ prefix: `huddle/${kind}/`, limit })
    // Newest first by pathname timestamp prefix.
    const sorted = blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1)).slice(0, limit)
    const out: Record<string, unknown>[] = []
    for (const b of sorted) {
      try {
        const res = await fetch(b.url, {
          headers: { authorization: `Bearer ${token}` },
        })
        if (res.ok) out.push((await res.json()) as Record<string, unknown>)
      } catch {
        // skip unreadable blobs
      }
    }
    return out
  }
  throw new Error("lead-store-not-configured")
}
