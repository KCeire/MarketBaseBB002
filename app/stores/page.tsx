// app/stores/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';

interface Store {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
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
    image: '/stores/nft-energy-preview.jpg', // You'll add this image
    path: '/store/nft-energy',
    status: 'live',
    featured: true,
    stats: {
      products: 6,
      rating: 5.0,
      reviews: 0
    }
  },
  {
    id: 'aesthetic-edit',
    name: 'Aesthetic Edit',
    description: 'Curated aesthetic products and lifestyle items. Coming soon to Base Shop.',
    category: 'Lifestyle',
    image: '/stores/aesthetic-edit-preview.jpg',
    path: '/store/aesthetic-edit',
    status: 'coming-soon',
    featured: true
  },
  // Add more stores as they come online
];

export default function StoresPage() {
  const router = useRouter();

  const liveStores = stores.filter(store => store.status === 'live');
  const comingSoonStores = stores.filter(store => store.status === 'coming-soon');

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
            Seller Stores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover unique products from our verified sellers. Each store offers curated items 
            with secure USDC payments on Base.
          </p>
        </div>

        {/* Featured Stores - Live */}
        {liveStores.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Live Stores
              </h2>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Open for business</span>
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
                  <div className={`aspect-video relative overflow-hidden ${
                      store.id === 'nft-energy' 
                        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900'
                        : 'bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-600'
                    }`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {store.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm font-medium">
                          {store.name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        <span>LIVE</span>
                      </div>
                    </div>
                    
                    {store.featured && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          Featured
                        </div>
                      </div>
                    )}
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
                          {store.stats.reviews > 0 && (
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Icon name="star" size="sm" />
                              <span>{store.stats.rating} ({store.stats.reviews})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

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
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon Stores */}
        {comingSoonStores.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Coming Soon
              </h2>
              <div className="flex items-center space-x-2 text-sm text-yellow-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>In development</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden opacity-75"
                >
                  {/* Store Preview */}
                  <div className="aspect-video bg-gradient-to-br from-gray-400 to-gray-600 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {store.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm font-medium">
                          {store.name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Coming Soon Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        SOON
                      </div>
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {store.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {store.category}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {store.description}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      disabled
                    >
                      Coming Soon
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
              Total Stores
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {liveStores.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Live Stores
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              USDC
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Payments
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              Base
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Network
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
