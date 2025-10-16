// app/components/admin/SuperAdminSettings.tsx
"use client";

import { useState, useEffect } from 'react';
import { AdminSession, StoreConfig } from '@/types/admin';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { getAllActiveStores, SUPER_ADMIN_WALLETS } from '@/lib/admin/stores-config';
import { StoreManagement } from './super/StoreManagement';

interface SuperAdminSettingsProps {
  session: AdminSession;
}

interface EnvironmentVariableInfo {
  name: string;
  description: string;
  example: string;
  currentValue?: string;
  isSet: boolean;
}

export function SuperAdminSettings({ session }: SuperAdminSettingsProps) {
  const [stores, setStores] = useState<StoreConfig[]>([]);
  const [activeTab, setActiveTab] = useState<'settings' | 'stores'>('settings');

  useEffect(() => {
    loadStoreConfigs();
  }, []);

  const loadStoreConfigs = async () => {
    try {
      const activeStores = getAllActiveStores();
      setStores(activeStores);
    } catch (error) {
      console.error('Failed to load store configs:', error);
    }
  };

  if (!session.isSuperAdmin) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <div className="text-center">
          <Icon name="shield-exclamation" size="lg" className="mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Access Denied</h3>
          <p className="text-gray-400">
            Super admin privileges are required to access this section.
          </p>
        </div>
      </div>
    );
  }

  const environmentVariables: EnvironmentVariableInfo[] = [
    {
      name: 'ADMIN_WALLET_ADDRESSES',
      description: 'Comma-separated list of wallet addresses with super admin access (existing variable)',
      example: '0x1234...abcd,0x5678...efgh',
      currentValue: SUPER_ADMIN_WALLETS.length > 0 ? `${SUPER_ADMIN_WALLETS.length} addresses configured` : undefined,
      isSet: SUPER_ADMIN_WALLETS.length > 0
    },
    ...stores.map(store => ({
      name: `STORE_ADMIN_WALLETS_${store.id.toUpperCase().replace(/-/g, '_')}`,
      description: `Wallet addresses for ${store.name} store admins`,
      example: '0x1234...abcd,0x5678...efgh',
      currentValue: store.adminWallets.length > 0 ? `${store.adminWallets.length} addresses configured` : undefined,
      isSet: store.adminWallets.length > 0
    }))
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'settings', name: 'Admin Settings', icon: 'settings' },
    { id: 'stores', name: 'Store Management', icon: 'store' }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Icon
                  name={tab.icon}
                  size="sm"
                  className={`mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-400'}`}
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Super Admin Settings</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex">
            <Icon name="information-circle" size="sm" className="text-blue-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Security Notice</h4>
              <p className="text-sm text-blue-700 mt-1">
                All wallet address configurations must be set as environment variables in your deployment platform (Vercel, etc.) for security.
                Changes to wallet access require redeployment to take effect.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-white mb-3">Current Super Admins</h4>
            <div className="space-y-2">
              {SUPER_ADMIN_WALLETS.length > 0 ? (
                SUPER_ADMIN_WALLETS.map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span className="font-mono text-sm text-gray-200">
                      {wallet.slice(0, 8)}...{wallet.slice(-6)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(wallet)}
                      icon={<Icon name="clipboard" size="sm" />}
                    >
                      Copy
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No super admin wallets configured</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-white mb-3">Store Admin Overview</h4>
            <div className="space-y-3">
              {stores.map(store => (
                <div key={store.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{store.name}</p>
                      <p className="text-sm text-gray-400">{store.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {store.adminWallets.length} admin{store.adminWallets.length !== 1 ? 's' : ''}
                      </p>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        store.adminWallets.length > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {store.adminWallets.length > 0 ? 'Configured' : 'Needs Setup'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Environment Variables Configuration</h3>
        <p className="text-gray-300 mb-6">
          Copy these environment variable names and configure them in your deployment platform with appropriate wallet addresses.
        </p>

        <div className="space-y-4">
          {environmentVariables.map((envVar, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <code className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded font-mono">
                      {envVar.name}
                    </code>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      envVar.isSet
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {envVar.isSet ? 'Set' : 'Not Set'}
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{envVar.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Example format:</p>
                    <code className="block text-xs text-gray-300 bg-gray-50 p-2 rounded">
                      {envVar.example}
                    </code>
                  </div>
                  {envVar.currentValue && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400">Current:</p>
                      <p className="text-sm text-gray-200">{envVar.currentValue}</p>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(envVar.name)}
                  icon={<Icon name="clipboard" size="sm" />}
                >
                  Copy Name
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <Icon name="exclamation-triangle" size="sm" className="text-yellow-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-yellow-900">Deployment Required</h4>
              <p className="text-sm text-yellow-700 mt-1">
                After configuring environment variables, redeploy your application for changes to take effect.
                Always validate wallet addresses before deployment to prevent lockouts.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security Best Practices</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Icon name="check-circle" size="sm" className="text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Use Hardware Wallets</p>
              <p className="text-sm text-gray-300">Always use hardware wallets for admin addresses to prevent unauthorized access.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Icon name="check-circle" size="sm" className="text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Validate Addresses</p>
              <p className="text-sm text-gray-300">Double-check all wallet addresses before deployment to prevent lockouts.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Icon name="check-circle" size="sm" className="text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Multiple Super Admins</p>
              <p className="text-sm text-gray-300">Configure multiple super admin wallets to prevent single points of failure.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Icon name="check-circle" size="sm" className="text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Regular Audits</p>
              <p className="text-sm text-gray-300">Regularly review and audit admin access permissions and wallet configurations.</p>
            </div>
          </div>
        </div>
      </div>
            </div>
          )}

          {activeTab === 'stores' && (
            <StoreManagement />
          )}
        </div>
      </div>
    </div>
  );
}