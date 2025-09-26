// app/components/navigation/MoreMenu.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '../ui/Icon';

interface MoreMenuProps {
  onClose: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  path?: string;
  action?: () => void;
  badge?: string;
  disabled?: boolean;
}

export function MoreMenu({ onClose }: MoreMenuProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  const menuItems: MenuItem[] = [
    {
      id: 'orders',
      label: 'My Orders',
      description: 'View order history & tracking',
      icon: 'package',
      path: '/orders'
    },
    {
      id: 'profile',
      label: 'Profile',
      description: 'Account settings',
      icon: 'user',
      path: '/profile'
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      description: 'Coming soon',
      icon: 'eye',
      badge: 'Coming Soon',
      disabled: true,
      action: () => {
        alert('Admin panel coming soon! Stay tuned for updates.');
      }
    },
    {
      id: 'support',
      label: 'Help & Support',
      description: 'Get help or contact us',
      icon: 'star',
      path: '/support'
    },
    {
      id: 'about',
      label: 'About',
      description: 'Learn about Base Shop',
      icon: 'home',
      path: '/about'
    }
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.disabled && item.action) {
      item.action();
    } else if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${
          isVisible ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Menu Content */}
      <div className={`
        relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-t-xl shadow-xl 
        transform transition-all duration-200 ease-out mb-16
        ${isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-full opacity-0'
        }
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">More Options</h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Icon name="plus" size="sm" className="text-gray-600 dark:text-gray-400 rotate-45" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                item.disabled 
                  ? 'opacity-60 cursor-default hover:bg-gray-25 dark:hover:bg-gray-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                item.disabled ? 'bg-gray-50 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Icon 
                  name={item.icon} 
                  size="sm" 
                  className={item.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'} 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`font-medium text-sm ${
                    item.disabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {item.label}
                  </p>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.disabled 
                        ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={`text-xs mt-0.5 ${
                  item.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.description}
                </p>
              </div>
              
              <Icon 
                name="arrow-right" 
                size="sm" 
                className={item.disabled ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400 dark:text-gray-500'} 
              />
            </button>
          ))}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">Base Shop v1.0</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Built on Base</p>
          </div>
        </div>
      </div>
    </div>
  );
}
