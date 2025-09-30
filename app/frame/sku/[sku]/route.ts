// app/frame/sku/[sku]/route.ts

import { NextRequest } from 'next/server';

// NFT Energy product data
const nftEnergyProducts = [
  {
    id: 'nft-energy-12pack',
    name: 'NFT Energy Drinks - 12 Pack',
    description: 'Experience the fusion of Web3 and real energy. Our signature energy drink that fuels your digital adventures and real-world hustle.',
    basePrice: 26.99,
    baseSku: 'NFT-ENERGY-12PK',
    category: 'drinks',
    image: '/stores/NFTEnergyDrinks/NFTEnergyDrink12Pack.jpeg',
  },
  {
    id: 'nft-energy-tshirt',
    name: 'NFT Energy Tee',
    description: 'Rep the brand with our premium cotton tee featuring the iconic NFT Energy logo.',
    basePrice: 19.99,
    baseSku: '685381941D63E',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/mens-premium-heavyweight-tee-black-front-6853818ca2de9-300x300.jpg',
  },
  {
    id: 'nft-energy-hoodie',
    name: 'NFT Energy Hoodie',
    description: 'Stay warm while repping Web3 culture. Premium fleece hoodie with embroidered NFT Energy branding.',
    basePrice: 30.00,
    baseSku: '6853806B94625',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/unisex-heavy-blend-hoodie-black-front-6853806252ae9-300x300.jpg',
  },
  {
    id: 'nft-energy-sweatshirt',
    name: 'NFT Energy Sweatshirt',
    description: 'Classic crew neck sweatshirt perfect for any Web3 enthusiast. Comfortable fit with bold NFT Energy graphics.',
    basePrice: 29.50,
    baseSku: '685375E48090B',
    category: 'apparel',
    image: '/stores/NFTEnergyDrinks/unisex-premium-sweatshirt-black-front-685375da34fb3-300x300.jpg',
  },
  {
    id: 'nft-energy-trucker-hat',
    name: 'NFT Energy Trucker Hat',
    description: 'Complete your look with our signature trucker hat. Embroidered logo, premium materials.',
    basePrice: 20.00,
    baseSku: '68537385433E6',
    category: 'accessories',
    image: '/stores/NFTEnergyDrinks/foam-trucker-hat-black-white-black-one-size-front-68537328b6d4d-300x300.jpg',
  },
  {
    id: 'nft-energy-iphone-case',
    name: 'NFT Energy iPhone Case',
    description: 'Protect your device in style. Compatible with iPhone 12-15, featuring durable protection and NFT Energy branding.',
    basePrice: 14.50,
    baseSku: '68537282C6DB2',
    category: 'accessories',
    image: '/stores/NFTEnergyDrinks/clear-case-for-iphone-iphone-15-pro-max-case-on-phone-6853727c8a9d4-300x300.jpg',
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  const { searchParams } = new URL(request.url);
  const { sku } = await params;
  const referrerId = searchParams.get('ref');

  console.log('NFT Energy frame route hit:', {
    sku,
    referrerId,
    fullUrl: request.url
  });

  // Find product by SKU
  const product = nftEnergyProducts.find(p =>
    p.baseSku === sku || sku.startsWith(p.baseSku)
  );

  // Fallback to placeholder if product not found
  const productData = product || {
    id: `sku-${sku}`,
    name: `NFT Energy Product ${sku}`,
    description: 'NFT Energy product - Where Web3 meets real energy.',
    basePrice: 0,
    baseSku: sku,
    category: 'unknown',
    image: '/stores/NFTEnergyDrinks/NFTEnergyDrink12Pack.jpeg'
  };

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://store.lkforge.xyz';
  const miniappUrl = `${baseUrl}/nft-energy/product/${sku}${referrerId ? `?ref=${referrerId}` : ''}`;

  // Ensure absolute URL
  const absoluteImageUrl = `${baseUrl}${productData.image}`;

  // Validate image exists
  try {
    const imgCheck = await fetch(absoluteImageUrl, { 
      method: 'HEAD', 
      signal: AbortSignal.timeout(2000) 
    });
    if (!imgCheck.ok) {
      console.warn(`Image not found for SKU ${sku}: ${absoluteImageUrl}`);
    }
  } catch (error) {
    console.warn(`Image validation failed for ${absoluteImageUrl}:`, error);
  }

  // CORRECT format
  const frameMetadata = {
    version: "next",
    imageUrl: absoluteImageUrl,
    button: {
      title: "Shop NFT Energy",
      action: {
        type: "launch_frame",
        name: "NFT Energy Store",
        url: miniappUrl,
        splashImageUrl: `${baseUrl}/splash.png`,
        splashBackgroundColor: "#000000"
      }
    }
  };

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
    <title>${escapeHtml(productData.name)} - NFT Energy Store</title>
    <meta name="description" content="${escapeHtml(productData.description)}">

    <!-- Open Graph -->
    <meta property="og:title" content="${escapeHtml(productData.name)} - NFT Energy Store">
    <meta property="og:description" content="${escapeHtml(productData.description)}">
    <meta property="og:image" content="${absoluteImageUrl}">
    <meta property="og:url" content="${request.url}">

    <!-- Farcaster Frame - CORRECT FORMAT -->
    <meta name="fc:frame" content='${JSON.stringify(frameMetadata)}'>
  </head>
  <body>
    <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1e293b, #0f172a); color: #e2e8f0; min-height: 100vh;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #22d3ee; margin-bottom: 10px;">${escapeHtml(productData.name)}</h1>
        <p style="color: #0891b2; font-size: 14px;">NFT Energy - Where Web3 Meets Real Energy</p>
      </div>

      <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; border: 1px solid rgba(34, 211, 238, 0.2);">
        <img src="${absoluteImageUrl}" alt="${escapeHtml(productData.name)}" style="max-width: 100%; border-radius: 8px; margin-bottom: 15px;">
        <p style="margin-bottom: 15px; line-height: 1.5;">${escapeHtml(productData.description)}</p>
        <p style="font-size: 18px; font-weight: bold; color: #22d3ee;">From $${productData.basePrice.toFixed(2)}</p>
        <p style="color: #64748b; font-size: 14px; margin-top: 15px;">SKU: ${productData.baseSku}</p>
      </div>

      <p style="text-align: center; margin-top: 20px; color: #64748b; font-size: 14px;">
        To purchase this product, share it on Farcaster or open in Base App.
      </p>
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
