"use client";

import { useState, useEffect, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { AdminSession } from '@/types/admin';

interface StoreOption {
  id: string;
  name: string;
  slug: string;
}

interface AdminAuthResponse {
  isAdmin: boolean;
  session: AdminSession | null;
  availableStores?: StoreOption[];
}

interface MultiStoreAdminAuthProps {
  children: React.ReactNode;
  requiredStoreId?: string; // If set, requires access to specific store
}

function MultiStoreAdminAuthInner({ children, requiredStoreId }: MultiStoreAdminAuthProps) {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [availableStores, setAvailableStores] = useState<StoreOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Get store from URL params or required store
  const targetStoreId = requiredStoreId || searchParams.get('store') || '';

  const validateAdminAccess = async (walletAddress: string, storeId?: string): Promise<AdminAuthResponse> => {
    try {
      const response = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, storeId })
      });

      if (!response.ok) {
        throw new Error('Failed to validate admin access');
      }

      return await response.json();
    } catch (err) {
      console.error('Admin validation error:', err);
      return { isAdmin: false, session: null };
    }
  };

  const handleStoreSelection = async (storeId: string) => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const result = await validateAdminAccess(address, storeId);

      if (result.isAdmin && result.session) {
        setSession(result.session);
        setSelectedStore(storeId);

        // Update URL with selected store
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('store', storeId);
        router.push(currentUrl.pathname + currentUrl.search);
      } else {
        setError('Access denied to this store');
      }
    } catch (error) {
      console.error('Store access error:', error);
      setError('Failed to access store');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!isConnected || !address) {
        setSession(null);
        setAvailableStores([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First check general admin access
        const generalResult = await validateAdminAccess(address);

        if (!generalResult.isAdmin) {
          setSession(null);
          setAvailableStores([]);
          setLoading(false);
          return;
        }

        setAvailableStores(generalResult.availableStores || []);

        // If targeting specific store, validate access to it
        if (targetStoreId) {
          const storeResult = await validateAdminAccess(address, targetStoreId);

          if (storeResult.isAdmin && storeResult.session) {
            setSession(storeResult.session);
            setSelectedStore(targetStoreId);
          } else {
            setError(`Access denied to store: ${targetStoreId}`);
            setSession(null);
          }
        } else if (generalResult.session) {
          // No specific store required, use general session
          setSession(generalResult.session);
        }
      } catch (err) {
        console.error('Admin auth error:', err);
        setError('Failed to validate admin access');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [address, isConnected, targetStoreId]);

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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="shield" size="lg" className="text-blue-600" />
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="shield-x" size="lg" className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              Your wallet address is not authorized to access the admin panel.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
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

  // Show store selection if user has access to multiple stores and no specific store is required
  if (!requiredStoreId && !targetStoreId && availableStores.length > 1 && !selectedStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="store" size="lg" className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Store</h2>
              <p className="text-gray-600">
                Choose which store you&apos;d like to manage:
              </p>
            </div>

            <div className="space-y-3">
              {availableStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleStoreSelection(store.id)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900">{store.name}</h3>
                  <p className="text-sm text-gray-500">Manage {store.slug}</p>
                </button>
              ))}

              {session.isSuperAdmin && (
                <button
                  onClick={() => handleStoreSelection('all')}
                  className="w-full p-4 text-left border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <h3 className="font-semibold text-blue-900">All Stores</h3>
                  <p className="text-sm text-blue-600">Super Admin Dashboard</p>
                </button>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
                icon={<Icon name="arrow-left" size="sm" />}
                className="w-full"
              >
                Back to Store
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
}

// Main export with Suspense boundary
export function MultiStoreAdminAuth({ children, requiredStoreId }: MultiStoreAdminAuthProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Loading admin authentication...</p>
        </div>
      </div>
    }>
      <MultiStoreAdminAuthInner requiredStoreId={requiredStoreId}>
        {children}
      </MultiStoreAdminAuthInner>
    </Suspense>
  );
}