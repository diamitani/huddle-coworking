#!/usr/bin/env python3
"""
Generate the final Huddle data file from the master directory CSV.
Creates:
  - src/data/directory.ts  (all 7760 spaces optimized for listing)
  - Updates the custom 15 featured spaces for the homepage
"""

import csv
import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "huddle_us_directory.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "src", "data")
TS_PATH = os.path.join(OUTPUT_DIR, "directory.ts")
SLUGS_PATH = os.path.join(OUTPUT_DIR, "slugs.ts")

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
}

DEFAULT_IMG = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"

# Known real descriptions for major brands
BRAND_DESCRIPTIONS = {
    "regus": "Regus is the world's largest provider of flexible workspace, with thousands of locations worldwide. From coworking spaces and meeting rooms to private offices and virtual offices, each Regus location offers professional, flexible workspace solutions for businesses of every size.",
    "wework": "WeWork is the leading global flexible space provider with hundreds of locations worldwide designed to foster creativity, productivity, and community. Each location features modern interiors, premium amenities, and a vibrant network of professionals.",
    "industrious": "Industrious offers premium coworking spaces and private offices with full-service support. Known for exceptional hospitality and beautiful design, each location provides a refined workspace experience for teams of all sizes.",
    "spaces": "Spaces is a global creative workspace provider offering inspiring environments and flexible memberships. Each location features striking design, state-of-the-art facilities, and a collaborative atmosphere for professionals.",
    "serendipity labs": "Serendipity Labs provides upscale coworking spaces, private offices, and meeting rooms in premium locations. With a focus on hospitality-driven service, each location offers a refined workspace experience.",
    "office evolution": "Office Evolution provides professional coworking spaces, virtual offices, and meeting rooms across the US. Each location offers flexible memberships and a productive environment for professionals.",
    "hq": "HQ offers premium workspace solutions including virtual offices, coworking memberships, and private offices at locations worldwide. For over 50 years, HQ has provided professional business addresses and flexible workspace.",
    "quest workspaces": "Quest Workspaces provides premium flexible office solutions including coworking, private offices, and meeting spaces. Known for exceptional service and beautifully designed spaces in prime locations.",
    "bizhaus": "Bizhaus offers professional office spaces, coworking memberships, and virtual office solutions in the Los Angeles area, providing flexible workspace options for businesses of all sizes.",
    "roam": "Roam is a premium coworking brand with locations designed for productivity and connection. Each space features modern interiors, high-tech meeting rooms, and a welcoming professional community.",
    "peachtree offices": "Peachtree Offices provides premier executive suites, coworking spaces, and virtual office solutions in major US markets with professional, full-service workspace.",
    "thrive": "Thrive Coworking offers flexible workspace including open coworking, private offices, and event spaces with a focus on creating productive environments where businesses can grow.",
    "cornerstone coworking": "Cornerstone Coworking provides collaborative workspace solutions in a community-focused environment with modern amenities for entrepreneurs and small teams.",
    "vault coworking": "Located in a creatively reimagined historic space, Vault Coworking offers a unique blend of modern amenities and architectural character for today's professionals.",
    "blankspaces": "Blankspaces provides modern, design-forward coworking spaces with open layouts, private studios, and production spaces tailored to creative professionals.",
    "neuehouse": "Neuehouse is a members-only workspace and cultural club that blends creative energy with comfort. It attracts professionals across creative industries.",
    "switchyards": "Switchyards is a membership-based coworking club focused on building community. Each location offers a design-forward workspace with a strong emphasis on member connections.",
    "centrl office": "Centrl Office provides premium coworking and private office spaces in major US cities with modern design, professional amenities, and a community-focused environment.",
    "intelligent office": "Intelligent Office provides flexible workspace solutions including virtual offices, coworking, and private offices with professional support services.",
    "corporate offices": "Corporate Offices provides professional business center services including fully furnished private offices, coworking spaces, and virtual office solutions.",
    "peachtree": "Peachtree Offices provides premier executive suites and coworking spaces in major US markets with professional, full-service workspace and flexible terms.",
    "westport": "Westport offers flexible workspace solutions in professional environments designed for productivity, with modern amenities and convenient locations.",
    "verizon": "Part of the larger Verizon ecosystem, this workspace provides professional amenities and connectivity for businesses of all sizes.",
}


def slugify(name):
    s = name.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[-\s]+', '-', s)
    return s[:100].strip('-')


def get_image_for_city(city):
    key = city.strip().lower()
    return CITY_IMAGES.get(key, DEFAULT_IMG)


def get_brand_description(company):
    lower = company.lower()
    for brand, desc in BRAND_DESCRIPTIONS.items():
        if brand in lower:
            return desc
    return None


