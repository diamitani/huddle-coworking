import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Coworking Spaces by City | Huddle",
  description:
    "Explore coworking spaces by city. Find and compare workspaces, request tours, and contact operators directly.",
}

export default function CitiesLayout({ children }: { children: React.ReactNode }) {
  return children
}
