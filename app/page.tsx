// app/page.tsx
"use client";
import {
  useMiniKit,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shop } from "./components/Shop";
import Image from "next/image";

function AppContent() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const searchParams = useSearchParams();
  const router = useRouter();
  const showCart = searchParams.get('view') === 'cart';
  const showCategories = searchParams.get('view') === 'categories';

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Handle referral parameters
  useEffect(() => {
    const handleReferralParams = async () => {
      const productId = searchParams.get('p');
      const referrerId = searchParams.get('ref');
      
      if (referrerId) {
        sessionStorage.setItem('affiliate_ref', referrerId);
        
        // Track the affiliate click if there's a product
        if (productId) {
          try {
            await fetch('/api/affiliate/track-click', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                referrerFid: referrerId,
                productId: productId
              })
            });
            console.log('🔗 Affiliate click tracked:', { referrerId, productId });
          } catch (error) {
            console.error('Failed to track affiliate click:', error);
          }
        }
      }
      
      // Redirect to product page if product ID is present
      if (productId) {
        // Clean URL first
        window.history.replaceState({}, '', '/');
        // Navigate to product
        router.push(`/product/${productId}`);
      }
    };
    
    handleReferralParams();
  }, [searchParams, router]);

  const handleBackToTrade = useCallback(() => {
    window.history.replaceState({}, '', '/');
  }, []);

  // If showing cart or categories, use the existing Trade component
  if (showCart || showCategories) {
    return (
      <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
        <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
          <header className="flex justify-between items-center mb-3 h-auto min-h-[44px]">
            <div className="flex items-center space-x-2">
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
            <div className="flex-shrink-0 mr-3">
              <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                Trade → Share → Earn
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Shop 
              setActiveTab={() => {}} 
              showCart={showCart}
              showCategories={showCategories}
              onBackToShop={handleBackToTrade}
            />
          </main>
        </div>
      </div>
    );
  }

  // New homepage layout
  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
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
          <div className="flex-shrink-0 mr-3">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
              Trade → Share → Earn
            </div>
          </div>
        </header>

        <main className="space-y-6">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 py-4 px-6 text-white min-h-[95px]">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(/AppMedia/topHomePageImage.jpg)'
              }}
            ></div>
            {/* Text commented out - will be added back with final images */}
            {/*
            <div className="relative z-10 text-center space-y-3">
              <h1 className="text-2xl font-bold">MarketBase</h1>
              <p className="text-blue-100 text-sm">
                Your gateway to decentralized commerce
              </p>
            </div>
            */}
            {/* Light overlay to slightly darken image if needed */}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Main Action Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Stores Card */}
            <button
              onClick={() => router.push('/stores')}
              className="aspect-square rounded-2xl p-4 text-white relative overflow-hidden group active:scale-95 transition-transform"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(/AppMedia/stores.png)'
                }}
              ></div>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 h-full flex flex-col justify-end text-left">
                <div>
                  <h3 className="text-lg font-bold mb-1">Marketplaces</h3>
                  <p className="text-white/90 text-xs">Browse sellers</p>
                </div>
              </div>
            </button>

            {/* Trade Card */}
            <button
              onClick={() => router.push('/?view=categories')}
              className="aspect-square rounded-2xl p-4 text-white relative overflow-hidden group active:scale-95 transition-transform"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(/AppMedia/categories.jpg)'
                }}
              ></div>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 h-full flex flex-col justify-end text-left">
                <div>
                  <h3 className="text-lg font-bold mb-1">Trade</h3>
                  <p className="text-white/90 text-xs">Browse products</p>
                </div>
              </div>
            </button>

            {/* Sell Card */}
            <button
              onClick={() => router.push('/sell')}
              className="aspect-square rounded-2xl p-4 text-white relative overflow-hidden group active:scale-95 transition-transform"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(/AppMedia/sell.png)'
                }}
              ></div>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 h-full flex flex-col justify-end text-left">
                <div>
                  <h3 className="text-lg font-bold mb-1">Sell</h3>
                  <p className="text-white/90 text-xs">Open marketplace</p>
                </div>
              </div>
            </button>

            {/* Earn Card */}
            <button
              onClick={() => router.push('/earn')}
              className="aspect-square rounded-2xl p-4 text-white relative overflow-hidden group active:scale-95 transition-transform"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(/AppMedia/earn.png)'
                }}
              ></div>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 h-full flex flex-col justify-end text-left">
                <div>
                  <h3 className="text-lg font-bold mb-1">Earn</h3>
                  <p className="text-white/90 text-xs">Share & earn commission</p>
                </div>
              </div>
            </button>
          </div>

          {/* Featured Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Featured</h2>
              <button
                onClick={() => router.push('/stores')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all
              </button>
            </div>

            {/* NFT Energy Featured Card */}
            <button
              onClick={() => router.push('/store/nft-energy')}
              className="w-full bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 rounded-2xl p-4 text-left relative overflow-hidden group active:scale-[0.98] transition-transform"
            >
              <div className="relative z-10 text-white">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white p-1">
                    <Image
                      src="/stores/NFTEnergyDrinks/NFTEnergyDrinksLogo.png"
                      alt="NFT Energy Drinks Logo"
                      width={48}
                      height={48}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-cyan-100">NFT Energy Drinks</h3>
                    <p className="text-cyan-300 text-xs">Official Store</p>
                  </div>
                </div>
                <p className="text-cyan-200 text-sm mb-3">
                  Where Web3 meets real energy. Get official NFT Energy drinks and exclusive merchandise.
                </p>
                <div className="flex items-center space-x-4 text-xs text-cyan-300">
                  <span>• 6 Products</span>
                  <span>• Live Now</span>
                </div>
              </div>
              {/* Background effects */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/10 rounded-full blur-xl"></div>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">6</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Live Marketplaces</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">USDC</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Payments</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-lg font-bold" style={{ color: '#FFFFFF' }}>Base</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Network</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}
