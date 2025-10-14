/*
  # Create contact_submissions table

  ## Description
  This migration creates a table to store contact form submissions from the Autobotec landing page.
  
  ## New Tables
  - `contact_submissions`
    - `id` (uuid, primary key): Unique identifier for each submission
    - `name` (text): Full name of the person contacting
    - `email` (text): Email address for response
    - `company` (text, optional): Company or organization name
    - `message` (text): The inquiry or message content
    - `created_at` (timestamptz): Timestamp of when the form was submitted
  
  ## Security
  1. Enable Row Level Security (RLS) on the table
  2. Create policy to allow public inserts (anyone can submit the form)
  3. Create policy to allow authenticated users to read submissions (for admin access)
  
  ## Notes
  - The table is designed to be simple and capture essential contact information
  - Public insert is allowed to enable form submissions without authentication
  - Only authenticated users (admins) can view submissions for privacy
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view submissions"
  ON contact_submissions
  FOR SELECT
  TO authenticated
  USING (true);
