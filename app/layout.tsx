// app/layout.tsx
"use client";

import "./onchainkit-fix.css";
import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";
import { BottomNav } from "./components/navigation/BottomNav";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();

  // Load cart count from localStorage
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          const count = cart.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0);
          setCartItemCount(count);
        }
      } catch (error) {
        console.error('Error loading cart count:', error);
      }
    };

    loadCartCount();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleCartClick = useCallback(() => {
    // Navigate to home with cart view
    router.push('/?view=cart');
  }, [router]);

  return (
    <html lang="en">
      <body className="bg-background">
        <Providers>
          <div className="main-content-with-bottom-nav">
            {children}
          </div>
          <BottomNav 
            cartItemCount={cartItemCount}
            onCartClick={handleCartClick}
          />
        </Providers>
      </body>
    </html>
  );
}