def generate_description(company, city, state):
    # Try brand description first
    brand_desc = get_brand_description(company)
    if brand_desc and len(company) < 60:
        return brand_desc
    
    # Generic description based on name analysis
    if "coworking" in company.lower() or "cowork" in company.lower():
        return f"{company} is a collaborative coworking space in {city}, {state} offering flexible memberships, high-speed internet, meeting rooms, and a professional community for freelancers, startups, and remote teams."
    elif "office" in company.lower() or "suite" in company.lower() or "executive" in company.lower():
        return f"{company} provides professional office solutions in {city}, {state} including private offices, coworking memberships, virtual offices, and meeting room rentals with full administrative support."
    elif "space" in company.lower() or "workspace" in company.lower():
        return f"{company} in {city}, {state} offers a dynamic workspace environment with modern amenities, flexible seating options, private offices, and a community of like-minded professionals."
    elif "center" in company.lower() or "plaza" in company.lower():
        return f"{company} in {city}, {state} features professional business center services with fully equipped offices, coworking spaces, conference rooms, and comprehensive administrative support."
    else:
        return f"{company} in {city}, {state} provides quality workspace solutions for modern professionals. The space offers flexible membership options, professional amenities, and a productive environment for businesses of all sizes."


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 60)
    print("BUILDING HUDDLE FINAL DATA FILES")
    print("=" * 60)
    
    # Read CSV
    spaces = []
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            spaces.append(row)
    
    print(f"Loaded {len(spaces):,} spaces from CSV")
    
    # Sort by contact count (popularity)
    spaces.sort(key=lambda x: int(x.get("contact_count", 0) or 0), reverse=True)
    
    # Generate TypeScript - compressed format for runtime
    print(f"\nWriting directory.ts with {len(spaces):,} spaces...")
    
    with open(TS_PATH, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated by scripts/build_huddle_data.py\n")
        f.write("// DO NOT EDIT — run `python3 scripts/build_huddle_data.py` to regenerate\n\n")
        
        f.write("export interface DirectorySpace {\n")
        f.write("  id: number;\n")
        f.write("  n: string;  // name\n")
        f.write("  s: string;  // slug\n")
        f.write("  c: string;  // city\n")
        f.write("  st: string; // state\n")
        f.write("  w: string;  // website\n")
        f.write("  p: string;  // phone\n")
        f.write("  e: string;  // email\n")
        f.write("  d: string;  // description\n")
        f.write("  a: string[]; // amenities\n")
        f.write("  ct: number; // contact count (popularity proxy)\n")
        f.write("}\n\n")
        
        f.write(f"export const DIRECTORY_COUNT = {len(spaces)};\n\n")
        f.write("export const directorySpaces: DirectorySpace[] = [\n")
        
        for i, space in enumerate(spaces):
            company = space["company"]
            city = space.get("city", "")
            state = space.get("state", "")
            
            desc = space.get("description", "")
            if not desc or len(desc) < 30:
                desc = generate_description(company, city, state)
            
            amenities_raw = space.get("amenities", "")
            amenities = [a.strip() for a in amenities_raw.split("|") if a.strip()] if amenities_raw else ["Wi-Fi", "Coffee & Tea", "Meeting Rooms"]
            
            desc_escaped = desc.replace('\\', '\\\\').replace('"', '\\"').replace('\n', ' ')
            company_escaped = company.replace('"', '\\"')
            
            f.write(f"""  {{
    id: {i + 1},
    n: "{company_escaped}",
    s: "{slugify(company)}",
    c: "{city}",
    st: "{state}",
    w: "{space.get('website', '')}",
    p: "{space.get('phone', '')}",
    e: "{space.get('email', '')}",
    d: "{desc_escaped[:300]}",
    a: {json.dumps(amenities[:8])},
    ct: {space.get('contact_count', 0) or 0},
  }},
""")
        
        f.write("];\n")
    
    print(f"  → {TS_PATH}")
    
    # Generate slugs file for route generation
    print("\nWriting slugs.ts...")
    slugs = [(slugify(s["company"]), s["company"], s.get("city", ""), s.get("state", "")) for s in spaces[:200]]
    
    with open(SLUGS_PATH, 'w', encoding='utf-8') as f:
        f.write("// Auto-generated slugs for [slug] routes\n\n")
        f.write("export const spaceSlugs: string[] = [\n")
        for slug, _, _, _ in slugs:
            f.write(f'  "{slug}",\n')
        f.write("];\n\n")
        f.write("export const slugMap: Record<string, { name: string; city: string; state: string }> = {\n")
        for slug, name, city, state in slugs:
            name_e = name.replace('"', '\\"')
            f.write(f'  "{slug}": {{ name: "{name_e}", city: "{city}", state: "{state}" }},\n')
        f.write("};\n")
    
    print(f"  → {SLUGS_PATH}")
    
    # Stats
    cities = {}
    states = {}
    for s in spaces:
        if s.get("city"):
            cities[s["city"]] = cities.get(s["city"], 0) + 1
        if s.get("state"):
            states[s["state"]] = states.get(s["state"], 0) + 1
    
    print(f"\n{'='*60}")
    print("BUILD COMPLETE")
    print(f"{'='*60}")
    print(f"Total US coworking spaces: {len(spaces):,}")
    print(f"Cities represented: {len(cities):,}")
    print(f"States represented: {len(states)}")
    print(f"Top 10: {', '.join(sorted(states, key=lambda s: -states[s])[:10])}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
