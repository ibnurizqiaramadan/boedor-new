import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface JoinOrderInfoProps {
  orderId: string;
  menuFilter: string;
  onMenuFilterChange: (filter: string) => void;
}

export function JoinOrderInfo({ orderId, menuFilter, onMenuFilterChange }: JoinOrderInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilih Item Menu</CardTitle>
        <CardDescription>Pilih item dan jumlah yang ingin Anda tambahkan ke pesanan ini</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filter */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Cari menu..."
            value={menuFilter}
            onChange={(e) => onMenuFilterChange(e.target.value)}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}