// /list-your-space — claim an existing listing or submit a new space.
// Both flows POST to /api/claims and land in the operator's lead inbox.
"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Check, ArrowRight, Building2, TrendingUp, Users, Search, MapPin } from "lucide-react"
import { cn } from "@/lib/cn"

const benefits = [
  {
    icon: Users,
    title: "Get Discovered",
    description: "Put your space in front of professionals actively searching for coworking near you.",
  },
  {
    icon: TrendingUp,
    title: "Fill Your Space",
    description: "Receive tour requests and membership inquiries directly — no middleman, no commission.",
  },
  {
    icon: Building2,
    title: "Control Your Profile",
    description: "Claiming lets you correct details, add your real amenities, and link your booking page.",
  },
]

interface SearchHit {
  name: string
  city: string
  state: string
  slug: string
}

function inputCls() {
  return "w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500"
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-warm-700 mb-1.5">
        {label} {optional && <span className="font-normal text-warm-500">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

function ClaimFlow({ preselectedSlug }: { preselectedSlug: string }) {
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SearchHit | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [proof, setProof] = useState("")
  const [price, setPrice] = useState({
    day_pass: "", hot_desk_monthly: "", dedicated_desk_monthly: "",
    private_office_monthly: "", meeting_room_hourly: "",
  })
  const [access, setAccess] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [eventSpace, setEventSpace] = useState(false)
  const [eventCapacity, setEventCapacity] = useState("")
  const [upcomingKind, setUpcomingKind] = useState<"event" | "program" | "">("")
  const [upcomingTitle, setUpcomingTitle] = useState("")
  const [upcomingSchedule, setUpcomingSchedule] = useState("")
  const [upcomingPrice, setUpcomingPrice] = useState("")
  const [upcomingUrl, setUpcomingUrl] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const SERVICE_OPTIONS = [
    ["mail_handling", "Mail Handling"],
    ["virtual_office", "Virtual Office"],
    ["event_hosting", "Event Hosting"],
    ["meeting_rooms", "Meeting Rooms"],
    ["phone_booth", "Phone Booths"],
    ["wellness", "Wellness"],
    ["podcast_studio", "Podcast Studio"],
  ] as const

  useEffect(() => {
    if (!preselectedSlug) return
    fetch(`/api/spaces/${encodeURIComponent(preselectedSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s) setSelected({ name: s.name, city: s.city, state: s.state, slug: s.slug || preselectedSlug })
      })
      .catch(() => {})
  }, [preselectedSlug])

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/spaces?q=${encodeURIComponent(query.trim())}&limit=8`)
      const data = await res.json()
      setHits(data.results || [])
    } catch {
      setHits([])
    } finally {
      setSearching(false)
    }
  }

  const submit = async () => {
    if (!selected || !name.trim() || !email.trim()) {
      setError("Select your space and add your name and email.")
      return
    }
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "claim",
          space_name: selected.name,
          space_slug: selected.slug,
          space_city: selected.city,
          space_state: selected.state,
          claimant_name: name.trim(),
          claimant_email: email.trim(),
          claimant_phone: phone.trim(),
          claimant_role: role.trim(),
          proof_url: proof.trim(),
          pricing: {
            day_pass: num(price.day_pass),
            hot_desk_monthly: num(price.hot_desk_monthly),
            dedicated_desk_monthly: num(price.dedicated_desk_monthly),
            private_office_monthly: num(price.private_office_monthly),
            meeting_room_hourly: num(price.meeting_room_hourly),
          },
          hours: access ? { access } : null,
          services,
          event_space: eventSpace
            ? { available: true, capacity: num(eventCapacity) }
            : null,
          upcoming: upcomingKind && upcomingTitle.trim()
            ? {
                kind: upcomingKind,
                title: upcomingTitle.trim(),
                schedule: upcomingSchedule.trim() || null,
                price: upcomingPrice.trim() || null,
                url: upcomingUrl.trim() || null,
              }
            : null,
          company_website: "",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setDone(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  const num = (v: string) => {
    const n = parseFloat(v)
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-heading font-semibold text-navy-500 mb-2">Claim Request Received</h2>
        <p className="text-sm text-warm-600 mb-6 max-w-sm mx-auto">
          We&apos;ll verify your affiliation with <strong>{selected?.name}</strong> and email you
          within 2 business days.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600">
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-semibold text-navy-500">Claim Your Listing</h2>
      {!selected ? (
        <>
          <p className="text-sm text-warm-600">Search for your space to get started.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Space name or city..."
                className={cn(inputCls(), "pl-11")}
              />
            </div>
            <button onClick={search} disabled={searching} className="px-5 rounded-xl bg-navy-500 text-white text-sm font-semibold hover:bg-navy-600 disabled:opacity-50">
              {searching ? "..." : "Search"}
            </button>
          </div>
          {hits.length > 0 && (
            <div className="border border-warm-200 rounded-xl divide-y divide-warm-100 max-h-64 overflow-y-auto">
              {hits.map((h) => (
                <button
                  key={h.slug}
                  onClick={() => setSelected(h)}
                  className="w-full text-left px-4 py-3 hover:bg-warm-50 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-warm-400 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium text-navy-500">{h.name}</span>
                    <span className="block text-xs text-warm-600">{h.city}, {h.state}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="p-4 rounded-xl bg-warm-50 flex items-center justify-between">
            <div>
              <div className="font-semibold text-navy-500 text-sm">{selected.name}</div>
              <div className="text-xs text-warm-600">{selected.city}, {selected.state}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-brand-600 hover:underline">
              Change
            </button>
          </div>
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Your Name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls()} placeholder="Jane Doe" /></Field>
            <Field label="Your Role" optional><input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls()} placeholder="Owner, Manager..." /></Field>
          </div>
          <Field label="Work Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls()} placeholder="jane@yourspace.com" /></Field>
          <Field label="Phone" optional><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls()} placeholder="(555) 000-0000" /></Field>
          <Field label="Proof of affiliation (URL)" optional>
            <input value={proof} onChange={(e) => setProof(e.target.value)} className={inputCls()} placeholder="https://yourspace.com/team" />
          </Field>
          <p className="text-xs text-warm-500">A link showing you&apos;re affiliated with the space (team page, LinkedIn, etc.) speeds up verification.</p>

          <div className="pt-2 border-t border-warm-100">
            <div className="text-sm font-semibold text-navy-500 mt-4 mb-1">Your pricing <span className="font-normal text-warm-500">(optional)</span></div>
            <p className="text-xs text-warm-600 mb-4">Listing your rates helps seekers compare — and pricing questions route straight to you. Rates show as &ldquo;provided by the space&rdquo;.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <Field label="Day Pass $"><input inputMode="numeric" value={price.day_pass} onChange={(e) => setPrice({ ...price, day_pass: e.target.value })} className={inputCls()} placeholder="35" /></Field>
              <Field label="Hot Desk $/mo"><input inputMode="numeric" value={price.hot_desk_monthly} onChange={(e) => setPrice({ ...price, hot_desk_monthly: e.target.value })} className={inputCls()} placeholder="299" /></Field>
              <Field label="Dedicated $/mo"><input inputMode="numeric" value={price.dedicated_desk_monthly} onChange={(e) => setPrice({ ...price, dedicated_desk_monthly: e.target.value })} className={inputCls()} placeholder="549" /></Field>
              <Field label="Private Office $/mo"><input inputMode="numeric" value={price.private_office_monthly} onChange={(e) => setPrice({ ...price, private_office_monthly: e.target.value })} className={inputCls()} placeholder="899" /></Field>
              <Field label="Meeting Room $/hr"><input inputMode="numeric" value={price.meeting_room_hourly} onChange={(e) => setPrice({ ...price, meeting_room_hourly: e.target.value })} className={inputCls()} placeholder="75" /></Field>
              <Field label="Access Hours">
                <select value={access} onChange={(e) => setAccess(e.target.value)} className={cn(inputCls(), "bg-white")}>
                  <option value="">Select...</option>
                  <option value="24/7">24/7 access</option>
                  <option value="extended">Extended hours</option>
                  <option value="business_hours">Business hours</option>
                </select>
              </Field>
            </div>
            <div className="text-xs font-semibold text-warm-700 mb-2">Services offered</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {SERVICE_OPTIONS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setServices((s) => s.includes(key) ? s.filter((x) => x !== key) : [...s, key])}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    services.includes(key)
                      ? "bg-brand-500 text-white border-brand-500"
                      : "bg-white text-navy-500 border-warm-200 hover:border-brand-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <button
                type="button"
                role="switch"
                aria-checked={eventSpace}
                onClick={() => setEventSpace((v) => !v)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  eventSpace ? "bg-brand-500" : "bg-warm-200"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all",
                  eventSpace ? "left-[22px]" : "left-0.5"
                )} />
              </button>
              <span className="text-sm text-navy-500 font-medium">We have bookable event space</span>
              {eventSpace && (
                <input
                  inputMode="numeric"
                  value={eventCapacity}
                  onChange={(e) => setEventCapacity(e.target.value)}
                  placeholder="Capacity"
                  className="w-28 rounded-xl border border-warm-200 px-3 py-1.5 text-sm text-navy-500"
                />
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-warm-100">
            <div className="text-sm font-semibold text-navy-500 mt-4 mb-1">Upcoming event or program <span className="font-normal text-warm-500">(optional)</span></div>
            <p className="text-xs text-warm-600 mb-4">Hosting a mixer, workshop, or course? List it here and it appears on your page — this is how you show up in Huddle and Collaborate.</p>
            <div className="flex gap-2 mb-3">
              {(["event", "program"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setUpcomingKind(upcomingKind === k ? "" : k)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-medium border transition-all",
                    upcomingKind === k
                      ? "bg-navy-500 text-white border-navy-500"
                      : "bg-white text-navy-500 border-warm-200 hover:border-brand-200"
                  )}
                >
                  {k === "event" ? "Public event" : "Program / workshop"}
                </button>
              ))}
            </div>
            {upcomingKind && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={upcomingTitle}
                  onChange={(e) => setUpcomingTitle(e.target.value)}
                  placeholder="Title (e.g. Founder Friday Mixer)"
                  className="rounded-xl border border-warm-200 px-3.5 py-2.5 text-sm text-navy-500"
                />
                <input
                  value={upcomingSchedule}
                  onChange={(e) => setUpcomingSchedule(e.target.value)}
                  placeholder="Schedule (e.g. First Fridays, 6pm)"
                  className="rounded-xl border border-warm-200 px-3.5 py-2.5 text-sm text-navy-500"
                />
                <input
                  value={upcomingPrice}
                  onChange={(e) => setUpcomingPrice(e.target.value)}
                  placeholder="Ticket / price info (e.g. Free, $20)"
                  className="rounded-xl border border-warm-200 px-3.5 py-2.5 text-sm text-navy-500"
                />
                <input
                  value={upcomingUrl}
                  onChange={(e) => setUpcomingUrl(e.target.value)}
                  placeholder="Event / program URL"
                  className="rounded-xl border border-warm-200 px-3.5 py-2.5 text-sm text-navy-500"
                />
              </div>
            )}
          </div>

          <button onClick={submit} disabled={sending} className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 disabled:opacity-50">
            {sending ? "Submitting..." : "Submit Claim Request"}
          </button>
        </>
      )}
    </div>
  )
}

function NewListingFlow() {
  const [form, setForm] = useState({
    space_name: "", city: "", state: "", address: "", website: "",
    phone: "", email: "", description: "", submitter_name: "", submitter_email: "",
  })
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.space_name.trim() || !form.submitter_name.trim() || !form.submitter_email.trim()) {
      setError("Please add the space name, your name, and your email.")
      return
    }
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "listing", ...form, company_website: "" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setDone(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-heading font-semibold text-navy-500 mb-2">Listing Submitted!</h2>
        <p className="text-sm text-warm-600 mb-6 max-w-sm mx-auto">
          Thanks! Our team reviews every submission for accuracy before it goes live —
          usually within 2 business days.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600">
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-semibold text-navy-500">Submit a New Space</h2>
      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <Field label="Space Name"><input value={form.space_name} onChange={set("space_name")} className={inputCls()} placeholder="e.g. The Foundry Coworking" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City"><input value={form.city} onChange={set("city")} className={inputCls()} placeholder="Austin" /></Field>
        <Field label="State"><input value={form.state} onChange={set("state")} className={inputCls()} placeholder="TX" /></Field>
      </div>
      <Field label="Street Address" optional><input value={form.address} onChange={set("address")} className={inputCls()} placeholder="123 Main St" /></Field>
      <Field label="Website" optional><input value={form.website} onChange={set("website")} className={inputCls()} placeholder="https://..." /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone" optional><input value={form.phone} onChange={set("phone")} className={inputCls()} placeholder="(555) 000-0000" /></Field>
        <Field label="Contact Email" optional><input value={form.email} onChange={set("email")} className={inputCls()} placeholder="hello@space.com" /></Field>
      </div>
      <Field label="Short Description" optional>
        <textarea value={form.description} onChange={set("description")} className={cn(inputCls(), "h-20 resize-none")} placeholder="What makes this space great? (In your own words — no marketing fluff needed.)" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Your Name"><input value={form.submitter_name} onChange={set("submitter_name")} className={inputCls()} placeholder="Jane Doe" /></Field>
        <Field label="Your Email"><input type="email" value={form.submitter_email} onChange={set("submitter_email")} className={inputCls()} placeholder="jane@yourspace.com" /></Field>
      </div>
      <button onClick={submit} disabled={sending} className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 disabled:opacity-50">
        {sending ? "Submitting..." : "Submit for Review"}
      </button>
      <p className="text-xs text-warm-500 text-center">Free to list. Every submission is reviewed for accuracy before publishing.</p>
    </div>
  )
}

function PageInner() {
  const searchParams = useSearchParams()
  const claimSlug = searchParams.get("claim") || ""
  const [mode, setMode] = useState<"claim" | "new">(claimSlug ? "claim" : "claim")

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wider mb-4">
              For Space Owners
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy-500 leading-tight mb-4">
              Put Your Coworking Space on the Map
            </h1>
            <p className="text-warm-700 text-lg leading-relaxed mb-8">
              Already listed? Claim your profile to keep it accurate. New here? Submit your
              space — it&apos;s free, and every listing is reviewed before it goes live.
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

            <div className="p-4 rounded-xl bg-white border border-warm-200">
              <div className="text-sm font-semibold text-navy-500 mb-1">Want more visibility?</div>
              <p className="text-xs text-warm-700 mb-3">Featured listings get top placement, a homepage spotlight, and a featured badge.</p>
              <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700">
                See Featured plans <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8 shadow-sm">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setMode("claim")}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  mode === "claim" ? "bg-navy-500 text-white" : "bg-warm-100 text-navy-500 hover:bg-warm-200"
                )}
              >
                Claim Existing
              </button>
              <button
                onClick={() => setMode("new")}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  mode === "new" ? "bg-navy-500 text-white" : "bg-warm-100 text-navy-500 hover:bg-warm-200"
                )}
              >
                Submit New Space
              </button>
            </div>
            {mode === "claim" ? <ClaimFlow preselectedSlug={claimSlug} /> : <NewListingFlow />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ListYourSpacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 bg-warm-100" />}>
      <PageInner />
    </Suspense>
  )
}
