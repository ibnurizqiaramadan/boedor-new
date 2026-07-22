'use client';

import { StatCard } from '@/components/ui/stat-card';
import { Users, UtensilsCrossed, ShoppingBag } from 'lucide-react';

interface StatsCardsProps {
  totalUsers: number;
  totalMenuItems: number;
  totalOrders: number;
}

export default function StatsCards({ totalUsers, totalMenuItems, totalOrders }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6">
      <StatCard label="Total Pengguna" value={totalUsers} icon={Users} chip="bg-blue-400/15 text-blue-400" />
      <StatCard label="Item Menu" value={totalMenuItems} icon={UtensilsCrossed} chip="bg-green-400/15 text-green-400" />
      <StatCard label="Total Pesanan" value={totalOrders} icon={ShoppingBag} chip="bg-orange-400/15 text-orange-400" />
    </div>
  );
}
