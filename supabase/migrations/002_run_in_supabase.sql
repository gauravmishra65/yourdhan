-- ============================================================
-- YourDhan – Complete Supabase Setup  (idempotent – safe to re-run)
-- ============================================================
-- HOW TO USE:
--   1. Open https://supabase.com/dashboard → your project
--   2. Go to SQL Editor → New Query
--   3. Paste this entire file and click "Run"
--   4. Done – all tables, RLS policies, functions and views are created.
-- ============================================================

-- ── 0. Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1. SESSIONS ──────────────────────────────────────────────────────────────
-- One row per anonymous browser. id stored in localStorage as 'yourdhan-session-id'

create table if not exists sessions (
  id           uuid primary key default uuid_generate_v4(),
  device_hint  text,
  created_at   timestamptz not null default now(),
  last_active  timestamptz not null default now()
);

comment on table sessions is
  'Anonymous device identity. No login required – id is kept in browser localStorage.';

-- ── 2. USER_PREFERENCES ──────────────────────────────────────────────────────

create table if not exists user_preferences (
  session_id        uuid primary key references sessions(id) on delete cascade,
  theme             text    not null default 'dark'  check (theme in ('dark','light')),
  risk_free_rate    numeric not null default 0.06,
  default_benchmark text    not null default 'SPY',
  currency          text    not null default 'INR',
  sidebar_open      boolean not null default true,
  updated_at        timestamptz not null default now()
);

-- ── 3. PORTFOLIOS ────────────────────────────────────────────────────────────

