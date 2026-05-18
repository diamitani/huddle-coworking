"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import SpaceCard from "./SpaceCard"
import { getFeaturedSpaces } from "@/data/spaces"

export default function FeaturedSpaces() {
  const featured = getFeaturedSpaces().slice(0, 6)

  return (
    <section className="py-20 sm:py-28 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
              Featured Spaces
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500">
              Top-Rated Coworking Spaces
            </h2>
          </div>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:text-brand-700 transition-colors shrink-0"
          >
            View all spaces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((space, i) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <SpaceCard space={space} featured />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
