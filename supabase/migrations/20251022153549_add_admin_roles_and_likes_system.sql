/*
  # Add Admin Roles and Likes System

  ## Overview
  Extends the existing schema with admin role management and social features (likes/shares).

  ## Changes to Existing Tables

  ### 1. `profiles` table
  - Add `role` column (text) - user role: 'user' or 'admin'
  - Add `is_active` column (boolean) - account status
  - Default role is 'user'

  ## New Tables

  ### 2. `listing_likes`
  User likes for listings (replaces favorites with more social features)
  - `id` (uuid, pk) - Unique identifier
  - `user_id` (uuid, fk) - User who liked
  - `listing_id` (uuid, fk) - Listing that was liked
  - `created_at` (timestamptz) - When the like occurred
  - Unique constraint on (user_id, listing_id)

  ### 3. `listing_shares`
  Track when listings are shared
  - `id` (uuid, pk) - Unique identifier
  - `listing_id` (uuid, fk) - Listing that was shared
  - `user_id` (uuid, fk, nullable) - User who shared (null if anonymous)
  - `platform` (text) - Platform shared to (whatsapp, facebook, twitter, etc)
  - `created_at` (timestamptz) - When the share occurred

  ## Security

  ### Row Level Security (RLS)
  All new tables have RLS enabled with appropriate policies:

  1. **listing_likes**: Users can manage their own likes, everyone can view counts
  2. **listing_shares**: Public insertions allowed, read access for statistics

  ## Indexes
  Performance indexes on:
  - listing_likes: user_id, listing_id
  - listing_shares: listing_id

  ## Important Notes
  1. Admin role allows full access to manage content
  2. Likes system replaces favorites for better social engagement
  3. Share tracking helps with analytics
  4. RLS policies ensure users can only modify their own data
*/

-- Add role and status columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create listing_likes table
CREATE TABLE IF NOT EXISTS listing_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE listing_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
  ON listing_likes FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON listing_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON listing_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create listing_shares table
CREATE TABLE IF NOT EXISTS listing_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  platform text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listing_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shares"
  ON listing_shares FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can insert shares"
  ON listing_shares FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Add likes_count and shares_count to listings for better performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE listings ADD COLUMN likes_count int DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'shares_count'
  ) THEN
    ALTER TABLE listings ADD COLUMN shares_count int DEFAULT 0;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_listing_likes_user ON listing_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_likes_listing ON listing_likes(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_shares_listing ON listing_shares(listing_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_listing_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE listings
    SET likes_count = likes_count + 1
    WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE listings
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update shares count
CREATE OR REPLACE FUNCTION update_listing_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET shares_count = shares_count + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_likes_count ON listing_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON listing_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_likes_count();

DROP TRIGGER IF EXISTS trigger_update_shares_count ON listing_shares;
CREATE TRIGGER trigger_update_shares_count
  AFTER INSERT ON listing_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_shares_count();

-- Add admin policies for listings (admins can manage all listings)
CREATE POLICY "Admins can view all listings"
  ON listings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all listings"
  ON listings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin policies for categories
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin policies for locations
CREATE POLICY "Admins can insert locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete locations"
  ON locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin policy for profiles (admins can view and update all profiles)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );