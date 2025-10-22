-- =====================================================
-- ENCUENTRAME / FIND ME - Complete Database Schema
-- Bilingual Adult Classifieds Platform
-- =====================================================
-- This file contains the complete database structure with:
-- - All tables with proper data types
-- - Foreign key relationships
-- - Row Level Security (RLS) policies
-- - Indexes for performance
-- - Triggers for automation
-- - Initial seed data
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- PROFILES TABLE
-- Stores user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
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

-- COUNTRIES TABLE
-- Master list of supported countries
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

-- STATES TABLE
-- States/provinces within countries
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

-- CITIES TABLE
-- Cities within states
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

-- CATEGORIES TABLE
-- Service categories
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

-- LOCATIONS TABLE (Legacy - being replaced by countries/states/cities)
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en text NOT NULL,
  name_es text NOT NULL,
  slug text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('country', 'state', 'city')),
  parent_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- LISTINGS TABLE
-- Core table for all classified ads
-- =====================================================
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,

  -- Geographic location (new structure)
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  state_id uuid REFERENCES states(id) ON DELETE SET NULL,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  neighborhood text,

  -- Legacy location (being phased out)
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,

  -- Basic information
  title text NOT NULL,
  description text NOT NULL,
  age integer CHECK (age >= 18 AND age <= 99),

  -- Pricing
  price numeric(10,2),
  currency text DEFAULT 'USD',

  -- Contact information
  contact_phone text,
  contact_email text,
  whatsapp text,
  website_url text,
  instagram_url text,
  twitter_url text,
  telegram_url text,

  -- Service details (array fields for multiple selections)
  service_type text[],      -- e.g., ['outcall', 'incall', 'virtual']
  attends_to text[],         -- e.g., ['men', 'women', 'couples']
  schedule text[],           -- e.g., ['morning', 'afternoon', 'night', '24/7']
  languages text[],          -- e.g., ['spanish', 'english', 'portuguese']
  payment_methods text[],    -- e.g., ['cash', 'card', 'crypto', 'transfer']

  -- Travel information
  travels boolean DEFAULT false,
  travel_cities text[],

  -- Status and visibility
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'expired', 'rejected')),
  featured boolean DEFAULT false,
  is_verified boolean DEFAULT false,

  -- Metrics
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  favorites_count integer DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz,
  expires_at timestamptz
);

-- =====================================================
-- MEDIA AND CONTENT TABLES
-- =====================================================

-- LISTING_MEDIA TABLE
-- Photos and videos for listings (new structure)
CREATE TABLE IF NOT EXISTS listing_media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  url text NOT NULL,
  thumbnail_url text,
  order_index integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  file_size integer,
  width integer,
  height integer,
  created_at timestamptz DEFAULT now()
);

-- LISTING_IMAGES TABLE (Legacy - being replaced by listing_media)
CREATE TABLE IF NOT EXISTS listing_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- ENGAGEMENT TABLES
-- =====================================================

-- FAVORITES TABLE
-- User's saved/favorited listings
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- LISTING_LIKES TABLE
CREATE TABLE IF NOT EXISTS listing_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- USER_LIKES TABLE (Alternative likes implementation)
CREATE TABLE IF NOT EXISTS user_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- LISTING_SHARES TABLE
-- Track when listings are shared
CREATE TABLE IF NOT EXISTS listing_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- LISTING_VIEWS TABLE
-- Analytics for listing views
CREATE TABLE IF NOT EXISTS listing_views (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  referrer text,
  country text,
  city text,
  device_type text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- REVIEWS AND MODERATION
-- =====================================================

-- REVIEWS TABLE
-- User reviews for listings
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, user_id)
);

-- REPORTS TABLE
-- User-submitted reports for inappropriate content
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- MESSAGING AND SUPPORT
-- =====================================================

-- MESSAGES TABLE
-- Direct messages between users
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text,
  body text NOT NULL,
  is_read boolean DEFAULT false,
  parent_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- SUPPORT_TICKETS TABLE
