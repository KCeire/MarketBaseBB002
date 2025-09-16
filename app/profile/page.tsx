// app/profile/page.tsx
"use client";

import { useAccount } from 'wagmi';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings</p>
        </div>

        {/* Wallet Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Wallet</h2>
          {isConnected && address ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Connected Address</span>
                <span className="text-sm font-mono text-gray-900">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Network</span>
                <span className="text-sm font-medium text-blue-600">Base</span>
              </div>
              <div className="pt-2">
                <button className="text-sm text-red-600 hover:text-red-700">
                  Disconnect Wallet
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-3">No wallet connected</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Account Statistics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Account Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-600">Orders</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">$0.00</p>
              <p className="text-xs text-gray-600">Total Spent</p>
            </div>
          </div>
        </div>

        {/* Affiliate Earnings */}
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Affiliate Earnings</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Earned</span>
              <span className="text-lg font-bold text-green-600">$0.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Referrals</span>
              <span className="text-sm font-medium text-gray-900">0</span>
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
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
              <div className="space-y-3">
                <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500">Order updates and promotions</p>
                  </div>
                  <div className="text-xs text-gray-400">Coming Soon</div>
                </button>
                
                <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shipping Address</p>
                    <p className="text-xs text-gray-500">Manage delivery addresses</p>
                  </div>
                  <div className="text-xs text-gray-400">Coming Soon</div>
                </button>
                
                <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Methods</p>
                    <p className="text-xs text-gray-500">Wallet preferences</p>
                  </div>
                  <div className="text-xs text-gray-400">Coming Soon</div>
                </button>
                
                <button className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Privacy Settings</p>
                    <p className="text-xs text-gray-500">Data and privacy controls</p>
                  </div>
                  <div className="text-xs text-gray-400">Coming Soon</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">App Version</span>
              <span className="text-sm text-gray-900">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Build</span>
              <span className="text-sm text-gray-900">MVP</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network</span>
              <span className="text-sm text-blue-600 font-medium">Base Mainnet</span>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Profile Features Coming Soon</p>
              <p className="text-xs text-yellow-700 mt-1">
                Advanced profile management features are currently in development and will be available in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
