'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface User {
  _id: string;
  username?: string;
  email?: string;
  name?: string;
  role?: 'super_admin' | 'admin' | 'driver' | 'user';
}

const ROLE_STYLES: Record<string, { label: string; chip: string }> = {
  super_admin: { label: 'Super Admin', chip: 'bg-purple-400/15 text-purple-400' },
  admin: { label: 'Admin', chip: 'bg-blue-400/15 text-blue-400' },
  driver: { label: 'Driver', chip: 'bg-orange-400/15 text-orange-400' },
  user: { label: 'Pengguna', chip: 'bg-green-400/15 text-green-400' },
};

export default function UserCard({ user, onDelete }: { user: User; onDelete: (userId: string) => void }) {
  const displayName = user.name || user.email || user.username || 'Unknown';
  const role = ROLE_STYLES[user.role || 'user'] ?? ROLE_STYLES.user;

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase text-foreground">
        {displayName.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{displayName}</p>
        {user.email && user.name && (
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        )}
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${role.chip}`}>
        {role.label}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Hapus ${displayName}`}
        className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(user._id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
