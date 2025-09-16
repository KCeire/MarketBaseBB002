// app/sell/page.tsx
export default function SellPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Sell on Base Shop</h1>
          <p className="text-gray-600">Join our marketplace and reach customers worldwide</p>
        </div>

        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 text-center space-y-2">
          <p className="text-2xl font-bold text-gray-900">Start Selling Today</p>
          <p className="text-sm text-gray-600">Join thousands of sellers already on our platform</p>
        </div>

        {/* Why Sell With Us */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Why Sell With Us?</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Crypto-Native Payments</p>
                <p className="text-xs text-gray-600">Get paid instantly in USDC on Base - no waiting for traditional payment processing</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Global Reach</p>
                <p className="text-xs text-gray-600">Access customers worldwide through Farcaster and Base ecosystem</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Custom Store Design</p>
                <p className="text-xs text-gray-600">Create your unique branded store experience within our marketplace</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Built-in Affiliate Network</p>
                <p className="text-xs text-gray-600">Every user becomes your affiliate - amplify your reach organically</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">How It Works</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Apply to Sell</p>
                <p className="text-xs text-gray-600">Submit your application with product details and business info</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Get Approved</p>
                <p className="text-xs text-gray-600">Our team reviews your application and helps with onboarding</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Design Your Store</p>
                <p className="text-xs text-gray-600">Create your custom branded experience within our marketplace</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Start Selling</p>
                <p className="text-xs text-gray-600">List your products and start reaching customers immediately</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="text-base font-semibold text-gray-900 text-center">Simple, Transparent Pricing</h3>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">5% + Payment Processing</p>
            <p className="text-xs text-gray-600">No monthly fees • No setup costs • No hidden charges</p>
          </div>
        </div>

        {/* Featured Sellers */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Featured Sellers</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-purple-600">AE</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">aesthetic edit</p>
                <p className="text-xs text-gray-600">Curated lifestyle products</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">NE</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">nft energy</p>
                <p className="text-xs text-gray-600">Digital collectibles & tech accessories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="space-y-3">
          <button 
            onClick={() => {
              // This will be replaced with actual application flow
              alert('Seller applications opening soon! Follow us for updates.');
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply to Become a Seller
          </button>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => window.location.href = '/stores'}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Browse Stores
            </button>
            <button 
              onClick={() => window.location.href = '/earn'}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Learn About Earning
            </button>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-600">Questions about selling?</p>
          <p className="text-xs text-gray-500">Contact us at sellers@baseshop.com</p>
        </div>
      </div>
    </div>
  );
}
