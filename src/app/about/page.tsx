import Link from "next/link"
import { MapPin, Users, Building2, Globe } from "lucide-react"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

const stats = [
  { label: "Spaces Listed", value: "1,073" },
  { label: "Cities Covered", value: "476" },
  { label: "States + DC", value: "43" },
  { label: "Cost to Browse", value: "Free" },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
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
              The world&#39;s #1 coworking space directory — helping professionals find and book the perfect workspace wherever they are.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
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
                  Huddle was built to solve a simple problem: finding a great coworking space shouldn&#39;t be hard. We aggregate thousands of verified listings, real amenities data, and direct booking options so you can find your ideal workspace in minutes.
                </p>
                <p className="text-warm-600 leading-relaxed">
                  Whether you&#39;re a freelancer looking for a desk for the day, a startup needing a dedicated office, or a remote worker exploring a new city — Huddle has you covered.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, label: "Verified Listings", desc: "Every space is reviewed and confirmed" },
                  { icon: Globe, label: "Nationwide Coverage", desc: "Spaces in 42 states plus Washington, DC" },
                  { icon: Users, label: "Direct Contact", desc: "Inquire with space operators right from their listing" },
                  { icon: MapPin, label: "City Guides", desc: "Explore coworking in 476 cities" },
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
            <h2 className="text-2xl font-heading font-bold text-navy-500 mb-4">Want to list your space?</h2>
            <p className="text-warm-600 mb-6">Join 1,073 spaces already on Huddle and reach thousands of professionals looking for workspace.</p>
            <Link href="/list-your-space" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-colors">
              List Your Space
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
