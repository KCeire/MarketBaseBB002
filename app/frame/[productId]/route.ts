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

  // Fetch product data from Shopify API
  let product: Product | null = null;
  try {
    const shopifyResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/shopify/products`);
    const shopifyData = await shopifyResponse.json();
    product = shopifyData.products?.find((p: Product) => p.id.toString() === productId) || null;
  } catch (error) {
    console.error('Error fetching product:', error);
  }

  // Fallback to placeholder if product not found
  if (!product) {
    product = {
      id: productId,
      title: `Product ${productId}`,
      description: 'Amazing product from Base Shop',
      image: `${process.env.NEXT_PUBLIC_URL}/api/og-product?id=${productId}`,
      price: '0.00'
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://store.lkforge.xyz';
  const miniappUrl = `${baseUrl}?p=${productId}${referrerId ? `&ref=${referrerId}` : ''}`;

  // Ensure absolute URL for image
  const absoluteImageUrl = product.image.startsWith('http')
    ? product.image
    : `${baseUrl}${product.image}`;

  // Create miniapp embed metadata according to Farcaster documentation
  const miniappMetadata = {
    version: "1",
    imageUrl: absoluteImageUrl,
    button: {
      title: "Shop Now 🛍️",
      action: {
        type: "launch_miniapp",
        url: miniappUrl,
        name: "Base Shop",
        splashImageUrl: `${baseUrl}/splash.png`,
        splashBackgroundColor: "#000000"
      }
    }
  };

  // Helper function to escape HTML attributes
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

    <!-- Farcaster Miniapp Embed -->
    <meta name="fc:miniapp" content="${JSON.stringify(miniappMetadata).replace(/"/g, '&quot;')}">

    <!-- Backward compatibility with legacy frame format -->
    <meta property="fc:frame" content="vNext">
    <meta property="fc:frame:image" content="${product.image}">
    <meta property="fc:frame:button:1" content="Shop Now 🛍️">
    <meta property="fc:frame:button:1:action" content="link">
    <meta property="fc:frame:button:1:target" content="${miniappUrl}">
  </head>
  <body>
    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>${product.title}</h1>
      <img src="${product.image}" alt="${product.title}" style="max-width: 100%; border-radius: 8px;">
      <p>${product.description || 'Shop this product on Base Shop'}</p>
      <p><strong>Price: $${product.price}</strong></p>
      <p>To purchase this product, share it on Farcaster or open in Base App.</p>
    </div>
  </body>
</html>`;

  return new Response(frameHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
