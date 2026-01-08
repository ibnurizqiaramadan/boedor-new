import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface MenuItem {
  name: string;
  price: number;
}

interface AddMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem;
  onMenuItemChange: (item: MenuItem) => void;
  onSubmit: () => void;
}

export function AddMenuDialog({ isOpen, onClose, menuItem, onMenuItemChange, onSubmit }: AddMenuDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Item Menu</DialogTitle>
          <DialogDescription>Buat item menu baru</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Nama item"
            value={menuItem.name}
            onChange={(e) => onMenuItemChange({ ...menuItem, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Harga"
            value={menuItem.price}
            onChange={(e) => onMenuItemChange({ ...menuItem, price: parseFloat(e.target.value) })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={onSubmit}>Tambah Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}