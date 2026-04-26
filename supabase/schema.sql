-- Create reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  latitude double precision,
  longitude double precision,
  category text NOT NULL,
  department text NOT NULL,
  risk_score integer NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'rejected')),
  ai_summary text NOT NULL,
  recommended_action text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
