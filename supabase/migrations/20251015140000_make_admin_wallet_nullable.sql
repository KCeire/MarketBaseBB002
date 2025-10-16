-- Make admin_wallet nullable since it will be managed via environment variables
-- This allows store creation without requiring wallet storage in database

ALTER TABLE stores ALTER COLUMN admin_wallet DROP NOT NULL;