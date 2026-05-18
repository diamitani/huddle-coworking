#!/usr/bin/env python3
"""Merge OSM coworking data with validated directory, deduplicate."""
import json, os, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE, "public", "data", "directory.json")) as f:
    existing = json.load(f)

with open(os.path.join(BASE, "public", "data", "osm_coworking.json")) as f:
    osm = json.load(f)

print(f"Existing validated: {len(existing)}")
print(f"OSM coworking: {len(osm)}")

# Build lookup by name
def normalize(name):
    return re.sub(r'[^a-z0-9]', '', name.lower().strip())

existing_keys = {normalize(s['n']): s for s in existing}

merged = list(existing)  # Start with all validated
added = 0
for s in osm:
    key = normalize(s['name'])
    if key not in existing_keys:
        merged.append({
            'id': len(merged) + 1,
            'n': s['name'],
            'c': s.get('city', ''),
            'st': s.get('state', ''),
            'w': s.get('website', ''),
            'd': f"Coworking space located in {s.get('city', 'your area')}, {s.get('state', '')}.",
            'a': ['Wi-Fi', 'Coffee & Tea', 'Meeting Rooms'],
            'ct': 0,
            'lat': s.get('lat', 0),
            'lng': s.get('lon', 0),
        })
        added += 1
    else:
        # Update lat/lng for existing entry if missing
        existing_entry = existing_keys[key]
        if existing_entry.get('lat', 0) == 0 and s.get('lat', 0) != 0:
            existing_entry['lat'] = s['lat']
            existing_entry['lng'] = s['lon']

print(f"Added from OSM: {added}")
print(f"Total merged: {len(merged)}")

# Stats
states = {}
cities = set()
for s in merged:
    states[s['st']] = states.get(s['st'], 0) + 1
    if s['c']:
        cities.add(s['c'])

print(f"States: {len(states)}, Cities: {len(cities)}")

# Write merged
with open(os.path.join(BASE, "public", "data", "directory.json"), 'w') as f:
    json.dump(merged, f)

# Update stats
city_list = {}
for s in merged:
    if s['c']:
        city_list[s['c']] = city_list.get(s['c'], 0) + 1
top_cities = sorted(city_list.items(), key=lambda x: -x[1])[:20]

stats = {
    'totalSpaces': len(merged),
    'totalCities': len(cities),
    'topStates': dict(sorted(states.items(), key=lambda x: -x[1])[:10]),
    'topCities': [{'city': k, 'count': v, 'state': ''} for k, v in top_cities],
}
with open(os.path.join(BASE, "public", "data", "stats.json"), 'w') as f:
    json.dump(stats, f)

print(f"\nFinal stats:")
print(f"  Spaces: {len(merged)}")
print(f"  Cities: {len(cities)}")
print(f"  States: {len(states)}")
print(f"  Top: {', '.join(sorted(states, key=lambda x: -states[x])[:10])}")
