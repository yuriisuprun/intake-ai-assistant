-- Consolidate anonymous_intakes into intakes unified concept
-- This migration removes the separation between anonymous and registered intakes

-- 1. Create new unified intakes table
CREATE TABLE IF NOT EXISTS intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  legal_category TEXT,
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted, reviewed, assigned, archived
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Migrate data from anonymous_intakes to intakes
INSERT INTO intakes (id, session_id, client_name, client_email, client_phone, legal_category, status, admin_notes, assigned_to, created_at, updated_at, reviewed_at)
SELECT id, session_id, client_name, client_email, client_phone, legal_category, status, admin_notes, assigned_to, created_at, updated_at, reviewed_at
FROM anonymous_intakes
ON CONFLICT (id) DO NOTHING;

-- 3. Create indexes for intakes
CREATE INDEX IF NOT EXISTS idx_intakes_session_id ON intakes(session_id);
CREATE INDEX IF NOT EXISTS idx_intakes_status ON intakes(status);
CREATE INDEX IF NOT EXISTS idx_intakes_created_at ON intakes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intakes_email ON intakes(client_email);

-- 4. Enable RLS on intakes (admins only)
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all intakes" ON intakes;
DROP POLICY IF EXISTS "Admins can update intakes" ON intakes;
DROP POLICY IF EXISTS "Anyone can submit intakes" ON intakes;

-- Allow admins to view all intakes
CREATE POLICY "Admins can view all intakes"
  ON intakes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow admins to update intakes
CREATE POLICY "Admins can update intakes"
  ON intakes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow anyone to insert intakes (public intake)
CREATE POLICY "Anyone can submit intakes"
  ON intakes FOR INSERT
  WITH CHECK (true);

-- 5. Remove anonymous columns from intakes
ALTER TABLE intakes 
DROP COLUMN IF EXISTS is_anonymous,
DROP COLUMN IF EXISTS anonymous_client_info;

-- 6. Update admin_all_intakes view to use consolidated intakes table
DROP VIEW IF EXISTS admin_all_intakes;

CREATE VIEW admin_all_intakes AS
SELECT 
  i.id,
  i.session_id,
  i.client_name,
  i.client_email,
  i.client_phone,
  i.legal_category,
  i.status,
  i.created_at,
  i.updated_at,
  'intake' as intake_type
FROM intakes i
UNION ALL
SELECT 
  s.id,
  s.id as session_id,
  c.full_name as client_name,
  c.email as client_email,
  c.phone as client_phone,
  s.legal_category,
  s.status,
  s.created_at,
  s.updated_at,
  'registered' as intake_type
FROM intakes s
JOIN clients c ON s.client_id = c.id
WHERE s.user_id IS NOT NULL;

-- 7. Drop old anonymous_intakes table (after verifying migration)
-- Uncomment this after confirming data migration was successful:
-- DROP TABLE IF EXISTS anonymous_intakes;
