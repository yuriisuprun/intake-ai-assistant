-- Add reference_number column to intakes table (without UNIQUE constraint initially)
-- This column stores the user-friendly reference number for intake sessions

ALTER TABLE intakes 
ADD COLUMN IF NOT EXISTS reference_number VARCHAR(50) DEFAULT '';

-- Update existing records with reference numbers derived from their id (first 8 chars uppercase)
UPDATE intakes 
SET reference_number = UPPER(SUBSTRING(id::TEXT, 1, 8))
WHERE reference_number = '' OR reference_number IS NULL;

-- Drop the default so new inserts must provide a value or will fail
ALTER TABLE intakes ALTER COLUMN reference_number DROP DEFAULT;

-- Add NOT NULL constraint
ALTER TABLE intakes ALTER COLUMN reference_number SET NOT NULL;

-- Add UNIQUE constraint now that all rows have non-empty values
ALTER TABLE intakes ADD CONSTRAINT intakes_reference_number_unique UNIQUE (reference_number);

-- Create index for reference_number column for fast lookups
CREATE INDEX IF NOT EXISTS idx_intakes_reference_number ON intakes(reference_number);

-- Add check constraint to ensure reference_number is not empty for new records
ALTER TABLE intakes ADD CONSTRAINT check_reference_number_not_empty CHECK (reference_number != '');
