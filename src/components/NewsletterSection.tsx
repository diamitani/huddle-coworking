"use client"

import { useState } from "react"
import { Send, Sparkles } from "lucide-react"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), company_website: "" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")
      setSubmitted(true)
      setEmail("")
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="py-20 sm:py-28 bg-navy-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-sm text-white/80 font-medium">Stay in the loop</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Get New Spaces Delivered to Your Inbox
          </h2>

          <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
            New coworking spaces, city guides, and workspace tips — straight to your inbox.
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/10 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Send className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-white font-medium">You&#39;re in! Watch your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm outline-none focus:border-brand-400/50 focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? "Subscribing..." : "Subscribe"} <Send className="w-4 h-4" />
              </button>
            </form>
          )}
          {error && !submitted && (
            <p className="text-red-300 text-sm mt-4">{error}</p>
          )}
        </div>
      </div>
    </section>
  )
}
