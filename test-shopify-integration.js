// Test script to verify Shopify integration after fixing column name
// Run this with: node test-shopify-integration.js

const crypto = require('crypto');

// Test if the stored API key can be decrypted
function testDecryption() {
  const ENCRYPTION_KEY = process.env.SHOPIFY_ENCRYPTION_KEY || 'default-dev-key-change-in-production-32chars';
  const KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

  // The API key from your database
  const encryptedApiKey = 'f3b54c797ac942c858163e40c71137d9:2d508719424acdd3c45aa6b6fb1698d6d0e2f55bd55471a4d9ad42c15b363c24a070dad24a9b82e93f97c19c011c864e';

  try {
    const parts = encryptedApiKey.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted API key format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];

    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    console.log('✅ API key decryption successful');
    console.log('Decrypted key starts with:', decrypted.substring(0, 10) + '...');

    // Validate format
    const shopifyKeyPattern = /^shp(pa|at)_[a-zA-Z0-9]{20,}$/;
    if (shopifyKeyPattern.test(decrypted)) {
      console.log('✅ API key format is valid Shopify format');
    } else {
      console.log('⚠️  API key format does not match expected Shopify format');
    }

    return decrypted;
  } catch (error) {
    console.error('❌ Error decrypting API key:', error.message);
    return null;
  }
}

// Test Shopify API connection
async function testShopifyConnection(storeUrl, apiKey) {
  try {
    const apiUrl = `https://${storeUrl}/admin/api/2023-10/products.json?limit=1`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ Shopify API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Shopify API connection successful');
    console.log(`Found ${data.products ? data.products.length : 0} products`);
    return true;
  } catch (error) {
    console.error('❌ Network error connecting to Shopify:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Shopify Integration...\n');

  // Test decryption
  const decryptedKey = testDecryption();

  if (decryptedKey) {
    console.log('\n🔍 Testing Shopify API connection...');
    await testShopifyConnection('mms0ju-v6.myshopify.com', decryptedKey);
  }
}

if (require.main === module) {
  main();
}