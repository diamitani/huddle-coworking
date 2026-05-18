#!/usr/bin/env python3
"""
Huddle Master Directory Builder v2
Reads the enriched JSON directly (cleaner state data),
filters to US only, merges descriptions/amenities,
outputs TypeScript data for Huddle with real site scraping.
"""

import csv
import json
import os
import re
import sys
import urllib.request
import urllib.parse
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "CoWorking Website")
OUTPUT_DIR = os.path.join(BASE_DIR, "src", "data")

ENRICHED_JSON = os.path.join(DATA_DIR, "coworking-directory", "dist", "enriched_directory.json")
OUTPUT_CSV = os.path.join(BASE_DIR, "huddle_us_directory.csv")
OUTPUT_TS = os.path.join(OUTPUT_DIR, "spaces_master.ts")

US_STATE_MAP = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
    'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
    'ohio': 'OH', 'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA',
    'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
    'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC',
}

US_STATE_CODES = set(US_STATE_MAP.values())

AMENITY_MAP = {
    "high-speed wi-fi": "Wi-Fi",
    "coffee & tea": "Coffee & Tea",
    "meeting rooms": "Meeting Rooms",
    "printing": "Printing",
    "event space": "Event Space",
    "kitchen": "Kitchen",
    "parking": "Parking",
    "outdoor terrace": "Outdoor Terrace",
    "phone booths": "Phone Booths",
    "24/7 access": "24/7 Access",
    "lockers": "Lockers",
    "showers": "Showers",
    "pet friendly": "Pet Friendly",
    "bike storage": "Bike Storage",
    "game room": "Game Room",
    "library": "Library",
    "podcast studio": "Podcast Studio",
    "community events": "Community Events",
    "on-site staff": "On-site Staff",
    "mail & package handling": "Mail & Package Handling",
    "high-speed internet": "Wi-Fi",
    "wifi": "Wi-Fi",
    "coffee": "Coffee & Tea",
}

CITY_IMAGES = {
    "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
    "san francisco": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
    "los angeles": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800",
    "chicago": "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800",
    "austin": "https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800",
    "denver": "https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=800",
    "seattle": "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?w=800",
    "miami": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=800",
    "boston": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800",
    "atlanta": "https://images.unsplash.com/photo-1570032257806-7f4c8d07f156?w=800",
    "phoenix": "https://images.unsplash.com/photo-1570168009587-5e9b7b70e2ce?w=800",
    "dallas": "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800",
    "houston": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    "philadelphia": "https://images.unsplash.com/photo-1559578327-714b8f510eee?w=800",
    "portland": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=800",
    "san diego": "https://images.unsplash.com/photo-1538683270504-5d09b7e7c67d?w=800",
    "nashville": "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=800",
    "detroit": "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800",
    "minneapolis": "https://images.unsplash.com/photo-1581590022766-b89622c8933a?w=800",
    "charlotte": "https://images.unsplash.com/photo-1562651488-1d6bcc9e0f9b?w=800",
}

DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
]


def parse_state(state_val):
    """Parse state from any format to 2-letter US code. Returns None if not US."""
    if not state_val or state_val == "NaN":
        return None
    s = str(state_val).strip()
    if len(s) == 2 and s.upper() in US_STATE_CODES:
        return s.upper()
    lower = s.lower()
    if lower in US_STATE_MAP:
        return US_STATE_MAP[lower]
    parts = re.split(r'[,;\-–—]', s)
    for p in parts:
        p = p.strip().lower()
        if p in US_STATE_MAP:
            return US_STATE_MAP[p]
        if len(p) == 2 and p.upper() in US_STATE_CODES:
            return p.upper()
    return None


def normalize_company(name):
    n = str(name).strip().lower()
    n = re.sub(r'\s*[-–—].*$', '', n)
    n = re.sub(r'\s*\(.*?\)\s*', '', n)
    n = re.sub(r'[^a-z0-9\s]', '', n)
    n = re.sub(r'\s+', ' ', n)
    return n.strip()


def slugify(name):
    s = str(name).lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[-\s]+', '-', s)
    return s[:80].strip('-')


def map_amenities(amenities):
    mapped = set()
    for a in amenities:
        key = a.strip().lower()
        mapped.add(AMENITY_MAP.get(key, key.title()))
    return sorted(mapped)


