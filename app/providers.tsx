"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { SWRConfig } from 'swr';

export function Providers(props: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 60000, // 1 minute
        focusThrottleInterval: 5000, // 5 seconds
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        onError: (error) => {
          // Only log errors in development
          if (process.env.NODE_ENV === 'development') {
            console.error('SWR Error:', error);
          }
        },
      }}
    >
      <MiniKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            mode: "auto",
            theme: "mini-app-theme",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            logo: process.env.NEXT_PUBLIC_ICON_URL,
          },
        }}
      >
        {props.children}
      </MiniKitProvider>
    </SWRConfig>
  );
}
