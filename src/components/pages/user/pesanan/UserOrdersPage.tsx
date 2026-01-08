'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AvailableOrdersList } from './AvailableOrdersList';

export default function UserOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const availableOrders = useQuery(api.boedor.orders.getOrdersByStatus,
    user?._id ? { status: 'open', currentUserId: user._id } : 'skip',
  );
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems,
    user?._id ? { currentUserId: user._id } : 'skip',
  );

  // Collect driver IDs from available orders and fetch their usernames
  const driverIds = availableOrders ? Array.from(new Set(availableOrders.map((o: any) => o.driverId))) : [];
  const drivers = useQuery(
    api.boedor.users.getUsernamesByIds,
    user && driverIds.length > 0 ? { userIds: driverIds, currentUserId: user._id } : 'skip',
  );


  // Fetch all order items for current user to know which orders are already joined
  const myOrderItems = useQuery(
    api.boedor.orderItems.getOrderItemsByUser,
    user?._id ? { userId: user._id, currentUserId: user._id } : 'skip',
  );
  const joinedOrderIds = new Set((myOrderItems ?? []).map((it: any) => it.orderId));






  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Memuat...</p>
        </div>
      </Layout>
    );
  }

  if (user.role !== 'user') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus pengguna.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan Tersedia</h1>
          <p className="mt-2 text-gray-600">Bergabung dengan pesanan yang ada dari pengemudi</p>
        </div>

        <AvailableOrdersList
          availableOrders={availableOrders || []}
          drivers={drivers || []}
          joinedOrderIds={joinedOrderIds}
          onJoinOrder={(order) => {
            // Redirect langsung ke halaman gabung pesanan
            router.push(`/user/orders/${order._id}/gabung`);
          }}
          onViewOrder={(orderId) => router.push(`/user/orders/${orderId}`)}
        />

      </div>
    </Layout>
  );
}