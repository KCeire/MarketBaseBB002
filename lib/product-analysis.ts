// lib/product-analysis.ts
import { getAllProducts } from './shopify/api';
import { MarketplaceProduct } from '@/types/shopify';

export interface ProductPattern {
  keywords: string[];
  productTypes: string[];
  vendors: string[];
  tags: string[];
  sampleTitles: string[];
}

export interface StorePattern {
  storeId: string;
  storeName: string;
  category: string;
  pattern: ProductPattern;
}

// Store mappings based on your stores page
const STORE_MAPPINGS = {
  'techwave-electronics': {
    name: 'TechWave Electronics',
    category: 'Electronics'
  },
  'green-oasis-home': {
    name: 'Green Oasis Home & Garden',
    category: 'Home & Garden'
  },
  'pawsome-pets': {
    name: 'Pawsome Pet Paradise',
    category: 'Pet Products'
  },
  'radiant-beauty': {
    name: 'Radiant Beauty Co.',
    category: 'Health & Beauty'
  },
  'apex-athletics': {
    name: 'Apex Athletics',
    category: 'Sports & Outdoors'
  }
};

export async function analyzeExistingProducts(): Promise<StorePattern[]> {
  console.log('Fetching products for analysis...');

  try {
    const products = await getAllProducts();
    console.log(`Found ${products.length} products to analyze`);

    // Group products by likely category based on current logic
    const categorizedProducts = categorizeExistingProducts(products);

    // Generate patterns for each store
    const storePatterns: StorePattern[] = Object.entries(STORE_MAPPINGS).map(([storeId, storeInfo]) => {
      const storeProducts = categorizedProducts[storeId] || [];
      const pattern = extractProductPattern(storeProducts);

      console.log(`${storeInfo.name}: ${storeProducts.length} products, ${pattern.keywords.length} keywords`);

      return {
        storeId,
        storeName: storeInfo.name,
        category: storeInfo.category,
        pattern
      };
    });

    return storePatterns;
  } catch (error) {
    console.error('Failed to analyze products:', error);
    throw error;
  }
}

function categorizeExistingProducts(products: MarketplaceProduct[]) {
  const categorized: Record<string, MarketplaceProduct[]> = {
    'techwave-electronics': [],
    'green-oasis-home': [],
    'pawsome-pets': [],
    'radiant-beauty': [],
    'apex-athletics': []
  };

  products.forEach(product => {
    const searchText = `${product.title} ${product.description} ${product.productType} ${product.tags.join(' ')}`.toLowerCase();

    // Electronics keywords
    if (containsKeywords(searchText, ['phone', 'laptop', 'computer', 'electronic', 'tech', 'gadget', 'smart', 'device', 'camera', 'headphone', 'speaker', 'gaming', 'console', 'wireless', 'bluetooth'])) {
      categorized['techwave-electronics'].push(product);
    }
    // Home & Garden keywords
    else if (containsKeywords(searchText, ['home', 'garden', 'furniture', 'decor', 'kitchen', 'bathroom', 'bedroom', 'living', 'outdoor', 'plant', 'lighting', 'chair', 'table', 'bed', 'storage'])) {
      categorized['green-oasis-home'].push(product);
    }
    // Pet Products keywords
    else if (containsKeywords(searchText, ['pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'toy', 'treat', 'food', 'bowl', 'collar', 'leash', 'grooming', 'cage', 'aquarium', 'fish', 'bird'])) {
      categorized['pawsome-pets'].push(product);
    }
    // Health & Beauty keywords
    else if (containsKeywords(searchText, ['beauty', 'skin', 'cosmetic', 'makeup', 'cream', 'lotion', 'health', 'wellness', 'vitamin', 'supplement', 'hair', 'shampoo', 'nail', 'fragrance', 'perfume'])) {
      categorized['radiant-beauty'].push(product);
    }
    // Sports & Outdoors keywords
    else if (containsKeywords(searchText, ['sport', 'fitness', 'gym', 'exercise', 'workout', 'athletic', 'running', 'cycling', 'outdoor', 'camping', 'hiking', 'equipment', 'apparel', 'shoes', 'clothing'])) {
      categorized['apex-athletics'].push(product);
    }
    // If no match, try to categorize by product type or vendor
    else {
      const storeId = categorizeByFallback(product);
      if (storeId) {
        categorized[storeId].push(product);
      } else {
        // Default to electronics for tech-sounding items
        categorized['techwave-electronics'].push(product);
      }
    }
  });

  return categorized;
}

function containsKeywords(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword));
}

function categorizeByFallback(product: MarketplaceProduct): string | null {
  const type = product.productType.toLowerCase();
  const vendor = product.vendor.toLowerCase();

  // Electronics types
  if (['electronics', 'computers', 'phones', 'accessories'].some(t => type.includes(t))) {
    return 'techwave-electronics';
  }

  // Home types
  if (['home', 'furniture', 'garden', 'kitchen', 'decor'].some(t => type.includes(t))) {
    return 'green-oasis-home';
  }

  // Pet types
  if (['pet', 'animal', 'dog', 'cat'].some(t => type.includes(t))) {
    return 'pawsome-pets';
  }

  // Beauty types
  if (['beauty', 'cosmetics', 'health', 'personal care'].some(t => type.includes(t))) {
    return 'radiant-beauty';
  }

  // Sports types
  if (['sports', 'fitness', 'outdoor', 'athletic', 'apparel'].some(t => type.includes(t))) {
    return 'apex-athletics';
  }

  return null;
}

function extractProductPattern(products: MarketplaceProduct[]): ProductPattern {
  const keywords = new Set<string>();
  const productTypes = new Set<string>();
  const vendors = new Set<string>();
  const tags = new Set<string>();
  const sampleTitles: string[] = [];

  products.forEach(product => {
    // Extract keywords from title and description
    const text = `${product.title} ${product.description}`.toLowerCase();
    const words = text.match(/\b\w{3,}\b/g) || [];

    words.forEach(word => {
      if (word.length >= 3 && !isCommonWord(word)) {
        keywords.add(word);
      }
    });

    // Collect product types and vendors
    if (product.productType) productTypes.add(product.productType);
    if (product.vendor) vendors.add(product.vendor);

    // Collect tags
    product.tags.forEach(tag => tags.add(tag));

    // Sample titles (first 5)
    if (sampleTitles.length < 5) {
      sampleTitles.push(product.title);
    }
  });

  return {
    keywords: Array.from(keywords).slice(0, 50), // Limit to top 50 keywords
    productTypes: Array.from(productTypes),
    vendors: Array.from(vendors),
    tags: Array.from(tags),
    sampleTitles
  };
}

function isCommonWord(word: string): boolean {
  const commonWords = ['the', 'and', 'for', 'with', 'that', 'this', 'are', 'you', 'your', 'not', 'can', 'will', 'all', 'any', 'may', 'our', 'out', 'day', 'get', 'use', 'man', 'new', 'now', 'way', 'come', 'work', 'life', 'time', 'very', 'when', 'much', 'like', 'good', 'just', 'well', 'more', 'also', 'back', 'only', 'know', 'make', 'take', 'see', 'him', 'her', 'his', 'she', 'has', 'had'];
  return commonWords.includes(word);
}