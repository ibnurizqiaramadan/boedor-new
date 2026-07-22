import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PaymentMethodPicker, type PaymentMethodId } from '../PaymentMethodPicker';

interface PaymentFormProps {
  paymentMethod: PaymentMethodId;
  amount: string;
  subtotal: number;
  onPaymentMethodChange: (method: PaymentMethodId) => void;
  onAmountChange: (amount: string) => void;
}

export function PaymentForm({
  paymentMethod,
  amount,
  subtotal,
  onPaymentMethodChange,
  onAmountChange,
}: PaymentFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/15 text-blue-400">
            <Wallet className="h-4 w-4" aria-hidden />
          </span>
          Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Metode Pembayaran</Label>
          <PaymentMethodPicker value={paymentMethod} onChange={onPaymentMethodChange} className="mt-2" />
        </div>

        <div className="space-y-2 sm:max-w-52">
          <Label htmlFor="join-amount">Jumlah (Rp)</Label>
          <Input
            id="join-amount"
            type="number"
            placeholder="0"
            min="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Minimal: {formatCurrency(subtotal)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
