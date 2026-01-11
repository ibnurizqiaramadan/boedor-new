import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatStatus } from '@/lib/status';
import type { Order, User } from '@/lib/types';

interface AvailableOrdersListProps {
  availableOrders: Order[];
  drivers: (User | null)[] | undefined;
  joinedOrderIds: Set<string>;
  onJoinOrder: (order: Order) => void;
  onViewOrder: (orderId: string) => void;
}

export function AvailableOrdersList({
  availableOrders,
  drivers,
  joinedOrderIds,
  onJoinOrder,
  onViewOrder,
}: AvailableOrdersListProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {availableOrders
            .filter((order) => order.status === 'open')
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Pesanan #{order._id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">Status: {formatStatus(order.status)}</p>
                  <p className="text-sm text-gray-500">
                    Driver: {(() => {
                      // If drivers is still loading (undefined), show loading
                      if (drivers === undefined) {
                        return 'Memuat...';
                      }
                      // If drivers loaded, find the driver
                      const driver = drivers.find((u) => u && String(u._id) === String(order.driverId));
                      return driver ? (driver.username || driver.name || 'Unknown Driver') : 'Driver tidak ditemukan';
                    })()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Dibuat: {new Date(order.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                {joinedOrderIds.has(order._id) ? (
                  <Button
                    onClick={() => onViewOrder(order._id)}
                  >
                    Lihat Detail
                  </Button>
                ) : (
                  <Button
                    onClick={() => onJoinOrder(order)}
                  >
                    Gabung Pesanan
                  </Button>
                )}
              </div>
            ))}
          {(!availableOrders || availableOrders.filter((order) => order.status === 'open').length === 0) && (
            <p className="text-gray-500 text-center py-8">Tidak ada pesanan tersedia saat ini</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}