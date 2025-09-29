// app/components/stores/nft-energy/NFTEnergyProductGrid.tsx - UPDATED WITH REAL PRICING AND SKUS
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { toast } from '@/app/components/ui/Toast';
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

interface NFTEnergyProductGridProps {
  products: NFTEnergyProduct[];
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

// Updated products with real pricing and SKUs
const updatedProductData: NFTEnergyProduct[] = [
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

export function NFTEnergyProductGrid({ products }: NFTEnergyProductGridProps) {
  const router = useRouter();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Use the products passed from parent component (filtered products)
  // If no products passed, fall back to the full list
  const productsToRender = products && products.length > 0 ? products : updatedProductData;

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

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

  const addToCart = (product: NFTEnergyProduct) => {
    const selectedVariant = selectedVariants[product.id] || product.variants[0]?.id;
    const selectedSize = selectedSizes[product.id] || product.sizes?.[0]?.size;
    const quantity = quantities[product.id] || 1;

    if (!selectedVariant) {
      toast.error('Selection Required', 'Please select a variant');
      return;
    }

    if (product.sizes && !selectedSize) {
      toast.error('Size Required', 'Please select a size');
      return;
    }

    // Create cart item with dynamic pricing and real SKU
    const variant = product.variants.find(v => v.id === selectedVariant);
    const variantName = variant ? variant.name : 'Default';
    const sizeInfo = selectedSize ? ` - ${selectedSize}` : '';
    const finalPrice = getProductPrice(product, selectedSize);
    const finalSku = generateProductSKU(product, selectedVariant, selectedSize);
    
    const cartItem: CartItem = {
      productId: parseInt(product.id.replace(/\D/g, '') || '9999'),
      variantId: parseInt(selectedVariant.replace(/\D/g, '') || '1'),
      title: product.name,
      variant: `${variantName}${sizeInfo}`,
      price: finalPrice.toString(),
      image: product.image,
      quantity,
      sku: finalSku,
    };

    // Add to localStorage cart
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
      const existingIndex = savedCart.findIndex((item: CartItem) => 
        item.sku === cartItem.sku
      );
      
      if (existingIndex >= 0) {
        savedCart[existingIndex].quantity += quantity;
      } else {
        savedCart.push(cartItem);
      }
      
      localStorage.setItem('cart', JSON.stringify(savedCart));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      toast.addedToCart(`${quantity}x ${product.name}${sizeInfo}`);
      
      // Reset quantity to 1
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Cart Error', 'Unable to add item to cart');
    }
  };

  if (productsToRender.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-cyan-100/60">No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productsToRender.map((product) => {
        const selectedSize = selectedSizes[product.id] || product.sizes?.[0]?.size;
        const currentPrice = getProductPrice(product, selectedSize);

        return (
          <div
            key={product.id}
            className="bg-black/20 backdrop-blur-sm rounded-xl border border-cyan-200/20 overflow-hidden hover:border-cyan-300/40 hover:bg-black/30 transition-all duration-300 flex flex-col"
          >
            {/* Product Image */}
            <div className="aspect-square bg-slate-800/50 flex items-center justify-center overflow-hidden">
              <Image 
                src={product.image} 
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <span class="text-cyan-100/40 text-lg font-medium">${product.name}</span>
                    </div>
                  `;
                }}
              />
            </div>

            {/* Product Info */}
            <div className="p-6 space-y-4 flex flex-col flex-1">
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-cyan-100 font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-cyan-100/60 text-sm mb-3 leading-relaxed">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                      ${currentPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-cyan-100/40">
                      SKU: {generateProductSKU(product, selectedVariants[product.id] || product.variants[0]?.id, selectedSize)}
                    </span>
                  </div>
                </div>

                {/* Variants - only show if more than 1 variant */}
                {product.variants.length > 1 && product.variants[0].name !== 'Standard' && (
                  <div>
                    <label className="text-cyan-100 text-sm font-medium block mb-2">
                      {product.category === 'drinks' ? 'Flavor' : 'Color'}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantChange(product.id, variant.id)}
                          disabled={!variant.available}
                          className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                            (selectedVariants[product.id] || product.variants[0].id) === variant.id
                              ? 'bg-cyan-500 border-cyan-500 text-white'
                              : 'border-cyan-300/50 text-cyan-100/70 hover:border-cyan-300/80 hover:bg-cyan-500/10'
                          } ${!variant.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes - Use dropdown for iPhone cases, buttons for others */}
                {product.sizes && (
                  <div>
                    <label className="text-cyan-100 text-sm font-medium block mb-2">
                      {product.baseSku === '68537282C6DB2' ? 'iPhone Model:' : 'Size:'}
                    </label>
                    {product.useDropdown ? (
                      // Dropdown for iPhone models
                      <select
                        value={selectedSizes[product.id] || product.sizes[0]?.size}
                        onChange={(e) => handleSizeChange(product.id, e.target.value)}
                        className="w-full px-3 py-2 bg-black/20 border border-cyan-300/50 rounded-md text-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        {product.sizes.map((sizeOption) => (
                          <option key={sizeOption.size} value={sizeOption.size} className="bg-slate-800 text-cyan-100">
                            {sizeOption.size}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Buttons for other products
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((sizeOption) => (
                          <button
                            key={sizeOption.size}
                            onClick={() => handleSizeChange(product.id, sizeOption.size)}
                            className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                              (selectedSizes[product.id] || product.sizes?.[0]?.size) === sizeOption.size
                                ? 'bg-cyan-500 border-cyan-500 text-white'
                                : 'border-cyan-300/50 text-cyan-100/70 hover:border-cyan-300/80 hover:bg-cyan-500/10'
                            }`}
                          >
                            {sizeOption.size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons Section - moved to bottom */}
              <div className="space-y-3">
                {/* Quantity */}
                <div>
                  <label className="text-cyan-100 text-sm font-medium block mb-2">Quantity:</label>
                  <div className="flex items-center border border-cyan-300/50 rounded-md bg-black/20">
                    <button
                      onClick={() => handleQuantityChange(product.id, Math.max(1, (quantities[product.id] || 1) - 1))}
                      className="p-2 text-cyan-100/70 hover:text-cyan-100 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Icon name="minus" size="sm" />
                    </button>
                    <span className="flex-1 text-center text-cyan-100 py-2 font-medium">
                      {quantities[product.id] || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                      className="p-2 text-cyan-100/70 hover:text-cyan-100 hover:bg-cyan-500/10 transition-colors"
                    >
                      <Icon name="plus" size="sm" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Add to Cart */}
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-0 shadow-lg shadow-cyan-500/25"
                    icon={<Icon name="shopping-cart" size="sm" />}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>

                  {/* View Details */}
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => router.push(`/nft-energy/product/${product.baseSku}`)}
                    className="w-full border-cyan-300/30 text-cyan-200 hover:bg-cyan-500/10"
                    icon={<Icon name="eye" size="sm" />}
                  >
                    View Details
                  </Button>

                  {/* Share Button */}
                  <div className="border-t border-cyan-200/20 pt-3">
                    <ShareButton
                      product={{
                        id: product.id,
                        title: product.name,
                        price: currentPrice.toString(),
                        image: product.image,
                        description: product.description,
                        sku: generateProductSKU(product, selectedVariants[product.id] || product.variants[0]?.id, selectedSize)
                      }}
                      variant="outline"
                      size="md"
                      className="w-full border-cyan-300/30 text-cyan-200 hover:bg-cyan-500/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
