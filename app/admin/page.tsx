// app/admin/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { MultiStoreAdminAuth } from '../components/admin/MultiStoreAdminAuth';
import { MultiStoreAdminDashboard } from '../components/admin/MultiStoreAdminDashboard';
import { AdminDashboard } from '../components/admin/AdminDashboard'; // Legacy fallback
import { AdminSession } from '@/types/admin';
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

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (!isConnected || !address) {
        setSession(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address })
        });

        const data = await response.json();
        if (data.isAdmin && data.session) {
          setSession(data.session);

          // Smart routing: redirect store admins to their specific store
          if (data.availableStores && data.availableStores.length === 1 && !data.session.isSuperAdmin) {
            const store = data.availableStores[0];
            console.log(`[Admin Page] Redirecting single store admin to: /admin/${store.id}`);
            setRedirecting(true);
            router.push(`/admin/${store.id}`);
            return; // Don't set loading to false, keep spinner while redirecting
          }
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        setSession(null);
      } finally {
        if (!redirecting) {
          setLoading(false);
        }
      }
    };

    validateSession();
  }, [address, isConnected, router, redirecting]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Wallet connection header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">MarketBase Admin</h1>
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

      <MultiStoreAdminAuth>
        {loading || redirecting ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600">
                {redirecting ? 'Redirecting to your store admin...' : 'Loading admin panel...'}
              </p>
            </div>
          </div>
        ) : session ? (
          <MultiStoreAdminDashboard session={session} />
        ) : (
          // Fallback to legacy admin dashboard if session validation fails
          <AdminDashboard />
        )}
      </MultiStoreAdminAuth>
    </div>
  );
}
