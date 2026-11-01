// Server component: SEO metadata + JSON-LD for city pages.
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getCities, getSpacesByCity, SITE_URL } from "@/lib/directory-server"
import CityClient from "./CityClient"

export async function generateStaticParams() {
  return getCities().map((city) => ({ city }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>
}): Promise<Metadata> {
  const { city } = await params
  const cityName = decodeURIComponent(city)
  const spaces = getSpacesByCity(cityName)
  if (spaces.length === 0) return { title: "City not found — Huddle" }
  const title = `Coworking Spaces in ${cityName} — Compare & Tour | Huddle`
  const description = `Browse ${spaces.length} coworking spaces in ${cityName}. Request tours, compare amenities, and contact spaces directly — no account needed.`
  const canonical = `${SITE_URL}/cities/${encodeURIComponent(cityName)}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  }
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const cityName = decodeURIComponent(city)
  const spaces = getSpacesByCity(cityName)
  if (spaces.length === 0) notFound()

  const tierRank = (t: string) => (t === "premium" ? 2 : t === "featured" ? 1 : 0)
  const sorted = [...spaces].sort(
    (a, b) => tierRank(b.featured_tier) - tierRank(a.featured_tier) || a.name.localeCompare(b.name)
  )

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Coworking spaces in ${cityName}`,
    itemListElement: sorted.slice(0, 50).map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/spaces/${s.slug}`,
      name: s.name,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CityClient city={cityName} spaces={sorted} />
    </>
  )
}
