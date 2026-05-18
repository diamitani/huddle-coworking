"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Freelance Designer",
    avatar: "SC",
    space: "Found via Huddle at The Assembly",
    content: "Huddle made it incredibly easy to find a workspace near my apartment in Manhattan. I visited three spaces, loved The Assembly, and had a membership within 24 hours. Game changer for my freelance work.",
    rating: 5,
  },
  {
    name: "Marcus Williams",
    role: "Startup Founder",
    avatar: "MW",
    space: "Member at Nexus Workspace",
    content: "As a first-time founder, I needed a professional space to meet investors and build my team. Huddle helped me find Nexus Workspace in SF — the community here is incredible. I've met two co-founders and three early customers.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Remote Team Lead",
    avatar: "ER",
    space: "Booked through Huddle",
    content: "I manage a distributed team and needed to find spaces for our quarterly offsite in 5 different cities. Huddle made it possible to compare, book, and coordinate everything from one dashboard. Our team loved every space.",
    rating: 5,
  },
  {
    name: "James Park",
    role: "Digital Nomad",
    avatar: "JP",
    space: "Used Huddle in 12 cities",
    content: "I've been traveling across the US for the past 8 months and Huddle has been my go-to for finding workspaces everywhere from Austin to Portland. The filters for wifi quality and meeting rooms are spot-on.",
    rating: 4,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500 mb-4">
            Loved by Thousands of Members
          </h2>
          <p className="text-warm-700 text-lg leading-relaxed">
            Here&#39;s what our community says about finding their workspace through Huddle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-warm-200 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-100" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < t.rating ? "text-accent-500 fill-accent-500" : "text-warm-200"}`}
                  />
                ))}
              </div>
              <p className="text-navy-500 leading-relaxed mb-5">&ldquo;{t.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 text-sm font-semibold flex items-center justify-center">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-navy-500">{t.name}</div>
                  <div className="text-xs text-warm-600">{t.role} &middot; {t.space}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
