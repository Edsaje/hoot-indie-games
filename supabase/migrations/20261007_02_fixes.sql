-- 1. Fix user_profiles constraints
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE user_profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Open RLS for user_profiles so custom Steam auth can write to it
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Allow anonymous profile inserts" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous profile updates" ON user_profiles FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Add missing columns to chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS avatar_id TEXT;

