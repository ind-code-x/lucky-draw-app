/*
  # Fix Database Schema and Relationships

  1. Ensure all tables exist with proper structure
  2. Fix foreign key relationships for PostgREST
  3. Add proper constraints and indexes
  4. Refresh schema cache
*/

-- First, ensure we're working with a clean slate
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS winners CASCADE;
DROP TABLE IF EXISTS entries CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS prizes CASCADE;
DROP TABLE IF EXISTS giveaways CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table first (referenced by other tables)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'organizer')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create giveaways table with explicit foreign key naming
CREATE TABLE giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  banner_url text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  announce_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'ended')),
  entry_config jsonb DEFAULT '{}',
  rules text,
  total_entries integer DEFAULT 0,
  unique_participants integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (start_time < end_time AND end_time <= announce_time),
  CONSTRAINT giveaways_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create prizes table
CREATE TABLE prizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL,
  name text NOT NULL,
  value numeric(10,2) DEFAULT 0,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  image_url text,
  description text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT prizes_giveaway_id_fkey FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE
);

-- Create participants table
CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL,
  user_id uuid NOT NULL,
  referral_code text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  referred_by_user_id uuid,
  total_entries integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT participants_giveaway_id_fkey FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE,
  CONSTRAINT participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT participants_referred_by_fkey FOREIGN KEY (referred_by_user_id) REFERENCES auth.users(id),
  UNIQUE(giveaway_id, user_id)
);

-- Create entries table
CREATE TABLE entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  giveaway_id uuid NOT NULL,
  method_type text NOT NULL,
  method_value text,
  points integer DEFAULT 1 CHECK (points > 0),
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT entries_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  CONSTRAINT entries_giveaway_id_fkey FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE
);

-- Create winners table
CREATE TABLE winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL,
  prize_id uuid NOT NULL,
  participant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending_contact' CHECK (status IN ('pending_contact', 'contacted', 'responded', 'disqualified', 'prize_sent')),
  drawn_at timestamptz DEFAULT now(),
  contacted_at timestamptz,
  responded_at timestamptz,
  notes text,
  CONSTRAINT winners_giveaway_id_fkey FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE,
  CONSTRAINT winners_prize_id_fkey FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE CASCADE,
  CONSTRAINT winners_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  UNIQUE(prize_id, participant_id)
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  user_id uuid,
  resource_id uuid,
  resource_type text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  timestamp timestamptz DEFAULT now(),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_giveaways_organizer_id ON giveaways(organizer_id);
CREATE INDEX idx_giveaways_status ON giveaways(status);
CREATE INDEX idx_giveaways_slug ON giveaways(slug);
CREATE INDEX idx_giveaways_dates ON giveaways(start_time, end_time);
CREATE INDEX idx_prizes_giveaway_id ON prizes(giveaway_id);
CREATE INDEX idx_participants_giveaway_id ON participants(giveaway_id);
CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_participants_referral_code ON participants(referral_code);
CREATE INDEX idx_entries_participant_id ON entries(participant_id);
CREATE INDEX idx_entries_giveaway_id ON entries(giveaway_id);
CREATE INDEX idx_entries_method_type ON entries(method_type);
CREATE INDEX idx_winners_giveaway_id ON winners(giveaway_id);
CREATE INDEX idx_winners_status ON winners(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Giveaways policies
CREATE POLICY "Anyone can view active giveaways" ON giveaways
  FOR SELECT
  USING (status = 'active' OR auth.uid() = organizer_id);

CREATE POLICY "Organizers can manage own giveaways" ON giveaways
  FOR ALL TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Prizes policies
CREATE POLICY "Anyone can view prizes for active giveaways" ON prizes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE giveaways.id = prizes.giveaway_id 
      AND (giveaways.status = 'active' OR giveaways.organizer_id = auth.uid())
    )
  );

CREATE POLICY "Organizers can manage prizes for own giveaways" ON prizes
  FOR ALL TO authenticated
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

