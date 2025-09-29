// app/store/pawsome-pets/page.tsx
"use client";

import { useEffect } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { PawsomePetsStorefront } from '@/app/components/stores/pawsome-pets/PawsomePetsStorefront';

export default function PawsomePetsStorePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return <PawsomePetsStorefront />;
}