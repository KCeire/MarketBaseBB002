// app/api/producthub/products/route.ts
import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/producthub/api';

export async function GET() {
  try {
    const products = await getAllProducts();
    
    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Products API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch products',
      products: [],
    }, { status: 500 });
  }
}
