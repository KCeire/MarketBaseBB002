// app/components/product/ShareButton.tsx
"use client";

import { useState, memo } from 'react';
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
  storeId?: string; // Optional store ID for store-specific products
}

function ShareButtonComponent({
  product,
  variant = 'ghost',
  size = 'sm',
  className = '',
  showText = true,
  storeId
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const { composeCast } = useComposeCast();

  const generateFrameUrl = (product: Product, userFid?: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://marketbase.lkforge.xyz';
    console.log('BASE_URL for frame generation:', baseUrl);

    // Create frame URL path based on context
    let frameUrl: string;

    if (storeId) {
      // Store-specific product (e.g., Shopify store products)
      frameUrl = `${baseUrl}/frame/store/${storeId}/${product.id}`;
    } else if (product.sku) {
      // SKU-based products (e.g., NFT Energy)
      frameUrl = `${baseUrl}/frame/sku/${product.sku}`;
    } else {
      // Static products from ProductHub
      frameUrl = `${baseUrl}/frame/${product.id}`;
    }

    // Always include ref parameter for consistency
    const refValue = userFid || 'none';
    frameUrl += `?ref=${refValue}`;

    console.log('Generated frame URL:', frameUrl);
    return frameUrl;
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      console.log('=== SHARE INITIATED ===');
      console.log('Product details:', {
        id: product.id,
        sku: product.sku,
        title: product.title,
        hasImage: !!product.image
      });

      let userFid: string | undefined;

      try {
        const context = await sdk.context;
        userFid = context.user?.fid?.toString();
        console.log('FID retrieved:', userFid);
      } catch (error) {
        console.error('Failed to get user FID from SDK:', error);
        console.log('Proceeding without FID');
      }

      // Generate frame URL
      const frameUrl = generateFrameUrl(product, userFid);
      console.log('Generated frame URL:', frameUrl);
      
      // Parse and log URL components
      try {
        const parsedUrl = new URL(frameUrl);
        console.log('URL breakdown:', {
          base: `${parsedUrl.protocol}//${parsedUrl.host}`,
          path: parsedUrl.pathname,
          hasRef: parsedUrl.searchParams.has('ref'),
          refValue: parsedUrl.searchParams.get('ref'),
          fullQueryString: parsedUrl.search
        });
      } catch (e) {
        console.error('Failed to parse URL:', e);
      }

      // Improved cast text
      const castText = `${product.title}\n$${product.price}\n\nGet yours on MarketBase!`;
      console.log('Cast text:', castText);

      // Debug the composeCast call
      console.log('About to call composeCast with:', {
        text: castText,
        embeds: [frameUrl]
      });

      await composeCast({
        text: castText,
        embeds: [frameUrl]
      });

      console.log('composeCast() completed successfully');
      toast.success('Shared Successfully!', 'Your product link has been shared to Farcaster');

      // Track the share
      try {
        const trackPayload = {
          productId: product.sku || product.id,
          userFid: userFid,
          frameUrl
        };
        console.log('Tracking share with payload:', trackPayload);
        
        const trackResponse = await fetch('/api/affiliate/track-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackPayload)
        });
        
        const trackData = await trackResponse.json();
        console.log('Share tracking response:', {
          status: trackResponse.status,
          data: trackData
        });
      } catch (error) {
        console.error('Failed to track share:', error);
      }

      console.log('=== SHARE COMPLETED ===');

    } catch (error) {
      console.error('Share error:', error);

      const fallbackUrl = await createFarcasterComposeUrl(product);

      if (fallbackUrl) {
        console.log('Using fallback URL:', fallbackUrl);
        window.open(fallbackUrl, '_blank');
        toast.info('Opening Farcaster', 'Complete your cast in the new tab');
      } else {
        console.log('Fallback URL creation failed');
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
      const castText = `${product.title}\n$${product.price}\n\nGet yours on MarketBase!`;
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

export const ShareButton = memo(ShareButtonComponent);
