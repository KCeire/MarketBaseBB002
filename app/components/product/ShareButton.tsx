// app/components/product/ShareButton.tsx
"use client";

import { useState } from 'react';
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import sdk from '@farcaster/miniapp-sdk';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { toast } from '../ui/Toast';

interface Product {
  id: number | string;
  title: string;
  price: string;
  image: string;
  description?: string;
  sku?: string;
}

interface ShareButtonProps {
  product: Product;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export function ShareButton({
  product,
  variant = 'ghost',
  size = 'sm',
  className = '',
  showText = true
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { composeCast } = useComposeCast();

  const generateFrameUrl = (product: Product, userFid?: string): string => {
    // CRITICAL: Use frame URL to get mini app embed
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://store.lkforge.xyz';

    // Create frame URL path - use SKU if available, otherwise use product ID
    let frameUrl: string;
    if (product.sku) {
      frameUrl = `${baseUrl}/frame/sku/${product.sku}`;
    } else {
      frameUrl = `${baseUrl}/frame/${product.id}`;
    }

    if (userFid) {
      frameUrl += `?ref=${userFid}`;
    }

    return frameUrl;
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);

      let userFid: string | undefined;

      try {
        const context = await sdk.context;
        userFid = context.user?.fid?.toString();
        console.log('🔍 Retrieved user FID:', userFid);
      } catch {
        console.log('⚠️ Could not get user FID from SDK, using fallback');
      }

      // Use frame URL instead of web URL
      const frameUrl = generateFrameUrl(product, userFid);
      console.log('📱 Generated frame URL:', frameUrl);

      // Improved cast text
      const castText = `🛍️ ${product.title}\n💰 ${product.price}\n\nGet yours on Base Shop!`;
      console.log('📝 Cast text:', castText);

      await composeCast({
        text: castText,
        embeds: [frameUrl] // Frame URL for mini app embed
      });

      console.log('✅ Cast composed successfully');
      toast.success('Shared Successfully!', 'Your product link has been shared to Farcaster');

      // Track the share
      try {
        await fetch('/api/affiliate/track-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.sku || product.id, // Use SKU if available, otherwise product ID
            referrerId: userFid, // Changed from userFid to referrerId
            frameUrl
          })
        });
        console.log('📊 Share tracked successfully');
      } catch (error) {
        console.error('❌ Failed to track share:', error);
      }

    } catch (error) {
      console.error('💥 Share error:', error);

      const fallbackUrl = await createFarcasterComposeUrl(product);

      if (fallbackUrl) {
        console.log('🔄 Using fallback URL:', fallbackUrl);
        window.open(fallbackUrl, '_blank');
        toast.info('Opening Farcaster', 'Complete your cast in the new tab');
      } else {
        console.log('🚫 Fallback URL creation failed');
        toast.error('Share Failed', 'Unable to share product. Please try again.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const createFarcasterComposeUrl = async (product: Product): Promise<string | null> => {
    try {
      let userFid: string | undefined;
      try {
        const context = await sdk.context;
        userFid = context.user?.fid?.toString();
      } catch {
        console.log('Could not get user FID for fallback URL');
      }
      
      // Use frame URL for fallback too
      const frameUrl = generateFrameUrl(product, userFid);
      const castText = `🛍️ ${product.title}\n💰 $${product.price}\n\nGet yours on Base Shop!`;
      const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(frameUrl)}`;

      return composeUrl;
    } catch (error) {
      console.error('Error creating Farcaster compose URL:', error);
      return null;
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={isSharing}
      loading={isSharing}
      className={className}
      icon={<Icon name="share" size="sm" />}
    >
      {showText && (isSharing ? 'Sharing...' : 'Share & Earn')}
    </Button>
  );
}
