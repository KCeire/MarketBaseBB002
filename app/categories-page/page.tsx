// app/category/page.tsx or wherever you want to place this
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/app/components/ui/Icon';
import { Button } from '@/app/components/ui/Button';
// import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  store: string;
  inStock: boolean;
  featured?: boolean;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  productCount: number;
  gradient: string;
}

// Sample products data - replace with your actual data
const sampleProducts: Product[] = [
  {
    id: 'nft-energy-drink-1',
    name: 'NFT Energy Original',
    description: 'The original Web3-powered energy drink',
    price: 4.99,
    image: '/products/nft-energy-original.jpg',
    category: 'food-beverage',
    store: 'NFT Energy Drinks',
    inStock: true,
    featured: true
  },
  {
    id: 'nft-energy-drink-2',
    name: 'NFT Energy Zero',
    description: 'Zero sugar, maximum energy',
    price: 4.99,
    image: '/products/nft-energy-zero.jpg',
    category: 'food-beverage',
    store: 'NFT Energy Drinks',
    inStock: true
  },
  {
    id: 'smartphone-1',
    name: 'Premium Smartphone',
    description: 'Latest flagship with advanced features',
    price: 899.99,
    image: '/products/smartphone.jpg',
    category: 'electronics',
    store: 'TechWave Electronics',
    inStock: true,
    featured: true
  },
  {
    id: 'laptop-1',
    name: 'Gaming Laptop Pro',
    description: 'High-performance laptop for gaming and work',
    price: 1299.99,
    image: '/products/laptop.jpg',
    category: 'electronics',
    store: 'TechWave Electronics',
    inStock: true
  },
  {
    id: 'garden-chair-1',
    name: 'Outdoor Lounge Chair',
    description: 'Comfortable weather-resistant lounge chair',
    price: 199.99,
    image: '/products/garden-chair.jpg',
    category: 'home-garden',
    store: 'Green Oasis Home & Garden',
    inStock: true
  },
  {
    id: 'plant-pot-1',
    name: 'Premium Plant Pot Set',
    description: 'Set of 3 ceramic plant pots with drainage',
    price: 49.99,
    image: '/products/plant-pots.jpg',
    category: 'home-garden',
    store: 'Green Oasis Home & Garden',
    inStock: true
  },
  {
    id: 'pet-toy-1',
    name: 'Interactive Dog Toy',
    description: 'Smart toy that keeps your dog entertained',
    price: 29.99,
    image: '/products/dog-toy.jpg',
    category: 'pet-products',
    store: 'Pawsome Pet Paradise',
    inStock: true
  },
  {
    id: 'pet-food-1',
    name: 'Premium Dog Food',
    description: 'High-quality nutrition for your best friend',
    price: 79.99,
    image: '/products/dog-food.jpg',
    category: 'pet-products',
    store: 'Pawsome Pet Paradise',
    inStock: true,
    featured: true
  },
  {
    id: 'skincare-1',
    name: 'Anti-Aging Serum',
    description: 'Advanced formula for youthful skin',
    price: 89.99,
    image: '/products/serum.jpg',
    category: 'health-beauty',
    store: 'Radiant Beauty Co.',
    inStock: true
  },
  {
    id: 'workout-gear-1',
    name: 'Resistance Band Set',
    description: 'Complete workout band set with guide',
    price: 39.99,
    image: '/products/resistance-bands.jpg',
    category: 'sports-outdoors',
    store: 'Apex Athletics',
    inStock: true
  }
];

