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
    const baseUrl = window.location.origin;
    const productUrl = `${baseUrl}/product/${productId}`;

    if (userFid) {
      return `${productUrl}?ref=${userFid}`;
    }

    // Fallback to a generic product URL if no FID available
    return productUrl;
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);

      // Try to get user's FID from Farcaster Mini App SDK
      let userFid: string | undefined;

      try {
        // Get the current user's FID from the Farcaster SDK context
        userFid = sdk.context.user?.fid?.toString();
        console.log('Retrieved user FID:', userFid);
      } catch {
        console.log('Could not get user FID from SDK, using fallback');
      }

      const referralUrl = generateReferralUrl(product.id, userFid);

      // Create the cast text
      const castText = `Check out this amazing product: ${product.title}\n\nPrice: $${product.price}\n\n${referralUrl}`;


      // Use MiniKit's composeCast function
      await composeCast({
        text: castText,
        embeds: [referralUrl]
      });

      // If we reach here, the compose was successful
      toast.success('Shared Successfully!', 'Your product link has been shared to Farcaster');

    } catch (error) {
      console.error('Share error:', error);

      // Fallback: Create manual Farcaster compose URL
      const fallbackUrl = createFarcasterComposeUrl(product);

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

  const createFarcasterComposeUrl = (product: Product): string | null => {
    try {
      // Try to get user's FID, fallback to generic link if not available
      let userFid: string | undefined;
      try {
        userFid = sdk.context.user?.fid?.toString();
      } catch {
        console.log('Could not get user FID for fallback URL');
      }
      const referralUrl = generateReferralUrl(product.id, userFid);

      const castText = `Check out this amazing product: ${product.title}\n\nPrice: $${product.price}\n\nGet it here: ${referralUrl}`;

      // Create Farcaster compose URL
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