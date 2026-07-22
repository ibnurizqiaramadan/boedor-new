import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { PaymentMethodPicker } from './PaymentMethodPicker';
import type { Payment } from '@/lib/types';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface PaymentSectionProps {
  order: Order;
  paymentMethod: 'cash' | 'cardless' | 'dana';
  amount: string;
  payErrors: { amount?: string };
  existingPayment: Payment | null;
  myTotal: number;
  isSaving?: boolean;
  onPaymentMethodChange: (method: 'cash' | 'cardless' | 'dana') => void;
  onAmountChange: (amount: string) => void;
  onSavePayment: () => void;
}

export function PaymentSection({
  order,
  paymentMethod,
  amount,
  payErrors,
  existingPayment,
  myTotal,
  isSaving = false,
  onPaymentMethodChange,
  onAmountChange,
  onSavePayment,
}: PaymentSectionProps) {
  const locked = order.status === 'completed';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/15 text-blue-400">
            <Wallet className="h-4 w-4" aria-hidden />
          </span>
          Pembayaran Saya
        </CardTitle>
        <CardDescription>
          {locked ?
            'Informasi pembayaran untuk pesanan yang telah selesai (tidak dapat diubah)' :
            'Atur metode dan jumlah pembayaran Anda untuk pesanan ini'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Metode Pembayaran</Label>
          <PaymentMethodPicker
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            disabled={locked}
            className="mt-2"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2 sm:max-w-52">
            <Label htmlFor="pay-amount">Jumlah (Rp)</Label>
            <Input
              id="pay-amount"
              type="number"
              min="0"
              placeholder="50000"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              disabled={locked}
              className={cn(payErrors.amount && 'border-destructive focus-visible:ring-destructive')}
            />
          </div>
          <Button onClick={onSavePayment} disabled={locked || isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan Pembayaran'}
          </Button>
        </div>
        {payErrors.amount && (
          <p role="alert" className="text-sm text-destructive">{payErrors.amount}</p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm">
          <span className="text-muted-foreground">
            Total item Anda: <span className="font-semibold text-foreground">{formatCurrency(myTotal)}</span>
          </span>
          <span className="flex items-center gap-3">
            {existingPayment && (
              <span className="text-muted-foreground">Tersimpan: {formatCurrency(existingPayment.amount)}</span>
            )}
            {existingPayment ? (
              <span className="inline-flex rounded-full bg-green-400/15 px-2.5 py-0.5 text-xs font-medium text-green-400">Tersimpan</span>
            ) : (
              <span className="inline-flex rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">Belum disimpan</span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
