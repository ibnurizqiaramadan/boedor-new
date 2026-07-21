import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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

interface Participant {
  _id: string;
  username?: string;
  email?: string;
  name?: string;
  role?: string;
}

interface AllParticipantsProps {
  itemsByUser: Record<string, OrderItem[]>;
  menuItems: MenuItem[] | undefined;
  participants: (Participant | null)[] | undefined;
  currentUserId: string;
  getUserTotal: (userId: string) => number;
}

export function AllParticipants({
  itemsByUser,
  menuItems,
  participants,
  currentUserId,
  getUserTotal,
}: AllParticipantsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Semua Peserta & Item</h2>

      {participants && participants.length > 0 ? (
        participants.map((participant) => {
          if (!participant) return null;
          const userItems = itemsByUser[participant._id] || [];
          const userTotal = getUserTotal(participant._id);

          return (
            <Card key={participant._id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        {participant.name || participant.email || participant.username || 'Unknown'}
                        {participant._id === currentUserId && ' (Anda)'}
                      </CardTitle>
                      <CardDescription>
                        {userItems.length} item • Total: {formatCurrency(userTotal)}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground capitalize">{participant.role}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userItems.sort((a, b) => b._creationTime - a._creationTime).map((item) => {
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
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(itemTotal)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada peserta yang bergabung dengan pesanan ini.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}