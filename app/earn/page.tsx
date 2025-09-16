// app/earn/page.tsx
"use client";

export default function EarnPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Earn with Base Shop</h1>
          <p className="text-gray-600">Share products and earn commissions automatically</p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div>
                <p className="text-sm font-medium text-gray-900">You&#39;re Already an Affiliate</p>
                <p className="text-xs text-gray-600">No registration needed - every user is automatically an affiliate</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Cast Any Product</p>
                <p className="text-xs text-gray-600">Share products from our app to Farcaster with your unique link</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Earn Commission</p>
                <p className="text-xs text-gray-600">Get paid when someone buys through your shared link</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">**%</p>
            <p className="text-sm text-green-700">Commission on every sale</p>
            <p className="text-xs text-green-600 mt-1">Paid in USDC</p>
          </div>
        </div>

        {/* Placeholder Earnings Dashboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Earnings</h2>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900">$0.00</p>
              <p className="text-xs text-gray-600">Total Earned</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-600">Referrals</p>
            </div>
          </div>

          {/* Placeholder Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex justify-between text-xs font-medium text-gray-700">
                  <span>Date</span>
                  <span>Product</span>
                  <span>Commission</span>
                </div>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">No earnings yet</p>
                <p className="text-xs text-gray-400 mt-1">Share your first product to get started!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">Ready to start earning?</p>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
            <button 
              onClick={() => window.location.href = '/sell'}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Become a Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
