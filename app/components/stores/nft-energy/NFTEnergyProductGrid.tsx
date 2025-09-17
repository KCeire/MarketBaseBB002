// app/components/stores/nft-energy/NFTEnergyProductGrid.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { toast } from '@/app/components/ui/Toast';
import Image from 'next/image';

interface NFTEnergyProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  image: string;
  variants: Array<{ id: string; name: string; available: boolean }>;
  sizes?: string[];
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

// Updated products with real image paths
const updatedProductData = [
  {
    id: 'nft-energy-12pack',
    name: 'NFT Energy Drinks - 12 Pack',
    description: 'Experience the fusion of Web3 and real energy. Our signature energy drink that fuels your digital adventures and real-world hustle.',
    price: 26.99,
    sku: 'NFT-ENERGY-12PK',
    category: 'drinks',
    image: '/stores/NFTEnergyDrinks/NFTEnergyDrink12Pack.jpeg',
    variants: [
      { id: 'original', name: 'Original Flavor', available: true }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-tshirt',
    name: 'NFT Energy T-Shirt',
    description: 'Rep the brand with our premium cotton tee featuring the iconic NFT Energy logo.',
    price: 24.99,
    sku: 'NFT-TEE',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/mens-premium-heavyweight-tee-black-front-6853818ca2de9-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'white', name: 'White', available: true }
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    inStock: true
  },
  {
    id: 'nft-energy-hoodie',
    name: 'NFT Energy Hoodie',
    description: 'Stay warm while repping Web3 culture. Premium fleece hoodie with embroidered NFT Energy branding.',
    price: 49.99,
    sku: 'NFT-HOOD',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/unisex-heavy-blend-hoodie-black-front-6853806252ae9-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'purple', name: 'Purple', available: true }
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    inStock: true
  },
  {
    id: 'nft-energy-sweatshirt',
    name: 'NFT Energy Sweatshirt',
    description: 'Classic crew neck sweatshirt perfect for any Web3 enthusiast. Comfortable fit with bold NFT Energy graphics.',
    price: 39.99,
    sku: 'NFT-SWEAT',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/unisex-premium-sweatshirt-black-front-685375da34fb3-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'purple', name: 'Purple', available: true }
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    inStock: true
  },
  {
    id: 'nft-energy-cap',
    name: 'NFT Energy Baseball Cap',
    description: 'Complete your look with our signature snapback cap. Embroidered logo, premium materials.',
    price: 19.99,
    sku: 'NFT-CAP',
    category: 'accessories',
    image: '/stores/NFTEnergyDrinks/foam-trucker-hat-black-white-black-one-size-front-68537328b6d4d-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black/White', available: true },
      { id: 'colored', name: 'Colored', available: true }
    ],
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'nft-energy-iphone-case',
    name: 'NFT Energy iPhone Case',
    description: 'Protect your device in style. Compatible with iPhone 12-15, featuring durable protection and NFT Energy branding.',
    price: 14.99,
    sku: 'NFT-CASE',
    category: 'accessories',
    image: '/stores/NFTEnergyDrinks/clear-case-for-iphone-iphone-15-pro-max-case-on-phone-6853727c8a9d4-300x300.jpg',
    variants: [
      { id: 'clear', name: 'Clear', available: true },
      { id: 'black', name: 'Black', available: true }
    ],
    sizes: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'],
    inStock: true
  }
];

export function NFTEnergyProductGrid({ }: NFTEnergyProductGridProps) {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Use updated product data with real images
  const productsToRender = updatedProductData;

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
  };

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const addToCart = (product: NFTEnergyProduct) => {
    const selectedVariant = selectedVariants[product.id] || product.variants[0]?.id;
    const selectedSize = selectedSizes[product.id] || product.sizes?.[0];
    const quantity = quantities[product.id] || 1;

    if (!selectedVariant) {
      toast.error('Selection Required', 'Please select a variant');
      return;
    }

    if (product.sizes && !selectedSize) {
      toast.error('Size Required', 'Please select a size');
      return;
    }

    // Create cart item
    const variant = product.variants.find(v => v.id === selectedVariant);
    const variantName = variant ? variant.name : 'Default';
    const sizeInfo = selectedSize ? ` - ${selectedSize}` : '';
    
    const cartItem: CartItem = {
      productId: parseInt(product.id.replace(/\D/g, '') || '9999'),
      variantId: parseInt(selectedVariant.replace(/\D/g, '') || '1'),
      title: product.name,
      variant: `${variantName}${sizeInfo}`,
      price: product.price.toString(),
      image: product.image,
      quantity,
      sku: `${product.sku}-${selectedVariant}${selectedSize ? `-${selectedSize}` : ''}`,
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
      
      toast.addedToCart(`${quantity}x ${product.name}`);
      
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
      {productsToRender.map((product) => (
        <div
          key={product.id}
          className="bg-black/20 backdrop-blur-sm rounded-xl border border-cyan-200/20 overflow-hidden hover:border-cyan-300/40 hover:bg-black/30 transition-all duration-300"
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
                // Fallback if image fails to load
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
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-cyan-100 font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-cyan-100/60 text-sm mb-3 leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                  ${product.price}
                </span>
                <span className="text-xs text-cyan-100/40">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
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

            {/* Sizes */}
            {product.sizes && (
              <div>
                <label className="text-cyan-100 text-sm font-medium block mb-2">Size:</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(product.id, size)}
                      className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                        (selectedSizes[product.id] || product.sizes?.[0]) === size
                          ? 'bg-cyan-500 border-cyan-500 text-white'
                          : 'border-cyan-300/50 text-cyan-100/70 hover:border-cyan-300/80 hover:bg-cyan-500/10'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
          </div>
        </div>
      ))}
    </div>
  );
}
