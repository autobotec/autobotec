/*
  # Add Favorites Table

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `listing_id` (uuid, foreign key to listings)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `favorites` table
    - Users can only manage their own favorites

  3. Indexes
    - Unique index on (user_id, listing_id)
    - Index on listing_id for faster queries
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
