// app/components/ui/Toast.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItemProps extends ToastProps {
  onDismiss: (id: string) => void;
}



// Global toast state management
let toastCallbacks: ((toasts: ToastProps[]) => void)[] = [];
let toastQueue: ToastProps[] = [];

export const toastManager = {
  show: (toast: Omit<ToastProps, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'error' ? 6000 : 4000)
    };
    
    toastQueue.push(newToast);
    toastCallbacks.forEach(callback => callback([...toastQueue]));
    
    // Auto-dismiss after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        toastManager.dismiss(id);
      }, newToast.duration);
    }
    
    return id;
  },
  
  dismiss: (id: string) => {
    toastQueue = toastQueue.filter(toast => toast.id !== id);
    toastCallbacks.forEach(callback => callback([...toastQueue]));
  },
  
  subscribe: (callback: (toasts: ToastProps[]) => void) => {
    toastCallbacks.push(callback);
    return () => {
      toastCallbacks = toastCallbacks.filter(cb => cb !== callback);
    };
  },
  
  clear: () => {
    toastQueue = [];
    toastCallbacks.forEach(callback => callback([]));
  }
};

// Individual Toast Item Component
function ToastItem({ id, type, title, message, action, onDismiss }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  }, [id, onDismiss]);

  const getToastStyles = (type: ToastProps['type']) => {
    const baseStyles = "border-l-4";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500 bg-green-50 text-green-800`;
      case 'error':
        return `${baseStyles} border-red-500 bg-red-50 text-red-800`;
      case 'warning':
        return `${baseStyles} border-yellow-500 bg-yellow-50 text-yellow-800`;
      case 'info':
      default:
        return `${baseStyles} border-blue-500 bg-blue-50 text-blue-800`;
    }
  };

  const getIconName = (type: ToastProps['type']) => {
    switch (type) {
      case 'success':
        return 'check';
      case 'error':
        return 'eye'; // Using eye as placeholder for error icon
      case 'warning':
        return 'eye'; // Using eye as placeholder for warning icon
      case 'info':
      default:
        return 'eye'; // Using eye as placeholder for info icon
    }
  };

  const getIconColor = (type: ToastProps['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-in-out mb-3",
        isVisible && !isExiting
          ? "translate-y-0 opacity-100"
          : "translate-y-[-100%] opacity-0"
      )}
    >
      <div
        className={cn(
          "max-w-sm w-full rounded-lg shadow-lg pointer-events-auto overflow-hidden",
          getToastStyles(type)
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon
                name={getIconName(type)}
                size="md"
                className={getIconColor(type)}
              />
            </div>
            
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium">{title}</p>
              {message && (
                <p className="mt-1 text-sm opacity-90">{message}</p>
              )}
              
              {action && (
                <div className="mt-3">
                  <button
                    onClick={action.onClick}
                    className="text-sm font-medium underline hover:no-underline focus:outline-none"
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleDismiss}
                className="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Close</span>
                <Icon name="plus" size="sm" className="transform rotate-45" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast Container Component
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  const handleDismiss = useCallback((id: string) => {
    toastManager.dismiss(id);
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-[60] flex flex-col-reverse max-w-sm w-full pointer-events-none"
      style={{ 
        // Ensure toasts appear above bottom navigation (z-50)
        zIndex: 60,
        // Account for safe area and mobile viewports
        top: 'max(1rem, env(safe-area-inset-top) + 1rem)'
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          {...toast}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}

// Hook for easy toast usage
export function useToast() {
  const showSuccess = useCallback((title: string, message?: string, action?: ToastProps['action']) => {
    return toastManager.show({ type: 'success', title, message, action });
  }, []);

  const showError = useCallback((title: string, message?: string, action?: ToastProps['action']) => {
    return toastManager.show({ type: 'error', title, message, action });
  }, []);

  const showWarning = useCallback((title: string, message?: string, action?: ToastProps['action']) => {
    return toastManager.show({ type: 'warning', title, message, action });
  }, []);

  const showInfo = useCallback((title: string, message?: string, action?: ToastProps['action']) => {
    return toastManager.show({ type: 'info', title, message, action });
  }, []);

  const dismiss = useCallback((id: string) => {
    toastManager.dismiss(id);
  }, []);

  const clear = useCallback(() => {
    toastManager.clear();
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss,
    clear,
    // Direct access to manager for advanced usage
    show: toastManager.show
  };
}

// Utility functions for common toast patterns
export const toast = {
  success: (title: string, message?: string) => 
    toastManager.show({ type: 'success', title, message }),
    
  error: (title: string, message?: string) => 
    toastManager.show({ type: 'error', title, message }),
    
  warning: (title: string, message?: string) => 
    toastManager.show({ type: 'warning', title, message }),
    
  info: (title: string, message?: string) => 
    toastManager.show({ type: 'info', title, message }),

  // Cart specific toasts
  addedToCart: (productName: string) => 
    toastManager.show({ 
      type: 'success', 
      title: 'Added to Cart', 
      message: `${productName} has been added to your cart` 
    }),
    
  removedFromCart: (productName: string) => 
    toastManager.show({ 
      type: 'info', 
      title: 'Removed from Cart', 
      message: `${productName} has been removed from your cart` 
    }),

  // Payment specific toasts
  paymentSuccess: (orderRef: string) => 
    toastManager.show({ 
      type: 'success', 
      title: 'Payment Successful!', 
      message: `Order ${orderRef} has been confirmed`,
      duration: 6000
    }),
    
  paymentPending: () => 
    toastManager.show({ 
      type: 'info', 
      title: 'Payment Processing', 
      message: 'Your payment is being confirmed on the blockchain',
      duration: 0 // Don't auto-dismiss
    }),

  paymentFailed: (reason?: string) => 
    toastManager.show({ 
      type: 'error', 
      title: 'Payment Failed', 
      message: reason || 'Please try again or contact support',
      duration: 8000
    }),

  // Admin specific toasts
  exportSuccess: (filename: string) => 
    toastManager.show({ 
      type: 'success', 
      title: 'Export Complete', 
      message: `${filename} has been downloaded successfully` 
    }),

  orderUpdated: (orderRef: string) => 
    toastManager.show({ 
      type: 'success', 
      title: 'Order Updated', 
      message: `Order ${orderRef} has been updated` 
    })
};
