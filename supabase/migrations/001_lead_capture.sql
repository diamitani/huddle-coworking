-- Huddle lead-capture tables (one-tap Supabase path).
-- Run in the Supabase SQL editor, then set on Vercel:
--   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
--   SUPABASE_SERVICE_ROLE_KEY (server-only, never NEXT_PUBLIC_).
-- The app writes via the service-role key from API routes only.
-- Public anonymous INSERT is also allowed (RLS policy below) as a fallback;
-- SELECT is never public.

CREATE TABLE IF NOT EXISTS lead_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  space_name TEXT NOT NULL,
  space_city TEXT DEFAULT '',
  space_state TEXT DEFAULT '',
  space_slug TEXT DEFAULT '',
  inquiry_type TEXT NOT NULL DEFAULT 'tour', -- tour | membership | pricing | event | other
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new', -- new | contacted | converted | archived
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_name TEXT NOT NULL,
  space_slug TEXT DEFAULT '',
  space_city TEXT DEFAULT '',
  space_state TEXT DEFAULT '',
  claimant_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  claimant_phone TEXT DEFAULT '',
  claimant_role TEXT DEFAULT '',
  proof_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new', -- new | verified | rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS space_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_name TEXT NOT NULL,
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  address TEXT DEFAULT '',
  website TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  description TEXT DEFAULT '',
  submitter_name TEXT DEFAULT '',
  submitter_email TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new', -- new | approved | rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'site',
  status TEXT NOT NULL DEFAULT 'subscribed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS featured_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_name TEXT DEFAULT '',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'featured', -- featured | premium
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lead_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors may INSERT (the lead funnel); they may never SELECT.
CREATE POLICY "public insert inquiries" ON lead_inquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public insert claims" ON claim_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public insert submissions" ON space_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public insert newsletter" ON newsletter_signups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public insert waitlist" ON featured_waitlist FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public insert pageviews" ON page_views FOR INSERT TO anon WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_lead_inquiries_created ON lead_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claim_requests_created ON claim_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_created ON newsletter_signups(created_at DESC);
