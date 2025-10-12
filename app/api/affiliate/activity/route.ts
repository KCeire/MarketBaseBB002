// app/api/affiliate/activity/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { getProductById } from '@/lib/producthub/api';

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

    // Enhance activities with product information
    const enhancedActivities = await Promise.all(
      (activities || []).map(async (activity) => {
        try {
          // Fetch product information
          const product = await getProductById(parseInt(activity.product_id));

          // Determine commission status based on converted flag
          let status: 'pending' | 'earned_pending_settlement' | 'earned';
          if (!activity.converted) {
            status = 'pending';
          } else {
            // For now, all converted items are "earned_pending_settlement"
            // since we don't have delivery tracking yet
            status = 'earned_pending_settlement';
          }

          return {
            ...activity,
            product: product ? {
              id: product.id.toString(),
              title: product.title,
              price: product.price,
              image: product.image,
              vendor: product.vendor
            } : null,
            status
          };
        } catch (error) {
          console.error(`Error fetching product ${activity.product_id}:`, error);
          // Return activity with null product if fetch fails
          return {
            ...activity,
            product: null,
            status: activity.converted ? 'earned_pending_settlement' : 'pending'
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      activities: enhancedActivities
    });

  } catch (error) {
    console.error('Affiliate activity check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}