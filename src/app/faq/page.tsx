"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

const faqs = [
  {
    q: "Is Huddle free to use?",
    a: "Yes — browsing and searching spaces is completely free. We also offer a Pro plan for unlimited saves, day pass bookings, and more.",
  },
  {
    q: "How do I book a coworking space?",
    a: "Find a space you like, click 'Contact This Space', and submit an inquiry directly to the operator. Pro members can book day passes and meeting rooms instantly.",
  },
  {
    q: "How do I list my coworking space on Huddle?",
    a: "Visit our 'List Your Space' page and submit your details. Our team reviews and publishes verified listings within 2–3 business days.",
  },
  {
    q: "Are all listings verified?",
    a: "We verify listings before publishing. Look for the 'Verified listing' badge on space profiles — it means we've confirmed the space is active and the contact info is accurate.",
  },
  {
    q: "Can I save spaces to come back to later?",
    a: "Free users can save up to 5 spaces. Pro users get unlimited saves, plus booking history and personalized recommendations.",
  },
  {
    q: "How is Huddle different from other coworking directories?",
    a: "Huddle focuses on quality over quantity — every listing is verified, amenity data is accurate, and you can contact spaces directly without going through a middleman.",
  },
  {
    q: "How do I report an incorrect listing?",
    a: "Email us at hello@huddle.work with the space name and what needs correcting. We'll update it within 48 hours.",
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
    <>
      <Navbar />
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
      <Footer />
    </>
  )
}
