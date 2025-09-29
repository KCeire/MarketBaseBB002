// app/components/stores/radiant-beauty/RadiantBeautyStorefront.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';

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

const radiantBeautyProducts: Product[] = [
  {
    id: 'vitamin-c-serum',
    name: 'Radiant Vitamin C Brightening Serum',
    description: 'Powerful vitamin C serum that brightens skin tone and reduces signs of aging with antioxidant protection.',
    price: 34.99,
    compareAtPrice: 49.99,
    image: '/AppMedia/beauty-serum.jpg',
    category: 'skincare',
    inStock: true,
    vendor: 'Radiant Beauty',
    rating: 4.8,
    reviews: 312
  },
  {
    id: 'luxury-makeup-set',
    name: 'Professional Makeup Palette Set',
    description: 'Complete makeup palette with eyeshadows, blush, and highlighter in versatile, wearable shades.',
    price: 79.99,
    compareAtPrice: 99.99,
    image: '/AppMedia/makeup-palette.jpg',
    category: 'makeup',
    inStock: true,
    vendor: 'Radiant Beauty',
    rating: 4.7,
    reviews: 189
  },
  {
    id: 'hyaluronic-moisturizer',
    name: 'Hydrating Hyaluronic Acid Moisturizer',
    description: 'Lightweight moisturizer with hyaluronic acid for deep hydration and plump, healthy-looking skin.',
    price: 29.99,
    image: '/AppMedia/moisturizer.jpg',
    category: 'skincare',
    inStock: true,
    vendor: 'Radiant Beauty',
    rating: 4.9,
    reviews: 267
  },
  {
    id: 'collagen-supplements',
    name: 'Marine Collagen Beauty Supplements',
    description: 'Premium marine collagen capsules to support skin elasticity, hair strength, and nail health.',
    price: 44.99,
    compareAtPrice: 59.99,
    image: '/AppMedia/supplements.jpg',
    category: 'wellness',
    inStock: true,
    vendor: 'Radiant Beauty',
    rating: 4.6,
    reviews: 145
  },
  {
    id: 'skincare-tools',
    name: 'Facial Massage Tool Set',
    description: 'Rose quartz facial tools including gua sha and roller for lymphatic drainage and relaxation.',
    price: 39.99,
    image: '/AppMedia/beauty-tools.jpg',
    category: 'tools',
    inStock: true,
    vendor: 'Radiant Beauty',
    rating: 4.5,
    reviews: 98
  },
  {
    id: 'organic-cleanser',
    name: 'Gentle Organic Facial Cleanser',
    description: 'Organic botanical cleanser that removes impurities while maintaining skin\'s natural moisture barrier.',
    price: 24.99,
    compareAtPrice: 32.99,
    image: '/AppMedia/cleanser.jpg',
    category: 'skincare',
    inStock: true,
    vendor: 'Radiant Beauty',
    rating: 4.7,
    reviews: 203
  }
];

const categories = [
  { id: 'all', name: 'All Products', count: radiantBeautyProducts.length },
  { id: 'skincare', name: 'Skincare', count: radiantBeautyProducts.filter(p => p.category === 'skincare').length },
  { id: 'makeup', name: 'Makeup', count: radiantBeautyProducts.filter(p => p.category === 'makeup').length },
  { id: 'wellness', name: 'Wellness', count: radiantBeautyProducts.filter(p => p.category === 'wellness').length },
  { id: 'tools', name: 'Beauty Tools', count: radiantBeautyProducts.filter(p => p.category === 'tools').length }
];

export function RadiantBeautyStorefront() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? radiantBeautyProducts
    : radiantBeautyProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-rose-800 to-pink-900">
      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-md border-b border-pink-200/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-pink-100 hover:text-pink-200 hover:bg-pink-500/10 border-pink-300/30"
                icon={<Icon name="arrow-left" size="sm" />}
              >
                Back to Main Store
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-white">
                    <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 8v16M8 16h16" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="16" cy="16" r="3" fill="#fbbf24"/>
                    <circle cx="12" cy="12" r="1" fill="currentColor"/>
                    <circle cx="20" cy="12" r="1" fill="currentColor"/>
                    <circle cx="12" cy="20" r="1" fill="currentColor"/>
                    <circle cx="20" cy="20" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Radiant Beauty Co.</h1>
                  <p className="text-pink-200 text-sm">Discover Your Natural Glow</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-pink-200">
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
              Embrace Your <span className="text-pink-400">Natural Radiance</span>
            </h1>
            <p className="text-xl text-pink-100 max-w-3xl mx-auto">
              Discover your natural glow with premium skincare, wellness products,
              and beauty essentials from trusted brands worldwide.
            </p>
            <div className="flex justify-center space-x-6 text-pink-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">180+</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.8⭐</div>
                <div className="text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Clean</div>
                <div className="text-sm">Beauty</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-pink-600/10 backdrop-blur-3xl"></div>
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
                      ? 'bg-pink-500 text-white'
                      : 'bg-white/10 text-pink-100 hover:bg-white/20'
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
                className="bg-white/10 backdrop-blur-md rounded-xl border border-pink-200/20 overflow-hidden hover:bg-white/20 transition-all duration-200 group"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                    <div className="text-white/60 text-6xl">
                      {product.category === 'skincare' && '🧴'}
                      {product.category === 'makeup' && '💄'}
                      {product.category === 'wellness' && '💊'}
                      {product.category === 'tools' && '🪞'}
                    </div>
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
                    <p className="text-pink-100 text-sm leading-relaxed">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-pink-200">
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
                          <span className="text-pink-300 line-through text-lg">${product.compareAtPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-pink-200">
                        by {product.vendor}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!product.inStock}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
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
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Radiant Beauty?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="leaf" size="lg" className="text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Clean Beauty</h3>
              <p className="text-pink-100">All products are cruelty-free and made with natural, sustainable ingredients.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="award" size="lg" className="text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Expert Curated</h3>
              <p className="text-pink-100">Products selected by beauty professionals and dermatologists for effectiveness.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="heart" size="lg" className="text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Satisfaction Guarantee</h3>
              <p className="text-pink-100">30-day money-back guarantee if you&apos;re not completely satisfied.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/40 border-t border-pink-200/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-pink-200 space-y-2">
            <p>&copy; 2024 Radiant Beauty Co. All rights reserved.</p>
            <p className="text-sm">Powered by Base Shop - Secure crypto payments on Base</p>
          </div>
        </div>
      </footer>
    </div>
  );
}