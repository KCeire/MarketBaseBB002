// app/components/admin/AdminDashboard.tsx - Updated with Toast notifications
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { toast } from '../ui/Toast';

// Client-side interfaces (no encryption utilities needed)
interface CustomerData {
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
}

interface OrderItem {
  productId: number;
  variantId: number;
  title: string;
  variant: string;
  price: string;
  quantity: number;
  image: string;
  sku: string;
}

interface DecryptedOrder {
  id: string;
  order_reference: string;
  customer_wallet: string;
  customerData: CustomerData;
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

interface OrderFilters {
  status?: 'pending' | 'confirmed' | 'failed' | 'refunded' | '';
  orderStatus?: 'confirmed' | 'processing' | 'shipped' | 'delivered' | '';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Utility functions (client-side only)
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatWalletAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'delivered':
      return 'text-green-600 bg-green-100';
    case 'processing':
    case 'shipped':
      return 'text-blue-600 bg-blue-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
    case 'refunded':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

interface AdminDashboardProps {
  initialOrders?: DecryptedOrder[];
}

export function AdminDashboard({ initialOrders = [] }: AdminDashboardProps) {
  const { address } = useAccount();
  const [orders, setOrders] = useState<DecryptedOrder[]>(initialOrders);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    status: '',
    orderStatus: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const fetchOrders = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminWallet: address,
          filters,
          limit: 1000
        }),
      });

      const data = await response.json();
      
        if (data.success) {
        setOrders(data.orders || []);
        toast.success('Orders Loaded', `Found ${data.orders?.length || 0} orders`);
        } else {
        console.error('Failed to fetch orders:', data.error);
        toast.error('Load Failed', data.error || 'Unable to fetch orders');
        }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Network Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, [address, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    const newSelection = new Set(selectedOrders);
    if (checked) {
      newSelection.add(orderId);
    } else {
      newSelection.delete(orderId);
    }
    setSelectedOrders(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const confirmedOrderIds = orders
        .filter(order => order.payment_status === 'confirmed')
        .map(order => order.id);
      setSelectedOrders(new Set(confirmedOrderIds));
      toast.info('Selection Updated', `Selected ${confirmedOrderIds.length} confirmed orders`);
    } else {
      setSelectedOrders(new Set());
      toast.info('Selection Cleared', 'All orders deselected');
    }
  };

  const handleExportToCJ = async () => {
    if (selectedOrders.size === 0) {
    toast.warning('No Orders Selected', 'Please select orders to export');
    return;
    }

    setExporting(true);
    try {
      const response = await fetch('/api/admin/export/cj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminWallet: address,
          orderIds: Array.from(selectedOrders),
          markAsProcessing: true
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BaseShop_CJ_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        await fetchOrders();
        setSelectedOrders(new Set());
        
        toast.exportSuccess(a.download);
        toast.orderUpdated(`${selectedOrders.size} orders marked as processing`);
      } else {
        const errorData = await response.json();
        toast.error('Export Failed', errorData.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export Error', 'Failed to export orders');
    } finally {
      setExporting(false);
    }
  };

  const confirmedOrders = orders.filter(order => order.payment_status === 'confirmed');
  const selectedConfirmedCount = Array.from(selectedOrders)
    .filter(orderId => confirmedOrders.some(order => order.id === orderId))
    .length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Base Shop Admin</h1>
              <p className="text-gray-600">Order Management & CJ Export (Secure)</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Admin: {formatWalletAddress(address || '')}
              </div>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                icon={<Icon name="arrow-left" size="sm" />}
              >
                Back to Store
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
              <div className="text-sm text-blue-600">Total Orders</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.payment_status === 'confirmed').length}
              </div>
              <div className="text-sm text-green-600">Confirmed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.payment_status === 'pending').length}
              </div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.payment_status === 'failed').length}
              </div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.payment_status === 'refunded').length}
              </div>
              <div className="text-sm text-orange-600">Refunded</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value as 'pending' | 'confirmed' | 'failed' | 'refunded' | '' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                value={filters.orderStatus || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  orderStatus: e.target.value as 'confirmed' | 'processing' | 'shipped' | 'delivered' | '' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Order ref, name, email..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="secondary"
              onClick={fetchOrders}
              loading={loading}
              icon={<Icon name="arrow-right" size="sm" />}
            >
              Apply Filters
            </Button>

            <Button
              variant="ghost"
              onClick={() => setFilters({
                status: '',
                orderStatus: '',
                dateFrom: '',
                dateTo: '',
                search: ''
              })}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Export Section */}
        {confirmedOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">CJ Dropshipping Export</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedConfirmedCount === confirmedOrders.length && confirmedOrders.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">
                    Select All Confirmed ({confirmedOrders.length})
                  </span>
                </label>
                <div className="text-sm text-gray-600">
                  {selectedOrders.size} selected for export
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleExportToCJ}
                disabled={selectedOrders.size === 0 || exporting}
                loading={exporting}
                icon={<Icon name="arrow-right" size="sm" />}
              >
                Export to CJ (.xlsx)
              </Button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Orders ({orders.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.payment_status === 'confirmed' && (
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_reference}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatWalletAddress(order.customer_wallet)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.customerData.shippingAddress.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customerData.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.customerData.shippingAddress.city}, {order.customerData.shippingAddress.state}
                        </div>
                      </td>
                    <td className="px-6 py-4">
                        <div className="space-y-1">
                            {order.order_items.map((item, idx) => (
                            <div key={idx} className="text-xs border-b border-gray-100 pb-1 last:border-b-0">
                                <div className="font-medium text-gray-900 truncate" title={item.title}>
                                {item.title.length > 30 ? item.title.substring(0, 30) + '...' : item.title}
                                </div>
                                <div className="text-gray-500">
                                SKU: {item.sku} • Qty: {item.quantity}
                                </div>
                                <a 
                                href={`/product/${item.productId}`} 
                                target="_blank"
                                className="text-blue-600 hover:underline"
                                >
                                View Product →
                                </a>
                            </div>
                            ))}
                        </div>
                     </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${order.total_amount} {order.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.order_status || 'confirmed')}`}>
                          {order.order_status || 'confirmed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
