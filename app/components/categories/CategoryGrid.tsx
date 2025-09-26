// app/components/categories/CategoryGrid.tsx
"use client";

import { useRouter } from 'next/navigation';
import { Icon } from '../ui/Icon';
import { cn } from '@/lib/utils';

interface CategoryGridProps {
  onCategorySelect?: (categorySlug: string) => void;
  className?: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  productCount: number;
  color: string;
  gradient: string;
}

const categories: Category[] = [
  {
    id: 'electronics',
    slug: 'electronics',
    name: 'Electronics',
    description: 'Phones, tablets, computers & accessories',
    icon: 'grid',
    productCount: 0, // Will be populated dynamically
    color: 'text-blue-800',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    id: 'home-garden',
    slug: 'home-garden', 
    name: 'Home & Garden',
    description: 'Furniture, decor, tools & outdoor items',
    icon: 'home',
    productCount: 0,
    color: 'text-green-800',
    gradient: 'from-green-400 to-green-600'
  },
  {
    id: 'pet-products',
    slug: 'pet-products',
    name: 'Pet Products', 
    description: 'Food, toys, accessories for your pets',
    icon: 'star', // Using star as placeholder - you can add a pet icon later
    productCount: 0,
    color: 'text-purple-800',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    id: 'health-beauty',
    slug: 'health-beauty',
    name: 'Health & Beauty',
    description: 'Skincare, wellness, personal care items',
    icon: 'star',
    productCount: 0,
    color: 'text-pink-800',
    gradient: 'from-pink-400 to-pink-600'
  },
  {
    id: 'sports-outdoors',
    slug: 'sports-outdoors', 
    name: 'Sports & Outdoors',
    description: 'Fitness, camping, sports equipment',
    icon: 'package',
    productCount: 0,
    color: 'text-orange-800',
    gradient: 'from-orange-400 to-orange-600'
  },
  {
    id: 'all-products',
    slug: 'all-products',
    name: 'All Products',
    description: 'Browse our complete product catalog',
    icon: 'menu',
    productCount: 0,
    color: 'text-gray-800',
    gradient: 'from-gray-400 to-gray-600'
  }
];

export function CategoryGrid({ onCategorySelect, className }: CategoryGridProps) {
  const router = useRouter();

  const handleCategoryClick = (category: Category) => {
    if (onCategorySelect) {
      // If parent component wants to handle category selection (e.g., for filtering)
      onCategorySelect(category.slug);
    } else {
      // Navigate to category page
      if (category.slug === 'all-products') {
        router.push('/'); // Go to home/shop page
      } else {
        router.push(`/category/${category.slug}`);
      }
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Shop by Category</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Find what you&#39;re looking for</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-200",
              "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              "bg-gradient-to-br text-white",
              category.gradient
            )}
          >
            <div className="relative z-10 h-full flex flex-col justify-between space-y-3">
              {/* Icon */}
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
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
                <p className="text-xs text-white/80 leading-tight">
                  {category.description}
                </p>
                {category.productCount > 0 && (
                  <p className="text-xs font-medium text-white/70 mt-1">
                    {category.productCount} items
                  </p>
                )}
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full blur-xl"></div>
          </button>
        ))}
      </div>
      
      {/* Optional: Add a "Browse All Categories" link */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            router.push('/stores');
          }}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium"
        >
          Explore Seller Stores →
        </button>
      </div>
    </div>
  );
}
