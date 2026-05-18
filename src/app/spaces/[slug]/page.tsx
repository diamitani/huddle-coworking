"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  MapPin, Star, ChevronLeft,
  Clock, Phone, Mail, Globe, Check, ArrowRight,
  Building2, Heart, Share2, Users, X, Send
} from "lucide-react"
import { cn } from "@/lib/cn"
import { createClient } from "@/lib/supabase"

interface SpaceDetail {
  id: number
  n: string
  c: string
  st: string
  w: string
  p: string
  e: string
  d: string
  a: string[]
  ct: number
}

export default function SpaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [space, setSpace] = useState<SpaceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [bookingStep, setBookingStep] = useState<"plan" | "details" | "confirm">("plan")
  const [showBooking, setShowBooking] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Inquiry form state
  const [inquiryType, setInquiryType] = useState("membership")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch(`/api/spaces/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => setSpace(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))

    // Check auth
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user)
        setEmail(data.user.email || "")
        setFirstName(data.user.user_metadata?.full_name?.split(" ")[0] || "")
        setLastName(data.user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "")

        // Check if space is saved
        supabase
          .from("saved_spaces")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("space_slug", slug)
          .single()
          .then(({ data: savedData }) => {
            if (savedData) setSaved(true)
          })
      }
    })
  }, [slug])

  const handleContact = async () => {
    if (!user) {
      router.push(`/login?redirect=/spaces/${slug}`)
      return
    }

    if (bookingStep === "plan") {
      setBookingStep("details")
      return
    }

    if (bookingStep === "details") {
      setSubmitting(true)
      setSubmitError("")

      try {
        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            space_name: space?.n || "",
            space_city: space?.c || "",
            space_state: space?.st || "",
            space_website: space?.w || "",
            inquiry_type: inquiryType,
            message: `Name: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone}\n\nMessage: ${message}`,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to submit inquiry")
        }

        setBookingStep("confirm")
      } catch (e: any) {
        setSubmitError(e.message)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleSaveSpace = async () => {
    if (!user) {
      router.push(`/login?redirect=/spaces/${slug}`)
      return
    }

    const supabase = createClient()

    if (saved) {
      await supabase
        .from("saved_spaces")
        .delete()
        .eq("user_id", user.id)
        .eq("space_slug", slug)
      setSaved(false)
    } else {
      await supabase.from("saved_spaces").insert({
        user_id: user.id,
        space_name: space?.n || "",
        space_city: space?.c || "",
        space_state: space?.st || "",
        space_slug: slug,
      })
      setSaved(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-warm-100 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-warm-200 rounded-2xl mx-auto mb-4" />
          <div className="h-6 bg-warm-200 rounded w-48 mx-auto" />
        </div>
      </div>
    )
  }

  if (notFound || !space) {
    return (
      <div className="min-h-screen pt-24 bg-warm-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <MapPin className="w-16 h-16 text-warm-300 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-navy-500 mb-2">Space not found</h1>
          <p className="text-warm-600 mb-6">This space isn&#39;t in our directory yet. Try searching for another workspace.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/spaces" className="bg-brand-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-600">
              Browse All Spaces
            </Link>
            <Link href="/list-your-space" className="border border-warm-200 text-navy-500 px-6 py-3 rounded-xl font-medium hover:bg-white">
              List This Space
            </Link>
          </div>
        </div>
      </div>
    )
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
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500">{space.n}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-warm-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {space.c}, {space.st}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {space.ct} contacts
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-xl border border-warm-200 hover:bg-warm-100 transition-colors">
                    <Heart className="w-5 h-5 text-warm-600" />
                  </button>
                  <button className="p-2.5 rounded-xl border border-warm-200 hover:bg-warm-100 transition-colors">
                    <Share2 className="w-5 h-5 text-warm-600" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-warm-200">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200"
                  alt={space.n}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8">
              <h2 className="text-xl font-heading font-semibold text-navy-500 mb-4">About This Space</h2>
              <p className="text-warm-700 leading-relaxed">{space.d}</p>
            </div>

            <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8">
              <h2 className="text-xl font-heading font-semibold text-navy-500 mb-6">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {space.a.length > 0 ? space.a.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-warm-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-sm text-navy-500">{amenity}</span>
                  </div>
                )) : (
                  <p className="text-sm text-warm-600 col-span-full">Amenity information not yet available for this space.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8">
              <h2 className="text-xl font-heading font-semibold text-navy-500 mb-6">Contact & Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {space.p && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-warm-600">Phone</div>
                        <a href={`tel:${space.p}`} className="text-sm font-medium text-navy-500 hover:text-brand-600">{space.p}</a>
                      </div>
                    </div>
                  )}
                  {space.e && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-warm-600">Email</div>
                        <a href={`mailto:${space.e}`} className="text-sm font-medium text-navy-500 hover:text-brand-600">{space.e}</a>
                      </div>
                    </div>
                  )}
                  {space.w && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-warm-600">Website</div>
                        <a href={space.w} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                          {space.w.replace("https://", "").replace("http://", "").split("/")[0]}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl overflow-hidden bg-warm-100 min-h-[200px] flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="w-8 h-8 text-brand-500 mx-auto mb-2" />
                    <p className="text-sm text-navy-500 font-medium mb-1">{space.c}</p>
                    <p className="text-xs text-warm-600 mb-3">{space.st}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(space.n + " " + space.c + " " + space.st)}`}
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
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl border border-warm-200 p-6 shadow-sm">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-warm-600 mb-2">
                    <Building2 className="w-4 h-4" />
                    <span>{space.c}, {space.st}</span>
                  </div>
                  <div className="text-sm text-warm-600 mb-1">Listed on Huddle</div>
                  <div className="flex items-center justify-center gap-1 text-sm text-warm-700">
                    <Users className="w-4 h-4" />
                    {space.ct} contacts in directory
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowBooking(true)}
                    className="w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Contact This Space
                  </button>
                  <button
                    onClick={handleSaveSpace}
                    className="w-full flex items-center justify-center gap-2 bg-white text-navy-500 rounded-xl py-3.5 font-medium border border-warm-200 hover:bg-warm-50 transition-all"
                  >
                    <Heart className="w-4 h-4" />
                    {saved ? "Saved" : "Save Space"}
                  </button>
                  <a
                    href={space.w || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-white text-navy-500 rounded-xl py-3.5 font-medium border border-warm-200 hover:bg-warm-50 transition-all"
                  >
                    Visit Website
                  </a>
                </div>

                <div className="mt-5 pt-5 border-t border-warm-200 space-y-2.5">
                  {[
                    "Verified listing",
                    "Contact space directly",
                    "Apply for membership",
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
                  Find More in {space.c}
                </h3>
                <Link
                  href={`/spaces?city=${encodeURIComponent(space.c)}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-warm-50 transition-colors text-sm text-navy-500"
                >
                  View all spaces in {space.c}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBooking(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-navy-500">
                  {!user && "Sign in required"}
                  {user && bookingStep === "plan" && "What type of inquiry?"}
                  {user && bookingStep === "details" && "Your Details"}
                  {user && bookingStep === "confirm" && "Inquiry Sent!"}
                </h2>
                <button onClick={() => setShowBooking(false)} className="p-2 hover:bg-warm-100 rounded-xl">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!user && (
                <div className="text-center py-6 space-y-4">
                  <MapPin className="w-12 h-12 text-brand-400 mx-auto" />
                  <p className="text-navy-500 font-medium">Sign in to contact this space</p>
                  <p className="text-sm text-warm-600">Create a free account to send inquiries and save spaces.</p>
                  <Link
                    href={`/login?redirect=/spaces/${slug}`}
                    className="block w-full bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={`/signup?redirect=/spaces/${slug}`}
                    className="block w-full border border-warm-200 text-navy-500 rounded-xl py-3.5 font-medium hover:bg-warm-50 transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              )}

              {user && bookingStep === "plan" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-warm-50">
                    <div className="font-semibold text-navy-500 mb-1">{space?.n}</div>
                    <div className="text-sm text-warm-600">{space?.c}, {space?.st}</div>
                  </div>
                  <p className="text-sm text-warm-700">
                    What would you like to inquire about? This space will contact you directly.
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: "membership", label: "Send membership inquiry" },
                      { value: "tour", label: "Request a tour" },
                      { value: "pricing", label: "Ask about pricing" },
                      { value: "event", label: "Book an event" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setInquiryType(option.value)
                          handleContact()
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-warm-200 hover:border-brand-200 transition-all text-left"
                      >
                        <span className="text-sm font-medium text-navy-500">{option.label}</span>
                        <ArrowRight className="w-4 h-4 text-warm-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {user && bookingStep === "details" && (
                <div className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{submitError}</div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-warm-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-warm-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-warm-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500"
                      placeholder="john@example.com"
                      required
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
                      onClick={() => setBookingStep("plan")}
                      className="flex-1 border border-warm-200 rounded-xl py-3.5 text-sm font-medium text-navy-500 hover:bg-warm-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleContact}
                      disabled={submitting}
                      className="flex-[2] bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? "Sending..." : "Send Inquiry"}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {user && bookingStep === "confirm" && (
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-navy-500 mb-1">Inquiry Sent!</h3>
                  <p className="text-sm text-warm-600">
                    Your {inquiryType} inquiry has been sent to <strong>{space?.n}</strong>. They typically respond within 24 hours.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowBooking(false)}
                      className="flex-1 bg-brand-500 text-white rounded-xl py-3.5 font-semibold hover:bg-brand-600"
                    >
                      Done
                    </button>
                    <Link
                      href="/dashboard"
                      className="flex-1 border border-warm-200 text-navy-500 rounded-xl py-3.5 font-medium hover:bg-warm-50"
                    >
                      View Dashboard
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
