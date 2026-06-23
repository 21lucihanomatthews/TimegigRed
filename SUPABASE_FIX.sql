-- Changed from "created_at" to "createdAt" in order() functions
-- ==========================================
-- SUPABASE DATABASE RESET & FIX SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ==========================================

-- 1. DROP EXISTING TABLES (CAUTION: This will delete all existing data)
DROP TABLE IF EXISTS gigs, seekers, market_items, profiles, notifications, promotions, messages, topup_requests CASCADE;

-- 2. CREATE GIGS TABLE
CREATE TABLE gigs (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  owner_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  budget TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE SEEKERS TABLE
CREATE TABLE seekers (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  rate TEXT,
  contact_info TEXT,
  images TEXT[],
  social_media TEXT[],
  website_url TEXT[],
  videos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE MARKET ITEMS TABLE
CREATE TABLE market_items (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  owner_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  location TEXT,
  images TEXT[],
  type TEXT, -- 'sell' or 'want'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE PROFILES TABLE
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  middle_name TEXT DEFAULT '',
  surname TEXT,
  contact TEXT,
  avatar_url TEXT,
  social_links TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  id_uploaded BOOLEAN DEFAULT FALSE,
  cv_uploaded BOOLEAN DEFAULT FALSE,
  certificates_uploaded BOOLEAN DEFAULT FALSE,
  balance INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  receive_code TEXT UNIQUE,
  transactions JSONB DEFAULT '[]'::JSONB,
  has_seen_tour BOOLEAN DEFAULT FALSE,
  password TEXT,
  pin TEXT
);

-- 6. CREATE NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  timestamp BIGINT,
  read BOOLEAN DEFAULT FALSE
);

-- 7. CREATE PROMOTIONS TABLE
CREATE TABLE promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at_bigint BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATE MESSAGES TABLE
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  text TEXT,
  timestamp TEXT,
  status TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  media_urls TEXT[],
  media_type TEXT,
  likes TEXT[]
);

-- 9. CREATE TOPUP REQUESTS TABLE
CREATE TABLE topup_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  coins INTEGER,
  rand_amount TEXT,
  proof_url TEXT,
  status TEXT, -- 'pending', 'approved', 'rejected'
  date TEXT
);

-- 10. INSERT DEFAULT DATA (To prevent initial missing profile errors)
INSERT INTO profiles (id, name, middle_name, surname, contact, avatar_url, social_links, is_verified, id_uploaded, cv_uploaded, certificates_uploaded, balance, is_admin, receive_code, transactions, has_seen_tour)
VALUES 
('me', 'User', '', '', '', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop', ARRAY[]::TEXT[], false, false, false, false, 0, false, 'GIG-USER', '[]'::JSONB, false)
ON CONFLICT (id) DO NOTHING;

-- 11. DISABLE RLS (IMPORTANT)
ALTER TABLE gigs DISABLE ROW LEVEL SECURITY;
ALTER TABLE seekers DISABLE ROW LEVEL SECURITY;
ALTER TABLE market_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE topup_requests DISABLE ROW LEVEL SECURITY;

-- 12. GRANT ALL PERMISSIONS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
