// D:\BaseShop\Base-Shop\app\api\affiliate\track-visit\route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { referrerId, productId, timestamp } = await request.json();
    
    // Log the referral visit
    console.log('Referral visit:', {
      referrerId,
      productId,
      timestamp,
      visitedAt: new Date().toISOString()
    });
    
    // TODO: Save to database when ready
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visit:', error);
    return NextResponse.json(
      { error: 'Failed to track visit' },
      { status: 500 }
    );
  }
}