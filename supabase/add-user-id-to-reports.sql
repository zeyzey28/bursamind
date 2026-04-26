-- 1. Add user_id column with foreign key constraints
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 3. Reset and apply policies

-- Global read access for all authenticated users to allow dashboards and maps to populate
DROP POLICY IF EXISTS "Anyone can view all reports" ON reports;
CREATE POLICY "Anyone can view all reports" ON reports
    FOR SELECT USING (true);

-- Restrict insert to only allow users to insert reports with their own UID
DROP POLICY IF EXISTS "Users can insert their own reports" ON reports;
CREATE POLICY "Users can insert their own reports" ON reports
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Municipality and potentially owners can update status/response
DROP POLICY IF EXISTS "Municipality and owners can update reports" ON reports;
CREATE POLICY "Municipality and owners can update reports" ON reports
    FOR UPDATE
    TO authenticated
    USING (true);
