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

    // Based on Base Pay docs, getPaymentStatus only returns { status }
    // The payment id itself might be the transaction hash, or we need to handle differently
    // For now, we'll use the id as the transaction hash and log everything for debugging
    console.log('🔍 Payment verification details:', {
      providedId: id,
      statusResponse: status,
      statusType: typeof status,
      statusKeys: Object.keys(status || {}),
      timestamp: new Date().toISOString()
    });

    // Map Base Pay response to our expected format
    return {
      status: status.status, // 'completed', 'pending', 'failed', etc.
      transactionHash: id, // Use the payment ID as transaction hash for now
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

  console.log('🔗 AFFILIATE PROCESSING START: Processing affiliate attributions for confirmed payment:', {
    orderReference,
    buyerFid,
    itemCount: orderItems?.length || 0,
    timestamp: new Date().toISOString()
  });

  // First, try to link any recent anonymous clicks to this FID
  console.log('🔗 AFFILIATE STEP A: Attempting to link anonymous clicks to FID...');
  try {
    // Import and call the shared function from utility file
    const { linkAnonymousClicksToFid } = await import('@/lib/affiliate-link-utils');
    const linkResult = await linkAnonymousClicksToFid(buyerFid);

    console.log(`✅ AFFILIATE STEP A SUCCESS: Link result:`, linkResult);
    if (linkResult.success && linkResult.linkedClicks && linkResult.linkedClicks > 0) {
      console.log(`🔗 AFFILIATE STEP A: Successfully linked ${linkResult.linkedClicks} anonymous clicks to FID ${buyerFid}`);
    } else {
      console.log(`ℹ️ AFFILIATE STEP A: No anonymous clicks found to link for FID ${buyerFid}`);
    }
  } catch (error) {
    console.error('❌ AFFILIATE STEP A ERROR: Failed to link anonymous clicks:', error);
  }

  // Process each product for affiliate attribution
  console.log(`🔗 AFFILIATE STEP B: Processing ${orderItems?.length || 0} items for affiliate attribution...`);

  if (!orderItems || orderItems.length === 0) {
    console.log('⚠️ AFFILIATE STEP B: No order items found to process');
    return { processed, errors };
  }

  for (let i = 0; i < orderItems.length; i++) {
    const item = orderItems[i];
    console.log(`🔍 AFFILIATE STEP B${i + 1}: Processing item ${i + 1}/${orderItems.length}:`, {
      productId: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity
    });

    try {
      // Find affiliate click for this specific product
      console.log(`🔍 AFFILIATE STEP B${i + 1}A: Searching for affiliate click (productId: ${item.productId}, buyerFid: ${buyerFid})`);
      const { data: affiliateClick, error } = await supabaseAdmin
        .rpc('find_affiliate_click', {
          p_visitor_fid: buyerFid,
          p_product_id: item.productId.toString()
        });

      if (error) {
        console.error(`❌ AFFILIATE STEP B${i + 1}A FAILED: Error finding affiliate click for product ${item.productId}:`, {
          error,
          errorCode: error?.code,
          errorMessage: error?.message,
          productId: item.productId,
          buyerFid
        });
        errors++;
        continue;
      }

      console.log(`📋 AFFILIATE STEP B${i + 1}A RESULT: Found ${affiliateClick?.length || 0} affiliate clicks for product ${item.productId}`);

      if (affiliateClick && affiliateClick.length > 0) {
        const click = affiliateClick[0];
        const itemTotal = parseFloat(item.price) * item.quantity;

        console.log(`✅ AFFILIATE STEP B${i + 1}B: Found affiliate click for product ${item.productId}:`, {
          clickId: click.click_id,
          referrerFid: click.referrer_fid,
          visitorFid: click.visitor_fid,
          productId: click.product_id,
          clickedAt: click.clicked_at,
          converted: click.converted,
          itemPrice: item.price,
          quantity: item.quantity,
          itemTotal: itemTotal
        });

        // Process the conversion
        console.log(`💰 AFFILIATE STEP B${i + 1}C: Processing conversion for click ${click.click_id}...`);
        const { error: conversionError } = await supabaseAdmin
          .rpc('process_affiliate_conversion', {
            p_click_id: click.click_id,
            p_order_id: orderReference,
            p_order_total: itemTotal
          });

        if (conversionError) {
          console.error(`❌ AFFILIATE STEP B${i + 1}C FAILED: Error processing affiliate conversion for product ${item.productId}:`, {
            error: conversionError,
            errorCode: conversionError?.code,
            errorMessage: conversionError?.message,
            clickId: click.click_id,
            orderReference,
            itemTotal
          });
          errors++;
        } else {
          console.log(`✅ AFFILIATE STEP B${i + 1}C SUCCESS: Affiliate conversion processed successfully for product ${item.productId}`, {
            clickId: click.click_id,
            commissionAmount: itemTotal * 0.02,
            itemTotal
          });
          processed++;
        }
      } else {
        console.log(`ℹ️ AFFILIATE STEP B${i + 1}: No affiliate click found for product ${item.productId} and buyer FID ${buyerFid}`);
      }
    } catch (error) {
      console.error(`❌ AFFILIATE STEP B${i + 1} ERROR: Exception processing affiliate attribution for product ${item.productId}:`, {
        error,
        productId: item.productId,
        buyerFid,
        orderReference
      });
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

    console.log('🚀 Payment verification API called with:', {
      orderReference,
      transactionId,
      testnet,
      timestamp: new Date().toISOString()
    });

    if (!orderReference || !transactionId) {
      console.error('❌ Missing required fields in payment verification request');
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: orderReference and transactionId'
      }, { status: 400 });
    }

    console.log(`🔍 STEP 1: Verifying payment for order ${orderReference}, transaction ${transactionId}`);

    // Step 1: Check payment status with Base Pay
    let paymentData;
    try {
      console.log('📞 Calling Base Pay getPaymentStatus...');
      paymentData = await getPaymentStatus({ id: transactionId, testnet });
      console.log('💳 STEP 1 RESULT: Payment status from Base Pay:', {
        status: paymentData.status,
        transactionHash: paymentData.transactionHash,
        completedAt: paymentData.completedAt
      });
    } catch (error) {
      console.error('❌ STEP 1 FAILED: Failed to check payment status:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to verify payment status'
      }, { status: 500 });
    }

    // Step 2: If payment is not completed, return current status
    if (paymentData.status !== 'completed') {
      console.log(`⏳ STEP 2: Payment not completed yet. Status: ${paymentData.status}`);
      return NextResponse.json({
        success: true,
        paymentStatus: paymentData.status,
        orderUpdated: false,
        affiliateProcessed: false
      });
    }

    console.log('✅ STEP 2: Payment confirmed as completed, proceeding with order update...');

    // Step 3: Get order from database
    console.log(`🔍 STEP 3: Fetching order from database: ${orderReference}`);
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_reference', orderReference)
      .single();

    if (orderError || !order) {
      console.error('❌ STEP 3 FAILED: Order not found:', {
        orderReference,
        error: orderError,
        errorCode: orderError?.code,
        errorMessage: orderError?.message
      });
      return NextResponse.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    console.log('✅ STEP 3 SUCCESS: Order found:', {
      orderReference: order.order_reference,
      paymentStatus: order.payment_status,
      orderStatus: order.order_status,
      farcasterFid: order.farcaster_fid,
      totalAmount: order.total_amount,
      createdAt: order.created_at
    });

    // Step 4: Check if order is already confirmed
    if (order.payment_status === 'confirmed' && order.payment_hash) {
      console.log('🔄 STEP 4: Order already confirmed, checking affiliate attribution');
      console.log('📋 Order already confirmed details:', {
        paymentHash: order.payment_hash,
        paymentStatus: order.payment_status,
        orderStatus: order.order_status
      });

      // Still process affiliate attribution if FID exists and not already processed
      let affiliateResult = { processed: 0, errors: 0 };
      if (order.farcaster_fid) {
        console.log(`🎯 STEP 4A: Processing affiliate attributions for already confirmed order (FID: ${order.farcaster_fid})`);
        affiliateResult = await processOrderAffiliateAttributions(
          orderReference,
          order.farcaster_fid,
          order.order_items
        );
        console.log(`✅ STEP 4A COMPLETE: Affiliate attribution result:`, affiliateResult);
      } else {
        console.log('ℹ️ STEP 4A SKIPPED: No Farcaster FID found for already confirmed order');
      }

      return NextResponse.json({
        success: true,
        paymentStatus: 'completed',
        orderUpdated: false,
        affiliateProcessed: affiliateResult.processed > 0
      });
    }

    console.log('🔄 STEP 4: Order not yet confirmed, proceeding with confirmation...');

    // Step 5: Update order with payment confirmation
    console.log('🔄 STEP 5: Updating order with payment confirmation...');
    const updateData = {
      payment_status: 'confirmed' as const,
      payment_hash: paymentData.transactionHash || transactionId,
      payment_completed_at: paymentData.completedAt || new Date().toISOString(),
      order_status: 'confirmed' as const,
      updated_at: new Date().toISOString()
    };

    console.log('📝 STEP 5: Order update data:', updateData);

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('order_reference', orderReference);

    if (updateError) {
      console.error('❌ STEP 5 FAILED: Failed to update order:', {
        orderReference,
        error: updateError,
        errorCode: updateError?.code,
        errorMessage: updateError?.message,
        updateData
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to update order'
      }, { status: 500 });
    }

    console.log(`✅ STEP 5 SUCCESS: Order ${orderReference} confirmed with payment hash: ${updateData.payment_hash}`);

    // Step 6: Process affiliate attribution if buyer has FID
    console.log('🔄 STEP 6: Starting affiliate attribution processing...');
    let affiliateResult = { processed: 0, errors: 0 };
    if (order.farcaster_fid) {
      console.log(`🎯 STEP 6A: Processing affiliate attributions for FID: ${order.farcaster_fid}`);
      console.log('📋 Order items to process:', order.order_items);
      affiliateResult = await processOrderAffiliateAttributions(
        orderReference,
        order.farcaster_fid,
        order.order_items
      );
      console.log(`✅ STEP 6A COMPLETE: Final affiliate attribution result:`, {
        processed: affiliateResult.processed,
        errors: affiliateResult.errors,
        totalItems: order.order_items?.length || 0
      });
    } else {
      console.log('ℹ️ STEP 6 SKIPPED: No Farcaster FID provided, skipping affiliate attribution');
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