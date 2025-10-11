import useSWR from 'swr';
import { MarketplaceProduct } from '@/types/producthub';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Cache all products with 5 minute revalidation
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<{
    products: MarketplaceProduct[];
    totalPages: number;
    totalProducts: number;
    currentPage: number;
  }>('/api/producthub/products?limit=50', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    dedupingInterval: 30 * 1000, // 30 seconds
  });

  return {
    products: data?.products || [],
    totalPages: data?.totalPages || 0,
    totalProducts: data?.totalProducts || 0,
    currentPage: data?.currentPage || 1,
    isLoading,
    error,
    mutate, // For manual cache invalidation
  };
}

// Cache products by store with 3 minute revalidation
export function useStoreProducts(storeId: string) {
  const { data, error, isLoading } = useSWR<MarketplaceProduct[]>(
    `/api/products/by-store/${storeId}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 3 * 60 * 1000, // 3 minutes
      dedupingInterval: 30 * 1000, // 30 seconds
    }
  );

  return {
    products: data || [],
    isLoading,
    error,
  };
}

// Cache product categories with longer cache (10 minutes)
export function useProductCategories() {
  const { data, error, isLoading } = useSWR<string[]>(
    '/api/products/categories',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      dedupingInterval: 60 * 1000, // 1 minute
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
  };
}