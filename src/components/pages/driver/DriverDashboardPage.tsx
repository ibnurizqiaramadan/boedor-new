'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Layout from '@/components/layout/Layout';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';
import { StatsCards, OrderManagement } from './index';

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [ currentPage, setCurrentPage ] = useState(1);

  // Queries
  const myOrders = useQuery(api.boedor.orders.getOrdersByDriver, user ? { driverId: user._id, currentUserId: user._id } : 'skip');

  const ORDERS_PER_PAGE = 6; // Show 6 orders per page on dashboard

  // Sort orders by creation date (newest first)
  const sortedOrders = useMemo(() => {
    return (myOrders || []).slice().sort((a, b) => b.createdAt - a.createdAt);
  }, [myOrders]);

  // Pagination calculations
  const totalOrders = sortedOrders.length;
  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Reset to first page when orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [totalOrders]);

  // Mutations
  const updateOrderStatus = useMutation(api.boedor.orders.updateOrderStatus);

  // Redirect to home page if user is not logged in
  useEffect(() => {
    if (user === null) {
      router.push('/');
    }
  }, [ user, router ]);

  const isLoggedIn = !!user;
  const isDriver = user?.role === 'driver';

  const handleUpdateOrderStatus = async (orderId: string, status: 'open' | 'closed' | 'completed') => {
    await updateOrderStatus({ orderId: orderId as any, status, currentUserId: user!._id });
  };

  return (
    <Layout>
      {!isLoggedIn ? null : !isDriver ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus driver.</p>
        </div>
      ) : (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dasbor Pengemudi</h1>
          <p className="mt-2 text-gray-600">Kelola pesanan dan lokasi Anda</p>
        </div>

        <StatsCards orders={myOrders || []} />

        <OrderManagement
          orders={paginatedOrders}
          totalOrders={totalOrders}
          onUpdateStatus={handleUpdateOrderStatus}
        />

        {/* Pagination */}
        {totalOrders > 0 && (
          <div className="mt-6 flex flex-col items-center space-y-4">
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
      </div>
      )}
    </Layout>
  );
}