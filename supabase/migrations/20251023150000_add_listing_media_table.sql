/*
  # Add Listing Media Table

  1. New Tables
    - `listing_media`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, foreign key to listings)
      - `media_type` (text: 'image' or 'video')
      - `media_url` (text: URL to the media file)
      - `order_index` (integer: for ordering media)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `listing_media` table
    - Users can view all active listing media
    - Users can manage their own listing media

  3. Indexes
    - Index on listing_id for faster queries
*/

CREATE TABLE IF NOT EXISTS listing_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_media_listing_id ON listing_media(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_media_order ON listing_media(listing_id, order_index);

ALTER TABLE listing_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view media for active listings"
  ON listing_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.status = 'active'
    )
  );

CREATE POLICY "Users can view their own listing media"
  ON listing_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media for their listings"
  ON listing_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their listing media"
  ON listing_media FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their listing media"
  ON listing_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_media.listing_id
      AND listings.user_id = auth.uid()
    )
  );
