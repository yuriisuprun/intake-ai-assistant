-- Migration: Remove client_id and user_id from intakes table
-- Date: June 5, 2026
-- Description: Make intakes table independent of client_id and user_id
-- Rationale: All information needed is stored directly in intakes table
-- (client_name, client_email, client_phone). Remove foreign key dependencies.

-- 1. Drop dependent views first (they reference user_id)
DROP VIEW IF EXISTS admin_all_intakes CASCADE;
DROP VIEW IF EXISTS sessions_with_notes CASCADE;

-- 2. Drop RLS policies on dependent tables (they reference intakes.user_id)
DROP POLICY IF EXISTS "Users can view messages from their sessions" ON messages;
DROP POLICY IF EXISTS "Users can insert messages to their sessions" ON messages;
DROP POLICY IF EXISTS "Users can view files from their sessions" ON uploaded_files;
DROP POLICY IF EXISTS "Users can insert files to their sessions" ON uploaded_files;

-- 3. Drop all RLS policies on intakes table
DROP POLICY IF EXISTS "Users can view their own sessions" ON intakes;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON intakes;
DROP POLICY IF EXISTS "Users can update their own sessions" ON intakes;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON intakes;
DROP POLICY IF EXISTS "Clients can view own intakes" ON intakes;
DROP POLICY IF EXISTS "Admins can view all intakes" ON intakes;

-- 4. Drop foreign key constraints
ALTER TABLE intakes 
DROP CONSTRAINT IF EXISTS intakes_user_id_fkey,
DROP CONSTRAINT IF EXISTS intakes_client_id_fkey;

-- 5. Drop indexes on removed columns
DROP INDEX IF EXISTS idx_intakes_user_id;
DROP INDEX IF EXISTS idx_intakes_client_id;

-- 6. Disable RLS on intakes (now independent table)
ALTER TABLE intakes DISABLE ROW LEVEL SECURITY;

-- 7. Drop the columns (now safe - all dependencies removed)
ALTER TABLE intakes
DROP COLUMN IF EXISTS user_id CASCADE,
DROP COLUMN IF EXISTS client_id CASCADE;

-- 8. Disable RLS on dependent tables (they no longer filter by user_id)
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files DISABLE ROW LEVEL SECURITY;

-- 9. Create new RLS policies for messages (no user_id check)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all message access" ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 10. Create new RLS policies for uploaded_files (no user_id check)
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all file access" ON uploaded_files
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 11. Re-enable RLS on intakes (now public)
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all intake access" ON intakes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 12. Verify the table structure
-- SELECT * FROM information_schema.columns 
-- WHERE table_name = 'intakes' 
-- ORDER BY ordinal_position;
