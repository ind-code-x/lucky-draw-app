/*
  # Create entries table

  1. New Tables
    - `entries`
      - `id` (uuid, primary key)
      - `giveaway_id` (uuid, foreign key to giveaways)
      - `participant_name` (text)
      - `participant_email` (text)
      - `participant_handle` (text, optional)
      - `platform` (text)
      - `verified` (boolean)
      - `entry_date` (timestamptz)

  2. Security
    - Enable RLS on `entries` table
    - Allow giveaway owners to read entries
    - Allow public to create entries for active giveaways
    - Prevent duplicate entries per email per giveaway

  3. Constraints
    - Unique constraint on (giveaway_id, participant_email)
*/

-- Create entries table
CREATE TABLE IF NOT EXISTS public.entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  giveaway_id uuid NOT NULL REFERENCES public.giveaways(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  participant_email text NOT NULL,
  participant_handle text,
  platform text NOT NULL,
  verified boolean DEFAULT true,
  entry_date timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate entries
ALTER TABLE public.entries 
ADD CONSTRAINT unique_entry_per_email_per_giveaway 
UNIQUE (giveaway_id, participant_email);

-- Enable RLS
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Giveaway owners can read entries"
  ON public.entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.giveaways 
      WHERE giveaways.id = entries.giveaway_id 
      AND giveaways.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create entries for active giveaways"
  ON public.entries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.giveaways 
      WHERE giveaways.id = entries.giveaway_id 
      AND giveaways.status = 'active'
      AND giveaways.end_date > now()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entries_giveaway_id ON public.entries(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_entries_email ON public.entries(participant_email);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries(entry_date);