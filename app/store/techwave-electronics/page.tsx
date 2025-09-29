// app/store/techwave-electronics/page.tsx
"use client";

import { useEffect } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { TechWaveElectronicsStorefront } from '@/app/components/stores/techwave-electronics/TechWaveElectronicsStorefront';

export default function TechWaveElectronicsStorePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return <TechWaveElectronicsStorefront />;
}