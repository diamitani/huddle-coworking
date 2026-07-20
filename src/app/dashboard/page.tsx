"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Send, Heart, LogOut, User, Clock, CheckCircle, XCircle } from "lucide-react"

interface AuthUser { sub: string; email: string; name: string }
interface Inquiry {
  id: string
  space_name: string
  space_city: string
  inquiry_type: string
  message: string
  status: string
  created_at: string
}
interface SavedSpace {
  id: string
  space_name: string
  space_city: string
  space_state: string
  space_slug: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [savedSpaces, setSavedSpaces] = useState<SavedSpace[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"inquiries" | "saved" | "profile">("inquiries")

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.ok ? r.json() : null),
      fetch("/api/inquiries").then((r) => r.ok ? r.json() : { inquiries: [] }),
      fetch("/api/saved").then((r) => r.ok ? r.json() : { saved: [] }),
    ]).then(([me, inq, sav]) => {
      if (!me?.sub) {
        router.push("/login?redirect=/dashboard")
        return
      }
      setUser(me)
      setInquiries(inq?.inquiries || [])
      setSavedSpaces(sav?.saved || [])
      setLoading(false)
    })
  }, [router])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const handleUnsave = async (space: SavedSpace) => {
    await fetch("/api/saved", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ space_slug: space.space_slug }),
    })
    setSavedSpaces((prev) => prev.filter((s) => s.id !== space.id))
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />
      case "contacted": return <Send className="w-4 h-4 text-brand-500" />
      case "resolved": return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <XCircle className="w-4 h-4 text-warm-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-warm-100 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 bg-warm-200 rounded-2xl mx-auto mb-4" />
          <div className="h-5 bg-warm-200 rounded w-36 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-20 bg-warm-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-navy-500">Dashboard</h1>
            <p className="text-warm-600 text-sm mt-1">{user?.name || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-warm-200 text-sm text-warm-600 hover:text-navy-500 hover:bg-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {(["inquiries", "saved", "profile"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                tab === t
                  ? "bg-navy-500 text-white shadow"
                  : "bg-white text-navy-500 border border-warm-200 hover:border-brand-200"
              }`}
            >
              {t === "inquiries" && <Send className="w-4 h-4 inline mr-1.5" />}
              {t === "saved" && <Heart className="w-4 h-4 inline mr-1.5" />}
              {t === "profile" && <User className="w-4 h-4 inline mr-1.5" />}
              {t}
            </button>
          ))}
        </div>

        {tab === "inquiries" && (
          <div className="bg-white rounded-2xl border border-warm-200">
            {inquiries.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-10 h-10 text-warm-300 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-500 mb-1">No inquiries yet</h3>
                <p className="text-sm text-warm-600 mb-4">When you contact a coworking space, it appears here.</p>
                <Link href="/spaces" className="inline-flex items-center gap-1.5 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600">
                  Browse Spaces
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-warm-100">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="p-5 hover:bg-warm-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {statusIcon(inquiry.status)}
                          <h3 className="font-semibold text-navy-500 text-sm">{inquiry.space_name}</h3>
                        </div>
                        <p className="text-xs text-warm-600 mt-1">{inquiry.space_city} · {inquiry.inquiry_type}</p>
                        {inquiry.message && <p className="text-sm text-warm-700 mt-2 line-clamp-2">{inquiry.message}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          inquiry.status === "pending" ? "bg-yellow-50 text-yellow-700" :
                          inquiry.status === "contacted" ? "bg-brand-50 text-brand-700" :
                          inquiry.status === "resolved" ? "bg-green-50 text-green-700" :
                          "bg-warm-100 text-warm-700"
                        }`}>{inquiry.status}</span>
                        <p className="text-xs text-warm-500 mt-1">{new Date(inquiry.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "saved" && (
          <div className="bg-white rounded-2xl border border-warm-200">
            {savedSpaces.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-10 h-10 text-warm-300 mx-auto mb-3" />
                <h3 className="font-semibold text-navy-500 mb-1">No saved spaces</h3>
                <p className="text-sm text-warm-600 mb-4">Save spaces to quickly access them later.</p>
                <Link href="/spaces" className="inline-flex items-center gap-1.5 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600">
                  Browse Spaces
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-warm-100">
                {savedSpaces.map((space) => (
                  <div key={space.id} className="p-5 flex items-center justify-between hover:bg-warm-50 transition-colors">
                    <Link href={`/spaces/${space.space_slug}`} className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-brand-500" />
                      <div>
                        <h3 className="font-semibold text-navy-500 text-sm">{space.space_name}</h3>
                        <p className="text-xs text-warm-600">{space.space_city}, {space.space_state}</p>
                      </div>
                    </Link>
                    <button onClick={() => handleUnsave(space)} className="text-xs text-warm-500 hover:text-red-500 transition-colors">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div className="bg-white rounded-2xl border border-warm-200 p-6">
            <h2 className="text-lg font-heading font-semibold text-navy-500 mb-4">Profile</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1.5">Full Name</label>
                <input type="text" defaultValue={user?.name || ""} className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-navy-500 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-warm-700 mb-1.5">Email</label>
                <input type="email" value={user?.email || ""} disabled className="w-full rounded-xl border border-warm-200 px-4 py-2.5 text-sm text-warm-500 bg-warm-50 cursor-not-allowed" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
