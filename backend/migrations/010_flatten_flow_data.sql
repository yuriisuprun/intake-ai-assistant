-- Flatten flow_data column into individual columns
-- This migration adds individual columns for each intake flow field
-- and removes the nested flow_data JSONB column

-- 1. Add individual columns for intake flow fields
ALTER TABLE intakes 
ADD COLUMN IF NOT EXISTS legal_area TEXT,
ADD COLUMN IF NOT EXISTS problem_description TEXT,
ADD COLUMN IF NOT EXISTS timeline TEXT,
ADD COLUMN IF NOT EXISTS urgency_description TEXT,
ADD COLUMN IF NOT EXISTS desired_outcome TEXT,
ADD COLUMN IF NOT EXISTS contact_preference TEXT,
ADD COLUMN IF NOT EXISTS additional_info TEXT;

-- 2. Create indexes for common search fields
CREATE INDEX IF NOT EXISTS idx_intakes_legal_area ON intakes(legal_area) WHERE legal_area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intakes_contact_preference ON intakes(contact_preference) WHERE contact_preference IS NOT NULL;

-- 3. Migrate existing data from flow_data to new columns (if flow_data exists)
UPDATE intakes 
SET 
  legal_area = flow_data->>'legal_area',
  problem_description = flow_data->>'problem_description',
  timeline = flow_data->>'timeline',
  urgency_description = flow_data->>'urgency',
  desired_outcome = flow_data->>'desired_outcome',
  contact_preference = flow_data->>'contact_preference',
  additional_info = flow_data->>'additional_info'
WHERE flow_data IS NOT NULL;

-- 4. Drop flow_data column
ALTER TABLE intakes DROP COLUMN IF EXISTS flow_data;
