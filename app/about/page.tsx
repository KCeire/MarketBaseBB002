// app/about/page.tsx
"use client";

export default function AboutPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">About Base Shop</h1>
          <p className="text-gray-600">The future of decentralized commerce</p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Our Mission</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Base Shop is revolutionizing e-commerce by creating a decentralized marketplace where anyone can buy, sell, and earn commissions using cryptocurrency. Built on Base, we&apos;re making global commerce accessible, instant, and crypto-native.
          </p>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">What Makes Us Different</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Crypto-Native Payments</p>
                <p className="text-xs text-gray-600">Instant USDC payments on Base - no traditional banking delays</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Built-in Affiliate System</p>
                <p className="text-xs text-gray-600">Every user is automatically an affiliate - share and earn commissions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Farcaster Integration</p>
                <p className="text-xs text-gray-600">Native social commerce through the Farcaster ecosystem</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Global Accessibility</p>
                <p className="text-xs text-gray-600">No borders, no banks required - just your crypto wallet</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Platform Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">2</p>
                <p className="text-xs text-gray-600">Active Stores</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-gray-600">Orders Processed</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Join us as we grow the future of commerce</p>
          </div>
        </div>

        {/* Technology */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Built on Base</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Base Shop leverages Base&apos;s low-cost, fast transactions to create a seamless shopping experience. Our smart contracts ensure secure, transparent transactions while keeping fees minimal.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Base Blockchain</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">USDC Payments</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Smart Contracts</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">OnchainKit</span>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Development Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">MVP Development</span>
              <span className="text-xs text-blue-600 font-medium">In Progress</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Core Features</span>
              <span className="text-xs text-green-600 font-medium">Complete</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Seller Onboarding</span>
              <span className="text-xs text-yellow-600 font-medium">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Version */}
        <div className="text-center space-y-2 py-4">
          <p className="text-xs text-gray-500">Base Shop v1.0</p>
          <p className="text-xs text-gray-400">Built with ❤️ on Base</p>
        </div>
      </div>
    </div>
  );
}
