// app/frame/[productId]/route.ts

import { NextRequest } from 'next/server';

interface Product {
  id: number | string;
  title: string;
  description?: string;
  image: string;
  price: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const { productId } = await params;
  const referrerId = searchParams.get('ref');

  console.log('Frame route hit:', {
    productId,
    referrerId,
    fullUrl: request.url
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://store.lkforge.xyz';

  // Fetch product data from Shopify API with timeout
  let product: Product | null = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const shopifyResponse = await fetch(`${baseUrl}/api/shopify/products`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (shopifyResponse.ok) {
      const shopifyData = await shopifyResponse.json();
      product = shopifyData.products?.find((p: Product) => p.id.toString() === productId) || null;
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }

  // Fallback to placeholder if product not found
  if (!product) {
    product = {
      id: productId,
      title: `Product ${productId}`,
      description: 'Amazing product from Base Shop',
      image: `${baseUrl}/api/og-product?id=${productId}`,
      price: '0.00'
    };
  }

  const miniappUrl = `${baseUrl}?p=${productId}${referrerId ? `&ref=${referrerId}` : ''}`;

  // Ensure absolute URL for image
  let absoluteImageUrl: string;
  if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
    absoluteImageUrl = product.image;
  } else if (product.image.startsWith('/')) {
    absoluteImageUrl = `${baseUrl}${product.image}`;
  } else {
    absoluteImageUrl = `${baseUrl}/${product.image}`;
  }

  // Validate image URL
  try {
    const imgCheck = await fetch(absoluteImageUrl, { 
      method: 'HEAD', 
      signal: AbortSignal.timeout(2000) 
    });
    if (!imgCheck.ok) {
      console.warn(`Image not found for product ${productId}: ${absoluteImageUrl}`);
      absoluteImageUrl = `${baseUrl}/hero-image.png`;
    }
  } catch (error) {
    console.warn(`Image validation failed for ${absoluteImageUrl}:`, error);
    absoluteImageUrl = `${baseUrl}/hero-image.png`;
  }

  // CORRECT metadata format according to Base docs
  const frameMetadata = {
    version: "next",
    imageUrl: absoluteImageUrl,
    button: {
      title: "Shop Now",
      action: {
        type: "launch_frame",
        name: "Base Shop",
        url: miniappUrl,
        splashImageUrl: `${baseUrl}/splash.png`,
        splashBackgroundColor: "#000000"
      }
    }
  };

  // Helper function to escape HTML content
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const frameHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(product.title)} - Base Shop</title>
    <meta name="description" content="${escapeHtml(product.description || 'Shop on Base Shop')}">

    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(product.title)} - Base Shop">
    <meta property="og:description" content="${escapeHtml(product.description || 'Shop on Base Shop')}">
    <meta property="og:image" content="${absoluteImageUrl}">
    <meta property="og:url" content="${request.url}">

    <!-- Farcaster Frame - CORRECT FORMAT -->
    <meta name="fc:frame" content='${JSON.stringify(frameMetadata)}'>
  </head>
  <body>
    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>${escapeHtml(product.title)}</h1>
      <img src="${absoluteImageUrl}" alt="${escapeHtml(product.title)}" style="max-width: 100%; border-radius: 8px;">
      <p>${escapeHtml(product.description || 'Shop this product on Base Shop')}</p>
      <p><strong>Price: $${product.price}</strong></p>
      <p>To purchase this product, share it on Farcaster or open in Base App.</p>
    </div>
  </body>
</html>`;

  return new Response(frameHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
