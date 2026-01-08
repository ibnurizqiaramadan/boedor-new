import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateOrder: () => void;
}

export function CreateOrderDialog({ open, onOpenChange, onCreateOrder }: CreateOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Pesanan Baru</DialogTitle>
          <DialogDescription>
            Buat pesanan antar baru yang ditugaskan kepada Anda
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Ini akan membuat pesanan baru yang ditugaskan kepada Anda sebagai driver.
            Pesanan akan dimulai dengan status "terbuka".
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onCreateOrder}>Buat Pesanan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}