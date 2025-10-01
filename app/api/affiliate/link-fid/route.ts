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

    if (!visitorFid) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: visitorFid'
      }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // For now, we'll use a simple approach where we link recent anonymous clicks
    // In the future, you could enhance this with session tracking or localStorage tokens

    // Find recent anonymous clicks that could belong to this user
    // We'll look for clicks in the last hour where visitor_fid is null
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: anonymousClicks, error: findError } = await supabase
      .from('affiliate_clicks')
      .select('click_id, referrer_fid, product_id, clicked_at')
      .is('visitor_fid', null)
      .gte('clicked_at', oneHourAgo.toISOString())
      .gte('expires_at', new Date().toISOString()) // Still active
      .eq('converted', false);

    if (findError) {
      console.error('Error finding anonymous clicks:', findError);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    if (!anonymousClicks || anonymousClicks.length === 0) {
      return NextResponse.json({
        success: true,
        linkedClicks: 0,
        message: 'No anonymous clicks found to link'
      });
    }

    // Update anonymous clicks to link them to this FID
    // Exclude self-referrals
    const clicksToUpdate = anonymousClicks.filter(click => click.referrer_fid !== visitorFid);

    if (clicksToUpdate.length === 0) {
      return NextResponse.json({
        success: true,
        linkedClicks: 0,
        message: 'No valid clicks found to link (self-referrals excluded)'
      });
    }

    const clickIds = clicksToUpdate.map(click => click.click_id);

    const { error: updateError } = await supabase
      .from('affiliate_clicks')
      .update({
        visitor_fid: visitorFid,
        updated_at: new Date().toISOString()
      })
      .in('click_id', clickIds);

    if (updateError) {
      console.error('Error linking FID to clicks:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to link clicks to FID'
      }, { status: 500 });
    }

    console.log(`🔗 Linked ${clickIds.length} anonymous clicks to FID ${visitorFid}:`, {
      linkedClicks: clickIds.length,
      clickIds,
      visitorFid
    });

    return NextResponse.json({
      success: true,
      linkedClicks: clickIds.length,
      message: `Successfully linked ${clickIds.length} clicks to FID ${visitorFid}`
    });

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
    const { data: earnings, error } = await supabase
      .from('affiliate_earnings')
      .select('*')
      .eq('referrer_fid', fid)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error fetching affiliate earnings:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      affiliateStats: earnings || {
        referrer_fid: fid,
        total_clicks: 0,
        conversions: 0,
        total_earned: 0,
        avg_commission: 0,
        last_earning_date: null
      }
    });

  } catch (error) {
    console.error('Affiliate stats check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}