'use client';

import { formatCurrency } from '@/lib/utils';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium">{item.name}</h3>
      <p className="text-lg font-bold text-green-600">{formatCurrency(item.price)}</p>
    </div>
  );
}