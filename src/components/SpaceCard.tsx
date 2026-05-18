"use client"

import Link from "next/link"
import { Star, MapPin, Wifi, Coffee, Users } from "lucide-react"
import { cn } from "@/lib/cn"
import { formatPrice } from "@/lib/cn"
import type { CoworkingSpace } from "@/data/spaces"

interface SpaceCardProps {
  space: CoworkingSpace
  featured?: boolean
}

export default function SpaceCard({ space, featured }: SpaceCardProps) {
  return (
    <Link
      href={`/spaces/${space.slug}`}
      className={cn(
        "group block bg-white rounded-2xl border border-warm-200 overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1",
        featured && "ring-2 ring-brand-200"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-warm-200">
        <img
          src={space.images[0]}
          alt={space.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {space.featured && (
            <span className="px-2.5 py-1 rounded-full bg-brand-500 text-white text-xs font-medium shadow-md">
              Featured
            </span>
          )}
          {space.popular && !space.featured && (
            <span className="px-2.5 py-1 rounded-full bg-accent-500 text-white text-xs font-medium shadow-md">
              Popular
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-medium text-navy-500">
            <Star className="w-3.5 h-3.5 text-accent-500" fill="currentColor" />
            {space.rating} ({space.reviewCount})
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-heading font-semibold text-navy-500 group-hover:text-brand-600 transition-colors leading-tight">
            {space.name}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-sm text-warm-700 mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{space.city}, {space.state}</span>
        </div>
        <p className="text-sm text-warm-700 leading-relaxed line-clamp-2 mb-4">
          {space.shortDescription}
        </p>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-xs text-warm-600">
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-warm-600">
            <Coffee className="w-3.5 h-3.5" />
            <span>Coffee</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-warm-600">
            <Users className="w-3.5 h-3.5" />
            <span>{space.memberCount}+ members</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-warm-200">
          <div>
            <span className="text-lg font-bold text-navy-500">{formatPrice(space.pricing.monthly)}</span>
            <span className="text-sm text-warm-600">/mo</span>
          </div>
          <span className="text-xs text-brand-600 font-medium group-hover:underline underline-offset-2">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
