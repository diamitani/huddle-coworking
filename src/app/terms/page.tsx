import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-warm-50">
        <section className="bg-navy-500 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Terms of Service</h1>
            <p className="text-warm-200">Last updated: January 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100 prose prose-sm max-w-none text-warm-700">
              <h2 className="text-navy-500 font-heading">1. Acceptance of Terms</h2>
              <p>By using Huddle, you agree to these Terms of Service. If you do not agree, please do not use the service.</p>

              <h2 className="text-navy-500 font-heading">2. Use of the Service</h2>
              <p>Huddle is a directory and booking platform for coworking spaces. You may use it to find, save, and contact coworking spaces. You may not use it for spam, scraping, or any illegal purpose.</p>

              <h2 className="text-navy-500 font-heading">3. Accounts</h2>
              <p>You are responsible for maintaining the security of your account. Notify us immediately at hello@huddle.work if you suspect unauthorized access.</p>

              <h2 className="text-navy-500 font-heading">4. Space Listings</h2>
              <p>Coworking space operators are responsible for the accuracy of their listings. Huddle is not responsible for any inaccuracies or changes in space availability, pricing, or amenities.</p>

              <h2 className="text-navy-500 font-heading">5. Bookings and Inquiries</h2>
              <p>Bookings and inquiries are between you and the space operator. Huddle is not a party to any rental agreement or transaction.</p>

              <h2 className="text-navy-500 font-heading">6. Limitation of Liability</h2>
              <p>Huddle is provided as-is. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>

              <h2 className="text-navy-500 font-heading">7. Changes</h2>
              <p>We may update these terms at any time. Continued use after changes constitutes acceptance.</p>

              <h2 className="text-navy-500 font-heading">8. Contact</h2>
              <p>Questions? Email <a href="mailto:hello@huddle.work" className="text-brand-500">hello@huddle.work</a>.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
