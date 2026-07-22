import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { menuPriceLabel, cn } from '@/lib/utils';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  priceType?: 'fixed' | 'custom';
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
  itemNotes,
  getMenuItemQuantity,
  onMenuItemQuantityChange,
  onMenuItemNoteChange,
}: MenuSelectionProps) {
  return (
    <div className="max-h-[60vh] space-y-2.5 overflow-y-auto pr-1">
      {menuItems.map((item) => {
        const qty = getMenuItemQuantity(item._id);
        return (
          <div
            key={item._id}
            className={cn(
              'rounded-lg border bg-card p-3 transition-colors',
              qty > 0 && 'border-primary/60 bg-primary/5',
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm tabular-nums text-green-400">{menuPriceLabel(item)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  aria-label={`Kurangi ${item.name}`}
                  disabled={qty === 0}
                  onClick={() => onMenuItemQuantityChange(item._id, Math.max(0, qty - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium tabular-nums" aria-live="polite">{qty}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  aria-label={`Tambah ${item.name}`}
                  onClick={() => onMenuItemQuantityChange(item._id, qty + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {qty > 0 && (
              <Input
                value={itemNotes[item._id] ?? ''}
                onChange={(e) => onMenuItemNoteChange(item._id, e.target.value)}
                placeholder="Catatan (opsional) untuk item ini"
                className="mt-2.5"
              />
            )}
          </div>
        );
      })}
      {(!menuItems || menuItems.length === 0) && (
        <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
          <ShoppingCart className="h-8 w-8" aria-hidden />
          <p className="mt-3 text-sm">Tidak ada item menu tersedia.</p>
        </div>
      )}
    </div>
  );
}
