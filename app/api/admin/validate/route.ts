// app/api/admin/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ADDRESSES = process.env.ADMIN_WALLET_ADDRESSES?.split(',').map(addr => addr.trim()) || [];

if (!ADMIN_ADDRESSES.length) {
  throw new Error('Admin wallet addresses not configured');
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json({ isAdmin: false });
    }

    const isAdmin = ADMIN_ADDRESSES.some(
      adminAddr => adminAddr.toLowerCase() === walletAddress.toLowerCase()
    );

    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
