// lib/encryption.ts
import CryptoJS from 'crypto-js';
import { CustomerData } from '@/types/supabase';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Encrypts sensitive customer data using AES encryption
 */
export function encryptCustomerData(customerData: CustomerData): string {
  try {
    if (!ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY is not defined');
    }
    
    const dataString = JSON.stringify(customerData);
    const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    throw new EncryptionError(`Failed to encrypt customer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts customer data using AES decryption
 */
export function decryptCustomerData(encryptedData: string): CustomerData {
  try {
    if (!ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY is not defined');
    }
    
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const dataString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!dataString) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
    
    return JSON.parse(dataString) as CustomerData;
  } catch (error) {
    throw new EncryptionError(`Failed to decrypt customer data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a unique order reference
 */
export function generateOrderReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Validates customer data structure
 */
export function validateCustomerData(data: unknown): data is CustomerData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const customerData = data as Record<string, unknown>;

  // Check required fields
  if (!customerData.email || typeof customerData.email !== 'string') {
    return false;
  }

  if (!customerData.shippingAddress || typeof customerData.shippingAddress !== 'object') {
    return false;
  }

  const shipping = customerData.shippingAddress as Record<string, unknown>;
  const requiredShippingFields = ['name', 'address1', 'city', 'state', 'country', 'zipCode'];
  
  for (const field of requiredShippingFields) {
    if (!shipping[field] || typeof shipping[field] !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Sanitizes data for logging (removes sensitive information)
 */
export function sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Hide sensitive fields
    if (key.toLowerCase().includes('password') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('secret') ||
        key === 'encrypted_customer_data') {
      sanitized[key] = '[REDACTED]';
    } else if (key === 'customer_wallet') {
      // Show only first and last 4 characters of wallet
      const wallet = value as string;
      sanitized[key] = wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
