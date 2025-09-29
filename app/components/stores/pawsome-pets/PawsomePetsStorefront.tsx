// app/components/stores/pawsome-pets/PawsomePetsStorefront.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import type { MarketplaceProduct } from '@/types/shopify';
import { addProductToCart } from '@/lib/cart-utils';
import { ShareButton } from '@/app/components/product/ShareButton';
import { QuantitySelector } from '@/app/components/product/QuantitySelector';

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

export function PawsomePetsStorefront() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products/by-store/pawsome-pets');
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
      <section className="relative py-2 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              Your Pet&apos;s <span className="text-purple-400">Paradise</span>
            </h1>
            <p className="text-xs text-purple-100 max-w-md mx-auto">
              Everything your furry friends need. Quality food, toys, and health products.
            </p>
            <div className="flex justify-center space-x-3 text-purple-200">
              <div className="text-center">
                <div className="text-sm font-bold text-white">{products.length}+</div>
                <div className="text-xs">Products</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">4.7⭐</div>
                <div className="text-xs">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">Expert</div>
                <div className="text-xs">Advice</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-purple-600/10 backdrop-blur-3xl"></div>
      </section>

      {/* Products Section */}
      <section className="py-1 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="mt-4 text-purple-200">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-200"
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
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-purple-100 hover:bg-white/20'
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
                  {filteredProducts.map((product) => {
                    const quantity = quantities[product.id.toString()] || 1;
                    const totalPrice = (parseFloat(product.price) * quantity).toFixed(2);
                    const totalComparePrice = product.compareAtPrice ? (parseFloat(product.compareAtPrice) * quantity).toFixed(2) : null;

                    return (
                    <div
                      key={product.id}
                      className="bg-white/10 backdrop-blur-md rounded-xl border border-purple-200/20 overflow-hidden hover:bg-white/20 transition-all duration-200 group flex flex-col"
                    >
                      <div className="aspect-square bg-white/5 relative overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <div className="text-white/60 text-6xl">🐾</div>
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

                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2">{product.title}</h3>
                          <p className="text-purple-100 text-sm leading-relaxed line-clamp-3 mb-4">{stripHtmlTags(product.description)}</p>

                          <div className="flex items-center justify-between text-sm text-purple-200 mb-4">
                            <div className="text-xs text-purple-200">
                              {product.productType}
                            </div>
                            <div className="text-green-400 text-xs">
                              ✓ Available
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mt-auto">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl font-bold text-white">${totalPrice}</span>
                              {totalComparePrice && (
                                <span className="text-purple-300 line-through text-lg">${totalComparePrice}</span>
                              )}
                            </div>
                            <div className="text-xs text-purple-200">
                              dispatched by Pawsome Pet Paradise
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <QuantitySelector
                                value={quantity}
                                onChange={(qty) => setQuantities(prev => ({ ...prev, [product.id.toString()]: qty }))}
                                min={1}
                                max={99}
                                size="sm"
                                className="flex-shrink-0"
                              />
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  addProductToCart(product, quantity);
                                  setQuantities(prev => ({ ...prev, [product.id.toString()]: 1 }));
                                }}
                                className="bg-purple-500 hover:bg-purple-600 text-white flex-1"
                                icon={<Icon name="shopping-cart" size="sm" />}
                              >
                                Add to Cart
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/product/${product.id}`)}
                              className="w-full border-purple-300/30 text-purple-200 hover:bg-purple-500/10"
                              icon={<Icon name="eye" size="sm" />}
                            >
                              View Details
                            </Button>
                          </div>

                          <div className="border-t border-purple-200/20 pt-3">
                            <ShareButton
                              product={{
                                id: product.id,
                                title: product.title,
                                price: product.price,
                                image: product.image || '',
                                description: product.description
                              }}
                              variant="outline"
                              size="sm"
                              className="w-full border-purple-300/30 text-purple-200 hover:bg-purple-500/10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-purple-200 mb-4">No products found in this category.</p>
                </div>
              )}
            </>
          )}
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