// app/earn/page.tsx
"use client";

import { useState, useEffect } from 'react';
import sdk from '@farcaster/miniapp-sdk';

interface AffiliateStats {
  referrer_fid: string;
  total_clicks: number;
  conversions: number;
  total_earned: number;
  avg_commission: number;
  last_earning_date: string | null;
}

interface AffiliateClick {
  click_id: string;
  product_id: string;
  clicked_at: string;
  converted: boolean;
  commission_amount: number | null;
  commission_earned_at: string | null;
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

          {/* Activity Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs font-medium text-gray-700 dark:text-gray-300">
                  <span>Date</span>
                  <span>Status</span>
                  <span>Earnings</span>
                </div>
              </div>

              {recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.click_id} className="px-4 py-3 flex justify-between items-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(activity.commission_earned_at || activity.clicked_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs">
                        {activity.converted ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">✓ Earned</span>
                        ) : (
                          <span className="text-yellow-600 dark:text-yellow-400">⏳ Pending</span>
                        )}
                      </div>
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {activity.converted && activity.commission_amount
                          ? `$${activity.commission_amount.toFixed(2)}`
                          : '--'
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {userFid ? 'No affiliate activity yet' : 'Sign in to view earnings'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {userFid ? 'Share your first product to get started!' : 'Connect your Farcaster account'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

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
