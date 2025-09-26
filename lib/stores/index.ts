// lib/stores/index.ts - Central Store Registry System

export interface StoreProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice?: string | null;
  image: string;
  images: string[];
  vendor: string;
  productType: string;
  handle: string;
  tags: string[];
  storeInfo: {
    name: string;
    slug: string;
    url: string;
  };
  variants: Array<{
    id: number | string;
    title: string;
    price: string;
    compareAtPrice?: string | null;
    available: boolean;
    inventory: number;
    sku?: string;
  }>;
}

export interface Store {
  name: string;
  slug: string;
  url: string;
  getProducts: () => StoreProduct[];
}

// Store registry - add new stores here
const stores: Store[] = [];

// Function to register a store (called by each store module)
export function registerStore(store: Store) {
  // Remove existing store with same slug to avoid duplicates
  const existingIndex = stores.findIndex(s => s.slug === store.slug);
  if (existingIndex >= 0) {
    stores[existingIndex] = store;
  } else {
    stores.push(store);
  }
}

// Get all products from all registered stores
export function getAllStoreProducts(): StoreProduct[] {
  return stores.flatMap(store => store.getProducts());
}

// Get products from a specific store
export function getStoreProducts(storeSlug: string): StoreProduct[] {
  const store = stores.find(s => s.slug === storeSlug);
  return store ? store.getProducts() : [];
}

// Get all registered stores
export function getAllStores(): Store[] {
  return [...stores];
}