/*
  # Create Premium Tables and Seed Data

  1. Premium Tables
    - premium_services: Available premium features
    - transactions: Payment records
    - user_subscriptions: Active subscriptions
    
  2. Seed Data
    - Countries
    - Categories
    
  3. Indexes
    - Performance indexes for all tables
    
  4. Triggers
    - Auto-increment views and favorites
*/

-- =====================================================
-- PREMIUM_SERVICES TABLE
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
-- TRANSACTIONS TABLE
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
-- USER_SUBSCRIPTIONS TABLE
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

-- =====================================================
-- SEED DATA - COUNTRIES
-- =====================================================
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

-- =====================================================
-- SEED DATA - CATEGORIES
-- =====================================================
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