'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, ShoppingCart, Edit, Trash2, Plus, Wallet, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';

export default function UserOrderDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const [ isEditItemOpen, setIsEditItemOpen ] = useState(false);
  const [ isAddItemOpen, setIsAddItemOpen ] = useState(false);
  const [ selectedOrderItem, setSelectedOrderItem ] = useState<any>(null);
  const [ selectedMenuItems, setSelectedMenuItems ] = useState<{ menuId: string; qty: number }[]>([]);
  const [ itemNotes, setItemNotes ] = useState<Record<string, string>>({});
  const [ paymentMethod, setPaymentMethod ] = useState<'cash' | 'cardless' | 'dana'>('cash');
  const [ amount, setAmount ] = useState<string>('');
  const [ payErrors, setPayErrors ] = useState<{ amount?: string }>([] as any as { amount?: string });
  const [ errors, setErrors ] = useState<{ amount?: string }>({});

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

  // Queries
  const order = useQuery(api.boedor.orders.getOrderById, {
    orderId: orderId as Id<'boedor_orders'>,
    currentUserId: user._id,
  });
  const orderItems = useQuery(api.boedor.orderItems.getOrderItemsByOrder, {
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

  // Query existing payment for this order
  const existingPayment = useQuery(
    api.boedor.payment.getPaymentByOrderUser,
    user ? {
      orderId: orderId as Id<'boedor_orders'>,
      userId: user._id,
      currentUserId: user._id,
    } : 'skip',
  );

  // Mutations
  const updateOrderItem = useMutation(api.boedor.orderItems.updateOrderItem);
  const removeOrderItem = useMutation(api.boedor.orderItems.removeOrderItem);
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

  // Get user's own items
  const myItems = orderItems ? orderItems.filter((item) => item.userId === user._id) : [];



  const getTotalOrderValue = () => {
    if (!orderItems || !menuItems) return 0;
    return orderItems.reduce((total, item) => {
      const menuItem = menuItems.find((m) => m._id === item.menuId);
      return total + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  };

  const handleSavePayment = async () => {
    try {
      setPayErrors({});
      const amt = parseFloat(amount);
      const myTotal = getMyTotal();
      if (isNaN(amt) || amt <= 0) {
        setPayErrors({ amount: 'Jumlah harus lebih dari 0' });
        toast.error('Jumlah tidak valid');
        return;
      }
      if (amt < myTotal) {
        setPayErrors({ amount: `Jumlah harus minimal ${formatCurrency(myTotal)}` });
        toast.error('Jumlah kurang dari total item Anda');
        return;
      }

      await upsertPayment({
        orderId: orderId as Id<'boedor_orders'>,
        paymentMethod,
        amount: amt,
        currentUserId: user._id,
      });
      toast.success('Pembayaran disimpan');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan pembayaran');
    }
  };

  const getUserTotal = (userId: string) => {
    const userItems = itemsByUser[userId] || [];
    return userItems.reduce((total, item) => {
      const menuItem = menuItems?.find((m) => m._id === item.menuId);
      return total + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  };

  const getMyTotal = () => {
    return myItems.reduce((total, item) => {
      const menuItem = menuItems?.find((m) => m._id === item.menuId);
      return total + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  };

  const getMyChange = () => {
    if (!existingPayment) return 0;
    const myTotal = getMyTotal();
    return existingPayment.amount - myTotal;
  };

  const handleUpdateOrderItem = async () => {
    try {
      if (selectedOrderItem && selectedOrderItem.qty > 0) {
        await updateOrderItem({
          orderItemId: selectedOrderItem._id,
          qty: selectedOrderItem.qty,
          note: selectedOrderItem.note?.trim() ? selectedOrderItem.note.trim() : undefined,
          currentUserId: user._id,
        });
        toast.success('Item pesanan berhasil diperbarui!');
        setIsEditItemOpen(false);
        setSelectedOrderItem(null);
      }
    } catch (error) {
      console.error('Failed to update order item:', error);
      toast.error('Gagal memperbarui item pesanan: ' + (error as Error).message);
    }
  };

  const handleRemoveOrderItem = async (orderItemId: string) => {
    try {
      if (confirm('Apakah Anda yakin ingin menghapus item ini dari pesanan?')) {
        await removeOrderItem({
          orderItemId: orderItemId as Id<'boedor_order_items'>,
          currentUserId: user._id,
        });
        toast.success('Item pesanan berhasil dihapus!');
      }
    } catch (error) {
      console.error('Failed to remove order item:', error);
      toast.error('Gagal menghapus item pesanan: ' + (error as Error).message);
    }
  };

  const handleAddMoreItems = async () => {
    try {
      // Validate against existing payment (if any)
      const subtotal = selectedMenuItems.reduce((sum, sel) => {
        const m = menuItems?.find((mi) => mi._id === sel.menuId);
        return sum + (m ? m.price * sel.qty : 0);
      }, 0);
      // If user already has a payment recorded, ensure it covers the new subtotal
      if (existingPayment && existingPayment.amount < subtotal) {
        toast.error('Subtotal melebihi jumlah bayar yang tersimpan');
        return;
      }

      if (selectedMenuItems.length > 0) {
        // Add all selected items to the order
        for (const item of selectedMenuItems) {
          if (item.qty > 0) {
            await addOrderItem({
              orderId: orderId as Id<'boedor_orders'>,
              menuId: item.menuId as Id<'boedor_menu'>,
              qty: item.qty,
              note: itemNotes[item.menuId]?.trim() ? itemNotes[item.menuId].trim() : undefined,
              currentUserId: user._id,
            });
          }
        }

        toast.success('Item berhasil ditambahkan ke pesanan!');
        setIsAddItemOpen(false);
        setSelectedMenuItems([]);
        setItemNotes({});
        setErrors({}); // keep payment state for Payment section
      }
    } catch (error) {
      console.error('Failed to add items:', error);
      toast.error('Gagal menambah item: ' + (error as Error).message);
    }
  };

  const updateMenuItemQuantity = (menuId: string, qty: number) => {
    setSelectedMenuItems((prev) => {
      const existing = prev.find((item) => item.menuId === menuId);
      const next = existing
        ? prev.map((item) => (item.menuId === menuId ? { ...item, qty } : item))
        : [ ...prev, { menuId, qty } ];
      return next;
    });
    // Clear note when qty becomes 0
    if (qty === 0) {
      setItemNotes((prev) => {
        const { [menuId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const getMenuItemQuantity = (menuId: string) => {
    return selectedMenuItems.find((item) => item.menuId === menuId)?.qty || 0;
  };

  const setMenuItemNote = (menuId: string, note: string) => {
    setItemNotes((prev) => ({ ...prev, [menuId]: note }));
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Peserta</p>
                <p className="text-2xl font-bold">{participants?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Item Saya</p>
                <p className="text-2xl font-bold">{myItems.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Saya</p>
                <p className="text-2xl font-bold">{formatCurrency(getMyTotal())}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {existingPayment ? 'Kembalian Saya' : 'Status Pembayaran'}
                </p>
                {existingPayment ? (
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(getMyChange())}
                    </p>
                    <p className="text-xs text-gray-500">
                      Dibayar: {formatCurrency(existingPayment.amount)}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-red-600">Belum Dibayar</p>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Pembayaran Saya */}
        <Card className="border rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-gray-500" />
              Pembayaran Saya
            </CardTitle>
            <CardDescription>Atur metode dan jumlah pembayaran Anda untuk pesanan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button type="button" onClick={() => setPaymentMethod('cash')} className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod==='cash' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}>
                      <Wallet className="h-4 w-4" /> Tunai
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('cardless')} className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod==='cardless' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}>
                      <CreditCard className="h-4 w-4" /> Tanpa Kartu
                    </button>
                    <button type="button" onClick={() => setPaymentMethod('dana')} className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod==='dana' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}>
                      <Smartphone className="h-4 w-4" /> DANA
                    </button>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                    <div className="flex-1 sm:w-32">
                      <label className="block text-xs text-gray-500 mb-1">Rp</label>
                      <div className={`flex items-center rounded-lg border ${payErrors.amount ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} bg-white shadow-sm focus-within:ring-2 focus-within:ring-gray-300`}>
                        <Input
                          type="number"
                          placeholder="50000"
                          min="0"
                          value={amount}
                          onChange={(e) => {
 setAmount(e.target.value); if (payErrors.amount) setPayErrors({});
}}
                          className="border-0 focus-visible:ring-0 text-center py-2"
                        />
                      </div>
                    </div>
                    <div className="flex-none">
                      <label className="block text-xs text-transparent mb-1">.</label>
                      <Button
                        onClick={handleSavePayment}
                        disabled={(() => {
 const amt = parseFloat(amount); const myTotal = getMyTotal(); return isNaN(amt) || amt <= 0 || amt < myTotal;
})()}
                        className="py-2"
                      >
                        Simpan Pembayaran
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Total item Anda saat ini: <span className="font-semibold">{formatCurrency(getMyTotal())}</span></p>
                </div>
                <div className="flex gap-4">
                  {existingPayment && (
                    <p className="text-gray-500">Tersimpan: {formatCurrency(existingPayment.amount)}</p>
                  )}
                  <div>
                    {existingPayment ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs">Status: Tersimpan</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs">Status: Belum disimpan</span>
                    )}
                  </div>
                </div>
              </div>
              {payErrors.amount && (
                <p className="text-sm text-red-600">{payErrors.amount}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Order Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Item Pesanan Saya</CardTitle>
                <CardDescription>
                  Item yang telah Anda tambahkan ke pesanan ini {order.status === 'open' ? '(dapat diedit)' : '(hanya baca)'}
                </CardDescription>
              </div>
              {order.status === 'open' && (
                <Button onClick={() => setIsAddItemOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Tambah Item Lagi
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myItems.length > 0 ? (
                myItems.sort((a, b) => b._creationTime - a._creationTime).map((item) => {
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
                          {item.note && (
                            <p className="text-sm text-gray-600 italic">Catatan: {item.note}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            {new Date(item._creationTime).toLocaleString('id-ID', {
                              year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{formatCurrency(itemTotal)}</p>
                        {order.status === 'open' && (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrderItem({ ...item, qty: item.qty });
                                setIsEditItemOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveOrderItem(item._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Anda belum menambahkan item apapun ke pesanan ini.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Participants and Their Orders */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Semua Peserta & Item</h2>

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
                          <CardTitle className="text-lg">
                            {participant.username}
                            {participant._id === user._id && ' (Anda)'}
                          </CardTitle>
                          <CardDescription>
                            {userItems.length} item • Total: {formatCurrency(userTotal)}
                          </CardDescription>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 capitalize">{participant.role}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userItems.sort((a, b) => b._creationTime - a._creationTime).map((item) => {
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
                                {item.note && (
                                  <p className="text-sm text-gray-600 italic">Catatan: {item.note}</p>
                                )}
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

        {/* Order Summary */}
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
                <div className="flex justify-between">
                  <span>Total Peserta:</span>
                  <span>{participants?.length || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Nilai Pesanan:</span>
                  <span>{formatCurrency(getTotalOrderValue())}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Order Item Dialog */}
        <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item Pesanan</DialogTitle>
              <DialogDescription>Perbarui jumlah untuk item ini</DialogDescription>
            </DialogHeader>
            {selectedOrderItem && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium">
                    {menuItems?.find((m) => m._id === selectedOrderItem.menuId)?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(menuItems?.find((m) => m._id === selectedOrderItem.menuId)?.price || 0)} per item
                  </p>
                </div>
                <Input
                  type="number"
                  placeholder="Jumlah"
                  min="1"
                  value={selectedOrderItem.qty}
                  onChange={(e) => setSelectedOrderItem({
                    ...selectedOrderItem,
                    qty: parseInt(e.target.value) || 1,
                  })}
                />
                <Input
                  type="text"
                  placeholder="Catatan (opsional)"
                  value={selectedOrderItem.note ?? ''}
                  onChange={(e) => setSelectedOrderItem({
                    ...selectedOrderItem,
                    note: e.target.value,
                  })}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditItemOpen(false)}>Batal</Button>
              <Button onClick={handleUpdateOrderItem}>Perbarui Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add More Items Dialog */}
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Item Lagi ke Pesanan</DialogTitle>
              <DialogDescription>Pilih item menu dan jumlah untuk ditambahkan ke pesanan ini</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {menuItems?.map((item) => (
                <div key={item._id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
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
                  <div className="mt-2">
                    <Input
                      value={itemNotes[item._id] ?? ''}
                      onChange={(e) => setMenuItemNote(item._id, e.target.value)}
                      placeholder="Catatan (opsional) untuk item ini"
                      className="w-full"
                      disabled={getMenuItemQuantity(item._id) === 0}
                    />
                  </div>
                </div>
              ))}
              {(!menuItems || menuItems.length === 0) && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada item menu tersedia.</p>
                </div>
              )}
            </div>
            {/* Subtotal */}
            <div className="flex items-center justify-between pt-4">
              <span className="font-semibold">Subtotal</span>
              <span className={`font-semibold ${(() => {
 const subtotal = selectedMenuItems.reduce((sum, sel) => {
 const m = menuItems?.find((mi) => mi._id === sel.menuId); return sum + (m ? m.price * sel.qty : 0);
}, 0); const effective = existingPayment?.amount ?? Number.POSITIVE_INFINITY; return subtotal > effective ? 'text-red-600' : '';
})()}`}>
                {formatCurrency(selectedMenuItems.reduce((sum, sel) => {
 const m = menuItems?.find((mi) => mi._id === sel.menuId); return sum + (m ? m.price * sel.qty : 0);
}, 0))}
              </span>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddItemOpen(false);
                setSelectedMenuItems([]);
                setErrors({});
              }}>
                Batal
              </Button>
              <Button
                onClick={handleAddMoreItems}
                disabled={selectedMenuItems.filter((item) => item.qty > 0).length === 0 || (existingPayment ? (selectedMenuItems.reduce((sum, sel) => {
 const m = menuItems?.find((mi) => mi._id === sel.menuId); return sum + (m ? m.price * sel.qty : 0);
}, 0) > existingPayment.amount) : false)}
              >
                Tambah Item ({selectedMenuItems.filter((item) => item.qty > 0).length})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
