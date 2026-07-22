import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, ClipboardList, UtensilsCrossed } from 'lucide-react';

interface UserStatsCardsProps {
  availableOrdersCount: number;
  myOrderItemsCount: number;
  menuItemsCount: number;
}

export function UserStatsCards({ availableOrdersCount, myOrderItemsCount, menuItemsCount }: UserStatsCardsProps) {
  const stats = [
    { label: 'Pesanan Terbuka', value: availableOrdersCount, icon: ShoppingCart, chip: 'bg-blue-400/15 text-blue-400' },
    { label: 'Item Pesanan Saya', value: myOrderItemsCount, icon: ClipboardList, chip: 'bg-orange-400/15 text-orange-400' },
    { label: 'Item Menu', value: menuItemsCount, icon: UtensilsCrossed, chip: 'bg-green-400/15 text-green-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6">
      {stats.map(({ label, value, icon: Icon, chip }) => (
        <Card key={label}>
          <CardContent className="flex flex-col items-center gap-2 p-4 text-center md:flex-row md:gap-4 md:p-6 md:text-left">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${chip}`}>
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <div className="text-2xl font-bold tabular-nums">{value}</div>
              <p className="text-xs text-muted-foreground md:text-sm">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
