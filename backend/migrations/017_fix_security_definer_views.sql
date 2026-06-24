-- Migration: Fix SECURITY DEFINER views by adding security_invoker
-- Date: June 24, 2026
-- Description: Convert active_team_members view from SECURITY DEFINER to SECURITY INVOKER
--              to respect RLS policies. Only applies if the view exists.

-- Minimal fix: Only recreate active_team_members if it exists
-- If team_members table doesn't exist yet, this safely skips
DO $$
DECLARE
  v_view_exists BOOLEAN;
BEGIN
  -- Check if active_team_members view exists
  SELECT EXISTS(
    SELECT FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'active_team_members'
  ) INTO v_view_exists;

  -- Check if team_members table exists
  IF EXISTS(
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'team_members'
  ) THEN
    -- Drop and recreate active_team_members with security_invoker
    DROP VIEW IF EXISTS active_team_members CASCADE;
    
    CREATE VIEW active_team_members WITH (security_invoker = on) AS
    SELECT tm.*, au.email
    FROM team_members tm
    JOIN auth.users au ON tm.user_id = au.id
    WHERE tm.status = 'active';
    
    RAISE NOTICE 'Fixed active_team_members view with security_invoker=on';
  ELSE
    RAISE NOTICE 'Skipping: team_members table does not exist yet. Run migration 002_add_role_based_tables.sql first.';
  END IF;
END $$;

-- If session_assignments table exists, fix its view
DO $$
BEGIN
  IF EXISTS(
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'team_assignments'
  ) THEN
    DROP VIEW IF EXISTS session_assignments CASCADE;
    
    CREATE VIEW session_assignments WITH (security_invoker = on) AS
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
    
    RAISE NOTICE 'Fixed session_assignments view with security_invoker=on';
  END IF;
END $$;

-- If admin_notes table exists, fix sessions_with_notes view
DO $$
BEGIN
  IF EXISTS(
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_notes'
  ) THEN
    DROP VIEW IF EXISTS sessions_with_notes CASCADE;
    
    CREATE VIEW sessions_with_notes WITH (security_invoker = on) AS
    SELECT 
      s.id,
      s.client_id,
      s.user_id,
      s.status,
      s.created_at,
      s.updated_at,
      COUNT(an.id) as notes_count
    FROM intakes s
    LEFT JOIN admin_notes an ON s.id = an.session_id
    GROUP BY s.id;
    
    RAISE NOTICE 'Fixed sessions_with_notes view with security_invoker=on';
  END IF;
END $$;

-- Ensure RLS is enabled on underlying tables (if they exist)
DO $$
BEGIN
  IF EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_members') THEN
    ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'team_assignments') THEN
    ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_notes') THEN
    ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS(SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'intakes') THEN
    ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Migration complete
-- Note: If you see "Skipping" messages, you need to run migration 002_add_role_based_tables.sql first
--       to create the required tables before this security fix can apply.
