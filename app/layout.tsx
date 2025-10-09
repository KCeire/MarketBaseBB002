// app/layout.tsx
import "./onchainkit-fix.css";
import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Providers } from "./providers";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { BottomNav } from "./components/navigation/BottomNav";
import { FloatingCartButton } from "./components/cart/FloatingCartButton";
import { ToastContainer } from "./components/ui/Toast";
import { FarcasterSDKInitializer } from "./components/FarcasterSDK";
import { ErudaInitializer } from "./components/ErudaInitializer";
import { MobileConsole } from "./components/MobileConsole";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL || "https://marketbase.lkforge.xyz";

  // Frame configuration optimized for both platforms
  const frameConfig = {
    version: "1",
    imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/hero-image.png`,
    button: {
      title: "Shop MarketBase 🛍️",
      action: {
        type: "launch_miniapp",
        name: "MarketBase",
        url: URL,
        splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/splash.png`,
        splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
      },
    },
  };

  // TBA-compatible frame config (using "next" version for backward compatibility)
  const tbaFrameConfig = {
    version: "next",
    imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/hero-image.png`,
    button: {
      title: "Shop MarketBase 🛍️",
      action: {
        type: "launch_miniapp",
        name: "MarketBase",
        url: URL,
        splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/splash.png`,
        splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
      },
    },
  };

  return {
    title: "MarketBase - Web3 Commerce Platform",
    description: "Trade the latest products on Base blockchain. Multiple marketplaces, secure payments, and Web3 integration.",
    icons: {
      icon: '/icon.png',
      shortcut: '/icon.png',
      apple: '/icon.png',
      other: {
        rel: 'icon',
        url: '/icon.png',
      },
    },
    openGraph: {
      title: "MarketBase - Web3 Commerce Platform",
      description: "Trade the latest products on Base blockchain. Multiple marketplaces, secure payments, and Web3 integration.",
      images: process.env.NEXT_PUBLIC_APP_HERO_IMAGE ? [process.env.NEXT_PUBLIC_APP_HERO_IMAGE] : [`${URL}/hero-image.png`],
    },
    other: {
      // Farcaster Mini App meta tag (version "1")
      "fc:miniapp": JSON.stringify(frameConfig),
      // Backward compatibility for both platforms
      "fc:frame": JSON.stringify(tbaFrameConfig),
    },
  };
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className="bg-background dark:bg-gray-900 transition-colors duration-200">
        <ThemeProvider>
          <Providers>
            <div className="main-content-with-bottom-nav">
              {children}
            </div>
            <FloatingCartButton />
            <Suspense fallback={<div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"></div>}>
              <BottomNav />
            </Suspense>
            <ToastContainer />
            <FarcasterSDKInitializer />
            <ErudaInitializer />
            <MobileConsole />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
