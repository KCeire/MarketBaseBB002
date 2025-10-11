// app/components/admin/StoreSelector.tsx
"use client";

import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { AdminSession } from '@/types/admin';
import { getAllActiveStores } from '@/lib/admin/stores-config';

interface StoreSelectorProps {
  session: AdminSession;
  selectedStoreId: string | null;
  onStoreChange: (storeId: string | null) => void;
  showUnassigned?: boolean;
}

export function StoreSelector({
  session,
  selectedStoreId,
  onStoreChange,
  showUnassigned = false
}: StoreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get available stores
  const allStores = getAllActiveStores();

  // If not super admin, only show stores they have access to
  const availableStores = session.isSuperAdmin
    ? allStores
    : allStores.filter(store =>
        store.adminWallets.some(wallet =>
          wallet.toLowerCase() === session.walletAddress.toLowerCase()
        )
      );

  const getSelectedStoreDisplay = () => {
    if (!selectedStoreId) {
      return session.isSuperAdmin ? 'All Stores' : 'All Your Stores';
    }
    if (selectedStoreId === 'unassigned') {
      return 'Unassigned Orders';
    }
    const store = allStores.find(s => s.id === selectedStoreId);
    return store ? store.name : 'Unknown Store';
  };

  const getStoreIcon = (storeId: string | null) => {
    if (!storeId) return 'building-storefront';
    if (storeId === 'unassigned') return 'exclamation-triangle';
    return 'building-storefront';
  };

  const getStoreCount = () => {
    // This could be enhanced to show actual order counts
    // For now, just show placeholder
    return '';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <Icon name={getStoreIcon(selectedStoreId)} size="sm" className="text-gray-500" />
        <span className="text-sm font-medium text-gray-900">
          {getSelectedStoreDisplay()}
        </span>
        <Icon
          name="chevron-down"
          size="sm"
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
            <div className="py-1">
              {/* All Stores Option (Super Admin Only) */}
              {session.isSuperAdmin && (
                <button
                  onClick={() => {
                    onStoreChange(null);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                    !selectedStoreId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="building-storefront" size="sm" />
                    <span>All Stores</span>
                  </div>
                  {getStoreCount() && (
                    <span className="text-xs text-gray-500">{getStoreCount()}</span>
                  )}
                </button>
              )}

              {/* Unassigned Orders (Super Admin Only) */}
              {session.isSuperAdmin && showUnassigned && (
                <button
                  onClick={() => {
                    onStoreChange('unassigned');
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                    selectedStoreId === 'unassigned' ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="exclamation-triangle" size="sm" className="text-orange-500" />
                    <span>Unassigned Orders</span>
                  </div>
                  {getStoreCount() && (
                    <span className="text-xs text-gray-500">{getStoreCount()}</span>
                  )}
                </button>
              )}

              {/* Separator if super admin options exist */}
              {session.isSuperAdmin && (
                <div className="border-t border-gray-200 my-1" />
              )}

              {/* Individual Stores */}
              {availableStores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => {
                    onStoreChange(store.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${
                    selectedStoreId === store.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="building-storefront" size="sm" />
                    <div>
                      <div className="font-medium">{store.name}</div>
                      <div className="text-xs text-gray-500">{store.description}</div>
                    </div>
                  </div>
                  {getStoreCount() && (
                    <span className="text-xs text-gray-500">{getStoreCount()}</span>
                  )}
                </button>
              ))}

              {availableStores.length === 0 && !session.isSuperAdmin && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No stores assigned
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}