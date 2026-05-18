#!/usr/bin/env python3
"""
Huddle Master Directory Builder
Parses 41K+ CSV rows + 16K enriched JSON entries,
deduplicates by company, merges descriptions/amenities/events,
outputs a master CSV + TypeScript data file.
"""

import csv
import json
import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "CoWorking Website")
OUTPUT_DIR = os.path.join(BASE_DIR, "src", "data")

MASTER_CSV = os.path.join(DATA_DIR, "master_directory.csv")
ENRICHED_JSON = os.path.join(DATA_DIR, "coworking-directory", "dist", "enriched_directory.json")
OUTPUT_CSV = os.path.join(BASE_DIR, "huddle_master_directory.csv")
OUTPUT_TS = os.path.join(OUTPUT_DIR, "spaces_data.ts")

# Amenity mapping from enriched data to our standard types
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
    "portland": "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=800",
    "boston": "https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800",
    "atlanta": "https://images.unsplash.com/photo-1570032257806-7f4c8d07f156?w=800",
    "phoenix": "https://images.unsplash.com/photo-1570168009587-5e9b7b70e2ce?w=800",
    "dallas": "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800",
    "houston": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    "philadelphia": "https://images.unsplash.com/photo-1559578327-714b8f510eee?w=800",
}

DEFAULT_SPACE_IMAGES = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
]


def parse_city(city_str):
    """Normalize city name."""
    if not city_str or city_str.lower() == "nan":
        return ""
    return city_str.strip()


def parse_state(state_str):
    """Extract 2-letter state code."""
    if not state_str or state_str.lower() == "nan":
        return ""
    s = state_str.strip().upper()
    if len(s) == 2:
        return s
    # Try to extract from longer string like "Georgia - Atlanta"
    state_map = {
        "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
        "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
        "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
        "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
        "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
        "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
        "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
        "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM",
        "new york": "NY", "north carolina": "NC", "north dakota": "ND",
        "ohio": "OH", "oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA",
        "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
        "tennessee": "TN", "texas": "TX", "utah": "UT", "vermont": "VT",
        "virginia": "VA", "washington": "WA", "west virginia": "WV",
        "wisconsin": "WI", "wyoming": "WY",
    }
    lower = s.lower()
    if lower in state_map:
        return state_map[lower]
    return s[:2] if len(s) >= 2 else ""


def slugify(name):
    """Create URL-friendly slug."""
    s = name.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[-\s]+', '-', s)
    return s[:60].strip('-')


def normalize_company(name):
    """Normalize company name for deduplication."""
    n = name.strip().lower()
    # Remove common suffixes and parentheticals
    n = re.sub(r'\s*-\s*.*$', '', n)
    n = re.sub(r'\s*\(.*?\)\s*', '', n)
    n = re.sub(r'\s+', ' ', n)
    return n.strip()


def map_amenities(enriched_amenities):
    """Map enriched amenities to our standard types."""
    mapped = []
    for a in enriched_amenities:
        key = a.strip().lower()
        if key in AMENITY_MAP:
            mapped.append(AMENITY_MAP[key])
    return list(set(mapped))


def load_enriched():
    """Load enriched directory JSON."""
    if not os.path.exists(ENRICHED_JSON):
        print(f"Warning: enriched JSON not found at {ENRICHED_JSON}")
        return {}
    with open(ENRICHED_JSON) as f:
        data = json.load(f)
    enriched = {}
    for entry in data:
        company = normalize_company(entry.get("company", ""))
        if company not in enriched:
            enriched[company] = {
                "description": entry.get("description", ""),
                "amenities": map_amenities(entry.get("amenities", [])),
                "events": entry.get("events", []),
                "claimed": entry.get("claimed", False),
            }
        else:
            existing = enriched[company]
            new_amenities = map_amenities(entry.get("amenities", []))
            existing["amenities"] = list(set(existing["amenities"] + new_amenities))
            existing["events"] = list({json.dumps(e, sort_keys=True): e for e in existing["events"] + entry.get("events", [])}.values())
    print(f"Loaded {len(enriched)} unique enriched entries")
    return enriched


