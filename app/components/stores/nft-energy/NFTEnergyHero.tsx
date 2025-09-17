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

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
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
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-cyan-100 leading-tight">
              NFT <span className="bg-gradient-to-r from-cyan-400 via-blue-300 to-cyan-200 bg-clip-text text-transparent">ENERGY</span>
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100/80 max-w-3xl mx-auto leading-relaxed">
              Where Web3 meets real energy. Bridging the digital and physical worlds, one can at a time.
            </p>
            <p className="text-lg text-cyan-100/60 max-w-2xl mx-auto">
              From cutting-edge NFT collections to premium energy drinks, we&#39;re building a community-driven brand that champions creativity, collaboration, and innovation.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-xl shadow-cyan-500/25"
              icon={<Icon name="shopping-cart" size="sm" />}
            >
              Shop Energy Drinks
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-cyan-300/50 text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-300/80 backdrop-blur-sm"
              icon={<Icon name="star" size="sm" />}
            >
              View Roadmap
            </Button>
          </div>

          {/* Key Stats/Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-cyan-200/20 p-6 hover:border-cyan-300/40 transition-all">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg mx-auto flex items-center justify-center">
                  <Icon name="package" size="md" className="text-white" />
                </div>
                <h3 className="text-cyan-100 font-semibold">Real Product</h3>
                <p className="text-cyan-100/60 text-sm leading-relaxed">Physical energy drinks on shelves today</p>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-cyan-200/20 p-6 hover:border-cyan-300/40 transition-all">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg mx-auto flex items-center justify-center">
                  <Icon name="grid" size="md" className="text-white" />
                </div>
                <h3 className="text-cyan-100 font-semibold">Web3 Native</h3>
                <p className="text-cyan-100/60 text-sm leading-relaxed">NFT collection coming Winter 2025</p>
              </div>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-cyan-200/20 p-6 hover:border-cyan-300/40 transition-all">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-lg mx-auto flex items-center justify-center">
                  <Icon name="home" size="md" className="text-white" />
                </div>
                <h3 className="text-cyan-100 font-semibold">Community First</h3>
                <p className="text-cyan-100/60 text-sm leading-relaxed">Built by and for the Web3 community</p>
              </div>
            </div>
          </div>

          {/* Social Proof / Trust Indicators */}
          <div className="pt-8 border-t border-cyan-200/10">
            <p className="text-cyan-100/50 text-sm mb-4">Trusted by Web3 communities</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="text-cyan-200/60 text-xs font-medium">BASE CHAIN</div>
              <div className="w-1 h-1 bg-cyan-300/40 rounded-full"></div>
              <div className="text-cyan-200/60 text-xs font-medium">USDC PAYMENTS</div>
              <div className="w-1 h-1 bg-cyan-300/40 rounded-full"></div>
              <div className="text-cyan-200/60 text-xs font-medium">WEB3 NATIVE</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
