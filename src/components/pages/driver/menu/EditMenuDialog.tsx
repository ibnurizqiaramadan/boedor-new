import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
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
          <Input
            placeholder="Nama Item"
            value={menuItem.name}
            onChange={(e) => onMenuItemChange({ ...menuItem, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Harga"
            value={menuItem.price}
            onChange={(e) => onMenuItemChange({ ...menuItem, price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSubmit}>Perbarui Item Menu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}