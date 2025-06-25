/*
  # Fix Foreign Key Constraint Issues

  1. Tables
    - Update foreign key constraints to be more flexible
    - Add proper user profile creation
    - Fix giveaway creation issues

  2. Security
    - Maintain RLS policies
    - Ensure proper user access
*/

-- First, let's make the foreign key constraint more flexible
-- Drop the existing foreign key constraint if it exists
ALTER TABLE IF EXISTS giveaways 
DROP CONSTRAINT IF EXISTS giveaways_user_id_fkey;

-- Recreate the foreign key constraint with CASCADE options
ALTER TABLE giveaways 
ADD CONSTRAINT giveaways_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also update entries table foreign key
ALTER TABLE IF EXISTS entries 
DROP CONSTRAINT IF EXISTS entries_giveaway_id_fkey;

ALTER TABLE entries 
ADD CONSTRAINT entries_giveaway_id_fkey 
FOREIGN KEY (giveaway_id) REFERENCES giveaways(id) ON DELETE CASCADE;

-- Create a function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, subscription_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'free'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing auth users to have profiles
INSERT INTO public.users (id, email, name, subscription_status)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  'free'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();