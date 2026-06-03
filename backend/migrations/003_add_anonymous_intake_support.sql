-- Add support for anonymous/unregistered client intakes

-- 1. Add anonymous_client_info and is_anonymous columns to intakes
-- Note: user_id is already nullable, so we don't need to modify it
ALTER TABLE intakes 
ADD COLUMN IF NOT EXISTS anonymous_client_info JSONB,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- 2. Create anonymous_intakes table for tracking unregistered submissions
CREATE TABLE IF NOT EXISTS anonymous_intakes (
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

-- 3. Create indexes for anonymous_intakes
CREATE INDEX IF NOT EXISTS idx_anonymous_intakes_session_id ON anonymous_intakes(session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_intakes_status ON anonymous_intakes(status);
CREATE INDEX IF NOT EXISTS idx_anonymous_intakes_created_at ON anonymous_intakes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anonymous_intakes_email ON anonymous_intakes(client_email);

-- 4. Enable RLS on anonymous_intakes (admins only)
ALTER TABLE anonymous_intakes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all Intakes" ON anonymous_intakes;
DROP POLICY IF EXISTS "Admins can update Intakes" ON anonymous_intakes;
DROP POLICY IF EXISTS "Anyone can submit Intakes" ON anonymous_intakes;

-- Allow admins to view all Intakes
CREATE POLICY "Admins can view all Intakes"
  ON anonymous_intakes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow admins to update Intakes
CREATE POLICY "Admins can update Intakes"
  ON anonymous_intakes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow anyone to insert Intakes (public intake)
CREATE POLICY "Anyone can submit Intakes"
  ON anonymous_intakes FOR INSERT
  WITH CHECK (true);

-- 5. Update intakes to allow NULL user_id for anonymous submissions
-- Make sure user_id is nullable (it should already be, but ensure it)
ALTER TABLE intakes 
ALTER COLUMN user_id DROP NOT NULL;

-- 6. Create or update indexes
CREATE INDEX IF NOT EXISTS idx_intakes_user_id ON intakes(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_intakes_is_anonymous ON intakes(is_anonymous);

-- 7. Create view for admin dashboard
CREATE OR REPLACE VIEW admin_all_intakes AS
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
  'anonymous' as intake_type
FROM anonymous_intakes i
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
