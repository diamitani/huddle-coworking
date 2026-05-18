"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const perks = [
  "Search 1,200+ verified coworking spaces",
  "Compare pricing, amenities, and reviews",
  "Book day passes and meeting rooms",
  "Save favorite spaces for later",
  "Get exclusive member discounts",
]

export default function MembershipCTA() {
  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-brand-500 to-brand-700 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 75% 25%, white 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Join the #1 Coworking Community
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8">
            Create a free account and start exploring. No credit card required.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-10 text-left">
            {perks.map((perk) => (
              <div key={perk} className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-white/80 shrink-0 mt-0.5" />
                <span className="text-sm text-white/90">{perk}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 bg-white text-brand-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-warm-100 transition-all hover:scale-[1.02] shadow-xl shadow-black/10"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white px-8 py-3.5 rounded-xl font-medium border border-white/20 hover:bg-white/10 transition-all"
            >
              Browse Spaces
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
