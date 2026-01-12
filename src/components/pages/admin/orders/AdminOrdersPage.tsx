'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { OrdersHeader, OrderList } from './index';

interface Order {
  _id: string;
  driverId: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
  _creationTime: number;
}

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Queries
  const orders = useQuery(api.boedor.orders.getAllOrders, user ? { currentUserId: user._id } : 'skip');

  // Mutations
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);
  const deleteOrder = useMutation(api.boedor.orders.deleteOrder);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus admin.</p>
        </div>
      </Layout>
    );
  }

  // Handlers
  const handleUpdateOrderStatus = async (orderId: string, status: 'open' | 'closed' | 'completed') => {
    try {
      await updateOrderStatus({
        orderId: orderId as any,
        status,
        currentUserId: user!._id,
      });
      toast.success(`Status pesanan diperbarui menjadi ${status}!`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Gagal memperbarui status pesanan: ' + (error as Error).message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
      try {
        await deleteOrder({ orderId: orderId as any, currentUserId: user!._id });
        toast.success('Pesanan berhasil dihapus!');
      } catch (error) {
        console.error('Failed to delete order:', error);
        toast.error('Gagal menghapus pesanan: ' + (error as Error).message);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Pesanan</h1>
          <p className="mt-2 text-gray-600">Pantau dan kelola semua pesanan</p>
        </div>

        {/* Orders Management */}
        <Card>
          <OrdersHeader />
          <CardContent>
            <OrderList
              orders={orders || []}
              onUpdateStatus={handleUpdateOrderStatus}
              onDelete={handleDeleteOrder}
              isLoading={!orders}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}