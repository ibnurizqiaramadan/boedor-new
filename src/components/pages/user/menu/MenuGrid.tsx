'use client';

import MenuItemCard from './MenuItemCard';
import { SearchX, UtensilsCrossed } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface MenuGridProps {
  items: MenuItem[];
  searchTerm: string;
  isLoading?: boolean;
  totalItems?: number;
}

export default function MenuGrid({ items, searchTerm, isLoading = false, totalItems = 0 }: MenuGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
            <div className="h-9 w-9 rounded-lg bg-border" />
            <div className="mt-3 h-4 w-3/4 rounded bg-border" />
            <div className="mt-2 h-5 w-1/2 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    const Icon = searchTerm ? SearchX : UtensilsCrossed;
    return (
      <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
        <Icon className="h-8 w-8" aria-hidden />
        <p className="mt-3 text-sm">
          {searchTerm ? 'Tidak ada menu yang ditemukan' : totalItems === 0 ? 'Belum ada menu tersedia' : 'Tidak ada item di halaman ini'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 md:gap-4">
      {items.map((item) => (
        <MenuItemCard key={item._id} item={item} />
      ))}
    </div>
  );
}
