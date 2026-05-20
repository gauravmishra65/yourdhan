-- ============================================================
-- YourDhan – Migration 003: Auth Integration  (safe to re-run)
-- Adds user_id to tables that have a direct session_id column.
-- Updates RLS: allows access by auth.uid() OR current_session_id().
-- Run AFTER 002_run_in_supabase.sql
-- ============================================================

-- ── 1. Add nullable user_id to tables with a direct session_id ────────────────
-- (portfolio_assets and portfolio_snapshots are scoped via portfolios, skip them)

ALTER TABLE portfolios         ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE watchlist_items    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE price_alerts       ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE stock_notes        ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE screener_presets   ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE compare_portfolios ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- ── 2. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS portfolios_user_id_idx        ON portfolios(user_id)         WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS watchlist_user_id_idx         ON watchlist_items(user_id)    WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS price_alerts_user_id_idx      ON price_alerts(user_id)       WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS stock_notes_user_id_idx       ON stock_notes(user_id)        WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS screener_presets_user_id_idx  ON screener_presets(user_id)   WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS compare_user_id_idx           ON compare_portfolios(user_id) WHERE user_id IS NOT NULL;

-- ── 3. is_owner() helper ─────────────────────────────────────────────────────
-- Returns true when the current caller owns the row, whether logged-in or anon.

CREATE OR REPLACE FUNCTION is_owner(row_user_id uuid, row_session_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    -- Logged-in user: match by auth.uid()
    (row_user_id IS NOT NULL AND row_user_id = auth.uid())
    OR
    -- Anonymous: match by session cookie (only when no auth.uid())
    (auth.uid() IS NULL AND row_session_id IS NOT NULL AND row_session_id = current_session_id())
$$;

-- ── 4. Replace old _all policies with per-operation dual-mode policies ─────────

-- Drop old blanket policies from migration 002
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_all"       ON portfolios;        EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_all" ON portfolio_assets;  EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "snapshots_all"        ON portfolio_snapshots; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "watchlist_all"        ON watchlist_items;   EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "alerts_all"           ON price_alerts;      EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "notes_all"            ON stock_notes;       EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "presets_all"          ON screener_presets;  EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "compare_all"          ON compare_portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Drop any leftover named policies in case migration 003 is being re-run
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_select"          ON portfolios;         EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_insert"          ON portfolios;         EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_update"          ON portfolios;         EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolios_delete"          ON portfolios;         EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_select"    ON portfolio_assets;   EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_insert"    ON portfolio_assets;   EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_update"    ON portfolio_assets;   EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "portfolio_assets_delete"    ON portfolio_assets;   EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "snapshots_select"           ON portfolio_snapshots; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "snapshots_insert"           ON portfolio_snapshots; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "snapshots_delete"           ON portfolio_snapshots; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "watchlist_items_select"     ON watchlist_items;    EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "watchlist_items_insert"     ON watchlist_items;    EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "watchlist_items_delete"     ON watchlist_items;    EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "price_alerts_select"        ON price_alerts;       EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "price_alerts_insert"        ON price_alerts;       EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "price_alerts_update"        ON price_alerts;       EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "price_alerts_delete"        ON price_alerts;       EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "stock_notes_select"         ON stock_notes;        EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "stock_notes_insert"         ON stock_notes;        EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "stock_notes_update"         ON stock_notes;        EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "stock_notes_delete"         ON stock_notes;        EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "screener_presets_select"    ON screener_presets;   EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "screener_presets_insert"    ON screener_presets;   EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "screener_presets_delete"    ON screener_presets;   EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "compare_portfolios_select"  ON compare_portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "compare_portfolios_insert"  ON compare_portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN DROP POLICY IF EXISTS "compare_portfolios_delete"  ON compare_portfolios; EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- ── portfolios ────────────────────────────────────────────────────────────────

CREATE POLICY "portfolios_select" ON portfolios
  FOR SELECT USING (is_owner(user_id, session_id));

CREATE POLICY "portfolios_insert" ON portfolios
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    OR
    (auth.uid() IS NULL AND session_id = current_session_id())
  );

CREATE POLICY "portfolios_update" ON portfolios
  FOR UPDATE USING (is_owner(user_id, session_id));

CREATE POLICY "portfolios_delete" ON portfolios
  FOR DELETE USING (is_owner(user_id, session_id));

-- ── portfolio_assets (no user_id column – scoped via parent portfolio) ─────────

CREATE POLICY "portfolio_assets_select" ON portfolio_assets
  FOR SELECT USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_owner(user_id, session_id))
  );

