-- Migration: Remove anonymous_client_info column from intakes table
-- Date: June 3, 2026
-- Description: Removes the anonymous_client_info JSONB column as it's no longer needed.
-- Client information is now stored in individual columns (client_name, client_email, client_phone)

-- 1. Drop the index on anonymous_client_info if it exists
DROP INDEX IF EXISTS idx_intakes_anonymous_client_info;

-- 2. Remove the column
ALTER TABLE intakes 
DROP COLUMN IF EXISTS anonymous_client_info;

-- 3. Migration complete
-- The anonymous_client_info column has been removed from the intakes table
-- All client information is now stored in individual text columns
