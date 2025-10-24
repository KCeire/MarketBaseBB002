// app/components/stores/ShopifyStorefront.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import type { MarketplaceProduct } from '@/types/producthub';
import { addProductToCart } from '@/lib/cart-utils';
import { ShareButton } from '@/app/components/product/ShareButton';
import { QuantitySelector } from '@/app/components/product/QuantitySelector';

interface ShopifyStorefrontProps {
  storeId: string;
}

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

export function ShopifyStorefront({ storeId }: ShopifyStorefrontProps) {
  const router = useRouter();
  const [selectedCategory] = useState('all');
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [storeInfo, setStoreInfo] = useState<{
    id: string;
    name: string;
    category: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/by-store/${storeId}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setStoreInfo(data.store);
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
  }, [storeId]);

  const categories = getProductCategories(products);

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => {
        const category = product.productType.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return category === selectedCategory;
      });

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleAddToCart = async (product: MarketplaceProduct) => {
    const quantity = quantities[product.id] || 1;

    try {
      // Pass storeId as third parameter for Shopify store products
      addProductToCart(product, quantity, storeId);

      // Reset quantity after adding to cart
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-6 main-content-with-bottom-nav">
        <div className="space-y-8">
          {/* Loading skeleton */}
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">Loading store products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-6 main-content-with-bottom-nav">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Icon name="exclamation-triangle" size="lg" className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Error Loading Store</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => router.push('/stores')} variant="primary">
            Back to Stores
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative w-full max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/30">
              <Icon name="store" size="md" className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {storeInfo?.name || storeId.charAt(0).toUpperCase() + storeId.slice(1)}
            </h1>
            <div className="flex items-center justify-center space-x-4 text-white/80">
              <div className="flex items-center space-x-1">
                <Icon name="check" size="xs" />
                <span className="text-xs">Verified Store</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="star" size="xs" />
                <span className="text-xs">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-5 left-10 w-12 h-12 bg-gray-800 rounded-full animate-pulse"></div>
          <div className="absolute top-16 right-20 w-10 h-10 bg-gray-800 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/4 w-8 h-8 bg-gray-800 rounded-full animate-pulse delay-500"></div>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 py-6 main-content-with-bottom-nav">
        <div className="space-y-6">

        {/* Shopify Integration Info Banner */}
        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 backdrop-blur-sm rounded-xl border border-indigo-700/30 p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                <Icon name="information-circle" size="sm" className="text-indigo-400" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-white">
                Seamless Shopify Integration
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                This storefront demonstrates our automated Shopify integration system. Simply connect your existing Shopify store,
                and your entire product catalog syncs instantly—no manual uploads, no complex setup. Your products, descriptions,
                and pricing update automatically, keeping your MarketBase storefront always in sync with your Shopify inventory.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/30">
                  <Icon name="check" size="xs" className="mr-1" />
                  Auto-Sync Enabled
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-700/30">
                  <Icon name="arrow-path" size="xs" className="mr-1" />
                  Real-time Updates
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-700/30">
                  <Icon name="shopping-cart" size="xs" className="mr-1" />
                  Shopify Connected
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* Products Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-lg text-gray-400">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="shopping-bag" size="lg" className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-gray-400 max-w-md mx-auto">We couldn&apos;t find any products in this category. Try browsing our other collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                  {/* Product Image */}
                  <div className="aspect-square relative bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon name="photo" size="lg" className="text-gray-400" />
                      </div>
                    )}
                    {/* Image overlay on hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {product.title}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {stripHtmlTags(product.description)}
                        </p>
                      )}
                      {product.vendor && (
                        <div className="inline-flex items-center px-2 py-1 bg-gray-700 text-gray-300 text-xs font-medium rounded-full">
                          by {product.vendor}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-white">
                              ${product.variants[0].price}
                            </span>
                            {product.variants[0].compareAtPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ${product.variants[0].compareAtPrice}
                              </span>
                            )}
                          </div>
                          {product.variants[0].compareAtPrice && (
                            <div className="text-xs text-green-600 font-medium">
                              Save ${(parseFloat(product.variants[0].compareAtPrice) - parseFloat(product.variants[0].price)).toFixed(2)}
                            </div>
                          )}
                        </div>
                        <ShareButton
                          product={{
                            id: product.id,
                            title: product.title,
                            price: product.variants[0].price,
                            image: product.image,
                            description: stripHtmlTags(product.description || ''),
                            sku: product.variants[0].sku || undefined
                          }}
                          storeId={storeId}
                        />
                      </div>
                    )}

                    {/* Quantity and Add to Cart */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-3">
                        <QuantitySelector
                          value={quantities[product.id] || 1}
                          onChange={(quantity) => handleQuantityChange(product.id.toString(), quantity)}
                          max={99}
                        />
                        <div className="text-sm text-gray-400">
                          Qty
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        variant="primary"
                        size="md"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        icon={<Icon name="shopping-cart" size="sm" />}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}