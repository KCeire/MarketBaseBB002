-- Create seller applications system
-- This migration creates the infrastructure for seller application management

-- Create seller applications table
CREATE TABLE seller_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,

  -- Business Details
  business_type TEXT NOT NULL, -- 'individual', 'small_business', 'corporation', 'nonprofit', 'partnership', 'other'
  business_description TEXT NOT NULL,
  registration_number TEXT,
  tax_id TEXT,
  business_address TEXT NOT NULL,

  -- Products & Experience
  product_categories TEXT[] NOT NULL, -- Array of categories they want to sell
  average_order_value TEXT NOT NULL, -- '$0-$50', '$50-$200', etc.
  monthly_volume TEXT NOT NULL, -- '0-100', '100-500', etc.
  has_online_store BOOLEAN NOT NULL DEFAULT FALSE,
  online_store_url TEXT,
  selling_experience TEXT NOT NULL, -- 'none', 'less_than_1_year', '1-3_years', etc.

  -- Technical Readiness
  has_wallet BOOLEAN NOT NULL DEFAULT FALSE,
  wallet_address TEXT,
  understands_basepay BOOLEAN NOT NULL DEFAULT FALSE,

  -- Terms & Compliance
  agree_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
  willing_to_comply BOOLEAN NOT NULL DEFAULT FALSE,
  additional_info TEXT,

  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'incomplete')),
  admin_notes TEXT, -- Internal notes for admin review
  rejection_reason TEXT, -- Reason for rejection if applicable

  -- Metadata
  application_source TEXT DEFAULT 'web_form', -- How they applied
  ip_address INET, -- For fraud prevention
  user_agent TEXT, -- Browser info

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes for efficient queries
CREATE INDEX idx_seller_applications_status ON seller_applications(status);
CREATE INDEX idx_seller_applications_created_at ON seller_applications(created_at DESC);
CREATE INDEX idx_seller_applications_email ON seller_applications(email);
CREATE INDEX idx_seller_applications_business_name ON seller_applications(business_name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_seller_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_seller_applications_updated_at
  BEFORE UPDATE ON seller_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_applications_updated_at();

-- Create function to get application statistics
CREATE OR REPLACE FUNCTION get_seller_application_stats()
RETURNS TABLE(
  total_applications BIGINT,
  pending_applications BIGINT,
  under_review_applications BIGINT,
  approved_applications BIGINT,
  rejected_applications BIGINT,
  avg_review_time_days NUMERIC,
  applications_this_month BIGINT,
  applications_last_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_applications,
    COUNT(*) FILTER (WHERE status = 'under_review') as under_review_applications,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_applications,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_applications,
    AVG(EXTRACT(EPOCH FROM (COALESCE(reviewed_at, NOW()) - created_at)) / 86400)::NUMERIC(10,2) as avg_review_time_days,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) as applications_this_month,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '1 month' AND created_at < date_trunc('month', NOW())) as applications_last_month
  FROM seller_applications;
END;
$$ LANGUAGE plpgsql;

-- Create function to update application status
CREATE OR REPLACE FUNCTION update_seller_application_status(
  p_application_id UUID,
  p_new_status TEXT,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  old_status TEXT;
  update_count INTEGER;
BEGIN
  -- Get current status
  SELECT status INTO old_status
  FROM seller_applications
  WHERE id = p_application_id;

  IF old_status IS NULL THEN
    RAISE NOTICE 'Application not found: %', p_application_id;
    RETURN FALSE;
  END IF;

  -- Update the application
  UPDATE seller_applications
  SET
    status = p_new_status,
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    rejection_reason = CASE WHEN p_new_status = 'rejected' THEN p_rejection_reason ELSE NULL END,
    reviewed_at = CASE WHEN p_new_status IN ('approved', 'rejected') THEN NOW() ELSE reviewed_at END,
    approved_at = CASE WHEN p_new_status = 'approved' THEN NOW() ELSE NULL END,
    updated_at = NOW()
  WHERE id = p_application_id;

  GET DIAGNOSTICS update_count = ROW_COUNT;

  IF update_count > 0 THEN
    RAISE NOTICE 'Application % status updated from % to %', p_application_id, old_status, p_new_status;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Failed to update application %', p_application_id;
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT ON seller_applications TO authenticated;
GRANT ALL ON seller_applications TO service_role;
GRANT EXECUTE ON FUNCTION get_seller_application_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_seller_application_stats() TO service_role;
GRANT EXECUTE ON FUNCTION update_seller_application_status(UUID, TEXT, TEXT, TEXT) TO service_role;

-- Create RLS policies
ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own applications
CREATE POLICY "Users can submit seller applications"
ON seller_applications FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view their own applications
CREATE POLICY "Users can view their own applications"
ON seller_applications FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');

-- Service role can do everything (for admin functions)
CREATE POLICY "Service role full access"
ON seller_applications FOR ALL
TO service_role
USING (true);