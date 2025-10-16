// app/api/admin/stores/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { isSuperAdmin } from '@/lib/admin/stores-config';

interface StoreCreationRequest {
  name: string;
  description: string;
  storeId: string;
  slug: string;
  walletAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, storeId, slug, walletAddress }: StoreCreationRequest = await request.json();

    // Validate admin access
    if (!walletAddress || !isSuperAdmin(walletAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Super admin access required'
      }, { status: 403 });
    }

    // Validate required fields
    if (!name?.trim() || !storeId?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name and storeId are required'
      }, { status: 400 });
    }

    // Wallet address will be configured via environment variables

    // Validate store ID format (alphanumeric with hyphens)
    if (!storeId.match(/^[a-z0-9-]+$/)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid store ID format. Use lowercase letters, numbers, and hyphens only.'
      }, { status: 400 });
    }

    // Check if store already exists
    const { data: existingStore, error: checkError } = await supabaseAdmin
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking for existing store:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Failed to validate store ID'
      }, { status: 500 });
    }

    if (existingStore) {
      return NextResponse.json({
        success: false,
        error: 'A store with this ID already exists'
      }, { status: 409 });
    }

    // Create the store record
    const storeData = {
      id: storeId,
      name: name.trim(),
      slug: slug || storeId,
      description: description?.trim() || '',
      is_active: false, // Start inactive, but can be activated later
      admin_wallet: walletAddress, // Store the admin wallet directly in database
      settings: {
        allowOrderManagement: true,
        allowProductManagement: true,
        allowAnalytics: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: store, error: insertError } = await supabaseAdmin
      .from('stores')
      .insert(storeData)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating store:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create store'
      }, { status: 500 });
    }

    // Log the creation for auditing
    console.log(`Store created: ${storeId} by admin wallet (would be from request)`);

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        isActive: store.is_active,
        adminWallet: store.admin_wallet,
        envVarName: `STORE_ADMIN_WALLETS_${storeId.toUpperCase().replace(/-/g, '_')}`
      },
      message: 'Store created successfully. Add the environment variable with the seller wallet address to activate.'
    });

  } catch (error) {
    console.error('Store creation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}