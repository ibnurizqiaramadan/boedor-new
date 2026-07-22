import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UtensilsCrossed } from 'lucide-react';
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
            <span className="mt-1 block text-sm text-muted-foreground">
              Menampilkan {items.length} dari {totalItems} item
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-3 rounded-lg border p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-400/15 text-green-400">
                <UtensilsCrossed className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-sm tabular-nums text-muted-foreground">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => onEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus ${item.name}`}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onDelete(item._id as any)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
              <UtensilsCrossed className="h-8 w-8" aria-hidden />
              <p className="mt-3 text-sm">
                {totalItems === 0
                  ? 'Belum ada item menu. Tambahkan item pertama Anda!'
                  : 'Tidak ada item menu yang sesuai dengan filter.'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
