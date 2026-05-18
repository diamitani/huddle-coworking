"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/cn"

const userPlans = [
  {
    name: "Free",
    price: 0,
    description: "Get started with basic search and discovery.",
    features: [
      "Search 1,200+ coworking spaces",
      "View basic space details",
      "Save up to 5 favorites",
      "Monthly newsletter",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: 9,
    description: "For professionals who want the full experience.",
    features: [
      "Everything in Free",
      "Unlimited saved spaces",
      "Book day passes & rooms",
      "Member reviews & photos",
      "Exclusive member discounts",
      "Priority support",
    ],
    cta: "Start Pro Free Trial",
    popular: true,
  },
  {
    name: "Business",
    price: 29,
    description: "For teams managing multiple members and spaces.",
    features: [
      "Everything in Pro",
      "Team management dashboard",
      "Bulk booking & billing",
      "Analytics & reporting",
      "Dedicated account manager",
      "API access",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

const spaceOwnerPlans = [
  {
    name: "Free Listing",
    price: 0,
    description: "List your space and get discovered.",
    features: [
      "Basic space profile",
      "Up to 5 photos",
      "Member inquiries",
      "Basic analytics",
    ],
    cta: "List Your Space",
    popular: false,
  },
  {
    name: "Pro Listing",
    price: 49,
    description: "Premium visibility and lead generation tools.",
    features: [
      "Everything in Free",
      "Featured placement",
      "Unlimited photos & virtual tour",
      "Priority in search results",
      "Detailed analytics",
      "Promote events & offers",
      "Dedicated support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Premium",
    price: 149,
    description: "Maximum visibility and full platform integration.",
    features: [
      "Everything in Pro",
      "Homepage featured slot",
      "Verified badge",
      "Direct booking integration",
      "API & CRM integration",
      "Custom branded profile",
      "Account manager",
      "Priority support 24/7",
    ],
    cta: "Go Premium",
    popular: false,
  },
]

function PricingCard({ plan }: { plan: typeof userPlans[0] }) {
  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-black/5",
        plan.popular
          ? "border-brand-500 shadow-lg shadow-brand-100 scale-[1.02] sm:scale-105 z-10"
          : "border-warm-200"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-brand-500 text-white text-xs font-semibold shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            Most Popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold text-navy-500 mb-1">{plan.name}</h3>
        <p className="text-sm text-warm-600 mb-4">{plan.description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-bold text-navy-500">
            {plan.price === 0 ? "Free" : `$${plan.price}`}
          </span>
          {plan.price > 0 && <span className="text-sm text-warm-600">/mo</span>}
        </div>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm text-warm-700">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={cn(
          "w-full rounded-xl py-3.5 text-sm font-semibold transition-all",
          plan.popular
            ? "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-200"
            : "bg-warm-100 text-navy-500 hover:bg-warm-200"
        )}
      >
        {plan.cta}
      </button>
    </div>
  )
}

export default function MembershipPage() {
  const [tab, setTab] = useState<"user" | "owner">("user")

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
            Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500 mb-4">
            Plans for Every Workspace Need
          </h1>
          <p className="text-warm-700 text-lg leading-relaxed">
            Whether you&#39;re finding a space or listing one, we have a plan that fits.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setTab("user")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
              tab === "user" ? "bg-navy-500 text-white shadow-lg" : "bg-white text-navy-500 border border-warm-200 hover:border-brand-200"
            )}
          >
            For Members
          </button>
          <button
            onClick={() => setTab("owner")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
              tab === "owner" ? "bg-navy-500 text-white shadow-lg" : "bg-white text-navy-500 border border-warm-200 hover:border-brand-200"
            )}
          >
            For Space Owners
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(tab === "user" ? userPlans : spaceOwnerPlans).map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-2xl border border-warm-200 p-8 text-center">
          <h2 className="text-xl font-heading font-semibold text-navy-500 mb-3">
            Questions about our plans?
          </h2>
          <p className="text-warm-700 text-sm mb-6">
            We&#39;re here to help you find the right plan for your needs. Chat with our team or browse our FAQ.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="mailto:hello@huddle.work" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-all">
              Contact Us <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-warm-200 text-navy-500 hover:bg-warm-50"
            >
              Browse Spaces
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
