"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapViewProps {
  spaces: Array<{
    n: string
    c: string
    st: string
    lat?: number
    lng?: number
    ct: number
  }>
  height?: string
  onCitySelect?: (city: string, state: string) => void
}

export default function MapView({ spaces, height = "400px", onCitySelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [39.8283, -98.5795],
      zoom: 4,
      scrollWheelZoom: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map)

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Group by city to reduce marker count
    const cityGroups = new Map<string, { lat: number; lng: number; count: number; city: string; state: string }>()
    for (const s of spaces) {
      if (!s.lat || !s.lng) continue
      const key = `${s.c},${s.st}`
      if (!cityGroups.has(key)) {
        cityGroups.set(key, { lat: s.lat, lng: s.lng, count: 0, city: s.c, state: s.st })
      }
      cityGroups.get(key)!.count++
    }

    const markers: L.CircleMarker[] = []
    for (const [, group] of cityGroups) {
      const size = Math.min(Math.max(group.count, 3), 30)
      const color = group.count > 100 ? "#E8614D" : group.count > 30 ? "#F4A261" : "#1B1B2F"

      const marker = L.circleMarker([group.lat, group.lng], {
        radius: Math.sqrt(size) * 2.5,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map)

      marker.bindTooltip(`<strong>${group.city}, ${group.state}</strong><br/>${group.count} spaces`, {
        direction: "top",
        offset: L.point(0, -8),
      })

      if (onCitySelect) {
        marker.on("click", () => onCitySelect(group.city, group.state))
      }

      markers.push(marker)
    }

    // Fit bounds if we have markers
    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [spaces, onCitySelect])

  return (
    <div className="rounded-2xl overflow-hidden border border-warm-200 shadow-sm">
      <div ref={mapRef} style={{ height, width: "100%", zIndex: 0 }} />
    </div>
  )
}
