import { StatCard } from '@/components/ui/stat-card';
import { ShoppingCart, ClipboardList, UtensilsCrossed } from 'lucide-react';

interface UserStatsCardsProps {
  availableOrdersCount: number;
  myOrderItemsCount: number;
  menuItemsCount: number;
}

export function UserStatsCards({ availableOrdersCount, myOrderItemsCount, menuItemsCount }: UserStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6">
      <StatCard label="Pesanan Terbuka" value={availableOrdersCount} icon={ShoppingCart} chip="bg-blue-400/15 text-blue-400" />
      <StatCard label="Item Pesanan Saya" value={myOrderItemsCount} icon={ClipboardList} chip="bg-orange-400/15 text-orange-400" />
      <StatCard label="Item Menu" value={menuItemsCount} icon={UtensilsCrossed} chip="bg-green-400/15 text-green-400" />
    </div>
  );
}
