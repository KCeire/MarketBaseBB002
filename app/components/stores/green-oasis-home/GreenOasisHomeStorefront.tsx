// app/components/stores/green-oasis-home/GreenOasisHomeStorefront.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import type { MarketplaceProduct } from '@/types/shopify';
import { addProductToCart } from '@/lib/cart-utils';

// Helper function to strip HTML tags from description
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Helper function to get unique categories from products
function getProductCategories(products: MarketplaceProduct[]) {
  const categoryMap = new Map();

  // Add "All Products" category
  categoryMap.set('all', { id: 'all', name: 'All Products', count: products.length });

  // Count products by productType
  products.forEach(product => {
    const category = product.productType.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const categoryName = product.productType;

    if (categoryMap.has(category)) {
      categoryMap.get(category).count++;
    } else {
      categoryMap.set(category, { id: category, name: categoryName, count: 1 });
    }
  });

  return Array.from(categoryMap.values());
}

export function GreenOasisHomeStorefront() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/by-store/green-oasis-home');
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
        } else {
          setError(data.error || 'Failed to load products');
        }
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = getProductCategories(products);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => {
        const category = product.productType.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return category === selectedCategory;
      });

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
                <div className="text-2xl font-bold text-white">{products.length}+</div>
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
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              <p className="mt-4 text-green-200">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-200"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Products Content */}
          {!loading && !error && (
            <>
              {/* Category Filter */}
              {categories.length > 1 && (
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
              )}

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/10 backdrop-blur-md rounded-xl border border-green-200/20 overflow-hidden hover:bg-white/20 transition-all duration-200 group"
                    >
                      <div className="aspect-square bg-white/5 relative overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                            <div className="text-white/60 text-6xl">🏠</div>
                          </div>
                        )}
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
                          <h3 className="text-lg font-bold text-white mb-2">{product.title}</h3>
                          <p className="text-green-100 text-sm leading-relaxed line-clamp-3">{stripHtmlTags(product.description)}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-green-200">
                          <div className="text-xs text-green-200">
                            {product.productType}
                          </div>
                          <div className="text-green-400 text-xs">
                            ✓ Available
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
                              dispatched by Green Oasis Home & Garden
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => addProductToCart(product, 1)}
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
              ) : (
                <div className="text-center py-12">
                  <p className="text-green-200 mb-4">No products found in this category.</p>
                </div>
              )}
            </>
          )}
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