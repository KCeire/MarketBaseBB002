-- Fix commission calculation issue identified through debugging
-- This migration addresses the root cause: process_affiliate_conversion function
-- calculating 0 instead of proper commission amounts

-- First, drop the affiliate_earnings view since it depends on commission_amount column
DROP VIEW IF EXISTS affiliate_earnings;

-- Now we can safely alter the commission_amount column type
ALTER TABLE affiliate_clicks
ALTER COLUMN commission_amount TYPE NUMERIC(10,4);

-- Create an improved process_affiliate_conversion function with comprehensive error handling
CREATE OR REPLACE FUNCTION process_affiliate_conversion(
  p_click_id UUID,
  p_order_id TEXT,
  p_order_total NUMERIC
)
RETURNS BOOLEAN AS $$
DECLARE
  calculated_commission NUMERIC(10,4);
  click_exists BOOLEAN;
  current_converted BOOLEAN;
  existing_order_id TEXT;
  update_count INTEGER;
  input_total_numeric NUMERIC(10,4);
BEGIN
  -- Enhanced logging with input validation
  RAISE NOTICE 'COMMISSION CALC: Starting with click_id=%, order_id=%, order_total=%',
    p_click_id, p_order_id, p_order_total;

  -- Validate inputs
  IF p_click_id IS NULL THEN
    RAISE NOTICE 'COMMISSION CALC: ERROR - click_id is NULL';
    RETURN FALSE;
  END IF;

  IF p_order_id IS NULL OR p_order_id = '' THEN
    RAISE NOTICE 'COMMISSION CALC: ERROR - order_id is NULL or empty';
    RETURN FALSE;
  END IF;

  IF p_order_total IS NULL OR p_order_total <= 0 THEN
    RAISE NOTICE 'COMMISSION CALC: ERROR - order_total is NULL or <= 0: %', p_order_total;
    RETURN FALSE;
  END IF;

  -- Ensure order total is properly cast to NUMERIC with precision
  input_total_numeric := p_order_total::NUMERIC(10,4);
  RAISE NOTICE 'COMMISSION CALC: Input total cast to numeric: %', input_total_numeric;

  -- Calculate commission with explicit NUMERIC operations
  calculated_commission := (input_total_numeric * 0.02)::NUMERIC(10,4);

  RAISE NOTICE 'COMMISSION CALC: Calculated commission = % (% * 0.02)',
    calculated_commission, input_total_numeric;

  -- Validate commission calculation
  IF calculated_commission IS NULL OR calculated_commission <= 0 THEN
    RAISE NOTICE 'COMMISSION CALC: ERROR - calculated commission is NULL or <= 0: %', calculated_commission;
    RETURN FALSE;
  END IF;

  -- Check if click exists and current status
  SELECT
    EXISTS(SELECT 1 FROM affiliate_clicks WHERE click_id = p_click_id),
    COALESCE((SELECT converted FROM affiliate_clicks WHERE click_id = p_click_id), FALSE),
    COALESCE((SELECT order_id FROM affiliate_clicks WHERE click_id = p_click_id), '')
  INTO click_exists, current_converted, existing_order_id;

  RAISE NOTICE 'COMMISSION CALC: Click exists=%, currently converted=%, existing_order=%',
    click_exists, current_converted, existing_order_id;

  -- Only proceed if click exists
  IF NOT click_exists THEN
    RAISE NOTICE 'COMMISSION CALC: ERROR - Click does not exist';
    RETURN FALSE;
  END IF;

  -- Check if already converted to this order
  IF current_converted AND existing_order_id = p_order_id THEN
    RAISE NOTICE 'COMMISSION CALC: WARNING - Click already converted to this order';
    RETURN TRUE; -- Not an error, just already processed
  END IF;

  -- Update the click record (allow re-processing if different order)
  UPDATE affiliate_clicks
  SET
    converted = TRUE,
    order_id = p_order_id,
    commission_amount = calculated_commission,
    commission_earned_at = NOW(),
    updated_at = NOW()
  WHERE click_id = p_click_id;

  GET DIAGNOSTICS update_count = ROW_COUNT;

  RAISE NOTICE 'COMMISSION CALC: Updated % rows. Commission amount set to %',
    update_count, calculated_commission;

  -- Verify the update worked
  IF update_count > 0 THEN
    DECLARE
      verify_commission NUMERIC(10,4);
      verify_converted BOOLEAN;
      verify_order_id TEXT;
    BEGIN
      SELECT commission_amount, converted, order_id
      INTO verify_commission, verify_converted, verify_order_id
      FROM affiliate_clicks
      WHERE click_id = p_click_id;

      RAISE NOTICE 'COMMISSION CALC: VERIFICATION - commission_amount=%, converted=%, order_id=%',
        verify_commission, verify_converted, verify_order_id;

      -- Final validation
      IF verify_commission IS NULL OR verify_commission != calculated_commission THEN
        RAISE NOTICE 'COMMISSION CALC: ERROR - Verification failed! Expected %, got %',
          calculated_commission, verify_commission;
        RETURN FALSE;
      END IF;

      RAISE NOTICE 'COMMISSION CALC: SUCCESS - Commission properly set and verified';
      RETURN TRUE;

    END;
  ELSE
    RAISE NOTICE 'COMMISSION CALC: ERROR - No rows were updated';
    RETURN FALSE;
  END IF;

