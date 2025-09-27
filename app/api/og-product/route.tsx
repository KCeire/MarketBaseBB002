// app/api/og-product/route.tsx


import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    const referrerId = searchParams.get('ref');
    
    // Fetch product data based on productId
    // For now using placeholder - replace with your actual product data
    const product = {
      name: `Product ${productId}`,
      price: '$99.99',
      description: 'Amazing product from Base Shop',
      image: '/placeholder-product.png' // Replace with actual product image
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(45deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f23 100%)',
          }}
        >
          {/* Main Container */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              padding: '40px',
              gap: '40px',
            }}
          >
            {/* Product Image Section */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1a1a1a',
                borderRadius: '20px',
                border: '2px solid #333',
              }}
            >
              {/* Placeholder for product image */}
              <div
                style={{
                  width: '80%',
                  height: '80%',
                  backgroundColor: '#333',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  color: '#666',
                }}
              >
                🛍️
              </div>
            </div>

            {/* Product Info Section */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '20px',
              }}
            >
              {/* Store Brand */}
              <div
                style={{
                  fontSize: '24px',
                  color: '#0052ff',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                }}
              >
                BASE SHOP
              </div>

              {/* Product Name */}
              <div
                style={{
                  fontSize: '48px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  lineHeight: '1.2',
                }}
              >
                {product.name}
              </div>

              {/* Price */}
              <div
                style={{
                  fontSize: '36px',
                  color: '#22c55e',
                  fontWeight: 'bold',
                }}
              >
                {product.price}
              </div>

              {/* Referral Badge */}
              {referrerId && (
                <div
                  style={{
                    fontSize: '18px',
                    color: '#fbbf24',
                    backgroundColor: '#451a03',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    width: 'fit-content',
                  }}
                >
                  🎯 Referred by {referrerId}
                </div>
              )}

              {/* Call to Action */}
              <div
                style={{
                  fontSize: '20px',
                  color: '#94a3b8',
                  marginTop: '20px',
                }}
              >
                Tap to shop • Pay with USDC
              </div>
            </div>
          </div>

          {/* Bottom Brand Strip */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '60px',
              backgroundColor: '#0052ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              color: '#ffffff',
              fontWeight: 'bold',
            }}
          >
            🛒 DECENTRALIZED MARKETPLACE ON BASE
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      }
    );
  } catch (error) {
    console.error('❌ [OG-PRODUCT] Error generating image:', error);
    return new Response('Failed to generate product image', { status: 500 });
  }
}