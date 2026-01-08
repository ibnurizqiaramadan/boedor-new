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
  username: string;
  role: string;
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
      <h2 className="text-xl font-semibold text-gray-900">Semua Peserta & Item</h2>

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
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <CardTitle className="text-lg">
                        {participant.username}
                        {participant._id === currentUserId && ' (Anda)'}
                      </CardTitle>
                      <CardDescription>
                        {userItems.length} item • Total: {formatCurrency(userTotal)}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 capitalize">{participant.role}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userItems.sort((a, b) => b._creationTime - a._creationTime).map((item) => {
                    const menuItem = menuItems?.find((m) => m._id === item.menuId);
                    const itemTotal = menuItem ? menuItem.price * item.qty : 0;

                    return (
                      <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <ShoppingCart className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{menuItem?.name || 'Item Tidak Dikenal'}</p>
                            <p className="text-sm text-gray-500">
                              Jumlah: {item.qty} × {formatCurrency(menuItem?.price || 0)}
                            </p>
                            {item.note && (
                              <p className="text-sm text-gray-600 italic">Catatan: {item.note}</p>
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
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada peserta yang bergabung dengan pesanan ini.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}