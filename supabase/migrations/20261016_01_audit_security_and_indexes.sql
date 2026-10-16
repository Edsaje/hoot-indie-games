-- ==============================================================================
-- 🦉 Hoot Indie Games — Lot 4 : Sécurisation RLS & Index de Performance PostgreSQL
-- Migration : 20261016_01_audit_security_and_indexes.sql
-- ==============================================================================

-- 1. Sécurisation RLS du Tchat Public (SEC-02)
-- Suppression des politiques destructrices permettant à n'importe quel client public (anon)
-- de modifier ou supprimer arbitrairement les messages des autres utilisateurs
DROP POLICY IF EXISTS "Anyone can update chat" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can delete chat" ON chat_messages;

-- 2. Protection des Messages Privés contre l'espionnage global Realtime (SEC-02)
-- Le broadcast WebSocket global supabase_realtime sans filtre utilisateur exposait
-- les conversations privées à tout client souscrivant au canal
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'private_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE private_messages;
  END IF;
END $$;

-- 3. Sécurisation des Journaux de Modération (SEC-02)
-- Révocation de l'accès destructeur ("Anyone can do anything") sur les logs de modération
-- Ne conserver que l'insertion (signalements) et la lecture nécessaires
DROP POLICY IF EXISTS "Anyone can do anything on moderation logs" ON chat_moderation_logs;
CREATE POLICY "Anyone can read moderation logs" ON chat_moderation_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert moderation logs" ON chat_moderation_logs FOR INSERT WITH CHECK (true);

-- 4. Index de Performance Base de Données (PERF-10)
-- Accélération des requêtes de messagerie versus, de messagerie privée et d'échanges de cartes
CREATE INDEX IF NOT EXISTS idx_versus_messages_room_id ON versus_messages (room_code, id);
CREATE INDEX IF NOT EXISTS idx_pm_conversation_created ON private_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_trades_sender ON card_trades (sender_code, status);
CREATE INDEX IF NOT EXISTS idx_card_trades_receiver ON card_trades (receiver_code, status);
