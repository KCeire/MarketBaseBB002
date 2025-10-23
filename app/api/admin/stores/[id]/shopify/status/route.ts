// app/api/admin/stores/[id]/shopify/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface ShopifyStatusResponse {
  success: boolean;
  status: {
    status: string;
    lastSync?: string;
    errorMessage?: string;
  };
  credentials?: {
    storeUrl: string;
  };
}

export async function GET(
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

    // Fetch store with Shopify integration details
    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .select('id, name, shopify_store_url, shopify_integration_status, updated_at')
      .eq('id', storeId)
      .single();

    if (error || !store) {
      return NextResponse.json({
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Build response based on integration status
    const response: ShopifyStatusResponse = {
      success: true,
      status: {
        status: store.shopify_integration_status || 'not_connected'
      }
    };

    // If connected, include additional details
    if (store.shopify_integration_status === 'connected' && store.shopify_store_url) {
      response.status.lastSync = store.updated_at;
      response.credentials = {
        storeUrl: store.shopify_store_url
        // Never return the actual API key
      };
    }

    // Add error message if status is error
    if (store.shopify_integration_status === 'error') {
      response.status.errorMessage = 'Connection failed. Please check your credentials and try again.';
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Shopify status error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}