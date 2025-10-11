// app/api/orders/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Resend } from 'resend';
import { decryptCustomerData } from '@/lib/encryption';

const resend = new Resend(process.env.RESEND_API_KEY);

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
        console.log(`💰 AFFILIATE STEP B${i + 1}C: Processing conversion for click ${click.click_id}...`, {
          clickId: click.click_id,
          orderReference,
          itemTotal,
          expectedCommission: itemTotal * 0.02,
          rawPrice: item.price,
          parsedPrice: parseFloat(item.price),
          quantity: item.quantity
        });
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

          // Verify the commission was actually set
          const { data: verifyClick, error: verifyError } = await supabaseAdmin
            .from('affiliate_clicks')
            .select('commission_amount, converted, commission_earned_at')
            .eq('click_id', click.click_id)
            .single();

          console.log(`🔍 AFFILIATE STEP B${i + 1}C VERIFY: Commission verification:`, {
            clickId: click.click_id,
            verifyClick,
            verifyError: verifyError?.message
          });
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

// Helper function to send sale notification emails
async function sendSaleNotificationEmails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any,
  paymentHash: string
): Promise<{ adminEmailSent: boolean; customerEmailSent: boolean }> {
  let adminEmailSent = false;
  let customerEmailSent = false;

  console.log('📧 SALE NOTIFICATION: Starting email notifications for order:', {
    orderReference: order.order_reference,
    totalAmount: order.total_amount,
    itemCount: order.order_items?.length || 0,
    timestamp: new Date().toISOString()
  });

  // Send admin notification email
  try {
    await resend.emails.send({
      from: 'MarketBase <noreply@lkforge.xyz>',
      to: ['lk@lkforge.xyz'],
      subject: `🛒 New Sale: Order ${order.order_reference}`,
      html: `
        <h2>🎉 New Sale Confirmed!</h2>

        <h3>📋 Order Details</h3>
        <p><strong>Order Reference:</strong> ${order.order_reference}</p>
        <p><strong>Payment Hash:</strong> ${paymentHash}</p>
        <p><strong>Total Amount:</strong> $${order.total_amount} USDC</p>
        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Payment Confirmed:</strong> ${new Date().toLocaleString()}</p>

        <h3>🛍️ Items Purchased</h3>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">SKU</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Price</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items?.map((item: { title: string; sku?: string; quantity: number; price: string }) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.title}</td>
                <td style="border: 1px solid #ddd; padding: 8px; font-family: monospace;">${item.sku || 'N/A'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${item.price}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('') || '<tr><td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: center;">No items found</td></tr>'}
          </tbody>
        </table>

        <h3>👤 Customer Information</h3>
        <p><strong>Wallet Address:</strong> <code>${order.customer_wallet}</code></p>
        ${order.farcaster_fid ? `<p><strong>Farcaster FID:</strong> ${order.farcaster_fid}</p>` : ''}
        ${order.farcaster_username ? `<p><strong>Farcaster Username:</strong> @${order.farcaster_username}</p>` : ''}

        <h3>🔗 Actions</h3>
        <p>Review order details in your <a href="https://supabase.com">Supabase dashboard</a></p>

        <hr style="margin: 24px 0;">
        <p style="color: #666; font-size: 12px;">
          This notification was automatically generated by MarketBase.<br>
          Order created: ${new Date(order.created_at).toLocaleString()}<br>
          Payment confirmed: ${new Date().toLocaleString()}
        </p>
      `
    });

    console.log('✅ SALE NOTIFICATION: Admin email sent successfully');
    adminEmailSent = true;
  } catch (emailError) {
    console.error('❌ SALE NOTIFICATION: Failed to send admin email:', emailError);
  }

  // Send customer confirmation email
  try {
    console.log('🔓 SALE NOTIFICATION: Decrypting customer data for confirmation email...');
    const customerData = decryptCustomerData(order.encrypted_customer_data);

    await resend.emails.send({
      from: 'MarketBase <noreply@lkforge.xyz>',
      to: [customerData.email],
      subject: `✅ Order Confirmed - ${order.order_reference}`,
      html: `
        <h2>🎉 Thank you for your order!</h2>

        <p>Dear ${customerData.shippingAddress.name},</p>

        <p>Your order has been confirmed and payment has been successfully processed on the Base network.</p>

        <h3>📋 Order Details</h3>
        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Order Number:</strong> ${order.order_reference}</p>
          <p><strong>Total Amount:</strong> $${order.total_amount} USDC</p>
          <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
          <p><strong>Payment Confirmed:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <h3>🛍️ Items Ordered</h3>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Product</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Price</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.order_items?.map((item: { title: string; sku?: string; quantity: number; price: string }) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 12px;">${item.title}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${item.price}</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" style="border: 1px solid #ddd; padding: 12px; text-align: center;">No items found</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5; font-weight: bold;">
              <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;">Order Total:</td>
              <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">$${order.total_amount} USDC</td>
            </tr>
          </tfoot>
        </table>

        <h3>🚚 Shipping Information</h3>
        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>${customerData.shippingAddress.name}</strong></p>
          <p>${customerData.shippingAddress.address1}</p>
          ${customerData.shippingAddress.address2 ? `<p>${customerData.shippingAddress.address2}</p>` : ''}
          <p>${customerData.shippingAddress.city}, ${customerData.shippingAddress.state} ${customerData.shippingAddress.zipCode}</p>
          <p>${customerData.shippingAddress.country}</p>
          ${customerData.shippingAddress.phone ? `<p><strong>Phone:</strong> ${customerData.shippingAddress.phone}</p>` : ''}
        </div>

        <h3>💳 Payment Information</h3>
        <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p>✅ <strong>Payment Status:</strong> Confirmed</p>
          <p><strong>Payment Method:</strong> USDC on Base Network</p>
          <p><strong>Amount Paid:</strong> $${order.total_amount} USDC</p>
        </div>

        <h3>📦 What's Next?</h3>
        <ul style="line-height: 1.6;">
          <li>Your order is being processed and will be shipped within 1-2 business days</li>
          <li>You'll receive a shipping confirmation email with tracking information</li>
        </ul>


        <hr style="margin: 32px 0; border: none; border-top: 1px solid #ddd;">

        <p style="color: #666; font-size: 14px;">
          <strong>Need Help?</strong><br>
          If you have any questions about your order, please contact us at <a href="mailto:lk@lkforge.xyz" style="color: #2563eb;">lk@lkforge.xyz</a>
        </p>

        <p style="color: #666; font-size: 12px;">
          Thank you for shopping with MarketBase!<br>
          This confirmation was automatically generated for order ${order.order_reference}<br>
          Order placed: ${new Date(order.created_at).toLocaleString()}
        </p>
      `
    });

    console.log(`✅ SALE NOTIFICATION: Customer confirmation email sent to ${customerData.email}`);
    customerEmailSent = true;
  } catch (emailError) {
    console.error('❌ SALE NOTIFICATION: Failed to send customer email:', emailError);
    customerEmailSent = false;
  }

  return { adminEmailSent, customerEmailSent };
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

    // Step 6: Send sale notification emails
    console.log('🔄 STEP 6: Sending sale notification emails...');
    try {
      const emailResult = await sendSaleNotificationEmails(order, updateData.payment_hash);
      console.log(`✅ STEP 6 SUCCESS: Sale notifications sent:`, {
        adminEmailSent: emailResult.adminEmailSent,
        customerEmailSent: emailResult.customerEmailSent
      });
    } catch (notificationError) {
      console.error('❌ STEP 6 WARNING: Sale notification failed (non-blocking):', notificationError);
      // Don't fail the entire request if notifications fail
    }

    // Step 7: Process affiliate attribution if buyer has FID
    console.log('🔄 STEP 7: Starting affiliate attribution processing...');
    let affiliateResult = { processed: 0, errors: 0 };
    if (order.farcaster_fid) {
      console.log(`🎯 STEP 7A: Processing affiliate attributions for FID: ${order.farcaster_fid}`);
      console.log('📋 Order items to process:', order.order_items);
      affiliateResult = await processOrderAffiliateAttributions(
        orderReference,
        order.farcaster_fid,
        order.order_items
      );
      console.log(`✅ STEP 7A COMPLETE: Final affiliate attribution result:`, {
        processed: affiliateResult.processed,
        errors: affiliateResult.errors,
        totalItems: order.order_items?.length || 0
      });
    } else {
      console.log('ℹ️ STEP 7 SKIPPED: No Farcaster FID provided, skipping affiliate attribution');
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