CREATE POLICY "portfolio_assets_insert" ON portfolio_assets
  FOR INSERT WITH CHECK (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_owner(user_id, session_id))
  );

CREATE POLICY "portfolio_assets_update" ON portfolio_assets
  FOR UPDATE USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_owner(user_id, session_id))
  );

CREATE POLICY "portfolio_assets_delete" ON portfolio_assets
  FOR DELETE USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_owner(user_id, session_id))
  );

-- ── portfolio_snapshots (scoped via parent portfolio) ──────────────────────────

CREATE POLICY "snapshots_select" ON portfolio_snapshots
  FOR SELECT USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_owner(user_id, session_id))
  );

CREATE POLICY "snapshots_insert" ON portfolio_snapshots
  FOR INSERT WITH CHECK (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_owner(user_id, session_id))
  );

CREATE POLICY "snapshots_delete" ON portfolio_snapshots
  FOR DELETE USING (
    portfolio_id IN (SELECT id FROM portfolios WHERE is_owner(user_id, session_id))
  );

-- ── watchlist_items ───────────────────────────────────────────────────────────

CREATE POLICY "watchlist_items_select" ON watchlist_items
  FOR SELECT USING (is_owner(user_id, session_id));

CREATE POLICY "watchlist_items_insert" ON watchlist_items
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    OR
    (auth.uid() IS NULL AND session_id = current_session_id())
  );

CREATE POLICY "watchlist_items_delete" ON watchlist_items
  FOR DELETE USING (is_owner(user_id, session_id));

-- ── price_alerts ──────────────────────────────────────────────────────────────

CREATE POLICY "price_alerts_select" ON price_alerts
  FOR SELECT USING (is_owner(user_id, session_id));

CREATE POLICY "price_alerts_insert" ON price_alerts
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    OR
    (auth.uid() IS NULL AND session_id = current_session_id())
  );

CREATE POLICY "price_alerts_update" ON price_alerts
  FOR UPDATE USING (is_owner(user_id, session_id));

CREATE POLICY "price_alerts_delete" ON price_alerts
  FOR DELETE USING (is_owner(user_id, session_id));

-- ── stock_notes ───────────────────────────────────────────────────────────────

CREATE POLICY "stock_notes_select" ON stock_notes
  FOR SELECT USING (is_owner(user_id, session_id));

CREATE POLICY "stock_notes_insert" ON stock_notes
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    OR
    (auth.uid() IS NULL AND session_id = current_session_id())
  );

CREATE POLICY "stock_notes_update" ON stock_notes
  FOR UPDATE USING (is_owner(user_id, session_id));

CREATE POLICY "stock_notes_delete" ON stock_notes
  FOR DELETE USING (is_owner(user_id, session_id));

-- ── screener_presets ──────────────────────────────────────────────────────────

CREATE POLICY "screener_presets_select" ON screener_presets
  FOR SELECT USING (is_owner(user_id, session_id));

CREATE POLICY "screener_presets_insert" ON screener_presets
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    OR
    (auth.uid() IS NULL AND session_id = current_session_id())
  );

CREATE POLICY "screener_presets_delete" ON screener_presets
  FOR DELETE USING (is_owner(user_id, session_id));

-- ── compare_portfolios ────────────────────────────────────────────────────────

CREATE POLICY "compare_portfolios_select" ON compare_portfolios
  FOR SELECT USING (is_owner(user_id, session_id));

CREATE POLICY "compare_portfolios_insert" ON compare_portfolios
  FOR INSERT WITH CHECK (
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
    OR
    (auth.uid() IS NULL AND session_id = current_session_id())
  );

CREATE POLICY "compare_portfolios_delete" ON compare_portfolios
  FOR DELETE USING (is_owner(user_id, session_id));

-- ── 5. Trigger: auto-set user_id on insert when logged in ─────────────────────

CREATE OR REPLACE FUNCTION set_user_id_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER portfolios_set_user_id
    BEFORE INSERT ON portfolios FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER watchlist_set_user_id
    BEFORE INSERT ON watchlist_items FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER alerts_set_user_id
    BEFORE INSERT ON price_alerts FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER notes_set_user_id
    BEFORE INSERT ON stock_notes FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER screener_presets_set_user_id
    BEFORE INSERT ON screener_presets FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER compare_set_user_id
    BEFORE INSERT ON compare_portfolios FOR EACH ROW EXECUTE FUNCTION set_user_id_on_insert();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 6. Verify: should list user_id on 6 tables ────────────────────────────────

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'user_id'
ORDER BY table_name;
