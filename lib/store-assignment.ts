// lib/store-assignment.ts
import { MarketplaceProduct } from '@/types/producthub';
import { analyzeExistingProducts, StorePattern } from './product-analysis';

let storePatterns: StorePattern[] | null = null;

export async function initializeStorePatterns(): Promise<void> {
  if (!storePatterns) {
    console.log('Analyzing existing products to build store patterns...');
    storePatterns = await analyzeExistingProducts();
    console.log('Store patterns initialized for', storePatterns.length, 'stores');
  }
}

// Store vendor name to store ID mapping
const VENDOR_TO_STORE_MAP: Record<string, string> = {
  'TechWave Electronics': 'techwave-electronics',
  'Green Oasis Home & Garden': 'green-oasis-home',
  'Pawsome Pet Paradise': 'pawsome-pets',
  'Radiant Beauty Co.': 'radiant-beauty',
  'Apex Athletics': 'apex-athletics'
};

export function categorizeProduct(product: MarketplaceProduct): string | null {
  // Use vendor-based categorization - simple and direct
  const storeId = VENDOR_TO_STORE_MAP[product.vendor];

  if (storeId) {
    console.log(`Product "${product.title}" assigned to ${product.vendor} (vendor-based)`);
    return storeId;
  }

  console.log(`Product "${product.title}" has unrecognized vendor "${product.vendor}", no store assigned`);
  return null;
}

export function categorizeProductByKeywords(
  title: string,
  description: string,
  productType: string,
  tags: string[]
): string | null {
  const product: MarketplaceProduct = {
    id: 0,
    title,
    description,
    productType,
    tags,
    price: '0',
    compareAtPrice: null,
    image: '',
    images: [],
    videos: [], // Add default videos
    media: [], // Add default media
    vendor: '',
    handle: '',
    variants: []
  };

  return categorizeProduct(product);
}

// Store information mapping
const STORE_INFO_MAP: Record<string, { name: string; category: string }> = {
  'techwave-electronics': { name: 'TechWave Electronics', category: 'Electronics' },
  'green-oasis-home': { name: 'Green Oasis Home & Garden', category: 'Home & Garden' },
  'pawsome-pets': { name: 'Pawsome Pet Paradise', category: 'Pet Products' },
  'radiant-beauty': { name: 'Radiant Beauty Co.', category: 'Health & Beauty' },
  'apex-athletics': { name: 'Apex Athletics', category: 'Sports & Outdoors' }
};

export function getStoreInfo(storeId: string | null) {
  if (!storeId) return null;

  return STORE_INFO_MAP[storeId] || null;
}

export async function getStorePatterns(): Promise<StorePattern[]> {
  await initializeStorePatterns();
  return storePatterns || [];
}

// Helper function to get store-specific products
export async function getProductsByStore(products: MarketplaceProduct[]) {
  await initializeStorePatterns();

  const storeProducts: Record<string, MarketplaceProduct[]> = {
    'techwave-electronics': [],
    'green-oasis-home': [],
    'pawsome-pets': [],
    'radiant-beauty': [],
    'apex-athletics': [],
    'unassigned': []
  };

  products.forEach(product => {
    const storeId = categorizeProduct(product);
    if (storeId && storeProducts[storeId]) {
      storeProducts[storeId].push(product);
    } else {
      storeProducts['unassigned'].push(product);
    }
  });

  return storeProducts;
}