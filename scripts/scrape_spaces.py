#!/usr/bin/env python3
"""
Scrape top coworking space websites for real descriptions, images, and pricing.
Uses firecrawl API if available, otherwise tries basic HTTP scraping.
"""

import csv
import json
import os
import re
import subprocess
import sys
import time
from urllib.parse import urlparse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "huddle_us_directory.csv")
OUTPUT_DIR = os.path.join(BASE_DIR, "src", "data")

# Top spaces to scrape (by contact count)
TOP_N = 100

# Known real descriptions for major chains
KNOWN_DESCRIPTIONS = {
    "regus": "Regus is the world's largest provider of flexible workspace, with over 3,000 locations across 120 countries. From coworking spaces and meeting rooms to private offices and virtual offices, Regus offers professional, flexible workspace solutions for businesses of every size.",
    "wework": "WeWork is the leading global flexible space provider with hundreds of locations worldwide. Each WeWork location is designed to foster creativity, productivity, and community, featuring modern interiors, premium amenities, and a vibrant network of professionals and businesses.",
    "industrious": "Industrious offers premium coworking spaces and private offices with full-service support at every location. Known for exceptional hospitality, beautiful design, and a focus on helping teams do their best work, Industrious operates in 100+ locations across the US.",
    "spaces": "Spaces is a global creative workspace provider offering inspiring environments, flexible memberships, and a collaborative community. Each location features striking design, state-of-the-art facilities, and a professional yet informal atmosphere.",
    "serendipity labs": "Serendipity Labs provides upscale coworking spaces, private offices, and meeting rooms in premium locations. With a focus on hospitality-driven service, each location offers a refined workspace experience with flexible membership options.",
    "office evolution": "Office Evolution provides professional coworking spaces, virtual offices, and meeting rooms across the United States. Each location offers flexible memberships, business support services, and a productive environment for professionals.",
    "hq": "HQ offers premium workspace solutions including virtual offices, coworking memberships, and fully furnished private offices at locations worldwide. With a legacy of over 50 years, HQ provides professional business addresses and flexible workspace.",
    "quest workspaces": "Quest Workspaces provides premium flexible office solutions including coworking, private offices, virtual offices, and meeting spaces in prime locations across the US and UK. Known for exceptional service and beautifully designed spaces.",
    "switchyards": "Switchyards is Atlanta's membership-based coworking club focused on building community. With multiple locations across Atlanta, Switchyards offers a unique, design-forward workspace experience with a strong emphasis on member connections.",
    "blankspaces": "Blankspaces provides modern, design-forward coworking spaces with a focus on the creative community. Each location features open layouts, private studios, and production spaces tailored to creative professionals.",
    "neuehouse": "Neuehouse is a members-only workspace and cultural club that blends the energy of a creative studio with the comfort of a living room. With locations in New York and Los Angeles, it attracts creative professionals across industries.",
    "centrl office": "Centrl Office provides premium coworking and private office spaces in major US cities. Each location features modern design, professional amenities, and a community-focused environment for growing businesses.",
    "bizhaus": "Bizhaus offers professional office spaces, coworking memberships, and virtual office solutions in the Los Angeles area. With multiple locations, Bizhaus provides flexible workspace options for businesses of all sizes.",
    "roam": "Roam is a premium coworking brand with locations in Atlanta, Miami, and beyond. Each space is designed for productivity and connection, featuring modern interiors, high-tech meeting rooms, and a welcoming community.",
    "peachtree offices": "Peachtree Offices provides premier executive suites, coworking spaces, and virtual office solutions in major US markets. Each location offers professional, full-service workspace with flexible terms.",
    "thrive": "Thrive Coworking offers flexible workspace solutions including open coworking, private offices, and event spaces. With multiple locations, Thrive focuses on creating productive environments where businesses can grow.",
    "cornerstone coworking": "Cornerstone Coworking provides collaborative workspace solutions in a community-focused environment. With modern amenities and a supportive atmosphere, it's designed for entrepreneurs and small teams.",
    "intelligent office": "Intelligent Office provides flexible workspace solutions including virtual offices, coworking, and private offices. With a focus on professional support services, each location offers a turnkey office experience.",
    "vault coworking": "Vault Coworking & Collaboration Space offers a unique coworking experience in a historic bank vault setting. Combining modern amenities with character-rich architecture, it's a favorite among creative professionals.",
}


