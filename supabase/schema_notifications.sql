-- ============================================================================
-- Legal Leads Group – Notifications & Approvals Schema
-- Run this AFTER schema.sql and schema_admin.sql
-- ============================================================================

-- ─── 1. NOTIFICATIONS ─────────────────────────────────────────────────────
-- Push notifications to clients (shown in portal + optional email)
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID REFERENCES clients(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'info'
                CHECK (type IN ('info', 'action_required', 'approval', 'update', 'ticket')),
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  link_route    TEXT,                     -- e.g. "#/seo-plan" or "#/support-tickets"
  is_read       BOOLEAN DEFAULT false,
  created_by    TEXT,                     -- admin name who triggered it
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients read own" ON notifications
  FOR SELECT USING (client_id = get_my_client_id());

CREATE POLICY "Clients mark read" ON notifications
  FOR UPDATE USING (client_id = get_my_client_id())
  WITH CHECK (client_id = get_my_client_id());

CREATE POLICY "Admins full access" ON notifications
  FOR ALL USING (is_admin());

-- ─── 2. APPROVALS ─────────────────────────────────────────────────────────
-- Items sent to client for review/approval (e.g. blog draft, page design)
CREATE TABLE IF NOT EXISTS approvals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,           -- "Blog Post: Car Accident Guide"
  description     TEXT,                    -- what the client needs to review
  category        TEXT NOT NULL DEFAULT 'general'
                  CHECK (category IN ('seo_page', 'blog_post', 'youtube_video', 'social_post', 'press_release', 'design', 'general')),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  file_urls       TEXT[] DEFAULT '{}',     -- attachments for review
  preview_url     TEXT,                    -- link to preview
  submitted_by    TEXT,                    -- admin name
  client_notes    TEXT,                    -- client's feedback on rejection/revision
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  responded_at    TIMESTAMPTZ,
  due_date        DATE                     -- optional deadline
);

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Clients can read and respond to their approvals
CREATE POLICY "Clients read own" ON approvals
  FOR SELECT USING (client_id = get_my_client_id());

CREATE POLICY "Clients respond" ON approvals
  FOR UPDATE USING (client_id = get_my_client_id())
  WITH CHECK (client_id = get_my_client_id());

CREATE POLICY "Admins full access" ON approvals
  FOR ALL USING (is_admin());

-- ─── 3. TICKET RESPONSES ──────────────────────────────────────────────────
-- Threaded responses on tickets (from admin or client)
CREATE TABLE IF NOT EXISTS ticket_responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id     UUID REFERENCES tickets(id) ON DELETE CASCADE,
  author_type   TEXT NOT NULL CHECK (author_type IN ('admin', 'client')),
  author_name   TEXT NOT NULL,
  message       TEXT NOT NULL,
  file_urls     TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ticket_responses ENABLE ROW LEVEL SECURITY;

-- Clients can read responses on their tickets and add their own
CREATE POLICY "Clients read own" ON ticket_responses
  FOR SELECT USING (
    ticket_id IN (SELECT id FROM tickets WHERE client_id = get_my_client_id())
  );

CREATE POLICY "Clients respond" ON ticket_responses
  FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM tickets WHERE client_id = get_my_client_id())
    AND author_type = 'client'
  );

CREATE POLICY "Admins full access" ON ticket_responses
  FOR ALL USING (is_admin());

-- ─── 4. ADD assigned_to COLUMN TO TICKETS ─────────────────────────────────
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assigned_to TEXT;
