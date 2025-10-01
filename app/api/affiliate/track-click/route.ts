// app/api/affiliate/track-click/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface TrackClickRequest {
  referrerFid: string;
  productId: string;
  visitorFid?: string; // Optional - will be null for anonymous visitors
}

interface TrackClickResponse {
  success: boolean;
  clickId?: string;
  message?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TrackClickResponse>> {
  try {
    const body: TrackClickRequest = await request.json();
    const { referrerFid, productId, visitorFid } = body;

    // Validate required fields
    if (!referrerFid || !productId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: referrerFid and productId'
      }, { status: 400 });
    }

    // Prevent self-referral
    if (visitorFid && visitorFid === referrerFid) {
      return NextResponse.json({
        success: false,
        error: 'Self-referral not allowed'
      }, { status: 400 });
    }

    // Use admin client for server-side operations
    const supabase = supabaseAdmin;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    // Check if there's already an active click for this referrer + product combo
    const { data: existingClick, error: checkError } = await supabase
      .from('affiliate_clicks')
      .select('click_id, visitor_fid')
      .eq('referrer_fid', referrerFid)
      .eq('product_id', productId)
      .gte('expires_at', new Date().toISOString())
      .eq('converted', false)
      .order('clicked_at', { ascending: false })
      .limit(1);

    if (checkError) {
      console.error('Error checking existing clicks:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    let clickId: string;
    let action: string;

    if (existingClick && existingClick.length > 0) {
      // Update existing click - extend expiry and update visitor_fid if provided
      clickId = existingClick[0].click_id;

      const updateData: {
        last_clicked_at: string;
        expires_at: string;
        visitor_fid?: string;
      } = {
        last_clicked_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      };

      // Only update visitor_fid if it's currently null and we have a new one
      if (!existingClick[0].visitor_fid && visitorFid) {
        updateData.visitor_fid = visitorFid;
      }

      const { error: updateError } = await supabase
        .from('affiliate_clicks')
        .update(updateData)
        .eq('click_id', clickId);

      if (updateError) {
        console.error('Error updating click:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Failed to update click record'
        }, { status: 500 });
      }

      action = 'updated';
    } else {
      // Create new click record
      const { data: newClick, error: insertError } = await supabase
        .from('affiliate_clicks')
        .insert({
          referrer_fid: referrerFid,
          visitor_fid: visitorFid || null,
          product_id: productId,
          expires_at: expiresAt.toISOString(),
          last_clicked_at: new Date().toISOString()
        })
        .select('click_id')
        .single();

      if (insertError) {
        console.error('Error creating click:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create click record'
        }, { status: 500 });
      }

      clickId = newClick.click_id;
      action = 'created';
    }

    console.log(`🔗 Affiliate click ${action}:`, {
      clickId,
      referrerFid,
      productId,
      visitorFid: visitorFid || 'anonymous',
      expiresAt: expiresAt.toISOString()
    });

    return NextResponse.json({
      success: true,
      clickId,
      message: `Click ${action} successfully`
    });

  } catch (error) {
    console.error('Affiliate click tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// GET endpoint to check if there's an active affiliate click for a user/product
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const visitorFid = searchParams.get('visitorFid');
    const productId = searchParams.get('productId');

    if (!visitorFid || !productId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: visitorFid and productId'
      }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    // Use the helper function to find valid affiliate click
    const { data, error } = await supabase
      .rpc('find_affiliate_click', {
        p_visitor_fid: visitorFid,
        p_product_id: productId
      });

    if (error) {
      console.error('Error finding affiliate click:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    const hasAffiliateClick = data && data.length > 0;
    const affiliateData = hasAffiliateClick ? data[0] : null;

    return NextResponse.json({
      success: true,
      hasAffiliateClick,
      affiliateData
    });

  } catch (error) {
    console.error('Affiliate click check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}