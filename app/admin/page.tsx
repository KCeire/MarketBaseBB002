// app/admin/page.tsx
"use client";

import { AdminAuth } from '../components/admin/AdminAuth';
import { AdminDashboard } from '../components/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <AdminAuth>
      <AdminDashboard />
    </AdminAuth>
  );
}
