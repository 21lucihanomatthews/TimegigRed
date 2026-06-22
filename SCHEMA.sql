-- Gigs Table
CREATE TABLE gigs (
  id TEXT PRIMARY KEY,
  ownerId TEXT NOT NULL,
  ownerName TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  budget TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seekers Table
CREATE TABLE seekers (
  id TEXT PRIMARY KEY,
  ownerId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  rate TEXT,
  contactInfo TEXT,
  images TEXT[],
  socialMedia TEXT[],
  websiteUrl TEXT[],
  videos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market Items Table
CREATE TABLE market_items (
  id TEXT PRIMARY KEY,
  ownerId TEXT NOT NULL,
  ownerName TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT,
  location TEXT,
  images TEXT[],
  type TEXT, -- 'sell' or 'want'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  middleName TEXT,
  surname TEXT,
  contact TEXT,
  avatarUrl TEXT,
  socialLinks TEXT[],
  isVerified BOOLEAN DEFAULT FALSE,
  idUploaded BOOLEAN DEFAULT FALSE,
  cvUploaded BOOLEAN DEFAULT FALSE,
  certificatesUploaded BOOLEAN DEFAULT FALSE,
  balance INTEGER DEFAULT 0,
  isAdmin BOOLEAN DEFAULT FALSE,
  receiveCode TEXT UNIQUE,
  transactions JSONB DEFAULT '[]'::JSONB,
  hasSeenTour BOOLEAN DEFAULT FALSE
);

-- Notifications Table
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT,
  timestamp BIGINT,
  read BOOLEAN DEFAULT FALSE
);

-- Promotions Table
CREATE TABLE promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  createdAt BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  fromId TEXT NOT NULL,
  toId TEXT NOT NULL,
  text TEXT,
  timestamp TEXT,
  status TEXT,
  isRead BOOLEAN DEFAULT FALSE,
  isDeleted BOOLEAN DEFAULT FALSE,
  isEdited BOOLEAN DEFAULT FALSE,
  mediaUrls TEXT[],
  mediaType TEXT,
  likes TEXT[]
);

-- Topup Requests Table
CREATE TABLE topup_requests (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  userName TEXT,
  coins INTEGER,
  randAmount TEXT,
  proofUrl TEXT,
  status TEXT, -- 'pending', 'approved', 'rejected'
  date TEXT
);
