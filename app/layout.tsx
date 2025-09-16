// app/layout.tsx
"use client";

import "./onchainkit-fix.css";
import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
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
            <BottomNav />
            <ToastContainer />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