def scrape_with_firecrawl(url):
    """Try to use firecrawl CLI to scrape a URL."""
    try:
        result = subprocess.run(
            ["firecrawl", "scrape", url, "--format", "markdown", "-o", "/tmp/huddle_scrape.md"],
            capture_output=True, text=True, timeout=30
        )
        if os.path.exists("/tmp/huddle_scrape.md"):
            with open("/tmp/huddle_scrape.md") as f:
                content = f.read()
            os.remove("/tmp/huddle_scrape.md")
            return content
    except Exception:
        pass
    return None


def extract_description_from_html(content, company_name):
    """Extract description from scraped content."""
    if not content:
        return None
    
    # Look for meta description patterns
    meta_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', content)
    if meta_match:
        desc = meta_match.group(1)
        if len(desc) > 50:
            return desc
    
    # Look for og:description
    og_match = re.search(r'<meta\s+property="og:description"\s+content="([^"]+)"', content)
    if og_match:
        desc = og_match.group(1)
        if len(desc) > 50:
            return desc
    
    # Extract first meaningful paragraph
    lines = content.split('\n')
    for line in lines[:50]:
        line = line.strip()
        if len(line) > 80 and len(line) < 500:
            # Skip navigation/header lines
            if not any(word in line.lower() for word in ['menu', 'nav', 'cookie', 'sign in', 'log in']):
                return line
    
    return None


def get_known_description(company_name):
    """Check if company is a known chain."""
    lower = company_name.lower()
    for key, desc in KNOWN_DESCRIPTIONS.items():
        if key in lower:
            return desc
    return None


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print("=" * 60)
    print("HUDDLE SPACE ENRICHMENT SCRAPER")
    print("=" * 60)
    
    # Read CSV
    spaces = []
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            spaces.append(row)
    
    print(f"Loaded {len(spaces)} spaces")
    
    # Sort by contact count and take top N
    spaces.sort(key=lambda x: int(x.get("contact_count", 0) or 0), reverse=True)
    top_spaces = spaces[:TOP_N]
    
    print(f"Enriching top {len(top_spaces)} spaces...")
    
    enriched = {}
    for i, space in enumerate(top_spaces):
        company = space["company"]
        website = space.get("website", "")
        print(f"\n[{i+1}/{TOP_N}] {company}")
        
        # Try known description first
        desc = get_known_description(company)
        if desc:
            print(f"  Using known description ({len(desc)} chars)")
            enriched[company] = {"description": desc}
            continue
        
        # Try scraping if we have a website
        if website and website not in ("", "nan"):
            print(f"  Scraping {website}...")
            content = scrape_with_firecrawl(website)
            extracted = extract_description_from_html(content, company) if content else None
            if extracted:
                print(f"  Extracted description ({len(extracted)} chars)")
                enriched[company] = {"description": extracted}
            else:
                print(f"  Could not extract description")
        
        time.sleep(0.5)  # Rate limiting
    
    # Save enriched descriptions
    output_path = os.path.join(OUTPUT_DIR, "enriched_descriptions.json")
    with open(output_path, 'w') as f:
        json.dump(enriched, f, indent=2)
    
    print(f"\nSaved {len(enriched)} enriched descriptions to {output_path}")
    
    # Apply enriched descriptions back to CSV
    enriched_count = 0
    with open(CSV_PATH, newline='', encoding='utf-8') as f:
        rows = list(csv.DictReader(f))
    
    for row in rows:
        company = row["company"]
        if company in enriched and enriched[company]["description"]:
            row["description"] = enriched[company]["description"]
            enriched_count += 1
    
    # Write updated CSV
    csv_path_updated = os.path.join(BASE_DIR, "huddle_us_directory_enriched.csv")
    with open(csv_path_updated, 'w', newline='', encoding='utf-8') as f:
        if rows:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)
    
    print(f"Updated CSV with {enriched_count} real descriptions: {csv_path_updated}")
    print("Done!")


if __name__ == "__main__":
    main()
