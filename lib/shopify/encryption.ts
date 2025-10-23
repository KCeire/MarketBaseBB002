// lib/shopify/encryption.ts - Shopify API key encryption utilities

import crypto from 'crypto';

// Get encryption key from environment
const ENCRYPTION_KEY = process.env.SHOPIFY_ENCRYPTION_KEY || 'default-dev-key-change-in-production-32chars';

// Ensure key is 32 bytes for AES-256
const KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

/**
 * Encrypt a Shopify API key for secure storage
 */
export function encryptApiKey(apiKey: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', KEY, iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Combine IV and encrypted data
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error encrypting API key:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypt a Shopify API key for use
 */
export function decryptApiKey(encryptedApiKey: string): string {
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

    return decrypted;
  } catch (error) {
    console.error('Error decrypting API key:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Validate that an API key looks like a Shopify private app key
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // Shopify private app access tokens typically start with 'shppa_' or 'shpat_'
  // and are around 32-64 characters long
  const shopifyKeyPattern = /^shp(pa|at)_[a-zA-Z0-9]{20,}$/;
  return shopifyKeyPattern.test(apiKey);
}