import { StatCard } from '@/components/ui/stat-card';
import { Truck, Clock, CheckCircle } from 'lucide-react';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface DriverOrdersStatsProps {
  orders: Order[];
}

export function DriverOrdersStats({ orders }: DriverOrdersStatsProps) {
  const openOrders = orders.filter((order) => order.status === 'open').length;
  const completedOrders = orders.filter((order) => order.status === 'completed').length;

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6">
      <StatCard label="Pesanan Saya" value={orders.length} icon={Truck} chip="bg-blue-400/15 text-blue-400" />
      <StatCard label="Pesanan Terbuka" value={openOrders} icon={Clock} chip="bg-orange-400/15 text-orange-400" />
      <StatCard label="Selesai" value={completedOrders} icon={CheckCircle} chip="bg-green-400/15 text-green-400" />
    </div>
  );
}
