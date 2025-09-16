// app/components/navigation/BottomNav.tsx
"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '../ui/Icon';
import { cn } from '@/lib/utils';
import { MoreMenu } from './MoreMenu';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
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
      path: '/categories-page'
    },
    {
      id: 'earn',
      label: 'Earn',
      icon: 'star',
      path: '/earn'
    },
    {
      id: 'sell',
      label: 'Sell',
      icon: 'store',
      path: '/sell'
    },
    {
      id: 'more',
      label: 'More',
      icon: 'menu',
      path: '/more'
    }
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.id === 'more') {
      setShowMoreMenu(true);
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
    <>
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-inset-bottom transition-all duration-300 ease-in-out",
        isMinimized ? "transform translate-y-12" : "transform translate-y-0"
      )}>
        {/* Minimize/Expand Button */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="absolute -top-6 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg px-3 py-1 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label={isMinimized ? "Expand navigation" : "Minimize navigation"}
        >
          <Icon 
            name={isMinimized ? "chevron-up" : "chevron-down"} 
            size="sm" 
            className="text-gray-600 dark:text-gray-400" 
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
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <div className="relative">
                    <Icon 
                      name={item.icon} 
                      size="md" 
                      className={cn(
                        "transition-colors",
                        active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
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
                      active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
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
      
      {showMoreMenu && (
        <MoreMenu onClose={() => setShowMoreMenu(false)} />
      )}
    </>
  );
}
