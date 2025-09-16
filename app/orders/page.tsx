// app/orders/page.tsx
"use client";

export default function OrdersPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-600">Track your purchases and order history</p>
          </div>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-xs text-gray-600">Total Orders</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">$0.00</p>
            <p className="text-xs text-gray-600">Total Spent</p>
          </div>
        </div>

        {/* Order Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              All Orders
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              Processing
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              Shipped
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              Delivered
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">No Orders Yet</h3>
              <p className="text-sm text-gray-600">
                You haven&apos;t placed any orders yet. Start shopping to see your order history here.
              </p>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>

        {/* What to Expect Section */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">What to Expect</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Instant Payment Confirmation</p>
                <p className="text-xs text-gray-600">USDC payments are confirmed immediately on Base</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Order Processing</p>
                <p className="text-xs text-gray-600">Most orders are processed within 1-2 business days</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Shipping Tracking</p>
                <p className="text-xs text-gray-600">Get real-time tracking updates for all orders</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Order History</p>
                <p className="text-xs text-gray-600">Full transaction history stored securely on-chain</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Order Management Coming Soon</p>
              <p className="text-xs text-yellow-700 mt-1">
                Advanced order management features like order cancellation, returns, and detailed tracking are currently in development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
