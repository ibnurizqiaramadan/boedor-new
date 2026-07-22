'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
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
  const [ orderToDelete, setOrderToDelete ] = useState<string | null>(null);
  const [ isDeleting, setIsDeleting ] = useState(false);

  // Queries
  const orders = useQuery(api.boedor.orders.getAllOrders, user ? {} : 'skip');

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
          <p className="text-destructive">Akses ditolak. Khusus admin.</p>
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
      });
      toast.success(`Status pesanan diperbarui menjadi ${status}!`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Gagal memperbarui status pesanan: ' + (error as Error).message);
    }
  };

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete || isDeleting) return;
    try {
      setIsDeleting(true);
      await deleteOrder({ orderId: orderToDelete as any });
      toast.success('Pesanan berhasil dihapus!');
      setOrderToDelete(null);
    } catch (error) {
      console.error('Failed to delete order:', error);
      toast.error('Gagal menghapus pesanan: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl text-foreground">Manajemen Pesanan</h1>
          <p className="mt-2 text-muted-foreground">Pantau dan kelola semua pesanan</p>
        </div>

        {/* Orders Management */}
        <Card>
          <OrdersHeader />
          <CardContent>
            <OrderList
              orders={orders || []}
              onUpdateStatus={handleUpdateOrderStatus}
              onDelete={(orderId) => setOrderToDelete(orderId)}
              isLoading={!orders}
            />
          </CardContent>
        </Card>

        <Dialog open={orderToDelete !== null} onOpenChange={(open) => !open && setOrderToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hapus Pesanan?</DialogTitle>
              <DialogDescription>Pesanan beserta datanya akan dihapus permanen.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOrderToDelete(null)} disabled={isDeleting}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleConfirmDeleteOrder} disabled={isDeleting}>
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}