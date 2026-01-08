import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, CreditCard, Smartphone } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
  existingPayment: any;
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
          <Wallet className="h-5 w-5 text-gray-500" />
          Pembayaran Saya
        </CardTitle>
        <p className="text-sm text-gray-600">
          {order.status === 'completed' ?
            'Informasi pembayaran untuk pesanan yang telah selesai (tidak dapat diubah)' :
            'Atur metode dan jumlah pembayaran Anda untuk pesanan ini'
          }
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => order.status !== 'completed' && onPaymentMethodChange('cash')}
                  disabled={order.status === 'completed'}
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${
                    order.status === 'completed' ?
                      'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :
                      paymentMethod === 'cash' ?
                        'bg-gray-900 text-white border-gray-900' :
                        'bg-white hover:bg-gray-50'
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
                      'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :
                      paymentMethod === 'cardless' ?
                        'bg-gray-900 text-white border-gray-900' :
                        'bg-white hover:bg-gray-50'
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
                      'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :
                      paymentMethod === 'dana' ?
                        'bg-gray-900 text-white border-gray-900' :
                        'bg-white hover:bg-gray-50'
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> DANA
                </button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:w-32">
                  <label className="block text-xs text-gray-500 mb-1">Rp</label>
                  <div className={`flex items-center rounded-lg border ${payErrors.amount ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} bg-white shadow-sm`}>
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
              <p className="text-gray-600">Total item Anda saat ini: <span className="font-semibold">{formatCurrency(myTotal)}</span></p>
            </div>
            <div className="flex gap-4">
              {existingPayment && (
                <p className="text-gray-500">Tersimpan: {formatCurrency(existingPayment.amount)}</p>
              )}
              <div>
                {existingPayment ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs">Status: Tersimpan</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs">Status: Belum disimpan</span>
                )}
              </div>
            </div>
          </div>
          {payErrors.amount && (
            <p className="text-sm text-red-600">{payErrors.amount}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}