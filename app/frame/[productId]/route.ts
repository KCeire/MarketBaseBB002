// app/frame/[productId]/route.ts

import { NextRequest } from 'next/server';


export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const { searchParams } = new URL(request.url);
  const productId = params.productId;
  const referrerId = searchParams.get('ref');
  
  // Fetch product data (you'll need to implement this based on your store structure)
  // const product = await getProductById(productId);
  
  // For now, using placeholder data - replace with your actual product fetch
  const product = {
    name: `Product ${productId}`,
    description: 'Amazing product from Base Shop',
    image: `${process.env.NEXT_PUBLIC_URL}/api/og-product?id=${productId}` // We'll create this OG image endpoint
  };

  const frameUrl = `${process.env.NEXT_PUBLIC_URL}?p=${productId}${referrerId ? `&ref=${referrerId}` : ''}`;
  
  const frame = {
    version: "next",
    imageUrl: product.image,
    button: {
      title: "Shop Now",
      action: {
        type: "launch_frame",
        name: "Base Shop",
        url: frameUrl,
        splashImageUrl: `${process.env.NEXT_PUBLIC_URL}/splash.png`,
        splashBackgroundColor: "#000000",
      },
    },
  };

  // Return HTML with frame metadata
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${product.name} - Base Shop</title>
        <meta name="description" content="${product.description}">
        
        <!-- Open Graph -->
        <meta property="og:title" content="${product.name} - Base Shop">
        <meta property="og:description" content="${product.description}">
        <meta property="og:image" content="${product.image}">
        <meta property="og:url" content="${request.url}">
        
        <!-- Farcaster Frame -->
        <meta name="fc:frame" content='${JSON.stringify(frame)}'>
      </head>
      <body>
        <h1>${product.name}</h1>
        <p>${product.description}</p>
        <p>To interact with this product, share it on Farcaster or open in Base App.</p>
      </body>
    </html>`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    }
  );
}
