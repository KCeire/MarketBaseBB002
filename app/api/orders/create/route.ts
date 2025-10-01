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

// Helper function to process affiliate attributions for multiple products in an order
async function processAffiliateAttributions(
  buyerFid: string,
  orderItems: OrderItem[],
  orderReference: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _totalOrderAmount: number
): Promise<void> {
  const affiliateConversions: Array<{
    clickId: string;
    referrerFid: string;
    commissionAmount: number;
    productId: string;
  }> = [];

  // Process each product in the order for affiliate attribution
  for (const item of orderItems) {
    try {
      // Find affiliate click for this specific product
      const { data: affiliateClick, error } = await supabaseAdmin
        .rpc('find_affiliate_click', {
          p_visitor_fid: buyerFid,
          p_product_id: item.productId.toString() // Ensure string format
        });

      if (error) {
        console.error(`Error finding affiliate click for product ${item.productId}:`, error);
        continue;
      }

      if (affiliateClick && affiliateClick.length > 0) {
        const click = affiliateClick[0];

        // Calculate commission for this specific item (2% of item total)
        const itemTotal = parseFloat(item.price) * item.quantity;
        const commissionAmount = itemTotal * 0.02; // 2% commission

        // Process the conversion
        const { error: conversionError } = await supabaseAdmin
          .rpc('process_affiliate_conversion', {
            p_click_id: click.click_id,
            p_order_id: orderReference,
            p_order_total: itemTotal // Use item total, not full order total
          });

        if (conversionError) {
          console.error(`Error processing affiliate conversion for product ${item.productId}:`, conversionError);
        } else {
          affiliateConversions.push({
            clickId: click.click_id,
            referrerFid: click.referrer_fid,
            commissionAmount,
            productId: item.productId.toString()
          });

          console.log(`💰 Affiliate commission earned:`, {
            orderReference,
            productId: item.productId,
            productTitle: item.title,
            referrerFid: click.referrer_fid,
            buyerFid,
            itemTotal: itemTotal.toFixed(2),
            commissionAmount: commissionAmount.toFixed(4),
            commissionRate: '2%'
          });
        }
      }
    } catch (error) {
      console.error(`Error processing affiliate attribution for product ${item.productId}:`, error);
    }
  }

  // Log summary of affiliate attributions for this order
  if (affiliateConversions.length > 0) {
    const totalCommissions = affiliateConversions.reduce((sum, conv) => sum + conv.commissionAmount, 0);
    const uniqueReferrers = [...new Set(affiliateConversions.map(conv => conv.referrerFid))];

    console.log(`📊 Affiliate attribution summary for order ${orderReference}:`, {
      totalProducts: orderItems.length,
      productsWithAffiliates: affiliateConversions.length,
      totalCommissions: totalCommissions.toFixed(4),
      uniqueReferrers,
      conversions: affiliateConversions
    });
  }
}

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
  farcasterFid?: string; // NEW: Optional Farcaster FID
  farcasterUsername?: string; // NEW: Optional Farcaster username
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
    const { customerData, orderItems, totalAmount, customerWallet, farcasterFid, farcasterUsername } = body;

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
      farcaster_fid: farcasterFid || null, // NEW: Store FID if available
      farcaster_username: farcasterUsername || null, // NEW: Store username if available
      encrypted_customer_data: encryptedCustomerData,
      order_items: orderItems,
      total_amount: totalAmountNumber, // Use number for DECIMAL field
      currency: 'USDC',
      payment_status: 'pending' as const,
      expires_at: expiresAt,
    };

    // Debug: Check if SKUs are present in order items
    console.log('Order items with SKUs:', orderItems.map(item => ({
      title: item.title,
      sku: item.sku,
      productId: item.productId,
      variantId: item.variantId
    })));

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
      farcasterFid: farcasterFid || 'No FID',
      farcasterUsername: farcasterUsername || 'No username',
      expiresAt: typedOrder.expires_at
    });

    // Process affiliate attribution if user has FID and has ordered multiple products
    if (farcasterFid) {
      try {
        await processAffiliateAttributions(
          farcasterFid,
          orderItems,
          typedOrder.order_reference,
          typedOrder.total_amount
        );
      } catch (affiliateError) {
        // Log but don't fail the order if affiliate processing fails
        console.error('Affiliate attribution error (non-blocking):', affiliateError);
      }
    }

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
