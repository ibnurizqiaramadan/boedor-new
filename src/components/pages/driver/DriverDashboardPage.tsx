'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCards, OrderManagement } from './index';

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Queries
  const myOrders = useQuery(api.boedor.orders.getOrdersByDriver, user ? { driverId: user._id, currentUserId: user._id } : 'skip');

  // Mutations
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [ user, router ]);

  const isLoggedIn = !!user;
  const isDriver = user?.role === 'driver';

  const handleUpdateOrderStatus = async (orderId: string, status: 'open' | 'closed' | 'completed') => {
    await updateOrderStatus({ orderId: orderId as any, status, currentUserId: user!._id });
  };

  return (
    <Layout>
      {!isLoggedIn ? null : !isDriver ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus driver.</p>
        </div>
      ) : (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dasbor Pengemudi</h1>
          <p className="mt-2 text-gray-600">Kelola pesanan dan lokasi Anda</p>
        </div>

        <StatsCards orders={myOrders || []} />

        <OrderManagement
          orders={myOrders || []}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      </div>
      )}
    </Layout>
  );
}