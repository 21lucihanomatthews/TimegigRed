-- ==========================================
-- SUPABASE DATABASE RESET & FIX SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ==========================================

-- 1. DROP EXISTING TABLES (CAUTION: This will delete all existing data)
DROP TABLE IF EXISTS gigs, seekers, market_items, profiles, notifications, promotions, messages, topup_requests CASCADE;

-- 2. CREATE GIGS TABLE
CREATE TABLE gigs (
  id TEXT PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "ownerName" TEXT,
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
  "ownerId" TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  rate TEXT,
  "contactInfo" TEXT,
  images TEXT[],
  "socialMedia" TEXT[],
  "websiteUrl" TEXT[],
  videos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE MARKET ITEMS TABLE
CREATE TABLE market_items (
  id TEXT PRIMARY KEY,
  "ownerId" TEXT NOT NULL,
  "ownerName" TEXT,
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
  "middleName" TEXT DEFAULT '',
  surname TEXT,
  contact TEXT,
  "avatarUrl" TEXT,
  "socialLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isVerified" BOOLEAN DEFAULT FALSE,
  "idUploaded" BOOLEAN DEFAULT FALSE,
  "cvUploaded" BOOLEAN DEFAULT FALSE,
  "certificatesUploaded" BOOLEAN DEFAULT FALSE,
  balance INTEGER DEFAULT 0,
  "isAdmin" BOOLEAN DEFAULT FALSE,
  "receiveCode" TEXT UNIQUE,
  transactions JSONB DEFAULT '[]'::JSONB,
  "hasSeenTour" BOOLEAN DEFAULT FALSE
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
  "createdAt" BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATE MESSAGES TABLE
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  "fromId" TEXT NOT NULL,
  "toId" TEXT NOT NULL,
  text TEXT,
  timestamp TEXT,
  status TEXT,
  "isRead" BOOLEAN DEFAULT FALSE,
  "isDeleted" BOOLEAN DEFAULT FALSE,
  "isEdited" BOOLEAN DEFAULT FALSE,
  "mediaUrls" TEXT[],
  "mediaType" TEXT,
  likes TEXT[]
);

-- 9. CREATE TOPUP REQUESTS TABLE
CREATE TABLE topup_requests (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "userName" TEXT,
  coins INTEGER,
  "randAmount" TEXT,
  "proofUrl" TEXT,
  status TEXT, -- 'pending', 'approved', 'rejected'
  date TEXT
);

-- 10. DISABLE RLS (IMPORTANT)
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
