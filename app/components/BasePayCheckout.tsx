// app/components/BasePayCheckout.tsx
"use client";

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

interface CartItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  image: string;
  quantity: number;
}

interface CustomerFormData {
  email: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface BasePayCheckoutProps {
  cart: CartItem[];
  total: string;
  onSuccess?: (orderReference: string) => void;
  onError?: (error: string) => void;
}

export function BasePayCheckout({ cart, total, onSuccess, onError }: BasePayCheckoutProps) {
  const { address, isConnected } = useAccount();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerFormData>({
    email: '',
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
  });

  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const required = ['email', 'name', 'address1', 'city', 'state', 'zipCode'];
    return required.every(field => customerData[field as keyof CustomerFormData]?.trim());
  };

  const createOrder = async (): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!validateForm()) {
      throw new Error('Please fill in all required fields');
    }

    // Transform cart items to match API expectations
    const orderItems = cart.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      variant: item.variant,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    // Prepare data to match your API route expectations
    const requestBody = {
      customerData: {
        email: customerData.email,
        shippingAddress: {
          name: customerData.name,
          address1: customerData.address1,
          address2: customerData.address2 || '',
          city: customerData.city,
          state: customerData.state,
          country: customerData.country,
          zipCode: customerData.zipCode,
        }
      },
      orderItems: orderItems,
      totalAmount: total, // API expects string
      customerWallet: address,
    };

    console.log('Creating order with payload:', requestBody);

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Order creation failed');
    }
    
    return data.orderReference;
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);

      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Create order in database
      console.log('Starting order creation...');
      const orderReference = await createOrder();

      // For now, just show success - we'll implement actual Base Pay integration next
      console.log('Order created successfully:', orderReference);
      
      if (onSuccess) {
        onSuccess(orderReference);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      console.error('Checkout error:', err);
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 mb-3">Connect your wallet to continue</p>
        <Button variant="primary" size="lg" disabled>
          Connect Wallet Required
        </Button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <Button 
        variant="primary" 
        size="lg"
        className="w-full"
        onClick={() => setShowForm(true)}
        icon={<Icon name="shopping-cart" size="sm" />}
      >
        Checkout with Base Pay (${total})
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Shipping Information</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowForm(false)}
          icon={<Icon name="arrow-left" size="sm" />}
        >
          Back
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={customerData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={customerData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <input
            type="text"
            value={customerData.address1}
            onChange={(e) => handleInputChange('address1', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main St"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            value={customerData.address2}
            onChange={(e) => handleInputChange('address2', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Apt, suite, etc. (optional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={customerData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New York"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <input
              type="text"
              value={customerData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="NY"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              value={customerData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              value={customerData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10001"
              required
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">Total: ${total} USDC</span>
          <span className="text-sm text-gray-600">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleCheckout}
          disabled={loading || !validateForm()}
          loading={loading}
          icon={!loading ? <Icon name="shopping-cart" size="sm" /> : undefined}
        >
          {loading ? 'Creating Order...' : `Pay ${total} USDC`}
        </Button>
      </div>
    </div>
  );
}
