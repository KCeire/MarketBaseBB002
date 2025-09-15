// app/components/BasePayCheckout.tsx
"use client";

import React, { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { Button } from './ui/Button';
import { Icon } from './ui/Icon';

// USDC Contract ABI (ERC-20 transfer function)
const USDC_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const;

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
  const [paymentStep, setPaymentStep] = useState<'form' | 'payment' | 'confirming' | 'success'>('form');
  const [orderReference, setOrderReference] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  
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

  // USDC Contract interaction
  const { writeContract, data: transactionData, isPending: isTransactionPending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isTransactionSuccess } = useWaitForTransactionReceipt({
    hash: transactionData,
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
      totalAmount: total,
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

  const processPayment = async () => {
    try {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      const marketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_WALLET_ADDRESS as `0x${string}`;
      const usdcAddress = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}`;

      if (!marketplaceAddress || !usdcAddress) {
        throw new Error('Payment configuration missing');
      }

      // Convert total amount to USDC units (6 decimals for USDC)
      const amountInWei = parseUnits(total, 6);
      
      console.log('Processing USDC payment:', {
        to: marketplaceAddress,
        amount: amountInWei.toString(),
        amountFormatted: total
      });

      // Execute USDC transfer
      writeContract({
        address: usdcAddress,
        abi: USDC_ABI,
        functionName: 'transfer',
        args: [marketplaceAddress, amountInWei],
      });

    } catch (err) {
      console.error('Payment processing error:', err);
      throw err;
    }
  };

  const updateOrderWithPayment = async (txHash: string, orderRef: string) => {
    try {
      const response = await fetch('/api/orders/update-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderReference: orderRef,
          transactionHash: txHash,
          paymentStatus: 'completed'
        }),
      });

      if (!response.ok) {
        console.error('Failed to update order with payment info');
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setPaymentStep('payment');

      if (!isConnected) {
        throw new Error('Please connect your wallet first');
      }

      // Step 1: Create order in database
      console.log('Creating order...');
      const orderRef = await createOrder();
      setOrderReference(orderRef);
      console.log('Order created:', orderRef);

      // Step 2: Process USDC payment
      console.log('Processing payment...');
      await processPayment();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      console.error('Checkout error:', err);
      setPaymentStep('form');
      
      if (onError) {
        onError(errorMessage);
      } else {
        alert(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle transaction state changes
  React.useEffect(() => {
    if (isTransactionPending) {
      setPaymentStep('confirming');
    }
    
    if (isConfirming && transactionData) {
      setTransactionHash(transactionData);
      setPaymentStep('confirming');
    }
    
    if (isTransactionSuccess && transactionData && orderReference) {
      setPaymentStep('success');
      setTransactionHash(transactionData);
      
      // Update order with payment info
      updateOrderWithPayment(transactionData, orderReference);
      
      if (onSuccess) {
        onSuccess(orderReference);
      }
    }
  }, [isTransactionPending, isConfirming, isTransactionSuccess, transactionData, orderReference, onSuccess]);

  // Common input styles with dark mode overrides
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

  // Payment success state
  if (paymentStep === 'success') {
    return (
      <div className="text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="check" size="lg" className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-600">Payment Successful!</h3>
        <p className="text-gray-600">
          Your order {orderReference} has been confirmed and paid with USDC.
        </p>
        {transactionHash && (
          <p className="text-sm text-gray-500">
            Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
          </p>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            setShowForm(false);
            setPaymentStep('form');
            setOrderReference('');
            setTransactionHash('');
          }}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  // Payment processing states
  if (paymentStep === 'payment' || paymentStep === 'confirming') {
    return (
      <div className="text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Icon name="credit-card" size="lg" className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold">
          {paymentStep === 'payment' ? 'Processing Payment...' : 'Confirming Transaction...'}
        </h3>
        <p className="text-gray-600">
          {paymentStep === 'payment' 
            ? 'Please confirm the USDC transaction in your wallet'
            : 'Waiting for blockchain confirmation...'
          }
        </p>
        {orderReference && (
          <p className="text-sm text-gray-500">Order: {orderReference}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPaymentStep('form');
            setLoading(false);
          }}
        >
          Cancel
        </Button>
      </div>
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
          <span className="text-sm text-gray-600">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleCheckout}
          disabled={loading || !validateForm() || isTransactionPending || isConfirming}
          loading={loading || isTransactionPending || isConfirming}
          icon={!loading && !isTransactionPending && !isConfirming ? <Icon name="credit-card" size="sm" /> : undefined}
        >
          {loading ? 'Creating Order...' : 
           isTransactionPending ? 'Confirm in Wallet...' :
           isConfirming ? 'Confirming Payment...' :
           `Pay ${total} USDC`}
        </Button>
      </div>
    </div>
  );
}
