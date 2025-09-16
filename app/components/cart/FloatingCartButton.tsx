// app/components/cart/FloatingCartButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '../ui/Icon';
import { cn } from '@/lib/utils';

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

export function FloatingCartButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Don't show on cart page or cart view
  const shouldShow = !pathname.includes('?view=cart') && pathname !== '/cart';

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      }
    };

    // Initial load
    loadCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Set visibility after component mounts to avoid hydration issues
    setIsVisible(true);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0).toFixed(2);
  };

  const handleCartClick = () => {
    // Navigate to cart view
    if (pathname === '/') {
      router.push('/?view=cart');
    } else {
      router.push('/');
      // Small delay to ensure navigation completes before showing cart
      setTimeout(() => {
        router.push('/?view=cart');
      }, 100);
    }
  };

  // Don't render if shouldn't show or no items in cart or not visible yet
  if (!shouldShow || cart.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleCartClick}
        className={cn(
          "bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg",
          "flex items-center space-x-2 px-4 py-3 transition-all duration-200",
          "hover:shadow-xl transform hover:scale-105 active:scale-95",
          // Account for safe area on mobile
          "mt-safe-area-top"
        )}
        aria-label={`View cart with ${getCartItemCount()} items`}
      >
        {/* Cart Icon with Badge */}
        <div className="relative">
          <Icon name="shopping-cart" size="md" className="text-white" />
          {getCartItemCount() > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {getCartItemCount() > 99 ? '99+' : getCartItemCount()}
            </div>
          )}
        </div>
        
        {/* Cart Total */}
        <div className="hidden sm:block">
          <div className="text-sm font-medium">
            ${getCartTotal()}
          </div>
        </div>
      </button>
    </div>
  );
}
