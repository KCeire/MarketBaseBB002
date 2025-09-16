// app/components/theme/ThemeToggle.tsx
"use client";

import { useTheme } from './ThemeProvider';
import { Icon } from '../ui/Icon';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function ThemeToggle({ variant = 'compact', className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return resolvedTheme === 'dark' ? 'eye' : 'star'; // Using available icons
    }
    return resolvedTheme === 'dark' ? 'eye' : 'star';
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'Auto';
      default:
        return 'Light';
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "p-2 rounded-lg transition-colors",
          "text-gray-600 hover:text-gray-800 hover:bg-gray-100",
          "dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          className
        )}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light'} mode`}
      >
        <Icon name={getThemeIcon()} size="md" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left",
        "text-gray-900 hover:bg-gray-50",
        "dark:text-gray-100 dark:hover:bg-gray-800",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Icon name={getThemeIcon()} size="sm" className="text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <p className="font-medium text-sm">Dark Mode</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Appearance settings
          </p>
        </div>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500">
        {getThemeLabel()}
      </div>
    </button>
  );
}
