// app/nft-energy/product/[sku]/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { toast } from '@/app/components/ui/Toast';
import { QuantitySelector } from '@/app/components/product/QuantitySelector';
import { ShareButton } from '@/app/components/product/ShareButton';
import Image from 'next/image';

interface NFTEnergyProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  baseSku: string;
  category: string;
  image: string;
  variants: Array<{ id: string; name: string; available: boolean }>;
  sizes?: Array<{ size: string; price: number }>;
  useDropdown?: boolean;
  inStock: boolean;
}

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

// NFT Energy product data - same as in NFTEnergyProductGrid
const nftEnergyProducts: NFTEnergyProduct[] = [
  {
    id: 'nft-energy-12pack',
    name: 'NFT Energy Drinks - 12 Pack',
    description: 'Experience the fusion of Web3 and real energy. Our signature energy drink that fuels your digital adventures and real-world hustle.',
    basePrice: 26.99,
    baseSku: 'NFT-ENERGY-12PK',
    category: 'drinks',
    image: '/stores/NFTEnergyDrinks/NFTEnergyDrink12Pack.jpeg',
    variants: [
      { id: 'original', name: 'Original Flavor', available: true }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-tshirt',
    name: 'NFT Energy Tee',
    description: 'Rep the brand with our premium cotton tee featuring the iconic NFT Energy logo.',
    basePrice: 19.99,
    baseSku: '685381941D63E',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/mens-premium-heavyweight-tee-black-front-6853818ca2de9-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'white', name: 'White', available: true }
    ],
    sizes: [
      { size: 'S', price: 19.99 },
      { size: 'M', price: 19.99 },
      { size: 'L', price: 19.99 },
      { size: 'XL', price: 19.99 },
      { size: '2XL', price: 19.99 },
      { size: '3XL', price: 28.50 },
      { size: '4XL', price: 30.50 }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-hoodie',
    name: 'NFT Energy Hoodie',
    description: 'Stay warm while repping Web3 culture. Premium fleece hoodie with embroidered NFT Energy branding.',
    basePrice: 30.00,
    baseSku: '6853806B94625',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/unisex-heavy-blend-hoodie-black-front-6853806252ae9-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'white', name: 'White', available: true }
    ],
    sizes: [
      { size: 'S', price: 30.00 },
      { size: 'M', price: 30.00 },
      { size: 'L', price: 30.00 },
      { size: 'XL', price: 30.00 },
      { size: '2XL', price: 33.00 },
      { size: '3XL', price: 35.50 },
      { size: '4XL', price: 38.50 },
      { size: '5XL', price: 41.00 }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-sweatshirt',
    name: 'NFT Energy Sweatshirt',
    description: 'Classic crew neck sweatshirt perfect for any Web3 enthusiast. Comfortable fit with bold NFT Energy graphics.',
    basePrice: 29.50,
    baseSku: '685375E48090B',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/unisex-premium-sweatshirt-black-front-685375da34fb3-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'white', name: 'White', available: true }
    ],
    sizes: [
      { size: 'S', price: 29.50 },
      { size: 'M', price: 29.50 },
      { size: 'L', price: 29.50 },
      { size: 'XL', price: 29.50 },
      { size: '2XL', price: 30.50 },
      { size: '3XL', price: 33.50 }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-trucker-hat',
    name: 'NFT Energy Trucker Hat',
    description: 'Complete your look with our signature trucker hat. Embroidered logo, premium materials.',
    basePrice: 20.00,
    baseSku: '68537385433E6',
    category: 'accessories',
    image: '/stores/NFTEnergyDrinks/foam-trucker-hat-black-white-black-one-size-front-68537328b6d4d-300x300.jpg',
    variants: [
      { id: 'default', name: 'Standard', available: true }
    ],
    sizes: [
      { size: 'One Size', price: 20.00 }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-iphone-case',
    name: 'NFT Energy iPhone Case',
    description: 'Protect your device in style. Compatible with iPhone 12-15, featuring durable protection and NFT Energy branding.',
    basePrice: 14.50,
    baseSku: '68537282C6DB2',
    category: 'accessories',
    image: '/stores/NFTEnergyDrinks/clear-case-for-iphone-iphone-15-pro-max-case-on-phone-6853727c8a9d4-300x300.jpg',
    variants: [
      { id: 'default', name: 'Standard', available: true }
    ],
    sizes: [
      { size: 'iPhone 12', price: 14.50 },
      { size: 'iPhone 12 Pro', price: 14.50 },
      { size: 'iPhone 12 Pro Max', price: 14.50 },
      { size: 'iPhone 13', price: 14.50 },
      { size: 'iPhone 13 mini', price: 14.50 },
      { size: 'iPhone 13 Pro', price: 14.50 },
      { size: 'iPhone 13 Pro Max', price: 14.50 },
      { size: 'iPhone 14', price: 14.50 },
      { size: 'iPhone 14 Plus', price: 14.50 },
      { size: 'iPhone 14 Pro', price: 14.50 },
      { size: 'iPhone 14 Pro Max', price: 14.50 },
      { size: 'iPhone 15', price: 14.50 },
      { size: 'iPhone 15 Plus', price: 14.50 },
      { size: 'iPhone 15 Pro', price: 14.50 },
      { size: 'iPhone 15 Pro Max', price: 14.50 }
    ],
    useDropdown: true,
    inStock: true
  }
];

