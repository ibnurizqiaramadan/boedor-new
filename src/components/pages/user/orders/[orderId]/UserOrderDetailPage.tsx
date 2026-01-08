'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import Layout from '@/components/layout/Layout';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { OrderDetailHeader } from './OrderDetailHeader';
import { OrderDetailStats } from './OrderDetailStats';
import { PaymentSection } from './PaymentSection';
import { MyOrderItems } from './MyOrderItems';
import { AllParticipants } from './AllParticipants';
import { OrderSummary } from './OrderSummary';
import { EditOrderItemDialog } from './EditOrderItemDialog';
import { AddMoreItemsDialog } from './AddMoreItemsDialog';

export default function UserOrderDetailPage() {
  const { user, isLoading } = useAuth();
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
  const [ payErrors, setPayErrors ] = useState<{ amount?: string }>({});
  const [ menuFilter, setMenuFilter ] = useState('');
  const [ minPrice, setMinPrice ] = useState<string>('');
  const [ maxPrice, setMaxPrice ] = useState<string>('');

  // Queries
  const order = useQuery(
    api.boedor.orders.getOrderById,
    !isLoading && user ? { orderId: orderId as Id<'boedor_orders'>, currentUserId: user._id } : 'skip',
  );
  const orderItems = useQuery(
    api.boedor.orderItems.getOrderItemsByOrder,
    !isLoading && user ? { orderId: orderId as Id<'boedor_orders'>, currentUserId: user._id } : 'skip',
  );
  const menuItems = useQuery(
    api.boedor.menu.getAllMenuItems,
    !isLoading && user ? { currentUserId: user._id } : 'skip',
  );

  // Get unique participant IDs from order items
  const participantIds = orderItems ? [ ...new Set(orderItems.map((item) => item.userId)) ] : [];

  // Get usernames for participants
  const participants = useQuery(
    api.boedor.users.getUsernamesByIds,
    !isLoading && user && participantIds.length > 0 ? { userIds: participantIds, currentUserId: user._id } : 'skip',
  );

  // Query existing payment for this order
  const existingPayment = useQuery(
    api.boedor.payment.getPaymentByOrderUser,
    !isLoading && user ? {
      orderId: orderId as Id<'boedor_orders'>,
      userId: user._id,
      currentUserId: user._id,
    } : 'skip',
  );

  // Filter menu items for add more dialog
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

  // Compute membership quickly for redirect effect
  const myItemsCount = orderItems ? orderItems.filter((item) => item.userId === (user?._id as any)).length : 0;

  // Redirect handling placed before any early returns to keep hook order stable
  useEffect(() => {
    if (!isLoading && user === null) {
      router.push('/');
      return;
    }
    if (!isLoading && user && order && orderItems && myItemsCount === 0) {
      router.replace(`/user/orders/${orderId}/gabung`);
    }
  }, [ isLoading, user, order, orderItems, myItemsCount, router, orderId ]);

  // After all hooks, handle early-return rendering
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Memuat detail pesanan...</p>
        </div>
      </Layout>
    );
  }

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
        // If payment exists, ensure the new total (with edited item qty) does not exceed payment
        if (existingPayment && menuItems) {
          const price = menuItems.find((m) => m._id === selectedOrderItem.menuId)?.price || 0;
          const currentTotalExcluding = myItems.reduce((sum, it) => {
            if (it._id === selectedOrderItem._id) return sum;
            const m = menuItems.find((mm) => mm._id === it.menuId);
            return sum + (m ? m.price * it.qty : 0);
          }, 0);
          const projected = currentTotalExcluding + (price * selectedOrderItem.qty);
          if (projected > existingPayment.amount) {
            toast.error('Perubahan melebihi jumlah bayar yang tersimpan');
            return;
          }
        }
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
      // If user already has a payment recorded, ensure current total + new subtotal does not exceed it
      if (existingPayment) {
        const myCurrent = getMyTotal();
        if (myCurrent + subtotal > existingPayment.amount) {
          toast.error('Subtotal melebihi sisa kembalian Anda');
          return;
        }
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
      }
    } catch (error) {
      console.error('Failed to add items:', error);
      toast.error('Gagal menambah item: ' + (error as Error).message);
    }
  };

  const updateMenuItemQuantity = (menuId: string, qty: number) => {
    setSelectedMenuItems((prev) => {
      const existing = prev.find((i) => i.menuId === menuId);
      const next = existing ?
        prev.map((i) => (i.menuId === menuId ? { ...i, qty } : i)) :
        [ ...prev, { menuId, qty } ];
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
        <OrderDetailHeader
          orderId={orderId}
          onBack={() => router.back()}
          onTrack={() => router.push(`/user/orders/${orderId}/lacak`)}
        />

        <OrderDetailStats
          order={order}
          participantsCount={participants?.length || 0}
          myItemsCount={myItems.length}
          myTotal={getMyTotal()}
          existingPayment={existingPayment}
          myChange={getMyChange()}
        />

        <PaymentSection
          order={order}
          paymentMethod={paymentMethod}
          amount={amount}
          payErrors={payErrors}
          existingPayment={existingPayment}
          myTotal={getMyTotal()}
          onPaymentMethodChange={setPaymentMethod}
          onAmountChange={(value) => {
            setAmount(value);
            if (payErrors.amount) setPayErrors({});
          }}
          onSavePayment={handleSavePayment}
        />

        <MyOrderItems
          myItems={myItems}
          menuItems={menuItems}
          order={order}
          onEditItem={(item) => {
            setSelectedOrderItem({ ...item, qty: item.qty });
            setIsEditItemOpen(true);
          }}
          onRemoveItem={handleRemoveOrderItem}
          onAddMore={() => setIsAddItemOpen(true)}
        />

        <AllParticipants
          itemsByUser={itemsByUser}
          menuItems={menuItems}
          participants={participants}
          currentUserId={user._id}
          getUserTotal={getUserTotal}
        />

        {orderItems && orderItems.length > 0 && (
          <OrderSummary
            orderItemsCount={orderItems.length}
            participantsCount={participants?.length || 0}
            totalValue={getTotalOrderValue()}
          />
        )}

        <EditOrderItemDialog
          open={isEditItemOpen}
          onOpenChange={setIsEditItemOpen}
          selectedOrderItem={selectedOrderItem}
          menuItems={menuItems}
          onUpdateItem={(updatedItem) => setSelectedOrderItem(updatedItem)}
          onSave={handleUpdateOrderItem}
        />

        <AddMoreItemsDialog
          open={isAddItemOpen}
          onOpenChange={setIsAddItemOpen}
          menuItems={filteredMenuItems}
          menuFilter={menuFilter}
          minPrice={minPrice}
          maxPrice={maxPrice}
          selectedMenuItems={selectedMenuItems}
          itemNotes={itemNotes}
          existingPayment={existingPayment}
          getMyTotal={getMyTotal}
          getMenuItemQuantity={getMenuItemQuantity}
          onMenuFilterChange={setMenuFilter}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onMenuItemQuantityChange={updateMenuItemQuantity}
          onMenuItemNoteChange={setMenuItemNote}
          onAddItems={handleAddMoreItems}
        />
      </div>
    </Layout>
  );
}