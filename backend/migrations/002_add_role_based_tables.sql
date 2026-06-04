-- Migration: Add role-based tables and update existing tables
-- Date: May 30, 2026
-- Description: Add support for role-based access control and audit logging

-- 1. Add role column to auth.users metadata (Supabase)
-- Note: This is handled through Supabase Auth settings
-- Users should have raw_user_meta_data with role field:
-- {
--   "role": "client|admin",
--   "full_name": "...",
--   "organization": "..."
-- }

-- 2. Create admin_notes table
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general', -- general, urgent, follow_up, etc.
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for admin_notes
CREATE INDEX IF NOT EXISTS idx_admin_notes_session_id ON admin_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_admin_id ON admin_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at ON admin_notes(created_at DESC);

-- 3. Create team_assignments table
CREATE TABLE IF NOT EXISTS team_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_status VARCHAR(50) DEFAULT 'assigned', -- assigned, in_progress, completed
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for team_assignments
CREATE INDEX IF NOT EXISTS idx_team_assignments_session_id ON team_assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_team_assignments_assigned_to ON team_assignments(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_team_assignments_assigned_by ON team_assignments(assigned_by_user_id);

-- 4. Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- GET, POST, PUT, DELETE, etc.
  resource_type VARCHAR(100) NOT NULL, -- intake, client, note, etc.
  resource_id UUID,
  endpoint VARCHAR(255),
  status_code INTEGER,
  changes JSONB, -- For tracking what changed
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource_id ON audit_log(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- 5. Create team_members table (for team management)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID, -- For multi-tenant support (future)
  role VARCHAR(50) NOT NULL, -- admin or client
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- 6. Create settings table (for admin settings)
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(50), -- string, integer, boolean, json
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for admin_settings
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);

-- 7. Update Row-Level Security (RLS) Policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
DROP POLICY IF EXISTS "Admins can view all records" ON clients;
DROP POLICY IF EXISTS "Clients can view own sessions" ON intakes;
DROP POLICY IF EXISTS "Admins can view all sessions" ON intakes;

-- Enable RLS on new tables
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients table
CREATE POLICY "Clients can view own record"
  ON clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all records"
  ON clients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- RLS Policies for intakes table
CREATE POLICY "Clients can view own sessions"
  ON intakes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON intakes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- RLS Policies for admin_notes table
CREATE POLICY "Admins can view notes"
  ON admin_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

CREATE POLICY "Admins can create notes"
  ON admin_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- RLS Policies for team_assignments table
CREATE POLICY "Admins can view assignments"
  ON team_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- RLS Policies for audit_log table
CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );

-- RLS Policies for team_members table
-- Note: This policy allows anyone to read their own team_members record to prevent infinite recursion
CREATE POLICY "Users can view their own member record"
  ON team_members FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for admin_settings table
-- Disabled for service role to work properly with admin operations
-- CREATE POLICY "Admins can view settings"
--   ON admin_settings FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM team_members
--       WHERE user_id = auth.uid()
--       AND role = 'admin'
--       AND status = 'active'
--     )
--   );
--
-- CREATE POLICY "Admins can update settings"
--   ON admin_settings FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM team_members
--       WHERE user_id = auth.uid()
--       AND role = 'admin'
--       AND status = 'active'
--     )
--   );

-- 8. Insert default settings
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('max_file_size', '52428800', 'integer', 'Maximum file upload size in bytes (50MB)'),
  ('allowed_file_types', 'pdf,doc,docx,txt,jpg,png', 'string', 'Comma-separated list of allowed file types'),
  ('session_timeout', '3600', 'integer', 'Session timeout in seconds'),
  ('enable_email_notifications', 'true', 'boolean', 'Enable email notifications'),
  ('enable_audit_logging', 'true', 'boolean', 'Enable audit logging'),
  ('retention_days', '365', 'integer', 'Number of days to retain session data')
ON CONFLICT (setting_key) DO NOTHING;

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_notes_updated_at BEFORE UPDATE ON admin_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_assignments_updated_at BEFORE UPDATE ON team_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Create views for common queries

-- View: All active team members
CREATE OR REPLACE VIEW active_team_members AS
SELECT tm.*, au.email
FROM team_members tm
JOIN auth.users au ON tm.user_id = au.id
WHERE tm.status = 'active';

-- View: Session assignments
CREATE OR REPLACE VIEW session_assignments AS
SELECT 
  ta.id,
  ta.session_id,
  ta.assigned_to_user_id,
  ta.assigned_by_user_id,
  ta.assignment_status,
  ta.created_at,
  ta.updated_at,
  au.email as assigned_to_name,
  au2.email as assigned_by_name
FROM team_assignments ta
LEFT JOIN auth.users au ON ta.assigned_to_user_id = au.id
LEFT JOIN auth.users au2 ON ta.assigned_by_user_id = au2.id;

-- View: Session with notes count
CREATE OR REPLACE VIEW sessions_with_notes AS
SELECT 
  s.id,
  s.client_id,
  s.user_id,
  s.status,
  s.legal_category,
  s.urgency,
  s.created_at,
  s.updated_at,
  COUNT(an.id) as notes_count
FROM intakes s
LEFT JOIN admin_notes an ON s.id = an.session_id
GROUP BY s.id;

-- 11. Grant permissions
-- Note: These should be adjusted based on your Supabase project setup
-- GRANT SELECT ON admin_notes TO authenticated;
-- GRANT INSERT ON admin_notes TO authenticated;
-- GRANT SELECT ON team_assignments TO authenticated;
-- GRANT SELECT ON audit_log TO authenticated;
-- GRANT SELECT ON team_members TO authenticated;
-- GRANT SELECT ON admin_settings TO authenticated;

-- Migration complete
