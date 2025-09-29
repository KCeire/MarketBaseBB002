// app/components/stores/techwave-electronics/TechWaveElectronicsStorefront.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  vendor: string;
  rating: number;
  reviews: number;
}

const techWaveProducts: Product[] = [
  {
    id: 'smartphone-flagship',
    name: 'TechWave Flagship Smartphone',
    description: 'Latest generation smartphone with cutting-edge technology, 5G connectivity, and premium design.',
    price: 899.99,
    compareAtPrice: 999.99,
    image: '/AppMedia/electronics-phone.jpg',
    category: 'smartphones',
    inStock: true,
    vendor: 'TechWave',
    rating: 4.8,
    reviews: 124
  },
  {
    id: 'wireless-earbuds',
    name: 'TechWave Pro Earbuds',
    description: 'Premium wireless earbuds with active noise cancellation and superior sound quality.',
    price: 199.99,
    compareAtPrice: 249.99,
    image: '/AppMedia/electronics-earbuds.jpg',
    category: 'audio',
    inStock: true,
    vendor: 'TechWave',
    rating: 4.7,
    reviews: 89
  },
  {
    id: 'smart-watch',
    name: 'TechWave Smart Watch Pro',
    description: 'Advanced smartwatch with health monitoring, GPS, and week-long battery life.',
    price: 349.99,
    image: '/AppMedia/electronics-watch.jpg',
    category: 'wearables',
    inStock: true,
    vendor: 'TechWave',
    rating: 4.6,
    reviews: 156
  },
  {
    id: 'gaming-laptop',
    name: 'TechWave Gaming Laptop RTX',
    description: 'High-performance gaming laptop with RTX graphics and lightning-fast SSD storage.',
    price: 1599.99,
    compareAtPrice: 1799.99,
    image: '/AppMedia/electronics-laptop.jpg',
    category: 'computers',
    inStock: true,
    vendor: 'TechWave',
    rating: 4.9,
    reviews: 67
  },
  {
    id: 'smart-home-hub',
    name: 'TechWave Smart Home Hub',
    description: 'Central control hub for all your smart home devices with voice control and app integration.',
    price: 129.99,
    image: '/AppMedia/electronics-hub.jpg',
    category: 'smart-home',
    inStock: true,
    vendor: 'TechWave',
    rating: 4.5,
    reviews: 203
  },
  {
    id: 'wireless-charger',
    name: 'TechWave Fast Wireless Charger',
    description: 'Ultra-fast wireless charging pad compatible with all Qi-enabled devices.',
    price: 39.99,
    compareAtPrice: 49.99,
    image: '/AppMedia/electronics-charger.jpg',
    category: 'accessories',
    inStock: true,
    vendor: 'TechWave',
    rating: 4.4,
    reviews: 312
  }
];

const categories = [
  { id: 'all', name: 'All Products', count: techWaveProducts.length },
  { id: 'smartphones', name: 'Smartphones', count: techWaveProducts.filter(p => p.category === 'smartphones').length },
  { id: 'audio', name: 'Audio', count: techWaveProducts.filter(p => p.category === 'audio').length },
  { id: 'computers', name: 'Computers', count: techWaveProducts.filter(p => p.category === 'computers').length },
  { id: 'wearables', name: 'Wearables', count: techWaveProducts.filter(p => p.category === 'wearables').length },
  { id: 'smart-home', name: 'Smart Home', count: techWaveProducts.filter(p => p.category === 'smart-home').length },
  { id: 'accessories', name: 'Accessories', count: techWaveProducts.filter(p => p.category === 'accessories').length }
];

export function TechWaveElectronicsStorefront() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? techWaveProducts
    : techWaveProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-md border-b border-blue-200/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-blue-100 hover:text-blue-200 hover:bg-blue-500/10 border-blue-300/30"
                icon={<Icon name="arrow-left" size="sm" />}
              >
                Back to Main Store
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-white">
                    <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="16" cy="16" r="3" fill="currentColor"/>
                    <path d="M8 12h2M8 20h2M22 12h2M22 20h2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">TechWave Electronics</h1>
                  <p className="text-blue-200 text-sm">Cutting-edge Technology</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-blue-200">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-white mb-6">
              The Future of <span className="text-blue-400">Technology</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover cutting-edge gadgets and electronics. From smartphones to smart home devices,
              we have the latest tech at competitive prices.
            </p>
            <div className="flex justify-center space-x-6 text-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">150+</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.8⭐</div>
                <div className="text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-3xl"></div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-blue-100 hover:bg-white/20'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white/10 backdrop-blur-md rounded-xl border border-blue-200/20 overflow-hidden hover:bg-white/20 transition-all duration-200 group"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-white/60 text-6xl">📱</div>
                  </div>
                  {product.compareAtPrice && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        SALE
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Icon name="star" size="sm" className="text-yellow-400" />
                        <span className="ml-1">{product.rating}</span>
                      </div>
                      <span>({product.reviews} reviews)</span>
                    </div>
                    <div className="text-green-400 text-xs">
                      {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-white">${product.price}</span>
                        {product.compareAtPrice && (
                          <span className="text-blue-300 line-through text-lg">${product.compareAtPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-blue-200">
                        by {product.vendor}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!product.inStock}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      icon={<Icon name="shopping-cart" size="sm" />}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose TechWave?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="shield-check" size="lg" className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Authentic Products</h3>
              <p className="text-blue-100">All products are genuine and come with full manufacturer warranty.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="truck" size="lg" className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Fast Shipping</h3>
              <p className="text-blue-100">Free shipping on orders over $50. Express delivery available.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="headphones" size="lg" className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">24/7 Support</h3>
              <p className="text-blue-100">Expert technical support available round the clock.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/40 border-t border-blue-200/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-blue-200 space-y-2">
            <p>&copy; 2024 TechWave Electronics. All rights reserved.</p>
            <p className="text-sm">Powered by Base Shop - Secure crypto payments on Base</p>
          </div>
        </div>
      </footer>
    </div>
  );
}