// app/components/BasePayCheckout.tsx
"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { pay, getPaymentStatus } from '@base-org/account';
import { BasePayButton } from '@base-org/account-ui/react';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { toast } from './ui/Toast';

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

interface PaymentResult {
  id: string;
  payerInfoResponses?: {
    email?: string;
    physicalAddress?: {
      name?: {
        firstName: string;
        familyName: string;
      };
      address1: string;
      address2?: string;
      city: string;
      state: string;
      countryCode: string;
      postalCode: string;
    };
  };
}

export function BasePayCheckout({ cart, total, onSuccess, onError }: BasePayCheckoutProps) {
  const { address, isConnected } = useAccount();
  const [paymentStep, setPaymentStep] = useState<'ready' | 'form' | 'processing' | 'confirming' | 'success'>('ready');
  const [orderReference, setOrderReference] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [basePayData, setBasePayData] = useState<PaymentResult | null>(null);

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

  const populateFormFromBasePay = (paymentResult: PaymentResult) => {
    const physicalAddress = paymentResult.payerInfoResponses?.physicalAddress;
    const customerName = physicalAddress?.name;

    setCustomerData({
      email: paymentResult.payerInfoResponses?.email || '',
      name: customerName ? `${customerName.firstName} ${customerName.familyName}` : '',
      address1: physicalAddress?.address1 || '',
      address2: physicalAddress?.address2 || '',
      city: physicalAddress?.city || '',
      state: physicalAddress?.state || '',
      country: physicalAddress?.countryCode || 'US',
      zipCode: physicalAddress?.postalCode || '',
    });
  };

  const createOrderWithCustomerData = async (): Promise<string> => {
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
      image: item.image,
      sku: item.sku
    }));

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
      orderItems,
      totalAmount: total,
      customerWallet: address,
      basePayPaymentId: basePayData?.id
    };

    console.log('Creating order with customer data:', {
      ...requestBody,
      customerData: { ...requestBody.customerData, email: '[REDACTED]' }
    });

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

  const updateOrderWithPaymentStatus = async (orderRef: string, paymentId: string, status: string) => {
    try {
      const response = await fetch('/api/orders/update-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderReference: orderRef,
          transactionHash: paymentId,
          paymentStatus: status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update payment API error:', errorData);
        throw new Error(`API Error: ${errorData.error || response.statusText}`);
      }

    } catch (err) {
      console.error('Error updating order payment status:', err);
      toast.error('Payment Update Failed', 'Unable to update payment status');
    }
  };

  const pollPaymentStatus = async (paymentId: string, orderRef: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async (): Promise<void> => {
      try {
        attempts++;
        
        const status = await getPaymentStatus({ 
          id: paymentId,
          testnet: false
        });

        console.log(`Payment status check ${attempts}:`, status.status);

        if (status.status === 'completed') {
          await updateOrderWithPaymentStatus(orderRef, paymentId, 'confirmed');
          setPaymentStep('success');
          
          if (onSuccess) {
            onSuccess(orderRef);
          }
          return;
        }

        if (status.status === 'failed') {
          await updateOrderWithPaymentStatus(orderRef, paymentId, 'failed');
          throw new Error('Payment failed on blockchain');
        }

        if (attempts < maxAttempts && status.status === 'pending') {
          setTimeout(poll, 2000);
        } else if (attempts >= maxAttempts) {
          throw new Error('Payment confirmation timeout');
        }

      } catch (err) {
        console.error('Error polling payment status:', err);
        await updateOrderWithPaymentStatus(orderRef, paymentId, 'failed');
        throw err;
      }
    };

    poll();
  };

  const handleBasePayment = async () => {
    try {
      setPaymentStep('processing');

      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }

      const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_WALLET_ADDRESS;
      if (!marketplaceAddress) {
        throw new Error('Marketplace address not configured');
      }

      console.log('Initiating Base Pay payment...');
      toast.info('Processing Payment', 'Please complete payment in Base App');

      // Initiate Base Pay payment with customer info collection
      const payment = await pay({
        amount: total,
        to: marketplaceAddress,
        testnet: false,
        payerInfo: {
          requests: [
            { type: 'email' },
            { type: 'physicalAddress' }
          ]
        }
      });

      console.log('Base Pay payment initiated:', payment.id);
      setPaymentId(payment.id);
      setBasePayData(payment);

      // Auto-populate form with Base Pay data
      populateFormFromBasePay(payment);
      
      // Show form for review/editing
      setPaymentStep('form');
      toast.success('Payment Authorized', 'Please review shipping details');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      console.error('Base Pay initiation error:', err);
      setPaymentStep('ready');
      
      toast.error('Payment Failed', errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const handleConfirmOrder = async () => {
    try {
      setPaymentStep('confirming');
      toast.paymentPending();

      // Create order with customer data
      const orderRef = await createOrderWithCustomerData();
      setOrderReference(orderRef);
      console.log('Order created:', orderRef);

      toast.info('Order Created', `Order ${orderRef} is being confirmed`);

      // Start payment confirmation polling
      if (basePayData) {
        await pollPaymentStatus(basePayData.id, orderRef);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Order creation failed';
      console.error('Order creation error:', err);
      setPaymentStep('form');
      
      toast.error('Order Failed', errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const resetCheckout = () => {
    setPaymentStep('ready');
    setOrderReference('');
    setPaymentId('');
    setBasePayData(null);
    setCustomerData({
      email: '',
      name: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: 'US',
      zipCode: '',
    });
  };

  // Common input styles
  const inputStyles = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 [color-scheme:light]";

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

  // Payment success state
  if (paymentStep === 'success') {
    return (
      <div className="text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="check" size="lg" className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-600">Payment Successful!</h3>
        <p className="text-gray-600">
          Your order {orderReference} has been confirmed and paid with Base Pay.
        </p>
        {paymentId && (
          <p className="text-sm text-gray-500">
            Payment ID: {paymentId.slice(0, 10)}...{paymentId.slice(-8)}
          </p>
        )}
        <Button
          variant="secondary"
          onClick={resetCheckout}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  // Payment confirming state
  if (paymentStep === 'confirming') {
    return (
      <div className="text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Icon name="credit-card" size="lg" className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Confirming Payment...</h3>
        <p className="text-gray-600">
          Waiting for blockchain confirmation...
        </p>
        {orderReference && (
          <p className="text-sm text-gray-500">Order: {orderReference}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={resetCheckout}
        >
          Cancel
        </Button>
      </div>
    );
  }

  // Processing payment state
  if (paymentStep === 'processing') {
    return (
      <div className="text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Icon name="credit-card" size="lg" className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">Processing Payment...</h3>
        <p className="text-gray-600">
          Complete the payment in your Base Account
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetCheckout}
        >
          Cancel
        </Button>
      </div>
    );
  }

  // Shipping form state
  if (paymentStep === 'form') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Confirm Shipping Details</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetCheckout}
            icon={<Icon name="arrow-left" size="sm" />}
          >
            Back
          </Button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
          <p className="text-sm text-green-700">
            <Icon name="check" size="sm" className="inline mr-1" />
            Payment authorized! Please confirm shipping details below.
          </p>
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
              className={inputStyles}
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
              className={inputStyles}
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
              className={inputStyles}
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
              className={inputStyles}
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
                className={inputStyles}
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
                className={inputStyles}
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
                className={inputStyles}
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
                className={inputStyles}
                placeholder="10001"
                required
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">Total: ${total} USDC</span>
            <span className="text-sm text-gray-600">Payment Authorized</span>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleConfirmOrder}
            disabled={!validateForm()}
            icon={<Icon name="check" size="sm" />}
          >
            Confirm Order & Ship
          </Button>
        </div>
      </div>
    );
  }

  // Ready state - show Base Pay button
  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">Total: ${total} USDC</span>
          <span className="text-sm text-gray-600">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        
        <div className="space-y-3">
          <BasePayButton
            colorScheme="light"
            onClick={handleBasePayment}
          />
          
          <p className="text-sm text-gray-500 text-center">
            Secure USDC payment • Review shipping details after payment
          </p>
        </div>
      </div>
    </div>
  );
}
