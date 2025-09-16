// app/components/product/QuantitySelector.tsx
"use client";

import { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className
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
    <div className={cn("flex items-center border border-gray-300 rounded-md bg-white text-gray-900", className)}>
        {/* Decrease Button */}
        <button
        type="button"
        onClick={(e) => {
            e.stopPropagation();
            handleDecrease();
        }}
        disabled={disabled || value <= min}
        className={cn(
            "flex items-center justify-center border-r border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
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
          "flex items-center justify-center border-l border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          currentSize.button
        )}
        aria-label="Increase quantity"
      >
        <Icon name="plus" size={currentSize.icon} />
      </button>
    </div>
  );
}
