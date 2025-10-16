-- Create stores table for managing seller stores
-- This migration creates the infrastructure for dynamic store management

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY, -- Store ID (e.g., 'techwave-electronics')
  name TEXT NOT NULL, -- Display name (e.g., 'TechWave Electronics')
  slug TEXT NOT NULL UNIQUE, -- URL slug (e.g., 'techwave-electronics')
  description TEXT DEFAULT '', -- Store description

  -- Store status and configuration
  is_active BOOLEAN NOT NULL DEFAULT FALSE, -- Whether store is live in marketplace
  admin_wallet TEXT NOT NULL, -- Primary admin wallet address

  -- Store settings (JSON object)
  settings JSONB NOT NULL DEFAULT '{
    "allowOrderManagement": true,
    "allowProductManagement": true,
    "allowAnalytics": true
  }'::jsonb,

  -- Shopify integration (optional)
  shopify_store_url TEXT, -- e.g., 'mystore.myshopify.com'
  shopify_api_key TEXT, -- Encrypted Shopify API key
  shopify_integration_status TEXT DEFAULT 'not_connected' CHECK (
    shopify_integration_status IN ('not_connected', 'connected', 'error', 'syncing')
  ),

  -- Store branding and customization
  logo_url TEXT,
  banner_url TEXT,
  theme_colors JSONB DEFAULT '{}'::jsonb,

  -- Business information
  business_email TEXT,
  business_phone TEXT,
  business_address TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_admin_wallet CHECK (admin_wallet ~* '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$'),
  CONSTRAINT valid_store_id CHECK (id ~* '^[a-z0-9-]+$')
);

-- Create indexes for efficient queries
CREATE INDEX idx_stores_is_active ON stores(is_active);
CREATE INDEX idx_stores_admin_wallet ON stores(admin_wallet);
CREATE INDEX idx_stores_slug ON stores(slug);
CREATE INDEX idx_stores_created_at ON stores(created_at DESC);
CREATE INDEX idx_stores_shopify_status ON stores(shopify_integration_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_stores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_stores_updated_at();

-- Create function to get store statistics
CREATE OR REPLACE FUNCTION get_store_stats()
RETURNS TABLE(
  total_stores BIGINT,
  active_stores BIGINT,
  inactive_stores BIGINT,
  shopify_connected_stores BIGINT,
  stores_created_this_month BIGINT,
  stores_created_last_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_stores,
    COUNT(*) FILTER (WHERE is_active = true) as active_stores,
    COUNT(*) FILTER (WHERE is_active = false) as inactive_stores,
    COUNT(*) FILTER (WHERE shopify_integration_status = 'connected') as shopify_connected_stores,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) as stores_created_this_month,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '1 month'
                     AND created_at < date_trunc('month', NOW())) as stores_created_last_month
  FROM stores;
END;
$$ LANGUAGE plpgsql;

-- Create function to update store status
CREATE OR REPLACE FUNCTION update_store_status(
  p_store_id TEXT,
  p_is_active BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  update_count INTEGER;
BEGIN
  UPDATE stores
  SET
    is_active = p_is_active,
    updated_at = NOW()
  WHERE id = p_store_id;

  GET DIAGNOSTICS update_count = ROW_COUNT;

  IF update_count > 0 THEN
    RAISE NOTICE 'Store % status updated to %', p_store_id, CASE WHEN p_is_active THEN 'active' ELSE 'inactive' END;
    RETURN TRUE;
  ELSE
    RAISE NOTICE 'Store % not found', p_store_id;
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert existing stores from config (this can be removed after migration)
-- This preserves existing store data during the transition
INSERT INTO stores (id, name, slug, description, is_active, admin_wallet, created_at, updated_at) VALUES
  ('techwave-electronics', 'TechWave Electronics', 'techwave-electronics', 'Electronics and tech gadgets', true, '0x0000000000000000000000000000000000000000', NOW(), NOW()),
  ('green-oasis-home', 'Green Oasis Home', 'green-oasis-home', 'Home and garden products', true, '0x0000000000000000000000000000000000000000', NOW(), NOW()),
  ('pawsome-pets', 'Pawsome Pets', 'pawsome-pets', 'Pet supplies and accessories', true, '0x0000000000000000000000000000000000000000', NOW(), NOW()),
  ('radiant-beauty', 'Radiant Beauty', 'radiant-beauty', 'Beauty and cosmetics', true, '0x0000000000000000000000000000000000000000', NOW(), NOW()),
  ('apex-athletics', 'Apex Athletics', 'apex-athletics', 'Sports and fitness gear', true, '0x0000000000000000000000000000000000000000', NOW(), NOW()),
  ('nft-energy', 'NFT Energy', 'nft-energy', 'Energy drinks and supplements', true, '0x0000000000000000000000000000000000000000', NOW(), NOW())
ON CONFLICT (id) DO NOTHING; -- Don't overwrite if stores already exist

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON stores TO authenticated;
GRANT ALL ON stores TO service_role;
GRANT EXECUTE ON FUNCTION get_store_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_store_stats() TO service_role;
GRANT EXECUTE ON FUNCTION update_store_status(TEXT, BOOLEAN) TO service_role;

-- Create RLS policies
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Allow all users to view active stores
CREATE POLICY "Public can view active stores"
ON stores FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated users to view all stores
CREATE POLICY "Authenticated users can view stores"
ON stores FOR SELECT
TO authenticated
USING (true);

-- Only service role can insert/update stores (admin functions)
CREATE POLICY "Service role can manage stores"
ON stores FOR ALL
TO service_role
USING (true);