'use client';

import { Button } from '@/components/ui/button';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';
import { Trash2 } from 'lucide-react';

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
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
        {getStatusIcon(order.status)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">Pesanan #{order._id.slice(-6)}</p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
            {formatStatus(order.status)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Driver #{order.driverId.slice(-6)} ·{' '}
          {new Date(order.createdAt).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {order.status === 'open' && (
          <Button variant="outline" size="sm" onClick={() => onUpdateStatus(order._id, 'closed')}>
            Tutup Pesanan
          </Button>
        )}
        {order.status === 'closed' && (
          <Button variant="outline" size="sm" onClick={() => onUpdateStatus(order._id, 'completed')}>
            Selesaikan
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Hapus pesanan ${order._id.slice(-6)}`}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(order._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
