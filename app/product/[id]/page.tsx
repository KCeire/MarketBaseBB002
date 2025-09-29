// app/product/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MarketplaceProduct } from '@/types/shopify';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { toast } from '@/app/components/ui/Toast';
import { QuantitySelector } from '@/app/components/product/QuantitySelector';
import { ShareButton } from '@/app/components/product/ShareButton';
import Image from 'next/image';

interface CartItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  image: string;
  quantity: number;
  sku: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const productId = params.id as string;

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shopify/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      const foundProduct = data.products?.find((p: MarketplaceProduct) => p.id.toString() === productId);
      
      if (!foundProduct) {
        throw new Error('Product not found');
      }
      
      setProduct(foundProduct);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, fetchProduct]);

  const addToCart = async (product: MarketplaceProduct, variantIndex: number = 0) => {
    setAddingToCart(true);
    
    try {
      const variant = product.variants[variantIndex];
      const cartItem: CartItem = {
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        variant: variant.title,
        price: variant.price,
        image: product.image,
        quantity,
        sku: `BS-${product.id}-${variant.id}`,
      };

      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if item already exists
      const existingIndex = existingCart.findIndex((item: CartItem) => item.variantId === variant.id);
      
      if (existingIndex >= 0) {
        existingCart[existingIndex].quantity += quantity;
      } else {
        existingCart.push(cartItem);
      }
      
      // Save back to localStorage
        localStorage.setItem('cart', JSON.stringify(existingCart));

        // Dispatch cart update event for layout
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        // Show success feedback
        toast.addedToCart(`${quantity}x ${product.title}`);
        // Reset quantity to 1 after adding
        setQuantity(1);
        } catch (err) {
        console.error('Failed to add item to cart:', err);
        toast.error('Add to Cart Failed', 'Please try again');
        }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center py-8">
            <div className="text-gray-500 dark:text-gray-400">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-400">Error: {error || 'Product not found'}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goBack}
              className="mt-2"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with back button */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            icon={<Icon name="arrow-left" size="sm" />}
          >
            Back to Shop
          </Button>
        </div>

        {/* Demo Warning Banner */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-yellow-800 text-sm font-semibold text-center">
            ⚠️ DEMO VERSION - DO NOT PURCHASE ⚠️
          </p>
          <p className="text-yellow-700 text-xs text-center mt-1">
            This is a development version for testing only
          </p>
        </div>

        {/* Product Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Product Image */}
          <div className="w-full">
            <Image 
              src={product.image} 
              alt={product.title}
              width={600}
              height={400}
              className="w-full h-80 object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{product.title}</h1>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl font-bold text-blue-600">
                    ${((parseFloat(product.variants[selectedVariant]?.price || product.price) * quantity).toFixed(2))}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ${((parseFloat(product.compareAtPrice) * quantity).toFixed(2))}
                    </span>
                  )}
                  {quantity > 1 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      (${product.variants[selectedVariant]?.price || product.price} each)
                    </span>
                  )}
                </div>
              </div>

              {/* Top Action Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Actions:</h3>

                  {/* Top Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => addToCart(product, selectedVariant)}
                      disabled={!product.variants[selectedVariant]?.available || addingToCart}
                      loading={addingToCart}
                      className="w-full"
                      icon={!addingToCart ? <Icon name="shopping-cart" size="sm" /> : undefined}
                    >
                      {product.variants[selectedVariant]?.available
                        ? (addingToCart ? 'Adding...' : `Add ${quantity}x to Cart`)
                        : 'Out of Stock'
                      }
                    </Button>
                    <ShareButton
                      product={{
                        id: product.id,
                        title: product.title,
                        price: product.variants[selectedVariant]?.price || product.price,
                        image: product.image,
                        description: product.description
                      }}
                      variant="outline"
                      size="md"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Variants Selection */}
            {product.variants.length > 1 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Options:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((variant, index) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === index ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariant(index)}
                      disabled={!variant.available}
                      className="justify-start"
                    >
                      {variant.title} - ${variant.price}
                      {!variant.available && " (Out of Stock)"}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Quantity Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quantity:</h3>
              <div className="flex items-center space-x-4">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={product.variants[selectedVariant]?.inventory || 99}
                  disabled={!product.variants[selectedVariant]?.available}
                  size="md"
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total: <span className="font-semibold text-blue-600">
                    ${((parseFloat(product.variants[selectedVariant]?.price || product.price) * quantity).toFixed(2))}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Description:</h3>
              <div 
                className="text-gray-600 dark:text-gray-400 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: product.description || 'No description available.' 
                }}
              />
            </div>

            {/* Bottom Action Section */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Purchase Options:</h3>

                {/* Bottom Quantity Display */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Selected Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <QuantitySelector
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={product.variants[selectedVariant]?.inventory || 99}
                      disabled={!product.variants[selectedVariant]?.available}
                      size="sm"
                    />
                    <span className="font-semibold text-blue-600">
                      ${((parseFloat(product.variants[selectedVariant]?.price || product.price) * quantity).toFixed(2))}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => addToCart(product, selectedVariant)}
                    disabled={!product.variants[selectedVariant]?.available || addingToCart}
                    loading={addingToCart}
                    className="w-full"
                    icon={!addingToCart ? <Icon name="shopping-cart" size="sm" /> : undefined}
                  >
                    {product.variants[selectedVariant]?.available
                      ? (addingToCart ? 'Adding to Cart...' : `Add ${quantity}x to Cart - $${((parseFloat(product.variants[selectedVariant]?.price || product.price) * quantity).toFixed(2))}`)
                      : 'Out of Stock'
                    }
                  </Button>

                  <ShareButton
                    product={{
                      id: product.id,
                      title: product.title,
                      price: product.variants[selectedVariant]?.price || product.price,
                      image: product.image,
                      description: product.description
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
