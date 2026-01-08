import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OrderItem {
  _id: string;
  menuId: string;
  qty: number;
  note?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface EditOrderItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrderItem: OrderItem | null;
  menuItems: MenuItem[] | undefined;
  onUpdateItem: (item: OrderItem) => void;
  onSave: () => void;
}

export function EditOrderItemDialog({
  open,
  onOpenChange,
  selectedOrderItem,
  menuItems,
  onUpdateItem,
  onSave,
}: EditOrderItemDialogProps) {
  if (!selectedOrderItem) return null;

  const menuItem = menuItems?.find((m) => m._id === selectedOrderItem.menuId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item Pesanan</DialogTitle>
          <DialogDescription>Perbarui jumlah untuk item ini</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="font-medium">
              {menuItem?.name}
            </p>
            <p className="text-sm text-gray-500">
              Rp {menuItem?.price.toLocaleString('id-ID')} per item
            </p>
          </div>
          <Input
            type="number"
            placeholder="Jumlah"
            min="1"
            value={selectedOrderItem.qty}
            onChange={(e) => onUpdateItem({
              ...selectedOrderItem,
              qty: parseInt(e.target.value) || 1,
            })}
          />
          <Input
            type="text"
            placeholder="Catatan (opsional)"
            value={selectedOrderItem.note ?? ''}
            onChange={(e) => onUpdateItem({
              ...selectedOrderItem,
              note: e.target.value,
            })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onSave}>Perbarui Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}