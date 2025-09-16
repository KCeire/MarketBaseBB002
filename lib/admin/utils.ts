// lib/admin/utils.ts - COMPLETE FIXED VERSION WITH REAL SKUS
import { decryptCustomerData } from '@/lib/encryption';
import { CustomerData } from '@/types/supabase';

export interface DecryptedOrder {
  id: string;
  order_reference: string;
  customer_wallet: string;
  customerData: CustomerData;
  order_items: OrderItem[];
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  payment_hash?: string | null;
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

export interface OrderItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  quantity: number;
  image: string;
  sku: string; // ADDED SKU FIELD - This was missing!
}

export interface CJExportData {
  'Order Number': string;
  'SKU': string;
  'Quantity': number;
  'Product Title': string;
  'Customer Name': string;
  'Address1': string;
  'Address2': string;
  'City': string;
  'Province': string;
  'ZIP': string;
  'Country': string;
  'Email': string;
  'Shipping Phone Number': string;
}

export interface OrderFilters {
  status?: 'pending' | 'confirmed' | 'failed' | 'refunded' | '';
  orderStatus?: 'confirmed' | 'processing' | 'shipped' | 'delivered' | '';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export function decryptOrderForAdmin(encryptedOrder: {
  id: string;
  order_reference: string;
  customer_wallet: string;
  encrypted_customer_data: string;
  order_items: OrderItem[];
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  payment_hash?: string | null;
  order_status?: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  transaction_hash?: string;
  payment_completed_at?: string;
  tracking_number?: string;
  tracking_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
}): DecryptedOrder {
  try {
    const customerData = decryptCustomerData(encryptedOrder.encrypted_customer_data);
    
    return {
      id: encryptedOrder.id,
      order_reference: encryptedOrder.order_reference,
      customer_wallet: encryptedOrder.customer_wallet,
      customerData,
      order_items: encryptedOrder.order_items,
      total_amount: encryptedOrder.total_amount,
      currency: encryptedOrder.currency,
      payment_status: encryptedOrder.payment_status,
      payment_hash: encryptedOrder.payment_hash,
      order_status: encryptedOrder.order_status || 'confirmed',
      transaction_hash: encryptedOrder.transaction_hash,
      payment_completed_at: encryptedOrder.payment_completed_at,
      tracking_number: encryptedOrder.tracking_number,
      tracking_url: encryptedOrder.tracking_url,
      notes: encryptedOrder.notes,
      created_at: encryptedOrder.created_at,
      updated_at: encryptedOrder.updated_at,
      expires_at: encryptedOrder.expires_at,
    };
  } catch (error) {
    throw new Error(`Failed to decrypt order ${encryptedOrder.order_reference}: ${error}`);
  }
}

    export function convertOrdersToCJFormat(orders: DecryptedOrder[]): CJExportData[] {
        const cjData: CJExportData[] = [];

        orders.forEach(order => {
        console.log('Processing order:', order.order_reference);
        order.order_items.forEach(item => {
        console.log('Item SKU:', item.sku, 'Product:', item.title);
        
      cjData.push({
        'Order Number': order.order_reference,
        'SKU': item.sku, // ✅ FIXED - Use real SKU from order item instead of generating fake one
        'Quantity': item.quantity,
        'Product Title': item.title,
        'Customer Name': order.customerData.shippingAddress.name,
        'Address1': order.customerData.shippingAddress.address1,
        'Address2': order.customerData.shippingAddress.address2 || '',
        'City': order.customerData.shippingAddress.city,
        'Province': order.customerData.shippingAddress.state,
        'ZIP': order.customerData.shippingAddress.zipCode,
        'Country': order.customerData.shippingAddress.country,
        'Email': order.customerData.email,
        'Shipping Phone Number': order.customerData.shippingAddress.phone || '',
      });
    });
  });

  return cjData;
}

export function filterOrders(orders: DecryptedOrder[], filters: OrderFilters): DecryptedOrder[] {
  return orders.filter(order => {
    // Payment status filter - Check if filter is set and not empty
    if (filters.status && filters.status.length > 0 && order.payment_status !== filters.status) {
      return false;
    }

    // Order status filter - Check if filter is set and not empty
    if (filters.orderStatus && filters.orderStatus.length > 0 && order.order_status !== filters.orderStatus) {
      return false;
    }

    if (filters.dateFrom) {
      const orderDate = new Date(order.created_at);
      const fromDate = new Date(filters.dateFrom);
      if (orderDate < fromDate) {
        return false;
      }
    }

    if (filters.dateTo) {
      const orderDate = new Date(order.created_at);
      const toDate = new Date(filters.dateTo);
      toDate.setDate(toDate.getDate() + 1);
      if (orderDate >= toDate) {
        return false;
      }
    }

    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase();
      const matchesOrderRef = order.order_reference.toLowerCase().includes(searchTerm);
      const matchesCustomerName = order.customerData.shippingAddress.name.toLowerCase().includes(searchTerm);
      const matchesEmail = order.customerData.email.toLowerCase().includes(searchTerm);
      
      if (!matchesOrderRef && !matchesCustomerName && !matchesEmail) {
        return false;
      }
    }

    return true;
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatWalletAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'delivered':
      return 'text-green-600 bg-green-100';
    case 'processing':
    case 'shipped':
      return 'text-blue-600 bg-blue-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
    case 'refunded':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function validateOrdersForExport(orders: DecryptedOrder[]): {
  valid: DecryptedOrder[];
  invalid: DecryptedOrder[];
  errors: string[];
} {
  const valid: DecryptedOrder[] = [];
  const invalid: DecryptedOrder[] = [];
  const errors: string[] = [];

  orders.forEach(order => {
    if (order.payment_status !== 'confirmed') {
      invalid.push(order);
      errors.push(`Order ${order.order_reference}: Payment not confirmed`);
    } else if (!order.customerData.shippingAddress.name.trim()) {
      invalid.push(order);
      errors.push(`Order ${order.order_reference}: Missing customer name`);
    } else if (!order.customerData.email.trim()) {
      invalid.push(order);
      errors.push(`Order ${order.order_reference}: Missing customer email`);
    } else if (!order.customerData.shippingAddress.address1.trim()) {
      invalid.push(order);
      errors.push(`Order ${order.order_reference}: Missing shipping address`);
    } else {
      valid.push(order);
    }
  });

  return { valid, invalid, errors };
}
