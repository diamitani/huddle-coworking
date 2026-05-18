"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface StateData {
  state: string
  count: number
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "Washington DC",
}

export default function StateExplorer() {
  const [states, setStates] = useState<StateData[]>([])

  useEffect(() => {
    fetch("/data/stats.json")
      .then((r) => r.json())
      .then((d) => {
        const list = Object.entries(d.topStates).map(([state, count]) => ({
          state,
          count: count as number,
        }))
        setStates(list)
      })
      .catch(() => {})
  }, [])

  if (states.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-navy-50 text-navy-500 text-xs font-semibold uppercase tracking-wider mb-4">
              Explore by State
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy-500">
              Coworking Spaces Across America
            </h2>
          </div>
          <Link
            href="/spaces"
            className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:text-brand-700 transition-colors"
          >
            Browse all spaces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {states.map((st, i) => (
            <motion.div
              key={st.state}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link
                href={`/spaces?state=${st.state}`}
                className="flex items-center justify-between p-4 rounded-xl bg-warm-50 border border-warm-200 hover:border-brand-200 hover:bg-brand-50/50 transition-all group"
              >
                <div>
                  <div className="font-heading font-semibold text-navy-500 text-sm flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-500" />
                    {st.state}
                  </div>
                  <div className="text-xs text-warm-600 mt-0.5">
                    {STATE_NAMES[st.state] || st.state}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-navy-500">{st.count}</div>
                  <div className="text-[10px] text-warm-500 uppercase tracking-wider">spaces</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-warm-600">
            {states.reduce((a, s) => a + s.count, 0)} verified coworking spaces across {states.length} states.
            <br />
            <span className="text-xs text-warm-400">Data sourced from public directories and validated listings.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
