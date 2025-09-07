'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Smartphone, Wallet } from 'lucide-react';

export default function GabungPesananPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  // Redirect if unauthenticated, but wait until auth finished loading
  useEffect(() => {
    if (!isLoading && user === null) router.push('/');
  }, [user, isLoading, router]);

  // Redirect drivers (and any non-normal user) to driver order detail
  useEffect(() => {
    if (!isLoading && user && user.role !== 'user') {
      router.replace(`/driver/orders/${orderId}`);
    }
  }, [isLoading, user, orderId, router]);

  // Queries (always call hooks; use 'skip' while loading or unauthenticated)
  const order = useQuery(
    api.boedor.orders.getOrderById,
    !isLoading && user && user.role === 'user' ? { orderId: orderId as Id<'boedor_orders'>, currentUserId: user._id } : 'skip',
  );
  const menuItems = useQuery(
    api.boedor.menu.getAllMenuItems,
    !isLoading && user && user.role === 'user' ? { currentUserId: user._id } : 'skip',
  );
  const existingPayment = useQuery(
    api.boedor.payment.getPaymentByOrderUser,
    !isLoading && user && user.role === 'user' ? { orderId: orderId as Id<'boedor_orders'>, userId: user._id, currentUserId: user._id } : 'skip',
  );
  const orderItems = useQuery(
    api.boedor.orderItems.getOrderItemsByOrder,
    !isLoading && user && user.role === 'user' ? { orderId: orderId as Id<'boedor_orders'>, currentUserId: user._id } : 'skip',
  );

  // Mutations
  const addOrderItem = useMutation(api.boedor.orderItems.addOrderItem);
  const upsertPayment = useMutation(api.boedor.payment.upsertPayment);

  // State
  const [menuFilter, setMenuFilter] = useState('');
  const [selectedMenuItems, setSelectedMenuItems] = useState<Array<{ menuId: string; qty: number }>>([]);
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cardless' | 'dana'>('cash');
  const [amount, setAmount] = useState('');

  // Prefill payment state
  useEffect(() => {
    if (existingPayment) {
      setPaymentMethod(existingPayment.paymentMethod as 'cash' | 'cardless' | 'dana');
      setAmount(existingPayment.amount.toString());
    } else {
      setPaymentMethod('cash');
      setAmount('');
    }
  }, [existingPayment]);

  const filteredMenuItems = useMemo(() => {
    return (menuItems ?? [])
      .filter((m) => m.name.toLowerCase().includes(menuFilter.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
  }, [menuItems, menuFilter]);

  const getMenuItemQuantity = (menuId: string) => selectedMenuItems.find((i) => i.menuId === menuId)?.qty || 0;
  const updateMenuItemQuantity = (menuId: string, qty: number) => {
    setSelectedMenuItems((prev) => {
      const existing = prev.find((i) => i.menuId === menuId);
      const next = existing ? prev.map((i) => (i.menuId === menuId ? { ...i, qty } : i)) : [...prev, { menuId, qty }];
      return next;
    });
    if (qty === 0) {
      setItemNotes((prev) => {
        const { [menuId]: _, ...rest } = prev;
        return rest;
      });
    }
  };
  const setMenuItemNote = (menuId: string, note: string) => setItemNotes((prev) => ({ ...prev, [menuId]: note }));

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const getMyCurrentTotal = () => {
    if (!orderItems || !menuItems || !user) return 0;
    const myItems = orderItems.filter((it: any) => it.userId === user._id);
    return myItems.reduce((sum: number, it: any) => {
      const m = menuItems.find((mm) => mm._id === it.menuId);
      return sum + (m ? m.price * it.qty : 0);
    }, 0);
  };

  const calcSubtotal = () => {
    if (!menuItems) return 0;
    return selectedMenuItems.reduce((sum, sel) => {
      const item = menuItems.find((m) => m._id === sel.menuId);
      if (!item) return sum;
      return sum + item.price * sel.qty;
    }, 0);
  };

  const handleJoinOrder = async () => {
    try {
      // Ensure authenticated before proceeding
      if (isLoading || !user) {
        toast.error('Silakan masuk terlebih dahulu');
        return;
      }
      // basic validations
      const hasSelection = selectedMenuItems.some((i) => i.qty > 0);
      if (!hasSelection) {
        toast.error('Pilih minimal 1 item');
        return;
      }

      const subtotal = calcSubtotal();
      if (existingPayment && typeof existingPayment.amount === 'number') {
        const myCurrent = getMyCurrentTotal();
        if (myCurrent + subtotal > existingPayment.amount) {
          toast.error('Subtotal melebihi sisa kembalian Anda');
          return;
        }
      }

      // If no existing payment, require amount >= subtotal
      if (!existingPayment) {
        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0 || paymentAmount < subtotal) {
          toast.error('Jumlah pembayaran tidak valid atau kurang dari total');
          return;
        }
      }

      // Add items
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

      // Save payment if needed
      if (!existingPayment) {
        const paymentAmount = parseFloat(amount);
        await upsertPayment({
          orderId: orderId as Id<'boedor_orders'>,
          paymentMethod,
          amount: paymentAmount,
          currentUserId: user._id,
        });
      }

      toast.success('Berhasil bergabung dengan pesanan!');
      router.replace(`/user/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error('Gagal bergabung dengan pesanan');
    }
  };

  // While redirecting non-users away, render nothing
  if (user && user.role !== 'user') {
    return null;
  }

  if (!order) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Memuat pesanan...</p>
        </div>
      </Layout>
    );
  }

  const remaining = existingPayment ? existingPayment.amount - getMyCurrentTotal() : Number.POSITIVE_INFINITY;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:items-center">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="shrink-0">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Gabung Pesanan</h1>
            <p className="text-sm sm:text-base text-gray-600 break-all">Pesanan #{orderId.slice(-8)}</p>
          </div>
        </div>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Item Menu</CardTitle>
            <CardDescription>Pilih item dan jumlah yang ingin Anda tambahkan ke pesanan ini</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filter */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Cari menu..."
                value={menuFilter}
                onChange={(e) => setMenuFilter(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Menu List */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {filteredMenuItems.map((item) => (
                <div key={item._id} className="p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => updateMenuItemQuantity(item._id, Math.max(0, getMenuItemQuantity(item._id) - 1))}>-</Button>
                      <span className="w-8 text-center">{getMenuItemQuantity(item._id)}</span>
                      <Button variant="outline" size="sm" onClick={() => updateMenuItemQuantity(item._id, getMenuItemQuantity(item._id) + 1)}>+</Button>
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
                  <p className="text-gray-500">Tidak ada item menu tersedia.</p>
                </div>
              )}
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between pt-4">
              <span className="font-semibold">Subtotal</span>
              <span className={`font-semibold ${calcSubtotal() > remaining ? 'text-red-600' : ''}`}>{formatCurrency(calcSubtotal())}</span>
            </div>

            {/* Payment (only when no existing payment) */}
            {!existingPayment && (
              <div className="border-t pt-4 space-y-4 mt-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Pembayaran</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setPaymentMethod('cash')} className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'cash' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}>
                        <Wallet className="h-4 w-4" /> Tunai
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('cardless')} className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'cardless' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}>
                        <CreditCard className="h-4 w-4" /> Tanpa Kartu
                      </button>
                      <button type="button" onClick={() => setPaymentMethod('dana')} className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'dana' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}>
                        <Smartphone className="h-4 w-4" /> DANA
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pembayaran</label>
                    <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-gray-300">
                      <span className="px-3 text-sm text-gray-500">Rp</span>
                      <Input type="number" placeholder="0" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="border-0 focus-visible:ring-0 text-right" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimal: {formatCurrency(calcSubtotal())}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-6">
              <Button variant="outline" onClick={() => router.back()}>Batal</Button>
              <Button onClick={handleJoinOrder} disabled={(() => {
                const count = selectedMenuItems.filter((i) => i.qty > 0).length;
                if (count === 0) return true;
                if (!existingPayment) return false;
                const newSubtotal = calcSubtotal();
                return getMyCurrentTotal() + newSubtotal > (existingPayment?.amount ?? 0);
              })()}>
                Gabung Pesanan ({selectedMenuItems.filter((i) => i.qty > 0).length} item)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
