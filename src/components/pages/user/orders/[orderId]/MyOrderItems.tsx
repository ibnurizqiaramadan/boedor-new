import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Order {
  _id: string;
  status: 'open' | 'closed' | 'completed';
  createdAt: number;
}

interface OrderItem {
  _id: string;
  menuId: string;
  qty: number;
  note?: string;
  customPrice?: number;
  _creationTime: number;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  priceType?: 'fixed' | 'custom';
}

interface MyOrderItemsProps {
  myItems: OrderItem[];
  menuItems: MenuItem[] | undefined;
  order: Order;
  onEditItem: (item: OrderItem) => void;
  onRemoveItem: (orderItemId: string) => void;
  onAddMore: () => void;
}

export function MyOrderItems({
  myItems,
  menuItems,
  order,
  onEditItem,
  onRemoveItem,
  onAddMore,
}: MyOrderItemsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Item Pesanan Saya</CardTitle>
            <CardDescription>
              Item yang telah Anda tambahkan ke pesanan ini {order.status === 'open' ? '(dapat diedit)' : '(hanya baca)'}
            </CardDescription>
          </div>
          {order.status === 'open' && (
            <Button onClick={onAddMore}>
              <Plus className="mr-2 h-4 w-4" aria-hidden /> Tambah Item
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {myItems.length > 0 ? (
            myItems.sort((a, b) => b._creationTime - a._creationTime).map((item) => {
              const menuItem = menuItems?.find((m) => m._id === item.menuId);
              const itemTotal = menuItem ? (item.customPrice ?? menuItem.price) * item.qty : 0;
              return (
                <div key={item._id} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-400/15 text-blue-400">
                    <ShoppingCart className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{menuItem?.name || 'Item Tidak Dikenal'}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.qty} × {menuItem?.priceType === 'custom' && item.customPrice === undefined ? 'Harga Custom' : formatCurrency(item.customPrice ?? menuItem?.price ?? 0)} ·{' '}
                      {new Date(item._creationTime).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    {item.note && (
                      <p className="truncate text-xs italic text-muted-foreground">&ldquo;{item.note}&rdquo;</p>
                    )}
                  </div>
                  {menuItem?.priceType === 'custom' && item.customPrice === undefined ? (
                    <span className="shrink-0 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-400">Custom</span>
                  ) : (
                    <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(itemTotal)}</p>
                  )}
                  {order.status === 'open' && (
                    <div className="flex shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${menuItem?.name || 'item'}`}
                        onClick={() => onEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus ${menuItem?.name || 'item'}`}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onRemoveItem(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center py-10 text-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8" aria-hidden />
              <p className="mt-3 text-sm">Anda belum menambahkan item apapun ke pesanan ini.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
