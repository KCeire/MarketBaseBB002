// app/api/admin/stores/[id]/shopify/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const storeId = resolvedParams.id;

    // Validate store ID
    if (!storeId) {
      return NextResponse.json({
        success: false,
        error: 'Store ID is required'
      }, { status: 400 });
    }

    // Check if store exists and has Shopify integration
    const { data: store, error: checkError } = await supabaseAdmin
      .from('stores')
      .select('id, name, shopify_integration_status, shopify_store_url')
      .eq('id', storeId)
      .single();

    if (checkError || !store) {
      return NextResponse.json({
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Check if there's actually a Shopify integration to disconnect
    if (store.shopify_integration_status === 'not_connected') {
      return NextResponse.json({
        success: false,
        error: 'No Shopify integration found to disconnect'
      }, { status: 400 });
    }

    // Clear Shopify integration data
    const { data: updatedStore, error: updateError } = await supabaseAdmin
      .from('stores')
      .update({
        shopify_store_url: null,
        shopify_api_key: null,
        shopify_integration_status: 'not_connected',
        updated_at: new Date().toISOString()
      })
      .eq('id', storeId)
      .select()
      .single();

    if (updateError) {
      console.error('Error disconnecting Shopify integration:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to disconnect Shopify integration'
      }, { status: 500 });
    }

    console.log(`Shopify integration disconnected for store ${storeId} (${store.name})`);
    console.log(`Previously connected to: ${store.shopify_store_url}`);

    return NextResponse.json({
      success: true,
      message: 'Shopify integration disconnected successfully',
      store: {
        id: updatedStore.id,
        name: store.name,
        shopifyStatus: 'not_connected',
        disconnectedAt: updatedStore.updated_at
      }
    });

  } catch (error) {
    console.error('Shopify disconnect error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}