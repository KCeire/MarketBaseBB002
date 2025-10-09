// app/stores/page.tsx - FIXED: Removed unused comingSoonStores variable
"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import Image from 'next/image';
import { getAllStoreProducts } from '@/lib/stores';
import '@/lib/stores/nft-energy'; // Import to register NFT Energy store
import type { MarketplaceProduct } from '@/types/producthub';

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  logo?: string;
  path: string;
  status: 'live' | 'coming-soon';
  featured: boolean;
  stats?: {
    products: number;
    rating: number;
    reviews: number;
  };
}

const stores: Store[] = [
  {
    id: 'nft-energy',
    name: 'NFT Energy Drinks',
    description: 'Where Web3 meets real energy. Official NFT Energy drinks and exclusive merchandise from the community-driven brand.',
    category: 'Food & Beverage',
    image: '/stores/nft-energy-preview.jpg',
    logo: '/stores/NFTEnergyDrinks/NFTEnergyDrinksLogo.png',
    path: '/store/nft-energy',
    status: 'live',
    featured: true,
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
    path: '/store/techwave-electronics',
    status: 'live',
    featured: true,
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
    path: '/store/green-oasis-home',
    status: 'live',
    featured: true,
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
    path: '/store/pawsome-pets',
    status: 'live',
    featured: false,
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
    path: '/store/radiant-beauty',
    status: 'live',
    featured: false,
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
    path: '/store/apex-athletics',
    status: 'live',
    featured: false,
    stats: {
      products: 250,
      rating: 4.9,
      reviews: 134
    }
  }
];