export default function NFTEnergyProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<NFTEnergyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const productSku = params.sku as string;

  const fetchProduct = useCallback(() => {
    try {
      setLoading(true);

      // Find product by either baseSku or product ID
      const foundProduct = nftEnergyProducts.find(p =>
        p.baseSku === productSku || p.id === productSku
      );

      if (!foundProduct) {
        throw new Error('Product not found');
      }

      setProduct(foundProduct);
      // Set default size if available
      if (foundProduct.sizes && foundProduct.sizes.length > 0) {
        setSelectedSize(foundProduct.sizes[0].size);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productSku]);

  useEffect(() => {
    if (productSku) {
      fetchProduct();
    }
  }, [productSku, fetchProduct]);

  // Helper function to generate SKU based on product, variant, and size
  const generateProductSKU = (product: NFTEnergyProduct, variantId: string, size?: string): string => {
    if (product.baseSku === 'NFT-ENERGY-12PK') {
      return product.baseSku; // Drinks don't have variants/sizes
    }

    if (product.baseSku === '68537385433E6') {
      return product.baseSku; // Hat is single product, no variants needed
    }

    if (product.baseSku === '68537282C6DB2') {
      // iPhone case - remove 'clear' from SKU, only use model
      return `${product.baseSku}_${size || 'iPhone-12'}`;
    }

    return `${product.baseSku}_${variantId}${size ? `-${size}` : ''}`;
  };

  // Helper function to get price based on size
  const getProductPrice = (product: NFTEnergyProduct, size?: string): number => {
    if (!product.sizes || !size) return product.basePrice;

    const sizePrice = product.sizes.find(s => s.size === size);
    return sizePrice ? sizePrice.price : product.basePrice;
  };

  const addToCart = async (product: NFTEnergyProduct, variantIndex: number = 0, size?: string) => {
    setAddingToCart(true);

    try {
      const variant = product.variants[variantIndex];
      const finalPrice = getProductPrice(product, size || selectedSize);
      const finalSku = generateProductSKU(product, variant.id, size || selectedSize);
      const sizeInfo = (size || selectedSize) ? ` - ${size || selectedSize}` : '';

      const cartItem: CartItem = {
        productId: parseInt(product.id.replace(/\D/g, '') || '9999'),
        variantId: parseInt(variant.id.replace(/\D/g, '') || '1'),
        title: product.name,
        variant: `${variant.name}${sizeInfo}`,
        price: finalPrice.toString(),
        image: product.image,
        quantity,
        sku: finalSku,
      };

      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

      // Check if item already exists by SKU
      const existingIndex = existingCart.findIndex((item: CartItem) => item.sku === cartItem.sku);

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
      toast.addedToCart(`${quantity}x ${product.name}${sizeInfo}`);
      // Reset quantity to 1 after adding
      setQuantity(1);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
      toast.error('Add to Cart Failed', 'Please try again');
    } finally {
      setAddingToCart(false);
    }
  };

  const goBack = () => {
    router.push('/store/nft-energy');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center py-8">
            <div className="text-cyan-100/60">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
            <p className="text-red-400">Error: {error || 'Product not found'}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mt-2 text-cyan-100 hover:text-cyan-200"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = getProductPrice(product, selectedSize);
  const currentSku = generateProductSKU(product, product.variants[selectedVariant]?.id || product.variants[0].id, selectedSize);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with back button */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            icon={<Icon name="arrow-left" size="sm" />}
            className="text-cyan-100 hover:text-cyan-200 hover:bg-cyan-500/10"
          >
            Back to NFT Energy Store
          </Button>
        </div>

        {/* Product Card */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl border border-cyan-200/20 overflow-hidden">
          {/* Product Image */}
          <div className="w-full">
            <Image
              src={product.image}
              alt={product.name}
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
                <h1 className="text-2xl font-bold mb-2 text-cyan-100">{product.name}</h1>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    ${(currentPrice * quantity).toFixed(2)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-sm text-cyan-100/60">
                      (${currentPrice.toFixed(2)} each)
                    </span>
                  )}
                </div>
                <div className="text-xs text-cyan-100/40 mb-4">
                  SKU: {currentSku}
                </div>
              </div>

              {/* Top Action Section */}
              <div className="border border-cyan-200/20 rounded-lg p-4 bg-black/20">
                <div className="space-y-3">
                  <h3 className="font-semibold text-cyan-100">Quick Actions:</h3>

                  {/* Top Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => addToCart(product, selectedVariant, selectedSize)}
                      disabled={!product.inStock || addingToCart}
                      loading={addingToCart}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-0"
                      icon={!addingToCart ? <Icon name="shopping-cart" size="sm" /> : undefined}
                    >
                      {product.inStock
                        ? (addingToCart ? 'Adding...' : `Add ${quantity}x to Cart`)
                        : 'Out of Stock'
                      }
                    </Button>
                    <ShareButton
                      product={{
                        id: product.id,
                        title: product.name,
                        price: currentPrice.toString(),
                        image: product.image,
                        description: product.description,
                        sku: currentSku
                      }}
                      variant="outline"
                      size="md"
                      className="w-full border-cyan-300/30 text-cyan-200 hover:bg-cyan-500/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Variants Selection */}
            {product.variants.length > 1 && product.variants[0].name !== 'Standard' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-cyan-100">
                  {product.category === 'drinks' ? 'Flavor:' : 'Color:'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variants.map((variant, index) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === index ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVariant(index)}
                      disabled={!variant.available}
                      className={selectedVariant === index
                        ? "bg-cyan-500 border-cyan-500 text-white"
                        : "border-cyan-300/30 text-cyan-200 hover:bg-cyan-500/10"
                      }
                    >
                      {variant.name}
                      {!variant.available && " (Out of Stock)"}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && (
              <div className="space-y-3">
                <h3 className="font-semibold text-cyan-100">
                  {product.baseSku === '68537282C6DB2' ? 'iPhone Model:' : 'Size:'}
                </h3>
                {product.useDropdown ? (
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full px-3 py-2 bg-black/20 border border-cyan-300/50 rounded-md text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {product.sizes.map((sizeOption) => (
                      <option key={sizeOption.size} value={sizeOption.size} className="bg-slate-800 text-cyan-100">
                        {sizeOption.size} - ${sizeOption.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {product.sizes.map((sizeOption) => (
                      <Button
                        key={sizeOption.size}
                        variant={selectedSize === sizeOption.size ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(sizeOption.size)}
                        className={selectedSize === sizeOption.size
                          ? "bg-cyan-500 border-cyan-500 text-white"
                          : "border-cyan-300/30 text-cyan-200 hover:bg-cyan-500/10"
                        }
                      >
                        {sizeOption.size}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Detailed Quantity Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-cyan-100">Quantity:</h3>
              <div className="flex items-center space-x-4">
                <QuantitySelector
                  value={quantity}
                  onChange={setQuantity}
                  min={1}
                  max={99}
                  disabled={!product.inStock}
                  size="md"
                />
                <div className="text-sm text-cyan-100/60">
                  Total: <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    ${(currentPrice * quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold text-cyan-100">Description:</h3>
              <p className="text-cyan-100/70 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Bottom Action Section */}
            <div className="pt-6 border-t border-cyan-200/20">
              <div className="border border-cyan-200/20 rounded-lg p-4 bg-black/20 space-y-4">
                <h3 className="font-semibold text-cyan-100">Purchase Options:</h3>

                {/* Bottom Quantity Display */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-100/60">Selected Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <QuantitySelector
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={99}
                      disabled={!product.inStock}
                      size="sm"
                    />
                    <span className="font-semibold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                      ${(currentPrice * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => addToCart(product, selectedVariant, selectedSize)}
                    disabled={!product.inStock || addingToCart}
                    loading={addingToCart}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-0"
                    icon={!addingToCart ? <Icon name="shopping-cart" size="sm" /> : undefined}
                  >
                    {product.inStock
                      ? (addingToCart ? 'Adding to Cart...' : `Add ${quantity}x to Cart - $${(currentPrice * quantity).toFixed(2)}`)
                      : 'Out of Stock'
                    }
                  </Button>

                  <ShareButton
                    product={{
                      id: product.id,
                      title: product.name,
                      price: currentPrice.toString(),
                      image: product.image,
                      description: product.description,
                      sku: currentSku
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full border-cyan-300/30 text-cyan-200 hover:bg-cyan-500/10"
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