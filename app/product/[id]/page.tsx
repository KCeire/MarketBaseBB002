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
import Link from 'next/link';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

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

  // Simple function to get store URL from vendor name
  const getStoreUrl = (vendor: string) => {
    const vendorLower = vendor.toLowerCase();
    if (vendorLower.includes('techwave')) return '/store/techwave-electronics';
    if (vendorLower.includes('apex')) return '/store/apex-athletics';
    if (vendorLower.includes('pawsome')) return '/store/pawsome-pets';
    if (vendorLower.includes('radiant')) return '/store/radiant-beauty';
    if (vendorLower.includes('green') || vendorLower.includes('oasis')) return '/store/green-oasis-home';
    return null; // No store page available
  };

  const openGallery = () => {
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const previousImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  // Handle keyboard navigation in gallery
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGalleryOpen) return;

      switch (event.key) {
        case 'Escape':
          closeGallery();
          break;
        case 'ArrowLeft':
          previousImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen]);

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
          {/* Product Image Gallery */}
          <div className="w-full">
            {product.images && product.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="w-full relative group">
                  <button
                    onClick={openGallery}
                    className="w-full relative overflow-hidden rounded-t-lg"
                  >
                    <Image
                      src={product.images[selectedImageIndex] || product.image}
                      alt={`${product.title} - Image ${selectedImageIndex + 1}`}
                      width={600}
                      height={400}
                      className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                      priority
                    />
                    {/* Overlay with expand icon */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Icon name="expand" size="lg" className="text-gray-700" />
                      </div>
                    </div>
                  </button>

                  {/* Click hint */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Click to expand
                  </div>
                </div>

                {/* Thumbnail Gallery - Only show if multiple images */}
                {product.images.length > 1 && (
                  <div className="px-6 pb-4">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index
                              ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.title} thumbnail ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Image counter */}
                    <div className="text-center mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Image {selectedImageIndex + 1} of {product.images.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Fallback for single image */
              <div className="w-full relative group">
                <button
                  onClick={openGallery}
                  className="w-full relative overflow-hidden rounded-t-lg"
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={600}
                    height={400}
                    className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                  {/* Overlay with expand icon */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Icon name="expand" size="lg" className="text-gray-700" />
                    </div>
                  </div>
                </button>

                {/* Click hint */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to expand
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{product.title}</h1>

                {/* Sold By Vendor Information */}
                {product.vendor && (
                  <div className="mb-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span>Sold by</span>
                      {getStoreUrl(product.vendor) ? (
                        <Link
                          href={getStoreUrl(product.vendor)!}
                          className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
                        >
                          {product.vendor}
                        </Link>
                      ) : (
                        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                          {product.vendor}
                        </span>
                      )}
                    </div>
                  </div>
                )}

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

      {/* Fullscreen Gallery Modal */}
      {isGalleryOpen && product && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95">
          <div className="h-full w-full flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between text-white p-4 flex-shrink-0 bg-black bg-opacity-30">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg md:text-xl font-semibold truncate">{product.title}</h2>
                <span className="text-sm opacity-75 flex-shrink-0">
                  {selectedImageIndex + 1} of {product.images?.length || 1}
                </span>
              </div>
              <button
                onClick={closeGallery}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors flex-shrink-0"
              >
                <Icon name="x" size="lg" className="text-white" />
              </button>
            </div>

            {/* Main Image Container - Takes remaining space */}
            <div className="flex-1 relative flex items-center justify-center min-h-0">
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <Image
                  src={product.images?.[selectedImageIndex] || product.image}
                  alt={`${product.title} - Image ${selectedImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>

              {/* Navigation Arrows - Only show if multiple images */}
              {product.images && product.images.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={previousImage}
                    className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition-colors z-10"
                  >
                    <Icon name="chevron-left" size="lg" />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={nextImage}
                    className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 md:p-3 rounded-full transition-colors z-10"
                  >
                    <Icon name="chevron-right" size="lg" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Section with Thumbnails and Instructions */}
            <div className="flex-shrink-0 bg-black bg-opacity-30 p-4">
              {/* Thumbnail Strip - Only show if multiple images */}
              {product.images && product.images.length > 1 && (
                <div className="mb-4">
                  <div className="flex justify-center">
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index
                              ? 'border-white ring-2 ring-white ring-opacity-50'
                              : 'border-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.title} thumbnail ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="text-center text-white text-xs md:text-sm opacity-75">
                {product.images && product.images.length > 1 && (
                  <span className="hidden md:inline">Use arrow keys or click arrows to navigate • </span>
                )}
                <span>Press ESC to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
