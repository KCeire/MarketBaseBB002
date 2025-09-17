// app/components/stores/nft-energy/NFTEnergyLayout.tsx
"use client";

import { ReactNode } from 'react';
import { Icon } from '@/app/components/ui/Icon';
import { Button } from '@/app/components/ui/Button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface NFTEnergyLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
}

export function NFTEnergyLayout({ children, showBackButton = true }: NFTEnergyLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      {/* Header */}
      <header className="relative z-10 bg-black/40 backdrop-blur-md border-b border-cyan-200/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Store Name */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="text-cyan-100 hover:text-cyan-200 hover:bg-cyan-500/10 border-cyan-300/30"
                  icon={<Icon name="arrow-left" size="sm" />}
                >
                  Back to Main Store
                </Button>
              )}
              <div className="flex items-center space-x-3">
                {/* NFT Energy Logo */}
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5">
                  <div className="w-full h-full bg-slate-900 rounded-md flex items-center justify-center">
                    <Image 
                    src="/stores/NFTEnergyDrinks/NFTEnergyDrinksLogo.png" 
                    alt="NFT Energy Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                    NFT Energy
                  </h1>
                  <p className="text-xs text-cyan-200/70">Official Store</p>
                </div>
              </div>
            </div>

            {/* Store Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href="#products" 
                className="text-cyan-100/80 hover:text-cyan-200 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-cyan-400/50"
              >
                Products
              </a>
              <a 
                href="#about" 
                className="text-cyan-100/80 hover:text-cyan-200 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-cyan-400/50"
              >
                About
              </a>
              <a 
                href="#roadmap" 
                className="text-cyan-100/80 hover:text-cyan-200 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-cyan-400/50"
              >
                Roadmap
              </a>
              <a 
                href="#community" 
                className="text-cyan-100/80 hover:text-cyan-200 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-cyan-400/50"
              >
                Community
              </a>
              <a 
                href="#contact" 
                className="text-cyan-100/80 hover:text-cyan-200 text-sm font-medium transition-colors border-b-2 border-transparent hover:border-cyan-400/50"
              >
                Contact
              </a>
            </nav>

            {/* Social Links */}
            <div className="flex items-center space-x-3">
              <a 
                href="https://x.com/nftenergydrinks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-colors border border-cyan-400/20 hover:border-cyan-400/40"
              >
                <span className="text-cyan-300 text-xs font-bold">X</span>
              </a>
              <a 
                href="https://www.instagram.com/nftenergydrinks/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-colors border border-cyan-400/20 hover:border-cyan-400/40"
              >
                <span className="text-cyan-300 text-xs font-bold">IG</span>
              </a>
              <a 
                href="https://www.tiktok.com/@nftenergydrinks" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-colors border border-cyan-400/20 hover:border-cyan-400/40"
              >
                <span className="text-cyan-300 text-xs font-bold">TT</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-cyan-200/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-md flex items-center justify-center">
                  <Image 
                    src="/stores/NFTEnergyDrinks/NFTEnergyDrinksLogo.png" 
                    alt="NFT Energy Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    />
                </div>
              </div>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent font-bold">
                NFT Energy
              </span>
            </div>
            <p className="text-cyan-100/60 text-sm max-w-md mx-auto">
              Championing the integration of cutting-edge technology into the traditional beverage industry.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="mailto:info@nftenergydrinks.com" className="text-cyan-100/60 hover:text-cyan-200 text-sm transition-colors">
                Contact
              </a>
              <a href="#about" className="text-cyan-100/60 hover:text-cyan-200 text-sm transition-colors">
                About
              </a>
              <a href="#roadmap" className="text-cyan-100/60 hover:text-cyan-200 text-sm transition-colors">
                Roadmap
              </a>
            </div>
            <p className="text-cyan-100/40 text-xs">
              © 2025 NFT Energy. Built on Base Shop.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
