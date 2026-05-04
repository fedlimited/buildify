import React from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { TestimonialsManager } from '@/components/modules/TestimonialsManager';

export default function TestimonialsAdminPage() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <TestimonialsManager />
      </div>
    </AdminLayout>
  );
}