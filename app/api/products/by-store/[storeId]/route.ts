// app/api/products/by-store/[storeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/shopify/api';
import { categorizeProduct, initializeStorePatterns, getStoreInfo } from '@/lib/store-assignment';

const VALID_STORE_IDS = [
  'techwave-electronics',
  'green-oasis-home',
  'pawsome-pets',
  'radiant-beauty',
  'apex-athletics'
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    // Validate store ID
    if (!VALID_STORE_IDS.includes(storeId)) {
      return NextResponse.json({
        success: false,
        error: `Invalid store ID. Valid options: ${VALID_STORE_IDS.join(', ')}`,
        products: []
      }, { status: 400 });
    }

    console.log(`Fetching products for store: ${storeId}`);

    // Initialize store patterns
    await initializeStorePatterns();

    // Get all products
    const allProducts = await getAllProducts();

    // Filter products for this store
    const storeProducts = allProducts.filter(product => {
      const assignedStoreId = categorizeProduct(product);
      return assignedStoreId === storeId;
    });

    const storeInfo = getStoreInfo(storeId);

    console.log(`Found ${storeProducts.length} products for ${storeInfo?.name || storeId}`);

    return NextResponse.json({
      success: true,
      store: {
        id: storeId,
        name: storeInfo?.name || 'Unknown Store',
        category: storeInfo?.category || 'Unknown Category'
      },
      products: storeProducts,
      count: storeProducts.length,
      totalProducts: allProducts.length
    });

  } catch (error) {
    console.error(`Error fetching products for store ${(await params).storeId}:`, error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch store products',
      products: []
    }, { status: 500 });
  }
}