import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/directory"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dashboard", "/bookings"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
