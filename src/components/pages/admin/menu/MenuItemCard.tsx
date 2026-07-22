'use client';

import { Button } from '@/components/ui/button';
import { Edit, Trash2, UtensilsCrossed } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

export default function MenuItemCard({ item, onEdit, onDelete }: MenuItemCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-400/15 text-green-400">
        <UtensilsCrossed className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{item.name}</p>
        <p className="text-sm tabular-nums text-muted-foreground">{formatCurrency(item.price)}</p>
      </div>
      <div className="flex shrink-0">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Edit ${item.name}`}
          onClick={() => onEdit(item)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Hapus ${item.name}`}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(item._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
