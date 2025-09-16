// app/management-hub/page.tsx
import { AdminAuth } from '../components/admin/AdminAuth';
import { AdminDashboard } from '../components/admin/AdminDashboard';

export default function ManagementHubPage() {
  return (
    <AdminAuth>
      <AdminDashboard />
    </AdminAuth>
  );
}