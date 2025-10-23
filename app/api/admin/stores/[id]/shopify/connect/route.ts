// app/api/admin/stores/[id]/shopify/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { encryptApiKey, validateApiKeyFormat } from '@/lib/shopify/encryption';
import { validateShopifyUrl, validateShopifyConnection, getShopifyProductCount } from '@/lib/shopify/validation';

interface ConnectRequest {
  storeUrl: string;
  apiKey: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const storeId = resolvedParams.id;
    const { storeUrl, apiKey }: ConnectRequest = await request.json();

    // Validate store ID
    if (!storeId) {
      return NextResponse.json({
        success: false,
        error: 'Store ID is required'
      }, { status: 400 });
    }

    // Validate input
    if (!storeUrl || !apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Store URL and API key are required'
      }, { status: 400 });
    }

    // Validate store URL format
    if (!validateShopifyUrl(storeUrl)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Shopify store URL format. Use format: yourstore.myshopify.com'
      }, { status: 400 });
    }

    // Validate API key format
    if (!validateApiKeyFormat(apiKey)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format. Please use a valid Shopify private app access token.'
      }, { status: 400 });
    }

    // Check if store exists
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .select('id, name')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json({
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Test the Shopify connection
    console.log(`Testing Shopify connection for store ${storeId}...`);
    const validationResult = await validateShopifyConnection(storeUrl, apiKey);

    if (!validationResult.isValid) {
      // Update status to error
      await supabaseAdmin
        .from('stores')
        .update({
          shopify_integration_status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', storeId);

      return NextResponse.json({
        success: false,
        error: validationResult.error
      }, { status: 400 });
    }

    // Encrypt the API key for storage
    const encryptedApiKey = encryptApiKey(apiKey);

    // Get product count for display
    const productCount = await getShopifyProductCount(storeUrl, apiKey);

    // Update store with Shopify integration details
    const { data: updatedStore, error: updateError } = await supabaseAdmin
      .from('stores')
      .update({
        shopify_store_url: storeUrl,
        shopify_api_key: encryptedApiKey,
        shopify_integration_status: 'connected',
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating store with Shopify integration:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save Shopify integration'
      }, { status: 500 });
    }

    console.log(`Shopify integration successful for store ${storeId} (${store.name})`);
    console.log(`Connected to: ${validationResult.shopInfo?.name} (${storeUrl})`);
    console.log(`Product count: ${productCount}`);

    return NextResponse.json({
      success: true,
      message: 'Shopify integration connected successfully',
      integration: {
        status: 'connected',
        storeUrl: storeUrl,
        shopName: validationResult.shopInfo?.name,
        productCount: productCount,
        connectedAt: updatedStore.updated_at
      }
    });

  } catch (error) {
    console.error('Shopify connect error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}