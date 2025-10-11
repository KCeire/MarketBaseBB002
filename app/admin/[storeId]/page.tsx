// app/admin/[storeId]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { MultiStoreAdminAuth } from '../../components/admin/MultiStoreAdminAuth';
import { MultiStoreAdminDashboard } from '../../components/admin/MultiStoreAdminDashboard';
import { AdminSession } from '@/types/admin';
import { getStoreConfig } from '@/lib/admin/stores-config';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";

export default function StoreAdminPage() {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storeId = params.storeId as string;
  const storeConfig = getStoreConfig(storeId);

  useEffect(() => {
    const validateStoreAccess = async () => {
      if (!isConnected || !address) {
        setSession(null);
        setLoading(false);
        return;
      }

      if (!storeConfig) {
        setError(`Store not found: ${storeId}`);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            storeId: storeId
          })
        });

        const data = await response.json();
        if (data.isAdmin && data.session) {
          setSession(data.session);
        } else {
          setError(`Access denied to store: ${storeConfig.name}`);
          setSession(null);
        }
      } catch (error) {
        console.error('Store admin validation error:', error);
        setError('Failed to validate store access');
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    validateStoreAccess();
  }, [address, isConnected, storeId, storeConfig]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">
            Loading {storeConfig?.name || storeId} admin panel...
          </p>
        </div>
      </div>
    );
  }

  if (error || !storeConfig) {
    const isAccessDenied = error?.includes('Access denied');
    const isStoreNotFound = !storeConfig;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-lg w-full mx-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isAccessDenied ? 'Access Denied' : isStoreNotFound ? 'Store Not Found' : 'Store Access Error'}
            </h2>
            <p className="text-gray-600 mb-4">
              {error || `Store "${storeId}" not found`}
            </p>

            {isAccessDenied && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Administrative Access Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Your wallet ({address?.slice(0, 6)}...{address?.slice(-4)}) does not have administrative access to {storeConfig?.name || storeId}.</p>
                      <p className="mt-2">If you believe this is an error, please contact the system administrator to add your wallet address to the store&apos;s admin list.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Admin Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Wallet connection header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">
              {storeConfig.name} Admin
            </h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {storeConfig.slug}
            </span>
          </div>
          <Wallet className="z-10">
            <ConnectWallet>
              <Name className="text-inherit" />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>

      <MultiStoreAdminAuth requiredStoreId={storeId}>
        {session ? (
          <MultiStoreAdminDashboard session={session} />
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600">Initializing store admin...</p>
            </div>
          </div>
        )}
      </MultiStoreAdminAuth>
    </div>
  );
}