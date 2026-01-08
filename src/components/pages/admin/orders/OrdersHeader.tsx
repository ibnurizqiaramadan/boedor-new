'use client';

import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

export default function OrdersHeader() {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Semua Pesanan
          </CardTitle>
          <CardDescription>Lihat dan kelola status pesanan</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}