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
            <span className="block text-sm text-gray-600 mt-1">
              Menampilkan {orders.length} dari {totalOrders} pesanan
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
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
          {orders.length === 0 && totalOrders === 0 && (
            <p className="text-gray-500 text-center py-8">Belum ada pesanan yang ditugaskan</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}