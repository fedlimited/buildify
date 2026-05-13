import { AdminDashboard } from '@/components/modules/AdminDashboard';
import { AdminCompanies } from '@/components/modules/AdminCompanies';
import { AdminUsers } from '@/components/modules/AdminUsers';
import { AdminSubscriptions } from '@/components/modules/AdminSubscriptions';
import { AdminPayments } from '@/components/modules/AdminPayments';
import { AdminLayout } from '@/components/AdminLayout';

export const adminRouteObjects = [
  { path: '/admin', element: <AdminLayout><AdminDashboard /></AdminLayout> },
  { path: '/admin/companies', element: <AdminLayout><AdminCompanies /></AdminLayout> },
  { path: '/admin/users', element: <AdminLayout><AdminUsers /></AdminLayout> },
  { path: '/admin/subscriptions', element: <AdminLayout><AdminSubscriptions /></AdminLayout> },
  { path: '/admin/payments', element: <AdminLayout><AdminPayments /></AdminLayout> },
];