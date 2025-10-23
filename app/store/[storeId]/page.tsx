// app/store/[storeId]/page.tsx - Dynamic store route for both static and Shopify stores
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useMiniKit } from "@coinbase/onchainkit/minikit";

// Import existing static store components
import { NFTEnergyStorefront } from '@/app/components/stores/nft-energy/NFTEnergyStorefront';
import { TechWaveElectronicsStorefront } from '@/app/components/stores/techwave-electronics/TechWaveElectronicsStorefront';
import { ApexAthleticsStorefront } from '@/app/components/stores/apex-athletics/ApexAthleticsStorefront';
import { PawsomePetsStorefront } from '@/app/components/stores/pawsome-pets/PawsomePetsStorefront';
import { RadiantBeautyStorefront } from '@/app/components/stores/radiant-beauty/RadiantBeautyStorefront';
import { GreenOasisHomeStorefront } from '@/app/components/stores/green-oasis-home/GreenOasisHomeStorefront';

// Import the new Shopify storefront component
import { ShopifyStorefront } from '@/app/components/stores/ShopifyStorefront';

interface StoreInfo {
  id: string;
  name: string;
  type: 'static' | 'shopify';
  shopifyIntegration?: {
    status: string;
    storeUrl: string;
  };
}

// Static store mapping
const STATIC_STORES: Record<string, () => JSX.Element> = {
  'nft-energy': NFTEnergyStorefront,
  'techwave-electronics': TechWaveElectronicsStorefront,
  'apex-athletics': ApexAthleticsStorefront,
  'pawsome-pets': PawsomePetsStorefront,
  'radiant-beauty': RadiantBeautyStorefront,
  'green-oasis-home': GreenOasisHomeStorefront,
};

export default function DynamicStorePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { setFrameReady, isFrameReady } = useMiniKit();

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);

        // First check if it's a static store
        if (STATIC_STORES[storeId]) {
          setStoreInfo({
            id: storeId,
            name: storeId,
            type: 'static'
          });
          setLoading(false);
          return;
        }

        // Check if it's a connected Shopify store
        const response = await fetch(`/api/admin/stores/${storeId}/shopify/status`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.status.status === 'connected') {
            // It's a connected Shopify store
            setStoreInfo({
              id: storeId,
              name: storeId,
              type: 'shopify',
              shopifyIntegration: {
                status: data.status.status,
                storeUrl: data.credentials?.storeUrl || ''
              }
            });
          } else {
            setError('Store not found or not connected');
          }
        } else {
          setError('Store not found');
        }
      } catch (err) {
        console.error('Error fetching store info:', err);
        setError('Failed to load store information');
      } finally {
        setLoading(false);
      }
    };

    if (storeId) {
      fetchStoreInfo();
    }
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !storeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Store Not Found</h2>
          <p className="text-gray-600">{error || 'The requested store could not be found.'}</p>
        </div>
      </div>
    );
  }

  // Render static store component
  if (storeInfo.type === 'static') {
    const StorefrontComponent = STATIC_STORES[storeId];
    return <StorefrontComponent />;
  }

  // Render Shopify store component
  if (storeInfo.type === 'shopify') {
    return <ShopifyStorefront storeId={storeId} />;
  }

  return null;
}