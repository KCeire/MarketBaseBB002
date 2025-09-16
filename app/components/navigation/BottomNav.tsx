// app/components/navigation/BottomNav.tsx
"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '../ui/Icon';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export function BottomNav({ cartItemCount = 0, onCartClick }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      path: '/'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: 'grid',
      path: '/categories'
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: 'shopping-cart',
      path: '/cart',
      badge: cartItemCount
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: 'package',
      path: '/orders'
    },
    {
      id: 'more',
      label: 'More',
      icon: 'menu',
      path: '/more'
    }
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'cart' && onCartClick) {
      onCartClick();
    } else {
      router.push(item.path);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom transition-transform duration-300 ease-in-out",
      isMinimized ? "transform translate-y-12" : "transform translate-y-0"
    )}>
      {/* Minimize/Expand Button - positioned over "More" menu */}
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -top-6 right-6 bg-white border border-gray-200 rounded-t-lg px-3 py-1 shadow-sm hover:bg-gray-50 transition-colors"
        aria-label={isMinimized ? "Expand navigation" : "Minimize navigation"}
      >
        <Icon 
          name={isMinimized ? "chevron-up" : "chevron-down"} 
          size="sm" 
          className="text-gray-600" 
        />
      </button>

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 rounded-lg transition-colors",
                  active
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <div className="relative">
                  <Icon 
                    name={item.icon} 
                    size="md" 
                    className={cn(
                      "transition-colors",
                      active ? "text-blue-600" : "text-gray-500"
                    )}
                  />
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  )}
                </div>
                {!isMinimized && (
                  <span className={cn(
                    "text-xs font-medium mt-1 truncate max-w-full transition-opacity duration-200",
                    active ? "text-blue-600" : "text-gray-500"
                  )}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
