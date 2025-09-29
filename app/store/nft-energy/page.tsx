// app/store/nft-energy/page.tsx
"use client";

import { useEffect } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { NFTEnergyStorefront } from '@/app/components/stores/nft-energy/NFTEnergyStorefront';

export default function NFTEnergyStorePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return <NFTEnergyStorefront />;
}