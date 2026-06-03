-- Remove is_anonymous column from intake_sessions table
-- This column is no longer needed as we can determine if a session is anonymous
-- by checking if user_id is NULL or if client_id is NULL

-- 1. Drop the index on is_anonymous
DROP INDEX IF EXISTS idx_intake_sessions_is_anonymous;

-- 2. Drop the column
ALTER TABLE intake_sessions 
DROP COLUMN IF EXISTS is_anonymous;
