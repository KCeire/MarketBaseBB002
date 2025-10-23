// app/components/admin/SearchParamsHandler.tsx
"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchParamsHandlerProps {
  onStoreParamFound: (storeId: string) => void;
}

export function SearchParamsHandler({ onStoreParamFound }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const storeParam = searchParams.get('store');

    if (storeParam) {
      console.log(`[Admin Page] Store parameter found: ${storeParam}, redirecting to /admin/${storeParam}`);
      onStoreParamFound(storeParam);
    }
  }, [searchParams, onStoreParamFound]);

  return null; // This component doesn't render anything
}