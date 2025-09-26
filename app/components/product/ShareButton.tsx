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

  const generateReferralUrl = (productId: string | number, userFid?: string): string => {
    // CRITICAL: Use the production URL for embeds to work
    const baseUrl = 'https://store.lkforge.xyz';
    
    // Use query params to maintain app recognition
    const params = new URLSearchParams();
    params.set('p', productId.toString());
    
    if (userFid) {
      params.set('ref', userFid);
    }
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);

      let userFid: string | undefined;

      try {
        const context = await sdk.context;
        userFid = context.user?.fid?.toString();
        console.log('Retrieved user FID:', userFid);
      } catch {
        console.log('Could not get user FID from SDK, using fallback');
      }

      const referralUrl = generateReferralUrl(product.id, userFid);

      // Improved cast text
      const castText = `🛍️ ${product.title}\n💰 $${product.price}\n\nGet yours on Base Shop!`;

      await composeCast({
        text: castText,
        embeds: [referralUrl]
      });

      toast.success('Shared Successfully!', 'Your product link has been shared to Farcaster');

      // Track the share
      try {
        await fetch('/api/affiliate/track-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            userFid,
            referralUrl
          })
        });
      } catch (error) {
        console.error('Failed to track share:', error);
      }

    } catch (error) {
      console.error('Share error:', error);

      const fallbackUrl = await createFarcasterComposeUrl(product);

      if (fallbackUrl) {
        window.open(fallbackUrl, '_blank');
        toast.info('Opening Farcaster', 'Complete your cast in the new tab');
      } else {
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
      
      const referralUrl = generateReferralUrl(product.id, userFid);
      const castText = `🛍️ ${product.title}\n💰 $${product.price}\n\nGet yours on Base Shop!`;
      const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(referralUrl)}`;

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
