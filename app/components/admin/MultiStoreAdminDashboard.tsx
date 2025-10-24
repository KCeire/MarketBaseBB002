"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { AdminSession, StoreOrderSummary, StoreConfig } from '@/types/admin';
import { SuperAdminSettings } from './SuperAdminSettings';
import { StoreSelector } from './StoreSelector';
import { ShopifyIntegration } from './seller/ShopifyIntegration';
import { ManualProductManagement } from './seller/ManualProductManagement';

interface DecryptedOrderForClient {
  id: string;
  order_reference: string;
  customer_wallet: string;
  customerData: {
    email: string;
    shippingAddress: {
      name: string;
    };
  };
  order_items: Array<{
    productId: number;
    variantId: number;
    title: string;
    variant: string;
    price: string;
    quantity: number;
    image: string;
    sku: string;
  }>;
  total_amount: number;
  currency: string;
  payment_status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  payment_hash?: string | null;
  order_status?: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  transaction_hash?: string;
  payment_completed_at?: string;
  tracking_number?: string;
  tracking_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  store_id?: string | null;
}

interface MultiStoreAdminDashboardProps {
  session: AdminSession;
}

function MultiStoreAdminDashboardInner({ session }: MultiStoreAdminDashboardProps) {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [storeData] = useState<StoreOrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(session.storeId || null);
  const [availableStores, setAvailableStores] = useState<StoreConfig[]>([]);

  const storeId = selectedStoreId || session.storeId || searchParams.get('store');

  // Handle store selection changes
  const handleStoreChange = useCallback((newStoreId: string | null) => {
    setSelectedStoreId(newStoreId);

    // Update URL to reflect store selection
    if (newStoreId && newStoreId !== 'all' && newStoreId !== 'unassigned') {
      // Navigate to specific store admin page
      router.push(`/admin/${newStoreId}`);
    } else {
      // Navigate to general admin page for "All Stores" or "Unassigned"
      if (newStoreId === 'unassigned') {
        router.push('/admin?view=unassigned');
      } else {
        router.push('/admin');
      }
    }
  }, [router]);

  // Function to get the header title based on current store selection
  const getHeaderTitle = () => {
    if (!selectedStoreId || selectedStoreId === 'all') {
      if (session.isSuperAdmin) {
        return 'MarketBase Admin';
      } else {
        return 'All My Stores';
      }
    }

    if (selectedStoreId === 'unassigned') {
      return 'Unassigned Orders';
    }

    // Find the store name from the available stores
    const store = availableStores.find(s => s.id === selectedStoreId);
    return store ? `${store.name} Admin` : 'Store Admin';
  };

  // Load available stores for header title
  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await fetch('/api/admin/stores/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: session.walletAddress })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.stores) {
            setAvailableStores(data.stores);
          }
        }
      } catch (error) {
        console.error('Error loading stores for header:', error);
      }
    };

    loadStores();
  }, [session.walletAddress]);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!storeId || storeId === 'all') {
        setLoading(false);
        return;
      }

      try {
        // This will be implemented when we create the store-specific API endpoints
        setLoading(false);
      } catch (error) {
        console.error('Error fetching store data:', error);
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-2">
                {session.isSuperAdmin && (
                  <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs font-medium rounded-full">
                    Super Admin
                  </span>
                )}
                {session.storeName && !session.isSuperAdmin && (
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs font-medium rounded-full">
                    Store Admin
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <StoreSelector
                  session={session}
                  selectedStoreId={selectedStoreId}
                  onStoreChange={handleStoreChange}
                  showUnassigned={session.isSuperAdmin}
                />
                <div className="text-xs text-gray-400">
                  {address?.slice(0, 4)}...{address?.slice(-2)}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                {getHeaderTitle()}
              </h1>
              {session.storeName && !session.isSuperAdmin && (
                <span className="px-3 py-1 bg-blue-900/30 text-blue-300 text-sm font-medium rounded-full">
                  Store Admin
                </span>
              )}
              {session.isSuperAdmin && (
                <span className="px-3 py-1 bg-purple-900/30 text-purple-300 text-sm font-medium rounded-full">
                  Super Admin
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Store Selector for All Admins */}
              <StoreSelector
                session={session}
                selectedStoreId={selectedStoreId}
                onStoreChange={handleStoreChange}
                showUnassigned={session.isSuperAdmin}
              />
              <div className="text-sm text-gray-400">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 sm:space-x-8 -mb-px min-w-max px-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                }`}
              >
                <Icon name="chart-bar" size="sm" className="inline mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Overview</span>
              </button>

              {session.permissions.canViewOrders && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'orders'
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <Icon name="shopping-bag" size="sm" className="inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Orders</span>
                  <span className="sm:hidden">Orders</span>
                </button>
              )}

              {session.permissions.canViewProducts && (
                <button
                  onClick={() => setActiveTab('products')}
                  className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <Icon name="package" size="sm" className="inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Products</span>
                  <span className="sm:hidden">Products</span>
                </button>
              )}

              {session.permissions.canViewAnalytics && (
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'analytics'
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <Icon name="chart-line" size="sm" className="inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Analytics</span>
                </button>
              )}

              {/* New Seller-Specific Tabs */}
              {session.isStoreAdmin && !session.isSuperAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('shopify')}
                    className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'shopify'
                        ? 'border-blue-400 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    }`}
                  >
                    <Icon name="store" size="sm" className="inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Shopify Integration</span>
                    <span className="sm:hidden">Shopify</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('manual-products')}
                    className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'manual-products'
                        ? 'border-blue-400 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    }`}
                  >
                    <Icon name="plus" size="sm" className="inline mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Product Management</span>
                    <span className="sm:hidden">Products</span>
                  </button>
                </>
              )}

              {session.permissions.canManageSettings && (
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <Icon name="settings" size="sm" className="inline mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                  <span className="sm:hidden">Settings</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab session={session} storeData={storeData} />
        )}

        {activeTab === 'orders' && session.permissions.canViewOrders && (
          <OrdersTab session={session} selectedStoreId={selectedStoreId} />
        )}

        {activeTab === 'products' && session.permissions.canViewProducts && (
          <ProductsTab session={session} />
        )}

        {activeTab === 'analytics' && session.permissions.canViewAnalytics && (
          <AnalyticsTab session={session} />
        )}

        {activeTab === 'shopify' && session.isStoreAdmin && session.storeId && (
          <ShopifyIntegration storeId={session.storeId} />
        )}

        {activeTab === 'manual-products' && session.isStoreAdmin && session.storeId && (
          <ManualProductManagement storeId={session.storeId} />
        )}

        {activeTab === 'settings' && session.permissions.canManageSettings && (
          <SettingsTab session={session} />
        )}
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ session, storeData }: { session: AdminSession; storeData: StoreOrderSummary | null }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon name="shopping-bag" size="md" className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Orders</p>
              <p className="text-2xl font-bold text-white">
                {storeData?.totalOrders || '---'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Icon name="dollar-sign" size="md" className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${storeData?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Icon name="clock" size="md" className="text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Pending Orders</p>
              <p className="text-2xl font-bold text-white">
                {storeData?.pendingOrders || '---'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Icon name="package" size="md" className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Active Products</p>
              <p className="text-2xl font-bold text-white">---</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Store Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-300">Store Name</p>
            <p className="text-white">{session.storeName || 'All Stores'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Store ID</p>
            <p className="text-white font-mono text-sm">{session.storeId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Admin Type</p>
            <p className="text-white">
              {session.isSuperAdmin ? 'Super Admin' : 'Store Admin'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Wallet Address</p>
            <p className="text-white font-mono text-sm">{session.walletAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine the correct storeId filter
function getStoreIdFilter(selectedStore: string | null | undefined, sessionStore: string | null | undefined): string | undefined {
  // If a specific store is selected, use it
  if (selectedStore && selectedStore !== 'all' && selectedStore !== 'null') {
    return selectedStore;
  }

  // If viewing "All Stores" (selectedStore is null, 'all', etc.), don't filter by store
  if (!selectedStore || selectedStore === 'all') {
    return undefined; // This will show all accessible orders for the user
  }

  // Fallback to session store only if no selectedStore specified
  return sessionStore || undefined;
}

function OrdersTab({ session, selectedStoreId }: { session: AdminSession; selectedStoreId?: string | null }) {
  const [orders, setOrders] = useState<DecryptedOrderForClient[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    orderStatus: '',
    search: '',
    storeId: getStoreIdFilter(selectedStoreId, session.storeId)
  });

  // Update filters when selectedStoreId changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      storeId: getStoreIdFilter(selectedStoreId, session.storeId)
    }));
  }, [selectedStoreId, session.storeId]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminWallet: session.walletAddress,
          filters: filters,
          limit: 50,
          offset: 0
        })
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to load orders:', data.error);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  }, [session, filters]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length && orders.length > 0) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const handleExportOrders = async () => {
    if (selectedOrders.length === 0) {
      return;
    }

    setExporting(true);
    try {
      const response = await fetch('/api/admin/export/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminWallet: session.walletAddress,
          orderIds: selectedOrders,
          storeId: filters.storeId || undefined,
          markAsProcessing: false
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MarketBase_Orders_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Clear selection after successful export
        setSelectedOrders([]);
      } else {
        const errorData = await response.json();
        console.error('Export failed:', errorData.error);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">
            Order History {session.storeName && `- ${session.storeName}`}
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadOrders}
            icon={<Icon name="arrow-path" size="sm" />}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Payment Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-white bg-gray-700"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Order Status
            </label>
            <select
              value={filters.orderStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, orderStatus: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-white bg-gray-700"
            >
              <option value="">All Orders</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Search Orders
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by order reference, customer name, or email..."
              className="w-full px-3 py-2 border border-gray-600 rounded-md text-white bg-gray-700"
            />
          </div>
        </div>

        {/* Export Section */}
        {orders.length > 0 && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-200">
                    Select All ({orders.length})
                  </span>
                </label>
                <div className="text-sm text-gray-300">
                  {selectedOrders.length} selected for export
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleExportOrders}
                disabled={selectedOrders.length === 0 || exporting}
                loading={exporting}
                icon={<Icon name="arrow-down-tray" size="sm" />}
              >
                Export to Excel (.xlsx)
              </Button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-200 uppercase bg-gray-700">
                <tr>
                  <th className="px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3">Order Reference</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Payment Status</th>
                  <th className="px-6 py-3">Order Status</th>
                  <th className="px-6 py-3">Store</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isUnassigned = !order.store_id;
                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-600 hover:bg-gray-700 ${
                        isUnassigned
                          ? 'bg-orange-900/20 border-orange-800'
                          : 'bg-gray-800'
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleOrderSelection(order.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center space-x-2">
                          <span>{order.order_reference}</span>
                          {isUnassigned && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                              <Icon name="exclamation-triangle" size="sm" className="mr-1" />
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">
                            {order.customerData?.shippingAddress?.name || 'N/A'}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {order.customerData?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">
                        ${order.total_amount?.toFixed(2) || '0.00'} {order.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status || 'confirmed')}`}>
                          {order.order_status || 'confirmed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {order.store_id || (
                          <span className="text-orange-600 font-medium">unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon name="shopping-bag" size="lg" className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No orders found</h3>
            <p className="text-gray-500">
              {filters.search || filters.status || filters.orderStatus
                ? 'No orders match your current filters.'
                : 'No orders have been placed yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsTab({ session }: { session: AdminSession }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        {session.storeName ? `${session.storeName} Products` : 'All Products'}
      </h3>
      <p className="text-gray-300">Product management interface will be implemented here.</p>
      {/* This will be implemented in the next step */}
    </div>
  );
}

function AnalyticsTab({ session }: { session: AdminSession }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        {session.storeName ? `${session.storeName} Analytics` : 'All Analytics'}
      </h3>
      <p className="text-gray-300">Analytics dashboard will be implemented here.</p>
    </div>
  );
}

function SettingsTab({ session }: { session: AdminSession }) {
  return <SuperAdminSettings session={session} />;
}

// Main export with Suspense boundary
export function MultiStoreAdminDashboard({ session }: MultiStoreAdminDashboardProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    }>
      <MultiStoreAdminDashboardInner session={session} />
    </Suspense>
  );
}