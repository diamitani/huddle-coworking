"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Mail, Lock, User, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { Suspense } from "react"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"

  const [step, setStep] = useState<"form" | "confirm">("form")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [configured, setConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setConfigured(Boolean(d.configured)))
      .catch(() => setConfigured(false))
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: fullName }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Signup failed")
    } else if (data.userConfirmed) {
      // Auto-confirmed (admin setting) — log in directly
      await loginAfterConfirm()
    } else {
      setStep("confirm")
    }
    setLoading(false)
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Confirmation failed")
      setLoading(false)
    } else {
      await loginAfterConfirm()
    }
  }

  const loginAfterConfirm = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      router.push(redirect)
      router.refresh()
    } else {
      router.push("/login?message=Account created! Please sign in.")
    }
  }

  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-warm-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-navy-500">Huddle</span>
          </Link>

          <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-brand-500" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-navy-500 mb-2 text-center">Check your email</h1>
            <p className="text-warm-600 text-sm mb-6 text-center">
              We sent a confirmation code to <strong>{email}</strong>. Enter it below to activate your account.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1.5">Confirmation Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  placeholder="123456"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-200 text-sm text-navy-500 bg-white outline-none focus:border-brand-300 text-center text-lg tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 text-white rounded-xl py-3 font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Confirming..." : "Confirm & Sign In"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-heading font-bold text-navy-500">Huddle</span>
        </Link>

        <div className="bg-white rounded-2xl border border-warm-200 p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-heading font-bold text-navy-500 mb-2">Create your account</h1>
          <p className="text-warm-600 text-sm mb-1">Start finding and booking coworking spaces.</p>
          <p className="text-xs text-brand-600 font-medium mb-6">Free forever — no credit card required.</p>

          {configured === false && (
            <div className="flex gap-3 p-4 rounded-xl bg-warm-100 border border-warm-200 text-sm text-warm-700 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0 text-warm-500" />
              <p>Accounts are being set up right now — check back soon. Everything else on Huddle works without an account.</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-warm-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm text-navy-500 bg-white outline-none focus:border-brand-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-warm-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm text-navy-500 bg-white outline-none focus:border-brand-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-warm-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ chars, uppercase, number, symbol"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm text-navy-500 bg-white outline-none focus:border-brand-300"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || configured === false}
              className="w-full bg-brand-500 text-white rounded-xl py-3 font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Creating account..." : "Create Free Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-warm-500 mt-4">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-brand-500 hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-brand-500 hover:underline">Privacy Policy</Link>.
          </p>

          <p className="text-center text-sm text-warm-600 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-100 flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 bg-warm-200 rounded-2xl" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
