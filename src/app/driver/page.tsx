'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Removed Dialog imports; using a toggle button instead
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, CheckCircle, Truck } from 'lucide-react';
import { formatStatus } from '@/lib/status';

export default function DriverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ location, setLocation ] = useState({ lat: 0, lng: 0 });
  const [ isTracking, setIsTracking ] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const locationRef = useRef<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [ lastUpdatedAt, setLastUpdatedAt ] = useState<number | null>(null);

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

  const isLoggedIn = !!user;
  const isDriver = user?.role === 'driver';

  // Menu manajemen dipindahkan ke /driver/menu

  const handleUpdateOrderStatus = async (orderId: string, status: 'open' | 'closed' | 'completed') => {
    await updateOrderStatus({ orderId: orderId as any, status, currentUserId: user!._id });
  };

  // Removed manual handleUpdateLocation; tracking toggle handles updates

  // Restore tracking state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('driverTracking');
    if (saved === 'true') {
      setIsTracking(true);
    }
  }, []);

  // Start/stop geolocation watcher based on isTracking
  useEffect(() => {
    if (!user) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('driverTracking', isTracking ? 'true' : 'false');
    }

    if (!isTracking) {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      return;
    }

    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          await updatePosition({
            driverId: user._id,
            lat,
            lng,
            currentUserId: user._id,
          });
          setLocation({ lat, lng });
          setLastUpdatedAt(Date.now());
        } catch (_) {
          // ignore background errors
        }
      },
      () => {
        // error ignored for background watcher
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 },
    );
    watchIdRef.current = watchId as unknown as number;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [user, isTracking, updatePosition]);

  // Keep a ref of latest location for polling
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Fallback: poll every 3s to refresh updatedAt even if device doesn't move
  useEffect(() => {
    if (!user || !isTracking) return;
    const interval = setInterval(async () => {
      try {
        const { lat, lng } = locationRef.current;
        await updatePosition({
          driverId: user._id,
          lat,
          lng,
          currentUserId: user._id,
        });
        setLastUpdatedAt(Date.now());
      } catch (_) {
        // ignore background errors
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user, isTracking, updatePosition]);

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

        {/* Location Update */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Status Lokasi</CardTitle>
                <CardDescription>Perbarui lokasi Anda saat ini untuk pelanggan</CardDescription>
              </div>
              <Button
                onClick={() => setIsTracking((prev) => !prev)}
                variant={isTracking ? 'default' : 'outline'}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isTracking ? 'Matikan Pelacakan' : 'Nyalakan Pelacakan'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myPosition ? (
              <p className="text-sm text-gray-600">
                Posisi saat ini: {(location.lat || myPosition.lat).toFixed(6)}, {(location.lng || myPosition.lng).toFixed(6)}
                <br />
                {(() => {
                  const ts = lastUpdatedAt ?? myPosition.updatedAt;
                  return (
                    <>
                      Terakhir diperbarui: {new Date(ts).toLocaleString('id-ID')}
                    </>
                  );
                })()}
              </p>
            ) : (
              <p className="text-sm text-gray-600">Belum ada data posisi.</p>
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
      )}
    </Layout>
  );
}
