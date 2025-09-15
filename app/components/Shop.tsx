// components/Shop.tsx
"use client";

import { useState, useEffect } from 'react';
import { MarketplaceProduct } from '@/types/shopify';
import { Button } from './DemoComponents';
import { Icon } from './DemoComponents';
import Image from 'next/image';

interface ShopProps {
  setActiveTab: (tab: string) => void;
}

interface CartItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  image: string;
  quantity: number;
}

export function Shop({ setActiveTab }: ShopProps) {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Suppress unused variable warning
  void setActiveTab;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shopify/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: MarketplaceProduct) => {
    const variant = product.variants[0]; // Use first variant for simplicity
    const cartItem: CartItem = {
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variant: variant.title,
      price: variant.price,
      image: product.image,
      quantity: 1,
    };

    setCart(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) {
        return prev.map(item => 
          item.variantId === variant.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, cartItem];
    });
  };

  const removeFromCart = (variantId: number) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0).toFixed(2);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Shop</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-[var(--ock-text-foreground-muted)]">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Shop</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchProducts}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (showCart) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCart(false)}
            icon={<Icon name="arrow-right" size="sm" />}
          >
            Back to Shop
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--ock-text-foreground-muted)]">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.variantId} className="flex items-center space-x-3 p-3 border border-[var(--ock-border)] rounded-lg">
                <Image 
                  src={item.image} 
                  alt={item.title}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-[var(--ock-text-foreground-muted)]">{item.variant}</p>
                  <p className="text-sm font-bold">${item.price} x {item.quantity}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.variantId)}
                  icon={<Icon name="plus" size="sm" />}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <div className="border-t border-[var(--ock-border)] pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total: ${getCartTotal()}</span>
              </div>
              <Button 
                variant="primary" 
                size="md"
                className="w-full bg-[#0052FF] hover:bg-[#0040CC] text-white"
              >
                Pay with USDC
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Shop</h2>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCart(true)}
            icon={<Icon name="star" size="sm" />}
          >
            Cart ({getCartItemCount()})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border border-[var(--ock-border)] rounded-lg p-4 space-y-3">
            {/* Demo Warning Banner */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
              <p className="text-yellow-800 text-sm font-semibold text-center">
                ⚠️ DEMO VERSION - DO NOT PURCHASE ⚠️
              </p>
              <p className="text-yellow-700 text-xs text-center mt-1">
                This is a development version for testing only
              </p>
            </div>
            
            <Image 
              src={product.image} 
              alt={product.title}
              width={400}
              height={192}
              className="w-full h-48 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold text-sm mb-1">{product.title}</h3>
              <p className="text-xs text-[var(--ock-text-foreground-muted)] mb-2 line-clamp-2">
                {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold">${product.price}</span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-[var(--ock-text-foreground-muted)] line-through ml-2">
                      ${product.compareAtPrice}
                    </span>
                  )}
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => addToCart(product)}
                  disabled={!product.variants[0]?.available}
                  className="bg-[#0052FF] hover:bg-[#0040CC] text-white"
                >
                  {product.variants[0]?.available ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[var(--ock-text-foreground-muted)]">No products available</p>
        </div>
      )}
    </div>
  );
}
