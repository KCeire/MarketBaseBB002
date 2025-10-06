-- Debug and fix commission calculation in process_affiliate_conversion function
-- This migration adds detailed logging to understand why commission_amount is 0

-- Create a debug version of the process_affiliate_conversion function
CREATE OR REPLACE FUNCTION process_affiliate_conversion(
  p_click_id UUID,
  p_order_id TEXT,
  p_order_total DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  calculated_commission DECIMAL;
  click_exists BOOLEAN;
  current_converted BOOLEAN;
  update_count INTEGER;
BEGIN
  -- Debug logging: Input parameters
  RAISE NOTICE 'COMMISSION DEBUG: Starting conversion with click_id=%, order_id=%, order_total=%',
    p_click_id, p_order_id, p_order_total;

  -- Calculate 2% commission
  calculated_commission := p_order_total * 0.02;

  -- Debug logging: Calculated commission
  RAISE NOTICE 'COMMISSION DEBUG: Calculated commission = % (% * 0.02)',
    calculated_commission, p_order_total;

  -- Check if click exists and current status
  SELECT EXISTS(SELECT 1 FROM affiliate_clicks WHERE click_id = p_click_id),
         COALESCE((SELECT converted FROM affiliate_clicks WHERE click_id = p_click_id), FALSE)
  INTO click_exists, current_converted;

  RAISE NOTICE 'COMMISSION DEBUG: Click exists=%, currently converted=%',
    click_exists, current_converted;

  -- Update the click record
  UPDATE affiliate_clicks
  SET
    converted = TRUE,
    order_id = p_order_id,
    commission_amount = calculated_commission,
    commission_earned_at = NOW(),
    updated_at = NOW()
  WHERE click_id = p_click_id
    AND converted = FALSE;  -- Ensure we don't double-convert

  GET DIAGNOSTICS update_count = ROW_COUNT;

  RAISE NOTICE 'COMMISSION DEBUG: Updated % rows. Commission amount set to %',
    update_count, calculated_commission;

  -- Verify the update worked
  IF update_count > 0 THEN
    DECLARE
      verify_commission DECIMAL;
      verify_converted BOOLEAN;
    BEGIN
      SELECT commission_amount, converted
      INTO verify_commission, verify_converted
      FROM affiliate_clicks
      WHERE click_id = p_click_id;

      RAISE NOTICE 'COMMISSION DEBUG: Verification - commission_amount=%, converted=%',
        verify_commission, verify_converted;
    END;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION process_affiliate_conversion(UUID, TEXT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION process_affiliate_conversion(UUID, TEXT, DECIMAL) TO service_role;