-- Participants policies
CREATE POLICY "Users can view participants for giveaways they organize or participate in" ON participants
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE giveaways.id = participants.giveaway_id 
      AND giveaways.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create participant records for themselves" ON participants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participant records" ON participants
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Entries policies
CREATE POLICY "Users can view entries for giveaways they organize or participate in" ON entries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM participants 
      WHERE participants.id = entries.participant_id 
      AND participants.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE giveaways.id = entries.giveaway_id 
      AND giveaways.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create entries for their own participation" ON entries
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM participants 
      WHERE participants.id = entries.participant_id 
      AND participants.user_id = auth.uid()
    )
  );

-- Winners policies
CREATE POLICY "Winners are visible after announcement time" ON winners
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM giveaways 
      WHERE giveaways.id = winners.giveaway_id 
      AND (
        now() >= giveaways.announce_time OR 
        giveaways.organizer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM participants 
          WHERE participants.id = winners.participant_id 
          AND participants.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Organizers can manage winners for own giveaways" ON winners
  FOR ALL TO authenticated
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

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_giveaways_updated_at 
  BEFORE UPDATE ON giveaways 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update giveaway statistics
CREATE OR REPLACE FUNCTION update_giveaway_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total entries and unique participants for the giveaway
  UPDATE giveaways SET
    total_entries = (
      SELECT COALESCE(SUM(points), 0) 
      FROM entries 
      WHERE giveaway_id = COALESCE(NEW.giveaway_id, OLD.giveaway_id)
    ),
    unique_participants = (
      SELECT COUNT(DISTINCT user_id) 
      FROM participants 
      WHERE giveaway_id = COALESCE(NEW.giveaway_id, OLD.giveaway_id)
    )
  WHERE id = COALESCE(NEW.giveaway_id, OLD.giveaway_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for statistics updates
CREATE TRIGGER update_giveaway_stats_on_entry
  AFTER INSERT OR UPDATE OR DELETE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_giveaway_stats();

CREATE TRIGGER update_giveaway_stats_on_participant
  AFTER INSERT OR DELETE ON participants
  FOR EACH ROW EXECUTE FUNCTION update_giveaway_stats();

-- Create function to update participant entry counts
CREATE OR REPLACE FUNCTION update_participant_entry_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total entries for the participant
  UPDATE participants SET
    total_entries = (
      SELECT COALESCE(SUM(points), 0) 
      FROM entries 
      WHERE participant_id = COALESCE(NEW.participant_id, OLD.participant_id)
    )
  WHERE id = COALESCE(NEW.participant_id, OLD.participant_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for participant entry count updates
CREATE TRIGGER update_participant_entry_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_participant_entry_count();

-- Insert some sample data for development
INSERT INTO profiles (id, username, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo_organizer', 'organizer@example.com', 'organizer'),
  ('00000000-0000-0000-0000-000000000002', 'demo_participant', 'participant@example.com', 'participant');

-- Insert sample giveaway
INSERT INTO giveaways (
  id,
  organizer_id,
  title,
  slug,
  description,
  start_time,
  end_time,
  announce_time,
  status,
  entry_config,
  rules
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Amazing Tech Giveaway',
  'amazing-tech-giveaway',
  'Win incredible tech prizes including the latest gadgets, accessories, and more! This giveaway features multiple ways to enter and increase your chances of winning.',
  now() - interval '1 day',
  now() + interval '7 days',
  now() + interval '8 days',
  'active',
  '{"email_signup": {"enabled": true, "points": 5}, "social_follow": {"enabled": true, "points": 3}, "referral": {"enabled": true, "points": 10}}',
  'Must be 18+ to enter. Winners will be contacted via email. Prizes must be claimed within 30 days.'
);

-- Insert sample prizes
INSERT INTO prizes (giveaway_id, name, value, quantity, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'MacBook Pro 16"', 2499.00, 1, 'Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD'),
  ('11111111-1111-1111-1111-111111111111', 'iPhone 15 Pro', 999.00, 2, 'iPhone 15 Pro in your choice of color'),
  ('11111111-1111-1111-1111-111111111111', 'AirPods Pro', 249.00, 5, 'AirPods Pro with active noise cancellation');

-- Force schema cache refresh by updating a system table comment
COMMENT ON TABLE giveaways IS 'Giveaway configurations with organizer relationships - Updated';