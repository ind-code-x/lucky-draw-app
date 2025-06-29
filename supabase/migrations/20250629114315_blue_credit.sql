/*
  # Fix Foreign Key Relationship Issues

  1. Database Changes
    - Drop and recreate the foreign key constraint with proper naming
    - Ensure PostgREST can properly detect the relationship
    - Add explicit foreign key constraint names

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- First, let's drop the existing foreign key constraint and recreate it with explicit naming
ALTER TABLE giveaways DROP CONSTRAINT IF EXISTS giveaways_organizer_id_fkey;

-- Recreate the foreign key constraint with explicit naming that PostgREST can detect
ALTER TABLE giveaways 
ADD CONSTRAINT giveaways_organizer_id_fkey 
FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Ensure the profiles table has the correct structure
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- Make sure the foreign key relationship is properly indexed
DROP INDEX IF EXISTS idx_giveaways_organizer_id;
CREATE INDEX idx_giveaways_organizer_id ON giveaways(organizer_id);

-- Refresh the schema cache by updating table comments (forces PostgREST to reload)
COMMENT ON TABLE giveaways IS 'Giveaway configurations with organizer relationships';
COMMENT ON TABLE profiles IS 'User profiles with role-based access';
COMMENT ON COLUMN giveaways.organizer_id IS 'References profiles.id';

-- Ensure RLS policies are still in place
DROP POLICY IF EXISTS "Anyone can view active giveaways" ON giveaways;
CREATE POLICY "Anyone can view active giveaways" ON giveaways
  FOR SELECT
  USING (status = 'active' OR auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizers can manage own giveaways" ON giveaways;
CREATE POLICY "Organizers can manage own giveaways" ON giveaways
  FOR ALL TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);