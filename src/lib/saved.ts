// Client-side saved spaces (localStorage). The old server-side saved list
// required an auth backend that was never configured; this works today.

const KEY = "huddle_saved_slugs"

export function getSavedSlugs(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function isSaved(slug: string): boolean {
  return getSavedSlugs().includes(slug)
}

export function toggleSaved(slug: string): boolean {
  const slugs = getSavedSlugs()
  const next = slugs.includes(slug)
    ? slugs.filter((s) => s !== slug)
    : [...slugs, slug]
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // storage unavailable — ignore
  }
  return next.includes(slug)
}
