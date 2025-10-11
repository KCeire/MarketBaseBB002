// types/producthub/index.ts

export interface ProductHubImage {
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

export interface ProductHubVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  fulfillment_service: string;
  grams: number;
  inventory_management: string | null;
  requires_shipping: boolean;
  sku: string | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: number;
  inventory_quantity: number;
  old_inventory_quantity: number;
  admin_graphql_api_id: string;
  image_id: number | null;
}

export interface ProductHubProductOption {
  id: number;
  product_id: number;
  name: string;
  position: number;
  values: string[];
}

export interface ProductHubItem {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string | null;
  template_suffix: string | null;
  published_scope: string;
  tags: string;
  status: string;
  admin_graphql_api_id: string;
  variants: ProductHubVariant[];
  options: ProductHubProductOption[];
  images: ProductHubImage[];
  image: ProductHubImage | null;
}

export interface ProductHubResponse {
  products: ProductHubItem[];
}

export interface ProductHubError {
  message: string;
  status: number;
}

// Media types for product media
export interface ProductMedia {
  id: string;
  type: 'image' | 'video' | 'model_3d' | 'external_video';
  src: string;
  alt?: string;
  preview_image?: string; // For videos and 3D models
  position?: number;
}

// Simplified product interface for our marketplace
export interface MarketplaceProduct {
  id: number;
  title: string;
  description: string;
  price: string;
  compareAtPrice: string | null;
  image: string;
  images: string[];
  videos: string[]; // NEW: Video URLs
  media: ProductMedia[]; // NEW: All media including images, videos, 3D models
  vendor: string;
  productType: string;
  handle: string;
  tags: string[];
  variants: {
    id: number;
    title: string;
    price: string;
    compareAtPrice: string | null;
    available: boolean;
    inventory: number;
    sku: string | null; // ADDED SKU FIELD
  }[];
}

// Shopping cart types
export interface CartItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  image: string;
  quantity: number;
  sku: string; // ADDED SKU FIELD
}

export interface Cart {
  items: CartItem[];
  total: string;
  itemCount: number;
}
