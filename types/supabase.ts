// types/supabase.ts
export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          order_reference: string;
          customer_wallet: string;
          farcaster_fid?: string | null; // NEW: Farcaster user FID
          farcaster_username?: string | null; // NEW: Farcaster username
          encrypted_customer_data: string;
          order_items: OrderItem[];
          total_amount: number; // Changed from string to number to match DECIMAL(10,2)
          currency: string;
          payment_hash: string | null; // Changed from string to string | null to match schema
          payment_status: 'pending' | 'confirmed' | 'failed' | 'refunded';
          payment_verification_attempts: number;
          created_at: string;
          updated_at: string;
          expires_at: string;
          // Additional fields for admin system
          order_status?: 'confirmed' | 'processing' | 'shipped' | 'delivered';
          transaction_hash?: string;
          payment_completed_at?: string;
          tracking_number?: string;
          tracking_url?: string;
          notes?: string;
        };
        Insert: {
          id?: string;
          order_reference: string;
          customer_wallet: string;
          farcaster_fid?: string | null; // NEW: Farcaster user FID
          farcaster_username?: string | null; // NEW: Farcaster username
          encrypted_customer_data: string;
          order_items: OrderItem[];
          total_amount: number; // Changed from string to number
          currency?: string;
          payment_hash?: string | null; // Changed to allow null
          payment_status?: 'pending' | 'confirmed' | 'failed' | 'refunded';
          payment_verification_attempts?: number;
          created_at?: string;
          updated_at?: string;
          expires_at: string;
          // Additional fields for admin system
          order_status?: 'confirmed' | 'processing' | 'shipped' | 'delivered';
          transaction_hash?: string;
          payment_completed_at?: string;
          tracking_number?: string;
          tracking_url?: string;
          notes?: string;
        };
        Update: {
          id?: string;
          order_reference?: string;
          customer_wallet?: string;
          farcaster_fid?: string | null; // NEW: Farcaster user FID
          farcaster_username?: string | null; // NEW: Farcaster username
          encrypted_customer_data?: string;
          order_items?: OrderItem[];
          total_amount?: number; // Changed from string to number
          currency?: string;
          payment_hash?: string | null; // Changed to allow null
          payment_status?: 'pending' | 'confirmed' | 'failed' | 'refunded';
          payment_verification_attempts?: number;
          created_at?: string;
          updated_at?: string;
          expires_at?: string;
          // Additional fields for admin system
          order_status?: 'confirmed' | 'processing' | 'shipped' | 'delivered';
          transaction_hash?: string;
          payment_completed_at?: string;
          tracking_number?: string;
          tracking_url?: string;
          notes?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          order_id: string | null; // Changed to allow null to match schema
          action: string;
          old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null;
          user_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null; // Changed to allow null and be optional
          action: string;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          action?: string;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          user_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export interface OrderItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  quantity: number;
  image: string;
  sku: string; 
}

export interface CustomerData {
  email: string;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone?: string; // Added for admin system
  };
  billingAddress?: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export interface EncryptedOrderData {
  order_reference: string;
  customer_wallet: string;
  encrypted_customer_data: string;
  order_items: OrderItem[];
  total_amount: string;
  currency: string;
  expires_at: string;
}

export interface PaymentVerificationData {
  payment_hash: string;
  order_reference: string;
  amount: string;
  currency: string;
  customer_wallet: string;
}

// Admin system interfaces
export interface DatabaseOrder {
  id: string;
  order_reference: string;
  customer_wallet: string;
  farcaster_fid?: string | null; // NEW: Farcaster user FID
  farcaster_username?: string | null; // NEW: Farcaster username
  encrypted_customer_data: string;
  order_items: OrderItem[];
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  order_status?: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  transaction_hash?: string;
  payment_completed_at?: string;
  tracking_number?: string;
  tracking_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}
