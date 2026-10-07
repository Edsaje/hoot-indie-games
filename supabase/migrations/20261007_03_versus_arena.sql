-- Create tables for Versus Arena Relay
CREATE TABLE IF NOT EXISTS versus_rooms (
    room_code TEXT PRIMARY KEY,
    host_id TEXT,
    guest_id TEXT,
    host_profile JSONB,
    guest_profile JSONB,
    status TEXT DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE versus_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can do anything on versus rooms" ON versus_rooms USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS versus_messages (
    id SERIAL PRIMARY KEY,
    room_code TEXT REFERENCES versus_rooms(room_code) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE versus_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can do anything on versus messages" ON versus_messages USING (true) WITH CHECK (true);
