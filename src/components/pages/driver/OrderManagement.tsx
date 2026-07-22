import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';
import { Truck } from 'lucide-react';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface OrderManagementProps {
  orders: Order[];
  totalOrders?: number;
  onUpdateStatus: (orderId: string, status: 'open' | 'closed' | 'completed') => void;
}

export function OrderManagement({ orders, totalOrders = 0, onUpdateStatus }: OrderManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Saya</CardTitle>
        <CardDescription>
          Kelola pesanan pengiriman yang ditugaskan kepada Anda
          {totalOrders > 0 && (
            <span className="mt-1 block text-sm text-muted-foreground">
              Menampilkan {orders.length} dari {totalOrders} pesanan
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order._id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
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
                  {new Date(order.createdAt).toLocaleString('id-ID', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {order.status === 'open' && (
                  <Button size="sm" onClick={() => onUpdateStatus(order._id, 'closed')}>
                    Mulai Pengiriman
                  </Button>
                )}
                {order.status === 'closed' && (
                  <Button size="sm" onClick={() => onUpdateStatus(order._id, 'completed')}>
                    Tandai Selesai
                  </Button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && totalOrders === 0 && (
            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
              <Truck className="h-8 w-8" aria-hidden />
              <p className="mt-3 text-sm">Belum ada pesanan yang ditugaskan</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
