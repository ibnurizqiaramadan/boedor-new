import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface JoinOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrder: any;
  menuItems: MenuItem[];
  selectedMenuItems: { menuId: string; qty: number }[];
  paymentMethod: string;
  amount: string;
  note: string;
  existingPayment: any;
  onPaymentMethodChange: (method: string) => void;
  onAmountChange: (amount: string) => void;
  onNoteChange: (note: string) => void;
  onMenuItemQuantityChange: (menuId: string, qty: number) => void;
  onJoinOrder: () => void;
  getMenuItemQuantity: (menuId: string) => number;
}

export function JoinOrderDialog({
  open,
  onOpenChange,
  selectedOrder,
  menuItems,
  selectedMenuItems,
  paymentMethod,
  amount,
  note,
  existingPayment,
  onPaymentMethodChange,
  onAmountChange,
  onNoteChange,
  onMenuItemQuantityChange,
  onJoinOrder,
  getMenuItemQuantity,
}: JoinOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gabung Pesanan #{selectedOrder?._id.slice(-6)}</DialogTitle>
          <DialogDescription>Pilih item menu dan jumlahnya</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {menuItems?.map((item) => (
            <div key={item._id} className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Rp {item.price.toLocaleString('id-ID')}</p>
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
          ))}
        </div>

        {/* Payment Information */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium text-gray-900">
            Informasi Pembayaran {existingPayment && <span className="text-sm text-green-600">(Sudah diatur - Anda dapat memperbarui)</span>}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <Select value={paymentMethod} onValueChange={(value: 'cash' | 'cardless' | 'dana') => onPaymentMethodChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="cardless">Tanpa Kartu</SelectItem>
                  <SelectItem value="dana">DANA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah
              </label>
              <Input
                type="number"
                placeholder="Masukkan jumlah"
                min="0"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Note - moved near footer/subtotal */}
        <div className="space-y-2 pt-2">
          <label className="block text-sm font-medium text-gray-700">
            Catatan (opsional)
          </label>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Misal: pedas, tanpa sambal, minumnya es batu sedikit, dll."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button
            onClick={onJoinOrder}
            disabled={selectedMenuItems.filter((item) => item.qty > 0).length === 0 || (!existingPayment && parseFloat(amount) <= 0)}
          >
            Gabung Pesanan ({selectedMenuItems.filter((item) => item.qty > 0).length} item)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}