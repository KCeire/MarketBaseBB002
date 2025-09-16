// lib/shopify/api.ts

import { 
  ShopifyProduct, 
  ShopifyProductsResponse, 
  MarketplaceProduct
} from '@/types/shopify';

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-07';

if (!SHOPIFY_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
  throw new Error('Missing required Shopify environment variables');
}

const SHOPIFY_API_URL = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}`;

class ShopifyApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ShopifyApiError';
    this.status = status;
  }
}

async function shopifyFetch<T>(endpoint: string): Promise<T> {
  const url = `${SHOPIFY_API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ShopifyApiError(
        `Shopify API error: ${response.statusText}`, 
        response.status
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ShopifyApiError) {
      throw error;
    }
    throw new ShopifyApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
      500
    );
  }
}

export async function getAllProducts(): Promise<MarketplaceProduct[]> {
  try {
    const response = await shopifyFetch<ShopifyProductsResponse>(
      '/products.json?status=active&limit=250'
    );
    
    return response.products.map(transformShopifyProduct);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

export async function getProductById(id: number): Promise<MarketplaceProduct | null> {
  try {
    const response = await shopifyFetch<{ product: ShopifyProduct }>(
      `/products/${id}.json`
    );
    
    return transformShopifyProduct(response.product);
  } catch (error) {
    if (error instanceof ShopifyApiError && error.status === 404) {
      return null;
    }
    console.error(`Failed to fetch product ${id}:`, error);
    throw error;
  }
}

export async function getProductByHandle(handle: string): Promise<MarketplaceProduct | null> {
  try {
    const response = await shopifyFetch<{ product: ShopifyProduct }>(
      `/products/${handle}.json`
    );
    
    return transformShopifyProduct(response.product);
  } catch (error) {
    if (error instanceof ShopifyApiError && error.status === 404) {
      return null;
    }
    console.error(`Failed to fetch product ${handle}:`, error);
    throw error;
  }
}

function transformShopifyProduct(product: ShopifyProduct): MarketplaceProduct {
  const images = product.images.map(img => img.src);
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

// Test API connection
export async function testShopifyConnection(): Promise<boolean> {
  try {
    await shopifyFetch<{ shop: unknown }>('/shop.json');
    return true;
  } catch (error) {
    console.error('Shopify connection test failed:', error);
    return false;
  }
}
