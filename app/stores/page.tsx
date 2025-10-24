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
  image?: string;
  logo?: string;
  previewImage?: string;
  path: string;
  status: 'beta' | 'coming-soon' | 'active';
  featured: boolean;
  type?: 'static' | 'shopify';
  stats?: {
    products: number;
    rating: number;
    reviews: number;
  };
}

// Stores will be loaded dynamically from API

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [actualProductCounts, setActualProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Load stores from API
  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await fetch('/api/stores/public');
        const data = await response.json();

        if (data.success) {
          setStores(data.stores);
          console.log(`Loaded ${data.stores.length} stores:`, data.counts);
        } else {
          console.error('Failed to load stores:', data.error);
        }
      } catch (error) {
        console.error('Error loading stores:', error);
      }
    };

    loadStores();
  }, []);

  // Calculate product counts for all stores
  useEffect(() => {
    const calculateProductCounts = async () => {
      if (stores.length === 0) return;

      try {
        const counts: Record<string, number> = {};

        // For static stores: Get store products from registered stores and ProductHub
        const storeProducts = getAllStoreProducts();

        // Get ProductHub products and map them to stores
        const productHubResponse = await fetch('/api/producthub/products');
        const productHubData = productHubResponse.ok ? await productHubResponse.json() : { products: [] };

        // Count store products
        storeProducts.forEach(product => {
          const storeSlug = product.storeInfo.slug;
          counts[storeSlug] = (counts[storeSlug] || 0) + 1;
        });

        // Count ProductHub products mapped to static stores
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
          }
        });

        // For Shopify stores: Get product counts from their APIs
        const shopifyStores = stores.filter(store => store.type === 'shopify');
        for (const store of shopifyStores) {
          try {
            const response = await fetch(`/api/products/by-store/${store.id}`);
            const data = await response.json();

            if (data.success) {
              counts[store.id] = data.products.length;
            }
          } catch (error) {
            console.error(`Error fetching product count for Shopify store ${store.id}:`, error);
          }
        }

        console.log('Final product counts:', counts);
        setActualProductCounts(counts);
      } catch (error) {
        console.error('Error calculating product counts:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateProductCounts();
  }, [stores]);

  const activeStores = stores.filter(store => store.status === 'beta' || store.status === 'active');

  const handleStoreClick = (store: Store) => {
    if (store.status === 'beta' || store.status === 'active') {
      router.push(store.path);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 main-content-with-bottom-nav">
      <div className="space-y-8">

        {/* Featured Stores */}
        {activeStores.length > 0 && (
          <section>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {activeStores.map((store, index) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group relative"
                >
                  {/* Preview Image Background - covers 70% of entire card */}
                  {store.previewImage ? (
                    <div className="absolute inset-x-0 top-0 h-[70%] z-0">
                      <Image
                        src={store.previewImage}
                        alt={`${store.name} preview`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={index < 6}
                        className="object-cover"
                      />
                      <div className={`absolute inset-0 ${
                        store.id === 'nft-energy' ? 'bg-gradient-to-br from-slate-900/40 via-blue-900/30 to-cyan-900/40' :
                        store.id === 'techwave-electronics' ? 'bg-gradient-to-br from-blue-500/40 via-blue-600/30 to-indigo-700/40' :
                        store.id === 'green-oasis-home' ? 'bg-gradient-to-br from-green-500/40 via-emerald-600/30 to-teal-700/40' :
                        store.id === 'pawsome-pets' ? 'bg-gradient-to-br from-purple-500/40 via-violet-600/30 to-purple-700/40' :
                        store.id === 'radiant-beauty' ? 'bg-gradient-to-br from-violet-500/40 via-purple-500/30 to-fuchsia-600/40' :
                        store.id === 'apex-athletics' ? 'bg-gradient-to-br from-slate-700/40 via-gray-800/30 to-zinc-900/40' :
                        'bg-gradient-to-br from-gray-500/40 via-gray-600/30 to-gray-700/40'
                      }`}></div>
                    </div>
                  ) : null}

                  {/* Gradient Background Fallback - covers entire card */}
                  <div className={`absolute inset-0 -z-10 ${
                    store.id === 'nft-energy' ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900' :
                    store.id === 'techwave-electronics' ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700' :
                    store.id === 'green-oasis-home' ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700' :
                    store.id === 'pawsome-pets' ? 'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700' :
                    store.id === 'radiant-beauty' ? 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600' :
                    store.id === 'apex-athletics' ? 'bg-gradient-to-br from-slate-700 via-gray-800 to-zinc-900' :
                    store.type === 'shopify' ? 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700' :
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
                                priority={store.id === 'nft-energy'}
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
                                  <rect x="3" y="6" width="26" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                                  <rect x="5" y="8" width="22" height="12" fill="currentColor" opacity="0.3"/>
                                  <circle cx="16" cy="27" r="1" fill="currentColor"/>
                                  <path d="M12 27h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  <path d="M10 30h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                                  <rect x="8" y="12" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                                  <rect x="10" y="14" width="12" height="8" rx="1" fill="currentColor" opacity="0.3"/>
                                  <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
                                  <circle cx="16" cy="18" r="1.5" fill="currentColor"/>
                                  <circle cx="20" cy="18" r="1.5" fill="currentColor"/>
                                  <rect x="14" y="6" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                                  <circle cx="16" cy="4" r="1" fill="currentColor"/>
                                </svg>
                              </div>
                            )}
                            {store.id === 'apex-athletics' && (
                              <div className="text-white text-2xl">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <path d="M4 26L10 18L16 6L22 18L28 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                  <path d="M6 22L12 16L16 10L20 16L26 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                  <circle cx="16" cy="6" r="1.5" fill="currentColor"/>
                                  <path d="M2 28H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </div>
                            )}
                            {/* Default icon for Shopify stores or unknown stores */}
                            {!['techwave-electronics', 'green-oasis-home', 'pawsome-pets', 'radiant-beauty', 'apex-athletics'].includes(store.id) && (
                              <div className="text-white text-2xl">
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                  <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                                  <path d="M28 10L16 18L4 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <circle cx="24" cy="8" r="2" fill="currentColor"/>
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
                      {store.featured ? (
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
                          <span className="text-xs">
                            {store.type === 'shopify' ? 'Live Store' : 'Shipping Included'}
                          </span>
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
      </div>
    </div>
  );
}