// app/components/stores/green-oasis-home/GreenOasisHomeStorefront.tsx
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

const greenOasisProducts: Product[] = [
  {
    id: 'premium-sofa',
    name: 'Premium Living Room Sofa',
    description: 'Luxurious 3-seater sofa with premium fabric upholstery and ergonomic design for maximum comfort.',
    price: 1299.99,
    compareAtPrice: 1599.99,
    image: '/AppMedia/furniture-sofa.jpg',
    category: 'furniture',
    inStock: true,
    vendor: 'Green Oasis',
    rating: 4.9,
    reviews: 87
  },
  {
    id: 'garden-tool-set',
    name: 'Professional Garden Tool Set',
    description: 'Complete 15-piece garden tool set with ergonomic handles and durable stainless steel construction.',
    price: 89.99,
    compareAtPrice: 119.99,
    image: '/AppMedia/garden-tools.jpg',
    category: 'gardening',
    inStock: true,
    vendor: 'Green Oasis',
    rating: 4.7,
    reviews: 156
  },
  {
    id: 'dining-table',
    name: 'Oak Wood Dining Table',
    description: 'Handcrafted solid oak dining table that seats 6 people comfortably. Perfect for family gatherings.',
    price: 899.99,
    image: '/AppMedia/furniture-table.jpg',
    category: 'furniture',
    inStock: true,
    vendor: 'Green Oasis',
    rating: 4.8,
    reviews: 93
  },
  {
    id: 'outdoor-planters',
    name: 'Ceramic Outdoor Planters Set',
    description: 'Beautiful set of 3 ceramic planters in different sizes, perfect for your patio or garden.',
    price: 149.99,
    compareAtPrice: 199.99,
    image: '/AppMedia/garden-planters.jpg',
    category: 'gardening',
    inStock: true,
    vendor: 'Green Oasis',
    rating: 4.6,
    reviews: 124
  },
  {
    id: 'pendant-lights',
    name: 'Modern Pendant Light Fixture',
    description: 'Stylish pendant lights with adjustable height, perfect for kitchen islands or dining areas.',
    price: 199.99,
    image: '/AppMedia/home-lighting.jpg',
    category: 'decor',
    inStock: true,
    vendor: 'Green Oasis',
    rating: 4.5,
    reviews: 78
  },
  {
    id: 'outdoor-furniture',
    name: 'Weather-Resistant Patio Set',
    description: 'Complete outdoor furniture set with UV-resistant cushions and powder-coated aluminum frame.',
    price: 749.99,
    compareAtPrice: 899.99,
    image: '/AppMedia/outdoor-furniture.jpg',
    category: 'outdoor',
    inStock: true,
    vendor: 'Green Oasis',
    rating: 4.7,
    reviews: 112
  }
];

const categories = [
  { id: 'all', name: 'All Products', count: greenOasisProducts.length },
  { id: 'furniture', name: 'Furniture', count: greenOasisProducts.filter(p => p.category === 'furniture').length },
  { id: 'gardening', name: 'Gardening', count: greenOasisProducts.filter(p => p.category === 'gardening').length },
  { id: 'decor', name: 'Home Decor', count: greenOasisProducts.filter(p => p.category === 'decor').length },
  { id: 'outdoor', name: 'Outdoor', count: greenOasisProducts.filter(p => p.category === 'outdoor').length }
];

export function GreenOasisHomeStorefront() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredProducts = selectedCategory === 'all'
    ? greenOasisProducts
    : greenOasisProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-md border-b border-green-200/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-green-100 hover:text-green-200 hover:bg-green-500/10 border-green-300/30"
                icon={<Icon name="arrow-left" size="sm" />}
              >
                Back to Main Store
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="text-white">
                    <path d="M16 4L28 14v14H20v-8h-8v8H4V14L16 4z" fill="currentColor"/>
                    <circle cx="22" cy="10" r="3" fill="#4ade80"/>
                    <circle cx="26" cy="14" r="2" fill="#4ade80"/>
                    <circle cx="24" cy="6" r="2" fill="#4ade80"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Green Oasis Home & Garden</h1>
                  <p className="text-green-200 text-sm">Transform Your Space</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-green-200">
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
              Create Your <span className="text-green-400">Perfect Oasis</span>
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Transform your space into a beautiful oasis. Premium furniture, decor, gardening tools,
              and outdoor essentials for modern living.
            </p>
            <div className="flex justify-center space-x-6 text-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">200+</div>
                <div className="text-sm">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4.9⭐</div>
                <div className="text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Free</div>
                <div className="text-sm">Delivery</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-green-600/10 backdrop-blur-3xl"></div>
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
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-green-100 hover:bg-white/20'
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
                className="bg-white/10 backdrop-blur-md rounded-xl border border-green-200/20 overflow-hidden hover:bg-white/20 transition-all duration-200 group"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <div className="text-white/60 text-6xl">
                      {product.category === 'furniture' && '🛋️'}
                      {product.category === 'gardening' && '🌱'}
                      {product.category === 'decor' && '🏠'}
                      {product.category === 'outdoor' && '🌳'}
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
                    <p className="text-green-100 text-sm leading-relaxed">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-green-200">
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
                          <span className="text-green-300 line-through text-lg">${product.compareAtPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-green-200">
                        by {product.vendor}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!product.inStock}
                      className="bg-green-500 hover:bg-green-600 text-white"
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
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Green Oasis?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="leaf" size="lg" className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Eco-Friendly</h3>
              <p className="text-green-100">Sustainably sourced materials and environmentally conscious products.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="truck" size="lg" className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Free Delivery</h3>
              <p className="text-green-100">Free white-glove delivery and setup on all furniture orders.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Icon name="award" size="lg" className="text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Quality Guarantee</h3>
              <p className="text-green-100">30-day satisfaction guarantee on all purchases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-black/40 border-t border-green-200/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-green-200 space-y-2">
            <p>&copy; 2024 Green Oasis Home & Garden. All rights reserved.</p>
            <p className="text-sm">Powered by Base Shop - Secure crypto payments on Base</p>
          </div>
        </div>
      </footer>
    </div>
  );
}