-- Migration: Fix infinite recursion in RLS policies
-- Date: June 3, 2026
-- Description: Fix the infinite recursion issue in team_members RLS policy

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view team members" ON team_members;

-- Create a non-recursive policy that allows users to read their own record
CREATE POLICY "Users can view their own member record"
  ON team_members FOR SELECT
  USING (auth.uid() = user_id);

-- Disable problematic policies on admin_settings that rely on team_members
DROP POLICY IF EXISTS "Admins can view settings" ON admin_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON admin_settings;

-- Allow direct queries from service role (used by backend)
-- These policies are not needed when using service role key which bypasses RLS
