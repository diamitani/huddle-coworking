// /admin — lead inbox for the Huddle operator. Password-gated.
"use client"

import { useState } from "react"
import { Lock, Inbox, RefreshCw } from "lucide-react"

const TABS = [
  { key: "inquiry", label: "Tour / Inquiries" },
  { key: "claim", label: "Claim Requests" },
  { key: "listing", label: "New Listings" },
  { key: "newsletter", label: "Newsletter" },
  { key: "featured_waitlist", label: "Featured Waitlist" },
] as const

type TabKey = (typeof TABS)[number]["key"]

export default function AdminPage() {
  const [key, setKey] = useState("")
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<TabKey>("inquiry")
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const load = async (k: TabKey, adminKey: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/admin/leads?kind=${k}`, {
        headers: { "x-admin-key": adminKey },
      })
      if (!res.ok) throw new Error(res.status === 401 ? "Wrong password." : "Failed to load.")
      const data = await res.json()
      setRecords(data.records || [])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!key) return
    await load(tab, key)
    if (!error) setAuthed(true)
    else setError("Wrong password.")
  }

  const switchTab = (k: TabKey) => {
    setTab(k)
    if (authed) load(k, key)
  }

  if (!authed) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-warm-100 flex items-start justify-center px-4">
        <form onSubmit={unlock} className="bg-white rounded-2xl border border-warm-200 p-8 w-full max-w-sm shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-navy-500 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-heading font-bold text-navy-500 mb-1">Operator Sign In</h1>
          <p className="text-sm text-warm-600 mb-6">Enter the Huddle admin password to view leads.</p>
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-xl border border-warm-200 px-4 py-3 text-sm text-navy-500 mb-4"
          />
          <button className="w-full bg-navy-500 text-white rounded-xl py-3 font-semibold hover:bg-navy-600">
            View Leads
          </button>
        </form>
      </div>
    )
  }

  const columns = (r: Record<string, unknown>) =>
    Object.keys(r).filter((k) => !["kind"].includes(k))

  return (
    <div className="min-h-screen pt-24 pb-20 bg-warm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-navy-500 flex items-center gap-2">
              <Inbox className="w-6 h-6" /> Lead Inbox
            </h1>
            <p className="text-sm text-warm-600 mt-1">
              {records.length} record{records.length === 1 ? "" : "s"} · newest first
            </p>
          </div>
          <button
            onClick={() => load(tab, key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-200 bg-white text-sm text-navy-500 hover:bg-warm-50"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-navy-500 text-white"
                  : "bg-white text-navy-500 border border-warm-200 hover:border-brand-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-warm-600">Loading…</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-200 p-12 text-center">
            <Inbox className="w-10 h-10 text-warm-300 mx-auto mb-3" />
            <p className="text-warm-600 text-sm">No records yet. New submissions will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-warm-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200 text-left">
                  {columns(records[0]).map((c) => (
                    <th key={c} className="px-4 py-3 text-xs font-semibold text-warm-600 uppercase tracking-wide whitespace-nowrap">
                      {c.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={i} className="border-b border-warm-100 last:border-0 hover:bg-warm-50">
                    {columns(r).map((c) => (
                      <td key={c} className="px-4 py-3 text-navy-500 align-top max-w-[280px]">
                        <span className="break-words text-[13px] leading-snug block">
                          {String(r[c] ?? "")}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