const categories: Category[] = [
  {
    id: 'all-products',
    slug: 'all-products',
    name: 'All Products',
    description: 'Browse our complete catalog',
    icon: 'menu',
    productCount: sampleProducts.length,
    gradient: 'from-gray-400 to-gray-600'
  },
  {
    id: 'electronics',
    slug: 'electronics',
    name: 'Electronics',
    description: 'Phones, tablets, computers & accessories',
    icon: 'smartphone',
    productCount: sampleProducts.filter(p => p.category === 'electronics').length,
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'home-garden',
    slug: 'home-garden', 
    name: 'Home & Garden',
    description: 'Furniture, decor, tools & outdoor items',
    icon: 'home',
    productCount: sampleProducts.filter(p => p.category === 'home-garden').length,
    gradient: 'from-green-400 to-green-600'
  },
  {
    id: 'pet-products',
    slug: 'pet-products',
    name: 'Pet Products', 
    description: 'Food, toys, accessories for your pets',
    icon: 'heart',
    productCount: sampleProducts.filter(p => p.category === 'pet-products').length,
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: 'health-beauty',
    slug: 'health-beauty',
    name: 'Health & Beauty',
    description: 'Skincare, wellness, personal care items',
    icon: 'star',
    productCount: sampleProducts.filter(p => p.category === 'health-beauty').length,
    gradient: 'from-pink-400 to-pink-600'
  },
  {
    id: 'sports-outdoors',
    slug: 'sports-outdoors', 
    name: 'Sports & Outdoors',
    description: 'Fitness, camping, sports equipment',
    icon: 'zap',
    productCount: sampleProducts.filter(p => p.category === 'sports-outdoors').length,
    gradient: 'from-orange-400 to-orange-600'
  },
  {
    id: 'food-beverage',
    slug: 'food-beverage',
    name: 'Food & Beverage',
    description: 'Energy drinks, snacks, and more',
    icon: 'coffee',
    productCount: sampleProducts.filter(p => p.category === 'food-beverage').length,
    gradient: 'from-cyan-400 to-cyan-600'
  }
];

export default function CategoryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all-products');
  const router = useRouter();

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all-products') {
      return sampleProducts;
    }
    return sampleProducts.filter(product => product.category === selectedCategory);
  }, [selectedCategory]);

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  const handleProductClick = (product: Product) => {
    // Navigate to product page
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 main-content-with-bottom-nav">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Shop by Category
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find exactly what you&#39;re looking for from our curated selection of products
          </p>
        </div>

        {/* Category Grid */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200",
                  "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "bg-gradient-to-br text-white",
                  category.gradient,
                  selectedCategory === category.id 
                    ? "ring-2 ring-white shadow-lg scale-[1.02]" 
                    : ""
                )}
              >
                <div className="relative z-10 h-full flex flex-col justify-between space-y-3">
                  {/* Icon */}
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <Icon 
                      name={category.icon} 
                      size="sm" 
                      className="text-white opacity-90" 
                    />
                  </div>
                  
                  {/* Category Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm leading-tight text-white">
                      {category.name}
                    </h3>
                    <p className="text-xs text-white/70 leading-tight">
                      {category.productCount} items
                    </p>
                  </div>
                </div>
                
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
              </button>
            ))}
          </div>
        </section>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedCategoryData?.name} 
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            {/* Filter/Sort Options */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Icon name="filter" size="sm" className="mr-1" />
                Filter
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer group"
                >
                  {/* Product Image */}
                  <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {/* Placeholder for product image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-2xl mx-auto flex items-center justify-center">
                          <Icon name="package" size="lg" className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Product Image
                        </p>
                      </div>
                    </div>
                    
                    {/* Status badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-1">
                      {product.featured && (
                        <div className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          ⭐ Featured
                        </div>
                      )}
                      {product.inStock ? (
                        <div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          In Stock
                        </div>
                      ) : (
                        <div className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Price badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-bold px-2 py-1 rounded-lg">
                        ${product.price}
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {product.store}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ${product.price}
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product);
                        }}
                        disabled={!product.inStock}
                        icon={<Icon name="shopping-cart" size="sm" />}
                      >
                        {product.inStock ? 'View' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto flex items-center justify-center mb-4">
                <Icon name="package" size="lg" className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try selecting a different category or check back later.
              </p>
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Can&#39;t find what you&#39;re looking for?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Explore our seller stores for more unique products and exclusive items.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/stores')}
              icon={<Icon name="store" size="sm" />}
            >
              Browse Stores
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}