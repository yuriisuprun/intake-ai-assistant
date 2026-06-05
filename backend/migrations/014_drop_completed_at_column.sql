-- Drop completed_at column from intakes table
-- Rationale: Completion time can be inferred from status and updated_at timestamps
-- This simplifies the schema and reduces data redundancy

ALTER TABLE intakes DROP COLUMN completed_at;
