"use client"

import { useState } from "react"
import { Check, ArrowRight, Building2, TrendingUp, Users, DollarSign, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/cn"

const benefits = [
  {
    icon: Users,
    title: "Reach 85K+ Members",
    description: "Get your space in front of thousands of professionals actively searching for coworking spaces.",
  },
  {
    icon: TrendingUp,
    title: "Increase Occupancy",
    description: "Fill your hot desks, meeting rooms, and event spaces with qualified leads ready to book.",
  },
  {
    icon: DollarSign,
    title: "Grow Revenue",
    description: "Convert directory traffic into paying members. Our Pro listings see 3x more inquiries.",
  },
  {
    icon: Building2,
    title: "Zero Setup Hassle",
    description: "Create your listing in minutes. No contracts, no commitments. Start with a free profile.",
  },
]

export default function ListYourSpacePage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
              List Your Space
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy-500 leading-tight mb-4">
              Put Your Coworking Space on the Map
            </h1>
            <p className="text-warm-700 text-lg leading-relaxed mb-8">
              Join 1,200+ spaces on the world&#39;s fastest-growing coworking directory. Get discovered by thousands of professionals looking for their next workspace.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="p-4 rounded-xl bg-white border border-warm-200">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-semibold text-navy-500 text-sm mb-1">{benefit.title}</h3>
                  <p className="text-xs text-warm-700 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-50 border border-accent-200">
              <Sparkles className="w-5 h-5 text-accent-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-navy-500 mb-0.5">Free to get started</div>
                <p className="text-xs text-warm-700">Create a basic listing at no cost. Upgrade to Pro or Premium when you&#39;re ready for more visibility.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-heading font-semibold text-navy-500 mb-2">Listing Request Submitted!</h2>
                <p className="text-sm text-warm-600 mb-6">
                  Thanks for your interest! Our team will review your submission and get back to you within 24 hours to set up your space profile.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-all"
                >
                  Back to Home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-heading font-semibold text-navy-500 mb-6">List Your Space</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-warm-700 mb-1.5">Space Name</label>
                      <input type="text" className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="e.g. The Assembly" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-warm-700 mb-1.5">Space Type</label>
                      <select className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500 bg-white">
                        <option>Open Coworking</option>
                        <option>Private Office</option>
                        <option>Coworking + Events</option>
                        <option>Creative Studio</option>
                        <option>Wellness Space</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">City</label>
                    <input type="text" className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="e.g. San Francisco" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Full Address</label>
                    <input type="text" className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="Street, city, state, zip" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Your Name</label>
                    <input type="text" className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Email</label>
                    <input type="email" className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="you@yourspace.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Phone</label>
                    <input type="tel" className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="(555) 000-0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Website (optional)</label>
                    <input type="url" className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="https://yourspace.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Short Description</label>
                    <textarea className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500 h-20 resize-none" placeholder="Tell us about your space..." />
                  </div>
                  <button
                    onClick={() => setSubmitted(true)}
                    className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 transition-all"
                  >
                    Submit Listing
                  </button>
                  <p className="text-xs text-warm-500 text-center">
                    Free to list. No obligation. Our team will review and activate your profile.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


