// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decryptOrderForAdmin, filterOrders, OrderFilters, DecryptedOrder } from '@/lib/admin/utils';

// Admin wallet addresses for validation
const ADMIN_ADDRESSES = [
  '0xdE2bDb0F443CAda8102A73940CC8E27079c513D4',
  '0xE3E64A95AF29827125D43f4091A3b1e76611aF9A',
  '0xe72421aE2B79b21AF3550d8f6adF19b67ccCBc8B',
  '0xE40b9f2A321715DF69EF67AD30BA7453A289BCeB'
];

interface AdminOrdersRequest {
  adminWallet: string;
  filters?: OrderFilters;
  limit?: number;
  offset?: number;
}

interface AdminOrdersResponse {
  success: boolean;
  orders?: DecryptedOrder[];
  total?: number;
  filtered?: number;
  error?: string;
}

function validateAdminAccess(walletAddress: string): boolean {
  return ADMIN_ADDRESSES.some(
    adminAddr => adminAddr.toLowerCase() === walletAddress.toLowerCase()
  );
}

export async function POST(request: NextRequest): Promise<NextResponse<AdminOrdersResponse>> {
  try {
    const body: AdminOrdersRequest = await request.json();
    const { adminWallet, filters = {}, limit = 100, offset = 0 } = body;

    // Validate admin access
    if (!adminWallet || !validateAdminAccess(adminWallet)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Validate pagination parameters
    const validLimit = Math.min(Math.max(1, limit), 1000); // Max 1000 orders at once
    const validOffset = Math.max(0, offset);

    console.log('Admin orders request:', {
      adminWallet: `${adminWallet.slice(0, 6)}...${adminWallet.slice(-4)}`,
      filters: filters,
      limit: validLimit,
      offset: validOffset
    });

    // Fetch orders from database with pagination
    const { data: encryptedOrders, error: fetchError, count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
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

    // Decrypt all orders
    const decryptedOrders: DecryptedOrder[] = [];
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
