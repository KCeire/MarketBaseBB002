// app/layout.tsx
"use client";

import "./onchainkit-fix.css";
import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { Suspense } from "react";
import { Providers } from "./providers";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { BottomNav } from "./components/navigation/BottomNav";
import { FloatingCartButton } from "./components/cart/FloatingCartButton";
import { ToastContainer } from "./components/ui/Toast";


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
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
