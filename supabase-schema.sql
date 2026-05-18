-- Huddle Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  phone TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. INQUIRIES (contact form submissions)
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  space_name TEXT NOT NULL,
  space_city TEXT,
  space_state TEXT,
  space_website TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'membership',
  -- Types: membership, tour, pricing, event, other
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status: pending, contacted, resolved, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SAVED SPACES
CREATE TABLE saved_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  space_name TEXT NOT NULL,
  space_city TEXT,
  space_state TEXT,
  space_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, space_name)
);

-- 4. SPACE LISTINGS (for space owners)
CREATE TABLE space_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  city TEXT,
  state TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  amenities TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_listings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Inquiries: users can CRUD their own
CREATE POLICY "Users can view own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inquiries"
  ON inquiries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inquiries"
  ON inquiries FOR DELETE
  USING (auth.uid() = user_id);

-- Saved spaces: users can CRUD their own
CREATE POLICY "Users can view own saved spaces"
  ON saved_spaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save spaces"
  ON saved_spaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave spaces"
  ON saved_spaces FOR DELETE
  USING (auth.uid() = user_id);

-- Space listings: owners can CRUD their own
CREATE POLICY "Owners can view own listings"
  ON space_listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can create listings"
  ON space_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update own listings"
  ON space_listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_saved_spaces_user_id ON saved_spaces(user_id);
CREATE INDEX idx_space_listings_user_id ON space_listings(user_id);
