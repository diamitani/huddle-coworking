import { Mail, MessageSquare, MapPin } from "lucide-react"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-warm-50">
        <section className="bg-navy-500 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Contact Us</h1>
            <p className="text-warm-200 text-lg">
              Have a question, feedback, or want to list your space? We&#39;d love to hear from you.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-2xl font-heading font-bold text-navy-500 mb-6">Get in touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-navy-500">Email</div>
                      <a href="mailto:hello@huddle.work" className="text-brand-500 hover:underline text-sm">hello@huddle.work</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-navy-500">Support</div>
                      <div className="text-warm-600 text-sm">We typically respond within 24 hours on business days.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-navy-500">List a space</div>
                      <div className="text-warm-600 text-sm">Want to add your coworking space? Email us or use the listing form.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100">
                <h3 className="text-lg font-heading font-semibold text-navy-500 mb-6">Send a message</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-500 mb-1">First name</label>
                      <input type="text" className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" placeholder="Jane" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-500 mb-1">Last name</label>
                      <input type="text" className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-500 mb-1">Email</label>
                    <input type="email" className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" placeholder="jane@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-500 mb-1">Message</label>
                    <textarea rows={4} className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" placeholder="How can we help?" />
                  </div>
                  <button type="submit" className="w-full bg-brand-500 text-white py-2.5 rounded-xl font-semibold hover:bg-brand-600 transition-colors text-sm">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
