// app/api/products/by-store/[storeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/producthub/api';
import { categorizeProduct, initializeStorePatterns, getStoreInfo } from '@/lib/store-assignment';
import { isShopifyStore, getShopifyStoreProducts } from '@/lib/shopify/products';
import { supabaseAdmin } from '@/lib/supabase/client';

const STATIC_STORE_IDS = [
  'techwave-electronics',
  'green-oasis-home',
  'pawsome-pets',
  'radiant-beauty',
  'apex-athletics',
  'nft-energy'
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    console.log(`Fetching products for store: ${storeId}`);

    // Check if it's a Shopify store first
    const isShopify = await isShopifyStore(storeId);

    if (isShopify) {
      console.log(`Processing Shopify store: ${storeId}`);

      try {
        // Get products from Shopify API
        const shopifyProducts = await getShopifyStoreProducts(storeId);

        // Get store info from database
        const { data: storeInfo, error } = await supabaseAdmin
          .from('stores')
          .select('id, name, description')
          .eq('id', storeId)
          .single();

        if (error) {
          console.error('Error fetching store info:', error);
        }

        console.log(`Found ${shopifyProducts.length} Shopify products for ${storeInfo?.name || storeId}`);

        return NextResponse.json({
          success: true,
          store: {
            id: storeId,
            name: storeInfo?.name || storeId,
            category: 'Shopify Store',
            type: 'shopify'
          },
          products: shopifyProducts,
          count: shopifyProducts.length,
          totalProducts: shopifyProducts.length
        });

      } catch (shopifyError) {
        console.error(`Error fetching Shopify products for ${storeId}:`, shopifyError);
        return NextResponse.json({
          success: false,
          error: `Failed to fetch Shopify products: ${shopifyError instanceof Error ? shopifyError.message : 'Unknown error'}`,
          products: []
        }, { status: 500 });
      }
    }

    // Handle static stores
    if (!STATIC_STORE_IDS.includes(storeId)) {
      return NextResponse.json({
        success: false,
        error: `Store not found. Store ID '${storeId}' is neither a valid static store nor a connected Shopify store.`,
        products: []
      }, { status: 404 });
    }

    console.log(`Processing static store: ${storeId}`);

    // Initialize store patterns for static stores
    await initializeStorePatterns();

    // Get all products from ProductHub
    const allProducts = await getAllProducts();

    // Filter products for this static store
    const storeProducts = allProducts.filter(product => {
      const assignedStoreId = categorizeProduct(product);
      return assignedStoreId === storeId;
    });

    const storeInfo = getStoreInfo(storeId);

    console.log(`Found ${storeProducts.length} static products for ${storeInfo?.name || storeId}`);

    return NextResponse.json({
      success: true,
      store: {
        id: storeId,
        name: storeInfo?.name || 'Unknown Store',
        category: storeInfo?.category || 'Unknown Category',
        type: 'static'
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