// app/api/admin/orders/route.ts - SECURE VERSION WITH SKU SUPPORT
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decryptCustomerData } from '@/lib/encryption';
import { CustomerData } from '@/types/supabase';
import {
  hasAnyAdminAccess,
  isSuperAdmin,
  getUserStores,
  isStoreAdmin
} from '@/lib/admin/stores-config';

// Admin wallet addresses - now using stores-config system


interface OrderItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  quantity: number;
  image: string;
  sku: string; // ADDED SKU FIELD - This was missing!
}

interface DecryptedOrderForClient {
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
  store_id?: string | null;
}

interface OrderFilters {
  status?: 'pending' | 'confirmed' | 'failed' | 'refunded' | '';
  orderStatus?: 'confirmed' | 'processing' | 'shipped' | 'delivered' | '';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  storeId?: string; // NEW: Store-specific filtering
}

interface AdminOrdersRequest {
  adminWallet: string;
  filters?: OrderFilters;
  limit?: number;
  offset?: number;
}

interface AdminOrdersResponse {
  success: boolean;
  orders?: DecryptedOrderForClient[];
  total?: number;
  filtered?: number;
  error?: string;
}

function validateAdminAccess(walletAddress: string, storeId?: string): boolean {
  // Check if user has any admin access first
  if (!hasAnyAdminAccess(walletAddress)) {
    return false;
  }

  // If no specific store requested, any admin access is sufficient
  if (!storeId) {
    return true;
  }

  // For specific store access, check super admin or store admin permissions
  return isSuperAdmin(walletAddress) || isStoreAdmin(walletAddress, storeId);
}

function decryptOrderForAdmin(encryptedOrder: {
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
  store_id?: string | null;
}): DecryptedOrderForClient {
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
      store_id: encryptedOrder.store_id,
    };
  } catch (error) {
    throw new Error(`Failed to decrypt order ${encryptedOrder.order_reference}: ${error}`);
  }
}

function filterOrders(orders: DecryptedOrderForClient[], filters: OrderFilters): DecryptedOrderForClient[] {
  return orders.filter(order => {
    // Store filter
    if (filters.storeId && filters.storeId.length > 0 && order.store_id !== filters.storeId) {
      return false;
    }

    // Payment status filter
    if (filters.status && filters.status.length > 0 && order.payment_status !== filters.status) {
      return false;
    }

    // Order status filter
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

export async function POST(request: NextRequest): Promise<NextResponse<AdminOrdersResponse>> {
  try {
    const body: AdminOrdersRequest = await request.json();
    const { adminWallet, filters = {}, limit = 100, offset = 0 } = body;

    // Validate admin access
    if (!adminWallet || !validateAdminAccess(adminWallet, filters?.storeId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Validate pagination parameters
    const validLimit = Math.min(Math.max(1, limit), 1000);
    const validOffset = Math.max(0, offset);

    console.log('Admin orders request:', {
      adminWallet: `${adminWallet.slice(0, 6)}...${adminWallet.slice(-4)}`,
      filters: filters,
      limit: validLimit,
      offset: validOffset
    });

    // Build query with store filtering if specified
    let query = supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' });

    // Apply store filtering at database level for performance
    if (filters.storeId) {
      if (filters.storeId === 'unassigned') {
        // Show only unassigned orders (null store_id)
        query = query.is('store_id', null);
      } else {
        // Show orders for specific store
        query = query.eq('store_id', filters.storeId);
      }
    } else if (!isSuperAdmin(adminWallet)) {
      // If not super admin, only show orders from their accessible stores
      const userStores = getUserStores(adminWallet);
      const storeIds = userStores.map(store => store.id);
      if (storeIds.length > 0) {
        query = query.in('store_id', storeIds);
      } else {
        // User has no store access, return empty result
        return NextResponse.json({
          success: true,
          orders: [],
          total: 0,
          filtered: 0
        });
      }
    }
    // Note: If super admin and no storeId filter, show all orders including unassigned

    // Apply pagination and ordering
    const { data: encryptedOrders, error: fetchError, count } = await query
      .order('created_at', { ascending: false })
      .range(validOffset, validOffset + validLimit - 1);

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!encryptedOrders) {
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0,
        filtered: 0
      });
    }

    // Decrypt all orders SERVER-SIDE
    const decryptedOrders: DecryptedOrderForClient[] = [];
    const decryptionErrors: string[] = [];

    for (const encryptedOrder of encryptedOrders) {
      try {
        const decryptedOrder = decryptOrderForAdmin(encryptedOrder);
        decryptedOrders.push(decryptedOrder);
      } catch (error) {
        console.error(`Failed to decrypt order ${encryptedOrder.order_reference}:`, error);
        decryptionErrors.push(encryptedOrder.order_reference);
      }
    }

    // Apply filters to decrypted orders
    const filteredOrders = filterOrders(decryptedOrders, filters);

    // Log successful request
    console.log('Admin orders fetched:', {
      total: count || encryptedOrders.length,
      decrypted: decryptedOrders.length,
      filtered: filteredOrders.length,
      decryptionErrors: decryptionErrors.length
    });

    if (decryptionErrors.length > 0) {
      console.warn('Orders with decryption errors:', decryptionErrors);
    }

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      total: count || encryptedOrders.length,
      filtered: filteredOrders.length
    });

  } catch (error) {
    console.error('Admin orders API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for simpler requests without filters
export async function GET(request: NextRequest): Promise<NextResponse<AdminOrdersResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const adminWallet = searchParams.get('adminWallet');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!adminWallet) {
      return NextResponse.json(
        { success: false, error: 'Missing adminWallet parameter' },
        { status: 400 }
      );
    }

    // Use POST logic with empty filters
    const postBody: AdminOrdersRequest = {
      adminWallet,
      filters: {},
      limit,
      offset
    };

    // Create a new request object for the POST method
    const postRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(postBody)
    });

    return POST(postRequest);

  } catch (error) {
    console.error('Admin orders GET error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}