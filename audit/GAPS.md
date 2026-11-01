# Huddle (huddleco.work) — Gap Analysis: Listings, Fields & Site Capabilities
**Date:** 2026-10-31 · **Analyst:** directory-product analyst (subagent) · **Scope:** Part B only — analysis, no code/data changes

**Grounding:** all counts below come from the actual repo at `~/workspace/huddleco`. "Served" = `public/data/directory.json` (1,073 entries — what the live API/site actually queries). "CSV" = `huddle_us_directory.csv` (7,760 rows) and `huddle_master_directory.csv` (16,192 rows, incl. non-US). Brand estimates marked ~ are public-knowledge approximations, not repo data.

---

## TL;DR — the three biggest findings

1. **The served data is a stale subset.** The site serves **1,073** listings from `public/data/directory.json`, but `huddle_us_directory.csv` already holds **7,760** US rows and the master holds **16,192**. Serving the existing CSV fixes most geo gaps overnight at zero sourcing cost.
2. **The revenue funnels are theater.** The newsletter form, list-your-space form, and inquiries endpoint either don't post anywhere or require login (401 for anonymous visitors) — so no email list is being built and no operator leads are captured.
3. **Zero SEO surface.** Every page is `"use client"` (fully client-rendered), no `sitemap.xml`, no `robots.txt`, no per-page metadata, no schema.org markup, no analytics. 1,073 listing pages exist but none are indexable.

---

## 1. Brand coverage (served data, n=1,073)

| Brand | Served | ~Actual US footprint | Gap |
|---|---|---|---|
| Regus (IWG) | 7 | ~1,100+ | **~1,100 missing** |
| HQ (IWG) | 7 | ~400+ | ~390 missing |
| Spaces (IWG) | 33 | ~350+ | ~300 missing |
| Industrious | 3 | ~160 | ~157 missing |
| WeWork | 41 | ~170 | ~129 missing |
| Office Evolution | 8 | ~70 | ~62 missing |
| Venture X | 1 | ~55 | ~54 missing |
| Expansive | 1 | ~40 | ~39 missing |
| Serendipity Labs | 4 | ~30 | ~26 missing |
| Convene | 0 | ~30 | 30 missing |
| Carr Workplaces | 5 | ~25 | ~20 missing |
| Knotel (Newmark) | 0 | ~20 | 20 missing |
| Kiln | 1 | ~15 | ~14 missing |
| Mindspace | 0 | ~15 US | 15 missing |
| Hera Hub | 1 | ~15 | ~14 missing |
| CommonGrounds | 1 | ~12 | ~11 missing |
| The Yard | 4 | ~15 | ~11 missing |
| Bond Collective | 1 | ~9 | ~8 missing |
| Workbar | 6 | ~10 | ~4 missing |
| Galvanize | 3 | ~9 | ~6 missing |
| Pipeline Workspaces | 8 | ~10 | ~2 missing |
| Novel Coworking | 8 | ~10 | OK |
| Alley (ex-Verizon) | 2 | ~2 | OK |
| Fueled Collective / Primary / Cove | 2/1/0 | small | minor |

**Takeaway:** IWG (Regus/Spaces/HQ) alone represents ~1,800 missing US locations — the single largest sourcing target. Industrious (~157 missing) and WeWork (~129 missing) are the next biggest branded gaps. Convene, Knotel, Mindspace have zero presence.

*(In the full US CSV, brand counts are similarly thin — e.g. WeWork 53, Regus 11, Spaces 35 of 16,192 master rows — so the master is overwhelmingly long-tail/indie and equally brand-poor.)*

## 2. Geo coverage (served data)

