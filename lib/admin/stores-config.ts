// lib/admin/stores-config.ts - Store configuration and access control

import { StoreConfig } from '@/types/admin';

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

// Store configurations with admin wallet access control from environment variables
export const STORE_CONFIGS: StoreConfig[] = [
  {
    id: 'techwave-electronics',
    name: 'TechWave Electronics',
    slug: 'techwave-electronics',
    description: 'Electronics and tech gadgets',
    adminWallets: getStoreAdminWallets('techwave-electronics'),
    isActive: true,
    settings: {
      allowOrderManagement: true,
      allowProductManagement: true,
      allowAnalytics: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'green-oasis-home',
    name: 'Green Oasis Home',
    slug: 'green-oasis-home',
    description: 'Home and garden products',
    adminWallets: getStoreAdminWallets('green-oasis-home'),
    isActive: true,
    settings: {
      allowOrderManagement: true,
      allowProductManagement: true,
      allowAnalytics: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pawsome-pets',
    name: 'Pawsome Pets',
    slug: 'pawsome-pets',
    description: 'Pet supplies and accessories',
    adminWallets: getStoreAdminWallets('pawsome-pets'),
    isActive: true,
    settings: {
      allowOrderManagement: true,
      allowProductManagement: true,
      allowAnalytics: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'radiant-beauty',
    name: 'Radiant Beauty',
    slug: 'radiant-beauty',
    description: 'Beauty and cosmetics',
    adminWallets: getStoreAdminWallets('radiant-beauty'),
    isActive: true,
    settings: {
      allowOrderManagement: true,
      allowProductManagement: true,
      allowAnalytics: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'apex-athletics',
    name: 'Apex Athletics',
    slug: 'apex-athletics',
    description: 'Sports and fitness gear',
    adminWallets: getStoreAdminWallets('apex-athletics'),
    isActive: true,
    settings: {
      allowOrderManagement: true,
      allowProductManagement: true,
      allowAnalytics: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nft-energy',
    name: 'NFT Energy',
    slug: 'nft-energy',
    description: 'Energy drinks and branded merchandise',
    adminWallets: getStoreAdminWallets('nft-energy'),
    isActive: true,
    settings: {
      allowOrderManagement: true,
      allowProductManagement: true,
      allowAnalytics: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Super admin wallet addresses (have access to all stores) - using existing env var
export const SUPER_ADMIN_WALLETS = process.env.ADMIN_WALLET_ADDRESSES?.split(',').map(addr => addr.trim()).filter(addr => addr.length > 0) || [];

// Environment variable validation
function validateWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Validate all wallet addresses on module load (skip test/placeholder values)
STORE_CONFIGS.forEach(store => {
  store.adminWallets.forEach(wallet => {
    if (wallet !== 'test' && !validateWalletAddress(wallet)) {
      console.warn(`Invalid wallet address format for store ${store.id}: ${wallet}`);
    }
  });
});

SUPER_ADMIN_WALLETS.forEach(wallet => {
  if (wallet !== 'test' && !validateWalletAddress(wallet)) {
    console.warn(`Invalid super admin wallet address format: ${wallet}`);
  }
});

// Helper functions
export function getStoreConfig(storeId: string): StoreConfig | null {
  return STORE_CONFIGS.find(store => store.id === storeId) || null;
}

export function getStoreConfigBySlug(slug: string): StoreConfig | null {
  return STORE_CONFIGS.find(store => store.slug === slug) || null;
}

export function getAllActiveStores(): StoreConfig[] {
  return STORE_CONFIGS.filter(store => store.isActive);
}

export function isStoreAdmin(walletAddress: string, storeId: string): boolean {
  const store = getStoreConfig(storeId);
  if (!store) return false;

  return store.adminWallets.some(
    adminAddr => adminAddr !== 'test' && adminAddr.toLowerCase() === walletAddress.toLowerCase()
  );
}

export function isSuperAdmin(walletAddress: string): boolean {
  return SUPER_ADMIN_WALLETS.some(
    adminAddr => adminAddr !== 'test' && adminAddr.toLowerCase() === walletAddress.toLowerCase()
  );
}

export function getUserStores(walletAddress: string): StoreConfig[] {
  // Super admins have access to all stores
  if (isSuperAdmin(walletAddress)) {
    return getAllActiveStores();
  }

  // Return stores where user is an admin
  return STORE_CONFIGS.filter(store =>
    store.isActive && isStoreAdmin(walletAddress, store.id)
  );
}

export function hasAnyAdminAccess(walletAddress: string): boolean {
  return isSuperAdmin(walletAddress) || getUserStores(walletAddress).length > 0;
}