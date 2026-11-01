# Huddle (huddleco.work) Turnaround — Implementation Log

**Date:** 2026-10-31 · **Coordinator:** implementation subagent (parent: main agent)
**Repo:** `diamitani/huddle-coworking` → Vercel `huddle-coworking` (auto-deploys from `main`) → https://huddleco.work (+ www, + huddle-coworking.vercel.app, all verified attached)

Patrick's ask: (A) listings correct, (B) add more, (C) apply profitable-directory principles for revenue.
Vision (refined same day): coworking-specific platform; north star = world's most comprehensive coworking directory (full address, membership fees, day-pass/meeting-room rates, public events, services per listing). Pricing transparency = P0 conversion driver. Future phases (data model ready, not built): Huddle Nights night-access memberships, team/remote-employee booking, backend SaaS for spaces.

---

## Phase 1 — Data surgery (delegated subagent; see `audit/PHASE1-REPORT.json`)

| Metric | Before | After |
|---|---|---|
| Served listings | 1,073 | **1,000** |
| "- Closed" listings served | 11 (audit) / 17 found | **0** |
| Verified junk rows | — | **26 removed** (AfterSchool HQ, Schoolhouse/yoga, Capital Office Suites/radio, Axios HQ, Crosschq, salon/cafe/HQ-suffix rows… — each web-verified before deletion, see `junk_decisions` in report) |
| City/state mismatches | 19 definite | **21 fixed** (Los Angeles PA→CA, Saint Louis IL→MO, New York CT→NY, Dallas NE→TX…) |
| Empty city / state rows | 79 / 18 | **40 dropped, 50 inferred from name** |
| Rural-Kansas fallback coords (39.8283,-98.5795) | 77 | **33 nulled** (rest resolved via OSM/city fixes) |
| Cross-city shared coords | 10 | **68 nulled** (full audit pass) |
| Fabricated/cross-wired descriptions | 806 template / 89 cross-wired | **740 blanked** (never re-fabricated) |
| Fabricated universal amenities | 1,073 listings | **997 stripped** (sourced-only now) |
| Phones | 0 served | **727 restored** (validated from CSV + OSM) |
| OSM venues merged (429, real coords) | 0 used | **429 validated; 261 dupes, 9 added** (net +4 surviving after dedupe) |
| Brand pricing researched | 0 | **18 of 20 chains** (WeWork, Regus, HQ, Industrious, Office Evolution, Venture X, …; Spaces + Convene publish no usable pricing → left null, honest) |
| Brand locations priced | 0 | **96** (source="brand", "starting at" labeling) |
| Schema fields added | — | address, pricing, hours, membership_tiers, event_space, events, services |
| Master CSVs | live upstream | **quarantined to `deprecated/`** (never build from again) |
| Reproducible pipeline | none | **`scripts/rebuild_served.py`** (validate→dedupe→emit; `--recheck` website mode; merges `featured.json` + `operator_pricing.json`; idempotent id/slug) |
| Website re-verification | ~20% dead (sample) | 902 checked; sandbox egress blocked most checks (ProxyError/ReadTimeout) — **0 blanked on inconclusive evidence**; `--recheck --report-only` saved to `audit/recheck_report.json` for a proper network pass |

Notes:
- Website recheck from this sandbox is unreliable (egress filtering). The pipeline's `--recheck` mode is ready; run it from a proper network (or Vercel cron) quarterly.
- OSM overlap was heavier than hoped (261/429 already served) — the real "add more" pipeline is the **572 staged sibling listings** (see below), which need address verification before going live.
- `audit/operator_contacts.json` = internal outreach list (claim/featured upsell). PII — never under `public/`.

## Phase 2 — Revenue surfaces (this build)

