import Link from "next/link"
import { MapPin, Heart, Mail } from "lucide-react"

const footerLinks = {
  discover: {
    label: "Discover",
    links: [
      { href: "/spaces", label: "All Spaces" },
      { href: "/cities", label: "Browse by City" },
      { href: "/membership", label: "Membership Plans" },
    ],
  },
  resources: {
    label: "Resources",
    links: [
      { href: "/list-your-space", label: "List Your Space" },
      { href: "/blog", label: "Blog" },
      { href: "/about", label: "About Us" },
    ],
  },
  support: {
    label: "Support",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
}

export default function Footer() {
  return (
    <footer className="bg-navy-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-heading font-bold">Huddle</span>
            </Link>
            <p className="text-warm-300 text-sm leading-relaxed max-w-sm mb-6">
              The world&#39;s #1 coworking space directory. Find, compare, and book the perfect workspace near you.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-warm-300">
                <Heart className="w-4 h-4 text-brand-400" fill="currentColor" />
                <span>1,200+ spaces listed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-warm-300">
                <Mail className="w-4 h-4" />
                <span>hello@huddle.work</span>
              </div>
            </div>
          </div>

          {Object.values(footerLinks).map((group) => (
            <div key={group.label}>
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-warm-400 mb-4">
                {group.label}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-warm-400">
            &copy; {new Date().getFullYear()} Huddle. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-warm-400">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono">System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
