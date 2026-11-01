// Client UI for a listing detail page. Receives the space record as a prop
// from the server component (SEO-friendly); inquiry form posts anonymously
// to /api/leads — no login required.
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  MapPin, ChevronLeft,
  Phone, Globe, Check, ArrowRight,
  Building2, Heart, Share2, X, Send, BadgeCheck, Sparkles
} from "lucide-react"
import { isSaved, toggleSaved } from "@/lib/saved"
import type { Space } from "@/lib/directory"

type Step = "plan" | "details" | "confirm"

const INQUIRY_TYPES = [
  { value: "tour", label: "Request a tour" },
  { value: "membership", label: "Send membership inquiry" },
  { value: "pricing", label: "Ask about pricing" },
  { value: "event", label: "Book an event" },
]

const TIER_LABELS: Record<string, string> = {
  day_pass: "Day Pass",
  hot_desk: "Hot Desk",
  dedicated_desk: "Dedicated Desk",
  private_office: "Private Office",
  night_access: "Night Access",
  virtual_office: "Virtual Office",
  meeting_rooms: "Meeting Rooms",
}

const SERVICE_LABELS: Record<string, string> = {
  mail_handling: "Mail Handling",
  virtual_office: "Virtual Office",
  event_hosting: "Event Hosting",
  meeting_rooms: "Meeting Rooms",
  phone_booth: "Phone Booths",
  wellness: "Wellness",
  childcare: "Childcare",
  podcast_studio: "Podcast Studio",
}

function fmtUSD(n: number): string {
  return "$" + n.toLocaleString("en-US")
}