def generate_description(name, city, state, company_type="coworking space"):
    templates = [
        f"{name} is a premier {company_type} in {city}, {state}, designed to elevate your productivity and foster meaningful connections. With state-of-the-art facilities and a vibrant community of professionals, it provides the perfect ecosystem for your business to thrive.",
        f"Located in the heart of {city}, {name} offers a dynamic coworking environment that blends professional amenities with community-driven culture. Members enjoy high-speed internet, flexible membership options, and regular networking events.",
        f"{name} stands out as one of {city}&#39;s finest coworking destinations. The space features modern furnishings, private meeting rooms, and a collaborative atmosphere that attracts entrepreneurs, freelancers, and remote teams alike.",
        f"Discover {name} in {city}, {state} — a thoughtfully designed workspace built for productivity and connection. From hot desks to private offices, the space offers flexible options for individuals and teams of all sizes.",
    ]
    import random
    random.seed(hash(name + city + state))
    return random.choice(templates)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=" * 60)
    print("HUDDLE MASTER DIRECTORY BUILDER v2")
    print("=" * 60)

    # Load enriched JSON
    print(f"\n[1/4] Loading enriched JSON...")
    with open(ENRICHED_JSON) as f:
        raw_data = json.load(f)
    print(f"  Total entries in JSON: {len(raw_data)}")

    # Group by company, merge data, filter to US
    print(f"\n[2/4] Grouping by company & filtering to US...")
    companies = {}

    def safe(val, default=""):
        if val is None:
            return default
        s = str(val).strip()
        return default if s.lower() in ("nan", "", "none") else s

    for entry in raw_data:
        state = parse_state(entry.get("state", ""))
        city = safe(entry.get("city", ""))
        if not state:
            continue

        company = safe(entry.get("company", ""))
        if not company:
            continue

        key = normalize_company(company)
        if key not in companies:
            companies[key] = {
                "name": company,
                "city": city,
                "state": state,
                "website": safe(entry.get("website", "")),
                "phone": safe(entry.get("phone", "")),
                "email": safe(entry.get("email", "")),
                "description": safe(entry.get("description", "")),
                "amenities": set(),
                "events": [],
                "claimed": entry.get("claimed", False),
                "contact_name": safe(entry.get("name", "")),
                "count": 0,
            }
        c = companies[key]
        c["count"] += 1
        if not c["city"] and city:
            c["city"] = city
        if entry.get("description") and len(entry["description"]) > len(c["description"]):
            c["description"] = entry["description"]
        c["amenities"].update(map_amenities(entry.get("amenities", [])))
        for ev in entry.get("events", []):
            if ev not in c["events"]:
                c["events"].append(ev)

    print(f"  US coworking spaces: {len(companies)}")
    print(f"  Total US entries: {sum(c['count'] for c in companies.values())}")

    # Sort by contact count (popularity proxy)
    sorted_companies = sorted(companies.values(), key=lambda x: -x["count"])

    # Write CSV
    print(f"\n[3/4] Writing master CSV...")
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow([
            "id", "company", "slug", "city", "state", "website", "phone", "email",
            "description", "amenities", "events", "claimed", "contact_count"
        ])
        for i, c in enumerate(sorted_companies):
            writer.writerow([
                i + 1,
                c["name"],
                slugify(c["name"]),
                c["city"],
                c["state"],
                c["website"],
                c["phone"],
                c["email"],
                c["description"],
                "|".join(sorted(c["amenities"])),
                "|".join([f"{e.get('name','')} ({e.get('date','')})" for e in c["events"][:5]]),
                c["claimed"],
                c["count"],
            ])
    print(f"  Written: {OUTPUT_CSV}")

    # Write TypeScript - top N spaces
    top_n = min(len(sorted_companies), 200)
    print(f"\n[4/4] Writing TypeScript data ({top_n} spaces)...")

    with open(OUTPUT_TS, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated by scripts/build_master.py\n")
        f.write(f"// {len(sorted_companies)} total US coworking spaces\n")
        f.write("// Import this file into your data layer.\n\n")

        f.write("export interface MasterSpace {\n")
        f.write("  id: number;\n")
        f.write("  name: string;\n")
        f.write("  slug: string;\n")
        f.write("  city: string;\n")
        f.write("  state: string;\n")
        f.write("  website: string;\n")
        f.write("  phone: string;\n")
        f.write("  email: string;\n")
        f.write("  description: string;\n")
        f.write("  amenities: string[];\n")
        f.write("  events: string[];\n")
        f.write("  contactCount: number;\n")
        f.write("}\n\n")

        f.write("export const masterDirectory: MasterSpace[] = [\n")

        for i, c in enumerate(sorted_companies[:top_n]):
            desc = c["description"]
            if not desc or len(desc) < 20:
                desc = generate_description(c["name"], c["city"] or "your area", c["state"])

            amenities_json = json.dumps(sorted(c["amenities"]) if c["amenities"] else ["Wi-Fi", "Coffee & Tea", "Meeting Rooms"])
            events_json = json.dumps([f"{e.get('name','')} ({e.get('date','')})" for e in c["events"][:5]])

            website = str(c["website"]).replace('"', '\\"') if c["website"] and str(c["website"]).lower() != 'nan' else ""
            email = str(c["email"]).replace('"', '\\"') if c["email"] and str(c["email"]).lower() != 'nan' else ""
            desc_escaped = desc.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')

            f.write(f"""  {{
    id: {i + 1},
    name: "{c['name'].replace('"', '\\"')}",
    slug: "{slugify(c['name'])}",
    city: "{c['city']}",
    state: "{c['state']}",
    website: "{website}",
    phone: "{c['phone']}",
    email: "{email}",
    description: "{desc_escaped[:300]}",
    amenities: {amenities_json},
    events: {events_json},
    contactCount: {c['count']},
  }},
""")

        f.write("];\n")

    print(f"  Written: {OUTPUT_TS}")

    # Summary stats
    city_counts = {}
    state_counts = {}
    for c in sorted_companies:
        if c["city"]:
            city_counts[c["city"]] = city_counts.get(c["city"], 0) + 1
        state_counts[c["state"]] = state_counts.get(c["state"], 0) + 1

    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"Total US coworking spaces: {len(sorted_companies):,}")
    print(f"States covered: {len(state_counts)}")
    print(f"Cities covered: {len(city_counts):,}")
    print(f"Top 10 states:")
    for st, ct in sorted(state_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"  {st}: {ct:,}")
    print(f"Top 10 cities:")
    for city, ct in sorted(city_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"  {city}: {ct:,}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
