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