**Zero listings in these top-50 metros:** San Antonio (#7 US metro), Sacramento, Memphis, Grand Rapids, Virginia Beach.

**≤3 listings (effectively uncovered):** San Diego (1), Baltimore (1), Buffalo (1), Providence (1), Richmond (1), St. Louis (2), Houston (3), Indianapolis (3), Nashville (3), Raleigh (3), Salt Lake City (3), Oklahoma City (3), New Orleans (3), Birmingham (3), San Jose (4).

**⚠️ Stale-build caveat (P0):** the US CSV already has these cities well covered — Seattle 150, Austin 174, San Diego 100, Houston 54, Dallas 65, Nashville 42 — but the served JSON doesn't include them. **Rebuild + serve the full CSV before sourcing anything new.** Additional data-quality issues in served data: 79 blank-city entries, 100 blank websites, 9 description/city mismatches (e.g. an "Atlanta" listing whose description says "Los Angeles"), 311 blank cities in the US CSV.

## 3. Category coverage

The `type` field is **100% "Coworking Space"** (16,192/16,192 in master). The served `amenities` vocabulary is **4 values, applied to every single listing** (Coffee & Tea ×1073, Meeting Rooms ×1073, Wi-Fi ×1073, Printing ×809 — the build script defaults missing amenities to a hardcoded list). Amenity filters are therefore meaningless.

**Missing adjacent bookable inventory** (each is a distinct, higher-monetization product type):
- Meeting rooms (hourly bookable) — present only as a fake amenity tag
- Event venues
- Podcast studios (the codebase has a "Podcast Studio" amenity type defined in `src/data/spaces.ts` but zero data uses it)
- Day offices / day passes (Deskpass/LiquidSpace-style inventory)
- Virtual offices / mail handling
- Dedicated desks vs hot desks vs private offices (no product differentiation at all)

## 4. Field gaps vs competitors (Coworker.com, LiquidSpace, Deskpass, Peerspace)

Served fields: `name, city, state, website, description(≤250ch), amenities(≤6), lat/lng, contact_count`.

| Missing field | Revenue impact | Notes |
|---|---|---|
| **Pricing** (day pass / monthly / dedicated / private office) | P0 — highest | `src/data/spaces.ts` defines a full `Pricing` interface; zero listings populate it. No "transparent pricing" as the homepage claims. |
| **Phone / street address / zip** | P0 | CSV has phone for 6,102 of 7,760 rows — **dropped by the served JSON build**. |
| **Real photos** (not one stock Unsplash image for all 1,073 spaces) | P0 | Detail page hardcodes `images.unsplash.com/photo-1497366216548` for every space. |
| **Ratings & reviews** | P0/P1 | Homepage claims "Real reviews"; `SpaceCard` renders `space.rating` but no rating data exists anywhere. |
| **Availability / book-now link** (day-pass affiliate: Deskpass, LiquidSpace) | P1 | Fastest path to revenue without building booking infra. |
| **Opening hours, transit/parking, sq ft, capacity** | P1 | Standard on every competitor listing page. |
| **Operator contact + claimed flag** | P1 | CSV has `claimed` (761 True in US) and `email` (7,058) — dropped from served data. This is the B2B upsell list. |
| **Real amenity taxonomy** | P1 | `spaces.ts` defines a 20-value taxonomy; data uses 4 fake values. |
| **Floor plans** | P2 | |
| **updated_at / data provenance** | P2 | No freshness signal anywhere; affects crawl + trust. |

## 5. Site capability gaps

**P0 — blocking all organic growth:**
- **Every page is `"use client"`** (`/spaces`, `/spaces/[slug]`, `/cities`, `/cities/[city]`, homepage). Listing and city pages are invisible to search crawlers. Convert to SSR/SSG with `generateStaticParams` + `generateMetadata`.
- **No `sitemap.xml`, no `robots.txt`.**
- **No schema.org JSON-LD** (`LocalBusiness`/`CoworkingSpace`) on listing pages; no Open Graph per-listing tags.
- **Homepage makes false claims:** "1,200+ spaces" (serves 1,073), "Real reviews" (none), "transparent pricing" (none), "instant booking" (no booking). Fix copy or ship the features — thin trust + ad-policy risk.
- **Inquiries API requires auth** (`401` for anonymous). The primary lead-capture moment — a visitor asking about a space — is gated behind Cognito signup. No email notification to operators either; leads just sit in Postgres. For a directory, anonymous lead capture → operator routing is the revenue engine.
- **No analytics** — no GA, PostHog, or anything in `package.json`. Flying blind on traffic, conversion, funnel.

**P1 — blocking monetization:**
- **Newsletter form is fake** — `onClick` sets state, posts nowhere. Email list (the #1 directory asset) is not being built.
- **List-your-space form is fake** — same; no POST, no storage. The owner-acquisition funnel is dead; the `claimed` workflow in the CSV has no UI.
- **Membership Pro ($9/mo) has no checkout** — no Stripe dependency, CTAs are `mailto:`/dead links.
- **City pages are shallow** — client-rendered, top-50 listings only, no editorial content (no "best coworking in X" guides → no long-tail SEO).
- **No affiliate booking links** (LiquidSpace/Deskpass/Peerspace day passes = immediate revenue with zero infra).
- **SpaceGate paywall** (5 free views → signup gate) is `sessionStorage`-based, trivially bypassed, and misaligned with an SEO growth strategy.

**P2:**
- No ad placements / sponsored listings product (data model has `featured` in `spaces.ts`, unused).
- No review submission flow, no photo upload, no "report incorrect info" loop.
- Duplicate-template descriptions (806/1,073 share the "premier coworking destination…designed to elevate your productivity" template) → thin/duplicate content SEO risk.
- No multi-language, no accessibility audit noted (out of scope here).

## 6. Data freshness

- **All repo files dated 2026-07-21** (checkout date); the directory is **not a git repo**, so no build provenance, no commit history, no way to tell when data was last scraped/built.
- Build scripts reference source paths that don't exist on this machine (`../CoWorking Website`, `/Users/pdiamitani/Desktop/obscura`), so the pipeline **cannot be re-run as-is** — data refreshes are currently impossible without repair.
- No `updated_at` per listing, no re-scrape scheduler, no staleness monitoring. Treat all 1,073 served listings as **unverified since build**.

---

## Next-500 listings sourcing plan

**Phase 0 — $0 cost, do first (P0):** Rebuild `public/data/directory.json` from the full `huddle_us_directory.csv` (7,760 rows): include phone, restore `claimed`/`email` internally, drop the 311 blank-city rows, fix the 9 description/city mismatches. Instant +6,687 served listings; fixes Seattle/Austin/San Diego/Houston/Dallas/Nashville overnight.

**Phase 1 — branded multi-location sweeps (~500, highest trust value):**
1. Industrious — ~157 (brand pages have structured location data)
2. WeWork remainder — ~129 (wework.com/locations sitemap)
3. Venture X — ~54 · 4. Office Evolution — ~62 · 5. Expansive — ~39
6. Serendipity Labs — ~26 · 7. Convene — ~30 · 8. Carr Workplaces — ~20
9. Kiln — ~14 · 10. Mindspace US — ~15 · 11. Hera Hub — ~14 · 12. The Yard — ~11
13. Knotel — ~20 · 14. Bond Collective — ~8
*Method: brand location-finder pages (all have /locations sitemaps) → scripted scrape → dedupe against existing by name+city. ~2 days of scraping work.*

**Phase 2 — IWG at scale (~1,500+, biggest single source):** Regus/Spaces/HQ location APIs/feeds. Largest gap by far; deprioritize only because IWG scraping needs care (bot defenses).

**Phase 3 — geo fill for uncovered metros:** San Antonio, Sacramento, Memphis, Grand Rapids, Virginia Beach, Baltimore, St. Louis, Indianapolis, Raleigh, SLC, OKC, New Orleans — indie sweeps via Google Places / OSM (the repo already has an OSM merge script: `scripts/merge_osm.py`).

**Phase 4 — adjacent inventory (highest $/listing):** add `type` values beyond "Coworking Space": meeting rooms, event venues, podcast studios, day offices, virtual offices. Source from Peerspace-style venue data + brand meeting-room pages (Convene is the anchor brand here).

**Sourcing order rationale:** Phase 0 is free. Phase 1 targets brands because branded locations convert better, are easier to scrape accurately, and unlock B2B outreach (multi-location operators = featured-listing upsell at scale). Phase 3 fills the embarrassing metro zeros. Phase 4 is where per-listing revenue actually lives (day passes/meeting rooms book repeatedly; desks don't).