export default function StoresPage() {
  const router = useRouter();
  const [actualProductCounts, setActualProductCounts] = useState<Record<string, number>>({});
  const [storeProductImages, setStoreProductImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateProductCounts = async () => {
      try {
        // Get store products from registered stores (like NFT Energy)
        const storeProducts = getAllStoreProducts();

        // Get ProductHub products and map them to stores
        const productHubResponse = await fetch('/api/producthub/products');
        const productHubData = productHubResponse.ok ? await productHubResponse.json() : { products: [] };

        const counts: Record<string, number> = {};
        const productImages: Record<string, string> = {};

        // Count store products and collect first product image for each store
        storeProducts.forEach(product => {
          const storeSlug = product.storeInfo.slug;
          counts[storeSlug] = (counts[storeSlug] || 0) + 1;

          // Store the first product image for each store if not already set
          if (!productImages[storeSlug] && product.image) {
            productImages[storeSlug] = product.image;
          }

          console.log('Store product:', product.title, 'mapped to store:', storeSlug);
        });

        // Count ProductHub products mapped to stores
        (productHubData.products || []).forEach((product: MarketplaceProduct) => {
          const vendor = product.vendor.toLowerCase();
          const title = product.title.toLowerCase();
          const productType = product.productType.toLowerCase();

          let storeSlug = null;

          if (vendor.includes('apex') || title.includes('survival') || title.includes('tactical') || productType.includes('sports')) {
            storeSlug = 'apex-athletics';
          } else if (vendor.includes('techwave') || vendor.includes('tech') || productType.includes('electronics')) {
            storeSlug = 'techwave-electronics';
          } else if (vendor.includes('pawsome') || vendor.includes('pet') || productType.includes('pet')) {
            storeSlug = 'pawsome-pets';
          } else if (vendor.includes('radiant') || vendor.includes('beauty') || productType.includes('beauty')) {
            storeSlug = 'radiant-beauty';
          } else if (vendor.includes('green') || vendor.includes('oasis') || vendor.includes('home') || productType.includes('home')) {
            storeSlug = 'green-oasis-home';
          }

          if (storeSlug) {
            counts[storeSlug] = (counts[storeSlug] || 0) + 1;

            // Store the first product image for each store if not already set
            if (!productImages[storeSlug] && product.images && product.images.length > 0) {
              productImages[storeSlug] = product.images[0];
            }
          }
        });

        console.log('Final product counts:', counts);
        console.log('Store product images:', productImages);
        setActualProductCounts(counts);
        setStoreProductImages(productImages);
      } catch (error) {
        console.error('Error calculating product counts:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateProductCounts();
  }, []);

  const liveStores = stores.filter(store => store.status === 'live');

  const handleStoreClick = (store: Store) => {
    if (store.status === 'live') {
      router.push(store.path);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 main-content-with-bottom-nav">
      <div className="space-y-8">

        {/* Featured Stores - Live */}
        {liveStores.length > 0 && (
          <section>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {liveStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group relative"
                >
                  {/* Product Image Background - covers 70% of entire card */}
                  {storeProductImages[store.id] && (
                    <div className="absolute inset-x-0 top-0 h-[70%] z-0">
                      <Image
                        src={storeProductImages[store.id]}
                        alt="Store product"
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 ${
                        store.id === 'nft-energy' ? 'bg-gradient-to-br from-slate-900/60 via-blue-900/50 to-cyan-900/60' :
                        store.id === 'techwave-electronics' ? 'bg-gradient-to-br from-blue-500/60 via-blue-600/50 to-indigo-700/60' :
                        store.id === 'green-oasis-home' ? 'bg-gradient-to-br from-green-500/60 via-emerald-600/50 to-teal-700/60' :
                        store.id === 'pawsome-pets' ? 'bg-gradient-to-br from-purple-500/60 via-violet-600/50 to-purple-700/60' :
                        store.id === 'radiant-beauty' ? 'bg-gradient-to-br from-pink-500/60 via-rose-500/50 to-pink-600/60' :
                        store.id === 'apex-athletics' ? 'bg-gradient-to-br from-orange-500/60 via-red-500/50 to-orange-600/60' :
                        'bg-gradient-to-br from-gray-500/60 via-gray-600/50 to-gray-700/60'
                      }`}></div>
                    </div>
                  )}

                  {/* Gradient Background Fallback - covers entire card */}
                  <div className={`absolute inset-0 -z-10 ${
                    store.id === 'nft-energy' ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900' :
                    store.id === 'techwave-electronics' ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700' :
                    store.id === 'green-oasis-home' ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700' :
                    store.id === 'pawsome-pets' ? 'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700' :
                    store.id === 'radiant-beauty' ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600' :
                    store.id === 'apex-athletics' ? 'bg-gradient-to-br from-orange-500 via-red-500 to-orange-600' :
                    'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700'
                  }`}></div>

                  {/* Store Image/Preview */}
                  <div className="aspect-[4/3] md:aspect-video relative overflow-hidden z-10">
                    {store.id === 'nft-energy' ? (
                      <div className="relative z-10 flex items-center justify-center h-full pt-8">
                        <div className="text-center space-y-4">
                          {store.logo && (
                            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl p-2 border border-white/30">
                              <Image
                                src={store.logo}
                                alt={`${store.name} logo`}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}
                          <p className="text-white text-sm font-bold drop-shadow-2xl" style={{textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'}}>
                            {store.name}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 flex items-center justify-center h-full pt-8">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 bg-white/25 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md border border-white/40">
                            {/* Custom logos for each store */}
                            {store.id === 'techwave-electronics' && (
                              <div className="text-white text-2xl">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                                  <circle cx="16" cy="16" r="3" fill="currentColor"/>
                                  <path d="M8 12h2M8 20h2M22 12h2M22 20h2" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                              </div>
                            )}
                            {store.id === 'green-oasis-home' && (
                              <div className="text-white text-2xl">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <path d="M16 4L28 14v14H20v-8h-8v8H4V14L16 4z" fill="currentColor"/>
                                  <circle cx="22" cy="10" r="3" fill="#4ade80"/>
                                  <circle cx="26" cy="14" r="2" fill="#4ade80"/>
                                  <circle cx="24" cy="6" r="2" fill="#4ade80"/>
                                </svg>
                              </div>
                            )}
                            {store.id === 'pawsome-pets' && (
                              <div className="text-white text-2xl">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <ellipse cx="12" cy="12" rx="3" ry="4" fill="currentColor"/>
                                  <ellipse cx="20" cy="12" rx="3" ry="4" fill="currentColor"/>
                                  <ellipse cx="8" cy="18" rx="2" ry="3" fill="currentColor"/>
                                  <ellipse cx="24" cy="18" rx="2" ry="3" fill="currentColor"/>
                                  <ellipse cx="16" cy="22" rx="4" ry="3" fill="currentColor"/>
                                </svg>
                              </div>
                            )}
                            {store.id === 'radiant-beauty' && (
                              <div className="text-white text-2xl">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M16 8v16M8 16h16" stroke="currentColor" strokeWidth="1"/>
                                  <circle cx="16" cy="16" r="3" fill="#fbbf24"/>
                                  <circle cx="12" cy="12" r="1" fill="currentColor"/>
                                  <circle cx="20" cy="12" r="1" fill="currentColor"/>
                                  <circle cx="12" cy="20" r="1" fill="currentColor"/>
                                  <circle cx="20" cy="20" r="1" fill="currentColor"/>
                                </svg>
                              </div>
                            )}
                            {store.id === 'apex-athletics' && (
                              <div className="text-white text-2xl">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <path d="M6 16L16 6l10 10-10 10L6 16z" fill="currentColor"/>
                                  <path d="M12 10l8 8M20 10l-8 8" stroke="white" strokeWidth="2"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          <p className="text-white text-sm font-bold drop-shadow-2xl" style={{textShadow: '0 0 10px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'}}>
                            {store.name}
                          </p>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-2 right-2 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-2 left-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                      </div>
                    )}
                    
                    

                  </div>

                  {/* Store Info */}
                  <div className="p-3 md:p-6 space-y-2 md:space-y-4 mt-2">
                    {/* Store Badge */}
                    <div className="flex items-center justify-center">
                      {store.id === 'nft-energy' ? (
                        <div className="flex items-center space-x-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"></polygon>
                          </svg>
                          <span className="text-xs">Featured</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16,6 23,6 23,16 16,16"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                          </svg>
                          <span className="text-xs">Shipping Included</span>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full text-xs md:text-sm py-2 md:py-3"
                        icon={<Icon name="shopping-cart" size="sm" />}
                      >
                        <span className="hidden sm:inline">Visit Store</span>
                        <span className="sm:hidden">Visit</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Success Showcase - Testimonial Style */}
        <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800 p-8">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Why Sellers Choose Base Shop
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Instant Payments</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get paid instantly in USDC. No waiting 2-7 days for traditional payment processing.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">🌍</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Global Reach</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sell to anyone, anywhere with a crypto wallet. No geographic restrictions.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">💰</div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Low Fees</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Competitive rates with transparent pricing. No hidden fees or surprise charges.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Become a Seller CTA */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl mx-auto flex items-center justify-center">
              <Icon name="store" size="lg" className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Want to Open Your Store?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Join our marketplace and start selling your products with crypto payments. 
              Get your own customizable storefront and reach Web3 customers.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/sell')}
              icon={<Icon name="arrow-right" size="sm" />}
            >
              Apply to Sell
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {stores.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Stores
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {loading ? '...' : Object.values(actualProductCounts).reduce((sum, count) => sum + count, 0) || '900+'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Products Listed
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center relative">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              $50K+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Monthly Volume
            </div>
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center relative">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              4.8⭐
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Rating
            </div>
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}