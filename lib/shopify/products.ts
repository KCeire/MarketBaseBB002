// lib/shopify/products.ts - Utility for fetching products from Shopify API
import { supabaseAdmin } from '@/lib/supabase/client';
import { decryptApiKey } from './encryption';
import type { MarketplaceProduct } from '@/types/producthub';

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  published_scope: string;
  tags: string;
  status: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: number | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

interface ShopifyOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

interface ShopifyImage {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: number[];
  admin_graphql_api_id: string;
}

interface ShopifyApiResponse {
  products: ShopifyProduct[];
}

export interface ShopifyStoreCredentials {
  storeUrl: string;
  apiKey: string;
}

/**
 * Get decrypted Shopify credentials for a store
 */
export async function getShopifyCredentials(storeId: string): Promise<ShopifyStoreCredentials | null> {
  try {
    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .select('shopify_store_url, shopify_api_key_encrypted')
      .eq('id', storeId)
      .eq('shopify_integration_status', 'connected')
      .single();

    if (error || !store || !store.shopify_store_url || !store.shopify_api_key_encrypted) {
      console.error('Store credentials not found:', error);
      return null;
    }

    const decryptedApiKey = decryptApiKey(store.shopify_api_key_encrypted);

    return {
      storeUrl: store.shopify_store_url,
      apiKey: decryptedApiKey
    };
  } catch (error) {
    console.error('Error fetching Shopify credentials:', error);
    return null;
  }
}

/**
 * Fetch products from Shopify API
 */
export async function fetchShopifyProducts(credentials: ShopifyStoreCredentials): Promise<ShopifyProduct[]> {
  const { storeUrl, apiKey } = credentials;

  try {
    const apiUrl = `https://${storeUrl}/admin/api/2023-10/products.json`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data: ShopifyApiResponse = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
}

/**
 * Transform Shopify product to MarketplaceProduct format
 */
export function transformShopifyProduct(shopifyProduct: ShopifyProduct, storeInfo: { id: string; name: string }): MarketplaceProduct[] {
  const baseProduct = {
    id: shopifyProduct.id,
    title: shopifyProduct.title,
    bodyHtml: shopifyProduct.body_html,
    vendor: shopifyProduct.vendor,
    productType: shopifyProduct.product_type,
    createdAt: shopifyProduct.created_at,
    handle: shopifyProduct.handle,
    updatedAt: shopifyProduct.updated_at,
    publishedAt: shopifyProduct.published_at,
    templateSuffix: shopifyProduct.template_suffix,
    publishedScope: shopifyProduct.published_scope,
    tags: shopifyProduct.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    status: shopifyProduct.status,
    adminGraphqlApiId: shopifyProduct.admin_graphql_api_id,
    options: shopifyProduct.options,
    images: shopifyProduct.images.map(img => img.src),
    image: shopifyProduct.image?.src || (shopifyProduct.images.length > 0 ? shopifyProduct.images[0].src : ''),
  };

  // Create a MarketplaceProduct for each variant
  return shopifyProduct.variants.map((variant, index) => ({
    id: variant.id,
    title: variant.title === 'Default Title' ? shopifyProduct.title : `${shopifyProduct.title} - ${variant.title}`,
    description: shopifyProduct.body_html || '',
    price: variant.price,
    compareAtPrice: variant.compare_at_price,
    image: shopifyProduct.images.find(img => img.variant_ids.includes(variant.id))?.src ||
           shopifyProduct.image?.src ||
           (shopifyProduct.images.length > 0 ? shopifyProduct.images[0].src : ''),
    images: shopifyProduct.images.map(img => img.src),
    videos: [], // No video support yet
    media: [], // No media support yet
    vendor: shopifyProduct.vendor,
    productType: shopifyProduct.product_type,
    handle: `${shopifyProduct.handle}-${variant.id}`,
    tags: baseProduct.tags,
    variants: [{
      id: variant.id,
      title: variant.title,
      price: variant.price,
      compareAtPrice: variant.compare_at_price,
      available: variant.inventory_quantity > 0,
      inventory: variant.inventory_quantity,
      sku: variant.sku
    }],
    // Extra Shopify fields (not in MarketplaceProduct interface but useful)
    bodyHtml: shopifyProduct.body_html,
    createdAt: shopifyProduct.created_at,
    updatedAt: shopifyProduct.updated_at,
    publishedAt: shopifyProduct.published_at,
    templateSuffix: shopifyProduct.template_suffix,
    publishedScope: shopifyProduct.published_scope,
    status: shopifyProduct.status,
    adminGraphqlApiId: variant.admin_graphql_api_id,
    options: shopifyProduct.options,
    storeId: storeInfo.id,
    storeName: storeInfo.name
  } as MarketplaceProduct & any));
}

/**
 * Get all products for a Shopify store in MarketplaceProduct format
 */
export async function getShopifyStoreProducts(storeId: string): Promise<MarketplaceProduct[]> {
  try {
    // Get store credentials
    const credentials = await getShopifyCredentials(storeId);
    if (!credentials) {
      throw new Error('Store credentials not found or store not connected');
    }

    // Fetch products from Shopify
    const shopifyProducts = await fetchShopifyProducts(credentials);

    // Get store info for transformation
    const { data: storeInfo, error } = await supabaseAdmin
      .from('stores')
      .select('id, name')
      .eq('id', storeId)
      .single();

    if (error || !storeInfo) {
      throw new Error('Store information not found');
    }

    // Transform all products to MarketplaceProduct format
    const allProducts: MarketplaceProduct[] = [];
    for (const shopifyProduct of shopifyProducts) {
      const transformedProducts = transformShopifyProduct(shopifyProduct, storeInfo);
      allProducts.push(...transformedProducts);
    }

    return allProducts;
  } catch (error) {
    console.error(`Error getting Shopify store products for ${storeId}:`, error);
    throw error;
  }
}

/**
 * Check if a store is a connected Shopify store
 */
export async function isShopifyStore(storeId: string): Promise<boolean> {
  try {
    const { data: store, error } = await supabaseAdmin
      .from('stores')
      .select('shopify_integration_status')
      .eq('id', storeId)
      .single();

    return !error && store?.shopify_integration_status === 'connected';
  } catch (error) {
    console.error('Error checking if store is Shopify store:', error);
    return false;
  }
}