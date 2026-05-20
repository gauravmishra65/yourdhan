-- ============================================================
-- YourDhan – Migration 003: Auth Integration
-- Adds user_id column to all user-data tables so that
-- logged-in users have their data tied to auth.uid() and
-- anonymous users continue via current_session_id().
-- RLS policies updated: user_id = auth.uid() OR session_id = current_session_id()
-- Run this AFTER 002_run_in_supabase.sql
-- ============================================================

-- ── 1. Add user_id column (nullable) to all user-data tables ──────────────────

ALTER TABLE portfolios          ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE portfolio_assets    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE watchlist_items     ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE price_alerts        ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE stock_notes         ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE portfolio_presets   ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE compare_portfolios  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 2. Indexes for user_id lookups ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS portfolios_user_id_idx         ON portfolios(user_id)         WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS watchlist_items_user_id_idx    ON watchlist_items(user_id)    WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS price_alerts_user_id_idx       ON price_alerts(user_id)       WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stock_notes_user_id_idx        ON stock_notes(user_id)        WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS portfolio_presets_user_id_idx  ON portfolio_presets(user_id)  WHERE user_id IS NOT NULL;

-- ── 3. Helper: is_owner() returns true when row belongs to current caller ─────

CREATE OR REPLACE FUNCTION is_owner(row_user_id uuid, row_session_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    -- Logged-in user match
    (row_user_id IS NOT NULL AND row_user_id = auth.uid())
    OR
    -- Anonymous session match (no logged-in user on this request)
    (auth.uid() IS NULL AND row_session_id IS NOT NULL AND row_session_id = current_session_id())
$$;

-- ── 4. Drop old policies and recreate with dual-mode access ───────────────────

-- portfolios
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_select" ON portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_insert" ON portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_update" ON portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_delete" ON portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "portfolios_select" ON portfolios FOR SELECT USING (is_owner(user_id, session_id));
CREATE POLICY "portfolios_insert" ON portfolios FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND session_id = current_session_id())
);
CREATE POLICY "portfolios_update" ON portfolios FOR UPDATE USING (is_owner(user_id, session_id));
CREATE POLICY "portfolios_delete" ON portfolios FOR DELETE USING (is_owner(user_id, session_id));

-- portfolio_assets
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_select" ON portfolio_assets; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_insert" ON portfolio_assets; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_update" ON portfolio_assets; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_delete" ON portfolio_assets; EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "portfolio_assets_select" ON portfolio_assets FOR SELECT USING (is_owner(user_id, (
  SELECT session_id FROM portfolios WHERE portfolios.id = portfolio_assets.portfolio_id LIMIT 1
)));
CREATE POLICY "portfolio_assets_insert" ON portfolio_assets FOR INSERT WITH CHECK (is_owner(user_id, (
  SELECT session_id FROM portfolios WHERE portfolios.id = portfolio_assets.portfolio_id LIMIT 1
)));
CREATE POLICY "portfolio_assets_update" ON portfolio_assets FOR UPDATE USING (is_owner(user_id, (
  SELECT session_id FROM portfolios WHERE portfolios.id = portfolio_assets.portfolio_id LIMIT 1
)));
CREATE POLICY "portfolio_assets_delete" ON portfolio_assets FOR DELETE USING (is_owner(user_id, (
  SELECT session_id FROM portfolios WHERE portfolios.id = portfolio_assets.portfolio_id LIMIT 1
)));

-- watchlist_items
DO $$ BEGIN DROP POLICY IF EXISTS "watchlist_items_select" ON watchlist_items; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "watchlist_items_insert" ON watchlist_items; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "watchlist_items_delete" ON watchlist_items; EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "watchlist_items_select" ON watchlist_items FOR SELECT USING (is_owner(user_id, session_id));
CREATE POLICY "watchlist_items_insert" ON watchlist_items FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND session_id = current_session_id())
);
CREATE POLICY "watchlist_items_delete" ON watchlist_items FOR DELETE USING (is_owner(user_id, session_id));

-- price_alerts
DO $$ BEGIN DROP POLICY IF EXISTS "price_alerts_select" ON price_alerts; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "price_alerts_insert" ON price_alerts; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "price_alerts_update" ON price_alerts; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "price_alerts_delete" ON price_alerts; EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "price_alerts_select" ON price_alerts FOR SELECT USING (is_owner(user_id, session_id));
CREATE POLICY "price_alerts_insert" ON price_alerts FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND session_id = current_session_id())
);
CREATE POLICY "price_alerts_update" ON price_alerts FOR UPDATE USING (is_owner(user_id, session_id));
CREATE POLICY "price_alerts_delete" ON price_alerts FOR DELETE USING (is_owner(user_id, session_id));

-- stock_notes
DO $$ BEGIN DROP POLICY IF EXISTS "stock_notes_select" ON stock_notes; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "stock_notes_insert" ON stock_notes; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "stock_notes_update" ON stock_notes; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "stock_notes_delete" ON stock_notes; EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "stock_notes_select" ON stock_notes FOR SELECT USING (is_owner(user_id, session_id));
CREATE POLICY "stock_notes_insert" ON stock_notes FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND session_id = current_session_id())
);
CREATE POLICY "stock_notes_update" ON stock_notes FOR UPDATE USING (is_owner(user_id, session_id));
CREATE POLICY "stock_notes_delete" ON stock_notes FOR DELETE USING (is_owner(user_id, session_id));

-- portfolio_presets
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_presets_select" ON portfolio_presets; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_presets_insert" ON portfolio_presets; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_presets_delete" ON portfolio_presets; EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "portfolio_presets_select" ON portfolio_presets FOR SELECT USING (is_owner(user_id, session_id));
CREATE POLICY "portfolio_presets_insert" ON portfolio_presets FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND session_id = current_session_id())
);
CREATE POLICY "portfolio_presets_delete" ON portfolio_presets FOR DELETE USING (is_owner(user_id, session_id));

-- compare_portfolios
DO $$ BEGIN DROP POLICY IF EXISTS "compare_portfolios_select" ON compare_portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "compare_portfolios_insert" ON compare_portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "compare_portfolios_delete" ON compare_portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;

CREATE POLICY "compare_portfolios_select" ON compare_portfolios FOR SELECT USING (is_owner(user_id, session_id));
CREATE POLICY "compare_portfolios_insert" ON compare_portfolios FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND session_id = current_session_id())
);
CREATE POLICY "compare_portfolios_delete" ON compare_portfolios FOR DELETE USING (is_owner(user_id, session_id));

-- ── 5. Trigger: auto-set user_id on insert when user is logged in ─────────────

CREATE OR REPLACE FUNCTION set_user_id_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER portfolios_set_user_id
    BEFORE INSERT ON portfolios
    FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER watchlist_set_user_id
    BEFORE INSERT ON watchlist_items
    FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER alerts_set_user_id
    BEFORE INSERT ON price_alerts
    FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER notes_set_user_id
    BEFORE INSERT ON stock_notes
    FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER presets_set_user_id
    BEFORE INSERT ON portfolio_presets
    FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 6. Verify ─────────────────────────────────────────────────────────────────

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'user_id'
ORDER BY table_name;
