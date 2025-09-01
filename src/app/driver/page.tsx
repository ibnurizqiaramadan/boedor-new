'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, CheckCircle, Truck } from 'lucide-react';
import { formatStatus } from '@/lib/status';

export default function DriverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ isUpdateLocationOpen, setIsUpdateLocationOpen ] = useState(false);
  const [ location, setLocation ] = useState({ lat: 0, lng: 0 });

  // Queries
  const myOrders = useQuery(api.boedor.orders.getOrdersByDriver, user ? { driverId: user._id, currentUserId: user._id } : 'skip');
  const myPosition = useQuery(api.boedor.driverPositions.getDriverPosition, user ? { driverId: user._id, currentUserId: user._id } : 'skip');

  // Mutations
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);
  const updatePosition = useMutation(api.boedor.driverPositions.updateDriverPosition);

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

  // Menu manajemen dipindahkan ke /driver/menu

  const handleUpdateOrderStatus = async (orderId: string, status: 'open' | 'closed' | 'completed') => {
    await updateOrderStatus({ orderId: orderId as any, status, currentUserId: user!._id });
  };

  const handleUpdateLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        await updatePosition({
          driverId: user._id,
          lat,
          lng,
          currentUserId: user._id,
        });
        setLocation({ lat, lng });
      });
    } else {
      // Manual location input
      await updatePosition({
        driverId: user._id,
        lat: location.lat,
        lng: location.lng,
        currentUserId: user._id,
      });
    }
    setIsUpdateLocationOpen(false);
  };

  return (
    <Layout>
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

        {/* Location Update */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Status Lokasi</CardTitle>
                <CardDescription>Perbarui lokasi Anda saat ini untuk pelanggan</CardDescription>
              </div>
              <Dialog open={isUpdateLocationOpen} onOpenChange={setIsUpdateLocationOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <MapPin className="h-4 w-4 mr-2" />
                    Perbarui Lokasi
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Perbarui Lokasi</DialogTitle>
                    <DialogDescription>Perbarui posisi Anda saat ini</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Button onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                          });
                        });
                      }
                    }}>
                      Gunakan Lokasi Saat Ini
                    </Button>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Lintang"
                        value={location.lat}
                        onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
                      />
                      <Input
                        type="number"
                        placeholder="Bujur"
                        value={location.lng}
                        onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUpdateLocationOpen(false)}>Batal</Button>
                    <Button onClick={handleUpdateLocation}>Perbarui Lokasi</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {myPosition ? (
              <p className="text-sm text-gray-600">
                Posisi saat ini: {myPosition.lat.toFixed(6)}, {myPosition.lng.toFixed(6)}
                <br />
                Terakhir diperbarui: {new Date(myPosition.updatedAt).toLocaleString('id-ID')}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Tidak ada data lokasi tersedia</p>
            )}
          </CardContent>
        </Card>

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
    </Layout>
  );
}
