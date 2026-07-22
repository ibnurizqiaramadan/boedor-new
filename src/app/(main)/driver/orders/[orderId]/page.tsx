'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, ShoppingCart, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';

const formatPaymentMethod = (method: string) =>
  ({ cash: 'Tunai', cardless: 'Tanpa Kartu', dana: 'DANA' })[method] ?? method;

export default function OrderDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  // Mutations (declare before effects to avoid TDZ)
  const updatePosition = useMutation(api.boedor.driverPositions.updateDriverPosition);
  const setCustomPrice = useMutation(api.boedor.orderItems.setCustomPrice);
  const setPurchased = useMutation(api.boedor.orderItems.setPurchased);

  // Draft input harga custom per order item
  const [ priceInputs, setPriceInputs ] = useState<Record<string, string>>({});

  // Local state for location tracking (driver only)
  const [ location, setLocation ] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [ isTracking, setIsTracking ] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const locationRef = useRef<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [ lastUpdatedAt, setLastUpdatedAt ] = useState<number | null>(null);

  // Restore tracking toggle from localStorage on mount (driver only)
  useEffect(() => {
    if (user?.role !== 'driver') return;
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('driverTracking');
    if (saved === 'true') setIsTracking(true);
  }, [ user?.role ]);

  // Start/stop geolocation watcher based on isTracking
  useEffect(() => {
    if (user?.role !== 'driver') return;

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
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          await updatePosition({ driverId: user!._id, lat, lng });
          setLocation({ lat, lng });
          setLastUpdatedAt(Date.now());
        } catch {
          // ignore
        }
      },
      () => {
        // ignore errors for background watcher
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
  }, [ user, isTracking, updatePosition ]);

  // Keep latest location in ref
  useEffect(() => {
    locationRef.current = location;
  }, [ location ]);

  // Fallback polling every 3s to refresh timestamp
  useEffect(() => {
    if (user?.role !== 'driver' || !isTracking) return;
    const interval = setInterval(async () => {
      try {
        const { lat, lng } = locationRef.current;
        await updatePosition({ driverId: user!._id, lat, lng });
        setLastUpdatedAt(Date.now());
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [ user, user?.role, isTracking, updatePosition ]);

  // Redirect to home page if user is explicitly unauthenticated
  useEffect(() => {
    if (user === null) router.push('/');
  }, [ user, router ]);

  const canView = !!user && user.role === 'driver';

  // Queries
  const order = useQuery(
    api.boedor.orders.getOrderById,
    canView && user ? { orderId: orderId as Id<'boedor_orders'> } : 'skip',
  );
  const orderItems = useQuery(
    api.boedor.orderItems.getOrderItemsByOrder,
    canView && user ? { orderId: orderId as Id<'boedor_orders'> } : 'skip',
  );

  // Get all payments for this order
  const orderPayments = useQuery(
    api.boedor.payment.getPaymentsByOrder,
    canView && user ? { orderId: orderId as Id<'boedor_orders'> } : 'skip',
  );
  const menuItems = useQuery(
    api.boedor.menu.getAllMenuItems,
    canView && user ? {} : 'skip',
  );

  // Driver own position for display
  const myPosition = useQuery(
    api.boedor.driverPositions.getDriverPosition,
    canView && user ? { driverId: user._id } : 'skip',
  );

  // Mutations
  // (already declared above)

  // Get unique participant IDs from order items
  const participantIds = orderItems ? [ ...new Set(orderItems.map((item) => item.userId).filter(id => id)) ] : [ ];

  // Get usernames for participants
  const participants = useQuery(
    api.boedor.users.getUsernamesByIds,
    canView && user && participantIds.length > 0 ?
      { userIds: participantIds } :
      'skip',
  );

  const loading = canView && !order;


  // Group order items by user
  const itemsByUser = orderItems ?
    orderItems.reduce((acc, item) => {
      const userId = item.userId;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(item);
      return acc;
    }, {} as Record<string, typeof orderItems>) : {};



  const getTotalOrderValue = () => {
    if (!orderItems || !menuItems) return 0;
    return orderItems.reduce((total, item) => {
      const menuItem = menuItems.find((m) => m._id === item.menuId);
      return total + (menuItem ? (item.customPrice ?? menuItem.price) * item.qty : 0);
    }, 0);
  };

  const getUserTotal = (userId: string) => {
    const userItems = itemsByUser[userId] || [];
    return userItems.reduce((total, item) => {
      const menuItem = menuItems?.find((m) => m._id === item.menuId);
      return total + (menuItem ? (item.customPrice ?? menuItem.price) * item.qty : 0);
    }, 0);
  };

  const getUserPayment = (userId: string) => {
    return orderPayments?.find((payment) => payment.userId === userId);
  };

  const getUserChange = (userId: string) => {
    const payment = getUserPayment(userId);
    if (!payment) return 0;
    const total = getUserTotal(userId);
    return payment.amount - total;
  };

  const handleTogglePurchased = async (orderItemId: string, purchased: boolean) => {
    try {
      await setPurchased({ orderItemId: orderItemId as Id<'boedor_order_items'>, purchased });
      toast.success(purchased ? 'Item ditandai sudah dibeli' : 'Tanda dibeli dibatalkan');
    } catch (err) {
      toast.error('Gagal menandai item: ' + (err as Error).message);
    }
  };

  const handleSaveCustomPrice = async (orderItemId: string) => {
    const val = parseFloat(priceInputs[orderItemId] ?? '');
    if (isNaN(val) || val < 0) return;
    try {
      await setCustomPrice({ orderItemId: orderItemId as Id<'boedor_order_items'>, customPrice: val });
      toast.success('Harga disimpan');
    } catch (err) {
      toast.error('Gagal menyimpan harga: ' + (err as Error).message);
    }
  };

  return (
    <Layout>
      {!canView ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Akses ditolak. Khusus driver.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Memuat detail pesanan...</p>
        </div>
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            aria-label="Kembali"
            className="shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-display text-2xl text-foreground sm:text-3xl">Detail Pesanan</h1>
            <p className="text-sm text-muted-foreground">#{orderId.slice(-8)}</p>
          </div>
        </div>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {getStatusIcon(order!.status)}
                </span>
                <div>
                  <CardTitle>Pesanan #{orderId.slice(-8)}</CardTitle>
                  <CardDescription>
                    Dibuat {new Date(order!.createdAt).toLocaleString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </CardDescription>
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order!.status)}`}>
                {formatStatus(order!.status)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Peserta</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{participants?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Item</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{orderItems?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Nilai</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatCurrency(getTotalOrderValue())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Lokasi (driver only) */}
        {canView && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Status Lokasi
                    {isTracking && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-400/15 px-2.5 py-0.5 text-xs font-medium text-green-400">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 motion-safe:animate-ping" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                        </span>
                        Live
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>Perbarui lokasi Anda saat ini untuk pelanggan</CardDescription>
                </div>
                <Button onClick={() => setIsTracking((v) => !v)} variant={isTracking ? 'default' : 'outline'}>
                  <MapPin className="h-4 w-4 mr-2" />
                  {isTracking ? 'Matikan Pelacakan' : 'Nyalakan Pelacakan'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {myPosition ? (
                <p className="text-sm text-muted-foreground">
                  Posisi saat ini: <span className="tabular-nums">{(location.lat || myPosition.lat).toFixed(6)}, {(location.lng || myPosition.lng).toFixed(6)}</span>
                  <br />
                  {(() => {
                    const ts = lastUpdatedAt ?? myPosition.updatedAt;
                    return <>Terakhir diperbarui: {new Date(ts).toLocaleString('id-ID')}</>;
                  })()}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada data posisi.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Peserta dan Item */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Peserta & Item</h2>

          {participants && participants.length > 0 ? (
            (participants.filter(p => p) as NonNullable<typeof participants[0]>[]).map((participant) => {
              const userItems = itemsByUser[participant._id] || [];
              const userTotal = getUserTotal(participant._id);
              const participantName = participant.username || participant.name || 'Pengguna Tidak Dikenal';

              return (
                <Card key={participant._id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-400/15 text-sm font-semibold uppercase text-blue-400">
                          {participantName.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="truncate">{participantName}</span>
                            {String(participant._id) === String(user._id) && (
                              <span className="shrink-0 rounded-full bg-blue-400/15 px-2 py-0.5 text-xs font-medium text-blue-400">Anda</span>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {userItems.length} item · Total {formatCurrency(userTotal)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {getUserPayment(participant._id) ? (
                          <div className="space-y-1">
                            {(() => {
                              const change = getUserChange(participant._id);
                              return (
                                <p className={`text-sm font-medium tabular-nums ${change < 0 ? 'text-destructive' : 'text-green-400'}`}>
                                  {change < 0 ? `Kurang Bayar: ${formatCurrency(-change)}` : `Kembalian: ${formatCurrency(change)}`}
                                </p>
                              );
                            })()}
                            <p className="text-xs text-muted-foreground">
                              Dibayar {formatCurrency(getUserPayment(participant._id)!.amount)} · {formatPaymentMethod(getUserPayment(participant._id)!.paymentMethod)}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-medium text-amber-400">Belum Dibayar</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      {userItems.map((item) => {
                        const menuItem = menuItems?.find((m) => m._id === item.menuId);
                        const itemTotal = menuItem ? (item.customPrice ?? menuItem.price) * item.qty : 0;

                        return (
                          <div key={item._id} className="flex items-center gap-3 rounded-lg border p-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                              <ShoppingCart className="h-4 w-4" aria-hidden />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{menuItem?.name || 'Item Tidak Dikenal'}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.qty} × {formatCurrency(item.customPrice ?? menuItem?.price ?? 0)}
                                {menuItem?.priceType === 'custom' && item.customPrice === undefined && (
                                  <span className="ml-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-400">Harga belum diinput</span>
                                )}
                              </p>
                              {item.note && (
                                <p className="truncate text-xs italic text-muted-foreground">&ldquo;{item.note}&rdquo;</p>
                              )}
                              {menuItem?.priceType === 'custom' && order!.status !== 'completed' && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    placeholder="Harga satuan aktual"
                                    className="h-8 w-40"
                                    value={priceInputs[item._id] ?? item.customPrice?.toString() ?? ''}
                                    onChange={(e) => setPriceInputs((p) => ({ ...p, [item._id]: e.target.value }))}
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isNaN(parseFloat(priceInputs[item._id] ?? ''))}
                                    onClick={() => handleSaveCustomPrice(item._id)}
                                  >
                                    Simpan
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(itemTotal)}</p>
                            {order!.status !== 'completed' ? (
                              <Button
                                size="icon"
                                variant="outline"
                                className="shrink-0"
                                aria-label={item.purchased ? 'Batalkan tanda dibeli' : 'Tandai sudah dibeli'}
                                onClick={() => handleTogglePurchased(item._id, !item.purchased)}
                              >
                                <CheckCircle className={`h-4 w-4 ${item.purchased ? 'text-green-400' : 'text-muted-foreground'}`} />
                              </Button>
                            ) : item.purchased ? (
                              <CheckCircle className="h-5 w-5 shrink-0 text-green-400" aria-label="Sudah dibeli" />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada peserta yang bergabung dengan pesanan ini.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ringkasan Pembayaran */}
        {orderPayments && orderPayments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pembayaran</CardTitle>
              <CardDescription>Ringkasan semua pembayaran dan kembalian untuk pesanan ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {orderPayments.map((payment) => {
                  const participant = participants?.find((p) => p && String(p._id) === String(payment.userId));
                  const userTotal = getUserTotal(payment.userId);
                  const change = payment.amount - userTotal;

                  return (
                    <div key={payment._id} className="flex items-center gap-3 rounded-lg border p-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <User className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{participant ? (participant.username || participant.name || 'Pengguna Tidak Dikenal') : 'Pengguna Tidak Dikenal'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPaymentMethod(payment.paymentMethod)} · Total item {formatCurrency(userTotal)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-medium tabular-nums">{formatCurrency(payment.amount)}</p>
                        <p className={`text-sm font-medium tabular-nums ${change >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                          {change < 0 ? `Kurang Bayar ${formatCurrency(-change)}` : `Kembalian ${formatCurrency(change)}`}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="border-t pt-3 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Dibayar:</p>
                      <p className="font-semibold">
                        {formatCurrency(orderPayments.reduce((sum, p) => sum + p.amount, 0))}
                      </p>
                    </div>
                    <div>
                      {(() => {
                        const totalChange = orderPayments.reduce((sum, p) => sum + (p.amount - getUserTotal(p.userId)), 0);
                        return (
                          <>
                            <p className="text-muted-foreground">{totalChange < 0 ? 'Total Kurang Bayar:' : 'Total Kembalian:'}</p>
                            <p className={`font-semibold ${totalChange < 0 ? 'text-destructive' : 'text-green-400'}`}>{formatCurrency(Math.abs(totalChange))}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ringkasan Pesanan */}
        {orderItems && orderItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Item</span>
                  <span className="tabular-nums text-foreground">{orderItems.length}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Peserta</span>
                  <span className="tabular-nums text-foreground">{participants?.length || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-2.5 text-base font-semibold">
                  <span>Total Nilai Pesanan</span>
                  <span className="tabular-nums text-green-400">{formatCurrency(getTotalOrderValue())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      )}
    </Layout>
  );
}
