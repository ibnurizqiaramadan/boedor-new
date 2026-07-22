import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderSummaryProps {
  orderItemsCount: number;
  participantsCount: number;
  totalValue: number;
}

export function OrderSummary({ orderItemsCount, participantsCount, totalValue }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-400/15 text-green-400">
            <Receipt className="h-4 w-4" aria-hidden />
          </span>
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Total Item</span>
            <span className="tabular-nums text-foreground">{orderItemsCount}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total Peserta</span>
            <span className="tabular-nums text-foreground">{participantsCount}</span>
          </div>
          <div className="flex justify-between border-t pt-2.5 text-base font-semibold">
            <span>Total Nilai Pesanan</span>
            <span className="tabular-nums text-green-400">{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
