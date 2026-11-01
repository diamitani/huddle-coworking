import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Browse Coworking Spaces Across the US | Huddle",
  description:
    "Search and compare verified coworking spaces across the US. Filter by city and state, request tours, and contact spaces directly — no account needed.",
}

export default function SpacesLayout({ children }: { children: React.ReactNode }) {
  return children
}
