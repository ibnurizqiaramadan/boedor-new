'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

interface MenuItem {
  name: string;
  price: number;
  priceType?: 'fixed' | 'custom';
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
        <Button>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Usulkan Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usulkan Item Menu Baru</DialogTitle>
          <DialogDescription>Usulkan item menu baru untuk ditambahkan</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suggest-name">Nama item</Label>
            <Input
              id="suggest-name"
              placeholder="cth: Nasi Goreng"
              value={item.name}
              onChange={(e) => onItemChange({ ...item, name: e.target.value })}
              disabled={isSubmitting}
            />
            {errors.name && <div className="text-xs text-destructive">{errors.name}</div>}
          </div>
          <div className="flex items-center gap-2">
            <input
              id="suggest-custom"
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={item.priceType === 'custom'}
              onChange={(e) => onItemChange({ ...item, priceType: e.target.checked ? 'custom' : 'fixed', price: e.target.checked ? 0 : item.price })}
              disabled={isSubmitting}
            />
            <Label htmlFor="suggest-custom">Harga custom (diinput driver saat membeli)</Label>
          </div>
          {item.priceType !== 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="suggest-price">Harga (Rp)</Label>
              <Input
                id="suggest-price"
                type="number"
                min="0"
                placeholder="cth: 15000"
                value={item.price || ''}
                onChange={(e) => onItemChange({ ...item, price: parseFloat(e.target.value) || 0 })}
                disabled={isSubmitting}
              />
              {errors.price && <div className="text-xs text-destructive">{errors.price}</div>}
            </div>
          )}
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
