// app/store/apex-athletics/page.tsx
"use client";

import { useEffect } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { ApexAthleticsStorefront } from '@/app/components/stores/apex-athletics/ApexAthleticsStorefront';

export default function ApexAthleticsStorePage() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return <ApexAthleticsStorefront />;
}