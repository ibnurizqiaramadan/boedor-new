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
  _creationTime: number;
}

interface MenuItem {
  _id: string;
  name: string;
  price: number;
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Item Pesanan Saya</CardTitle>
            <CardDescription>
              Item yang telah Anda tambahkan ke pesanan ini {order.status === 'open' ? '(dapat diedit)' : '(hanya baca)'}
            </CardDescription>
          </div>
          {order.status === 'open' && (
            <Button onClick={onAddMore}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Item Lagi
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {myItems.length > 0 ? (
            myItems.sort((a, b) => b._creationTime - a._creationTime).map((item) => {
              const menuItem = menuItems?.find((m) => m._id === item.menuId);
              const itemTotal = menuItem ? menuItem.price * item.qty : 0;
              return (
                <div key={item._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{menuItem?.name || 'Item Tidak Dikenal'}</p>
                      <p className="text-sm text-muted-foreground">
                        Jumlah: {item.qty} × {formatCurrency(menuItem?.price || 0)}
                      </p>
                      {item.note && (
                        <p className="text-sm text-muted-foreground italic">Catatan: {item.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(item._creationTime).toLocaleString('id-ID', {
                          year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{formatCurrency(itemTotal)}</p>
                    {order.status === 'open' && (
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditItem(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveItem(item._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Anda belum menambahkan item apapun ke pesanan ini.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}