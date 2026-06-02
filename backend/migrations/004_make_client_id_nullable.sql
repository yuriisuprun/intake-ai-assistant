-- Make client_id nullable to support Intakes

-- Drop the foreign key constraint
ALTER TABLE intake_sessions 
DROP CONSTRAINT IF EXISTS intake_sessions_client_id_fkey;

-- Make client_id nullable
ALTER TABLE intake_sessions 
ALTER COLUMN client_id DROP NOT NULL;

-- Re-add the foreign key constraint (now allowing NULL)
ALTER TABLE intake_sessions 
ADD CONSTRAINT intake_sessions_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
