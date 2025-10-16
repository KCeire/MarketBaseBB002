// app/sell/page.tsx
"use client";

import { useState } from 'react';
import { toast } from '../components/ui/Toast';
import Image from 'next/image';
import { SellerApplicationForm } from '../components/SellerApplicationForm';

export default function SellPage() {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  if (showApplicationForm) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
        <SellerApplicationForm onBack={() => setShowApplicationForm(false)} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sell on Base Shop</h1>
          <p className="text-gray-600 dark:text-gray-400">Join our marketplace and reach customers worldwide</p>
        </div>

        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-xl p-6 text-center space-y-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Start Selling Today</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Join our existing sellers to realise the full potential of selling Onchain</p>
        </div>

        {/* Top Apply Button */}
        <div>
          <button
            onClick={() => setShowApplicationForm(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply to Become a Seller
          </button>
        </div>

        {/* Why Sell With Us */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Why Sell With Us?</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Crypto-Native Payments</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Get paid instantly in USDC on Base - no waiting for traditional payment processing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Global Reach</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Access customers worldwide through Farcaster and Base ecosystem</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Custom Store Design</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Create your unique branded store experience within our marketplace</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-600 dark:bg-orange-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Built-in Affiliate Network</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Every user becomes your affiliate - amplify your reach organically</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How It Works</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Apply to Sell</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Submit your application with product details and business info</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Get Approved</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Our team reviews your application and helps with onboarding</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Design Your Store</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Create your custom branded experience within our marketplace</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Start Selling</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">List your products and start reaching customers immediately</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 text-center">Simple, Transparent Pricing</h3>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">**% + Payment Processing</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">No monthly fees • No setup costs • No hidden charges</p>
          </div>
        </div>

        {/* Featured Sellers */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Featured Sellers</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/store/nft-energy'}
              className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-600">
                <Image
                  src="/stores/NFTEnergyDrinks/NFTEnergyDrinksLogo.png"
                  alt="NFT Energy Drinks Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">NFT Energy Drinks</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Where Web3 meets real energy</p>
              </div>
              <div className="text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-3">
          <button
            onClick={() => setShowApplicationForm(true)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply to Become a Seller
          </button>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                toast.info('Stores Coming Soon', 'Individual seller stores are launching soon. Stay tuned!');
              }}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Browse Stores
            </button>
            <button
              onClick={() => window.location.href = '/earn'}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Learn About Earning
            </button>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Questions about selling?</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">Contact us at lk@lkforge.xyz</p>
        </div>
      </div>
    </div>
  );
}