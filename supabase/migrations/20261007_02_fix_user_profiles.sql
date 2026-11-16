-- Remove strict FK constraint to auth.users
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Ensure UUIDs are generated automatically if not provided
ALTER TABLE user_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Open RLS for profiles so Steam/Legacy users can save
DROP POLICY IF EXISTS "Users can manage their own profile" ON user_profiles;
CREATE POLICY "Allow anonymous profile management" ON user_profiles
FOR ALL USING (true) WITH CHECK (true);
