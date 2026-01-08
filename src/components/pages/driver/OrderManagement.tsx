import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatStatus } from '@/lib/status';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface OrderManagementProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: 'open' | 'closed' | 'completed') => void;
}

export function OrderManagement({ orders, onUpdateStatus }: OrderManagementProps) {
  const sortedOrders = orders.slice().sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Saya</CardTitle>
        <CardDescription>Kelola pesanan pengiriman yang ditugaskan kepada Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Pesanan #{order._id.slice(-6)}</p>
                <p className="text-sm text-gray-500">Status: {formatStatus(order.status)}</p>
                <p className="text-sm text-gray-500">
                  Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="flex space-x-2">
                {order.status === 'open' && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(order._id, 'closed')}
                  >
                    Mulai Pengiriman
                  </Button>
                )}
                {order.status === 'closed' && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(order._id, 'completed')}
                  >
                    Tandai Selesai
                  </Button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-8">Belum ada pesanan yang ditugaskan</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}