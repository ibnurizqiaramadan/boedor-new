import { Input } from '@/components/ui/input';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';

interface PaymentFormProps {
  paymentMethod: 'cash' | 'cardless' | 'dana';
  amount: string;
  subtotal: number;
  onPaymentMethodChange: (method: 'cash' | 'cardless' | 'dana') => void;
  onAmountChange: (amount: string) => void;
}

export function PaymentForm({
  paymentMethod,
  amount,
  subtotal,
  onPaymentMethodChange,
  onAmountChange,
}: PaymentFormProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="border-t pt-4 space-y-4 mt-4">
      <div>
        <h4 className="font-medium text-foreground mb-3">Pembayaran</h4>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Metode Pembayaran</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onPaymentMethodChange('cash')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'cash' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted'}`}
            >
              <Wallet className="h-4 w-4" /> Tunai
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange('cardless')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'cardless' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted'}`}
            >
              <CreditCard className="h-4 w-4" /> Tanpa Kartu
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange('dana')}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'dana' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-muted'}`}
            >
              <Smartphone className="h-4 w-4" /> DANA
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Jumlah Pembayaran</label>
          <div className="flex items-center rounded-lg border border-border bg-card shadow-sm focus-within:ring-2 focus-within:ring-gray-300">
            <span className="px-3 text-sm text-muted-foreground">Rp</span>
            <Input
              type="number"
              placeholder="0"
              min="0"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="border-0 focus-visible:ring-0 text-right"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Minimal: {formatCurrency(subtotal)}
          </p>
        </div>
      </div>
    </div>
  );
}