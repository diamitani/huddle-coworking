// Lightweight first-party analytics: logs a pageview per navigation.
// No PII, no cookies, best-effort (never breaks the page).
"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || "" }),
    }).catch(() => {})
  }, [pathname])

  return null
}
