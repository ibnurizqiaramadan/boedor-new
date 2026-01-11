import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';
import type { Order, Payment } from '@/lib/types';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface JoinOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: Order | null;
  menuItems: MenuItem[];
  selectedMenuItems: Array<{ menuId: string; qty: number }>;
  itemNotes: Record<string, string>;
  errors: { items?: string; selectedOrder?: string; payment?: string };
  menuFilter: string;
  paymentMethod: 'cash' | 'cardless' | 'dana';
  amount: string;
  existingPayment: Payment | null;
  calcSubtotal: () => number;
  getMyCurrentTotal: () => number;
  getMenuItemQuantity: (menuId: string) => number;
  onMenuFilterChange: (filter: string) => void;
  onMenuItemQuantityChange: (menuId: string, qty: number) => void;
  onMenuItemNoteChange: (menuId: string, note: string) => void;
  onPaymentMethodChange: (method: 'cash' | 'cardless' | 'dana') => void;
  onAmountChange: (amount: string) => void;
  onJoinOrder: () => void;
  onCancel: () => void;
}

export function JoinOrderDialog({
  open,
  onOpenChange,
  selectedOrder,
  menuItems,
  selectedMenuItems,
  itemNotes,
  errors,
  menuFilter,
  paymentMethod,
  amount,
  existingPayment,
  calcSubtotal,
  getMyCurrentTotal,
  getMenuItemQuantity,
  onMenuFilterChange,
  onMenuItemQuantityChange,
  onMenuItemNoteChange,
  onPaymentMethodChange,
  onAmountChange,
  onJoinOrder,
  onCancel,
}: JoinOrderDialogProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gabung Pesanan #{selectedOrder?._id.slice(-6)}</DialogTitle>
          <DialogDescription>Pilih item menu dan jumlahnya</DialogDescription>
        </DialogHeader>

        {/* Items error */}
        {errors.items && (
          <p className="text-sm text-red-600">{errors.items}</p>
        )}

        {/* Menu Filter */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Cari menu..."
            value={menuFilter}
            onChange={(e) => onMenuFilterChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item._id} className="p-3 border rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMenuItemQuantityChange(item._id, Math.max(0, getMenuItemQuantity(item._id) - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{getMenuItemQuantity(item._id)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMenuItemQuantityChange(item._id, getMenuItemQuantity(item._id) + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  value={itemNotes[item._id] ?? ''}
                  onChange={(e) => onMenuItemNoteChange(item._id, e.target.value)}
                  placeholder="Catatan (opsional) untuk item ini"
                  className="w-full"
                  disabled={getMenuItemQuantity(item._id) === 0}
                />
              </div>
            </div>
          ))}
          {(!menuItems || menuItems.length === 0) && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada item menu tersedia.</p>
            </div>
          )}
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between pt-4">
          <span className="font-semibold">Subtotal</span>
          <span className={`font-semibold ${calcSubtotal() > (existingPayment ? (existingPayment.amount - getMyCurrentTotal()) : Number.POSITIVE_INFINITY) ? 'text-red-600' : ''}`}>
            {formatCurrency(calcSubtotal())}
          </span>
        </div>

        {/* Per-item notes are provided inline above; no global note field */}

        {/* Payment Form - Show only if no existing payment */}
        {!existingPayment && (
          <div className="border-t pt-4 space-y-4 mt-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pembayaran</h4>
              {errors.payment && (
                <p className="text-sm text-red-600 mb-2">{errors.payment}</p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('cash')}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'cash' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <Wallet className="h-4 w-4" /> Tunai
                  </button>
                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('cardless')}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'cardless' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <CreditCard className="h-4 w-4" /> Tanpa Kartu
                  </button>
                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('dana')}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition ${paymentMethod === 'dana' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'}`}
                  >
                    <Smartphone className="h-4 w-4" /> DANA
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Pembayaran</label>
                <div className="flex items-center rounded-lg border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-gray-300">
                  <span className="px-3 text-sm text-gray-500">Rp</span>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    className="border-0 focus-visible:ring-0 text-right"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimal: {formatCurrency(calcSubtotal())}
                </p>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Batal</Button>
          <Button
            onClick={onJoinOrder}
            disabled={(() => {
              const hasSelection = selectedMenuItems.some((i) => i.qty > 0);
              if (!hasSelection) return true;
              if (!existingPayment) return false;
              const newSubtotal = calcSubtotal();
              return getMyCurrentTotal() + newSubtotal > (existingPayment?.amount ?? 0);
            })()}
          >
            Gabung Pesanan ({selectedMenuItems.filter((item) => item.qty > 0).length} item)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}