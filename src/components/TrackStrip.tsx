// Three-track lens strip: HUDDLE (find people) / WORK (find space) /
// COLLABORATE (find programs) — one directory, three browse modes.
import Link from "next/link"
import { Users, Building2, GraduationCap, ArrowRight } from "lucide-react"

const tracks = [
  {
    key: "huddle",
    icon: Users,
    title: "Huddle",
    tagline: "Find people",
    description:
      "Networking events, mixers, panels, and pitch nights hosted at spaces. Empty rooms become gatherings.",
    href: "/spaces?mode=huddle",
  },
  {
    key: "work",
    icon: Building2,
    title: "Work",
    tagline: "Find space",
    description:
      "Desks, dedicated desks, private offices, day passes, and meeting rooms — with transparent pricing.",
    href: "/spaces?mode=work",
  },
  {
    key: "collaborate",
    icon: GraduationCap,
    title: "Collaborate",
    tagline: "Find programs",
    description:
      "Courses, workshops, open studios, and accelerators hosted at coworking spaces.",
    href: "/spaces?mode=collaborate",
  },
]

export default function TrackStrip() {
  return (
    <section className="py-16 sm:py-20 bg-white border-y border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy-500 mb-3">
            One directory, three ways in
          </h2>
          <p className="text-warm-700">
            Every space can play in all three — find your people, find your desk, find your program.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tracks.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              className="group bg-warm-100 rounded-2xl border border-warm-200 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:border-brand-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center mb-5">
                <t.icon className="w-6 h-6" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="text-xl font-heading font-bold text-navy-500">{t.title}</h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                  {t.tagline}
                </span>
              </div>
              <p className="text-sm text-warm-700 leading-relaxed mb-4">{t.description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 group-hover:gap-2.5 transition-all">
                Browse {t.title.toLowerCase()} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
