'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MenuItem {
  name: string;
  price: number;
}

interface SuggestMenuDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuItem;
  onItemChange: (item: MenuItem) => void;
  onSubmit: () => void;
  errors?: { name?: string; price?: string };
  isSubmitting?: boolean;
}

export default function SuggestMenuDialog({
  isOpen,
  onOpenChange,
  item,
  onItemChange,
  onSubmit,
  errors = {},
  isSubmitting = false
}: SuggestMenuDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Usulkan Item</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usulkan Item Menu Baru</DialogTitle>
          <DialogDescription>Usulkan item menu baru untuk ditambahkan</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Nama item menu"
            value={item.name}
            onChange={(e) => onItemChange({ ...item, name: e.target.value })}
            disabled={isSubmitting}
          />
          {errors.name && <div className="text-xs text-red-600">{errors.name}</div>}
          <Input
            type="number"
            placeholder="Harga yang disarankan"
            value={item.price || ''}
            onChange={(e) => onItemChange({ ...item, price: parseFloat(e.target.value) || 0 })}
            disabled={isSubmitting}
          />
          {errors.price && <div className="text-xs text-red-600">{errors.price}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Mengusulkan...' : 'Usulkan Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}