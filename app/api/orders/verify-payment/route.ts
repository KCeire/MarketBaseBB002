// app/api/orders/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface VerifyPaymentRequest {
  orderReference: string;
  transactionId: string;
  testnet?: boolean;
}

interface VerifyPaymentResponse {
  success: boolean;
  paymentStatus?: string;
  orderUpdated?: boolean;
  affiliateProcessed?: boolean;
  error?: string;
}

// Import Base Pay's getPaymentStatus function
import { getPaymentStatus as basePayGetPaymentStatus } from '@base-org/account';

async function getPaymentStatus({ id, testnet = false }: { id: string; testnet?: boolean }) {
  try {
    console.log(`🔍 Checking payment status for transaction: ${id}, testnet: ${testnet}`);

    // Use the actual Base Pay SDK
    const status = await basePayGetPaymentStatus({
      id,
      testnet
    });

    console.log('💳 Base Pay status response:', status);

    // Map Base Pay response to our expected format
    return {
      status: status.status, // 'completed', 'pending', 'failed', etc.
      transactionHash: id,
      completedAt: status.status === 'completed' ? new Date().toISOString() : undefined
    };
  } catch (error) {
    console.error('Error checking payment status with Base Pay:', error);
    throw error;
  }
}

// Helper function to process affiliate attributions for a confirmed order
async function processOrderAffiliateAttributions(
  orderReference: string,
  buyerFid: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderItems: any[]
): Promise<{ processed: number; errors: number }> {
  let processed = 0;
  let errors = 0;

  console.log('🔗 Processing affiliate attributions for confirmed payment:', {
    orderReference,
    buyerFid,
    itemCount: orderItems.length
  });

  // First, try to link any recent anonymous clicks to this FID
  try {
    const linkResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/affiliate/link-fid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorFid: buyerFid }),
    });

    if (linkResponse.ok) {
      const linkResult = await linkResponse.json();
      if (linkResult.linkedClicks > 0) {
        console.log(`✅ Linked ${linkResult.linkedClicks} anonymous clicks to FID ${buyerFid}`);
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to link anonymous clicks:', error);
  }

  // Process each product for affiliate attribution
  for (const item of orderItems) {
    try {
      console.log(`🔍 Processing affiliate attribution for product: ${item.productId}`);

      // Find affiliate click for this specific product
      const { data: affiliateClick, error } = await supabaseAdmin
        .rpc('find_affiliate_click', {
          p_visitor_fid: buyerFid,
          p_product_id: item.productId.toString()
        });

      if (error) {
        console.error(`❌ Error finding affiliate click for product ${item.productId}:`, error);
        errors++;
        continue;
      }

      if (affiliateClick && affiliateClick.length > 0) {
        const click = affiliateClick[0];
        const itemTotal = parseFloat(item.price) * item.quantity;

        console.log(`✅ Found affiliate click for product ${item.productId}:`, {
          clickId: click.click_id,
          referrerFid: click.referrer_fid,
          itemTotal
        });

        // Process the conversion
        const { error: conversionError } = await supabaseAdmin
          .rpc('process_affiliate_conversion', {
            p_click_id: click.click_id,
            p_order_id: orderReference,
            p_order_total: itemTotal
          });

        if (conversionError) {
          console.error(`❌ Error processing affiliate conversion for product ${item.productId}:`, conversionError);
          errors++;
        } else {
          console.log(`💰 Affiliate conversion processed successfully for product ${item.productId}`);
          processed++;
        }
      } else {
        console.log(`ℹ️ No affiliate click found for product ${item.productId} and buyer FID ${buyerFid}`);
      }
    } catch (error) {
      console.error(`Error processing affiliate attribution for product ${item.productId}:`, error);
      errors++;
    }
  }

  console.log(`📊 Affiliate attribution summary: ${processed} processed, ${errors} errors`);
  return { processed, errors };
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyPaymentResponse>> {
  try {
    const body: VerifyPaymentRequest = await request.json();
    const { orderReference, transactionId, testnet = false } = body;

    if (!orderReference || !transactionId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: orderReference and transactionId'
      }, { status: 400 });
    }

    console.log(`🔍 Verifying payment for order ${orderReference}, transaction ${transactionId}`);

    // Step 1: Check payment status with Base Pay
    let paymentData;
    try {
      paymentData = await getPaymentStatus({ id: transactionId, testnet });
      console.log('💳 Payment status from Base Pay:', paymentData);
    } catch (error) {
      console.error('❌ Failed to check payment status:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to verify payment status'
      }, { status: 500 });
    }

    // Step 2: If payment is not completed, return current status
    if (paymentData.status !== 'completed') {
      return NextResponse.json({
        success: true,
        paymentStatus: paymentData.status,
        orderUpdated: false,
        affiliateProcessed: false
      });
    }

    // Step 3: Get order from database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_reference', orderReference)
      .single();

    if (orderError || !order) {
      console.error('❌ Order not found:', orderError);
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    // Step 4: Check if order is already confirmed
    if (order.payment_status === 'confirmed' && order.payment_hash) {
      console.log('ℹ️ Order already confirmed, checking affiliate attribution');

      // Still process affiliate attribution if FID exists and not already processed
      let affiliateResult = { processed: 0, errors: 0 };
      if (order.farcaster_fid) {
        affiliateResult = await processOrderAffiliateAttributions(
          orderReference,
          order.farcaster_fid,
          order.order_items
        );
      }

      return NextResponse.json({
        success: true,
        paymentStatus: 'completed',
        orderUpdated: false,
        affiliateProcessed: affiliateResult.processed > 0
      });
    }

    // Step 5: Update order with payment confirmation
    const updateData = {
      payment_status: 'confirmed' as const,
      payment_hash: paymentData.transactionHash || transactionId,
      payment_completed_at: paymentData.completedAt || new Date().toISOString(),
      order_status: 'confirmed' as const,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('order_reference', orderReference);

    if (updateError) {
      console.error('❌ Failed to update order:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update order'
      }, { status: 500 });
    }

    console.log(`✅ Order ${orderReference} confirmed with payment hash: ${updateData.payment_hash}`);

    // Step 6: Process affiliate attribution if buyer has FID
    let affiliateResult = { processed: 0, errors: 0 };
    if (order.farcaster_fid) {
      affiliateResult = await processOrderAffiliateAttributions(
        orderReference,
        order.farcaster_fid,
        order.order_items
      );
    } else {
      console.log('ℹ️ No Farcaster FID provided, skipping affiliate attribution');
    }

    return NextResponse.json({
      success: true,
      paymentStatus: 'completed',
      orderUpdated: true,
      affiliateProcessed: affiliateResult.processed > 0
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}