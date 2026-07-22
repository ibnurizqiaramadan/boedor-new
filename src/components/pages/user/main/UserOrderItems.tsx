import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import type { Order, OrderItem } from '@/lib/types';

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
}

export function UserOrderItems({
  paginatedOrders,
  availableOrders,
  onOrderClick,
}: UserOrderItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Pesanan Saya</CardTitle>
        <CardDescription>Item yang telah Anda tambahkan ke pesanan - klik untuk melihat detail</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paginatedOrders.map((group) => {
            const status = availableOrders?.find((o: Order) => o._id === group.orderId)?.status || '';
            return (
              <button
                key={group.orderId}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onOrderClick(group.orderId)}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {getStatusIcon(status)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Pesanan #{group.orderId.slice(-6)}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.totalItems} item ·{' '}
                    {new Date(group.latestTime || group.items[0]?._creationTime).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(status)}`}>
                  {formatStatus(status)}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            );
          })}
          {paginatedOrders.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="mt-3 text-sm text-muted-foreground">Anda belum bergabung dengan pesanan apapun</p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/user/pesanan">Lihat Pesanan Terbuka</Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
