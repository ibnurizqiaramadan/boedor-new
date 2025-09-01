'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';

export default function OrderDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

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

  // Queries
  const order = useQuery(api.boedor.orders.getOrderById, {
    orderId: orderId as Id<'boedor_orders'>,
    currentUserId: user._id,
  });
  const orderItems = useQuery(api.boedor.orderItems.getOrderItemsByOrder, {
    orderId: orderId as Id<'boedor_orders'>,
    currentUserId: user._id,
  });

  // Get all payments for this order
  const orderPayments = useQuery(api.boedor.payment.getPaymentsByOrder, {
    orderId: orderId as Id<'boedor_orders'>,
    currentUserId: user._id,
  });
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, { currentUserId: user._id });

  // Get unique participant IDs from order items
  const participantIds = orderItems ? [ ...new Set(orderItems.map((item) => item.userId)) ] : [];

  // Get usernames for participants
  const participants = useQuery(
    api.boedor.users.getUsernamesByIds,
    participantIds.length > 0 ? { userIds: participantIds, currentUserId: user._id } : 'skip',
  );

  if (!order) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Memuat detail pesanan...</p>
        </div>
      </Layout>
    );
  }


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
      return total + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  };

  const getUserTotal = (userId: string) => {
    const userItems = itemsByUser[userId] || [];
    return userItems.reduce((total, item) => {
      const menuItem = menuItems?.find((m) => m._id === item.menuId);
      return total + (menuItem ? menuItem.price * item.qty : 0);
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Pesanan</h1>
            <p className="mt-2 text-gray-600">Pesanan #{orderId.slice(-8)}</p>
          </div>
        </div>

        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span>Pesanan #{orderId.slice(-8)}</span>
                </CardTitle>
                <CardDescription>
                  Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}
                </CardDescription>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {formatStatus(order.status)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Peserta</p>
                <p className="text-2xl font-bold">{participants?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Item</p>
                <p className="text-2xl font-bold">{orderItems?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Nilai</p>
                <p className="text-2xl font-bold">{formatCurrency(getTotalOrderValue())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peserta dan Item */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Peserta & Item</h2>

          {participants && participants.length > 0 ? (
            participants.map((participant) => {
              if (!participant) return null;
              const userItems = itemsByUser[participant._id] || [];
              const userTotal = getUserTotal(participant._id);

              return (
                <Card key={participant._id}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <CardTitle className="text-lg">{participant.username}{participant._id === user._id && ' (Anda)'}</CardTitle>
                          <CardDescription>
                            {userItems.length} item • Total: {formatCurrency(userTotal)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        {getUserPayment(participant._id) ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-green-600">Kembalian: {formatCurrency(getUserChange(participant._id))}</p>
                            <p className="text-xs text-gray-500">
                              Dibayar: {formatCurrency(getUserPayment(participant._id)!.amount)} • Metode: {getUserPayment(participant._id)!.paymentMethod}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-medium text-red-600">Belum Dibayar</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userItems.map((item) => {
                        const menuItem = menuItems?.find((m) => m._id === item.menuId);
                        const itemTotal = menuItem ? menuItem.price * item.qty : 0;

                        return (
                          <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <ShoppingCart className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="font-medium">{menuItem?.name || 'Item Tidak Dikenal'}</p>
                                <p className="text-sm text-gray-500">
                                  Jumlah: {item.qty} × {formatCurrency(menuItem?.price || 0)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(itemTotal)}</p>
                            </div>
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
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada peserta yang bergabung dengan pesanan ini.</p>
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
                  const participant = participants?.find((p) => p?._id === payment.userId);
                  const userTotal = getUserTotal(payment.userId);
                  const change = payment.amount - userTotal;

                  return (
                    <div key={payment._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{participant?.username || 'Pengguna Tidak Dikenal'}</p>
                          <p className="text-sm text-gray-500">
                            Metode: {payment.paymentMethod} • Total Item: {formatCurrency(userTotal)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Dibayar: {formatCurrency(payment.amount)}</p>
                        <p className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Kembalian: {formatCurrency(change)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="border-t pt-3 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total Dibayar:</p>
                      <p className="font-semibold">
                        {formatCurrency(orderPayments.reduce((sum, p) => sum + p.amount, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Kembalian:</p>
                      <p className="font-semibold text-green-600">{formatCurrency(orderPayments.reduce((sum, p) => sum + (p.amount - getUserTotal(p.userId)), 0))}</p>
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
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Item:</span>
                  <span>{orderItems.length}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Peserta:</span>
                  <span>{participants?.length || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Nilai Pesanan:</span>
                  <span>{formatCurrency(getTotalOrderValue())}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Peserta yang Sudah Bayar:</span>
                  <span>{orderPayments?.length || 0} / {participants?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
