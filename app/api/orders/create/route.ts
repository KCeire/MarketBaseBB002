// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { OrderItem, CustomerData } from '@/types/supabase';
import { 
  encryptCustomerData, 
  generateOrderReference, 
  validateCustomerData,
  sanitizeForLogging 
} from '@/lib/encryption';

// Temporary debug - remove after fixing
console.log('Environment check:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'LOADED' : 'MISSING',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'LOADED' : 'MISSING', 
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'LOADED' : 'MISSING',
  serviceKeyStart: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10) || 'UNDEFINED'
});

interface CreateOrderRequest {
  customerData: CustomerData;
  orderItems: OrderItem[];
  totalAmount: string;
  customerWallet: string;
}

interface CreateOrderResponse {
  success: boolean;
  orderReference?: string;
  orderId?: string;
  totalAmount?: number;
  currency?: string;
  expiresAt?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<CreateOrderResponse>> {
  try {
    // Parse request body
    const body: CreateOrderRequest = await request.json();
    const { customerData, orderItems, totalAmount, customerWallet } = body;

    // Validate required fields
    if (!customerData || !orderItems || !totalAmount || !customerWallet) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate customer data structure
    if (!validateCustomerData(customerData)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer data format' },
        { status: 400 }
      );
    }

    // Validate order items
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Convert totalAmount string to number for database (DECIMAL field expects number)
    const totalAmountNumber = parseFloat(totalAmount);
    if (isNaN(totalAmountNumber) || totalAmountNumber <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid total amount' },
        { status: 400 }
      );
    }

    // Generate order reference and encrypt customer data
    const orderReference = generateOrderReference();
    const encryptedCustomerData = encryptCustomerData(customerData);

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Prepare order data for database
    const orderData = {
      order_reference: orderReference,
      customer_wallet: customerWallet,
      encrypted_customer_data: encryptedCustomerData,
      order_items: orderItems,
      total_amount: totalAmountNumber, // Use number for DECIMAL field
      currency: 'USDC',
      payment_status: 'pending' as const,
      expires_at: expiresAt,
    };

    console.log('Attempting to insert order:', sanitizeForLogging(orderData as Record<string, unknown>));

    // Insert order into database with explicit type casting to bypass Supabase type inference
    const { data: insertedOrder, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert(orderData as Record<string, unknown>) // Explicit cast to bypass type inference issues
      .select('id, order_reference, total_amount, currency, expires_at')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { success: false, error: `Failed to create order: ${insertError.message}` },
        { status: 500 }
      );
    }

    if (!insertedOrder) {
      return NextResponse.json(
        { success: false, error: 'Order creation failed - no data returned' },
        { status: 500 }
      );
    }

    // Cast the result to a known type
    const typedOrder = insertedOrder as {
      id: string;
      order_reference: string;
      total_amount: number;
      currency: string;
      expires_at: string;
    };

    // Log order creation success
    console.log('Order created successfully:', {
      orderReference: typedOrder.order_reference,
      orderId: typedOrder.id,
      totalAmount: typedOrder.total_amount,
      currency: typedOrder.currency,
      itemCount: orderItems.length,
      customerWallet: customerWallet ? `${customerWallet.slice(0, 6)}...${customerWallet.slice(-4)}` : '[MISSING]',
      expiresAt: typedOrder.expires_at
    });

    // Return success response
    return NextResponse.json({
      success: true,
      orderReference: typedOrder.order_reference,
      orderId: typedOrder.id,
      totalAmount: typedOrder.total_amount,
      currency: typedOrder.currency,
      expiresAt: typedOrder.expires_at
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
