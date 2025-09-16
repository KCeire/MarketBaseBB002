// app/components/admin/AdminAuth.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

// For client-side, we'll validate admin access through an API call
const validateAdminAccess = async (walletAddress: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/admin/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress })
    });
    const data = await response.json();
    return data.isAdmin || false;
  } catch {
    return false;
  }
};

interface AdminAuthProps {
  children: React.ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const { address, isConnected } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (isConnected && address) {
        const isAdminResult = await validateAdminAccess(address);
        setIsAdmin(isAdminResult);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdminAccess();
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
