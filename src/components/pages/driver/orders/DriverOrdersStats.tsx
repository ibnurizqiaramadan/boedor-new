import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pesanan Saya</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{orders.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pesanan Terbuka</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openOrders}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Selesai</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedOrders}</div>
        </CardContent>
      </Card>
    </div>
  );
}