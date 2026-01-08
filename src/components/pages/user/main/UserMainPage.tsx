'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';
import Layout from '@/components/layout/Layout';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';
import { UserStatsCards } from './UserStatsCards';
import { UserReportsSection } from './UserReportsSection';
import { UserOrderItems } from './UserOrderItems';
import { JoinOrderDialog } from './JoinOrderDialog';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

export default function UserMainPage() {
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
  const [ currentPage, setCurrentPage ] = useState(1);

  const ORDERS_PER_PAGE = 5; // Show 5 orders per page

  // Queries
  const availableOrders = useQuery(api.boedor.orders.getAllOrders, user ? { currentUserId: user._id } : 'skip');
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? { currentUserId: user._id } : 'skip');
  const myOrderItems = useQuery(api.boedor.orderItems.getOrderItemsByUser, user ? { userId: user._id, currentUserId: user._id } : 'skip');
  const myPayments = useQuery(api.boedor.payment.getPaymentsByUser, user ? { userId: user._id, currentUserId: user._id } : 'skip');

  // Query existing payment for selected order
  const existingPayment = useQuery(
    api.boedor.payment.getPaymentByOrderUser,
    selectedOrder && user ? {
      orderId: selectedOrder._id,
      userId: user._id,
      currentUserId: user._id,
    } : 'skip',
  );

  // Group and paginate order items
  const groupedOrders = myOrderItems?.reduce((acc, item) => {
    const orderId = item.orderId;
    if (!acc[orderId]) {
      acc[orderId] = {
        orderId,
        totalItems: 0,
        items: [],
        latestTime: 0,
      };
    }
    acc[orderId].totalItems += item.qty;
    acc[orderId].items.push(item);
    acc[orderId].latestTime = Math.max(acc[orderId].latestTime, item._creationTime);
    return acc;
  }, {} as Record<string, { orderId: string; totalItems: number; items: any[]; latestTime: number }>) || {};

  const sortedOrders = Object.values(groupedOrders).sort((a, b) => b.latestTime - a.latestTime);
  const totalOrders = sortedOrders.length;
  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Reset to first page when orders change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [totalOrders]);

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

  // Report calculations
  const calculateReports = () => {
    if (!myPayments || !myOrderItems || !menuItems) {
      return {
        averageSpending: 0,
        totalSpending: 0,
        totalOrders: 0,
        frequentlyOrdered: [],
        recommendations: [],
      };
    }

    // Calculate average spending based on actual food orders (qty * price)
    const orderSpending = myOrderItems.reduce((sum, orderItem) => {
      const menuItem = menuItems.find((item) => item._id === orderItem.menuId);
      if (menuItem) {
        return sum + (menuItem.price * orderItem.qty);
      }
      return sum;
    }, 0);

    // Group spending by order to get per-order totals
    const spendingByOrder = myOrderItems.reduce((acc, orderItem) => {
      const menuItem = menuItems.find((item) => item._id === orderItem.menuId);
      if (menuItem) {
        if (!acc[orderItem.orderId]) {
          acc[orderItem.orderId] = 0;
        }
        acc[orderItem.orderId] += menuItem.price * orderItem.qty;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalSpending = orderSpending;
    const totalOrders = Object.keys(spendingByOrder).length;
    const averageSpending = totalOrders > 0 ? totalSpending / totalOrders : 0;

    // Calculate frequently ordered items
    const itemCounts = myOrderItems.reduce((acc, orderItem) => {
      const menuItem = menuItems.find((item) => item._id === orderItem.menuId);
      if (menuItem) {
        const key = menuItem._id;
        if (!acc[key]) {
          acc[key] = {
            name: menuItem.name,
            price: menuItem.price,
            count: 0,
            totalQty: 0,
          };
        }
        acc[key].count += 1;
        acc[key].totalQty += orderItem.qty;
      }
      return acc;
    }, {} as Record<string, { name: string; price: number; count: number; totalQty: number }>);

    const frequentlyOrdered = Object.values(itemCounts)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);

    // Generate recommendations (items not ordered yet or ordered less frequently)
    const orderedItemIds = new Set(Object.keys(itemCounts));
    const recommendations = menuItems
      .filter((item) => !orderedItemIds.has(item._id) || (itemCounts[item._id]?.totalQty || 0) < 3)
      .sort(() => Math.random() - 0.5) // Random shuffle
      .slice(0, 3);

    return {
      averageSpending,
      totalSpending,
      totalOrders,
      frequentlyOrdered,
      recommendations,
    };
  };

  const reports = calculateReports();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dasbor Pengguna</h1>
          <p className="mt-2 text-gray-600">Jelajahi pesanan dan usulkan item menu</p>
        </div>

        <UserStatsCards
          availableOrdersCount={availableOrders?.filter((order) => order.status === 'open').length || 0}
          myOrderItemsCount={myOrderItems?.length || 0}
          menuItemsCount={menuItems?.length || 0}
        />

        <UserReportsSection reports={reports} />

        <UserOrderItems
          paginatedOrders={paginatedOrders}
          availableOrders={availableOrders || []}
          onOrderClick={(orderId) => router.push(`/user/orders/${orderId}`)}
          onJoinOrder={(order) => {
            setSelectedOrder(order);
            setIsJoinOrderOpen(true);
          }}
        />

        {/* Pagination for User Order Items */}
        {totalOrders > 0 && (
          <div className="mt-4 flex flex-col items-center space-y-2">
            <PaginationInfo
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalOrders}
              itemsPerPage={ORDERS_PER_PAGE}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        <JoinOrderDialog
          open={isJoinOrderOpen}
          onOpenChange={setIsJoinOrderOpen}
          selectedOrder={selectedOrder}
          menuItems={menuItems || []}
          selectedMenuItems={selectedMenuItems}
          paymentMethod={paymentMethod}
          amount={amount}
          note={note}
          existingPayment={existingPayment}
          onPaymentMethodChange={setPaymentMethod}
          onAmountChange={setAmount}
          onNoteChange={setNote}
          onMenuItemQuantityChange={updateMenuItemQuantity}
          onJoinOrder={handleJoinOrder}
          getMenuItemQuantity={getMenuItemQuantity}
        />
      </div>
    </Layout>
  );
}