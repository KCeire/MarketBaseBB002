// app/api/affiliate/track-share/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { productId, userFid, frameUrl } = await request.json(); // Changed referrerId to userFid
    
    if (!productId || !userFid) { // Changed referrerId to userFid
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Track the share event in your database
    console.log('📤 Share tracked:', {
      productId,
      userFid, // Changed referrerId to userFid
      frameUrl,
      timestamp: new Date().toISOString(),
    });

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
