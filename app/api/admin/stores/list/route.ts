// app/api/admin/stores/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserStoresWithDatabase, hasAnyAdminAccessWithDatabase } from '@/lib/admin/stores-server';
import { isSuperAdmin } from '@/lib/admin/stores-config';

interface StoreListRequest {
  walletAddress: string;
  includeInactive?: boolean; // New optional parameter for super admins
}

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, includeInactive = false }: StoreListRequest = await request.json();

    // Validate admin access for user requests
    if (!walletAddress || walletAddress === 'system') {
      return NextResponse.json({
        success: false,
        error: 'Valid wallet address required'
      }, { status: 400 });
    }

    // Check if user has any admin access
    const hasAccess = await hasAnyAdminAccessWithDatabase(walletAddress);
    if (!hasAccess) {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 });
    }

    // Only super admins can request inactive stores
    if (includeInactive && !isSuperAdmin(walletAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Super admin access required to view inactive stores'
      }, { status: 403 });
    }

    // Get only the stores this user has access to
    const userStores = await getUserStoresWithDatabase(walletAddress, includeInactive);

    // Transform the data to match the frontend interface
    const transformedStores = userStores.map(store => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      isActive: store.isActive,
      createdAt: store.createdAt,
      adminWallets: store.adminWallets,
      settings: store.settings,
      shopifyIntegration: {
        status: 'not_connected', // Default value, will be populated from database if available
        storeUrl: null
      }
    }));

    return NextResponse.json({
      success: true,
      stores: transformedStores
    });

  } catch (error) {
    console.error('Store list error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}