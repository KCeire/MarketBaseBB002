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
  const [selectedCategory, setSelectedCategory] = useState('all');
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
      // Use the correct function signature - pass product and quantity directly
      addProductToCart(product, quantity);

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
    <div className="w-full max-w-6xl mx-auto px-4 py-6 main-content-with-bottom-nav">
      <div className="space-y-8">
        {/* Store Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
            <Icon name="building-storefront" size="lg" className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {storeInfo?.name || storeId}
            </h1>
            <p className="text-lg text-gray-600">
              Browse our collection of {products.length} products
            </p>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredProducts.length} products)
              </span>
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="shopping-bag" size="lg" className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try selecting a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="aspect-square relative bg-gray-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon name="photo" size="lg" className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {stripHtmlTags(product.description)}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-gray-900">
                            ${product.variants[0].price}
                          </span>
                          {product.variants[0].compareAtPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.variants[0].compareAtPrice}
                            </span>
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
                    <div className="flex items-center gap-3 pt-2">
                      <QuantitySelector
                        value={quantities[product.id] || 1}
                        onChange={(quantity) => handleQuantityChange(product.id.toString(), quantity)}
                        max={99}
                      />
                      <Button
                        onClick={() => handleAddToCart(product)}
                        variant="primary"
                        size="sm"
                        className="flex-1"
                        icon={<Icon name="shopping-cart" size="sm" />}
                      >
                        Add to Cart
                      </Button>
                    </div>

                    {/* Product Details */}
                    {product.vendor && (
                      <div className="text-xs text-gray-500">
                        by {product.vendor}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}