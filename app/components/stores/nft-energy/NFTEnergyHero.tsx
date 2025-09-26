// app/components/stores/nft-energy/NFTEnergyHero.tsx
"use client";

import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import Image from 'next/image';

export function NFTEnergyHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-cyan-300/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-6">
        <div className="text-center space-y-6">
          {/* Main Logo */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-600 p-1">
              <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                <Image 
                    src="/stores/NFTEnergyDrinks/NFTEnergyDrinksLogo.png" 
                    alt="NFT Energy Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                    />
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-cyan-100 leading-tight">
              NFT <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-200 bg-clip-text text-transparent">ENERGY</span>
            </h1>
            <p className="text-lg text-cyan-100/80 max-w-2xl mx-auto">
              Get your hands on official NFT Energy drinks and exclusive merchandise. Every purchase supports the Web3 community.
            </p>
          </div>


        </div>
      </div>
    </section>
  );
}