-- Customer support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  category text NOT NULL CHECK (category IN ('technical', 'billing', 'content', 'other')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- CONTACT_SUBMISSIONS TABLE
-- Contact form submissions from website
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- PREMIUM SERVICES AND PAYMENTS
-- =====================================================

-- PREMIUM_SERVICES TABLE
-- Available premium features and upgrades
CREATE TABLE IF NOT EXISTS premium_services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en text NOT NULL,
  name_es text NOT NULL,
  description_en text,
  description_es text,
  service_type text NOT NULL CHECK (service_type IN ('featured', 'top_position', 'multi_city', 'auto_renewal', 'ai_social')),
  price_usd numeric(10,2) NOT NULL,
  duration_days integer,
  is_active boolean DEFAULT true,
  features jsonb,
  created_at timestamptz DEFAULT now()
);

-- TRANSACTIONS TABLE
-- Payment transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  service_id uuid REFERENCES premium_services(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text NOT NULL,
  payment_provider text,
  provider_transaction_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- USER_SUBSCRIPTIONS TABLE
-- Active premium subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES premium_services(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  auto_renew boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- ANALYTICS TABLE
-- =====================================================

-- PLATFORM_ANALYTICS TABLE
-- Daily platform metrics and statistics
CREATE TABLE IF NOT EXISTS platform_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  date date NOT NULL UNIQUE,
  total_users integer DEFAULT 0,
  new_users integer DEFAULT 0,
  total_listings integer DEFAULT 0,
  new_listings integer DEFAULT 0,
  total_views integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country_id);

CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);

CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_country ON listings(country_id);
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(state_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listing_media_listing ON listing_media(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);

CREATE INDEX IF NOT EXISTS idx_listing_views_listing ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_created ON listing_views(created_at);

CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- Countries: Public read access
CREATE POLICY "Countries are publicly readable"
  ON countries FOR SELECT
  TO public
  USING (is_active = true);

-- States: Public read access
CREATE POLICY "States are publicly readable"
  ON states FOR SELECT
  TO public
  USING (is_active = true);

-- Cities: Public read access
CREATE POLICY "Cities are publicly readable"
  ON cities FOR SELECT
  TO public
  USING (is_active = true);

-- Categories: Public read access
CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  TO public
  USING (true);

-- Listings: Public can view active listings
CREATE POLICY "Public can view active listings"
  ON listings FOR SELECT
  TO public
  USING (status = 'active');

-- Listings: Users can manage their own listings
CREATE POLICY "Users can manage own listings"
  ON listings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Listing Media: Public can view media for active listings
CREATE POLICY "Public can view media for active listings"
  ON listing_media FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.status = 'active'
    )
  );

-- Listing Media: Users can manage their own listing media
CREATE POLICY "Users can manage own listing media"
  ON listing_media FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Listing Views: Anyone can create view records
CREATE POLICY "Anyone can create view records"
  ON listing_views FOR INSERT
  TO public
  WITH CHECK (true);

-- Listing Views: Users can view analytics for their own listings
CREATE POLICY "Users can view own listing analytics"
  ON listing_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_views.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Reviews: Public can view approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  TO public
  USING (is_approved = true);

-- Reports: Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

-- Messages: Users can view their own messages
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Support Tickets: Users can manage their own tickets
CREATE POLICY "Users can manage own tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Contact Submissions: Anyone can submit
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  TO public
  WITH CHECK (true);

-- Premium Services: Public read access
CREATE POLICY "Premium services are publicly readable"
  ON premium_services FOR SELECT
  TO public
  USING (is_active = true);

-- Transactions: Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- User Subscriptions: Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incrementing views
DROP TRIGGER IF EXISTS trigger_increment_views ON listing_views;
CREATE TRIGGER trigger_increment_views
  AFTER INSERT ON listing_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_listing_views();

-- Function to update favorites count
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.listing_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings
    SET favorites_count = favorites_count - 1
    WHERE id = OLD.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating favorites count
