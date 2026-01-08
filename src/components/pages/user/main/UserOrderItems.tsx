import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';

interface OrderItem {
  _id: string;
  orderId: string;
  menuId: string;
  qty: number;
  _creationTime: number;
}

interface Order {
  _id: string;
  status: string;
}

interface GroupedOrder {
  orderId: string;
  totalItems: number;
  items: OrderItem[];
  latestTime: number;
}

interface UserOrderItemsProps {
  paginatedOrders: GroupedOrder[];
  availableOrders: Order[];
  onOrderClick: (orderId: string) => void;
  onJoinOrder: (order: Order) => void;
}

export function UserOrderItems({
  paginatedOrders,
  availableOrders,
  onOrderClick,
  onJoinOrder,
}: UserOrderItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Pesanan Saya</CardTitle>
        <CardDescription>Item yang telah Anda tambahkan ke pesanan - klik untuk melihat detail</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paginatedOrders.map((group) => {
            const status = availableOrders?.find((o: any) => o._id === group.orderId)?.status || '';
            return (
              <div
                key={group.orderId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onOrderClick(group.orderId)}
              >
                <div>
                  <p className="font-medium">Pesanan #{group.orderId.slice(-6)}</p>
                  <p className="text-sm text-gray-500">Jumlah: {group.totalItems}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(group.latestTime || group.items[0]?._creationTime).toLocaleString('id-ID', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {formatStatus(status)}
                  </span>
                  <Button variant="outline" size="sm">
                    Lihat Detail
                  </Button>
                </div>
              </div>
            );
          })}
          {paginatedOrders.length === 0 && (
            <p className="text-gray-500 text-center py-8">Anda belum bergabung dengan pesanan apapun</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}