'use client';

import MenuItemCard from './MenuItemCard';
import { UtensilsCrossed } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface MenuListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function MenuList({
  items,
  onEdit,
  onDelete,
  isLoading = false
}: MenuListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-border rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-border rounded w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
        <UtensilsCrossed className="h-8 w-8" aria-hidden />
        <p className="mt-3 text-sm">Tidak ada item menu ditemukan. Tambahkan item menu pertama Anda!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <MenuItemCard
          key={item._id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}