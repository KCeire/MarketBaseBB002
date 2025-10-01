// app/support/page.tsx
"use client";

export default function SupportPage() {
  const handleContactClick = (method: string) => {
    switch (method) {
      case 'email':
        window.open('mailto:lk@lkforge.xyz', '_blank');
        break;
      case 'farcaster':
        window.open('https://farcaster.xyz/landkforge', '_blank');
        break;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav bg-gray-900 min-h-screen">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Help & Support</h1>
          <p className="text-gray-400">We&apos;re here to help you succeed</p>
        </div>

        {/* Contact Methods */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Get in Touch</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleContactClick('email')}
              className="w-full flex items-center space-x-3 p-4 bg-blue-900/30 hover:bg-blue-900/40 rounded-lg transition-colors text-left border border-blue-600"
            >
              <div className="w-10 h-10 bg-blue-900/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-100">Email Support</p>
                <p className="text-xs text-gray-300">lk@lkforge.xyz</p>
              </div>
            </button>


            <button
              onClick={() => handleContactClick('farcaster')}
              className="w-full flex items-center space-x-3 p-4 bg-purple-900/30 hover:bg-purple-900/40 rounded-lg transition-colors text-left border border-purple-600"
            >
              <div className="w-10 h-10 bg-purple-900/50 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-100">Farcaster</p>
                <p className="text-xs text-gray-300">@landkforge</p>
              </div>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-3">
              <h3 className="text-sm font-medium text-gray-100 mb-1">How do I make a purchase?</h3>
              <p className="text-xs text-gray-400">Connect your wallet, add items to cart, and pay with USDC. Payments are instant on Base.</p>
            </div>
            <div className="border-b border-gray-700 pb-3">
              <h3 className="text-sm font-medium text-gray-100 mb-1">What cryptocurrencies do you accept?</h3>
              <p className="text-xs text-gray-400">Currently we only accept USDC on Base. More payment options coming soon.</p>
            </div>
            <div className="border-b border-gray-700 pb-3">
              <h3 className="text-sm font-medium text-gray-100 mb-1">How does the affiliate program work?</h3>
              <p className="text-xs text-gray-400">Every user is automatically an affiliate. Share products and earn a commission on settled sales.</p>
            </div>
            <div className="border-b border-gray-700 pb-3">
              <h3 className="text-sm font-medium text-gray-100 mb-1">Can I become a seller?</h3>
              <p className="text-xs text-gray-400">Seller applications are opening soon. Visit the Sell page to learn more.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-100 mb-1">Is Base Shop safe to use?</h3>
              <p className="text-xs text-gray-400">Yes! All transactions are secured by Base blockchain. We never store your private keys.</p>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Common Issues</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-100">Wallet Won&apos;t Connect</p>
                <p className="text-xs text-gray-400">Make sure you&apos;re on Base network and have a compatible wallet</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-100">Payment Failed</p>
                <p className="text-xs text-gray-400">Check your USDC balance and network connection</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-100">Order Not Showing</p>
                <p className="text-xs text-gray-400">Orders may take a few minutes to appear after payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="bg-green-900/20 rounded-xl border border-green-600 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Platform Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Base Network</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-300 font-medium">Operational</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Payment System</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-300 font-medium">Operational</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">Order Processing</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-300 font-medium">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Links */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Resources</h2>
          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/about'}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">About Base Shop</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => window.location.href = '/sell'}
              className="w-full text-left p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Become a Seller</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Response Time Notice */}
        <div className="bg-blue-900/20 border border-blue-600 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-300">Support Response Times</p>
              <p className="text-xs text-blue-400 mt-1">
                We aim to respond to all support requests within 24 hours. For urgent issues, please mark your email as &quot;URGENT&quot;.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
