-- ==============================================================================
-- 🦉 Hoot Indie Games — Lot 1 : Persistance Supabase & Couche de Données du Tchat
-- Migration : 20261013_01_chat_fixes.sql
-- ==============================================================================

-- 1. Ajout des colonnes de métadonnées manquantes sur chat_messages
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS score_data JSONB;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS active_frame TEXT;

-- 2. Alignement des politiques RLS (l'authentification applicative est souveraine/PHP)
-- Nettoyage des anciennes politiques restrictives qui bloquaient sur auth.uid() = user_id
DROP POLICY IF EXISTS "Users can insert chat" ON chat_messages;
DROP POLICY IF EXISTS "Users can logically delete own chat" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can read chat" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can insert chat" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can update chat" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can delete chat" ON chat_messages;

-- Politiques ouvertes pour permettre le bon fonctionnement du client public (anon)
CREATE POLICY "Anyone can read chat" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat" ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat" ON chat_messages FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete chat" ON chat_messages FOR DELETE USING (true);

-- 3. Configuration pour la réplication temps réel Supabase
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
ALTER TABLE private_messages REPLICA IDENTITY FULL;

-- Ajout sécurisé des tables chat_messages et private_messages à la publication supabase_realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'private_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE private_messages;
  END IF;
END $$;
