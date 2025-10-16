// lib/admin/stores-server.ts - Server-side store utilities with database access

import { StoreConfig } from '@/types/admin';
import { supabaseAdmin } from '@/lib/supabase/client';
import {
  getAllActiveStores,
  isSuperAdmin,
  isStoreAdmin,
  SUPER_ADMIN_WALLETS
} from './stores-config';

// Helper function to get admin wallets from environment variables
function getStoreAdminWallets(storeId: string): string[] {
  // Use full store ID for environment variable naming
  const envVarName = `STORE_ADMIN_WALLETS_${storeId.toUpperCase().replace(/-/g, '_')}`;
  const envVar = process.env[envVarName];

  // Debug logging to help with troubleshooting
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Store Config] Checking env var: ${envVarName} for store: ${storeId}`);
    console.log(`[Store Config] Value: ${envVar ? `Found (${envVar.split(',').length} wallets)` : 'Not found'}`);
  }

  return envVar ? envVar.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0) : [];
}

// Server-side function to fetch database stores directly
export async function getDatabaseStores(): Promise<StoreConfig[]> {
  try {
    const { data: stores, error } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching database stores:', error);
      return [];
    }

    // Convert database stores to StoreConfig format
    const databaseStores: StoreConfig[] = stores.map((store: any) => {
      // Get admin wallets from environment variables
      const envAdminWallets = getStoreAdminWallets(store.id);

      // Include database admin wallet if present
      const databaseAdminWallet = store.admin_wallet ? [store.admin_wallet] : [];

      // Combine and deduplicate admin wallets
      const allAdminWallets = [...new Set([...envAdminWallets, ...databaseAdminWallet])];

      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        adminWallets: allAdminWallets, // Combine env vars and database admin wallets
        isActive: store.is_active,
        settings: store.settings || {
          allowOrderManagement: true,
          allowProductManagement: true,
          allowAnalytics: true,
        },
        createdAt: store.created_at,
        updatedAt: store.updated_at || store.created_at,
      };
    });

    return databaseStores;
  } catch (error) {
    console.error('Error in getDatabaseStores:', error);
    return [];
  }
}

// Hybrid store loading - combines static stores with database stores (SERVER-SIDE ONLY)
export async function getAllStoresWithDatabase(): Promise<StoreConfig[]> {
  try {
    // Get static stores
    const staticStores = getAllActiveStores();

    // Get database stores
    const databaseStores = await getDatabaseStores();

    // Combine and deduplicate (prefer database version if ID conflicts)
    const allStores = [...staticStores];
    databaseStores.forEach(dbStore => {
      const existingIndex = allStores.findIndex(s => s.id === dbStore.id);
      if (existingIndex >= 0) {
        allStores[existingIndex] = dbStore; // Replace with database version
      } else {
        allStores.push(dbStore); // Add new database store
      }
    });

    return allStores.filter(store => store.isActive);
  } catch (error) {
    console.error('Error in getAllStoresWithDatabase:', error);
    return getAllActiveStores(); // Fallback to static stores
  }
}

// Updated user stores function to work with hybrid loading (SERVER-SIDE ONLY)
export async function getUserStoresWithDatabase(walletAddress: string): Promise<StoreConfig[]> {
  // Super admins have access to all stores
  if (isSuperAdmin(walletAddress)) {
    return await getAllStoresWithDatabase();
  }

  // Get all stores (static + database) and filter by access
  const allStores = await getAllStoresWithDatabase();
  return allStores.filter(store =>
    store.isActive && isStoreAdminWithDatabase(walletAddress, store.id)
  );
}

// Async version that checks both static and database stores (SERVER-SIDE ONLY)
export function isStoreAdminWithDatabase(walletAddress: string, storeId: string): boolean {
  // Check if super admin first
  if (isSuperAdmin(walletAddress)) {
    return true;
  }

  // Check static stores first
  if (isStoreAdmin(walletAddress, storeId)) {
    return true;
  }

  // Check database stores by looking up admin wallets from env vars
  const adminWallets = getStoreAdminWallets(storeId);
  return adminWallets.some(
    adminAddr => adminAddr !== 'test' && adminAddr.toLowerCase() === walletAddress.toLowerCase()
  );
}

// Async version that checks both static and database stores (SERVER-SIDE ONLY)
export async function hasAnyAdminAccessWithDatabase(walletAddress: string): Promise<boolean> {
  if (isSuperAdmin(walletAddress)) {
    return true;
  }

  const userStores = await getUserStoresWithDatabase(walletAddress);
  return userStores.length > 0;
}