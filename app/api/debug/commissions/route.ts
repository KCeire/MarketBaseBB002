// app/api/debug/commissions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({
        error: 'Missing FID parameter'
      }, { status: 400 });
    }

    console.log(`🔍 COMMISSION DEBUG: Starting debug for FID ${fid}`);

    // Step 1: Get raw affiliate_clicks data
    const { data: clicks, error: clicksError } = await supabaseAdmin
      .from('affiliate_clicks')
      .select('*')
      .eq('referrer_fid', fid)
      .order('clicked_at', { ascending: false });

    if (clicksError) {
      console.error('❌ Error fetching clicks:', clicksError);
      return NextResponse.json({ error: 'Database error', details: clicksError }, { status: 500 });
    }

    // Step 2: Calculate manual totals
    const totalClicks = clicks?.length || 0;
    const convertedClicks = clicks?.filter(c => c.converted) || [];
    const clicksWithCommission = clicks?.filter(c => c.commission_amount && c.commission_amount > 0) || [];

    const manualTotalCommission = clicks?.reduce((sum, click) => {
      return sum + parseFloat(click.commission_amount || 0);
    }, 0) || 0;

    // Step 3: Get affiliate_earnings view data
    const { data: earnings, error: earningsError } = await supabaseAdmin
      .from('affiliate_earnings')
      .select('*')
      .eq('referrer_fid', fid)
      .single();

    // Step 4: Run debug function if available
    let debugFunctionResult = null;
    try {
      const { data: debugData, error: debugError } = await supabaseAdmin
        .rpc('debug_affiliate_earnings', { p_referrer_fid: fid });

      if (!debugError && debugData && debugData.length > 0) {
        debugFunctionResult = debugData[0].debug_info;
      }
    } catch (e) {
      console.log('Debug function not available:', e);
    }

    // Step 5: Check recent orders where this FID made purchases (buyer side)
    const { data: buyerOrders, error: buyerOrdersError } = await supabaseAdmin
      .from('orders')
      .select('order_reference, payment_status, total_amount, order_items, created_at')
      .eq('farcaster_fid', fid)
      .order('created_at', { ascending: false })
      .limit(5);

    // Compile comprehensive debug info
    const debugInfo = {
      fid,
      timestamp: new Date().toISOString(),
      rawClicks: {
        totalCount: totalClicks,
        convertedCount: convertedClicks.length,
        withCommissionCount: clicksWithCommission.length,
        manualCommissionTotal: manualTotalCommission,
        clicks: clicks?.map(click => ({
          click_id: click.click_id.substring(0, 8) + '...',
          product_id: click.product_id,
          converted: click.converted,
          commission_amount: click.commission_amount,
          order_id: click.order_id,
          commission_earned_at: click.commission_earned_at,
          clicked_at: click.clicked_at
        })) || []
      },
      earningsView: {
        found: !!earnings,
        error: earningsError?.message || null,
        data: earnings ? {
          total_clicks: earnings.total_clicks,
          conversions: earnings.conversions,
          total_earned: earnings.total_earned,
          avg_commission: earnings.avg_commission,
          last_earning_date: earnings.last_earning_date
        } : null
      },
      debugFunction: {
        available: !!debugFunctionResult,
        result: debugFunctionResult
      },
      buyerOrders: {
        found: buyerOrders?.length || 0,
        error: buyerOrdersError?.message || null,
        orders: buyerOrders?.map(order => ({
          reference: order.order_reference,
          status: order.payment_status,
          amount: order.total_amount,
          created: order.created_at,
          itemCount: order.order_items?.length || 0
        })) || []
      },
      analysis: {
        hasClicks: totalClicks > 0,
        hasConversions: convertedClicks.length > 0,
        hasCommissions: clicksWithCommission.length > 0,
        viewVsManual: {
          viewTotal: earnings ? parseFloat(earnings.total_earned || 0) : 0,
          manualTotal: manualTotalCommission,
          match: Math.abs((earnings ? parseFloat(earnings.total_earned || 0) : 0) - manualTotalCommission) < 0.01
        }
      }
    };

    console.log(`🔍 COMMISSION DEBUG COMPLETE for FID ${fid}:`, {
      clicks: totalClicks,
      conversions: convertedClicks.length,
      commissions: clicksWithCommission.length,
      manualTotal: manualTotalCommission,
      viewTotal: earnings?.total_earned || 0
    });

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('❌ Commission debug error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}