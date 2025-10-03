"use client";

import { useEffect } from 'react';

export function ErudaInitializer() {
  useEffect(() => {
    // Load eruda in all environments for debugging
    console.log('🔧 Attempting to load eruda mobile console...');

    // Try multiple approaches to load eruda

    // Method 1: Try npm package import first
    import('eruda').then((eruda) => {
      eruda.default.init();
      console.log('✅ Eruda mobile console initialized via npm package');
    }).catch((npmError) => {
      console.warn('⚠️ Failed to load eruda via npm, trying CDN:', npmError);

      // Method 2: Fall back to CDN script injection
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.min.js';
      script.onload = () => {
        try {
          // @ts-ignore - eruda will be available on window
          if (window.eruda) {
            // @ts-ignore
            window.eruda.init();
            console.log('✅ Eruda mobile console initialized via CDN');
          } else {
            console.error('❌ Eruda loaded but not available on window');
          }
        } catch (initError) {
          console.error('❌ Failed to initialize eruda from CDN:', initError);
        }
      };
      script.onerror = (scriptError) => {
        console.error('❌ Failed to load eruda script from CDN:', scriptError);
      };
      document.head.appendChild(script);
    });
  }, []);

  return null; // This component doesn't render anything
}