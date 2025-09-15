// app/admin/page.tsx
"use client";

import { AdminAuth } from '../components/admin/AdminAuth';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add wallet connection header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Base Shop Admin</h1>
          <Wallet className="z-10">
            <ConnectWallet>
              <Name className="text-inherit" />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>
      
      <AdminAuth>
        <AdminDashboard />
      </AdminAuth>
    </div>
  );
}
