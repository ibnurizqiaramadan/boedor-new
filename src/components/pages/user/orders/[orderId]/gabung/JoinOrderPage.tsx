'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { Id } from '../../../../../../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { JoinOrderHeader } from './JoinOrderHeader';
import { JoinOrderInfo } from './JoinOrderInfo';
import { MenuSelection } from './MenuSelection';
import { PaymentForm } from './PaymentForm';
import { JoinOrderActions } from './JoinOrderActions';
import type { OrderItem } from '@/lib/types';

export default function JoinOrderPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  // Redirect if unauthenticated, but wait until auth finished loading
  useEffect(() => {
    if (!isLoading && user === null) router.push('/');
  }, [ user, isLoading, router ]);

  // Redirect drivers (and any non-normal user) to driver order detail
  useEffect(() => {
    if (!isLoading && user && user.role !== 'user') {
      router.replace(`/driver/orders/${orderId}`);
    }
  }, [ isLoading, user, orderId, router ]);

  // Queries (always call hooks; use 'skip' when auth not ready)
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
  const [ menuFilter, setMenuFilter ] = useState('');
  const [ minPrice, setMinPrice ] = useState<string>('');
  const [ maxPrice, setMaxPrice ] = useState<string>('');
  const [ selectedMenuItems, setSelectedMenuItems ] = useState<Array<{ menuId: string; qty: number }>>([]);
  const [ itemNotes, setItemNotes ] = useState<Record<string, string>>({});
  const [ paymentMethod, setPaymentMethod ] = useState<'cash' | 'cardless' | 'dana'>('cash');
  const [ amount, setAmount ] = useState('');

  // Prefill payment form when existing payment is found
  useEffect(() => {
    if (existingPayment) {
      setPaymentMethod(existingPayment.paymentMethod as 'cash' | 'cardless' | 'dana');
      setAmount(existingPayment.amount.toString());
    } else {
      setPaymentMethod('cash');
      setAmount('');
    }
  }, [ existingPayment ]);

  const filteredMenuItems = useMemo(() => {
    return (menuItems ?? [])
      .filter((m) => {
        const nameMatch = m.name.toLowerCase().includes(menuFilter.toLowerCase());

        // Handle price filtering
        const hasMinPrice = minPrice.trim() !== '';
        const hasMaxPrice = maxPrice.trim() !== '';

        const minPriceNum = hasMinPrice ? parseFloat(minPrice.trim()) : 0;
        const maxPriceNum = hasMaxPrice ? parseFloat(maxPrice.trim()) : Infinity;

        const minPriceMatch = !hasMinPrice || (!isNaN(minPriceNum) && m.price >= minPriceNum);
        const maxPriceMatch = !hasMaxPrice || (!isNaN(maxPriceNum) && m.price <= maxPriceNum);


        return nameMatch && minPriceMatch && maxPriceMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
  }, [ menuItems, menuFilter, minPrice, maxPrice ]);

  const getMenuItemQuantity = (menuId: string) => selectedMenuItems.find((i) => i.menuId === menuId)?.qty || 0;

  const updateMenuItemQuantity = (menuId: string, qty: number) => {
    setSelectedMenuItems((prev) => {
      const existing = prev.find((i) => i.menuId === menuId);
      const next = existing ? prev.map((i) => (i.menuId === menuId ? { ...i, qty } : i)) : [ ...prev, { menuId, qty } ];
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
    const myItems = orderItems.filter((it: OrderItem) => it.userId === user._id);
    return myItems.reduce((sum: number, it: OrderItem) => {
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

      // Save payment if no existing payment
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
        <JoinOrderHeader orderId={orderId} onBack={() => router.back()} />

        <JoinOrderInfo
          orderId={orderId}
          menuFilter={menuFilter}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMenuFilterChange={setMenuFilter}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
        />

        <MenuSelection
          menuItems={filteredMenuItems}
          selectedMenuItems={selectedMenuItems}
          itemNotes={itemNotes}
          getMenuItemQuantity={getMenuItemQuantity}
          onMenuItemQuantityChange={updateMenuItemQuantity}
          onMenuItemNoteChange={setMenuItemNote}
        />

        <div className="flex items-center justify-between pt-4">
          <span className="font-semibold">Subtotal</span>
          <span className={`font-semibold ${calcSubtotal() > remaining ? 'text-red-600' : ''}`}>
            {formatCurrency(calcSubtotal())}
          </span>
        </div>

        {!existingPayment && (
          <PaymentForm
            paymentMethod={paymentMethod}
            amount={amount}
            subtotal={calcSubtotal()}
            onPaymentMethodChange={setPaymentMethod}
            onAmountChange={setAmount}
          />
        )}

        <JoinOrderActions
          selectedMenuItems={selectedMenuItems}
          existingPayment={existingPayment || null}
          getMyCurrentTotal={getMyCurrentTotal}
          calcSubtotal={calcSubtotal}
          onJoinOrder={handleJoinOrder}
          onCancel={() => router.back()}
        />
      </div>
    </Layout>
  );
}