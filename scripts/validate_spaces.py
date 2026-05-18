#!/usr/bin/env python3
"""
Validate which entries in the directory are actually coworking spaces.
Filters out regular companies that were mixed into the contact dataset.
"""
import json, os, re, sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_PATH = os.path.join(BASE, "public", "data", "directory.json")
OUT_PATH = os.path.join(BASE, "public", "data", "directory_clean.json")
CSV_PATH = os.path.join(BASE, "huddle_us_directory_clean.csv")
ORIG_CSV = os.path.join(BASE, "huddle_us_directory.csv")

# Known coworking brands (always valid regardless of name)
COWORKING_BRANDS = {
    "regus", "wework", "spaces", "industrious", "serendipity labs", "serendipitylabs",
    "office evolution", "officeevolution", "hq", "quest workspaces", "questworkspaces",
    "bizhaus", "roam", "peachtree offices", "peachtreeoffices", "thrive coworking",
    "thrive | coworking", "cornerstone coworking", "cornerstonecoworking",
    "vault coworking", "vaultcoworking", "blankspaces", "neuehouse", "switchyards",
    "centrl office", "centrloffice", "intelligent office", "intelligentoffice",
    "carr workplaces", "carrworkplaces", "pro coworking", "procoworking",
    "epiphany space", "epiphanyspace", "circle hub", "circlehub",
    "common ground", "commonground", "the park", "bond collective",
    "maker's loft", "makersloft", "next space", "nextspace",
    "techspace", "impact hub", "impacthub",
    "coworking", "cowork", "co-work", "co work",
    "workbar", "shift workspaces", "shiftworkspaces",
    "pacific workplaces", "premier workspaces",
    "the yard", "hub coworking", "kismet cowork",
    "think tank coworking", "executive suites",
    "executive center", "executive office",
    "business center", "business centers",
    "microoffice", "work lounge",
}

# Keywords in company name that strongly indicate a coworking space
POSITIVE_KEYWORDS = [
    "coworking", "co-working", "cowork", "co work", "co.work",
    "workspace", "workspaces", "work space",
    "workplace", "workplaces",
    "shared office", "shared workspace",
    "flexible office", "flexible workspace",
    "business center", "business centres", "business center",
    "executive suite", "executive suites", "executive office", "executive center",
    "virtual office",
    "meeting room", "conference center",
    "office space", "office spaces", "office suite", "office suites",
    "creative space", "maker space", "makerspace",
    "innovation center", "innovation hub",
    "entrepreneur center",
    "incubator", "accelerator",
    "community space", "collaboration space",
    "studio space", "creative studio",
    "desk space", "hot desk",
    "office rental", "workspace rental",
    "membership club", "private office",
    "open workspace", "shared space",
    "flex office", "co-op space",
    "work club", "workclub",
    "launchpad", "startup hub",
    "workbar", "shift workspace", "pacific workplace", "premier workspace",
    "hub coworking", "kismet cowork", "think tank coworking",
    "executive center", "executive centers",
    "professional suite", "professional suites",
    "corporate center", "corporate centres",
    "office park", "office parks",
    "work lounge",
    "micro office", "microoffice",
    "serviced office", "serviced offices",
    "private office", "private offices",
    "furnished office", "furnished offices",
]

# Companies that are clearly NOT coworking spaces (product companies, restaurants, etc.)
NEGATIVE_KEYWORDS = [
    "storage", "hotel", "restaurant", "cafe", "bakery", "salon", "spa",
    "medical", "clinic", "hospital", "dental", "pharmacy",
    "insurance", "bank", "credit union", "financial",
    "law firm", "attorney", "law office",
    "real estate", "property management", "apartment",
    "school", "university", "college", "academy",
    "church", "temple", "ministry",
    "auto", "car dealership", "mechanic",
    "grocery", "market", "supermarket",
    "dentist", "doctor", "physician",
    "plumbing", "electrical", "contractor", "construction",
    "accounting", "cpa", "tax",
    "consulting", "consultancy",
    "software", "technology", "tech", "saas", "platform",
    "healthcare", "biotech", "pharma",
    "restaurant", "food", "catering",
    "retail", "boutique", "store", "shop",
    "manufacturing", "factory", "warehouse",
    "transportation", "logistics", "shipping",
    "energy", "solar", "utility",
    "security", "surveillance",
    "cleaning", "maintenance", "janitorial",
    "landscaping", "lawn",
    "moving", "storage",
    "printing", "copier",
    "staffing", "recruiting", "employment",
    "marketing agency", "ad agency", "digital agency",
    "design agency", "creative agency",
    "public relations", "pr agency",
    "investment", "venture capital", "private equity",
    "fund", "capital partners",
    "foundation", "nonprofit", "association",
    "government", "municipal", "federal",
    "apartments", "condo", "rental",
    "salon", "barber", "nails",
]

