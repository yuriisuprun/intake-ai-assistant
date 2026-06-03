-- Make client_id nullable to support Intakes

-- Drop the foreign key constraint
ALTER TABLE intakes 
DROP CONSTRAINT IF EXISTS intakes_client_id_fkey;

-- Make client_id nullable
ALTER TABLE intakes 
ALTER COLUMN client_id DROP NOT NULL;

-- Re-add the foreign key constraint (now allowing NULL)
ALTER TABLE intakes 
ADD CONSTRAINT intakes_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
