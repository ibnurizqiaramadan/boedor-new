'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MenuItem {
  name: string;
  price: number;
  priceType?: 'fixed' | 'custom';
}

interface MenuItemFormProps {
  item?: MenuItem;
  onSubmit: (item: MenuItem) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  errors?: { name?: string; price?: string };
}

export default function MenuItemForm({
  item,
  onSubmit,
  onCancel,
  isSubmitting = false,
  errors = {}
}: MenuItemFormProps) {
  const [formData, setFormData] = useState<MenuItem>(
    item || { name: '', price: 0 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="menu-item-name">Nama Item</Label>
        <Input
          id="menu-item-name"
          placeholder="cth: Nasi Goreng"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={isSubmitting}
        />
        {errors.name && <div className="text-xs text-destructive">{errors.name}</div>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="menu-item-custom"
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={formData.priceType === 'custom'}
          onChange={(e) => setFormData({ ...formData, priceType: e.target.checked ? 'custom' : 'fixed', price: e.target.checked ? 0 : formData.price })}
          disabled={isSubmitting}
        />
        <Label htmlFor="menu-item-custom">Harga custom (diinput driver saat membeli)</Label>
      </div>

      {formData.priceType !== 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="menu-item-price">Harga (Rp)</Label>
          <Input
            id="menu-item-price"
            type="number"
            min="0"
            placeholder="cth: 15000"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            disabled={isSubmitting}
          />
          {errors.price && <div className="text-xs text-destructive">{errors.price}</div>}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : (item ? 'Perbarui' : 'Tambah')}
        </Button>
      </div>
    </form>
  );
}
