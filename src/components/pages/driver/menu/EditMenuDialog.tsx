import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  priceType?: 'fixed' | 'custom';
}

interface EditMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  onMenuItemChange: (item: MenuItem | null) => void;
  onSubmit: () => void;
}

export function EditMenuDialog({ isOpen, onClose, menuItem, onMenuItemChange, onSubmit }: EditMenuDialogProps) {
  if (!menuItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item Menu</DialogTitle>
          <DialogDescription>Perbarui informasi item menu</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-menu-name">Nama Item</Label>
            <Input
              id="edit-menu-name"
              placeholder="Nama Item"
              value={menuItem.name}
              onChange={(e) => onMenuItemChange({ ...menuItem, name: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="edit-menu-custom"
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={menuItem.priceType === 'custom'}
              onChange={(e) => onMenuItemChange({ ...menuItem, priceType: e.target.checked ? 'custom' : 'fixed', price: e.target.checked ? 0 : menuItem.price })}
            />
            <Label htmlFor="edit-menu-custom">Harga custom (diinput saat membeli)</Label>
          </div>
          {menuItem.priceType !== 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="edit-menu-price">Harga (Rp)</Label>
              <Input
                id="edit-menu-price"
                type="number"
                min="0"
                value={menuItem.price || ''}
                onChange={(e) => onMenuItemChange({ ...menuItem, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSubmit}>Perbarui Item Menu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
