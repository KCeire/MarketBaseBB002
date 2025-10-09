// app/api/producthub/test-connection/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connection to ProductHub
    const PRODUCTHUB_DOMAIN = process.env.PRODUCTHUB_DOMAIN;
    const PRODUCTHUB_ACCESS_TOKEN = process.env.PRODUCTHUB_ACCESS_TOKEN;
    const PRODUCTHUB_API_VERSION = process.env.PRODUCTHUB_API_VERSION || '2025-07';

    if (!PRODUCTHUB_DOMAIN || !PRODUCTHUB_ACCESS_TOKEN) {
      return NextResponse.json({
        error: 'Missing ProductHub environment variables',
        connected: false,
        environment: {
          domain: PRODUCTHUB_DOMAIN,
          hasToken: !!PRODUCTHUB_ACCESS_TOKEN,
          apiVersion: PRODUCTHUB_API_VERSION
        }
      }, { status: 500 });
    }

    const url = `https://${PRODUCTHUB_DOMAIN}/admin/api/${PRODUCTHUB_API_VERSION}/shop.json`;
    
    console.log('Testing ProductHub connection to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-ProductHub-Access-Token': PRODUCTHUB_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: `ProductHub API error: ${response.status} ${response.statusText}`,
        connected: false,
        environment: {
          domain: PRODUCTHUB_DOMAIN,
          hasToken: !!PRODUCTHUB_ACCESS_TOKEN,
          apiVersion: PRODUCTHUB_API_VERSION
        }
      }, { status: 500 });
    }

    const shopData = await response.json();
    
    // Now test products endpoint
    const productsUrl = `https://${PRODUCTHUB_DOMAIN}/admin/api/${PRODUCTHUB_API_VERSION}/products.json?limit=5`;
    const productsResponse = await fetch(productsUrl, {
      method: 'GET',
      headers: {
        'X-ProductHub-Access-Token': PRODUCTHUB_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!productsResponse.ok) {
      return NextResponse.json({ 
        error: `Products API error: ${productsResponse.status} ${productsResponse.statusText}`,
        connected: true,
        shopConnected: true,
        productsConnected: false,
        shop: shopData.shop?.name || 'Unknown'
      }, { status: 500 });
    }

    const productsData = await productsResponse.json();
    
    return NextResponse.json({
      connected: true,
      shopConnected: true,
      productsConnected: true,
      message: 'ProductHub API connection successful',
      shop: shopData.shop?.name || 'Unknown',
      productCount: productsData.products?.length || 0,
      sampleProduct: productsData.products?.[0] || null,
      environment: {
        domain: PRODUCTHUB_DOMAIN,
        hasToken: !!PRODUCTHUB_ACCESS_TOKEN,
        apiVersion: PRODUCTHUB_API_VERSION
      }
    });
  } catch (error) {
    console.error('ProductHub API test error:', error);
    
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        domain: process.env.PRODUCTHUB_DOMAIN,
        hasToken: !!process.env.PRODUCTHUB_ACCESS_TOKEN,
        apiVersion: process.env.PRODUCTHUB_API_VERSION || '2025-07'
      }
    }, { status: 500 });
  }
}
