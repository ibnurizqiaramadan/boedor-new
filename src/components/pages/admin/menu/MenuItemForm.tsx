'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MenuItem {
  name: string;
  price: number;
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
      <Input
        placeholder="Nama Item"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        disabled={isSubmitting}
      />
      {errors.name && <div className="text-xs text-red-600">{errors.name}</div>}

      <Input
        type="number"
        placeholder="Harga"
        value={formData.price || ''}
        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
        disabled={isSubmitting}
      />
      {errors.price && <div className="text-xs text-red-600">{errors.price}</div>}

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