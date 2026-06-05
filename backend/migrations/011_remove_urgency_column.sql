-- Migration: Remove urgency column from intakes table
-- Date: June 5, 2026
-- Description: Remove the urgency column while keeping urgency_description column
-- Rationale: Urgency information is captured in urgency_description; the separate urgency column is redundant

-- 1. Drop the sessions_with_notes view (it references urgency)
DROP VIEW IF EXISTS sessions_with_notes;

-- 2. Remove urgency column from intakes table
ALTER TABLE intakes DROP COLUMN IF EXISTS urgency;

-- 3. Recreate the sessions_with_notes view without urgency column
CREATE OR REPLACE VIEW sessions_with_notes AS
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

-- Migration complete
