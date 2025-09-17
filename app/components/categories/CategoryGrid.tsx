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
}

const categories: Category[] = [
  {
    id: 'electronics',
    slug: 'electronics',
    name: 'Electronics',
    description: 'Phones, tablets, computers & accessories',
    icon: 'grid',
    productCount: 0, // Will be populated dynamically
    color: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  {
    id: 'home-garden',
    slug: 'home-garden', 
    name: 'Home & Garden',
    description: 'Furniture, decor, tools & outdoor items',
    icon: 'home',
    productCount: 0,
    color: 'bg-green-50 border-green-200 text-green-800'
  },
  {
    id: 'pet-products',
    slug: 'pet-products',
    name: 'Pet Products', 
    description: 'Food, toys, accessories for your pets',
    icon: 'star', // Using star as placeholder - you can add a pet icon later
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
    id: 'all-products',
    slug: 'all-products',
    name: 'All Products',
    description: 'Browse our complete product catalog',
    icon: 'menu',
    productCount: 0,
    color: 'bg-gray-50 border-gray-200 text-gray-800'
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">Shop by Category</h2>
        <p className="text-sm text-gray-600 mb-4">Find what you&#39;re looking for</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all duration-200",
              "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              category.color
            )}
          >
            <div className="flex flex-col items-start space-y-2">
              {/* Icon */}
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "bg-white/50 backdrop-blur-sm"
              )}>
                <Icon 
                  name={category.icon} 
                  size="sm" 
                  className="opacity-80" 
                />
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
      
      {/* Optional: Add a "Browse All Categories" link */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            router.push('/stores');
          }}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          Explore Seller Stores →
        </button>
      </div>
    </div>
  );
}
