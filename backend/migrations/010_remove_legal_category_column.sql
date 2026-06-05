-- Migration: Remove legal_category column from intakes table
-- Date: June 5, 2026
-- Description: Delete the legal_category column from intakes table and update related views

-- 1. Drop dependent views that reference legal_category
DROP VIEW IF EXISTS sessions_with_notes CASCADE;
DROP VIEW IF EXISTS admin_all_intakes CASCADE;

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

-- 4. Recreate admin_all_intakes view without legal_category
-- This view combines anonymous_intakes and registered client intakes
CREATE OR REPLACE VIEW admin_all_intakes AS
SELECT 
  ai.id,
  ai.session_id,
  ai.client_name,
  ai.client_email,
  ai.client_phone,
  ai.status,
  ai.created_at,
  ai.updated_at,
  'anonymous' as intake_type
FROM anonymous_intakes ai
UNION ALL
SELECT 
  s.id,
  s.id as session_id,
  c.full_name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  s.status,
  s.created_at,
  s.updated_at,
  'registered' as intake_type
FROM intakes s
JOIN clients c ON s.client_id = c.id
WHERE s.user_id IS NOT NULL;

-- 5. Migration complete
-- The legal_category column has been removed from the intakes table
-- All dependent views have been updated
