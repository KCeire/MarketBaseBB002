// components/Shop.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketplaceProduct } from '@/types/shopify';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
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
  const router = useRouter();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Suppress unused variable warning
  void setActiveTab;

  useEffect(() => {
    fetchProducts();
    loadCartFromStorage();
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

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  };

  const saveCartToStorage = (cartData: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
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
      let newCart;
      if (existing) {
        newCart = prev.map(item => 
          item.variantId === variant.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, cartItem];
      }
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  const removeFromCart = (variantId: number) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.variantId !== variantId);
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  const navigateToProduct = (productId: number) => {
    router.push(`/product/${productId}`);
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
          <h2 className="text-xl font-bold text-gray-900">Shop</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Shop</h2>
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
          <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
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
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.variantId} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-white">
                <Image 
                  src={item.image} 
                  alt={item.title}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate text-gray-900">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.variant}</p>
                  <p className="text-sm font-bold text-gray-900">${item.price} x {item.quantity}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.variantId)}
                  icon={<Icon name="trash" size="sm" />}
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Total: ${getCartTotal()}</span>
              </div>
              <Button 
                variant="primary" 
                size="lg"
                className="w-full"
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
        <h2 className="text-xl font-bold text-gray-900">Shop</h2>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCart(true)}
            icon={<Icon name="shopping-cart" size="sm" />}
          >
            Cart ({getCartItemCount()})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border border-gray-200 rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-md transition-all duration-200 bg-white"
            onClick={() => navigateToProduct(product.id)}
          >
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
              <h3 className="font-semibold text-sm mb-1 text-gray-900">{product.title}</h3>
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </p>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-gray-900">${product.price}</span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      ${product.compareAtPrice}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateToProduct(product.id)}
                    icon={<Icon name="eye" size="sm" />}
                  >
                    View Details
                  </Button>
                  <div
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => addToCart(product)}
                      disabled={!product.variants[0]?.available}
                    >
                      {product.variants[0]?.available ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products available</p>
        </div>
      )}
    </div>
  );
}
