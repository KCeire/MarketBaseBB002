// app/categories/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '../components/ui/Icon';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  productCount: number;
  color: string;
  isPopular?: boolean;
  comingSoon?: boolean;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Category[] = [
    {
      id: 'electronics',
      slug: 'electronics',
      name: 'Electronics',
      description: 'Phones, tablets, computers & tech accessories',
      icon: 'grid',
      productCount: 0,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      isPopular: true
    },
    {
      id: 'home-garden',
      slug: 'home-garden',
      name: 'Home & Garden',
      description: 'Furniture, decor, tools & outdoor items',
      icon: 'home',
      productCount: 0,
      color: 'bg-green-50 border-green-200 text-green-800',
      isPopular: true
    },
    {
      id: 'pet-products',
      slug: 'pet-products',
      name: 'Pet Products',
      description: 'Food, toys, accessories for your pets',
      icon: 'star',
      productCount: 0,
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      id: 'health-beauty',
      slug: 'health-beauty',
      name: 'Health & Beauty',
      description: 'Skincare, wellness, personal care items',
      icon: 'star',
      productCount: 0,
      color: 'bg-pink-50 border-pink-200 text-pink-800'
    },
    {
      id: 'sports-outdoors',
      slug: 'sports-outdoors',
      name: 'Sports & Outdoors',
      description: 'Fitness, camping, sports equipment',
      icon: 'package',
      productCount: 0,
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    {
      id: 'fashion',
      slug: 'fashion',
      name: 'Fashion & Apparel',
      description: 'Clothing, shoes, accessories & jewelry',
      icon: 'star',
      productCount: 0,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      comingSoon: true
    },
    {
      id: 'books-media',
      slug: 'books-media',
      name: 'Books & Media',
      description: 'Books, music, movies & digital content',
      icon: 'package',
      productCount: 0,
      color: 'bg-teal-50 border-teal-200 text-teal-800',
      comingSoon: true
    },
    {
      id: 'automotive',
      slug: 'automotive',
      name: 'Automotive',
      description: 'Car parts, tools & automotive accessories',
      icon: 'grid',
      productCount: 0,
      color: 'bg-red-50 border-red-200 text-red-800',
      comingSoon: true
    },
    {
      id: 'toys-games',
      slug: 'toys-games',
      name: 'Toys & Games',
      description: 'Kids toys, board games & entertainment',
      icon: 'star',
      productCount: 0,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      comingSoon: true
    },
    {
      id: 'all-products',
      slug: 'all-products',
      name: 'All Products',
      description: 'Browse our complete product catalog',
      icon: 'menu',
      productCount: 0,
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularCategories = filteredCategories.filter(cat => cat.isPopular);
  const otherCategories = filteredCategories.filter(cat => !cat.isPopular);

  const handleCategoryClick = (category: Category) => {
    if (category.comingSoon) {
      alert(`${category.name} category coming soon! We're working on adding more products.`);
      return;
    }

    if (category.slug === 'all-products') {
      router.push('/');
    } else {
      router.push(`/category/${category.slug}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Find exactly what you&#39;re looking for</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [color-scheme:light]"
          />
        </div>

        {/* Popular Categories */}
        {popularCategories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Popular Categories</h2>
            <div className="grid grid-cols-1 gap-3">
              {popularCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all duration-200",
                    "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    category.color,
                    category.comingSoon && "opacity-70 cursor-default"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      "bg-white/60 backdrop-blur-sm"
                    )}>
                      <Icon name={category.icon} size="md" className="opacity-80" />
                    </div>
                    
                    {/* Category Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-base leading-tight">
                          {category.name}
                        </h3>
                        {category.isPopular && !category.comingSoon && (
                          <span className="text-xs px-2 py-0.5 bg-white/50 rounded-full font-medium">
                            Popular
                          </span>
                        )}
                        {category.comingSoon && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm opacity-80 leading-tight">
                        {category.description}
                      </p>
                      {category.productCount > 0 && (
                        <p className="text-xs font-medium opacity-70 mt-1">
                          {category.productCount} products
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Categories */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {popularCategories.length > 0 ? 'All Categories' : 'Browse Categories'}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {otherCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all duration-200",
                  "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  category.color,
                  category.comingSoon && "opacity-70 cursor-default"
                )}
              >
                <div className="flex flex-col space-y-3">
                  {/* Icon and Badge */}
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      "bg-white/50 backdrop-blur-sm"
                    )}>
                      <Icon name={category.icon} size="sm" className="opacity-80" />
                    </div>
                    {category.comingSoon && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-medium">
                        Soon
                      </span>
                    )}
                  </div>
                  
                  {/* Category Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs opacity-75 leading-tight">
                      {category.description}
                    </p>
                    {category.productCount > 0 && (
                      <p className="text-xs font-medium opacity-60">
                        {category.productCount} items
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* No Results */}
        {searchQuery && filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-sm text-gray-600 mb-4">
              Try searching with different keywords
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Footer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">More Categories Coming Soon</p>
              <p className="text-xs text-blue-700 mt-1">
                We&#39;re continuously expanding our product categories. Check back regularly for new additions!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
