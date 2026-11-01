// Server component wrapper: SEO metadata, JSON-LD, canonical slug
// redirects. The interactive UI lives in SpaceDetailClient.
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getSpaces, getSpaceBySlug, SITE_URL } from "@/lib/directory-server"
import SpaceDetailClient from "./SpaceDetailClient"

export async function generateStaticParams() {
  return getSpaces().map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const found = getSpaceBySlug(slug)
  if (!found) return { title: "Space not found — Huddle" }
  const s = found.space
  const title = `${s.name} — Coworking Space in ${s.city}, ${s.state} | Huddle`
  const description =
    s.description ||
    `${s.name} is a coworking space in ${s.city}, ${s.state}. Request a tour or contact them directly on Huddle.`
  const canonical = `${SITE_URL}/spaces/${s.slug}`
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url: canonical,
      type: "website",
    },
  }
}

export default async function SpacePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const found = getSpaceBySlug(slug)
  if (!found) notFound()
  // Old slugify(name) URLs redirect to the stored canonical slug.
  if (!found.canonical) redirect(`/spaces/${found.space.slug}`)

  const space = found.space
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CoworkingSpace",
    name: space.name,
    url: `${SITE_URL}/spaces/${space.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: space.city,
      addressRegion: space.state,
      addressCountry: "US",
    },
  }
  if (space.website) jsonLd.sameAs = space.website
  if (space.phone) jsonLd.telephone = space.phone
  if (space.description) jsonLd.description = space.description
  if (space.latitude != null && space.longitude != null) {
    jsonLd.geo = { "@type": "GeoCoordinates", latitude: space.latitude, longitude: space.longitude }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpaceDetailClient space={space} />
    </>
  )
}
