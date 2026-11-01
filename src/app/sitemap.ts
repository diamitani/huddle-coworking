import type { MetadataRoute } from "next"
import { getSpaces, getCities, SITE_URL } from "@/lib/directory-server"

const STATIC_ROUTES = [
  "",
  "/spaces",
  "/cities",
  "/pricing",
  "/list-your-space",
  "/about",
  "/faq",
  "/contact",
  "/blog",
]

export default function sitemap(): MetadataRoute.Sitemap {
  const spaces = getSpaces()
  const cities = getCities()

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...cities.map((city) => ({
      url: `${SITE_URL}/cities/${encodeURIComponent(city)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...spaces.map((s) => ({
      url: `${SITE_URL}/spaces/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: s.featured_tier !== "none" ? 0.9 : 0.6,
    })),
  ]
}
