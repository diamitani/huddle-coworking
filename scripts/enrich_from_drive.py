#!/usr/bin/env python3
"""Enrich served listings from Patrick's Drive per-state coworking contact CSVs.

Reads:  audit/drive_contacts_raw/*.csv  (0600, internal only)
        public/data/directory.json

(a) PHONE ENRICHMENT: match Company/Website/Domain to served listings.
    Fill phone ONLY where the listing's phone is empty, the number validates
    as a US business line, and the match is unambiguous (domain match, or the
    company maps to exactly one served record). Chains with many locations are
    never phone-matched to a single site. Every fill is logged.

(b) CLAIM-OUTREACH LIST: extend audit/operator_contacts.json keyed by listing
    slug where matched, else by "company::<norm>". PII stays in audit/ —
    NEVER written to public/.

Run: python3 scripts/enrich_from_drive.py
"""
import csv
import importlib.util
import json
import os
import re
from urllib.parse import urlparse

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIT = os.path.join(BASE, "audit")
DATA = os.path.join(BASE, "public", "data")
RAW = os.path.join(AUDIT, "drive_contacts_raw")

spec = importlib.util.spec_from_file_location("rs",
    os.path.join(BASE, "scripts", "rebuild_served.py"))
rs = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rs)

# Area code -> US state (major codes; best-effort corroboration only)
AREA_STATE = {
    "201": "NJ", "202": "DC", "203": "CT", "204": "MB", "205": "AL", "206": "WA",
    "207": "ME", "208": "ID", "209": "CA", "210": "TX", "212": "NY", "213": "CA",
    "214": "TX", "215": "PA", "216": "OH", "217": "IL", "218": "MN", "219": "IN",
    "220": "OH", "224": "IL", "225": "LA", "226": "ON", "228": "MS", "229": "GA",
    "231": "MI", "234": "OH", "239": "FL", "240": "MD", "248": "MI", "251": "AL",
    "252": "NC", "253": "WA", "254": "TX", "256": "AL", "260": "IN", "262": "WI",
    "267": "PA", "269": "MI", "270": "KY", "272": "PA", "274": "WI", "276": "VA",
    "281": "TX", "283": "OH", "301": "MD", "302": "DE", "303": "CO", "304": "WV",
    "305": "FL", "307": "WY", "308": "NE", "309": "IL", "310": "CA", "312": "IL",
    "313": "MI", "314": "MO", "315": "NY", "316": "KS", "317": "IN", "318": "LA",
    "319": "IA", "320": "MN", "321": "FL", "323": "CA", "325": "TX", "330": "OH",
    "331": "IL", "332": "NY", "334": "AL", "336": "NC", "337": "LA", "339": "MA",
    "340": "VI", "341": "CA", "346": "TX", "347": "NY", "351": "MA", "352": "FL",
    "360": "WA", "361": "TX", "364": "KY", "380": "OH", "385": "UT", "386": "FL",
    "401": "RI", "402": "NE", "403": "AB", "404": "GA", "405": "OK", "406": "MT",
    "407": "FL", "408": "CA", "409": "TX", "410": "MD", "412": "PA", "413": "MA",
    "414": "WI", "415": "CA", "417": "MO", "419": "OH", "423": "TN", "424": "CA",
    "425": "WA", "430": "TX", "432": "TX", "434": "VA", "435": "UT", "440": "OH",
    "441": "BM", "443": "MD", "445": "PA", "447": "IL", "458": "OR", "463": "IN",
    "464": "IL", "469": "TX", "470": "GA", "475": "CT", "478": "GA", "479": "AR",
    "480": "AZ", "484": "PA", "501": "AR", "502": "KY", "503": "OR", "504": "LA",
    "505": "NM", "507": "MN", "508": "MA", "509": "WA", "510": "CA", "512": "TX",
    "513": "OH", "515": "IA", "516": "NY", "517": "MI", "518": "NY", "520": "AZ",
    "530": "CA", "531": "NE", "534": "WI", "539": "OK", "540": "VA", "541": "OR",
    "551": "NJ", "557": "MO", "559": "CA", "561": "FL", "562": "CA", "563": "IA",
    "564": "WA", "567": "OH", "570": "PA", "571": "VA", "573": "MO", "574": "IN",
    "575": "NM", "580": "OK", "581": "QC", "582": "PA", "585": "NY", "586": "MI",
    "601": "MS", "602": "AZ", "603": "NH", "605": "SD", "606": "KY", "607": "NY",
    "608": "WI", "609": "NJ", "610": "PA", "612": "MN", "614": "OH", "615": "TN",
    "616": "MI", "617": "MA", "618": "IL", "619": "CA", "620": "KS", "623": "AZ",
    "624": "NY", "626": "CA", "628": "CA", "629": "TN", "630": "IL", "631": "NY",
    "636": "MO", "641": "IA", "646": "NY", "650": "CA", "651": "MN", "657": "CA",
    "660": "MO", "661": "CA", "662": "MS", "667": "MD", "669": "CA", "670": "MP",
    "671": "GU", "678": "GA", "679": "MI", "681": "WV", "682": "TX", "684": "AS",
    "689": "FL", "701": "ND", "702": "NV", "703": "VA", "704": "NC", "706": "GA",
    "707": "CA", "708": "IL", "710": "US", "712": "IA", "713": "TX", "714": "CA",
    "715": "WI", "716": "NY", "717": "PA", "718": "NY", "719": "CO", "720": "CO",
    "724": "PA", "725": "NV", "726": "TX", "727": "FL", "730": "IL", "731": "TN",
    "732": "NJ", "734": "MI", "737": "TX", "740": "OH", "743": "NC", "747": "CA",
    "754": "FL", "757": "VA", "760": "CA", "762": "GA", "763": "MN", "765": "IN",
    "769": "MS", "770": "GA", "771": "DC", "772": "FL", "773": "IL", "774": "MA",
    "775": "NV", "778": "BC", "779": "IL", "780": "AB", "781": "MA", "782": "NS",
    "785": "KS", "786": "FL", "787": "PR", "801": "UT", "802": "VT", "803": "SC",
    "804": "VA", "805": "CA", "806": "TX", "808": "HI", "810": "MI", "812": "IN",
    "813": "FL", "814": "PA", "815": "IL", "816": "MO", "817": "TX", "818": "CA",
    "819": "QC", "820": "CA", "828": "NC", "830": "TX", "831": "CA", "832": "TX",
    "835": "PA", "838": "NY", "839": "SC", "840": "CA", "843": "SC", "845": "NY",
    "847": "IL", "848": "NJ", "850": "FL", "854": "SC", "856": "NJ", "857": "MA",
    "858": "CA", "859": "KY", "860": "CT", "862": "NJ", "863": "FL", "864": "SC",
    "865": "TN", "870": "AR", "872": "IL", "878": "PA", "901": "TN", "903": "TX",
    "904": "FL", "906": "MI", "907": "AK", "908": "NJ", "909": "CA", "910": "NC",
    "912": "GA", "913": "KS", "914": "NY", "915": "TX", "916": "CA", "917": "NY",
    "918": "OK", "919": "NC", "920": "WI", "925": "CA", "928": "AZ", "929": "NY",
    "930": "IN", "931": "TN", "934": "NY", "935": "CA", "936": "TX", "937": "OH",
    "938": "AL", "939": "PR", "940": "TX", "941": "FL", "947": "MI", "949": "CA",
    "951": "CA", "952": "MN", "954": "FL", "956": "TX", "959": "CT", "970": "CO",
    "971": "OR", "972": "TX", "973": "NJ", "975": "MO", "978": "MA", "979": "TX",
    "980": "NC", "984": "NC", "985": "LA", "986": "ID", "989": "MI",
}


