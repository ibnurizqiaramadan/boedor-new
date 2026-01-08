'use client';

import OrderCard from './OrderCard';

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
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada pesanan.
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