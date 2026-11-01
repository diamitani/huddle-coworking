import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Analytics from "@/components/Analytics"
import { getStats, SITE_URL } from "@/lib/directory-server"

export async function generateMetadata(): Promise<Metadata> {
  const stats = getStats()
  const count = stats.totalSpaces.toLocaleString()
  return {
    title: "Huddle — Find Coworking Spaces Near You",
    description: `Browse ${count} coworking spaces across ${stats.totalCities} US cities. Request tours, compare amenities, and contact spaces directly — no account needed.`,
    keywords: ["coworking", "coworking space", "shared office", "workspace", "remote work", "office rental"],
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: "Huddle — Find Coworking Spaces Near You",
      description: `Browse ${count} coworking spaces across ${stats.totalCities} US cities. Request tours and contact spaces directly.`,
      type: "website",
      url: SITE_URL,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
