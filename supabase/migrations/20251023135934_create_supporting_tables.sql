/*
  # Create Supporting Tables

  1. Tables Created
    - listing_media: Photos and videos for listings
    - listing_views: Analytics tracking
    - favorites: User saved listings
    - reports: User-submitted reports
    - reviews: Listing reviews
    - messages: Direct messaging
    - support_tickets: Customer support
    - premium_services: Available premium features
    - transactions: Payment records
    - user_subscriptions: Active premium subscriptions
    
  2. Security
    - Enable RLS and create policies for each table
    
  3. Performance
    - Add indexes for common queries
    
  4. Automation
    - Triggers for analytics and counters
*/

-- =====================================================
-- LISTING_MEDIA TABLE
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
    WHERE tablename = 'listing_media' AND policyname = 'Users can insert own listing media'
  ) THEN
    CREATE POLICY "Users can insert own listing media"
      ON listing_media FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = listing_media.listing_id
          AND listings.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listing_media' AND policyname = 'Users can update own listing media'
  ) THEN
    CREATE POLICY "Users can update own listing media"
      ON listing_media FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM listings
          WHERE listings.id = listing_media.listing_id
          AND listings.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'listing_media' AND policyname = 'Users can delete own listing media'
  ) THEN
    CREATE POLICY "Users can delete own listing media"
      ON listing_media FOR DELETE
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
-- LISTING_VIEWS TABLE
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
-- FAVORITES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'favorites' AND policyname = 'Users can view own favorites'
  ) THEN
    CREATE POLICY "Users can view own favorites"
      ON favorites FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'favorites' AND policyname = 'Users can insert own favorites'
  ) THEN
    CREATE POLICY "Users can insert own favorites"
      ON favorites FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'favorites' AND policyname = 'Users can delete own favorites'
  ) THEN
    CREATE POLICY "Users can delete own favorites"
      ON favorites FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- REPORTS TABLE
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
-- REVIEWS TABLE
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
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'reviews' AND policyname = 'Users can insert reviews'
  ) THEN
    CREATE POLICY "Users can insert reviews"
      ON reviews FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- MESSAGES TABLE
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
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages' AND policyname = 'Users can insert messages'
  ) THEN
    CREATE POLICY "Users can insert messages"
      ON messages FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = sender_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'messages' AND policyname = 'Users can update own messages'
  ) THEN
    CREATE POLICY "Users can update own messages"
      ON messages FOR UPDATE
      TO authenticated
      USING (auth.uid() = recipient_id);
  END IF;
END $$;

-- =====================================================
-- SUPPORT_TICKETS TABLE
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
    WHERE tablename = 'support_tickets' AND policyname = 'Users can view own tickets'
  ) THEN
    CREATE POLICY "Users can view own tickets"
      ON support_tickets FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'support_tickets' AND policyname = 'Users can insert own tickets'
  ) THEN
    CREATE POLICY "Users can insert own tickets"
      ON support_tickets FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'support_tickets' AND policyname = 'Users can update own tickets'
  ) THEN
    CREATE POLICY "Users can update own tickets"
      ON support_tickets FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Continue with remaining tables in next migration...