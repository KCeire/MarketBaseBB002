// lib/shopify/validation.ts - Shopify API connection validation

interface ShopifyValidationResult {
  isValid: boolean;
  error?: string;
  shopInfo?: {
    name: string;
    domain: string;
    email: string;
  };
}

/**
 * Validate Shopify store URL format
 */
export function validateShopifyUrl(url: string): boolean {
  const shopifyPattern = /^[a-zA-Z0-9-]+\.myshopify\.com$/;
  return shopifyPattern.test(url);
}

/**
 * Test Shopify API connection by making a basic shop info request
 */
export async function validateShopifyConnection(
  storeUrl: string,
  apiKey: string
): Promise<ShopifyValidationResult> {
  try {
    // Ensure URL has https:// prefix for API calls
    const apiUrl = `https://${storeUrl}/admin/api/2023-10/shop.json`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          isValid: false,
          error: 'Invalid API key. Please check your private app access token.'
        };
      } else if (response.status === 404) {
        return {
          isValid: false,
          error: 'Store not found. Please check your store URL.'
        };
      } else {
        return {
          isValid: false,
          error: `API error: ${response.status} ${response.statusText}`
        };
      }
    }

    const data = await response.json();

    if (data.shop) {
      return {
        isValid: true,
        shopInfo: {
          name: data.shop.name,
          domain: data.shop.domain,
          email: data.shop.email
        }
      };
    } else {
      return {
        isValid: false,
        error: 'Invalid response from Shopify API'
      };
    }

  } catch (error) {
    console.error('Shopify validation error:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        isValid: false,
        error: 'Network error. Please check your store URL and try again.'
      };
    }

    return {
      isValid: false,
      error: 'Failed to connect to Shopify. Please check your credentials.'
    };
  }
}

/**
 * Get basic product count from Shopify store
 */
export async function getShopifyProductCount(
  storeUrl: string,
  apiKey: string
): Promise<number> {
  try {
    const apiUrl = `https://${storeUrl}/admin/api/2023-10/products/count.json`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.count || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error fetching product count:', error);
    return 0;
  }
}