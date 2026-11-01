// Server-side saved spaces, keyed by Cognito user sub.
// Uses the private Vercel Blob store (same "huddle-leads" store as the lead
// funnels) — no RDS dependency. One JSON object per (user, slug):
//   huddle/saved/{subHash}/{slug}.json
// PUT overwrites (idempotent save), DELETE removes. This is the v1 store;
// the master directory backend is the graduation path.
import { put, list, del } from "@vercel/blob"

export interface SavedRecord {
  space_name: string
  space_city: string
  space_state: string
  space_slug: string
  created_at: string
}

function hashSub(sub: string): string {
  let h = 0
  for (let i = 0; i < sub.length; i++) h = (h * 31 + sub.charCodeAt(i)) | 0
  return `u${Math.abs(h).toString(36)}`
}

function requireBlob(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error("saved-store-not-configured")
  return token
}

const prefixFor = (sub: string) => `huddle/saved/${hashSub(sub)}/`

export async function saveSavedSpace(
  sub: string,
  rec: Omit<SavedRecord, "created_at">
): Promise<SavedRecord> {
  requireBlob()
  const record: SavedRecord = { ...rec, created_at: new Date().toISOString() }
  await put(`${prefixFor(sub)}${rec.space_slug}.json`, JSON.stringify(record), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
  })
  return record
}

export async function listSavedSpaces(sub: string): Promise<SavedRecord[]> {
  requireBlob()
  const { blobs } = await list({ prefix: prefixFor(sub), limit: 500 })
  const out: SavedRecord[] = []
  for (const b of blobs) {
    try {
      const res = await fetch(b.url)
      if (res.ok) out.push((await res.json()) as SavedRecord)
    } catch {
      // skip unreadable records
    }
  }
  return out.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
}

export async function deleteSavedSpace(sub: string, slug: string): Promise<void> {
  requireBlob()
  await del(`${prefixFor(sub)}${slug}.json`)
}
