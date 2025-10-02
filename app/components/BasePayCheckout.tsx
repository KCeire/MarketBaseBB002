// app/components/BasePayCheckout.tsx
"use client";

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { pay } from '@base-org/account';
import { BasePayButton } from '@base-org/account-ui/react';
import sdk from '@farcaster/miniapp-sdk';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';
import { toast } from './ui/Toast';
import { startPaymentVerification } from '@/lib/payment-verification';

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

    // Get buyer's FID for affiliate tracking
    let buyerFid: string | undefined;
    try {
      const context = await sdk.context;
      buyerFid = context.user?.fid?.toString();
    } catch (error) {
      console.log('Could not get buyer FID:', error);
    }

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
      basePayPaymentId: basePayData?.id,
      // Add Farcaster FID for affiliate tracking
      farcasterFid: buyerFid,
      // Skip affiliate attribution at order creation - will be processed during payment verification
      skipAffiliateAttribution: true
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

  // Start payment verification in background after order creation
  const startBackgroundVerification = async (orderRef: string, transactionId: string) => {
    try {
      console.log(`🔄 Starting background payment verification for order ${orderRef}`);

      const result = await startPaymentVerification(orderRef, transactionId, {
        testnet: process.env.NODE_ENV !== 'production',
        onProgress: (attempt, status) => {
          console.log(`Payment verification attempt ${attempt}: ${status}`);
        },
        onSuccess: (result) => {
          console.log('🎉 Payment verified successfully!', result);
          setPaymentStep('success');

          if (result.affiliateProcessed) {
            toast.success('Payment Complete', 'Your order is confirmed and affiliate rewards have been processed!');
          } else {
            toast.success('Payment Complete', 'Your order is confirmed!');
          }

          if (onSuccess) {
            onSuccess(orderRef);
          }
        },
        onError: (error) => {
          console.error('💥 Payment verification failed:', error);
          toast.error('Payment Verification Failed', error);
          setPaymentStep('form'); // Allow retry

          if (onError) {
            onError(error);
          }
        }
      });

      // If verification completed immediately (already confirmed)
      if (result.success && result.paymentStatus === 'completed') {
        setPaymentStep('success');

        if (result.affiliateProcessed) {
          toast.success('Payment Complete', 'Your order is confirmed and affiliate rewards have been processed!');
        } else {
          toast.success('Payment Complete', 'Your order is confirmed!');
        }

        if (onSuccess) {
          onSuccess(orderRef);
        }
      }

    } catch (error) {
      console.error('Error starting payment verification:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
      toast.error('Payment Verification Error', errorMessage);
      setPaymentStep('form'); // Allow retry

      if (onError) {
        onError(errorMessage);
      }
    }
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
        testnet: process.env.NODE_ENV !== 'production', // Use testnet in development
        payerInfo: {
          requests: [
            { type: 'email' },
            { type: 'physicalAddress' }
          ]
        }
      });

      console.log('Base Pay payment completed:', payment.id);
      setPaymentId(payment.id);
      setBasePayData(payment);

      // Auto-populate form with Base Pay data
      populateFormFromBasePay(payment);

      // Show form for review/editing and dismiss payment processing toast
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

      // Create order with customer data (without starting affiliate attribution)
      const orderRef = await createOrderWithCustomerData();
      setOrderReference(orderRef);
      console.log('Order created:', orderRef);

      // Show success message immediately (dismiss any pending payment toast)
      toast.success('Order Created', `Order ${orderRef} created successfully`);

      // Start background payment verification with affiliate processing
      if (basePayData) {
        // Don't await this - let it run in background
        startBackgroundVerification(orderRef, basePayData.id);

        // Move to confirming state
        toast.info('Confirming Payment', 'Verifying payment on blockchain...');
      } else {
        throw new Error('Payment data not available');
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
  const inputStyles = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 [color-scheme:light] dark:[color-scheme:dark]";

  if (!isConnected) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-400 mb-3">Connect your wallet to continue</p>
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
        <p className="text-gray-600 dark:text-gray-400">
          Your order {orderReference} has been confirmed and paid with Base Pay.
        </p>
        {paymentId && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
        <p className="text-gray-600 dark:text-gray-400">
          Waiting for blockchain confirmation...
        </p>
        {orderReference && (
          <p className="text-sm text-gray-500 dark:text-gray-400">Order: {orderReference}</p>
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
        <p className="text-gray-600 dark:text-gray-400">
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm Shipping Details</h3>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total: ${total} USDC</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Payment Authorized</span>
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
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total: ${total} USDC</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        
        <div className="space-y-3">
          <BasePayButton
            colorScheme="light"
            onClick={handleBasePayment}
          />
          
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Secure USDC payment • Review shipping details after payment
          </p>
        </div>
      </div>
    </div>
  );
}
