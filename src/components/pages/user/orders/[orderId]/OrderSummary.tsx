import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <CardTitle>Ringkasan Pesanan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Item:</span>
            <span>{orderItemsCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Peserta:</span>
            <span>{participantsCount}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total Nilai Pesanan:</span>
            <span>{formatCurrency(totalValue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}