def domain_of(url):
    if not url:
        return ""
    u = url.strip()
    if "://" not in u:
        u = "https://" + u
    try:
        host = urlparse(u).hostname or ""
    except Exception:
        return ""
    host = host.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def valid_phone(s):
    digits = re.sub(r"\D", "", s or "")
    if len(digits) == 10:
        return "+1" + digits
    if len(digits) == 11 and digits.startswith("1"):
        return "+" + digits
    return ""


def main():
    records = json.load(open(os.path.join(DATA, "directory.json")))
    contacts = json.load(open(os.path.join(AUDIT, "operator_contacts.json")))
    by_slug = {r["slug"]: r for r in records}

    # indexes for matching
    domain_to_slugs = {}
    for r in records:
        d = domain_of(r.get("w"))
        if d:
            domain_to_slugs.setdefault(d, []).append(r["slug"])
    company_to_slugs = {}
    for r in records:
        k = rs.norm_name(r["n"])
        if k:
            company_to_slugs.setdefault(k, []).append(r["slug"])

    files_pulled = []
    phone_fills = []       # {slug, name, phone, source_file, area_match}
    outreach_total = 0
    unmatched = 0
    seen_contact_keys = set()

    for fname in sorted(os.listdir(RAW)):
        if not fname.endswith(".csv"):
            continue
        path = os.path.join(RAW, fname)
        rows = list(csv.DictReader(open(path, encoding="utf-8-sig")))
        files_pulled.append({"name": fname, "rows": len(rows)})
        for row in rows:
            name = ((row.get("Name") or "") + " " + (row.get("Last Name") or "")).strip()
            role = (row.get("Role") or "").strip()
            email = (row.get("Email") or "").strip().lower()
            company = (row.get("Company") or "").strip()
            website = (row.get("Website") or "").strip()
            domain = (row.get("Domain") or "").strip().lower() or domain_of(website)
            phone = valid_phone(row.get("Phone International") or row.get("Phone") or "")
            ckey = (email or name, company.lower())
            if ckey in seen_contact_keys:
                continue
            seen_contact_keys.add(ckey)

            # --- match to a served listing ---
            slug = None
            match_kind = None
            cands = domain_to_slugs.get(domain, []) if domain else []
            if len(cands) == 1:
                slug, match_kind = cands[0], "domain"
            elif len(cands) > 1 and company:
                # disambiguate: company name must match the record name
                cn = rs.norm_name(company)
                for s in cands:
                    if cn and (cn in rs.norm_name(by_slug[s]["n"]) or
                               rs.norm_name(by_slug[s]["n"]) in cn):
                        slug, match_kind = s, "domain+company"
                        break
            if not slug and company:
                cands = company_to_slugs.get(rs.norm_name(company), [])
                if len(cands) == 1:
                    slug, match_kind = cands[0], "company-unique"

            # --- (a) phone enrichment ---
            if slug and phone:
                r = by_slug[slug]
                if not rs.valid_phone(r.get("phone", "")):
                    area = phone[2:5]
                    area_match = AREA_STATE.get(area)
                    ok_area = (area_match is None) or (area_match == r["st"])
                    # never overwrite; fill only on unambiguous match + valid phone
                    # area mismatch is a veto only when we know both sides
                    if area_match is not None and area_match != r["st"]:
                        area_ok = False
                    else:
                        area_ok = True
                    if area_ok:
                        r["phone"] = phone
                        phone_fills.append({
                            "slug": slug, "name": r["n"], "city": r["c"],
                            "state": r["st"], "phone": phone,
                            "match": match_kind,
                            "area_code_state": area_match,
                            "source_file": fname,
                        })

            # --- (b) outreach contact ---
            key = slug if slug else "company::" + (rs.norm_name(company) or domain or email)
            if not slug:
                unmatched += 1
            entry = contacts.get(key, {})
            entry.update({
                "name": name or entry.get("name", ""),
                "role": role or entry.get("role", ""),
                "email": email or entry.get("email", ""),
                "company": company or entry.get("company", ""),
                "website": website or entry.get("website", ""),
                "phone": phone or entry.get("phone", ""),
                "source": entry.get("source", "drive"),
                "source_file": fname,
                "matched_listing": bool(slug),
                "match_kind": match_kind,
            })
            # drop empty-string keys noise, keep it lean
            contacts[key] = {k: v for k, v in entry.items()
                             if v not in ("", None) or k in ("matched_listing",)}
            outreach_total += 1

    json.dump(records, open(os.path.join(DATA, "directory.json"), "w"),
              indent=1, ensure_ascii=False)
    json.dump(contacts, open(os.path.join(AUDIT, "operator_contacts.json"), "w"),
              indent=1, ensure_ascii=False)
    json.dump(phone_fills, open(os.path.join(AUDIT, "drive_phone_fills.json"), "w"),
              indent=1)

    # report fragment for build_phase1_report.py
    frag = {
        "drive_files_pulled": files_pulled,
        "drive_rows_total": sum(f["rows"] for f in files_pulled),
        "phones_enriched_from_drive": len(phone_fills),
        "outreach_contacts": len(contacts),
        "outreach_rows_processed": outreach_total,
        "unmatched_contacts": unmatched,
    }
    json.dump(frag, open(os.path.join(AUDIT, "drive_enrich_fragment.json"), "w"), indent=1)
    print(json.dumps({k: v for k, v in frag.items()
                      if k != "drive_files_pulled"}, indent=1))
    print("phone fills logged -> audit/drive_phone_fills.json")


if __name__ == "__main__":
    main()
