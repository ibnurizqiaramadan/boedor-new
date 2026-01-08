import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface AddMoreItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItems: MenuItem[] | undefined;
  selectedMenuItems: Array<{ menuId: string; qty: number }>;
  itemNotes: Record<string, string>;
  existingPayment: any;
  getMyTotal: () => number;
  getMenuItemQuantity: (menuId: string) => number;
  onMenuItemQuantityChange: (menuId: string, qty: number) => void;
  onMenuItemNoteChange: (menuId: string, note: string) => void;
  onAddItems: () => void;
}

export function AddMoreItemsDialog({
  open,
  onOpenChange,
  menuItems,
  selectedMenuItems,
  itemNotes,
  existingPayment,
  getMyTotal,
  getMenuItemQuantity,
  onMenuItemQuantityChange,
  onMenuItemNoteChange,
  onAddItems,
}: AddMoreItemsDialogProps) {
  const calcSubtotal = () => {
    if (!menuItems) return 0;
    return selectedMenuItems.reduce((sum, sel) => {
      const item = menuItems.find((m) => m._id === sel.menuId);
      if (!item) return sum;
      return sum + item.price * sel.qty;
    }, 0);
  };

  const subtotal = calcSubtotal();
  const remaining = existingPayment ? existingPayment.amount - getMyTotal() : Number.POSITIVE_INFINITY;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Item Lagi ke Pesanan</DialogTitle>
          <DialogDescription>Pilih item menu dan jumlah untuk ditambahkan ke pesanan ini</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {menuItems?.map((item) => (
            <div key={item._id} className="p-3 border rounded">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
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
          <span className={`font-semibold ${subtotal > remaining ? 'text-red-600' : ''}`}>
            {formatCurrency(subtotal)}
          </span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button
            onClick={onAddItems}
            disabled={(() => {
              const count = selectedMenuItems.filter((item) => item.qty > 0).length;
              if (count === 0) return true;
              if (!existingPayment) return false;
              const newSubtotal = calcSubtotal();
              return getMyTotal() + newSubtotal > existingPayment.amount;
            })()}
          >
            Tambah Item ({selectedMenuItems.filter((item) => item.qty > 0).length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}