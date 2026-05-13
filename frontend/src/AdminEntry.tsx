import React from 'react';
import { AdminDashboard } from '@/components/modules/AdminDashboard';
import { AdminLayout } from '@/components/AdminLayout';

export default function AdminEntry() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}