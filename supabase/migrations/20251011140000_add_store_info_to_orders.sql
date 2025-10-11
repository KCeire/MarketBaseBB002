-- Add store information to orders table
-- Migration: 20251011140000_add_store_info_to_orders

-- Add store_id column to orders table
ALTER TABLE orders
ADD COLUMN store_id TEXT;

-- Add assigned_store column to order items for detailed tracking
-- Note: order_items is a JSONB array, so we'll handle this in application logic

-- Add index for store_id for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);

-- Add index for created_at and store_id combination for admin filtering
CREATE INDEX IF NOT EXISTS idx_orders_store_created ON orders(store_id, created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN orders.store_id IS 'Store identifier for multi-store organization (techwave-electronics, green-oasis-home, etc.)';

-- Update existing orders with store assignments based on product categorization
-- This will be handled by a separate data migration script to avoid blocking the schema change