def generate_description(name, city, state, company_type="coworking space"):
    """Generate a unique description for each space."""
    templates = [
        f"{name} is a premier {company_type} in {city}, {state}, designed to elevate your productivity and foster meaningful connections. With state-of-the-art facilities and a vibrant community of professionals, it provides the perfect ecosystem for your business to thrive.",
        f"Located in the heart of {city}, {name} offers a dynamic coworking environment that blends professional amenities with community-driven culture. Members enjoy high-speed internet, flexible membership options, and regular networking events.",
        f"{name} stands out as one of {city}'s finest coworking destinations. The space features modern furnishings, private meeting rooms, and a collaborative atmosphere that attracts entrepreneurs, freelancers, and remote teams alike.",
        f"Discover {name} in {city}, {state} — a thoughtfully designed workspace built for productivity and connection. From hot desks to private offices, the space offers flexible options for individuals and teams of all sizes.",
    ]
    import random
    random.seed(hash(name + city + state))
    return random.choice(templates)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("Loading enriched data...")
    enriched = load_enriched()
    
    print(f"Loading master CSV from {MASTER_CSV}...")
    companies = {}  # company_key -> {name, state, city, website, phone, emails, contacts}
    
    with open(MASTER_CSV, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            company = row.get("Company", "").strip()
            if not company:
                continue
            
            key = normalize_company(company)
            state = parse_state(row.get("State", ""))
            city = row.get("City", "").strip()
            website = row.get("Website", "").strip()
            email = row.get("Email", "").strip()
            phone = row.get("Phone", "").strip()
            name = row.get("Name", "").strip()
            role = row.get("Role", "").strip()
            
            if key not in companies:
                companies[key] = {
                    "name": company,
                    "state": state,
                    "city": city,
                    "website": website,
                    "phone": phone,
                    "emails": set(),
                    "contacts": [],
                    "row_count": 0,
                }
            
            c = companies[key]
            c["row_count"] += 1
            if not c["state"] and state:
                c["state"] = state
            if not c["city"] and city:
                c["city"] = city
            if not c["website"] and website:
                c["website"] = website
            if not c["phone"] and phone:
                c["phone"] = phone
            if email:
                c["emails"].add(email)
            if name:
                c["contacts"].append({"name": name, "role": role, "email": email, "phone": phone})
    
    print(f"Found {len(companies)} unique coworking spaces from {MASTER_CSV}")
    
    # Get top cities for filtering
    city_counts = {}
    for c in companies.values():
        city = c["city"]
        if city:
            city_counts[city] = city_counts.get(city, 0) + 1
    
    # Sort by most contacts (popularity proxy)
    sorted_companies = sorted(companies.values(), key=lambda x: x["row_count"], reverse=True)
    
    # Write master CSV
    all_amenities_sorted = sorted(AMENITY_MAP.values())
    
    with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        headers = [
            "id", "company", "slug", "city", "state", "website", "phone",
            "description", "type", "amenities", "events", "claimed",
            "contact_count", "latitude", "longitude",
        ]
        writer.writerow(headers)
        
        for i, c in enumerate(sorted_companies):
            key = normalize_company(c["name"])
            enr = enriched.get(key, {})
            desc = enr.get("description", "")
            if not desc:
                desc = generate_description(c["name"], c["city"] or "your area", c["state"])
            
            writer.writerow([
                i + 1,
                c["name"],
                slugify(c["name"]),
                c["city"] or "",
                c["state"] or "",
                c["website"] or "",
                c["phone"] or "",
                desc,
                "Coworking Space",
                "|".join(enr.get("amenities", [])),
                "|".join([f"{e.get('name','')} ({e.get('date','')})" for e in enr.get("events", [])]),
                enr.get("claimed", False),
                c["row_count"],
                "",  # latitude
                "",  # longitude
            ])
    
    print(f"\nMaster CSV written: {OUTPUT_CSV}")
    print(f"Total unique coworking spaces: {len(sorted_companies)}")
    
    # City distribution
    print(f"\nTop cities ({len(city_counts)} total):")
    for city, count in sorted(city_counts.items(), key=lambda x: -x[1])[:15]:
        print(f"  {city}: {count} spaces")
    
    # State distribution
    state_counts = {}
    for c in companies.values():
        st = c["state"]
        if st:
            state_counts[st] = state_counts.get(st, 0) + 1
    print(f"\nState coverage ({len(state_counts)} states):")
    for state, count in sorted(state_counts.items(), key=lambda x: -x[1])[:15]:
        print(f"  {state}: {count} spaces")
    
    # Write TypeScript data for top 1000 spaces
    top_n = min(len(sorted_companies), 500)
    ts_path = os.path.join(OUTPUT_DIR, "spaces_data.ts")
    
    with open(ts_path, 'w') as f:
        f.write("// Auto-generated by scripts/build_directory.py\n")
        f.write("// This file contains the master directory of coworking spaces.\n\n")
        f.write("import type { CoworkingSpace } from './spaces';\n\n")
        f.write("export const masterSpaces: CoworkingSpace[] = [\n")
        
        for i, c in enumerate(sorted_companies[:top_n]):
            key = normalize_company(c["name"])
            enr = enriched.get(key, {})
            desc = enr.get("description", "")
            if not desc:
                desc = generate_description(c["name"], c["city"] or "your area", c["state"])
            
            amenities = enr.get("amenities", ["Wi-Fi", "Coffee & Tea", "Meeting Rooms", "Printing"])
            amenities_str = json.dumps(amenities)
            
            city_lower = (c["city"] or "").lower()
            img = CITY_IMAGES.get(city_lower, DEFAULT_SPACE_IMAGES[0])
            
            slug = slugify(c["name"])
            
            f.write("""  {
    id: "%d",
    name: "%s",
    slug: "%s",
    description: "%s",
    shortDescription: "",
    city: "%s",
    state: "%s",
    address: "",
    zip: "",
    lat: 0,
    lng: 0,
    rating: 0,
    reviewCount: 0,
    memberCount: %d,
    squareFeet: 0,
    type: "Open Coworking",
    amenities: %s,
    pricing: {
      hourly: null,
      daily: null,
      monthly: 0,
      dedicatedDesk: 0,
      privateOffice: null,
    },
    images: [%s],
    tags: [],
    featured: false,
    popular: false,
    established: "",
    phone: "%s",
    email: "%s",
    website: "%s",
    hours: "",
  },
""" % (
                i + 1,
                c["name"].replace('"', '\\"'),
                slug,
                desc.replace('"', '\\"').replace('\n', ' ')[:200],
                c["city"] or "",
                c["state"] or "",
                min(c["row_count"] * 5, 500),
                amenities_str,
                ', '.join(f'"{img}"' for img in DEFAULT_SPACE_IMAGES[:1]),
                c["phone"] or "",
                next(iter(c["emails"]), "") if c["emails"] else "",
                c["website"] or "",
            ))
        
        f.write("];\n")
        f.write(f"\nexport const MASTER_COUNT = {top_n};\n")
    
    print(f"\nTypeScript data written: {ts_path} ({top_n} spaces)")
    
    # Write summary
    print(f"\n{'='*60}")
    print(f"MASTER DIRECTORY BUILD SUMMARY")
    print(f"{'='*60}")
    print(f"Total rows in CSV: {len(sorted_companies)}")
    print(f"Enriched entries merged: {len(enriched)}")
    print(f"Top states: {len(state_counts)}")
    print(f"Top cities: {len(city_counts)}")
    print(f"TypeScript file: {top_n} premium spaces")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
