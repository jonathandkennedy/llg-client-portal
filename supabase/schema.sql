-- ============================================================================
-- Legal Leads Group – Client Portal Schema
-- Run this in Supabase → SQL Editor → New Query
-- ============================================================================

-- ─── 1. CLIENTS ────────────────────────────────────────────────────────────
-- Each row = one law firm client. Linked to a Supabase auth user.
CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id  UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_name     TEXT NOT NULL,
  contact_name  TEXT NOT NULL,
  email         TEXT NOT NULL,
  avatar_url    TEXT,
  package_name  TEXT NOT NULL DEFAULT 'Saturn - Rhea Package',
  package_price TEXT NOT NULL DEFAULT '$5999/mo',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. SEO PROGRESS ──────────────────────────────────────────────────────
-- Tracks each deliverable line item in the SEO plan.
CREATE TABLE IF NOT EXISTS seo_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,            -- e.g. "SEO Pages Done"
  done        INT NOT NULL DEFAULT 0,
  total       INT NOT NULL DEFAULT 1,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Sub-counts for EN/ES breakdowns
CREATE TABLE IF NOT EXISTS seo_progress_subs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seo_progress_id UUID REFERENCES seo_progress(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,        -- e.g. "EN", "ES"
  done            INT NOT NULL DEFAULT 0,
  total           INT NOT NULL DEFAULT 0
);

-- Individual deliverable items within each progress category
CREATE TABLE IF NOT EXISTS seo_deliverables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seo_progress_id UUID REFERENCES seo_progress(id) ON DELETE CASCADE,
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,            -- e.g. "Car Accident Lawyer Landing Page"
  language        TEXT DEFAULT 'EN',        -- "EN" or "ES"
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'review', 'complete')),
  url             TEXT,                     -- live URL once published
  notes           TEXT,
  assigned_to     TEXT,                     -- team member name
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. LIGHTHOUSE SCORES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lighthouse_scores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,            -- "Performance", "Accessibility", etc.
  score       INT NOT NULL DEFAULT 0,
  color       TEXT DEFAULT '#5B2D8E',
  sort_order  INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. SUPPORT TICKETS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID REFERENCES clients(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  file_urls    TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now(),
  closed_at    TIMESTAMPTZ
);

-- ─── 5. TEAM MEMBERS ──────────────────────────────────────────────────────
-- The support team assigned to each client.
CREATE TABLE IF NOT EXISTS team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  role        TEXT NOT NULL,            -- "SEO Manager", "Web Dev", etc.
  name        TEXT NOT NULL,
  color       TEXT DEFAULT '#5B2D8E',
  sort_order  INT NOT NULL DEFAULT 0
);

-- ─── 6. RECENT UPDATES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS updates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'Recent',  -- "Recent", "Uncent", etc.
  text        TEXT NOT NULL,
  color       TEXT DEFAULT '#5B2D8E',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── 7. INTEGRATIONS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS integrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  action_label TEXT NOT NULL,           -- "View Dashboard", "Analyze Keywords"
  icon        TEXT NOT NULL DEFAULT 'GA',
  color       TEXT DEFAULT '#E37400',
  sort_order  INT NOT NULL DEFAULT 0
);


-- ============================================================================
-- ROW LEVEL SECURITY – clients can only see their own data
-- ============================================================================

ALTER TABLE clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_progress      ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_progress_subs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lighthouse_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations      ENABLE ROW LEVEL SECURITY;

-- Clients: can read own row
CREATE POLICY "Clients read own" ON clients
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Helper function: get client_id for the current auth user
CREATE OR REPLACE FUNCTION get_my_client_id()
RETURNS UUID AS $$
  SELECT id FROM clients WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- All child tables: read where client_id = my client
CREATE POLICY "Own data only" ON seo_progress
  FOR SELECT USING (client_id = get_my_client_id());

CREATE POLICY "Own data only" ON seo_progress_subs
  FOR SELECT USING (
    seo_progress_id IN (
      SELECT id FROM seo_progress WHERE client_id = get_my_client_id()
    )
  );

ALTER TABLE seo_deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own data only" ON seo_deliverables
  FOR SELECT USING (client_id = get_my_client_id());

CREATE POLICY "Own data only" ON lighthouse_scores
  FOR SELECT USING (client_id = get_my_client_id());

CREATE POLICY "Read own tickets" ON tickets
  FOR SELECT USING (client_id = get_my_client_id());

-- Clients can create tickets
CREATE POLICY "Create own tickets" ON tickets
  FOR INSERT WITH CHECK (client_id = get_my_client_id());

