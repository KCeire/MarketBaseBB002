// app/orders/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Icon } from '../components/ui/Icon';
// Local utility functions for client-side use
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatWalletAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'bg-green-900/30 text-green-300 border border-green-600';
    case 'shipped':
      return 'bg-blue-900/30 text-blue-300 border border-blue-600';
    case 'processing':
      return 'bg-yellow-900/30 text-yellow-300 border border-yellow-600';
    case 'confirmed':
      return 'bg-green-900/30 text-green-300 border border-green-600';
    case 'pending':
      return 'bg-gray-700/50 text-gray-300 border border-gray-600';
    case 'failed':
      return 'bg-red-900/30 text-red-300 border border-red-600';
    case 'refunded':
      return 'bg-purple-900/30 text-purple-300 border border-purple-600';
    default:
      return 'bg-gray-700/50 text-gray-300 border border-gray-600';
  }
};

interface OrderItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  quantity: number;
  image: string;
  sku?: string; // Made optional to handle undefined values
}

interface UserOrder {
  id: string;
  order_reference: string;
  customer_wallet: string;
  farcaster_fid?: string | null;
  farcaster_username?: string | null;
  customerData: {
    email: string;
    shippingAddress: {
      name: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
      phone?: string;
    };
  };
  order_items: OrderItem[];
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
}

type FilterType = 'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';

export default function OrdersPage() {
  const { address } = useAccount();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        wallet: address,
        limit: '100',
        offset: '0'
      });

      if (filter !== 'all') {
        if (['pending', 'confirmed', 'failed', 'refunded'].includes(filter)) {
          params.append('paymentStatus', filter);
        } else {
          params.append('orderStatus', filter);
        }
      }

      const response = await fetch(`/api/orders/user?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error while fetching orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [address, filter]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time polling every 45 seconds
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      fetchOrders();
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [address, fetchOrders]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (['pending', 'confirmed', 'failed', 'refunded'].includes(filter)) {
      return order.payment_status === filter;
    }
    return order.order_status === filter;
  });

  const getStatusBadge = (order: UserOrder) => {
    const status = order.order_status || order.payment_status;
    const colors = getStatusColor(status);

    let icon = '';
    switch (status) {
      case 'delivered':
        icon = '✅';
        break;
      case 'shipped':
        icon = '🚚';
        break;
      case 'processing':
        icon = '⏳';
        break;
      case 'confirmed':
        icon = '✓';
        break;
      case 'pending':
        icon = '⏳';
        break;
      case 'failed':
        icon = '❌';
        break;
      case 'refunded':
        icon = '↩️';
        break;
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors}`}>
        {icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const totalSpent = orders
    .filter(order => order.payment_status === 'confirmed')
    .reduce((sum, order) => sum + order.total_amount, 0);

  if (!address) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
              <Icon name="user" size="lg" className="text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-100">Connect Wallet</h3>
              <p className="text-sm text-gray-400">
                Please connect your wallet to view your order history.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-3 main-content-with-bottom-nav bg-gray-900 min-h-screen">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">My Orders</h1>
            <p className="text-sm text-gray-400">Track your purchases and order history</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-600 disabled:opacity-50"
          >
            <Icon name="refresh" size="sm" className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-gray-100">{orders.length}</p>
            <p className="text-xs text-gray-400">Total Orders</p>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 text-center">
            <p className="text-2xl font-bold text-gray-100">${totalSpent.toFixed(2)}</p>
            <p className="text-xs text-gray-400">Total Spent</p>
          </div>
        </div>

        {/* Order Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'confirmed', label: 'Confirmed' },
              { key: 'processing', label: 'Processing' },
              { key: 'shipped', label: 'Shipped' },
              { key: 'delivered', label: 'Delivered' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as FilterType)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-400">Loading your orders...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Icon name="alert" size="sm" className="text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-300">Error Loading Orders</p>
                <p className="text-xs text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-100">#{order.order_reference}</h3>
                    <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order)}
                    <p className="text-sm font-bold text-gray-100 mt-1">
                      ${order.total_amount.toFixed(2)} {order.currency}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-3">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-700/50 rounded-lg p-2">
                      <div className="flex-1">
                        <a
                          href={item.sku && (item.sku.startsWith('NFT-') || item.sku.startsWith('685'))
                            ? `/nft-energy/product/${item.sku}`
                            : `/product/${item.productId}`}
                          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {item.title}
                        </a>
                        <p className="text-xs text-gray-400">{item.variant}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-100">x{item.quantity}</p>
                        <p className="text-xs text-gray-400">${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Info */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-400">Ship to:</p>
                      <p className="text-gray-200">{order.customerData.shippingAddress.name}</p>
                      <p className="text-gray-300">
                        {order.customerData.shippingAddress.address1}
                        {order.customerData.shippingAddress.address2 && `, ${order.customerData.shippingAddress.address2}`}
                      </p>
                      <p className="text-gray-300">
                        {order.customerData.shippingAddress.city}, {order.customerData.shippingAddress.state} {order.customerData.shippingAddress.zipCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Account:</p>
                      <p className="text-gray-200">{formatWalletAddress(order.customer_wallet)}</p>
                      {order.farcaster_username ? (
                        <>
                          <p className="text-blue-400">@{order.farcaster_username}</p>
                          <p className="text-gray-400">FID: {order.farcaster_fid}</p>
                        </>
                      ) : (
                        <p className="text-gray-500">No FID available</p>
                      )}
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {order.tracking_number && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400">Tracking:</p>
                      {order.tracking_url ? (
                        <a
                          href={order.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          {order.tracking_number} →
                        </a>
                      ) : (
                        <p className="text-sm text-gray-200">{order.tracking_number}</p>
                      )}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                <Icon name="package" size="lg" className="text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-100">
                  {filter === 'all' ? 'No Orders Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`}
                </h3>
                <p className="text-sm text-gray-400">
                  {filter === 'all'
                    ? "You haven't placed any orders yet. Start shopping to see your order history here."
                    : `No orders found with ${filter} status. Try a different filter.`
                  }
                </p>
              </div>
              {filter === 'all' && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  Start Shopping
                </button>
              )}
            </div>
          </div>
        )}

        {/* What to Expect Section */}
        <div className="bg-blue-900/20 rounded-xl border border-blue-700 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-100">What to Expect</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-100">Instant Payment Confirmation</p>
                <p className="text-xs text-gray-400">USDC payments are confirmed immediately on Base</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-100">Order Processing</p>
                <p className="text-xs text-gray-400">Most orders are processed within 1-2 business days</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-100">Shipping Tracking</p>
                <p className="text-xs text-gray-400">Get real-time tracking updates for all orders</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-100">Order History</p>
                <p className="text-xs text-gray-400">Full transaction history stored securely on-chain</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-refresh Notice */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
              <Icon name="refresh" size="sm" className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">Auto-refresh enabled</p>
              <p className="text-xs text-gray-400">
                Orders update automatically every 45 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}