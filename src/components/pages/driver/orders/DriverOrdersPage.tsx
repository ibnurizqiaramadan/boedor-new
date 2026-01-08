'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DriverOrdersStats } from './DriverOrdersStats';
import { DriverOrdersList } from './DriverOrdersList';
import { CreateOrderDialog } from './CreateOrderDialog';

export default function DriverOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ isCreateOrderOpen, setIsCreateOrderOpen ] = useState(false);

  // Queries (moved above conditional returns; use "skip" when user is not ready)
  const myOrders = useQuery(
    api.boedor.orders.getOrdersByDriver,
    user ? { driverId: user._id, currentUserId: user._id } : 'skip',
  );

  // Mutations
  const createOrder = useMutation(api.boedor.orders.createOrder);
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [ user, router ]);

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  if (user.role !== 'driver') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus driver.</p>
        </div>
      </Layout>
    );
  }

  // Handlers
  const handleShareOrder = async (orderId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const joinUrl = `${origin}/user/orders/${orderId}/gabung`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Gabung Pesanan',
          text: `Ayo gabung ke pesanan #${orderId.slice(-8)}`,
          url: joinUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(joinUrl);
        toast.success('Link gabung telah disalin');
      } else {
        // Fallback: create temporary input
        const el = document.createElement('input');
        el.value = joinUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        toast.success('Link gabung telah disalin');
      }
    } catch (err) {
      console.error('Failed to share link', err);
      toast.error('Gagal membagikan link');
    }
  };

  const handleCreateOrder = async () => {
    try {
      await createOrder({
        driverId: user._id,
        currentUserId: user._id,
      });
      toast.success('Order created successfully!');
      setIsCreateOrderOpen(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order: ' + (error as Error).message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'open' | 'closed' | 'completed') => {
    try {
      await updateOrderStatus({
        orderId: orderId as any,
        status,
        currentUserId: user._id,
      });
      toast.success(`Order status updated to ${status}!`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status: ' + (error as Error).message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
          <p className="mt-2 text-gray-600">Kelola pesanan antar Anda</p>
        </div>

        <DriverOrdersStats orders={myOrders || []} />

        <DriverOrdersList
          orders={myOrders || []}
          onCreateOrder={() => setIsCreateOrderOpen(true)}
          onUpdateStatus={handleUpdateOrderStatus}
          onShareOrder={handleShareOrder}
          onViewDetail={(orderId) => router.push(`/driver/orders/${orderId}`)}
        />

        <CreateOrderDialog
          open={isCreateOrderOpen}
          onOpenChange={setIsCreateOrderOpen}
          onCreateOrder={handleCreateOrder}
        />
      </div>
    </Layout>
  );
}