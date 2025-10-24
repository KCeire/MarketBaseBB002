// app/frame/store/[storeId]/[productId]/route.ts

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
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const { storeId, productId } = await params;
  const referrerId = searchParams.get('ref');

  console.log('Store-specific frame route hit:', {
    storeId,
    productId,
    referrerId,
    fullUrl: request.url
  });

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://marketbase.lkforge.xyz';

  // Fetch product data from store-specific API with timeout
  let product: Product | null = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const storeProductResponse = await fetch(`${baseUrl}/api/products/by-store/${storeId}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (storeProductResponse.ok) {
      const storeProductData = await storeProductResponse.json();
      product = storeProductData.products?.find((p: Product) => p.id.toString() === productId) || null;
    }
  } catch (error) {
    console.error('Error fetching store product:', error);
  }

  // Fallback to placeholder if product not found
  if (!product) {
    product = {
      id: productId,
      title: `Product ${productId}`,
      description: `Amazing product from ${storeId} store`,
      image: `${baseUrl}/api/og-product?id=${productId}`,
      price: '0.00'
    };
  }

  const miniappUrl = `${baseUrl}/store/${storeId}?p=${productId}${referrerId ? `&ref=${referrerId}` : ''}`;

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
      console.warn(`Image not found for product ${productId} in store ${storeId}: ${absoluteImageUrl}`);
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
        name: "MarketBase",
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
    <title>${escapeHtml(product.title)} - MarketBase</title>
    <meta name="description" content="${escapeHtml(product.description || 'Shop on MarketBase')}">

    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(product.title)} - MarketBase">
    <meta property="og:description" content="${escapeHtml(product.description || 'Shop on MarketBase')}">
    <meta property="og:image" content="${absoluteImageUrl}">
    <meta property="og:url" content="${request.url}">

    <!-- Farcaster Frame - CORRECT FORMAT -->
    <meta name="fc:frame" content='${JSON.stringify(frameMetadata)}'>
  </head>
  <body>
    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>${escapeHtml(product.title)}</h1>
      <img src="${absoluteImageUrl}" alt="${escapeHtml(product.title)}" style="max-width: 100%; border-radius: 8px;">
      <p>${escapeHtml(product.description || 'Shop this product on MarketBase')}</p>
      <p><strong>Price: $${product.price}</strong></p>
      <p>Available at: <strong>${storeId}</strong></p>
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