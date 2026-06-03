-- Migration: Rename intake_sessions table to intakes
-- Date: June 3, 2026
-- Description: Consolidates naming - rename intake_sessions to intakes for clarity

-- 1. Rename the main table
ALTER TABLE intake_sessions RENAME TO intakes;

-- 2. Rename all indexes
ALTER INDEX idx_intake_sessions_client_id RENAME TO idx_intakes_client_id;
ALTER INDEX idx_intake_sessions_user_id RENAME TO idx_intakes_user_id;
ALTER INDEX idx_intake_sessions_status RENAME TO idx_intakes_status;
ALTER INDEX idx_intake_sessions_created_at RENAME TO idx_intakes_created_at;

-- Rename optional indexes if they exist (from anonymous intake feature)
ALTER INDEX IF EXISTS idx_intake_sessions_is_anonymous RENAME TO idx_intakes_is_anonymous;
ALTER INDEX IF EXISTS idx_intake_sessions_client_email RENAME TO idx_intakes_client_email;
ALTER INDEX IF EXISTS idx_intake_sessions_client_name RENAME TO idx_intakes_client_name;

-- 3. Rename RLS policies
ALTER POLICY "Clients can view own sessions" ON intakes RENAME TO "Clients can view own intakes";
ALTER POLICY "Admins can view all sessions" ON intakes RENAME TO "Admins can view all intakes";

-- 4. Update foreign key constraints in dependent tables
-- Note: Foreign keys automatically update their referenced table name in PostgreSQL 15+
-- For older versions, we need to recreate them

-- admin_notes
ALTER TABLE admin_notes DROP CONSTRAINT IF EXISTS admin_notes_session_id_fkey;
ALTER TABLE admin_notes ADD CONSTRAINT admin_notes_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES intakes(id) ON DELETE CASCADE;

-- team_assignments
ALTER TABLE team_assignments DROP CONSTRAINT IF EXISTS team_assignments_session_id_fkey;
ALTER TABLE team_assignments ADD CONSTRAINT team_assignments_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES intakes(id) ON DELETE CASCADE;

-- anonymous_intakes (if it exists)
ALTER TABLE IF EXISTS anonymous_intakes DROP CONSTRAINT IF EXISTS anonymous_intakes_session_id_fkey;
ALTER TABLE IF EXISTS anonymous_intakes ADD CONSTRAINT anonymous_intakes_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES intakes(id) ON DELETE CASCADE;

-- messages
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_session_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES intakes(id) ON DELETE CASCADE;

-- uploaded_files
ALTER TABLE uploaded_files DROP CONSTRAINT IF EXISTS uploaded_files_session_id_fkey;
ALTER TABLE uploaded_files ADD CONSTRAINT uploaded_files_session_id_fkey 
  FOREIGN KEY (session_id) REFERENCES intakes(id) ON DELETE CASCADE;

-- 5. Verify the rename was successful
SELECT COUNT(*) as intakes_count FROM intakes;

-- 6. Migration complete
-- All references to intake_sessions have been updated to intakes
-- The application code has already been updated to use the new table name
