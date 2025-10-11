// app/components/product/QuantitySelector.tsx
"use client";

import { useState, useEffect, memo } from 'react';
import { Icon } from '../ui/Icon';
import { cn } from '@/lib/utils';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toast';
import { MarketplaceProduct } from '@/types/producthub';

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

interface QuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  // Add these props for the add to cart functionality
  product?: MarketplaceProduct;
  showAddToCart?: boolean;
}

function QuantitySelectorComponent({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className,
  product,
  showAddToCart = false
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  // Sync input value when prop value changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDecrease = () => {
    if (disabled) return;
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleIncrease = () => {
    if (disabled) return;
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);

    // Only update parent if it's a valid number
    const numValue = parseInt(inputVal);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    // Validate and correct input on blur
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < min) {
      const correctedValue = min;
      setInputValue(correctedValue.toString());
      onChange(correctedValue);
    } else if (numValue > max) {
      const correctedValue = max;
      setInputValue(correctedValue.toString());
      onChange(correctedValue);
    }
  };

  const addToCart = (product: MarketplaceProduct, quantity: number = 1) => {
    const variant = product.variants[0];
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

    // Add to localStorage cart and dispatch update event
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
    const existingIndex = savedCart.findIndex((item: CartItem) => item.variantId === variant.id);
    
    if (existingIndex >= 0) {
      savedCart[existingIndex].quantity += quantity;
    } else {
      savedCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(savedCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    toast.addedToCart(`${quantity}x ${product.title}`);
  };

  const sizeClasses = {
    sm: {
      button: 'w-7 h-7',
      input: 'h-7 px-2 text-sm',
      icon: 'sm' as const
    },
    md: {
      button: 'w-8 h-8',
      input: 'h-8 px-2 text-sm',
      icon: 'sm' as const
    },
    lg: {
      button: 'w-10 h-10',
      input: 'h-10 px-3 text-base',
      icon: 'md' as const
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="space-y-3">
      <div className={cn("flex items-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100", className)}>
        {/* Decrease Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDecrease();
          }}
          disabled={disabled || value <= min}
          className={cn(
            "flex items-center justify-center border-r border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            currentSize.button
          )}
          aria-label="Decrease quantity"
        >
          <Icon name="minus" size={currentSize.icon} />
        </button>

        {/* Quantity Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onClick={(e) => e.stopPropagation()}
          disabled={disabled}
          className={cn(
            "border-0 text-center font-medium bg-transparent focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed min-w-0 flex-1",
            currentSize.input
          )}
          style={{ width: '40px' }}
          aria-label="Quantity"
        />

        {/* Increase Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleIncrease();
          }}
          disabled={disabled || value >= max}
          className={cn(
            "flex items-center justify-center border-l border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            currentSize.button
          )}
          aria-label="Increase quantity"
        >
          <Icon name="plus" size={currentSize.icon} />
        </button>
      </div>

      {/* Add to Cart Button - only show if product is provided and showAddToCart is true */}
      {showAddToCart && product && (
        <Button
          variant="primary"
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product, value);
          }}
          disabled={!product.variants[0]?.available}
          className="w-full"
          icon={<Icon name="shopping-cart" size="sm" />}
        >
          {product.variants[0]?.available ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      )}
    </div>
  );
}

export const QuantitySelector = memo(QuantitySelectorComponent);
