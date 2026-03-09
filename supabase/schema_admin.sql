-- ============================================================================
-- Legal Leads Group – Admin & Webhooks Schema
-- Run this AFTER schema.sql in Supabase → SQL Editor
-- ============================================================================

-- ─── 1. ADMIN USERS ───────────────────────────────────────────────────────
-- Tracks which auth users are admins. Admins can see/edit all clients.
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin'
                CHECK (role IN ('admin', 'super_admin')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can read their own row
CREATE POLICY "Admins read own" ON admin_users
  FOR SELECT USING (auth.uid() = auth_user_id);

-- ─── Helper: check if current user is an admin ────────────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE auth_user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── 2. INTEGRATION CONFIGS ──────────────────────────────────────────────
-- Admin-only table: stores API keys and connection details per client.
-- Clients NEVER see this table. Admins configure it.
CREATE TABLE IF NOT EXISTS integration_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  integration_id  UUID REFERENCES integrations(id) ON DELETE CASCADE,
  config_type     TEXT NOT NULL,          -- 'google_analytics', 'keyword_tool', 'napw_scores', etc.
  api_key         TEXT,                   -- encrypted in production via Vault
  api_secret      TEXT,
  external_id     TEXT,                   -- e.g. GA property ID, tracking ID
  settings        JSONB DEFAULT '{}',     -- flexible key-value for tool-specific settings
  is_active       BOOLEAN DEFAULT true,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write integration configs
CREATE POLICY "Admins full access" ON integration_configs
  FOR ALL USING (is_admin());

-- ─── 3. WEBHOOK LOGS ─────────────────────────────────────────────────────
-- Audit trail for incoming webhooks from Wrike, Slack, etc.
CREATE TABLE IF NOT EXISTS webhook_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT NOT NULL,            -- 'wrike', 'slack', 'manual'
  event_type    TEXT NOT NULL,            -- 'client_created', 'update_posted', 'task_completed', etc.
  payload       JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'received'
                CHECK (status IN ('received', 'processed', 'failed')),
  error_message TEXT,
  client_id     UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view webhook logs
CREATE POLICY "Admins read logs" ON webhook_logs
  FOR SELECT USING (is_admin());

-- ─── 4. ADMIN POLICIES ON EXISTING TABLES ─────────────────────────────────
-- Give admins full read access to all client data tables

CREATE POLICY "Admins read all clients" ON clients
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins write clients" ON clients
  FOR ALL USING (is_admin());

CREATE POLICY "Admins read all" ON seo_progress
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins write" ON seo_progress
  FOR ALL USING (is_admin());

CREATE POLICY "Admins read all" ON seo_progress_subs
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins read all" ON seo_deliverables
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins read all" ON lighthouse_scores
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins write" ON lighthouse_scores
  FOR ALL USING (is_admin());

CREATE POLICY "Admins read all tickets" ON tickets
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins write tickets" ON tickets
  FOR ALL USING (is_admin());

CREATE POLICY "Admins read all" ON team_members
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins write" ON team_members
  FOR ALL USING (is_admin());

CREATE POLICY "Admins read all" ON updates
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins write" ON updates
  FOR ALL USING (is_admin());

CREATE POLICY "Admins read all" ON integrations
  FOR SELECT USING (is_admin());
CREATE POLICY "Admins write" ON integrations
  FOR ALL USING (is_admin());


-- ─── 5. WRIKE CONFIG ──────────────────────────────────────────────────────
-- Stores the Wrike API token and workspace mapping (one row, admin-only)
CREATE TABLE IF NOT EXISTS wrike_config (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_token       TEXT NOT NULL,
  webhook_secret  TEXT,                   -- for verifying incoming webhooks
  workspace_id    TEXT,
  folder_id       TEXT,                   -- the folder/project that maps to new clients
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE wrike_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON wrike_config FOR ALL USING (is_admin());

-- ─── 6. SLACK CONFIG ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS slack_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_url       TEXT,                 -- for sending TO Slack (optional)
  signing_secret    TEXT NOT NULL,        -- for verifying FROM Slack
  bot_token         TEXT,
  channel_mapping   JSONB DEFAULT '{}',   -- { "client_updates": "#client-feed", ... }
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE slack_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins only" ON slack_config FOR ALL USING (is_admin());
