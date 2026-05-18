"use client"

import { Search, Eye, Calendar, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Browse hundreds of coworking spaces across the US. Filter by city, amenities, pricing, and space type to find your perfect match.",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: Eye,
    title: "Compare & Explore",
    description: "View detailed profiles with photos, amenities, pricing plans, member reviews, and virtual tours to make an informed decision.",
    color: "bg-accent-50 text-accent-600",
  },
  {
    icon: Calendar,
    title: "Apply & Book",
    description: "Apply for membership, book a day pass, reserve a meeting room, or schedule a tour — all directly through the platform.",
    color: "bg-navy-50 text-navy-500",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500 mb-4">
            From Search to Workspace in Three Steps
          </h2>
          <p className="text-warm-700 text-lg leading-relaxed">
            Whether you need a hot desk for the day or a private office for your team, Huddle makes it effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative text-center"
            >
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${step.color}`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shadow-lg shadow-brand-200">
                  {i + 1}
                </div>
                <h3 className="text-xl font-heading font-semibold text-navy-500 mb-2">{step.title}</h3>
                <p className="text-warm-700 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-4 text-warm-300">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link
            href="/spaces"
            className="inline-flex items-center gap-2 bg-navy-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-navy-600 transition-all hover:scale-[1.02]"
          >
            Browse All Spaces
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
