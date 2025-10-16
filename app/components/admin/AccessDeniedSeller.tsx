"use client";

import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface AccessDeniedSellerProps {
  userWallet?: string;
  className?: string;
}

export function AccessDeniedSeller({ userWallet, className = "" }: AccessDeniedSellerProps) {
  const sellerFeatures = [
    {
      icon: 'package',
      title: 'Order Management',
      description: 'View and manage all orders for your store, update order status, and handle customer inquiries.'
    },
    {
      icon: 'store',
      title: 'Shopify Integration',
      description: 'Connect your existing Shopify store to automatically sync products and inventory.'
    },
    {
      icon: 'plus',
      title: 'Product Management',
      description: 'Add and manage products manually with rich descriptions, images, and inventory tracking.'
    },
    {
      icon: 'eye',
      title: 'Analytics & Insights',
      description: 'Track your store performance, sales metrics, and affiliate commission earnings.'
    },
    {
      icon: 'settings',
      title: 'Account Settings',
      description: 'Customize your store branding, payment settings, and business information.'
    }
  ];

  const handleApplyToSell = () => {
    window.location.href = '/sell';
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 ${className}`}>
      <div className="max-w-2xl w-full">
        {/* Access Denied Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center mb-8">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Seller Access Required
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be an approved seller to access the admin dashboard. Apply now to start selling your products on our marketplace!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleApplyToSell}
              className="flex items-center justify-center space-x-2"
            >
              <Icon name="store" size="sm" />
              <span>Apply to Become a Seller</span>
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center space-x-2"
            >
              <Icon name="home" size="sm" />
              <span>Back to Marketplace</span>
            </Button>
          </div>

          {userWallet && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Connected Wallet:</span> {userWallet.slice(0, 8)}...{userWallet.slice(-6)}
              </p>
            </div>
          )}
        </div>

        {/* What's Available to Sellers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              What&apos;s Available to Approved Sellers
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Once approved, you&apos;ll have access to a comprehensive seller dashboard with these features:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sellerFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Icon name={feature.icon} size="sm" className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Ready to Start Selling?
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Join our marketplace and start earning with crypto-native payments, instant settlements, and powerful affiliate features.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Icon name="check" size="sm" className="text-green-500 mr-2" />
                  <span>USDC Payments</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Icon name="check" size="sm" className="text-green-500 mr-2" />
                  <span>Instant Settlement</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Icon name="check" size="sm" className="text-green-500 mr-2" />
                  <span>Affiliate Network</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Icon name="check" size="sm" className="text-green-500 mr-2" />
                  <span>No Monthly Fees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support moved inside the card */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Have questions about selling on our platform?{' '}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}