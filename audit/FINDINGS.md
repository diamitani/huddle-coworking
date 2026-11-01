# Huddle Listing-Data Audit — Findings

**Date:** 2026-10-31 · **Scope:** correctness audit only (Part A). No data files modified.
**Repo:** `~/workspace/huddleco` (huddleco.work, GitHub `diamitani/huddle-coworking`)

---

## 0. Which dataset does the live site actually serve?

**The live site serves `public/data/directory.json` — 1,073 entries.**
Trace: `src/app/api/spaces/route.ts` and `src/app/api/spaces/[slug]/route.ts` both `readFileSync("public/data/directory.json")`. Consumed by `src/app/spaces/page.tsx`, `src/app/spaces/[slug]/page.tsx` (via `/api/spaces/${slug}`), and `src/app/cities/[city]/page.tsx` (via `/api/spaces?city=`). `stats.json` matches it (`totalSpaces: 1073`).

**Everything else is dead or upstream:**
- `huddle_master_directory.csv` (16,192 rows) — upstream source, NOT served.
- `huddle_us_directory.csv` (7,760 rows) — feeds `scripts/build_huddle_data.py` → `src/data/directory.ts`, but **`directory.ts` has zero importers** (verified by grep). Dead code.
- `src/data/spaces_master.ts`, `spaces_data.ts`, `spaces.ts` — not used by any page (SpaceCard imports only a *type* from `spaces.ts`).
- `public/data/directory_clean.json` (809 rows) — not referenced by any page or API route.
- `public/data/osm_coworking.json` (429 OSM venues with **real** lat/lng) — not used anywhere. This is the highest-quality source in the repo and it's ignored.
- **Provenance gap:** `directory.json` cannot be reproduced from the current repo. `scripts/build_json.py` would emit all 7,760 `huddle_us_directory.csv` rows; the served 1,073 match neither that nor a top-by-`contact_count` cut (only 76/1,073 names overlap the top-1,073 by `contact_count`), and only 835/1,073 served names exist in the master CSV at all. It is a stale, hand-built artifact with no reproducible build.

---

## BLOCKER findings

### B1. The master CSV is a mislabeled generic company dump, not a coworking directory
- Name-signal classification of all 16,192 master rows: **5.3% clearly coworking, 5.0% clearly junk, 89.7% ambiguous** (random startup names: "Vanilla Vida", "Tipple", "Buildkite", "Dataloop AI", "Liquid Instruments", "Sakara Life", "Mach9", "dotData"…).
- `huddle_us_directory.csv` (7,760): only **10.4%** look like coworking by name signals. Random sample of 40: 38/40 were unrelated startups (meal delivery, biotech, crypto, dev tools).
- Spot-verified non-coworking rows in master: **Dataminr** (AI threat-intel co, $4.1B valuation — listed as coworking in "Hamburg"), **SpotHopper** (restaurant marketing software), **Payhawk** (spend management), **BrowserStack** (testing platform), plus banks (Sygnum, Kroo, Custodia), insurers (Joyn, Coterie, Ranger…), hotels, storage firms, schools, pizza shops ("The Pizza Cupcake", "Stellar Pizza"), a tattoo shop ("Ephemeral Tattoo"), "Dance Church".
- The served `directory.json` is much cleaner (57.8% clear-coworking signals, ~40% plausible indie names like "Kiln", "Comradery", "The Hive", "Hatch 41"), but it was cut from this polluted upstream with no documented filter — junk leaks through (see B4, M1).

### B2. All descriptions are fabricated from 4 templates; 8.3% of served descriptions belong to a *different* listing
- `scripts/build_master.py::generate_description()` picks 1 of 4 templates via `random.seed(hash(name+city+state))`. Result: **100% (16,192/16,192) of master descriptions contain the phrase** "designed to elevate your productivity and foster meaningful connections". They are "unique" only because the name is interpolated.
- Served: **806/1,073 (75.1%)** still contain the template phrase.
- **89/1,073 served (8.3%) have a description whose city doesn't match the listing city** — a merge bug cross-wired descriptions. Examples: "Spaces - Georgia, Atlanta - Spaces Midtown East" carries a *Los Angeles / Hollywood* description; "Hq - Georgia, Atlanta - Tower Place" carries a *Northbrook* description; "Industrious" (Atlanta) → "Industrious - Closed… in Pittsburgh"; "The Yard - Philadelphia" (Brooklyn) → "…in your area".
- Events are equally fabricated: **only 15 distinct event strings across all 16,192 master rows** ("Pitch Deck Workshop (Wednesday at 12:00 PM)" ×1,780 etc.). Not currently served via API, but present in source data as if real.

