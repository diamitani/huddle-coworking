// /pricing — plans for space owners. Featured $49/mo, Premium $99/mo.
// Online checkout is gated on Stripe activation (Patrick's tap): the CTA
// opens a waitlist modal that stores the request durably. No fake checkout.
"use client"

import { useState } from "react"
import { Check, ArrowRight, Sparkles, X, BadgeCheck } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/cn"

interface Plan {
  name: string
  price: number
  tier: "free" | "featured" | "premium"
  description: string
  features: string[]
  cta: string
  popular: boolean
}

const plans: Plan[] = [
  {
    name: "Free Listing",
    price: 0,
    tier: "free",
    description: "Get discovered. Every real coworking space belongs here.",
    features: [
      "Directory listing with your details",
      "Appear in search & city pages",
      "Tour-request inquiries forwarded to you",
      "Claim-your-listing verification",
    ],
    cta: "Claim Your Listing",
    popular: false,
  },
  {
    name: "Featured",
    price: 49,
    tier: "featured",
    description: "Stand out where workspace seekers are looking.",
    features: [
      "Everything in Free Listing",
      "Featured badge on your listing",
      "Top placement in search results",
      "Homepage spotlight rotation",
      "Priority placement on your city page",
    ],
    cta: "Choose Featured",
    popular: true,
  },
  {
    name: "Premium",
    price: 99,
    tier: "premium",
    description: "Maximum visibility across the directory.",
    features: [
      "Everything in Featured",
      "Top homepage featured slot",
      "City-page banner placement",
      "Quarterly performance report",
      "Dedicated support",
    ],
    cta: "Choose Premium",
    popular: false,
  },
]

function WaitlistModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [spaceName, setSpaceName] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Please add your name and email.")
      return
    }
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "featured_waitlist",
          tier: plan.tier,
          name: name.trim(),
          email: email.trim(),
          space_name: spaceName.trim(),
          company_website: "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to join waitlist")
      setDone(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-warm-100 rounded-xl" aria-label="Close">
          <X className="w-5 h-5" />
        </button>
        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-navy-500 mb-2">You&apos;re on the list!</h3>
            <p className="text-sm text-warm-600">
              We&apos;ll email you the moment {plan.name} checkout opens.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-heading font-semibold text-navy-500 mb-2">
              {plan.name} — ${plan.price}/mo
            </h3>
            <p className="text-sm text-warm-600 mb-6">
              Online checkout is opening soon. Join the waitlist and we&apos;ll notify you
              the moment you can activate {plan.name} for your space.
            </p>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1.5">Your Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="jane@yourspace.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1.5">Space Name (optional)</label>
                <input value={spaceName} onChange={(e) => setSpaceName(e.target.value)} className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500" placeholder="Your coworking space" />
              </div>
              <button
                onClick={submit}
                disabled={sending}
                className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                {sending ? "Joining..." : "Notify Me"}
              </button>
              <p className="text-xs text-warm-500 text-center">No payment taken today.</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [waitlistPlan, setWaitlistPlan] = useState<Plan | null>(null)

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
            For Space Owners
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500 mb-4">
            Put Your Space in Front of Workspace Seekers
          </h1>
          <p className="text-warm-700 text-lg leading-relaxed">
            Free to be listed. Upgrade when you want more visibility and more tours booked.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
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
              {plan.tier === "free" ? (
                <Link
                  href="/list-your-space"
                  className="block text-center w-full rounded-xl py-3.5 text-sm font-semibold bg-warm-100 text-navy-500 hover:bg-warm-200 transition-all"
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={() => setWaitlistPlan(plan)}
                  className={cn(
                    "w-full rounded-xl py-3.5 text-sm font-semibold transition-all",
                    plan.popular
                      ? "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-200"
                      : "bg-warm-100 text-navy-500 hover:bg-warm-200"
                  )}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-5xl mx-auto flex items-start gap-3 p-4 rounded-xl bg-white border border-warm-200">
          <BadgeCheck className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <p className="text-sm text-warm-700">
            <strong className="text-navy-500">Checkout opening soon.</strong> Paid plans are
            announced here first — join the waitlist on any plan and we&apos;ll email you the
            moment online checkout goes live. No payment is taken today.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto bg-white rounded-2xl border border-warm-200 p-8 text-center">
          <h2 className="text-xl font-heading font-semibold text-navy-500 mb-3">
            Questions about featured listings?
          </h2>
          <p className="text-warm-700 text-sm mb-6">
            Claim your listing first — it&apos;s free — and we&apos;ll walk you through the options.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/list-your-space" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600 transition-all">
              Claim Your Listing <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border border-warm-200 text-navy-500 hover:bg-warm-50"
            >
              Browse Spaces
            </Link>
          </div>
        </div>
      </div>

      {waitlistPlan && (
        <WaitlistModal plan={waitlistPlan} onClose={() => setWaitlistPlan(null)} />
      )}
    </div>
  )
}
