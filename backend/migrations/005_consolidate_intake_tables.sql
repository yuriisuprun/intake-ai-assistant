-- Consolidate intake data into intake_sessions table
-- This migration adds client info columns to intake_sessions to avoid duplication

-- 1. Add client info columns to intake_sessions if they don't exist
ALTER TABLE intake_sessions 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- 2. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_intake_sessions_client_email ON intake_sessions(client_email) WHERE client_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intake_sessions_client_name ON intake_sessions(client_name) WHERE client_name IS NOT NULL;
