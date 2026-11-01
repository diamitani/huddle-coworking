import { NextRequest, NextResponse } from "next/server"
import { getSpaceBySlug } from "@/lib/directory-server"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  // Match on stored unique slug; fall back to legacy slugify(name) so old
  // URLs keep working (the page redirects them to the canonical slug).
  const found = getSpaceBySlug(slug)

  if (!found) {
    return NextResponse.json({ error: "Space not found" }, { status: 404 })
  }

  return NextResponse.json({ ...found.space, canonical_slug: found.space.slug })
}
