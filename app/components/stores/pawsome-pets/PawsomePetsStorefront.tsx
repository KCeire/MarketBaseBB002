// app/components/stores/pawsome-pets/PawsomePetsStorefront.tsx
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

const pawsomeProducts: Product[] = [
  {
    id: 'premium-dog-food',
    name: 'Premium Organic Dog Food',
    description: 'Nutrient-rich organic dog food made with real meat and vegetables. Perfect for all life stages.',
    price: 49.99,
    compareAtPrice: 59.99,
    image: '/AppMedia/pet-food.jpg',
    category: 'food',
    inStock: true,
    vendor: 'Pawsome Pets',
    rating: 4.8,
    reviews: 234
  },
  {
    id: 'interactive-cat-toy',
    name: 'Interactive Cat Puzzle Toy',
    description: 'Engaging puzzle toy that keeps cats mentally stimulated and entertained for hours.',
    price: 24.99,
    image: '/AppMedia/cat-toy.jpg',
    category: 'toys',
    inStock: true,
    vendor: 'Pawsome Pets',
    rating: 4.7,
    reviews: 156
  },
  {
    id: 'luxury-dog-bed',
    name: 'Luxury Orthopedic Dog Bed',
    description: 'Memory foam dog bed with washable cover. Provides superior comfort for aging joints.',
    price: 89.99,
    compareAtPrice: 119.99,
    image: '/AppMedia/dog-bed.jpg',
    category: 'accessories',
    inStock: true,
    vendor: 'Pawsome Pets',
    rating: 4.9,
    reviews: 98
  },
  {
    id: 'pet-grooming-kit',
    name: 'Complete Pet Grooming Kit',
    description: 'Professional-grade grooming tools including brushes, nail clippers, and shampoo.',
    price: 34.99,
    image: '/AppMedia/grooming-kit.jpg',
    category: 'grooming',
    inStock: true,
    vendor: 'Pawsome Pets',
    rating: 4.6,
    reviews: 187
  },
  {
    id: 'bird-cage-large',
    name: 'Spacious Bird Cage with Stand',
    description: 'Large bird cage with multiple perches, feeding stations, and easy-clean design.',
    price: 159.99,
    compareAtPrice: 199.99,
    image: '/AppMedia/bird-cage.jpg',
    category: 'accessories',
    inStock: true,
    vendor: 'Pawsome Pets',
    rating: 4.5,
    reviews: 67
  },
  {
    id: 'fish-tank-starter',
    name: 'Aquarium Starter Kit',
    description: 'Complete 20-gallon aquarium kit with filter, heater, and LED lighting system.',
    price: 129.99,
    image: '/AppMedia/fish-tank.jpg',
    category: 'aquarium',
    inStock: true,
    vendor: 'Pawsome Pets',
    rating: 4.7,
    reviews: 143
  }
];

const categories = [
  { id: 'all', name: 'All Products', count: pawsomeProducts.length },
  { id: 'food', name: 'Pet Food', count: pawsomeProducts.filter(p => p.category === 'food').length },
  { id: 'toys', name: 'Toys', count: pawsomeProducts.filter(p => p.category === 'toys').length },
  { id: 'accessories', name: 'Accessories', count: pawsomeProducts.filter(p => p.category === 'accessories').length },
  { id: 'grooming', name: 'Grooming', count: pawsomeProducts.filter(p => p.category === 'grooming').length },
  { id: 'aquarium', name: 'Aquarium', count: pawsomeProducts.filter(p => p.category === 'aquarium').length }
];

export function PawsomePetsStorefront() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? pawsomeProducts
    : pawsomeProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900">
      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-md border-b border-purple-200/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-purple-100 hover:text-purple-200 hover:bg-purple-500/10 border-purple-300/30"
                icon={<Icon name="arrow-left" size="sm" />}
              >
                Back to Main Store
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-white">
                    <ellipse cx="12" cy="12" rx="3" ry="4" fill="currentColor"/>
                    <ellipse cx="20" cy="12" rx="3" ry="4" fill="currentColor"/>
                    <ellipse cx="8" cy="18" rx="2" ry="3" fill="currentColor"/>
                    <ellipse cx="24" cy="18" rx="2" ry="3" fill="currentColor"/>
                    <ellipse cx="16" cy="22" rx="4" ry="3" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Pawsome Pet Paradise</h1>
                  <p className="text-purple-200 text-sm">Everything for Your Furry Friends</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-purple-200">
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
              Your Pet's <span className="text-purple-400">Paradise</span>
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Everything your furry friends need to live their best life. Quality food, toys,
              accessories, and health products for all pets.
            </p>
            <div className="flex justify-center space-x-6 text-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">120+</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.7⭐</div>
                <div className="text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Expert</div>
                <div className="text-sm">Advice</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-purple-600/10 backdrop-blur-3xl"></div>
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
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-purple-100 hover:bg-white/20'
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
                className="bg-white/10 backdrop-blur-md rounded-xl border border-purple-200/20 overflow-hidden hover:bg-white/20 transition-all duration-200 group"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <div className="text-white/60 text-6xl">
                      {product.category === 'food' && '🥘'}
                      {product.category === 'toys' && '🎾'}
                      {product.category === 'accessories' && '🛏️'}
                      {product.category === 'grooming' && '✂️'}
                      {product.category === 'aquarium' && '🐠'}
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
                    <p className="text-purple-100 text-sm leading-relaxed">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-purple-200">
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
                          <span className="text-purple-300 line-through text-lg">${product.compareAtPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-purple-200">
                        by {product.vendor}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!product.inStock}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
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
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Pawsome Pets?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="heart" size="lg" className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Pet-First Quality</h3>
              <p className="text-purple-100">All products are tested and approved by veterinarians and pet experts.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="truck" size="lg" className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Fast Delivery</h3>
              <p className="text-purple-100">Free shipping on orders over $35. Same-day delivery available in select areas.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="phone" size="lg" className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Expert Support</h3>
              <p className="text-purple-100">Talk to our pet care experts for personalized advice and recommendations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/40 border-t border-purple-200/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-purple-200 space-y-2">
            <p>&copy; 2024 Pawsome Pet Paradise. All rights reserved.</p>
            <p className="text-sm">Powered by Base Shop - Secure crypto payments on Base</p>
          </div>
        </div>
      </footer>
    </div>
  );
}