### B3. `contact_count` is displayed to users as fake social proof; `claimed` is meaningless
- Listing pages render **"{ct} contacts in directory"** (`spaces/[slug]/page.tsx:322`).
- Served `ct`: min 0, max 274, **median 1, mean 1.1**; 264/1,073 (24.6%) are 0; only 1 listing ≥100 (the 274 is "Regus - Georgia, Atlanta - One Hartsfield"). There is no in-repo code that computes `contact_count` — it arrived from the upstream enriched JSON. No evidence it counts anything real.
- `claimed=True` on 1,598/16,192 master rows (9.9%) — including obvious non-coworking startups (SpotHopper, Productsup, Workvivo, Studytube). It does not correlate with `contact_count` (True avg 2.45 vs False avg 2.55). There is no verified claim flow; the flag is untrustworthy.

### B4. Served set contains dead businesses and verified junk
- **11/1,073 (1.0%) have "- Closed" literally in the name** ("Executive Suites - Closed", "Hq Global Workplaces I - Closed", "Capital Office Suites - Closed"…). The source data knew they were closed and served them anyway.
- Spot-verified junk in served set: **AfterSchool HQ** (Fishers IN — edtech startup, confirmed via CB Insights/LinkedIn), **Schoolhouse Business Center** (Houston PA — its website is `schoolhouseyoga.com`, a yoga studio), **Capital Office Suites - Closed** (website `talk1300.com`, a radio station).
- Refined name heuristic flags 16/1,073 (1.5%) as suspicious; manual review suggests ~5–8 are truly junk. (Heuristic over-flags legit "Lab"/"University" coworking brands — counts above are post-manual-review.)

---

## MAJOR findings

### M1. Geography is broken at every level
- Master: **170 distinct "state" values; 120 are not US states, covering 7,210 rows (44.5%)** — blank (1,708), EN/England (1,366), ÃŽ/Île-de-France mojibake (361), KA/Karnataka (239), ON/Ontario (232), NO/Norway (232), BE/Belgium (243), ST, TE/Telangana, BA/Buenos Aires, HA/Hamburg, DU/Dubai, BR, SP/São Paulo… The "US directory" is a global scrape.
- Served is better (44 valid states) but still has: **79 empty city (7.4%), 18 empty state (1.7%)**, and **19 definite city/state mismatches (1.8%)** on unambiguous cities — e.g. "1001Wilshire Coworking" = Los Angeles, **PA**; six listings = "Saint Louis", **IL**; "WeWork 135 West 41st St." = New York, **CT**; "Executiveworkspace Dallas…" = Dallas, **NE**.
- **Coordinates are city-center stamps, not venue locations.** Served has only 635 distinct lat/lng pairs for 1,073 listings; **77 listings (7.2%) share the exact US geographic-center fallback (39.8283, -98.5795 — rural Kansas)**; 10 coords are shared across *different* cities (e.g. "York" listed at NYC coords 40.7128,-74.0060). Master has **100% missing lat/lng** (16,192/16,192).

### M2. ~20% of website URLs are dead or broken (n=50 sample, `curl -I -L`)
- 39/49 alive (200 after redirects), **4 hard-404 (8%)**, **6 connection/DNS failures (12%)**; 1 timed out entirely.
- Dead examples: `sprucefrontspaces.com/sample-page-2/offices` (404), `meetatroam.com/locations/buckhead` (404), `premierworkspaces.com/california/woodland-hills-the-q` (404), `azcowork.com` (404), `forsythbusinesscenter.com`, `thefire.works`, `one-park-place.com`, `brokenarrowbusinesscenter.com` (DNS/connect fail).
- 100/1,073 served listings (9.3%) have **no website at all**; master is missing websites on only 111/16,192 (0.7%).

