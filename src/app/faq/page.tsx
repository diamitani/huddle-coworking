"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

const faqs = [
  {
    q: "Is Huddle free to use?",
    a: "Yes — browsing, searching, saving spaces, and requesting tours are completely free. No account needed.",
  },
  {
    q: "How do I request a tour or ask about pricing?",
    a: "Open any space and click 'Request a Tour'. Pick what you want to ask about — tours, membership, pricing, or events — and your inquiry goes directly to the space. They'll reply to your email.",
  },
  {
    q: "Do I need an account?",
    a: "No. Everything a workspace seeker needs works without signing up. Saved spaces are kept in your browser on your device.",
  },
  {
    q: "Where does Huddle's pricing data come from?",
    a: "Published rates come from the brands themselves (labeled 'brand-published starting rates') or from the space operators (labeled 'provided by the space'). Where pricing isn't published, we say so honestly instead of guessing — and route your question straight to the space.",
  },
  {
    q: "How do I list my coworking space on Huddle?",
    a: "Visit 'List Your Space' and submit your details — it's free. Our team reviews every submission for accuracy before it goes live, usually within 2 business days.",
  },
  {
    q: "I own a space that's already listed. How do I update it?",
    a: "Use 'Claim Listing' on your space's page. Once we verify you're affiliated with the space, you can correct details, publish your rates and events, and explore Featured placement.",
  },
  {
    q: "What does Featured mean?",
    a: "Featured listings are paid placements from space operators ($49/mo) that get top placement in search, a homepage spotlight, and a featured badge. They're clearly labeled — never disguised as organic results.",
  },
  {
    q: "How is Huddle different from other coworking directories?",
    a: "We focus on accuracy over scale: every listing is checked against real sources, pricing is transparent about where it comes from, and you contact spaces directly with no middleman and no account walls.",
  },
  {
    q: "How do I report an incorrect listing?",
    a: "Email us at hello@huddle.work with the space name and what needs correcting. We'll fix it.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-warm-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-warm-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-navy-500 text-sm">{q}</span>
        <ChevronDown className={cn("w-5 h-5 text-warm-400 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-warm-600 text-sm leading-relaxed border-t border-warm-100">
          <p className="pt-4">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-warm-50">
      <section className="bg-navy-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-warm-200 text-lg">Everything you need to know about Huddle.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <p className="text-warm-600 text-sm">Still have questions?</p>
            <a href="mailto:hello@huddle.work" className="text-brand-500 font-semibold hover:underline text-sm">hello@huddle.work</a>
          </div>
        </div>
      </section>
    </main>
  )
}
