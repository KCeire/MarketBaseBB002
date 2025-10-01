-- Create affiliate_clicks table for tracking referral links and conversions
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  click_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_fid TEXT NOT NULL,           -- FID of user who shared the link
  visitor_fid TEXT,                     -- FID of user who clicked (null until they connect)
  product_id TEXT NOT NULL,             -- Product being shared
  clicked_at TIMESTAMP DEFAULT NOW(),   -- When the link was first clicked
  expires_at TIMESTAMP NOT NULL,        -- clicked_at + 30 days
  last_clicked_at TIMESTAMP,            -- For tracking re-clicks (extends window)
  converted BOOLEAN DEFAULT FALSE,      -- Whether this click resulted in a purchase
  order_id TEXT,                        -- Reference to the order that converted
  commission_amount DECIMAL(10,2),      -- 2% of order value
  commission_earned_at TIMESTAMP,       -- When commission was earned
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_referrer_fid ON affiliate_clicks(referrer_fid);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_visitor_fid ON affiliate_clicks(visitor_fid);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product_id ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_expires_at ON affiliate_clicks(expires_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_converted ON affiliate_clicks(converted);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_visitor_product ON affiliate_clicks(visitor_fid, product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_active ON affiliate_clicks(expires_at, converted) WHERE expires_at > NOW() AND converted = FALSE;

-- Row Level Security (RLS)
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own referral data
CREATE POLICY "Users can view their own referrals" ON affiliate_clicks
  FOR SELECT USING (
    referrer_fid = current_setting('app.current_user_fid', true) OR
    visitor_fid = current_setting('app.current_user_fid', true)
  );

-- Policy: System can insert/update click records
CREATE POLICY "System can manage click records" ON affiliate_clicks
  FOR ALL USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_affiliate_clicks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_affiliate_clicks_updated_at
  BEFORE UPDATE ON affiliate_clicks
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_clicks_updated_at();

-- Helper function to find valid affiliate clicks for a purchase
CREATE OR REPLACE FUNCTION find_affiliate_click(
  p_visitor_fid TEXT,
  p_product_id TEXT
)
RETURNS TABLE(
  click_id UUID,
  referrer_fid TEXT,
  commission_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.click_id,
    ac.referrer_fid,
    0.02::DECIMAL as commission_rate  -- 2% commission
  FROM affiliate_clicks ac
  WHERE ac.visitor_fid = p_visitor_fid
    AND ac.product_id = p_product_id
    AND ac.expires_at > NOW()
    AND ac.converted = FALSE
    AND ac.referrer_fid != p_visitor_fid  -- Prevent self-referral
  ORDER BY ac.last_clicked_at DESC NULLS LAST, ac.clicked_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Helper function to calculate commission and mark as converted
CREATE OR REPLACE FUNCTION process_affiliate_conversion(
  p_click_id UUID,
  p_order_id TEXT,
  p_order_total DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  commission_amount DECIMAL;
BEGIN
  -- Calculate 2% commission
  commission_amount := p_order_total * 0.02;

  -- Update the click record
  UPDATE affiliate_clicks
  SET
    converted = TRUE,
    order_id = p_order_id,
    commission_amount = commission_amount,
    commission_earned_at = NOW(),
    updated_at = NOW()
  WHERE click_id = p_click_id
    AND converted = FALSE;  -- Ensure we don't double-convert

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- View for affiliate earnings summary
CREATE OR REPLACE VIEW affiliate_earnings AS
SELECT
  referrer_fid,
  COUNT(*) as total_clicks,
  COUNT(*) FILTER (WHERE converted = TRUE) as conversions,
  COALESCE(SUM(commission_amount), 0) as total_earned,
  COALESCE(AVG(commission_amount) FILTER (WHERE converted = TRUE), 0) as avg_commission,
  MAX(commission_earned_at) as last_earning_date
FROM affiliate_clicks
GROUP BY referrer_fid;

-- Grant necessary permissions
GRANT ALL ON affiliate_clicks TO authenticated;
GRANT ALL ON affiliate_clicks TO service_role;
GRANT SELECT ON affiliate_earnings TO authenticated;
GRANT SELECT ON affiliate_earnings TO service_role;