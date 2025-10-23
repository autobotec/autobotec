/*
  # Initialize ENCUENTRAME / FIND ME Database

  1. Core Setup
    - Enable UUID extension
    - Create profiles table if it doesn't exist
    
  2. Geographic Tables
    - countries: Master list of supported countries
    - states: States/provinces within countries
    - cities: Cities within states
    
  3. Categories
    - Service categories for listings
    
  4. Listings Table
    - Core table with all fields for adult classifieds
    - Geographic references, contact info, service details
    
  5. Supporting Tables
    - listing_media: Photos and videos
    - listing_views: Analytics
    - favorites: User saved listings
    - reports, reviews, messages, support_tickets
    - premium_services, transactions, user_subscriptions
    
  6. Security
    - Enable RLS on all tables
    - Create appropriate policies for each table
    
  7. Performance
    - Add indexes for frequently queried columns
    
  8. Automation
    - Triggers for view counting and favorites counting
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  phone text,
  email text,
  avatar_url text,
  bio_en text,
  bio_es text,
  whatsapp text,
  language_preference text DEFAULT 'es' CHECK (language_preference IN ('es', 'en')),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  country_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- =====================================================
-- COUNTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en text NOT NULL,
  name_es text NOT NULL,
  code text UNIQUE NOT NULL,
  flag_emoji text NOT NULL,
  slug text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'countries' AND policyname = 'Countries are publicly readable'
  ) THEN
    CREATE POLICY "Countries are publicly readable"
      ON countries FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END $$;

-- =====================================================
-- STATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS states (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_es text NOT NULL,
  slug text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(country_id, slug)
);

ALTER TABLE states ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'states' AND policyname = 'States are publicly readable'
  ) THEN
    CREATE POLICY "States are publicly readable"
      ON states FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END $$;

-- =====================================================
-- CITIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id uuid NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_es text NOT NULL,
  slug text NOT NULL,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(state_id, slug)
);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'cities' AND policyname = 'Cities are publicly readable'
  ) THEN
    CREATE POLICY "Cities are publicly readable"
      ON cities FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END $$;

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en text NOT NULL,
  name_es text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'categories' AND policyname = 'Categories are publicly readable'
  ) THEN
    CREATE POLICY "Categories are publicly readable"
      ON categories FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- =====================================================
-- LISTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  state_id uuid REFERENCES states(id) ON DELETE SET NULL,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  neighborhood text,
  title text NOT NULL,
  description text NOT NULL,
  age integer CHECK (age >= 18 AND age <= 99),
  price numeric(10,2),
  currency text DEFAULT 'USD',
  contact_phone text,
  contact_email text,
  whatsapp text,
  website_url text,
  instagram_url text,
  twitter_url text,
  telegram_url text,
  service_type text[],
  attends_to text[],
  schedule text[],
  languages text[],
  payment_methods text[],
  travels boolean DEFAULT false,
  travel_cities text[],
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'expired', 'rejected')),
  featured boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  favorites_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  expires_at timestamptz
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings' AND policyname = 'Public can view active listings'
  ) THEN
    CREATE POLICY "Public can view active listings"
      ON listings FOR SELECT
      TO public
      USING (status = 'active');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings' AND policyname = 'Users can view own listings'
  ) THEN
    CREATE POLICY "Users can view own listings"
      ON listings FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings' AND policyname = 'Users can insert own listings'
  ) THEN
    CREATE POLICY "Users can insert own listings"
      ON listings FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings' AND policyname = 'Users can update own listings'
  ) THEN
    CREATE POLICY "Users can update own listings"
      ON listings FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listings' AND policyname = 'Users can delete own listings'
  ) THEN
    CREATE POLICY "Users can delete own listings"
      ON listings FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Continue with remaining tables...