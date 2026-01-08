import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Search } from 'lucide-react';
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
  menuFilter: string;
  minPrice: string;
  maxPrice: string;
  selectedMenuItems: Array<{ menuId: string; qty: number }>;
  itemNotes: Record<string, string>;
  existingPayment: any;
  getMyTotal: () => number;
  getMenuItemQuantity: (menuId: string) => number;
  onMenuFilterChange: (filter: string) => void;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;
  onMenuItemQuantityChange: (menuId: string, qty: number) => void;
  onMenuItemNoteChange: (menuId: string, note: string) => void;
  onAddItems: () => void;
}

export function AddMoreItemsDialog({
  open,
  onOpenChange,
  menuItems,
  menuFilter,
  minPrice,
  maxPrice,
  selectedMenuItems,
  itemNotes,
  existingPayment,
  getMyTotal,
  getMenuItemQuantity,
  onMenuFilterChange,
  onMinPriceChange,
  onMaxPriceChange,
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

        {/* Search Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Cari menu..."
              value={menuFilter}
              onChange={(e) => onMenuFilterChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Price Range Filter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice" className="text-sm font-medium">Harga Min (Rp)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="mt-1"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-sm font-medium">Harga Max (Rp)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Tidak terbatas"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="mt-1"
                min="0"
              />
            </div>
          </div>
        </div>

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
              <p className="text-gray-500">
                {menuFilter ? 'Tidak ada menu yang cocok dengan pencarian.' : 'Tidak ada item menu tersedia.'}
              </p>
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