-- Fix Shopify API key column name
-- Run this in your Supabase SQL editor

-- Step 1: Rename the column from shopify_api_key to shopify_api_key_encrypted
ALTER TABLE stores
RENAME COLUMN shopify_api_key TO shopify_api_key_encrypted;

-- Step 2: Verify the change
SELECT id, name, shopify_store_url, shopify_api_key_encrypted, shopify_integration_status
FROM stores
WHERE shopify_integration_status = 'connected';