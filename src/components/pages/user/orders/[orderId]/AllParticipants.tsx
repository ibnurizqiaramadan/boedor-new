import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

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
      <h2 className="text-lg font-semibold text-foreground">Semua Peserta &amp; Item</h2>

      {participants && participants.length > 0 ? (
        participants.map((participant) => {
          if (!participant) return null;
          const userItems = itemsByUser[participant._id] || [];
          const userTotal = getUserTotal(participant._id);
          const displayName = participant.name || participant.email || participant.username || 'Unknown';

          return (
            <Card key={participant._id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-400/15 text-sm font-semibold uppercase text-blue-400">
                      {displayName.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="truncate">{displayName}</span>
                        {participant._id === currentUserId && (
                          <span className="shrink-0 rounded-full bg-blue-400/15 px-2 py-0.5 text-xs font-medium text-blue-400">Anda</span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {userItems.length} item · Total {formatCurrency(userTotal)}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm capitalize text-muted-foreground">{participant.role}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {userItems.sort((a, b) => b._creationTime - a._creationTime).map((item) => {
                    const menuItem = menuItems?.find((m) => m._id === item.menuId);
                    const itemTotal = menuItem ? (item.customPrice ?? menuItem.price) * item.qty : 0;

                    return (
                      <div key={item._id} className="flex items-center gap-3 rounded-lg border p-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <ShoppingCart className="h-4 w-4" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{menuItem?.name || 'Item Tidak Dikenal'}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.qty} × {menuItem?.priceType === 'custom' && item.customPrice === undefined ? 'Harga Custom' : formatCurrency(item.customPrice ?? menuItem?.price ?? 0)}
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
          <CardContent className="flex flex-col items-center py-10 text-center text-muted-foreground">
            <Users className="h-8 w-8" aria-hidden />
            <p className="mt-3 text-sm">Belum ada peserta yang bergabung dengan pesanan ini.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
