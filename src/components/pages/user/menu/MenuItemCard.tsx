'use client';

import { menuPriceLabel } from '@/lib/utils';
import { UtensilsCrossed } from 'lucide-react';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  priceType?: 'fixed' | 'custom';
}

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 transition-colors hover:border-ring/60">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-400/15 text-green-400">
        <UtensilsCrossed className="h-4 w-4" aria-hidden />
      </span>
      <h3 className="mt-3 font-medium leading-snug">{item.name}</h3>
      <p className="mt-1 text-lg font-bold tabular-nums text-green-400">{menuPriceLabel(item)}</p>
    </div>
  );
}
