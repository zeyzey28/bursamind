-- 1. Add municipality response columns
ALTER TABLE reports ADD COLUMN IF NOT EXISTS municipality_response text;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS response_updated_at timestamptz;

-- Ensure RLS allows municipality to update (policies from previous step should allow this, but being explicit is good)
-- Previous policy: CREATE POLICY "Municipality and owners can update reports" ON reports FOR UPDATE TO authenticated USING (true);
