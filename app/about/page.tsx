// app/about/page.tsx
"use client";

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">About MarketBase</h1>
          <p className="text-gray-600 dark:text-gray-300">The future of decentralized commerce</p>
        </div>

        {/* Mission */}
        <div className="bg-gray-800 dark:bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Our Mission</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            MarketBase is revolutionizing e-commerce by creating a decentralized marketplace where anyone can buy, sell, and earn commissions using cryptocurrency. Built on Base, we&apos;re making global commerce accessible, instant, and crypto-native.
          </p>
        </div>

        {/* Key Features */}
        <div className="bg-gray-800 dark:bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">What Makes Us Different</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-white">Crypto-Native Payments</p>
                <p className="text-xs text-gray-400">Instant USDC payments on Base - no traditional banking delays</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-white">Built-in Affiliate System</p>
                <p className="text-xs text-gray-400">Every user is automatically an affiliate - share and earn commissions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-white">Farcaster Integration</p>
                <p className="text-xs text-gray-400">Native social commerce through the Farcaster ecosystem</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-white">Global Accessibility</p>
                <p className="text-xs text-gray-400">No borders, no banks required - just your crypto wallet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology */}
        <div className="bg-gray-800 dark:bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Built on Base</h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            MarketBase leverages Base&apos;s low-cost or free, fast transactions to create a seamless shopping experience. Being onchain ensure secure, transparent transactions while keeping fees minimal or free.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Base Blockchain</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">USDC Payments</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">OnchainKit</span>
          </div>
        </div>

        {/* Team */}
        <div className="bg-gray-800 dark:bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Development Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">MVP Development</span>
              <span className="text-xs text-blue-600 font-medium">In Progress</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Core Features</span>
              <span className="text-xs text-green-600 font-medium">Complete</span>
            </div>
            <div className="flex justify-between items-center">
              <Link href="/sell" className="text-sm text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-1 group">
                Seller Onboarding
                <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity">(apply here)</span>
              </Link>
              <span className="text-xs text-blue-600 font-medium">In Progress</span>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="text-center space-y-2 py-4">
          <p className="text-xs text-gray-500">MarketBase v1.0</p>
          <p className="text-xs text-gray-400">Built with ❤️ on Base</p>
        </div>
      </div>
    </div>
  );
}