create table if not exists portfolios (
  id             uuid    primary key default uuid_generate_v4(),
  session_id     uuid    not null references sessions(id) on delete cascade,
  name           text    not null default 'My Portfolio',
  description    text,
  benchmark      text    not null default 'SPY'    check (benchmark in ('SPY','QQQ','BND','none')),
  rebalance      text    not null default 'annual' check (rebalance in ('none','monthly','quarterly','annual')),
  initial_amount numeric not null default 100000,
  start_year     smallint not null default 2000,
  end_year       smallint not null default 2024,
  risk_free_rate numeric not null default 0.06,
  is_default     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table portfolios is
  'Saved portfolio configurations. Each session may have many portfolios.';

-- Auto-update updated_at on row changes
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists portfolios_updated_at on portfolios;
create trigger portfolios_updated_at
  before update on portfolios
  for each row execute procedure touch_updated_at();

-- ── 4. PORTFOLIO_ASSETS ───────────────────────────────────────────────────────

create table if not exists portfolio_assets (
  id            uuid     primary key default uuid_generate_v4(),
  portfolio_id  uuid     not null references portfolios(id) on delete cascade,
  symbol        text     not null,
  weight        numeric  not null default 0 check (weight >= 0 and weight <= 100),
  asset_class   text,                              -- 'equity' | 'bond' | 'etf' | 'mf'
  display_order smallint not null default 0,
  created_at    timestamptz not null default now(),
  unique (portfolio_id, symbol)
);

comment on table portfolio_assets is
  'Holdings inside a portfolio. Weights should sum to 100 per portfolio.';

-- ── 5. PORTFOLIO_SNAPSHOTS ────────────────────────────────────────────────────

create table if not exists portfolio_snapshots (
  id             uuid    primary key default uuid_generate_v4(),
  portfolio_id   uuid    not null references portfolios(id) on delete cascade,
  snapshot_date  date    not null,
  total_value    numeric not null,
  daily_pnl      numeric not null default 0,
  daily_pnl_pct  numeric not null default 0,
  cagr           numeric,
  sharpe         numeric,
  max_drawdown   numeric,
  created_at     timestamptz not null default now(),
  unique (portfolio_id, snapshot_date)
);

comment on table portfolio_snapshots is
  'Point-in-time NAV records for charting portfolio value over time.';

-- ── 6. WATCHLIST_ITEMS ────────────────────────────────────────────────────────

create table if not exists watchlist_items (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references sessions(id) on delete cascade,
  symbol      text not null,
  note        text,
  added_at    timestamptz not null default now(),
  unique (session_id, symbol)
);

-- ── 7. PRICE_ALERTS ──────────────────────────────────────────────────────────

create table if not exists price_alerts (
  id           uuid    primary key default uuid_generate_v4(),
  session_id   uuid    not null references sessions(id) on delete cascade,
  ticker       text    not null,
  alert_type   text    not null check (alert_type in ('above','below','pct_up','pct_down')),
  target_value numeric not null,
  current_ref  numeric,
  is_active    boolean not null default true,
  triggered_at timestamptz,
  notes        text,
  created_at   timestamptz not null default now()
);

-- ── 8. STOCK_NOTES ────────────────────────────────────────────────────────────

create table if not exists stock_notes (
  id          uuid primary key default uuid_generate_v4(),
  session_id  uuid not null references sessions(id) on delete cascade,
  ticker      text not null,
  note        text not null,
  sentiment   text check (sentiment in ('bullish','bearish','neutral')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (session_id, ticker)
);

drop trigger if exists stock_notes_updated_at on stock_notes;
create trigger stock_notes_updated_at
  before update on stock_notes
  for each row execute procedure touch_updated_at();

-- ── 9. SCREENER_PRESETS ───────────────────────────────────────────────────────

create table if not exists screener_presets (
  id          uuid  primary key default uuid_generate_v4(),
  session_id  uuid  not null references sessions(id) on delete cascade,
  name        text  not null,
  filters     jsonb not null default '{}',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── 10. COMPARE_PORTFOLIOS ────────────────────────────────────────────────────

create table if not exists compare_portfolios (
  id          uuid  primary key default uuid_generate_v4(),
  session_id  uuid  not null references sessions(id) on delete cascade,
  name        text  not null,
  assets_json jsonb not null default '[]',   -- [{symbol, weight}, ...]
  created_at  timestamptz not null default now()
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────

create index if not exists idx_portfolios_session       on portfolios(session_id);
create index if not exists idx_portfolios_created       on portfolios(session_id, created_at desc);
create index if not exists idx_portfolio_assets_pid     on portfolio_assets(portfolio_id);
create index if not exists idx_snapshots_pid_date       on portfolio_snapshots(portfolio_id, snapshot_date desc);
create index if not exists idx_watchlist_session        on watchlist_items(session_id);
create index if not exists idx_alerts_session_active    on price_alerts(session_id) where is_active = true;
create index if not exists idx_notes_session_ticker     on stock_notes(session_id, ticker);
create index if not exists idx_presets_session          on screener_presets(session_id);
create index if not exists idx_compare_session          on compare_portfolios(session_id);

-- ── ROW-LEVEL SECURITY ────────────────────────────────────────────────────────
-- Anonymous users may only touch rows whose session_id matches the value
-- they set via set_session_context() RPC before each request.

alter table sessions              enable row level security;
alter table user_preferences      enable row level security;
alter table portfolios            enable row level security;
alter table portfolio_assets      enable row level security;
alter table portfolio_snapshots   enable row level security;
alter table watchlist_items       enable row level security;
alter table price_alerts          enable row level security;
alter table stock_notes           enable row level security;
alter table screener_presets      enable row level security;
alter table compare_portfolios    enable row level security;

-- Helper: read session id set by the app for this DB connection
create or replace function current_session_id()
returns uuid language sql stable as $$
  select nullif(current_setting('app.current_session_id', true), '')::uuid
$$;

-- Drop and recreate policies so re-runs are idempotent
do $$ begin
  -- sessions
  drop policy if exists "sessions_insert" on sessions;
  drop policy if exists "sessions_select" on sessions;
  drop policy if exists "sessions_update" on sessions;
  -- user_preferences
  drop policy if exists "prefs_all" on user_preferences;
  -- portfolios
  drop policy if exists "portfolios_all" on portfolios;
  -- portfolio_assets
  drop policy if exists "portfolio_assets_all" on portfolio_assets;
  -- portfolio_snapshots
  drop policy if exists "snapshots_all" on portfolio_snapshots;
  -- watchlist_items
  drop policy if exists "watchlist_all" on watchlist_items;
  -- price_alerts
  drop policy if exists "alerts_all" on price_alerts;
  -- stock_notes
  drop policy if exists "notes_all" on stock_notes;
  -- screener_presets
  drop policy if exists "presets_all" on screener_presets;
  -- compare_portfolios
  drop policy if exists "compare_all" on compare_portfolios;
end $$;

-- sessions: anon can insert freely; only own rows afterwards
create policy "sessions_insert" on sessions
  for insert to anon with check (true);
create policy "sessions_select" on sessions
  for select to anon using (id = current_session_id());
create policy "sessions_update" on sessions
  for update to anon using (id = current_session_id());

-- user_preferences
create policy "prefs_all" on user_preferences
  for all to anon
  using      (session_id = current_session_id())
  with check (session_id = current_session_id());

-- portfolios
create policy "portfolios_all" on portfolios
  for all to anon
  using      (session_id = current_session_id())
  with check (session_id = current_session_id());

-- portfolio_assets – scoped through portfolio ownership
create policy "portfolio_assets_all" on portfolio_assets
  for all to anon
  using      (portfolio_id in (select id from portfolios where session_id = current_session_id()))
  with check (portfolio_id in (select id from portfolios where session_id = current_session_id()));

-- portfolio_snapshots
create policy "snapshots_all" on portfolio_snapshots
  for all to anon
  using      (portfolio_id in (select id from portfolios where session_id = current_session_id()))
  with check (portfolio_id in (select id from portfolios where session_id = current_session_id()));

-- watchlist_items
create policy "watchlist_all" on watchlist_items
  for all to anon
  using      (session_id = current_session_id())
  with check (session_id = current_session_id());

-- price_alerts
create policy "alerts_all" on price_alerts
  for all to anon
  using      (session_id = current_session_id())
  with check (session_id = current_session_id());

-- stock_notes
create policy "notes_all" on stock_notes
  for all to anon
  using      (session_id = current_session_id())
  with check (session_id = current_session_id());

-- screener_presets
create policy "presets_all" on screener_presets
  for all to anon
  using      (session_id = current_session_id())
  with check (session_id = current_session_id());

-- compare_portfolios
create policy "compare_all" on compare_portfolios
  for all to anon
  using      (session_id = current_session_id())
  with check (session_id = current_session_id());

-- ── HELPER RPCs ───────────────────────────────────────────────────────────────

-- set_session_context: called before every DB operation to satisfy RLS
create or replace function set_session_context(session_id uuid)
returns void language plpgsql security definer as $$
begin
  perform set_config('app.current_session_id', session_id::text, true);
end $$;

-- upsert_session: called once on app startup to register the device
create or replace function upsert_session(p_id uuid, p_hint text default null)
returns uuid language plpgsql security definer as $$
begin
  insert into sessions(id, device_hint) values (p_id, p_hint)
  on conflict (id) do update set last_active = now(), device_hint = coalesce(p_hint, sessions.device_hint);
  perform set_config('app.current_session_id', p_id::text, true);
  return p_id;
end $$;

-- ── PORTFOLIO_SUMMARY VIEW ────────────────────────────────────────────────────
-- Denormalized view used by the portfolio list UI.
-- Returns one row per portfolio with aggregated asset data.
-- DROP first so we can freely add / reorder columns on re-runs.

drop view if exists portfolio_summary;
create view portfolio_summary as
select
  p.id,
  p.session_id,
  p.name,
  p.description,
  p.benchmark,
  p.rebalance,
  p.initial_amount,
  p.start_year,
  p.end_year,
  p.risk_free_rate,           -- required by DbPortfolioSummary (extends DbPortfolio)
  p.is_default,
  p.created_at,
  p.updated_at,
  count(pa.id)::int                              as asset_count,
  coalesce(sum(pa.weight), 0)                    as total_weight,
  jsonb_agg(
    jsonb_build_object('symbol', pa.symbol, 'weight', pa.weight)
    order by pa.display_order
  ) filter (where pa.id is not null)             as assets
from portfolios p
left join portfolio_assets pa on pa.portfolio_id = p.id
group by p.id;

comment on view portfolio_summary is
  'Portfolios with asset count, total weight, and aggregated holdings JSON.';

-- ── VERIFY SETUP ─────────────────────────────────────────────────────────────
-- Confirm all 10 tables + 1 view are present.

select
  schemaname,
  tablename as object_name,
  'table'   as type
from pg_tables
where schemaname = 'public'
  and tablename in (
    'sessions','user_preferences','portfolios','portfolio_assets',
    'portfolio_snapshots','watchlist_items','price_alerts',
    'stock_notes','screener_presets','compare_portfolios'
  )
union all
select
  schemaname,
  viewname  as object_name,
  'view'    as type
from pg_views
where schemaname = 'public'
  and viewname = 'portfolio_summary'
order by type, object_name;
