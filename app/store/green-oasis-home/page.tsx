// app/store/green-oasis-home/page.tsx
"use client";

import { useEffect } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { GreenOasisHomeStorefront } from '@/app/components/stores/green-oasis-home/GreenOasisHomeStorefront';

export default function GreenOasisHomeStorePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return <GreenOasisHomeStorefront />;
}