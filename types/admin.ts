// types/admin.ts - FIXED VERSION
export interface AdminUser {
  walletAddress: string;
  isAuthenticated: boolean;
  permissions: AdminPermission[];
}

export interface AdminPermission {
  action: 'view_orders' | 'export_orders' | 'update_order_status' | 'manage_users';
  granted: boolean;
}

export interface OrderUpdateRequest {
  orderIds: string[];
  updates: {
    order_status?: 'confirmed' | 'processing' | 'shipped' | 'delivered';
    tracking_number?: string;
    tracking_url?: string;
    notes?: string;
  };
  adminWallet: string;
}

export interface ExportValidationResult {
  validOrderIds: string[];
  invalidOrderIds: string[];
  validationErrors: ValidationError[];
  totalValid: number;
  totalInvalid: number;
}

export interface ValidationError {
  orderId: string;
  orderReference: string;
  error: string;
  severity: 'warning' | 'error';
}

export interface AdminStats {
  totalOrders: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  ordersAwaitingProcessing: number;
  ordersInProcessing: number;
  ordersShipped: number;
  ordersDelivered: number;
  totalRevenue: number;
  revenueThisMonth: number;
}

export interface CJOrderStatus {
  orderId: string;
  cjOrderId?: string;
  status: 'exported' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  trackingUrl?: string;
  exportedAt?: string;
  lastUpdated?: string;
}

// Database order interface for admin use
export interface DatabaseOrder {
  id: string;
  order_reference: string;
  customer_wallet: string;
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

interface OrderItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  quantity: number;
  image: string;
}
