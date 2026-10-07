-- Fix RLS for card_trades (since Supabase Auth is bypassed)
DROP POLICY IF EXISTS "Users can view their trades" ON card_trades;
DROP POLICY IF EXISTS "Users can insert trades they send" ON card_trades;
DROP POLICY IF EXISTS "Users can update trades they are involved in" ON card_trades;

CREATE POLICY "Anyone can view trades" ON card_trades FOR SELECT USING (true);
CREATE POLICY "Anyone can insert trades" ON card_trades FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update trades" ON card_trades FOR UPDATE USING (true);

-- Fix RLS for user_profiles (since Supabase Auth is bypassed)
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Anyone can insert profile" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update profile" ON user_profiles FOR UPDATE USING (true);

-- Add private messages table
CREATE TABLE IF NOT EXISTS private_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL,
    sender_username TEXT NOT NULL,
    sender_avatar_id TEXT,
    recipient_username TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can do anything on private messages" ON private_messages USING (true) WITH CHECK (true);

-- Add chat moderation logs table
CREATE TABLE IF NOT EXISTS chat_moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT,
    username TEXT,
    user_id TEXT,
    steam_id TEXT,
    channel TEXT,
    flagged_words TEXT,
    original_text TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_moderation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can do anything on moderation logs" ON chat_moderation_logs USING (true) WITH CHECK (true);
