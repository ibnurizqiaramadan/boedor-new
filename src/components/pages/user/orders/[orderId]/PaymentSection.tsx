import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, CreditCard, Smartphone } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
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
  onPaymentMethodChange,
  onAmountChange,
  onSavePayment,
}: PaymentSectionProps) {
  return (
    <Card className="border rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-muted-foreground" />
          Pembayaran Saya
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {order.status === 'completed' ?
            'Informasi pembayaran untuk pesanan yang telah selesai (tidak dapat diubah)' :
            'Atur metode dan jumlah pembayaran Anda untuk pesanan ini'
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Metode Pembayaran</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => order.status !== 'completed' && onPaymentMethodChange('cash')}
                  disabled={order.status === 'completed'}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${
                    order.status === 'completed' ?
                      'bg-muted text-muted-foreground border-border cursor-not-allowed' :
                      paymentMethod === 'cash' ?
                        'bg-primary text-primary-foreground border-primary' :
                        'bg-card hover:bg-muted'
                  }`}
                >
                  <Wallet className="h-4 w-4" /> Tunai
                </button>
                <button
                  type="button"
                  onClick={() => order.status !== 'completed' && onPaymentMethodChange('cardless')}
                  disabled={order.status === 'completed'}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${
                    order.status === 'completed' ?
                      'bg-muted text-muted-foreground border-border cursor-not-allowed' :
                      paymentMethod === 'cardless' ?
                        'bg-primary text-primary-foreground border-primary' :
                        'bg-card hover:bg-muted'
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Tanpa Kartu
                </button>
                <button
                  type="button"
                  onClick={() => order.status !== 'completed' && onPaymentMethodChange('dana')}
                  disabled={order.status === 'completed'}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${
                    order.status === 'completed' ?
                      'bg-muted text-muted-foreground border-border cursor-not-allowed' :
                      paymentMethod === 'dana' ?
                        'bg-primary text-primary-foreground border-primary' :
                        'bg-card hover:bg-muted'
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> DANA
                </button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:w-32">
                  <label className="block text-xs text-muted-foreground mb-1">Rp</label>
                  <div className={`flex items-center rounded-lg border ${payErrors.amount ? 'border-destructive ring-1 ring-red-500' : 'border-border'} bg-card shadow-sm`}>
                    <Input
                      type="number"
                      placeholder="50000"
                      min="0"
                      value={amount}
                      onChange={(e) => onAmountChange(e.target.value)}
                      disabled={order.status === 'completed'}
                      className="border-0 focus-visible:ring-0 text-center py-2"
                    />
                  </div>
                </div>
                <div className="flex-none">
                  <label className="block text-xs text-transparent mb-1">.</label>
                  <Button
                    onClick={onSavePayment}
                    disabled={order.status === 'completed' || (() => {
                      const amt = parseFloat(amount); return isNaN(amt) || amt <= 0 || amt < myTotal;
                    })()}
                    className="py-2"
                  >
                    Simpan Pembayaran
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Total item Anda saat ini: <span className="font-semibold">{formatCurrency(myTotal)}</span></p>
            </div>
            <div className="flex gap-4">
              {existingPayment && (
                <p className="text-muted-foreground">Tersimpan: {formatCurrency(existingPayment.amount)}</p>
              )}
              <div>
                {existingPayment ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/30 text-xs">Status: Tersimpan</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs">Status: Belum disimpan</span>
                )}
              </div>
            </div>
          </div>
          {payErrors.amount && (
            <p className="text-sm text-destructive">{payErrors.amount}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}