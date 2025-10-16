"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { toast } from '../../ui/Toast';

interface ShopifyCredentials {
  storeUrl: string;
  apiKey: string;
}

interface ShopifyIntegrationProps {
  storeId: string;
  className?: string;
}

interface IntegrationStatus {
  status: 'not_connected' | 'connected' | 'error' | 'syncing';
  lastSync?: string;
  productCount?: number;
  errorMessage?: string;
}

export function ShopifyIntegration({ storeId, className = "" }: ShopifyIntegrationProps) {
  const [credentials, setCredentials] = useState<ShopifyCredentials>({
    storeUrl: '',
    apiKey: ''
  });
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    status: 'not_connected'
  });
  const [loading, setLoading] = useState(false);
  const [showSetupForm, setShowSetupForm] = useState(false);

  const fetchIntegrationStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/shopify/status`);
      const data = await response.json();

      if (data.success) {
        setIntegrationStatus(data.status);
        if (data.credentials) {
          setCredentials({
            storeUrl: data.credentials.storeUrl || '',
            apiKey: '' // Never show the actual API key
          });
        }
      }
    } catch (error) {
      console.error('Error fetching integration status:', error);
    }
  }, [storeId]);

  useEffect(() => {
    fetchIntegrationStatus();
  }, [fetchIntegrationStatus]);

  const validateShopifyUrl = (url: string): boolean => {
    const shopifyPattern = /^[a-zA-Z0-9-]+\.myshopify\.com$/;
    return shopifyPattern.test(url);
  };

  const handleConnect = async () => {
    if (!credentials.storeUrl || !credentials.apiKey) {
      toast.error('Missing Information', 'Please fill in both store URL and API key');
      return;
    }

    if (!validateShopifyUrl(credentials.storeUrl)) {
      toast.error('Invalid Store URL', 'Please enter a valid Shopify store URL (e.g., mystore.myshopify.com)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/shopify/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Connected!', 'Shopify integration set up successfully');
        setShowSetupForm(false);
        fetchIntegrationStatus();
      } else {
        toast.error('Connection Failed', result.error || 'Failed to connect to Shopify');
      }
    } catch (error) {
      console.error('Error connecting to Shopify:', error);
      toast.error('Connection Failed', 'An error occurred while connecting to Shopify');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Shopify store? This will stop product syncing.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/shopify/disconnect`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Disconnected', 'Shopify integration has been disconnected');
        setIntegrationStatus({ status: 'not_connected' });
        setCredentials({ storeUrl: '', apiKey: '' });
      } else {
        toast.error('Disconnect Failed', result.error || 'Failed to disconnect from Shopify');
      }
    } catch (error) {
      console.error('Error disconnecting from Shopify:', error);
      toast.error('Disconnect Failed', 'An error occurred while disconnecting from Shopify');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'syncing':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'check';
      case 'syncing':
        return 'refresh';
      case 'error':
        return 'x';
      default:
        return 'x';
    }
  };

  const getStatusLabel = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'syncing':
        return 'Syncing';
      case 'error':
        return 'Error';
      default:
        return 'Not Connected';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Overview */}
      <div className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Shopify Integration</h3>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(integrationStatus.status)}`}>
            <Icon name={getStatusIcon(integrationStatus.status)} size="sm" />
            <span className="text-sm font-medium">{getStatusLabel(integrationStatus.status)}</span>
          </div>
        </div>

        {integrationStatus.status === 'not_connected' ? (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h16v12H4V6z"/>
                <path d="M6 8h12v2H6V8zm0 4h8v2H6v-2z"/>
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Connect Your Shopify Store
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sync your existing Shopify products automatically and keep inventory in sync
            </p>
            <Button onClick={() => setShowSetupForm(true)}>
              <Icon name="plus" size="sm" className="mr-2" />
              Connect Shopify Store
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected Store Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Store URL
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">{credentials.storeUrl}</p>
              </div>

              {integrationStatus.productCount !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Products Synced
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{integrationStatus.productCount}</p>
                </div>
              )}
            </div>

            {integrationStatus.lastSync && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Sync
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(integrationStatus.lastSync).toLocaleString()}
                </p>
              </div>
            )}

            {integrationStatus.errorMessage && (
              <div className="bg-red-900/20 dark:bg-red-900/20 border border-red-800 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <Icon name="x" size="sm" className="text-red-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200">Integration Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{integrationStatus.errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                disabled={loading || integrationStatus.status === 'syncing'}
              >
                {integrationStatus.status === 'syncing' ? (
                  <>
                    <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Icon name="refresh" size="sm" className="mr-2" />
                    Sync Now
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={handleDisconnect}
                disabled={loading}
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Setup Form Modal */}
      {showSetupForm && (
        <div className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">Connect Shopify Store</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSetupForm(false)}
            >
              <Icon name="x" size="sm" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shopify Store URL *
              </label>
              <input
                type="text"
                value={credentials.storeUrl}
                onChange={(e) => setCredentials({ ...credentials, storeUrl: e.target.value })}
                placeholder="yourstore.myshopify.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter your Shopify store URL without https://
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Private App API Key *
              </label>
              <input
                type="password"
                value={credentials.apiKey}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                placeholder="shppa_..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Create a private app in your Shopify admin to get this key
              </p>
            </div>

            <div className="bg-blue-900/20 dark:bg-blue-900/20 border border-blue-800 dark:border-blue-800 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                How to Get Your API Key
              </h5>
              <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Go to your Shopify admin panel</li>
                <li>Navigate to Apps → App and sales channel settings</li>
                <li>Click &quot;Develop apps&quot; → &quot;Create an app&quot;</li>
                <li>Configure API access with read permissions for products and inventory</li>
                <li>Copy the Admin API access token</li>
              </ol>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowSetupForm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={loading || !credentials.storeUrl || !credentials.apiKey}
              >
                {loading ? 'Connecting...' : 'Connect Store'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}