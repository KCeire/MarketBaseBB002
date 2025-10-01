// app/api/orders/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { decryptCustomerData } from '@/lib/encryption';
import { CustomerData, OrderItem } from '@/types/supabase';

interface UserOrder {
  id: string;
  order_reference: string;
  customer_wallet: string;
  farcaster_fid?: string | null;
  farcaster_username?: string | null;
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

interface UserOrdersResponse {
  success: boolean;
  orders?: UserOrder[];
  total?: number;
  error?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<UserOrdersResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const paymentStatus = searchParams.get('paymentStatus');
    const orderStatus = searchParams.get('orderStatus');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      );
    }

    console.log('User orders request:', {
      wallet: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      paymentStatus,
      orderStatus,
      limit,
      offset
    });

    // Build query for user's orders
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_wallet', walletAddress)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus);
    }

    if (orderStatus && orderStatus !== 'all') {
      query = query.eq('order_status', orderStatus);
    }

    const { data: encryptedOrders, error: fetchError } = await query;

    if (fetchError) {
      console.error('Database fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    if (!encryptedOrders || encryptedOrders.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0
      });
    }

    // Decrypt orders for user
    const userOrders: UserOrder[] = [];
    const decryptionErrors: string[] = [];

    for (const encryptedOrder of encryptedOrders) {
      try {
        const customerData = decryptCustomerData(encryptedOrder.encrypted_customer_data);

        const userOrder: UserOrder = {
          id: encryptedOrder.id,
          order_reference: encryptedOrder.order_reference,
          customer_wallet: encryptedOrder.customer_wallet,
          farcaster_fid: encryptedOrder.farcaster_fid,
          farcaster_username: encryptedOrder.farcaster_username,
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

        userOrders.push(userOrder);
      } catch (error) {
        console.error(`Failed to decrypt order ${encryptedOrder.order_reference}:`, error);
        decryptionErrors.push(encryptedOrder.order_reference);
      }
    }

    if (decryptionErrors.length > 0) {
      console.warn('Orders with decryption errors:', decryptionErrors);
    }

    console.log('User orders fetched:', {
      wallet: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      total: userOrders.length,
      decryptionErrors: decryptionErrors.length
    });

    return NextResponse.json({
      success: true,
      orders: userOrders,
      total: userOrders.length
    });

  } catch (error) {
    console.error('User orders API error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}