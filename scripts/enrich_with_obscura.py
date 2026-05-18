#!/usr/bin/env python3
"""
Enrich coworking space data using Obscura headless browser.
Visits each space's website to extract real descriptions, amenities, and images.
"""
import json, os, subprocess, time, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_PATH = os.path.join(BASE, "public", "data", "directory.json")
OBSCURA = "/Users/pdiamitani/Desktop/obscura"
LIMIT = 50  # Number of spaces to enrich per run

OBSCURA_EVAL = """
JSON.stringify({
  title: document.title || '',
  metaDesc: (document.querySelector('meta[name=\"description\"]')?.content || ''),
  ogDesc: (document.querySelector('meta[property=\"og:description\"]')?.content || ''),
  h1: document.querySelector('h1')?.textContent?.trim()?.substring(0, 200) || '',
  text: document.body?.innerText?.substring(0, 3000) || '',
  images: Array.from(document.querySelectorAll('img[src]')).slice(0,5).map(i => i.src).filter(s => s.startsWith('http')),
})
"""


def extract_description(data):
    """Extract best description from scraped page data."""
    for field in ['metaDesc', 'ogDesc', 'h1']:
        val = data.get(field, '')
        if val and len(val) > 30 and 'cowork' in val.lower() or 'workspace' in val.lower() or 'office' in val.lower():
            return val[:300]
    # Fallback: use first meaningful paragraph from text
    text = data.get('text', '')
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if 60 < len(line) < 500 and not any(x in line.lower() for x in ['cookie', 'accept', 'menu', 'sign in', 'log in']):
            return line[:300]
    return ''


def scrape(url, timeout=20):
    """Use obscura to fetch a page."""
    try:
        result = subprocess.run(
            [OBSCURA, "fetch", "--stealth", "--wait", "6", "--timeout", str(timeout),
             "--eval", OBSCURA_EVAL, url],
            capture_output=True, text=True, timeout=timeout + 10
        )
        output = result.stdout.strip()
        # Parse JSON from output (last line)
        for line in reversed(output.split('\n')):
            line = line.strip()
            if line.startswith('{'):
                return json.loads(line)
    except Exception as e:
        print(f"    Error: {e}")
    return None


def main():
    os.makedirs(os.path.join(BASE, "public", "data"), exist_ok=True)
    
    with open(DIR_PATH) as f:
        spaces = json.load(f)
    
    print(f"Loaded {len(spaces)} spaces")
    
    # Load existing enriched descriptions
    enriched_path = os.path.join(BASE, "public", "data", "enriched.json")
    if os.path.exists(enriched_path):
        with open(enriched_path) as f:
            enriched = json.load(f)
    else:
        enriched = {}
    
    # Pick spaces without enrichment, prioritize by contact count
    to_enrich = [s for s in spaces if s['n'] not in enriched and s['w'] and s['w'].startswith('http')]
    to_enrich.sort(key=lambda x: x['ct'], reverse=True)
    to_enrich = to_enrich[:LIMIT]
    
    if not to_enrich:
        print("All spaces already enriched!")
        return
    
    print(f"Enriching {len(to_enrich)} spaces...")
    
    for i, space in enumerate(to_enrich):
        name = space['n'][:50]
        url = space['w']
        print(f"[{i+1}/{len(to_enrich)}] {name}")
        print(f"  URL: {url}")
        
        data = scrape(url)
        if data:
            desc = extract_description(data)
            if desc:
                print(f"  Description: {desc[:80]}...")
                enriched[space['n']] = {
                    'description': desc,
                    'title': data.get('title', ''),
                    'images': data.get('images', [])[:3],
                }
            else:
                print(f"  No description found")
                enriched[space['n']] = {'description': space['d']}
        else:
            print(f"  Failed to scrape")
        
        # Save incrementally
        with open(enriched_path, 'w') as f:
            json.dump(enriched, f, indent=2)
        
        time.sleep(1)  # Rate limiting
    
    # Update directory.json with enriched descriptions
    updated = 0
    for space in spaces:
        if space['n'] in enriched:
            enr = enriched[space['n']]
            if enr.get('description') and len(enr['description']) > len(space['d']):
                space['d'] = enr['description']
                updated += 1
    
    with open(DIR_PATH, 'w') as f:
        json.dump(spaces, f)
    
    print(f"\nUpdated {updated} descriptions")
    print(f"Enriched data saved to {enriched_path}")
    print(f"Done!")


if __name__ == "__main__":
    main()
