// lib/store-assignment.ts
import { MarketplaceProduct } from '@/types/shopify';
import { analyzeExistingProducts, StorePattern } from './product-analysis';

let storePatterns: StorePattern[] | null = null;

export async function initializeStorePatterns(): Promise<void> {
  if (!storePatterns) {
    console.log('Analyzing existing products to build store patterns...');
    storePatterns = await analyzeExistingProducts();
    console.log('Store patterns initialized for', storePatterns.length, 'stores');
  }
}

export function categorizeProduct(product: MarketplaceProduct): string | null {
  if (!storePatterns) {
    console.error('Store patterns not initialized. Call initializeStorePatterns() first.');
    return null;
  }

  const searchText = `${product.title} ${product.description} ${product.productType} ${product.tags.join(' ')}`.toLowerCase();

  // Score each store based on pattern matches
  const scores = storePatterns.map(storePattern => {
    let score = 0;

    // Check product type matches (high weight)
    if (storePattern.pattern.productTypes.some(type =>
      product.productType.toLowerCase().includes(type.toLowerCase()) ||
      type.toLowerCase().includes(product.productType.toLowerCase())
    )) {
      score += 15;
    }

    // Check vendor matches (medium weight)
    if (storePattern.pattern.vendors.some(vendor =>
      product.vendor.toLowerCase().includes(vendor.toLowerCase()) ||
      vendor.toLowerCase().includes(product.vendor.toLowerCase())
    )) {
      score += 10;
    }

    // Check tag matches (medium weight)
    product.tags.forEach(productTag => {
      if (storePattern.pattern.tags.some(patternTag =>
        productTag.toLowerCase().includes(patternTag.toLowerCase()) ||
        patternTag.toLowerCase().includes(productTag.toLowerCase())
      )) {
        score += 8;
      }
    });

    // Check keyword matches (lower weight but important)
    storePattern.pattern.keywords.forEach(keyword => {
      if (searchText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });

    return {
      storeId: storePattern.storeId,
      storeName: storePattern.storeName,
      category: storePattern.category,
      score
    };
  });

  // Find best match
  const bestMatch = scores.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  // Require minimum score to avoid random assignments
  const minimumScore = 5;
  if (bestMatch.score < minimumScore) {
    console.log(`Product "${product.title}" score too low (${bestMatch.score}), no store assigned`);
    return null;
  }

  console.log(`Product "${product.title}" assigned to ${bestMatch.storeName} (score: ${bestMatch.score})`);
  return bestMatch.storeId;
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
    vendor: '',
    handle: '',
    variants: []
  };

  return categorizeProduct(product);
}

export function getStoreInfo(storeId: string | null) {
  if (!storeId || !storePatterns) return null;

  const pattern = storePatterns.find(p => p.storeId === storeId);
  return pattern ? {
    name: pattern.storeName,
    category: pattern.category
  } : null;
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