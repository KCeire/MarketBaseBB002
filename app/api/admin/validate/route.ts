// app/api/admin/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AdminSession, StoreAdminPermissions } from '@/types/admin';
import {
  hasAnyAdminAccess,
  isSuperAdmin,
  getUserStores
} from '@/lib/admin/stores-config';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, storeId } = await request.json();

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Admin Validate] Checking access for wallet: ${walletAddress}`);
      console.log(`[Admin Validate] Requested store: ${storeId || 'none (general admin)'}`);
    }

    if (!walletAddress) {
      console.log(`[Admin Validate] No wallet address provided`);
      return NextResponse.json({
        isAdmin: false,
        session: null
      });
    }

    // Check if user has any admin access
    const hasAccess = hasAnyAdminAccess(walletAddress);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Admin Validate] Has any admin access: ${hasAccess}`);
    }

    if (!hasAccess) {
      console.log(`[Admin Validate] Access denied - no admin permissions found`);
      return NextResponse.json({
        isAdmin: false,
        session: null
      });
    }

    const isSuper = isSuperAdmin(walletAddress);
    const userStores = getUserStores(walletAddress);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Admin Validate] Is super admin: ${isSuper}`);
      console.log(`[Admin Validate] User stores: ${userStores.map(s => s.id).join(', ') || 'none'}`);
    }

    // If requesting specific store access
    if (storeId) {
      const hasStoreAccess = isSuper || userStores.some(store => store.id === storeId);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Admin Validate] Store ${storeId} access check: ${hasStoreAccess}`);
      }

      if (!hasStoreAccess) {
        console.log(`[Admin Validate] Access denied to store: ${storeId}`);
        return NextResponse.json({
          isAdmin: false,
          session: null
        });
      }

      const targetStore = userStores.find(store => store.id === storeId);
      const permissions: StoreAdminPermissions = {
        canViewOrders: true,
        canManageOrders: targetStore?.settings.allowOrderManagement || isSuper,
        canViewProducts: true,
        canManageProducts: targetStore?.settings.allowProductManagement || isSuper,
        canViewAnalytics: targetStore?.settings.allowAnalytics || isSuper,
        canManageSettings: isSuper
      };

      const session: AdminSession = {
        walletAddress,
        storeId,
        storeName: targetStore?.name || null,
        permissions,
        isStoreAdmin: true,
        isSuperAdmin: isSuper
      };

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Admin Validate] Access granted to store: ${storeId} (${targetStore?.name})`);
      }

      return NextResponse.json({
        isAdmin: true,
        session
      });
    }

    // General admin access (no specific store)
    const defaultPermissions: StoreAdminPermissions = {
      canViewOrders: true,
      canManageOrders: isSuper,
      canViewProducts: true,
      canManageProducts: isSuper,
      canViewAnalytics: true,
      canManageSettings: isSuper
    };

    const session: AdminSession = {
      walletAddress,
      storeId: null,
      storeName: null,
      permissions: defaultPermissions,
      isStoreAdmin: userStores.length > 0,
      isSuperAdmin: isSuper
    };

    return NextResponse.json({
      isAdmin: true,
      session,
      availableStores: userStores.map(store => ({
        id: store.id,
        name: store.name,
        slug: store.slug
      }))
    });

  } catch (error) {
    console.error('Admin validation error:', error);
    return NextResponse.json({
      isAdmin: false,
      session: null
    });
  }
}
