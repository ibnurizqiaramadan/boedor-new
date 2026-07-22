import { StatCard } from '@/components/ui/stat-card';
import { Clock, CheckCircle, Truck } from 'lucide-react';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface StatsCardsProps {
  orders: Order[];
}

export function StatsCards({ orders }: StatsCardsProps) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => order.status === 'open').length;
  const completedOrders = orders.filter((order) => order.status === 'completed').length;

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6">
      <StatCard label="Pesanan Saya" value={totalOrders} icon={Truck} chip="bg-blue-400/15 text-blue-400" />
      <StatCard label="Pesanan Terbuka" value={pendingOrders} icon={Clock} chip="bg-orange-400/15 text-orange-400" />
      <StatCard label="Selesai" value={completedOrders} icon={CheckCircle} chip="bg-green-400/15 text-green-400" />
    </div>
  );
}
