// app/api/affiliate/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!fid) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: fid'
      }, { status: 400 });
    }

    // Get recent affiliate activity for this FID
    const { data: activities, error } = await supabaseAdmin
      .from('affiliate_clicks')
      .select(`
        click_id,
        product_id,
        clicked_at,
        converted,
        commission_amount,
        commission_earned_at,
        last_clicked_at
      `)
      .eq('referrer_fid', fid)
      .order('clicked_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching affiliate activity:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      activities: activities || []
    });

  } catch (error) {
    console.error('Affiliate activity check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}