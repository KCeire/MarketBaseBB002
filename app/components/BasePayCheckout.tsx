// app/components/BasePayCheckout.tsx
"use client";

import React, { useState, useEffect } from 'react';
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
  const [paymentStep, setPaymentStep] = useState<'shipping' | 'ready' | 'form' | 'processing' | 'confirming' | 'success'>('shipping');
  const [orderReference, setOrderReference] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [basePayData, setBasePayData] = useState<PaymentResult | null>(null);
  const [affiliateData, setAffiliateData] = useState<{referrerFid: string; productIds: string[]} | null>(null);

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

  // Load affiliate data from localStorage for display
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('affiliate_clicks');
      if (storedData) {
        const clicks = JSON.parse(storedData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validClicks = clicks.filter((click: any) => click.expires > Date.now());

        if (validClicks.length > 0) {
          // Group by referrer and collect product IDs
          const referrerMap = new Map();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          validClicks.forEach((click: any) => {
            if (!referrerMap.has(click.referrerFid)) {
              referrerMap.set(click.referrerFid, []);
            }
            referrerMap.get(click.referrerFid).push(click.productId);
          });

          // For now, just show the first referrer (most common case)
          const firstEntry = referrerMap.entries().next().value;
          if (firstEntry) {
            const [referrerFid, productIds] = firstEntry;
            setAffiliateData({ referrerFid, productIds });
          }
        }
      }
    } catch (error) {
      console.error('Error loading affiliate data for display:', error);
    }
  }, []);

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


  const createOrderWithCustomerData = async (): Promise<string> => {
    console.log('🚀 CHECKOUT: Starting order creation process...');

    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      console.error('❌ CHECKOUT: Wallet validation failed:', error);
      throw new Error(error);
    }

    if (!validateForm()) {
      const error = 'Please fill in all required fields';
      console.error('❌ CHECKOUT: Form validation failed:', error);
      throw new Error(error);
    }

    console.log('✅ CHECKOUT: Wallet and form validations passed');

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

    console.log('📦 CHECKOUT: Order items prepared:', {
      itemCount: orderItems.length,
      totalAmount: total,
      items: orderItems.map(item => ({ productId: item.productId, title: item.title, price: item.price, quantity: item.quantity }))
    });

    // Get buyer's FID for affiliate tracking
    let buyerFid: string | undefined;
    try {
      console.log('🔍 CHECKOUT: Attempting to get buyer FID from Farcaster context...');
      const context = await sdk.context;
      buyerFid = context.user?.fid?.toString();
      console.log('✅ CHECKOUT: Buyer FID retrieved:', { buyerFid: buyerFid || 'none' });
    } catch (error) {
      console.warn('⚠️ CHECKOUT: Could not get buyer FID:', error);
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
      farcasterFid: buyerFid
    };

    console.log('📞 CHECKOUT: Calling order creation API with data:', {
      ...requestBody,
      customerData: { ...requestBody.customerData, email: '[REDACTED]' },
      timestamp: new Date().toISOString()
    });

    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📞 CHECKOUT: Order creation API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ CHECKOUT: Order creation API failed:', {
        status: response.status,
        error: error,
        requestBody: { ...requestBody, customerData: { ...requestBody.customerData, email: '[REDACTED]' } }
      });
      throw new Error(error.error || 'Failed to create order');
    }

    const data = await response.json();
    console.log('✅ CHECKOUT: Order creation API response:', {
      success: data.success,
      orderReference: data.orderReference,
      hasAffiliate: !!data.affiliateProcessed
    });

    if (!data.success) {
      console.error('❌ CHECKOUT: Order creation marked as failed in response:', data);
      throw new Error(data.error || 'Order creation failed');
    }

    console.log(`🎯 CHECKOUT: Order created successfully: ${data.orderReference}`);
    return data.orderReference;
  };

  // Start payment verification in background after order creation
  const startBackgroundVerification = async (orderRef: string, transactionId: string) => {
    try {
      console.log('🚀 CHECKOUT: Starting background payment verification:', {
        orderRef,
        transactionId,
        testnet: process.env.NODE_ENV !== 'production',
        timestamp: new Date().toISOString()
      });

      const result = await startPaymentVerification(orderRef, transactionId, {
        testnet: process.env.NODE_ENV !== 'production',
        onProgress: (attempt, status) => {
          console.log(`🔄 CHECKOUT PROGRESS: Payment verification attempt ${attempt}: ${status}`);
        },
        onSuccess: (result) => {
          console.log('🎉 CHECKOUT SUCCESS: Payment verified successfully!', {
            result,
            orderRef,
            affiliateProcessed: result.affiliateProcessed,
            paymentStatus: result.paymentStatus
          });
          setPaymentStep('success');

          if (result.affiliateProcessed) {
            console.log('💰 CHECKOUT: Affiliate rewards were processed for this order');
            toast.success('Payment Complete', 'Your order is confirmed and affiliate rewards have been processed!');
          } else {
            console.log('ℹ️ CHECKOUT: No affiliate rewards processed (normal for non-affiliate orders)');
            toast.success('Payment Complete', 'Your order is confirmed!');
          }

          if (onSuccess) {
            onSuccess(orderRef);
          }
        },
        onError: (error) => {
          console.error('💥 CHECKOUT ERROR: Payment verification failed:', {
            error,
            orderRef,
            transactionId
          });
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
      console.log('🚀 CHECKOUT: Starting Base Pay payment process...');
      setPaymentStep('processing');

      if (!isConnected) {
        const error = 'Please connect your wallet first';
        console.error('❌ CHECKOUT: Wallet not connected for Base Pay:', error);
        throw new Error(error);
      }

      const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_WALLET_ADDRESS;
      if (!marketplaceAddress) {
        const error = 'Marketplace address not configured';
        console.error('❌ CHECKOUT: Missing marketplace address:', error);
        throw new Error(error);
      }

      console.log('💳 CHECKOUT: Initiating Base Pay payment:', {
        amount: total,
        to: marketplaceAddress,
        testnet: process.env.NODE_ENV !== 'production',
        timestamp: new Date().toISOString()
      });
      toast.info('Processing Payment', 'Please complete payment in Base App');

      // Initiate Base Pay payment (shipping info already collected)
      const payment = await pay({
        amount: total,
        to: marketplaceAddress,
        testnet: process.env.NODE_ENV !== 'production' // Use testnet in development
      });

      console.log('✅ CHECKOUT: Base Pay payment completed successfully:', {
        paymentId: payment.id,
        timestamp: new Date().toISOString()
      });
      setPaymentId(payment.id);
      setBasePayData(payment);

      // Payment completed - proceed to confirmation
      console.log('📝 CHECKOUT: Payment completed, proceeding to order confirmation...');

      // Show confirmation page (shipping info already collected)
      setPaymentStep('form');
      toast.success('Payment Authorized', 'Please review your order details');

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
      console.log('🚀 CHECKOUT: Starting final order confirmation...');
      setPaymentStep('confirming');

      // Create order with customer data (without starting affiliate attribution)
      console.log('📝 CHECKOUT: Creating order with customer data...');
      const orderRef = await createOrderWithCustomerData();
      setOrderReference(orderRef);
      console.log('✅ CHECKOUT: Order created successfully:', orderRef);

      // Show success message immediately (dismiss any pending payment toast)
      toast.success('Order Created', `Order ${orderRef} created successfully`);

      // Start background payment verification with affiliate processing
      if (basePayData) {
        console.log('🔄 CHECKOUT: Starting background payment verification process...');
        // Don't await this - let it run in background
        startBackgroundVerification(orderRef, basePayData.id);

        // Move to confirming state
        toast.info('Confirming Payment', 'Verifying payment on blockchain...');
      } else {
        const error = 'Payment data not available';
        console.error('❌ CHECKOUT: Missing Base Pay data:', { basePayData, paymentId });
        throw new Error(error);
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

  // Shipping information state (before payment)
  if (paymentStep === 'shipping') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Shipping Information</h3>
        </div>

        {/* Affiliate Information Display */}
        {affiliateData && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <Icon name="users" size="sm" className="text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Affiliate Order (Referrer: {affiliateData.referrerFid})
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Products: {affiliateData.productIds.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              value={customerData.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              className={inputStyles}
              placeholder="123 Main Street"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={customerData.address2}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              className={inputStyles}
              placeholder="Apartment, suite, etc."
            />
          </div>

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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State/Province *
            </label>
            <input
              type="text"
              value={customerData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={inputStyles}
              placeholder="NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ZIP/Postal Code *
            </label>
            <input
              type="text"
              value={customerData.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className={inputStyles}
              placeholder="10001"
            />
          </div>

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
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total: ${total} USDC</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Not connected'}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              if (validateForm()) {
                setPaymentStep('ready');
              } else {
                toast.error('Missing Information', 'Please fill in all required fields');
              }
            }}
            disabled={!validateForm() || !isConnected}
            className="w-full"
          >
            {!isConnected ? 'Connect Wallet First' : 'Continue to Payment'}
          </Button>

          {!isConnected && (
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-2">
              Please connect your wallet to continue
            </p>
          )}
        </div>
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

  // Order confirmation state (after payment, before final confirmation)
  if (paymentStep === 'form') {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Order Confirmation</h3>
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
            Payment authorized! Please review your order details below.
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
          {/* Affiliate Information Display */}
          {affiliateData && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Icon name="users" size="sm" className="text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Affiliate Order (Referrer: {affiliateData.referrerFid})
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Products: {affiliateData.productIds.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total: ${total} USDC</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Payment Authorized</span>
          </div>
          
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleConfirmOrder}
            disabled={false}
            icon={<Icon name="check" size="sm" />}
          >
            Complete Order
          </Button>
        </div>
      </div>
    );
  }

  // Ready state - show Base Pay button
  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        {/* Affiliate Information Display */}
        {affiliateData && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <Icon name="users" size="sm" className="text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Affiliate Order (Referrer: {affiliateData.referrerFid})
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Products: {affiliateData.productIds.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Summary */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Shipping To:</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaymentStep('shipping')}
              className="text-blue-600 hover:text-blue-700"
            >
              Edit
            </Button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>{customerData.name}</p>
            <p>{customerData.address1}</p>
            {customerData.address2 && <p>{customerData.address2}</p>}
            <p>{customerData.city}, {customerData.state} {customerData.zipCode}</p>
            <p>{customerData.country}</p>
            <p className="mt-1 font-medium">{customerData.email}</p>
          </div>
        </div>

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
            Secure USDC payment • Shipping details confirmed
          </p>
        </div>
      </div>
    </div>
  );
}
