-- Fix affiliate_earnings view calculation
-- This migration addresses potential issues with the total_earned calculation

-- Drop and recreate the affiliate_earnings view with better error handling and logging
DROP VIEW IF EXISTS affiliate_earnings;

-- Create an improved affiliate_earnings view with explicit data type handling
CREATE OR REPLACE VIEW affiliate_earnings AS
SELECT
  referrer_fid,
  COUNT(*) as total_clicks,
  COUNT(*) FILTER (WHERE converted = TRUE) as conversions,
  COALESCE(SUM(CASE WHEN converted = TRUE THEN commission_amount ELSE 0 END), 0)::DECIMAL(10,2) as total_earned,
  COALESCE(AVG(commission_amount) FILTER (WHERE converted = TRUE), 0)::DECIMAL(10,2) as avg_commission,
  MAX(commission_earned_at) as last_earning_date
FROM affiliate_clicks
GROUP BY referrer_fid;

-- Add a function to debug affiliate earnings for a specific FID
CREATE OR REPLACE FUNCTION debug_affiliate_earnings(p_referrer_fid TEXT)
RETURNS TABLE(
  debug_info JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT jsonb_build_object(
    'referrer_fid', p_referrer_fid,
    'total_clicks', COUNT(*),
    'converted_clicks', COUNT(*) FILTER (WHERE converted = TRUE),
    'total_commission_sum', COALESCE(SUM(commission_amount), 0),
    'total_earned_calculation', COALESCE(SUM(CASE WHEN converted = TRUE THEN commission_amount ELSE 0 END), 0),
    'avg_commission', COALESCE(AVG(commission_amount) FILTER (WHERE converted = TRUE), 0),
    'last_earning_date', MAX(commission_earned_at),
    'clicks_detail', jsonb_agg(
      jsonb_build_object(
        'click_id', click_id,
        'converted', converted,
        'commission_amount', commission_amount,
        'commission_earned_at', commission_earned_at
      )
    )
  ) as debug_info
  FROM affiliate_clicks
  WHERE referrer_fid = p_referrer_fid
  GROUP BY referrer_fid;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON affiliate_earnings TO authenticated;
GRANT SELECT ON affiliate_earnings TO service_role;
GRANT EXECUTE ON FUNCTION debug_affiliate_earnings(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION debug_affiliate_earnings(TEXT) TO service_role;