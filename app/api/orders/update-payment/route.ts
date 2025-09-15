// app/api/orders/update-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

interface UpdatePaymentRequest {
  orderReference: string;
  transactionHash: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdatePaymentRequest = await request.json();
    const { orderReference, transactionHash, paymentStatus } = body;

    // Validate required fields
    if (!orderReference || !transactionHash || !paymentStatus) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: orderReference, transactionHash, or paymentStatus' 
        },
        { status: 400 }
      );
    }

    // Validate orderReference format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderReference)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid order reference format' 
        },
        { status: 400 }
      );
    }

    // Validate transaction hash format (should be 0x followed by 64 hex characters)
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(transactionHash)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid transaction hash format' 
        },
        { status: 400 }
      );
    }

    // Update the order with payment information
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        transaction_hash: transactionHash,
        payment_completed_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('order_reference', orderReference)
      .select('id, order_reference, payment_status');

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update order payment status' 
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order not found' 
        },
        { status: 404 }
      );
    }

    // Log the payment update for audit trail
    await supabase
      .from('audit_logs')
      .insert({
        table_name: 'orders',
        record_id: data[0].id,
        action: 'payment_updated',
        old_values: null,
        new_values: {
          payment_status: paymentStatus,
          transaction_hash: transactionHash
        },
        user_id: null, // System action
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    console.log('Payment status updated successfully:', {
      orderReference,
      transactionHash: transactionHash.slice(0, 10) + '...',
      paymentStatus
    });

    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        orderReference: data[0].order_reference,
        paymentStatus: data[0].payment_status
      }
    });

  } catch (error) {
    console.error('Update payment API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
