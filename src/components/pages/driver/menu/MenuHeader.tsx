import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MenuHeaderProps {
  onAddMenuClick: () => void;
  menuFilter: string;
  minPrice: string;
  maxPrice: string;
  onMenuFilterChange: (filter: string) => void;
  onMinPriceChange: (price: string) => void;
  onMaxPriceChange: (price: string) => void;
}

export function MenuHeader({
  onAddMenuClick,
  menuFilter,
  minPrice,
  maxPrice,
  onMenuFilterChange,
  onMinPriceChange,
  onMaxPriceChange
}: MenuHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Item Menu</h1>
          <p className="mt-2 text-gray-600">Tambahkan item menu baru ke sistem</p>
        </div>
        <Button onClick={onAddMenuClick}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Item Menu
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari nama menu..."
            value={menuFilter}
            onChange={(e) => onMenuFilterChange(e.target.value)}
            className="pl-10"
          />
        </div>

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
    </div>
  );
}