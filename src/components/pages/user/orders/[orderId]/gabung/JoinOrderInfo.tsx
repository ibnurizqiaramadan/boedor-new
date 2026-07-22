import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface JoinOrderInfoProps {
  orderId: string;
  menuFilter: string;
  minPrice: string;
  maxPrice: string;
  onMenuFilterChange: (filter: string) => void;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;
}

export function JoinOrderInfo({
  menuFilter,
  minPrice,
  maxPrice,
  onMenuFilterChange,
  onMinPriceChange,
  onMaxPriceChange,
}: JoinOrderInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilih Item Menu</CardTitle>
        <CardDescription>Pilih item dan jumlah yang ingin Anda tambahkan ke pesanan ini</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Cari menu..."
            aria-label="Cari menu"
            value={menuFilter}
            onChange={(e) => onMenuFilterChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="minPrice" className="text-xs text-muted-foreground">Harga Min (Rp)</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              min="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">Harga Max (Rp)</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Tidak terbatas"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              min="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