CREATE POLICY "Own data only" ON team_members
  FOR SELECT USING (client_id = get_my_client_id());

CREATE POLICY "Own data only" ON updates
  FOR SELECT USING (client_id = get_my_client_id());

CREATE POLICY "Own data only" ON integrations
  FOR SELECT USING (client_id = get_my_client_id());


-- ============================================================================
-- SEED DATA (Azizi Law Firm example – remove for production)
-- ============================================================================

-- NOTE: Replace 'AUTH_USER_UUID_HERE' with the actual UUID from auth.users
-- after the user signs up via magic link for the first time.

/*
INSERT INTO clients (auth_user_id, firm_name, contact_name, email, package_name, package_price)
VALUES ('AUTH_USER_UUID_HERE', 'Azizi Law Firm', 'Zain Azizi', 'zain@azizilaw.com', 'Saturn - Rhea Package', '$5999/mo');

-- Grab the client id
DO $$
DECLARE cid UUID;
BEGIN
  SELECT id INTO cid FROM clients WHERE email = 'zain@azizilaw.com';

  -- SEO Progress
  INSERT INTO seo_progress (client_id, label, done, total, sort_order) VALUES
    (cid, 'SEO Pages Done',   3, 6, 1),
    (cid, 'YouTube Videos',   3, 4, 2),
    (cid, 'FAQ VOICE Search', 4, 4, 3),
    (cid, 'AI Search',        2, 3, 4),
    (cid, 'Press Release',    0, 1, 5);

  -- SEO Progress Subs
  INSERT INTO seo_progress_subs (seo_progress_id, label, done, total)
  SELECT id, 'EN', 2, 3 FROM seo_progress WHERE client_id = cid AND label = 'SEO Pages Done';
  INSERT INTO seo_progress_subs (seo_progress_id, label, done, total)
  SELECT id, 'ES', 1, 3 FROM seo_progress WHERE client_id = cid AND label = 'SEO Pages Done';

  INSERT INTO seo_progress_subs (seo_progress_id, label, done, total)
  SELECT id, 'EN', 2, 2 FROM seo_progress WHERE client_id = cid AND label = 'YouTube Videos';
  INSERT INTO seo_progress_subs (seo_progress_id, label, done, total)
  SELECT id, 'ES', 1, 2 FROM seo_progress WHERE client_id = cid AND label = 'YouTube Videos';

  -- Lighthouse Scores
  INSERT INTO lighthouse_scores (client_id, label, score, color, sort_order) VALUES
    (cid, 'Performance',    98,  '#5B2D8E', 1),
    (cid, 'Accessibility',  100, '#3DAA6D', 2),
    (cid, 'Best Practices', 100, '#C4A450', 3),
    (cid, 'SEO',            100, '#3DAA6D', 4);

  -- Tickets
  INSERT INTO tickets (client_id, title, status, closed_at) VALUES
    (cid, 'Change courthouse in social post', 'closed', now()),
    (cid, 'Feb 2nd update blog info',        'closed', now());

  -- Team
  INSERT INTO team_members (client_id, role, name, color, sort_order) VALUES
    (cid, 'SEO Manager',   'Nick Offerman',  '#5B2D8E', 1),
    (cid, 'FAQ Search',    'Hans Gruber',    '#3DAA6D', 2),
    (cid, 'Paid Ads',      'Larry David',    '#C4A450', 3),
    (cid, 'AI Search',     '2/AI Search',    '#E67E22', 4),
    (cid, 'Web Dev',       'Sheldon Cooper', '#3498DB', 5),
    (cid, 'Press Release', 'Tony Montana',   '#95A5A6', 6);

  -- Updates
  INSERT INTO updates (client_id, type, text, color) VALUES
    (cid, 'Recent', 'Blog post added',       '#5B2D8E'),
    (cid, 'Recent', 'YouTube Video added',   '#C4A450'),
    (cid, 'Recent', 'Facebook Post',         '#3DAA6D'),
    (cid, 'Uncent', 'FAQ search added',      '#95A5A6');

  -- Integrations
  INSERT INTO integrations (client_id, name, action_label, icon, color, sort_order) VALUES
    (cid, 'Google Analytics', 'View Dashboard',   'GA', '#E37400', 1),
    (cid, 'Keyword Tool',     'Analyze Keywords', 'KT', '#C4A450', 2),
    (cid, 'NAP+W Scores',     'View Scores',      'NW', '#5B2D8E', 3);
END $$;
*/
