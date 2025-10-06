// app/api/affiliate/link-fid/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface LinkFidRequest {
  visitorFid: string;
  sessionId?: string; // For linking anonymous sessions
}

interface LinkFidResponse {
  success: boolean;
  linkedClicks?: number;
  message?: string;
  error?: string;
}


export async function POST(request: NextRequest): Promise<NextResponse<LinkFidResponse>> {
  try {
    const body: LinkFidRequest = await request.json();
    const { visitorFid } = body;

    console.log('🔗 AFFILIATE LINK-FID: API called with:', {
      visitorFid,
      timestamp: new Date().toISOString()
    });

    // Import and call the shared function from utility file
    const { linkAnonymousClicksToFid } = await import('@/lib/affiliate-link-utils');
    const result = await linkAnonymousClicksToFid(visitorFid);

    // Return appropriate HTTP status based on result
    if (!result.success) {
      return NextResponse.json(result, { status: result.error?.includes('Missing') ? 400 : 500 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('FID linking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET endpoint to check how many clicks are linked to a FID
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: fid'
      }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // Get affiliate stats for this FID
    console.log(`🔍 AFFILIATE EARNINGS DEBUG: Fetching earnings for FID: ${fid}`);

    const { data: earnings, error } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .eq('referrer_fid', fid)
      .single();

    console.log(`📊 AFFILIATE EARNINGS DEBUG: Raw earnings data:`, {
      fid,
      earnings,
      error: error?.message,
      errorCode: error?.code
    });

    // Also fetch raw affiliate_clicks data for comparison
    const { data: rawClicks, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .eq('referrer_fid', fid);

    console.log(`🔗 AFFILIATE EARNINGS DEBUG: Raw clicks data for FID ${fid}:`, {
      totalClicks: rawClicks?.length || 0,
      convertedClicks: rawClicks?.filter(click => click.converted).length || 0,
      clicksWithCommission: rawClicks?.filter(click => click.commission_amount > 0).length || 0,
      totalCommissionFromClicks: rawClicks?.reduce((sum, click) => sum + (parseFloat(click.commission_amount || 0)), 0) || 0,
      clicksData: rawClicks?.map(click => ({
        click_id: click.click_id,
        converted: click.converted,
        commission_amount: click.commission_amount,
        commission_earned_at: click.commission_earned_at
      })) || [],
      clicksError: clicksError?.message
    });

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching affiliate earnings:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    // Test the debug function if available
    let debugInfo = null;
    try {
      const { data: debugData, error: debugError } = await supabase
        .rpc('debug_affiliate_earnings', { p_referrer_fid: fid });

      if (!debugError && debugData && debugData.length > 0) {
        debugInfo = debugData[0].debug_info;
        console.log(`🐛 AFFILIATE EARNINGS DEBUG: Debug function result:`, debugInfo);
      }
    } catch (debugError) {
      console.log(`⚠️ AFFILIATE EARNINGS DEBUG: Debug function not available (likely migration not run yet):`, debugError);
    }

    const finalStats = earnings || {
      referrer_fid: fid,
      total_clicks: 0,
      conversions: 0,
      total_earned: 0,
      avg_commission: 0,
      last_earning_date: null
    };

    console.log(`📈 AFFILIATE EARNINGS DEBUG: Final stats being returned:`, {
      originalEarnings: earnings,
      finalStats,
      debugInfo
    });

    return NextResponse.json({
      success: true,
      affiliateStats: finalStats,
      debug: debugInfo  // Include debug info in response for testing
    });

  } catch (error) {
    console.error('Affiliate stats check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}