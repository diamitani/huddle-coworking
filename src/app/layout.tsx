import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import SpaceGate from "@/components/SpaceGate"

export const metadata: Metadata = {
  title: "Huddle — The #1 Coworking Space Directory",
  description:
    "Find, compare, and book the perfect coworking space near you. 1,073 spaces across 476 US cities. Compare amenities and contact spaces directly.",
  keywords: ["coworking", "coworking space", "shared office", "workspace", "remote work", "office rental"],
  openGraph: {
    title: "Huddle — Find Your Perfect Coworking Space",
    description: "The world's #1 coworking space directory. Discover 1,073 spaces across 476 US cities.",
    type: "website",
  },
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
        <SpaceGate>
          <main className="flex-1">{children}</main>
        </SpaceGate>
        <Footer />
      </body>
    </html>
  )
}
