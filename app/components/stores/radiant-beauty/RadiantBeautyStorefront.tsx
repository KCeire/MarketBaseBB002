// app/components/stores/radiant-beauty/RadiantBeautyStorefront.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

export function RadiantBeautyStorefront() {
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
        const response = await fetch('/api/products/by-store/radiant-beauty');
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
      <section className="relative py-2 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              Embrace Your <span className="text-pink-400">Natural Radiance</span>
            </h1>
            <p className="text-xs text-pink-100 max-w-md mx-auto">
              Premium skincare, wellness products, and beauty essentials.
            </p>
            <div className="flex justify-center space-x-3 text-pink-200">
              <div className="text-center">
                <div className="text-sm font-bold text-white">{products.length}+</div>
                <div className="text-xs">Products</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">4.8⭐</div>
                <div className="text-xs">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">Clean</div>
                <div className="text-xs">Beauty</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-pink-600/10 backdrop-blur-3xl"></div>
      </section>

      {/* Products Section */}
      <section className="py-1 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
              <p className="mt-4 text-pink-200">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Error: {error}</p>
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-200"
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
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/10 text-pink-100 hover:bg-white/20'
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
                      className="bg-white/10 backdrop-blur-md rounded-xl border border-pink-200/20 overflow-hidden hover:bg-white/20 transition-all duration-200 group flex flex-col"
                    >
                      <div className="aspect-square bg-white/5 relative overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                            <div className="text-white/60 text-6xl">💄</div>
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
                          <p className="text-pink-100 text-sm leading-relaxed line-clamp-3 mb-4">{stripHtmlTags(product.description)}</p>

                          <div className="flex items-center justify-between text-sm text-pink-200 mb-4">
                            <div className="text-xs text-pink-200">
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
                                <span className="text-pink-300 line-through text-lg">${totalComparePrice}</span>
                              )}
                            </div>
                            <div className="text-xs text-pink-200">
                              dispatched by Radiant Beauty Co.
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
                                className="bg-pink-500 hover:bg-pink-600 text-white flex-1"
                                icon={<Icon name="shopping-cart" size="sm" />}
                              >
                                Add to Cart
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/product/${product.id}`)}
                              className="w-full border-pink-300/30 text-pink-200 hover:bg-pink-500/10"
                              icon={<Icon name="eye" size="sm" />}
                            >
                              View Details
                            </Button>
                          </div>

                          <div className="border-t border-pink-200/20 pt-3">
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
                              className="w-full border-pink-300/30 text-pink-200 hover:bg-pink-500/10"
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
                  <p className="text-pink-200 mb-4">No products found in this category.</p>
                </div>
              )}
            </>
          )}
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