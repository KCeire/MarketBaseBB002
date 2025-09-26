// lib/stores/nft-energy.ts - NFT Energy Store Adapter

import { registerStore, StoreProduct } from './index';

// Convert NFT Energy products to standardized format
const nftEnergyProducts: StoreProduct[] = [
  {
    id: 'nft-energy-12pack',
    title: 'NFT Energy Drinks - 12 Pack',
    description: 'Experience the fusion of Web3 and real energy. Our signature energy drink that fuels your digital adventures and real-world hustle.',
    price: '26.99',
    compareAtPrice: null,
    image: '/stores/NFTEnergyDrinks/NFTEnergyDrink12Pack.jpeg',
    images: ['/stores/NFTEnergyDrinks/NFTEnergyDrink12Pack.jpeg'],
    vendor: 'NFT Energy Drinks',
    productType: 'Food & Beverage',
    handle: 'nft-energy-12pack',
    tags: ['energy drinks', 'web3', 'beverages', 'drinks', 'energy'],
    storeInfo: {
      name: 'NFT Energy Drinks',
      slug: 'nft-energy',
      url: '/store/nft-energy'
    },
    variants: [
      {
        id: 'nft-energy-12pack-original',
        title: 'Original Flavor',
        price: '26.99',
        compareAtPrice: null,
        available: true,
        inventory: 50,
        sku: 'NFT-ENERGY-12PK'
      }
    ]
  },
  {
    id: 'nft-energy-tshirt',
    title: 'NFT Energy Tee',
    description: 'Rep the brand with our premium cotton tee featuring the iconic NFT Energy logo.',
    price: '19.99',
    compareAtPrice: null,
    image: '/stores/NFTEnergyDrinks/mens-premium-heavyweight-tee-black-front-6853818ca2de9-300x300.jpg',
    images: ['/stores/NFTEnergyDrinks/mens-premium-heavyweight-tee-black-front-6853818ca2de9-300x300.jpg'],
    vendor: 'NFT Energy Drinks',
    productType: 'Apparel',
    handle: 'nft-energy-tshirt',
    tags: ['apparel', 'clothing', 'shirt', 'tee', 'web3'],
    storeInfo: {
      name: 'NFT Energy Drinks',
      slug: 'nft-energy',
      url: '/store/nft-energy'
    },
    variants: [
      { id: 'tshirt-s-black', title: 'Small - Black', price: '19.99', available: true, inventory: 25, sku: '685381941D63E-S-BLK' },
      { id: 'tshirt-m-black', title: 'Medium - Black', price: '19.99', available: true, inventory: 30, sku: '685381941D63E-M-BLK' },
      { id: 'tshirt-l-black', title: 'Large - Black', price: '19.99', available: true, inventory: 25, sku: '685381941D63E-L-BLK' },
      { id: 'tshirt-xl-black', title: 'XL - Black', price: '19.99', available: true, inventory: 20, sku: '685381941D63E-XL-BLK' },
      { id: 'tshirt-2xl-black', title: '2XL - Black', price: '19.99', available: true, inventory: 15, sku: '685381941D63E-2XL-BLK' },
      { id: 'tshirt-3xl-black', title: '3XL - Black', price: '28.50', available: true, inventory: 10, sku: '685381941D63E-3XL-BLK' },
      { id: 'tshirt-4xl-black', title: '4XL - Black', price: '30.50', available: true, inventory: 5, sku: '685381941D63E-4XL-BLK' }
    ]
  },
  {
    id: 'nft-energy-hoodie',
    title: 'NFT Energy Hoodie',
    description: 'Stay warm while repping Web3 culture. Premium fleece hoodie with embroidered NFT Energy branding.',
    price: '30.00',
    compareAtPrice: null,
    image: '/stores/NFTEnergyDrinks/unisex-heavy-blend-hoodie-black-front-6853806252ae9-300x300.jpg',
    images: ['/stores/NFTEnergyDrinks/unisex-heavy-blend-hoodie-black-front-6853806252ae9-300x300.jpg'],
    vendor: 'NFT Energy Drinks',
    productType: 'Apparel',
    handle: 'nft-energy-hoodie',
    tags: ['apparel', 'clothing', 'hoodie', 'sweatshirt', 'web3'],
    storeInfo: {
      name: 'NFT Energy Drinks',
      slug: 'nft-energy',
      url: '/store/nft-energy'
    },
    variants: [
      { id: 'hoodie-s-black', title: 'Small - Black', price: '30.00', available: true, inventory: 15, sku: '6853806B94625-S-BLK' },
      { id: 'hoodie-m-black', title: 'Medium - Black', price: '30.00', available: true, inventory: 20, sku: '6853806B94625-M-BLK' },
      { id: 'hoodie-l-black', title: 'Large - Black', price: '30.00', available: true, inventory: 18, sku: '6853806B94625-L-BLK' },
      { id: 'hoodie-xl-black', title: 'XL - Black', price: '30.00', available: true, inventory: 12, sku: '6853806B94625-XL-BLK' },
      { id: 'hoodie-2xl-black', title: '2XL - Black', price: '33.00', available: true, inventory: 10, sku: '6853806B94625-2XL-BLK' },
      { id: 'hoodie-3xl-black', title: '3XL - Black', price: '35.50', available: true, inventory: 8, sku: '6853806B94625-3XL-BLK' },
      { id: 'hoodie-4xl-black', title: '4XL - Black', price: '38.50', available: true, inventory: 5, sku: '6853806B94625-4XL-BLK' },
      { id: 'hoodie-5xl-black', title: '5XL - Black', price: '41.00', available: true, inventory: 3, sku: '6853806B94625-5XL-BLK' }
    ]
  },
  {
    id: 'nft-energy-sweatshirt',
    title: 'NFT Energy Sweatshirt',
    description: 'Classic crew neck sweatshirt perfect for any Web3 enthusiast. Comfortable fit with bold NFT Energy graphics.',
    price: '29.50',
    compareAtPrice: null,
    image: '/stores/NFTEnergyDrinks/unisex-premium-sweatshirt-black-front-685375da34fb3-300x300.jpg',
    images: ['/stores/NFTEnergyDrinks/unisex-premium-sweatshirt-black-front-685375da34fb3-300x300.jpg'],
    vendor: 'NFT Energy Drinks',
    productType: 'Apparel',
    handle: 'nft-energy-sweatshirt',
    tags: ['apparel', 'clothing', 'sweatshirt', 'crew neck', 'web3'],
    storeInfo: {
      name: 'NFT Energy Drinks',
      slug: 'nft-energy',
      url: '/store/nft-energy'
    },
    variants: [
      { id: 'sweatshirt-s-black', title: 'Small - Black', price: '29.50', available: true, inventory: 15, sku: '685375E48090B-S-BLK' },
      { id: 'sweatshirt-m-black', title: 'Medium - Black', price: '29.50', available: true, inventory: 20, sku: '685375E48090B-M-BLK' },
      { id: 'sweatshirt-l-black', title: 'Large - Black', price: '29.50', available: true, inventory: 18, sku: '685375E48090B-L-BLK' },
      { id: 'sweatshirt-xl-black', title: 'XL - Black', price: '29.50', available: true, inventory: 12, sku: '685375E48090B-XL-BLK' },
      { id: 'sweatshirt-2xl-black', title: '2XL - Black', price: '30.50', available: true, inventory: 10, sku: '685375E48090B-2XL-BLK' },
      { id: 'sweatshirt-3xl-black', title: '3XL - Black', price: '33.50', available: true, inventory: 8, sku: '685375E48090B-3XL-BLK' }
    ]
  },
  {
    id: 'nft-energy-trucker-hat',
    title: 'NFT Energy Trucker Hat',
    description: 'Complete your look with our signature trucker hat. Embroidered logo, premium materials.',
    price: '20.00',
    compareAtPrice: null,
    image: '/stores/NFTEnergyDrinks/foam-trucker-hat-black-white-black-one-size-front-68537328b6d4d-300x300.jpg',
    images: ['/stores/NFTEnergyDrinks/foam-trucker-hat-black-white-black-one-size-front-68537328b6d4d-300x300.jpg'],
    vendor: 'NFT Energy Drinks',
    productType: 'Accessories',
    handle: 'nft-energy-trucker-hat',
    tags: ['accessories', 'hat', 'cap', 'trucker hat', 'web3'],
    storeInfo: {
      name: 'NFT Energy Drinks',
      slug: 'nft-energy',
      url: '/store/nft-energy'
    },
    variants: [
      {
        id: 'hat-onesize',
        title: 'One Size',
        price: '20.00',
        available: true,
        inventory: 40,
        sku: '68537385433E6'
      }
    ]
  },
  {
    id: 'nft-energy-iphone-case',
    title: 'NFT Energy iPhone Case',
    description: 'Protect your device in style. Compatible with iPhone 12-15, featuring durable protection and NFT Energy branding.',
    price: '14.50',
    compareAtPrice: null,
    image: '/stores/NFTEnergyDrinks/clear-case-for-iphone-iphone-15-pro-max-case-on-phone-6853727c8a9d4-300x300.jpg',
    images: ['/stores/NFTEnergyDrinks/clear-case-for-iphone-iphone-15-pro-max-case-on-phone-6853727c8a9d4-300x300.jpg'],
    vendor: 'NFT Energy Drinks',
    productType: 'Accessories',
    handle: 'nft-energy-iphone-case',
    tags: ['accessories', 'phone case', 'iphone', 'electronics', 'protection'],
    storeInfo: {
      name: 'NFT Energy Drinks',
      slug: 'nft-energy',
      url: '/store/nft-energy'
    },
    variants: [
      { id: 'case-iphone-12', title: 'iPhone 12', price: '14.50', available: true, inventory: 15, sku: '68537282C6DB2-12' },
      { id: 'case-iphone-12-pro', title: 'iPhone 12 Pro', price: '14.50', available: true, inventory: 15, sku: '68537282C6DB2-12P' },
      { id: 'case-iphone-12-pro-max', title: 'iPhone 12 Pro Max', price: '14.50', available: true, inventory: 10, sku: '68537282C6DB2-12PM' },
      { id: 'case-iphone-13', title: 'iPhone 13', price: '14.50', available: true, inventory: 20, sku: '68537282C6DB2-13' },
      { id: 'case-iphone-13-mini', title: 'iPhone 13 mini', price: '14.50', available: true, inventory: 10, sku: '68537282C6DB2-13M' },
      { id: 'case-iphone-13-pro', title: 'iPhone 13 Pro', price: '14.50', available: true, inventory: 20, sku: '68537282C6DB2-13P' },
      { id: 'case-iphone-13-pro-max', title: 'iPhone 13 Pro Max', price: '14.50', available: true, inventory: 15, sku: '68537282C6DB2-13PM' },
      { id: 'case-iphone-14', title: 'iPhone 14', price: '14.50', available: true, inventory: 25, sku: '68537282C6DB2-14' },
      { id: 'case-iphone-14-plus', title: 'iPhone 14 Plus', price: '14.50', available: true, inventory: 20, sku: '68537282C6DB2-14P' },
      { id: 'case-iphone-14-pro', title: 'iPhone 14 Pro', price: '14.50', available: true, inventory: 25, sku: '68537282C6DB2-14PR' },
      { id: 'case-iphone-14-pro-max', title: 'iPhone 14 Pro Max', price: '14.50', available: true, inventory: 20, sku: '68537282C6DB2-14PM' },
      { id: 'case-iphone-15', title: 'iPhone 15', price: '14.50', available: true, inventory: 30, sku: '68537282C6DB2-15' },
      { id: 'case-iphone-15-plus', title: 'iPhone 15 Plus', price: '14.50', available: true, inventory: 25, sku: '68537282C6DB2-15PL' },
      { id: 'case-iphone-15-pro', title: 'iPhone 15 Pro', price: '14.50', available: true, inventory: 25, sku: '68537282C6DB2-15P' },
      { id: 'case-iphone-15-pro-max', title: 'iPhone 15 Pro Max', price: '14.50', available: true, inventory: 20, sku: '68537282C6DB2-15PM' }
    ]
  }
];

// Auto-register NFT Energy store
registerStore({
  name: 'NFT Energy Drinks',
  slug: 'nft-energy',
  url: '/store/nft-energy',
  getProducts: () => nftEnergyProducts
});