# URL patterns that indicate coworking
COWORKING_URL_PATTERNS = [
    r'cowork', r'co-work', r'workspace', r'officespace',
    r'flexible.office', r'shared.office',
    r'business.center', r'executive.suite',
    r'virtual.office', r'meeting.room',
    r'industrious', r'regus', r'wework', r'spaceswork',
    r'serendipitylabs', r'officeevolution', r'carrworkplaces',
    r'questworkspaces', r'peachtreeoffices', r'centrloffice',
    r'neuehouse', r'switchyards', r'bizhaus',
    r'meetatroam', r'cancollab', r'workatthrive',
    r'procolo', r'circlehub', r'epiphanyspace',
    r'theorange.space', r'evo3workspace',
    r'west-mec.edu/coworking',
]


def is_coworking_space(entry):
    """Classify whether an entry is actually a coworking space."""
    name = entry.get("n", "").strip().lower()
    website = entry.get("w", "").strip().lower()
    
    # Check if name matches known coworking brands
    for brand in COWORKING_BRANDS:
        if brand in name:
            return True
    
    # Check positive keywords in name
    has_positive = any(kw in name for kw in POSITIVE_KEYWORDS)
    
    # Check negative keywords in name
    has_negative = any(kw in name for kw in NEGATIVE_KEYWORDS)
    
    # Check URL patterns
    has_url_match = any(re.search(p, website) for p in COWORKING_URL_PATTERNS)
    
    # Decision logic
    if has_url_match:
        return True
    if has_positive and not has_negative:
        return True
    if has_positive and has_negative:
        # Positive keyword outweighs negative for coworking spaces
        positive_count = sum(1 for kw in POSITIVE_KEYWORDS if kw in name)
        negative_count = sum(1 for kw in NEGATIVE_KEYWORDS if kw in name)
        return positive_count > negative_count
    
    return False


def main():
    print("=" * 60)
    print("VALIDATING COWORKING SPACES")
    print("=" * 60)
    
    with open(DIR_PATH) as f:
        data = json.load(f)
    
    print(f"Total entries in directory: {len(data)}")
    
    # Classify each entry
    valid = []
    removed = []
    
    for entry in data:
        if is_coworking_space(entry):
            valid.append(entry)
        else:
            removed.append(entry)
    
    print(f"Valid coworking spaces: {len(valid)}")
    print(f"Removed (not coworking): {len(removed)}")
    
    # Show samples of what was removed
    print(f"\nSample of REMOVED entries (not coworking):")
    removed_sample = sorted(removed, key=lambda x: x['ct'], reverse=True)[:30]
    for s in removed_sample:
        print(f"  [{s['ct']:>3}] {s['n'][:60]:60s} | {s['c']}, {s['st']}")
    
    print(f"\nSample of VALID entries (coworking):")
    valid_sample = sorted(valid, key=lambda x: x['ct'], reverse=True)[:20]
    for s in valid_sample:
        print(f"  [{s['ct']:>3}] {s['n'][:60]:60s} | {s['c']}, {s['st']}")
    
    # Write clean files
    with open(DIR_PATH.replace('directory.json', 'directory_clean.json'), 'w') as f:
        json.dump(valid, f)
    
    # Also update the main directory.json
    with open(DIR_PATH, 'w') as f:
        json.dump(valid, f)
    
    # Update stats
    states = {}
    cities = {}
    for s in valid:
        states[s['st']] = states.get(s['st'], 0) + 1
        if s['c']:
            cities[s['c']] = cities.get(s['c'], 0) + 1
    
    # Write updated stats
    stats_path = os.path.join(BASE, "public", "data", "stats.json")
    with open(stats_path) as f:
        stats = json.load(f)
    stats['totalSpaces'] = len(valid)
    stats['totalCities'] = len(cities)
    stats['topStates'] = dict(sorted(states.items(), key=lambda x: -x[1])[:10])
    stats['topCities'] = [
        {"city": k, "state": "", "count": v}
        for k, v in sorted(cities.items(), key=lambda x: -x[1])[:20]
    ]
    with open(stats_path, 'w') as f:
        json.dump(stats, f)
    
    print(f"\n{'='*60}")
    print("VALIDATION COMPLETE")
    print(f"{'='*60}")
    print(f"Total coworking spaces: {len(valid):,}")
    print(f"Removed non-coworking entries: {len(removed):,}")
    print(f"States: {len(states)}, Cities: {len(cities)}")
    print(f"Top 10 states: {', '.join(sorted(states, key=lambda x: -states[x])[:10])}")
    print(f"Files updated: directory.json, stats.json")


if __name__ == "__main__":
    main()
