'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Truck, Clock, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Saya</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrders?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Terbuka</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myOrders?.filter((order) => order.status === 'open').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myOrders?.filter((order) => order.status === 'completed').length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Orders Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pesanan Saya</CardTitle>
                <CardDescription>Kelola pesanan antar Anda</CardDescription>
              </div>
              <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Buat Pesanan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Buat Pesanan Baru</DialogTitle>
                    <DialogDescription>
                      Buat pesanan antar baru yang ditugaskan kepada Anda
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-gray-600">
                      Ini akan membuat pesanan baru yang ditugaskan kepada Anda sebagai driver.
                      Pesanan akan dimulai dengan status "terbuka".
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOrderOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleCreateOrder}>Buat Pesanan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile: stacked list without boxes */}
            <div className="md:hidden">
              {myOrders && myOrders.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {myOrders
                    .slice()
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((order) => (
                      <div key={order._id} className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <div className="font-medium">#{order._id.slice(-8)}</div>
                              <div className="text-xs text-gray-500">Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID')}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {formatStatus(order.status)}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => router.push(`/driver/orders/${order._id}`)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                          {order.status === 'open' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order._id, 'closed')}>
                              Tutup
                            </Button>
                          )}
                          {order.status === 'closed' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order._id, 'open')}>
                                Buka Kembali
                              </Button>
                              <Button size="sm" onClick={() => handleUpdateOrderStatus(order._id, 'completed')}>
                                Selesaikan
                              </Button>
                            </>
                          )}
                          {order.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order._id, 'open')}>
                              Buka Kembali
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada pesanan. Buat pesanan pertama Anda!</p>
                </div>
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
              {myOrders && myOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Pesanan</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Dibuat</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {myOrders
                        .slice()
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(order.status)}
                                <div>
                                  <div className="font-medium">#{order._id.slice(-8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {formatStatus(order.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <Button size="sm" variant="outline" onClick={() => router.push(`/driver/orders/${order._id}`)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Detail
                                </Button>
                                {order.status === 'open' && (
                                  <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order._id, 'closed')}>
                                    Tutup
                                  </Button>
                                )}
                                {order.status === 'closed' && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order._id, 'open')}>
                                      Buka Kembali
                                    </Button>
                                    <Button size="sm" onClick={() => handleUpdateOrderStatus(order._id, 'completed')}>
                                      Selesaikan
                                    </Button>
                                  </>
                                )}
                                {order.status === 'completed' && (
                                  <Button size="sm" variant="outline" onClick={() => handleUpdateOrderStatus(order._id, 'open')}>
                                    Buka Kembali
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada pesanan. Buat pesanan pertama Anda!</p>
                </div>
              )}
            </div>
          </CardContent>
          </Card>
      </div>
    </Layout>
  );
}
