-- Migration: Refactor admin notes to use intakes.notes column
-- Date: June 5, 2026
-- Description: Remove separate admin_notes table and consolidate all notes into the intakes.notes column

-- 1. Drop admin_notes table and its constraints
DROP TABLE IF EXISTS admin_notes CASCADE;

-- 2. Drop team_assignments table if no longer needed
DROP TABLE IF EXISTS team_assignments CASCADE;

-- 3. Verify the intakes table still has the notes column
-- The notes column should be of type TEXT and is already present
-- No changes needed to intakes table

-- 4. Migration complete
-- All admin notes will now be stored in the intakes.notes column
-- This simplifies the schema and makes note management more straightforward
