'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Id } from '../../../../convex/_generated/dataModel';
import { formatStatus } from '@/lib/status';
import { Wallet, CreditCard, Smartphone } from 'lucide-react';

export default function UserPesananPage() {
  const { user } = useAuth();
  const availableOrders = useQuery(api.boedor.orders.getOrdersByStatus,
    user?._id ? { status: 'open', currentUserId: user._id } : 'skip',
  );
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems,
    user?._id ? { currentUserId: user._id } : 'skip',
  );
  const addOrderItem = useMutation(api.boedor.orderItems.addOrderItem);
  const upsertPayment = useMutation(api.boedor.payment.upsertPayment);

  const [isJoinOrderOpen, setIsJoinOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState<Array<{ menuId: string, qty: number }>>([]);
  const [errors, setErrors] = useState<{ items?: string; selectedOrder?: string; payment?: string }>({});

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cardless' | 'dana'>('cash');
  const [amount, setAmount] = useState('');
  // Per-item notes keyed by menuId
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  // Menu filter state
  const [menuFilter, setMenuFilter] = useState('');

  // Fetch existing payment for this user and selected order (to prefill form)
  const existingPayment = useQuery(
    api.boedor.payment.getPaymentByOrderUser,
    selectedOrder && user ? {
      orderId: selectedOrder._id,
      userId: user._id,
      currentUserId: user._id,
    } : 'skip',
  );

  // Fetch current order items for selected order to know user's current total (remaining balance)
  const orderItems = useQuery(
    api.boedor.orderItems.getOrderItemsByOrder,
    selectedOrder && user ? {
      orderId: selectedOrder._id as Id<'boedor_orders'>,
      currentUserId: user._id,
    } : 'skip',
  );

  // Prefill payment form when existing payment is found
  useEffect(() => {
    if (existingPayment) {
      setPaymentMethod(existingPayment.paymentMethod as 'cash' | 'cardless' | 'dana');
      setAmount(existingPayment.amount.toString());
    } else {
      setPaymentMethod('cash');
      setAmount('');
    }
  }, [existingPayment]);



  // Zod Schemas & validator
  const menuItemSchema = z.object({
    menuId: z.string().min(1, 'Menu tidak valid'),
    qty: z.number().int().min(0, 'Jumlah tidak boleh negatif'),
  });

  const buildSchema = () => {
    const baseSchema = {
      selectedOrder: z.any().refine((v) => !!v && !!v._id, 'Pilih pesanan yang valid'),
      items: z.array(menuItemSchema).refine((arr) => arr.some((i) => i.qty > 0), 'Pilih minimal 1 item'),
    };

    // If no existing payment, require payment fields
    if (!existingPayment) {
      return z.object({
        ...baseSchema,
        paymentMethod: z.enum(['cash', 'cardless', 'dana']),
        amount: z.string().min(1, 'Masukkan jumlah pembayaran').refine((val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        }, 'Jumlah harus lebih dari 0'),
      });
    }

    return z.object(baseSchema);
  };

  const validateForm = (): { ok: true } | { ok: false } => {
    setErrors({});
    const data = {
      selectedOrder,
      items: selectedMenuItems,
      paymentMethod,
      amount,
    };
    try {
      const schema = buildSchema();
      const parsed = schema.parse(data);
      parsed; // no-op
      return { ok: true };
    } catch (e: any) {
      if (e?.issues) {
        const nextErrors: typeof errors = {};
        for (const issue of e.issues as Array<{ path: (string | number)[]; message: string }>) {
          const key = issue.path[0];
          if (key === 'items') nextErrors.items = issue.message;
          if (key === 'selectedOrder') nextErrors.selectedOrder = issue.message;
          if (key === 'paymentMethod' || key === 'amount') nextErrors.payment = issue.message;
        }
        setErrors(nextErrors);
      }
      toast.error('Input tidak valid. Mohon periksa kembali.');
      return { ok: false };
    }
  };

  const handleJoinOrder = async () => {
    if (selectedOrder && selectedMenuItems.length > 0) {
      try {
        const validation = validateForm();
        if (!('ok' in validation) || !validation.ok) return;

        // If user has an existing payment for this order, ensure current items + new subtotal <= payment amount
        const subtotal = calcSubtotal();
        if (existingPayment && typeof existingPayment.amount === 'number') {
          const myCurrent = getMyCurrentTotal();
          if (myCurrent + subtotal > existingPayment.amount) {
            toast.error('Subtotal melebihi sisa kembalian Anda');
            return;
          }
        }

        // Add all selected items to the order
        for (const item of selectedMenuItems) {
          if (item.qty > 0) {
            await addOrderItem({
              orderId: selectedOrder._id,
              menuId: item.menuId as Id<'boedor_menu'>,
              qty: item.qty,
              note: itemNotes[item.menuId]?.trim() ? itemNotes[item.menuId].trim() : undefined,
              currentUserId: user!._id,
            });
          }
        }

        // Save payment if no existing payment
        if (!existingPayment && amount && paymentMethod) {
          const subtotal = calcSubtotal();
          const paymentAmount = parseFloat(amount);

          if (paymentAmount < subtotal) {
            toast.error('Jumlah pembayaran kurang dari total pesanan');
            return;
          }

          await upsertPayment({
            orderId: selectedOrder._id,
            paymentMethod,
            amount: paymentAmount,
            currentUserId: user!._id,
          });
        }

        toast.success('Berhasil bergabung dengan pesanan!');
        setIsJoinOrderOpen(false);
        setSelectedOrder(null);
        setSelectedMenuItems([]);
        setPaymentMethod('cash');
        setAmount('');
        setItemNotes({});
      } catch (error) {
        toast.error('Gagal bergabung dengan pesanan');
      }
    }
  };

  const updateMenuItemQuantity = (menuId: string, qty: number) => {
    setSelectedMenuItems((prev) => {
      const existing = prev.find((item) => item.menuId === menuId);
      const next = existing
        ? prev.map((item) => (item.menuId === menuId ? { ...item, qty } : item))
        : [...prev, { menuId, qty }];
      return next;
    });
    // If qty becomes 0, clear its note
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const calcSubtotal = () => {
    if (!menuItems) return 0;
    return selectedMenuItems.reduce((sum, sel) => {
      const item = menuItems.find((m) => m._id === sel.menuId);
      if (!item) return sum;
      return sum + (item.price * sel.qty);
    }, 0);
  };

  // Current user's existing total on the selected order (before adding in this dialog)
  const getMyCurrentTotal = () => {
    if (!orderItems || !menuItems || !user) return 0;
    const myItems = orderItems.filter((it: any) => it.userId === user._id);
    return myItems.reduce((sum: number, it: any) => {
      const m = menuItems.find((mm) => mm._id === it.menuId);
      return sum + (m ? m.price * it.qty : 0);
    }, 0);
  };

  // Filter and sort menu items
  const getFilteredMenuItems = () => {
    if (!menuItems) return [];

    return menuItems
      .filter((item) =>
        item.name.toLowerCase().includes(menuFilter.toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Memuat...</p>
        </div>
      </Layout>
    );
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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan Tersedia</h1>
          <p className="mt-2 text-gray-600">Bergabung dengan pesanan yang ada dari pengemudi</p>
        </div>

        {/* Available Orders */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {availableOrders?.filter((order) => order.status === 'open')
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Pesanan #{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-500">Status: {formatStatus(order.status)}</p>
                      <p className="text-sm text-gray-500">
                        Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedOrder(order);
                        // Reset form when opening dialog
                        setSelectedMenuItems([]);
                        setMenuFilter('');
                        setIsJoinOrderOpen(true);
                      }}
                    >
                      Gabung Pesanan
                    </Button>
                  </div>
                ))}
              {(!availableOrders || availableOrders.filter((order) => order.status === 'open').length === 0) && (
                <p className="text-gray-500 text-center py-8">Tidak ada pesanan tersedia saat ini</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Join Order Dialog */}
        <Dialog open={isJoinOrderOpen} onOpenChange={setIsJoinOrderOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gabung Pesanan #{selectedOrder?._id.slice(-6)}</DialogTitle>
              <DialogDescription>Pilih item menu dan jumlahnya</DialogDescription>
            </DialogHeader>

            {/* Items error */}
            {errors.items && (
              <p className="text-sm text-red-600">{errors.items}</p>
            )}

            {/* Menu Filter */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Cari menu..."
                value={menuFilter}
                onChange={(e) => setMenuFilter(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {getFilteredMenuItems().map((item) => (
                <div key={item._id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(item.price)}
                      </p>
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
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between pt-4">
              <span className="font-semibold">Subtotal</span>
              <span className={`font-semibold ${(() => {
                const subtotal = calcSubtotal();
                const remaining = existingPayment ? (existingPayment.amount - getMyCurrentTotal()) : Number.POSITIVE_INFINITY;
                return subtotal > remaining ? 'text-red-600' : '';
              })()}`}>
                {formatCurrency(calcSubtotal())}
              </span>
            </div>

            {/* Per-item notes are provided inline above; no global note field */}

            {/* Payment Form - Show only if no existing payment */}
            {!existingPayment && (
              <div className="border-t pt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pembayaran</h4>
                  {errors.payment && (
                    <p className="text-sm text-red-600 mb-2">{errors.payment}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'cash' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}
                      >
                        <Wallet className="h-4 w-4" /> Tunai
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cardless')}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'cardless' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}
                      >
                        <CreditCard className="h-4 w-4" /> Tanpa Kartu
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('dana')}
                        className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'dana' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}
                      >
                        <Smartphone className="h-4 w-4" /> DANA
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pembayaran</label>
                    <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-gray-300">
                      <span className="px-3 text-sm text-gray-500">Rp</span>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="border-0 focus-visible:ring-0 text-right"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimal: {formatCurrency(calcSubtotal())}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsJoinOrderOpen(false)}>Batal</Button>
              <Button
                onClick={handleJoinOrder}
                disabled={(() => {
                  const hasSelection = selectedMenuItems.some((i) => i.qty > 0);
                  if (!hasSelection) return true;
                  if (!existingPayment) return false;
                  const newSubtotal = calcSubtotal();
                  return (getMyCurrentTotal() + newSubtotal) > existingPayment.amount;
                })()}
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
