'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MenuItemForm from './MenuItemForm';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface EditMenuDialogProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: MenuItem) => Promise<void>;
  isSubmitting?: boolean;
  errors?: { name?: string; price?: string };
}

export default function EditMenuDialog({
  item,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  errors = {}
}: EditMenuDialogProps) {
  const handleSubmit = async (formData: { name: string; price: number }) => {
    if (!item) return;

    await onSubmit({
      _id: item._id,
      name: formData.name,
      price: formData.price,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item Menu</DialogTitle>
          <DialogDescription>Perbarui informasi item menu</DialogDescription>
        </DialogHeader>
        {item && (
          <MenuItemForm
            item={item}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
            errors={errors}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}