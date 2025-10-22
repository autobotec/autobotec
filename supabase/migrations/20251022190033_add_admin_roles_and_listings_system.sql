/*
  # Add admin roles and listings system

  1. New Tables
    - `listings`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - Owner of the listing
      - `title` (text) - Listing title
      - `description` (text) - Detailed description
      - `category` (text) - Category of listing
      - `location` (text) - Location information
      - `phone` (text, optional) - Contact phone
      - `email` (text, optional) - Contact email
      - `image_url` (text, optional) - Image URL
      - `views_count` (integer) - Number of views, default 0
      - `likes_count` (integer) - Number of likes, default 0
      - `shares_count` (integer) - Number of shares, default 0
      - `status` (text) - Status: active, inactive, or deleted, default 'active'
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `user_likes`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - User who liked
      - `listing_id` (uuid, foreign key) - Listing that was liked
      - `created_at` (timestamptz) - Timestamp of like
      - Unique constraint on (user_id, listing_id) to prevent duplicate likes
  
  2. Security
    - Enable RLS on `listings` table
      - Anyone can view active listings
      - Authenticated users can create their own listings
      - Users can update/delete only their own listings
    
    - Enable RLS on `user_likes` table
      - Authenticated users can view all likes
      - Users can like listings (insert)
      - Users can unlike their own likes (delete)
  
  3. Notes
    - Admin functionality uses raw_app_meta_data in auth.users
    - Status check ensures only valid statuses are stored
    - Cascade deletion: if user or listing is deleted, related records are removed
*/

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  location text NOT NULL,
  phone text,
  email text,
  image_url text,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user likes table
CREATE TABLE IF NOT EXISTS user_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Anyone can view active listings"
  ON listings
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User likes policies
CREATE POLICY "Users can view all likes"
  ON user_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like listings"
  ON user_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike listings"
  ON user_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);