// lib/payment-verification.ts - Client-side payment verification utilities

export interface PaymentVerificationResult {
  success: boolean;
  paymentStatus?: string;
  orderUpdated?: boolean;
  affiliateProcessed?: boolean;
  error?: string;
}

export interface PaymentPollingOptions {
  orderReference: string;
  transactionId: string;
  testnet?: boolean;
  maxAttempts?: number;
  pollingInterval?: number; // milliseconds
  onProgress?: (attempt: number, status: string) => void;
  onSuccess?: (result: PaymentVerificationResult) => void;
  onError?: (error: string) => void;
}

/**
 * Verify a single payment status
 */
export async function verifyPayment(
  orderReference: string,
  transactionId: string,
  testnet = false
): Promise<PaymentVerificationResult> {
  try {
    const response = await fetch('/api/orders/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderReference,
        transactionId,
        testnet,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Payment verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Poll payment status until completion or timeout
 */
export async function pollPaymentStatus(options: PaymentPollingOptions): Promise<PaymentVerificationResult> {
  const {
    orderReference,
    transactionId,
    testnet = false,
    maxAttempts = 30, // 30 attempts = 5 minutes at 10-second intervals
    pollingInterval = 10000, // 10 seconds
    onProgress,
    onSuccess,
    onError,
  } = options;

  console.log(`🔄 Starting payment polling for order ${orderReference}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔍 Payment verification attempt ${attempt}/${maxAttempts}`);

      const result = await verifyPayment(orderReference, transactionId, testnet);

      // Call progress callback
      if (onProgress) {
        onProgress(attempt, result.paymentStatus || 'unknown');
      }

      // If verification failed, log and continue polling
      if (!result.success) {
        console.warn(`⚠️ Verification attempt ${attempt} failed:`, result.error);

        // If it's the last attempt, return the error
        if (attempt === maxAttempts) {
          const errorMessage = result.error || 'Payment verification timeout';
          if (onError) onError(errorMessage);
          return result;
        }

        // Otherwise, wait and try again
        await sleep(pollingInterval);
        continue;
      }

      // If payment is completed, we're done!
      if (result.paymentStatus === 'completed') {
        console.log(`✅ Payment confirmed after ${attempt} attempts`);
        if (onSuccess) onSuccess(result);
        return result;
      }

      // If payment is still pending, continue polling
      if (result.paymentStatus === 'pending' || result.paymentStatus === 'processing') {
        console.log(`⏳ Payment still ${result.paymentStatus}, continuing to poll...`);

        // If it's the last attempt, return timeout
        if (attempt === maxAttempts) {
          const timeoutMessage = `Payment verification timeout after ${maxAttempts} attempts`;
          console.warn('⏰ ' + timeoutMessage);
          if (onError) onError(timeoutMessage);
          return {
            success: false,
            error: timeoutMessage,
          };
        }

        // Wait before next attempt
        await sleep(pollingInterval);
        continue;
      }

      // If payment failed, return immediately
      if (result.paymentStatus === 'failed' || result.paymentStatus === 'cancelled') {
        const errorMessage = `Payment ${result.paymentStatus}`;
        console.error('❌ ' + errorMessage);
        if (onError) onError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Unknown status, log and continue
      console.warn(`❓ Unknown payment status: ${result.paymentStatus}`);

      if (attempt === maxAttempts) {
        const errorMessage = `Unknown payment status: ${result.paymentStatus}`;
        if (onError) onError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      await sleep(pollingInterval);

    } catch (error) {
      console.error(`❌ Payment verification attempt ${attempt} failed:`, error);

      if (attempt === maxAttempts) {
        const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
        if (onError) onError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }

      // Wait before retrying
      await sleep(pollingInterval);
    }
  }

  // This should never be reached, but just in case
  const timeoutMessage = 'Payment verification timeout';
  if (onError) onError(timeoutMessage);
  return {
    success: false,
    error: timeoutMessage,
  };
}

/**
 * Start payment verification after Base Pay returns
 */
export async function startPaymentVerification(
  orderReference: string,
  transactionId: string,
  options: Partial<PaymentPollingOptions> = {}
): Promise<PaymentVerificationResult> {
  const defaultOptions: PaymentPollingOptions = {
    orderReference,
    transactionId,
    testnet: process.env.NODE_ENV !== 'production', // Use testnet in development
    maxAttempts: 30,
    pollingInterval: 10000,
    onProgress: (attempt, status) => {
      console.log(`🔄 Payment verification progress: attempt ${attempt}, status: ${status}`);
    },
    onSuccess: (result) => {
      console.log('🎉 Payment verification completed successfully!', result);
    },
    onError: (error) => {
      console.error('💥 Payment verification failed:', error);
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return pollPaymentStatus(mergedOptions);
}

/**
 * Utility function to sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if a payment is already confirmed (for UI state management)
 */
export async function checkPaymentStatus(
  orderReference: string
): Promise<{ isConfirmed: boolean; paymentHash?: string; error?: string }> {
  try {
    const response = await fetch(`/api/orders/user?reference=${orderReference}`);

    if (!response.ok) {
      return { isConfirmed: false, error: 'Failed to fetch order' };
    }

    const data = await response.json();

    if (!data.success || !data.order) {
      return { isConfirmed: false, error: 'Order not found' };
    }

    const order = data.order;
    const isConfirmed = order.payment_status === 'confirmed' && order.payment_hash;

    return {
      isConfirmed,
      paymentHash: order.payment_hash,
    };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      isConfirmed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}