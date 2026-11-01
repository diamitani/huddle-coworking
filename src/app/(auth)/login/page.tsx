"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { MapPin, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setConfigured(Boolean(d.configured)))
      .catch(() => setConfigured(false))
  }, [])
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Login failed")
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
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
          <h1 className="text-2xl font-heading font-bold text-navy-500 mb-2">Welcome back</h1>
          <p className="text-warm-600 text-sm mb-6">Sign in to manage your workspace inquiries and saved spaces.</p>

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

          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm text-navy-500 bg-white outline-none focus:border-brand-300"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || configured === false}
              className="w-full bg-brand-500 text-white rounded-xl py-3 font-semibold hover:bg-brand-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-warm-600 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-brand-600 font-medium hover:text-brand-700">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-100 flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 bg-warm-200 rounded-2xl" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
