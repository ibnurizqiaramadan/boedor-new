import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusIcon, getStatusColor, formatStatus } from '@/lib/status';
import { formatCurrency } from '@/lib/utils';
import type { Payment } from '@/lib/types';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface OrderDetailStatsProps {
  order: Order;
  participantsCount: number;
  myItemsCount: number;
  myTotal: number;
  existingPayment: Payment | null;
  myChange: number;
}

export function OrderDetailStats({
  order,
  participantsCount,
  myItemsCount,
  myTotal,
  existingPayment,
  myChange,
}: OrderDetailStatsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
              {getStatusIcon(order.status)}
            </span>
            <div>
              <CardTitle>Pesanan #{order._id.slice(-8)}</CardTitle>
              <CardDescription>
                Dibuat {new Date(order.createdAt).toLocaleString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </CardDescription>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}>
            {formatStatus(order.status)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Peserta</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{participantsCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Item Saya</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{myItemsCount}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Saya</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{formatCurrency(myTotal)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {existingPayment ? (myChange < 0 ? 'Kurang Bayar' : 'Kembalian Saya') : 'Status Pembayaran'}
            </p>
            {existingPayment ? (
              <div>
                <p className={`mt-1 text-xl font-bold tabular-nums ${myChange < 0 ? 'text-destructive' : 'text-green-400'}`}>
                  {formatCurrency(Math.abs(myChange))}
                </p>
                <p className="text-xs text-muted-foreground">
                  Dibayar {formatCurrency(existingPayment.amount)}
                </p>
              </div>
            ) : (
              <span className="mt-1.5 inline-flex rounded-full bg-amber-400/15 px-2.5 py-1 text-sm font-medium text-amber-400">
                Belum Dibayar
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
