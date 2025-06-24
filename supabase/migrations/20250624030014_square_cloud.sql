/*
  # Initial Schema Setup for GiveawayHub

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `name` (text)
      - `avatar_url` (text, optional)
      - `subscription_status` (enum: free, premium, pro)
      - `subscription_expires_at` (timestamptz, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `giveaways`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `prize` (text)
      - `platform` (text)
      - `status` (enum: draft, active, completed)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `entry_methods` (jsonb)
      - `poster_url` (text, optional)
      - `social_post_id` (text, optional)
      - `winner_id` (uuid, optional, foreign key to entries)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `entries`
      - `id` (uuid, primary key)
      - `giveaway_id` (uuid, foreign key to giveaways)
      - `participant_name` (text)
      - `participant_email` (text)
      - `participant_handle` (text)
      - `platform` (text)
      - `verified` (boolean)
      - `entry_date` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate

  3. Storage
    - Create bucket for giveaway assets (posters, etc.)
    - Set up storage policies for authenticated users
*/

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('free', 'premium', 'pro');
CREATE TYPE giveaway_status AS ENUM ('draft', 'active', 'completed');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  subscription_status subscription_status DEFAULT 'free',
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create giveaways table
CREATE TABLE IF NOT EXISTS giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  prize text NOT NULL,
  platform text NOT NULL,
  status giveaway_status DEFAULT 'draft',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  entry_methods jsonb DEFAULT '[]'::jsonb,
  poster_url text,
  social_post_id text,
  winner_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  participant_email text NOT NULL,
  participant_handle text NOT NULL,
  platform text NOT NULL,
  verified boolean DEFAULT false,
  entry_date timestamptz DEFAULT now()
);

-- Add foreign key constraint for winner_id
ALTER TABLE giveaways 
ADD CONSTRAINT fk_giveaways_winner 
FOREIGN KEY (winner_id) REFERENCES entries(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_giveaways_user_id ON giveaways(user_id);
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status);
CREATE INDEX IF NOT EXISTS idx_giveaways_platform ON giveaways(platform);
CREATE INDEX IF NOT EXISTS idx_entries_giveaway_id ON entries(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_entries_email ON entries(participant_email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for giveaways table
CREATE POLICY "Users can read own giveaways"
  ON giveaways
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own giveaways"
  ON giveaways
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own giveaways"
  ON giveaways
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own giveaways"
  ON giveaways
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for entries table
CREATE POLICY "Users can read entries for own giveaways"
  ON entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE giveaways.id = entries.giveaway_id 
      AND giveaways.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create entries for active giveaways"
  ON entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE giveaways.id = entries.giveaway_id 
      AND giveaways.status = 'active'
    )
  );

CREATE POLICY "Users can update entries for own giveaways"
  ON entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE giveaways.id = entries.giveaway_id 
      AND giveaways.user_id = auth.uid()
    )
  );

-- Create storage bucket for giveaway assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('giveaway-assets', 'giveaway-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can upload giveaway assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'giveaway-assets');

CREATE POLICY "Users can update own giveaway assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'giveaway-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own giveaway assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'giveaway-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view giveaway assets"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'giveaway-assets');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_giveaways_updated_at 
  BEFORE UPDATE ON giveaways 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();