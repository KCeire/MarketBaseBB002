// lib/affiliate-utils.ts - Client-side affiliate tracking utilities

/**
 * Track an affiliate click when a user visits a product page with a referral parameter
 */
export async function trackAffiliateClick(
  referrerFid: string,
  productId: string,
  visitorFid?: string
): Promise<{ success: boolean; clickId?: string; error?: string }> {
  try {
    const response = await fetch('/api/affiliate/track-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referrerFid,
        productId,
        visitorFid: visitorFid || undefined, // Don't send null, send undefined
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Affiliate click tracking failed:', result.error);
      return { success: false, error: result.error };
    }

    console.log('🔗 Affiliate click tracked:', {
      clickId: result.clickId,
      referrerFid,
      productId,
      visitorFid: visitorFid || 'anonymous'
    });

    return { success: true, clickId: result.clickId };
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Link a user's FID to any recent anonymous clicks they may have made
 * Call this when a user connects their Farcaster account
 */
export async function linkFidToClicks(
  visitorFid: string
): Promise<{ success: boolean; linkedClicks?: number; error?: string }> {
  try {
    const response = await fetch('/api/affiliate/link-fid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorFid,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('FID linking failed:', result.error);
      return { success: false, error: result.error };
    }

    if (result.linkedClicks > 0) {
      console.log('🔗 Linked anonymous clicks to FID:', {
        visitorFid,
        linkedClicks: result.linkedClicks
      });
    }

    return { success: true, linkedClicks: result.linkedClicks };
  } catch (error) {
    console.error('Error linking FID to clicks:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Check if there's a valid affiliate click for a user and product
 */
export async function checkAffiliateClick(
  visitorFid: string,
  productId: string
): Promise<{
  success: boolean;
  hasAffiliateClick?: boolean;
  affiliateData?: { click_id: string; referrer_fid: string; commission_rate: number };
  error?: string;
}> {
  try {
    const response = await fetch(
      `/api/affiliate/track-click?visitorFid=${encodeURIComponent(visitorFid)}&productId=${encodeURIComponent(productId)}`
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Affiliate click check failed:', result.error);
      return { success: false, error: result.error };
    }

    return {
      success: true,
      hasAffiliateClick: result.hasAffiliateClick,
      affiliateData: result.affiliateData
    };
  } catch (error) {
    console.error('Error checking affiliate click:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get affiliate earnings stats for a user
 */
export async function getAffiliateStats(
  fid: string
): Promise<{
  success: boolean;
  affiliateStats?: {
    referrer_fid: string;
    total_clicks: number;
    conversions: number;
    total_earned: number;
    avg_commission: number;
    last_earning_date: string | null;
  };
  error?: string;
}> {
  try {
    const response = await fetch(`/api/affiliate/link-fid?fid=${encodeURIComponent(fid)}`);
    const result = await response.json();

    if (!response.ok) {
      console.error('Affiliate stats fetch failed:', result.error);
      return { success: false, error: result.error };
    }

    return {
      success: true,
      affiliateStats: result.affiliateStats
    };
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Extract referrer FID from URL parameters
 */
export function extractReferrerFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

/**
 * Generate an affiliate URL for sharing a product
 */
export function generateAffiliateUrl(
  productId: string | number,
  referrerFid: string,
  baseUrl?: string
): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/frame/${productId}?ref=${referrerFid}`;
}

/**
 * Store affiliate data in localStorage for later processing
 * Used as a fallback when the user hasn't connected their FID yet
 */
export function storeAffiliateDataLocally(
  referrerFid: string,
  productId: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const affiliateData = {
      referrerFid,
      productId,
      timestamp: Date.now(),
      expires: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };

    const existingData = localStorage.getItem('affiliate_clicks');
    const clicks = existingData ? JSON.parse(existingData) : [];

    // Remove expired clicks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validClicks = clicks.filter((click: any) => click.expires > Date.now());

    // Add new click (or update existing)
    const existingIndex = validClicks.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (click: any) => click.referrerFid === referrerFid && click.productId === productId
    );

    if (existingIndex >= 0) {
      validClicks[existingIndex] = affiliateData;
    } else {
      validClicks.push(affiliateData);
    }

    localStorage.setItem('affiliate_clicks', JSON.stringify(validClicks));
    console.log('📦 Stored affiliate click locally:', affiliateData);
  } catch (error) {
    console.error('Error storing affiliate data locally:', error);
  }
}

/**
 * Process any stored affiliate clicks when user connects FID
 */
export async function processStoredAffiliateClicks(visitorFid: string): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const storedData = localStorage.getItem('affiliate_clicks');
    if (!storedData) return;

    const clicks = JSON.parse(storedData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validClicks = clicks.filter((click: any) => click.expires > Date.now());

    if (validClicks.length === 0) {
      localStorage.removeItem('affiliate_clicks');
      return;
    }

    // Process each stored click
    for (const click of validClicks) {
      await trackAffiliateClick(click.referrerFid, click.productId, visitorFid);
    }

    // Clear stored clicks after processing
    localStorage.removeItem('affiliate_clicks');
    console.log(`🔄 Processed ${validClicks.length} stored affiliate clicks for FID ${visitorFid}`);
  } catch (error) {
    console.error('Error processing stored affiliate clicks:', error);
  }
}