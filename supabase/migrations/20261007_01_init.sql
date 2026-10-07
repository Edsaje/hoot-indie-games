-- Migration Initiale Supabase (Remplacement PHP)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1. PROFILS & SAUVEGARDES (Remplaçant user_cloud_sync.php)
-- ==========================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    steam_id TEXT,
    friend_code TEXT UNIQUE,
    save_data JSONB DEFAULT '{}'::jsonb,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 2. TCHAT COMMUNAUTAIRE (Remplaçant chat.php)
-- ==========================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    room_id TEXT DEFAULT 'global',
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chat" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can insert chat" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can logically delete own chat" ON chat_messages FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 3. ECHANGES DE CARTES (Remplaçant trades.php)
-- ==========================================
CREATE TABLE card_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_code TEXT REFERENCES user_profiles(friend_code),
    receiver_code TEXT REFERENCES user_profiles(friend_code),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'canceled', 'declined')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE card_trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their trades" ON card_trades FOR SELECT USING (
  sender_code = (SELECT friend_code FROM user_profiles WHERE id = auth.uid()) OR 
  receiver_code = (SELECT friend_code FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can insert trades they send" ON card_trades FOR INSERT WITH CHECK (
  sender_code = (SELECT friend_code FROM user_profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can update trades they are involved in" ON card_trades FOR UPDATE USING (
  sender_code = (SELECT friend_code FROM user_profiles WHERE id = auth.uid()) OR 
  receiver_code = (SELECT friend_code FROM user_profiles WHERE id = auth.uid())
);

-- Procédure Stockée d'acceptation de trade (ACID)
CREATE OR REPLACE FUNCTION accept_card_trade(trade_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    trade_record card_trades%ROWTYPE;
    caller_code TEXT;
BEGIN
    SELECT friend_code INTO caller_code FROM user_profiles WHERE id = auth.uid();

    -- Verrou de ligne
    SELECT * INTO trade_record FROM card_trades WHERE id = trade_id FOR UPDATE;

    IF NOT FOUND OR trade_record.status != 'pending' THEN
        RAISE EXCEPTION 'Échange invalide ou déjà traité.';
    END IF;

    IF trade_record.receiver_code != caller_code THEN
        RAISE EXCEPTION 'Non autorisé.';
    END IF;

    UPDATE card_trades 
    SET status = 'accepted', 
        payload = jsonb_set(payload, '{status}', '"accepted"'),
        updated_at = NOW() 
    WHERE id = trade_id;

    -- Note : La mise à jour des inventaires respectifs sera gérée par les hooks locaux
    -- ou via une logique JSONB complexe ici si nécessaire.

    RETURN TRUE;
END;
$$;
