// app/api/shopify/test-shopify/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test basic connection to Shopify
    const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-07';

    if (!SHOPIFY_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
      return NextResponse.json({ 
        error: 'Missing Shopify environment variables',
        connected: false,
        environment: {
          domain: SHOPIFY_DOMAIN,
          hasToken: !!SHOPIFY_ACCESS_TOKEN,
          apiVersion: SHOPIFY_API_VERSION
        }
      }, { status: 500 });
    }

    const url = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/shop.json`;
    
    console.log('Testing Shopify connection to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Shopify API error: ${response.status} ${response.statusText}`,
        connected: false,
        environment: {
          domain: SHOPIFY_DOMAIN,
          hasToken: !!SHOPIFY_ACCESS_TOKEN,
          apiVersion: SHOPIFY_API_VERSION
        }
      }, { status: 500 });
    }

    const shopData = await response.json();
    
    // Now test products endpoint
    const productsUrl = `https://${SHOPIFY_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/products.json?limit=5`;
    const productsResponse = await fetch(productsUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
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
      message: 'Shopify API connection successful',
      shop: shopData.shop?.name || 'Unknown',
      productCount: productsData.products?.length || 0,
      sampleProduct: productsData.products?.[0] || null,
      environment: {
        domain: SHOPIFY_DOMAIN,
        hasToken: !!SHOPIFY_ACCESS_TOKEN,
        apiVersion: SHOPIFY_API_VERSION
      }
    });
  } catch (error) {
    console.error('Shopify API test error:', error);
    
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        domain: process.env.SHOPIFY_DOMAIN,
        hasToken: !!process.env.SHOPIFY_ACCESS_TOKEN,
        apiVersion: process.env.SHOPIFY_API_VERSION || '2025-07'
      }
    }, { status: 500 });
  }
}
