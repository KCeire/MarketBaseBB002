-- Remove crypto_experience column from seller_applications table
-- This migration removes the crypto_experience column that's no longer needed

-- Drop the crypto_experience column if it exists
ALTER TABLE seller_applications
DROP COLUMN IF EXISTS crypto_experience;