### M3. Amenities are fabricated defaults
- Only **4 distinct amenity values exist across all 1,073 served listings**; **every single listing** has "Coffee & Tea", "Meeting Rooms", "Wi-Fi". `build_json.py` injects `["Wi-Fi","Coffee & Tea","Meeting Rooms"]` whenever source amenities are missing — which was apparently always.

### M4. Phone data is poor and then discarded
- Master: **4,791/16,192 (29.6%) missing phone**; 25 malformed ("+1'+1 970-999-4999", "+44'+420 608 546 838", "+1888PEAK0887325088").
- Served `directory.json` **drops phone entirely** (keys are only id/n/c/st/w/d/a/ct/lat/lng) — the 70% good phones never reach the user.

### M5. Encoding corruption (mojibake) in master
- "Payhawk â€” Business spend reinvented", states "ÃŽ" (Île-de-France), "ZÃ¼rich"/"ZU", "SÃ£o Paulo", "Orbix360Âº", "Wizpresso æ¿ƒèªª". UTF-8 read as Latin-1 upstream; not cleaned.

### M6. Fragile slug routing + duplicate slugs
- 3 duplicate slugs in master (`premier-workspaces-coworking-office-space` ×2, `thrive-coworking` ×2, `the-office` ×2 — different cities each).
- The live `[slug]` route ignores the slug column and matches `slugify(name)`; served has 0 exact-duplicate names today, but two same-named venues in different cities would collide/404.

---

## MINOR findings

- `type` column is 100% "Coworking Space" — zero signal.
- `city_coords.json` (1,304 entries) + `city_images.json` are Unsplash hotlinks; fine but external dependency.
- `validate_spaces.py`, `enrich_with_obscura.py`, `merge_osm.py`, `scrape_spaces.py` exist but no record they were run to completion; the served JSON doesn't reflect their outputs.
- "The Assembly" hand-written entries in `src/data/spaces.ts` are orphaned (only the type is imported).

---

## Recommended cleanup order

1. **Quarantine the master CSV.** Do not build anything from `huddle_master_directory.csv` / `huddle_us_directory.csv` again — ~90%+ is non-coworking company data. Archive them as `deprecated/`.
2. **Immediate served-set surgery** (all on `directory.json`, counts from this audit):
   a. Delete the 11 "- Closed" listings.
   b. Delete or fix the ~8 verified junk rows (AfterSchool HQ, Schoolhouse/yoga, Capital Office Suites/radio, "University Business Center" Flagstaff with no website…).
   c. Fix the 19 definite city/state mismatches; fill or drop the 79 empty-city / 18 empty-state rows.
   d. Replace the 77 US-center fallback coords — drop lat/lng rather than show a pin in rural Kansas; fix the 10 cross-city shared coords.
   e. Fix the 89 cross-wired descriptions (regenerate from the correct name+city or blank them).
3. **Stop fabricating content.** Remove the "{ct} contacts in directory" display (or wire it to real data); drop the `claimed` flag until a real claim flow exists; delete the 15 template event strings from source data; replace the 4-template description generator with honest brand-level copy (the `BRAND_DESCRIPTIONS` map in `build_huddle_data.py` is the right pattern) or leave descriptions empty.
4. **Amenities:** strip the universal Wi-Fi/Coffee/Meeting-Rooms defaults; only show sourced amenities (even if sparse — sparse truth beats dense fiction).
5. **Rebuild reproducibly:** one script `csv → validated JSON` with gates — state must be a valid US code, city non-empty, website returns HTTP 200 (recheck quarterly; ~20% rot), dedupe on (normalized name + city). The 429 OSM venues in `osm_coworking.json` (real coords, real categories) are the best seed — start the verified directory from there, not from the master dump.
6. **Website re-verification pass** on all 973 served URLs with websites; fix-or-drop the ~20% dead.
7. **Delete or document dead code/data**: `src/data/directory.ts`, `spaces_master.ts`, `spaces_data.ts`, `directory_clean.json`, and the unused API surface — or they will confuse every future build (Parts B and C).
8. **Harden slug routing**: match on a stored unique slug (name + city), not `slugify(name)`.

**Bottom line for Parts B/C:** the live 1,073 is a *salvageable* ~1k-listing directory, not a 16k one. Treat the master CSV's scale as a liability, not an asset — every revenue play (featured placements, lead-gen, claim-your-listing) depends on listings being real places with correct cities and working websites, which is currently true for only a fraction of what's served.
