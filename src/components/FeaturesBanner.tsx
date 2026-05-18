"use client"

import { motion } from "framer-motion"
import { Search, Shield, Zap, Globe, Heart, Star } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Smart Search & Filters",
    description: "Find exactly what you need with powerful filters for amenities, pricing, space type, location, and more.",
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description: "Every space is manually verified. Real photos, accurate pricing, and genuine member reviews ensure transparency.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Book day passes, meeting rooms, or event spaces in real-time. No back-and-forth — just click and confirm.",
  },
  {
    icon: Globe,
    title: "Nationwide Coverage",
    description: "From NYC to San Francisco, Austin to Miami — find coworking spaces in 50+ cities across the United States.",
  },
  {
    icon: Heart,
    title: "Curated Collections",
    description: "Handpicked playlists of the best spaces for specific needs — quiet work, networking, creative studios, and more.",
  },
  {
    icon: Star,
    title: "Member Perks",
    description: "Exclusive discounts, community events, and special offers available only to Huddle members.",
  },
]

export default function FeaturesBanner() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-50 text-accent-600 text-xs font-semibold uppercase tracking-wider mb-4">
            Why Huddle
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500 mb-4">
            Everything You Need to Find the Perfect Space
          </h2>
          <p className="text-warm-700 text-lg leading-relaxed">
            We&#39;ve built the most comprehensive coworking directory platform. Here&#39;s what sets us apart.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="p-6 rounded-2xl border border-warm-200 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50/50 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-navy-500 mb-2">{feature.title}</h3>
              <p className="text-sm text-warm-700 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
