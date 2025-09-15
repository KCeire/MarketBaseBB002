// app/components/admin/AdminAuth.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

// Admin wallet addresses
const ADMIN_ADDRESSES = [
  '0xdE2bDb0F443CAda8102A73940CC8E27079c513D4',
  '0xE3E64A95AF29827125D43f4091A3b1e76611aF9A',
  '0xe72421aE2B79b21AF3550d8f6adF19b67ccCBc8B',
  '0xE40b9f2A321715DF69EF67AD30BA7453A289BCeB'
];

interface AdminAuthProps {
  children: React.ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      // Check if connected address is in admin list (case-insensitive)
      const isAdminWallet = ADMIN_ADDRESSES.some(
        adminAddr => adminAddr.toLowerCase() === address.toLowerCase()
      );
      setIsAdmin(isAdminWallet);
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  }, [address, isConnected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="eye" size="lg" className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              Please connect your wallet to access the admin panel.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/'}
              icon={<Icon name="arrow-left" size="sm" />}
            >
              Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="eye" size="lg" className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Your wallet address is not authorized to access the admin panel.
            </p>
            <div className="bg-gray-50 rounded-md p-3 mb-6">
              <p className="text-sm text-gray-500">Connected Wallet:</p>
              <p className="text-sm font-mono text-gray-700">{address}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/'}
              icon={<Icon name="arrow-left" size="sm" />}
            >
              Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated admin, render children
  return <>{children}</>;
}
