"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { toast } from '../../ui/Toast';

interface StoreConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  adminWallets: string[];
  settings: {
    allowOrderManagement: boolean;
    allowProductManagement: boolean;
    allowAnalytics: boolean;
  };
}

interface StoreManagementProps {
  className?: string;
}

export function StoreManagement({ className = "" }: StoreManagementProps) {
  const { address } = useAccount();
  const [stores, setStores] = useState<StoreConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchStores();
  }, [address]);

  const fetchStores = async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/stores/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });

      const result = await response.json();

      if (result.success) {
        setStores(result.stores);
      } else {
        console.error('Failed to fetch stores:', result.error);
        toast.error('Fetch Failed', result.error || 'Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Fetch Failed', 'An error occurred while fetching stores');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const generateStoreId = (name: string): string => {
    return generateSlug(name);
  };

  const handleCreateStore = async () => {
    if (!newStore.name.trim()) {
      toast.error('Missing Information', 'Please enter a store name');
      return;
    }

    if (!address) {
      toast.error('Authentication Error', 'Please connect your wallet to create a store');
      return;
    }

    try {
      const storeId = generateStoreId(newStore.name);
      const slug = generateSlug(newStore.name);

      // Wallet address will be configured via environment variables

      const response = await fetch('/api/admin/stores/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStore.name.trim(),
          description: newStore.description.trim(),
          storeId,
          slug,
          walletAddress: address
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Store Created!', 'Store created successfully. Update environment variables to activate.');
        setNewStore({ name: '', description: '' });
        setShowCreateForm(false);
        fetchStores();
      } else {
        toast.error('Creation Failed', result.error || 'Failed to create store');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error('Creation Failed', 'An error occurred while creating the store');
    }
  };

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Status Updated', `Store ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchStores();
      } else {
        toast.error('Update Failed', result.error || 'Failed to update store status');
      }
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Update Failed', 'An error occurred while updating store status');
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white dark:text-gray-100">Store Management</h3>
          <p className="text-sm text-gray-300 dark:text-gray-400">Create and manage seller stores</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center space-x-2"
        >
          <Icon name={showCreateForm ? "x" : "plus"} size="sm" />
          <span>{showCreateForm ? 'Cancel' : 'Create Store'}</span>
        </Button>
      </div>

      {/* Create Store Form */}
      {showCreateForm && (
        <div className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <h4 className="text-md font-medium text-white dark:text-gray-100">Create New Store</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                placeholder="e.g., Awesome Electronics"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              {newStore.name && (
                <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                  Store ID: {generateStoreId(newStore.name)}
                </p>
              )}
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={newStore.description}
              onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
              placeholder="Brief description of the store"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Environment Variable Instructions */}
          {newStore.name && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Environment Variable Setup
              </h5>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                After creating the store, add this environment variable to Vercel with the seller's wallet address:
              </p>
              <code className="block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 p-2 rounded text-xs font-mono">
                STORE_ADMIN_WALLETS_{generateStoreId(newStore.name).toUpperCase().replace(/-/g, '_')}=0x...sellerWalletAddress
              </code>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateStore}
              disabled={!newStore.name.trim()}
            >
              Create Store
            </Button>
          </div>
        </div>
      )}

      {/* Existing Stores */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-white dark:text-gray-100">Existing Stores</h4>

        {stores.length === 0 ? (
          <div className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-lg p-8 text-center">
            <p className="text-gray-300 dark:text-gray-400">No stores created yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-2">
              Create your first store to get started with seller management.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-white dark:text-gray-100">{store.name}</h5>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      store.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {store.isActive ? 'Beta' : 'Offline'}
                  </span>
                </div>

                <p className="text-sm text-gray-300 dark:text-gray-400">{store.description}</p>

                <div className="text-xs text-gray-400 dark:text-gray-400">
                  <p>ID: {store.id}</p>
                  <p>Admin Wallets: {store.adminWallets.length}</p>
                  <div
                    className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    onClick={() => {
                      const envVarName = `STORE_ADMIN_WALLETS_${store.id.toUpperCase().replace(/-/g, '_')}`;
                      navigator.clipboard.writeText(envVarName);
                      toast.success('Copied!', `Environment variable name copied to clipboard`);
                    }}
                    title="Click to copy environment variable name"
                  >
                    <p className="text-blue-800 dark:text-blue-300 font-mono text-xs flex items-center">
                      <Icon name="copy" size="sm" className="mr-1" />
                      ENV: STORE_ADMIN_WALLETS_{store.id.toUpperCase().replace(/-/g, '_')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleStoreStatus(store.id, store.isActive)}
                  >
                    {store.isActive ? 'Deactivate' : 'Activate'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/admin/${store.id}`, '_blank')}
                  >
                    <Icon name="external-link" size="sm" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}