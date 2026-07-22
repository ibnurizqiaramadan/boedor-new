'use client';

import OrderCard from './OrderCard';
import { ShoppingBag } from 'lucide-react';

interface Order {
  _id: string;
  driverId: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
  _creationTime: number;
}

interface OrderListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: 'open' | 'closed' | 'completed') => void;
  onDelete: (orderId: string) => void;
  isLoading?: boolean;
}

export default function OrderList({
  orders,
  onUpdateStatus,
  onDelete,
  isLoading = false
}: OrderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-border rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-border rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
        <ShoppingBag className="h-8 w-8" aria-hidden />
        <p className="mt-3 text-sm">Tidak ada pesanan.</p>
      </div>
    );
  }

  // Sort orders by creation time (newest first)
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-4">
      {sortedOrders.map((order) => (
        <OrderCard
          key={order._id}
          order={order}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}