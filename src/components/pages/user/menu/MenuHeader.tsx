'use client';

import { CardHeader, CardTitle } from '@/components/ui/card';
import SuggestMenuDialog from './SuggestMenuDialog';

interface MenuItem {
  name: string;
  price: number;
}

interface MenuHeaderProps {
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  item: MenuItem;
  onItemChange: (item: MenuItem) => void;
  onSubmit: () => void;
  errors?: { name?: string; price?: string };
  isSubmitting?: boolean;
}

export default function MenuHeader({
  isDialogOpen,
  onDialogOpenChange,
  item,
  onItemChange,
  onSubmit,
  errors = {},
  isSubmitting = false
}: MenuHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Item Menu</CardTitle>
        <SuggestMenuDialog
          isOpen={isDialogOpen}
          onOpenChange={onDialogOpenChange}
          item={item}
          onItemChange={onItemChange}
          onSubmit={onSubmit}
          errors={errors}
          isSubmitting={isSubmitting}
        />
      </div>
    </CardHeader>
  );
}