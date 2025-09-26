import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { productId, userFid, referralUrl } = await request.json();
    
    // Log the share event (you can save to database later)
    console.log('Product shared:', {
      productId,
      sharerFid: userFid,
      referralUrl,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Save to database when ready
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking share:', error);
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    );
  }
}
