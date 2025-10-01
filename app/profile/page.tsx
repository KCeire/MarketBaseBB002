// app/profile/page.tsx
"use client";

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

interface UserStats {
  orderCount: number;
  totalSpent: number;
  loading: boolean;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [userStats, setUserStats] = useState<UserStats>({
    orderCount: 0,
    totalSpent: 0,
    loading: true
  });

  // Fetch user statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!address) {
        setUserStats({ orderCount: 0, totalSpent: 0, loading: false });
        return;
      }

      try {
        const response = await fetch(`/api/orders/user?wallet=${address}&limit=1000`);
        const data = await response.json();

        if (data.success && data.orders) {
          const confirmedOrders = data.orders.filter((order: { payment_status: string }) =>
            order.payment_status === 'confirmed'
          );

          const totalSpent = confirmedOrders.reduce((sum: number, order: { total_amount: number }) =>
            sum + order.total_amount, 0
          );

          setUserStats({
            orderCount: data.orders.length,
            totalSpent,
            loading: false
          });
        } else {
          setUserStats({ orderCount: 0, totalSpent: 0, loading: false });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setUserStats({ orderCount: 0, totalSpent: 0, loading: false });
      }
    };

    fetchUserStats();
  }, [address]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav bg-gray-900 min-h-screen">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Profile</h1>
          <p className="text-gray-400">Manage your account settings</p>
        </div>

        {/* Wallet Info */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Wallet</h2>
          {isConnected && address ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Connected Address</span>
                <span className="text-sm font-mono text-gray-100">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Network</span>
                <span className="text-sm font-medium text-blue-400">Base</span>
              </div>
              <div className="pt-2">
                <button className="text-sm text-red-400 hover:text-red-300">
                  Disconnect Wallet
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 mb-3">No wallet connected</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Account Statistics */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Account Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-700/50 rounded-lg">
              {userStats.loading ? (
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-100">{userStats.orderCount}</p>
              )}
              <p className="text-xs text-gray-400">Orders</p>
            </div>
            <div className="text-center p-3 bg-gray-700/50 rounded-lg">
              {userStats.loading ? (
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-100">${userStats.totalSpent.toFixed(2)}</p>
              )}
              <p className="text-xs text-gray-400">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Affiliate Earnings */}
        <div className="bg-green-900/20 rounded-xl border border-green-600 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Affiliate Earnings</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Total Earned</span>
              <span className="text-lg font-bold text-green-300">$0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Referrals</span>
              <span className="text-sm font-medium text-gray-100">0</span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => window.location.href = '/earn'}
                className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
              >
                Learn About Earning
              </button>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-100 mb-4">Settings</h2>
              <div className="space-y-3">
                <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-100">Notifications</p>
                    <p className="text-xs text-gray-400">Order updates and promotions</p>
                  </div>
                  <div className="text-xs text-gray-500">Coming Soon</div>
                </button>

                <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-100">Shipping Address</p>
                    <p className="text-xs text-gray-400">Manage delivery addresses</p>
                  </div>
                  <div className="text-xs text-gray-500">Coming Soon</div>
                </button>

                <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-100">Payment Methods</p>
                    <p className="text-xs text-gray-400">Wallet preferences</p>
                  </div>
                  <div className="text-xs text-gray-500">Coming Soon</div>
                </button>

                <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-700 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-100">Privacy Settings</p>
                    <p className="text-xs text-gray-400">Data and privacy controls</p>
                  </div>
                  <div className="text-xs text-gray-500">Coming Soon</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">App Version</span>
              <span className="text-sm text-gray-100">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Build</span>
              <span className="text-sm text-gray-100">MVP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Network</span>
              <span className="text-sm text-blue-400 font-medium">Base Mainnet</span>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-300">Profile Features Coming Soon</p>
              <p className="text-xs text-yellow-400 mt-1">
                Advanced profile management features are currently in development and will be available in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
