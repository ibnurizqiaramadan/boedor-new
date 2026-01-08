import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface MenuSelectionProps {
  menuItems: MenuItem[];
  selectedMenuItems: Array<{ menuId: string; qty: number }>;
  itemNotes: Record<string, string>;
  getMenuItemQuantity: (menuId: string) => number;
  onMenuItemQuantityChange: (menuId: string, qty: number) => void;
  onMenuItemNoteChange: (menuId: string, note: string) => void;
}

export function MenuSelection({
  menuItems,
  selectedMenuItems,
  itemNotes,
  getMenuItemQuantity,
  onMenuItemQuantityChange,
  onMenuItemNoteChange,
}: MenuSelectionProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      {menuItems.map((item) => (
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
  );
}