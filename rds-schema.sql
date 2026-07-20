-- Huddle RDS PostgreSQL Schema
-- Run once against your RDS huddle database

CREATE TABLE IF NOT EXISTS inquiries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_sub    TEXT NOT NULL,
  user_email  TEXT NOT NULL,
  space_name  TEXT NOT NULL,
  space_city  TEXT DEFAULT '',
  space_state TEXT DEFAULT '',
  space_website TEXT DEFAULT '',
  inquiry_type TEXT NOT NULL DEFAULT 'membership',
  message     TEXT DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_user_sub ON inquiries(user_sub);

CREATE TABLE IF NOT EXISTS saved_spaces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_sub    TEXT NOT NULL,
  user_email  TEXT NOT NULL,
  space_name  TEXT NOT NULL,
  space_city  TEXT DEFAULT '',
  space_state TEXT DEFAULT '',
  space_slug  TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_sub, space_slug)
);

CREATE INDEX IF NOT EXISTS idx_saved_user_sub ON saved_spaces(user_sub);
