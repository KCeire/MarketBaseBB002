// app/components/stores/apex-athletics/ApexAthleticsStorefront.tsx
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

const apexAthleticsProducts: Product[] = [
  {
    id: 'running-shoes-pro',
    name: 'Apex Pro Running Shoes',
    description: 'Professional-grade running shoes with advanced cushioning and breathable mesh for optimal performance.',
    price: 149.99,
    compareAtPrice: 199.99,
    image: '/AppMedia/running-shoes.jpg',
    category: 'footwear',
    inStock: true,
    vendor: 'Apex Athletics',
    rating: 4.9,
    reviews: 256
  },
  {
    id: 'gym-equipment-set',
    name: 'Home Gym Equipment Set',
    description: 'Complete home gym setup with adjustable dumbbells, resistance bands, and workout mat.',
    price: 299.99,
    compareAtPrice: 399.99,
    image: '/AppMedia/gym-equipment.jpg',
    category: 'equipment',
    inStock: true,
    vendor: 'Apex Athletics',
    rating: 4.8,
    reviews: 189
  },
  {
    id: 'athletic-wear',
    name: 'Performance Athletic Wear Set',
    description: 'Moisture-wicking athletic wear designed for maximum comfort during intense workouts.',
    price: 89.99,
    image: '/AppMedia/athletic-wear.jpg',
    category: 'apparel',
    inStock: true,
    vendor: 'Apex Athletics',
    rating: 4.7,
    reviews: 198
  },
  {
    id: 'outdoor-backpack',
    name: 'Adventure Outdoor Backpack',
    description: 'Waterproof hiking backpack with multiple compartments and ergonomic design for long treks.',
    price: 129.99,
    compareAtPrice: 159.99,
    image: '/AppMedia/outdoor-backpack.jpg',
    category: 'outdoor',
    inStock: true,
    vendor: 'Apex Athletics',
    rating: 4.6,
    reviews: 134
  },
  {
    id: 'protein-supplements',
    name: 'Sports Nutrition Supplements',
    description: 'Premium protein powder and pre-workout supplements to fuel your fitness journey.',
    price: 59.99,
    image: '/AppMedia/supplements.jpg',
    category: 'nutrition',
    inStock: true,
    vendor: 'Apex Athletics',
    rating: 4.5,
    reviews: 223
  },
  {
    id: 'yoga-accessories',
    name: 'Premium Yoga Accessories Kit',
    description: 'Complete yoga kit with eco-friendly mat, blocks, strap, and carrying bag.',
    price: 79.99,
    compareAtPrice: 99.99,
    image: '/AppMedia/yoga-kit.jpg',
    category: 'fitness',
    inStock: true,
    vendor: 'Apex Athletics',
    rating: 4.8,
    reviews: 167
  }
];

const categories = [
  { id: 'all', name: 'All Products', count: apexAthleticsProducts.length },
  { id: 'footwear', name: 'Footwear', count: apexAthleticsProducts.filter(p => p.category === 'footwear').length },
  { id: 'equipment', name: 'Equipment', count: apexAthleticsProducts.filter(p => p.category === 'equipment').length },
  { id: 'apparel', name: 'Apparel', count: apexAthleticsProducts.filter(p => p.category === 'apparel').length },
  { id: 'outdoor', name: 'Outdoor', count: apexAthleticsProducts.filter(p => p.category === 'outdoor').length },
  { id: 'nutrition', name: 'Nutrition', count: apexAthleticsProducts.filter(p => p.category === 'nutrition').length },
  { id: 'fitness', name: 'Fitness', count: apexAthleticsProducts.filter(p => p.category === 'fitness').length }
];

export function ApexAthleticsStorefront() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? apexAthleticsProducts
    : apexAthleticsProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-800 to-orange-900">
      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-md border-b border-orange-200/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-orange-100 hover:text-orange-200 hover:bg-orange-500/10 border-orange-300/30"
                icon={<Icon name="arrow-left" size="sm" />}
              >
                Back to Main Store
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-white">
                    <path d="M6 16L16 6l10 10-10 10L6 16z" fill="currentColor"/>
                    <path d="M12 10l8 8M20 10l-8 8" stroke="white" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Apex Athletics</h1>
                  <p className="text-orange-200 text-sm">Gear Up for Greatness</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-orange-200">
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
              Gear Up for <span className="text-orange-400">Greatness</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Professional sports equipment, fitness gear, and outdoor adventure essentials
              for athletes of all levels. Push your limits.
            </p>
            <div className="flex justify-center space-x-6 text-orange-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">250+</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9⭐</div>
                <div className="text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Pro</div>
                <div className="text-sm">Quality</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-orange-600/10 backdrop-blur-3xl"></div>
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
                      ? 'bg-orange-500 text-white'
                      : 'bg-white/10 text-orange-100 hover:bg-white/20'
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
                className="bg-white/10 backdrop-blur-md rounded-xl border border-orange-200/20 overflow-hidden hover:bg-white/20 transition-all duration-200 group"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <div className="text-white/60 text-6xl">
                      {product.category === 'footwear' && '👟'}
                      {product.category === 'equipment' && '🏋️'}
                      {product.category === 'apparel' && '👕'}
                      {product.category === 'outdoor' && '🎒'}
                      {product.category === 'nutrition' && '💪'}
                      {product.category === 'fitness' && '🧘'}
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
                    <p className="text-orange-100 text-sm leading-relaxed">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-orange-200">
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
                          <span className="text-orange-300 line-through text-lg">${product.compareAtPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-orange-200">
                        by {product.vendor}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!product.inStock}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
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
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Apex Athletics?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="award" size="lg" className="text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Professional Grade</h3>
              <p className="text-orange-100">Equipment trusted by professional athletes and sports teams worldwide.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="truck" size="lg" className="text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Fast Shipping</h3>
              <p className="text-orange-100">Express delivery available. Get your gear fast so you never miss a workout.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="refresh-cw" size="lg" className="text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Lifetime Support</h3>
              <p className="text-orange-100">Comprehensive warranty and lifetime customer support for all products.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/40 border-t border-orange-200/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-orange-200 space-y-2">
            <p>&copy; 2024 Apex Athletics. All rights reserved.</p>
            <p className="text-sm">Powered by Base Shop - Secure crypto payments on Base</p>
          </div>
        </div>
      </footer>
    </div>
  );
}