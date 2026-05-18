#!/usr/bin/env python3
"""Generate compressed directory JSON for runtime use."""
import csv, json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV = os.path.join(BASE, "huddle_us_directory.csv")
OUT = os.path.join(BASE, "public", "data", "directory.json")

os.makedirs(os.path.dirname(OUT), exist_ok=True)

spaces = []
with open(CSV, newline='', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        spaces.append(row)

spaces.sort(key=lambda x: int(x.get("contact_count", 0) or 0), reverse=True)

compressed = []
for s in spaces:
    amenities = [a.strip() for a in s.get("amenities","").split("|") if a.strip()] if s.get("amenities") else ["Wi-Fi","Coffee & Tea","Meeting Rooms"]
    compressed.append({
        "id": len(compressed) + 1,
        "n": s["company"],
        "c": s.get("city", ""),
        "st": s.get("state", ""),
        "w": s.get("website", ""),
        "d": (s.get("description", "") or "")[:250],
        "a": amenities[:6],
        "ct": int(s.get("contact_count", 0) or 0),
    })

with open(OUT, "w") as f:
    json.dump(compressed, f)

data = json.dumps(compressed)
print(f"Written: {OUT}")
print(f"Spaces: {len(compressed):,}")
print(f"Size: {len(data):,} bytes ({len(data)/1024:.1f} KB)")
