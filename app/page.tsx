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
import { useSearchParams } from "next/navigation";
import { Shop } from "./components/Shop";

function AppContent() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const searchParams = useSearchParams();
  const showCart = searchParams.get('view') === 'cart';

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleBackToShop = useCallback(() => {
    // Navigate back to home without cart view
    window.history.replaceState({}, '', '/');
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
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
          </div>
        </header>
        
        <main className="flex-1">
          <Shop 
            setActiveTab={() => {}} 
            showCart={showCart}
            onBackToShop={handleBackToShop}
          />
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
