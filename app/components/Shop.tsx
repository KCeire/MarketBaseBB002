// app/components/Shop.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketplaceProduct } from '@/types/shopify';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { BasePayCheckout } from './BasePayCheckout';
import { toast } from './ui/Toast';
import { QuantitySelector } from './product/QuantitySelector';
import { CategoryGrid } from './categories/CategoryGrid';
import Image from 'next/image';

interface ShopProps {
  setActiveTab: (tab: string) => void;
  showCart?: boolean;
  onBackToShop?: () => void;
  showCategories?: boolean;
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

// Custom event to notify cart updates
const dispatchCartUpdate = () => {
  window.dispatchEvent(new CustomEvent('cartUpdated'));
};

export function Shop({ setActiveTab, showCart = false, onBackToShop, showCategories = false }: ShopProps) {
  const router = useRouter();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<MarketplaceProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all-products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  // Suppress unused variable warning
  void setActiveTab;

  useEffect(() => {
    const initializeShop = async () => {
      await fetchProducts();
      loadCartFromStorage();
    };
    initializeShop();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shopify/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      const productList = data.products || [];
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      toast.error('Failed to Load Products', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter products by category
  const filterProductsByCategory = (categorySlug: string) => {
    if (categorySlug === 'all-products') {
      setFilteredProducts(products);
    } else {
      // Basic category filtering based on product title and tags
      const filtered = products.filter(product => {
        const title = product.title.toLowerCase();
        const tags = product.tags.join(' ').toLowerCase();
        const productType = product.productType.toLowerCase();
        
        switch (categorySlug) {
          case 'electronics':
            return title.includes('phone') || title.includes('tablet') || title.includes('computer') ||
                   tags.includes('electronics') || productType.includes('electronics');
          case 'home-garden':
            return title.includes('home') || title.includes('garden') || title.includes('furniture') ||
                   tags.includes('home') || tags.includes('garden') || productType.includes('home');
          case 'pet-products':
            return title.includes('pet') || title.includes('dog') || title.includes('cat') ||
                   tags.includes('pets') || productType.includes('pet');
          case 'health-beauty':
            return title.includes('health') || title.includes('beauty') || title.includes('skincare') ||
                   tags.includes('health') || tags.includes('beauty') || productType.includes('beauty');
          case 'sports-outdoors':
            return title.includes('sport') || title.includes('outdoor') || title.includes('fitness') ||
                   tags.includes('sports') || tags.includes('outdoor') || productType.includes('sports');
          default:
            return true;
        }
      });
      setFilteredProducts(filtered);
    }
    setSelectedCategory(categorySlug);
  };

  const handleCategorySelect = (categorySlug: string) => {
    filterProductsByCategory(categorySlug);
  };

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      toast.error('Cart Loading Error', 'Unable to restore your saved cart items');
    }
  };

  const saveCartToStorage = (cartData: CartItem[]) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartData));
      // Use setTimeout to defer the event dispatch and avoid state update during render
      setTimeout(() => {
        dispatchCartUpdate();
      }, 0);
    } catch (error) {
      console.error('Error saving cart to storage:', error);
      toast.error('Cart Save Error', 'Unable to save cart items');
    }
  };

  const addToCart = (product: MarketplaceProduct, quantity: number = 1) => {
    const variant = product.variants[0]; // Use first variant for simplicity
    const cartItem: CartItem = {
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variant: variant.title,
      price: variant.price,
      image: product.image,
      quantity,
      sku: variant.sku || `${product.id}-${variant.id}`,
    };

    // Check if item exists BEFORE updating state
    const existing = cart.find(item => item.variantId === variant.id);

    setCart(prev => {
      let newCart;
      if (existing) {
        newCart = prev.map(item => 
          item.variantId === variant.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prev, cartItem];
      }
      saveCartToStorage(newCart);
      return newCart;
    });

    // Reset quantity selector to 1 after adding
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));

    // Show toast after state update
    setTimeout(() => {
      if (existing) {
        toast.success('Updated Cart', `Added ${quantity} more ${product.title}`);
      } else {
        toast.addedToCart(`${quantity}x ${product.title}`);
      }
    }, 0);
  };

  const removeFromCart = (variantId: number) => {
    // Find item to remove BEFORE updating state
    const itemToRemove = cart.find(item => item.variantId === variantId);
    
    setCart(prev => {
      const newCart = prev.filter(item => item.variantId !== variantId);
      saveCartToStorage(newCart);
      return newCart;
    });

    // Show toast after state update
    setTimeout(() => {
      if (itemToRemove) {
        toast.removedFromCart(itemToRemove.title);
      }
    }, 0);
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

  const handleCheckoutSuccess = (orderReference: string) => {
    toast.paymentSuccess(orderReference);
    // Clear cart on successful order
    setCart([]);
    saveCartToStorage([]);
    if (onBackToShop) {
      onBackToShop();
    }
  };

  const handleCheckoutError = (error: string) => {
    toast.paymentFailed(error);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shop</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shop</h2>
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
          {onBackToShop && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToShop}
              icon={<Icon name="arrow-left" size="sm" />}
            >
              Back to Shop
            </Button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Demo Warning Banner */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
              <p className="text-yellow-800 text-sm font-semibold text-center">
                ⚠️ DEMO VERSION - DO NOT PURCHASE ⚠️
              </p>
              <p className="text-yellow-700 text-xs text-center mt-1">
                This is a development version for testing only
              </p>
            </div>

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
              
              <BasePayCheckout 
                cart={cart}
                total={getCartTotal()}
                onSuccess={handleCheckoutSuccess}
                onError={handleCheckoutError}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Categories view
  if (showCategories) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          {onBackToShop && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToShop}
              icon={<Icon name="arrow-left" size="sm" />}
            >
              Back to Home
            </Button>
          )}
        </div>
        <CategoryGrid onCategorySelect={handleCategorySelect} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category Filter Bar */}
      {selectedCategory !== 'all-products' && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="grid" size="sm" className="text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedCategory.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400">
              ({filteredProducts.length} products)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCategorySelect('all-products')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear Filter
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Shop</h2>
        {cart.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''} in cart
          </div>
        )}
      </div>

      {/* Category Grid - Show on main shop view */}
      <CategoryGrid onCategorySelect={handleCategorySelect} className="mb-6" />

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-md dark:hover:shadow-lg hover:shadow-gray-200 dark:hover:shadow-black/20 transition-all duration-200 bg-white dark:bg-gray-800"
            onClick={() => navigateToProduct(product.id)}
          >
            {/* Demo Warning Banner */}
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-3 rounded">
              <p className="text-yellow-800 dark:text-yellow-200 text-sm font-semibold text-center">
                ⚠️ DEMO VERSION - DO NOT PURCHASE ⚠️
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs text-center mt-1">
                This is a development version for testing only
              </p>
            </div>
            
            <Image 
              src={product.image} 
              alt={product.title}
              width={400}
              height={192}
              className="w-full h-48 object-cover rounded"
              priority={filteredProducts.indexOf(product) === 0} // Only first product gets priority
            />
            <div>
              <h3 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">{product.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                {product.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${product.price}</span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">
                        ${product.compareAtPrice}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToProduct(product.id);
                    }}
                    icon={<Icon name="eye" size="sm" />}
                  >
                    View
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <QuantitySelector
                    value={quantities[product.id] || 1}
                    onChange={(qty) => setQuantities(prev => ({ ...prev, [product.id]: qty }))}
                    min={1}
                    max={product.variants[0]?.inventory || 99}
                    disabled={!product.variants[0]?.available}
                    size="sm"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product, quantities[product.id] || 1);
                    }}
                    disabled={!product.variants[0]?.available}
                    className="flex-1"
                  >
                    {product.variants[0]?.available ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No products found in this category</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCategorySelect('all-products')}
            className="mt-2"
          >
            Show All Products
          </Button>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No products available</p>
        </div>
      )}
    </div>
  );
}
