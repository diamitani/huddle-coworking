// Server component. Shows genuinely featured listings (operators on a
// paid Featured/Premium plan). With no featured listings yet, it renders
// an operator CTA instead of inventing "featured" content.
import Link from "next/link"
import { ArrowRight, MapPin, Sparkles, Megaphone } from "lucide-react"
import { getFeaturedSpaces } from "@/lib/directory-server"

export default function FeaturedSpaces() {
  const spaces = getFeaturedSpaces().slice(0, 6)

  return (
    <section className="py-20 sm:py-28 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
              Featured Spaces
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500">
              Featured Coworking Spaces
            </h2>
          </div>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:text-brand-700 transition-colors shrink-0"
          >
            View all spaces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {spaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-200 p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Megaphone className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-heading font-semibold text-navy-500 mb-2">
                Own a coworking space? Get it featured here.
              </h3>
              <p className="text-warm-700 text-sm leading-relaxed max-w-2xl">
                Featured listings get top placement in search results, a homepage
                spotlight, and priority in city pages. Claim your listing to get started.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-all"
              >
                See Plans <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/list-your-space"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-warm-200 text-navy-500 hover:bg-warm-50"
              >
                Claim Listing
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <Link
                key={space.slug}
                href={`/spaces/${space.slug}`}
                className="block group bg-white rounded-2xl border border-warm-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-warm-200">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=450&fit=crop"
                    alt={space.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-medium shadow-md">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-navy-500 group-hover:text-brand-600 transition-colors line-clamp-1 mb-1">
                    {space.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-warm-700 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{space.city}, {space.state}</span>
                  </div>
                  {space.description && (
                    <p className="text-sm text-warm-700 leading-relaxed line-clamp-2 mb-3">
                      {space.description}
                    </p>
                  )}
                  <div className="flex items-center justify-end pt-3 border-t border-warm-200">
                    <span className="text-xs text-brand-600 font-medium group-hover:underline">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
