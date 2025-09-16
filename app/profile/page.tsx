// app/support/page.tsx
"use client";

export default function SupportPage() {
  const handleContactClick = (method: string) => {
    switch (method) {
      case 'email':
        window.open('mailto:support@baseshop.com', '_blank');
        break;
      case 'telegram':
        alert('Telegram support coming soon! Please use email for now.');
        break;
      case 'discord':
        alert('Discord community coming soon! Please use email for now.');
        break;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="text-gray-600">We&apos;re here to help you succeed</p>
        </div>

        {/* Contact Methods */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Get in Touch</h2>
          <div className="space-y-3">
            <button
              onClick={() => handleContactClick('email')}
              className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email Support</p>
                <p className="text-xs text-gray-600">support@baseshop.com</p>
              </div>
            </button>

            <button
              onClick={() => handleContactClick('telegram')}
              className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left opacity-60"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Telegram</p>
                <p className="text-xs text-gray-600">Coming Soon</p>
              </div>
            </button>

            <button
              onClick={() => handleContactClick('discord')}
              className="w-full flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left opacity-60"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Discord Community</p>
                <p className="text-xs text-gray-600">Coming Soon</p>
              </div>
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-medium text-gray-900 mb-1">How do I make a purchase?</h3>
              <p className="text-xs text-gray-600">Connect your wallet, add items to cart, and pay with USDC. Payments are instant on Base.</p>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-medium text-gray-900 mb-1">What cryptocurrencies do you accept?</h3>
              <p className="text-xs text-gray-600">Currently we only accept USDC on Base. More payment options coming soon.</p>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-medium text-gray-900 mb-1">How does the affiliate program work?</h3>
              <p className="text-xs text-gray-600">Every user is automatically an affiliate. Share products and earn 5% commission on sales.</p>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Can I become a seller?</h3>
              <p className="text-xs text-gray-600">Seller applications are opening soon. Visit the Sell page to learn more.</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Is Base Shop safe to use?</h3>
              <p className="text-xs text-gray-600">Yes! All transactions are secured by Base blockchain. We never store your private keys.</p>
            </div>
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Common Issues</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Wallet Won&apos;t Connect</p>
                <p className="text-xs text-gray-600">Make sure you&apos;re on Base network and have a compatible wallet</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Failed</p>
                <p className="text-xs text-gray-600">Check your USDC balance and network connection</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Order Not Showing</p>
                <p className="text-xs text-gray-600">Orders may take a few minutes to appear after payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Status */}
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Platform Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Base Network</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Operational</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Payment System</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Operational</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Order Processing</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
          <div className="space-y-2">
            <button
              onClick={() => window.location.href = '/about'}
              className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">About Base Shop</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => window.open('https://base.org', '_blank')}
              className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Learn About Base</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => window.location.href = '/sell'}
              className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Become a Seller</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Response Time Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Support Response Times</p>
              <p className="text-xs text-blue-700 mt-1">
                We aim to respond to all support requests within 24 hours. For urgent issues, please mark your email as &quot;URGENT&quot;.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
