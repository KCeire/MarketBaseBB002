// app/components/stores/nft-energy/NFTEnergyStorefront.tsx - UPDATED WITH REAL PRICING AND SKUS
"use client";

import { useState } from 'react';
import { NFTEnergyLayout } from './NFTEnergyLayout';
import { NFTEnergyHero } from './NFTEnergyHero';
import { NFTEnergyProductGrid } from './NFTEnergyProductGrid';
import { NFTEnergyRoadmap } from './NFTEnergyRoadmap';
import { NFTEnergyCommunitySpotlight } from './NFTEnergyCommunitySpotlight';
import { NFTEnergyFAQ } from './NFTEnergyFAQ';
import Image from 'next/image';

// Updated NFT Energy specific product data with real pricing and SKUs
const nftEnergyProducts = [
  {
    id: 'nft-energy-12pack',
    name: 'NFT Energy Drinks - 12 Pack',
    description: 'Experience the fusion of Web3 and real energy. Our signature energy drink that fuels your digital adventures and real-world hustle.',
    basePrice: 26.99,
    baseSku: 'NFT-ENERGY-12PK',
    category: 'drinks',
    image: '/stores/NFTEnergyDrinks/NFTEnergyDrink12Pack.jpeg',
    variants: [
      { id: 'original', name: 'Original Flavor', available: true }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-tshirt',
    name: 'NFT Energy Tee',
    description: 'Rep the brand with our premium cotton tee featuring the iconic NFT Energy logo.',
    basePrice: 19.99,
    baseSku: '685381941D63E',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/mens-premium-heavyweight-tee-black-front-6853818ca2de9-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'white', name: 'White', available: true }
    ],
    sizes: [
      { size: 'S', price: 19.99 },
      { size: 'M', price: 19.99 },
      { size: 'L', price: 19.99 },
      { size: 'XL', price: 19.99 },
      { size: '2XL', price: 19.99 },
      { size: '3XL', price: 28.50 },
      { size: '4XL', price: 30.50 }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-hoodie',
    name: 'NFT Energy Hoodie',
    description: 'Stay warm while repping Web3 culture. Premium fleece hoodie with embroidered NFT Energy branding.',
    basePrice: 30.00,
    baseSku: '6853806B94625',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/unisex-heavy-blend-hoodie-black-front-6853806252ae9-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'white', name: 'White', available: true }
    ],
    sizes: [
      { size: 'S', price: 30.00 },
      { size: 'M', price: 30.00 },
      { size: 'L', price: 30.00 },
      { size: 'XL', price: 30.00 },
      { size: '2XL', price: 33.00 },
      { size: '3XL', price: 35.50 },
      { size: '4XL', price: 38.50 },
      { size: '5XL', price: 41.00 }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-sweatshirt',
    name: 'NFT Energy Sweatshirt',
    description: 'Classic crew neck sweatshirt perfect for any Web3 enthusiast. Comfortable fit with bold NFT Energy graphics.',
    basePrice: 29.50,
    baseSku: '685375E48090B',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/unisex-premium-sweatshirt-black-front-685375da34fb3-300x300.jpg',
    variants: [
      { id: 'black', name: 'Black', available: true },
      { id: 'white', name: 'White', available: true }
    ],
    sizes: [
      { size: 'S', price: 29.50 },
      { size: 'M', price: 29.50 },
      { size: 'L', price: 29.50 },
      { size: 'XL', price: 29.50 },
      { size: '2XL', price: 30.50 },
      { size: '3XL', price: 33.50 }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-trucker-hat',
    name: 'NFT Energy Trucker Hat',
    description: 'Complete your look with our signature trucker hat. Embroidered logo, premium materials.',
    basePrice: 20.00,
    baseSku: '68537385433E6',
    category: 'accessories',
    image: '/stores/NFTEnergyDrinks/foam-trucker-hat-black-white-black-one-size-front-68537328b6d4d-300x300.jpg',
    variants: [
      { id: 'default', name: 'Standard', available: true }
    ],
    sizes: [
      { size: 'One Size', price: 20.00 }
    ],
    inStock: true
  },
  {
    id: 'nft-energy-iphone-case',
    name: 'NFT Energy iPhone Case',
    description: 'Protect your device in style. Compatible with iPhone 12-15, featuring durable protection and NFT Energy branding.',
    basePrice: 14.50,
    baseSku: '68537282C6DB2',
    category: 'accessories',
    image: '/stores/NFTEnergyDrinks/clear-case-for-iphone-iphone-15-pro-max-case-on-phone-6853727c8a9d4-300x300.jpg',
    variants: [
      { id: 'clear', name: 'Clear', available: true },
      { id: 'black', name: 'Black', available: true }
    ],
    sizes: [
      { size: 'iPhone 12', price: 14.50 },
      { size: 'iPhone 12 Pro', price: 14.50 },
      { size: 'iPhone 12 Pro Max', price: 14.50 },
      { size: 'iPhone 13', price: 14.50 },
      { size: 'iPhone 13 mini', price: 14.50 },
      { size: 'iPhone 13 Pro', price: 14.50 },
      { size: 'iPhone 13 Pro Max', price: 14.50 },
      { size: 'iPhone 14', price: 14.50 },
      { size: 'iPhone 14 Plus', price: 14.50 },
      { size: 'iPhone 14 Pro', price: 14.50 },
      { size: 'iPhone 14 Pro Max', price: 14.50 },
      { size: 'iPhone 15', price: 14.50 },
      { size: 'iPhone 15 Plus', price: 14.50 },
      { size: 'iPhone 15 Pro', price: 14.50 },
      { size: 'iPhone 15 Pro Max', price: 14.50 }
    ],
    useDropdown: true,
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
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'all' 
                  ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg" 
                  : "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              }`}
            >
              All Products ({nftEnergyProducts.length})
            </button>
            <button
              onClick={() => setSelectedCategory('drinks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'drinks' 
                  ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg" 
                  : "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              }`}
            >
              Energy Drinks
            </button>
            <button
              onClick={() => setSelectedCategory('apparel')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'apparel' 
                  ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg" 
                  : "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              }`}
            >
              Apparel
            </button>
            <button
              onClick={() => setSelectedCategory('accessories')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'accessories' 
                  ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg" 
                  : "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              }`}
            >
              Accessories
            </button>
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
