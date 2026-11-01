# HuddleCo.work — Product Roadmap

**Vision:** The world's most comprehensive coworking directory. One directory, three lenses:
- **HUDDLE** — find people: events, networking, workshops, panels hosted at spaces
- **WORK** — find space: desks, offices, memberships, day passes, meeting rooms
- **COLLABORATE** — find programs: courses, classes, open studios, accelerators at spaces

**Money thesis:** make money in sleep via SEO → traffic → inquiries → featured listings → pay-per-lead → commissions. (Full model: the Profitable Directory Site Playbook.)

**Standing rules:** zero fabricated content — every number computed from served data. Real payments/Stripe stay Patrick's tap.

---

## V1 — Foundations (in progress)

Theme: *simple, professional, premium. Everything works.*

**Data**
- Served-set surgery: junk/closed listings removed, geo fixed, dead websites dropped, cross-wired descriptions fixed, fabricated amenities/events/social proof removed
- 429 real OSM venues merged (validated, deduped)
- Pricing fields P0: membership fees, day-pass, meeting-room rates (brand-level research for chains; self-report via claim flow; honest "not listed" state — never fabricated)
- One reproducible build script (`scripts/rebuild_served.py`) with validation gates; master CSV quarantined to `deprecated/`
- Schema carries access-hours + membership tiers now (future Huddle Nights needs no remodel)

**Structure**
- Spaces core entity + lightweight event/program entities
- Three browse lenses (Huddle / Work / Collaborate), not three products

**SEO (P0 — the sleep-money engine)**
- sitemap.xml, robots.txt, per-page metadata, JSON-LD LocalBusiness on every listing
- Crawlable listing + city pages; URL integrity: unique-slug routing, zero dead links/404s

**Design & UX**
- Listing cards, branding, layout polish — premium, no bloat
- Working OAuth (Cognito login/signup) end-to-end; saved spaces, dashboard
- Search, filters, listing detail pages
- Inquiry/tour-request flow that actually stores (the money funnel)
- Claim-your-listing FORM → review queue (the form is v1; the agent is v2)
- Newsletter signup that stores

**Backend track (parallel)**
- Master directory DB template (`~/workspace/directory-backend-template/`): one multi-tenant Supabase/Postgres backend for all directory apps — listings + metadata, full-text/trigram/GIN indexes, events, programs, claims, inquiries/leads pipeline, featured subscriptions, search-query log, listing events, data-jobs ledger
- Huddle adopts it as the graduation path (field names aligned for trivial mapping)

**Ship criteria:** independent tester PASS (different model family), push to main, deploy live on huddleco.work.

---

## V2 — Agents

Theme: *the directory runs itself.*

1. **Data stewards** (background) — continuous website re-verification, closed-space detection, dedupe, pricing freshness. The trust engine.
2. **Concierge matcher** — conversational "find me a space": team size, budget, area, vibe → ranked shortlist → inquiry. The conversion engine.
3. **Claim helper** — when a space claims its listing, draft the profile from public data for one-tap approval. The supply engine; feeds featured upsell.
4. **Event scout** — crawl spaces' public calendars/socials into the Huddle events feed.
5. **Lead router + pricing intel** — score/route inquiries to featured spaces first (pay-per-lead engine); monitor brand pricing pages for changes.

**Artispreneur port (parallel track):** the claim-helper pattern applies directly to Artispreneur's 41,810-listing directory. No blank listings needed — the work queue is *unclaimed + incomplete* listings: backend worker agents enrich/verify/draft, then email operators (via Drive contact lists pattern) to claim. Same claims table, same review queue, directory_slug='artispreneur-directory' in the master DB.

---

## V3 — Platform (future)

- **Huddle Nights**: half-price night-access memberships for creatives/part-timers (origin: May 2024 WeWork pitch to Peter Greenspan — $0/$20/$99/$200 tiers, $58.8M ARR goal)
- Team / remote-employee booking
- Booking commissions (15–20% day-pass/meeting, 10% first-year membership)
- Backend SaaS for spaces ($79–$199/mo booking widget/CRM)

---

## Money timeline

- **V1:** SEO traffic compounds (first rankings 60–90 days; meaningful 9–12 mo) → inquiries captured → featured listings sold by direct outreach *before* traffic exists (playbook bootstrap)
- **V2:** pay-per-lead engine ($40–$75/qualified tour lead) + concierge conversion + claim→featured upsell loop
- **V3:** commissions + SaaS + data licensing

## Patrick's taps (not agents')

Stripe activation + checkout, Supabase project + keys, sending claim-outreach emails, any real payment, DNS/domain changes.
