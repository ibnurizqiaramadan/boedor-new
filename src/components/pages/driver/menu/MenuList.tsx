import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

interface MenuListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (menuId: string) => void;
  totalItems?: number;
}

export function MenuList({ items, onEdit, onDelete, totalItems = 0 }: MenuListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Item</CardTitle>
        <CardDescription>
          Kelola item menu Anda
          {totalItems > 0 && (
            <span className="block text-sm text-gray-600 mt-1">
              Menampilkan {items.length} dari {totalItems} item
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item._id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <span className="font-medium">{item.name}</span>
                <p className="text-sm text-gray-500">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(item._id as any)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              {totalItems === 0
                ? 'Belum ada item menu. Tambahkan item pertama Anda!'
                : 'Tidak ada item menu yang sesuai dengan filter.'
              }
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}