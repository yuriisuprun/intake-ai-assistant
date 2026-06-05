-- Migration: Remove legal_category column from intakes table
-- Date: June 5, 2026
-- Description: Delete the legal_category column from intakes table and update related views

-- 1. Drop the view that references legal_category
DROP VIEW IF EXISTS sessions_with_notes;

-- 2. Remove the legal_category column from intakes table
ALTER TABLE intakes DROP COLUMN IF EXISTS legal_category;

-- 3. Recreate the sessions_with_notes view without legal_category
CREATE OR REPLACE VIEW sessions_with_notes AS
SELECT 
  s.id,
  s.client_id,
  s.user_id,
  s.status,
  s.urgency,
  s.created_at,
  s.updated_at,
  COUNT(an.id) as notes_count
FROM intakes s
LEFT JOIN admin_notes an ON s.id = an.session_id
GROUP BY s.id;

-- 4. Migration complete
-- The legal_category column has been removed from the intakes table