**Money funnel (priority #1): anonymous tour-request inquiries.** The old funnel required Cognito login (401 for anonymous) and wrote to an unconfigured RDS. New: every listing page has "Request a Tour" → type picker (tour/membership/pricing/event) → name/email/phone/message → `POST /api/leads` → durable store. No account needed. Rate-limited (10/hr/IP), honeypot, validated.

**Durable store:** Supabase-first (migration in `supabase/migrations/001_lead_capture.sql` for the one-tap future), live provider today = **Vercel Blob private store `huddle-leads`** (created + linked to the project; `BLOB_READ_WRITE_TOKEN` set on production/preview/development). One JSON object per record: `huddle/{inquiry|claim|listing|newsletter|featured_waitlist|pageview}/{yyyy-mm}/{ts}-{rand}.json`. Newsletter dedupes on email hash. Admin read path via `list()`.

**Claim-your-listing:** `/list-your-space` rebuilt — claim-existing (search → select → verify affiliation + **pricing self-report**: day pass / hot desk / dedicated / private office / meeting-room rates, access hours, services, event space) and submit-new-space flows → `POST /api/claims` → operator inbox. Claim data is sanitized and stored for review; `rebuild_served.py` merges approved operator pricing from `public/data/operator_pricing.json` (source="operator"). The listing page links "Claim this listing" with the slug preselected. This is the featured-upsell pipeline.

**Featured listings:** `featured` flag (data + `public/data/featured.json` merge) → badge, sort boost in `/api/spaces`, homepage + city-page treatment. `/pricing` page: Free Listing / **Featured $49/mo** / **Premium $99/mo** with honest feature lists. Checkout is **explicitly gated**: CTA opens a waitlist modal ("Online checkout opens after Stripe activation — no payment taken today") → stored as `featured_waitlist`. No fake checkout. `/membership` → 301 to `/pricing`.

**Pricing transparency (P0):** listing pages have a Pricing & Plans section — brand/operator rates shown as "from $X" with source footnotes ("Brand-published starting rates — confirm with this location" / "Rates provided by the space"); unknown pricing shows an honest "Pricing not listed — request info" card that opens the inquiry funnel (pricing type). Plans & Access (tiers, hours — structured for future Huddle Nights), Services, Event Space, and public Events sections render only from sourced data.

**False claims removed:** "1,200+ spaces" → computed count everywhere (hero, footer, about, metadata); "The #1 / world's #1" → dropped; "Real reviews / transparent pricing / instant booking" → dropped; "{ct} contacts" social proof → removed from all UI; "Verified listing" badge → removed; "Join 12,000+ members" → dropped; SpaceGate 5-view paywall → removed (misaligned with SEO + anonymous funnel); dead sign-in links → removed (Cognito never configured); fabricated FAQ answers → rewritten honestly.

**SEO floor (was P2, now P0 per Patrick — SHIPPED, not deferred):** `/spaces/[slug]` and `/cities/[city]` converted from `"use client"` to **server components** with `generateStaticParams` (~1,000 listing + ~482 city pages prerendered), `generateMetadata` (title/description/canonical/OG per page), and **JSON-LD** (`CoworkingSpace` on listings incl. geo/telephone when sourced; `ItemList` on city pages). Plus `app/sitemap.ts` (static routes + cities + listings, featured get priority 0.9), `app/robots.ts` (disallows /api/, /admin/, /dashboard, /bookings), honest root metadata computed from real stats. Legacy `slugify(name)` URLs 301-redirect to canonical stored slugs.

**Newsletter:** `/api/newsletter` actually stores (was `onClick` → nowhere).

**Analytics:** lightweight first-party pageview hook (`Analytics` component → `POST /api/analytics`, no PII, best-effort).

**Admin:** `/admin` — password-gated lead inbox (inquiries / claims / new listings / newsletter / featured waitlist), newest first. Password in `HUDDLE_ADMIN_PASSWORD` (Vercel env, production+preview); plaintext only in `~/workspace/.tokens/huddle-admin-password` (0600).

**Slug hardening:** stored unique `slug` (name+city) in data; API + pages match stored slug, fall back to legacy `slugify(name)` with redirect to canonical.

**Dead code removed:** `src/data/` (entire), `SpaceCard`, `SpaceGate`, `public/data/{directory_clean,enriched,city_coords,city_images}.json`. `auth-cognito.ts` no longer throws at import (was breaking `next build`); auth routes fail at request time with a clear message until Cognito is configured.

**UX direction honored:** no feature bloat — the sophistication is in the data pipeline + workers, not UI chrome.

## Master directory backend — graduation path (landed 2026-10-31)

`~/workspace/directory-backend-template/` (separate agent): multi-tenant Supabase/Postgres, `directory_slug='huddle'`, 10 migrations (listings, events, programs, claims, inquiries w/ pay-per-lead ledger, subscriptions, search_queries, listing_events, data_jobs), `search_listings()` RPC, 24 indexes, RLS public-read-published / funnel-INSERT-only. **Honest caveat (its builder): migrations parse clean + 40-assertion semantic suite passed, but NO live Postgres execution ran — treat the first `supabase db push` as the moment of truth; RLS behavior is NOT verified.**

**Field-name alignment (this session):** huddle's served model now uses the template's boring names EXACTLY — `name, city, state, website, phone, email, description, amenities, latitude, longitude, slug, address, pricing{day_pass, hot_desk_monthly, dedicated_desk_monthly, private_office_monthly, meeting_room_hourly, source}, hours, membership_tiers[{name, price}], event_space, events[], programs[], services[], featured_tier('none'|'featured'|'premium')`. Dropped: `ct` (fabricated social proof), `claimed` (meaningless), minified keys (n/c/st/w/d/a/lat/lng), `street` (superseded by `address`). Legacy int `id` kept (ETL maps to `metadata.legacy_id`). When the app switches from `directory.json` to `search_listings()`, frontend field names barely change. Mapping doc: `MAPPING-HUDDLE.md` in the template.

## V1 product taxonomy (Patrick 2026-10-31) — three tracks, one directory

Every space can play in all three tracks; the site offers three browse lenses over the same directory (tabs, not three products):

1. **HUDDLE (find people)** — networking events, mixers, panels, pitch nights, community gatherings hosted at spaces. Brand signature: empty rooms become gatherings.
2. **WORK (find space)** — desks, dedicated desks, private offices, memberships, day passes, meeting-room bookings. The transactional core (default lens).
3. **COLLABORATE (find programs)** — courses, classes, workshops, open studios, accelerators hosted at spaces. Multi-session, learning/creation.

**Data model:** spaces remain the core entity. Lightweight `events[]` (already existed; now feeds Huddle) and new `programs[]` (`SpaceProgram`: title, type, schedule, price, url, source) entities keyed by space slug. `/spaces` page has Work/Huddle/Collaborate tabs (`?mode=huddle|collaborate` → `/api/spaces` filters: Huddle = has events OR bookable event space; Collaborate = has programs). Homepage `TrackStrip` component explains the three tracks. Coverage is sparse on day one (honest empty states + "spaces can add theirs when they claim"); the claim flow carries an optional **upcoming event/program self-report** block (title, type, schedule, price, URL → stored in claim record for operator review) and listing pages render a Programs section from sourced data only.

**V1 agentic scope (SCOPE CORRECTION 2026-10-31 — agents move to V2):** the concierge matcher and claim-draft agent built earlier in this session were **reverted out of v1** per Patrick's correction ("v1 is foundations only"). V1 keeps the three-track data model + lenses, the claim FORM (with pricing self-report + upcoming event/program self-report → stored review queue), and the background **data tooling scripts** (`rebuild_served.py`, re-verification) — scripts, not product agents.

**Deferred to V2 (explicit roadmap — do not build in v1):** concierge matcher (guided "find me a space" → ranked shortlist → inquiry funnel), claim-helper agent (draft/enrich claim profiles from public website data for one-tap approval — pattern also applies to Artispreneur's 41,810 listings via the same claims table with `directory_slug='artispreneur-directory'`), event-scout crawler, lead-router scoring, pricing-intel monitor, data stewards as scheduled product workers.

**Master directory backend (heads-up 2026-10-31):** a second agent is building `~/workspace/directory-backend-template/` — one multi-tenant Supabase/Postgres backend for all his directory apps. Huddle keeps its boring field names (`name, city, state, website, phone, email, address, lat/lng, pricing tiers, amenities, events, programs`) so adoption is a trivial mapping later. V1 keeps the Blob durable store for inquiries/claims; the master backend is the graduation path, NOT a mid-build re-architecture.

**Auth (Cognito) — v1 scope:** login/signup/confirm/logout/me API routes existed; `(auth)/login` + `(auth)/signup` pages existed (with email-confirm step) — both now show an honest "accounts are being set up" state via new `/api/auth/status` when `COGNITO_CLIENT_ID`/`COGNITO_USER_POOL_ID` are absent, instead of a dead form. Navbar: Sign In (logged out) / Dashboard + Sign Out (logged in), desktop + mobile. **Saved spaces + inquiries repointed off the unconfigured RDS:** `/api/saved` → new `src/lib/saved-store.ts` (private Blob store, one JSON per user+slug, idempotent PUT/DELETE); `/api/inquiries` → the durable lead store (`saveRecord`/`listRecords` filtered by user). Anonymous heart-save (localStorage) on listing pages kept. Deleted `/bookings` (unlinked, robots-disallowed V3 stub with broken slug URLs — URL integrity). **BLOCKER (Patrick's tap):** no Cognito User Pool exists for the live `huddle-coworking` project (no COGNITO_* env vars; no AWS credentials in the key sheet; the pool referenced by the stale `huddle` project under the other Vercel account has encrypted values that can't be recovered via API). Everything is wired — the moment he creates the pool and sets the three env vars, signup → confirm → login → saved/dashboard works end-to-end.

## Phase 3 — Verify + ship

- `next build`: clean (SSG: 1,000 listing + 482 city pages). `eslint`: 0 errors (12 pre-existing `<img>`/exhaustive-deps warnings).
- Smoke-tested locally: home, /spaces, listing page (SEO title + JSON-LD), city page, sitemap.xml (1,491 URLs), robots.txt; API paths: 503-honest (no store), 400 validation, honeypot fake-ok, admin 401.
- Independent testing agent: PENDING (spawn after final data lands).
- Push to `main` → auto-deploys to huddleco.work: PENDING final data.

## Sibling repos (mined; `audit/SIBLING-REPOS.md`)

- `diamitani/coworking-directory` (public): **572 clean US coworking listings** (phone + company-direct website) NOT in huddle's served set → staged at `~/workspace/huddle-sibling-data/coworking_directory_missing_us_listings.json` for the verification-worker pass (no addresses — verify before publish). Also confirmed huddle's served data descends from this repo's fabricated enrichment (769/1,000 names overlap). Take the 572 + contact fields for outreach; skip all descriptions/amenities/events (100% templated), components, SEO (none).
- `diamitani/desknear-coworking-directory` (public): **0 real listings** (1,000 mock records, startup names as "coworking", random prices) → SKIP entirely.
- `diamitani/artispreneur-venues`: **BLOCKED** (404 unauthenticated and via stored credential) → needs Patrick to grant access or confirm the name.

## Patrick's taps (explicit)

1. **Stripe activation** — paid Featured/Premium checkout (waitlist modal is live; no payment taken).
2. **Cognito (or any auth)** — login/signup/saved-server/dashboard are unlinked until configured; everything seeker-facing works anonymously.
3. **artispreneur-venues access** — grant or confirm repo name for the mining pass.
4. **Supabase (optional future)** — migration ready at `supabase/migrations/001_lead_capture.sql`; flip the day he wants SQL over Blob.
5. **Website re-verification** — run `scripts/rebuild_served.py --recheck` from a proper network quarterly (~20% rot observed).
6. **572 staged listings** — verification-worker pass (confirm street address + pricing via phone/web) before they go live.

## Files of record

- Data contract + pipeline: `scripts/rebuild_served.py`, `public/data/directory.json`, `public/data/stats.json`, `public/data/featured.json`
- Funnels: `src/app/api/{leads,claims,newsletter,analytics}/route.ts`, `src/lib/lead-store.ts`, `src/lib/abuse.ts`
- Admin: `src/app/admin/page.tsx`, `src/app/api/admin/leads/route.ts`
- Supabase future: `supabase/migrations/001_lead_capture.sql`
- Reports: `audit/FINDINGS.md`, `audit/GAPS.md`, `audit/PHASE1-REPORT.json`, `audit/SIBLING-REPOS.md`, `audit/operator_contacts.json` (internal PII)
