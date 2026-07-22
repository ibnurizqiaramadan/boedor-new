'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

import Layout from '@/components/layout/Layout';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bike } from 'lucide-react';
import { UserStatsCards } from './UserStatsCards';
import { UserReportsSection } from './UserReportsSection';
import { UserOrderItems } from './UserOrderItems';
import type { OrderItem } from '@/lib/types';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

export default function UserMainPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ currentPage, setCurrentPage ] = useState(1);

  const ORDERS_PER_PAGE = 5; // Show 5 orders per page

  // Queries
  const availableOrders = useQuery(api.boedor.orders.getAllOrders, user ? {} : 'skip');
  const menuItems = useQuery(api.boedor.menu.getAllMenuItems, user ? {} : 'skip');
  const myOrderItems = useQuery(api.boedor.orderItems.getOrderItemsByUser, user ? { userId: user._id } : 'skip');
  const myPayments = useQuery(api.boedor.payment.getPaymentsByUser, user ? { userId: user._id } : 'skip');

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
  }, {} as Record<string, { orderId: string; totalItems: number; items: OrderItem[]; latestTime: number }>) || {};

  const sortedOrders = Object.values(groupedOrders).sort((a, b) => b.latestTime - a.latestTime);
  const totalOrders = sortedOrders.length;
  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Clamp page when the list shrinks (don't yank the user to page 1 on realtime updates)
  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) setCurrentPage(totalPages);
  }, [ currentPage, totalPages ]);

  // Open orders + their driver names
  const openOrders = (availableOrders ?? []).filter((order) => order.status === 'open');
  const driverNames = useQuery(
    api.boedor.users.getUsernamesByIds,
    user && openOrders.length > 0 ? { userIds: openOrders.map((order) => order.driverId) } : 'skip',
  );
  const driverOf = (driverId: string) => {
    const driver = driverNames?.find((d) => d?._id === driverId);
    return driver?.name || driver?.username || 'Driver';
  };

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
          <p className="text-destructive">Akses ditolak. Khusus pengguna.</p>
        </div>
      </Layout>
    );
  }

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
          <h1 className="font-display text-3xl text-foreground">
            Halo, {(user.name || user.username || 'Pengguna').split(' ')[0]}!
          </h1>
          <p className="mt-2 text-muted-foreground">Gabung pesanan terbuka atau cek riwayat pesananmu</p>
        </div>

        <UserStatsCards
          availableOrdersCount={openOrders.length}
          myOrderItemsCount={myOrderItems?.length || 0}
          menuItemsCount={menuItems?.length || 0}
        />

        {/* Open orders: primary action on this page */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Pesanan Terbuka</h2>
            <span className="text-sm text-muted-foreground">{openOrders.length} tersedia</span>
          </div>
          {openOrders.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {openOrders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/15 text-blue-400">
                        <Bike className="h-5 w-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{driverOf(order.driverId)}</p>
                        <p className="text-xs text-muted-foreground">
                          #{order._id.slice(-6)} ·{' '}
                          {new Date(order.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => router.push(`/user/orders/${order._id}/gabung`)}
                    >
                      Gabung Pesanan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-3">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                Belum ada pesanan terbuka saat ini
              </CardContent>
            </Card>
          )}
        </section>

        <UserOrderItems
          paginatedOrders={paginatedOrders}
          availableOrders={availableOrders || []}
          onOrderClick={(orderId) => router.push(`/user/orders/${orderId}`)}
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

        <UserReportsSection reports={reports} />
      </div>
    </Layout>
  );
}