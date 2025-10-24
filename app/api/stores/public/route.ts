// app/api/stores/public/route.ts - Public API to get all available stores (static + connected Shopify)
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface PublicStore {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  logo?: string;
  previewImage?: string;
  path: string;
  status: 'beta' | 'active';
  featured: boolean;
  type: 'static' | 'shopify';
  stats?: {
    products: number;
    rating: number;
    reviews: number;
  };
}

// Static stores configuration
const STATIC_STORES: PublicStore[] = [
  {
    id: 'nft-energy',
    name: 'NFT Energy Drinks',
    description: 'Where Web3 meets real energy. Official NFT Energy drinks and exclusive merchandise from the community-driven brand.',
    category: 'Food & Beverage',
    image: '/stores/nft-energy-preview.jpg',
    logo: '/stores/NFTEnergyDrinks/NFTEnergyDrinksLogo.png',
    previewImage: '/StorePage/nft-energy.jpeg',
    path: '/store/nft-energy',
    status: 'beta',
    featured: true,
    type: 'static',
    stats: {
      products: 6,
      rating: 5.0,
      reviews: 12
    }
  },
  {
    id: 'techwave-electronics',
    name: 'TechWave Electronics',
    description: 'Cutting-edge gadgets and electronics. From smartphones to smart home devices, we have the latest tech at competitive prices.',
    category: 'Electronics',
    image: '/AppMedia/store-electronics.jpg',
    previewImage: '/StorePage/TechWaveElectronics.jpg',
    path: '/store/techwave-electronics',
    status: 'beta',
    featured: true,
    type: 'static',
    stats: {
      products: 150,
      rating: 4.8,
      reviews: 89
    }
  },
  {
    id: 'green-oasis-home',
    name: 'Green Oasis Home & Garden',
    description: 'Transform your space into a beautiful oasis. Premium furniture, decor, gardening tools, and outdoor essentials for modern living.',
    category: 'Home & Garden',
    image: '/AppMedia/store-home-garden.jpg',
    previewImage: '/StorePage/green-oasis-home.jpg',
    path: '/store/green-oasis-home',
    status: 'beta',
    featured: true,
    type: 'static',
    stats: {
      products: 200,
      rating: 4.9,
      reviews: 156
    }
  },
  {
    id: 'pawsome-pets',
    name: 'Pawsome Pet Paradise',
    description: 'Everything your furry friends need to live their best life. Quality food, toys, accessories, and health products for all pets.',
    category: 'Pet Products',
    image: '/AppMedia/store-pet-products.jpg',
    previewImage: '/StorePage/pawsome-pets.jpg',
    path: '/store/pawsome-pets',
    status: 'beta',
    featured: false,
    type: 'static',
    stats: {
      products: 120,
      rating: 4.7,
      reviews: 73
    }
  },
  {
    id: 'radiant-beauty',
    name: 'Radiant Beauty Co.',
    description: 'Discover your natural glow with premium skincare, wellness products, and beauty essentials from trusted brands worldwide.',
    category: 'Health & Beauty',
    image: '/AppMedia/store-health-beauty.jpg',
    previewImage: '/StorePage/radiant-beauty.jpg',
    path: '/store/radiant-beauty',
    status: 'beta',
    featured: false,
    type: 'static',
    stats: {
      products: 180,
      rating: 4.8,
      reviews: 94
    }
  },
  {
    id: 'apex-athletics',
    name: 'Apex Athletics',
    description: 'Gear up for greatness. Professional sports equipment, fitness gear, and outdoor adventure essentials for athletes of all levels.',
    category: 'Sports & Outdoors',
    image: '/AppMedia/store-sports-outdoors.jpg',
    previewImage: '/StorePage/apex-athletics.jpg',
    path: '/store/apex-athletics',
    status: 'beta',
    featured: false,
    type: 'static',
    stats: {
      products: 250,
      rating: 4.9,
      reviews: 134
    }
  }
];

export async function GET() {
  try {
    // Get all connected Shopify stores from database
    const { data: shopifyStores, error } = await supabaseAdmin
      .from('stores')
      .select('id, name, description, shopify_integration_status, created_at')
      .eq('shopify_integration_status', 'connected')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching Shopify stores:', error);
    }

    // Transform Shopify stores to PublicStore format
    const connectedShopifyStores: PublicStore[] = (shopifyStores || []).map(store => ({
      id: store.id,
      name: store.name || store.id,
      description: store.description || `Browse products from ${store.name || store.id}`,
      category: 'Online Store',
      previewImage: `/StorePage/${store.id}.jpg`, // Use store ID for preview image
      path: `/store/${store.id}`,
      status: 'active' as const,
      featured: false,
      type: 'shopify' as const,
      stats: {
        products: 0, // Will be populated by frontend
        rating: 4.5,
        reviews: 0
      }
    }));

    // Combine static stores with connected Shopify stores
    // Give priority to Shopify stores when there are duplicate IDs
    const shopifyStoreIds = new Set(connectedShopifyStores.map(store => store.id));
    const filteredStaticStores = STATIC_STORES.filter(store => !shopifyStoreIds.has(store.id));
    const allStores = [...filteredStaticStores, ...connectedShopifyStores];

    console.log(`Returning ${allStores.length} stores (${filteredStaticStores.length} static + ${connectedShopifyStores.length} Shopify)`);

    return NextResponse.json({
      success: true,
      stores: allStores,
      counts: {
        total: allStores.length,
        static: filteredStaticStores.length,
        shopify: connectedShopifyStores.length
      }
    });

  } catch (error) {
    console.error('Error in public stores API:', error);

    // Fallback to static stores only
    return NextResponse.json({
      success: true,
      stores: STATIC_STORES,
      counts: {
        total: STATIC_STORES.length,
        static: STATIC_STORES.length,
        shopify: 0
      },
      warning: 'Shopify stores could not be loaded'
    });
  }
}