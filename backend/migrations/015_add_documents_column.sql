-- Add documents column to intakes table
-- This column stores document-related information for intake flow

ALTER TABLE intakes 
ADD COLUMN IF NOT EXISTS documents TEXT;

-- Create index for documents column
CREATE INDEX IF NOT EXISTS idx_intakes_documents ON intakes(documents) WHERE documents IS NOT NULL;
