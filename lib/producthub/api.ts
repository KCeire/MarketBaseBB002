// lib/producthub/api.ts

import {
  ProductHubItem,
  ProductHubResponse,
  MarketplaceProduct
} from '@/types/producthub';
import { categorizeProduct, initializeStorePatterns } from '../store-assignment';

const PRODUCTHUB_DOMAIN = process.env.PRODUCTHUB_DOMAIN;
const PRODUCTHUB_ACCESS_TOKEN = process.env.PRODUCTHUB_ACCESS_TOKEN;
const PRODUCTHUB_API_VERSION = process.env.PRODUCTHUB_API_VERSION || '2025-07';

if (!PRODUCTHUB_DOMAIN || !PRODUCTHUB_ACCESS_TOKEN) {
  throw new Error('Missing required ProductHub environment variables');
}

const PRODUCTHUB_API_URL = `https://${PRODUCTHUB_DOMAIN}/admin/api/${PRODUCTHUB_API_VERSION}`;

class ProductHubApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ProductHubApiError';
    this.status = status;
  }
}

async function productHubFetch<T>(endpoint: string): Promise<T> {
  const url = `${PRODUCTHUB_API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': PRODUCTHUB_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ProductHubApiError(
        `ProductHub API error: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ProductHubApiError) {
      throw error;
    }
    throw new ProductHubApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
}

export async function getAllProducts(): Promise<MarketplaceProduct[]> {
  try {
    const response = await productHubFetch<ProductHubResponse>(
      '/products.json?status=active&limit=250'
    );
    
    return response.products.map(transformProductHubItem);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

export async function getProductById(id: number): Promise<MarketplaceProduct | null> {
  try {
    const response = await productHubFetch<{ product: ProductHubItem }>(
      `/products/${id}.json`
    );
    
    return transformProductHubItem(response.product);
  } catch (error) {
    if (error instanceof ProductHubApiError && error.status === 404) {
      return null;
    }
    console.error(`Failed to fetch product ${id}:`, error);
    throw error;
  }
}

export async function getProductByHandle(handle: string): Promise<MarketplaceProduct | null> {
  try {
    const response = await productHubFetch<{ product: ProductHubItem }>(
      `/products/${handle}.json`
    );
    
    return transformProductHubItem(response.product);
  } catch (error) {
    if (error instanceof ProductHubApiError && error.status === 404) {
      return null;
    }
    console.error(`Failed to fetch product ${handle}:`, error);
    throw error;
  }
}

function transformProductHubItem(product: ProductHubItem): MarketplaceProduct {
  // Extract images from the official images array
  const productImages = product.images.map(img => img.src);

  // Extract images from description HTML
  const descriptionImages: string[] = [];
  if (product.body_html) {
    const imgRegex = /<img[^>]+src="([^">]+)"/gi;
    let match;
    while ((match = imgRegex.exec(product.body_html)) !== null) {
      const imgSrc = match[1];
      // Only add if not already in product images and is a valid image URL
      if (!productImages.includes(imgSrc) && imgSrc.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
        descriptionImages.push(imgSrc);
      }
    }
  }

  // Combine all images, with product images first
  const images = [...productImages, ...descriptionImages];
  const mainImage = product.image?.src || images[0] || '';

  return {
    id: product.id,
    title: product.title,
    description: product.body_html || '',
    price: product.variants[0]?.price || '0.00',
    compareAtPrice: product.variants[0]?.compare_at_price || null,
    image: mainImage,
    images,
    vendor: product.vendor,
    productType: product.product_type,
    handle: product.handle,
    tags: product.tags ? product.tags.split(', ') : [],
    variants: product.variants.map(variant => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compare_at_price,
      available: variant.inventory_quantity > 0,
      inventory: variant.inventory_quantity,
      sku: variant.sku,
    })),
  };
}

// Get products for a specific store
export async function getProductsForStore(storeId: string): Promise<MarketplaceProduct[]> {
  try {
    await initializeStorePatterns();
    const allProducts = await getAllProducts();

    return allProducts.filter(product => {
      const assignedStore = categorizeProduct(product);
      return assignedStore === storeId;
    });
  } catch (error) {
    console.error(`Failed to fetch products for store ${storeId}:`, error);
    throw error;
  }
}

// Get products categorized by all stores
export async function getProductsByStore(): Promise<Record<string, MarketplaceProduct[]>> {
  try {
    await initializeStorePatterns();
    const allProducts = await getAllProducts();

    const storeProducts: Record<string, MarketplaceProduct[]> = {
      'techwave-electronics': [],
      'green-oasis-home': [],
      'pawsome-pets': [],
      'radiant-beauty': [],
      'apex-athletics': [],
      'unassigned': []
    };

    allProducts.forEach(product => {
      const storeId = categorizeProduct(product);
      if (storeId && storeProducts[storeId]) {
        storeProducts[storeId].push(product);
      } else {
        storeProducts['unassigned'].push(product);
      }
    });

    return storeProducts;
  } catch (error) {
    console.error('Failed to categorize products by store:', error);
    throw error;
  }
}

// Test API connection
export async function testProductHubConnection(): Promise<boolean> {
  try {
    await productHubFetch<{ shop: unknown }>('/shop.json');
    return true;
  } catch (error) {
    console.error('ProductHub connection test failed:', error);
    return false;
  }
}
