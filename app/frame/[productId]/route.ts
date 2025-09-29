// app/frame/[productId]/route.ts

import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const { productId } = await params;
  const referrerId = searchParams.get('ref');

  // Fetch product data from Shopify API
  let product;
  try {
    const shopifyResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/shopify/products`);
    const shopifyData = await shopifyResponse.json();
    product = shopifyData.products?.find((p: any) => p.id.toString() === productId);
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

  // Updated miniapp embed format according to Base documentation
  const frameHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${product.title} - Base Shop</title>
    <meta name="description" content="${product.description || 'Shop on Base Shop'}">

    <!-- Open Graph -->
    <meta property="og:title" content="${product.title} - Base Shop">
    <meta property="og:description" content="${product.description || 'Shop on Base Shop'}">
    <meta property="og:image" content="${product.image}">
    <meta property="og:url" content="${request.url}">

    <!-- Farcaster Frame - Miniapp Embed -->
    <meta property="fc:frame" content="vNext">
    <meta property="fc:frame:image" content="${product.image}">
    <meta property="fc:frame:button:1" content="Shop Now 🛍️">
    <meta property="fc:frame:button:1:action" content="link">
    <meta property="fc:frame:button:1:target" content="${miniappUrl}">
    <meta property="fc:frame:button:1:action:type" content="launch_frame">
    <meta property="fc:frame:button:1:action:name" content="Base Shop">
    <meta property="fc:frame:button:1:action:url" content="${miniappUrl}">
    <meta property="fc:frame:button:1:action:splash_image_url" content="${baseUrl}/splash.png">
    <meta property="fc:frame:button:1:action:splash_background_color" content="#000000">
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
