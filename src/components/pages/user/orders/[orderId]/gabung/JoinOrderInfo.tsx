import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  orderId,
  menuFilter,
  minPrice,
  maxPrice,
  onMenuFilterChange,
  onMinPriceChange,
  onMaxPriceChange
}: JoinOrderInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilih Item Menu</CardTitle>
        <CardDescription>Pilih item dan jumlah yang ingin Anda tambahkan ke pesanan ini</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter */}
        <div className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Cari menu..."
              value={menuFilter}
              onChange={(e) => onMenuFilterChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Price Range Filter */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice" className="text-sm font-medium">Harga Min (Rp)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="mt-1"
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="maxPrice" className="text-sm font-medium">Harga Max (Rp)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="Tidak terbatas"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="mt-1"
                min="0"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}