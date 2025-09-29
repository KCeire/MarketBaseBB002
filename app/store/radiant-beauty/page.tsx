// app/store/radiant-beauty/page.tsx
"use client";

import { useEffect } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { RadiantBeautyStorefront } from '@/app/components/stores/radiant-beauty/RadiantBeautyStorefront';

export default function RadiantBeautyStorePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return <RadiantBeautyStorefront />;
}