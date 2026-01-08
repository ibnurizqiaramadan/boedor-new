'use client';

import { Button } from '@/components/ui/button';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';

interface Order {
  _id: string;
  driverId: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
  _creationTime: number;
}

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: 'open' | 'closed' | 'completed') => void;
  onDelete: (orderId: string) => void;
}

export default function OrderCard({ order, onUpdateStatus, onDelete }: OrderCardProps) {
  const getStatusBadge = (status: string) => (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      <span className="shrink-0">{getStatusIcon(status)}</span>
      {formatStatus(status)}
    </span>
  );

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <p className="font-medium">Pesanan #{order._id.slice(-6)}</p>
          {getStatusBadge(order.status)}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          ID Driver: {order.driverId.slice(-6)} • Dibuat: {new Date(order._creationTime).toLocaleDateString('id-ID')}
        </p>
      </div>
      <div className="flex space-x-2">
        {order.status === 'open' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(order._id, 'closed')}
          >
            Tutup Pesanan
          </Button>
        )}
        {order.status === 'closed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateStatus(order._id, 'completed')}
          >
            Selesaikan Pesanan
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(order._id)}
        >
          Hapus
        </Button>
      </div>
    </div>
  );
}