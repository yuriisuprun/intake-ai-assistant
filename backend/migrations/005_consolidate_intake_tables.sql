-- Consolidate intake data into intakes table
-- This migration adds client info columns to intakes to avoid duplication

-- 1. Add client info columns to intakes if they don't exist
ALTER TABLE intakes 
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT,
ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- 2. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_intakes_client_email ON intakes(client_email) WHERE client_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intakes_client_name ON intakes(client_name) WHERE client_name IS NOT NULL;
