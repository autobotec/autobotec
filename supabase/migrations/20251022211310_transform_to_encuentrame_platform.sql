/*
  # Transform to ENCUENTRAME / FIND ME Platform
  
  ## Changes
  
  ### 1. Update profiles table
  - Add fields: whatsapp, language_preference, country_id, is_verified
  
  ### 2. Create geographic tables (countries, states, cities)
  - Replace old locations table with proper hierarchy
  
  ### 3. Update listings table
  - Add new required fields for ENCUENTRAME functionality
  - Add service type arrays and detailed contact info
  
  ### 4. Create new supporting tables
  - listing_media (replaces listing_images with video support)
  - listing_views (analytics)
  - reports, reviews, messages, support_tickets
  - premium_services, transactions, user_subscriptions
  - platform_analytics
*/

-- =====================================================
-- 1. UPDATE PROFILES TABLE
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'whatsapp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN whatsapp text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'language_preference'
  ) THEN
    ALTER TABLE profiles ADD COLUMN language_preference text DEFAULT 'es' CHECK (language_preference IN ('es', 'en'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'country_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country_id uuid;
  END IF;
END $$;

-- =====================================================
-- 2. CREATE COUNTRIES TABLE
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
-- 3. CREATE STATES TABLE
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
-- 4. CREATE CITIES TABLE
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
-- 5. UPDATE LISTINGS TABLE
-- =====================================================

DO $$
BEGIN
  -- Add country_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'country_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN country_id uuid REFERENCES countries(id) ON DELETE CASCADE;
  END IF;
  
  -- Add state_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'state_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN state_id uuid REFERENCES states(id) ON DELETE SET NULL;
  END IF;
  
  -- Add city_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'city_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN city_id uuid REFERENCES cities(id) ON DELETE SET NULL;
  END IF;
  
  -- Unify title and description (remove _en/_es, use single fields)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'title_en'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'title'
  ) THEN
    ALTER TABLE listings RENAME COLUMN title_en TO title;
    ALTER TABLE listings DROP COLUMN IF EXISTS title_es;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'description_en'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'description'
  ) THEN
    ALTER TABLE listings RENAME COLUMN description_en TO description;
    ALTER TABLE listings DROP COLUMN IF EXISTS description_es;
  END IF;
  
  -- Add age field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'age'
  ) THEN
    ALTER TABLE listings ADD COLUMN age integer CHECK (age >= 18 AND age <= 99);
  END IF;
  
  -- Add social media fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'website_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN website_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'instagram_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN instagram_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'twitter_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN twitter_url text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'telegram_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN telegram_url text;
  END IF;
  
  -- Add location details
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'neighborhood'
  ) THEN
    ALTER TABLE listings ADD COLUMN neighborhood text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'travels'
  ) THEN
    ALTER TABLE listings ADD COLUMN travels boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'travel_cities'
  ) THEN
    ALTER TABLE listings ADD COLUMN travel_cities text[];
  END IF;
  
  -- Add service detail arrays (5 selectors)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN service_type text[];
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'attends_to'
  ) THEN
    ALTER TABLE listings ADD COLUMN attends_to text[];
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'schedule'
  ) THEN
    ALTER TABLE listings ADD COLUMN schedule text[];
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'languages'
  ) THEN
    ALTER TABLE listings ADD COLUMN languages text[];
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'payment_methods'
  ) THEN
    ALTER TABLE listings ADD COLUMN payment_methods text[];
  END IF;
  
  -- Add verification status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE listings ADD COLUMN is_verified boolean DEFAULT false;
  END IF;
  
  -- Add favorites_count if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'favorites_count'
  ) THEN
    ALTER TABLE listings ADD COLUMN favorites_count integer DEFAULT 0;
  END IF;
  
  -- Add published_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE listings ADD COLUMN published_at timestamptz;
  END IF;
END $$;

-- Update status check constraint to include 'rejected'
DO $$
BEGIN
  ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
  ALTER TABLE listings ADD CONSTRAINT listings_status_check 
    CHECK (status IN ('active', 'inactive', 'pending', 'expired', 'rejected'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- =====================================================
-- 6. CREATE LISTING_MEDIA TABLE (Photos & Videos)
-- =====================================================

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

ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listing_media' AND policyname = 'Public can view media for active listings'
  ) THEN
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
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listing_media' AND policyname = 'Users can manage own listing media'
  ) THEN
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
  END IF;
END $$;

-- =====================================================
-- 7. CREATE LISTING_VIEWS TABLE (Analytics)
-- =====================================================

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

ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listing_views' AND policyname = 'Anyone can create view records'
  ) THEN
    CREATE POLICY "Anyone can create view records"
      ON listing_views FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listing_views' AND policyname = 'Users can view own listing analytics'
  ) THEN
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
  END IF;
END $$;

-- =====================================================
-- 8. CREATE REPORTS TABLE
-- =====================================================

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

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reports' AND policyname = 'Authenticated users can create reports'
  ) THEN
    CREATE POLICY "Authenticated users can create reports"
      ON reports FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = reported_by);
  END IF;
END $$;

-- =====================================================
-- 9. CREATE REVIEWS TABLE
-- =====================================================

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

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reviews' AND policyname = 'Public can view approved reviews'
  ) THEN
    CREATE POLICY "Public can view approved reviews"
      ON reviews FOR SELECT
      TO public
      USING (is_approved = true);
  END IF;
END $$;

-- =====================================================
-- 10. CREATE MESSAGES TABLE
-- =====================================================

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

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages' AND policyname = 'Users can view own messages'
  ) THEN
    CREATE POLICY "Users can view own messages"
      ON messages FOR SELECT
      TO authenticated
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
  END IF;
END $$;

-- =====================================================
-- 11. CREATE SUPPORT_TICKETS TABLE
-- =====================================================

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

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'support_tickets' AND policyname = 'Users can manage own tickets'
  ) THEN
    CREATE POLICY "Users can manage own tickets"
      ON support_tickets FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- 12. CREATE PREMIUM_SERVICES TABLE
-- =====================================================

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

ALTER TABLE premium_services ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'premium_services' AND policyname = 'Premium services are publicly readable'
  ) THEN
    CREATE POLICY "Premium services are publicly readable"
      ON premium_services FOR SELECT
      TO public
      USING (is_active = true);
  END IF;
END $$;

-- =====================================================
-- 13. CREATE TRANSACTIONS TABLE
-- =====================================================

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

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'transactions' AND policyname = 'Users can view own transactions'
  ) THEN
    CREATE POLICY "Users can view own transactions"
      ON transactions FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- 14. CREATE USER_SUBSCRIPTIONS TABLE
-- =====================================================

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

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_subscriptions' AND policyname = 'Users can view own subscriptions'
  ) THEN
    CREATE POLICY "Users can view own subscriptions"
      ON user_subscriptions FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- 15. CREATE PLATFORM_ANALYTICS TABLE
-- =====================================================

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

ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_listings_country ON listings(country_id);
CREATE INDEX IF NOT EXISTS idx_listings_state ON listings(state_id);
CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city_id);
CREATE INDEX IF NOT EXISTS idx_listings_views ON listing_views(listing_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET views_count = views_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_views ON listing_views;
CREATE TRIGGER trigger_increment_views
  AFTER INSERT ON listing_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_listing_views();

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

DROP TRIGGER IF EXISTS trigger_update_favorites_count ON favorites;
CREATE TRIGGER trigger_update_favorites_count
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_favorites_count();