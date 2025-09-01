'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';

export default function UserPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ isAddMenuOpen, setIsAddMenuOpen ] = useState(false);
  const [ isJoinOrderOpen, setIsJoinOrderOpen ] = useState(false);
  const [ selectedOrder, setSelectedOrder ] = useState<any>(null);
  const [ selectedMenuItems, setSelectedMenuItems ] = useState<{ menuId: string; qty: number }[]>([]);
  const [ newMenuItem, setNewMenuItem ] = useState({ name: '', price: 0 });
  const [ paymentMethod, setPaymentMethod ] = useState<string>('cash');
  const [ amount, setAmount ] = useState<string>('');
  const [ note, setNote ] = useState<string>('');

  // Queries
  const availableOrders = useQuery(api.boedor.orders.getAllOrders, user ? { currentUserId: user._id } : 'skip');
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : 'skip');
  const myOrderItems = useQuery(api.boedor.orderItems.getOrderItemsByUser, user ? { userId: user._id, currentUserId: user._id } : 'skip');

  // Query existing payment for selected order
  const existingPayment = useQuery(
    api.boedor.payment.getPaymentByOrderUser,
    selectedOrder && user ? {
      orderId: selectedOrder._id,
      userId: user._id,
      currentUserId: user._id,
    } : 'skip',
  );

  // Mutations
  const addMenuItem = useMutation(api.boedor.menu.createMenuItem);
  const addOrderItem = useMutation(api.boedor.orderItems.addOrderItem);
  const upsertPayment = useMutation(api.boedor.payment.upsertPayment);

  // Pre-populate payment form when existing payment is found
  useEffect(() => {
    if (existingPayment) {
      setPaymentMethod(existingPayment.paymentMethod);
      setAmount(existingPayment.amount.toString());
    } else {
      setPaymentMethod('cash');
      setAmount('');
    }
  }, [ existingPayment ]);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [ user, router ]);

  if (!user) {
    return null; // Don't render anything while redirecting
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



  const handleAddMenuItem = async () => {
    if (newMenuItem.name && newMenuItem.price > 0) {
      await addMenuItem({
        name: newMenuItem.name,
        price: newMenuItem.price,
        currentUserId: user._id,
      });
      setIsAddMenuOpen(false);
      setNewMenuItem({ name: '', price: 0 });
    }
  };

  const handleJoinOrder = async () => {
    if (selectedOrder && selectedMenuItems.length > 0 && (parseFloat(amount) > 0 || existingPayment)) {
      try {
        // Add all selected items to the order
        for (const item of selectedMenuItems) {
          if (item.qty > 0) {
            await addOrderItem({
              orderId: selectedOrder._id,
              menuId: item.menuId as Id<'boedor_menu'>,
              qty: item.qty,
              note: note?.trim() ? note.trim() : undefined,
              currentUserId: user._id,
            });
          }
        }

        // Save payment info separately (only if amount is provided or updating existing)
        if (parseFloat(amount) > 0) {
          await upsertPayment({
            orderId: selectedOrder._id,
            paymentMethod: paymentMethod as 'cash' | 'cardless' | 'dana',
            amount: parseFloat(amount),
            currentUserId: user._id,
          });
        }

        toast.success('Berhasil bergabung dengan pesanan!');
        setIsJoinOrderOpen(false);
        setSelectedOrder(null);
        setSelectedMenuItems([]);
        setAmount('');
        setPaymentMethod('cash');
        setNote('');
      } catch (error) {
        toast.error('Gagal bergabung dengan pesanan');
      }
    }
  };

  const updateMenuItemQuantity = (menuId: string, qty: number) => {
    setSelectedMenuItems((prev) => {
      const existing = prev.find((item) => item.menuId === menuId);
      if (existing) {
        return prev.map((item) =>
          item.menuId === menuId ? { ...item, qty } : item,
        );
      } else {
        return [ ...prev, { menuId, qty } ];
      }
    });
  };

  const getMenuItemQuantity = (menuId: string) => {
    return selectedMenuItems.find((item) => item.menuId === menuId)?.qty || 0;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dasbor Pengguna</h1>
          <p className="mt-2 text-gray-600">Jelajahi pesanan dan usulkan item menu</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Tersedia</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {availableOrders?.filter((order) => order.status === 'open').length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Saya</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myOrderItems?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Item Menu</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuItems?.length || 0}</div>
            </CardContent>
          </Card>
        </div>


        {/* My Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Item Pesanan Saya</CardTitle>
            <CardDescription>Item yang telah Anda tambahkan ke pesanan - klik untuk melihat detail</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                // Group order items by orderId
                const groupedOrders = myOrderItems?.reduce((acc, item) => {
                  const orderId = item.orderId;
                  if (!acc[orderId]) {
                    acc[orderId] = {
                      orderId,
                      totalItems: 0,
                      items: [],
                      latestTime: 0,
                    } as { orderId: string; totalItems: number; items: any[]; latestTime: number };
                  }
                  acc[orderId].totalItems += item.qty;
                  acc[orderId].items.push(item);
                  acc[orderId].latestTime = Math.max(acc[orderId].latestTime, item._creationTime);
                  return acc;
                }, {} as Record<string, { orderId: string; totalItems: number; items: any[]; latestTime: number }>);

                return Object.values(groupedOrders || {})
                  .sort((a, b) => b.latestTime - a.latestTime)
                  .map((group) => {
                    const status = availableOrders?.find((o: any) => o._id === group.orderId)?.status || '';
                    return (
                      <div
                        key={group.orderId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/user/orders/${group.orderId}`)}
                      >
                        <div>
                          <p className="font-medium">Pesanan #{group.orderId.slice(-6)}</p>
                          <p className="text-sm text-gray-500">Jumlah: {group.totalItems}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(group.latestTime || group.items[0]?._creationTime).toLocaleString('id-ID', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {formatStatus(status)}
                          </span>
                          <Button variant="outline" size="sm">
                            Lihat Detail
                          </Button>
                        </div>
                      </div>
                    );
                  });
              })()}
              {(!myOrderItems || myOrderItems.length === 0) && (
                <p className="text-gray-500 text-center py-8">Anda belum bergabung dengan pesanan apapun</p>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Join Order Dialog */}
        <Dialog open={isJoinOrderOpen} onOpenChange={setIsJoinOrderOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gabung Pesanan #{selectedOrder?._id.slice(-6)}</DialogTitle>
              <DialogDescription>Pilih item menu dan jumlahnya</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {menuItems?.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMenuItemQuantity(item._id, Math.max(0, getMenuItemQuantity(item._id) - 1))}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{getMenuItemQuantity(item._id)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMenuItemQuantity(item._id, getMenuItemQuantity(item._id) + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Information */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">
                Informasi Pembayaran {existingPayment && <span className="text-sm text-green-600">(Sudah diatur - Anda dapat memperbarui)</span>}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <Select value={paymentMethod} onValueChange={(value: 'cash' | 'cardless' | 'dana') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="cardless">Tanpa Kartu</SelectItem>
                      <SelectItem value="dana">DANA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah
                  </label>
                  <Input
                    type="number"
                    placeholder="Masukkan jumlah"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* Note - moved near footer/subtotal */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-medium text-gray-700">
                Catatan (opsional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Misal: pedas, tanpa sambal, minumnya es batu sedikit, dll."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJoinOrderOpen(false)}>Batal</Button>
              <Button
                onClick={handleJoinOrder}
                disabled={selectedMenuItems.filter((item) => item.qty > 0).length === 0 || (!existingPayment && parseFloat(amount) <= 0)}
              >
                Gabung Pesanan ({selectedMenuItems.filter((item) => item.qty > 0).length} item)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