function PricingSection({ space, onRequestInfo }: { space: Space; onRequestInfo: () => void }) {
  const p = space.pricing
  const rates: { label: string; value: number | null | undefined; suffix: string; startingAt?: boolean }[] = p
    ? [
        { label: "Day Pass", value: p.day_pass, suffix: "/day" },
        { label: "Hot Desk", value: p.hot_desk_monthly, suffix: "/mo" },
        { label: "Dedicated Desk", value: p.dedicated_desk_monthly, suffix: "/mo" },
        { label: "Private Office", value: p.private_office_monthly, suffix: "/mo", startingAt: true },
        { label: "Meeting Room", value: p.meeting_room_hourly, suffix: "/hr", startingAt: true },
      ]
    : []
  const shown = rates.filter((r) => r.value != null && r.value > 0)
  const tiers = (space.membership_tiers || []).filter((t) => t && t.name)
  const services = (space.services || []).filter((s) => SERVICE_LABELS[s])
  const events = space.events || []
  const accessLabel =
    space.hours?.access === "24/7" ? "24/7 access"
    : space.hours?.access === "extended" ? "Extended hours"
    : space.hours?.access === "business_hours" ? "Business hours"
    : null

  return (
    <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8">
      <h2 className="text-xl font-heading font-semibold text-navy-500 mb-6">Pricing & Plans</h2>

      {shown.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {shown.map((r) => (
              <div key={r.label} className="p-4 rounded-xl bg-warm-50 border border-warm-100">
                <div className="text-xs text-warm-600 mb-1">{r.label}</div>
                <div className="text-lg font-bold text-navy-500">
                  {r.startingAt && <span className="text-xs font-medium text-warm-500 mr-1">from</span>}
                  {fmtUSD(r.value!)}
                  <span className="text-xs font-medium text-warm-500">{r.suffix}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-warm-500 mb-6">
            {p?.source === "brand"
              ? "Brand-published starting rates — confirm current pricing with this location."
              : "Rates provided by the space."}{" "}
            Prices vary by market and availability.
          </p>
        </>
      ) : (
        <div className="p-5 rounded-xl bg-warm-50 border border-warm-100 flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="font-semibold text-navy-500 text-sm mb-1">Pricing not listed</div>
            <p className="text-xs text-warm-600">
              This space hasn&apos;t published rates. Ask them directly — it takes 30 seconds.
            </p>
          </div>
          <button
            onClick={onRequestInfo}
            className="shrink-0 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-all"
          >
            Request Pricing Info
          </button>
        </div>
      )}

      {(tiers.length > 0 || accessLabel || space.hours?.staffed) && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-navy-500 mb-3">Plans & Access</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tiers.map((t) => (
              <span key={t.name} className="text-xs text-navy-500 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-full font-medium">
                {TIER_LABELS[t.name] ?? t.name}{t.price ? ` · ${t.price}` : ""}
              </span>
            ))}
            {accessLabel && (
              <span className="text-xs text-navy-500 bg-warm-50 border border-warm-200 px-3 py-1.5 rounded-full font-medium">
                {accessLabel}
              </span>
            )}
          </div>
          {space.hours?.staffed && (
            <p className="text-xs text-warm-600">Staffed: {space.hours.staffed}</p>
          )}
        </div>
      )}

      {services.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-navy-500 mb-3">Services</div>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <span key={s} className="text-xs text-warm-700 bg-warm-50 px-3 py-1.5 rounded-full">
                {SERVICE_LABELS[s]}
              </span>
            ))}
          </div>
        </div>
      )}

      {space.event_space?.available && (
        <div className="mb-6 p-4 rounded-xl bg-warm-50 border border-warm-100">
          <div className="text-sm font-semibold text-navy-500 mb-1">Event Space Available</div>
          <p className="text-xs text-warm-600">
            {space.event_space.capacity ? `Capacity: ${space.event_space.capacity} guests. ` : ""}
            {space.event_space.description || "Contact the space for event bookings."}
          </p>
        </div>
      )}

      {events.length > 0 && (
        <div className="mb-6">
          <div className="text-sm font-semibold text-navy-500 mb-3">Upcoming Public Events</div>
          <div className="space-y-2">
            {events.slice(0, 5).map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-warm-50 border border-transparent hover:border-warm-100">
                <div>
                  <div className="text-sm font-medium text-navy-500">{e.title}</div>
                  {e.date && <div className="text-xs text-warm-600">{e.date}</div>}
                </div>
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 font-medium hover:underline shrink-0">
                    Details &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(space.programs?.length ?? 0) > 0 && (
        <div>
          <div className="text-sm font-semibold text-navy-500 mb-3">Programs at This Space</div>
          <div className="space-y-2">
            {space.programs!.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-warm-50 border border-transparent hover:border-warm-100">
                <div>
                  <div className="text-sm font-medium text-navy-500">{p.title}</div>
                  <div className="text-xs text-warm-600">
                    {[p.type?.replace("_", " "), p.schedule, p.price].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 font-medium hover:underline shrink-0">
                    Details &rarr;
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SpaceDetailClient({ space }: { space: Space }) {
  const [showInquiry, setShowInquiry] = useState(false)
  const [step, setStep] = useState<Step>("plan")
  const [saved, setSaved] = useState(() => isSaved(space.slug))
  const [shareMsg, setShareMsg] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const [inquiryType, setInquiryType] = useState("tour")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: space.name, url })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMsg("Link copied!")
        setTimeout(() => setShareMsg(""), 2000)
      }
    } catch {
      // user dismissed share sheet
    }
  }

  const submitInquiry = async () => {
    if (!name.trim() || !email.trim()) {
      setSubmitError("Please add your name and email so the space can reply.")
      return
    }
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          space_name: space.name,
          space_city: space.city,
          space_state: space.state,
          space_slug: space.slug,
          inquiry_type: inquiryType,
          message: message.trim(),
          company_website: "", // honeypot
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send inquiry")
      setStep("confirm")
    } catch (e) {
      setSubmitError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-100">
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/spaces" className="inline-flex items-center gap-1.5 text-sm text-warm-600 hover:text-navy-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to all spaces
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-warm-600 mb-1">
                    <Building2 className="w-4 h-4" />
                    <span>Coworking Space</span>
                    {space.featured_tier !== "none" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500">{space.name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-warm-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {space.city}, {space.state}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSaved(toggleSaved(space.slug))}
                    aria-label={saved ? "Remove from saved" : "Save this space"}
                    className="p-2.5 rounded-xl border border-warm-200 hover:bg-warm-100 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${saved ? "text-brand-500 fill-brand-500" : "text-warm-600"}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share this space"
                    title={shareMsg || "Share this space"}
                    className="p-2.5 rounded-xl border border-warm-200 hover:bg-warm-100 transition-colors relative"
                  >
                    <Share2 className="w-5 h-5 text-warm-600" />
                    {shareMsg && (
                      <span className="absolute -bottom-8 right-0 text-xs bg-navy-500 text-white px-2 py-1 rounded whitespace-nowrap">
                        {shareMsg}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-warm-200">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200"
                  alt={space.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>

            {space.description && (
              <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8">
                <h2 className="text-xl font-heading font-semibold text-navy-500 mb-4">About This Space</h2>
                <p className="text-warm-700 leading-relaxed">{space.description}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8">
              <h2 className="text-xl font-heading font-semibold text-navy-500 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {space.amenities.length > 0 ? space.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-warm-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-navy-500">{amenity}</span>
                  </div>
                )) : (
                  <p className="text-sm text-warm-600 col-span-full">
                    Amenity details aren&apos;t listed for this space yet — contact them directly to ask.
                  </p>
                )}
              </div>
            </div>

            <PricingSection
              space={space}
              onRequestInfo={() => { setInquiryType("pricing"); setStep("details"); setShowInquiry(true) }}
            />

            <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8">
              <h2 className="text-xl font-heading font-semibold text-navy-500 mb-6">Contact & Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {space.phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-warm-600">Phone</div>
                        <a href={`tel:${space.phone.replace(/\D/g, "")}`} className="text-sm font-medium text-navy-500 hover:text-brand-600">{space.phone}</a>
                      </div>
                    </div>
                  )}
                  {space.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-warm-600">Website</div>
                        <a href={space.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                          {space.website.replace("https://", "").replace("http://", "").split("/")[0]}
                        </a>
                      </div>
                    </div>
                  )}
                  {!space.phone && !space.website && (
                    <p className="text-sm text-warm-600">Contact details aren&apos;t listed for this space yet.</p>
                  )}
                </div>
                <div className="rounded-2xl overflow-hidden bg-warm-100 min-h-[200px] flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                    <p className="text-sm text-navy-500 font-medium mb-1">{space.city}</p>
                    <p className="text-xs text-warm-600 mb-3">{space.state}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(space.name + " " + space.city + " " + space.state)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700"
                    >
                      Open in Google Maps <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-8 h-8 text-brand-500 shrink-0" />
                <div>
                  <div className="font-semibold text-navy-500 text-sm">Own or manage this space?</div>
                  <p className="text-xs text-warm-600">Claim this listing to update details and get featured.</p>
                </div>
              </div>
              <Link
                href={`/list-your-space?claim=${encodeURIComponent(space.slug)}`}
                className="shrink-0 px-5 py-2.5 rounded-xl border border-warm-200 text-sm font-medium text-navy-500 hover:bg-warm-50 transition-all"
              >
                Claim Listing
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-sm">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-warm-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>{space.city}, {space.state}</span>
                  </div>
                  <div className="text-sm text-warm-600">Listed on Huddle</div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => { setStep("plan"); setShowInquiry(true) }}
                    className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Request a Tour
                  </button>
                  <button
                    onClick={() => setSaved(toggleSaved(space.slug))}
                    className="w-full flex items-center justify-center gap-2 bg-white text-navy-500 rounded-xl py-3.5 font-medium border border-warm-200 hover:bg-warm-50 transition-all"
                  >
                    <Heart className={`w-4 h-4 ${saved ? "text-brand-500 fill-brand-500" : ""}`} />
                    {saved ? "Saved" : "Save Space"}
                  </button>
                  {space.website && (
                    <a
                      href={space.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-white text-navy-500 rounded-xl py-3.5 font-medium border border-warm-200 hover:bg-warm-50 transition-all"
                    >
                      Visit Website
                    </a>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-warm-200 space-y-2.5">
                  {[
                    "Free to contact — no account needed",
                    "Your inquiry goes straight to the space",
                    "Compare spaces across the US",
                  ].map((perk) => (
                    <div key={perk} className="flex items-center gap-2.5 text-sm text-warm-700">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-warm-200 p-5">
                <h3 className="font-heading font-semibold text-navy-500 text-sm mb-3">
                  Find More in {space.city}
                </h3>
                <Link
                  href={`/spaces?city=${encodeURIComponent(space.city)}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-warm-50 transition-colors text-sm text-navy-500"
                >
                  View all spaces in {space.city}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInquiry && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInquiry(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-navy-500">
                  {step === "plan" && "What would you like to do?"}
                  {step === "details" && "Your Details"}
                  {step === "confirm" && "Inquiry Sent!"}
                </h2>
                <button onClick={() => setShowInquiry(false)} className="p-2 hover:bg-warm-100 rounded-xl" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {step === "plan" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-warm-50">
                    <div className="font-semibold text-navy-500 mb-1">{space.name}</div>
                    <div className="text-sm text-warm-600">{space.city}, {space.state}</div>
                  </div>
                  <p className="text-sm text-warm-700">
                    No account needed — your inquiry goes directly to the space.
                  </p>
                  <div className="space-y-3">
                    {INQUIRY_TYPES.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setInquiryType(option.value); setStep("details") }}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-warm-200 hover:border-brand-200 transition-all text-left"
                      >
                        <span className="text-sm font-medium text-navy-500">{option.label}</span>
                        <ArrowRight className="w-4 h-4 text-warm-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "details" && (
                <div className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{submitError}</div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500"
                      placeholder="Jane Doe"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500"
                      placeholder="jane@example.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Phone (optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500"
                      placeholder="(555) 000-0000"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Message (optional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500 resize-none h-24"
                      placeholder="Tell them about your workspace needs..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("plan")}
                      className="flex-1 border border-warm-200 rounded-xl py-3.5 text-sm font-medium text-navy-500 hover:bg-warm-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={submitInquiry}
                      disabled={submitting}
                      className="flex-[2] bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? "Sending..." : "Send Inquiry"}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-warm-500 text-center">
                    By sending, you agree to be contacted about this space.
                  </p>
                </div>
              )}

              {step === "confirm" && (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-navy-500 mb-1">Inquiry Sent!</h3>
                  <p className="text-sm text-warm-600">
                    Your {INQUIRY_TYPES.find((t) => t.value === inquiryType)?.label.toLowerCase()} request
                    was sent for <strong>{space.name}</strong>. The space will reply to <strong>{email}</strong> directly.
                  </p>
                  <button
                    onClick={() => setShowInquiry(false)}
                    className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
