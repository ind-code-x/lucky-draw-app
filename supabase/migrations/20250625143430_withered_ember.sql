/*
  # Create giveaways table

  1. New Tables
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
      - `winner_id` (uuid, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `giveaways` table
    - Add policies for users to manage their own giveaways
    - Allow public read access for active giveaways
*/

-- Create giveaway status enum
CREATE TYPE giveaway_status AS ENUM ('draft', 'active', 'completed');

-- Create giveaways table
CREATE TABLE IF NOT EXISTS public.giveaways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own giveaways"
  ON public.giveaways
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read active giveaways"
  ON public.giveaways
  FOR SELECT
  TO anon
  USING (status = 'active');

CREATE POLICY "Users can create own giveaways"
  ON public.giveaways
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own giveaways"
  ON public.giveaways
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own giveaways"
  ON public.giveaways
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_giveaways_user_id ON public.giveaways(user_id);
CREATE INDEX IF NOT EXISTS idx_giveaways_status ON public.giveaways(status);
CREATE INDEX IF NOT EXISTS idx_giveaways_platform ON public.giveaways(platform);
CREATE INDEX IF NOT EXISTS idx_giveaways_dates ON public.giveaways(start_date, end_date);