// app/components/stores/nft-energy/NFTEnergyStorefront.tsx - UPDATED WITH ALL SECTIONS
"use client";

import { useState } from 'react';
import { NFTEnergyLayout } from './NFTEnergyLayout';
import { NFTEnergyHero } from './NFTEnergyHero';
import { NFTEnergyProductGrid } from './NFTEnergyProductGrid';
import { NFTEnergyRoadmap } from './NFTEnergyRoadmap';
import { NFTEnergyCommunitySpotlight } from './NFTEnergyCommunitySpotlight';
import { NFTEnergyFAQ } from './NFTEnergyFAQ';
import { Button } from '@/app/components/ui/Button';
import Image from 'next/image';

// NFT Energy specific product data
const nftEnergyProducts = [
  // Energy Drinks
  {
    id: 'nft-energy-12pack',
    name: 'NFT Energy Drinks - 12 Pack',
    description: 'Experience the fusion of Web3 and real energy. Our signature energy drink that fuels your digital adventures and real-world hustle.',
    price: 26.99,
    sku: 'NFT-ENERGY-12PK',
    category: 'drinks',
    image: '/nft-energy/products/energy-12pack.jpg',
    variants: [
      { id: 'original', name: 'Original Flavor', available: true }
    ],
    inStock: true
  },
  // Merch Items
  {
    id: 'nft-energy-tshirt',
    name: 'NFT Energy T-Shirt',
    description: 'Rep the brand with our premium cotton tee featuring the iconic NFT Energy logo.',
    price: 24.99,
    sku: 'NFT-TEE',
    category: 'apparel',
    image: '/nft-energy/products/tshirt.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'white', name: 'White', available: true }
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    inStock: true
  },
  {
    id: 'nft-energy-hoodie',
    name: 'NFT Energy Hoodie',
    description: 'Stay warm while repping Web3 culture. Premium fleece hoodie with embroidered NFT Energy branding.',
    price: 49.99,
    sku: 'NFT-HOOD',
    category: 'apparel',
    image: '/nft-energy/products/hoodie.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'purple', name: 'Purple', available: true }
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    inStock: true
  },
  {
    id: 'nft-energy-sweatshirt',
    name: 'NFT Energy Sweatshirt',
    description: 'Classic crew neck sweatshirt perfect for any Web3 enthusiast. Comfortable fit with bold NFT Energy graphics.',
    price: 39.99,
    sku: 'NFT-SWEAT',
    category: 'apparel',
    image: '/nft-energy/products/sweatshirt.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'purple', name: 'Purple', available: true }
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    inStock: true
  },
  {
    id: 'nft-energy-cap',
    name: 'NFT Energy Baseball Cap',
    description: 'Complete your look with our signature snapback cap. Embroidered logo, premium materials.',
    price: 19.99,
    sku: 'NFT-CAP',
    category: 'accessories',
    image: '/nft-energy/products/cap.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'purple', name: 'Purple', available: true }
    ],
    sizes: ['One Size'],
    inStock: true
  },
  {
    id: 'nft-energy-iphone-case',
    name: 'NFT Energy iPhone Case',
    description: 'Protect your device in style. Compatible with iPhone 12-15, featuring durable protection and NFT Energy branding.',
    price: 14.99,
    sku: 'NFT-CASE',
    category: 'accessories',
    image: '/nft-energy/products/iphone-case.jpg',
    variants: [
      { id: 'clear', name: 'Clear', available: true },
      { id: 'black', name: 'Black', available: true }
    ],
    sizes: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15'],
    inStock: true
  }
];

export function NFTEnergyStorefront() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = selectedCategory === 'all' 
    ? nftEnergyProducts 
    : nftEnergyProducts.filter(product => product.category === selectedCategory);

  return (
    <NFTEnergyLayout>
      {/* Hero Section */}
      <NFTEnergyHero />

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Official NFT Energy Store
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Get your hands on official NFT Energy drinks and exclusive merchandise. 
              Every purchase supports the Web3 community.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={selectedCategory === 'all' 
                ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 border-0" 
                : "border-white/30 text-white hover:bg-white/10"
              }
            >
              All Products ({nftEnergyProducts.length})
            </Button>
            <Button
              variant={selectedCategory === 'drinks' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('drinks')}
              className={selectedCategory === 'drinks' 
                ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 border-0" 
                : "border-white/30 text-white hover:bg-white/10"
              }
            >
              Energy Drinks
            </Button>
            <Button
              variant={selectedCategory === 'apparel' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('apparel')}
              className={selectedCategory === 'apparel' 
                ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 border-0" 
                : "border-white/30 text-white hover:bg-white/10"
              }
            >
              Apparel
            </Button>
            <Button
              variant={selectedCategory === 'accessories' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('accessories')}
              className={selectedCategory === 'accessories' 
                ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 border-0" 
                : "border-white/30 text-white hover:bg-white/10"
              }
            >
              Accessories
            </Button>
          </div>

          {/* Products Grid */}
          <NFTEnergyProductGrid products={filteredProducts} />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">About NFT Energy</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                <p className="text-white/70 leading-relaxed">
                  NFT Energy champions the integration of cutting-edge technology into the traditional beverage industry, 
                  fostering community and promoting creativity. We aim to lead the mass retail adoption of emerging 
                  technologies like Web3, Blockchain, Crypto, and NFTs by demystifying their value, debunking misconceptions, 
                  and promoting their practical benefits through education and awareness, transforming refreshment into a digital experience.
                </p>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Our Core Values</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-fuchsia-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <span className="text-white font-semibold">Community</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-fuchsia-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <span className="text-white font-semibold">Creativity</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <span className="text-white font-semibold">Collaboration</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white text-center">Meet Our Founders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-cyan-300/30">
                    <Image 
                        src="/stores/NFTEnergyDrinks/Founder-Pics-Brandon-Hennington.png" 
                        alt="Brandon Hennington"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                    />
                    </div>
                  <h4 className="text-white font-semibold mb-1">Brandon Hennington</h4>
                  <p className="text-white/60 text-sm">Co-Founder</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-cyan-300/30">
                    <Image 
                        src="/stores/NFTEnergyDrinks/Founder-Pics-Lawrence-Appiah.png" 
                        alt="Lawrence Appiah"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                    />
                    </div>
                  <h4 className="text-white font-semibold mb-1">Lawrence Appiah</h4>
                  <p className="text-white/60 text-sm">Co-Founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <NFTEnergyRoadmap />

      {/* Community Spotlight Section */}
      <NFTEnergyCommunitySpotlight />

      {/* FAQ Section */}
      <NFTEnergyFAQ />
    </NFTEnergyLayout>
  );
}
