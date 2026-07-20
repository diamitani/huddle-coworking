import Link from "next/link"
import { ArrowRight, Clock } from "lucide-react"
import Footer from "@/components/Footer"
import Navbar from "@/components/Navbar"

const posts = [
  {
    slug: "best-coworking-spaces-atlanta",
    title: "The Best Coworking Spaces in Atlanta, GA",
    excerpt: "Atlanta's coworking scene has exploded in recent years. From Midtown to Buckhead, here are our top picks for remote workers and startups.",
    date: "January 15, 2026",
    readTime: "5 min read",
    category: "City Guide",
  },
  {
    slug: "hot-desk-vs-dedicated-desk",
    title: "Hot Desk vs Dedicated Desk: Which is Right for You?",
    excerpt: "Choosing between a hot desk and a dedicated desk comes down to your work style, budget, and how often you plan to come in. Here's how to decide.",
    date: "January 8, 2026",
    readTime: "4 min read",
    category: "Guide",
  },
  {
    slug: "coworking-for-remote-teams",
    title: "How Remote Teams Are Using Coworking Spaces in 2026",
    excerpt: "Distributed teams are increasingly booking coworking spaces as hybrid work hubs. We looked at how the best remote teams are making it work.",
    date: "December 20, 2025",
    readTime: "6 min read",
    category: "Trends",
  },
  {
    slug: "how-to-list-your-coworking-space",
    title: "How to List Your Coworking Space on Huddle",
    excerpt: "A step-by-step walkthrough for space operators — from submitting your listing to getting your first inquiries.",
    date: "December 10, 2025",
    readTime: "3 min read",
    category: "For Operators",
  },
]

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-warm-50">
        <section className="bg-navy-500 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Huddle Blog</h1>
            <p className="text-warm-200 text-lg">Guides, city spotlights, and insights on coworking and remote work.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <article key={post.slug} className="bg-white rounded-2xl p-6 shadow-sm border border-warm-100 flex flex-col">
                  <div className="mb-3">
                    <span className="inline-block text-xs font-semibold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-heading font-bold text-navy-500 mb-2 leading-snug">{post.title}</h2>
                  <p className="text-warm-600 text-sm leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-xs text-warm-400">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`} className="flex items-center gap-1 text-xs font-semibold text-brand-500 hover:underline">
                      Read <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
