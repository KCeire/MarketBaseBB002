// app/api/affiliate/track-share/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { productId, referrerId, frameUrl } = await request.json();
    
    if (!productId || !referrerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Track the share event in your database
    // This is where you'd save to Supabase or your preferred database
    console.log('📤 Share tracked:', {
      productId,
      referrerId,
      frameUrl,
      timestamp: new Date().toISOString(),
    });

    // Example Supabase integration (uncomment and modify as needed):
    /*
    const { error } = await supabase
      .from('affiliate_shares')
      .insert({
        product_id: productId,
        referrer_id: referrerId,
        frame_url: frameUrl,
        shared_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to track share' },
        { status: 500 }
      );
    }
    */

    return NextResponse.json({
      success: true,
      message: 'Share tracked successfully',
    });

  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
