import Link from "next/link"
import { MapPin, Building2, Globe, BadgeDollarSign } from "lucide-react"
import { getStats } from "@/lib/directory-server"

export default function AboutPage() {
  const stats = getStats()
  const statItems = [
    { label: "Spaces Listed", value: stats.totalSpaces.toLocaleString() },
    { label: "Cities Covered", value: String(stats.totalCities) },
    { label: "States", value: String(stats.totalStates) },
    { label: "Cost to Browse", value: "Free" },
  ]

  return (
    <main className="min-h-screen bg-warm-50">
      <section className="bg-navy-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-heading font-bold mb-4">About Huddle</h1>
          <p className="text-warm-200 text-lg max-w-2xl mx-auto">
            We&apos;re building the world&apos;s most comprehensive coworking space directory —
            a collaboration platform where startups find spaces, remote teams book desks for
            their people, and spaces sell events and grow their communities.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statItems.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-heading font-bold text-navy-500">{s.value}</div>
                <div className="text-sm text-warm-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold text-navy-500 mb-4">Our Mission</h2>
              <p className="text-warm-600 leading-relaxed mb-4">
                Finding a great coworking space shouldn&apos;t be hard — and pricing shouldn&apos;t
                be a mystery. Huddle lists real spaces with real details: published rates where
                they exist, an honest &ldquo;pricing not listed&rdquo; state where they don&apos;t,
                and a direct line to every space. No account needed to request a tour.
              </p>
              <p className="text-warm-600 leading-relaxed">
                For space operators, Huddle is a growth channel: claim your listing, publish
                your rates and events, and turn directory traffic into tours and members.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Building2, label: "Real Listings", desc: "Checked against real sources — report an error and we'll fix it" },
                { icon: BadgeDollarSign, label: "Pricing Transparency", desc: "Published rates where they exist, honest gaps where they don't" },
                { icon: Globe, label: "US Coverage", desc: `${stats.totalCities} cities and growing` },
                { icon: MapPin, label: "City Guides", desc: "Browse coworking by city, compare, and tour" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-warm-100">
                  <Icon className="w-6 h-6 text-brand-500 mb-2" />
                  <div className="font-semibold text-navy-500 text-sm">{label}</div>
                  <div className="text-xs text-warm-500 mt-1">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-heading font-bold text-navy-500 mb-4">Own a coworking space?</h2>
          <p className="text-warm-600 mb-6">Claim your free listing, publish your rates, and turn seekers into tours.</p>
          <Link href="/list-your-space" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
            List Your Space — It&apos;s Free
          </Link>
        </div>
      </section>
    </main>
  )
}
