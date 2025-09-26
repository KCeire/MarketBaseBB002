// app/components/product/ShareButton.tsx
"use client";

import { useState } from 'react';
import { useMiniKit } from "@coinbase/onchainkit/minikit";
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
  const { shareToFarcaster } = useMiniKit();

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

      // Try to get user's FID from MiniKit
      let userFid: string | undefined;

      try {
        // This is a simplified approach - in a real implementation,
        // you'd need to get the user's FID from their authenticated session
        // For now, we'll use a placeholder or wallet address as fallback
        userFid = 'demo_user'; // This should be replaced with actual FID retrieval
      } catch (error) {
        console.log('Could not get user FID, using fallback');
      }

      const referralUrl = generateReferralUrl(product.id, userFid);

      // Create the cast text
      const castText = `Check out this amazing product: ${product.title}\n\nPrice: $${product.price}\n\n${referralUrl}`;

      // Create embed data for rich preview
      const embedData = {
        url: referralUrl,
        metadata: {
          image: product.image,
          title: product.title,
          description: `${product.description || 'Amazing product'} - Only $${product.price}`,
        }
      };

      // Use MiniKit's shareToFarcaster function
      const result = await shareToFarcaster({
        text: castText,
        embeds: [embedData.url]
      });

      if (result.success) {
        toast.success('Shared Successfully!', 'Your product link has been shared to Farcaster');
      } else {
        throw new Error(result.error || 'Failed to share');
      }

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
      // Fallback FID for demo purposes
      const userFid = 'demo_user';
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