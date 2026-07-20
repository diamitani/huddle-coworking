import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-warm-50">
        <section className="bg-navy-500 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Privacy Policy</h1>
            <p className="text-warm-200">Last updated: January 2026</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-warm-100 prose prose-sm max-w-none text-warm-700">
              <h2 className="text-navy-500 font-heading">1. Information We Collect</h2>
              <p>We collect information you provide directly, such as your name and email when you create an account or submit an inquiry. We also collect usage data (pages visited, searches) to improve the product.</p>

              <h2 className="text-navy-500 font-heading">2. How We Use Your Information</h2>
              <p>We use your data to operate Huddle, process bookings and inquiries, send transactional emails, and improve our services. We do not sell your personal data to third parties.</p>

              <h2 className="text-navy-500 font-heading">3. Cookies</h2>
              <p>We use cookies to keep you logged in and to understand how you use the site. You can disable cookies in your browser settings, though some features may not work correctly.</p>

              <h2 className="text-navy-500 font-heading">4. Data Sharing</h2>
              <p>When you submit an inquiry to a coworking space, we share your contact information with that space operator. We may also share data with service providers (e.g., email delivery) under strict confidentiality agreements.</p>

              <h2 className="text-navy-500 font-heading">5. Data Retention</h2>
              <p>We retain your account data as long as your account is active. You can request deletion by emailing hello@huddle.work.</p>

              <h2 className="text-navy-500 font-heading">6. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal data. Contact us at hello@huddle.work to exercise these rights.</p>

              <h2 className="text-navy-500 font-heading">7. Contact</h2>
              <p>Questions about this policy? Email <a href="mailto:hello@huddle.work" className="text-brand-500">hello@huddle.work</a>.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