DROP TRIGGER IF EXISTS trigger_update_favorites_count ON favorites;
CREATE TRIGGER trigger_update_favorites_count
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorites_count();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert Countries
INSERT INTO countries (name_en, name_es, code, flag_emoji, slug, order_index) VALUES
('United States', 'Estados Unidos', 'US', '🇺🇸', 'united-states', 1),
('Mexico', 'México', 'MX', '🇲🇽', 'mexico', 2),
('Colombia', 'Colombia', 'CO', '🇨🇴', 'colombia', 3),
('Argentina', 'Argentina', 'AR', '🇦🇷', 'argentina', 4),
('Spain', 'España', 'ES', '🇪🇸', 'spain', 5),
('Venezuela', 'Venezuela', 'VE', '🇻🇪', 'venezuela', 6),
('Chile', 'Chile', 'CL', '🇨🇱', 'chile', 7),
('Peru', 'Perú', 'PE', '🇵🇪', 'peru', 8),
('Ecuador', 'Ecuador', 'EC', '🇪🇨', 'ecuador', 9),
('Brazil', 'Brasil', 'BR', '🇧🇷', 'brazil', 10),
('Canada', 'Canadá', 'CA', '🇨🇦', 'canada', 11)
ON CONFLICT (code) DO NOTHING;

-- Insert Categories
INSERT INTO categories (name_en, name_es, slug, icon, order_index) VALUES
('Female Escorts', 'Escorts Femeninas', 'female-escorts', '👩', 1),
('Male Escorts', 'Escorts Masculinos', 'male-escorts', '👨', 2),
('Trans Escorts', 'Escorts Trans', 'trans-escorts', '🦄', 3),
('Massage Therapists', 'Masajistas', 'massage-therapists', '💆', 4),
('Dominatrix', 'Dominatrix', 'dominatrix', '👠', 5),
('Virtual Services', 'Servicios Virtuales', 'virtual-services', '📱', 6),
('Companions', 'Acompañantes', 'companions', '🌟', 7),
('Agencies', 'Agencias', 'agencies', '🏢', 8),
('Adult Content Creators', 'Creadores de Contenido', 'content-creators', '📸', 9),
('Dancers', 'Bailarines/Bailarinas', 'dancers', '💃', 10),
('BDSM Services', 'Servicios BDSM', 'bdsm-services', '⛓️', 11),
('Couples', 'Parejas', 'couples', '👫', 12),
('Other Services', 'Otros Servicios', 'other-services', '✨', 13)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DATABASE RELATIONSHIP DIAGRAM
-- =====================================================
/*

GEOGRAPHIC HIERARCHY:
countries (1) → (many) states (1) → (many) cities

USER RELATIONSHIPS:
profiles (1) → (many) listings
profiles (1) → (many) favorites
profiles (1) → (many) reviews
profiles (1) → (many) messages (as sender)
profiles (1) → (many) messages (as recipient)
profiles (1) → (many) transactions
profiles (1) → (many) user_subscriptions

LISTING RELATIONSHIPS:
listings (1) → (many) listing_media
listings (1) → (many) listing_images
listings (1) → (many) favorites
listings (1) → (many) listing_likes
listings (1) → (many) listing_views
listings (1) → (many) listing_shares
listings (1) → (many) reviews
listings (1) → (many) reports
listings → (1) categories
listings → (1) countries
listings → (1) states
listings → (1) cities

PREMIUM SERVICES:
premium_services (1) → (many) transactions
premium_services (1) → (many) user_subscriptions
transactions (1) → (many) user_subscriptions

TOTAL TABLES: 23
- Core: 6 (profiles, countries, states, cities, categories, locations)
- Listings: 3 (listings, listing_media, listing_images)
- Engagement: 5 (favorites, listing_likes, user_likes, listing_shares, listing_views)
- Reviews & Moderation: 2 (reviews, reports)
- Messaging: 3 (messages, support_tickets, contact_submissions)
- Premium: 3 (premium_services, transactions, user_subscriptions)
- Analytics: 1 (platform_analytics)

*/
