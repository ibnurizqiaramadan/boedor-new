'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import MenuItemForm from './MenuItemForm';
import ExportImportSection from './ExportImportSection';

interface MenuItem {
  name: string;
  price: number;
  priceType?: 'fixed' | 'custom';
}

interface MenuItemData {
  _id: string;
  name: string;
  price: number;
  priceType?: 'fixed' | 'custom';
}

interface MenuHeaderProps {
  onAddMenuItem: (item: MenuItem) => Promise<void>;
  onImport: (items: MenuItem[], mode: 'append' | 'replace') => Promise<void>;
  menuItems: MenuItemData[];
}

export default function MenuHeader({ onAddMenuItem, onImport, menuItems }: MenuHeaderProps) {
  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);
  const [addErrors, setAddErrors] = React.useState<{ name?: string; price?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddMenuItem = async (item: MenuItem) => {
    setAddErrors({});
    try {
      // Simple validation
      if (!item.name.trim()) {
        setAddErrors({ name: 'Nama item wajib diisi' });
        return;
      }
      if (item.priceType !== 'custom' && item.price <= 0) {
        setAddErrors({ price: 'Harga harus lebih dari 0' });
        return;
      }

      setIsSubmitting(true);
      await onAddMenuItem(item);
      setIsAddMenuOpen(false);
    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast.error('Gagal menambah item menu: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CardHeader>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Item Menu
          </CardTitle>
          <CardDescription>Tambah, edit, dan kelola item menu</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportImportSection menuItems={menuItems} onImport={onImport} />

          <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Item Menu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Item Menu</DialogTitle>
                <DialogDescription>Buat item menu baru</DialogDescription>
              </DialogHeader>
              <MenuItemForm
                onSubmit={handleAddMenuItem}
                onCancel={() => setIsAddMenuOpen(false)}
                isSubmitting={isSubmitting}
                errors={addErrors}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </CardHeader>
  );
}