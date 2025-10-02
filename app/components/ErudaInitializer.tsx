"use client";

import { useEffect } from 'react';

export function ErudaInitializer() {
  useEffect(() => {
    // Only load eruda in development mode
    if (process.env.NODE_ENV === 'development') {
      // Dynamically import eruda to avoid bundling in production
      import('eruda').then((eruda) => {
        eruda.default.init();
        console.log('🔧 Eruda mobile console initialized');
      }).catch((error) => {
        console.warn('Failed to load eruda:', error);
      });
    }
  }, []);

  return null; // This component doesn't render anything
}