END;
$$ LANGUAGE plpgsql;

-- Update the affiliate_earnings view with better handling
DROP VIEW IF EXISTS affiliate_earnings;

CREATE VIEW affiliate_earnings AS
SELECT
  referrer_fid,
  COUNT(*) as total_clicks,
  COUNT(*) FILTER (WHERE converted = TRUE) as conversions,
  COALESCE(
    SUM(
      CASE
        WHEN converted = TRUE AND commission_amount IS NOT NULL AND commission_amount > 0
        THEN commission_amount::NUMERIC(10,4)
        ELSE 0::NUMERIC(10,4)
      END
    ),
    0::NUMERIC(10,4)
  ) as total_earned,
  COALESCE(
    AVG(commission_amount::NUMERIC(10,4)) FILTER (
      WHERE converted = TRUE AND commission_amount IS NOT NULL AND commission_amount > 0
    ),
    0::NUMERIC(10,4)
  ) as avg_commission,
  MAX(commission_earned_at) as last_earning_date
FROM affiliate_clicks
WHERE referrer_fid IS NOT NULL AND referrer_fid != ''
GROUP BY referrer_fid;

-- Create a test function to validate commission calculations
CREATE OR REPLACE FUNCTION test_commission_calculation(
  p_order_total NUMERIC
)
RETURNS TABLE(
  input_total NUMERIC,
  calculated_commission NUMERIC,
  calculation_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_order_total::NUMERIC(10,4) as input_total,
    (p_order_total::NUMERIC(10,4) * 0.02)::NUMERIC(10,4) as calculated_commission,
    (p_order_total IS NOT NULL AND p_order_total > 0 AND (p_order_total * 0.02) > 0) as calculation_valid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to find and analyze zero-commission conversions
CREATE OR REPLACE FUNCTION find_zero_commission_conversions()
RETURNS TABLE(
  click_id UUID,
  referrer_fid TEXT,
  product_id TEXT,
  order_id TEXT,
  commission_amount NUMERIC,
  commission_earned_at TIMESTAMPTZ,
  order_total NUMERIC,
  expected_commission NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.click_id,
    ac.referrer_fid,
    ac.product_id,
    ac.order_id,
    ac.commission_amount,
    ac.commission_earned_at,
    o.total_amount::NUMERIC(10,4) as order_total,
    (o.total_amount::NUMERIC(10,4) * 0.02)::NUMERIC(10,4) as expected_commission
  FROM affiliate_clicks ac
  LEFT JOIN orders o ON ac.order_id = o.order_reference
  WHERE ac.converted = TRUE
    AND (ac.commission_amount IS NULL OR ac.commission_amount = 0)
    AND o.total_amount IS NOT NULL
    AND o.total_amount > 0
  ORDER BY ac.commission_earned_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION process_affiliate_conversion(UUID, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION process_affiliate_conversion(UUID, TEXT, NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION test_commission_calculation(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION test_commission_calculation(NUMERIC) TO service_role;
GRANT EXECUTE ON FUNCTION find_zero_commission_conversions() TO authenticated;
GRANT EXECUTE ON FUNCTION find_zero_commission_conversions() TO service_role;
GRANT SELECT ON affiliate_earnings TO authenticated;
GRANT SELECT ON affiliate_earnings TO service_role;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_referrer_converted_commission
ON affiliate_clicks(referrer_fid, converted, commission_amount)
WHERE referrer_fid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_order_id
ON affiliate_clicks(order_id)
WHERE order_id IS NOT NULL;