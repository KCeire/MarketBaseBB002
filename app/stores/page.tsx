// app/stores/page.tsx - FIXED: Removed unused comingSoonStores variable
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import Image from 'next/image';

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

  const liveStores = stores.filter(store => store.status === 'live');

  const handleStoreClick = (store: Store) => {
    if (store.status === 'live') {
      router.push(store.path);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 main-content-with-bottom-nav">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Thriving Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join a vibrant community of successful sellers. Each store processes secure USDC payments 
            on Base with instant settlement and global reach.
          </p>
        </div>

        {/* Featured Stores - Live */}
        {liveStores.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Featured Stores
              </h2>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
                >
                  {/* Store Image/Preview */}
                  <div className="aspect-video relative overflow-hidden">
                    {store.id === 'nft-energy' ? (
                      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            {store.logo && (
                              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl p-2">
                                <Image 
                                  src={store.logo}
                                  alt={`${store.name} logo`}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <p className="text-white/80 text-sm font-medium">
                              {store.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`
                        ${store.id === 'techwave-electronics' ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700' : ''}
                        ${store.id === 'green-oasis-home' ? 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700' : ''}
                        ${store.id === 'pawsome-pets' ? 'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700' : ''}
                        ${store.id === 'radiant-beauty' ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600' : ''}
                        ${store.id === 'apex-athletics' ? 'bg-gradient-to-br from-orange-500 via-red-500 to-orange-600' : ''}
                      `}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-white/15 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm border border-white/20">
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
                            <p className="text-white/90 text-sm font-medium">
                              {store.name}
                            </p>
                          </div>
                        </div>
                        
                        {/* Background decoration */}
                        <div className="absolute top-2 right-2 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-2 left-2 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        <span>BETA</span>
                      </div>
                    </div>
                    
                    {store.featured && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          ⭐ Featured
                        </div>
                      </div>
                    )}

                    {/* Success indicators */}
                    <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                      <div className="bg-green-500/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                        <span>🚀</span>
                        <span>Early Access</span>
                      </div>
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {store.name}
                        </h3>
                        <Icon 
                          name="arrow-right" 
                          size="sm" 
                          className="text-gray-400 group-hover:text-blue-600 transition-colors" 
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {store.category}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {store.description}
                      </p>
                    </div>

                    {store.stats && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Icon name="package" size="sm" />
                            <span>{store.stats.products} products</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Icon name="star" size="sm" />
                            <span>{store.stats.rating} ({store.stats.reviews})</span>
                          </div>
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          📈 Growing
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        icon={<Icon name="shopping-cart" size="sm" />}
                      >
                        Visit Store
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
              900+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Products Listed
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              $50K+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Monthly Volume
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              4.8⭐
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Rating
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}