'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Truck } from 'lucide-react';
import { formatStatus } from '@/lib/status';

export default function DriverPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Queries
  const myOrders = useQuery(api.boedor.orders.getOrdersByDriver, user ? { driverId: user._id, currentUserId: user._id } : 'skip');
  // Location tracking moved to driver order detail page

  // Mutations
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);
  // Position update mutation moved to order detail page

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [ user, router ]);

  const isLoggedIn = !!user;
  const isDriver = user?.role === 'driver';

  // Menu manajemen dipindahkan ke /driver/menu

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
              <CardTitle className="text-sm font-medium">Pesanan Tertunda</CardTitle>
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

        {/* Status Lokasi dipindahkan ke halaman detail pesanan driver */}

        {/* Order Management */}
        <Card>
          <CardHeader>
            <CardTitle>Pesanan Saya</CardTitle>
            <CardDescription>Kelola pesanan pengiriman yang ditugaskan kepada Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders?.slice().sort((a, b) => b.createdAt - a.createdAt).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Pesanan #{order._id.slice(-6)}</p>
                    <p className="text-sm text-gray-500">Status: {formatStatus(order.status)}</p>
                    <p className="text-sm text-gray-500">
                      Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {order.status === 'open' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, 'closed')}
                      >
                        Mulai Pengiriman
                      </Button>
                    )}
                    {order.status === 'closed' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                      >
                        Tandai Selesai
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {(!myOrders || myOrders.length === 0) && (
                <p className="text-gray-500 text-center py-8">Belum ada pesanan yang ditugaskan</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Menu item telah dipindahkan ke halaman /driver/menu */}
      </div>
      )}
    </Layout>
  );
}
