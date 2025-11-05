/*
  # Create Giveaway Platform Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `email` (text, unique)
      - `role` (text, default 'participant')
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `giveaways`
      - `id` (uuid, primary key)
      - `organizer_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text, supports large content)
      - `banner_url` (text, nullable, for cover images)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `announce_time` (timestamptz)
      - `status` (text, default 'active')
      - `entry_config` (jsonb, for entry methods)
      - `rules` (text, nullable, supports large content)
      - `total_entries` (integer, default 0)
      - `unique_participants` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `prizes`
      - `id` (uuid, primary key)
      - `giveaway_id` (uuid, foreign key to giveaways)
      - `name` (text)
      - `value` (numeric)
      - `quantity` (integer, default 1)
      - `image_url` (text, nullable)
      - `description` (text, nullable)
      - `created_at` (timestamptz)
    
    - `participants`
      - `id` (uuid, primary key)
      - `giveaway_id` (uuid, foreign key to giveaways)
      - `user_id` (uuid, foreign key to profiles)
      - `referral_code` (text)
      - `referred_by_user_id` (uuid, nullable, foreign key to profiles)
      - `total_entries` (integer, default 0)
      - `created_at` (timestamptz)
    
    - `entries`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, foreign key to participants)
      - `giveaway_id` (uuid, foreign key to giveaways)
      - `method_type` (text)
      - `method_value` (text, nullable)
      - `points` (integer, default 1)
      - `is_verified` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `winners`
      - `id` (uuid, primary key)
      - `giveaway_id` (uuid, foreign key to giveaways)
      - `prize_id` (uuid, foreign key to prizes)
      - `participant_id` (uuid, foreign key to participants)
      - `status` (text, default 'pending_contact')
      - `drawn_at` (timestamptz)
      - `contacted_at` (timestamptz, nullable)
      - `responded_at` (timestamptz, nullable)
      - `notes` (text, nullable)
    
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `status` (text, default 'trialing')
      - `subscription_type` (text)
      - `price` (numeric)
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read public giveaways
    - Add policies for organizers to manage their own giveaways
    - Add policies for participants to manage their own entries
    - Add policies for users to manage their own profiles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'participant' CHECK (role IN ('organizer', 'participant')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create giveaways table with text fields for large content
CREATE TABLE IF NOT EXISTS giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  banner_url text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  announce_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'ended')),
  entry_config jsonb DEFAULT '{}'::jsonb,
  rules text,
  total_entries integer DEFAULT 0,
  unique_participants integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active giveaways"
  ON giveaways FOR SELECT
  USING (status = 'active' OR status = 'ended');

CREATE POLICY "Authenticated users can view all giveaways"
  ON giveaways FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizers can insert own giveaways"
  ON giveaways FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own giveaways"
  ON giveaways FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own giveaways"
  ON giveaways FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Create prizes table
CREATE TABLE IF NOT EXISTS prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  name text NOT NULL,
  value numeric DEFAULT 0,
  quantity integer DEFAULT 1,
  image_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prizes"
  ON prizes FOR SELECT
  USING (true);

CREATE POLICY "Organizers can insert prizes for own giveaways"
  ON prizes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = prizes.giveaway_id
      AND giveaways.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update prizes for own giveaways"
  ON prizes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = prizes.giveaway_id
      AND giveaways.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = prizes.giveaway_id
      AND giveaways.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can delete prizes for own giveaways"
  ON prizes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = prizes.giveaway_id
      AND giveaways.organizer_id = auth.uid()
    )
  );

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  referred_by_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  total_entries integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(giveaway_id, user_id)
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants for giveaways"
  ON participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own participation"
  ON participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  giveaway_id uuid NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  method_type text NOT NULL,
  method_value text,
  points integer DEFAULT 1,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = entries.participant_id
      AND participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can view entries for own giveaways"
  ON entries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = entries.giveaway_id
      AND giveaways.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants
      WHERE participants.id = entries.participant_id
      AND participants.user_id = auth.uid()
    )
  );

-- Create winners table
CREATE TABLE IF NOT EXISTS winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES giveaways(id) ON DELETE CASCADE,
  prize_id uuid NOT NULL REFERENCES prizes(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  status text DEFAULT 'pending_contact' CHECK (status IN ('pending_contact', 'contacted', 'responded', 'disqualified', 'prize_sent')),
  drawn_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  responded_at timestamptz,
  notes text
);

ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view winners"
  ON winners FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizers can manage winners for own giveaways"
  ON winners FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = winners.giveaway_id
      AND giveaways.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can update winners for own giveaways"
  ON winners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = winners.giveaway_id
      AND giveaways.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM giveaways
      WHERE giveaways.id = winners.giveaway_id
      AND giveaways.organizer_id = auth.uid()
    )
  );

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'trialing' CHECK (status IN ('active', 'canceled', 'expired', 'trialing')),
  subscription_type text NOT NULL,
  price numeric NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_giveaways_organizer_id ON giveaways(organizer_id);
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON giveaways(status);
CREATE INDEX IF NOT EXISTS idx_giveaways_slug ON giveaways(slug);
CREATE INDEX IF NOT EXISTS idx_prizes_giveaway_id ON prizes(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_participants_giveaway_id ON participants(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_participant_id ON entries(participant_id);
CREATE INDEX IF NOT EXISTS idx_entries_giveaway_id ON entries(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_winners_giveaway_id ON winners(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);