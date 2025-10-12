// app/earn/page.tsx
"use client";

import { useState, useEffect } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { ProductInfoCard } from '@/app/components/affiliate/ProductInfoCard';
import { CommissionStatusBadge } from '@/app/components/affiliate/CommissionStatusBadge';
import { SettlementInfo } from '@/app/components/affiliate/SettlementInfo';
import { ClaimButton } from '@/app/components/affiliate/ClaimButton';

interface AffiliateStats {
  referrer_fid: string;
  total_clicks: number;
  conversions: number;
  total_earned: number;
  avg_commission: number;
  last_earning_date: string | null;
}

interface ProductInfo {
  id: string;
  title: string;
  price: string;
  image: string;
  vendor: string;
}

interface AffiliateClick {
  click_id: string;
  product_id: string;
  clicked_at: string;
  converted: boolean;
  commission_amount: number | null;
  commission_earned_at: string | null;
  product: ProductInfo | null;
  status: 'pending' | 'earned_pending_settlement' | 'earned';
}

export default function EarnPage() {
  const [userFid, setUserFid] = useState<string | null>(null);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<AffiliateClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Get user's FID
        const context = await sdk.context;
        const fid = context.user?.fid?.toString();

        if (fid) {
          setUserFid(fid);
          await fetchAffiliateData(fid);
        }
      } catch (error) {
        console.error('Error getting user context:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const fetchAffiliateData = async (fid: string) => {
    try {
      // Fetch affiliate stats
      const statsResponse = await fetch(`/api/affiliate/link-fid?fid=${fid}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setAffiliateStats(statsData.affiliateStats);

        // Store debug information for troubleshooting
        setDebugInfo(statsData.debug);
        console.log('🔍 EARN PAGE DEBUG: Affiliate stats received:', {
          affiliateStats: statsData.affiliateStats,
          debug: statsData.debug,
          fullResponse: statsData
        });
      }

      // Fetch recent activity (we'll need to create this endpoint)
      const activityResponse = await fetch(`/api/affiliate/activity?fid=${fid}`);
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    }
  };
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Earn with Base Shop</h1>
          <p className="text-gray-600 dark:text-gray-400">Share products and earn commissions automatically</p>
        </div>

        {/* How it works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How It Works</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">You&#39;re Already an Affiliate</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">No registration needed - every user is automatically an affiliate</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Cast Any Product</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Share products from our app to Farcaster with your unique link</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Earn Commission</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Get paid when someone buys through your shared link</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">2%</p>
            <p className="text-sm text-green-700 dark:text-green-400">Commission on every sale</p>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">30-day attribution window</p>
          </div>
        </div>

        {/* Earnings Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Earnings</h2>
            {loading && <div className="text-xs text-gray-500">Loading...</div>}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ${affiliateStats ? (affiliateStats.total_earned >= 0.01
                  ? affiliateStats.total_earned.toFixed(2)
                  : affiliateStats.total_earned.toFixed(4)) : '0.00'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Earned</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {affiliateStats ? affiliateStats.conversions : 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sales</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {affiliateStats ? affiliateStats.total_clicks : 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Clicks</p>
            </div>
          </div>

          {/* Enhanced Activity Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
              {recentActivity.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {recentActivity.length} item{recentActivity.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((activity) => (
                  <div
                    key={activity.click_id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="space-y-3">
                      {/* Product Info and Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {activity.product ? (
                            <ProductInfoCard product={activity.product} />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  Product #{activity.product_id}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Product information unavailable
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <CommissionStatusBadge status={activity.status} className="ml-3 flex-shrink-0" />
                      </div>

                      {/* Settlement Info */}
                      <SettlementInfo
                        status={activity.status}
                        commissionEarnedAt={activity.commission_earned_at}
                        commissionAmount={activity.commission_amount}
                      />

                      {/* Click Date */}
                      <div className="text-xs text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-2">
                        Clicked: {new Date(activity.clicked_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <div className="text-gray-400 dark:text-gray-500 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm6 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {userFid ? 'No affiliate activity yet' : 'Sign in to view earnings'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {userFid ? 'Share your first product to get started!' : 'Connect your Farcaster account'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Commission Claiming Section */}
        {userFid && (
          <ClaimButton
            totalClaimable={0} // Always 0 for now since no delivery tracking
            canClaim={false} // Always false for now
            onClaim={() => {
              // Placeholder for future claiming functionality
              console.log('Claim button clicked - feature coming soon');
            }}
          />
        )}

        {/* Debug Section - Temporary for troubleshooting */}
        {debugInfo && process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="text-center mb-3">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Debug Info</h3>
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 space-y-2 max-h-40 overflow-auto">
              <div>FID: {userFid}</div>
              <div>Total Clicks: {(debugInfo.total_clicks as number) || 0}</div>
              <div>Converted: {(debugInfo.converted_clicks as number) || 0}</div>
              <div>Commission Sum: ${(debugInfo.total_commission_sum as number) || 0}</div>
              <div>Total Earned: ${(debugInfo.total_earned_calculation as number) || 0}</div>
              {!!debugInfo.clicks_detail && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Click Details</summary>
                  <div className="mt-1 pl-4 text-xs">
                    <pre>{JSON.stringify(debugInfo.clicks_detail, null, 2)}</pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Ready to start earning?</p>
          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/?view=categories'}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
            <button
              onClick={() => window.location.href = '/sell'}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Become a Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
