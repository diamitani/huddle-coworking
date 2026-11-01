// Lightweight abuse protection for public lead forms:
// per-IP rate limiting (in-memory, best-effort on serverless),
// honeypot field, and input validation/sanitization.

const buckets = new Map<string, number[]>()

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs)
  if (hits.length >= max) return false
  hits.push(now)
  buckets.set(key, hits)
  return true
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  // Bots fill hidden fields; humans never see them.
  return Boolean(body.company_website || body.website_url)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validEmail(email: unknown): boolean {
  return typeof email === "string" && EMAIL_RE.test(email.trim()) && email.length <= 254
}

/** Strip control chars + cap length; never trust raw input. */
export function clean(value: unknown, maxLen = 500): string {
  if (typeof value !== "string") return ""
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLen)
}
