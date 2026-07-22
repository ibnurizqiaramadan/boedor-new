import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bike, Inbox, CheckCircle } from 'lucide-react';
import type { Order, User } from '@/lib/types';

interface AvailableOrdersListProps {
  availableOrders: Order[];
  isLoading?: boolean;
  drivers: (User | null)[] | undefined;
  joinedOrderIds: Set<string>;
  onJoinOrder: (order: Order) => void;
  onViewOrder: (orderId: string) => void;
}

export function AvailableOrdersList({
  availableOrders,
  isLoading = false,
  drivers,
  joinedOrderIds,
  onJoinOrder,
  onViewOrder,
}: AvailableOrdersListProps) {
  const openOrders = availableOrders
    .filter((order) => order.status === 'open')
    .sort((a, b) => b.createdAt - a.createdAt);

  const driverOf = (driverId: string) => {
    if (drivers === undefined) return 'Memuat...';
    const driver = drivers.find((u) => u && String(u._id) === String(driverId));
    return driver ? (driver.name || driver.username || 'Driver') : 'Driver tidak ditemukan';
  };

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-border" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-border" />
                <div className="h-3 w-1/2 rounded bg-border" />
              </div>
            </div>
            <div className="mt-3 h-8 w-full rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (openOrders.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
        <Inbox className="h-8 w-8" aria-hidden />
        <p className="mt-3 text-sm">Tidak ada pesanan tersedia saat ini</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {openOrders.map((order) => {
        const joined = joinedOrderIds.has(order._id);
        return (
          <Card key={order._id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/15 text-blue-400">
                  <Bike className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{driverOf(order.driverId)}</p>
                  <p className="text-xs text-muted-foreground">
                    #{order._id.slice(-6)} ·{' '}
                    {new Date(order.createdAt).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {joined && (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-400/15 px-2.5 py-1 text-xs font-medium text-green-400">
                    <CheckCircle className="h-3 w-3" aria-hidden />
                    Gabung
                  </span>
                )}
              </div>
              {joined ? (
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => onViewOrder(order._id)}>
                  Lihat Detail
                </Button>
              ) : (
                <Button size="sm" className="mt-3 w-full" onClick={() => onJoinOrder(order)}>
                  Gabung Pesanan
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
